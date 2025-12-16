'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FaUserPlus, FaSignInAlt, FaArrowRight } from 'react-icons/fa';
import styles from './GuestCheckoutModal.module.css';

interface GuestCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GuestCheckoutModal({ isOpen, onClose }: GuestCheckoutModalProps) {
    const locale = useLocale();

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            title: {
                en: 'Continue to Checkout',
                tr: 'Ödemeye Devam Et',
                ru: 'Перейти к оформлению',
                pl: 'Przejdź do kasy'
            },
            subtitle: {
                en: 'Choose how you would like to proceed',
                tr: 'Nasıl devam etmek istediğinizi seçin',
                ru: 'Выберите, как вы хотите продолжить',
                pl: 'Wybierz, jak chcesz kontynuować'
            },
            signUp: {
                en: 'Sign Up',
                tr: 'Üye Ol',
                ru: 'Зарегистрироваться',
                pl: 'Zarejestruj się'
            },
            signUpDesc: {
                en: 'Create an account to save your orders and addresses',
                tr: 'Siparişlerinizi ve adreslerinizi kaydetmek için hesap oluşturun',
                ru: 'Создайте аккаунт для сохранения заказов и адресов',
                pl: 'Utwórz konto, aby zapisać zamówienia i adresy'
            },
            signIn: {
                en: 'Sign In',
                tr: 'Giriş Yap',
                ru: 'Войти',
                pl: 'Zaloguj się'
            },
            signInDesc: {
                en: 'Already have an account? Sign in to access your info',
                tr: 'Zaten hesabınız var mı? Bilgilerinize erişmek için giriş yapın',
                ru: 'Уже есть аккаунт? Войдите для доступа',
                pl: 'Masz już konto? Zaloguj się'
            },
            guestCheckout: {
                en: 'Continue as Guest',
                tr: 'Üye Olmadan Devam Et',
                ru: 'Продолжить как гость',
                pl: 'Kontynuuj jako gość'
            },
            guestCheckoutDesc: {
                en: 'No account needed - just enter your details at checkout',
                tr: 'Hesap gerekmiyor - sadece bilgilerinizi girin',
                ru: 'Аккаунт не нужен - просто введите свои данные',
                pl: 'Bez konta - po prostu wprowadź swoje dane'
            },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <div className={styles.header}>
                    <h2>{t('title')}</h2>
                    <p>{t('subtitle')}</p>
                </div>

                <div className={styles.options}>
                    {/* Sign Up Option */}
                    <Link href={`/${locale}/register?redirect=checkout`} className={styles.optionPrimary}>
                        <div className={styles.optionIcon}>
                            <FaUserPlus />
                        </div>
                        <div className={styles.optionContent}>
                            <h3>{t('signUp')}</h3>
                            <p>{t('signUpDesc')}</p>
                        </div>
                        <FaArrowRight className={styles.arrowIcon} />
                    </Link>

                    {/* Sign In Option */}
                    <Link href={`/${locale}/login?redirect=checkout`} className={styles.optionSecondary}>
                        <div className={styles.optionIcon}>
                            <FaSignInAlt />
                        </div>
                        <div className={styles.optionContent}>
                            <h3>{t('signIn')}</h3>
                            <p>{t('signInDesc')}</p>
                        </div>
                        <FaArrowRight className={styles.arrowIcon} />
                    </Link>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span>{locale === 'tr' ? 'veya' : locale === 'ru' ? 'или' : locale === 'pl' ? 'lub' : 'or'}</span>
                    </div>

                    {/* Guest Checkout Option */}
                    <Link href={`/${locale}/checkout?guest=true`} className={styles.optionGuest}>
                        <span>{t('guestCheckout')}</span>
                        <p>{t('guestCheckoutDesc')}</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
