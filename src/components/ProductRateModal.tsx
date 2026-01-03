"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';
import styles from './ProductRateModal.module.css';
import { createPortal } from 'react-dom';

interface ProductRateModalProps {
    isOpen: boolean;
    onClose: () => void;
    productSku: string;
    productTitle: string;
    productImage?: string | null;
    onSuccess?: () => void;
}

export default function ProductRateModal({
    isOpen,
    onClose,
    productSku,
    productTitle,
    productImage,
    onSuccess
}: ProductRateModalProps) {
    const { data: session } = useSession();
    const locale = useLocale();
    const [mounted, setMounted] = useState(false);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset state on open
            setRating(0);
            setComment('');
            setSuccess(false);
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    // Translations
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            rateProduct: { en: 'Rate Product', tr: 'Ürünü Değerlendir', ru: 'Оценить продукт', pl: 'Oceń produkt' },
            yourRating: { en: 'Your Rating', tr: 'Puanınız', ru: 'Ваша оценка', pl: 'Twoja ocena' },
            yourComment: { en: 'Your Comment (Optional)', tr: 'Yorumunuz (İsteğe bağlı)', ru: 'Ваш комментарий', pl: 'Twój komentarz' },
            submit: { en: 'Submit Review', tr: 'Değerlendirmeyi Tamamla', ru: 'Отправить отзыв', pl: 'Dokończ ocenę' },
            submitting: { en: 'Submitting...', tr: 'Gönderiliyor...', ru: 'Отправка...', pl: 'Wysyłanie...' },
            success: { en: 'Review Submitted!', tr: 'Değerlendirme Tamamlandı!', ru: 'Отзыв отправлен!', pl: 'Ocena zakończona!' },
            close: { en: 'Close', tr: 'Kapat', ru: 'Закрыть', pl: 'Zamknij' },
            selectRating: { en: 'Please select a rating', tr: 'Lütfen puan verin', ru: 'Пожалуйста, выберите оценку', pl: 'Proszę wybrać ocenę' },
            error: { en: 'An error occurred', tr: 'Bir hata oluştu', ru: 'Произошла ошибка', pl: 'Wystąpił błąd' },
            placeholder: { en: 'Share your thoughts...', tr: 'Düşüncelerinizi paylaşın...', ru: 'Поделитесь своими мыслями...', pl: 'Podziel się swoimi przemyśleniami...' }
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    const renderStars = () => {
        const stars = [];
        const displayRating = hoverRating || rating;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={styles.star}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i)}
                    style={{
                        color: i <= displayRating ? '#f59e0b' : '#d1d5db',
                        cursor: 'pointer',
                        fontSize: '2rem',
                        transition: 'color 0.2s'
                    }}
                >
                    {i <= displayRating ? <FaStar /> : <FaRegStar />}
                </span>
            );
        }
        return stars;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError(t('selectRating'));
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const userId = (session?.user as any)?.id;
            if (!userId) throw new Error('User not authenticated');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_product_review/${userId}/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product_sku: productSku,
                        rating: rating,
                        comment: comment.trim()
                    })
                }
            );

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.error || t('error'));
            }
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </button>

                {!success ? (
                    <>
                        <div className={styles.header}>
                            <h3>{t('rateProduct')}</h3>
                        </div>

                        <div className={styles.productInfo}>
                            {productImage && (
                                <img src={productImage} alt={productTitle} className={styles.productImage} />
                            )}
                            <span className={styles.productTitle}>{productTitle}</span>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.starsContainer}>
                                {renderStars()}
                            </div>

                            <div className={styles.inputGroup}>
                                <label>{t('yourComment')}</label>
                                <textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder={t('placeholder')}
                                    rows={4}
                                />
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={submitting}
                            >
                                {submitting ? t('submitting') : t('submit')}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <div className={styles.checkmark}>
                            <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                                <circle cx="26" cy="26" r="25" fill="none" className={styles.checkmarkCircle} />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className={styles.checkmarkCheck} />
                            </svg>
                        </div>
                        <h3>{t('success')}</h3>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
