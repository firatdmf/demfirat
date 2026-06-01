'use client';

import { useState, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { CATEGORIES } from '@/data/products';
import Icon from './Icon';

type Props = {
  open: boolean;
  onClose: () => void;
  // Optional dynamic counts from the listing page so the sidebar
  // shows real ERP totals instead of placeholders.
  categoryCounts?: Record<string, number>;
  activeCategoryKey?: string;
};

export default function FilterDrawer({ open, onClose, categoryCounts = {}, activeCategoryKey }: Props) {
  const locale = useLocale() as 'tr' | 'en';
  const tListing = useTranslations('listing');
  const [price, setPrice] = useState(800);

  if (!open) return null;

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  return (
    <>
      <div className="bel-scrim" onClick={onClose} />
      <aside className="bel-drawer left">
        <div className="drawer-head">
          <span className="bel-eyebrow">{tListing('allFilters')}</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="drawer-body">
          <Section title={locale === 'tr' ? 'Kategori' : 'Category'}>
            {CATEGORIES.map((c) => {
              const count = categoryCounts[c.key] ?? 0;
              const isActive = activeCategoryKey === c.key;
              return (
                <Link
                  key={c.key}
                  href={`${localePrefix}/products?cat=${c.key}`}
                  className={`filt-check ${isActive ? 'on' : ''}`}
                  onClick={onClose}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span>{c.label[locale]}</span>
                  {count > 0 && <span className="filt-c">{count}</span>}
                </Link>
              );
            })}
          </Section>

          {/* Bedroom-specific filters — only shown when the bed listing is active.
              Each link narrows the listing via URL query params (type=, size=)
              which the server-side ProductsPage can later consume to filter. */}
          {activeCategoryKey === 'bed' && (
            <>
              <Section title={locale === 'tr' ? 'Ürün tipi' : 'Item type'}>
                {[
                  { key: 'quilt', label: { tr: 'Nevresim takımı', en: 'Quilt cover set' } },
                  { key: 'sheet', label: { tr: 'Çarşaf', en: 'Sheet' } },
                  { key: 'pillow', label: { tr: 'Yastık kılıfı', en: 'Pillowcase' } },
                  { key: 'oxford', label: { tr: 'Oxford yastık kılıfı', en: 'Oxford pillowcase' } },
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={`${localePrefix}/products?cat=bed&type=${item.key}`}
                    className="filt-check"
                    onClick={onClose}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <span>{item.label[locale]}</span>
                  </Link>
                ))}
              </Section>

              <Section title={locale === 'tr' ? 'Beden' : 'Size'}>
                {[
                  { key: 'single', label: { tr: 'Tek kişilik', en: 'Single' } },
                  { key: 'double', label: { tr: 'Çift kişilik', en: 'Double' } },
                ].map((sz) => (
                  <Link
                    key={sz.key}
                    href={`${localePrefix}/products?cat=bed&size=${sz.key}`}
                    className="filt-check"
                    onClick={onClose}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <span>{sz.label[locale]}</span>
                  </Link>
                ))}
              </Section>
            </>
          )}

          {/* Tulle curtain subtype filters — only on fabric listing. */}
          {activeCategoryKey === 'fabric' && (
            <Section title={locale === 'tr' ? 'Kumaş tipi' : 'Fabric type'}>
              {[
                { key: 'embroidery', label: { tr: 'Nakışlı', en: 'Embroidered' } },
                { key: 'solid', label: { tr: 'Düz', en: 'Solid' } },
                { key: 'blackout', label: { tr: 'Fon (Blackout)', en: 'Blackout' } },
              ].map((ft) => (
                <Link
                  key={ft.key}
                  href={`${localePrefix}/products?cat=fabric&fabric_type=${ft.key}`}
                  className="filt-check"
                  onClick={onClose}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span>{ft.label[locale]}</span>
                </Link>
              ))}
            </Section>
          )}

          <Section title={tListing('price')}>
            <div className="filt-price">
              <input
                type="range"
                min={0}
                max={1000}
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10))}
              />
              <div className="filt-price-row">
                <span>₺ 0</span>
                <span>₺ {price}</span>
              </div>
            </div>
          </Section>
        </div>
        <div className="drawer-foot">
          <Link href={`${localePrefix}/products`} className="bel-btn-ghost" onClick={onClose} style={{ textDecoration: 'none' }}>
            {tListing('clear')}
          </Link>
          <button className="bel-btn-primary" onClick={onClose}>
            {locale === 'tr' ? 'Uygula' : 'Apply'}
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="filt-section">
      <button className="filt-head" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <Icon name={open ? 'minus' : 'plus'} size={14} />
      </button>
      {open && <div className="filt-content">{children}</div>}
    </div>
  );
}
