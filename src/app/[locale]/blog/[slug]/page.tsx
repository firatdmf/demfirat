import Link from 'next/link';
import { notFound } from 'next/navigation';
import classes from './page.module.css';
import { BlogPost } from '@/lib/interfaces';

interface BlogPostPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_blog_post/${slug}/`,
            { next: { revalidate: 300 } }
        );
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching blog post:', error);
    }
    return null;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { locale, slug } = await params;
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const t = {
        backToBlog: {
            tr: '← Blog\'a Dön',
            en: '← Back to Blog',
            ru: '← Назад в блог',
            pl: '← Powrót do bloga'
        },
        share: {
            tr: 'Paylaş',
            en: 'Share',
            ru: 'Поделиться',
            pl: 'Udostępnij'
        }
    };

    // Helper to get localized content
    const getLocalized = (field: 'title' | 'content' | 'excerpt' | 'category') => {
        const key = `${field}_${lang}` as keyof BlogPost;
        return (post[key] as string) || (post[`${field}_tr` as keyof BlogPost] as string);
    };

    return (
        <main className={classes.blogPost}>
            {/* Hero Image */}
            <div className={classes.heroImage}>
                <img
                    src={post.hero_image || post.cover_image || '/media/blog/default-hero.jpg'}
                    alt={getLocalized('title')}
                />
                <div className={classes.heroOverlay}></div>
                <div className={classes.heroContent}>
                    <h1>{getLocalized('title')}</h1>
                    <div className={classes.meta}>
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>
                            {new Date(post.published_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className={classes.article}>
                <div className={classes.container}>
                    <Link href={`/${locale}/blog`} className={classes.backLink}>
                        {t.backToBlog[lang]}
                    </Link>

                    <div
                        className={classes.content}
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(getLocalized('content') || '') }}
                    />
                </div>
            </article>
        </main>
    );
}

// Simple markdown to HTML converter
function formatMarkdown(markdown: string): string {
    return markdown
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/✅/g, '<span class="success">✅</span>')
        .replace(/❌/g, '<span class="error">❌</span>')
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.some(c => c.includes('---'))) return '';
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        .replace(/\n\n/g, '</p><p>');
}
