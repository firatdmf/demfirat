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
    convertPrice: (priceInTry: number) => string;
    symbol: string;
    loading: boolean;
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

    // Fetch rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_exchange_rates/`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setRates(data.rates);
                    }
                }
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
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
                            setCurrency(data.settings.currency);
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
    }, [session]);

    const convertPrice = (priceInTry: number): string => {
        if (currency === 'TRY') {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(priceInTry);
        }

        const rateObj = rates.find(r => r.currency_code === currency);
        if (!rateObj || !rateObj.rate) {
            // Fallback if rate not found
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(priceInTry);
        }

        // Rate is "How many TRY is 1 Unit". e.g. 1 USD = 34.50 TRY.
        // So Price in USD = Price in TRY / Rate.
        const convertedPrice = priceInTry / rateObj.rate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(convertedPrice);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            rates,
            convertPrice,
            symbol: symbols[currency] || currency,
            loading
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
