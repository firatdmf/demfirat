import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

interface ApiProduct {
    id: number;
    title: string;
    sku: string;
    description: string | null;
    price: number;
    prices: Record<string, number | null>;
    primary_image: string | null;
    product_attributes: Array<{ name: string; value: string; sequence: number }>;
}

interface ApiVariant {
    id: number;
    product_id: number;
    variant_sku: string;
    variant_price: number | null;
    variant_prices: Record<string, number | null>;
    variant_quantity: number | null;
    product_variant_attribute_values: number[];
}

interface ApiAttributeValue {
    id: number;
    product_variant_attribute_id: number;
    product_variant_attribute_value: string;
}

interface ApiAttribute {
    id: number;
    name: string;
}

function getTurkishDescription(description: string | null): string {
    if (!description) return '';
    try {
        if (!description.trim().startsWith('{')) return description;
        const parsed = JSON.parse(description);
        if (parsed.translations) {
            if (parsed.translations.tr?.description) return parsed.translations.tr.description;
            if (parsed.translations.en?.description) return parsed.translations.en.description;
            const first = Object.keys(parsed.translations)[0];
            if (first && parsed.translations[first]?.description) return parsed.translations[first].description;
        }
        return description;
    } catch {
        return description;
    }
}

function getTurkishTitle(product: ApiProduct): string {
    const desc = product.description;
    if (!desc) return product.title;
    try {
        if (!desc.trim().startsWith('{')) return product.title;
        const parsed = JSON.parse(desc);
        if (parsed.translations?.tr?.title) return parsed.translations.tr.title;
    } catch { /* ignore */ }
    return product.title;
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        const apiUrl = process.env.NEJUM_API_URL || process.env.NEXT_PUBLIC_NEJUM_API_URL;

        // Fetch both categories in parallel
        const [fabricRes, readyMadeRes] = await Promise.all([
            fetch(`${apiUrl}/marketing/api/get_products?product_category=fabric`),
            fetch(`${apiUrl}/marketing/api/get_products?product_category=ready-made_curtain`),
        ]);

        if (!fabricRes.ok && !readyMadeRes.ok) {
            throw new Error(`Failed to fetch products: fabric=${fabricRes.status}, ready-made=${readyMadeRes.status}`);
        }

        const fabricData = fabricRes.ok ? await fabricRes.json() : { products: [], product_variants: [], product_variant_attributes: [], product_variant_attribute_values: [] };
        const readyMadeData = readyMadeRes.ok ? await readyMadeRes.json() : { products: [], product_variants: [], product_variant_attributes: [], product_variant_attribute_values: [] };

        // Merge data from both categories
        const allProducts: ApiProduct[] = [
            ...(fabricData.products || []).map((p: ApiProduct) => ({ ...p, _category: 'fabric' })),
            ...(readyMadeData.products || []).map((p: ApiProduct) => ({ ...p, _category: 'ready-made_curtain' })),
        ];

        const allVariants: ApiVariant[] = [
            ...(fabricData.product_variants || []),
            ...(readyMadeData.product_variants || []),
        ];

        const allAttrValues: ApiAttributeValue[] = [
            ...(fabricData.product_variant_attribute_values || []),
            ...(readyMadeData.product_variant_attribute_values || []),
        ];

        const allAttrs: ApiAttribute[] = [
            ...(fabricData.product_variant_attributes || []),
            ...(readyMadeData.product_variant_attributes || []),
        ];

        // Build lookup maps
        const attrValueMap = new Map<number, ApiAttributeValue>();
        for (const av of allAttrValues) {
            attrValueMap.set(av.id, av);
        }

        const attrMap = new Map<number, ApiAttribute>();
        for (const a of allAttrs) {
            attrMap.set(a.id, a);
        }

        // Group variants by product_id
        const variantsByProduct = new Map<number, ApiVariant[]>();
        for (const v of allVariants) {
            if (!variantsByProduct.has(v.product_id)) {
                variantsByProduct.set(v.product_id, []);
            }
            variantsByProduct.get(v.product_id)!.push(v);
        }

        // Build XML feed
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Demfirat Karven Ürün Kataloğu</title>
    <link>https://www.demfirat.com</link>
    <description>Demfirat Karven ürün kataloğu - Meta/Google Ads</description>
`;

        for (const product of allProducts) {
            const category = (product as any)._category || 'fabric';
            const variants = variantsByProduct.get(product.id) || [];
            const trTitle = getTurkishTitle(product);
            const trDescription = getTurkishDescription(product.description)
                .replace(/<[^>]*>?/gm, '')
                .substring(0, 5000);
            const link = `https://www.demfirat.com/tr/product/${category}/${product.sku}`;
            const imageLink = product.primary_image || '';

            if (variants.length === 0) {
                // Product without variants - single item
                const tryPrice = product.prices?.TRY ?? product.price ?? 0;
                const price = `${Number(tryPrice).toFixed(2)} TRY`;

                xml += `    <item>
      <g:id>${escapeXml(String(product.sku))}</g:id>
      <g:title><![CDATA[${trTitle}]]></g:title>
      <g:description><![CDATA[${trDescription || trTitle}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>Karven</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
    </item>
`;
            } else {
                // Each variant becomes a separate item
                for (const variant of variants) {
                    // Get variant attribute names/values
                    const variantAttrs: string[] = [];
                    for (const avId of variant.product_variant_attribute_values) {
                        const av = attrValueMap.get(avId);
                        if (av) {
                            const attr = attrMap.get(av.product_variant_attribute_id);
                            const attrName = attr?.name || '';
                            variantAttrs.push(`${attrName}: ${av.product_variant_attribute_value}`);
                        }
                    }

                    const variantLabel = variantAttrs.join(' / ');
                    const variantTitle = variantLabel ? `${trTitle} - ${variantLabel}` : trTitle;

                    // TRY price from variant or fallback to product
                    const tryPrice = variant.variant_prices?.TRY ?? product.prices?.TRY ?? variant.variant_price ?? product.price ?? 0;
                    const price = `${Number(tryPrice).toFixed(2)} TRY`;

                    // Variant stock
                    const quantity = variant.variant_quantity ?? 0;
                    const availability = quantity > 0 ? 'in stock' : 'out of stock';

                    // Unique ID per variant
                    const itemId = variant.variant_sku || `${product.sku}_${variant.id}`;

                    xml += `    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:item_group_id>${escapeXml(String(product.sku))}</g:item_group_id>
      <g:title><![CDATA[${variantTitle}]]></g:title>
      <g:description><![CDATA[${trDescription || variantTitle}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>Karven</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:inventory>${Math.max(0, Math.floor(quantity))}</g:inventory>
    </item>
`;
                }
            }
        }

        xml += `  </channel>
</rss>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('[Product XML Feed] Error generating feed:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }
}
