import { MetadataRoute } from 'next'

// Categories the storefront actually serves. Each is fetched via the
// real /marketing/api/get_products endpoint (the old sitemap called
// /top_products which does NOT exist → sitemap never had any products).
const CATEGORIES = ['fabric', 'ready-made_curtain', 'bed'];

async function fetchCategoryProducts(baseApi: string, category: string): Promise<any[]> {
    try {
        const res = await fetch(`${baseApi}/marketing/api/get_products?product_category=${category}`, {
            next: { revalidate: 3600 }, // 1 hour
        });
        if (!res.ok) return [];
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products || [];
        // Tag each product with the category we queried so URLs are correct.
        return products.map((p: any) => ({ ...p, _category: category }));
    } catch (error) {
        console.error(`Sitemap fetch error (${category}):`, error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.demfirat.com';
    const baseApi = process.env.NEXT_PUBLIC_NEJUM_API_URL || '';
    // Only the locales the site actually serves (ru/pl were removed).
    const locales = ['tr', 'en'];

    // Fetch every category in parallel.
    const perCategory = await Promise.all(
        CATEGORIES.map((c) => fetchCategoryProducts(baseApi, c))
    );
    const allProducts = perCategory.flat();

    // Standard product detail URLs (one per locale).
    const productEntries: MetadataRoute.Sitemap = allProducts.flatMap((product: any) => {
        const cat = product._category || product.product_category || 'product';
        const sku = product.sku || product.id;
        return locales.map((locale) => ({
            url: `${baseUrl}/${locale}/product/${cat}/${sku}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    });

    // Custom-curtain (/curtain) detail pages are no longer listed — the
    // made-to-measure wizard they exist for is off site-wide (B2B pivot,
    // see CUSTOM_CURTAIN_ENABLED). The route still works (falls back to the
    // standard product view), so leaving it out of the sitemap just avoids
    // indexing it as a duplicate of the plain product URL.
    const curtainEntries: MetadataRoute.Sitemap = [];

    // Static routes. Homepage first with priority 1.0.
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
