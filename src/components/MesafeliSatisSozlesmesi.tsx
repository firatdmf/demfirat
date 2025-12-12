'use client';

import { useLocale } from 'next-intl';
import classes from './MesafeliSatisSozlesmesi.module.css';

export default function MesafeliSatisSozlesmesi() {
    const locale = useLocale();

    const t = (key: string): string => {
        const translations: Record<string, Record<string, string>> = {
            title: {
                tr: 'Mesafeli Satış Sözleşmesi',
                en: 'Distance Sales Agreement',
                ru: 'Договор дистанционной продажи',
                pl: 'Umowa sprzedaży na odległość'
            },
            lastUpdate: {
                tr: 'Son güncelleme: 11 Aralık 2025',
                en: 'Last updated: December 11, 2025',
                ru: 'Последнее обновление: 11 декабря 2025',
                pl: 'Ostatnia aktualizacja: 11 grudnia 2025'
            }
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    return (
        <div className={classes.container}>
            <h1>{t('title')}</h1>

            <div className={classes.lastUpdate}>
                {t('lastUpdate')}
            </div>

            {/* 1. TARAFLAR */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '1. TARAFLAR' : '1. PARTIES'}</h2>

                <h3>{locale === 'tr' ? 'SATICI (İşletme)' : 'SELLER (Company)'}</h3>
                <div className={classes.infoBox}>
                    <p><strong>{locale === 'tr' ? 'Ünvan:' : 'Company:'}</strong> KARVEN TEKSTİL SANAYİ VE TİCARET LİMİTED ŞİRKETİ</p>
                    <p><strong>{locale === 'tr' ? 'Adres:' : 'Address:'}</strong> Karven Home Collection, Kemalpaşa Mah Gençtürk Cad No 21A, Fatih, İstanbul 34134, Türkiye</p>
                    <p><strong>{locale === 'tr' ? 'Telefon:' : 'Phone:'}</strong> +90 (501) 057-1884</p>
                    <p><strong>E-posta:</strong> info@demfirat.com</p>
                    <p><strong>Web:</strong> www.demfirat.com</p>
                </div>

                <h3>{locale === 'tr' ? 'ALICI (Tüketici)' : 'BUYER (Consumer)'}</h3>
                <div className={classes.infoBox}>
                    <p><strong>{locale === 'tr' ? 'Ad/Soyad/Unvan:' : 'Name/Title:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'Adres:' : 'Address:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'Telefon:' : 'Phone:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'E-posta/Kullanıcı Adı:' : 'Email/Username:'}</strong></p>
                </div>
            </section>

            {/* 2. SÖZLEŞMENİN KONUSU */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '2. SÖZLEŞMENİN KONUSU' : '2. SUBJECT OF CONTRACT'}</h2>
                <p>{locale === 'tr'
                    ? 'İşbu Sözleşme, ALICI\'nın SATICI\'ya ait www.demfirat.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.'
                    : 'This Agreement regulates the rights and obligations of the parties in accordance with Law No. 6502 on Consumer Protection and the Regulation on Distance Contracts regarding the sale and delivery of the products ordered electronically from www.demfirat.com.'}</p>

                <h3>{locale === 'tr' ? 'Ürün Özellikleri:' : 'Product Features:'}</h3>
                <ul>
                    <li>{locale === 'tr' ? 'Premium ev tekstili ürünleri (perde kumaşları, döşemelik kumaşlar, nevresim takımları, havlu vb.)' : 'Premium home textile products (curtain fabrics, upholstery fabrics, bedding sets, towels, etc.)'}</li>
                    <li>{locale === 'tr' ? 'ISO 9001, NFPA 701, GOTS ve OEKO TEX sertifikalı' : 'ISO 9001, NFPA 701, GOTS and OEKO TEX certified'}</li>
                    <li>{locale === 'tr' ? 'Orijinal ambalajında teslim' : 'Delivered in original packaging'}</li>
                    <li>{locale === 'tr' ? 'Kalite kontrol belgeli' : 'Quality control certified'}</li>
                </ul>
            </section>

            {/* 3. HAK VE YÜKÜMLÜLÜKLER */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '3. TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ' : '3. RIGHTS AND OBLIGATIONS'}</h2>

                <h3>{locale === 'tr' ? 'SATICI\'nın Yükümlülükleri:' : 'SELLER\'s Obligations:'}</h3>
                <ul>
                    <li>{locale === 'tr' ? 'Ürünleri sözleşmede belirtilen kalite ve standartlara uygun olarak teslim etmek' : 'Deliver products in accordance with the quality and standards specified in the contract'}</li>
                    <li>{locale === 'tr' ? 'Ürünleri hasarsız, eksiksiz ve siparişte belirtilen niteliklere uygun olarak ambalajlamak' : 'Package products undamaged, complete and in accordance with the specifications in the order'}</li>
                    <li>{locale === 'tr' ? 'Ürünleri teslim süresine uygun şekilde kargo ile göndermek' : 'Ship products by cargo in accordance with the delivery period'}</li>
                    <li>{locale === 'tr' ? 'ALICI\'nın cayma hakkını kullanması halinde iade işlemlerini gerçekleştirmek' : 'Process returns when BUYER exercises the right of withdrawal'}</li>
                </ul>

                <h3>{locale === 'tr' ? 'ALICI\'nın Yükümlülükleri:' : 'BUYER\'s Obligations:'}</h3>
                <ul>
                    <li>{locale === 'tr' ? 'Sipariş verdiği ürünlerin sözleşme konusu olduğunu kabul etmek' : 'Accept that the products ordered are subject to the contract'}</li>
                    <li>{locale === 'tr' ? 'Ödemeyi zamanında ve eksiksiz yapmak' : 'Make payment on time and in full'}</li>
                    <li>{locale === 'tr' ? 'Ürünü teslim alırken hasar kontrolü yapmak' : 'Check for damage when receiving the product'}</li>
                    <li>{locale === 'tr' ? 'Cayma hakkını kullanacaksa yasal süre içinde bildirmek' : 'Notify within the legal period if exercising the right of withdrawal'}</li>
                </ul>
            </section>

            {/* 4. TESLİMAT VE İADE ŞARTLARI */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '4. TESLİMAT VE İADE ŞARTLARI' : locale === 'ru' ? '4. ДОСТАВКА И УСЛОВИЯ ВОЗВРАТА' : locale === 'pl' ? '4. DOSTAWA I WARUNKI ZWROTU' : '4. DELIVERY AND RETURN CONDITIONS'}</h2>

                <h3>{locale === 'tr' ? 'Teslimat:' : 'Delivery:'}</h3>
                <p><strong>{locale === 'tr' ? 'Teslimat Süresi:' : 'Delivery Time:'}</strong> {locale === 'tr' ? 'Siparişiniz onaylandıktan sonra 1-3 iş günü içinde kargoya verilir. Özel dikim ürünlerde 7 iş günü içinde kargoya verilir.' : 'Your order will be shipped within 1-3 business days after confirmation. Custom sewing products ship within 7 business days.'}</p>
                <p><strong>{locale === 'tr' ? 'Teslimat Adresi:' : 'Delivery Address:'}</strong> {locale === 'tr' ? 'Ürünler, sipariş sırasında belirtilen teslimat adresine teslim edilecektir.' : 'Products will be delivered to the delivery address specified during order.'}</p>
                <p><strong>{locale === 'tr' ? 'Teslimat Şekli:' : 'Delivery Method:'}</strong> {locale === 'tr' ? 'Ürünler, anlaşmalı kargo firması aracılığıyla teslim edilir.' : 'Products are delivered through contracted cargo company.'}</p>

                <h3>{locale === 'tr' ? 'İade Şartları:' : 'Return Conditions:'}</h3>
                <ul>
                    <li>{locale === 'tr' ? 'Ürün teslim tarihinden itibaren 14 gün içinde iade edilebilir.' : 'Product can be returned within 14 days from delivery date.'}</li>
                    <li>{locale === 'tr' ? 'İade edilecek ürünler kullanılmamış ve orijinal ambalajında olmalıdır.' : 'Products to be returned must be unused and in original packaging.'}</li>
                    <li>{locale === 'tr' ? 'Özel dikim ürünler (kişiye özel ölçüde hazırlanan perdeler) iade edilemez.' : 'Custom sewing products (curtains tailored to custom dimensions) cannot be returned.'}</li>
                    <li>{locale === 'tr' ? 'İade kargo ücreti ALICI\'ya aittir.' : 'Return shipping cost is borne by BUYER.'}</li>
                    <li>{locale === 'tr' ? 'İade onayından sonra ücret iadesi 14 iş günü içinde yapılır.' : 'Refund is processed within 14 business days after return approval.'}</li>
                </ul>
            </section>

            {/* 5. ÖDEME */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '5. ÖDEME' : '5. PAYMENT'}</h2>
                <p><strong>{locale === 'tr' ? 'Ödeme Yöntemi:' : 'Payment Method:'}</strong> {locale === 'tr' ? 'Kredi/Banka Kartı veya Havale/EFT ile ödeme yapabilirsiniz.' : 'You can pay by Credit/Debit Card or Bank Transfer.'}</p>
                <p><strong>{locale === 'tr' ? 'Güvenli Ödeme:' : 'Secure Payment:'}</strong> {locale === 'tr' ? 'Tüm kart ödemeleriniz iyzico güvenli ödeme altyapısı ile 3D Secure teknolojisi kullanılarak gerçekleştirilir. Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.' : 'All your card payments are made through iyzico secure payment infrastructure using 3D Secure technology. Your card information is not stored in our system.'}</p>
                <p><strong>{locale === 'tr' ? 'Para Birimi:' : 'Currency:'}</strong> {locale === 'tr' ? 'Ürün fiyatları ayarlardan seçili para birimi üzerinden gösterilmektedir. Kredi kartı ile yapılan ödemelerde, ödeme tutarı seçili para biriminden TRY\'ye çevrilerek bankanızdan çekilir.' : 'Product prices are displayed in the currency selected in settings. For credit card payments, the payment amount is converted from the selected currency to TRY and charged from your bank.'}</p>
                <p><strong>{locale === 'tr' ? 'Not:' : 'Note:'}</strong> {locale === 'tr' ? 'Tüm ürün fiyatları KDV dahildir.' : 'All product prices include VAT.'}</p>
            </section>

            {/* 6. CAYMA HAKKI */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '6. CAYMA HAKKI' : '6. RIGHT OF WITHDRAWAL'}</h2>
                <p>{locale === 'tr' ? 'ALICI, ürünün kendisine veya gösterdiği üçüncü kişiye teslim tarihinden itibaren 14 (on dört) gün içinde cayma hakkına sahiptir.' : 'BUYER has the right to withdraw within 14 (fourteen) days from the date of delivery.'}</p>

                <h3>{locale === 'tr' ? 'Cayma Hakkının Kullanılamayacağı Haller:' : 'Cases Where Right of Withdrawal Cannot Be Exercised:'}</h3>
                <ul>
                    <li>{locale === 'tr' ? 'Özel olarak hazırlanan veya kişiye özel imalatı yapılan ürünler' : 'Products specially prepared or custom made'}</li>
                    <li>{locale === 'tr' ? 'Ambalajı açılmış, kullanılmış veya bozulmuş ürünler' : 'Products with opened packaging, used or deteriorated'}</li>
                    <li>{locale === 'tr' ? 'Hijyen gerekleri nedeniyle iade edilemeyecek ürünler' : 'Products that cannot be returned due to hygiene requirements'}</li>
                </ul>
            </section>

            {/* 7. TEMERRÜT */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '7. TEMERRÜT HALİ VE HUKUKİ SONUÇLARI' : '7. DEFAULT AND LEGAL CONSEQUENCES'}</h2>
                <p>{locale === 'tr'
                    ? 'ALICI, ödeme işlemlerini kredi kartı ile yaptığı durumda temerrüde düştüğü takdirde, kart sahibi banka ile arasındaki kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya karşı sorumlu olacağını kabul, beyan ve taahhüt eder.'
                    : 'BUYER acknowledges, declares and undertakes that in case of default when making payment by credit card, they will pay interest within the framework of the credit card agreement between them and the cardholder bank and will be liable to the bank.'}</p>
            </section>

            {/* 8. FATURA BİLGİLERİ */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '8. FATURA BİLGİLERİ' : '8. INVOICE INFORMATION'}</h2>
                <div className={classes.infoBox}>
                    <p><strong>{locale === 'tr' ? 'Ad/Soyad/Unvan:' : 'Name/Title:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'Adres:' : 'Address:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'Telefon:' : 'Phone:'}</strong></p>
                    <p><strong>{locale === 'tr' ? 'E-posta/Kullanıcı Adı:' : 'Email/Username:'}</strong></p>
                </div>
                <p><strong>{locale === 'tr' ? 'Fatura Teslimi:' : 'Invoice Delivery:'}</strong> {locale === 'tr'
                    ? 'Fatura, sipariş teslimatı sırasında fatura adresine sipariş ile birlikte teslim edilecektir.'
                    : 'Invoice will be delivered together with the order to the invoice address during order delivery.'}</p>
            </section>

            {/* 9. AYIPLI MAL */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '9. AYIPLI MAL VE GARANTİ' : '9. DEFECTIVE GOODS AND WARRANTY'}</h2>
                <p>{locale === 'tr'
                    ? 'Ürün teslimat sırasında hasarlı veya hatalı ise, derhal info@demfirat.com adresine fotoğraflarla birlikte bildiriniz. Ayıplı ürünler ücretsiz olarak değiştirilir veya onarılır.'
                    : 'If the product is damaged or defective during delivery, immediately notify info@demfirat.com with photos. Defective products are replaced or repaired free of charge.'}</p>
            </section>

            {/* 10. UYUŞMAZLIK */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '10. UYUŞMAZLIK ÇÖZÜMÜ' : '10. DISPUTE RESOLUTION'}</h2>
                <p>{locale === 'tr'
                    ? 'İşbu Sözleşme\'nin uygulanmasından kaynaklanan uyuşmazlıkların çözümünde Türk Mahkemeleri ve İcra Müdürlükleri yetkilidir. Sözleşmeden doğabilecek ihtilaflarda, her yıl Sanayi ve Ticaret Bakanlığınca belirlenen parasal sınır dâhilinde Tüketici Hakem Heyetleri ile ALICI\'nın veya SATICI\'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.'
                    : 'Turkish Courts and Enforcement Offices are authorized to resolve disputes arising from the application of this Agreement. Consumer Arbitration Committees and Consumer Courts in the place of residence of BUYER or SELLER are authorized within the monetary limit determined annually by the Ministry of Industry and Trade.'}</p>
            </section>

            {/* 11. SON HÜKÜMLER */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '11. SON HÜKÜMLER' : '11. FINAL PROVISIONS'}</h2>
                <p><strong>{locale === 'tr' ? 'Sözleşmenin Kabulü:' : 'Acceptance of Agreement:'}</strong> {locale === 'tr' ? 'ALICI, sipariş vermekle birlikte işbu Mesafeli Satış Sözleşmesi\'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan ve taahhüt eder.' : 'BUYER declares and undertakes that by placing an order, they have read, understood and accepted all provisions of this Distance Sales Agreement.'}</p>
                <p><strong>{locale === 'tr' ? 'Sözleşmenin Yürürlüğü:' : 'Effectiveness:'}</strong> {locale === 'tr' ? 'İşbu Sözleşme, ALICI tarafından elektronik ortamda onaylanması ile yürürlüğe girer.' : 'This Agreement comes into force upon electronic approval by BUYER.'}</p>
            </section>

            {/* İletişim */}
            <section className={classes.section}>
                <h2>{locale === 'tr' ? '12. İLETİŞİM' : '12. CONTACT'}</h2>
                <div className={classes.infoBox}>
                    <p><strong>Email:</strong> info@demfirat.com</p>
                    <p><strong>{locale === 'tr' ? 'Telefon:' : 'Phone:'}</strong> +90 (501) 057-1884</p>
                    <p><strong>{locale === 'tr' ? 'Adres:' : 'Address:'}</strong> Karven Home Collection, Kemalpaşa Mah Gençtürk Cad No 21A, Fatih, İstanbul 34134, Türkiye</p>
                </div>
            </section>
        </div>
    );
}
