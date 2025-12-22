import { NextRequest, NextResponse } from 'next/server';

// In-memory cache
let cachedProducts: any[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getProductsWithDetails(): Promise<any[]> {
    const now = Date.now();

    // Return cached products if still valid
    if (cachedProducts.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedProducts;
    }

    // Fetch fresh products from both categories
    const baseUrl = process.env.NEJUM_API_URL || process.env.NEXT_PUBLIC_NEJUM_API_URL;

    // Fetch both fabric and ready_made_curtain products
    const categories = ['fabric', 'ready_made_curtain'];
    const allProducts: any[] = [];
    const allVariants: any[] = [];
    const allVariantAttributes: any[] = [];
    const allVariantAttributeValues: any[] = [];

    for (const category of categories) {
        try {
            const apiUrl = `${baseUrl}/marketing/api/get_products?product_category=${category}`;
            const response = await fetch(apiUrl, { cache: 'no-store' });

            if (response.ok) {
                const data = await response.json();
                const products = (data.products || []).map((p: any) => ({
                    ...p,
                    product_category: category
                }));
                allProducts.push(...products);
                allVariants.push(...(data.product_variants || []));
                allVariantAttributes.push(...(data.product_variant_attributes || []));
                allVariantAttributeValues.push(...(data.product_variant_attribute_values || []));
            }
        } catch (error) {
            console.error(`[SEARCH API] Error fetching ${category}:`, error);
        }
    }

    // Find the color attribute
    const colorAttribute = allVariantAttributes.find((attr: any) =>
        attr.name?.toLowerCase() === 'color'
    );

    // Create maps for each product
    const priceMap: Record<number, number[]> = {};
    const colorMap: Record<number, string[]> = {};

    // Build price map: product_id -> [all variant prices]
    allVariants.forEach((v: any) => {
        if (v.product_id && v.variant_price && Number(v.variant_price) > 0) {
            if (!priceMap[v.product_id]) priceMap[v.product_id] = [];
            priceMap[v.product_id].push(Number(v.variant_price));
        }
    });

    // Build color map: product_id -> [color names]
    if (colorAttribute) {
        // Get color values for each variant
        allVariants.forEach((v: any) => {
            if (v.product_id && v.product_variant_attribute_values) {
                v.product_variant_attribute_values.forEach((valueId: number) => {
                    const attrValue = allVariantAttributeValues.find((av: any) =>
                        av.id === valueId && av.product_variant_attribute_id === colorAttribute.id
                    );
                    if (attrValue && attrValue.product_variant_attribute_value) {
                        const colorName = attrValue.product_variant_attribute_value.trim();
                        if (!colorMap[v.product_id]) colorMap[v.product_id] = [];
                        if (!colorMap[v.product_id].includes(colorName)) {
                            colorMap[v.product_id].push(colorName);
                        }
                    }
                });
            }
        });
    }

    // Enrich products with price range and colors
    cachedProducts = allProducts.map((p: any) => {
        const productId = p.id || p.pk;
        const prices = priceMap[productId] || [];
        const colors = colorMap[productId] || [];

        let minPrice = null;
        let maxPrice = null;
        if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
        }

        return {
            ...p,
            price: minPrice || p.price,
            minPrice,
            maxPrice,
            colors: colors.slice(0, 6) // Max 6 colors
        };
    });

    cacheTimestamp = now;
    console.log('[SEARCH API] Cached', cachedProducts.length, 'products (fabric + ready_made_curtain)');
    return cachedProducts;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2 && query !== '__all__') {
        return NextResponse.json({ products: [] });
    }

    try {
        const allProducts = await getProductsWithDetails();

        if (query === '__all__') {
            return NextResponse.json({
                products: allProducts.slice(0, limit),
                total: allProducts.length,
            });
        }

        const searchLower = query.toLowerCase();
        const filteredProducts = allProducts.filter((product: any) => {
            const title = (product.title || '').toLowerCase();
            const sku = (product.sku || '').toLowerCase();
            return title.includes(searchLower) || sku.includes(searchLower);
        });

        return NextResponse.json({
            products: filteredProducts.slice(0, limit),
            total: filteredProducts.length,
        });
    } catch (error) {
        console.error('[SEARCH API] Error:', error);
        return NextResponse.json({ products: [], error: String(error) }, { status: 500 });
    }
}

if (typeof window === 'undefined') {
    getProductsWithDetails().catch(() => { });
}
