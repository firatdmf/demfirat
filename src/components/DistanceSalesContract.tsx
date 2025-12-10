import React from 'react';
import classes from './DistanceSalesContract.module.css';
import { FaTimes, FaPrint } from 'react-icons/fa';

interface CartItem {
    id: number;
    product_sku: string;
    variant_sku: string | null;
    quantity: string;
    product_category?: string;
    variant_attributes?: { [key: string]: string };
    is_custom_curtain?: boolean;
    custom_attributes?: {
        mountingType?: string;
        pleatType?: string;
        pleatDensity?: string;
        width?: string;
        height?: string;
        wingType?: string;
    };
    custom_price?: string | number;
    product?: {
        title: string;
        price: string | number | null;
        primary_image: string;
        category?: string;
    };
}

interface DistanceSalesContractProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
    userInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    deliveryAddress?: {
        address: string;
        city: string;
        country: string;
    };
    cartItems?: CartItem[];
}

const DistanceSalesContract: React.FC<DistanceSalesContractProps> = ({
    isOpen,
    onClose,
    locale,
    userInfo,
    deliveryAddress,
    cartItems
}) => {
    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    const t = (key: string): string => {
        const translations: Record<string, Record<string, string>> = {
            title: {
                tr: 'Mesafeli Satış Sözleşmesi',
                en: 'Distance Sales Agreement',
                ru: 'Договор дистанционной продажи',
                pl: 'Umowa sprzedaży na odległość'
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
            parties: {
                tr: 'TARAFLAR',
                en: 'PARTIES',
                ru: 'СТОРОНЫ',
                pl: 'STRONY'
            },
            subjectOfContract: {
                tr: 'SÖZLEŞMENİN KONUSU',
                en: 'SUBJECT OF CONTRACT',
                ru: 'ПРЕДМЕТ ДОГОВОРА',
                pl: 'PRZEDMIOT UMOWY'
            },
            rightsAndObligations: {
                tr: 'TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ',
                en: 'RIGHTS AND OBLIGATIONS OF THE PARTIES',
                ru: 'ПРАВА И ОБЯЗАННОСТИ СТОРОН',
                pl: 'PRAWA I OBOWIĄZKI STRON'
            },
            delivery: {
                tr: 'TESLİMAT',
                en: 'DELIVERY',
                ru: 'ДОСТАВКА',
                pl: 'DOSTAWA'
            },
            payment: {
                tr: 'ÖDEME',
                en: 'PAYMENT',
                ru: 'ОПЛАТА',
                pl: 'PŁATNOŚĆ'
            },
            withdrawal: {
                tr: 'CAYMA HAKKI',
                en: 'RIGHT OF WITHDRAWAL',
                ru: 'ПРАВО ОТКАЗА',
                pl: 'PRAWO ODSTĄPIENIA'
            },
            defectWarranty: {
                tr: 'AYIPLI MAL VE GARANTİ',
                en: 'DEFECTIVE GOODS AND WARRANTY',
                ru: 'ДЕФЕКТНЫЙ ТОВАР И ГАРАНТИЯ',
                pl: 'WADLIWY TOWAR I GWARANCJA'
            },
            disputeResolution: {
                tr: 'UYUŞMAZLIK ÇÖZÜMÜ',
                en: 'DISPUTE RESOLUTION',
                ru: 'РАЗРЕШЕНИЕ СПОРОВ',
                pl: 'ROZWIĄZYWANIE SPORÓW'
            },
            finalProvisions: {
                tr: 'SON HÜKÜMLER',
                en: 'FINAL PROVISIONS',
                ru: 'ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ',
                pl: 'POSTANOWIENIA KOŃCOWE'
            }
        };

        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || key;
    };

    const sections = [
        {
            title: t('parties'),
            content: locale === 'tr' ? (
                <>
                    <h4>SATICI (İşletme)</h4>
                    <p><strong>Ünvan:</strong> KARVEN TEKSTİL SANAYİ VE TİCARET LİMİTED ŞİRKETİ</p>
                    <p><strong>Adres:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Türkiye</p>
                    <p><strong>Telefon:</strong> +90 (501) 057-1884</p>
                    <p><strong>E-posta:</strong> info@demfirat.com</p>
                    <p><strong>Web:</strong> www.demfirat.com</p>

                    <h4>ALICI (Tüketici)</h4>
                    <p><strong>Ad Soyad:</strong> {userInfo.firstName} {userInfo.lastName}</p>
                    <p><strong>E-posta:</strong> {userInfo.email}</p>
                    <p><strong>Telefon:</strong> {userInfo.phone}</p>
                    {deliveryAddress && (
                        <p><strong>Adres:</strong> {deliveryAddress.address}, {deliveryAddress.city}, {deliveryAddress.country}</p>
                    )}
                </>
            ) : (
                <>
                    <h4>SELLER (Company)</h4>
                    <p><strong>Company:</strong> KARVEN TEXTILE INDUSTRY AND TRADE LIMITED COMPANY</p>
                    <p><strong>Address:</strong> Karven Home Collection <br />
                        Kemalpaşa Mah Gençtürk Cad No 21A <br />
                        Fatih, İstanbul 34134 <br />
                        Türkiye</p>
                    <p><strong>Phone:</strong> +90 (501) 057-1884</p>
                    <p><strong>Email:</strong> info@demfirat.com</p>
                    <p><strong>Web:</strong> www.demfirat.com</p>

                    <h4>BUYER (Consumer)</h4>
                    <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Phone:</strong> {userInfo.phone}</p>
                    {deliveryAddress && (
                        <p><strong>Address:</strong> {deliveryAddress.address}, {deliveryAddress.city}, {deliveryAddress.country}</p>
                    )}
                </>
            )
        },
        {
            title: t('subjectOfContract'),
            content: locale === 'tr' ? (
                <>
                    <p>İşbu Sözleşme, ALICI'nın SATICI'ya ait www.demfirat.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.</p>

                    <p><strong>Sözleşme Konusu Ürün/Ürünler:</strong></p>

                    {cartItems && cartItems.length > 0 ? (
                        <table className={classes.productTable}>
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Ürün Adı</th>
                                    <th>Adet/Miktar</th>
                                    <th>Birim Fiyat</th>
                                    <th>Toplam</th>
                                    <th>Özellikler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item, index) => {
                                    const price = item.custom_price || item.product?.price || 0;
                                    const quantity = parseFloat(item.quantity) || 1;
                                    const total = typeof price === 'string' ? parseFloat(price) * quantity : Number(price) * quantity;

                                    return (
                                        <tr key={index}>
                                            <td>{item.product_sku}</td>
                                            <td>{item.product?.title || 'Ürün'}</td>
                                            <td>
                                                {quantity} {item.is_custom_curtain ? 'm²' : 'adet'}
                                            </td>
                                            <td>${typeof price === 'string' ? parseFloat(price).toFixed(2) : Number(price).toFixed(2)}</td>
                                            <td>${total.toFixed(2)}</td>
                                            <td>
                                                {item.is_custom_curtain && item.custom_attributes ? (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        {item.custom_attributes.width && item.custom_attributes.height && (
                                                            <div><strong>Boyut:</strong> {item.custom_attributes.width}cm x {item.custom_attributes.height}cm</div>
                                                        )}
                                                        {item.custom_attributes.pleatType && (
                                                            <div><strong>Dikim:</strong> {item.custom_attributes.pleatType}</div>
                                                        )}
                                                        {item.custom_attributes.mountingType && (
                                                            <div><strong>Monte:</strong> {item.custom_attributes.mountingType}</div>
                                                        )}
                                                        <div><strong>Özel Dikim:</strong> Evet</div>
                                                    </div>
                                                ) : item.variant_attributes ? (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        {Object.entries(item.variant_attributes).map(([key, value]) => (
                                                            <div key={key}><strong>{key}:</strong> {value}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span>Standart</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>Siparişinizde yer alan tüm ürünler bu sözleşme kapsamındadır. Ürünlerin cinsi, türü, miktarı, marka/modeli, rengi, satış bedeli, ödeme şekli ve temel nitelikleri sipariş özeti sayfasında belirtilmiştir.</p>
                    )}

                    <p><strong>Ürün Özellikleri:</strong></p>
                    <ul>
                        <li>Premium ev tekstili ürünleri (perde kumaşları, döşemelik kumaşlar, nevresim takımları, havlu vb.)</li>
                        <li>ISO 9001, NFPA 701, GOTS ve OEKO TEX sertifikalı</li>
                        <li>Orijinal ambalajında teslim</li>
                        <li>Kalite kontrol belgeli</li>
                    </ul>
                </>
            ) : (
                <>
                    <p>This Agreement regulates the rights and obligations of the parties in accordance with Law No. 6502 on Consumer Protection and the Regulation on Distance Contracts regarding the sale and delivery of the product(s) whose characteristics and sales price are specified below, which the BUYER has ordered electronically from the website www.demfirat.com belonging to the SELLER.</p>

                    <p><strong>Contract Products:</strong></p>
                    <p>All products in your order are covered by this agreement. The type, quantity, brand/model, color, sales price, payment method and basic characteristics of the products are specified on the order summary page.</p>

                    <p><strong>Product Features:</strong></p>
                    <ul>
                        <li>Premium home textile products (curtain fabrics, upholstery fabrics, bedding sets, towels, etc.)</li>
                        <li>ISO 9001, NFPA 701, GOTS and OEKO TEX certified</li>
                        <li>Delivered in original packaging</li>
                        <li>Quality control certified</li>
                    </ul>
                </>
            )
        },
        {
            title: t('rightsAndObligations'),
            content: locale === 'tr' ? (
                <>
                    <h4>SATICI'nın Yükümlülükleri:</h4>
                    <ul>
                        <li>Ürünleri sözleşmede belirtilen kalite ve standartlara uygun olarak teslim etmek</li>
                        <li>Ürünleri hasarsız, eksiksiz ve siparişte belirtilen niteliklere uygun olarak ambalajlamak</li>
                        <li>Ürünleri teslim süresine uygun şekilde kargo ile göndermek</li>
                        <li>ALICI'nın cayma hakkını kullanması halinde iade işlemlerini gerçekleştirmek</li>
                        <li>Garanti kapsamındaki ürünlerde gerekli desteği sağlamak</li>
                    </ul>

                    <h4>ALICI'nın Yükümlülükleri:</h4>
                    <ul>
                        <li>Sipariş verdiği ürünlerin sözleşme konusu olduğunu kabul etmek</li>
                        <li>Ödemeyi zamanında ve eksiksiz yapmak</li>
                        <li>Ürünü teslim alırken hasar kontrolü yapmak</li>
                        <li>Cayma hakkını kullanacaksa yasal süre içinde bildirmek</li>
                        <li>İade edilen ürünü kullanılmamış ve ambalajı açılmamış olarak göndermek</li>
                    </ul>
                </>
            ) : (
                <>
                    <h4>SELLER's Obligations:</h4>
                    <ul>
                        <li>Deliver products in accordance with the quality and standards specified in the contract</li>
                        <li>Package products undamaged, complete and in accordance with the specifications stated in the order</li>
                        <li>Ship products by cargo in accordance with the delivery period</li>
                        <li>Process returns when BUYER exercises the right of withdrawal</li>
                        <li>Provide necessary support for products under warranty</li>
                    </ul>

                    <h4>BUYER's Obligations:</h4>
                    <ul>
                        <li>Accept that the products ordered are subject to the contract</li>
                        <li>Make payment on time and in full</li>
                        <li>Check for damage when receiving the product</li>
                        <li>Notify within the legal period if exercising the right of withdrawal</li>
                        <li>Return the product unused and with packaging unopened</li>
                    </ul>
                </>
            )
        },
        {
            title: t('delivery'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Teslimat Süresi:</strong> Siparişiniz onaylandıktan sonra 3-7 iş günü içinde kargoya verilir. Kargo süresi bölgeye göre değişiklik gösterebilir.</p>

                    <p><strong>Teslimat Adresi:</strong> Ürünler, sipariş sırasında belirtilen teslimat adresine teslim edilecektir.</p>

                    <p><strong>Kargo Ücreti:</strong> Tüm siparişlerde kargo ücretsizdir.</p>

                    <p><strong>Teslimat Şekli:</strong> Ürünler, anlaşmalı kargo firması aracılığıyla teslim edilir.</p>

                    <p><strong>Teslim Alma:</strong></p>
                    <ul>
                        <li>Ürünü teslim alırken kargo görevlisi huzurunda ambalajın hasarlı olup olmadığını kontrol ediniz.</li>
                        <li>Hasarlı ürünleri kargo görevlisine teslim etmeyiniz.</li>
                        <li>Teslimat sırasında hasar tespit ederseniz, kargo tutanağı tutularak durumu belgelendirin.</li>
                        <li>Teslim aldıktan sonra ürünü inceleyiniz ve problem olması durumunda 2 gün içinde tarafımıza bildiriniz.</li>
                    </ul>

                    <p><strong>Mücbir Sebepler:</strong> Doğal afet, savaş, terör, ayaklanma, değişen mevzuat ve diğer mücbir sebep halleri nedeniyle teslimat yapmak mümkün değilse, SATICI durumu derhal ALICI'ya bildirir ve teslim süresini uzatabilir veya sipariş iptal edilebilir.</p>
                </>
            ) : (
                <>
                    <p><strong>Delivery Time:</strong> After order confirmation, shipped within 3-7 business days. Shipping time may vary depending on the region.</p>

                    <p><strong>Delivery Address:</strong> Products will be delivered to the delivery address specified during order.</p>

                    <p><strong>Shipping Cost:</strong> Free shipping on all orders.</p>

                    <p><strong>Delivery Method:</strong> Products are delivered through contracted cargo company.</p>

                    <p><strong>Receipt:</strong></p>
                    <ul>
                        <li>Check whether the packaging is damaged in the presence of the cargo officer when receiving the product.</li>
                        <li>Do not accept damaged products from the cargo officer.</li>
                        <li>If you detect damage during delivery, document the situation by keeping a cargo report.</li>
                        <li>Inspect the product after receipt and notify us within 2 days if there is a problem.</li>
                    </ul>

                    <p><strong>Force Majeure:</strong> If delivery is not possible due to natural disasters, war, terrorism, riots, changing legislation and other force majeure situations, SELLER immediately notifies BUYER and may extend delivery time or cancel the order.</p>
                </>
            )
        },
        {
            title: t('payment'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Ödeme Yöntemi:</strong> Kredi/Banka Kartı veya Havale/EFT ile ödeme yapabilirsiniz.</p>

                    <p><strong>Güvenli Ödeme:</strong> Tüm kart ödemeleriniz iyzico güvenli ödeme altyapısı ile 3D Secure teknolojisi kullanılarak gerçekleştirilir. Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.</p>

                    <p><strong>Para Birimi:</strong> Ürün fiyatları USD cinsinden gösterilmektedir. Kredi kartı ile yapılan ödemelerde, ödeme tutarı bankanız tarafından güncel kur üzerinden TRY'ye çevrilerek tahsil edilir.</p>

                    <p><strong>Fiyat Bilgisi:</strong></p>
                    <ul>
                        <li>Listelenen fiyatlar KDV dahildir.</li>
                        <li>Kampanya fiyatları kampanya süresi boyunca geçerlidir.</li>
                        <li>Sipariş onayından sonra fiyat değişikliği yapılmaz.</li>
                    </ul>

                    <p><strong>Ödeme Hatası:</strong> Ödeme işlemi sırasında hata oluşması durumunda, sipariş otomatik olarak iptal edilir. Hatalı tahsilat yapılmışsa, tutar 7-14 iş günü içinde bankanız tarafından hesabınıza iade edilir.</p>
                </>
            ) : (
                <>
                    <p><strong>Payment Method:</strong> You can pay by Credit/Debit Card or Bank Transfer.</p>

                    <p><strong>Secure Payment:</strong> All your card payments are made through iyzico secure payment infrastructure using 3D Secure technology. Your card information is not stored in our system in any way.</p>

                    <p><strong>Currency:</strong> Product prices are displayed in USD. For credit card payments, the payment amount is converted to TRY by your bank at the current exchange rate.</p>

                    <p><strong>Price Information:</strong></p>
                    <ul>
                        <li>Listed prices include VAT.</li>
                        <li>Campaign prices are valid for the campaign period.</li>
                        <li>No price change is made after order confirmation.</li>
                    </ul>

                    <p><strong>Payment Error:</strong> In case of an error during payment, the order is automatically canceled. If an incorrect charge is made, the amount will be refunded to your account by your bank within 7-14 business days.</p>
                </>
            )
        },
        {
            title: t('withdrawal'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Cayma Hakkı Süresi:</strong> ALICI, sözleşme konusu ürünün kendisine veya gösterdiği üçüncü kişiye teslim

                        atı tarihinden itibaren 14 (on dört) gün içinde cayma hakkına sahiptir.</p>

                    <p><strong>Cayma Bildiriminin Yapılması:</strong></p>
                    <p>Cayma hakkınızı kullanmak için info@demfirat.com adresine e-posta göndererek veya +90 (501) 057-1884 numaralı telefonu arayarak cayma iradenizi açık bir şekilde ortaya koyan bir beyanda bulunmanız gerekmektedir.</p>

                    <p><strong>Cayma Hakkının Kullanılmasının Sonuçları:</strong></p>
                    <ul>
                        <li>Cayma bildiriminin tarafımıza ulaşmasından sonra 10 gün içinde ürünü iade etmeniz gerekmektedir.</li>
                        <li>Ürün kullanılmamış, ambalajı açılmamış ve ticari değerini kaybetmemiş olmalıdır.</li>
                        <li>Ürünle birlikte gönderilen fatura ve diğer belgeler eksiksiz iade edilmelidir.</li>
                        <li>İade kargo ücreti ALICI'ya aittir.</li>
                    </ul>

                    <p><strong>Ücret İadesi:</strong></p>
                    <p>Cayma hakkının kullanımından kaynaklanan iade, ürün SATICI'ya ulaştıktan sonra en geç 14 gün içinde tamamlanır. İade ödemesi, tahsil ettiğimiz ödeme aracı ile aynı yöntemle yapılır (kredi kartına iade, havale ile gönderimi tercih edenler için banka hesabına iade).</p>

                    <p><strong>Cayma Hakkının Kullanılamayacağı Haller:</strong></p>
                    <ul>
                        <li>Özel olarak hazırlanan veya kişiye özel imalatı yapılan ürünler</li>
                        <li>Ambalajı açılmış, kullanılmış veya bozulmuş ürünler</li>
                        <li>Hijyen gerekleri nedeniyle iade edilemeyecek ürünler</li>
                    </ul>
                </>
            ) : (
                <>
                    <p><strong>Withdrawal Period:</strong> BUYER has the right to withdraw within 14 (fourteen) days from the date of delivery of the contract product to himself or to a third party indicated by him.</p>

                    <p><strong>Making Withdrawal Notice:</strong></p>
                    <p>To exercise your right of withdrawal, you must inform us of your decision to withdraw by sending an email to info@demfirat.com or calling +90 (501) 057-1884.</p>

                    <p><strong>Effects of Exercising the Right of Withdrawal:</strong></p>
                    <ul>
                        <li>You must return the product within 10 days after the withdrawal notice reaches us.</li>
                        <li>The product must be unused, with packaging unopened and not having lost its commercial value.</li>
                        <li>Invoice and other documents sent with the product must be returned complete.</li>
                        <li>Return shipping cost is borne by BUYER.</li>
                    </ul>

                    <p><strong>Refund:</strong></p>
                    <p>Refund resulting from exercising the right of withdrawal is completed within 14 days at the latest after the product reaches SELLER. Refund payment is made through the same payment method we collected (refund to credit card, bank account refund for those who prefer bank transfer).</p>

                    <p><strong>Cases Where Right of Withdrawal Cannot Be Exercised:</strong></p>
                    <ul>
                        <li>Products specially prepared or custom made</li>
                        <li>Products with opened packaging, used or deteriorated</li>
                        <li>Products that cannot be returned due to hygiene requirements</li>
                    </ul>
                </>
            )
        },
        {
            title: t('defectWarranty'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Ayıplı Mal:</strong> Ürün teslimat sırasında hasarlı veya hatalı ise, derhal info@demfirat.com adresine fotoğraflarla birlikte bildiriniz. Ayıplı ürünler ücretsiz olarak değiştirilir veya onarılır.</p>

                    <p><strong>Üretici Garantisi:</strong> Ürünlerimiz kalite kontrolünden geçmiş olup, üretici garantisi altındadır. Garanti şartları ürün ile birlikte gönderilen garanti belgesinde belirtilmiştir.</p>

                    <p><strong>Garanti Kapsamı:</strong></p>
                    <ul>
                        <li>Üretim hatalarından kaynaklanan kusurlar</li>
                        <li>Malzeme kalitesinden kaynaklanan sorunlar</li>
                        <li>Normal kullanım koşullarında ortaya çıkan arızalar</li>
                    </ul>

                    <p><strong>Garanti Kapsamı Dışı:</strong></p>
                    <ul>
                        <li>Hatalı kullanımdan kaynaklanan hasarlar</li>
                        <li>Yetkisiz servis veya kişiler tarafından yapılan müdahaleler</li>
                        <li>Doğal aşınma ve yıpranma</li>
                    </ul>
                </>
            ) : (
                <>
                    <p><strong>Defective Goods:</strong> If the product is damaged or defective during delivery, immediately notify info@demfirat.com with photos. Defective products are replaced or repaired free of charge.</p>

                    <p><strong>Manufacturer's Warranty:</strong> Our products have passed quality control and are under manufacturer's warranty. Warranty conditions are specified in the warranty document sent with the product.</p>

                    <p><strong>Warranty Coverage:</strong></p>
                    <ul>
                        <li>Defects arising from production errors</li>
                        <li>Problems arising from material quality</li>
                        <li>Failures occurring under normal use conditions</li>
                    </ul>

                    <p><strong>Not Covered by Warranty:</strong></p>
                    <ul>
                        <li>Damage caused by misuse</li>
                        <li>Interventions made by unauthorized service or persons</li>
                        <li>Natural wear and tear</li>
                    </ul>
                </>
            )
        },
        {
            title: t('disputeResolution'),
            content: locale === 'tr' ? (
                <>
                    <p>İşbu Sözleşme'nin uygulanmasından kaynaklanan uyuşmazlıkların çözümünde Türk Mahkemeleri ve İcra Müdürlükleri yetkilidir.</p>

                    <p><strong>Tüketici Hakem Heyeti ve Tüketici Mahkemeleri:</strong></p>
                    <p>Sözleşmeden doğabilecek ihtilaflarda, her yıl Sanayi ve Ticaret Bakanlığınca belirlenen parasal sınır dâhilinde Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.</p>

                    <p><strong>2025 yılı için parasal sınır:</strong></p>
                    <ul>
                        <li>149.000,00 TL'nin altındaki uyuşmazlıklar: İl veya İlçe Tüketici Hakem Heyeti</li>
                        <li>149.000,00 TL'nin üzerindeki uyuşmazlıklar: Önce arabulucuya başvuru zorunlu, sonra Tüketici Mahkemesi</li>
                    </ul>

                    <p><strong>Başvuru Süresi:</strong> Ürünün teslim tarihinden itibaren 3 (üç) yıl içinde başvuruda bulunulabilir.</p>

                    <p><strong>Alternatif Çözüm Yöntemleri:</strong> Taraflar, mahkemeye başvurmadan önce arabuluculuk gibi alternatif uyuşmazlık çözüm yöntemlerine başvurabilirler.</p>
                </>
            ) : (
                <>
                    <p>Turkish Courts and Enforcement Offices are authorized to resolve disputes arising from the application of this Agreement.</p>

                    <p><strong>Consumer Arbitration Committee and Consumer Courts:</strong></p>
                    <p>In disputes that may arise from the contract, Consumer Arbitration Committees and Consumer Courts in the settlement of BUYER or SELLER are authorized within the monetary limit determined annually by the Ministry of Industry and Trade.</p>

                    <p><strong>Monetary limits for 2025:</strong></p>
                    <ul>
                        <li>Disputes below 149,000.00 TRY: Provincial or District Consumer Arbitration Committee</li>
                        <li>Disputes above 149,000.00 TRY: Mandatory mediation first, then Consumer Court</li>
                    </ul>

                    <p><strong>Application Period:</strong> Application can be made within 3 (three) years from the delivery date of the product.</p>

                    <p><strong>Alternative Resolution Methods:</strong> Parties may resort to alternative dispute resolution methods such as mediation before resorting to court.</p>
                </>
            )
        },
        {
            title: t('finalProvisions'),
            content: locale === 'tr' ? (
                <>
                    <p><strong>Sözleşmenin Kabulü:</strong> ALICI, sipariş vermekle birlikte işbu Mesafeli Sat

                        ış Sözleşmesi'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan ve taahhüt eder.</p>

                    <p><strong>Sözleşmenin Yürürlüğü:</strong> İşbu Sözleşme, ALICI tarafından elektronik ortamda onaylanması ile yürürlüğe girer.</p>

                    <p><strong>Değişiklik ve İptal:</strong></p>
                    <ul>
                        <li>SATICI, sözleşme hükümlerinde değişiklik yapma hakkını saklı tutar.</li>
                        <li>Sipariş onayından sonra ALICI, sipariş iptal etmek isterse cayma hakkı şartlarına tabidir.</li>
                        <li>SATICI, stokta bulunmayan ürünlerde siparişi iptal edebilir ve ödemeyi iade edebilir.</li>
                    </ul>

                    <p><strong>Kişisel Verilerin Korunması:</strong> ALICI'nın kişisel verileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenir ve saklanır. Detaylı bilgi için web sitemizdeki Gizlilik Politikası'nı inceleyiniz.</p>

                    <p><strong>İletişim:</strong></p>
                    <p>Sözleşme ile ilgili her türlü soru, öneri ve şikayetleriniz için:</p>
                    <ul>
                        <li>E-posta: info@demfirat.com</li>
                        <li>Telefon: +90 (501) 057-1884</li>
                        <li>Adres: Karven Home Collection <br />
                            Kemalpaşa Mah Gençtürk Cad No 21A <br />
                            Fatih, İstanbul 34134 <br />
                            Türkiye</li>
                    </ul>

                    <p><strong>Sözleşme Nüshaları:</strong> İşbu Sözleşme elektronik ortamda düzenlenmiş olup, bir nüshası ALICI'ya e-posta ile gönderilecektir.</p>
                </>
            ) : (
                <>
                    <p><strong>Acceptance of Agreement:</strong> BUYER declares and undertakes that by placing an order, they have read, understood and accepted all provisions of this Distance Sales Agreement.</p>

                    <p><strong>Effectiveness of Agreement:</strong> This Agreement comes into force upon electronic approval by BUYER.</p>

                    <p><strong>Modification and Cancellation:</strong></p>
                    <ul>
                        <li>SELLER reserves the right to modify the agreement provisions.</li>
                        <li>If BUYER wants to cancel the order after order confirmation, withdrawal right conditions apply.</li>
                        <li>SELLER may cancel the order for out of stock products and refund the payment.</li>
                    </ul>

                    <p><strong>Personal Data Protection:</strong> BUYER's personal data is processed and stored within the scope of Law No. 6698 on Protection of Personal Data. For detailed information, please review our Privacy Policy on our website.</p>

                    <p><strong>Contact:</strong></p>
                    <p>For all questions, suggestions and complaints about the agreement:</p>
                    <ul>
                        <li>Email: info@demfirat.com</li>
                        <li>Phone: +90 (501) 057-1884</li>
                        <li>Address: Karven Home Collection <br />
                            Kemalpaşa Mah Gençtürk Cad No 21A <br />
                            Fatih, İstanbul 34134 <br />
                            Türkiye</li>
                    </ul>

                    <p><strong>Contract Copies:</strong> This Agreement is prepared electronically and a copy will be sent to BUYER by e-mail.</p>
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
                    <div className={classes.signatures}>
                        <div className={classes.signatureBlock}>
                            <p><strong>{locale === 'tr' ? 'SATICI' : locale === 'ru' ? 'ПРОДАВЕЦ' : locale === 'pl' ? 'SPRZEDAWCA' : 'SELLER'}</strong></p>
                            <p>Dem Fırat Karven Tekstil</p>
                        </div>
                        <div className={classes.signatureBlock}>
                            <p><strong>{locale === 'tr' ? 'ALICI' : locale === 'ru' ? 'ПОКУПАТЕЛЬ' : locale === 'pl' ? 'KUPUJĄCY' : 'BUYER'}</strong></p>
                            <p>{userInfo.firstName} {userInfo.lastName}</p>
                            <p className={classes.date}>
                                {locale === 'tr' ? 'Tarih' : locale === 'ru' ? 'Дата' : locale === 'pl' ? 'Data' : 'Date'}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistanceSalesContract;
