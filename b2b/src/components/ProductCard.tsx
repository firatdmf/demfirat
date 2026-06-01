'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';
import { stockColor } from '@/lib/format';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  product: Product;
  density?: 'comfortable' | 'compact';
  radius?: number;
};

export default function ProductCard({ product, density = 'comfortable', radius = 2 }: Props) {
  const locale = useLocale() as 'tr' | 'en';
  const tCommon = useTranslations('common');
  const { convertPrice } = useCurrency();
  const { user } = useAuth();
  const { isFav, toggle } = useFavorites();
  const router = useRouter();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const active = hoverIdx ?? 0;
  const variant = colors[active] ?? colors[0];
  const variantStock = variant?.stock ?? 0;
  const stockClr = stockColor(variantStock);
  const pad = density === 'compact' ? 14 : 20;
  const localePrefix = locale === 'tr' ? '' : `/${locale}`;
  const href = `${localePrefix}/products/${product.slug}`;

  function openQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('demfirat:quickview', { detail: { product } }),
    );
  }

  return (
    <Link href={href} className="bel-card" style={{ borderRadius: radius }}>
      <div className="bel-card-img" style={{ background: variant?.bg ?? product.bg }}>
        {product.badge && <span className="bel-card-badge">{product.badge[locale]}</span>}
        {user && (
          <button
            className={`bel-card-fav ${isFav(product.sku) ? 'on' : ''}`}
            aria-label="Favorite"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.sku);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav(product.sku) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
            </svg>
          </button>
        )}
        {variant && <span className="bel-card-variant-label">{variant.label[locale]}</span>}
        <div className="bel-card-quick">
          <button
            type="button"
            className="bel-card-qicon"
            onClick={openQuickAdd}
            aria-label={tCommon('addToCart')}
            title={tCommon('addToCart')}
            disabled={variantStock <= 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              <path d="M16 13h-3v3M13 13l3 3" />
            </svg>
          </button>
          <span
            className="bel-card-qicon"
            aria-label={locale === 'tr' ? 'Önizle' : 'Preview'}
            title={locale === 'tr' ? 'Önizle' : 'Preview'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </div>
      </div>
      <div className="bel-card-body" style={{ padding: pad }}>
        <div className="bel-eyebrow">{product.category[locale]}</div>
        <h3 className="bel-card-name">{product.name[locale]}</h3>
        <div className="bel-card-meta">{product.meta[locale]}</div>

        {(colors.length >= 1 || sizes.length >= 1) && (
          <div className="bel-card-variants">
            {colors.length >= 1 && (
              <div className="bel-card-swatches">
                {colors.map((c, i) => (
                  <button
                    key={c.id}
                    className={`bel-sw ${active === i ? 'on' : ''}`}
                    style={{ background: c.color }}
                    onMouseEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoverIdx(i);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title={c.label[locale]}
                    aria-label={c.label[locale]}
                  />
                ))}
                {product.extraColors && product.extraColors > 0 && (
                  <span className="bel-sw-more">+{product.extraColors}</span>
                )}
              </div>
            )}
            {sizes.length >= 1 && (
              <span className="bel-card-sizes">
                {sizes.length === 1
                  ? sizes[0].label
                  : `${sizes.length} ${locale === 'tr' ? 'beden' : 'sizes'}`}
              </span>
            )}
          </div>
        )}

        <div className="bel-card-foot">
          <div className="bel-card-price">
            {user ? (
              <>
                <span className="amt">{convertPrice(product.price)}</span>
                {product.priceWas && <span className="was">{convertPrice(product.priceWas)}</span>}
              </>
            ) : (
              // Use a button (not <Link>) — the whole card is wrapped in a
              // <Link>, and an <a> can't be nested inside another <a>.
              <button
                type="button"
                className="bel-card-price-locked"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`${localePrefix}/login`);
                }}
              >
                {locale === 'tr' ? 'Fiyat için giriş yap' : 'Sign in for price'}
              </button>
            )}
          </div>
          <div className="bel-card-stock" style={{ color: stockClr }}>
            <span className="dot" style={{ background: stockClr }} />
            {variantStock > 200
              ? locale === 'tr'
                ? `Stokta ${variantStock}`
                : `${variantStock} in stock`
              : locale === 'tr'
              ? `Son ${variantStock}`
              : `Only ${variantStock}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
