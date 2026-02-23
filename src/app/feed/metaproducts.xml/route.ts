import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        // 1. Fetch all active products from backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/top_products`);

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        // Assuming backend returns a list of products under 'products'
        const data = await response.json();
        const products = Array.isArray(data) ? data : data.products || [];

        // Protocol: RSS 2.0 standard with g: namespace for Google/Meta catalogs
        // Reference: https://developers.facebook.com/docs/commerce-platform/catalog/formats/xml
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Karven Products Catalog</title>
    <link>https://karven.com</link>
    <description>Product feed for Meta/Google Ads.</description>
`;

        // Loop through all products to build the feed items
        products.forEach((product: any) => {
            // Basic values
            const sku = product.sku || product.id;
            // Default to English or universal string
            const title = product.title || 'Karven Product';
            // Clean HTML tags from description if needed, fallback to title
            const description = (product.description || title).replace(/<[^>]*>?/gm, '').substring(0, 5000);
            // Link needs to be absolute
            const link = `https://karven.com/tr/product/${product.product_category || 'product'}/${sku}`;
            const imageLink = product.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif';

            // Meta requires price in a specific format: "15.00 USD"
            const priceValue = parseFloat(product.price) || 0;
            const price = `${priceValue.toFixed(2)} USD`;

            // Stock status mapping
            const isAvailable = Number(product.available_quantity || 1) > 0;
            const availability = isAvailable ? 'in stock' : 'out of stock';
            const condition = 'new';
            const brand = 'Karven';

            xml += `    <item>
      <g:id>${sku}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:brand>${brand}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:inventory>${product.available_quantity || 0}</g:inventory>
    </item>
`;
        });

        xml += `  </channel>
</rss>`;

        // Return the generated XML with correct Content-Type Header
        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('[Product XML Feed] Error generating feed:', error);
        // Return a minimal valid empty feed or error
        return new NextResponse('Error generating feed', { status: 500 });
    }
}
