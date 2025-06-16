import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute, ProductFile } from "@/lib/interfaces";
import classes from "./page.module.css";

interface PageParamProps {
  params: {
    product_sku: string
  }
  searchParams: { [key: string]: string | string[] | undefined };
}


export default async function page({ params, searchParams }: PageParamProps) {
  let product: Product | null = null;
  let product_category: string | null = null;;
  let product_variants: ProductVariant[] = [];
  let product_variant_attributes: ProductVariantAttribute[] = [];
  let product_variant_attribute_values: ProductVariantAttributeValue[] = [];
  let product_files: ProductFile[] = [];
  let image_api_link: URL | null = null;
  // get the sku number from the url parameters. (http://localhost:3000/product/curtain/RN1381), RN1381 in this case.
  const product_sku = params.product_sku;
  // api call to get the product from database
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
  const nejum_response = await fetch(nejum_api_link)
  if (nejum_response.ok) {
    // Handle error response
    const data = await nejum_response.json()
    product = data.product;
    product_category = data.product_category;
    product_variants = data.product_variants || [];
    product_variant_attributes = data.product_variant_attributes || [];
    product_variant_attribute_values = data.product_variant_attribute_values || [];
    product_files = data.product_files || [];
    image_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_image?product_sku=${product_sku}`);

    // const product: Product = product_data.product;
    // return <div>{product_data.title}</div>

  } else {
    const error_data = await nejum_response.json();
    console.error("Failed to fetch product:", error_data.message || "Unknown error");
    return <div className={classes.error}>Error fetching product details.</div>;

  }
  console.log("your product files in next js are: ", product_files);
  console.log("its length is", product_files.length)
  
  return (
    <>      {product ?
      <div>
        <ProductDetailCard
          product={product}
          product_category={product_category}
          product_variants={product_variants}
          product_variant_attributes={product_variant_attributes}
          product_variant_attribute_values={product_variant_attribute_values}
          searchParams={searchParams}
          product_files={product_files}
          image_api_link={image_api_link.toString()}

        />
      </div> : `No product found with sku: ${product_sku}`}


    </>
  )
}