import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute, ProductFile, ProductAttribute } from "@/lib/interfaces";
import classes from "./page.module.css";
import { Metadata } from "next";

export async function generateMetadata(props: PageProps<'/[locale]/product/[product_category]/[product_sku]'>): Promise<Metadata> {
  const { product_sku, locale } = await props.params;
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);

  try {
    const response = await fetch(nejum_api_link, { next: { revalidate: 300 } });
    if (!response.ok) return { title: "Product Not Found | Karven" };

    const data = await response.json();
    const product = data.product;
    if (!product) return { title: "Product Not Found | Karven" };

    const title = product.title;
    const description = product.description || "";
    const imageUrl = product.primary_image || "";
    const price = product.price;

    return {
      title: `${title} | Karven`,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
        url: `https://karven.com/${locale}/product/${data.product_category}/${product_sku}`,
        type: 'website',
      },
      other: {
        'product:price:amount': price?.toString() || "0",
        'product:price:currency': 'USD',
        'product:availability': Number(product.available_quantity || 0) > 0 ? 'instock' : 'oos',
        'product:condition': 'new',
        'product:brand': 'Karven',
        'product:retailer_item_id': product_sku,
      }
    };
  } catch (error) {
    return { title: "Karven" };
  }
}

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

  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
  const nejum_response = await fetch(nejum_api_link, { next: { revalidate: 300 } })

  if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
    const data = await nejum_response.json()
    product = data.product;
    product_category = data.product_category;
    product_variants = data.product_variants || [];
    product_variant_attributes = data.product_variant_attributes || [];
    product_variant_attribute_values = data.product_variant_attribute_values || [];
    product_files = data.product_files || [];
    product_attributes = data.product_attributes || [];
    variant_attributes = data.variant_attributes || [];
  } else {
    return <div className={classes.error}>Error fetching product details.</div>;
  }

  // JSON-LD Product Schema for Meta Catalog auto-detection
  const jsonLd = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.primary_image],
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Karven"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://karven.com/${locale}/product/${product_category}/${product_sku}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": Number(product.available_quantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {product ? (
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
        </div>
      ) : `No product found with sku: ${product_sku}`}
    </>
  )
}
