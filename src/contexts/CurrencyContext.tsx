'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ExchangeRate {
    currency_code: string;
    rate: number;
}

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    rates: ExchangeRate[];
    /** Convert a USD price to the currently selected currency and format it. */
    convertPrice: (priceInUsd: number) => string;
    /**
     * Format a value from a pre-converted prices dict (returned by the backend).
     * Falls back to convertPrice if prices dict is missing or the key is absent.
     */
    formatPreconvertedPrice: (
        prices: { USD: number; TRY: number; EUR: number; RUB: number; PLN: number } | null | undefined,
        fallbackUsd?: number | null
    ) => string;
    symbol: string;
    loading: boolean;
    refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/** Read saved exchange rates from localStorage synchronously so the first render already has rates. */
function getInitialRates(): ExchangeRate[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('lastExchangeRates');
        if (saved) return JSON.parse(saved) as ExchangeRate[];
    } catch (_) { }
    return [];
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    // Use an initializer function to quickly get the saved currency or default to TRY
    const [currency, setCurrencyState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferredCurrency');
            if (saved) return saved;
        }
        return 'TRY';
    });
    // Seed rates from localStorage immediately to avoid a flash
    const [rates, setRates] = useState<ExchangeRate[]>(getInitialRates);
    // If we already have cached rates we're not really "loading"
    const [loading, setLoading] = useState(() => getInitialRates().length === 0);

    // Currency symbols
    const symbols: { [key: string]: string } = {
        TRY: '₺',
        USD: '$',
        EUR: '€',
        RUB: '₽',
        PLN: 'zł',
    };

    // Fetch rates with retry and fallback to localStorage
    const fetchRates = async (retryCount = 0) => {
        try {
            // Add timestamp to prevent caching
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_exchange_rates/?t=${Date.now()}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.rates && data.rates.length > 0) {
                    setRates(data.rates);
                    // Save to localStorage for fallback
                    try {
                        localStorage.setItem('lastExchangeRates', JSON.stringify(data.rates));
                        localStorage.setItem('lastExchangeRatesTime', Date.now().toString());
                    } catch (e) {
                        console.warn('Could not save rates to localStorage:', e);
                    }
                    console.log('Exchange rates loaded successfully');
                } else {
                    throw new Error('Invalid rate data received');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);

            // Retry once after 2 seconds if first attempt fails
            if (retryCount === 0) {
                console.log('Retrying rate fetch in 2 seconds...');
                setTimeout(() => fetchRates(1), 2000);
            } else {
                // Try to load from localStorage as fallback
                try {
                    const savedRates = localStorage.getItem('lastExchangeRates');
                    if (savedRates) {
                        const parsedRates = JSON.parse(savedRates);
                        setRates(parsedRates);
                        console.log('Loaded exchange rates from localStorage fallback');
                        return;
                    }
                } catch (e) {
                    console.warn('Could not load rates from localStorage:', e);
                }

                console.warn('Failed to fetch rates after retry. Switching to USD.');
                // Force currency to USD on failure
                setCurrency('USD');
                setRates([]); // Clear rates
            }
        } finally {
            setLoading(false);
        }
    };

    // Override setCurrency to also save to localStorage
    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
        try {
            localStorage.setItem('preferredCurrency', newCurrency);
            // Optionally, we could also send an API request here to save it to their profile.
        } catch (e) {
            console.error('Failed to save currency to localStorage', e);
        }
    };

    useEffect(() => {
        fetchRates();

        // Refresh rates every 30 minutes
        const intervalId = setInterval(fetchRates, 30 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Load user preference
    useEffect(() => {
        const loadUserPreference = async () => {
            if (session?.user) {
                try {
                    const userId = (session.user as any).id || session.user.email;
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_web_client_profile/${userId}/`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.settings && data.settings.currency) {
                            // Only apply backend preference if there is NO explicitly saved local preference
                            // This stops tab-focus from resetting the currency back to default.
                            const savedLocal = localStorage.getItem('preferredCurrency');
                            const targetCurrency = savedLocal || data.settings.currency;

                            const hasCurrencyRate = rates.find(r => r.currency_code === targetCurrency);
                            if (targetCurrency === 'USD' || hasCurrencyRate) {
                                setCurrencyState(targetCurrency);
                            } else {
                                console.warn(`No rate available for ${targetCurrency}, defaulting to USD`);
                                setCurrencyState('USD');
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error loading user currency preference", error);
                }
            }
        };

        if (session) {
            loadUserPreference();
        }
    }, [session, rates]);

    const convertPrice = (priceInUsd: number): string => {
        // Always ensure we have a valid price
        if (!priceInUsd || isNaN(priceInUsd) || priceInUsd < 0) {
            priceInUsd = 0;
        }

        // Base currency is USD - always works
        if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceInUsd);
        }

        // If rates haven't loaded yet AND currency isn't USD, return empty so UI shows nothing rather than wrong currency
        if (rates.length === 0) {
            if (currency === 'USD') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceInUsd);
            }
            // Don't flash USD — return empty string, prices will render once rates arrive
            return '';
        }

        // Find rate for target currency
        const targetRateObj = rates.find(r => r.currency_code === currency);

        if (targetRateObj && targetRateObj.rate && targetRateObj.rate > 0) {
            const convertedPrice = priceInUsd * targetRateObj.rate;

            // Format based on currency
            let locale = 'en-US';
            if (currency === 'EUR') locale = 'de-DE';
            if (currency === 'RUB') locale = 'ru-RU';
            if (currency === 'PLN') locale = 'pl-PL';
            if (currency === 'TRY') locale = 'tr-TR';

            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(convertedPrice);
        }

        // CRITICAL FALLBACK: If rate not found or invalid, always show USD price
        console.warn(`Rate not found for ${currency}, displaying price in USD`);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(priceInUsd);
    };

    /**
     * Format a value from a pre-converted prices dict returned by the backend.
     * The backend already did the multiplication – we just pick the right value and format it.
     */
    const formatPreconvertedPrice = (
        prices: { USD: number; TRY: number; EUR: number; RUB: number; PLN: number } | null | undefined,
        fallbackUsd?: number | null
    ): string => {
        const curr = currency as keyof typeof prices;
        const value = prices?.[curr];

        if (value !== null && value !== undefined && !isNaN(Number(value))) {
            const num = Number(value);
            let locale = 'en-US';
            if (currency === 'EUR') locale = 'de-DE';
            if (currency === 'RUB') locale = 'ru-RU';
            if (currency === 'PLN') locale = 'pl-PL';
            if (currency === 'TRY') locale = 'tr-TR';
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(num);
        }

        // Fallback: convert from USD using rates
        if (fallbackUsd != null) {
            return convertPrice(Number(fallbackUsd));
        }

        return '';
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            rates,
            convertPrice,
            formatPreconvertedPrice,
            symbol: symbols[currency] || currency,
            loading,
            refreshRates: fetchRates
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
