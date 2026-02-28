import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute, ProductFile, ProductAttribute } from "@/lib/interfaces";
import { getLocalizedProductField } from "@/lib/productUtils";
import classes from "../page.module.css";
import { Metadata } from "next";

// This route is the DEDICATED "Tül Perde / Perde Diktir" product detail page.
// URL: /[locale]/product/[product_category]/[product_sku]/perde
// It always forces intent=custom_curtain so the wizard CTA is shown instead of standard cart buttons.

export async function generateMetadata(props: PageProps<'/[locale]/product/[product_category]/[product_sku]/perde'>): Promise<Metadata> {
    const { product_sku, locale } = await props.params;
    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);

    try {
        const response = await fetch(nejum_api_link, { next: { revalidate: 300 } });
        if (!response.ok) return { title: "Product Not Found | Karven" };

        const data = await response.json();
        const product = data.product;
        if (!product) return { title: "Product Not Found | Karven" };

        const title = getLocalizedProductField(product, 'title', locale);
        const description = getLocalizedProductField(product, 'description', locale) || "";
        const imageUrl = product.primary_image || "";
        const price = product.price;

        const baseUrl = `https://karven.com`;
        const canonicalUrl = `${baseUrl}/${locale}/product/${data.product_category}/${product_sku}/perde`;

        return {
            title: `${title} - Perde Diktir | Karven`,
            description: description.substring(0, 160),
            alternates: {
                canonical: canonicalUrl,
                languages: {
                    'en': `${baseUrl}/en/product/${data.product_category}/${product_sku}/perde`,
                    'tr': `${baseUrl}/tr/product/${data.product_category}/${product_sku}/perde`,
                    'ru': `${baseUrl}/ru/product/${data.product_category}/${product_sku}/perde`,
                    'pl': `${baseUrl}/pl/product/${data.product_category}/${product_sku}/perde`,
                    'x-default': `${baseUrl}/en/product/${data.product_category}/${product_sku}/perde`,
                },
            },
            openGraph: {
                title,
                description: description.substring(0, 100),
                images: [{ url: imageUrl }],
                url: `https://karven.com/${locale}/product/${data.product_category}/${product_sku}/perde`,
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
    } catch {
        return { title: "Karven" };
    }
}

export default async function Page(props: PageProps<'/[locale]/product/[product_category]/[product_sku]/perde'>) {
    const { product_sku, locale } = await props.params;
    const searchParams = await props.searchParams;

    let product: Product | null = null;
    let product_category: string | null = null;
    let product_variants: ProductVariant[] = [];
    let product_variant_attributes: ProductVariantAttribute[] = [];
    let product_variant_attribute_values: ProductVariantAttributeValue[] = [];
    let product_files: ProductFile[] = [];
    let product_attributes: ProductAttribute[] = [];
    let variant_attributes: ProductAttribute[] = [];

    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
    const nejum_response = await fetch(nejum_api_link, { next: { revalidate: 300 } });

    if (nejum_response.ok && (nejum_response.headers.get('content-type') || '').includes('application/json')) {
        const data = await nejum_response.json();
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

    const displayTitle = getLocalizedProductField(product as Product, 'title', locale);
    const displayDescription = getLocalizedProductField(product as Product, 'description', locale) || "";

    const jsonLd = product ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": displayTitle,
        "image": [product.primary_image],
        "description": displayDescription,
        "sku": product.sku,
        "brand": { "@type": "Brand", "name": "Karven" },
        "offers": {
            "@type": "Offer",
            "url": `https://karven.com/${locale}/product/${product_category}/${product_sku}/perde`,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": Number(product.available_quantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    } : null;

    const baseUrl = `https://karven.com/${locale}`;
    const productUrl = `${baseUrl}/product/${product_category}/${product_sku}/perde`;
    const categoryUrl = `${baseUrl}/product/${product_category}`;
    const categoryName = product_category === 'ready-made_curtain'
        ? (locale === 'tr' ? 'Hazır Perdeler' : locale === 'ru' ? 'Готовые Шторы' : locale === 'pl' ? 'Gotowe Zasłony' : 'Ready Made Curtains')
        : (locale === 'tr' ? 'Tül Perdeler' : locale === 'ru' ? 'Тюлевые шторы' : locale === 'pl' ? 'Firany' : 'Tulle Curtains');

    // JSON-LD Breadcrumb Schema
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": locale === 'tr' ? 'Anasayfa' : locale === 'ru' ? 'Главная' : locale === 'pl' ? 'Strona główna' : 'Home',
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": categoryName,
                "item": categoryUrl
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": displayTitle,
                "item": productUrl
            }
        ]
    };

    // Inject intent=custom_curtain — this page is ALWAYS the custom curtain experience
    const forcedSearchParams = { ...searchParams, intent: 'custom_curtain' };

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {product ? (
                <div>
                    <ProductDetailCard
                        product={product}
                        product_category={product_category}
                        product_variants={product_variants}
                        product_variant_attributes={product_variant_attributes}
                        product_variant_attribute_values={product_variant_attribute_values}
                        searchParams={forcedSearchParams}
                        product_files={product_files}
                        product_attributes={product_attributes}
                        variant_attributes={variant_attributes}
                        locale={locale}
                    />
                </div>
            ) : `No product found with sku: ${product_sku}`}
        </>
    );
}
