"use client";
import React, { useState } from 'react';
import classes from './CatalogRequestForm.module.css';

interface CatalogRequestFormProps {
  locale?: string;
}

export default function CatalogRequestForm({ locale = 'en' }: CatalogRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const translations = {
    en: {
      button: 'Request Catalog',
      title: 'Request Catalog',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      email: 'Email',
      submit: 'Submit Request',
      cancel: 'Cancel',
      success: 'Your request has been submitted successfully!',
      error: 'An error occurred. Please try again.',
    },
    tr: {
      button: 'Katalog İsteyin',
      title: 'Katalog Talebi',
      firstName: 'Ad',
      lastName: 'Soyad',
      phone: 'Telefon',
      email: 'E-posta',
      submit: 'Talep Gönder',
      cancel: 'İptal',
      success: 'Talebiniz başarıyla gönderildi!',
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
    ru: {
      button: 'Запросить каталог',
      title: 'Запрос каталога',
      firstName: 'Имя',
      lastName: 'Фамилия',
      phone: 'Телефон',
      email: 'Эл. почта',
      submit: 'Отправить запрос',
      cancel: 'Отмена',
      success: 'Ваш запрос успешно отправлен!',
      error: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
    },
    pl: {
      button: 'Zamów katalog',
      title: 'Żądanie katalogu',
      firstName: 'Imię',
      lastName: 'Nazwisko',
      phone: 'Telefon',
      email: 'E-mail',
      submit: 'Wyślij żądanie',
      cancel: 'Anuluj',
      success: 'Twoje żądanie zostało pomyślnie wysłane!',
      error: 'Wystąpił błąd. Proszę spróbuj ponownie.',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement API call to save catalog request
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Catalog request:', formData);
      
      setSubmitStatus('success');
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({ firstName: '', lastName: '', phone: '', email: '' });
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting catalog request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <button 
        className={classes.catalogButton}
        onClick={() => setIsOpen(true)}
      >
        {t.button}
      </button>

      {isOpen && (
        <div className={classes.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={classes.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>

            <h2 className={classes.modalTitle}>{t.title}</h2>

            {submitStatus === 'success' ? (
              <div className={classes.successMessage}>
                {t.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.formGroup}>
                  <label htmlFor="firstName">{t.firstName}</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={classes.formGroup}>
                  <label htmlFor="lastName">{t.lastName}</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={classes.formGroup}>
                  <label htmlFor="phone">{t.phone}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={classes.formGroup}>
                  <label htmlFor="email">{t.email}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {submitStatus === 'error' && (
                  <div className={classes.errorMessage}>
                    {t.error}
                  </div>
                )}

                <div className={classes.formActions}>
                  <button
                    type="button"
                    className={classes.cancelButton}
                    onClick={() => setIsOpen(false)}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className={classes.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '...' : t.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
