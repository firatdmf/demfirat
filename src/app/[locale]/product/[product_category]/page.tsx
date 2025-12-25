// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile } from "@/lib/interfaces";
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
        />
      </>)
      }
    </div >
  )
}

