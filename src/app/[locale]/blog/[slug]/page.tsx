import Link from 'next/link';
import { notFound } from 'next/navigation';
import classes from './page.module.css';
import { BlogPost } from '@/lib/interfaces';
import ScriptInjector from '@/components/ScriptInjector';

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
            {/* Custom Header Content (Styles, etc) */}
            {post.header_content && (
                <div dangerouslySetInnerHTML={{ __html: post.header_content }} />
            )}

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

            {/* Custom Footer Content (Scripts) */}
            {post.footer_content && <ScriptInjector html={post.footer_content} />}
        </main>
    );
}

// Simple markdown to HTML converter - preserves raw HTML
function formatMarkdown(markdown: string): string {
    if (!markdown) return '';

    // First, protect existing HTML tags by temporarily replacing them
    // Match opening+closing tags, self-closing tags, and standalone tags
    const htmlTagPattern = /<[^>]+>/g;
    const htmlParts: string[] = [];

    let protectedMarkdown = markdown.replace(htmlTagPattern, (match) => {
        htmlParts.push(match);
        return `HTMLBLOCK${htmlParts.length - 1}HTMLBLOCK`;
    });

    // Convert markdown to HTML
    protectedMarkdown = protectedMarkdown
        // Headings
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
        // Bold and italic (order matters)
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<![a-zA-Z])\*([^*]+)\*(?![a-zA-Z])/g, '<em>$1</em>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr />')
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>');

    // Restore protected HTML tags
    for (let i = 0; i < htmlParts.length; i++) {
        protectedMarkdown = protectedMarkdown.split(`HTMLBLOCK${i}HTMLBLOCK`).join(htmlParts[i]);
    }

    // Wrap in paragraph if not starting with a block element
    if (protectedMarkdown && !protectedMarkdown.trim().startsWith('<')) {
        protectedMarkdown = '<p>' + protectedMarkdown + '</p>';
    }

    return protectedMarkdown;
}

