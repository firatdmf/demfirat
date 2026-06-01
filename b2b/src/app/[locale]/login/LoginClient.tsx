'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginClient({ locale }: { locale: 'tr' | 'en' }) {
  const t = useTranslations('login');
  const router = useRouter();
  const { user, ready, signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  // If already signed in, bounce to home
  useEffect(() => {
    if (ready && user) {
      router.replace(`${localePrefix}/`);
    }
  }, [ready, user, router, localePrefix]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const result = await signIn(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace(`${localePrefix}/`);
    } else {
      setError(result.error || t('errInvalid'));
    }
  };

  return (
    <div className="bel-login">
      <div className="login-art">
        <div className="login-art-inner">
          <div className="bel-eyebrow" style={{ color: '#9A9281' }}>
            {t('eyebrow')}
          </div>
          <h1 className="bel-display bel-display-italic" style={{ color: '#FAF8F4', marginTop: 24 }}>
            {t('displayLine1')}
            <br />
            {t('displayLine2')}
          </h1>
          <div className="login-meta">
            <div className="login-num">{t('metaNum')}</div>
            <div className="login-cap">{t('metaCap')}</div>
          </div>
        </div>
      </div>

      <div className="login-form">
        <div className="login-form-inner">
          <a className="login-logo" href={`${localePrefix}/`}>
            DEMFIRAT
          </a>
          <h2 className="bel-h3" style={{ marginTop: 64, marginBottom: 8 }}>
            {t('title')}
          </h2>
          <p className="bel-meta" style={{ marginBottom: 40 }}>
            {t('intro')}
          </p>

          <form onSubmit={onSubmit}>
            <div className="login-field">
              <label>{t('wholesaleId')}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="login-field">
              <label>{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <label className="login-check">
              <input type="checkbox" defaultChecked />
              <span>{t('remember')}</span>
            </label>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="bel-btn-primary lg block" disabled={loading}>
              {loading ? '…' : t('signIn')}
            </button>
            <a className="login-link">{t('forgot')}</a>
          </form>
        </div>
      </div>
    </div>
  );
}
