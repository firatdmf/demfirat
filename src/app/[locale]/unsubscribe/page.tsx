'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useLocale } from 'next-intl';

type Lang = 'en' | 'tr' | 'ru' | 'pl';

const text = {
    working: { en: 'Unsubscribing…', tr: 'Abonelikten çıkarılıyor…', ru: 'Отменяем подписку…', pl: 'Wypisywanie…' },
    doneTitle: { en: 'You are unsubscribed', tr: 'Abonelikten çıkıldı', ru: 'Вы отписались', pl: 'Wypisano z listy' },
    doneText: {
        en: 'Your subscription has been cancelled. You will not receive any more emails from us.',
        tr: 'Bülten aboneliğiniz iptal edilmiştir. Artık bizden e-posta almayacaksınız.',
        ru: 'Ваша подписка отменена. Вы больше не будете получать от нас письма.',
        pl: 'Subskrypcja została anulowana. Nie będziesz już otrzymywać od nas wiadomości.',
    },
    errorTitle: { en: 'Something went wrong', tr: 'Bir hata oluştu', ru: 'Что-то пошло не так', pl: 'Coś poszło nie tak' },
    errorText: {
        en: 'We could not cancel the subscription. Please try again later.',
        tr: 'Abonelik iptal edilemedi. Lütfen daha sonra tekrar deneyin.',
        ru: 'Не удалось отменить подписку. Пожалуйста, попробуйте позже.',
        pl: 'Nie udało się anulować subskrypcji. Spróbuj ponownie później.',
    },
    badLink: { en: 'This link is not valid.', tr: 'Geçersiz bağlantı.', ru: 'Ссылка недействительна.', pl: 'Nieprawidłowy link.' },
    home: { en: 'Back to the home page', tr: 'Ana sayfaya dön', ru: 'На главную', pl: 'Wróć na stronę główną' },
    loading: { en: 'Loading…', tr: 'Yükleniyor…', ru: 'Загрузка…', pl: 'Ładowanie…' },
};

// The page answers in the language of its address, like the rest of the site.
function useLang(): Lang {
    const locale = useLocale();
    return locale === 'tr' || locale === 'ru' || locale === 'pl' ? locale : 'en';
}

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const lang = useLang();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-email'>('loading');

    useEffect(() => {
        if (!email) {
            setStatus('no-email');
            return;
        }

        fetch('/api/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
            .then(r => r.json())
            .then(data => {
                setStatus(data.success ? 'success' : 'error');
            })
            .catch(() => setStatus('error'));
    }, [email]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f2ec',
            padding: '2rem',
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                textAlign: 'center',
                maxWidth: '480px',
                width: '100%',
            }}>
                <div style={{
                    fontFamily: "'Jost', 'Montserrat', Arial, sans-serif",
                    fontSize: '28px',
                    fontWeight: 500,
                    color: '#944f05',
                    letterSpacing: '2px',
                    marginBottom: '2rem',
                }}>
                    DEMFIRAT
                </div>

                {status === 'loading' && (
                    <p style={{ color: '#666', fontSize: '1rem' }}>{text.working[lang]}</p>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '60px', height: '60px', background: '#27ae60', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem', color: 'white', fontSize: '1.8rem',
                        }}>
                            &#10003;
                        </div>
                        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                            {text.doneTitle[lang]}
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {text.doneText[lang]}
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', color: '#e74c3c', marginBottom: '0.75rem' }}>
                            {text.errorTitle[lang]}
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            {text.errorText[lang]}
                        </p>
                    </>
                )}

                {status === 'no-email' && (
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>{text.badLink[lang]}</p>
                )}

                <Link href={lang === 'en' ? '/' : `/${lang}`} style={{
                    display: 'inline-block',
                    marginTop: '2rem',
                    padding: '0.75rem 2rem',
                    background: '#944f05',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                }}>
                    {text.home[lang]}
                </Link>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    const lang = useLang();
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{text.loading[lang]}</div>}>
            <UnsubscribeContent />
        </Suspense>
    );
}
