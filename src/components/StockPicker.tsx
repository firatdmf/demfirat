'use client';

/*
 * The free rolls of one fabric variant, for a signed-in trade customer to
 * order from. The buyer types the length they need, in meters or yards, and
 * the rolls it comes off are ticked for them (lib/rollPlan.ts); they can
 * still tick, untick or cut any roll by hand. What the stock can't cover
 * goes in the cart as a pre-order line beside the rolls. The rolls come
 * from one country, the one that ships to the buyer best: the ERP is told
 * the visitor's country (lib/visitorCountry), uses the customer's own
 * address first, lists only rolls that may be sent there, and orders the
 * places best first (operating/shipping.py). Each
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
import { metersFor, planRolls, YARD_IN_METERS } from '@/lib/rollPlan';
import { countryName } from '@/lib/countries';
import { visitorCountry } from '@/lib/visitorCountry';
import classes from './StockPicker.module.css';

type Place = { location: string; city: string; country: string };
type Roll = Place & { id: number; available: number; lot: string };
type Stock = {
  tracking: 'item' | 'variant';
  unit: string;
  items: Roll[];
  // Where the goods would go, as the ERP judged it ("" when unknown), and
  // the places best first, each saying whether it may send there.
  ship_to: string;
  locations: (Place & { available: number; ships: boolean })[];
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
  // The length asked for, as typed, and in what.
  const [need, setNeed] = useState('');
  const [needUnit, setNeedUnit] = useState<'m' | 'yd'>('m');
  // The roll list is folded away: most buyers leave the choice to us.
  const [showRolls, setShowRolls] = useState(false);
  // The rolls listed first: the picked ones, as they stood when they were
  // picked or the list was opened. Not re-sorted on each tick, so a roll
  // doesn't jump away from the buyer's cursor.
  const [onTop, setOnTop] = useState<number[]>([]);
  // The country the plan took the rolls from.
  const [planCountry, setPlanCountry] = useState<string | null>(null);

  // Read with the session's own token, never erpFetch: that signs the
  // customer out on a 401, and a stock list that can't be read (no session
  // yet, or a stale one) should just not show.
  const load = useCallback(async () => {
    let data: Stock | null = null;
    if (status === 'authenticated' && erpToken) {
      try {
        const res = await fetch(
          `${API}/operating/api/storefront/stock_items/?sku=${encodeURIComponent(variantSku)}`
          + `&to=${encodeURIComponent(visitorCountry())}`,
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
    setNeed('');
    setShowRolls(false);
    setPlanCountry(null);
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
  // What the summary promises: how many lots (0 when one has none on
  // record) and which places the pieces ship from.
  const chosenLots = chosen.some((r) => !r.lot) ? 0 : new Set(chosen.map((r) => r.lot)).size;
  const chosenPlaces = chosen.filter((r, i) => chosen.findIndex((c) => c.location === r.location) === i);
  const chosenCountries = new Set(chosen.map((r) => r.country)).size;
  // The countries rolls may come from, best first; the plan keeps to one.
  const shipping = (stock?.locations ?? []).filter((p) => p.ships);
  const countries = shipping.map((p) => p.country).filter((c, i, all) => all.indexOf(c) === i);
  const country = planCountry ?? countries[0] ?? '';
  const notSent = (stock?.locations ?? []).filter((p) => !p.ships);

  // Yards only for goods sold by the meter.
  const byMeter = stock?.unit === 'm';
  const asked = metersFor(Number(need), byMeter ? needUnit : 'm');
  // Held where the plan takes from: the place shown, else the plan's country.
  const held = rolls.filter((r) => place || r.country === country).reduce((sum, r) => sum + r.available, 0);
  // What no roll here can give: pre-ordered beside the rolls.
  const preOrder = asked > held ? Math.ceil(asked - held) : 0;

  // Tick the rolls a length comes off, in the place being shown.
  const plan = (value: string, unitNow: 'm' | 'yd', inView: Roll[]) => {
    const meters = metersFor(Number(value), byMeter ? unitNow : 'm');
    const { cuts: planned, country: from } = planRolls(inView, meters, countries);
    setPlanCountry(from);
    setOnTop(Object.keys(planned).map(Number));
    setCuts(Object.fromEntries(Object.entries(planned).map(([id, n]) => {
      const roll = inView.find((r) => r.id === Number(id))!;
      return [id, { meters: n < roll.available ? String(n) : '', editing: false }];
    })));
  };
  const typeNeed = (value: string) => {
    if (value !== '' && !/^\d*[.,]?\d*$/.test(value)) return;
    const clean = value.replace(',', '.');
    setNeed(clean);
    setNotice(null);
    plan(clean, needUnit, rolls);
  };
  // Another place: the length is picked again from its rolls.
  const showPlace = (location: string) => {
    setPlace(location);
    if (need) plan(need, needUnit, (stock?.items ?? []).filter((r) => !location || r.location === location));
  };
  const switchUnit = (next: 'm' | 'yd') => {
    setNeedUnit(next);
    if (need) plan(need, next, rolls);
  };

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
    if (!userId || (chosen.length === 0 && preOrder === 0)) return;
    setAdding(true);
    setNotice(null);
    try {
      const send = (body: object) => erpFetch(`${API}/authentication/api/add_to_cart/${userId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_sku: productSku, variant_sku: variantSku, ...body }),
      });
      // A whole roll is sent without a length: the ERP takes all of it.
      const res = chosen.length
        ? await send({ stock_items: chosen.map((r) => isPart(r) ? { id: r.id, quantity: lengthOf(r) } : { id: r.id }) })
        : null;
      // What the rolls can't cover: a quantity line, which staff buy in.
      const rest = (!res || res.ok) && preOrder > 0 ? await send({ quantity: preOrder }) : null;
      if ((res ?? rest)?.ok && (!rest || rest.ok)) {
        setCuts({});
        setNeed('');
        setNotice({ kind: 'ok', text: preOrder > 0 ? t('addedWithPreOrder', { rest: amount(preOrder) }) : t('added') });
        await onAdded?.();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else if (res?.status === 409) {
        setNotice({ kind: 'warn', text: t('gone') });
      } else if (res?.status === 400) {
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

      <div className={classes.need}>
        <label htmlFor="stock-picker-need" className={classes.needLabel}>{t('need')}</label>
        <div className={classes.needRow}>
          <input id="stock-picker-need" type="text" inputMode="decimal" className={classes.needInput}
            value={need} onChange={(e) => typeNeed(e.target.value)} placeholder="0" />
          {byMeter ? (
            <div className={classes.units} role="group" aria-label={t('needUnit')}>
              {(['m', 'yd'] as const).map((u) => (
                <button key={u} type="button" aria-pressed={needUnit === u}
                  className={`${classes.unitBtn} ${needUnit === u ? classes.unitOn : ''}`}
                  onClick={() => switchUnit(u)}>
                  {t(`unit.${u}`)}
                </button>
              ))}
            </div>
          ) : <span className={classes.cutUnit}>{unit}</span>}
        </div>
        {asked > 0 && byMeter && needUnit === 'yd' && (
          <p className={classes.needNote}>{t('yardsAre', { meters: amount(asked) })}</p>
        )}
        {preOrder > 0 && (
          <p className={classes.needNote}>{t('preOrderRest', { held: amount(held), rest: amount(preOrder) })}</p>
        )}
        {notSent.length > 0 && stock.ship_to && (
          <p className={classes.needNote}>
            {t('notSentTo', { places: notSent.map(placeName).join(', '), country: countryName(stock.ship_to, locale) })}
          </p>
        )}
      </div>

      {chosen.length > 0 && (
        <div className={classes.summary} aria-live="polite">
          <p className={classes.summaryMain}>
            {t('pieces', { count: chosen.length })}
            {chosen.length <= 4 && ` · ${chosen.map((r) => amount(lengthOf(r))).join(' + ')}`}
          </p>
          <p className={classes.summaryLine}>
            {[
              // A roll with no lot recorded can't be promised to match.
              chosenLots === 1 ? t('oneLot') : chosenLots > 1 ? t('severalLots', { count: chosenLots }) : '',
              chosenPlaces.length === 1 ? t('shipsFrom', { place: placeName(chosenPlaces[0]) })
                : t('shipsFromPlaces', { count: chosenPlaces.length }),
            ].filter(Boolean).join(' · ')}
          </p>
          {chosenCountries > 1 && <p className={classes.summaryWarn}>{t('twoCountries')}</p>}
        </div>
      )}

      <button type="button" className={classes.chooseBtn} aria-expanded={showRolls}
        onClick={() => {
          if (!showRolls) setOnTop(chosen.map((r) => r.id));
          setShowRolls((open) => !open);
        }}>
        {showRolls ? t('hideRolls') : t('chooseYourself')}
      </button>

      {showRolls && (<>
      <p className={classes.intro}>{t('rollsHint')}</p>

      {shipping.length > 1 && (
        <div className={classes.places}>
          <button type="button" aria-pressed={!place}
            className={`${classes.place} ${!place ? classes.placeOn : ''}`}
            onClick={() => showPlace('')}>
            {t('allLocations')} · {amount(total)}
          </button>
          {shipping.map((p) => (
            <button key={p.location} type="button" aria-pressed={place === p.location}
              className={`${classes.place} ${place === p.location ? classes.placeOn : ''}`}
              onClick={() => showPlace(p.location)}>
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
        {[...rolls].sort((a, b) => Number(onTop.includes(b.id)) - Number(onTop.includes(a.id))).map((r) => {
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

      </>)}

      <div className={classes.foot}>
        <div>
          {/* The pieces are counted in the summary above; here, the total. */}
          <span className={classes.total}>{amount(chosenTotal)}</span>
          {byMeter && needUnit === 'yd' && chosenTotal > 0 && (
            <span className={classes.count}>{t('inYards', { yards: (chosenTotal / YARD_IN_METERS).toLocaleString(locale, { maximumFractionDigits: 1 }) })}</span>
          )}
          {asked > 0 && chosenTotal + preOrder < asked && (
            <span className={classes.count}>{t('ofAsked', { asked: amount(asked) })}</span>
          )}
        </div>
        <button type="button" className={classes.addBtn} onClick={add}
          disabled={adding || (chosen.length === 0 && preOrder === 0)}>
          {adding ? t('adding') : t('add')}
        </button>
      </div>
      {notice && (
        <p role="status" className={notice.kind === 'ok' ? classes.ok : classes.warn}>{notice.text}</p>
      )}
    </section>
  );
}
