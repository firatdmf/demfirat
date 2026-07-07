import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.demfirat.com';
    // Only the locales the site actually serves. ru/pl were removed —
    // generating URLs for them produced soft-404s that hurt crawling.
    const locales = ['tr', 'en'];

    let products: any[] = [];
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/top_products`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (response.ok) {
            const data = await response.json();
            products = Array.isArray(data) ? data : data.products || [];
        }
    } catch (error) {
        console.error('Sitemap product fetch error:', error);
    }

    // Standard product detail URLs (one per locale)
    const productEntries: MetadataRoute.Sitemap = products.flatMap((product: any) =>
        locales.map((locale) => ({
            url: `${baseUrl}/${locale}/product/${product.product_category || 'product'}/${product.sku || product.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    );

    // Custom-curtain (/curtain) detail pages — these are the "perde diktir"
    // pages we want to rank for. Only fabric-category products have them.
    const curtainEntries: MetadataRoute.Sitemap = products
        .filter((product: any) => {
            const cat = (product.product_category || '').toLowerCase();
            return cat.includes('fabric') || cat.includes('kumaş');
        })
        .flatMap((product: any) =>
            locales.map((locale) => ({
                url: `${baseUrl}/${locale}/product/${product.product_category || 'fabric'}/${product.sku || product.id}/curtain`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9, // custom curtains are a primary conversion path
            }))
        );

    // Static routes. Homepage first with priority 1.0. The custom-curtain
    // landing (fabric listing with custom intent) gets a high priority so
    // the "custom curtain / perde diktir" query has a clean page to rank.
    const coreRoutes = [
        '',                                   // homepage — highest priority
        '/product/fabric',                    // tulle / custom curtain listing
        '/product/ready-made_curtain',        // ready-made curtains
        '/product/bed',                       // bedroom
        '/blog',
        '/contact',
        '/about',
    ];

    const staticEntries: MetadataRoute.Sitemap = coreRoutes.flatMap((route) =>
        locales.map((locale) => ({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: route === '' ? 1.0 : 0.9, // Home page gets highest priority
        }))
    );

    return [...staticEntries, ...curtainEntries, ...productEntries];
}
