import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://karven.com';
    const locales = ['tr', 'en', 'ru', 'pl'];

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

    // Generate dynamic product URLs for each locale
    const productEntries: MetadataRoute.Sitemap = products.flatMap((product: any) =>
        locales.map((locale) => ({
            url: `${baseUrl}/${locale}/product/${product.product_category || 'product'}/${product.sku || product.id}`,
            lastModified: new Date(), // Ideally this would come from the product's updatedAt field
            changeFrequency: 'weekly',
            priority: 0.8,
        }))
    );

    // Define static routes
    const coreRoutes = ['', '/product/fabric', '/product/ready-made_curtain', '/blog', '/contact', '/about'];

    // Generate static URLs for each locale
    const staticEntries: MetadataRoute.Sitemap = coreRoutes.flatMap((route) =>
        locales.map((locale) => ({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: route === '' ? 1.0 : 0.9, // Home page gets highest priority
        }))
    );

    return [...staticEntries, ...productEntries];
}
