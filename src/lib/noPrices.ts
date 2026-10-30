/*
 * Product data with its prices taken out, for anything rendered on the
 * server or for everybody alike: a page, its SEO data, a feed. Prices are
 * for signed-in trade customers only, and come to their browser on their
 * own (lib/prices.ts). The ERP no longer sends them on its public product
 * API either; this keeps them out whatever it sends.
 */

export function withoutPrice<P extends object>(product: P): P {
  return { ...product, price: null, prices: null };
}

export function withoutVariantPrices<V extends object>(variants: V[] | null | undefined): V[] {
  return (variants ?? []).map((v) => ({ ...v, variant_price: null, variant_prices: null }));
}
