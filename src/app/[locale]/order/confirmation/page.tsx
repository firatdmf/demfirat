'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { FaCheckCircle, FaShoppingBag, FaMapMarkerAlt, FaBox, FaCreditCard, FaHome } from 'react-icons/fa';
import { trackPurchase } from '@/lib/tracking';

interface OrderData {
  orderId: string;
  paymentId: string;
  cartItems: any[];
  deliveryAddress: any;
  billingAddress: any;
  totalAmount: string;
  currency: string;
  orderDate: string;
  shippingCost?: string;
  couponCode?: string;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from localStorage
    const lastOrder = localStorage.getItem('lastOrder');
    let parsedOrderData: OrderData | null = null;

    if (lastOrder) {
      parsedOrderData = JSON.parse(lastOrder);
      setOrderData(parsedOrderData);
      // Clear after reading
      localStorage.removeItem('lastOrder');

      // Tracking: Purchase Event
      if (typeof window !== 'undefined' && parsedOrderData) {
        const trackingItems = parsedOrderData.cartItems?.map((item: any) => ({
          id: item.sku || item.id,
          name: item.title || item.name || 'Ürün',
          category: 'product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1
        })) || [];

        trackPurchase(
          parsedOrderData.orderId,
          parseFloat(parsedOrderData.totalAmount) || 0,
          trackingItems,
          parsedOrderData.currency || 'TRY',
          0, // Tax
          parseFloat(parsedOrderData.shippingCost || '0')
        );

        console.log('[Tracking] purchase event fired', {
          transaction_id: parsedOrderData.orderId,
          value: parsedOrderData.totalAmount,
          currency: parsedOrderData.currency
        });
      }
    }

    // Clear cart from backend
    const userId = searchParams.get('userId');
    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/clear_cart/${userId}/`, {
        method: 'POST'
      }).catch(error => {
        console.error('Failed to clear cart:', error);
      });
    }

    // Clear local cart
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');

    setLoading(false);
  }, [searchParams]);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      orderConfirmed: { en: 'Order Confirmed!', tr: 'Sipariş Onaylandı!', ru: 'Заказ подтвержден!', pl: 'Zamówienie potwierdzone!' },
      thankYou: { en: 'Thank you for your purchase', tr: 'Alışverişiniz için teşekkür ederiz', ru: 'Спасибо за покупку', pl: 'Dziękujemy za zakup' },
      orderDetails: { en: 'Order details have been sent to your email address.', tr: 'Sipariş detayları e-posta adresinize gönderilmiştir.', ru: 'Детали заказа отправлены на ваш адрес электронной почты.', pl: 'Szczegóły zamówienia zostały wysłane na Twój adres e-mail.' },
      continueShopping: { en: 'Continue Shopping', tr: 'Alışverişe Devam Et', ru: 'Продолжить покупки', pl: 'Kontynuuj zakupy' },
      backToHome: { en: 'Back to Home', tr: 'Ana Sayfaya Dön', ru: 'Вернуться на главную', pl: 'Powrót do strony głównej' },
      processing: { en: 'Your order is being processed and will be shipped soon.', tr: 'Siparişiniz işleme alınmıştır ve kısa süre içinde kargoya verilecektir.', ru: 'Ваш заказ обрабатывается и скоро будет отправлен.', pl: 'Twoje zamówienie jest przetwarzane i wkrótce zostanie wysłane.' },
      orderNumber: { en: 'Order Number', tr: 'Sipariş Numarası', ru: 'Номер заказа', pl: 'Numer zamówienia' },
      paymentId: { en: 'Payment ID', tr: 'Ödeme No', ru: 'ID платежа', pl: 'ID płatności' },
      orderedItems: { en: 'Ordered Items', tr: 'Sipariş Edilen Ürünler', ru: 'Заказанные товары', pl: 'Zamówione produkty' },
      deliveryAddress: { en: 'Delivery Address', tr: 'Teslimat Adresi', ru: 'Адрес доставки', pl: 'Adres dostawy' },
      billingAddress: { en: 'Billing Address', tr: 'Fatura Adresi', ru: 'Адрес выставления счета', pl: 'Adres rozliczeniowy' },
      totalAmount: { en: 'Total Amount', tr: 'Toplam Tutar', ru: 'Общая сумма', pl: 'Całkowita kwota' },
      quantity: { en: 'Qty', tr: 'Adet', ru: 'Кол-во', pl: 'Ilość' }
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    return `${parseFloat(price).toFixed(2)} ${orderData?.currency || 'TRY'}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #faf8f3 0%, #e0dcd2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          boxShadow: '0 8px 20px rgba(46, 204, 113, 0.3)',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <FaCheckCircle style={{ color: 'white', fontSize: '3.5rem' }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: '#2c3e50',
          fontWeight: 600
        }}>
          {t('orderConfirmed')}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.25rem',
          color: '#7f8c8d',
          marginBottom: '1.5rem'
        }}>
          {t('thankYou')}
        </p>

        {/* Divider */}
        <div style={{
          width: '80px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #c9a961, transparent)',
          margin: '2rem auto'
        }} />

        {/* Order Info */}
        <div style={{
          background: '#faf8f3',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <p style={{
            color: '#34495e',
            lineHeight: '1.8',
            margin: 0
          }}>
            {t('orderDetails')}
          </p>
          <p style={{
            color: '#7f8c8d',
            lineHeight: '1.8',
            marginTop: '1rem',
            marginBottom: 0
          }}>
            {t('processing')}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link
            href={`/${locale}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #c9a961 0%, #b8956a 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(201, 169, 97, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 169, 97, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(201, 169, 97, 0.3)';
            }}
          >
            <FaHome />
            {t('backToHome')}
          </Link>

          <Link
            href={`/${locale}/product/fabric`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'white',
              color: '#c9a961',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              border: '2px solid #c9a961',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#faf8f3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            <FaShoppingBag />
            {t('continueShopping')}
          </Link>
        </div>

        {/* Animation */}
        <style jsx>{`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
