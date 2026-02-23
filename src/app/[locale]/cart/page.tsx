'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowRight, FaBox } from 'react-icons/fa';
import Link from 'next/link';
import classes from './page.module.css';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import GuestCheckoutModal from '@/components/GuestCheckoutModal';

interface CartItem {
  id: number;
  product_sku: string;
  variant_sku: string | null;
  quantity: string;
  product_category?: string;
  variant_attributes?: { [key: string]: string };
  is_custom_curtain?: boolean;
  is_sample?: boolean;
  custom_attributes?: {
    mountingType?: string;
    pleatType?: string;
    pleatDensity?: string;
    width?: string;
    height?: string;
    wingType?: string;
  };
  custom_price?: string | number;
  product?: {
    title: string;
    price: string | number | null;
    primary_image: string;
    category?: string;
  };
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { refreshCart, guestCart, removeFromGuestCart, updateGuestCartQuantity, isGuest } = useCart();
  const { convertPrice } = useCurrency();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number | string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myCart: { en: 'Shopping Cart', tr: 'Alışveriş Sepeti', ru: 'Корзина', pl: 'Koszyk' },
      emptyCart: { en: 'Your cart is empty', tr: 'Sepetiniz boş', ru: 'Ваша корзина пуста', pl: 'Twój koszyk jest pusty' },
      startShopping: { en: 'Start Shopping', tr: 'Alışverişe Başla', ru: 'Начать покупки', pl: 'Zacznij zakupy' },
      continueShopping: { en: 'Continue Shopping', tr: 'Alışverişe Devam Et', ru: 'Продолжить покупки', pl: 'Kontynuuj zakupy' },
      checkout: { en: 'Complete Shopping', tr: 'Alışverişi Tamamla', ru: 'Завершить покупки', pl: 'Zakończ zakupy' },
      quantity: { en: 'Quantity', tr: 'Miktar', ru: 'Количество', pl: 'Ilość' },
      subtotal: { en: 'Subtotal', tr: 'Ara Toplam', ru: 'Промежуточный итог', pl: 'Suma częściowa' },
      total: { en: 'Total', tr: 'Toplam', ru: 'Итого', pl: 'Suma' },
      loading: { en: 'Loading...', tr: 'Yükleniyor...', ru: 'Загрузка...', pl: 'Ładowanie...' },
      items: { en: 'items', tr: 'ürün', ru: 'товаров', pl: 'przedmiotów' },
      orderSummary: { en: 'Order Summary', tr: 'Sipariş Özeti', ru: 'Сводка заказа', pl: 'Podsumowanie zamówienia' },
      sample: { en: 'Sample', tr: 'Numune', ru: 'Образец', pl: 'Próbka' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  // Removed login redirect - guests can now use cart

  // Sayfa visibility değişiminde reload'u engelle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cartItems.length > 0) {
        // Sadece cart count'u güncelle, tüm sayfayı reload etme
        refreshCart();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cartItems, refreshCart]);

  // Load cart based on authentication status
  useEffect(() => {
    if (status === 'loading') return;

    if (isGuest) {
      // For guests, load cart from context (localStorage)
      loadGuestCart();
    } else if (session?.user?.email && isInitialLoad) {
      // For authenticated users, load from API
      loadCart();
      setIsInitialLoad(false);
    }
  }, [session, isInitialLoad, status, isGuest, guestCart]);

  // Helper to determine the correct price for an item
  const getItemPrice = (item: any, productPrice: any, variantPrice: any) => {
    if (item.is_sample) return 0;
    if (item.is_custom_curtain && item.custom_price !== undefined && item.custom_price !== null) {
      return item.custom_price;
    }
    return variantPrice || productPrice || null;
  };

  // Load guest cart items with product details (BATCH)
  const loadGuestCart = async () => {
    if (guestCart.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Single batch request instead of N individual fetches
      const batchPayload = guestCart.map(item => ({
        product_sku: item.product_sku,
        variant_sku: item.variant_sku || null,
      }));

      const batchRes = await fetch('/api/cart/get-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batchPayload }),
      });

      if (batchRes.ok) {
        const batchData = await batchRes.json();
        const batchItems = batchData.items || [];

        const itemsWithDetails = guestCart.map((item, idx) => {
          const detail = batchItems[idx];
          const price = getItemPrice(
            item,
            detail?.product?.price,
            detail?.variant?.variant_price
          );
          return {
            ...item,
            id: item.id as any,
            product_category: detail?.product_category || item.product_category,
            variant_attributes: detail?.variant_attributes || {},
            product: {
              title: detail?.product?.title || item.product_sku,
              price,
              primary_image: detail?.primary_image || detail?.product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
              category: detail?.product_category,
            },
          };
        });
        setCartItems(itemsWithDetails as CartItem[]);
      } else {
        // Fallback: show items with basic info
        setCartItems(guestCart.map(item => ({
          ...item,
          id: item.id as any,
          product: { title: item.product_sku, price: item.is_sample ? 0 : null, primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif' },
        })) as CartItem[]);
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async (forceRefresh = false) => {
    // Eğer veri varsa ve force refresh değilse, tekrar yükleme
    if (cartItems.length > 0 && !forceRefresh) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userId = (session?.user as any)?.id || session?.user?.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        const items = data.cart_items || [];

        // Single batch request instead of N individual fetches
        const batchPayload = items.map((item: CartItem) => ({
          product_sku: item.product_sku,
          variant_sku: item.variant_sku || null,
        }));

        const batchRes = await fetch('/api/cart/get-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: batchPayload }),
        });

        if (batchRes.ok) {
          const batchData = await batchRes.json();
          const batchItems = batchData.items || [];

          const itemsWithDetails = items.map((item: CartItem, idx: number) => {
            const detail = batchItems[idx];
            const price = getItemPrice(
              item,
              detail?.product?.price,
              detail?.variant?.variant_price
            );
            return {
              ...item,
              product_category: detail?.product_category || item.product_category,
              variant_attributes: detail?.variant_attributes || {},
              product: {
                title: detail?.product?.title || item.product_sku,
                price,
                primary_image: detail?.primary_image || detail?.product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                category: detail?.product_category,
              },
            };
          });
          setCartItems(itemsWithDetails);
        } else {
          // Fallback
          setCartItems(items.map((item: CartItem) => ({
            ...item,
            product: { title: item.product_sku, price: null, primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif' },
          })));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number | string, newQuantity: number) => {
    if (newQuantity < 0.1) return;
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      if (isGuest) {
        // For guests, update in context (localStorage)
        updateGuestCartQuantity(String(itemId), newQuantity.toString());
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity.toString() } : item
          )
        );
      } else {
        // For authenticated users, update via API
        const userId = (session?.user as any)?.id || session?.user?.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/update_cart_item/${userId}/${itemId}/`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity.toString() }),
          }
        );

        if (response.ok) {
          setCartItems(prev =>
            prev.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity.toString() } : item
            )
          );
          await refreshCart();
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId: number | string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      if (isGuest) {
        // For guests, remove from context (localStorage)
        removeFromGuestCart(String(itemId));
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        // For authenticated users, remove via API
        const userId = (session?.user as any)?.id || session?.user?.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/remove_from_cart/${userId}/${itemId}/`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          setCartItems(prev => prev.filter(item => item.id !== itemId));
          await refreshCart();
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (isGuest) {
      // Show guest checkout modal
      setShowGuestModal(true);
    } else {
      // For authenticated users, go directly to checkout
      router.push(`/${locale}/checkout`);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      let price = 0;
      if (item.is_sample) {
        price = 0;
      } else if (item.is_custom_curtain && item.custom_price) {
        price = parseFloat(String(item.custom_price));
      } else if (item.product?.price) {
        price = parseFloat(String(item.product.price));
      }
      const quantity = parseFloat(item.quantity);
      return sum + (price * quantity);
    }, 0);
  };

  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return null;
    return convertPrice(numPrice);
  };

  if (status === 'loading' || loading) {
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <h1>
            <FaShoppingCart className={classes.headerIcon} />
            {t('myCart')}
          </h1>
        </div>
        <div className={classes.cartGrid}>
          <div className={classes.cartItems}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={classes.cartItem} style={{ opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ width: 100, height: 100, background: '#f0f0f0', borderRadius: 8 }} />
                <div className={classes.itemDetails}>
                  <div style={{ width: '60%', height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '40%', height: 12, background: '#f0f0f0', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>
          <FaShoppingCart className={classes.headerIcon} />
          {t('myCart')}
        </h1>
        {cartItems.length > 0 && (
          <span className={classes.itemCount}>
            {cartItems.length} {t('items')}
          </span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className={classes.emptyState}>
          <FaBox className={classes.emptyIcon} />
          <h2>{t('emptyCart')}</h2>
          <Link href={`/${locale}/product/fabric`} className={classes.startShoppingBtn}>
            {t('startShopping')}
          </Link>
        </div>
      ) : (
        <div className={classes.cartGrid}>
          <div className={classes.cartItems}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={`${classes.cartItem} ${updatingItems.has(item.id) ? classes.updating : ''}`}
              >
                <Link
                  href={`/${locale}/product/${item.product_category || 'fabric'}/${item.product_sku}`}
                  className={classes.itemImageLink}
                  target="_blank"
                >
                  <div className={classes.itemImage}>
                    <img
                      src={item.product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif'}
                      alt={item.product?.title || item.product_sku}
                      onError={(e) => {
                        e.currentTarget.src = 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif';
                      }}
                    />
                    {/* Custom Curtain Badge on Image */}
                    {item.is_custom_curtain && (
                      <div className={classes.imageBadge}>
                        <span className={classes.imageBadgeText}>
                          {locale === 'tr' ? 'ÖZEL' :
                            locale === 'ru' ? 'ОСОБ' :
                              locale === 'pl' ? 'SPEC' : 'CUSTOM'}
                        </span>
                      </div>
                    )}
                    {/* Sample Badge on Image */}
                    {item.is_sample && (
                      <div className={classes.imageBadge} style={{ background: '#4CAF50' }}>
                        <span className={classes.imageBadgeText}>
                          {t('sample').toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className={classes.itemDetails}>
                  <Link
                    href={`/${locale}/product/${item.product_category || 'fabric'}/${item.product_sku}`}
                    className={classes.itemTitleLink}
                  >
                    <h3>{item.product?.title || item.product_sku}</h3>
                  </Link>

                  {/* Custom Curtain Badge */}
                  {item.is_custom_curtain && (
                    <div className={classes.customCurtainBadge}><span className='text-xl'>✂️ </span>
                      {locale === 'tr' ? 'Özel Perde' :
                        locale === 'ru' ? 'Индивидуальная штора' :
                          locale === 'pl' ? 'Niestandardowa засłона' :
                            'Custom Curtain'}
                    </div>
                  )}

                  {/* Sample Badge */}
                  {item.is_sample && (
                    <div className={classes.customCurtainBadge} style={{ color: '#4CAF50', background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                      <span>🧪 </span>
                      {t('sample')}
                    </div>
                  )}

                  {/* Custom Curtain Attributes */}
                  {item.is_custom_curtain && item.custom_attributes && (
                    <div className={classes.customAttributes}>
                      {item.custom_attributes.width && item.custom_attributes.height && (
                        <span className={classes.customAttr}>
                          <strong>{locale === 'tr' ? 'Boyut' : locale === 'ru' ? 'Размер' : locale === 'pl' ? 'Rozmiar' : 'Size'}:</strong> {item.custom_attributes.width}cm × {item.custom_attributes.height}cm
                        </span>
                      )}
                      {item.custom_attributes.pleatType && (
                        <span className={classes.customAttr}>
                          <strong>{locale === 'tr' ? 'Pile' : locale === 'ru' ? 'Складка' : locale === 'pl' ? 'Fałda' : 'Pleat'}:</strong> {item.custom_attributes.pleatType.replace(/_/g, ' ')}
                        </span>
                      )}
                      {item.custom_attributes.pleatDensity && item.custom_attributes.pleatDensity !== '0' && (
                        <span className={classes.customAttr}>
                          <strong>{locale === 'tr' ? 'Sıklık' : locale === 'ru' ? 'Плотность' : locale === 'pl' ? 'Gęstość' : 'Density'}:</strong> {item.custom_attributes.pleatDensity}
                        </span>
                      )}
                      {item.custom_attributes.wingType && (
                        <span className={classes.customAttr}>
                          <strong>{locale === 'tr' ? 'Kanat' : locale === 'ru' ? 'Крыло' : locale === 'pl' ? 'Skrzydło' : 'Wing'}:</strong> {item.custom_attributes.wingType === 'single' ? (locale === 'tr' ? 'Tek' : locale === 'ru' ? 'Одинарное' : locale === 'pl' ? 'Pojedyncze' : 'Single') : (locale === 'tr' ? 'Çift' : locale === 'ru' ? 'Двойное' : locale === 'pl' ? 'Podwójne' : 'Double')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Variant Attributes */}
                  {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                    <div className={classes.variantAttributes}>
                      {Object.entries(item.variant_attributes).map(([key, value]) => {
                        // Translate common attribute names
                        const attrTranslations: Record<string, Record<string, string>> = {
                          color: { tr: 'Renk', en: 'Color', ru: 'Цвет', pl: 'Kolor' },
                          height: { tr: 'Boy', en: 'Height', ru: 'Высота', pl: 'Wysokość' },
                          size: { tr: 'Boyut', en: 'Size', ru: 'Размер', pl: 'Rozmiar' },
                          width: { tr: 'En', en: 'Width', ru: 'Ширина', pl: 'Szerokość' },
                        };
                        const translatedKey = attrTranslations[key.toLowerCase()]?.[locale] || key;
                        return (
                          <span key={key} className={classes.variantAttr}>
                            <strong>{translatedKey}:</strong> {value.replace(/_/g, ' ')}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className={classes.itemSku}>SKU: {item.product_sku}</p>
                  {item.product?.category && (
                    <p className={classes.itemCategory}>
                      {(() => {
                        const cat = item.product.category.toLowerCase();
                        const categoryTranslations: Record<string, Record<string, string>> = {
                          fabric: { tr: 'KUMAŞ', en: 'FABRIC', ru: 'ТКАНЬ', pl: 'TKANINA' },
                          'ready-made_curtain': { tr: 'HAZIR PERDE', en: 'READY CURTAIN', ru: 'ГОТОВАЯ ШТОРА', pl: 'GOTOWA ZASŁONA' },
                          ready_made_curtain: { tr: 'HAZIR PERDE', en: 'READY CURTAIN', ru: 'ГОТОВАЯ ШТОРА', pl: 'GOTOWA ZASŁONA' },
                        };
                        return categoryTranslations[cat]?.[locale] || item.product.category.toUpperCase();
                      })()}
                    </p>
                  )}
                </div>

                <div className={classes.itemQuantity}>
                  <label>{t('quantity')}</label>
                  <div className={classes.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, parseFloat(item.quantity) - 1)}
                      disabled={updatingItems.has(item.id)}
                      className={classes.quantityBtn}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*\.?\d*$/.test(val) && val !== '') {
                          const num = parseFloat(val);
                          if (!isNaN(num) && num > 0) {
                            updateQuantity(item.id, num);
                          }
                        }
                      }}
                      className={classes.quantityInput}
                      disabled={updatingItems.has(item.id)}
                    />
                    <button
                      onClick={() => updateQuantity(item.id, parseFloat(item.quantity) + 1)}
                      disabled={updatingItems.has(item.id)}
                      className={classes.quantityBtn}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className={classes.itemPrice}>
                  <div className={classes.priceLabel}>
                    {locale === 'tr' ? 'Fiyat' :
                      locale === 'ru' ? 'Цена' :
                        locale === 'pl' ? 'Cena' : 'Price'}
                  </div>
                  <div className={classes.priceValue}>
                    {item.is_sample ? (
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {t('sample')}
                      </span>
                    ) : item.is_custom_curtain && item.custom_price ? (
                      formatPrice(item.custom_price)
                    ) : formatPrice(item.product?.price) ? (
                      formatPrice(item.product?.price)
                    ) : (
                      <span className={classes.contactPrice}>
                        {locale === 'tr' ? 'İletişime Geçin' :
                          locale === 'ru' ? 'Связаться' :
                            locale === 'pl' ? 'Kontakt' : 'Contact'}
                      </span>
                    )}
                  </div>
                </div>

                <div className={classes.itemTotal}>
                  <div className={classes.priceLabel}>
                    {locale === 'tr' ? 'Toplam' :
                      locale === 'ru' ? 'Итого' :
                        locale === 'pl' ? 'Suma' : 'Total'}
                  </div>
                  <div className={classes.priceValue}>
                    {item.is_sample ? (
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {t('sample')}
                      </span>
                    ) : (() => {
                      let price = 0;
                      if (item.is_custom_curtain && item.custom_price) {
                        price = parseFloat(String(item.custom_price));
                      } else if (item.product?.price) {
                        price = parseFloat(String(item.product.price));
                      }
                      return price > 0 ? (
                        formatPrice(price * parseFloat(item.quantity))
                      ) : (
                        <span className={classes.contactPrice}>
                          {locale === 'tr' ? 'İletişime Geçin' :
                            locale === 'ru' ? 'Связаться' :
                              locale === 'pl' ? 'Kontakt' : 'Contact'}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={updatingItems.has(item.id)}
                  className={classes.removeBtn}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className={classes.orderSummary}>
            <h2>{t('orderSummary')}</h2>

            <div className={classes.summaryRow}>
              <span>{t('subtotal')}</span>
              <span className={classes.summaryValue}>
                {formatPrice(subtotal) || '$0.00'}
              </span>
            </div>

            {subtotal === 0 && (
              <div className={classes.summaryNote}>
                {locale === 'tr' ? 'Fiyatlar için lütfen bizimle iletişime geçin' :
                  locale === 'ru' ? 'Пожалуйста, свяжитесь с нами для уточнения цен' :
                    locale === 'pl' ? 'Skontaktuj się z nami w sprawie cen' :
                      'Please contact us for pricing'}
              </div>
            )}

            <div className={classes.summaryDivider}></div>

            <div className={`${classes.summaryRow} ${classes.summaryTotal}`}>
              <span>{t('total')}</span>
              <span className={classes.summaryValue}>
                {formatPrice(subtotal) || '$0.00'}
              </span>
            </div>

            <button onClick={handleCheckout} className={classes.checkoutBtn}>
              {t('checkout')}
              <FaArrowRight />
            </button>

            <Link href={`/${locale}/product/fabric`} className={classes.continueBtn}>
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      )}

      {/* Guest Checkout Modal */}
      <GuestCheckoutModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
      />
    </div>
  );
}
