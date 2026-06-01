'use client';

/**
 * Auth gate. Wraps protected client subtrees and bounces unauthenticated
 * visitors to /login (preserving where they were headed via ?next=).
 *
 * AuthContext stores the user in localStorage, so we wait for `ready`
 * to flip true before deciding — without that there's a one-tick window
 * where every visitor briefly looks "logged out".
 */

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

type Props = { children: React.ReactNode };

export default function RequireAuth({ children }: Props) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  useEffect(() => {
    if (!ready) return;
    if (user) return;
    const localePrefix = locale === 'tr' ? '' : `/${locale}`;
    const qs = searchParams?.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    router.replace(`${localePrefix}/login?next=${encodeURIComponent(next)}`);
  }, [ready, user, router, pathname, searchParams, locale]);

  if (!ready || !user) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bel-ink-3)',
          fontFamily: 'var(--bel-font-body)',
          fontSize: 13,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {ready ? 'Yönlendiriliyor…' : '…'}
      </div>
    );
  }
  return <>{children}</>;
}
