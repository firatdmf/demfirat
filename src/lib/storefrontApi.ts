/**
 * Storefront CMS client — fetches header navigation + home sections from
 * the Django ERP storefront app. The same ERP serves multiple stores
 * (Belino, Demfirat, …) keyed by NEXT_PUBLIC_STOREFRONT_KEY (default
 * 'demfirat'). Fail soft: when the API is unreachable we return null so
 * the caller can fall back to its hardcoded defaults.
 *
 * Mirrors the contract used by the Belino front-end so the same Django
 * endpoints back both apps.
 */

// Storefront CMS lives on a dedicated ERP instance (separate from
// Demfirat's main product/order backend). Prefer the storefront-
// specific URL when set, fall back to the general NEJUM_API_URL so
// single-host setups still work.
const API_URL =
  process.env.NEJUM_STOREFRONT_API_URL
  ?? process.env.NEXT_PUBLIC_NEJUM_STOREFRONT_API_URL
  ?? process.env.NEJUM_API_URL
  ?? process.env.NEXT_PUBLIC_NEJUM_API_URL
  ?? '';

const STOREFRONT_KEY =
  process.env.NEJUM_STOREFRONT_KEY ??
  process.env.NEXT_PUBLIC_NEJUM_STOREFRONT_KEY ??
  'demfirat';

export type Bilingual = { tr: string; en: string };

export type NavItemDTO = {
  id: number;
  key: string;
  label: Bilingual;
  href: string;
  swatch: string;
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

async function djangoGet<T>(path: string): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getStorefrontNav(): Promise<NavItemDTO[] | null> {
  const data = await djangoGet<{ items: NavItemDTO[] }>(
    `/storefront/api/${STOREFRONT_KEY}/nav/`,
  );
  return data?.items ?? null;
}

export async function getStorefrontHome(): Promise<HomeSectionDTO[] | null> {
  const data = await djangoGet<{ sections: HomeSectionDTO[] }>(
    `/storefront/api/${STOREFRONT_KEY}/home/`,
  );
  return data?.sections ?? null;
}
