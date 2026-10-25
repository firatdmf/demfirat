"use client";

import React, { useState } from 'react';
import { CatalogLeadModal } from '@/components/CatalogLeadModal';
import { trackKlaviyoCatalogRequest } from '@/lib/klaviyo';
import { recaptchaToken } from '@/lib/recaptcha';
import classes from './CatalogCta.module.css';

interface CatalogCtaProps {
    locale: string;
}

// Closing section of the homepage: the trade visitor has read the page, now ask
// for the lead. Posts to /api/catalog/request, which builds the full curtain
// catalog server-side and mails the PDF — same pipeline as the grid's button.
export default function CatalogCta({ locale }: CatalogCtaProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    const t = {
        eyebrow: {
            tr: 'Fabrikadan Doğrudan Toptan',
            en: 'Mill-Direct Wholesale',
            ru: 'Оптом напрямую с фабрики',
            pl: 'Hurt bezpośrednio z tkalni',
        },
        title: {
            tr: 'Toptan kataloğumuzu isteyin',
            en: 'Request our wholesale catalog',
            ru: 'Запросите наш оптовый каталог',
            pl: 'Zamów nasz katalog hurtowy',
        },
        body: {
            tr: '1991’den beri kendi tesislerimizde dokuyoruz. Tül, fon ve hazır perde koleksiyonumuzun tamamını, ürün ve varyant detaylarıyla birlikte PDF olarak e-postanıza gönderelim.',
            en: 'We have woven in our own mill since 1991. We will email you the full tulle, blackout and ready-made curtain range as a PDF, with product and variant detail.',
            ru: 'Мы ткём на собственной фабрике с 1991 года. Пришлём вам полный ассортимент тюля, штор блэкаут и готовых штор в PDF с деталями по товарам и вариантам.',
            pl: 'Tkamy we własnej tkalni od 1991 roku. Wyślemy e-mailem pełną kolekcję firan, zasłon zaciemniających i gotowych zasłon w PDF, ze szczegółami produktów i wariantów.',
        },
        cta: {
            tr: 'Kataloğu E-posta ile Al',
            en: 'Email Me the Catalog',
            ru: 'Получить каталог по почте',
            pl: 'Wyślij mi katalog',
        },
        sent: {
            tr: 'Katalog e-posta adresinize gönderildi!',
            en: 'The catalog is on its way to your inbox.',
            ru: 'Каталог отправлен на вашу почту!',
            pl: 'Katalog został wysłany na Twój e-mail!',
        },
    };

    const handleSubmit = async (data: { name: string; email: string; phone: string }) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/catalog/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, locale, recaptchaToken: await recaptchaToken('catalog_request') }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Gönderim başarısız oldu.');
            }

            setIsOpen(false);
            trackKlaviyoCatalogRequest(data.email, data.name);
            alert(t.sent[lang]);
        } catch (error: any) {
            console.error('Catalog request error:', error);
            throw error; // Let the modal display it
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={classes.catalogSection}>
            <div className={classes.container}>
                <span className={classes.eyebrow}>{t.eyebrow[lang]}</span>
                <h2 className={classes.title}>{t.title[lang]}</h2>
                <p className={classes.body}>{t.body[lang]}</p>
                <button
                    type="button"
                    className={classes.cta}
                    onClick={() => setIsOpen(true)}
                >
                    {t.cta[lang]}
                </button>
            </div>

            <CatalogLeadModal
                isOpen={isOpen}
                onClose={() => !isLoading && setIsOpen(false)}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                locale={locale}
            />
        </section>
    );
}
