"use client";
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import classes from './NewsletterPopup.module.css';

interface NewsletterPopupProps {
    locale?: string;
}

const translations = {
    tr: {
        title: 'Bültenimize Abone Olun',
        subtitle: 'İlk siparişinize özel %5 indirim kazanın!',
        discount: '%5',
        emailLabel: 'E-posta Adresiniz',
        emailPlaceholder: 'ornek@email.com',
        phoneLabel: 'Telefon Numaranız',
        phonePlaceholder: '05XX XXX XX XX',
        submitButton: 'İndirim Kodunu Al',
        submitting: 'Gönderiliyor...',
        privacy: 'Bilgileriniz güvende. Spam göndermiyoruz.',
        successTitle: 'Teşekkürler!',
        successMessage: 'İndirim kodunuz e-posta adresinize gönderildi.',
        successNote: 'Lütfen gelen kutunuzu kontrol edin.',
        continueButton: 'Alışverişe Devam Et',
    },
    en: {
        title: 'Subscribe to Our Newsletter',
        subtitle: 'Get an exclusive discount on your first order!',
        discount: '5%',
        emailLabel: 'Your Email',
        emailPlaceholder: 'example@email.com',
        phoneLabel: 'Your Phone Number',
        phonePlaceholder: '+90 5XX XXX XX XX',
        submitButton: 'Get Discount Code',
        submitting: 'Submitting...',
        privacy: 'Your information is safe. We don\'t spam.',
        successTitle: 'Thank You!',
        successMessage: 'Your discount code has been sent to your email.',
        successNote: 'Please check your inbox.',
        continueButton: 'Continue Shopping',
    },
    ru: {
        title: 'Подпишитесь на рассылку',
        subtitle: 'Получите эксклюзивную скидку на первый заказ!',
        discount: '5%',
        emailLabel: 'Ваш Email',
        emailPlaceholder: 'example@email.com',
        phoneLabel: 'Ваш номер телефона',
        phonePlaceholder: '+7 XXX XXX XX XX',
        submitButton: 'Получить код скидки',
        submitting: 'Отправка...',
        privacy: 'Ваши данные в безопасности. Мы не рассылаем спам.',
        successTitle: 'Спасибо!',
        successMessage: 'Код скидки отправлен на вашу почту.',
        successNote: 'Пожалуйста, проверьте входящие.',
        continueButton: 'Продолжить покупки',
    },
    pl: {
        title: 'Zapisz się do newslettera',
        subtitle: 'Odbierz ekskluzywny rabat na pierwsze zamówienie!',
        discount: '5%',
        emailLabel: 'Twój Email',
        emailPlaceholder: 'przyklad@email.com',
        phoneLabel: 'Twój numer telefonu',
        phonePlaceholder: '+48 XXX XXX XXX',
        submitButton: 'Odbierz kod rabatowy',
        submitting: 'Wysyłanie...',
        privacy: 'Twoje dane są bezpieczne. Nie wysyłamy spamu.',
        successTitle: 'Dziękujemy!',
        successMessage: 'Kod rabatowy został wysłany na Twój email.',
        successNote: 'Sprawdź swoją skrzynkę odbiorczą.',
        continueButton: 'Kontynuuj zakupy',
    },
};

export default function NewsletterPopup({ locale = 'tr' }: NewsletterPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    const t = translations[locale as keyof typeof translations] || translations.tr;

    useEffect(() => {
        // Check if popup was already shown (persistent check with 30-day expiry)
        const popupData = localStorage.getItem('newsletterPopup');
        if (popupData) {
            try {
                const data = JSON.parse(popupData);
                const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                if (data.subscribed || (Date.now() - data.timestamp < thirtyDaysMs)) {
                    // Already subscribed or shown within 30 days, don't show
                    return;
                }
            } catch {
                // Invalid data, will show popup
            }
        }

        // Show popup after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Store with timestamp so it won't show again for 30 days
        localStorage.setItem('newsletterPopup', JSON.stringify({
            timestamp: Date.now(),
            subscribed: false
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setDiscountCode(data.code);
                // Mark as subscribed permanently - will never show again
                localStorage.setItem('newsletterPopup', JSON.stringify({
                    timestamp: Date.now(),
                    subscribed: true
                }));
            } else {
                setError(data.error || 'Bir hata oluştu');
            }
        } catch (err) {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={classes.overlay} onClick={handleClose}>
            <div className={classes.popup} onClick={(e) => e.stopPropagation()}>
                <button className={classes.closeButton} onClick={handleClose} aria-label="Kapat">
                    <FaTimes />
                </button>

                {!success ? (
                    <>
                        <div className={classes.header}>
                            <h2>{t.title}</h2>
                            <p className={classes.subtitle}>
                                {t.subtitle}
                            </p>
                        </div>

                        <div className={classes.content}>
                            <form className={classes.form} onSubmit={handleSubmit}>
                                <div className={classes.inputGroup}>
                                    <label>{t.emailLabel}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t.emailPlaceholder}
                                        required
                                    />
                                </div>

                                <div className={classes.inputGroup}>
                                    <label>{t.phoneLabel}</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={t.phonePlaceholder}
                                        required
                                    />
                                </div>

                                {error && <div className={classes.error}>{error}</div>}

                                <button
                                    type="submit"
                                    className={classes.submitButton}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t.submitting : t.submitButton}
                                </button>
                            </form>

                            <p className={classes.privacy}>{t.privacy}</p>
                        </div>
                    </>
                ) : (
                    <div className={classes.successContent}>
                        <div className={classes.successIcon}>✉️</div>
                        <h3>{t.successTitle}</h3>
                        <p>{t.successMessage}</p>
                        <p className={classes.successNote}>{t.successNote}</p>
                        <button className={classes.continueButton} onClick={handleClose}>
                            {t.continueButton}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
