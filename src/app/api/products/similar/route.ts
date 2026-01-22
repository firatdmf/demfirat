import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fabric_type = searchParams.get('fabric_type');
    const exclude_sku = searchParams.get('exclude_sku');
    const limit = searchParams.get('limit') || '12';

    if (!fabric_type) {
        return NextResponse.json(
            { error: 'fabric_type is required' },
            { status: 400 }
        );
    }

    try {
        // Fetch products from Django API with fabric_type filter
        const apiUrl = new URL(`${process.env.NEJUM_API_URL}/marketing/api/get_products`);
        apiUrl.searchParams.append('product_category', 'fabric');
        apiUrl.searchParams.append('fabric_type', fabric_type);

        const response = await fetch(apiUrl.toString(), {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch products from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();
        let products = data.products || [];

        // Exclude current product
        if (exclude_sku) {
            products = products.filter((p: any) => p.sku !== exclude_sku);
        }

        // Limit results
        const limitNum = parseInt(limit, 10);
        products = products.slice(0, limitNum);

        return NextResponse.json({
            success: true,
            products,
            product_variants: data.product_variants || [],
            product_files: data.product_files || [],
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Error fetching similar products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
