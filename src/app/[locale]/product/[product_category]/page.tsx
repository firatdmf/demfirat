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
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products`);
  nejum_api_link.searchParams.append("product_category", product_category);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => nejum_api_link.searchParams.append(key, v));
        } else {
          nejum_api_link.searchParams.append(key, value);
        }
      }
    });
  }
  // Cache for 5 minutes instead of no-store for better performance
  const nejum_response = await fetch(nejum_api_link, {
    next: { revalidate: 300 },
    // Add timeout header if possible
  })
  let errorMessage = "";
  let data: any = {};
  if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
    data = await nejum_response.json();
    const endTime = Date.now();
    console.log(`[PERFORMANCE] API call for ${product_category} took ${endTime - startTime}ms`);
    // console.log("your data is", data)
    // console.log("Fetched products for category:", product_category);
  } else {
    try {
      const body = await nejum_response.text();
      errorMessage = `Failed to fetch products for category ${product_category}: ${nejum_response.status}. Body: ${body.slice(0, 300)}`;
    } catch {
      errorMessage = `Failed to fetch products for category ${product_category}: ${nejum_response.status}`;
    }
    console.error(errorMessage);
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
        />
      </>)
      }
    </div >
  )
}

