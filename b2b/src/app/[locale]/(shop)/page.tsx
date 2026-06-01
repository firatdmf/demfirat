import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getSeasons, getStorefrontHome } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CarouselScrollProgress from '@/components/CarouselScrollProgress';
import type { Locale } from '@/i18n';

// Stable mapping from season key → hero image. Editing the dataset
// in @/data/products is overkill for a single-page lookup.
const SEASON_IMAGES: Record<string, string> = {
  ss26: '/home/season-ss26.png',
  aw25: '/home/season-aw25.png',
  all: '/home/season-all.png',
  outlet: '/home/season-outlet.png',
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Fetch DEMFIRAT categories explicitly. The no-filter ERP call takes
  // 15+ seconds (whole catalog) — querying by category is much faster
  // and keeps the B2B home strictly on-brand (curtains + bedroom only).
  // The Belino mock catalogue (socks/innerwear) is intentionally not used.
  const [t, tCommon, fabricProducts, readyMadeProducts, bedProducts, homeSections] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
    getProducts({ categoryKey: 'fabric' }),
    getProducts({ categoryKey: 'ready-made_curtain' }),
    getProducts({ categoryKey: 'bed' }),
    getStorefrontHome(),
  ]);
  // Merged catalog for sections that want a single product list.
  const products = [...fabricProducts, ...readyMadeProducts, ...bedProducts];
  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  // Pull section-bound data from storefront API when available; fall
  // back to the bundled defaults so the page never goes blank.
  const heroSection = homeSections?.find((s) => s.kind === 'hero');
  const trustSection = homeSections?.find((s) => s.kind === 'trust');
  const seasonsSection = homeSections?.find((s) => s.kind === 'seasons');
  const featuredSection = homeSections?.find((s) => s.kind === 'featured');

  const seasons = seasonsSection?.cards?.length
    ? seasonsSection.cards.map((c) => ({
        key: c.key,
        label: c.label,
        bg: '',
        count: c.count,
        image: c.image,
        href: c.href,
      }))
    : (await getSeasons()).map((s) => ({
        key: s.key,
        label: s.label,
        bg: s.bg,
        count: s.count,
        image: undefined as string | undefined,
        href: undefined as string | undefined,
      }));

  // Featured products: prefer storefront-curated SKUs, fall back to the
  // last 4 from the catalogue (the original behaviour).
  let featuredProducts = products.slice(-4).reverse();
  if (featuredSection?.products?.length) {
    const skus = featuredSection.products.map((p) => p.sku);
    const indexed = new Map(products.map((p) => [p.sku, p]));
    featuredProducts = skus.map((sku) => indexed.get(sku)).filter(Boolean) as typeof products;
    // If lookup misses everything, keep the fallback so the section
    // doesn't render empty.
    if (featuredProducts.length === 0) featuredProducts = products.slice(-4).reverse();
  }

  return (
    <>
      {/* HERO C — Atmospheric. Single full-bleed feature image with a
          dark vignette overlay; minimal text content overlaid bottom-left;
          editorial markers in the corners. Slow zoom on the bg image
          gives the page a "film" feel from the moment it loads. */}
      <section className="bel-hero-c" aria-label="Hero" data-edit-zone="hero">
        <div className="hero-c-bg">
          {/* DEMFIRAT brand hero video — served from BunnyCDN.
              Falls back to a poster image while the video loads / on
              browsers that block autoplay. */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://demfiratkarven.b-cdn.net/website-videos/hero-video.jpg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source
              src={heroSection?.image || 'https://demfiratkarven.b-cdn.net/website-videos/hero-video.mp4'}
              type="video/mp4"
            />
          </video>
          {/* Dark overlay so overlaid text stays readable on top of
              the moving footage. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(14,14,12,0.55) 0%, rgba(14,14,12,0.25) 50%, rgba(14,14,12,0.55) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
        {/* Floating image-edit handle for the hero — the bg div sits
            below all content (z-index 0) so a normal data-edit-image
            on it never receives clicks. This handle floats top-right
            with z-index high enough to escape the content layer. */}
        {heroSection && (
          <div
            className="sf-hero-image-handle"
            data-edit-image={`homesection:${heroSection.id}:image_url`}
            aria-label="Hero görselini değiştir"
          />
        )}

        <div className="bel-container hero-c-content">
          <div
            className="hero-c-eyebrow"
            data-edit-text={heroSection ? `homesection:${heroSection.id}:eyebrow_${locale}` : undefined}
          >
            {heroSection?.eyebrow?.[locale] || t('eyebrow')}
          </div>
          <h1
            className="hero-c-display"
            data-edit-text={heroSection ? `homesection:${heroSection.id}:title_${locale}` : undefined}
          >
            {heroSection?.title?.[locale] || (
              <>
                {t('displayLine1')} <em>{t('displayLine2').replace(/\.$/, '')}.</em>
              </>
            )}
          </h1>
          <p
            className="hero-c-lede"
            data-edit-text={heroSection ? `homesection:${heroSection.id}:body_${locale}` : undefined}
          >
            {heroSection?.body?.[locale] || t('lede')}
          </p>

          <div className="hero-c-cta">
            <Link
              href={heroSection?.cta?.href || `${localePrefix}/products`}
              className="hero-c-btn-primary"
            >
              <span
                data-edit-text={heroSection ? `homesection:${heroSection.id}:cta_label_${locale}` : undefined}
              >
                {heroSection?.cta?.label?.[locale] ||
                  (locale === 'tr' ? 'Koleksiyonu Keşfet' : 'Explore Collection')}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </Link>
            <button type="button" className="hero-c-btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              <span>{tCommon('downloadLookbook')}</span>
            </button>
          </div>
        </div>

      </section>

      {/* Trust strip — uses storefront API badges if available; falls
          back to hardcoded defaults. SVG icons live here (complex inline
          markup) — DB only stores text + an icon_key for swapping. */}
      <section className="trust-strip" aria-label="DEMFIRAT trust badges" data-edit-zone="trust">
        <div
          className="bel-container trust-strip-grid"
          data-edit-sort-list="trustbadge"
          data-edit-sort-section={trustSection?.id ?? ''}
        >
          {(trustSection?.badges?.length
            ? trustSection.badges.map((b) => ({
                id: b.id,
                icon: b.icon,
                title: b.title[locale],
                sub: b.sub[locale],
              }))
            : ([
                { id: 0, icon: 'shield',  title: locale === 'tr' ? 'Güvenli Alışveriş'   : 'Secure Checkout', sub: 'SSL · 3D Secure' },
                { id: 0, icon: 'percent', title: locale === 'tr' ? 'Toplu Alım İndirimi' : 'Bulk Discount',   sub: locale === 'tr' ? 'Adete göre kademeli' : 'Tiered by quantity' },
                { id: 0, icon: 'truck',   title: locale === 'tr' ? 'Ücretsiz Kargo'      : 'Free Shipping',   sub: locale === 'tr' ? '5.000 TL üzeri' : 'Over 5,000 TRY' },
                { id: 0, icon: 'card',    title: locale === 'tr' ? 'Taksit İmkanı'       : 'Installments',    sub: locale === 'tr' ? '12 aya varan' : 'Up to 12 months' },
                { id: 0, icon: 'bolt',    title: locale === 'tr' ? '24 Saatte Kargo'     : '24h Shipping',    sub: locale === 'tr' ? 'Aynı gün hazırlık' : 'Same-day prep' },
              ])
          ).map((b, i) => (
            <div
              key={`${b.id || i}`}
              className="trust-strip-item"
              data-edit-sort-id={b.id || undefined}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {b.icon === 'shield' && (<>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </>)}
                {b.icon === 'percent' && (<>
                  <line x1="19" y1="5" x2="5" y2="19"/>
                  <circle cx="6.5" cy="6.5" r="2.5"/>
                  <circle cx="17.5" cy="17.5" r="2.5"/>
                </>)}
                {b.icon === 'truck' && (<>
                  <rect x="1" y="6" width="14" height="12" rx="1"/>
                  <path d="M15 9h4l3 3v6h-7"/>
                  <circle cx="6" cy="18" r="2"/>
                  <circle cx="18" cy="18" r="2"/>
                </>)}
                {b.icon === 'card' && (<>
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                  <line x1="6" y1="15" x2="10" y2="15"/>
                </>)}
                {b.icon === 'bolt' && (
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                )}
              </svg>
              <div className="trust-strip-text">
                <span
                  className="trust-strip-title"
                  data-edit-text={b.id ? `trustbadge:${b.id}:title_${locale}` : undefined}
                >{b.title}</span>
                <span
                  className="trust-strip-sub"
                  data-edit-text={b.id ? `trustbadge:${b.id}:sub_${locale}` : undefined}
                >{b.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bedroom promo — editorial split. Used to live on /bedroom but
          a dedicated landing didn't earn its keep; the teaser sits here
          on the homepage and the CTA drops users straight into the
          filtered product listing. */}
      <section className="bel-section" style={{ background: 'var(--bel-paper-2)', paddingTop: 64, paddingBottom: 64 }}>
        <div className="bel-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)', gap: 48, alignItems: 'center' }} data-bedroom-promo>
          <div>
            <div className="bel-eyebrow" style={{ marginBottom: 14 }}>
              {locale === 'tr' ? 'Toptan · Yatak Odası' : 'Wholesale · Bedroom'}
            </div>
            <h2 className="bel-h2" style={{ marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              {locale === 'tr' ? (
                <>Yatak odası, <em>tek pakette.</em></>
              ) : (
                <>The bedroom, <em>delivered.</em></>
              )}
            </h2>
            <p className="bel-meta" style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
              {locale === 'tr'
                ? 'Nevresim, lastikli çarşaf, lastiksiz çarşaf ve Oxford yastık kılıfı — tek ve çift kişilik ölçülerde, paket bazında şeffaf stok.'
                : 'Quilt covers, fitted sheets, flat sheets and Oxford pillowcases — sold in single and double sizes, with transparent pack stock per size.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`${localePrefix}/products?cat=bed`} className="hero-c-btn-primary">
                <span>{locale === 'tr' ? 'Koleksiyona göz at' : 'Browse bedroom collection'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', background: 'var(--bel-paper-3)' }}>
            <Image
              src={bedProducts[0]?.bg && typeof bedProducts[0].bg === 'string' && bedProducts[0].bg.includes('url(')
                ? bedProducts[0].bg.match(/url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '') ?? '/home/hero-c.png'
                : '/home/hero-c.png'}
              alt=""
              fill
              sizes="(min-width: 1100px) 600px, 100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Curtain promo — editorial split, mirror of the bedroom promo. */}
      <section className="bel-section" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="bel-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: 48, alignItems: 'center' }} data-curtain-promo>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', background: 'var(--bel-paper-3)' }}>
            <Image
              src={fabricProducts[0]?.bg && typeof fabricProducts[0].bg === 'string' && fabricProducts[0].bg.includes('url(')
                ? fabricProducts[0].bg.match(/url\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '') ?? '/home/hero-a.png'
                : '/home/hero-a.png'}
              alt=""
              fill
              sizes="(min-width: 1100px) 700px, 100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <div className="bel-eyebrow" style={{ marginBottom: 14 }}>
              {locale === 'tr' ? 'Toptan · Perdeler' : 'Wholesale · Curtains'}
            </div>
            <h2 className="bel-h2" style={{ marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              {locale === 'tr' ? (
                <>Perdeler, <em>top top.</em></>
              ) : (
                <>Curtains, <em>by the roll.</em></>
              )}
            </h2>
            <p className="bel-meta" style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
              {locale === 'tr'
                ? 'Tül, fon ve rustik perdeler — kendi tezgahımızda dokunur, top/metre bazında stoğunu canlı görürsünüz. Nakışlı, düz ve blackout seçenekleri ile.'
                : 'Tulle, blackout and rustic curtains — woven on our own looms with live stock per roll. Embroidered, solid and blackout options.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`${localePrefix}/products?cat=fabric`} className="hero-c-btn-primary">
                <span>{locale === 'tr' ? 'Perdeleri incele' : 'Browse curtains'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href={`${localePrefix}/products?cat=ready-made_curtain`} className="hero-c-btn-ghost">
                <span>{locale === 'tr' ? 'Rustik perdeler →' : 'Rustic curtains →'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CarouselScrollProgress />
    </>
  );
}
