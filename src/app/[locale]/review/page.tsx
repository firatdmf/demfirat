'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

function ReviewForm() {
    const searchParams = useSearchParams();
    const params = useParams();
    const sku = searchParams.get('sku') || '';
    const locale = (params?.locale as string) || 'tr';
    const isEn = locale === 'en';

    const t = {
        title: isEn ? 'Product Review' : 'Ürün Değerlendirmesi',
        subtitle: isEn ? 'Share your experience with us' : 'Deneyiminizi bizimle paylaşın',
        firstName: isEn ? 'First Name' : 'Ad',
        firstNamePh: isEn ? 'Your first name' : 'Adınız',
        lastName: isEn ? 'Last Name' : 'Soyad',
        lastNamePh: isEn ? 'Your last name' : 'Soyadınız',
        hideName: isEn ? "Don't show my full name" : 'Adım ve soyadım gözükmesin',
        willShow: isEn ? 'Shown as' : 'Görünecek',
        rating: isEn ? 'Your Rating' : 'Puanınız',
        comment: isEn ? 'Your Review' : 'Yorumunuz',
        commentPh: isEn ? 'Share your thoughts about the product...' : 'Ürün hakkındaki düşüncelerinizi paylaşın...',
        photos: isEn ? 'Add Photos (Max 5)' : 'Fotoğraf Ekleyin (Max 5)',
        uploading: isEn ? 'Uploading...' : 'Yükleniyor...',
        submit: isEn ? 'Submit Review' : 'Değerlendirmeyi Gönder',
        submitting: isEn ? 'Submitting...' : 'Gönderiliyor...',
        successTitle: isEn ? 'Review Received!' : 'Değerlendirmeniz Alındı!',
        successDesc: isEn ? 'Your review will be published after moderation. Thank you!' : 'Yorumunuz incelendikten sonra yayınlanacaktır. Teşekkür ederiz!',
        backHome: isEn ? 'Back to Home' : 'Ana Sayfaya Dön',
        invalidLink: isEn ? 'Invalid link. Product info missing.' : 'Geçersiz link. Ürün bilgisi eksik.',
        nameRequired: isEn ? 'First and last name are required' : 'Ad ve soyad zorunludur',
        ratingRequired: isEn ? 'Please give a rating' : 'Lütfen puan verin',
        productMissing: isEn ? 'Product information is missing' : 'Ürün bilgisi eksik',
        connError: isEn ? 'Connection error' : 'Bağlantı hatası',
        genericError: isEn ? 'An error occurred' : 'Bir hata oluştu',
    };

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [hideName, setHideName] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || images.length >= 5) return;

        setUploading(true);
        const newUrls: string[] = [];

        for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.url) {
                    newUrls.push(data.url);
                }
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }

        setImages(prev => [...prev, ...newUrls]);
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim()) {
            setError(t.nameRequired);
            return;
        }
        if (rating === 0) {
            setError(t.ratingRequired);
            return;
        }
        if (!sku) {
            setError(t.productMissing);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/guest_review/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_sku: sku,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    hide_name: hideName,
                    rating,
                    comment: comment.trim(),
                    image_urls: images,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || t.genericError);
            }
        } catch {
            setError(t.connError);
        } finally {
            setSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    if (!sku) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={{ color: '#888', textAlign: 'center' as const }}>{t.invalidLink}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.logo}>DEMFIRAT</div>
                    <div style={{ textAlign: 'center' as const }}>
                        <div style={{ width: 60, height: 60, background: '#27ae60', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <span style={{ color: 'white', fontSize: 28 }}>✓</span>
                        </div>
                        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', color: '#1a1a1a', marginBottom: 8 }}>
                            {t.successTitle}
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {t.successDesc}
                        </p>
                        <Link href={`/${locale}`} style={styles.homeBtn}>{t.backHome}</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>DEMFIRAT</div>
                <h1 style={styles.title}>{t.title}</h1>
                <p style={styles.subtitle}>{t.subtitle}</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Name Fields */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>{t.firstName} *</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder={t.firstNamePh}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>{t.lastName} *</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder={t.lastNamePh}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Hide Name */}
                    <label style={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={hideName}
                            onChange={e => setHideName(e.target.checked)}
                            style={{ accentColor: '#c9a961', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: '0.82rem', color: '#666' }}>
                            {t.hideName}
                            {hideName && firstName && lastName && (
                                <span style={{ color: '#c9a961', marginLeft: 8 }}>
                                    ({t.willShow}: {firstName[0]}.{lastName[0]}.)
                                </span>
                            )}
                        </span>
                    </label>

                    {/* Rating */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={styles.label}>{t.rating} *</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <span
                                    key={i}
                                    onMouseEnter={() => setHoverRating(i)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(i)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '2rem',
                                        color: i <= displayRating ? '#f59e0b' : '#d1d5db',
                                        transition: 'color 0.15s',
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div style={styles.field}>
                        <label style={styles.label}>{t.comment}</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder={t.commentPh}
                            rows={4}
                            style={{ ...styles.input, resize: 'vertical' as const, minHeight: 100 }}
                        />
                    </div>

                    {/* Image Upload */}
                    <div style={styles.field}>
                        <label style={styles.label}>{t.photos}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 8 }}>
                            {images.map((url, i) => (
                                <div key={i} style={{ position: 'relative' as const, width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`Review ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        style={{ position: 'absolute' as const, top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label style={{ width: 72, height: 72, borderRadius: 8, border: '2px dashed #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', fontSize: 24, transition: 'border-color 0.2s' }}>
                                    +
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>
                        {uploading && <p style={{ fontSize: '0.75rem', color: '#c9a961' }}>{t.uploading}</p>}
                    </div>

                    {/* Error */}
                    {error && <p style={{ color: '#e74c3c', fontSize: '0.82rem', margin: '0 0 12px', fontWeight: 600 }}>{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            ...styles.submitBtn,
                            opacity: submitting ? 0.5 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {submitting ? t.submitting : t.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f2ec', padding: '2rem 1rem' },
    card: { background: 'white', borderRadius: 16, padding: '2.5rem 2rem', maxWidth: 520, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
    logo: { fontFamily: "'Jost', 'Montserrat', sans-serif", fontSize: 26, fontWeight: 500, color: '#944f05', letterSpacing: 2, textAlign: 'center', marginBottom: 24 },
    title: { fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', margin: '0 0 4px' },
    subtitle: { fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: '#888', textAlign: 'center', margin: '0 0 24px' },
    form: { display: 'flex', flexDirection: 'column', gap: 0 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
    field: { marginBottom: 16 },
    label: { display: 'block', fontFamily: "'Montserrat', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: 6 },
    input: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' },
    submitBtn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #c9a961, #b8956a)', color: 'white', border: 'none', borderRadius: 30, fontFamily: "'Montserrat', sans-serif", fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em' },
    homeBtn: { display: 'inline-block', marginTop: 20, padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #c9a961, #b8956a)', color: 'white', textDecoration: 'none', borderRadius: 30, fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', fontWeight: 600 },
};

export default function ReviewPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <ReviewForm />
        </Suspense>
    );
}
