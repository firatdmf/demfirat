import Link from 'next/link';
import classes from './page.module.css';

// Blog posts data - easily extendable
const blogPosts = [
    {
        slug: 'dogru-olcu-nasil-alinir',
        title: {
            tr: 'Doğru Ölçü Nasıl Alınır?',
            en: 'How to Measure Correctly?',
            ru: 'Как правильно снять мерки?',
            pl: 'Jak prawidłowo mierzyć?'
        },
        excerpt: {
            tr: 'Perde siparişi vermeden önce doğru ölçü almayı öğrenin. Adım adım rehberimizle mükemmel uyum sağlayan perdeler sipariş edin.',
            en: 'Learn how to measure correctly before ordering curtains. Get perfectly fitting curtains with our step-by-step guide.',
            ru: 'Узнайте, как правильно снять мерки перед заказом штор. Получите идеально подходящие шторы с нашим пошаговым руководством.',
            pl: 'Dowiedz się, jak prawidłowo mierzyć przed zamówieniem zasłon. Zamów idealnie dopasowane zasłony dzięki naszemu przewodnikowi krok po kroku.'
        },
        image: '/media/blog/olcu-alma.jpg',
        date: '2025-12-23',
        category: {
            tr: 'Rehber',
            en: 'Guide',
            ru: 'Руководство',
            pl: 'Przewodnik'
        }
    }
];

interface BlogPageProps {
    params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
    const { locale } = await params;
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    const t = {
        title: {
            tr: 'Blog',
            en: 'Blog',
            ru: 'Блог',
            pl: 'Blog'
        },
        subtitle: {
            tr: 'Perdeler, kumaşlar ve ev dekorasyonu hakkında ipuçları ve rehberler',
            en: 'Tips and guides about curtains, fabrics and home decoration',
            ru: 'Советы и руководства о шторах, тканях и декоре дома',
            pl: 'Porady i przewodniki o zasłonach, tkaninach i dekoracji domu'
        },
        readMore: {
            tr: 'Devamını Oku',
            en: 'Read More',
            ru: 'Читать далее',
            pl: 'Czytaj więcej'
        }
    };

    return (
        <main className={classes.blogPage}>
            {/* Hero Section */}
            <section className={classes.hero}>
                <div className={classes.heroContent}>
                    <h1>{t.title[lang]}</h1>
                    <p>{t.subtitle[lang]}</p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className={classes.blogSection}>
                <div className={classes.container}>
                    <div className={classes.blogGrid}>
                        {blogPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/${locale}/blog/${post.slug}`}
                                className={classes.blogCard}
                            >
                                <div className={classes.cardImage}>
                                    <img
                                        src={post.image}
                                        alt={post.title[lang]}
                                    />
                                    <span className={classes.category}>{post.category[lang]}</span>
                                </div>
                                <div className={classes.cardContent}>
                                    <span className={classes.date}>
                                        {new Date(post.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <h2>{post.title[lang]}</h2>
                                    <p>{post.excerpt[lang]}</p>
                                    <span className={classes.readMore}>
                                        {t.readMore[lang]} →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
