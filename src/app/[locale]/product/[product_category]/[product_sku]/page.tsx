import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute, ProductFile, ProductAttribute } from "@/lib/interfaces";
import classes from "./page.module.css";

export default async function Page(props: PageProps<'/[locale]/product/[product_category]/[product_sku]'>) {
  const { product_sku, locale } = await props.params;
  const searchParams = await props.searchParams;
  let product: Product | null = null;
  let product_category: string | null = null;
  let product_variants: ProductVariant[] = [];
  let product_variant_attributes: ProductVariantAttribute[] = [];
  let product_variant_attribute_values: ProductVariantAttributeValue[] = [];
  let product_files: ProductFile[] = [];
  let product_attributes: ProductAttribute[] = []; // Product-level attributes
  let variant_attributes: ProductAttribute[] = []; // Variant-level attributes
  let image_api_link: URL | null = null;
  // api call to get the product from database
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
  const startTime = performance.now();
  // Disable caching to always fetch fresh product data (including current stock)
  const nejum_response = await fetch(nejum_api_link, { next: { revalidate: 0 } })
  const endTime = performance.now();
  const responseTime = (endTime - startTime).toFixed(2);
  console.log(`API Response Time: ${responseTime}ms for ${product_sku}`);
  if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
    const data = await nejum_response.json()
    product = data.product;
    product_category = data.product_category;
    product_variants = data.product_variants || [];
    product_variant_attributes = data.product_variant_attributes || [];
    product_variant_attribute_values = data.product_variant_attribute_values || [];
    product_files = data.product_files || [];
    product_attributes = data.product_attributes || []; // Product-level attributes
    variant_attributes = data.variant_attributes || []; // Variant-level attributes
    // image_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_image?product_sku=${product_sku}`);
  } else {
    try {
      const body = await nejum_response.text();
      console.error("Failed to fetch product:", nejum_response.status, body.slice(0, 300));
    } catch {
      console.error("Failed to fetch product:", nejum_response.status);
    }
    return <div className={classes.error}>Error fetching product details.</div>;
  }
  // console.log("your product files in next js are: ", product_files);
  // console.log("its length is", product_files.length)

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
          product_attributes={product_attributes}
          variant_attributes={variant_attributes}
          locale={locale}
        />
      </div> : `No product found with sku: ${product_sku}`}


    </>
  )
}
