import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders/track?order_number=DK0000001
 * 
 * Proxy to Django backend for order tracking.
 */
export async function GET(request: NextRequest) {
    try {
        const orderNumber = request.nextUrl.searchParams.get('order_number');

        if (!orderNumber) {
            return NextResponse.json(
                { success: false, error: 'Sipariş numarası gerekli' },
                { status: 400 }
            );
        }

        // Call Django backend
        const djangoUrl = `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/operating/orders/track/?order_number=${encodeURIComponent(orderNumber)}`;

        const response = await fetch(djangoUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Order tracking error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Sipariş sorgulama hatası',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
