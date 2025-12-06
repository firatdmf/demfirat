'use client';
import Spinner from '@/components/Spinner';
import classes from './page.module.css';
import { useLocale } from 'next-intl';

export default function Loading() {
  const locale = useLocale();

  const loadingText = locale === 'tr' ? 'Ürünler yükleniyor...' :
    locale === 'ru' ? 'Загрузка продуктов...' :
      locale === 'pl' ? 'Ładowanie produktów...' :
        'Loading products...';

  return (
    <div className={classes.loadingContainer}>
      <Spinner />
      <p className={classes.loadingText}>{loadingText}</p>
    </div>
  );
}
