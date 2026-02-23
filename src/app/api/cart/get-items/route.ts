import { NextRequest, NextResponse } from 'next/server';

/**
 * Batch endpoint: Fetch multiple cart item details in a single request.
 * Accepts POST with { items: [{ product_sku, variant_sku? }] }
 * Returns all product + variant details at once, eliminating N+1 API calls.
 */
export async function POST(request: NextRequest) {
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'items array is required' }, { status: 400 });
        }

        // Deduplicate product SKUs to avoid redundant backend calls
        const uniqueProductSKUs = [...new Set(items.map((i: any) => i.product_sku).filter(Boolean))];

        // Fetch all unique products in parallel from Django backend
        const productResponses = await Promise.all(
            uniqueProductSKUs.map(async (sku) => {
                try {
                    const res = await fetch(
                        `${process.env.NEJUM_API_URL}/marketing/api/get_product?product_sku=${sku}`,
                        { next: { revalidate: 300 } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        return { sku, data };
                    }
                } catch (e) {
                    console.error(`[Batch Cart] Failed to fetch product ${sku}:`, e);
                }
                return { sku, data: null };
            })
        );

        // Build lookup map: product_sku -> full product data
        const productMap = new Map<string, any>();
        productResponses.forEach(({ sku, data }) => {
            if (data) productMap.set(sku, data);
        });

        // Now resolve each cart item with its product/variant details
        const results = items.map((item: any) => {
            const productData = productMap.get(item.product_sku);
            if (!productData) {
                return {
                    product_sku: item.product_sku,
                    variant_sku: item.variant_sku || null,
                    product: null,
                    variant: null,
                    variant_attributes: {},
                    primary_image: null,
                    product_category: null,
                };
            }

            const product = productData.product;
            const productVariants = productData.product_variants || [];
            const productFiles = productData.product_files || [];
            const productVariantAttributes = productData.product_variant_attributes || [];
            const productVariantAttributeValues = productData.product_variant_attribute_values || [];

            let variant: any = null;
            let variantAttributes: { [key: string]: string } = {};
            let primaryImage = product?.primary_image || null;

            // If variant_sku is provided, find the variant
            if (item.variant_sku) {
                variant = productVariants.find((v: any) => v.variant_sku === item.variant_sku) || null;

                if (variant) {
                    // Find variant images
                    const variantImages = productFiles
                        .filter((file: any) => String(file.product_variant_id) === String(variant.id))
                        .sort((a: any, b: any) => (a.sequence ?? Infinity) - (b.sequence ?? Infinity));

                    if (variantImages.length > 0) {
                        primaryImage = variantImages[0].file;
                    }

                    // Resolve variant attributes (e.g. Color: Ecru)
                    const variantAttributeValueIds = variant.product_variant_attribute_values || [];
                    variantAttributeValueIds.forEach((valueId: any) => {
                        const attrValue = productVariantAttributeValues.find(
                            (av: any) => String(av.id) === String(valueId)
                        );
                        if (attrValue) {
                            const attr = productVariantAttributes.find(
                                (a: any) => String(a.id) === String(attrValue.product_variant_attribute_id)
                            );
                            if (attr && attr.name) {
                                variantAttributes[attr.name] = attrValue.product_variant_attribute_value;
                            }
                        }
                    });
                }
            }

            return {
                product_sku: item.product_sku,
                variant_sku: item.variant_sku || null,
                product: product ? {
                    title: product.title,
                    price: product.price,
                    primary_image: product.primary_image,
                } : null,
                variant: variant ? {
                    variant_sku: variant.variant_sku,
                    variant_price: variant.variant_price || variant.price,
                } : null,
                variant_attributes: variantAttributes,
                primary_image: primaryImage,
                product_category: productData.product_category || null,
            };
        });

        return NextResponse.json({ items: results }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('[Batch Cart API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
