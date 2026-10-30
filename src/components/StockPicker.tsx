'use client';

/*
 * The free rolls of one fabric variant, for a signed-in trade customer to
 * order from: cut whole meters off any roll, or take a roll whole. Each
 * roll shows its length, its lot (rolls of one lot match in shade) and
 * where it stands. Read from the ERP's /operating/api/storefront/stock_items/,
 * which lists only warehouses offered on the storefront and sends no cost,
 * barcode or address.
 *
 * Fabric only: a variant whose barcode names the variant (bedding, throws)
 * has no roll to choose, so the endpoint says "variant" and nothing is
 * drawn. `onStock` tells the page whether there are rolls to show, so it
 * can keep its quantity box as the fallback. What is cut goes in the cart
 * as one line, and the order holds those very lengths.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { erpFetch } from '@/lib/erpFetch';
import { countryName } from '@/lib/countries';
import classes from './StockPicker.module.css';

type Place = { location: string; city: string; country: string };
type Roll = Place & { id: number; available: number; lot: string };
type Stock = {
  tracking: 'item' | 'variant';
  unit: string;
  items: Roll[];
  locations: (Place & { available: number })[];
};
// A picked roll: whole unless the scissors were used to cut part of it.
type Cut = { meters: string; editing: boolean };

const API = process.env.NEXT_PUBLIC_NEJUM_API_URL;

export default function StockPicker({ productSku, variantSku, onAdded, onStock }: {
  productSku: string;
  variantSku: string;
  onAdded?: () => void | Promise<void>;
  onStock?: (hasRolls: boolean) => void;
}) {
  const t = useTranslations('StockPicker');
  const locale = useLocale();
  const { data: session, status } = useSession();
  const erpToken = (session?.user as { erpToken?: string } | undefined)?.erpToken;
  const [stock, setStock] = useState<Stock | null>(null);
  const [place, setPlace] = useState<string>('');
  const [cuts, setCuts] = useState<Record<number, Cut>>({});
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);

  // Read with the session's own token, never erpFetch: that signs the
  // customer out on a 401, and a stock list that can't be read (no session
  // yet, or a stale one) should just not show.
  const load = useCallback(async () => {
    let data: Stock | null = null;
    if (status === 'authenticated' && erpToken) {
      try {
        const res = await fetch(
          `${API}/operating/api/storefront/stock_items/?sku=${encodeURIComponent(variantSku)}`,
          { headers: { Authorization: `Bearer ${erpToken}` } });
        data = res.ok ? await res.json() : null;
      } catch {
        data = null;
      }
    }
    setStock(data);
    onStock?.(!!data && data.tracking === 'item' && data.items.length > 0);
  }, [variantSku, onStock, status, erpToken]);

  useEffect(() => {
    setStock(null);
    setCuts({});
    setPlace('');
    setNotice(null);
    load();
  }, [load]);

  const unit = stock ? (t.has(`unit.${stock.unit}`) ? t(`unit.${stock.unit}`) : stock.unit) : '';
  const amount = (n: number) => `${n.toLocaleString(locale, { maximumFractionDigits: 2 })} ${unit}`;
  // City and country in the shopper's language; the warehouse's own name
  // when neither is filled in.
  const placeName = (p: Place) =>
    p.city || p.country
      ? [p.city, countryName(p.country, locale)].filter(Boolean).join(', ')
      : p.location;

  const rolls = useMemo(
    () => (stock?.items ?? []).filter((r) => !place || r.location === place),
    [stock, place]);

  // What a picked roll is cut to: a typed whole number of meters it
  // holds, or — left alone — the whole roll. Not picked: nothing.
  const lengthOf = (r: Roll): number => {
    const cut = cuts[r.id];
    if (!cut) return 0;
    const n = Number(cut.meters);
    return cut.meters !== '' && Number.isInteger(n) && n > 0 && n < r.available ? n : r.available;
  };
  const isPart = (r: Roll) => !!cuts[r.id] && lengthOf(r) < r.available;
  const chosen = (stock?.items ?? []).filter((r) => lengthOf(r) > 0);
  const chosenTotal = chosen.reduce((sum, r) => sum + lengthOf(r), 0);

  if (!stock || stock.tracking !== 'item' || stock.items.length === 0) return null;

  // Ticking a roll takes it whole; unticking forgets any cut.
  const togglePick = (r: Roll) => {
    setCuts((prev) => {
      const next = { ...prev };
      if (next[r.id]) delete next[r.id]; else next[r.id] = { meters: '', editing: false };
      return next;
    });
  };
  const openScissors = (r: Roll) => {
    setCuts((prev) => ({ ...prev, [r.id]: { meters: prev[r.id]?.meters ?? '', editing: !prev[r.id]?.editing } }));
  };
  const setMeters = (r: Roll, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return; // whole meters only
    const capped = value !== '' && Number(value) > r.available ? String(Math.floor(r.available)) : value;
    setCuts((prev) => ({ ...prev, [r.id]: { meters: capped, editing: true } }));
  };
  const closeScissors = (r: Roll) => {
    setCuts((prev) => prev[r.id] ? { ...prev, [r.id]: { ...prev[r.id], editing: false } } : prev);
  };

  const add = async () => {
    const userId = (session?.user as { id?: string } | undefined)?.id || session?.user?.email;
    if (!userId || chosen.length === 0) return;
    setAdding(true);
    setNotice(null);
    try {
      const res = await erpFetch(`${API}/authentication/api/add_to_cart/${userId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_sku: productSku,
          variant_sku: variantSku,
          // A whole roll is sent without a length: the ERP takes all of it.
          stock_items: chosen.map((r) => isPart(r) ? { id: r.id, quantity: lengthOf(r) } : { id: r.id }),
        }),
      });
      if (res.ok) {
        setCuts({});
        setNotice({ kind: 'ok', text: t('added') });
        await onAdded?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else if (res.status === 409) {
        setNotice({ kind: 'warn', text: t('gone') });
      } else if (res.status === 400) {
        setNotice({ kind: 'warn', text: t('badCut') });
      } else {
        setNotice({ kind: 'warn', text: t('error') });
      }
      await load();
    } catch {
      setNotice({ kind: 'warn', text: t('error') });
    } finally {
      setAdding(false);
    }
  };

  const total = stock.items.reduce((sum, r) => sum + r.available, 0);

  return (
    <section className={classes.picker} aria-labelledby="stock-picker-title">
      <div>
        <h3 id="stock-picker-title" className={classes.title}>{t('title')}</h3>
        <p className={classes.intro}>{t('intro')}</p>
      </div>

      {stock.locations.length > 1 && (
        <div className={classes.places}>
          <button type="button" aria-pressed={!place}
            className={`${classes.place} ${!place ? classes.placeOn : ''}`}
            onClick={() => setPlace('')}>
            {t('allLocations')} · {amount(total)}
          </button>
          {stock.locations.map((p) => (
            <button key={p.location} type="button" aria-pressed={place === p.location}
              className={`${classes.place} ${place === p.location ? classes.placeOn : ''}`}
              onClick={() => setPlace(p.location)}>
              {placeName(p)} · {amount(p.available)}
            </button>
          ))}
        </div>
      )}

      <div className={classes.table}>
        <div className={`${classes.row} ${classes.headRow}`} aria-hidden="true">
          <span />
          <span>{t('location')}</span>
          <span>{t('lot')}</span>
          <span className={classes.num}>{t('length')}</span>
        </div>
        {rolls.map((r) => {
          const lot = r.lot ? t('lotNumber', { lot: r.lot }) : t('noLot');
          const cut = cuts[r.id];
          const label = t('rollLabel', { length: amount(r.available), lot, location: placeName(r) });
          return (
            <div key={r.id} className={`${classes.row} ${cut ? classes.rowOn : ''}`}>
              <input type="checkbox" className={classes.tick} checked={!!cut}
                onChange={() => togglePick(r)} aria-label={label} />
              <span className={classes.where} onClick={() => togglePick(r)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {placeName(r)}
              </span>
              <span className={classes.lot} onClick={() => togglePick(r)}>{lot}</span>
              <span className={classes.length}>
                {cut?.editing ? (
                  <>
                    <input type="text" inputMode="numeric" autoFocus className={classes.cutInput}
                      placeholder={String(Math.floor(r.available))} value={cut.meters}
                      onChange={(e) => setMeters(r, e.target.value)}
                      onBlur={() => closeScissors(r)}
                      onKeyDown={(e) => { if (e.key === 'Enter') closeScissors(r); }}
                      aria-label={`${t('cutLabel')} — ${label}`} />
                    <span className={classes.cutUnit}>/ {amount(r.available)}</span>
                  </>
                ) : (
                  <span className={cut ? classes.picked : classes.free}>
                    {isPart(r)
                      ? t('ofRoll', { cut: amount(lengthOf(r)), roll: amount(r.available) })
                      : amount(r.available)}
                  </span>
                )}
                {cut && !cut.editing && (
                  <button type="button" className={classes.scissors} onClick={() => openScissors(r)}
                    title={t('cutPart')} aria-label={`${t('cutPart')} — ${label}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
                    </svg>
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className={classes.foot}>
        <div>
          <span className={classes.count}>{t('selected', { count: chosen.length })}</span>
          <span className={classes.total}>{amount(chosenTotal)}</span>
        </div>
        <button type="button" className={classes.addBtn} onClick={add}
          disabled={adding || chosen.length === 0}>
          {adding ? t('adding') : t('add')}
        </button>
      </div>
      {notice && (
        <p role="status" className={notice.kind === 'ok' ? classes.ok : classes.warn}>{notice.text}</p>
      )}
    </section>
  );
}
