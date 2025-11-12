'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import classes from '../orders/page.module.css';

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myReviews: { en: 'My Reviews', tr: 'Değerlendirmelerim', ru: 'Мои отзывы', pl: 'Moje recenzje' },
      noReviews: { en: 'You have no reviews yet', tr: 'Henüz değerlendirmeniz bulunmuyor', ru: 'У вас пока нет отзывов', pl: 'Nie masz jeszcze recenzji' },
      comingSoon: { en: 'Review system coming soon!', tr: 'Değerlendirme sistemi yakında!', ru: 'Система отзывов скоро появится!', pl: 'System recenzji wkrótce!' },
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
        <h1>{t('myReviews')}</h1>
        <div className={classes.emptyState}>
          <FaStar className={classes.icon} />
          <h2>{t('noReviews')}</h2>
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
