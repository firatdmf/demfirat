// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile } from "@/lib/interfaces";
import { getVideoSKUs } from "@/lib/getProductVideo";
import classes from "./page.module.css"
import ProductGrid from '@/components/ProductGrid';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';
import { unstable_cache } from 'next/cache';

// Cached Prisma DB call to fetch product files (avoids 1000ms penalty on every F5 refresh)
// We pass string arrays because Next.js cache serialization doesn't support BigInt directly.
const getProductFilesCached = unstable_cache(
  async (productIdsStr: string[], variantIdsStr: string[]) => {
    const { prisma } = await import("@/lib/prisma");

    const productIds = productIdsStr.map(id => BigInt(id));
    const variantIds = variantIdsStr.map(id => BigInt(id));

    const productFiles = await prisma.marketing_productfile.findMany({
      where: {
        OR: [
          { product_id: { in: productIds } },
          { product_variant_id: { in: variantIds } }
        ],
        file_url: { not: null }
      },
      select: {
        id: true,
        product_id: true,
        product_variant_id: true,
        file_url: true,
        is_primary: true,
        sequence: true
      },
      orderBy: { sequence: 'asc' }
    });

    // Convert BigInts to Strings/Numbers for Next.js cache serialization
    return productFiles.map(f => ({
      id: Number(f.id),
      product_id: String(f.product_id),
      product_variant_id: f.product_variant_id ? String(f.product_variant_id) : null,
      file_url: f.file_url,
      is_primary: f.is_primary,
      sequence: f.sequence
    }));
  },
  ['product-files-db'],
  { revalidate: 300 } // 5 minutes cache
);

// type apiResponse = {
//   products: Product[];
//   product_variants: ProductVariant[];
//   product_variant_attributes: ProductVariantAttribute[];
//   product_variant_attribute_values: ProductVariantAttributeValue[];
// }

