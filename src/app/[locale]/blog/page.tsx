import Link from 'next/link';
import classes from './page.module.css';
import { BlogPost } from '@/lib/interfaces';

interface BlogPageProps {
    params: Promise<{ locale: string }>;
}

async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_blog_posts/`,
            { next: { revalidate: 300 } } // Cache for 5 minutes
        );
        if (response.ok) {
            const data = await response.json();
            return data.posts || [];
        }
    } catch (error) {
        console.error('Error fetching blog posts:', error);
    }
    return [];
}

export default async function BlogPage({ params }: BlogPageProps) {
    const { locale } = await params;
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    const blogPosts = await getBlogPosts();

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
        },
        noPosts: {
            tr: 'Henüz blog yazısı yok.',
            en: 'No blog posts yet.',
            ru: 'Пока нет постов.',
            pl: 'Brak wpisów na blogu.'
        }
    };

    // Helper to get localized content
    const getLocalized = (post: BlogPost, field: 'title' | 'excerpt' | 'category') => {
        const key = `${field}_${lang}` as keyof BlogPost;
        return (post[key] as string) || (post[`${field}_tr` as keyof BlogPost] as string);
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
                    {blogPosts.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                            {t.noPosts[lang]}
                        </p>
                    ) : (
                        <div className={classes.blogGrid}>
                            {blogPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/${locale}/blog/${post.slug}`}
                                    className={classes.blogCard}
                                >
                                    <div className={classes.cardImage}>
                                        <img
                                            src={post.cover_image || '/media/blog/default.jpg'}
                                            alt={getLocalized(post, 'title')}
                                        />
                                        <span className={classes.category}>{getLocalized(post, 'category')}</span>
                                    </div>
                                    <div className={classes.cardContent}>
                                        <span className={classes.date}>
                                            {new Date(post.published_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <h2>{getLocalized(post, 'title')}</h2>
                                        <p>{getLocalized(post, 'excerpt')}</p>
                                        <span className={classes.readMore}>
                                            {t.readMore[lang]} →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
