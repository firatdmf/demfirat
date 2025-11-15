'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get payment parameters from URL (sent by iyzico)
    const mdStatus = searchParams.get('mdStatus'); // 3D Secure status
    const status = searchParams.get('status');
    const paymentId = searchParams.get('paymentId');
    const conversationData = searchParams.get('conversationData');
    const conversationId = searchParams.get('conversationId');
    
    console.log('Callback params:', { mdStatus, status, paymentId, conversationData, conversationId });
    
    // Check if 3D Secure was successful
    if (mdStatus && mdStatus !== '1') {
      setStatus('error');
      setMessage(locale === 'tr' 
        ? '3D Secure doğrulama başarısız. Lütfen tekrar deneyin.' 
        : '3D Secure verification failed. Please try again.');
      return;
    }
    
    if (!paymentId) {
      setStatus('error');
      setMessage(locale === 'tr' ? 'Ödeme bilgisi bulunamadı' : 'Payment information not found');
      return;
    }

    // Verify payment with backend
    verifyPayment(paymentId, conversationId || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async (paymentId: string, conversationId: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, conversationId })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(locale === 'tr' ? 'Ödeme başarılı!' : 'Payment successful!');
        
        // Get checkout data from localStorage
        let userId = null;
        const checkoutData = localStorage.getItem('checkoutData');
        
        // Create order in Django backend with payment data
        try {
          if (checkoutData) {
            const parsed = JSON.parse(checkoutData);
            userId = parsed.userId;
            
            const orderResponse = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: parsed.userId,
                paymentData: data.payment,
                cartItems: parsed.cartItems,
                deliveryAddress: parsed.deliveryAddress,
                billingAddress: parsed.billingAddress,
                exchangeRate: parsed.exchangeRate,
                originalCurrency: parsed.originalCurrency,
                originalPrice: parsed.originalPrice
              })
            });
            
            const orderResult = await orderResponse.json();
            console.log('Order created:', orderResult);
            
            // Store order result for confirmation page
            if (orderResult.success) {
              localStorage.setItem('lastOrder', JSON.stringify({
                orderId: orderResult.order?.order_id,
                paymentId: paymentId,
                cartItems: parsed.cartItems,
                deliveryAddress: parsed.deliveryAddress,
                billingAddress: parsed.billingAddress,
                totalAmount: data.payment?.paidPrice,
                currency: data.payment?.currency,
                orderDate: new Date().toISOString()
              }));
            }
            
            // Clear checkout data after order created
            localStorage.removeItem('checkoutData');
          }
        } catch (orderError) {
          console.error('Failed to create order:', orderError);
          // Don't fail the whole flow if order creation fails
        }
        
        // Check if we're in a popup (opened from 3DS)
        const isPopup = window.opener && window.opener !== window;
        
        if (isPopup) {
          // We're in a popup - redirect parent and close popup
          try {
            window.opener.postMessage({
              type: 'PAYMENT_SUCCESS',
              paymentId: paymentId,
              userId: userId
            }, window.location.origin);
            
            // Close popup after message sent
            setTimeout(() => {
              window.close();
            }, 1000);
          } catch (error) {
            console.error('Could not communicate with parent:', error);
          }
        } else {
          // Normal page - redirect to confirmation page
          setTimeout(() => {
            router.push(`/${locale}/order/confirmation?paymentId=${paymentId}`);
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(data.errorMessage || data.error || (locale === 'tr' ? 'Ödeme başarısız' : 'Payment failed'));
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(locale === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#faf8f3',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e0dcd2',
              borderTopColor: '#c9a961',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              marginBottom: '1rem'
            }}>
              {locale === 'tr' ? 'Ödeme Kontrol Ediliyor...' : 'Verifying Payment...'}
            </h2>
            <p>{locale === 'tr' ? 'Lütfen bekleyin' : 'Please wait'}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#27ae60',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✓
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              marginBottom: '1rem',
              color: '#27ae60'
            }}>
              {message}
            </h2>
            <p>{locale === 'tr' ? 'Yönlendiriliyorsunuz...' : 'Redirecting...'}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#e74c3c',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              ✕
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              marginBottom: '1rem',
              color: '#e74c3c'
            }}>
              {message}
            </h2>
            <button
              onClick={() => router.push(`/${locale}/checkout`)}
              style={{
                marginTop: '1.5rem',
                padding: '0.875rem 2rem',
                background: '#c9a961',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {locale === 'tr' ? 'Geri Dön' : 'Go Back'}
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
