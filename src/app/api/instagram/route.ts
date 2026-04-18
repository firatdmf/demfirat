import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_API_URL = 'https://graph.instagram.com/me/media';

export async function GET() {
    if (!ACCESS_TOKEN) {
        return NextResponse.json(
            { error: 'Instagram access token is not configured' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(
            `${INSTAGRAM_API_URL}?fields=id,media_type,media_url,permalink,thumbnail_url,caption&access_token=${ACCESS_TOKEN}&limit=6`,
            { next: { revalidate: 3600 } } // 1 saat cache
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Instagram API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch Instagram posts' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Instagram API fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
