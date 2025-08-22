// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces";
import classes from "./page.module.css"
import ProductGrid from '@/components/ProductGrid';
export type PageParamProps = {
  params: {
    product_category: string
  }
  searchParams: { [key: string]: string | string[] | undefined };
}

// type apiResponse = {
//   products: Product[];
//   product_variants: ProductVariant[];
//   product_variant_attributes: ProductVariantAttribute[];
//   product_variant_attribute_values: ProductVariantAttributeValue[];
// }

export default async function Page({ searchParams, params }: PageParamProps) {
  // fetch the products from the API based on the product category
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products?product_category=${params.product_category}`);
  const nejum_response = await fetch(nejum_api_link)
  let errorMessage = "";
  let products: Product[] | null = null;
  let data;
  if (nejum_response.ok) {
    data = await nejum_response.json();
    console.log("your data is", data)
    // filter out the products that do not have a primary image, this is not working yet for some reason.
    // products = data.products.filter((p: Product) => !!p.primary_image);
    console.log("Fetched products for category:", params.product_category);
  } else {
    // Try to parse the error message from the response
    try {
      const error_data = await nejum_response.json();
      errorMessage = error_data.message || "Unknown error occurred";
      data = {}
    }
    catch {
      errorMessage = "Failed to fetch products for category: " + params.product_category;
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
          searchParams={searchParams}
        />
      </>)}
    </div>
  )
}

