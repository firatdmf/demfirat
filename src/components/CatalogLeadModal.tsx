'use client';

import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import styles from './CatalogLeadModal.module.css';

interface CatalogLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>;
    isLoading: boolean;
    locale?: string;
}

const translations = {
    tr: {
        title: 'Kataloğunuzu İndirin',
        subtitle: 'Bilgilerinizi girin, Karven & Demfirat PDF kataloğunu anında e-posta adresinize gönderelim.',
        name: 'Ad Soyad',
        namePlaceholder: 'Örn: Ayşe Yılmaz',
        phone: 'Telefon Numarası',
        phonePlaceholder: 'Örn: 0555 555 55 55',
        email: 'E-posta Adresi',
        emailPlaceholder: 'Örn: info@ornek.com',
        submit: 'Kataloğu E-postama Gönder',
        sending: 'Gönderiliyor...',
        disclaimer: 'Bilgileriniz kampanya ve bilgilendirme amaçlı kullanılabilir. Dilediğiniz zaman abonelikten çıkabilirsiniz.',
        requiredError: 'Lütfen tüm alanları doldurunuz.',
        emailError: 'Geçerli bir e-posta adresi giriniz.',
        genericError: 'Bir hata oluştu. Lütfen tekrar deneyiniz.',
    },
    en: {
        title: 'Download Your Catalog',
        subtitle: 'Enter your details and we will email you the Karven & Demfirat PDF catalog right away.',
        name: 'Full Name',
        namePlaceholder: 'e.g. Jane Smith',
        phone: 'Phone Number',
        phonePlaceholder: 'e.g. +44 20 7946 0000',
        email: 'Email Address',
        emailPlaceholder: 'e.g. info@example.com',
        submit: 'Email Me the Catalog',
        sending: 'Sending...',
        disclaimer: 'We may use your details to send offers and updates. You can unsubscribe at any time.',
        requiredError: 'Please fill in every field.',
        emailError: 'Please enter a valid email address.',
        genericError: 'Something went wrong. Please try again.',
    },
    ru: {
        title: 'Скачайте каталог',
        subtitle: 'Оставьте свои данные, и мы сразу отправим PDF-каталог Karven & Demfirat на вашу почту.',
        name: 'Имя и фамилия',
        namePlaceholder: 'Напр.: Анна Иванова',
        phone: 'Номер телефона',
        phonePlaceholder: 'Напр.: +7 912 345 67 89',
        email: 'Электронная почта',
        emailPlaceholder: 'Напр.: info@example.com',
        submit: 'Отправить каталог',
        sending: 'Отправка...',
        disclaimer: 'Мы можем использовать ваши данные для рассылки новостей и предложений. Вы можете отписаться в любой момент.',
        requiredError: 'Пожалуйста, заполните все поля.',
        emailError: 'Введите корректный адрес электронной почты.',
        genericError: 'Произошла ошибка. Пожалуйста, попробуйте ещё раз.',
    },
    pl: {
        title: 'Pobierz katalog',
        subtitle: 'Podaj swoje dane, a od razu wyślemy katalog PDF Karven & Demfirat na Twój e-mail.',
        name: 'Imię i nazwisko',
        namePlaceholder: 'Np. Anna Kowalska',
        phone: 'Numer telefonu',
        phonePlaceholder: 'Np. +48 500 000 000',
        email: 'Adres e-mail',
        emailPlaceholder: 'Np. info@przyklad.com',
        submit: 'Wyślij mi katalog',
        sending: 'Wysyłanie...',
        disclaimer: 'Możemy wykorzystać Twoje dane do wysyłki ofert i aktualności. W każdej chwili możesz zrezygnować.',
        requiredError: 'Prosimy wypełnić wszystkie pola.',
        emailError: 'Podaj prawidłowy adres e-mail.',
        genericError: 'Wystąpił błąd. Prosimy spróbować ponownie.',
    },
};

export function CatalogLeadModal({ isOpen, onClose, onSubmit, isLoading, locale = 'tr' }: CatalogLeadModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const t = translations[locale as keyof typeof translations] || translations.en;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError(t.requiredError);
            return;
        }

        if (!email.includes('@')) {
            setError(t.emailError);
            return;
        }

        try {
            await onSubmit({ name, email, phone });
            setName('');
            setEmail('');
            setPhone('');
        } catch (err: any) {
            setError(err.message || t.genericError);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} disabled={isLoading}>×</button>

                <div className={styles.header}>
                    <h2>{t.title}</h2>
                    <p>{t.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">{t.name}</label>
                        <input
                            id="name"
                            type="text"
                            placeholder={t.namePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="phone">{t.phone}</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder={t.phonePlaceholder}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">{t.email}</label>
                        <input
                            id="email"
                            type="email"
                            placeholder={t.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContainer}>
                                {t.sending}
                            </span>
                        ) : (
                            t.submit
                        )}
                    </button>

                    <p className={styles.disclaimer}>
                        {t.disclaimer}
                    </p>
                </form>
            </div>
        </div>
    );
}
