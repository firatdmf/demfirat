'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { FaHeadset, FaTimes, FaPaperPlane } from 'react-icons/fa';
import styles from './HelpWidget.module.css';

export default function HelpWidget() {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Translations
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            helpSupport: {
                en: 'Help & Support',
                tr: 'Yardım & Destek',
                ru: 'Помощь',
                pl: 'Pomoc'
            },
            contactUs: {
                en: 'Contact Us',
                tr: 'Bizimle İletişime Geçin',
                ru: 'Свяжитесь с нами',
                pl: 'Skontaktuj się z nami'
            },
            nameSurname: {
                en: 'Full Name',
                tr: 'Ad Soyad',
                ru: 'ФИО',
                pl: 'Imię i nazwisko'
            },
            phone: {
                en: 'Phone',
                tr: 'Telefon',
                ru: 'Телефон',
                pl: 'Telefon'
            },
            yourMessage: {
                en: 'Your Message',
                tr: 'Mesajınız',
                ru: 'Ваше сообщение',
                pl: 'Twoja wiadomość'
            },
            send: {
                en: 'Send Message',
                tr: 'Mesaj Gönder',
                ru: 'Отправить',
                pl: 'Wyślij'
            },
            sending: {
                en: 'Sending...',
                tr: 'Gönderiliyor...',
                ru: 'Отправка...',
                pl: 'Wysyłanie...'
            },
            messageSent: {
                en: 'Message sent successfully!',
                tr: 'Mesajınız gönderildi!',
                ru: 'Сообщение отправлено!',
                pl: 'Wiadomość wysłana!'
            },
            messageError: {
                en: 'Failed to send. Try again.',
                tr: 'Gönderilemedi. Tekrar deneyin.',
                ru: 'Ошибка. Попробуйте снова.',
                pl: 'Błąd. Spróbuj ponownie.'
            },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormMessage(null);

        try {
            // Simulate API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            // TODO: Send to actual API endpoint
            console.log('Help widget form submitted:', formData);

            setFormMessage({ type: 'success', text: t('messageSent') });
            setFormData({ name: '', phone: '', message: '' });

            // Close after success
            setTimeout(() => {
                setIsOpen(false);
                setFormMessage(null);
            }, 2000);
        } catch (error) {
            setFormMessage({ type: 'error', text: t('messageError') });
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={`${styles.floatingButton} ${isOpen ? styles.hidden : ''}`}
                onClick={() => setIsOpen(true)}
                aria-label={t('helpSupport')}
            >
                <FaHeadset className={styles.buttonIcon} />
                <span className={styles.buttonText}>{t('helpSupport')}</span>
            </button>

            {/* Popup Window */}
            {isOpen && (
                <div className={styles.popup}>
                    <div className={styles.popupHeader}>
                        <div className={styles.headerContent}>
                            <FaHeadset className={styles.headerIcon} />
                            <span>{t('contactUs')}</span>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form className={styles.popupForm} onSubmit={handleFormSubmit}>
                        <input
                            type="text"
                            placeholder={t('nameSurname')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={styles.formInput}
                            required
                        />
                        <input
                            type="tel"
                            placeholder={t('phone')}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={styles.formInput}
                            required
                        />
                        <textarea
                            placeholder={t('yourMessage')}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className={styles.formTextarea}
                            rows={3}
                            required
                        />

                        {formMessage && (
                            <div className={`${styles.formMessage} ${styles[formMessage.type]}`}>
                                {formMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? (
                                t('sending')
                            ) : (
                                <>
                                    <FaPaperPlane className={styles.sendIcon} />
                                    {t('send')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
