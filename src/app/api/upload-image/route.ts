import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const MAX_LONG_EDGE = 1500;
const TARGET_KB = 300;
const INITIAL_QUALITY = 80;
const MIN_QUALITY = 40;
const QUALITY_STEP = 10;

async function optimizeToAvif(buffer: Buffer): Promise<Buffer> {
    let img = sharp(buffer, { failOn: 'none' }).rotate(); // auto-rotate based on EXIF

    const meta = await img.metadata();
    const longEdge = Math.max(meta.width || 0, meta.height || 0);
    if (longEdge > MAX_LONG_EDGE) {
        img = img.resize({
            width: meta.width! >= meta.height! ? MAX_LONG_EDGE : undefined,
            height: meta.height! > meta.width! ? MAX_LONG_EDGE : undefined,
            withoutEnlargement: true,
        });
    }

    let quality = INITIAL_QUALITY;
    let out = await img.avif({ quality }).toBuffer();
    while (out.length / 1024 > TARGET_KB && quality > MIN_QUALITY) {
        quality -= QUALITY_STEP;
        out = await sharp(buffer, { failOn: 'none' }).rotate().resize({
            width: longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE : undefined,
            withoutEnlargement: true,
        }).avif({ quality }).toBuffer();
    }
    return out;
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
        // Convert to AVIF
        let buffer: Buffer;
        try {
            buffer = await optimizeToAvif(rawBuffer);
            console.log(`[Upload] AVIF: ${(rawBuffer.length / 1024).toFixed(0)}KB → ${(buffer.length / 1024).toFixed(0)}KB`);
        } catch (err) {
            console.error('[Upload] AVIF conversion failed, using original:', err);
            buffer = rawBuffer;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '');
        const fileName = `reviews/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}.avif`;

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
                    'Content-Type': 'image/avif',
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
