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

  // Load guest cart items with product details
  const loadGuestCart = async () => {
    if (guestCart.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const itemsWithDetails = await Promise.all(
        guestCart.map(async (item) => {
          try {
            // If variant_sku exists, fetch variant details for correct price
            if (item.variant_sku) {
              const variantResponse = await fetch(
                `/api/cart/get-variant?variant_sku=${item.variant_sku}&product_sku=${item.product_sku}`
              );

              if (variantResponse.ok) {
                const variantData = await variantResponse.json();
                const variant = variantData.variant;
                const variantImage = variantData.primary_image;
                const product = variantData.product;

                return {
                  ...item,
                  id: item.id as any,
                  product_category: item.product_category,
                  variant_attributes: variantData.variant_attributes || {},
                  product: {
                    title: product?.title || item.product_sku,
                    price: item.custom_price || variant?.variant_price || product?.price || null,
                    primary_image: variantImage || product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                    category: item.product_category,
                  },
                };
              }
            }

            // No variant or variant fetch failed, get product only
            const productResponse = await fetch(
              `/api/cart/get-product?product_sku=${item.product_sku}`
            );
            if (productResponse.ok) {
              const productData = await productResponse.json();
              const product = productData.product;
              return {
                ...item,
                id: item.id as any,
                product_category: productData.product_category || item.product_category,
                product: {
                  title: product?.title || item.product_sku,
                  price: item.custom_price || product?.price || null,
                  primary_image: product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                  category: productData.product_category,
                },
              };
            }
          } catch (error) {
            console.error(`Error fetching product ${item.product_sku}:`, error);
          }
          return {
            ...item,
            id: item.id as any,
            product: {
              title: item.product_sku,
              price: null,
              primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
            },
          };
        })
      );
      setCartItems(itemsWithDetails as CartItem[]);
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

        const itemsWithDetails = await Promise.all(
          items.map(async (item: CartItem) => {
            try {
              // Eğer variant_sku varsa, varyant resmini çek
              if (item.variant_sku) {
                const variantResponse = await fetch(
                  `/api/cart/get-variant?variant_sku=${item.variant_sku}&product_sku=${item.product_sku}`
                );

                if (variantResponse.ok) {
                  const variantData = await variantResponse.json();
                  const variant = variantData.variant;
                  const variantImage = variantData.primary_image;
                  const variantAttributes = variantData.variant_attributes || {};

                  // Product bilgisini de çek (fiyat ve başlık için)
                  const productResponse = await fetch(
                    `/api/cart/get-product?product_sku=${item.product_sku}`
                  );

                  if (productResponse.ok) {
                    const productData = await productResponse.json();
                    const product = productData.product;

                    return {
                      ...item,
                      product_category: productData.product_category || item.product_category,
                      variant_attributes: variantAttributes,
                      product: {
                        title: product?.title || item.product_sku,
                        price: variant?.variant_price || product?.price || null,
                        primary_image: variantImage || product?.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                        category: productData.product_category,
                      },
                    };
                  }
                }
              }

              // Varyant yoksa veya hata olduysa, normal product fetch
              const productResponse = await fetch(
                `/api/cart/get-product?product_sku=${item.product_sku}`
              );

              if (productResponse.ok && (productResponse.headers.get('content-type') || '').includes('application/json')) {
                const productData = await productResponse.json();
                const product = productData.product;
                if (product) {
                  return {
                    ...item,
                    product_category: productData.product_category || item.product_category,
                    product: {
                      title: product.title || item.product_sku,
                      price: product.price || null,
                      primary_image: product.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                      category: productData.product_category,
                    },
                  };
                }
              }
              // Eğer API başarısız olursa, placeholder kullan
              return {
                ...item,
                product: {
                  title: item.product_sku,
                  price: null,
                  primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                },
              };
            } catch (error) {
              console.error(`Error fetching product ${item.product_sku}:`, error);
              return {
                ...item,
                product: {
                  title: item.product_sku,
                  price: null,
                  primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                },
              };
            }
          })
        );

        setCartItems(itemsWithDetails);
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
      if (item.is_custom_curtain && item.custom_price) {
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
        <div className={classes.loadingContainer}>
          <div className={classes.spinner}></div>
          <p>{t('loading')}</p>
        </div>
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
                      {Object.entries(item.variant_attributes).map(([key, value]) => (
                        <span key={key} className={classes.variantAttr}>
                          <strong>{key}:</strong> {value.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className={classes.itemSku}>SKU: {item.product_sku}</p>
                  {item.product?.category && (
                    <p className={classes.itemCategory}>
                      {item.product.category}
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
                    {item.is_custom_curtain && item.custom_price ? (
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
                    {(() => {
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
