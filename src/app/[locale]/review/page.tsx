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
        uploadTrackerTitle: isEn ? 'Uploading photos' : 'Fotoğraflar yükleniyor',
        uploadTrackerDone: isEn ? 'All photos uploaded' : 'Tüm fotoğraflar yüklendi',
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
    type ImgItem = { id: string; url: string | null; preview: string; status: 'uploading' | 'done' | 'error' };
    const [images, setImages] = useState<ImgItem[]>([]);
    const isUploading = images.some(img => img.status === 'uploading');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || images.length >= 5) return;

        const remaining = 5 - images.length;
        const filesToUpload = Array.from(files).slice(0, remaining);

        // Create placeholders with local previews immediately
        const newItems: ImgItem[] = filesToUpload.map(f => ({
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            url: null,
            preview: URL.createObjectURL(f),
            status: 'uploading',
        }));
        setImages(prev => [...prev, ...newItems]);

        // Upload all files in parallel
        await Promise.all(filesToUpload.map(async (file, idx) => {
            const id = newItems[idx].id;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.url) {
                    setImages(prev => prev.map(img => img.id === id ? { ...img, url: data.url, status: 'done' } : img));
                } else {
                    console.error('Upload failed:', data.error);
                    if (data.error) setError(data.error);
                    setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
                }
            } catch (err) {
                console.error('Upload exception:', err);
                setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
            }
        }));

        e.target.value = '';
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
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
                    image_urls: images.filter(img => img.status === 'done' && img.url).map(img => img.url!),
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
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes trackerSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
            `}</style>

            {/* Floating Upload Tracker (Google Drive style) */}
            {images.length > 0 && (isUploading || images.some(i => i.status === 'done' || i.status === 'error')) && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, width: 320,
                    background: 'white', borderRadius: 12,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    overflow: 'hidden', zIndex: 9999,
                    animation: 'trackerSlide 0.3s ease-out',
                    fontFamily: "'Montserrat', sans-serif",
                }}>
                    <div style={{
                        background: '#1a1a2e', color: 'white',
                        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: '0.85rem', fontWeight: 600,
                    }}>
                        <span>
                            {isUploading ? t.uploadTrackerTitle : t.uploadTrackerDone}
                            {' '}
                            <span style={{ opacity: 0.7, fontWeight: 500 }}>
                                ({images.filter(i => i.status === 'done').length}/{images.length})
                            </span>
                        </span>
                    </div>
                    <div style={{ height: 3, background: '#e2e8f0' }}>
                        <div style={{
                            height: '100%',
                            width: `${(images.filter(i => i.status !== 'uploading').length / images.length) * 100}%`,
                            background: 'linear-gradient(90deg, #c9a961, #b8956a)',
                            transition: 'width 0.4s ease',
                        }} />
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 0' }}>
                        {images.map((img, idx) => (
                            <div key={img.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 14px',
                                borderBottom: idx < images.length - 1 ? '1px solid #f1f5f9' : 'none',
                            }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.preview} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: '0.78rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {isEn ? `Photo ${idx + 1}` : `Fotoğraf ${idx + 1}`}
                                </span>
                                {img.status === 'uploading' && (
                                    <div style={{
                                        width: 18, height: 18, border: '2px solid #e2e8f0',
                                        borderTopColor: '#c9a961', borderRadius: '50%',
                                        animation: 'spin 0.7s linear infinite', flexShrink: 0,
                                    }} />
                                )}
                                {img.status === 'done' && (
                                    <div style={{
                                        width: 18, height: 18, background: '#22c55e',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 11, animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        flexShrink: 0,
                                    }}>✓</div>
                                )}
                                {img.status === 'error' && (
                                    <div style={{
                                        width: 18, height: 18, background: '#ef4444',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                                    }}>!</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                            {images.map((img, i) => (
                                <div key={img.id} style={{ position: 'relative' as const, width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.preview} alt={`Review ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' as const, opacity: img.status === 'done' ? 1 : 0.5 }} />
                                    {img.status === 'uploading' && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
                                            <div style={{
                                                width: 22, height: 22, border: '2.5px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff', borderRadius: '50%',
                                                animation: 'spin 0.7s linear infinite',
                                            }} />
                                        </div>
                                    )}
                                    {img.status === 'error' && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231,76,60,0.6)', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>!</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img.id)}
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
                        {isUploading && (
                            <p style={{ fontSize: '0.75rem', color: '#c9a961', margin: '4px 0 0' }}>
                                {t.uploading} ({images.filter(i => i.status === 'done').length}/{images.length})
                            </p>
                        )}
                    </div>

                    {/* Error */}
                    {error && <p style={{ color: '#e74c3c', fontSize: '0.82rem', margin: '0 0 12px', fontWeight: 600 }}>{error}</p>}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting || isUploading}
                        style={{
                            ...styles.submitBtn,
                            opacity: (submitting || isUploading) ? 0.5 : 1,
                            cursor: (submitting || isUploading) ? 'not-allowed' : 'pointer',
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
