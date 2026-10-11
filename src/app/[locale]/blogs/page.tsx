import { permanentRedirect } from 'next/navigation';

// The blog lives at /blog. This address once held a placeholder page;
// anyone who still types the plural is sent on to the real one.
export default async function BlogsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    permanentRedirect(locale === 'en' ? '/blog' : `/${locale}/blog`);
}
