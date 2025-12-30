import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ success: false, error: 'Kod girilmedi' }, { status: 400 });
        }

        // Call Django backend to validate discount code
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/validate_discount_code/`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Discount code validation error:', error);
        return NextResponse.json(
            { success: false, error: 'İndirim kodu doğrulanamadı' },
            { status: 500 }
        );
    }
}
