'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { FaSearch, FaPhone, FaTruck, FaUndo, FaBox, FaChevronDown, FaChevronUp, FaWhatsapp } from 'react-icons/fa';
import styles from './page.module.css';

interface FAQItem {
    question: string;
    answer: string;
}

interface Category {
    id: string;
    icon: React.ReactNode;
    title: string;
    faqs: FAQItem[];
}

export default function HelpPage() {
    const locale = useLocale();
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);

    // Contact form state
    const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Translations
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            heroTitle: {
                en: 'Hello, How Can We Help You?',
                tr: 'Merhaba, Nasıl Yardımcı Olabiliriz?',
                ru: 'Здравствуйте, чем можем помочь?',
                pl: 'Witaj, jak możemy pomóc?'
            },
            searchPlaceholder: {
                en: 'Search in help page...',
                tr: 'Yardım sayfasında ara...',
                ru: 'Поиск на странице помощи...',
                pl: 'Szukaj na stronie pomocy...'
            },
            callCenter: {
                en: 'Call Center',
                tr: 'Çağrı Merkezi',
                ru: 'Колл-центр',
                pl: 'Centrum telefoniczne'
            },
            workingHours: {
                en: '09:00 - 18:00',
                tr: '09:00 - 18:00',
                ru: '09:00 - 18:00',
                pl: '09:00 - 18:00'
            },
            helpQuestion: {
                en: 'What do you need help with?',
                tr: 'Hangi Konuda Yardıma İhtiyacın Var?',
                ru: 'С чем вам нужна помощь?',
                pl: 'W czym potrzebujesz pomocy?'
            },
            shippingDelivery: {
                en: 'Shipping & Delivery',
                tr: 'Kargo ve Teslimat',
                ru: 'Доставка',
                pl: 'Wysyłka i dostawa'
            },
            cancellationReturn: {
                en: 'Cancellation & Return',
                tr: 'İptal ve İade İşlemleri',
                ru: 'Отмена и возврат',
                pl: 'Anulowanie i zwrot'
            },
            orders: {
                en: 'Orders',
                tr: 'Siparişler',
                ru: 'Заказы',
                pl: 'Zamówienia'
            },
            contact: {
                en: 'Contact',
                tr: 'İletişim',
                ru: 'Контакт',
                pl: 'Kontakt'
            },
            contactSubtitle: {
                en: 'Get in touch with us',
                tr: 'Bizimle iletişime geçin',
                ru: 'Свяжитесь с нами',
                pl: 'Skontaktuj się z nami'
            },
            nameSurname: {
                en: 'Full Name',
                tr: 'Ad Soyad',
                ru: 'ФИО',
                pl: 'Imię i nazwisko'
            },
            phone: {
                en: 'Phone',
                tr: 'Telefon',
                ru: 'Телефон',
                pl: 'Telefon'
            },
            yourMessage: {
                en: 'Your Message',
                tr: 'Mesajınız',
                ru: 'Ваше сообщение',
                pl: 'Twoja wiadomość'
            },
            send: {
                en: 'Send',
                tr: 'Gönder',
                ru: 'Отправить',
                pl: 'Wyślij'
            },
            sending: {
                en: 'Sending...',
                tr: 'Gönderiliyor...',
                ru: 'Отправка...',
                pl: 'Wysyłanie...'
            },
            messageSent: {
                en: 'Your message has been sent successfully!',
                tr: 'Mesajınız başarıyla gönderildi!',
                ru: 'Ваше сообщение успешно отправлено!',
                pl: 'Twoja wiadomość została wysłana!'
            },
            messageError: {
                en: 'Failed to send message. Please try again.',
                tr: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
                ru: 'Не удалось отправить сообщение.',
                pl: 'Nie udało się wysłać wiadomości.'
            },
            writeToUs: {
                en: 'WRITE TO US',
                tr: 'BİZE YAZIN',
                ru: 'НАПИШИТЕ НАМ',
                pl: 'NAPISZ DO NAS'
            },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    // FAQ Data
    const categories: Category[] = [
        {
            id: 'shipping',
            icon: <FaTruck />,
            title: t('shippingDelivery'),
            faqs: locale === 'tr' ? [
                { question: 'Kargo ücreti ne kadar?', answer: 'Türkiye içi siparişlerde 2000 TL ve üzeri alışverişlerde kargo ücretsizdir. 2000 TL altı siparişlerde kargo ücreti 70 TL\'dir.' },
                { question: 'Siparişim ne zaman kargolanır?', answer: 'Siparişiniz ödeme onayından sonra 1-3 iş günü içinde kargoya verilir. Özel üretim ürünlerde bu süre 5-7 iş gününe kadar uzayabilir.' },
                { question: 'Kargo takibi nasıl yapılır?', answer: 'Siparişiniz kargoya verildiğinde size SMS ve e-posta ile kargo takip numarası gönderilir. Ayrıca web sitemizdeki sipariş takip kısmından sipariş numaranızı girerek hem sipariş detayını hem de kargo durumunu görebilirsiniz.' },
                { question: 'Hangi kargo firması ile çalışıyorsunuz?', answer: 'Yurtiçi Kargo, MNG Kargo ve Aras Kargo ile çalışmaktayız. Siparişiniz bölgenize en uygun kargo firması ile gönderilir.' },
                { question: 'Yurt dışına teslimat yapıyor musunuz?', answer: 'Evet, Avrupa ülkelerine teslimat yapıyoruz. Yurt dışı kargo ücretleri ülkeye göre değişiklik göstermektedir.' },
            ] : [
                { question: 'How much is shipping?', answer: 'Shipping rates for international orders vary by country. Please check shipping cost at checkout.' },
                { question: 'When will my order ship?', answer: 'Orders are shipped within 1-3 business days after payment confirmation. Custom products may take 5-7 business days.' },
                { question: 'How can I track my shipment?', answer: 'You will receive an SMS and email with tracking number when your order is shipped.' },
                { question: 'Which shipping carriers do you use?', answer: 'We work with major carriers to ensure fast and reliable delivery.' },
                { question: 'Do you ship internationally?', answer: 'Yes, we ship to European countries. International shipping rates vary by country.' },
            ]
        },
        {
            id: 'returns',
            icon: <FaUndo />,
            title: t('cancellationReturn'),
            faqs: locale === 'tr' ? [
                { question: 'Siparişimi iptal edebilir miyim?', answer: 'Kargoya verilmemiş siparişlerinizi iptal edebilirsiniz. Bunun için müşteri hizmetlerimizi arayarak veya whatsapp kanalı üzerinden iptal talebinde bulunabilirsiniz.' },
                { question: 'İade süreci nasıl işliyor?', answer: 'Ürünü teslim aldıktan sonra 14 gün içinde iade edebilirsiniz. İade için ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.' },
                { question: 'İade kargo ücreti kim tarafından karşılanır?', answer: 'Ürün hatasından kaynaklanan iadelerde kargo ücreti tarafımızca karşılanır. Fikir değişikliği kaynaklı iadelerde kargo ücreti müşteriye aittir.' },
                { question: 'İade ücretim ne zaman hesabıma yatar?', answer: 'İade edilen ürün depomuzda kontrol edildikten sonra 3-5 iş günü içinde ödemeniz iade edilir. Kredi kartı iadeleri banka süreçlerine göre 5-10 iş günü arasında hesabınıza yansır.' },
                { question: 'Hasarlı ürün teslim aldım, ne yapmalıyım?', answer: 'Hasarlı ürün için teslim tarihinden itibaren 48 saat içinde bize ulaşın. Fotoğraf ile durumu bildirmeniz halinde size yeni ürün gönderilecek veya ücret iadesi yapılacaktır.' },
            ] : [
                { question: 'Can I cancel my order?', answer: 'You can cancel orders that have not been shipped yet. Contact customer service or go to your order details to request cancellation.' },
                { question: 'How does the return process work?', answer: 'You can return products within 14 days of delivery. Products must be unused and in original packaging.' },
                { question: 'Who pays for return shipping?', answer: 'We cover return shipping for defective products. For change of mind returns, customer pays shipping.' },
                { question: 'When will I receive my refund?', answer: 'After the returned product is inspected, refund is processed within 3-5 business days.' },
                { question: 'I received a damaged product, what should I do?', answer: 'Contact us within 48 hours of delivery with photos. We will send a replacement or issue a refund.' },
            ]
        },
        {
            id: 'orders',
            icon: <FaBox />,
            title: t('orders'),
            faqs: locale === 'tr' ? [
                { question: 'Sipariş durumumu nasıl öğrenebilirim?', answer: 'Hesabınıza giriş yaparak "Siparişlerim" bölümünden siparişlerinizin durumunu takip edebilirsiniz. Ayrıca sipariş takip sayfamızdan sipariş numaranız ile sorgulama yapabilirsiniz.' },
                { question: 'Sipariş geçmişime nasıl ulaşabilirim?', answer: 'Hesabınıza giriş yaptıktan sonra "Profilim" sayfasındaki "Siparişlerim" sekmesinden tüm geçmiş siparişlerinizi görüntüleyebilirsiniz.' },
                { question: 'Faturamı nereden indirebilirim?', answer: 'Sipariş detay sayfasından e-faturanızı PDF olarak indirebilirsiniz. Ayrıca fatura e-posta adresinize de gönderilmektedir.' },
                { question: 'Sipariş adresimi değiştirebilir miyim?', answer: 'Kargoya verilmemiş siparişlerin teslimat adresi değiştirilebilir. Bunun için müşteri hizmetlerimizi arayabilirsiniz.' },
                { question: 'Toplu sipariş vermek istiyorum, ne yapmalıyım?', answer: 'Toplu siparişler için lütfen iletişim sayfamızdan bizimle iletişime geçin. Size özel fiyat teklifi sunulacaktır.' },
            ] : [
                { question: 'How can I check my order status?', answer: 'Log into your account and go to "My Orders" to track your order status. You can also use our order tracking page.' },
                { question: 'How can I access my order history?', answer: 'After logging in, go to "My Profile" and select "My Orders" tab to view all past orders.' },
                { question: 'Where can I download my invoice?', answer: 'You can download your e-invoice as PDF from the order details page.' },
                { question: 'Can I change my delivery address?', answer: 'Delivery address can be changed for orders not yet shipped. Contact customer service for assistance.' },
                { question: 'I want to place a bulk order, what should I do?', answer: 'For bulk orders, please contact us through our contact page. We will provide a custom quote.' },
            ]
        }
    ];

    const toggleCategory = (categoryId: string) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId);
        setOpenFAQ(null);
    };

    const toggleFAQ = (faqId: string) => {
        setOpenFAQ(openFAQ === faqId ? null : faqId);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormMessage(null);

        try {
            // Simulate API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            // TODO: Send to actual API endpoint
            console.log('Contact form submitted:', formData);

            setFormMessage({ type: 'success', text: t('messageSent') });
            setFormData({ name: '', phone: '', message: '' });
        } catch (error) {
            setFormMessage({ type: 'error', text: t('messageError') });
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter FAQs based on search
    const filteredCategories = searchQuery.length > 2
        ? categories.map(cat => ({
            ...cat,
            faqs: cat.faqs.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(cat => cat.faqs.length > 0)
        : categories;

    return (
        <div className={styles.container}>
            {/* WhatsApp Contact Section */}
            <div className={styles.whatsappSection}>
                <a href="https://wa.me/905010571884" target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
                    <FaWhatsapp className={styles.whatsappIcon} />
                    <span className={styles.whatsappTitle}>{t('writeToUs')}</span>
                    <span className={styles.whatsappNumber}>+90 501 057 18 84</span>
                </a>
            </div>

            {/* Categories Section */}
            <section className={styles.categoriesSection}>
                <h2 className={styles.sectionTitle}>{t('helpQuestion')}</h2>

                <div className={styles.categoriesGrid}>
                    {filteredCategories.map((category) => (
                        <div key={category.id} className={styles.categoryCard}>
                            <button
                                className={`${styles.categoryHeader} ${openCategory === category.id ? styles.active : ''}`}
                                onClick={() => toggleCategory(category.id)}
                            >
                                <span className={styles.categoryIcon}>{category.icon}</span>
                                <span className={styles.categoryTitle}>{category.title}</span>
                                {openCategory === category.id ? (
                                    <FaChevronUp className={styles.categoryArrow} />
                                ) : (
                                    <FaChevronDown className={styles.categoryArrow} />
                                )}
                            </button>

                            {openCategory === category.id && (
                                <div className={styles.faqList}>
                                    {category.faqs.map((faq, index) => {
                                        const faqId = `${category.id}-${index}`;
                                        return (
                                            <div key={faqId} className={styles.faqItem}>
                                                <button
                                                    className={`${styles.faqQuestion} ${openFAQ === faqId ? styles.active : ''}`}
                                                    onClick={() => toggleFAQ(faqId)}
                                                >
                                                    <span>{faq.question}</span>
                                                    {openFAQ === faqId ? (
                                                        <FaChevronUp className={styles.faqArrow} />
                                                    ) : (
                                                        <FaChevronDown className={styles.faqArrow} />
                                                    )}
                                                </button>
                                                {openFAQ === faqId && (
                                                    <div className={styles.faqAnswer}>
                                                        {faq.answer}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
