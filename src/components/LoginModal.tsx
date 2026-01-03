'use client';
import React, { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import classes from './LoginModal.module.css';

// Translations
const translations = {
    tr: {
        welcomeBack: 'Tekrar Hoş Geldiniz',
        signInSubtitle: 'Hesabınıza giriş yapın',
        continueWithGoogle: 'Google ile devam et',
        or: 'veya',
        username: 'Kullanıcı Adı',
        password: 'Şifre',
        forgotPassword: 'Şifremi Unuttum?',
        signingIn: 'Giriş yapılıyor...',
        signIn: 'Giriş Yap',
        noAccount: 'Hesabınız yok mu?',
        signUp: 'Kayıt Ol',
        invalidCredentials: 'Geçersiz kullanıcı adı veya şifre',
        errorOccurred: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
    en: {
        welcomeBack: 'Welcome Back',
        signInSubtitle: 'Sign in to access your account',
        continueWithGoogle: 'Continue with Google',
        or: 'or',
        username: 'Username',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        signingIn: 'Signing in...',
        signIn: 'Sign in',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
        invalidCredentials: 'Invalid username or password',
        errorOccurred: 'An error occurred. Please try again.',
    },
    ru: {
        welcomeBack: 'С возвращением',
        signInSubtitle: 'Войдите в свой аккаунт',
        continueWithGoogle: 'Продолжить с Google',
        or: 'или',
        username: 'Имя пользователя',
        password: 'Пароль',
        forgotPassword: 'Забыли пароль?',
        signingIn: 'Вход...',
        signIn: 'Войти',
        noAccount: 'Нет аккаунта?',
        signUp: 'Зарегистрироваться',
        invalidCredentials: 'Неверное имя пользователя или пароль',
        errorOccurred: 'Произошла ошибка. Попробуйте еще раз.',
    },
    pl: {
        welcomeBack: 'Witaj ponownie',
        signInSubtitle: 'Zaloguj się do swojego konta',
        continueWithGoogle: 'Kontynuuj z Google',
        or: 'lub',
        username: 'Nazwa użytkownika',
        password: 'Hasło',
        forgotPassword: 'Zapomniałeś hasła?',
        signingIn: 'Logowanie...',
        signIn: 'Zaloguj się',
        noAccount: 'Nie masz konta?',
        signUp: 'Zarejestruj się',
        invalidCredentials: 'Nieprawidłowa nazwa użytkownika lub hasło',
        errorOccurred: 'Wystąpił błąd. Spróbuj ponownie.',
    },
};

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const router = useRouter();
    const locale = useLocale();
    const { data: session, status } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Get translations for current locale
    const t = translations[locale as keyof typeof translations] || translations.en;

    // Close modal on successful login
    useEffect(() => {
        if (status === 'authenticated' && session) {
            onClose();
            onSuccess?.();
        }
    }, [session, status, onClose, onSuccess]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle click outside modal
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t.invalidCredentials);
            } else {
                router.refresh();
                onClose();
                onSuccess?.();
            }
        } catch (err) {
            setError(t.errorOccurred);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn('google', { callbackUrl: '/' });
    };

    if (!isOpen) return null;

    return (
        <div className={classes.overlay} onClick={handleOverlayClick}>
            <div className={classes.modal} ref={modalRef}>
                {/* Close Button */}
                <button className={classes.closeButton} onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                {/* Logo Section */}
                <div className={classes.logoSection}>
                    <img
                        src="/media/karvenLogo.webp"
                        alt="Karven Logo"
                        className={classes.logo}
                    />
                    <h1 className={classes.title}>{t.welcomeBack}</h1>
                    <p className={classes.subtitle}>{t.signInSubtitle}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={classes.errorMessage}>
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    className={classes.googleButton}
                    disabled={loading}
                >
                    <FcGoogle className={classes.googleIcon} />
                    <span>{t.continueWithGoogle}</span>
                </button>

                {/* Divider */}
                <div className={classes.divider}>
                    <span>{t.or}</span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit} className={classes.form}>
                    <div className={classes.inputGroup}>
                        <div className={classes.inputWrapper}>
                            <FaUser className={classes.inputIcon} />
                            <input
                                type="text"
                                placeholder={t.username}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={classes.input}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={classes.inputGroup}>
                        <div className={classes.inputWrapper}>
                            <FaLock className={classes.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={classes.input}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={classes.togglePassword}
                                tabIndex={-1}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <div className={classes.forgotLink}>
                            <Link href={`/${locale}/forgot-password`} onClick={onClose}>
                                {t.forgotPassword}
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={classes.submitButton}
                        disabled={loading}
                    >
                        {loading ? t.signingIn : t.signIn}
                    </button>
                </form>

                {/* Footer */}
                <div className={classes.footer}>
                    <p className={classes.registerLink}>
                        {t.noAccount} <Link href={`/${locale}/register`} onClick={onClose}>{t.signUp}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
