import classes from "@/components/Footer.module.css";
import Link from "next/link";

interface FooterProps {
  StayConnected: string;
  OurStory: string;
  ContactUs: string;
  AllRightsReserved: string;
  locale: string;
}

function Footer({ StayConnected, OurStory, ContactUs, AllRightsReserved, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    <div className={classes.FooterPage}>
      <div className={classes.footerMenu}>
        {/* Company Info */}
        <div className={classes.col1}>
          <h3>Karven</h3>
          <p className={classes.description}>
            {locale === 'tr' ? "1991'den beri özenle seçilmiş evler için lüks perde kumaşları üretiyoruz" :
              locale === 'ru' ? 'С 1991 года создаем роскошные ткани для изысканных домов' :
                locale === 'pl' ? 'Od 1991 roku tworzymy luksusowe tkaniny zasłonowe dla wymagających domów' :
                  locale === 'de' ? 'Seit 1991 fertigen wir luxuriöse Vorhangstoffe für anspruchsvolle Eigenheime' :
                    'Crafting luxury curtain fabrics for discerning homes since 1991'}
          </p>
          <div className={classes.socialIcons}>
            <Link
              href="https://www.instagram.com/karvenhomedecor/"
              target="_blank"
              className={classes.socialIcon}
              title="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Links - Modern Layout without Header */}
        <div className={classes.col2}>
          <ul>
            <Link href="/about" id={classes.link}>
              <li>{OurStory}</li>
            </Link>
            <Link href="/product" id={classes.link}>
              <li>{locale === 'tr' ? 'Ürünler' :
                locale === 'ru' ? 'Продукты' :
                  locale === 'pl' ? 'Produkty' :
                    locale === 'de' ? 'Produkte' :
                      'Products'}</li>
            </Link>
            <Link href="/contact" id={classes.link}>
              <li>{ContactUs}</li>
            </Link>
            <Link href={`/${locale}/kvkk`} id={classes.link}>
              <li>{locale === 'tr' ? 'KVKK' :
                locale === 'ru' ? 'Защита данных' :
                  locale === 'pl' ? 'Ochrona danych' :
                    'GDPR'}</li>
            </Link>
            <Link href={`/${locale}/iade-sartlari`} id={classes.link}>
              <li>{locale === 'tr' ? 'İade Şartları' :
                locale === 'ru' ? 'Возвраты' :
                  locale === 'pl' ? 'Zwroty' :
                    'Returns'}</li>
            </Link>
          </ul>
        </div>

        {/* Contact - Modern Layout without Header */}
        <div className={classes.col3}>
          <ul className={classes.contactList}>
            <li>
              <strong>{locale === 'tr' ? 'Adres:' :
                locale === 'ru' ? 'Адрес:' :
                  locale === 'pl' ? 'Adres:' :
                    locale === 'de' ? 'Adresse:' :
                      'Address:'}</strong><br />
              VAKIFLAR OSB MAH D100 CAD NO 38<br />
              ERGENE TEKIRDAG, 59930<br />
              TURKIYE
            </li>
            <li>
              <strong>{locale === 'tr' ? 'Telefon:' :
                locale === 'ru' ? 'Телефон:' :
                  locale === 'pl' ? 'Telefon:' :
                    locale === 'de' ? 'Telefon:' :
                      'Phone:'}</strong><br />
              <a href="tel:+905010571884">+90 (501) 057-1884</a>
            </li>
            <li>
              <strong>Email:</strong><br />
              <a href="mailto:info@demfirat.com">info@demfirat.com</a>
            </li>
          </ul>
        </div>

        {/* Logo & Certifications */}
        <div className={classes.col4}>
          <img
            className={classes.karvenLogo}
            src="/media/karvenLogo.webp"
            alt="Karven Logo"
          />
          <div className={classes.certifications}>
            <span>ISO 9001</span> | <span>NFPA 701</span> | <span>GOTS</span> | <span>OEKO TEX</span>
          </div>
          {/* iyzico Secure Payment Badge */}
          <div className={classes.iyzicoFooterBadge}>
            <img
              src="/media/iyzico/footer_iyzico_ile_ode/Colored/logo_band_colored.svg"
              alt="iyzico ile güvenli ödeme"
              className={classes.iyzicoFooterLogo}
            />
          </div>
        </div>
      </div>

      <div className={classes.copyright}>
        <p>© {currentYear} Karven | {AllRightsReserved}</p>
        <div className={classes.footerLinks}>
          <Link href={`/${locale}/kvkk`} id={classes.link}>
            {locale === 'tr' ? 'Gizlilik Politikası' :
              locale === 'ru' ? 'Политика конфиденциальности' :
                locale === 'pl' ? 'Polityka prywatności' :
                  locale === 'de' ? 'Datenschutz' :
                    'Privacy Policy'}
          </Link>
          <Link href={`/${locale}/mesafeli-satis`} id={classes.link}>
            {locale === 'tr' ? 'Hizmet Koşulları' :
              locale === 'ru' ? 'Условия обслуживания' :
                locale === 'pl' ? 'Warunki usługi' :
                  locale === 'de' ? 'Nutzungsbedingungen' :
                    'Terms of Service'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
