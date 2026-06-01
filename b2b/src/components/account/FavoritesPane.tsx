'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import { accountCache } from '@/lib/account-cache';

let productsCache: Product[] | null = null;

export default function FavoritesPane() {
  const t = useTranslations('account');
  const locale = useLocale();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(() => {
    if (!user || !productsCache) return null;
    const favs = accountCache.favorites(user.id).cached;
    if (!favs) return null;
    const skus = new Set(favs.map((f) => f.product_sku));
    return productsCache.filter((p) => skus.has(p.sku));
  });

  useEffect(() => {
    if (!user) return;
    const favBucket = accountCache.favorites(user.id);
    Promise.all([
      favBucket.fresh,
      productsCache ? Promise.resolve(productsCache) : getProducts().then((all) => { productsCache = all; return all; }),
    ]).then(([favs, all]) => {
      const skus = new Set(favs.map((f) => f.product_sku));
      setProducts(all.filter((p) => skus.has(p.sku)));
    }).catch(() => {});
  }, [user]);

  if (products === null) return <div className="bel-meta">…</div>;

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  return (
    <div>
      <div className="pane-head">
        <span className="pane-num">04</span>
        <h2 className="pane-title">{t('favorites')}</h2>
        <p className="pane-sub">{t('favoritesPaneSub')}</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="bel-meta" style={{ marginBottom: 24 }}>{t('noFavoritesHint')}</p>
          <Link href={`${localePrefix}/products`} className="bel-btn-primary" style={{ textDecoration: 'none' }}>
            {t('exploreProducts')} →
          </Link>
        </div>
      ) : (
        <div className="prod-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
