'use client';

/**
 * Quick add-to-cart modal. Compact picker — small product thumb + name +
 * price, then color & size selectors, qty stepper and a single primary
 * Add-to-Cart button. A "View full details" link routes to the proper
 * product detail page when the user wants the long form.
 *
 * Triggered via the global `demfirat:quickview` CustomEvent dispatched
 * from ProductCard's "+ Sepete ekle" button.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Icon from '@/components/Icon';
import type { Product } from '@/types/product';

export default function QuickViewModal() {
  const locale = useLocale() as 'tr' | 'en';
  const tCommon = useTranslations('common');
  const { add: addToCart, open: openCart } = useCart();
  const { convertPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    function onShow(e: Event) {
      const ce = e as CustomEvent<{ product: Product }>;
      const p = ce.detail?.product;
      if (!p) return;
      setProduct(p);
      setColorIdx(0);
      setSizeIdx(0);
      setQty(1);
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('demfirat:quickview', onShow);
    return () => window.removeEventListener('demfirat:quickview', onShow);
  }, []);

  useEffect(() => {
    if (!product) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product]);

  function close() {
    setProduct(null);
    document.body.style.overflow = '';
  }

  if (!product) return null;

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const variant = colors[colorIdx];
  const variantStock = variant?.stock ?? 0;
  const localePrefix = locale === 'tr' ? '' : `/${locale}`;
  const detailHref = `${localePrefix}/products/${product.slug}`;

  function onAdd() {
    if (!variant) return;
    const sizeChoice = sizes[sizeIdx];
    addToCart({
      productId: product!.id,
      productSku: product!.sku,
      variantSku: sizeChoice ? `${variant.id}-${sizeChoice.id}` : variant.id,
      name: product!.name,
      category: product!.category,
      variant: variant.label,
      size: sizeChoice?.label ?? '-',
      qty,
      price: product!.price,
      bg: variant.bg,
    });
    close();
    openCart();
  }

  return (
    <div className="bel-qa-backdrop" onClick={close} role="dialog" aria-modal="true">
      <div className="bel-qa-card" onClick={(e) => e.stopPropagation()}>
        <button className="bel-qa-close" onClick={close} aria-label="Close">
          <Icon name="close" size={16} />
        </button>

        <div className="bel-qa-head">
          <div
            className="bel-qa-thumb"
            style={{ background: variant?.bg ?? product.bg }}
          />
          <div className="bel-qa-meta">
            <div className="bel-eyebrow">{product.category[locale]}</div>
            <h3 className="bel-qa-name">{product.name[locale]}</h3>
            <div className="bel-qa-price">{convertPrice(product.price)}</div>
          </div>
        </div>

        <div className="bel-qa-body">
          {colors.length >= 1 && (
            <div className="bel-qa-row">
              <div className="bel-qa-row-head">
                <span className="bel-eyebrow">
                  {locale === 'tr' ? 'Renk' : 'Color'}
                </span>
                <span className="bel-qa-current">{variant?.label[locale]}</span>
              </div>
              <div className="bel-qa-swatches">
                {colors.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`vsel-color ${colorIdx === i ? 'on' : ''}`}
                    onMouseEnter={() => setColorIdx(i)}
                    onClick={() => setColorIdx(i)}
                    aria-label={c.label[locale]}
                  >
                    <span
                      className="vsel-color-inner"
                      style={{ background: c.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length >= 1 && (
            <div className="bel-qa-row">
              <div className="bel-qa-row-head">
                <span className="bel-eyebrow">
                  {locale === 'tr' ? 'Beden' : 'Size'}
                </span>
                <span className="bel-qa-stock">
                  {variantStock > 0
                    ? locale === 'tr'
                      ? `${variantStock} stokta`
                      : `${variantStock} in stock`
                    : locale === 'tr'
                    ? 'Stokta yok'
                    : 'Out of stock'}
                </span>
              </div>
              <div className="bel-qa-sizes">
                {sizes.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`vsel-size ${sizeIdx === i ? 'on' : ''} ${
                      s.stock === 0 ? 'oos' : ''
                    }`}
                    disabled={s.stock === 0}
                    onClick={() => setSizeIdx(i)}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bel-qa-foot">
          <div className="bel-qa-qty">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-">
              <Icon name="minus" size={12} />
            </button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty(qty + 1)} aria-label="+">
              <Icon name="plus" size={12} />
            </button>
          </div>
          <button
            type="button"
            className="bel-btn-primary block bel-qa-add"
            onClick={onAdd}
            disabled={variantStock <= 0}
          >
            <span>{tCommon('addToCart')}</span>
            <span className="bel-qa-add-price">{convertPrice(product.price * qty)}</span>
          </button>
        </div>

        <Link href={detailHref} className="bel-qa-detail" onClick={close}>
          {locale === 'tr' ? 'Tüm detayları gör →' : 'View full details →'}
        </Link>
      </div>
    </div>
  );
}
