'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaShoppingCart, FaCreditCard, FaMapMarkerAlt, FaUser, FaCheck, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import classes from './page.module.css';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import PreInformationForm from '@/components/PreInformationForm';
import DistanceSalesContract from '@/components/DistanceSalesContract';
import { trackBeginCheckout } from '@/lib/tracking';
import { identifyUser, trackKlaviyoStartedCheckout } from '@/lib/klaviyo';
import './iyzico-payment-logo.css';
import './card-form-mobile.css';

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

interface Address {
  id: string;
  title: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address: string;
  district?: string;
  city: string;
  postal_code?: string;
  country: string;
  isDefault: boolean;
}


export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { refreshCart, guestCart, clearGuestCart, isGuest } = useCart();
  const { currency, convertPrice, rates } = useCurrency();

  // Guest checkout is disabled — this is a B2B wholesale storefront, only
  // registered accounts can place orders. Hardcoding this to false (instead
  // of removing the ~20 `isGuestCheckout` branches below) routes every one
  // of them to the member path without touching each individually; the
  // ?guest=true URL param is now inert. See GuestCheckoutModal for the
  // matching UI-side removal.
  const isGuestCheckout = false;

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [billingAddr, setBillingAddr] = useState({
    address_line: '',
    city: '',
    country: 'Turkey',
    postal_code: '',
  });
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(true);
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
    first_name: '',
    last_name: '',
    phone: '',
    address_line: '',
    district: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Turkey',
  });

  // Selected location for new address
  const [selectedCountry, setSelectedCountry] = useState('Turkey');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);


  const [userPhone, setUserPhone] = useState('');

  // Legal documents state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPreInfo, setAgreedToPreInfo] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPreInfoModal, setShowPreInfoModal] = useState(false);

  // User info state
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [emailError, setEmailError] = useState('');

  // Location data state
  const [countries, setCountries] = useState<Array<{ code: string; name: string; flag?: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string }>>([]);

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      checkout: { en: 'Checkout', tr: 'Ödeme', ru: 'Оформление заказа', pl: 'Zamówienie' },
      completeOrder: { en: 'Complete Order', tr: 'Siparişi Tamamla', ru: 'Завершить заказ', pl: 'Zakończ zamówienie' },
      orderSummary: { en: 'Order Summary', tr: 'Sipariş Özeti', ru: 'Сводка заказа', pl: 'Podsumowanie zamówienia' },
      deliveryAddress: { en: 'Delivery Address', tr: 'Teslimat Adresi', ru: 'Адрес доставки', pl: 'Adres dostawy' },
      billingAddress: { en: 'Billing Address', tr: 'Fatura Adresi', ru: 'Адрес выставления счета', pl: 'Adres rozliczeniowy' },
      sameAsDeliveryAddress: { en: 'Same as delivery address', tr: 'Teslimat adresi ile aynı', ru: 'Совпадает с адресом доставки', pl: 'Taki sam jak adres dostawy' },
      paymentMethod: { en: 'Payment', tr: 'Ödeme', ru: 'Оплата', pl: 'Płatność' },
      contactAfterOrderNotice: {
        en: 'After you place your order, our team will contact you to confirm the details and arrange payment.',
        tr: 'Siparişinizi oluşturduktan sonra ekibimiz sizinle iletişime geçerek detayları ve ödemeyi birlikte netleştirecek.',
        ru: 'После оформления заказа наша команда свяжется с вами, чтобы уточнить детали и организовать оплату.',
        pl: 'Po złożeniu zamówienia nasz zespół skontaktuje się z Tobą, aby ustalić szczegóły i płatność.',
      },
      chatOnWhatsapp: { en: 'Chat on WhatsApp', tr: "WhatsApp'tan Yazın", ru: 'Написать в WhatsApp', pl: 'Napisz na WhatsApp' },
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
      country: { en: 'Country', tr: 'Ülke', ru: 'Страна', pl: 'Kraj' },
      district: { en: 'District', tr: 'İlçe', ru: 'Район', pl: 'Dzielnica' },
      firstName: { en: 'First Name', tr: 'Ad', ru: 'Имя', pl: 'Imię' },
      lastName: { en: 'Last Name', tr: 'Soyad', ru: 'Фамилия', pl: 'Nazwisko' },
      userInformation: { en: 'Your Information', tr: 'Bilgileriniz', ru: 'Ваша информация', pl: 'Twoje informacje' },
      pleaseEnterName: { en: 'Please enter your name', tr: 'Lütfen adınızı girin', ru: 'Введите имя', pl: 'Wprowadź imię' },
      pleaseEnterPhone: { en: 'Please enter your phone', tr: 'Lütfen telefon numaranızı girin', ru: 'Введите телефон', pl: 'Wprowadź telefon' },
      pleaseSelectAddress: { en: 'Please select an address', tr: 'Lütfen bir adres seçin', ru: 'Выберите адрес', pl: 'Wybierz adres' },
      selectCountry: { en: 'Select Country', tr: 'Ülke Seçin', ru: 'Выберите страну', pl: 'Wybierz kraj' },
      selectCity: { en: 'Select City', tr: 'Şehir Seçin', ru: 'Выберите город', pl: 'Wybierz miasto' },
      selectDistrict: { en: 'Select District', tr: 'İlçe Seçin', ru: 'Выберите район', pl: 'Wybierz dzielnicę' },
      save: { en: 'Save', tr: 'Kaydet', ru: 'Сохранить', pl: 'Zapisz' },
      cancel: { en: 'Cancel', tr: 'İptal', ru: 'Отмена', pl: 'Anuluj' },
      agreeToPreInfo: { en: 'I have read and accept the Preliminary Information Form', tr: 'Ön Bilgilendirme Formunu okudum ve kabul ediyorum', ru: 'Я прочитал и принимаю предварительную информационную форму', pl: 'Przeczytałem i akceptuję wstępny formularz informacyjny' },
      agreeToTerms: { en: 'I have read and accept the Distance Sales Agreement', tr: 'Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum', ru: 'Я прочитал и принимаю договор дистанционной продажи', pl: 'Przeczytałem i akceptuję umowę sprzedaży na odległość' },
      pleaseAgreeToPreInfo: { en: 'Please accept the Preliminary Information Form', tr: 'Lütfen Ön Bilgilendirme Formunu kabul edin', ru: 'Пожалуйста, примите предварительную информационную форму', pl: 'Proszę zaakceptować wstępny formularz informacyjny' },
      pleaseAgreeToTerms: { en: 'Please accept the Distance Sales Agreement', tr: 'Lütfen Mesafeli Satış Sözleşmesini kabul edin', ru: 'Пожалуйста, примите договор дистанционной продажи', pl: 'Proszę zaakceptować umowę sprzedaży na odległość' },
      agreeToMarketing: { en: 'I want to be informed about campaigns and news.', tr: 'Kampanyalardan ve haberlerden haberdar olmak istiyorum.', ru: 'Я хочу получать информацию об акциях и новостях.', pl: 'Chcę otrzymywać informacje o kampaniach i nowościach.' },
      legalDocuments: { en: 'Legal Documents', tr: 'Yasal Belgeler', ru: 'Юридические документы', pl: 'Dokumenty prawne' },
      securePayment: { en: 'Secure Payment', tr: 'Güvenli Ödeme', ru: 'Безопасная оплата', pl: 'Bezpieczna płatność' },
      discountCode: { en: 'Discount Code', tr: 'İndirim Kodu', ru: 'Код скидки', pl: 'Kod rabatowy' },
      apply: { en: 'Apply', tr: 'Uygula', ru: 'Применить', pl: 'Zastosuj' },
      discount: { en: 'Discount', tr: 'İndirim', ru: 'Скидка', pl: 'Rabat' },
      invalidDiscountCode: { en: 'Invalid discount code', tr: 'Geçersiz indirim kodu', ru: 'Неверный код скидки', pl: 'Nieprawidłowy kod rabatowy' },
      discountApplied: { en: 'Discount applied!', tr: 'İndirim uygulandı!', ru: 'Скидка применена!', pl: 'Rabat zastosowany!' },
      sample: { en: 'Sample', tr: 'Numune', ru: 'Образец', pl: 'Próbka' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  // Redirect only if not guest checkout and not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' && !isGuestCheckout) {
      router.push(`/${locale}/cart`);
    }
  }, [status, router, locale, isGuestCheckout]);

  // Load checkout data based on auth status
  useEffect(() => {
    if (status === 'loading') return;

    if (isGuestCheckout && isGuest) {
      // For guest checkout, load from localStorage
      loadGuestCheckoutData();
    } else if (session?.user?.email && isInitialLoad) {
      loadCheckoutData();
      setIsInitialLoad(false);
      setUserInfo(prev => ({
        ...prev,
        email: session.user?.email || ''
      }));
      // Klaviyo Identity
      identifyUser(session.user.email, session.user?.name || undefined);
    }
  }, [session, isInitialLoad, status, isGuestCheckout, isGuest, guestCart]);

  // Tracking: Fire begin_checkout event when checkout loads with cart data
  useEffect(() => {
    if (cartItems.length > 0) {
      const currentRate = rates.find(r => r.currency_code === currency)?.rate || 1;

      const totalValue = cartItems.reduce((sum, item) => {
        const price = item.is_sample
          ? 0.10
          : item.is_custom_curtain && item.custom_price
            ? Number(item.custom_price)
            : Number(item.product?.price || 0);
        return sum + (price * parseInt(item.quantity || '1') * currentRate);
      }, 0);

      const trackingItems = cartItems.map(item => {
        const basePrice = item.is_custom_curtain && item.custom_price ? Number(item.custom_price) : Number(item.product?.price || 0);
        return {
          product_id: item.product_sku || item.variant_sku || '',
          id: item.product_sku || item.variant_sku || '',
          title: item.product?.title || '',
          name: item.product?.title || '',
          category: item.product_category || 'product',
          price: basePrice * currentRate,
          quantity: parseInt(item.quantity || '1')
        };
      });

      trackBeginCheckout(totalValue, trackingItems, currency);
      trackKlaviyoStartedCheckout({
        $value: totalValue,
        ItemNames: trackingItems.map(i => i.name),
        CheckoutURL: window.location.href,
        Items: trackingItems
      });
      console.log('[Tracking] begin_checkout event fired', { value: totalValue, items: cartItems.length, currency: currency });
    }
  }, [cartItems, currency, rates]);

  // Load guest checkout data from localStorage
  const loadGuestCheckoutData = async () => {
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
            const productResponse = await fetch(
              `/api/cart/get-product?product_sku=${item.product_sku}`
            );
            if (productResponse.ok) {
              const productData = await productResponse.json();
              const product = productData.product;

              // CRITICAL: Preserve embedded price from guest cart (contains correct variant_price)
              // Only use API product.price as fallback if embedded price is not valid
              const embeddedPrice = item.product?.price;
              const fetchedPrice = product?.price;

              let finalPrice: string | number | null = null;

              if (item.is_sample) {
                finalPrice = 0.10;
              } else {
                finalPrice = item.custom_price
                  ? item.custom_price
                  : (embeddedPrice && Number(embeddedPrice) > 0)
                    ? embeddedPrice
                    : fetchedPrice || null;
              }

              return {
                ...item,
                id: item.id as any,
                product_category: productData.product_category || item.product_category,
                product: {
                  title: product?.title || item.product?.title || item.product_sku,
                  price: finalPrice,
                  primary_image: product?.primary_image || '/media/woocommerce-placeholder.svg',
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
              price: item.custom_price || null,
              primary_image: '/media/woocommerce-placeholder.svg',
            },
          };
        })
      );
      setCartItems(itemsWithDetails as CartItem[]);
    } catch (error) {
      console.error('Error loading guest checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/location/countries');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCountries(data.countries);
          }
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Load Turkey cities automatically if Turkey is default
  useEffect(() => {
    if (selectedCountry === 'Turkey') {
      const loadTurkeyCities = async () => {
        try {
          const response = await fetch('/api/location/turkey-cities');
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setCities(data.cities);
            }
          }
        } catch (error) {
          console.error('Error loading Turkey cities:', error);
        }
      };
      loadTurkeyCities();
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [selectedCountry]);

  // Listen for payment success from popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('Payment successful, redirecting to confirmation...');

        // Redirect to confirmation page with userId (cart will be cleared there)
        const queryParams = new URLSearchParams({
          paymentId: event.data.paymentId,
          userId: event.data.userId
        });
        router.push(`/${locale}/order/confirmation?${queryParams.toString()}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router, locale]);

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

      // ══ Run cart and profile fetch IN PARALLEL ══
      const [cartResult, profileResult] = await Promise.all([
        // Task 1: Load cart items
        (async () => {
          try {
            const cartResponse = await fetch(
              `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
            );
            if (!cartResponse.ok) return null;

            const cartData = await cartResponse.json();
            const items = cartData.cart_items || [];

            // Single batch request for all product/variant details
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

              return items.map((item: CartItem, idx: number) => {
                const detail = batchItems[idx];

                // CRITICAL: Prioritize embedded price from cart (set at add-time)
                const embeddedPrice = item.product?.price;
                const fetchedVariantPrice = detail?.variant?.variant_price;
                const fetchedProductPrice = detail?.product?.price;

                let finalPrice: string | number | null = null;
                if (item.is_sample) {
                  finalPrice = 0.10;
                } else {
                  finalPrice = (embeddedPrice && Number(embeddedPrice) > 0)
                    ? embeddedPrice
                    : (fetchedVariantPrice && Number(fetchedVariantPrice) > 0)
                      ? fetchedVariantPrice
                      : fetchedProductPrice || null;
                }

                return {
                  ...item,
                  product_category: detail?.product_category || item.product_category,
                  variant_attributes: detail?.variant_attributes || {},
                  product: {
                    title: detail?.product?.title || item.product?.title || item.product_sku,
                    price: finalPrice,
                    primary_image: detail?.primary_image || detail?.product?.primary_image || item.product?.primary_image || '/media/woocommerce-placeholder.svg',
                    category: detail?.product_category,
                  },
                };
              });
            }

            // Fallback if batch fails
            return items.map((item: CartItem) => ({
              ...item,
              product: item.product || {
                title: item.product_sku,
                price: null,
                primary_image: '/media/woocommerce-placeholder.svg',
              },
            }));
          } catch (error) {
            console.error('Error loading cart:', error);
            return null;
          }
        })(),

        // Task 2: Load user profile (addresses)
        (async () => {
          try {
            const profileResponse = await fetch(
              `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_web_client_profile/${userId}/`
            );
            if (!profileResponse.ok) return null;
            return await profileResponse.json();
          } catch (error) {
            console.error('Error loading profile/addresses:', error);
            return null;
          }
        })(),
      ]);

      // Apply cart result
      if (cartResult) {
        setCartItems(cartResult);
      }

      // Apply profile result
      if (profileResult) {
        const userPhoneVal = profileResult.web_client?.phone || profileResult.phone || '';
        setUserPhone(userPhoneVal);

        if (profileResult.addresses && Array.isArray(profileResult.addresses)) {
          const userAddresses = profileResult.addresses.map((addr: any) => ({
            ...addr,
            phone: userPhoneVal,
          }));
          setAddresses(userAddresses);

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
      console.error('Error loading checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity);

      // Samples: $0.10 each (10 samples = $1)
      if (item.is_sample) return sum + (0.10 * quantity);

      let price = 0;

      // Özel perde ise custom_price kullan (1 adet perde fiyatı)
      if (item.is_custom_curtain && item.custom_price) {
        price = parseFloat(String(item.custom_price));
      } else if (item.product?.price) {
        price = parseFloat(String(item.product.price));
      }

      // Her iki durumda da: fiyat * adet
      return sum + (price * quantity);
    }, 0);
  };

  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice) || numPrice === 0) return null;
    return convertPrice(numPrice);
  };

  // Discount code handler
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    setDiscountError('');

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim() }),
      });

      const data = await response.json();

      if (data.success && data.discount_percentage) {
        setDiscountPercentage(data.discount_percentage);
        setAppliedDiscountCode(data.code);
        setDiscountError('');
      } else {
        setDiscountError(t('invalidDiscountCode'));
        setDiscountPercentage(null);
        setAppliedDiscountCode('');
      }
    } catch (error) {
      setDiscountError(t('invalidDiscountCode'));
      setDiscountPercentage(null);
      setAppliedDiscountCode('');
    } finally {
      setDiscountLoading(false);
    }
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discountPercentage) return 0;
    return subtotal * (discountPercentage / 100);
  };

  // Calculate total with discount
  const calculateTotal = () => {
    const discountAmount = calculateDiscountAmount();
    return subtotal + shipping - discountAmount;
  };

  const handleCompleteOrder = async () => {
    // Validate user information
    if (!userInfo.firstName.trim() || !userInfo.lastName.trim()) {
      showToast(t('pleaseEnterName'));
      return;
    }
    if (!userInfo.phone.trim()) {
      showToast(t('pleaseEnterPhone'));
      return;
    }

    // Validate email for guest checkout
    if (isGuestCheckout) {
      const emailVal = userInfo.email.trim();
      if (!emailVal) {
        const msg = locale === 'tr' ? 'Lütfen e-posta adresinizi girin' : 'Please enter your email address';
        setEmailError(msg);
        showToast(msg);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        const msg = locale === 'tr' ? 'Geçerli bir e-posta adresi girin (örn: ad@email.com)' : 'Enter a valid email address (e.g. name@email.com)';
        setEmailError(msg);
        showToast(msg);
        return;
      }
      setEmailError('');
    }

    // Validate legal document agreements
    if (!agreedToPreInfo) {
      showToast(t('pleaseAgreeToPreInfo'));
      return;
    }
    if (!agreedToTerms) {
      showToast(t('pleaseAgreeToTerms'));
      return;
    }

    // Validate address - for guests, check inline form; for users, check selected address
    if (isGuestCheckout) {
      if (!newAddress.address_line.trim() || !newAddress.city.trim() || !newAddress.country.trim()) {
        showToast(locale === 'tr' ? 'Lütfen teslimat adresini girin' : 'Please enter delivery address');
        return;
      }
    } else {
      if (!selectedDeliveryAddressId) {
        showToast(t('pleaseSelectAddress'));
        return;
      }
      if (!sameAsDelivery && !selectedBillingAddressId) {
        showToast(t('pleaseSelectAddress'));
        return;
      }
    }

    setProcessingOrder(true);
    try {
      const userId = isGuestCheckout ? `guest_${Date.now()}` : ((session?.user as any)?.id || session?.user?.email);

      // Get addresses - for guests use inline form, for users use selected
      let deliveryAddress: Address;
      let billingAddress: Address;

      if (isGuestCheckout) {
        // Create address object from inline form for guest
        deliveryAddress = {
          id: 'guest-delivery',
          title: 'Teslimat Adresi',
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          phone: userInfo.phone,
          address: newAddress.address_line,
          city: newAddress.city,
          postal_code: newAddress.postal_code,
          country: newAddress.country,
          isDefault: true
        };
        if (sameAsDelivery) {
          billingAddress = deliveryAddress;
        } else {
          billingAddress = {
            id: 'guest-billing',
            title: 'Fatura Adresi',
            first_name: userInfo.firstName,
            last_name: userInfo.lastName,
            phone: userInfo.phone,
            address: billingAddr.address_line,
            city: billingAddr.city,
            postal_code: billingAddr.postal_code,
            country: billingAddr.country,
            isDefault: false
          };
        }
      } else {
        deliveryAddress = addresses.find(addr => addr.id === selectedDeliveryAddressId)!;
        billingAddress = sameAsDelivery
          ? deliveryAddress
          : addresses.find(addr => addr.id === selectedBillingAddressId)!;

        if (!deliveryAddress || !billingAddress) {
          showToast(locale === 'tr' ? 'Adres bilgisi eksik' : 'Address information missing');
          return;
        }
      }

      // No online payment — submit the order as a request. Our team
      // contacts the customer afterward to confirm pricing and payment
      // (see the notice in the Payment section). subtotal/total are USD,
      // the site's base currency.
      const orderPayload = {
        userId,
        isGuestCheckout,
        guestInfo: isGuestCheckout ? {
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone
        } : null,
        paymentData: {
          paymentId: null,
          currency: 'USD',
          paidPrice: total.toFixed(2),
          email: isGuestCheckout ? userInfo.email : (session?.user?.email || ''),
        },
        cartItems,
        deliveryAddress,
        billingAddress,
        originalCurrency: 'USD',
        originalPrice: subtotal.toFixed(2),
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Order creation failed');
      }

      router.push(`/${locale}/order/confirmation`);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast(locale === 'tr'
        ? 'Sipariş oluşturulamadı. Lütfen bilgilerinizi kontrol edin.'
        : 'Could not create order. Please check your information.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleAddNewAddress = async () => {
    try {
      // Validate required fields
      if (!newAddress.title.trim()) {
        showToast(t('addressTitle') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.first_name.trim() || !newAddress.last_name.trim()) {
        showToast(t('fullName') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.phone.trim()) {
        showToast(t('phone') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.address_line.trim()) {
        showToast(t('addressLine') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.city.trim()) {
        showToast(t('city') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.country.trim()) {
        showToast(t('country') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }

      const userId = (session?.user as any)?.id || session?.user?.email;

      // Prepare address data for Django backend
      const addressData = {
        web_client_id: userId,
        title: newAddress.title.trim(),
        first_name: newAddress.first_name.trim(),
        last_name: newAddress.last_name.trim(),
        phone: newAddress.phone.trim(),
        address: newAddress.address_line.trim(),
        district: newAddress.district.trim() || '',
        city: newAddress.city.trim(),
        state: newAddress.state.trim() || '',
        postal_code: newAddress.postal_code.trim() || '',
        country: newAddress.country.trim(),
        isDefault: addresses.length === 0 // First address is default
      };

      console.log('Saving address:', addressData);

      // Call Django API to save address
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_client_address/${userId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Address save error:', errorData);
        throw new Error(errorData.error || 'Failed to save address');
      }

      const result = await response.json();
      console.log('Address saved successfully:', result);

      // Add new address to state immediately (optimistic update)
      const newAddressFromServer: Address = {
        id: result.address?.id || result.id || String(Date.now()),
        title: addressData.title,
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        phone: addressData.phone,
        address: addressData.address,
        district: addressData.district,
        city: addressData.city,
        postal_code: addressData.postal_code,
        country: addressData.country,
        isDefault: addressData.isDefault
      };

      // Update addresses state
      setAddresses(prev => [...prev, newAddressFromServer]);

      // Select the new address as delivery address
      setSelectedDeliveryAddressId(newAddressFromServer.id);
      if (sameAsDelivery) {
        setSelectedBillingAddressId(newAddressFromServer.id);
      }

      // Show success message
      showToast(locale === 'tr'
        ? 'Adres başarıyla kaydedildi!'
        : locale === 'ru' ? 'Адрес успешно сохранен!'
          : locale === 'pl' ? 'Adres został pomyślnie zapisany!'
            : 'Address saved successfully!', 'success');

      // Reset form
      setNewAddress({
        title: '',
        first_name: '',
        last_name: '',
        phone: '',
        address_line: '',
        district: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Turkey',
      });
      setSelectedCountry('Turkey');
      setSelectedCityId(null);
      setShowNewAddressForm(false);
    } catch (error: any) {
      console.error('Error saving address:', error);
      showToast(locale === 'tr'
        ? 'Adres kaydedilemedi: ' + (error.message || 'Bilinmeyen hata')
        : locale === 'ru' ? 'Не удалось сохранить адрес: ' + (error.message || 'Неизвестная ошибка')
          : locale === 'pl' ? 'Nie udało się zapisać adresu: ' + (error.message || 'Nieznany błąd')
            : 'Failed to save address: ' + (error.message || 'Unknown error'));
    }
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
        <div className={classes.header}>
          <h1>
            <FaShoppingCart className={classes.headerIcon} />
            {t('checkout')}
          </h1>
        </div>
        <div className={classes.checkoutGrid}>
          <div className={classes.leftColumn} style={{ opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
            <div className={classes.section} style={{ height: 100, background: '#f9f9f9', borderRadius: 8, marginBottom: 24 }}></div>
            <div className={classes.section} style={{ height: 250, background: '#f9f9f9', borderRadius: 8, marginBottom: 24 }}></div>
            <div className={classes.section} style={{ height: 150, background: '#f9f9f9', borderRadius: 8, marginBottom: 24 }}></div>
            <div className={classes.section} style={{ height: 200, background: '#f9f9f9', borderRadius: 8 }}></div>
          </div>

          <div className={classes.rightColumn} style={{ opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }}>
            <div className={classes.orderSummary} style={{ background: '#f9f9f9', borderRadius: 8, padding: 24 }}>
              <div style={{ height: 24, width: '50%', background: '#eee', borderRadius: 4, marginBottom: 24 }}></div>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 64, height: 64, background: '#eee', borderRadius: 8 }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, width: '80%', background: '#eee', borderRadius: 4, marginBottom: 8 }}></div>
                    <div style={{ height: 14, width: '40%', background: '#eee', borderRadius: 4 }}></div>
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: '#eee', margin: '24px 0' }}></div>
              <div style={{ height: 16, width: '100%', background: '#eee', borderRadius: 4, marginBottom: 16 }}></div>
              <div style={{ height: 16, width: '100%', background: '#eee', borderRadius: 4, marginBottom: 16 }}></div>
              <div style={{ height: 24, width: '100%', background: '#eee', borderRadius: 4, marginTop: 24 }}></div>
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  // Shipping calculation with live exchange rate
  // FREE_SHIPPING_THRESHOLD_TL = 2000 TL
  // SHIPPING_COST_TL = 180 TL (for orders under 2000 TL)
  const FREE_SHIPPING_THRESHOLD_TL = 2000;
  const SHIPPING_COST_TL = 180;

  // Get TRY exchange rate from rates array
  const tryRate = rates.find(r => r.currency_code === 'TRY');
  const exchangeRate = tryRate?.rate || 35; // Fallback to ~35 if rate not available

  // Convert subtotal USD to TL
  const subtotalInTL = subtotal * exchangeRate;

  // Calculate shipping: Free if >= 2000 TL, otherwise 180 TL (converted back to USD)
  let shipping = 0;
  if (subtotalInTL < FREE_SHIPPING_THRESHOLD_TL) {
    shipping = SHIPPING_COST_TL / exchangeRate; // Convert 180 TL to USD
  }

  const total = subtotal + shipping;

  return (
    <div className={classes.container}>
      {/* Toast Notification */}
      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '14px 28px',
            borderRadius: '12px',
            background: toast.type === 'error' ? '#fff0f0' : toast.type === 'success' ? '#f0fff4' : '#f0f4ff',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : toast.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
            color: toast.type === 'error' ? '#b91c1c' : toast.type === 'success' ? '#15803d' : '#1d4ed8',
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '90vw',
            animation: 'toastSlideIn 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>
            {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✓' : 'ℹ️'}
          </span>
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

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
                          e.currentTarget.src = '/media/woocommerce-placeholder.svg';
                        }}
                      />
                      {/* Custom Curtain Badge */}
                      {item.is_custom_curtain && (
                        <div className={classes.customBadge}>
                          {locale === 'tr' ? 'ÖZEL' :
                            locale === 'ru' ? 'ОСОБ' :
                              locale === 'pl' ? 'SPEC' : 'CUSTOM'}
                        </div>
                      )}
                      <div className={classes.horizontalItemQuantity}>
                        x{item.quantity}
                      </div>
                    </div>
                    <div className={classes.horizontalItemInfo}>
                      <div className={classes.horizontalItemTitle}>
                        {item.product?.title || item.product_sku}
                        {item.is_custom_curtain && (
                          <span className={classes.customLabel}>
                            {' '}✂️
                          </span>
                        )}
                      </div>
                      <div className={classes.horizontalItemPrice}>
                        {item.is_sample ? (
                          formatPrice(0.10 * (parseFloat(item.quantity) || 1))
                        ) : item.is_custom_curtain && item.custom_price ? (
                          formatPrice(item.custom_price)
                        ) : formatPrice(item.product?.price) ? (
                          formatPrice(item.product?.price)
                        ) : (
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

          {/* User Information Section */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaUser className={classes.sectionIcon} />
              <h2>{t('userInformation')}</h2>
            </div>

            <div className={classes.formGrid}>
              <input
                type="text"
                placeholder={t('firstName') + ' *'}
                value={userInfo.firstName}
                onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                className={classes.input}
                required
              />
              <input
                type="text"
                placeholder={t('lastName') + ' *'}
                value={userInfo.lastName}
                onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                className={classes.input}
                required
              />
              <input
                type="tel"
                placeholder={t('phone') + ' *'}
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                className={classes.input}
                required
              />
              <div style={{ width: '100%' }}>
                <input
                  type="email"
                  placeholder={t('email') + (isGuestCheckout ? ' *' : '')}
                  value={userInfo.email}
                  onChange={(e) => {
                    if (isGuestCheckout) {
                      setUserInfo({ ...userInfo, email: e.target.value });
                      if (emailError) {
                        const v = e.target.value.trim();
                        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailError('');
                      }
                    }
                  }}
                  onBlur={() => {
                    if (isGuestCheckout && userInfo.email.trim()) {
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) {
                        const msg = locale === 'tr' ? 'Geçerli bir e-posta adresi girin (örn: ad@email.com)' : 'Enter a valid email address (e.g. name@email.com)';
                        setEmailError(msg);
                        showToast(msg);
                      } else {
                        setEmailError('');
                      }
                    }
                  }}
                  className={`${classes.input} ${!isGuestCheckout ? classes.readOnly : ''}`}
                  style={emailError ? { borderColor: '#e74c3c' } : undefined}
                  readOnly={!isGuestCheckout}
                  required={isGuestCheckout}
                />
                {emailError && (
                  <p style={{ color: '#e74c3c', fontSize: '0.75rem', margin: '4px 0 0', fontWeight: 500 }}>{emailError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address Section */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaMapMarkerAlt className={classes.sectionIcon} />
              <h2>{t('deliveryAddress')}</h2>
            </div>

            <div className={classes.addressList}>
              {isGuestCheckout ? (
                /* Guest checkout - simple inline address form, no saving */
                <div className={classes.guestAddressForm}>
              
                  <div className={classes.formGrid}>
                    <input
                      type="text"
                      placeholder={t('addressLine') + ' *'}
                      value={newAddress.address_line}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                      className={classes.input}
                      required
                    />
                    <input
                      type="text"
                      placeholder={t('city') + ' *'}
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className={classes.input}
                      required
                    />
                    <input
                      type="text"
                      placeholder={t('country') + ' *'}
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className={classes.input}
                      required
                    />
                    <input
                      type="text"
                      placeholder={t('postalCode')}
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      className={classes.input}
                    />
                  </div>
                </div>
              ) : addresses.length === 0 ? (
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

              {/* Hide add address button for guest checkout */}
              {!showNewAddressForm && !isGuestCheckout && (
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
                      className={`${classes.input} ${classes.fullWidth}`}
                    />
                    <input
                      type="text"
                      placeholder={t('firstName')}
                      value={newAddress.first_name}
                      onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="text"
                      placeholder={t('lastName')}
                      value={newAddress.last_name}
                      onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                      className={classes.input}
                    />
                    <input
                      type="tel"
                      placeholder={t('phone')}
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className={`${classes.input} ${classes.fullWidth}`}
                    />
                    <input
                      type="text"
                      placeholder={t('addressLine')}
                      value={newAddress.address_line}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                      className={`${classes.input} ${classes.fullWidth}`}
                    />

                    {/* Country Selection */}
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        const country = e.target.value;
                        setSelectedCountry(country);
                        setNewAddress({ ...newAddress, country, city: '', district: '', state: '' });
                        setSelectedCityId(null);
                        // Cities will be loaded automatically by useEffect
                      }}
                      className={`${classes.input} ${classes.fullWidth}`}
                    >
                      <option value="">{t('selectCountry')}</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    {/* City Selection - Show dropdown for Turkey, text input for others */}
                    {selectedCountry === 'Turkey' ? (
                      <select
                        value={selectedCityId || ''}
                        onChange={async (e) => {
                          const cityId = parseInt(e.target.value);
                          setSelectedCityId(cityId);
                          const city = cities.find(c => c.id === cityId);
                          if (city) {
                            setNewAddress({ ...newAddress, city: city.name, district: '' });

                            // Load districts automatically
                            try {
                              const response = await fetch(`/api/location/turkey-districts/${cityId}`);
                              if (response.ok) {
                                const data = await response.json();
                                if (data.success) {
                                  setDistricts(data.districts);
                                  console.log(`Loaded ${data.districts.length} districts for ${city.name}`);
                                }
                              }
                            } catch (error) {
                              console.error('Error loading districts:', error);
                            }
                          } else {
                            setDistricts([]);
                          }
                        }}
                        className={classes.input}
                        disabled={!cities || cities.length === 0}
                      >
                        <option value="">{t('selectCity')}</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={t('city')}
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className={classes.input}
                      />
                    )}

                    {/* District Selection - Only for Turkey */}
                    {selectedCountry === 'Turkey' && selectedCityId ? (
                      <select
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        className={classes.input}
                        disabled={!selectedCityId}
                      >
                        <option value="">{t('selectDistrict')}</option>
                        {districts.map((district, index) => (
                          <option key={index} value={district.name}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    ) : selectedCountry !== 'Turkey' ? (
                      <input
                        type="text"
                        placeholder={t('state')}
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className={classes.input}
                      />
                    ) : null}

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
                {isGuestCheckout ? (
                  <div className={classes.guestAddressForm}>
                    <p className={classes.guestAddressNote}>
                      {locale === 'tr' ? 'Fatura adresinizi girin' :
                        locale === 'ru' ? 'Введите адрес для счета' :
                          locale === 'pl' ? 'Wprowadź adres rozliczeniowy' :
                            'Enter your billing address'}
                    </p>
                    <div className={classes.formGrid}>
                      <input
                        type="text"
                        placeholder={t('addressLine') + ' *'}
                        value={billingAddr.address_line}
                        onChange={(e) => setBillingAddr({ ...billingAddr, address_line: e.target.value })}
                        className={classes.input}
                        required
                      />
                      <input
                        type="text"
                        placeholder={t('city') + ' *'}
                        value={billingAddr.city}
                        onChange={(e) => setBillingAddr({ ...billingAddr, city: e.target.value })}
                        className={classes.input}
                        required
                      />
                      <input
                        type="text"
                        placeholder={t('country') + ' *'}
                        value={billingAddr.country}
                        onChange={(e) => setBillingAddr({ ...billingAddr, country: e.target.value })}
                        className={classes.input}
                        required
                      />
                      <input
                        type="text"
                        placeholder={t('postalCode')}
                        value={billingAddr.postal_code}
                        onChange={(e) => setBillingAddr({ ...billingAddr, postal_code: e.target.value })}
                        className={classes.input}
                      />
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
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

          {/* Payment Section — no online payment; a team member follows up
              after the order is submitted to confirm pricing and payment. */}
          <div className={classes.section}>
            <div className={classes.sectionHeader}>
              <FaPhone className={classes.sectionIcon} />
              <h2>{t('paymentMethod')}</h2>
            </div>

            <div className={classes.contactAfterOrderNotice}>
              <p className={classes.contactAfterOrderText}>{t('contactAfterOrderNotice')}</p>
              <div className={classes.contactAfterOrderActions}>
                <a href="tel:+905010571884" className={classes.contactPhoneLink}>
                  <FaPhone />
                  <span>+90 501 057 18 84</span>
                </a>
                <a
                  href="https://wa.me/905010571884"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.contactWhatsappLink}
                >
                  <FaWhatsapp />
                  <span>{t('chatOnWhatsapp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.rightColumn}>
          <div className={classes.orderSummary}>
            <h2>{t('orderSummary')}</h2>

            {/* Discount Code Input */}
            <div className={classes.discountCodeSection}>
              <label className={classes.discountLabel}>{t('discountCode')}</label>
              <div className={classes.discountInputRow}>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder={locale === 'tr' ? 'Kodu girin' : 'Enter code'}
                  className={classes.discountInput}
                  disabled={!!appliedDiscountCode}
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountCode.trim() || !!appliedDiscountCode}
                  className={classes.applyBtn}
                >
                  {discountLoading ? '...' : t('apply')}
                </button>
              </div>
              {discountError && <p className={classes.discountError}>{discountError}</p>}
              {appliedDiscountCode && (
                <p className={classes.discountSuccess}>
                  ✓ {appliedDiscountCode} ({discountPercentage}% {t('discount')})
                </p>
              )}
            </div>

            {/* Summary */}
            <div className={classes.summaryRows}>
              <div className={classes.summaryRow}>
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotal) || convertPrice(0)}</span>
              </div>
              {discountPercentage && (
                <div className={`${classes.summaryRow} ${classes.discountRow}`}>
                  <span>{t('discount')} ({discountPercentage}%)</span>
                  <span className={classes.discountAmount}>-{formatPrice(calculateDiscountAmount()) || convertPrice(0)}</span>
                </div>
              )}
              <div className={classes.summaryRow}>
                <span>{t('shipping')}</span>
                <span className={shipping === 0 ? classes.freeShipping : ''}>
                  {shipping === 0 ? t('free') : formatPrice(shipping)}
                </span>
              </div>
              <div className={classes.summaryDivider}></div>
              <div className={`${classes.summaryRow} ${classes.summaryTotal}`}>
                <span>{t('total')}</span>
                <span>{formatPrice(calculateTotal()) || convertPrice(0)}</span>
              </div>
            </div>

            {/* Marketing Checkbox */}
            <div className={classes.legalDocumentsSection} style={{ marginBottom: '1rem', borderBottom: '1px solid var(--ivory, #faf8f3)', paddingBottom: '1rem' }}>
              <label className={classes.combinedLegalCheckbox}>
                <input
                  type="checkbox"
                  checked={agreedToMarketing}
                  onChange={(e) => setAgreedToMarketing(e.target.checked)}
                  className={classes.hiddenCheckbox}
                />
                <span className={classes.customCheckbox}>
                  <FaCheck />
                </span>
                <span className={classes.legalText}>
                  {t('agreeToMarketing')}
                </span>
              </label>
            </div>

            {/* Legal Documents Section */}
            <div className={classes.legalDocumentsSection}>
              <label className={classes.combinedLegalCheckbox}>
                <input
                  type="checkbox"
                  checked={agreedToPreInfo && agreedToTerms}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAgreedToPreInfo(val);
                    setAgreedToTerms(val);
                  }}
                  className={classes.hiddenCheckbox}
                />
                <span className={classes.customCheckbox}>
                  <FaCheck />
                </span>
                <span className={classes.legalText}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPreInfoModal(true);
                    }}
                    className={classes.legalLink}
                  >
                    {locale === 'tr' ? 'Ön bilgilendirme formu' : 'Preliminary Information Form'}
                  </button>
                  {locale === 'tr' ? "'nu ve " : ' and '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className={classes.legalLink}
                  >
                    {locale === 'tr' ? 'Mesafeli satış sözleşmesi' : 'Distance Sales Agreement'}
                  </button>
                  {locale === 'tr' ? "'ni onaylıyorum." : ' I approve.'}
                </span>
              </label>
            </div>

            {/* Complete Order Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={
                processingOrder ||
                (isGuestCheckout
                  ? (!newAddress.address_line.trim() || !newAddress.city.trim() || !newAddress.country.trim() || !userInfo.email.trim())
                  : (!selectedDeliveryAddressId || (!sameAsDelivery && !selectedBillingAddressId))
                )
              }
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

      {/* Legal Document Modals */}
      <PreInformationForm
        isOpen={showPreInfoModal}
        onClose={() => setShowPreInfoModal(false)}
        locale={locale}
        userInfo={userInfo}
      />

      <DistanceSalesContract
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        locale={locale}
        userInfo={userInfo}
        deliveryAddress={addresses.find(addr => addr.id === selectedDeliveryAddressId)}
        cartItems={cartItems}
      />

    </div>
  );
}
