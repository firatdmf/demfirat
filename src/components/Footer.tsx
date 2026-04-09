"use client";
import { memo, useState } from "react";
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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === 'loading') return;

    setNewsletterStatus('loading');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_NEJUM_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${backendUrl}/marketing/api/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, name: 'Unknown', phone: '' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMsg(locale === 'tr' ? 'Başarıyla kaydoldunuz!' : locale === 'ru' ? 'Вы успешно подписались!' : locale === 'pl' ? 'Zapisano pomyślnie!' : 'Subscribed successfully!');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.error || (locale === 'tr' ? 'Bir hata oluştu' : 'An error occurred'));
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg(locale === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
    }
  };

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      corporate: { en: 'Corporate', tr: 'Kurumsal', ru: 'О компании', pl: 'Firma' },
      products: { en: 'Products', tr: 'Ürünler', ru: 'Продукты', pl: 'Produkty' },
      customerServices: { en: 'Customer Services', tr: 'Müşteri Hizmetleri', ru: 'Обслуживание клиентов', pl: 'Obsługa klienta' },
      contact: { en: 'Contact', tr: 'İletişim', ru: 'Контакты', pl: 'Kontakt' },
      aboutUs: { en: 'About Us', tr: 'Hakkımızda', ru: 'О нас', pl: 'O nas' },
      privacyPolicy: { en: 'Privacy Policy & GDPR', tr: 'Gizlilik Sözleşmesi ve KVKK', ru: 'Политика конфиденциальности', pl: 'Polityka prywatności' },
      deliveryReturns: { en: 'Delivery & Returns', tr: 'Teslimat ve İade Şartları', ru: 'Доставка и возврат', pl: 'Dostawa i zwroty' },
      distanceSales: { en: 'Distance Sales Agreement', tr: 'Mesafeli Satış Sözleşmesi', ru: 'Договор дистанционной продажи', pl: 'Umowa sprzedaży na odległość' },
      trackOrder: { en: 'Order Tracking', tr: 'Sipariş Takibi', ru: 'Отслеживание заказов', pl: 'Śledzenie zamówienia' },
      blog: { en: 'Blog', tr: 'Blog', ru: 'Блог', pl: 'Blog' },
      helpSupport: { en: 'Help & Support', tr: 'Yardım & Destek', ru: 'Помощь', pl: 'Pomoc' },
      followUs: { en: 'Follow Us', tr: 'Bizi Takip Edin', ru: 'Подписывайтесь', pl: 'Obserwuj nas' },
      newsletter: { en: 'Stay updated with our latest collections', tr: 'En son koleksiyonlarımızdan haberdar olun', ru: 'Будьте в курсе наших новинок', pl: 'Bądź na bieżąco z nowościami' },
      subscribe: { en: 'Subscribe', tr: 'Kaydol', ru: 'Подписаться', pl: 'Subskrybuj' },
      emailPlaceholder: { en: 'Your email', tr: 'E-posta adresiniz', ru: 'Ваш email', pl: 'Twój e-mail' },
      getOnList: { en: 'Get on the List', tr: 'Listede Yerinizi Alın', ru: 'Подпишитесь', pl: 'Zapisz się' },
      signUpText: { en: 'Sign up to know when we launch new products.', tr: 'Yeni ürünlerimizden haberdar olun.', ru: 'Узнавайте первыми о новинках.', pl: 'Bądź na bieżąco z nowymi produktami.' },
      contactUs: { en: 'Contact Us', tr: 'Bize Ulaşın', ru: 'Свяжитесь с нами', pl: 'Skontaktuj się' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || translations[key]?.['en'] || key;
  };

  return (
    <footer className={classes.footer}>
      {/* Top: Link columns + Newsletter */}
      <div className={classes.topLayer}>
        <div className={classes.topContent}>
          {/* Column 1: Corporate */}
          <div className={classes.column}>
            <h4 className={classes.columnTitle}>{t('corporate')}</h4>
            <ul className={classes.linkList}>
              <li><Link href={`/${locale}/about`}>{t('aboutUs')}</Link></li>
              <li><Link href={`/${locale}/contact`}>{t('contactUs')}</Link></li>
              <li><Link href={`/${locale}/blog`}>{t('blog')}</Link></li>
              <li><Link href={`/${locale}/kvkk`}>{t('privacyPolicy')}</Link></li>
              <li><Link href={`/${locale}/legal/mesafeli-satis-sozlesmesi`}>{t('distanceSales')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Products */}
          <div className={classes.column}>
            <h4 className={classes.columnTitle}>{t('products')}</h4>
            <ul className={classes.linkList}>
              <li>
                <Link href={`/${locale}/product/fabric?intent=custom_curtain`}>
                  {locale === 'tr' ? 'Tül Perdeler (Özel Dikim)' :
                    locale === 'ru' ? 'Тюлевые шторы (Под заказ)' :
                      locale === 'pl' ? 'Tiulowe zasłony (Szyte na miarę)' :
                        'Tulle Curtains (Custom Made)'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/product/fabric?fabric_type=embroidery&intent=custom_curtain`}>
                  {locale === 'tr' ? 'Nakışlı Tül Perdeler' :
                    locale === 'ru' ? 'Вышитые тюлевые шторы' :
                      locale === 'pl' ? 'Haftowane firanki tiulowe' :
                        'Embroidered Tulle Curtains'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/product/fabric?fabric_type=solid&intent=custom_curtain`}>
                  {locale === 'tr' ? 'Düz Tül Perdeler' :
                    locale === 'ru' ? 'Однотонные тюлевые шторы' :
                      locale === 'pl' ? 'Gładkie firanki tiulowe' :
                        'Plain Tulle Curtains'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/product/ready-made_curtain`}>
                  {locale === 'tr' ? 'Hazır Perdeler' :
                    locale === 'ru' ? 'Готовые шторы' :
                      locale === 'pl' ? 'Gotowe zasłony' :
                        'Ready-Made Curtains'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Services */}
          <div className={classes.column}>
            <h4 className={classes.columnTitle}>{t('customerServices')}</h4>
            <ul className={classes.linkList}>
              <li><Link href={`/${locale}/order-tracking`}>{t('trackOrder')}</Link></li>
              <li><Link href={`/${locale}/help`}>{t('helpSupport')}</Link></li>
              <li><Link href={`/${locale}/iade-sartlari`}>{t('deliveryReturns')}</Link></li>
              <li><Link href={`/${locale}/legal/mesafeli-satis-sozlesmesi`}>{t('distanceSales')}</Link></li>
              <li><Link href={`/${locale}/follow-us`}>{t('followUs')}</Link></li>
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
                <span>Fatih, İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div className={classes.newsletterColumn}>
            <h4 className={classes.newsletterTitle}>{t('getOnList')}</h4>
            <p className={classes.newsletterDesc}>{t('signUpText')}</p>
            <form className={classes.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className={classes.newsletterInput}
                value={newsletterEmail}
                onChange={(e) => { setNewsletterEmail(e.target.value); if (newsletterStatus !== 'idle') setNewsletterStatus('idle'); }}
                required
              />
              <button type="submit" className={classes.newsletterBtn} disabled={newsletterStatus === 'loading'}>
                {newsletterStatus === 'loading' ? '...' : '→'}
              </button>
            </form>
            {newsletterStatus !== 'idle' && (
              <p className={`${classes.newsletterMsg} ${newsletterStatus === 'success' ? classes.newsletterSuccess : classes.newsletterError}`}>
                {newsletterMsg}
              </p>
            )}
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={classes.bottomBar}>
        <div className={classes.bottomContent}>
          <Image
            src="/image/etbis.jpg"
            alt="ETBİS'e Kayıtlıdır"
            width={48}
            height={48}
            style={{ objectFit: 'contain' }}
            className={classes.etbisImage}
          />
          <div className={classes.certRow}>
            <span>ISO 9001</span>
            <span>NFPA 701</span>
            <span>GOTS</span>
            <span>OEKO-TEX</span>
          </div>
          <p className={classes.copyright}>
            © {currentYear} DEMFIRAT
          </p>
          <Image
            src="/media/iyzico/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
            alt="iyzico ile güvenli ödeme"
            width={300}
            height={36}
            style={{ objectFit: 'contain' }}
            className={classes.iyzicoLogo}
          />
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
