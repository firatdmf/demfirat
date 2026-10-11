'use client';

import { useState } from 'react';
import classes from './page.module.css';

type Lang = 'en' | 'tr' | 'ru' | 'pl';

const text = {
    heading: {
        en: "Don't miss the next post.",
        tr: 'Bir sonraki yazıyı kaçırmayın.',
        ru: 'Не пропустите следующую статью.',
        pl: 'Nie przegap kolejnego wpisu.',
    },
    placeholder: { en: 'Email address', tr: 'E-posta adresi', ru: 'Электронная почта', pl: 'Adres e-mail' },
    button: { en: 'Subscribe', tr: 'Abone ol', ru: 'Подписаться', pl: 'Subskrybuj' },
    note: {
        en: 'No ads. Unsubscribe anytime.',
        tr: 'Reklam yok. İstediğiniz zaman ayrılın.',
        ru: 'Без рекламы. Отписаться можно в любой момент.',
        pl: 'Bez reklam. Wypisz się w każdej chwili.',
    },
    done: {
        en: 'You are subscribed. Thank you!',
        tr: 'Abone oldunuz. Teşekkürler!',
        ru: 'Вы подписаны. Спасибо!',
        pl: 'Subskrypcja aktywna. Dziękujemy!',
    },
    failed: {
        en: 'Something went wrong. Please try again.',
        tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        ru: 'Что-то пошло не так. Попробуйте ещё раз.',
        pl: 'Coś poszło nie tak. Spróbuj ponownie.',
    },
};

// The same list the footer signs people up to, asked for beside the post.
export default function BlogSubscribe({ locale }: { locale: Lang }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || status === 'loading') return;

        setStatus('loading');
        try {
            let recaptchaToken = '';
            const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
            if (siteKey && typeof window !== 'undefined' && (window as any).grecaptcha) {
                try {
                    recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: 'subscribe_blog' });
                } catch (err) {
                    console.warn('reCAPTCHA failed:', err);
                }
            }

            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'footer', recaptchaToken }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setMessage(text.done[locale]);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || text.failed[locale]);
            }
        } catch {
            setStatus('error');
            setMessage(text.failed[locale]);
        }
    };

    return (
        <div className={classes.subscribe}>
            <p className={classes.subscribeHeading}>{text.heading[locale]}</p>
            {status === 'success' ? (
                <p className={classes.subscribeDone} role="status">{message}</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={text.placeholder[locale]}
                        aria-label={text.placeholder[locale]}
                        className={classes.subscribeInput}
                    />
                    <button type="submit" className={classes.subscribeButton} disabled={status === 'loading'}>
                        {text.button[locale]}
                    </button>
                    {status === 'error' && <p className={classes.subscribeError} role="alert">{message}</p>}
                    <p className={classes.subscribeNote}>{text.note[locale]}</p>
                </form>
            )}
        </div>
    );
}
