'use client';

import React from 'react';
import classes from './PreInformationForm.module.css';
import { FaTimes, FaPrint } from 'react-icons/fa';

interface PreInformationFormProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
    userInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
}

const PreInformationForm: React.FC<PreInformationFormProps> = ({
    isOpen,
    onClose,
    locale,
    userInfo
}) => {
    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    const t = (key: string): string => {
        const translations: Record<string, Record<string, string>> = {
            title: {
                tr: 'Ön Bilgilendirme Formu',
                en: 'Preliminary Information Form',
                ru: 'Предварительная информационная форма',
                pl: 'Wstępny formularz informacyjny'
            },
            close: {
                tr: 'Kapat',
                en: 'Close',
                ru: 'Закрыть',
                pl: 'Zamknij'
            },
            print: {
                tr: 'Yazdır',
                en: 'Print',
                ru: 'Печать',
                pl: 'Drukuj'
            },
            seller: {
                tr: 'SATICI BİLGİLERİ',
                en: 'SELLER INFORMATION',
                ru: 'ИНФОРМАЦИЯ О ПРОДАВЦЕ',
                pl: 'INFORMACJE O SPRZEDAWCY'
            },
            buyer: {
                tr: 'ALICI BİLGİLERİ',
                en: 'BUYER INFORMATION',
                ru: 'ИНФОРМАЦИЯ О ПОКУПАТЕЛЕ',
                pl: 'INFORMACJE O KUPUJĄCYM'
            },
            productInfo: {
                tr: 'ÜRÜN/HİZMET BİLGİLERİ',
                en: 'PRODUCT/SERVICE INFORMATION',
                ru: 'ИНФОРМАЦИЯ О ТОВАРЕ/УСЛУГЕ',
                pl: 'INFORMACJE O PRODUKCIE/USŁUDZE'
            },
            paymentInfo: {
                tr: 'ÖDEME VE TESLİMAT BİLGİLERİ',
                en: 'PAYMENT AND DELIVERY INFORMATION',
                ru: 'ИНФОРМАЦИЯ ОБ ОПЛАТЕ И ДОСТАВКЕ',
                pl: 'INFORMACJE O PŁATNOŚCI I DOSTAWIE'
            },
            returnInfo: {
                tr: 'CAYMA HAKKI',
                en: 'RIGHT OF WITHDRAWAL',
                ru: 'ПРАВО ОТКАЗА',
                pl: 'PRAWO ODSTĄPIENIA'
            },
            consumerRights: {
                tr: 'TÜKETİCİ HAKLARI',
                en: 'CONSUMER RIGHTS',
                ru: 'ПРАВА ПОТРЕБИТЕЛЯ',
                pl: 'PRAWA KONSUMENTA'
            }
        };

        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    const sections = [
        {
            title: t('seller'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Ünvan:</strong> KARVEN TEKSTİL SANAYİ VE TİCARET LİMİTED ŞİRKETİ</p>
                    <p><strong>Adres:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Türkiye</p>
                    <p><strong>Telefon:</strong> +90 (501) 057-1884</p>
                    <p><strong>E-posta:</strong> info@demfirat.com</p>
                    <p><strong>Web:</strong> www.demfirat.com</p>
                </>
            ) : locale === 'ru' ? (
                <>
                    <p><strong>Название:</strong> KARVEN TEXTILE INDUSTRY AND TRADE LIMITED COMPANY</p>
                    <p><strong>Адрес:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Турция</p>
                    <p><strong>Телефон:</strong> +90 (501) 057-1884</p>
                    <p><strong>Эл. почта:</strong> info@demfirat.com</p>
                    <p><strong>Сайт:</strong> www.demfirat.com</p>
                </>
            ) : locale === 'pl' ? (
                <>
                    <p><strong>Nazwa:</strong> KARVEN TEXTILE INDUSTRY AND TRADE LIMITED COMPANY</p>
                    <p><strong>Adres:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Turcja</p>
                    <p><strong>Telefon:</strong> +90 (501) 057-1884</p>
                    <p><strong>E-mail:</strong> info@demfirat.com</p>
                    <p><strong>Strona:</strong> www.demfirat.com</p>
                </>
            ) : (
                <>
                    <p><strong>Company:</strong> KARVEN TEXTILE INDUSTRY AND TRADE LIMITED COMPANY</p>
                    <p><strong>Address:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Türkiye</p>
                    <p><strong>Phone:</strong> +90 (501) 057-1884</p>
                    <p><strong>Email:</strong> info@demfirat.com</p>
                    <p><strong>Web:</strong> www.demfirat.com</p>
                </>
            )
        },
        {
            title: t('buyer'),
            content: (
                <>
                    <p><strong>{locale === 'tr' ? 'Ad Soyad' : locale === 'ru' ? 'Имя Фамилия' : locale === 'pl' ? 'Imię nazwisko' : 'Name'}:</strong> {userInfo.firstName} {userInfo.lastName}</p>
                    <p><strong>{locale === 'tr' ? 'E-posta' : locale === 'ru' ? 'Эл. почта' : locale === 'pl' ? 'E-mail' : 'Email'}:</strong> {userInfo.email}</p>
                    <p><strong>{locale === 'tr' ? 'Telefon' : locale === 'ru' ? 'Телефон' : locale === 'pl' ? 'Telefon' : 'Phone'}:</strong> {userInfo.phone}</p>
                </>
            )
        },
        {
            title: t('productInfo'),
            content: locale === 'tr' ? (
                <>
                    <p>Sepetinizdeki ürünlerin özellikleri, satış fiyatları, ödeme şekli ve teslimat koşulları sipariş özeti sayfasında belirtilmiştir.</p>
                    <p>Ürünler özenle paketlenerek, hasarsız olarak teslim edilecektir.</p>
                    <p>Tüm ürünlerimiz kalite kontrolünden geçmiş olup, ISO 9001, NFPA 701, GOTS ve OEKO TEX sertifikalarına sahiptir.</p>
                </>
            ) : locale === 'ru' ? (
                <>
                    <p>Характеристики товаров в вашей корзине, цены, способ оплаты и условия доставки указаны на странице сводки заказа.</p>
                    <p>Товары будут тщательно упакованы и доставлены без повреждений.</p>
                    <p>Все наши продукты прошли контроль качества и имеют сертификаты ISO 9001, NFPA 701, GOTS и OEKO TEX.</p>
                </>
            ) : locale === 'pl' ? (
                <>
                    <p>Specyfikacje produktów w koszyku, ceny, sposób płatności i warunki dostawy są określone na stronie podsumowania zamówienia.</p>
                    <p>Produkty zostaną starannie zapakowane i dostarczone bez uszkodzeń.</p>
                    <p>Wszystkie nasze produkty przeszły kontrolę jakości i posiadają certyfikaty ISO 9001, NFPA 701, GOTS i OEKO TEX.</p>
                </>
            ) : (
                <>
                    <p>The specifications of the products in your cart, sales prices, payment method and delivery conditions are specified on the order summary page.</p>
                    <p>Products will be carefully packaged and delivered undamaged.</p>
                    <p>All our products have passed quality control and have ISO 9001, NFPA 701, GOTS and OEKO TEX certifications.</p>
                </>
            )
        },
        {
            title: t('paymentInfo'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Ödeme Yöntemi:</strong> Kredi/Banka Kartı veya Havale/EFT</p>
                    <p><strong>Güvenli Ödeme:</strong> Tüm ödemelerimiz iyzico güvenli ödeme altyapısı ile 3D Secure teknolojisi kullanılarak gerçekleştirilir.</p>
                    <p><strong>Kargo:</strong> Ücretsiz kargo</p>
                    <p><strong>Teslimat Süresi:</strong> Tüm ürünlerimiz siparişiniz onaylandıktan sonra 1-3 iş günü içinde kargoya verilir.</p>
                    <p><strong>Teslimat Adresi:</strong> Sipariş sırasında belirttiğiniz adrese teslim edilecektir.</p>
                    <p><strong>Önemli Not:</strong> Ödeme tutarı USD cinsinden gösterilmektedir. Kredi kartı ile yapılan ödemelerde, banka tarafından TRY'ye çevrilerek tahsil edilir.</p>
                </>
            ) : locale === 'ru' ? (
                <>
                    <p><strong>Способ оплаты:</strong> Кредитная/дебетовая карта или банковский перевод</p>
                    <p><strong>Безопасная оплата:</strong> Все платежи осуществляются через безопасную платежную инфраструктуру iyzico с использованием технологии 3D Secure.</p>
                    <p><strong>Доставка:</strong> Бесплатная доставка</p>
                    <p><strong>Срок доставки:</strong> После подтверждения заказа доставка в течение 3-7 рабочих дней.</p>
                    <p><strong>Адрес доставки:</strong> Доставка по адресу, указанному при заказе.</p>
                    <p><strong>Важное примечание:</strong> Сумма платежа отображается в долларах США. При оплате кредитной картой сумма конвертируется банком в TRY.</p>
                </>
            ) : locale === 'pl' ? (
                <>
                    <p><strong>Metoda płatności:</strong> Karta kredytowa/debetowa lub przelew bankowy</p>
                    <p><strong>Bezpieczna płatność:</strong> Wszystkie płatności są realizowane przez bezpieczną infrastrukturę płatniczą iyzico z użyciem technologii 3D Secure.</p>
                    <p><strong>Wysyłka:</strong> Bezpłatna wysyłka</p>
                    <p><strong>Czas dostawy:</strong> Po potwierdzeniu zamówienia wysyłka w ciągu 3-7 dni roboczych.</p>
                    <p><strong>Adres dostawy:</strong> Dostawa na adres podany podczas składania zamówienia.</p>
                    <p><strong>Ważna uwaga:</strong> Kwota płatności jest wyświetlana w USD. Przy płatności kartą kredytową kwota jest konwertowana przez bank na TRY.</p>
                </>
            ) : (
                <>
                    <p><strong>Payment Method:</strong> Credit/Debit Card or Bank Transfer</p>
                    <p><strong>Secure Payment:</strong> All payments are made through iyzico secure payment infrastructure using 3D Secure technology.</p>
                    <p><strong>Shipping:</strong> Free shipping</p>
                    <p><strong>Delivery Time:</strong> After order confirmation, shipped within 3-7 business days.</p>
                    <p><strong>Delivery Address:</strong> Delivered to the address specified during order.</p>
                    <p><strong>Important Note:</strong> Payment amount is displayed in USD. Credit card payments are converted to TRY by the bank.</p>
                </>
            )
        },
        {
            title: t('returnInfo'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Cayma Hakkı Süresi:</strong> Ürünü teslim aldığınız tarihten itibaren 14 (on dört) gün içinde cayma hakkınızı kullanabilirsiniz.</p>
                    <p><strong>Cayma Bildirimi:</strong> Cayma hakkınızı kullanmak istediğinizi info@demfirat.com adresine e-posta göndererek veya +90 (501) 057-1884 numaralı telefonu arayarak bildirmeniz gerekmektedir.</p>
                    <p><strong>İade Koşulları:</strong></p>
                    <ul>
                        <li>Ürün kullanılmamış, hasarsız ve orijinal ambalajında olmalıdır</li>
                        <li>Ürünle birlikte gönderilen fatura ve diğer belgeler eksiksiz olmalıdır</li>
                        <li>Özel olarak üretilen veya kişiye özel hazırlanan ürünler iade edilemez</li>
                    </ul>
                    <p><strong>İade İşlemi:</strong> Cayma bildiriminizden sonra 10 gün içinde ürünü iade etmeniz gerekmektedir. İade kargo ücreti müşteriye aittir.</p>
                    <p><strong>Ücret İadesi:</strong> Ürün tarafımıza ulaştıktan sonra 14 gün içinde ödeme iadeniz gerçekleştirilecektir.</p>
                </>
            ) : locale === 'ru' ? (
                <>
                    <p><strong>Срок отказа:</strong> Вы можете использовать право отказа в течение 14 (четырнадцати) дней с даты получения товара.</p>
                    <p><strong>Уведомление об отказе:</strong> Вы должны уведомить о намерении воспользоваться правом отказа, отправив электронное письмо на адрес info@demfirat.com или позвонив по телефону +90 (501) 057-1884.</p>
                    <p><strong>Условия возврата:</strong></p>
                    <ul>
                        <li>Товар должен быть неиспользованным, неповрежденным и в оригинальной упаковке</li>
                        <li>Счет-фактура и другие документы, отправленные с товаром, должны быть в комплекте</li>
                        <li>Заказанные специально или персонализированные товары не подлежат возврату</li>
                    </ul>
                    <p><strong>Процесс возврата:</strong> После уведомления об отказе вы должны вернуть товар в течение 10 дней. Стоимость обратной доставки несет покупатель.</p>
                    <p><strong>Возврат средств:</strong> После получения товара возврат средств будет произведен в течение 14 дней.</p>
                </>
            ) : locale === 'pl' ? (
                <>
                    <p><strong>Okres odstąpienia:</strong> Możesz skorzystać z prawa odstąpienia w ciągu 14 (czternastu) dni od daty otrzymania towaru.</p>
                    <p><strong>Zawiadomienie o odstąpieniu:</strong> Musisz powiadomić o zamiarze skorzystania z prawa odstąpienia, wysyłając e-mail na adres info@demfirat.com lub dzwoniąc pod numer +90 (501) 057-1884.</p>
                    <p><strong>Warunki zwrotu:</strong></p>
                    <ul>
                        <li>Towar musi być nieużywany, nieuszkodzony i w oryginalnym opakowaniu</li>
                        <li>Faktura i inne dokumenty wysłane z towarem muszą być kompletne</li>
                        <li>Towary produkowane na specjalne zamówienie lub spersonalizowane nie podlegają zwrotowi</li>
                    </ul>
                    <p><strong>Proces zwrotu:</strong> Po powiadomieniu o odstąpieniu musisz zwrócić towar w ciągu 10 dni. Koszt zwrotu ponosi kupujący.</p>
                    <p><strong>Zwrot płatności:</strong> Po otrzymaniu towaru zwrot płatności zostanie dokonany w ciągu 14 dni.</p>
                </>
            ) : (
                <>
                    <p><strong>Withdrawal Period:</strong> You can exercise your right of withdrawal within 14 (fourteen) days from the date you receive the product.</p>
                    <p><strong>Withdrawal Notice:</strong> You must notify us of your intention to exercise the right of withdrawal by sending an email to info@demfirat.com or calling +90 (501) 057-1884.</p>
                    <p><strong>Return Conditions:</strong></p>
                    <ul>
                        <li>Product must be unused, undamaged and in its original packaging</li>
                        <li>Invoice and other documents sent with the product must be complete</li>
                        <li>Custom made or personalized products cannot be returned</li>
                    </ul>
                    <p><strong>Return Process:</strong> After withdrawal notice, you must return the product within 10 days. Return shipping cost is borne by the customer.</p>
                    <p><strong>Refund:</strong> After the product reaches us, your refund will be made within 14 days.</p>
                </>
            )
        },
        {
            title: t('consumerRights'),
            content: locale === 'tr' ? (
                <>
                    <p>Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği gereğince düzenlenmiştir.</p>
                    <p><strong>Şikayet ve İtirazlar:</strong></p>
                    <p>Satın almış olduğunuz ürün/hizmet ile ilgili şikâyet ve itirazlarınızı, aşağıdaki kanunda belirtilen parasal sınırlar dâhilinde mal veya hizmeti satın aldığınız veya ikametgâhınızın bulunduğu yerdeki tüketici sorunları hakem heyetine veya tüketici mahkemesine başvurabilirsiniz.</p>
                    <p><strong>Uyuşmazlık Çözümü:</strong></p>
                    <ul>
                        <li>2025 yılı için belirlenen parasal sınır: 149.000,00 TL'nin altında olan uyuşmazlıklarda İl veya İlçe Tüketici Hakem Heyetine, 149.000,00 TL'nin üzerinde olan uyuşmazlıklarda önce arabulucuya başvuru zorunludur.</li>
                        <li>Parasal sınırlar her yıl yeniden değerleme oranında artırılarak uygulanır.</li>
                    </ul>
                    <p><strong>İletişim:</strong> Sorularınız için info@demfirat.com adresine e-posta gönderebilir veya +90 (501) 057-1884 numaralı telefonu arayabilirsiniz.</p>
                </>
            ) : (
                <>
                    <p>This form has been prepared in accordance with the Consumer Protection Law No. 6502 and the Distance Contracts Regulation.</p>
                    <p><strong>Complaints and Objections:</strong></p>
                    <p>You can apply to the consumer arbitration committee or consumer court where you purchased the product/service or where your residence is located, within the monetary limits specified in the law.</p>
                    <p><strong>Dispute Resolution:</strong></p>
                    <ul>
                        <li>For disputes below 149,000.00 TRY, applications can be made to the Provincial or District Consumer Arbitration Committee, and for disputes above 149,000.00 TRY, mandatory mediation is required first.</li>
                        <li>Monetary limits are increased annually by the revaluation rate.</li>
                    </ul>
                    <p><strong>Contact:</strong> For questions, you can send an email to info@demfirat.com or call +90 (501) 057-1884.</p>
                </>
            )
        }
    ];

    return (
        <div className={classes.modalOverlay} onClick={onClose}>
            <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={classes.modalHeader}>
                    <h2>{t('title')}</h2>
                    <div className={classes.headerActions}>
                        <button onClick={handlePrint} className={classes.printBtn} title={t('print')}>
                            <FaPrint /> {t('print')}
                        </button>
                        <button onClick={onClose} className={classes.closeBtn} title={t('close')}>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className={classes.modalBody}>
                    {sections.map((section, index) => (
                        <div key={index} className={classes.section}>
                            <h3>{section.title}</h3>
                            <div className={classes.sectionContent}>
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={classes.modalFooter}>
                    <p className={classes.date}>
                        {locale === 'tr' ? 'Tarih' : locale === 'ru' ? 'Дата' : locale === 'pl' ? 'Data' : 'Date'}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PreInformationForm;
