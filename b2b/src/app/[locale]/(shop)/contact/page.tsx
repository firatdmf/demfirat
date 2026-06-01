'use client';

import { useParams } from 'next/navigation';
import type { Locale } from '@/i18n';

// Note: metadata export removed because this is now a Client Component.
// Set page <title> via parent (shop)/layout or add a separate <head> tag if needed.

export default function ContactPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'tr';
  const isEn = locale === 'en';

  return (
    <>
      {/* HERO */}
      <section className="bel-section" style={{ background: 'var(--bel-paper-2)', paddingTop: 96, paddingBottom: 64, borderBottom: '1px solid var(--bel-line)' }}>
        <div className="bel-container">
          <div className="bel-eyebrow" style={{ marginBottom: 14, color: '#944f05' }}>
            {isEn ? 'Contact · Wholesale' : 'İletişim · Toptan'}
          </div>
          <h1
            style={{
              fontFamily: 'var(--bel-font-display)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              fontWeight: 400,
              margin: 0,
              maxWidth: 720,
            }}
          >
            {isEn ? (
              <>Talk to <em style={{ fontStyle: 'italic', color: '#944f05' }}>wholesale.</em></>
            ) : (
              <>Toptanla <em style={{ fontStyle: 'italic', color: '#944f05' }}>konuşalım.</em></>
            )}
          </h1>
          <p style={{ maxWidth: 560, marginTop: 18, fontSize: 16, lineHeight: 1.65, color: 'var(--bel-ink-2)', fontFamily: 'var(--bel-font-body)' }}>
            {isEn
              ? 'Quotes, lookbook requests, sample orders or anything else — we usually reply within 24 business hours.'
              : 'Fiyat teklifi, lookbook talebi, numune siparişi veya başka bir konu — genellikle 24 iş saati içinde döneriz.'}
          </p>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section className="bel-section" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <div className="bel-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)', gap: 64, alignItems: 'flex-start' }}>
          {/* LEFT — channels */}
          <div>
            <div className="bel-eyebrow" style={{ marginBottom: 24 }}>{isEn ? 'Direct lines' : 'Direkt kanallar'}</div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--bel-ink-3)', marginBottom: 6 }}>
                {isEn ? 'Email' : 'E-posta'}
              </div>
              <a href="mailto:info@demfirat.com" style={{ display: 'block', fontFamily: 'var(--bel-font-display)', fontSize: 24, fontWeight: 500, color: '#944f05', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                info@demfirat.com
              </a>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--bel-ink-3)', marginBottom: 6 }}>
                {isEn ? 'Phone' : 'Telefon'}
              </div>
              <a href="tel:+902122223344" style={{ display: 'block', fontFamily: 'var(--bel-font-display)', fontSize: 24, fontWeight: 500, color: '#944f05', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                +90 (212) 222 33 44
              </a>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--bel-ink-3)', marginBottom: 6 }}>
                {isEn ? 'WhatsApp' : 'WhatsApp'}
              </div>
              <a href="https://wa.me/902122223344" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontFamily: 'var(--bel-font-display)', fontSize: 24, fontWeight: 500, color: '#944f05', textDecoration: 'none', letterSpacing: '-0.01em' }}>
                {isEn ? 'Message us →' : 'Mesaj at →'}
              </a>
            </div>

            <div style={{ borderTop: '1px solid var(--bel-line)', paddingTop: 24, marginTop: 32 }}>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--bel-ink-3)', marginBottom: 8 }}>
                {isEn ? 'Showroom' : 'Showroom'}
              </div>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--bel-ink)' }}>
                Laleli, İstanbul · Türkiye
              </div>
              <div style={{ fontFamily: 'var(--bel-font-body)', fontSize: 13, color: 'var(--bel-ink-3)', marginTop: 4 }}>
                {isEn ? 'Mon–Sat · 09:00 – 18:00 (GMT+3)' : 'Pzt–Cmt · 09:00 – 18:00 (GMT+3)'}
              </div>
            </div>
          </div>

          {/* RIGHT — form */}
          <div>
            <div className="bel-eyebrow" style={{ marginBottom: 24 }}>{isEn ? 'Or write to us' : 'Veya yazın'}</div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={fieldLabel}>{isEn ? 'Company' : 'Firma'}</label>
                  <input type="text" required style={fieldInput} />
                </div>
                <div>
                  <label style={fieldLabel}>{isEn ? 'Full name' : 'Ad Soyad'}</label>
                  <input type="text" required style={fieldInput} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={fieldLabel}>{isEn ? 'Email' : 'E-posta'}</label>
                  <input type="email" required style={fieldInput} />
                </div>
                <div>
                  <label style={fieldLabel}>{isEn ? 'Phone' : 'Telefon'}</label>
                  <input type="tel" style={fieldInput} />
                </div>
              </div>
              <div>
                <label style={fieldLabel}>{isEn ? 'What can we help with?' : 'Konu'}</label>
                <select style={fieldInput}>
                  <option>{isEn ? 'Wholesale account application' : 'Toptan hesap başvurusu'}</option>
                  <option>{isEn ? 'Quote / sample request' : 'Fiyat teklifi / numune talebi'}</option>
                  <option>{isEn ? 'Existing order' : 'Mevcut sipariş'}</option>
                  <option>{isEn ? 'Other' : 'Diğer'}</option>
                </select>
              </div>
              <div>
                <label style={fieldLabel}>{isEn ? 'Message' : 'Mesaj'}</label>
                <textarea rows={5} style={{ ...fieldInput, resize: 'vertical', fontFamily: 'var(--bel-font-body)' }} />
              </div>
              <button
                type="submit"
                className="hero-c-btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
                onClick={(e) => {
                  e.preventDefault();
                  alert(isEn ? 'Form is a placeholder — wire it up later.' : 'Form taslak — sonradan bağlanacak.');
                }}
              >
                <span>{isEn ? 'Send message' : 'Gönder'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <p style={{ fontSize: 12, color: 'var(--bel-ink-3)', margin: 0, fontFamily: 'var(--bel-font-body)' }}>
                {isEn ? 'This form is currently a placeholder — emails go directly to info@demfirat.com for now.' : 'Form şu an taslak — mesajlar şimdilik doğrudan info@demfirat.com\'a gidiyor.'}
              </p>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .bel-container[style*="grid-template-columns: minmax(0,5fr)"] { grid-template-columns: 1fr !important; gap: 48px !important; }
          .bel-container[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #944f05 !important;
          box-shadow: 0 0 0 3px rgba(148,79,5,0.10);
        }
      `}</style>
    </>
  );
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--bel-font-body)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'var(--bel-ink-3)',
  marginBottom: 8,
};

const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--bel-line)',
  background: 'var(--bel-white)',
  fontFamily: 'var(--bel-font-body)',
  fontSize: 14,
  color: 'var(--bel-ink)',
  borderRadius: 4,
  transition: 'border-color 140ms, box-shadow 140ms',
  boxSizing: 'border-box',
};
