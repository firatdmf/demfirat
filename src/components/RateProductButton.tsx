"use client";

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { FaStar } from 'react-icons/fa';
import ProductRateModal from './ProductRateModal';

interface RateProductButtonProps {
    productSku: string;
    productTitle: string;
    productImage?: string | null;
    variant?: 'button' | 'icon' | 'text';
    onSuccess?: () => void;
    className?: string;
    itemStatus?: string; // To check if item is delivered/completed if needed
}

export default function RateProductButton({
    productSku,
    productTitle,
    productImage,
    variant = 'button',
    onSuccess,
    className = '',
    itemStatus
}: RateProductButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const locale = useLocale();

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            rate: { en: 'Rate Product', tr: 'Ürünü Değerlendir', ru: 'Оценить', pl: 'Oceń' },
            evaluate: { en: 'Evaluate', tr: 'Değerlendir', ru: 'Оценить', pl: 'Oceń' }
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
        // Optional: Refresh page or UI
    };

    // Only allow rating if status is valid? 
    // User said "Satın adlığım ürünleri değerlendirebiliyorum". 
    // Usually implied delivered, but we'll allow it for any order item for now.

    return (
        <>
            {variant === 'button' && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium px-3 py-1.5 rounded-lg transition-colors text-sm ${className}`}
                >
                    <FaStar className="text-yellow-500" />
                    <span>{t('evaluate')}</span>
                </button>
            )}

            {variant === 'text' && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`text-sm font-medium text-blue-600 hover:underline ${className}`}
                >
                    {t('evaluate')}
                </button>
            )}

            <ProductRateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productSku={productSku}
                productTitle={productTitle}
                productImage={productImage}
                onSuccess={handleSuccess}
            />
        </>
    );
}
