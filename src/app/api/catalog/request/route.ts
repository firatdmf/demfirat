import { NextRequest, NextResponse } from 'next/server';
import { buildCatalogProducts } from '@/lib/catalogProducts';
import { resolveCategories } from '@/lib/productCategories';

const BACKEND_URL = process.env.NEXT_PUBLIC_NEJUM_API_URL || 'http://127.0.0.1:8000';

// Catalog requests that arrive without a product list — the homepage band.
// The grid posts straight to /api/catalog/email with whatever the shopper has
// filtered down to; here there is no grid, so we fetch the full curtain range
// server-side and hand it to the same endpoint. Keeps the lead payload tiny.
export async function POST(request: NextRequest) {
    try {
        const { email, name, phone, locale } = await request.json();

        if (!email || !name || !phone) {
            return NextResponse.json({ success: false, error: 'Eksik bilgi' }, { status: 400 });
        }

        const categories = resolveCategories('curtain');
        const payloads = await Promise.all(
            categories.map(async (category) => {
                const url = new URL(`${BACKEND_URL}/marketing/api/get_products`);
                url.searchParams.append('product_category', category);
                try {
                    const response = await fetch(url, { next: { revalidate: 300 } });
                    if (!response.ok) {
                        console.error('[Catalog Request] Failed to fetch', category, response.status);
                        return null;
                    }
                    return await response.json();
                } catch (error) {
                    console.error('[Catalog Request] Error fetching', category, error);
                    return null;
                }
            })
        );

        const products = payloads.flatMap((data) =>
            data
                ? buildCatalogProducts(
                    data.products || [],
                    data.product_variants || [],
                    data.product_variant_attributes || [],
                    data.product_variant_attribute_values || [],
                )
                : []
        );

        if (products.length === 0) {
            return NextResponse.json({ success: false, error: 'Katalog oluşturulamadı' }, { status: 502 });
        }

        // Reuse the existing lead + PDF + email pipeline rather than repeating it.
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const emailResponse = await fetch(`${protocol}://${host}/api/catalog/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products, locale, email, name, phone }),
        });

        const result = await emailResponse.json();
        return NextResponse.json(result, { status: emailResponse.status });
    } catch (error) {
        console.error('[Catalog Request] Unexpected error:', error);
        return NextResponse.json({ success: false, error: 'Bir hata oluştu' }, { status: 500 });
    }
}
