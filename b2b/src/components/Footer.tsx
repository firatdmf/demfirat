'use client';

import { useLocale, useTranslations } from 'next-intl';
import Icon from './Icon';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  // DEMFIRAT footer columns — season grouping intentionally removed
  // (no season concept in the curtain/home-textile catalog).
  const cols = [
    {
      title: t('categories'),
      links: ['Tül Perdeler', 'Fon Perdeler', 'Rustik Perdeler'],
    },
    {
      title: locale === 'tr' ? 'Yatak Odası' : 'Bedroom',
      links: ['Nevresim Takımları', 'Çarşaflar', 'Yastık Kılıfları', 'Oxford Yastık Kılıfı'],
    },
    {
      title: t('wholesale'),
      links: ['Sipariş kuralları', 'Teslimat & kargo', 'İade & değişim', 'KDV & faturalama'],
    },
  ];

  return (
    <footer className="bel-footer">
      {/* Newsletter block removed — B2B wholesale doesn't run seasonal
          collection emails ("Yeni sezon önce sizde"), so the signup form
          was misleading for this audience. */}

      <div className="bel-container foot-grid">
        <div className="foot-brand">
          <div className="logo-word" style={{ fontSize: 36, color: '#944f05', letterSpacing: 3 }}>DEMFIRAT</div>
          <p className="bel-meta foot-brand-tag">{t('tagline')}</p>
          <div className="foot-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" aria-label="Instagram">
              <Icon name="instagram" size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
              <Icon name="linkedin" size={18} />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer noopener" aria-label="WhatsApp">
              <Icon name="whatsapp" size={18} />
            </a>
          </div>
          <div className="foot-mono">DMF-WS-2026 · v1.0</div>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="foot-col">
            <div className="bel-eyebrow">{c.title}</div>
            <ul>
              {c.links.map((l) => (
                <li key={l}>
                  <a>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="foot-col foot-contact">
          <div className="bel-eyebrow">{t('contact')}</div>
          <ul>
            <li>
              <Icon name="phone" size={14} />
              <a href="tel:+902122223344">+90 (212) 222 33 44</a>
            </li>
            <li>
              <Icon name="mail" size={14} />
              <a href="mailto:info@demfirat.com">info@demfirat.com</a>
            </li>
            <li>
              <Icon name="mapPin" size={14} />
              <span>Laleli, İstanbul · Türkiye</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bel-container foot-bottom">
        <span className="bel-meta">
          © {currentYear} DEMFIRAT Hometextile. {t('rights')}
        </span>
        <div className="foot-certs">
          <span>OEKO-TEX 100</span>
          <span>·</span>
          <span>ISO 9001</span>
          <span>·</span>
          <span>GOTS</span>
          <span>·</span>
          <span>BSCI</span>
        </div>
        <div className="foot-legal">
          <a>KVKK</a>
          <span>·</span>
          <a>{locale === 'tr' ? 'Gizlilik' : 'Privacy'}</a>
          <span>·</span>
          <a>{locale === 'tr' ? 'Çerezler' : 'Cookies'}</a>
        </div>
      </div>
    </footer>
  );
}
