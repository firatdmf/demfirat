import Link from 'next/link';
import { BlogPost } from '@/lib/interfaces';
import classes from './BlogStrip.module.css';

interface BlogStripProps {
    locale: string;
    /** How many posts to show. Three fills the row on desktop. */
    limit?: number;
}

async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_blog_posts/`,
            { next: { revalidate: 300 } } // Same 5 minute cache as the blog index
        );
        if (response.ok) {
            const data = await response.json();
            return data.posts || [];
        }
    } catch (error) {
        console.error('Error fetching blog posts for homepage strip:', error);
    }
    return [];
}

export default async function BlogStrip({ locale, limit = 3 }: BlogStripProps) {
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    const posts = (await getBlogPosts())
        .slice()
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, limit);

    // Nothing to show is not an error — just skip the section entirely.
    if (posts.length === 0) return null;

    const t = {
        eyebrow: { tr: 'Günlük', en: 'Journal', ru: 'Журнал', pl: 'Dziennik' },
        title: {
            tr: 'Perde ve kumaş rehberleri',
            en: 'Curtain and fabric guides',
            ru: 'Гиды по шторам и тканям',
            pl: 'Przewodniki po zasłonach i tkaninach',
        },
        all: {
            tr: 'Tüm yazılar',
            en: 'All posts',
            ru: 'Все статьи',
            pl: 'Wszystkie wpisy',
        },
    };

    const getLocalized = (post: BlogPost, field: 'title' | 'excerpt' | 'category') => {
        const key = `${field}_${lang}` as keyof BlogPost;
        return (post[key] as string) || (post[`${field}_tr` as keyof BlogPost] as string);
    };

    const dateLocale = locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US';

    return (
        <section className={classes.blogStrip}>
            <div className={classes.container}>
                <div className={classes.header}>
                    <div>
                        <span className={classes.eyebrow}>{t.eyebrow[lang]}</span>
                        <h2 className={classes.title}>{t.title[lang]}</h2>
                    </div>
                    <Link href={`/${locale}/blog`} className={classes.allLink}>
                        {t.all[lang]} →
                    </Link>
                </div>

                <div className={classes.grid}>
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/${locale}/blog/${post.slug}`}
                            className={classes.card}
                        >
                            <div className={classes.cardImage}>
                                <img
                                    src={post.cover_image || '/media/blog/default.jpg'}
                                    alt={post.cover_image_alt || getLocalized(post, 'title')}
                                    loading="lazy"
                                />
                                <span className={classes.category}>{getLocalized(post, 'category')}</span>
                            </div>
                            <div className={classes.cardContent}>
                                <span className={classes.date}>
                                    {new Date(post.published_at).toLocaleDateString(dateLocale, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <h3 className={classes.cardTitle}>{getLocalized(post, 'title')}</h3>
                                <p className={classes.excerpt}>{getLocalized(post, 'excerpt')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
