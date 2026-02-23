import fs from 'fs';
import path from 'path';

// ── Cached video directory listing ──
// Read the directory once, cache filenames in a Set for 60s.
// This avoids calling fs.existsSync for every single product SKU.
let _videoFileCache: Set<string> | null = null;
let _videoCacheTime = 0;
const VIDEO_CACHE_TTL = 60_000; // 60 seconds

function getVideoFileSet(): Set<string> {
    const now = Date.now();
    if (_videoFileCache && now - _videoCacheTime < VIDEO_CACHE_TTL) {
        return _videoFileCache;
    }

    const videosDir = path.join(process.cwd(), 'public', 'media', 'videos');
    try {
        const files = fs.readdirSync(videosDir);
        _videoFileCache = new Set(files.map(f => f.toLowerCase()));
    } catch {
        // Directory might not exist yet
        _videoFileCache = new Set();
    }
    _videoCacheTime = now;
    return _videoFileCache;
}

/**
 * Check if a local video exists for a given product SKU.
 * Uses a cached directory listing instead of per-file fs.existsSync.
 */
export function getProductVideoUrl(sku: string): string | null {
    if (!sku) return null;
    const videoFileName = `${sku}.mp4`;
    const videoSet = getVideoFileSet();
    if (videoSet.has(videoFileName.toLowerCase())) {
        return `/media/videos/${videoFileName}`;
    }
    return null;
}

/**
 * Get all product SKUs that have videos from a list (batch, O(n) with cached Set).
 */
export function getVideoSKUs(skus: string[]): string[] {
    const videoSet = getVideoFileSet();
    return skus.filter(sku => sku && videoSet.has(`${sku}.mp4`.toLowerCase()));
}

/**
 * Check if a product has a video (client-side version using fetch).
 */
export async function checkProductVideoExists(sku: string): Promise<string | null> {
    if (!sku) return null;
    const videoUrl = `/media/videos/${sku}.mp4`;
    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        if (response.ok) return videoUrl;
    } catch {
        // Video doesn't exist or network error
    }
    return null;
}
