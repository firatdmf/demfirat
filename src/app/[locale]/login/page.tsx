"use client";
import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import classes from './page.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

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
    backToHome: '← Ana Sayfaya Dön',
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
    backToHome: '← Back to Home',
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
    backToHome: '← На главную',
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
    backToHome: '← Powrót do strony głównej',
    invalidCredentials: 'Nieprawidłowa nazwa użytkownika lub hasło',
    errorOccurred: 'Wystąpił błąd. Spróbuj ponownie.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace(`/${locale}`);
    }
  }, [session, status, router, locale]);

  // Show nothing while checking auth status or redirecting
  if (status === 'loading' || (status === 'authenticated' && session)) {
    return (
      <div className={classes.loginContainer}>
        <div className={classes.loadingSpinner}></div>
      </div>
    );
  }

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
        router.push('/');
        router.refresh();
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

  // Handle close - redirect to home page
  const handleClose = () => {
    router.push(`/${locale}`);
  };

  // Handle overlay click (outside the card)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not the card
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={classes.loginContainer} onClick={handleOverlayClick}>
      <div className={classes.loginCard}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={classes.closeButton}
          aria-label="Close"
        >
          ✕
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
            <div className="text-right mt-2">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
              >
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
            {t.noAccount} <Link href={`/${locale}/register`}>{t.signUp}</Link>
          </p>
          <Link href={`/${locale}`} className={classes.backLink}>
            {t.backToHome}
          </Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div className={classes.backgroundPattern}></div>
    </div>
  );
}
