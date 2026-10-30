'use client';

/*
 * Prices are for signed-in trade customers only. The ERP's product API
 * sends none, so a page is the same for everybody (and cached so); a
 * signed-in customer's browser then asks /marketing/api/storefront/prices/
 * for the products on screen, with the session's ERP token, and the
 * numbers are put where the pages already read them (product.price,
 * variant_price, and the pre-converted `prices` dicts).
 *
 * Read with plain fetch, not erpFetch: a price list that can't be read
 * (no session yet, or a stale one) just leaves the prices out, rather than
 * signing the customer out.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

export type PriceDict = { USD: number; TRY: number; EUR: number; RUB: number; PLN: number } | null;
export type Prices = {
  products: Record<string, { price: number | null; prices: PriceDict }>;
  variants: Record<string, { variant_price: number | null; variant_prices: PriceDict }>;
};

const API = process.env.NEXT_PUBLIC_NEJUM_API_URL;

export async function fetchPrices(skus: string[], token: string): Promise<Prices | null> {
  if (!token || skus.length === 0) return null;
  try {
    const res = await fetch(`${API}/marketing/api/storefront/prices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_skus: skus }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** The prices of these products for the signed-in customer; null for anyone else. */
export function usePrices(skus: string[]): { prices: Prices | null; signedIn: boolean } {
  const { data: session, status } = useSession();
  const token = (session?.user as { erpToken?: string } | undefined)?.erpToken;
  const key = [...new Set(skus.filter(Boolean))].sort().join('|');
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    let live = true;
    if (status !== 'authenticated' || !token || !key) {
      setPrices(null);
      return;
    }
    fetchPrices(key.split('|'), token).then((p) => { if (live) setPrices(p); });
    return () => { live = false; };
  }, [status, token, key]);

  return { prices, signedIn: status === 'authenticated' };
}

/** `products` and `variants` with the customer's prices put in. */
export function withPrices<P extends { sku?: string | null }, V extends { variant_sku?: string | null }>(
  products: P[] | null | undefined, variants: V[] | null | undefined, prices: Prices | null,
): { products: P[]; variants: V[] } {
  const ps = (products ?? []).map((p) => {
    const found = prices?.products[p.sku ?? ''];
    return { ...p, price: found?.price ?? null, prices: found?.prices ?? null };
  });
  const vs = (variants ?? []).map((v) => {
    const found = prices?.variants[v.variant_sku ?? ''];
    return { ...v, variant_price: found?.variant_price ?? null, variant_prices: found?.variant_prices ?? null };
  });
  return { products: ps, variants: vs };
}

/** withPrices for one page's worth of products, memoised. */
export function usePriced<P extends { sku?: string | null }, V extends { variant_sku?: string | null }>(
  products: P[] | null | undefined, variants: V[] | null | undefined,
) {
  const { prices, signedIn } = usePrices((products ?? []).map((p) => p.sku ?? ''));
  const priced = useMemo(() => withPrices(products, variants, prices), [products, variants, prices]);
  return { ...priced, signedIn };
}

/** Each product's "from" price (its variants' lowest) for the signed-in
 *  customer, by product SKU; null for anybody else or an unpriced one. */
export function useFromPrices(skus: string[]) {
  const { prices, signedIn } = usePrices(skus);
  const priceOf = (sku: string | null | undefined): number | null =>
    (sku && prices?.products[sku]?.price) || null;
  return { priceOf, signedIn };
}
