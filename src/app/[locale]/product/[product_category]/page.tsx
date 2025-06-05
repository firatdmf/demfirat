// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces";
import classes from "./page.module.css"
type PageParamProps = {
  params: { product_category: string }
};

type apiResponse = {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
}




export default async function Page({ params }: PageParamProps) {
  // fetch the products from the API based on the product category
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products?product_category=${params.product_category}`);
  const nejum_response = await fetch(nejum_api_link)
  let errorMessage = "";
  let products: Product[] | null = null;
  let data: apiResponse;
  if (nejum_response.ok) {
    data = await nejum_response.json();
    products = data.products;
    console.log("Fetched products for category:", params.product_category, products);
  } else {
    // Try to parse the error message from the response
    try {
      const error_data = await nejum_response.json();
      errorMessage = error_data.message || "Unknown error occurred";
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
        <div>
          Hello, I am {params.product_category}
        </div>
        <h2>Your products are</h2>
        <ul>
          {products && products.map((product: Product, index) => {
            return (
              <li key={index}>
                {product.sku} - {product.title}
              </li>
            )
          })}
        </ul>
      </>)}
    </div>
  )
}

