import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute, ProductFile, ProductAttribute } from "@/lib/interfaces";
import { getLocalizedProductField } from "@/lib/productUtils";
import classes from "../page.module.css";
import { Metadata } from "next";
import { cache } from "react";

// This route is the DEDICATED "Tül Perde / Perde Diktir" product detail page.
// URL: /[locale]/product/[product_category]/[product_sku]/curtain
// It always forces intent=custom_curtain so the wizard CTA is shown instead of standard cart buttons.

// Deduplicated fetch: React.cache ensures generateMetadata and Page share the same promise
const getProductData = cache(async (product_sku: string) => {
    const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
    const response = await fetch(nejum_api_link, { next: { revalidate: 300 } });

    if (response.ok && (response.headers.get('content-type') || '').includes('application/json')) {
        return await response.json();
    }
    return null;
});

export async function generateMetadata(props: PageProps<'/[locale]/product/[product_category]/[product_sku]/curtain'>): Promise<Metadata> {
    const { product_sku, locale } = await props.params;

    try {
        const data = await getProductData(product_sku);
        if (!data?.product) return { title: "Product Not Found | DEMFIRAT" };

        const product = data.product;
        const title = getLocalizedProductField(product, 'title', locale);
        const description = getLocalizedProductField(product, 'description', locale) || "";
        const imageUrl = product.primary_image || "";
        const price = product.price;

        const baseUrl = `https://DEMFIRAT.com`;
        const canonicalUrl = `${baseUrl}/${locale}/product/${data.product_category}/${product_sku}/curtain`;

        return {
            title: `${title} - Perde Diktir | DEMFIRAT`,
            description: description.substring(0, 160),
            alternates: {
                canonical: canonicalUrl,
                languages: {
                    'en': `${baseUrl}/en/product/${data.product_category}/${product_sku}/curtain`,
                    'tr': `${baseUrl}/tr/product/${data.product_category}/${product_sku}/curtain`,
                    'ru': `${baseUrl}/ru/product/${data.product_category}/${product_sku}/curtain`,
                    'pl': `${baseUrl}/pl/product/${data.product_category}/${product_sku}/curtain`,
                    'x-default': `${baseUrl}/en/product/${data.product_category}/${product_sku}/curtain`,
                },
            },
            openGraph: {
                title,
                description: description.substring(0, 100),
                images: [{ url: imageUrl }],
                url: `https://DEMFIRAT.com/${locale}/product/${data.product_category}/${product_sku}/curtain`,
                type: 'website',
            },
            other: {
                'product:price:amount': price?.toString() || "0",
                'product:price:currency': 'USD',
                'product:availability': Number(product.available_quantity || 0) > 0 ? 'instock' : 'oos',
                'product:condition': 'new',
                'product:brand': 'DEMFIRAT',
                'product:retailer_item_id': product_sku,
            }
        };
    } catch {
        return { title: "DEMFIRAT" };
    }
}

export default async function Page(props: PageProps<'/[locale]/product/[product_category]/[product_sku]/curtain'>) {
    const { product_sku, locale } = await props.params;
    const searchParams = await props.searchParams;

    const data = await getProductData(product_sku);

    if (!data?.product) {
        return <div className={classes.error}>Error fetching product details.</div>;
    }

    const product: Product = data.product;
    const product_category: string | null = data.product_category;
    const product_variants: ProductVariant[] = data.product_variants || [];
    const product_variant_attributes: ProductVariantAttribute[] = data.product_variant_attributes || [];
    const product_variant_attribute_values: ProductVariantAttributeValue[] = data.product_variant_attribute_values || [];
    const product_files: ProductFile[] = data.product_files || [];
    const product_attributes: ProductAttribute[] = data.product_attributes || [];
    const variant_attributes: ProductAttribute[] = data.variant_attributes || [];

    const displayTitle = getLocalizedProductField(product as Product, 'title', locale);
    const displayDescription = getLocalizedProductField(product as Product, 'description', locale) || "";

    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": displayTitle,
        "image": [product.primary_image],
        "description": displayDescription,
        "sku": product.sku,
        "brand": { "@type": "Brand", "name": "DEMFIRAT" },
        "offers": {
            "@type": "Offer",
            "url": `https://DEMFIRAT.com/${locale}/product/${product_category}/${product_sku}/curtain`,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": Number(product.available_quantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    const baseUrl = `https://DEMFIRAT.com/${locale}`;
    const productUrl = `${baseUrl}/product/${product_category}/${product_sku}/curtain`;
    const categoryUrl = `${baseUrl}/product/${product_category}`;
    const categoryName = product_category === 'ready-made_curtain'
        ? (locale === 'tr' ? 'Hazır Perdeler' : locale === 'ru' ? 'Готовые Шторы' : locale === 'pl' ? 'Gotowe Zasłony' : 'Ready Made Curtains')
        : (locale === 'tr' ? 'Tül Perdeler' : locale === 'ru' ? 'Тюлевые шторы' : locale === 'pl' ? 'Firany' : 'Tulle Curtains');

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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
