import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['demfiratkarven.b-cdn.net', 'res.cloudinary.com'];

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        const parsed = new URL(url);
        if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
            return new NextResponse('Host not allowed', { status: 403 });
        }

        const response = await fetch(url);
        if (!response.ok) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const contentType = response.headers.get('content-type') || 'image/avif';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=604800, immutable',
            },
        });
    } catch {
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}
