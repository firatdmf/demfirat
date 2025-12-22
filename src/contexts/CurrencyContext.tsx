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
    convertPrice: (priceInUsd: number) => string;
    symbol: string;
    loading: boolean;
    refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState('TRY');
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);

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
                            // Only set currency if we have rates for it, otherwise default to USD
                            const hasCurrencyRate = rates.find(r => r.currency_code === data.settings.currency);
                            if (data.settings.currency === 'USD' || hasCurrencyRate) {
                                setCurrency(data.settings.currency);
                            } else {
                                console.warn(`No rate available for ${data.settings.currency}, defaulting to USD`);
                                setCurrency('USD');
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

        // If rates haven't loaded yet, fallback to USD silently
        if (rates.length === 0) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(priceInUsd);
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

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            rates,
            convertPrice,
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
