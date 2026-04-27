import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_LONG_EDGE = 1500;

async function optimizeToAvif(buffer: Buffer): Promise<Buffer> {
    // Single pass — fast (effort: 0 = fastest, lower quality 60 keeps file small)
    return await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize({
            width: MAX_LONG_EDGE,
            height: MAX_LONG_EDGE,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .avif({ quality: 60, effort: 0 })
        .toBuffer();
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File required' }, { status: 400 });
        }

        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.name);
        if (!isImage) {
            console.error('[Upload] Invalid type:', file.type, file.name);
            return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
        }

        // Max 20MB raw (will be compressed to ~300KB AVIF)
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 20MB)` }, { status: 400 });
        }

        const rawBuffer = Buffer.from(await file.arrayBuffer());
        let buffer: Buffer;
        let extension = 'avif';
        let contentType = 'image/avif';

        try {
            buffer = await optimizeToAvif(rawBuffer);
            console.log(`[Upload] AVIF: ${file.name} ${(rawBuffer.length / 1024).toFixed(0)}KB → ${(buffer.length / 1024).toFixed(0)}KB`);
        } catch (err) {
            console.error('[Upload] AVIF failed, trying WebP:', err);
            try {
                // Fallback to WebP
                const meta = await sharp(rawBuffer, { failOn: 'none' }).metadata();
                const longEdge = Math.max(meta.width || 0, meta.height || 0);
                let pipeline = sharp(rawBuffer, { failOn: 'none' }).rotate();
                if (longEdge > MAX_LONG_EDGE) {
                    pipeline = pipeline.resize({ width: MAX_LONG_EDGE, height: MAX_LONG_EDGE, fit: 'inside', withoutEnlargement: true });
                }
                buffer = await pipeline.webp({ quality: 80 }).toBuffer();
                extension = 'webp';
                contentType = 'image/webp';
                console.log(`[Upload] WebP fallback: ${(rawBuffer.length / 1024).toFixed(0)}KB → ${(buffer.length / 1024).toFixed(0)}KB`);
            } catch (err2) {
                console.error('[Upload] WebP fallback failed, using original:', err2);
                buffer = rawBuffer;
                extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                contentType = file.type || 'image/jpeg';
            }
        }

        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '');
        const fileName = `reviews/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}.${extension}`;

        const storageZone = process.env.BUNNY_STORAGE_ZONE;
        const apiKey = process.env.BUNNY_STORAGE_API_KEY;
        const cdnUrl = process.env.BUNNY_CDN_URL;

        if (!storageZone || !apiKey || !cdnUrl) {
            return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
        }

        const uploadRes = await fetch(
            `https://storage.bunnycdn.com/${storageZone}/${fileName}`,
            {
                method: 'PUT',
                headers: {
                    'AccessKey': apiKey,
                    'Content-Type': contentType,
                },
                body: new Uint8Array(buffer),
            }
        );

        if (!uploadRes.ok) {
            console.error('BunnyCDN upload failed:', await uploadRes.text());
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        const imageUrl = `${cdnUrl}/${fileName}`;
        return NextResponse.json({ success: true, url: imageUrl });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
