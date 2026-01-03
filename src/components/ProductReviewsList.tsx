'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';
import styles from './ProductReviewsList.module.css';

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
}

interface ProductReviewsListProps {
    productSku: string;
}

export default function ProductReviewsList({ productSku }: ProductReviewsListProps) {
    const locale = useLocale();

    const [reviews, setReviews] = useState<Review[]>([]);
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

    // Fetch product reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_product_reviews/${productSku}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data.reviews || []);
                    setAverageRating(data.average_rating || 0);
                    setTotalCount(data.total_count || 0);
                }
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
