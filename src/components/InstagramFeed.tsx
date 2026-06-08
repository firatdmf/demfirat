'use client';

import React, { useState, useEffect } from 'react';
import classes from './InstagramFeed.module.css';
import { FaInstagram } from 'react-icons/fa';

interface InstagramPost {
    id: string;
    media_url: string;
    permalink: string;
    caption?: string;
    media_type?: string;
    thumbnail_url?: string;
}

interface InstagramFeedProps {
    locale: string;
}

const FALLBACK_POSTS: InstagramPost[] = [
    {
        id: 'fallback-1',
        media_url: '/media/factory/schiffli-embroidery-3.webp',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: 'Dem Fırat - Zarafet Nakışla Buluşuyor'
    },
    {
        id: 'fallback-2',
        media_url: '/media/factory/flatboard-embroidery-closeup.webp',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: 'Kumaşlarımızda titiz işçilik ve zarafet'
    },
    {
        id: 'fallback-3',
        media_url: '/media/factory/Karven_Tekstil_Factory-Exterior3_edited.webp',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: 'Üretim tesisimizden kareler'
    },
    {
        id: 'fallback-4',
        media_url: '/media/factory/schiffli-embroidery-2.webp',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: 'Yeni sezon koleksiyonlarımız'
    },
    {
        id: 'fallback-5',
        media_url: '/media/heimtextile6.jpg',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: 'Ev tekstilinde öncü ve yenilikçi tasarımlar'
    },
    {
        id: 'fallback-6',
        media_url: '/media/young_Cuma_working.webp',
        permalink: 'https://www.instagram.com/karvenhomedecor',
        caption: '1991 yılından beri özenle ve güvenle'
    }
];

export default function InstagramFeed({ locale }: InstagramFeedProps) {
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const translations: Record<string, Record<string, string>> = {
        posts: {
            en: 'Posts',
            tr: 'Gönderi',
            ru: 'Публикации',
            pl: 'Posty',
        },
        followers: {
            en: 'Followers',
            tr: 'Takipçi',
            ru: 'Подписчики',
            pl: 'Obserwujący',
        },
        following: {
            en: 'Following',
            tr: 'Takip',
            ru: 'Подписки',
            pl: 'Obserwowani',
        },
        follow: {
            en: 'Follow',
            tr: 'Takip Et',
            ru: 'Подписаться',
            pl: 'Obserwuj',
        },
        viewPost: {
            en: 'View Post',
            tr: 'Gönderiyi Gör',
            ru: 'Открыть пост',
            pl: 'Zobacz post',
        }
    };

    const t = (key: string): string => {
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.['en'] || key;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/instagram');
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                const result = await response.json();
                const feed = result.data || [];
                if (feed.length > 0) {
                    // Filter out non-image or non-video items, and limit to 6
                    const filteredPosts = feed
                        .filter((post: any) => post.media_url)
                        .slice(0, 6);
                    setPosts(filteredPosts.length > 0 ? filteredPosts : FALLBACK_POSTS);
                } else {
                    setPosts(FALLBACK_POSTS);
                }
            } catch (error) {
                console.warn('Instagram API error, using beautiful local fallback items:', error);
                setPosts(FALLBACK_POSTS);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <section className={classes.instagramSection}>
            {/* Profile Header Card */}
            <div className={classes.profileHeader}>
                <div className={classes.profileLeft}>
                    <div className={classes.avatarWrapper}>
                        <img 
                            src="/media/karvenLogo.webp" 
                            alt="Karven Home"
                            className={classes.profileAvatar}
                            onError={(e) => {
                                // Fallback to PNG if WebP fails
                                (e.target as HTMLImageElement).src = '/media/karvenLogo.png';
                            }}
                        />
                    </div>
                    <div className={classes.profileInfo}>
                        <h3 className={classes.profileName}>Karven Home Curtain Turkey</h3>
                        <span className={classes.profileUsername}>@karvenhomedecor</span>
                    </div>
                </div>
                
                <div className={classes.profileRight}>
                    <div className={classes.stats}>
                        <div className={classes.statItem}>
                            <span className={classes.statNumber}>514</span>
                            <span className={classes.statLabel}>{t('posts')}</span>
                        </div>
                        <div className={classes.statItem}>
                            <span className={classes.statNumber}>1.6K</span>
                            <span className={classes.statLabel}>{t('followers')}</span>
                        </div>
                        <div className={classes.statItem}>
                            <span className={classes.statNumber}>4</span>
                            <span className={classes.statLabel}>{t('following')}</span>
                        </div>
                    </div>
                    
                    <a
                        href="https://www.instagram.com/karvenhomedecor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.followButton}
                    >
                        <FaInstagram className={classes.buttonIcon} />
                        <span>{t('follow')}</span>
                    </a>
                </div>
            </div>

            {/* Grid display of posts */}
            <div className={classes.grid}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <div key={`skeleton-${idx}`} className={classes.skeletonCard} />
                    ))
                ) : (
                    posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.imageCard}
                        >
                            <div className={classes.imageWrapper}>
                                <img
                                    src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                                    alt={post.caption || 'Dem Fırat Instagram Post'}
                                    className={classes.image}
                                    loading="lazy"
                                />
                                <div className={classes.overlay}>
                                    <FaInstagram className={classes.overlayIcon} />
                                    <span>{t('viewPost')}</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </section>
    );
}
