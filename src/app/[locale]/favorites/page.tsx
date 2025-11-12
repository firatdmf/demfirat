'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { FaHeart, FaTimes } from 'react-icons/fa';
import classes from './page.module.css';
import { Product } from '@/lib/interfaces';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/contexts/FavoriteContext';

interface FavoriteItem {
  id: number;
  product_sku: string;
  created_at: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { favorites: favoritesSet, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const pathname = usePathname();
  
  const favorites = Array.from(favoritesSet).map(sku => ({ product_sku: sku, id: 0, created_at: '' }));

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myFavorites: { en: 'My Favorites', tr: 'Favorilerim', ru: 'Мои избранные', pl: 'Moje ulubione' },
      noFavorites: { en: 'You have no favorite items yet', tr: 'Henüz favori ürününüz bulunmuyor', ru: 'У вас пока нет избранных товаров', pl: 'Nie masz jeszcze ulubionych produktów' },
      startShopping: { en: 'Start shopping and add your favorites!', tr: 'Alışverişe başlayın ve favorilerinizi ekleyin!', ru: 'Начните покупки и добавьте избранное!', pl: 'Zacznij zakupy i dodaj ulubione!' },
      loading: { en: 'Loading...', tr: 'Yükleniyor...', ru: 'Загрузка...', pl: 'Ładowanie...' },
      itemCount: { en: 'items', tr: 'ürün', ru: 'товаров', pl: 'produktów' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    const loadProducts = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }

      const skus = favorites.map(fav => fav.product_sku);
      console.log('[FAVORITES] Fetching products for SKUs:', skus);
      await fetchProductDetails(skus);
      setLoading(false);
    };

    loadProducts();
  }, [favoritesSet]);

  const handleRemoveFavorite = async (productSku: string) => {
    if (removingId) return;

    setRemovingId(productSku);

    // Animate out and remove from list
    setTimeout(async () => {
      await toggleFavorite(productSku);
      setProducts(prev => prev.filter(p => p.sku !== productSku));
      setRemovingId(null);
    }, 200);
  };

  const fetchProductDetails = async (skus: string[]) => {
    try {
      // Fetch from different product categories and filter by SKUs
      const categories = ['fabric', 'ready-made_curtain'];
      let allProducts: Product[] = [];

      for (const category of categories) {
        try {
          const url = `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products?product_category=${category}`;
          console.log('[FAVORITES] Fetching from:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.products && Array.isArray(data.products)) {
              allProducts = [...allProducts, ...data.products];
            }
          } else {
            console.error(`Failed to fetch ${category}: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error(`Error fetching products from ${category}:`, err);
        }
      }

      // Filter products by favorite SKUs
      console.log('[FAVORITES] Total products fetched:', allProducts.length);
      const favoriteProducts = allProducts.filter(product => 
        skus.includes(product.sku)
      );

      console.log('[FAVORITES] Filtered favorite products:', favoriteProducts.length);
      console.log('[FAVORITES] Products:', favoriteProducts);
      setProducts(favoriteProducts);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  if (status === 'loading' || loading) {
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
      <div className={classes.header}>
        <h1>{t('myFavorites')}</h1>
        {favorites.length > 0 && (
          <span className={classes.count}>{favorites.length} {t('itemCount')}</span>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className={classes.emptyState}>
          <FaHeart className={classes.icon} />
          <h2>{t('noFavorites')}</h2>
          <p>{t('startShopping')}</p>
        </div>
      ) : (
        <>
          {products.length === 0 && favorites.length > 0 ? (
            <div className={classes.loading}>
              <div className={classes.spinner}></div>
              <p>{t('loading')}</p>
            </div>
          ) : (
            <div className={classes.productsGrid}>
              {products.map((product) => {
                const isRemoving = removingId === product.sku;
                const productCategoryName = pathname.split("/").at(-1);
                
                return (
                  <div
                    key={product.sku}
                    className={`${classes.favoriteCard} ${isRemoving ? classes.removing : ''}`}
                  >
                    <Link
                      href={`/${locale}/product/fabric/${product.sku}#ProductDetailCard`}
                      className={classes.productLink}
                    >
                      <div className={classes.imageWrapper}>
                        <img
                          src={product.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif'}
                          alt={product.title}
                          className={classes.productImage}
                        />
                      </div>
                      <div className={classes.productInfo}>
                        <h3 className={classes.productTitle}>{product.title}</h3>
                        <p className={classes.productSku}>SKU: {product.sku}</p>
                        {product.price && Number(product.price) > 0 && (
                          <span className={classes.productPrice}>
                            {new Intl.NumberFormat(locale, {
                              style: 'currency',
                              currency: 'USD'
                            }).format(Number(product.price))}
                          </span>
                        )}
                      </div>
                    </Link>
                    
                    {/* Remove Overlay */}
                    <button
                      className={classes.removeOverlay}
                      onClick={() => handleRemoveFavorite(product.sku)}
                      disabled={isRemoving}
                      aria-label="Remove from favorites"
                    >
                      <FaTimes className={classes.removeIcon} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
