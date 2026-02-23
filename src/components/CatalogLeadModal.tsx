'use client';

import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import styles from './CatalogLeadModal.module.css';

interface CatalogLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>;
    isLoading: boolean;
}

export function CatalogLeadModal({ isOpen, onClose, onSubmit, isLoading }: CatalogLeadModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError('Lütfen tüm alanları doldurunuz.');
            return;
        }

        if (!email.includes('@')) {
            setError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        try {
            await onSubmit({ name, email, phone });
            setName('');
            setEmail('');
            setPhone('');
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyiniz.');
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} disabled={isLoading}>×</button>

                <div className={styles.header}>
                    <h2>Kataloğunuzu İndirin</h2>
                    <p>Bilgilerinizi girin, Karven & Dem Fırat PDF kataloğunu anında e-posta adresinize gönderelim.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Ad Soyad</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Örn: Ayşe Yılmaz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="phone">Telefon Numarası</label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="Örn: 0555 555 55 55"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">E-posta Adresi</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Örn: info@ornek.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContainer}>
                                Gönderiliyor...
                            </span>
                        ) : (
                            'Kataloğu E-postama Gönder'
                        )}
                    </button>

                    <p className={styles.disclaimer}>
                        Bilgileriniz kampanya ve bilgilendirme amaçlı kullanılabilir. Dilediğiniz zaman abonelikten çıkabilirsiniz.
                    </p>
                </form>
            </div>
        </div>
    );
}
