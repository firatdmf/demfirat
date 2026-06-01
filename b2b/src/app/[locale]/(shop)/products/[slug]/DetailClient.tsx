'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/Icon';
import { useCart } from '@/contexts/CartContext';
import { stockColor } from '@/lib/format';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types/product';

type Props = { locale: 'tr' | 'en'; product: Product; related: Product[] };

export default function DetailClient({ locale, product, related }: Props) {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const cart = useCart();
  const { convertPrice } = useCurrency();
  const { user } = useAuth();
  const { isFav, toggle: toggleFav } = useFavorites();

  type AccordionKey = 'about' | 'features' | 'pack' | 'care' | 'delivery' | 'returns';
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(2);
  const [openPanel, setOpenPanel] = useState<AccordionKey | null>('about');
  const togglePanel = (key: AccordionKey) =>
    setOpenPanel((cur) => (cur === key ? null : key));

  // Split bilingual care string into bullet items by " · ", "·", "," or "."
  const careItems = (() => {
    const raw = product.care?.[locale] || '';
    return raw.split(/\s*[·,.]\s*/).map((s) => s.trim()).filter(Boolean);
  })();

  // Description body — keep first character separate for dropcap
  const descBody = product.longDescription?.[locale] || product.description[locale] || '';
  const dropcap = descBody.charAt(0);
  const descRest = descBody.slice(1);

  const variant = colors[colorIdx];
  const variantStock = variant?.stock ?? 0;
  const dotColor = stockColor(variantStock);

  const onAdd = () => {
    if (!variant) return;
    const sizeChoice = sizes[sizeIdx];
    cart.add({
      productId: product.id,
      productSku: product.sku,
      // Composite variant key: "<colorId>-<sizeId>". When hydrating
      // from Django, the cart context splits this back apart to look
      // up the right color/size labels.
      variantSku: sizeChoice ? `${variant.id}-${sizeChoice.id}` : variant.id,
      name: product.name,
      category: product.category,
      variant: variant.label,
      size: sizeChoice?.label ?? '-',
      qty,
      price: product.price,
      bg: variant.bg,
    });
  };

  return (
    <div>
      <section className="bel-detail">
        <div className="bel-container detail-row">
          <div className="detail-gallery">
            <div className="gal-thumbs">
              {colors.slice(0, 4).map((c, i) => (
                <button
                  key={c.id}
                  className={`gal-thumb ${i === colorIdx ? 'on' : ''}`}
                  style={{ background: c.bg }}
                  onClick={() => setColorIdx(i)}
                  aria-label={c.label[locale]}
                />
              ))}
            </div>
            <div className="gal-main" style={{ background: variant?.bg ?? product.bg }}>
              <span className="gal-num">
                01 / {String(colors.length).padStart(2, '0')}
              </span>
              <span className="gal-cat">{variant?.label[locale]}</span>
            </div>
          </div>

          <div className="detail-info">
            <div className="bel-eyebrow">
              {product.category[locale]} · {t('skuLabel')} {product.sku}
            </div>
            <h1 className="bel-h2" style={{ marginTop: 16, fontFamily: 'var(--bel-font-display)' }}>
              {product.name[locale]}
            </h1>
            <div className="detail-price-row">
              <span className="detail-price">{convertPrice(product.price)}</span>
              <span className="detail-price-meta">{t('perPack')}</span>
            </div>

            <div className="detail-vsel">
              {colors.length >= 1 && (
                <div className="vsel-row">
                  <div className="vsel-head">
                    <span className="bel-eyebrow">
                      {t('color')} · {colors.length}
                    </span>
                  </div>
                  <div className="vsel-colors">
                    {colors.map((c, i) => (
                      <button
                        key={c.id}
                        className={`vsel-color ${colorIdx === i ? 'on' : ''}`}
                        onMouseEnter={() => setColorIdx(i)}
                        onClick={() => setColorIdx(i)}
                        aria-label={c.label[locale]}
                      >
                        <span className="vsel-color-inner" style={{ background: c.color }} />
                      </button>
                    ))}
                  </div>
                  <span className="vsel-current">{variant?.label[locale]}</span>
                </div>
              )}
              {sizes.length >= 1 && (
                <div className="vsel-row">
                  <div className="vsel-head">
                    <span className="bel-eyebrow">{t('size')}</span>
                    <a className="vsel-guide">{t('sizeGuide')}</a>
                  </div>
                  <div className="vsel-sizes">
                    {sizes.map((s, i) => (
                      <button
                        key={s.id}
                        className={`vsel-size ${sizeIdx === i ? 'on' : ''} ${s.stock === 0 ? 'oos' : ''}`}
                        disabled={s.stock === 0}
                        onClick={() => setSizeIdx(i)}
                      >
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {variantStock >= 50 && (
              <div className="detail-stock">
                <span className="dot" style={{ background: dotColor }} />
                <span className="bel-mono">
                  {locale === 'tr' ? 'Stokta 50+ paket' : '50+ packs in stock'}
                </span>
              </div>
            )}

            <div className="detail-actions">
              <div className="qty-big">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-">
                  <Icon name="minus" size={14} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={qty}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setQty(digits === '' ? 0 : parseInt(digits, 10));
                  }}
                  onBlur={() => { if (qty < 1) setQty(1); }}
                  aria-label="Quantity"
                />
                <button onClick={() => setQty(qty + 1)} aria-label="+">
                  <Icon name="plus" size={14} />
                </button>
              </div>
              <button className="bel-btn-primary lg block" onClick={onAdd}>
                {tCommon('addToCart')} · {convertPrice(product.price * qty)}
              </button>
              {user && (
                <button
                  className={`detail-fav ${isFav(product.sku) ? 'on' : ''}`}
                  aria-label="Favorite"
                  onClick={() => toggleFav(product.sku)}
                  title={isFav(product.sku) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav(product.sku) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="detail-min">{t('minOrder')}</div>

            <div className="bel-accordion detail-acc">
            {descBody && (
              <AccordionItem
                title={locale === 'tr' ? 'Ürün açıklaması' : 'Product description'}
                isOpen={openPanel === 'about'}
                onToggle={() => togglePanel('about')}
              >
                {product.longDescription ? (
                  <div
                    className="acc-prose"
                    dangerouslySetInnerHTML={{ __html: product.longDescription[locale] }}
                  />
                ) : (
                  <p className="acc-prose">
                    <span className="acc-drop">{dropcap}</span>
                    {descRest}
                  </p>
                )}
              </AccordionItem>
            )}

            <AccordionItem
              title={locale === 'tr' ? 'Ürün özellikleri' : 'Product features'}
              isOpen={openPanel === 'features'}
              onToggle={() => togglePanel('features')}
            >
              <div className="acc-grid">
                <AccRow k={t('composition')} v={product.composition[locale]} />
                <AccRow k={t('origin')} v={product.origin[locale]} />
                <AccRow
                  k={locale === 'tr' ? 'Sertifika' : 'Certification'}
                  v="OEKO-TEX Standard 100"
                />
                <AccRow
                  k={locale === 'tr' ? 'Topuk' : 'Heel'}
                  v={locale === 'tr' ? 'Çift dikiş · güçlendirilmiş' : 'Double-stitched · reinforced'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Lastik' : 'Cuff'}
                  v={locale === 'tr' ? 'Sıkmaz dar lastik' : 'Non-binding narrow cuff'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Örgü' : 'Knit'}
                  v={locale === 'tr' ? '200 iğne · taranmış pamuk' : '200 needle · combed cotton'}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              title={locale === 'tr' ? 'Paket içeriği' : 'Pack contents'}
              isOpen={openPanel === 'pack'}
              onToggle={() => togglePanel('pack')}
            >
              <div className="acc-grid">
                <AccRow k={t('pack')} v={product.pack.label[locale]} />
                <AccRow
                  k={t('minLabel')}
                  v={locale === 'tr'
                    ? `${product.minOrder.packs} paket (${product.minOrder.packs * (product.pack.pairs ?? product.pack.count)} çift)`
                    : `${product.minOrder.packs} packs (${product.minOrder.packs * (product.pack.pairs ?? product.pack.count)} pairs)`}
                />
                <AccRow
                  k={locale === 'tr' ? 'Renk dağılımı' : 'Color mix'}
                  v={locale === 'tr' ? 'Tek renk paket · isteğe göre karışık' : 'Single-color pack · mixed on request'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Ambalaj' : 'Packaging'}
                  v={locale === 'tr' ? 'Karton kutu · 24 paket / koli' : 'Cardboard box · 24 packs / case'}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              title={locale === 'tr' ? 'Bakım talimatları' : 'Care instructions'}
              isOpen={openPanel === 'care'}
              onToggle={() => togglePanel('care')}
            >
              <ul className="acc-list">
                {careItems.length > 0
                  ? careItems.map((item, i) => <li key={i}>{item}</li>)
                  : (locale === 'tr'
                      ? ['30°C\'de çamaşır makinesinde yıkayın', 'Düşük ısıda kurutucuda kurutulabilir', 'Beyazlatıcı kullanmayın', 'Düşük ısıda ütüleyin · maks. 110°C', 'Kuru temizleme önerilmez']
                      : ['Machine wash at 30°C', 'Tumble dry on low', 'Do not bleach', 'Iron on low · max 110°C', 'Dry cleaning not recommended']
                    ).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionItem>

            <AccordionItem
              title={locale === 'tr' ? 'Teslimat koşulları' : 'Delivery terms'}
              isOpen={openPanel === 'delivery'}
              onToggle={() => togglePanel('delivery')}
            >
              <div className="acc-grid">
                <AccRow
                  k={locale === 'tr' ? 'Süre' : 'Time'}
                  v={locale === 'tr' ? '2 iş günü · Türkiye geneli' : '2 business days · Turkey-wide'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Kargo' : 'Shipping'}
                  v={locale === 'tr' ? 'Anlaşmalı kurye · 24 paket üzeri ücretsiz' : 'Partner courier · free over 24 packs'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Uluslararası' : 'International'}
                  v={locale === 'tr' ? '5-7 iş günü · talep üzerine' : '5-7 business days · on request'}
                />
                <AccRow
                  k={locale === 'tr' ? 'Ödeme' : 'Payment'}
                  v={locale === 'tr' ? 'Havale / EFT · vadeli onaylı bayilerde' : 'Wire / EFT · net terms for approved partners'}
                />
              </div>
            </AccordionItem>

            <AccordionItem
              title={locale === 'tr' ? 'İade & değişim' : 'Returns & exchanges'}
              isOpen={openPanel === 'returns'}
              onToggle={() => togglePanel('returns')}
            >
              <p className="acc-prose">
                {locale === 'tr'
                  ? 'Açılmamış orijinal ambalajındaki ürünler, fatura tarihinden itibaren 14 gün içinde iade edilebilir. Üretim kaynaklı kusurlu ürünlerde 30 gün koşulsuz değişim. Sezon sonu ve outlet ürünlerinde iade kabul edilmez.'
                  : 'Unopened products in original packaging may be returned within 14 days of invoice date. Manufacturing defects qualify for unconditional 30-day exchange. End-of-season and outlet items are non-returnable.'}
              </p>
            </AccordionItem>
            </div>
          </div>
        </div>
      </section>

      <section className="bel-section">
        <div className="bel-container">
          <div className="section-head">
            <h3 className="bel-h3">{t('alsoLike')}</h3>
          </div>
          <div className="prod-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AccRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="acc-row">
      <span className="acc-key">{k}</span>
      <span className="acc-val">{v}</span>
    </div>
  );
}

type AccordionItemProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className={`acc-item ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="acc-head"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="acc-title">{title}</span>
        <span className="acc-toggle acc-icon" aria-hidden>
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {isOpen ? <path d="M3 9 7 5l4 4" /> : <path d="M3 5l4 4 4-4" />}
          </svg>
        </span>
      </button>
      {isOpen && <div className="acc-body">{children}</div>}
    </div>
  );
}
