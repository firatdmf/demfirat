'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

/*
 * Wraps any account-only page. Shows a graceful "sign in" prompt
 * (rather than a redirect blink) and bounces to /login if a user
 * actively navigates here while signed out.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  useEffect(() => {
    if (ready && !user) {
      router.replace(`${localePrefix}/login`);
    }
  }, [ready, user, router, localePrefix]);

  if (!ready) return null;
  if (!user) {
    return (
      <section className="bel-section">
        <div className="bel-container" style={{ maxWidth: 560, textAlign: 'center', padding: '64px 32px' }}>
          <div className="bel-eyebrow">{t('title')}</div>
          <h1 className="bel-h2" style={{ marginTop: 16 }}>
            {t('loginRequired')}
          </h1>
          <Link href={`${localePrefix}/login`} className="bel-btn-primary lg" style={{ marginTop: 32 }}>
            {t('goToLogin')}
          </Link>
        </div>
      </section>
    );
  }
  return <>{children}</>;
}
