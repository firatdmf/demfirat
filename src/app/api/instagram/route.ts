import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

export async function GET() {
    if (!ACCESS_TOKEN) {
        return NextResponse.json(
            { error: 'Instagram access token is not configured' },
            { status: 500 }
        );
    }

    const urls: string[] = [];
    const isBasicToken = ACCESS_TOKEN.startsWith('IGAA');

    if (ACCOUNT_ID && !isBasicToken) {
        // Try Instagram Business Graph API endpoint
        urls.push(`https://graph.facebook.com/v19.0/${ACCOUNT_ID}/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,timestamp&access_token=${ACCESS_TOKEN}&limit=12`);
    }
    // Fallback to Instagram Basic Display API endpoint
    urls.push(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption,timestamp&access_token=${ACCESS_TOKEN}&limit=12`);

    let lastError: any = null;

    for (const url of urls) {
        try {
            const response = await fetch(url, { next: { revalidate: 3600 } });
            if (response.ok) {
                const data = await response.json();
                return NextResponse.json(data);
            }
            const errorData = await response.json().catch(() => null);
            lastError = errorData ? JSON.stringify(errorData) : `Status ${response.status}`;
            console.warn(`Instagram API attempt failed for url ${url.split('?')[0]}:`, lastError);
        } catch (err: any) {
            lastError = err?.message || err;
            console.error(`Instagram fetch error for url ${url.split('?')[0]}:`, err);
        }
    }

    return NextResponse.json(
        { error: 'Failed to fetch Instagram posts from all endpoints', details: lastError },
        { status: 502 }
    );
}

