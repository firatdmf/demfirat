'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import FilterBar from '@/components/FilterBar';
import FilterDrawer from '@/components/FilterDrawer';
import Icon from '@/components/Icon';
import type { Product } from '@/types/product';
import { CATEGORIES, SEASONS, BRANDS } from '@/data/products';

type Props = {
  locale: 'tr' | 'en';
  products: Product[];
  query?: string;
  categoryKey?: string;
  seasonKey?: string;
  brand?: string;
};

export default function ListingClient({ locale, products, query, categoryKey, seasonKey, brand }: Props) {
  const tListing = useTranslations('listing');
  const tCommon = useTranslations('common');
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState('new');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const sorted = useMemo(() => {
    const out = [...products];
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
    if (sort === 'stock')
      out.sort((a, b) => (b.colors?.[0]?.stock ?? 0) - (a.colors?.[0]?.stock ?? 0));
    return out;
  }, [products, sort]);

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  // Resolve a friendly title + breadcrumb from whichever filter is active.
  // Falls back to i18n defaults so /products (no filter) still reads OK.
  const activeCategory = categoryKey
    ? CATEGORIES.find((c) => c.key === categoryKey)
    : null;
  const activeSeason = seasonKey
    ? SEASONS.find((s) => s.key === seasonKey)
    : null;
  const activeBrand = brand
    ? BRANDS.find((b) => b.key.toLowerCase() === brand.toLowerCase())
    : null;

  const headerTitle = query
    ? `“${query}”`
    : activeCategory?.label[locale]
    ?? activeSeason?.label[locale]
    ?? activeBrand?.label[locale]
    ?? tListing('title');
  const headerEyebrow = query
    ? (locale === 'tr' ? 'Arama sonuçları' : 'Search results')
    : activeSeason
    ? (locale === 'tr' ? 'Sezon' : 'Season')
    : activeBrand
    ? (locale === 'tr' ? 'Marka' : 'Brand')
    : activeCategory
    ? (locale === 'tr' ? 'Kategori' : 'Category')
    : tListing('categoryEyebrow');
  const headerSub = query
    ? `${products.length} ${tCommon('products')}`
    : activeCategory
    ? `${products.length} ${tCommon('products')}`
    : activeSeason
    ? `${activeSeason.count} ${tCommon('products')}`
    : tListing('subtitle');
  const breadcrumbLabel = query
    ? (locale === 'tr' ? 'Arama' : 'Search')
    : activeCategory?.label[locale]
    ?? activeSeason?.label[locale]
    ?? activeBrand?.label[locale]
    ?? tCommon('menSocks');

  return (
    <div>
      <section className="bel-listing-head">
        <div className="bel-container">
          <div className="crumbs">
            <Link href={`${localePrefix}/`}>{tCommon('home')}</Link> /{' '}
            <span>{breadcrumbLabel}</span>
          </div>
          <div className="lh-row">
            <div>
              <div className="bel-eyebrow">{headerEyebrow}</div>
              <h1 className="bel-h1" style={{ marginTop: 16 }}>
                {headerTitle}
              </h1>
              <p className="bel-lede" style={{ marginTop: 12, color: 'var(--bel-ink-3)' }}>
                {headerSub}
              </p>
            </div>
            <div className="lh-view">
              <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid">
                <Icon name="grid" size={16} />
              </button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List">
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <FilterBar
        onOpenDrawer={() => setDrawer(true)}
        count={sorted.length}
        sort={sort}
        setSort={setSort}
        active={[
          activeCategory && { param: 'cat', label: activeCategory.label[locale] },
          activeSeason && { param: 'season', label: activeSeason.label[locale] },
          activeBrand && { param: 'brand', label: activeBrand.label[locale] },
          query && { param: 'q', label: `“${query}”` },
        ].filter(Boolean) as { param: string; label: string }[]}
      />

      <section className="bel-section nopad-top">
        <div className="bel-container">
          <div className={`prod-grid ${view === 'list' ? 'list' : ''}`}>
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="load-more">
            <button className="bel-btn-ghost">{tCommon('loadMore')}</button>
            <div className="bel-meta" style={{ marginTop: 12 }}>
              {sorted.length} / 124
            </div>
          </div>
        </div>
      </section>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} activeCategoryKey={categoryKey} />
    </div>
  );
}
