'use client';

import React from 'react';
import Script from 'next/script';
import classes from './InstagramFeed.module.css';
import { FaInstagram } from 'react-icons/fa';

interface InstagramFeedProps {
    locale: string;
}

export default function InstagramFeed({ locale }: InstagramFeedProps) {
    const translations: Record<string, Record<string, string>> = {
        title: {
            en: 'Follow Us on Instagram',
            tr: 'Instagram\'da Bizi Takip Edin',
            ru: 'Подписывайтесь на нас в Instagram',
            pl: 'Obserwuj nas na Instagramie',
        },
        subtitle: {
            en: 'Discover our latest products, collections and inspirations',
            tr: 'En son ürünlerimizi, koleksiyonlarımızı ve ilham verici tasarımlarımızı keşfedin',
            ru: 'Откройте для себя наши новинки, коллекции и вдохновляющие дизайны',
            pl: 'Odkryj nasze najnowsze produkty, kolekcje i inspirujące projekty',
        },
    };

    const t = (key: string): string => {
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.['en'] || key;
    };

    return (
        <section className={classes.instagramSection}>
            <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />

            <div className={classes.header}>
                <div className={classes.titleWrapper}>
                    <FaInstagram className={classes.instagramIcon} />
                    <h2>{t('title')}</h2>
                </div>
                <p className={classes.subtitle}>{t('subtitle')}</p>
            </div>

            <div
                className="elfsight-app-b52a0d6c-00c3-466c-8e94-bedfd32e5a09"
                data-elfsight-app-lazy
            />
        </section>
    );
}
