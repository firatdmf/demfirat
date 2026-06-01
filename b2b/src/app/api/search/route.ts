import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/api';

/*
 * GET /api/search?q=… — light search endpoint used by the header
 * SearchOverlay. Hits the same backend pipeline as the listing page
 * (Django when wired, mock fallback otherwise) and trims the response
 * for fast inline rendering.
 */

const LIMIT = 8;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const products = await getProducts({ q });
  const results = products.slice(0, LIMIT).map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    bg: p.bg,
  }));
  return NextResponse.json({ results, total: products.length });
}
