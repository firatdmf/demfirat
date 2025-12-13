'use client';

import React from 'react';
import classes from './InstagramFeed.module.css';
import { FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

interface InstagramFeedProps {
    locale: string;
}

const INSTAGRAM_HANDLE = '@karvenhomedecor';
const INSTAGRAM_URL = 'https://www.instagram.com/karvenhomedecor/';

// Placeholder images - Bunları gerçek Instagram post görsellerinizle değiştirebilirsiniz
// Ya da public/media/instagram/ klasörüne Instagram ekran görüntülerini ekleyebilirsiniz
const INSTAGRAM_IMAGES = [
    {
        image: '/media/factory/schiffli-embroidery-3.webp',
        alt: 'Karven Schiffli Embroidery'
    },
    {
        image: '/media/factory/flatboard-embroidery-closeup.webp',
        alt: 'Karven Flatboard Embroidery'
    },
    {
        image: '/media/store/store-5.jpeg',
        alt: 'Karven Store'
    },
    {
        image: '/media/factory/Karven_Tekstil_Factory-Exterior3_edited.webp',
        alt: 'Karven Factory'
    },
    {
        image: '/media/store/demfirat_karven_1_exterior.jpg',
        alt: 'Demfirat Karven Store'
    },
    {
        image: '/media/store/moscow_store_1.jpg',
        alt: 'Karven Moscow Store'
    },
];

export default function InstagramFeed({ locale }: InstagramFeedProps) {
    // Çok dilli metinler
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
        followButton: {
            en: 'Follow Us',
            tr: 'Takip Et',
            ru: 'Подписаться',
            pl: 'Obserwuj',
        },
        viewProfile: {
            en: 'View Instagram Profile',
            tr: 'Instagram Profilini Gör',
            ru: 'Посмотреть профиль Instagram',
            pl: 'Zobacz profil na Instagramie',
        },
    };

    const t = (key: string): string => {
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.['en'] || key;
    };

    return (
        <section className={classes.instagramSection}>
            {/* Section Header */}
            <div className={classes.header}>
                <div className={classes.titleWrapper}>
                    <FaInstagram className={classes.instagramIcon} />
                    <h2>{t('title')}</h2>
                </div>
                <p className={classes.subtitle}>{t('subtitle')}</p>
            </div>

            {/* Instagram Grid */}
            <div className={classes.grid}>
                {INSTAGRAM_IMAGES.map((item, index) => (
                    <Link
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                        className={classes.imageCard}
                    >
                        <div className={classes.imageWrapper}>
                            <img
                                src={item.image}
                                alt={item.alt}
                                className={classes.image}
                            />
                            <div className={classes.overlay}>
                                <FaInstagram className={classes.overlayIcon} />
                                <span>{t('viewProfile')}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Follow Button */}
            <div className={classes.ctaWrapper}>
                <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.followButton}
                >
                    <FaInstagram className={classes.buttonIcon} />
                    <span>{t('followButton')} {INSTAGRAM_HANDLE}</span>
                </a>
            </div>
        </section>
    );
}
