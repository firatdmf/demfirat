import { PRODUCTS, CATEGORIES, SEASONS, BRANDS } from '@/data/products';
import type { Product, Category } from '@/types/product';
import { mapDjangoToProducts, type DjangoApiResponse } from '@/lib/mapper';

/*
 * API client.
 *
 * When NEJUM_API_URL (or NEXT_PUBLIC_NEJUM_API_URL) is set, hit the
 * Django marketing endpoints in erp2. When the backend has no data
 * yet, fall back to bundled mock data so the UI keeps working —
 * unless B2B_USE_MOCK_FALLBACK=0, in which case we surface empty.
 *
 * Endpoints used:
 *   GET /marketing/api/get_products[?product_category=...]
 *   GET /marketing/api/get_product?product_sku=...
 *   GET /marketing/api/get_product_categories
 *   POST /marketing/api/subscribe/
 */

const API_URL =
  process.env.NEJUM_API_URL ?? process.env.NEXT_PUBLIC_NEJUM_API_URL ?? '';
const USE_MOCK_FALLBACK = (process.env.B2B_USE_MOCK_FALLBACK ?? '1') !== '0';

export type ProductFilters = {
  categoryKey?: string;
  seasonKey?: string;
  brand?: string;
  q?: string;
};

async function djangoGet<T>(path: string, opts: { timeoutMs?: number } = {}): Promise<T | null> {
  if (!API_URL) return null;
  // Default 8s — the fabric category endpoint takes ~5s, so 3s was
  // aborting legitimate calls. Detail-page lookups can override with
  // a longer ceiling since they have nothing else to fetch in parallel.
  const timeoutMs = opts.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      signal: controller.signal,
      // 60s ISR — nav/products rarely change, no need to re-fetch on every
      // page navigation. Saves us seconds per request when the backend
      // is sluggish.
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/*
 * Fold Turkish diacritics and casing so "cocuk" matches "Çocuk",
 * "BÜYÜK İ" matches "büyük i", "ISTANBUL" matches "istanbul", etc.
 *
 * Default `toLowerCase()` is locale-insensitive — "İ".toLowerCase()
 * returns "i" + combining dot (U+0307), which won't match plain "i".
 * Use Turkish locale lowercase first, then NFD-decompose and drop
 * combining marks to flatten ç → c, ö → o, etc. The dotless ı isn't
 * decomposable, so map it explicitly.
 */
function fold(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/ı/g, 'i');
}

function applyFilters(list: Product[], f: ProductFilters): Product[] {
  let out = list;
  if (f.categoryKey) out = out.filter((p) => p.categoryKey === f.categoryKey);
  if (f.seasonKey) out = out.filter((p) => p.seasonKey === f.seasonKey);
  if (f.brand) out = out.filter((p) => p.brand === f.brand);
  if (f.q) {
    const q = fold(f.q);
    out = out.filter(
      (p) =>
        fold(p.name.tr).includes(q) ||
        fold(p.name.en).includes(q) ||
        fold(p.sku).includes(q) ||
        fold(p.description.tr).includes(q) ||
        fold(p.category.tr).includes(q),
    );
  }
  return out;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const hasFilters = Boolean(filters.categoryKey || filters.seasonKey || filters.brand || filters.q);
  if (API_URL) {
    const qs = new URLSearchParams();
    if (filters.categoryKey) qs.set('product_category', filters.categoryKey);
    const path = `/marketing/api/get_products${qs.toString() ? `?${qs}` : ''}`;
    const resp = await djangoGet<DjangoApiResponse>(path);
    if (resp && resp.products.length > 0) {
      // Django already applied the category filter server-side.
      // Re-filtering on categoryKey here would drop everything, so
      // strip it from the client-side pass.
      const { categoryKey: _serverHandled, ...rest } = filters;
      return applyFilters(mapDjangoToProducts(resp), rest);
    }
    // Empty response from Django.
    if (!USE_MOCK_FALLBACK) return [];
    // Fall through to mock — works for both "no filter, DB empty"
    // (homepage) and "filter, DB doesn't have it yet" (kadin-corap
    // before products are added). UX-wise it's better to show the
    // mock catalogue than a blank page during early-stage demos.
  }
  const filtered = applyFilters([...PRODUCTS], filters);
  // If even the mock has nothing in this category (because the demo
  // catalogue is sparse), show a small sample of the catalogue so the
  // page never looks broken to the user.
  if (filtered.length === 0 && hasFilters && USE_MOCK_FALLBACK) {
    return PRODUCTS.slice(0, 8);
  }
  return filtered;
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (API_URL) {
    // The no-filter ERP endpoint takes 15+ seconds (whole catalogue),
    // which blows past djangoGet's 3-second abort and effectively
    // 404s every detail page. Query each DEMFIRAT category in parallel
    // instead — each category response is ~3s and we only need the
    // first match.
    const categories = ['fabric', 'ready-made_curtain', 'bed'];
    const responses = await Promise.all(
      categories.map((c) => djangoGet<DjangoApiResponse>(`/marketing/api/get_products?product_category=${c}`)),
    );
    for (const resp of responses) {
      if (!resp || !resp.products?.length) continue;
      const list = mapDjangoToProducts(resp);
      const hit = list.find((p) => p.slug === slug);
      if (hit) return hit;
    }
    if (!USE_MOCK_FALLBACK) return null;
  }
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  // Pull a small pool from the curtain category for related cards.
  // Avoids the slow no-filter call too.
  const all = await getProducts({ categoryKey: 'fabric' });
  return all.filter((p) => p.slug !== slug).slice(0, limit);
}

