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
  // api call to get the product from database
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
  // Enable caching with 5-minute revalidation for better performance
  const nejum_response = await fetch(nejum_api_link, { next: { revalidate: 300 } })
  if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
    const data = await nejum_response.json()
    product = data.product;
    product_category = data.product_category;
    product_variants = data.product_variants || [];
    product_variant_attributes = data.product_variant_attributes || [];
    product_variant_attribute_values = data.product_variant_attribute_values || [];
    product_files = data.product_files || []; // Now includes videos with file_type='video'
    product_attributes = data.product_attributes || [];
    variant_attributes = data.variant_attributes || [];
  } else {
    try {
      const body = await nejum_response.text();
      console.error("Failed to fetch product:", nejum_response.status, body.slice(0, 300));
    } catch {
      console.error("Failed to fetch product:", nejum_response.status);
    }
    return <div className={classes.error}>Error fetching product details.</div>;
  }

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
