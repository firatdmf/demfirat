'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaCreditCard, FaMapMarkerAlt, FaUser, FaCheck, FaPhone, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import classes from './page.module.css';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  id: number;
  product_sku: string;
  variant_sku: string | null;
  quantity: string;
  product_category?: string;
  variant_attributes?: { [key: string]: string };
  product?: {
    title: string;
    price: string | number | null;
    primary_image: string;
    category?: string;
  };
}

interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Horizontal scroll drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    title: '',
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Turkey',
  });

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      checkout: { en: 'Checkout', tr: 'Ödeme', ru: 'Оформление заказа', pl: 'Zamówienie' },
      completeOrder: { en: 'Complete Order', tr: 'Siparişi Tamamla', ru: 'Завершить заказ', pl: 'Zakończ zamówienie' },
      orderSummary: { en: 'Order Summary', tr: 'Sipariş Özeti', ru: 'Сводка заказа', pl: 'Podsumowanie zamówienia' },
      deliveryAddress: { en: 'Delivery Address', tr: 'Teslimat Adresi', ru: 'Адрес доставки', pl: 'Adres dostawy' },
      billingAddress: { en: 'Billing Address', tr: 'Fatura Adresi', ru: 'Адрес выставления счета', pl: 'Adres rozliczeniowy' },
      sameAsDeliveryAddress: { en: 'Same as delivery address', tr: 'Teslimat adresi ile aynı', ru: 'Совпадает с адресом доставки', pl: 'Taki sam jak adres dostawy' },
      paymentMethod: { en: 'Payment Method', tr: 'Ödeme Yöntemi', ru: 'Способ оплаты', pl: 'Metoda płatności' },
      creditCard: { en: 'Credit/Debit Card', tr: 'Kredi/Banka Kartı', ru: 'Кредитная карта', pl: 'Karta kredytowa' },
      bankTransfer: { en: 'Bank Transfer', tr: 'Havale/EFT', ru: 'Банковский перевод', pl: 'Przelew bankowy' },
      addNewAddress: { en: 'Add New Address', tr: 'Yeni Adres Ekle', ru: 'Добавить адрес', pl: 'Dodaj adres' },
      productsInCart: { en: 'Products in Cart', tr: 'Sepetteki Ürünler', ru: 'Товары в корзине', pl: 'Produkty w koszyku' },
      showProducts: { en: 'Show Products', tr: 'Ürünleri Göster', ru: 'Показать товары', pl: 'Pokaż produkty' },
      hideProducts: { en: 'Hide Products', tr: 'Ürünleri Gizle', ru: 'Скрыть товары', pl: 'Ukryj produkty' },
      subtotal: { en: 'Subtotal', tr: 'Ara Toplam', ru: 'Промежуточный итог', pl: 'Suma częściowa' },
      shipping: { en: 'Shipping', tr: 'Kargo', ru: 'Доставка', pl: 'Wysyłka' },
      total: { en: 'Total', tr: 'Toplam', ru: 'Итого', pl: 'Suma' },
      free: { en: 'Free', tr: 'Ücretsiz', ru: 'Бесплатно', pl: 'Bezpłatnie' },
      quantity: { en: 'Qty', tr: 'Adet', ru: 'Кол-во', pl: 'Ilość' },
      selectAddress: { en: 'Select an address', tr: 'Bir adres seçin', ru: 'Выберите адрес', pl: 'Wybierz adres' },
      addressTitle: { en: 'Address Title', tr: 'Adres Başlığı', ru: 'Название адреса', pl: 'Nazwa adresu' },
      fullName: { en: 'Full Name', tr: 'Ad Soyad', ru: 'Полное имя', pl: 'Imię i nazwisko' },
      phone: { en: 'Phone', tr: 'Telefon', ru: 'Телефон', pl: 'Telefon' },
      addressLine: { en: 'Address', tr: 'Adres', ru: 'Адрес', pl: 'Adres' },
      city: { en: 'City', tr: 'Şehir', ru: 'Город', pl: 'Miasto' },
      state: { en: 'State/Province', tr: 'İl/Bölge', ru: 'Штат/Провинция', pl: 'Stan/Województwo' },
      postalCode: { en: 'Postal Code', tr: 'Posta Kodu', ru: 'Почтовый индекс', pl: 'Kod pocztowy' },
      save: { en: 'Save', tr: 'Kaydet', ru: 'Сохранить', pl: 'Zapisz' },
      cancel: { en: 'Cancel', tr: 'İptal', ru: 'Отмена', pl: 'Anuluj' },
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
    if (session?.user?.email && isInitialLoad) {
      loadCheckoutData();
      setIsInitialLoad(false);
    }
  }, [session, isInitialLoad]);

  // Sayfa visibility değişiminde reload'u engelle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && cartItems.length > 0) {
        // Sayfa görünür olduğunda hiçbir şey yapma
        // Sadece gerektiğinde manuel refresh
        console.log('[Checkout] Page visible, no auto-reload');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cartItems]);

  const loadCheckoutData = async (forceRefresh = false) => {
    // Eğer veri varsa ve force refresh değilse, tekrar yükleme
    if (cartItems.length > 0 && addresses.length > 0 && !forceRefresh) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userId = (session?.user as any)?.id || session?.user?.email;

      // Load cart items - Bu da proxy yapılabilir ama şimdilik direkt çağır
      // TODO: Create /api/cart/get-items proxy route
      const cartResponse = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
      );

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const items = cartData.cart_items || [];

        // Fetch product details for each item
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

              if (productResponse.ok) {
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
              return {
                ...item,
                product: {
                  title: item.product_sku,
                  price: null,
                  primary_image: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif',
                },
              };
            } catch (error) {
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

      // Load user profile (includes addresses)
      try {
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_web_client_profile/${userId}/`
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Get user phone from web_client
          const userPhone = profileData.web_client?.phone || profileData.phone || '';
          
          // Extract addresses from profile and add phone to each
          if (profileData.addresses && Array.isArray(profileData.addresses)) {
            const userAddresses = profileData.addresses.map((addr: any) => ({
              ...addr,
              phone: userPhone // Add user's phone to each address
            }));
            setAddresses(userAddresses);

            // Set default addresses
            const defaultAddress = userAddresses.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
              setSelectedDeliveryAddressId(defaultAddress.id);
              setSelectedBillingAddressId(defaultAddress.id);
            } else if (userAddresses.length > 0) {
              setSelectedDeliveryAddressId(userAddresses[0].id);
              setSelectedBillingAddressId(userAddresses[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile/addresses:', error);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price ? parseFloat(String(item.product.price)) : 0;
      const quantity = parseFloat(item.quantity);
      return sum + (price * quantity);
    }, 0);
  };

  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return null;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const handleCompleteOrder = async () => {
    if (!selectedDeliveryAddressId) {
      alert(t('selectAddress'));
      return;
    }
    if (!sameAsDelivery && !selectedBillingAddressId) {
      alert(t('selectAddress'));
      return;
    }

    setProcessingOrder(true);
    try {
      // TODO: Implement order creation API call
      // const response = await fetch('/api/orders/create', { method: 'POST', body: ... });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to order confirmation page
      router.push(`/${locale}/order/confirmation`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Order creation failed');
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleAddNewAddress = async () => {
    // TODO: Implement add address API call
    console.log('New address:', newAddress);
    setShowNewAddressForm(false);
    // Reload addresses
    loadCheckoutData();
  };

  // Mouse drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    // Sol mouse button kontrolü (button === 0)
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    // Prevent text selection while dragging
    e.preventDefault();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Sadece drag yapılıyorsa hareket et
    if (!isDragging) return;
    if (!scrollContainerRef.current) return;
    
    e.preventDefault();
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth scrolling
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!scrollContainerRef.current) return;
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 0.7;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={classes.container}>
        <div className={classes.loadingContainer}>
          <div className={classes.spinner}></div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>
          <FaShoppingCart className={classes.headerIcon} />
          {t('checkout')}
        </h1>
      </div>

      <div className={classes.checkoutGrid}>
        {/* Left Column - Forms */}
        <div className={classes.leftColumn}>
          {/* Cart Items Section - Collapsible */}
          <div className={classes.section}>
            <div 
              className={classes.cartSectionHeader}
              onClick={() => setIsCartExpanded(!isCartExpanded)}
            >
              <div className={classes.cartHeaderLeft}>
                <FaShoppingCart className={classes.sectionIcon} />
                <h2>{t('productsInCart')} ({cartItems.length})</h2>
              </div>
              <button className={classes.expandBtn}>
                {isCartExpanded ? (
                  <span>▲</span>
                ) : (
                  <span>▼</span>
                )}
              </button>
            </div>

            {isCartExpanded && (
              <div 
                ref={scrollContainerRef}
                className={classes.horizontalCartScroll}
                data-dragging={isDragging}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {cartItems.map((item) => (
                  <div key={item.id} className={classes.horizontalCartItem}>
                    <div className={classes.horizontalItemImageWrapper}>
                      <img
                        src={item.product?.primary_image || ''}
                        alt={item.product?.title || ''}
                        className={classes.horizontalItemImage}
                        onError={(e) => {
                          e.currentTarget.src = 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif';
                        }}
                      />
                      <div className={classes.horizontalItemQuantity}>
                        x{item.quantity}
                      </div>
                    </div>
                    <div className={classes.horizontalItemInfo}>
                      <div className={classes.horizontalItemTitle}>
                        {item.product?.title || item.product_sku}
                      </div>
                      <div className={classes.horizontalItemPrice}>
                        {formatPrice(item.product?.price) || (
                          <span className={classes.contactForPrice}>
                            {locale === 'tr' ? 'İletişim' : 'Contact'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Delivery Address Section */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaMapMarkerAlt className={classes.sectionIcon} />
              <h2>{t('deliveryAddress')}</h2>
            </div>

            <div className={classes.addressList}>
              {addresses.length === 0 ? (
                <div className={classes.noAddresses}>
                  <p>
                    {locale === 'tr' ? 'Henüz kayıtlı adresiniz yok' :
                     locale === 'ru' ? 'У вас еще нет сохраненных адресов' :
                     locale === 'pl' ? 'Nie masz jeszcze zapisanych adresów' :
                     'You don\'t have any saved addresses yet'}
                  </p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`${classes.addressCard} ${selectedDeliveryAddressId === address.id ? classes.selected : ''}`}
                    onClick={() => setSelectedDeliveryAddressId(address.id)}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={selectedDeliveryAddressId === address.id}
                      onChange={() => setSelectedDeliveryAddressId(address.id)}
                      className={classes.radio}
                    />
                    <div className={classes.addressContent}>
                      <div className={classes.addressTitle}>
                        {address.title}
                        {address.isDefault && (
                          <span className={classes.defaultBadge}>
                            {locale === 'tr' ? 'Varsayılan' :
                             locale === 'ru' ? 'По умолчанию' :
                             locale === 'pl' ? 'Domyślny' :
                             'Default'}
                          </span>
                        )}
                      </div>
                      <div className={classes.addressDetails}>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.country}</p>
                        {address.phone && (
                          <p className={classes.phone}>
                            <FaPhone /> {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedDeliveryAddressId === address.id && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                ))
              )}

              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className={classes.addAddressBtn}
                >
                  + {t('addNewAddress')}
                </button>
              )}

              {showNewAddressForm && (
                <div className={classes.newAddressForm}>
                  <h3>{t('addNewAddress')}</h3>
                  <div className={classes.formGrid}>
                    <input
                      type="text"
                      placeholder={t('addressTitle')}
                      value={newAddress.title}
                      onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="text"
                      placeholder={t('fullName')}
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="tel"
                      placeholder={t('phone')}
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="text"
                      placeholder={t('addressLine')}
                      value={newAddress.address_line}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                      className={`${classes.input} ${classes.fullWidth}`}
                    />
                    <input
                      type="text"
                      placeholder={t('city')}
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="text"
                      placeholder={t('state')}
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="text"
                      placeholder={t('postalCode')}
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      className={classes.input}
                    />
                  </div>
                  <div className={classes.formActions}>
                    <button onClick={handleAddNewAddress} className={classes.saveBtn}>
                      {t('save')}
                    </button>
                    <button onClick={() => setShowNewAddressForm(false)} className={classes.cancelBtn}>
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address Section */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaMapMarkerAlt className={classes.sectionIcon} />
              <h2>{t('billingAddress')}</h2>
            </div>

            {/* Same as Delivery Checkbox */}
            <div className={classes.checkboxWrapper}>
              <input
                type="checkbox"
                id="sameAsDelivery"
                checked={sameAsDelivery}
                onChange={(e) => {
                  setSameAsDelivery(e.target.checked);
                  if (e.target.checked) {
                    setSelectedBillingAddressId(selectedDeliveryAddressId);
                  }
                }}
                className={classes.checkbox}
              />
              <label htmlFor="sameAsDelivery" className={classes.checkboxLabel}>
                {t('sameAsDeliveryAddress')}
              </label>
            </div>

            {!sameAsDelivery && (
              <div className={classes.addressList}>
                {addresses.length === 0 ? (
                  <div className={classes.noAddresses}>
                    <p>
                      {locale === 'tr' ? 'Henüz kayıtlı adresiniz yok' :
                       locale === 'ru' ? 'У вас еще нет сохраненных адресов' :
                       locale === 'pl' ? 'Nie masz jeszcze zapisanych adresów' :
                       'You don\'t have any saved addresses yet'}
                    </p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`${classes.addressCard} ${selectedBillingAddressId === address.id ? classes.selected : ''}`}
                      onClick={() => setSelectedBillingAddressId(address.id)}
                    >
                      <input
                        type="radio"
                        name="billingAddress"
                        checked={selectedBillingAddressId === address.id}
                        onChange={() => setSelectedBillingAddressId(address.id)}
                        className={classes.radio}
                      />
                      <div className={classes.addressContent}>
                        <div className={classes.addressTitle}>
                          {address.title}
                          {address.isDefault && (
                            <span className={classes.defaultBadge}>
                              {locale === 'tr' ? 'Varsayılan' :
                               locale === 'ru' ? 'По умолчанию' :
                               locale === 'pl' ? 'Domyślny' :
                               'Default'}
                            </span>
                          )}
                        </div>
                        <div className={classes.addressDetails}>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.country}</p>
                          {address.phone && (
                            <p className={classes.phone}>
                              <FaPhone /> {address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedBillingAddressId === address.id && (
                        <div className={classes.checkmark}>
                          <FaCheck />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaCreditCard className={classes.sectionIcon} />
              <h2>{t('paymentMethod')}</h2>
            </div>

            <div className={classes.paymentMethods}>
              <div
                className={`${classes.paymentCard} ${paymentMethod === 'card' ? classes.selected : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className={classes.radio}
                />
                <div className={classes.paymentContent}>
                  <FaCreditCard className={classes.paymentIcon} />
                  <span>{t('creditCard')}</span>
                </div>
                {paymentMethod === 'card' && (
                  <div className={classes.checkmark}>
                    <FaCheck />
                  </div>
                )}
              </div>

              <div
                className={`${classes.paymentCard} ${paymentMethod === 'bank_transfer' ? classes.selected : ''}`}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className={classes.radio}
                />
                <div className={classes.paymentContent}>
                  <FaEnvelope className={classes.paymentIcon} />
                  <span>{t('bankTransfer')}</span>
                </div>
                {paymentMethod === 'bank_transfer' && (
                  <div className={classes.checkmark}>
                    <FaCheck />
                  </div>
                )}
              </div>
            </div>
            
            {/* Credit Card Form - Show when card is selected */}
            {paymentMethod === 'card' && (
              <div className={classes.cardFormWrapper}>
                <h3>
                  {locale === 'tr' ? 'Kart Bilgileri' :
                   locale === 'ru' ? 'Данные карты' :
                   locale === 'pl' ? 'Dane karty' :
                   'Card Details'}
                </h3>
                <div className={classes.formGrid}>
                  <input
                    type="text"
                    placeholder={
                      locale === 'tr' ? 'Kart Üzerindeki İsim' :
                      locale === 'ru' ? 'Имя на карте' :
                      locale === 'pl' ? 'Imię na karcie' :
                      'Cardholder Name'
                    }
                    className={`${classes.input} ${classes.fullWidth}`}
                  />
                  <input
                    type="text"
                    placeholder={
                      locale === 'tr' ? 'Kart Numarası' :
                      locale === 'ru' ? 'Номер карты' :
                      locale === 'pl' ? 'Numer karty' :
                      'Card Number'
                    }
                    maxLength={19}
                    className={`${classes.input} ${classes.fullWidth}`}
                  />
                  <input
                    type="text"
                    placeholder={
                      locale === 'tr' ? 'AA/YY' :
                      locale === 'ru' ? 'ММ/ГГ' :
                      locale === 'pl' ? 'MM/RR' :
                      'MM/YY'
                    }
                    maxLength={5}
                    className={classes.input}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    maxLength={4}
                    className={classes.input}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary (Sticky) */}
        <div className={classes.rightColumn}>
          <div className={classes.orderSummary}>
            <h2>{t('orderSummary')}</h2>

            {/* Summary */}
            <div className={classes.summaryRows}>
              <div className={classes.summaryRow}>
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotal) || '$0.00'}</span>
              </div>
              <div className={classes.summaryRow}>
                <span>{t('shipping')}</span>
                <span className={classes.freeShipping}>{t('free')}</span>
              </div>
              <div className={classes.summaryDivider}></div>
              <div className={`${classes.summaryRow} ${classes.summaryTotal}`}>
                <span>{t('total')}</span>
                <span>{formatPrice(total) || '$0.00'}</span>
              </div>
            </div>

            {/* Complete Order Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={processingOrder || !selectedDeliveryAddressId || (!sameAsDelivery && !selectedBillingAddressId)}
              className={classes.completeOrderBtn}
            >
              {processingOrder ? (
                <>
                  <div className={classes.btnSpinner}></div>
                  {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
                </>
              ) : (
                t('completeOrder')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
