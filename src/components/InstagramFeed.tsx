'use client';

import React, { useEffect, useState } from 'react';
import classes from './InstagramFeed.module.css';
import { FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

interface InstagramFeedProps {
    locale: string;
}

const INSTAGRAM_HANDLE = '@karvenhomedecor';
const INSTAGRAM_URL = 'https://www.instagram.com/karvenhomedecor/';

// Access Token provided by user
const ACCESS_TOKEN = 'IGAAQsTyGdb71BZAFo0aExRX2V1cTh1T2hMT0J2eXF2V0hEeWIySDVzSDJKOXlYaGs2N09XdmRISHJ4Vk1ObHFuckFfSHVpNVRsS0M1c1d3YV9OVHZANeGNpX2NrTWhGUUw1RGZAIS1VvaXBEOThYaGM5VDB4QjhlbDU2OUtOampXMAZDZD';

interface InstagramMedia {
    id: string;
    media_url: string;
    permalink: string;
    media_type: string;
    thumbnail_url?: string;
    caption?: string;
}

export default function InstagramFeed({ locale }: InstagramFeedProps) {
    const [posts, setPosts] = useState<InstagramMedia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstagramPosts = async () => {
            try {
                // Fetch fields: id, media_type, media_url, permalink, thumbnail_url, caption
                const response = await fetch(
                    `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption&access_token=${ACCESS_TOKEN}&limit=6`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data) {
                        setPosts(data.data);
                    }
                } else {
                    console.error('Failed to fetch Instagram posts:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching Instagram posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstagramPosts();
    }, []);

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
                {loading ? (
                    // Simple loading placeholders
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className={classes.imageCard} style={{ backgroundColor: '#f0f0f0', minHeight: '300px' }}></div>
                    ))
                ) : (
                    posts.map((post) => (
                        <Link
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={post.id}
                            className={classes.imageCard}
                        >
                            <div className={classes.imageWrapper}>
                                <img
                                    src={post.media_type === 'VIDEO' ? (post.thumbnail_url || '') : post.media_url}
                                    alt={post.caption || 'Instagram Post'}
                                    className={classes.image}
                                    loading="lazy"
                                />
                                <div className={classes.overlay}>
                                    <FaInstagram className={classes.overlayIcon} />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Follow Button */}
            <div className={classes.footer}>
                <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.followButton}
                >
                    <FaInstagram />
                    {t('followButton')} {INSTAGRAM_HANDLE}
                </a>
            </div>
        </section>
    );
}
