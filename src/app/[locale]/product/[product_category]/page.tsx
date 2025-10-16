// This file brings the products inside the specified product category url param, and provides it to the product grid component.
// This is a server component, so we can do async and database calls.
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces";
import classes from "./page.module.css"
import ProductGrid from '@/components/ProductGrid';

// type apiResponse = {
//   products: Product[];
//   product_variants: ProductVariant[];
//   product_variant_attributes: ProductVariantAttribute[];
//   product_variant_attribute_values: ProductVariantAttributeValue[];
// }

export default async function Page(props: PageProps<'/[locale]/product/[product_category]'>) {
  const { product_category } = await props.params;
  const searchParams = await props.searchParams;
  // fetch the products from the API based on the product category
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products?product_category=${product_category}`);
  const nejum_response = await fetch(nejum_api_link, { next: { revalidate: 300 } })
  let errorMessage = "";
  let data: any = {};
  if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
    data = await nejum_response.json();
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
        {data.product_category_description ? (<div className="text-center mx-16 mt-10 bg-gray-100 py-10 rounded-lg cursor-default select-none">
          <p className="text-gray-600">{data.product_category_description}</p>
        </div>) : null}


        <ProductGrid
          products={data.products}
          product_variants={data.product_variants}
          product_variant_attributes={data.product_variant_attributes}
          product_variant_attribute_values={data.product_variant_attribute_values}
          product_category = {data.product_category}
          product_category_description = {data.product_category_description}
          searchParams={searchParams}
        />
      </>)
      }
    </div >
  )
}