type Props = {
  params: Promise<{ locale: string; product_category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page(props: Props) {
  const { product_category, locale } = await props.params;
  const searchParams = await props.searchParams;
  // fetch the products from the API based on the product category
  const startTime = Date.now();
  let data: any = {
    products: [],
    product_variants: [],
    product_variant_attributes: [],
    product_variant_attribute_values: [],
    product_category: product_category,
    product_category_description: ""
  };
  let errorMessage = "";

  const categoriesToFetch = (product_category === 'all' || product_category === 'search')
    ? ['fabric', 'ready-made_curtain']
    : [product_category];

  const categoryPromises = categoriesToFetch.map(async (category) => {
    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products`);
    nejum_api_link.searchParams.append("product_category", category);

    if (searchParams) {
      // Ignore tracking parameters from ads (Facebook, Google, UTM etc.) and UI-only intent parameters
      const ignoredParams = [
        'fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
        'utm_term', 'utm_content', 'ref', 'mc_cid', 'mc_eid',
        'intent', 'fabric_type', 'color', 'size', 'width', 'height',
        'texture', 'style', 'material', 'pattern', 'sheerness',
        'care', 'property', 'price_min', 'price_max'
      ];

      Object.entries(searchParams).forEach(([key, value]) => {
        // Skip ignored tracking parameters
        if (ignoredParams.includes(key.toLowerCase())) {
          return;
        }
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => nejum_api_link.searchParams.append(key, v));
          } else {
            nejum_api_link.searchParams.append(key, value);
          }
        }
      });
    }

    try {
      const nejum_response = await fetch(nejum_api_link, {
        next: { revalidate: 300 },
      });

      if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
        const categoryData = await nejum_response.json();
        return { category, categoryData };
      } else {
        const body = await nejum_response.text();
        console.error(`Failed to fetch products for category ${category}: ${nejum_response.status}. Body: ${body.slice(0, 300)}`);
        return null;
      }
    } catch (e) {
      console.error(`Failed to fetch products for category ${category}`, e);
      return null;
    }
  });

  const categoryResults = await Promise.all(categoryPromises);

  categoryResults.forEach((result) => {
    if (!result) return;
    const { category, categoryData } = result;

    // Merge data
    if (categoryData.products) {
      // Add category to products to help with linking later
      const productsWithCategory = categoryData.products.map((p: any) => ({
        ...p,
        product_category: category
      }));
      data.products = [...data.products, ...productsWithCategory];
    }
    if (categoryData.product_variants) {
      data.product_variants = [...data.product_variants, ...categoryData.product_variants];
    }
    // For attributes, we need to be careful about duplicates if we want clean filters
    // But for now, simple concatenation to ensure filtering works at all
    if (categoryData.product_variant_attributes) {
      // Filter out attributes that are already present (by id) to avoid duplicates in the grid
      const newAttributes = categoryData.product_variant_attributes.filter((attr: any) =>
        !data.product_variant_attributes.some((existing: any) => existing.id === attr.id)
      );
      data.product_variant_attributes = [...data.product_variant_attributes, ...newAttributes];
    }
    if (categoryData.product_variant_attribute_values) {
      data.product_variant_attribute_values = [...data.product_variant_attribute_values, ...categoryData.product_variant_attribute_values];
    }

    if (!data.product_category_description && categoryData.product_category_description) {
      data.product_category_description = categoryData.product_category_description;
    }
  });

  const endTime = Date.now();
  console.log(`[PERFORMANCE] API call for ${product_category} took ${endTime - startTime}ms`);

  // ENRICH DATA WITH PRODUCT FILES (for hover effect) AND CHECK VIDEOS — IN PARALLEL
  // The API doesn't return product_files, so we fetch them directly from DB for the displayed products
  let productVideoSKUs: string[] = [];

  if (data.products.length > 0) {
    // Build video SKU list from product data
    const allSKUs = data.products.map((p: Product) => p.sku).filter(Boolean);

    // Run DB query and video check in PARALLEL
    const [_, videoSKUs] = await Promise.all([
      // Task 1: Cached Supabase DB query for product files
      (async () => {
        try {
          const productIds = data.products.map((p: any) => String(p.id));
          const variantIds = data.product_variants
            .filter((v: any) => data.products.some((p: any) => String(p.id) === String(v.product_id)))
            .map((v: any) => String(v.id));

          const variantToProductMap = new Map();
          data.product_variants.forEach((v: any) => {
            variantToProductMap.set(String(v.id), String(v.product_id));
          });

          const productFiles = await getProductFilesCached(productIds, variantIds);

          // Map files to products
          data.products = data.products.map((p: any) => {
            const pId = String(p.id);
            const files = productFiles
              .filter(f => {
                if (String(f.product_id) === pId) return true;
                if (f.product_variant_id) {
                  const mappedPId = variantToProductMap.get(String(f.product_variant_id));
                  return mappedPId === pId;
                }
                return false;
              });
            return { ...p, product_files: files };
          });

          // Enrich variants with primary image
          data.product_variants = data.product_variants.map((v: any) => {
            const vId = String(v.id);
            let variantFile = productFiles.find(f => String(f.product_variant_id) === vId && f.is_primary);
            if (!variantFile) {
              variantFile = productFiles.find(f => String(f.product_variant_id) === vId);
            }
            if (variantFile && variantFile.file_url) {
              return { ...v, primary_image: variantFile.file_url };
            }
            return v;
          });
        } catch (dbError) {
          console.error("Failed to fetch product files from DB:", dbError);
        }
      })(),

      // Task 2: Video SKU check (uses cached Set — instant)
      Promise.resolve(getVideoSKUs(allSKUs))
    ]);

    productVideoSKUs = videoSKUs;
  }

  return (
    <div>
      {errorMessage ? (<div style={{ color: "red" }}>
        {errorMessage}
      </div>) : (<>



        <ProductGrid
          products={data.products}
          product_variants={data.product_variants}
          product_variant_attributes={data.product_variant_attributes}
          product_variant_attribute_values={data.product_variant_attribute_values}
          product_category={data.product_category}
          product_category_description={data.product_category_description}
          searchParams={searchParams}
          locale={locale}
          productVideoSKUs={productVideoSKUs}
        />
      </>)
      }
    </div >
  )
}

