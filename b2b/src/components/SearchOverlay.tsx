'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Bilingual } from '@/types/product';

type Hit = {
  id: string;
  slug: string;
  sku: string;
  name: Bilingual;
  category: Bilingual;
  price: number;
  bg: string;
};

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const locale = useLocale() as 'tr' | 'en';
  const t = useTranslations('common');
  const router = useRouter();
  const { convertPrice } = useCurrency();

  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on every open and refocus the input.
  useEffect(() => {
    if (open) {
      setQ('');
      setHits([]);
      setTotal(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounce the query: only fire after the user pauses typing.
  useEffect(() => {
    if (!open) return;
    if (!q.trim()) {
      setHits([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setHits(data.results ?? []);
        setTotal(data.total ?? 0);
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setHits([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  if (!open) return null;

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  const goToHit = (h: Hit) => {
    onClose();
    router.push(`${localePrefix}/products/${h.slug}`);
  };

  const goToListing = (term?: string) => {
    onClose();
    const url = term
      ? `${localePrefix}/products?q=${encodeURIComponent(term)}`
      : `${localePrefix}/products`;
    router.push(url);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) goToListing(term);
  };

  const popular = ['Erkek çorap', 'Pamuk', "12'li paket", 'Modal boxer', 'Termal seri', 'Yeni sezon'];

  return (
    <div className="bel-search-overlay" onClick={onClose}>
      <div className="bel-search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bel-search-head">
          <span className="bel-eyebrow">{t('search')}</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="bel-search-input"
            placeholder={t('searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {q.trim() ? (
          <div className="bel-search-results">
            {loading && hits.length === 0 && (
              <div className="bel-search-empty">…</div>
            )}
            {!loading && hits.length === 0 && (
              <div className="bel-search-empty">
                {locale === 'tr' ? 'Eşleşen ürün bulunamadı.' : 'No products match.'}
              </div>
            )}
            {hits.map((h) => (
              <button key={h.id} className="bel-search-hit" onClick={() => goToHit(h)}>
                <span className="bel-search-hit-img" style={{ background: h.bg }} />
                <span className="bel-search-hit-body">
                  <span className="bel-eyebrow">{h.category[locale]}</span>
                  <span className="bel-search-hit-name">{h.name[locale]}</span>
                  <span className="bel-search-hit-meta">{h.sku}</span>
                </span>
                <span className="bel-search-hit-price">{convertPrice(h.price)}</span>
              </button>
            ))}
            {total > hits.length && (
              <button className="bel-search-more" onClick={() => goToListing(q.trim())}>
                {locale === 'tr'
                  ? `${total} sonucun tümünü gör →`
                  : `See all ${total} results →`}
              </button>
            )}
          </div>
        ) : (
          <div className="bel-search-suggest">
            <div className="bel-eyebrow" style={{ marginBottom: 16 }}>
              {t('popular')}
            </div>
            <div className="bel-search-tags">
              {popular.map((tag) => (
                <button key={tag} className="fb-chip" onClick={() => goToListing(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
