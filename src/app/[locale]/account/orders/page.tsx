'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import classes from './page.module.css';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myOrders: { en: 'My Orders', tr: 'Siparişlerim', ru: 'Мои заказы', pl: 'Moje zamówienia' },
      noOrders: { en: 'You have no orders yet', tr: 'Henüz siparişiniz bulunmuyor', ru: 'У вас пока нет заказов', pl: 'Nie masz jeszcze zamówień' },
      comingSoon: { en: 'Order management system coming soon!', tr: 'Sipariş yönetim sistemi yakında!', ru: 'Система управления заказами скоро появится!', pl: 'System zarządzania zamówieniami wkrótce!' },
      loading: { en: 'Loading...', tr: 'Yükleniyor...', ru: 'Загрузка...', pl: 'Ładowanie...' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  if (status === 'loading') {
    return (
      <div className={classes.container}>
        <div className={classes.loading}>
          <div className={classes.spinner}></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <h1>{t('myOrders')}</h1>
        <div className={classes.emptyState}>
          <FaBoxOpen className={classes.icon} />
          <h2>{t('noOrders')}</h2>
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
