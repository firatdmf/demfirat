'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Clear cart after order confirmation
    // This can be improved to only clear after successful order creation
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  }, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      orderConfirmed: { en: 'Order Confirmed!', tr: 'Sipariş Onaylandı!', ru: 'Заказ подтвержден!', pl: 'Zamówienie potwierdzone!' },
      thankYou: { en: 'Thank you for your purchase', tr: 'Alışverişiniz için teşekkür ederiz', ru: 'Спасибо за покупку', pl: 'Dziękujemy za zakup' },
      orderDetails: { en: 'Order details have been sent to your email address.', tr: 'Sipariş detayları e-posta adresinize gönderilmiştir.', ru: 'Детали заказа отправлены на ваш адрес электронной почты.', pl: 'Szczegóły zamówienia zostały wysłane na Twój adres e-mail.' },
      continueShopping: { en: 'Continue Shopping', tr: 'Alışverişe Devam Et', ru: 'Продолжить покупки', pl: 'Kontynuuj zakupy' },
      processing: { en: 'Your order is being processed and will be shipped soon.', tr: 'Siparişiniz işleme alınmıştır ve kısa süre içinde kargoya verilecektir.', ru: 'Ваш заказ обрабатывается и скоро будет отправлен.', pl: 'Twoje zamówienie jest przetwarzane i wkrótce zostanie wysłane.' }
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
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
            href={`/${locale}/products`}
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
