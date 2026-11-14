/*
 * Which rolls to cut a length from, so a buyer can type "60 m" and see the
 * rolls it will come off before changing any of them (StockPicker).
 *
 * The shop cuts whole meters (or takes a roll whole), so the length asked
 * for is rounded up to a whole meter, and so is what is left to cut after a
 * whole roll of 23.5 m.
 *
 * One country at a time, in the order given — the ERP lists first the
 * countries that ship to the buyer best (operating/shipping.py) — and never
 * mixed: two countries are two shipments through two customs. The first
 * country that holds the length gives it. Within it, rolls are taken:
 *   1. from one lot, wherever it stands — one shade;
 *   2. from one place, as few lots as can be — one shipment;
 *   3. from anywhere in the country, as few lots as can be;
 * and within those, as few pieces as possible: the smallest roll that holds
 * what is still needed is cut, else the longest roll goes whole and the
 * search goes on. A roll with no lot on record is a lot of its own: nobody
 * knows its shade. When no country holds it all, the first country's rolls
 * go whole and the rest is `short`.
 */

export type PlanRoll = { id: number; available: number; lot: string; location: string; country?: string };
export type Plan = { cuts: Record<number, number>; total: number; short: number; country: string };
type Cuts = Record<number, number>;

export const YARD_IN_METERS = 0.9144;

/** Whole meters to cut for a length typed in meters or yards. */
export function metersFor(amount: number, unit: 'm' | 'yd'): number {
  if (!(amount > 0)) return 0;
  const meters = unit === 'yd' ? amount * YARD_IN_METERS : amount;
  // 50 yd is 45.72 m: cut 46, never less than asked. The rounding guard
  // keeps 0.9144 x 100 = 91.44000000000001 from becoming 92.
  return Math.ceil(Math.round(meters * 1e6) / 1e6);
}

const wholeMeters = (n: number) => Math.ceil(Math.round(n * 1e6) / 1e6);
const sum = (rolls: PlanRoll[]) => rolls.reduce((s, r) => s + r.available, 0);
const lotOf = (r: PlanRoll) => r.lot || `\u0000${r.id}`;

function groups(rolls: PlanRoll[], key: (r: PlanRoll) => string): PlanRoll[][] {
  const by = new Map<string, PlanRoll[]>();
  rolls.forEach((r) => by.set(key(r), [...(by.get(key(r)) ?? []), r]));
  return [...by.values()];
}

// Pieces from these rolls, or null when they don't hold `need`.
function fill(rolls: PlanRoll[], need: number): Cuts | null {
  const left = [...rolls];
  const cuts: Cuts = {};
  let still = need;
  while (still > 0 && left.length) {
    const holds = left.filter((r) => r.available >= still).sort((a, b) => a.available - b.available)[0];
    if (holds) {
      cuts[holds.id] = still;
      return cuts;
    }
    const longest = left.sort((a, b) => b.available - a.available).shift()!;
    cuts[longest.id] = longest.available;
    still = wholeMeters(still - longest.available);
  }
  return still > 0 ? null : cuts;
}

// As few lots as can be: the biggest lots go whole until one lot can give
// what is left, and of those the one needing the fewest pieces does.
function fillFewestLots(rolls: PlanRoll[], need: number): Cuts | null {
  const lots = groups(rolls, lotOf).sort((a, b) => sum(b) - sum(a));
  const cuts: Cuts = {};
  let still = need;
  while (lots.length) {
    const last = best(lots.map((lot) => fill(lot, still)), rolls);
    if (last) return { ...cuts, ...last };
    const biggest = lots.shift()!;
    biggest.forEach((r) => { cuts[r.id] = r.available; });
    still = wholeMeters(still - sum(biggest));
  }
  return null;
}

// Fewest lots, then fewest pieces, then fewest places.
function best(plans: (Cuts | null)[], rolls: PlanRoll[]): Cuts | null {
  const byId = new Map(rolls.map((r) => [r.id, r]));
  const count = (cuts: Cuts, key: (r: PlanRoll) => string) =>
    new Set(Object.keys(cuts).map((id) => key(byId.get(Number(id))!))).size;
  const score = (cuts: Cuts) => [count(cuts, lotOf), Object.keys(cuts).length, count(cuts, (r) => r.location)];
  return plans
    .filter((cuts): cuts is Cuts => cuts !== null)
    .sort((a, b) => {
      const [x, y] = [score(a), score(b)];
      return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
    })[0] ?? null;
}

function planIn(rolls: PlanRoll[], need: number): Cuts | null {
  return best(groups(rolls, lotOf).map((lot) => fill(lot, need)), rolls)
    ?? best(groups(rolls, (r) => r.location).map((place) => fillFewestLots(place, need)), rolls)
    ?? fillFewestLots(rolls, need);
}

/** The countries of `rolls`, in the order they are listed. */
export function countriesOf(rolls: PlanRoll[]): string[] {
  return [...new Set(rolls.map((r) => r.country ?? ''))];
}

export function planRolls(rolls: PlanRoll[], need: number, countries?: string[]): Plan {
  const total = (cuts: Cuts) => Object.values(cuts).reduce((s, n) => s + n, 0);
  const order = [...(countries ?? []), ...countriesOf(rolls)].filter((c, i, all) => all.indexOf(c) === i);
  const inCountry = (country: string) => rolls.filter((r) => (r.country ?? '') === country);
  const first = order.find((c) => inCountry(c).length) ?? '';
  if (!(need > 0) || rolls.length === 0) return { cuts: {}, total: 0, short: Math.max(need, 0), country: first };

  for (const country of order) {
    const cuts = inCountry(country).length ? planIn(inCountry(country), need) : null;
    if (cuts) return { cuts, total: total(cuts), short: 0, country };
  }
  // No one country holds it: the first one's rolls, whole, and the rest is short.
  const all = Object.fromEntries(inCountry(first).map((r) => [r.id, r.available]));
  const held = total(all);
  return { cuts: all, total: held, short: Math.max(0, Math.ceil(need - held)), country: first };
}
