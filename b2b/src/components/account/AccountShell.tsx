'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePane from './ProfilePane';
import AddressesPane from './AddressesPane';
import OrdersPane from './OrdersPane';
import FavoritesPane from './FavoritesPane';

export type PaneKey = 'profile' | 'addresses' | 'orders' | 'favorites';

const VALID_PANES: PaneKey[] = ['profile', 'addresses', 'orders', 'favorites'];

export default function AccountShell({ initialPane = 'profile' }: { initialPane?: PaneKey }) {
  const t = useTranslations('account');
  const { user, signOut } = useAuth();
  const [pane, setPaneState] = useState<PaneKey>(initialPane);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromHash = window.location.hash.replace('#', '') as PaneKey;
    if (VALID_PANES.includes(fromHash) && fromHash !== pane) {
      setPaneState(fromHash);
    }
    const onHash = () => {
      const h = window.location.hash.replace('#', '') as PaneKey;
      if (VALID_PANES.includes(h)) setPaneState(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPane = (key: PaneKey) => {
    setPaneState(key);
    if (typeof window !== 'undefined') {
      const next = key === 'profile' ? ' ' : `#${key}`;
      window.history.replaceState(null, '', next);
    }
  };

  const accountNum = `BLN-2026-${String(user?.id ?? 3142).padStart(4, '0')}`;
  const firmName = (user?.name || user?.username || 'Yıldız Tekstil A.Ş.').toString();

  const items: { key: PaneKey; num: string; label: string }[] = [
    { key: 'profile',   num: '01', label: t('profile') },
    { key: 'addresses', num: '02', label: t('addresses') },
    { key: 'orders',    num: '03', label: t('orders') },
    { key: 'favorites', num: '04', label: t('favorites') },
  ];

  return (
    <div className="prof-row">
      <aside className="prof-nav">
        <div className="prof-nav-brand">
          <span className="num">{accountNum}</span>
          <span className="firm">{firmName}</span>
        </div>

        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            className={`prof-nav-item ${pane === it.key ? 'on' : ''}`}
            onClick={() => setPane(it.key)}
          >
            <span className="prof-nav-num">{it.num}</span>
            <span className="prof-nav-label">{it.label}</span>
            <span className="prof-nav-arrow">→</span>
          </button>
        ))}

        <button type="button" className="prof-nav-item logout" onClick={signOut}>
          <span className="prof-nav-num">05</span>
          <span className="prof-nav-label">{t('signOut')}</span>
          <span className="prof-nav-arrow">↗</span>
        </button>
      </aside>

      <div className="prof-pane">
        {pane === 'profile' && <ProfilePane />}
        {pane === 'addresses' && <AddressesPane />}
        {pane === 'orders' && <OrdersPane />}
        {pane === 'favorites' && <FavoritesPane />}
      </div>
    </div>
  );
}
