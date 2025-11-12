'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import classes from '../account/orders/page.module.css';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myFavorites: { en: 'My Favorites', tr: 'Favorilerim', ru: 'Мои избранные', pl: 'Moje ulubione' },
      noFavorites: { en: 'You have no favorite items yet', tr: 'Henüz favori ürününüz bulunmuyor', ru: 'У вас пока нет избранных товаров', pl: 'Nie masz jeszcze ulubionych produktów' },
      comingSoon: { en: 'Favorites system coming soon!', tr: 'Favori sistemi yakında!', ru: 'Система избранного скоро появится!', pl: 'System ulubionych wkrótce!' },
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
        <h1>{t('myFavorites')}</h1>
        <div className={classes.emptyState}>
          <FaHeart className={classes.icon} />
          <h2>{t('noFavorites')}</h2>
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
