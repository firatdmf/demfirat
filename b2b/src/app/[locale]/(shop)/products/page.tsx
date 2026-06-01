import { getProducts } from '@/lib/api';
import ListingClient from './ListingClient';
import type { Locale } from '@/i18n';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ cat?: string; season?: string; brand?: string; q?: string }>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  // Default listing = "Perdeler" (curtains only): fabric + ready-made_curtain.
  // Bedroom has its own landing page (/bedroom), so it's NOT included here
  // unless the user explicitly requests ?cat=bed.
  let products;
  if (sp.cat) {
    products = await getProducts({
      categoryKey: sp.cat,
      seasonKey: sp.season,
      brand: sp.brand,
      q: sp.q,
    });
  } else {
    const [fabric, readyMade] = await Promise.all([
      getProducts({ seasonKey: sp.season, brand: sp.brand, q: sp.q, categoryKey: 'fabric' }),
      getProducts({ seasonKey: sp.season, brand: sp.brand, q: sp.q, categoryKey: 'ready-made_curtain' }),
    ]);
    products = [...fabric, ...readyMade];
  }

  // Public catalog — price is hidden via "Sign in for price" on cards,
  // and the cart drawer enforces auth at checkout time. Keeps the URL
  // shareable / index-friendly for prospects.
  return (
    <ListingClient
      locale={locale}
      products={products}
      query={sp.q}
      categoryKey={sp.cat}
      seasonKey={sp.season}
      brand={sp.brand}
    />
  );
}
