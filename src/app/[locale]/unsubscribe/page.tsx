'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-email'>('loading');

    useEffect(() => {
        if (!email) {
            setStatus('no-email');
            return;
        }

        fetch('/api/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
            .then(r => r.json())
            .then(data => {
                setStatus(data.success ? 'success' : 'error');
            })
            .catch(() => setStatus('error'));
    }, [email]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f2ec',
            padding: '2rem',
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                textAlign: 'center',
                maxWidth: '480px',
                width: '100%',
            }}>
                <div style={{
                    fontFamily: "'Jost', 'Montserrat', Arial, sans-serif",
                    fontSize: '28px',
                    fontWeight: 500,
                    color: '#944f05',
                    letterSpacing: '2px',
                    marginBottom: '2rem',
                }}>
                    DEMFIRAT
                </div>

                {status === 'loading' && (
                    <p style={{ color: '#666', fontSize: '1rem' }}>Abonelikten cikariliyor...</p>
                )}

                {status === 'success' && (
                    <>
                        <div style={{
                            width: '60px', height: '60px', background: '#27ae60', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem', color: 'white', fontSize: '1.8rem',
                        }}>
                            &#10003;
                        </div>
                        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: '0.75rem' }}>
                            Abonelikten Cikildi
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            Bulten aboneliginiz iptal edilmistir. Artik promosyon e-postalari almayacaksiniz.
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', color: '#e74c3c', marginBottom: '0.75rem' }}>
                            Bir hata olustu
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            Abonelik iptal edilemedi. Lutfen daha sonra tekrar deneyin.
                        </p>
                    </>
                )}

                {status === 'no-email' && (
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Gecersiz link.</p>
                )}

                <Link href="/" style={{
                    display: 'inline-block',
                    marginTop: '2rem',
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #c9a961, #b8956a)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '30px',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 600,
                }}>
                    Ana Sayfaya Don
                </Link>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yukleniyor...</div>}>
            <UnsubscribeContent />
        </Suspense>
    );
}
