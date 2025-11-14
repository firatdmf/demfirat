import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const product_sku = searchParams.get('product_sku');

  if (!product_sku) {
    return NextResponse.json(
      { error: 'product_sku is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`,
      {
        next: { revalidate: 300 }, // Server-side'da revalidate kullanabiliriz
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
