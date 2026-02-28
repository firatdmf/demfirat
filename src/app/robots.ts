import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://karven.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/tr/api/',
                '/en/api/',
                '/ru/api/',
                '/pl/api/',
                '/*?intent=*',   // Optional query params
                '/*?fabric_type=*', // Don't let search engines index every possible filter combination
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