export async function getCategories(parent?: string): Promise<Category[]> {
  // Django categories don't yet carry parent links the way our UI
  // wants. Use mock taxonomy until that lands in Django.
  if (parent) return CATEGORIES.filter((c) => c.parent === parent);
  return CATEGORIES;
}

export async function getSeasons() {
  return SEASONS;
}

export async function getBrands() {
  return BRANDS;
}

/* ============================================================
 * Storefront CMS — header navigation + home sections come from
 * Django storefront/api/<key>/. Fail soft: when the API is down
 * we return null so the caller can fall back to its hardcoded
 * defaults (the live site never goes blank during a backend hiccup).
 * ============================================================ */

export type Bilingual = { tr: string; en: string };

export type NavItemDTO = {
  id: number;
  key: string;
  label: Bilingual;
  href: string;
  swatch: string;
  /** Product count for the nav item's linked category (children only). */
  count?: number;
  feature: { title: string; meta: string; image: string } | null;
  children: NavItemDTO[];
};

export type HomeSeasonCardDTO = {
  id: number;
  key: string;
  label: Bilingual;
  eyebrow: Bilingual;
  image: string;
  href: string;
  count: number;
};

export type HomeBadgeDTO = {
  id: number;
  icon: string;
  title: Bilingual;
  sub: Bilingual;
};

export type HomeSectionDTO = {
  id: number;
  kind: 'hero' | 'trust' | 'seasons' | 'featured';
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
  image: string;
  cta: { label: Bilingual; href: string } | null;
  cards?: HomeSeasonCardDTO[];
  products?: { id: number; product_id: number; sku: string }[];
  badges?: HomeBadgeDTO[];
};

const STOREFRONT_KEY =
  process.env.NEJUM_STOREFRONT_KEY ?? process.env.NEXT_PUBLIC_NEJUM_STOREFRONT_KEY ?? 'demfirat';

export async function getStorefrontNav(): Promise<NavItemDTO[] | null> {
  if (!API_URL) return null;
  const data = await djangoGet<{ items: NavItemDTO[] }>(
    `/storefront/api/${STOREFRONT_KEY}/nav/`,
  );
  if (!data || !data.items) return null;
  return data.items;
}

export async function getStorefrontHome(): Promise<HomeSectionDTO[] | null> {
  if (!API_URL) return null;
  const data = await djangoGet<{ sections: HomeSectionDTO[] }>(
    `/storefront/api/${STOREFRONT_KEY}/home/`,
  );
  if (!data || !data.sections) return null;
  return data.sections;
}
