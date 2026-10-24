"use client";
import React, { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import classes from './page.module.css';
import { FcGoogle } from 'react-icons/fc';
import { FaLock, FaEye, FaEyeSlash, FaEnvelope, FaBuilding, FaUserCircle, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';
import CountryPicker from '@/components/CountryPicker';
import PhoneInput from '@/components/PhoneInput';
import { defaultCountry } from '@/lib/visitorCountry';

// The wholesale sign-up form. A business name or a contact name is enough,
// and the email is required (it signs in and verifies the account); the
// phone is optional. No tax number is asked for. `username` is the email,
// so the form doesn't ask for a redundant field.
const translations = {
  tr: {
    title: 'İşletme Hesabı Oluştur',
    subtitle: 'Toptan fiyatlandırma için işletmenizi kaydedin',
    continueWithGoogle: 'Google ile devam et',
    or: 'veya',
    companyName: 'Şirket / İşletme Adı',
    contactName: 'Yetkili Adı Soyadı',
    email: 'E-posta',
    phone: 'Telefon',
    country: 'Ülke',
    password: 'Şifre (en az 6 karakter)',
    nameRequired: 'Şirket adını ya da yetkili adını girin',
    submit: 'Hesap Oluştur',
    submitting: 'Hesap oluşturuluyor...',
    haveAccount: 'Zaten hesabınız var mı?',
    signIn: 'Giriş yapın',
    backToHome: '← Ana Sayfaya Dön',
    successMessage: 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.',
    genericError: 'Kayıt başarısız oldu',
    networkError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  },
  en: {
    title: 'Create Business Account',
    subtitle: 'Register your business for wholesale pricing',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    companyName: 'Company / Business Name',
    contactName: 'Contact Person Name',
    email: 'Email',
    phone: 'Phone',
    country: 'Country',
    password: 'Password (min. 6 characters)',
    nameRequired: 'Enter a business name or a contact name',
    submit: 'Create Account',
    submitting: 'Creating account...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    backToHome: '← Back to Home',
    successMessage: 'Registration successful! Please check your email to verify your account.',
    genericError: 'Registration failed',
    networkError: 'An error occurred. Please try again.',
  },
  ru: {
    title: 'Создать бизнес-аккаунт',
    subtitle: 'Зарегистрируйте компанию для оптовых цен',
    continueWithGoogle: 'Продолжить с Google',
    or: 'или',
    companyName: 'Название компании',
    contactName: 'Контактное лицо',
    email: 'Эл. почта',
    phone: 'Телефон',
    country: 'Страна',
    password: 'Пароль (мин. 6 символов)',
    nameRequired: 'Укажите название компании или контактное лицо',
    submit: 'Создать аккаунт',
    submitting: 'Создание аккаунта...',
    haveAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
    backToHome: '← На главную',
    successMessage: 'Регистрация успешна! Проверьте почту для подтверждения аккаунта.',
    genericError: 'Ошибка регистрации',
    networkError: 'Произошла ошибка. Попробуйте снова.',
  },
  pl: {
    title: 'Utwórz konto firmowe',
    subtitle: 'Zarejestruj firmę, aby uzyskać ceny hurtowe',
    continueWithGoogle: 'Kontynuuj z Google',
    or: 'lub',
    companyName: 'Nazwa firmy',
    contactName: 'Osoba kontaktowa',
    email: 'Email',
    phone: 'Telefon',
    country: 'Kraj',
    password: 'Hasło (min. 6 znaków)',
    nameRequired: 'Enter a business name or a contact name',
    submit: 'Utwórz konto',
    submitting: 'Tworzenie konta...',
    haveAccount: 'Masz już konto?',
    signIn: 'Zaloguj się',
    backToHome: '← Powrót do strony głównej',
    successMessage: 'Rejestracja zakończona! Sprawdź email, aby zweryfikować konto.',
    genericError: 'Rejestracja nie powiodła się',
    networkError: 'Wystąpił błąd. Spróbuj ponownie.',
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });
  // Sign-up starts in the visitor's own country, known only in the browser —
  // so after the first render, to match the page the server sent.
  useEffect(() => {
    setFormData((f) => (f.country ? f : { ...f, country: defaultCountry() }));
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // A business name or a person to talk to — either is enough.
    if (!formData.companyName.trim() && !formData.name.trim()) {
      setError(t.nameRequired);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          // No separate login field — the email doubles as the username.
          username: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          phone: formData.phone,
          country: formData.country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.genericError);
        setLoading(false);
        return;
      }

      setError('');
      alert(t.successMessage);
      router.push(`/${locale}/login`);
    } catch (err) {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className={classes.registerContainer}>
      <div className={classes.registerCard}>
        {/* Logo Section */}
        <div className={classes.logoSection}>
          <span className={classes.logoText}>DEMFIRAT</span>
          <h1 className={classes.title}>{t.title}</h1>
          <p className={classes.subtitle}>{t.subtitle}</p>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaBuilding className={classes.inputIcon} />
              <input
                type="text"
                name="companyName"
                placeholder={t.companyName}
                value={formData.companyName}
                onChange={handleChange}
                className={classes.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaUserCircle className={classes.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder={t.contactName}
                value={formData.name}
                onChange={handleChange}
                className={classes.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              <FaEnvelope className={classes.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder={t.email}
                value={formData.email}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              {/* The calling code's flag stands where the phone icon was. */}
              <PhoneInput
                placeholder={t.phone}
                value={formData.phone}
                onChange={(phone) => setFormData((f) => ({ ...f, phone }))}
                country={formData.country}
                className={classes.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={classes.inputGroup}>
            <div className={classes.inputWrapper}>
              {/* Once a country is chosen, its flag takes the icon's place. */}
              {!formData.country && <FaGlobe className={classes.inputIcon} />}
              <CountryPicker
                placeholder={t.country}
                value={formData.country}
                onChange={(country) => setFormData((f) => ({ ...f, country }))}
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
                name="password"
                placeholder={t.password}
                value={formData.password}
                onChange={handleChange}
                className={classes.input}
                required
                disabled={loading}
                minLength={6}
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
          </div>

          <button
            type="submit"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        {/* Footer */}
        <div className={classes.footer}>
          <p className={classes.loginLink}>
            {t.haveAccount} <Link href={`/${locale}/login`}>{t.signIn}</Link>
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
