'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Icon from './Icon';

type ActiveFilter = {
  /** URL param this chip clears when removed (e.g. "cat", "season", "brand", "q"). */
  param: string;
  /** Visible label inside the chip. */
  label: string;
};

type Props = {
  onOpenDrawer: () => void;
  count: number;
  sort: string;
  setSort: (v: string) => void;
  /** Active filters drawn from URL/props by the listing page. */
  active?: ActiveFilter[];
};

export default function FilterBar({ onOpenDrawer, count, sort, setSort, active }: Props) {
  const locale = useLocale();
  const tListing = useTranslations('listing');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = active ?? [];

  function clearChip(param: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll() {
    router.replace(pathname);
  }

  return (
    <div className="bel-filterbar">
      <div className="bel-container fb-row">
        <button className="fb-trigger" onClick={onOpenDrawer}>
          <Icon name="filter" size={16} />
          <span>{tListing('allFilters')}</span>
          {items.length > 0 && <span className="fb-count">{items.length}</span>}
        </button>

        {items.length > 0 && (
          <div className="fb-chips">
            {items.map((f) => (
              <button
                key={`${f.param}:${f.label}`}
                type="button"
                className="fb-chip on"
                onClick={() => clearChip(f.param)}
                title={tCommon('remove') ?? 'Remove'}
              >
                <span className="fb-chip-label">{f.label}</span>
                <span className="x" aria-hidden>✕</span>
              </button>
            ))}
            <button
              type="button"
              className="fb-chip-clear"
              onClick={clearAll}
            >
              {locale === 'tr' ? 'Hepsini temizle' : 'Clear all'}
            </button>
          </div>
        )}

        <div className="fb-right">
          <span className="bel-meta fb-count-label">
            {count} {tCommon('products')}
          </span>
          <select
            className="fb-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label={tListing('sortNewest')}
          >
            <option value="new">{tListing('sortNewest')}</option>
            <option value="price-asc">{tListing('sortPriceAsc')}</option>
            <option value="price-desc">{tListing('sortPriceDesc')}</option>
            <option value="stock">{tListing('sortStock')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
