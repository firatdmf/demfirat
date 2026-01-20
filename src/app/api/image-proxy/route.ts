import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Proxy endpoint to fetch image and convert AVIF/WebP to JPEG
export async function GET(request: NextRequest) {
    try {
        const url = request.nextUrl.searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        console.log('Proxying image:', url);

        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || '';

        console.log('Original content type:', contentType, 'size:', buffer.byteLength);

        // If AVIF or WebP, convert to JPEG using Sharp
        if (contentType.includes('avif') || contentType.includes('webp') || url.includes('.avif') || url.includes('.webp')) {
            try {
                console.log('Converting to JPEG...');
                const jpegBuffer = await sharp(Buffer.from(buffer))
                    .jpeg({ quality: 85 })
                    .toBuffer();

                const base64 = jpegBuffer.toString('base64');
                console.log('✓ Converted to JPEG, new size:', jpegBuffer.byteLength);

                return NextResponse.json({
                    base64: `data:image/jpeg;base64,${base64}`,
                    contentType: 'image/jpeg'
                });
            } catch (sharpError) {
                console.error('Sharp conversion error:', sharpError);
                // Return original if conversion fails
                const base64 = Buffer.from(buffer).toString('base64');
                return NextResponse.json({
                    base64: `data:${contentType};base64,${base64}`,
                    contentType
                });
            }
        }

        // For other formats, return as-is
        const base64 = Buffer.from(buffer).toString('base64');
        return NextResponse.json({
            base64: `data:${contentType || 'image/jpeg'};base64,${base64}`,
            contentType: contentType || 'image/jpeg'
        });

    } catch (error) {
        console.error('Image proxy error:', error);
        return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
    }
}
