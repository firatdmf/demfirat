// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile } from "@/lib/interfaces";
import { getProductVideoUrl } from "@/lib/getProductVideo";
import classes from "./page.module.css"
import ProductGrid from '@/components/ProductGrid';
import { Suspense } from 'react';
import Spinner from '@/components/Spinner';

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

  for (const category of categoriesToFetch) {
    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products`);
    nejum_api_link.searchParams.append("product_category", category);

    if (searchParams) {
      // Ignore tracking parameters from ads (Facebook, Google, UTM etc.)
      const ignoredParams = ['fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'mc_cid', 'mc_eid'];

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

      } else {
        const body = await nejum_response.text();
        console.error(`Failed to fetch products for category ${category}: ${nejum_response.status}. Body: ${body.slice(0, 300)}`);
      }
    } catch (e) {
      console.error(`Failed to fetch products for category ${category}`, e);
    }
  }

  const endTime = Date.now();
  console.log(`[PERFORMANCE] API call for ${product_category} took ${endTime - startTime}ms`);

  // ENRICH DATA WITH PRODUCT FILES (for hover effect)
  // The API doesn't return product_files, so we fetch them directly from DB for the displayed products
  if (data.products.length > 0) {
    try {
      const { prisma } = await import("@/lib/prisma"); // Dynamic import to avoid build issues if server-only

      const productIds = data.products.map((p: any) => BigInt(p.id));

      // Also get variant IDs to fetch their specific files
      const variantIds = data.product_variants
        .filter((v: any) => productIds.includes(BigInt(v.product_id)))
        .map((v: any) => BigInt(v.id));

      // Create a map of variant_id -> product_id for easier assignment later
      const variantToProductMap = new Map();
      data.product_variants.forEach((v: any) => {
        variantToProductMap.set(String(v.id), BigInt(v.product_id));
      });

      const productFiles = await prisma.marketing_productfile.findMany({
        where: {
          OR: [
            { product_id: { in: productIds } },
            { product_variant_id: { in: variantIds } }
          ],
          file_url: { not: null } // Ensure we have a URL
        },
        select: {
          id: true,
          product_id: true,
          product_variant_id: true,
          file_url: true,
          is_primary: true,
          sequence: true
        },
        orderBy: {
          sequence: 'asc'
        }
      });

      // Map files to products
      data.products = data.products.map((p: any) => {
        const pId = BigInt(p.id);

        const files = productFiles
          .filter(f => {
            // Match exactly by product_id
            if (f.product_id === pId) return true;
            // Or match by variant_id -> product_id
            if (f.product_variant_id) {
              const mappedPId = variantToProductMap.get(String(f.product_variant_id));
              return mappedPId === pId;
            }
            return false;
          })
          .map(f => ({
            id: Number(f.id), // marketing_productfile id is usually int/bigint
            file: f.file_url || '',
            file_type: 'image', // Assuming image for now
            sequence: f.sequence,
            product_id: String(f.product_id), // Convert BigInt to String
            product_variant_id: f.product_variant_id ? String(f.product_variant_id) : null // Convert BigInt to String or null
          }));

        return {
          ...p,
          product_files: files
        };
      });

      // ENRICH VARIANTS WITH PRIMARY IMAGE
      // We also need to ensure product_variants have their primary_image set correctly
      // using the files we just fetched.
      data.product_variants = data.product_variants.map((v: any) => {
        const vId = BigInt(v.id);
        // Find a file for this variant
        // First try to find one marked is_primary
        let variantFile = productFiles.find(f => f.product_variant_id === vId && f.is_primary);

        // If not, just take the first one for this variant
        if (!variantFile) {
          variantFile = productFiles.find(f => f.product_variant_id === vId);
        }

        if (variantFile && variantFile.file_url) {
          return {
            ...v,
            primary_image: variantFile.file_url
          };
        }

        return v;
      });

    } catch (dbError) {
      console.error("Failed to fetch product files from DB:", dbError);
    }
  }

  // Check for product videos (server-side file check)
  const productVideoSKUs = data.products
    .filter((p: Product) => p.sku && getProductVideoUrl(p.sku))
    .map((p: Product) => p.sku);

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

