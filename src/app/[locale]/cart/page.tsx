'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import classes from '../account/orders/page.module.css';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myCart: { en: 'My Cart', tr: 'Sepetim', ru: 'Моя корзина', pl: 'Mój koszyk' },
      emptyCart: { en: 'Your cart is empty', tr: 'Sepetiniz boş', ru: 'Ваша корзина пуста', pl: 'Twój koszyk jest pusty' },
      comingSoon: { en: 'Shopping cart system coming soon!', tr: 'Alışveriş sepeti sistemi yakında!', ru: 'Система корзины скоро появится!', pl: 'System koszyka wkrótce!' },
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
        <h1>{t('myCart')}</h1>
        <div className={classes.emptyState}>
          <FaShoppingCart className={classes.icon} />
          <h2>{t('emptyCart')}</h2>
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
