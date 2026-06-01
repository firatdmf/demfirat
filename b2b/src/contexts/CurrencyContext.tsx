'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/*
 * Currency switching, demfirat-style. Base currency is USD: erp2
 * stores all product prices as USD numbers (same as demfirat) and the
 * site converts to the selected currency client-side. Rates come from
 * Django (USD-based per-currency rates) — switching is instant since
 * only the format step runs, no fetches.
 *
 *   convertPrice(priceUsd)  -> "$ 6.99" / "₺ 316,12" / "€ 5.97" / "₽ 524.13"
 *
 * Caching: rates and the chosen currency live in localStorage so the
 * first paint already has them and there's no flash on reload.
 *
 * NOTE: Once erp2 supports per-product currency selection, replace
 * `priceUsd` with `{value, currency}` and convert through USD only
 * when source ≠ target.
 */

export type CurrencyCode = 'TRY' | 'USD' | 'EUR';

type Rate = { currency_code: string; rate: number };

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  symbol: string;
  convertPrice: (priceUsd: number) => string;
  /** Numeric rate from USD → target currency (1 USD = rate * target). */
  rateOf: (code: CurrencyCode) => number;
  /** Format an amount that's already in `code` currency, without converting. */
  formatIn: (value: number, code: CurrencyCode) => string;
  loading: boolean;
};

const SYMBOLS: Record<CurrencyCode, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

const LOCALES: Record<CurrencyCode, string> = {
  TRY: 'tr-TR',
  USD: 'en-US',
  EUR: 'de-DE',
};

// Sensible offline fallbacks in case the rates fetch fails on first load
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  TRY: 36.0,
  EUR: 0.92,
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

function readInitialRates(): Rate[] {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem('demfirat:rates');
    if (cached) return JSON.parse(cached) as Rate[];
  } catch {}
  return [];
}

function readInitialCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'TRY';
  try {
    const v = localStorage.getItem('demfirat:currency') as CurrencyCode | null;
    if (v && (['TRY', 'USD', 'EUR'] as const).includes(v)) return v;
  } catch {}
  return 'TRY';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readInitialCurrency);
  const [rates, setRates] = useState<Rate[]>(readInitialRates);
  const [loading, setLoading] = useState(() => readInitialRates().length === 0);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('demfirat:currency', c);
    } catch {}
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_NEJUM_API_URL;
    if (!apiUrl) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchRates = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/authentication/api/get_exchange_rates/?t=${Date.now()}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
          setRates(data.rates);
          try {
            localStorage.setItem('demfirat:rates', JSON.stringify(data.rates));
          } catch {}
        }
      } catch {
        // Stay on cached rates / fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRates();
    const id = setInterval(fetchRates, 30 * 60 * 1000); // 30 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const rateOf = (code: string): number => {
    const found = rates.find((r) => r.currency_code === code);
    if (found && found.rate > 0) return found.rate;
    return FALLBACK_RATES[code] ?? 1;
  };

  const convertPrice = (priceUsd: number): string => {
    if (priceUsd == null || isNaN(priceUsd)) priceUsd = 0;
    const value = currency === 'USD' ? priceUsd : priceUsd * rateOf(currency);
    return new Intl.NumberFormat(LOCALES[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatIn = (value: number, code: CurrencyCode): string => {
    const v = value == null || isNaN(value) ? 0 : value;
    return new Intl.NumberFormat(LOCALES[code], {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: SYMBOLS[currency],
        convertPrice,
        rateOf: (c: CurrencyCode) => rateOf(c),
        formatIn,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
