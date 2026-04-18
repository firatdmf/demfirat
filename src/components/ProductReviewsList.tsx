'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { FaStar, FaRegStar, FaUser, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './ProductReviewsList.module.css';

interface Review {
    id: number | string;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
    images?: string[];
}

interface ProductReviewsListProps {
    productSku: string;
}

export default function ProductReviewsList({ productSku }: ProductReviewsListProps) {
    const locale = useLocale();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

    const openLightbox = useCallback((images: string[], index: number) => {
        setLightbox({ images, index });
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setLightbox(null);
        document.body.style.overflow = '';
    }, []);
    const [averageRating, setAverageRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Translations
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            reviews: { en: 'Reviews', tr: 'Değerlendirmeler', ru: 'Отзывы', pl: 'Opinie' },
            noReviews: { en: 'No reviews yet', tr: 'Henüz değerlendirme yok', ru: 'Пока нет отзывов', pl: 'Brak opinii' },
            basedOn: { en: 'Based on', tr: 'Toplam', ru: 'На основе', pl: 'Na podstawie' },
            reviewsLabel: { en: 'reviews', tr: 'değerlendirme', ru: 'отзывов', pl: 'opinii' },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    // Fetch product reviews (registered + guest)
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Fetch both registered and guest reviews in parallel
                const [regRes, guestRes] = await Promise.allSettled([
                    fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_product_reviews/${productSku}/`),
                    fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_guest_reviews/${productSku}/`),
                ]);

                let allReviews: Review[] = [];

                if (regRes.status === 'fulfilled' && regRes.value.ok) {
                    const data = await regRes.value.json();
                    allReviews = [...(data.reviews || [])];
                }

                if (guestRes.status === 'fulfilled' && guestRes.value.ok) {
                    const guestData = await guestRes.value.json();
                    const guestReviews = (guestData.reviews || []).map((r: any) => ({
                        id: `guest_${r.id}`,
                        rating: r.rating,
                        comment: r.comment,
                        user_name: r.name,
                        created_at: r.created_at,
                        images: r.images || [],
                    }));
                    allReviews = [...allReviews, ...guestReviews];
                }

                // Sort by date descending
                allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setReviews(allReviews);
                if (allReviews.length > 0) {
                    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
                    setAverageRating(Math.round(avg * 10) / 10);
                }
                setTotalCount(allReviews.length);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (productSku) {
            fetchReviews();
        }
    }, [productSku]);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i}>
                {i < rating ? <FaStar className={styles.filledStar} /> : <FaRegStar className={styles.emptyStar} />}
            </span>
        ));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    if (loading) return null;
    if (totalCount === 0) return null;

    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
    reviews.forEach(r => {
        const rounded = Math.round(r.rating);
        if (rounded >= 1 && rounded <= 5) {
            distribution[rounded] = (distribution[rounded] || 0) + 1;
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t('reviews')}</h3>
                <span className={styles.totalCount}>({totalCount})</span>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Side: Summary & Breakdown */}
                <div className={styles.summarySection}>
                    <div className={styles.mainRating}>
                        <span className={styles.bigRating}>{averageRating}</span>
                        <div className={styles.bigStars}>
                            {renderStars(Math.round(averageRating))}
                        </div>
                        <p className={styles.basedOnText}>{t('basedOn')} {totalCount} {t('reviewsLabel')}</p>
                    </div>

                    <div className={styles.distribution}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = distribution[star] || 0;
                            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                            return (
                                <div key={star} className={styles.distributionRow}>
                                    <div className={styles.starLabel}>
                                        <span>{star}</span>
                                        <FaStar className={styles.tinyStar} />
                                    </div>
                                    <div className={styles.barContainer}>
                                        <div className={styles.barFill} style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className={styles.countLabel}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Reviews List */}
                <div className={styles.reviewsList}>
                    {reviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {getInitials(review.user_name)}
                                    </div>
                                    <div className={styles.userMeta}>
                                        <span className={styles.userName}>{review.user_name}</span>
                                        <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                                    </div>
                                </div>
                                <div className={styles.cardRating}>
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                {review.comment && (
                                    <p className={styles.reviewComment}>{review.comment}</p>
                                )}
                                {review.images && review.images.length > 0 && (
                                    <div className={styles.reviewImages}>
                                        {review.images.slice(0, 2).map((img, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={i}
                                                src={img}
                                                alt={`Review photo ${i + 1}`}
                                                className={styles.reviewImage}
                                                onClick={() => openLightbox(review.images!, i)}
                                            />
                                        ))}
                                        {review.images.length > 2 && (
                                            <div
                                                className={styles.morePhotos}
                                                onClick={() => openLightbox(review.images!, 2)}
                                            >
                                                +{review.images.length - 2}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className={styles.lightboxOverlay} onClick={closeLightbox}>
                    <button className={styles.lightboxClose} onClick={closeLightbox}><FaTimes /></button>
                    {lightbox.images.length > 1 && (
                        <>
                            <button
                                className={styles.lightboxPrev}
                                onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null); }}
                            >
                                <FaChevronLeft />
                            </button>
                            <button
                                className={styles.lightboxNext}
                                onClick={(e) => { e.stopPropagation(); setLightbox(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null); }}
                            >
                                <FaChevronRight />
                            </button>
                        </>
                    )}
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightbox.images[lightbox.index]} alt="Review photo" className={styles.lightboxImage} />
                        {lightbox.images.length > 1 && (
                            <div className={styles.lightboxCounter}>{lightbox.index + 1} / {lightbox.images.length}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
