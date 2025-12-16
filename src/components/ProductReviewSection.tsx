'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';
import styles from './ProductReviewSection.module.css';

interface Review {
    id: number;
    rating: number;
    comment: string;
    user_name: string;
    created_at: string;
}

interface ProductReviewSectionProps {
    productSku: string;
    productTitle?: string;
}

export default function ProductReviewSection({ productSku, productTitle }: ProductReviewSectionProps) {
    const { data: session, status } = useSession();
    const locale = useLocale();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Review form state
    const [canReview, setCanReview] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [existingReview, setExistingReview] = useState<Review | null>(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Translations
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            reviews: { en: 'Reviews', tr: 'Değerlendirmeler', ru: 'Отзывы', pl: 'Opinie' },
            noReviews: { en: 'No reviews yet', tr: 'Henüz değerlendirme yok', ru: 'Пока нет отзывов', pl: 'Brak opinii' },
            writeReview: { en: 'Add Review', tr: 'Yorum Ekle', ru: 'Добавить отзыв', pl: 'Dodaj opinię' },
            yourRating: { en: 'Rating', tr: 'Puan', ru: 'Оценка', pl: 'Ocena' },
            yourComment: { en: 'Comment (Optional)', tr: 'Yorum (İsteğe bağlı)', ru: 'Комментарий', pl: 'Komentarz' },
            submit: { en: 'Submit', tr: 'Gönder', ru: 'Отправить', pl: 'Wyślij' },
            submitting: { en: 'Sending...', tr: 'Gönderiliyor...', ru: 'Отправка...', pl: 'Wysyłanie...' },
            loginToReview: { en: 'Log in to review', tr: 'Yorum için giriş yapın', ru: 'Войдите', pl: 'Zaloguj się' },
            mustPurchase: { en: 'Purchase to review', tr: 'Yorum için satın alın', ru: 'Купите для отзыва', pl: 'Kup aby ocenić' },
            alreadyReviewed: { en: 'Already reviewed', tr: 'Zaten değerlendirildi', ru: 'Уже оценено', pl: 'Już ocenione' },
            reviewSuccess: { en: 'Review added!', tr: 'Değerlendirme eklendi!', ru: 'Отзыв добавлен!', pl: 'Opinia dodana!' },
            reviewError: { en: 'Error', tr: 'Hata', ru: 'Ошибка', pl: 'Błąd' },
            selectRating: { en: 'Select rating', tr: 'Puan seçin', ru: 'Выберите оценку', pl: 'Wybierz ocenę' },
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

    // Check if user can review
    useEffect(() => {
        const checkCanReview = async () => {
            if (status !== 'authenticated' || !session?.user) return;

            const userId = (session.user as any)?.id;
            if (!userId) return;

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/can_review_product/${userId}/${productSku}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCanReview(data.can_review);
                    setHasPurchased(data.has_purchased);
                    setHasReviewed(data.has_reviewed);
                    if (data.existing_review) {
                        setExistingReview(data.existing_review);
                    }
                }
            } catch (error) {
                console.error('Error checking review eligibility:', error);
            }
        };

        if (productSku && status === 'authenticated') {
            checkCanReview();
        }
    }, [productSku, session, status]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedRating === 0) {
            setMessage({ type: 'error', text: t('selectRating') });
            return;
        }

        const userId = (session?.user as any)?.id;
        if (!userId) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_product_review/${userId}/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_sku: productSku,
                        rating: selectedRating,
                        comment: comment.trim()
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: t('reviewSuccess') });
                setHasReviewed(true);
                setCanReview(false);
                setSelectedRating(0);
                setComment('');

                // Add new review to list
                const newReview: Review = {
                    id: data.review.id,
                    rating: data.review.rating,
                    comment: data.review.comment,
                    user_name: session?.user?.name || session?.user?.email?.split('@')[0] || 'User',
                    created_at: data.review.created_at
                };
                setReviews(prev => [newReview, ...prev]);
                setTotalCount(prev => prev + 1);

                // Recalculate average
                const newTotal = reviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
                setAverageRating(Math.round((newTotal / (reviews.length + 1)) * 10) / 10);
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: errorData.error || t('reviewError') });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage({ type: 'error', text: t('reviewError') });
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, interactive = false) => {
        const stars = [];
        const displayRating = interactive ? (hoverRating || selectedRating) : rating;

        for (let i = 1; i <= 5; i++) {
            if (interactive) {
                stars.push(
                    <span
                        key={i}
                        className={styles.interactiveStar}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setSelectedRating(i)}
                    >
                        {i <= displayRating ? <FaStar className={styles.filledStar} /> : <FaRegStar className={styles.emptyStar} />}
                    </span>
                );
            } else {
                stars.push(
                    <span key={i}>
                        {i <= rating ? <FaStar className={styles.filledStar} /> : <FaRegStar className={styles.emptyStar} />}
                    </span>
                );
            }
        }
        return stars;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                {t('reviews')} {totalCount > 0 && `(${totalCount})`}
            </h3>

            {/* Average Rating Summary */}
            {totalCount > 0 && (
                <div className={styles.ratingSummary}>
                    <div className={styles.averageRating}>
                        <span className={styles.averageNumber}>{averageRating}</span>
                        <div className={styles.starsContainer}>
                            {renderStars(Math.round(averageRating))}
                        </div>
                    </div>
                    <p className={styles.ratingCount}>
                        {t('basedOn')} {totalCount} {t('reviewsLabel')}
                    </p>
                </div>
            )}

            {/* Review Form */}
            <div className={styles.reviewFormContainer}>
                {status === 'unauthenticated' ? (
                    <p className={styles.infoMessage}>{t('loginToReview')}</p>
                ) : !hasPurchased ? (
                    <p className={styles.infoMessage}>{t('mustPurchase')}</p>
                ) : hasReviewed ? (
                    <p className={styles.successMessage}>{t('alreadyReviewed')}</p>
                ) : canReview ? (
                    <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                        <h4>{t('writeReview')}</h4>

                        <div className={styles.ratingInput}>
                            <label>{t('yourRating')}</label>
                            <div className={styles.starsInput}>
                                {renderStars(0, true)}
                            </div>
                        </div>

                        <div className={styles.commentInput}>
                            <label htmlFor="reviewComment">{t('yourComment')}</label>
                            <textarea
                                id="reviewComment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={locale === 'tr' ? 'Düşüncelerinizi paylaşın...' : 'Share your thoughts...'}
                                rows={4}
                            />
                        </div>

                        {message && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting || selectedRating === 0}
                        >
                            {submitting ? t('submitting') : t('submit')}
                        </button>
                    </form>
                ) : null}
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                    <p className={styles.noReviews}>{t('noReviews')}</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewUser}>
                                    <FaUser className={styles.userIcon} />
                                    <span>{review.user_name}</span>
                                </div>
                                <div className={styles.reviewStars}>
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            {review.comment && (
                                <p className={styles.reviewComment}>{review.comment}</p>
                            )}
                            <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
