import { memo } from "react";
import classes from "@/components/Footer.module.css";
import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface FooterProps {
  StayConnected: string;
  OurStory: string;
  ContactUs: string;
  AllRightsReserved: string;
  locale: string;
}

function Footer({ StayConnected, OurStory, ContactUs, AllRightsReserved, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      corporate: { en: 'Corporate', tr: 'Kurumsal', ru: 'О компании', pl: 'Firma' },
      products: { en: 'Products', tr: 'Ürünler', ru: 'Продукты', pl: 'Produkty' },
      customerServices: { en: 'Customer Services', tr: 'Müşteri Hizmetleri', ru: 'Обслуживание клиентов', pl: 'Obsługa klienta' },
      contact: { en: 'Contact', tr: 'İletişim', ru: 'Контакты', pl: 'Kontakt' },
      aboutUs: { en: 'About Us', tr: 'Hakkımızda', ru: 'О нас', pl: 'O nas' },
      fabrics: { en: 'Fabrics', tr: 'Kumaşlar', ru: 'Ткани', pl: 'Tkaniny' },
      curtains: { en: 'Ready-Made Curtains', tr: 'Hazır Perde', ru: 'Готовые шторы', pl: 'Gotowe zasłony' },
      solidFabric: { en: 'Solid Fabrics', tr: 'Düz Kumaşlar', ru: 'Однотонные ткани', pl: 'Gładkie tkaniny' },
      embroideredFabric: { en: 'Embroidered Fabrics', tr: 'Nakışlı Kumaşlar', ru: 'Вышитые ткани', pl: 'Haftowane tkaniny' },
      privacyPolicy: { en: 'Privacy Policy & GDPR', tr: 'Gizlilik Sözleşmesi ve KVKK', ru: 'Политика конфиденциальности', pl: 'Polityka prywatności' },
      deliveryReturns: { en: 'Delivery & Returns', tr: 'Teslimat ve İade Şartları', ru: 'Доставка и возврат', pl: 'Dostawa i zwroty' },
      distanceSales: { en: 'Distance Sales Agreement', tr: 'Mesafeli Satış Sözleşmesi', ru: 'Договор дистанционной продажи', pl: 'Umowa sprzedaży na odległość' },
      trackOrder: { en: 'Order Tracking', tr: 'Sipariş Takibi', ru: 'Отслеживание заказов', pl: 'Śledzenie zamówienia' },
      blog: { en: 'Blog', tr: 'Blog', ru: 'Блог', pl: 'Blog' },
      helpSupport: { en: 'Help & Support', tr: 'Yardım & Destek', ru: 'Помощь', pl: 'Pomoc' },
      followUs: { en: 'Follow Us', tr: 'Bizi Takip Edin', ru: 'Подписывайтесь', pl: 'Obserwuj nas' },
      newsletter: { en: 'Stay updated with our latest collections', tr: 'En son koleksiyonlarımızdan haberdar olun', ru: 'Будьте в курсе наших новинок', pl: 'Bądź na bieżąco z nowościami' },
      phone: { en: 'Phone', tr: 'Telefon', ru: 'Телефон', pl: 'Telefon' },
      email: { en: 'Email', tr: 'E-posta', ru: 'Эл. почта', pl: 'E-mail' },
      address: { en: 'Address', tr: 'Adres', ru: 'Адрес', pl: 'Adres' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || translations[key]?.['en'] || key;
  };

  return (
    <footer className={classes.footer}>
      <div className={classes.footerContent}>
        {/* Column 1: Corporate */}
        <div className={classes.column}>
          <h4 className={classes.columnTitle}>{t('corporate')}</h4>
          <ul className={classes.linkList}>
            <li>
              <Link href={`/${locale}/about`}>{t('aboutUs')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`}>{ContactUs}</Link>
            </li>
            <li>
              <Link href={`/${locale}/blog`}>{t('blog')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/kvkk`}>{t('privacyPolicy')}</Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Products */}
        <div className={classes.column}>
          <h4 className={classes.columnTitle}>{t('products')}</h4>
          <ul className={classes.linkList}>
            <li>
              {/* Tül Perdeler (Özel dikim - all custom curtains) */}
              <Link href={`/${locale}/product/fabric?intent=custom_curtain`}>
                {locale === 'tr' ? 'Tül Perdeler (Özel Dikim)' :
                  locale === 'ru' ? 'Тюлевые шторы (Под заказ)' :
                    locale === 'pl' ? 'Tiulowe zasłony (Szyte na miarę)' :
                      'Tulle Curtains (Custom Made)'}
              </Link>
            </li>
            <li>
              {/* Nakışlı Tül Perdeler */}
              <Link href={`/${locale}/product/fabric?fabric_type=embroidery&intent=custom_curtain`}>
                {locale === 'tr' ? 'Nakışlı Tül Perdeler' :
                  locale === 'ru' ? 'Вышитые тюлевые шторы' :
                    locale === 'pl' ? 'Haftowane firanki tiulowe' :
                      'Embroidered Tulle Curtains'}
              </Link>
            </li>
            <li>
              {/* Düz Tül Perdeler */}
              <Link href={`/${locale}/product/fabric?fabric_type=solid&intent=custom_curtain`}>
                {locale === 'tr' ? 'Düz Tül Perdeler' :
                  locale === 'ru' ? 'Однотонные тюлевые шторы' :
                    locale === 'pl' ? 'Gładkie firanki tiulowe' :
                      'Plain Tulle Curtains'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Services */}
        <div className={classes.column}>
          <h4 className={classes.columnTitle}>{t('customerServices')}</h4>
          <ul className={classes.linkList}>
            <li>
              <Link href={`/${locale}/order-tracking`}>{t('trackOrder')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/help`}>{t('helpSupport')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/iade-sartlari`}>{t('deliveryReturns')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/legal/mesafeli-satis-sozlesmesi`}>{t('distanceSales')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/follow-us`}>{t('followUs')}</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className={classes.column}>
          <h4 className={classes.columnTitle}>{t('contact')}</h4>
          <ul className={classes.contactList}>
            <li>
              <FaPhone className={classes.contactIcon} />
              <a href="tel:+905010571884">+90 (501) 057-1884</a>
            </li>
            <li>
              <FaEnvelope className={classes.contactIcon} />
              <a href="mailto:info@demfirat.com">info@demfirat.com</a>
            </li>
            <li>
              <FaMapMarkerAlt className={classes.contactIcon} />
              <span>Ergene, Tekirdağ, Türkiye</span>
            </li>
          </ul>
        </div>

        {/* Column 5: Brand & Social */}
        <div className={classes.brandColumn}>
          <Image
            src="/media/karvenLogo.webp"
            alt="Karven Logo"
            width={150}
            height={50}
            style={{ objectFit: 'contain' }}
            className={classes.logo}
          />
          <p className={classes.tagline}>{t('newsletter')}</p>

          {/* Social Icons */}
          <div className={classes.socialSection}>
            <span className={classes.socialLabel}>{t('followUs')}</span>
            <div className={classes.socialIcons}>
              <Link
                href="https://www.instagram.com/karvenhomedecor/"
                target="_blank"
                className={classes.socialIcon}
                title="Instagram"
              >
                <FaInstagram />
              </Link>
            </div>
          </div>

          {/* Certifications */}
          <div className={classes.certifications}>
            <span>ISO 9001</span>
            <span>NFPA 701</span>
            <span>GOTS</span>
            <span>OEKO TEX</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={classes.bottomBar}>
        <div className={classes.bottomContent}>
          <Image
            src="/image/etbis.jpg"
            alt="Etbise Kayıtlıdır"
            width={80}
            height={80}
            style={{ objectFit: 'contain' }}
            className={classes.etbiseImage}
          />
          <p className={classes.copyright}>
            © {currentYear} Dem Fırat Karven Tekstil San. Tic. Ltd. Şti. | {AllRightsReserved}
          </p>
          <div className={classes.paymentBadge}>
            <Image
              src="/media/iyzico/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
              alt="iyzico ile güvenli ödeme"
              width={250}
              height={30}
              style={{ objectFit: 'contain' }}
              className={classes.iyzicoLogo}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
