import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.demfirat.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/tr/api/',
                '/en/api/',
                // Filtered / faceted URLs — keep the canonical /curtain pages
                // (path-based) indexable, but block the query-param variants
                // so Google doesn't index every filter permutation as duplicates.
                '/*?fabric_type=*',
                '/*?color=*',
                '/*?size=*',
                // Account / cart / checkout are user-specific, never index.
                '/*/cart',
                '/*/checkout',
                '/*/account',
                '/*/favorites',
                '/*/login',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
