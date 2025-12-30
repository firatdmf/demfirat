import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // Call Django backend to increment usage count
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/increment_discount_usage/`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Discount usage increment error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
