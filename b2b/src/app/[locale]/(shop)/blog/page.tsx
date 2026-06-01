import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n';

export const metadata: Metadata = {
  title: 'Blog — DEMFIRAT B2B',
  description: 'Sektör içgörüleri, lookbook ve ürün haberleri.',
};

type Props = { params: Promise<{ locale: Locale }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const localePrefix = isEn ? '/en' : '';

  // Placeholder posts — wire to ERP BlogPost API later.
  const posts = [
    {
      slug: 'tul-perdesi-secimi',
      title: isEn ? 'How to spec tulle for wholesale orders' : 'Toptan siparişte tül nasıl seçilir',
      excerpt: isEn
        ? 'Yarn count, weave density, finish — the three numbers every wholesale buyer should ask about.'
        : 'İplik numarası, dokuma yoğunluğu, apre — her toptancının sorması gereken üç sayı.',
      image: 'https://demfiratkarven.b-cdn.net/media/blog/olcu-alma-hero.jpg',
      category: isEn ? 'Sourcing' : 'Tedarik',
      date: '2026-05-12',
    },
    {
      slug: 'ozel-dikim',
      title: isEn ? 'Custom curtain orders: lead time playbook' : 'Özel dikim siparişleri: süre rehberi',
      excerpt: isEn
        ? 'From measurement to packed shipment — what realistic lead times look like for B2B custom orders.'
        : 'Ölçüden paketli sevkiyata — toptan özel dikimde gerçekçi süreler nasıl olur?',
      image: 'https://demfiratkarven.b-cdn.net/media/blog/ozel-dikim-hero.jpg',
      category: isEn ? 'Production' : 'Üretim',
      date: '2026-04-28',
    },
    {
      slug: 'yatak-odasi-koleksiyonu',
      title: isEn ? 'Building a bedroom collection that sells' : 'Satan bir yatak odası koleksiyonu kurmak',
      excerpt: isEn
        ? 'Sheet count, pack mix, color palette — the merchandising decisions that move bedroom inventory.'
        : 'Çarşaf sayısı, paket karışımı, renk paleti — yatak odası stoğunu döndüren merchandising kararları.',
      image: 'https://demfiratkarven.b-cdn.net/media/factory/factory_pack.avif',
      category: isEn ? 'Merchandising' : 'Mağazacılık',
      date: '2026-04-10',
    },
  ];

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* HEAD */}
      <section className="bel-section" style={{ background: 'var(--bel-paper-2)', paddingTop: 96, paddingBottom: 56, borderBottom: '1px solid var(--bel-line)' }}>
        <div className="bel-container">
          <div className="bel-eyebrow" style={{ marginBottom: 14, color: '#944f05' }}>
            {isEn ? 'Journal' : 'Günlük'}
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
              <>Notes from the <em style={{ fontStyle: 'italic', color: '#944f05' }}>loom.</em></>
            ) : (
              <>Tezgahtan <em style={{ fontStyle: 'italic', color: '#944f05' }}>notlar.</em></>
            )}
          </h1>
          <p style={{ maxWidth: 540, marginTop: 16, fontSize: 16, lineHeight: 1.65, color: 'var(--bel-ink-2)', fontFamily: 'var(--bel-font-body)' }}>
            {isEn
              ? 'Sourcing tips, production playbooks, and merchandising notes — written for wholesale buyers.'
              : 'Tedarik ipuçları, üretim rehberleri ve merchandising notları — toptan alıcılar için.'}
          </p>
        </div>
      </section>

      {/* FEATURED */}
      <section className="bel-section" style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="bel-container">
          <Link
            href={`${localePrefix}/blog/${featured.slug}`}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
              gap: 48,
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
            className="blog-featured"
          >
            <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', background: 'var(--bel-paper-3)' }}>
              <Image src={featured.image} alt="" fill sizes="(min-width: 900px) 600px, 100vw" style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <span className="bel-eyebrow" style={{ color: '#944f05' }}>{featured.category}</span>
                <span style={{ color: 'var(--bel-line-strong)' }}>·</span>
                <time style={{ fontFamily: 'var(--bel-font-mono)', fontSize: 11, color: 'var(--bel-ink-3)' }}>{featured.date}</time>
              </div>
              <h2 style={{ fontFamily: 'var(--bel-font-display)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 16px' }}>
                {featured.title}
              </h2>
              <p style={{ fontFamily: 'var(--bel-font-body)', fontSize: 16, lineHeight: 1.65, color: 'var(--bel-ink-2)', margin: '0 0 20px' }}>
                {featured.excerpt}
              </p>
              <span style={{ fontFamily: 'var(--bel-font-body)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#944f05' }}>
                {isEn ? 'Read article →' : 'Yazıyı oku →'}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* GRID */}
      <section className="bel-section" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="bel-container">
          <div className="bel-eyebrow" style={{ marginBottom: 24 }}>{isEn ? 'More posts' : 'Diğer yazılar'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`${localePrefix}/blog/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                className="blog-card"
              >
                <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 4, overflow: 'hidden', background: 'var(--bel-paper-3)', marginBottom: 16 }}>
                  <Image src={post.image} alt="" fill sizes="(min-width: 900px) 33vw, 100vw" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <span className="bel-eyebrow" style={{ color: '#944f05' }}>{post.category}</span>
                  <span style={{ color: 'var(--bel-line-strong)' }}>·</span>
                  <time style={{ fontFamily: 'var(--bel-font-mono)', fontSize: 11, color: 'var(--bel-ink-3)' }}>{post.date}</time>
                </div>
                <h3 style={{ fontFamily: 'var(--bel-font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.2, margin: '0 0 10px' }}>
                  {post.title}
                </h3>
                <p style={{ fontFamily: 'var(--bel-font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--bel-ink-2)', margin: 0 }}>
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 56, padding: '20px 24px', background: 'var(--bel-paper-2)', borderRadius: 4, fontFamily: 'var(--bel-font-body)', fontSize: 13, color: 'var(--bel-ink-3)', textAlign: 'center' }}>
            {isEn
              ? 'These posts are placeholders. Wire up the ERP BlogPost API to render real content.'
              : 'Bu yazılar taslak. Gerçek içerik için ERP BlogPost API\'sini bağlamak gerek.'}
          </p>
        </div>
      </section>

      <style>{`
        .blog-featured h2,
        .blog-card h3 { transition: color 140ms; }
        .blog-featured:hover h2,
        .blog-card:hover h3 { color: #944f05; }
        @media (max-width: 900px) {
          .blog-featured { grid-template-columns: 1fr !important; }
          .bel-container[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
