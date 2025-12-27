import fs from 'fs';
import path from 'path';

/**
 * Check if a local video exists for a given product SKU.
 * Videos should be stored in public/media/videos/{sku}.mp4
 * 
 * @param sku - The product SKU
 * @returns The video URL path if exists, null otherwise
 */
export function getProductVideoUrl(sku: string): string | null {
    if (!sku) return null;

    const videoFileName = `${sku}.mp4`;
    const videoPath = path.join(process.cwd(), 'public', 'media', 'videos', videoFileName);

    try {
        if (fs.existsSync(videoPath)) {
            return `/media/videos/${videoFileName}`;
        }
    } catch (error) {
        console.error(`Error checking video for SKU ${sku}:`, error);
    }

    return null;
}

/**
 * Check if multiple products have videos (batch operation).
 * Returns a Map of SKU -> video URL (or null if no video).
 * 
 * @param skus - Array of product SKUs to check
 * @returns Map of SKU to video URL
 */
export function getProductVideosMap(skus: string[]): Map<string, string | null> {
    const videoMap = new Map<string, string | null>();

    for (const sku of skus) {
        videoMap.set(sku, getProductVideoUrl(sku));
    }

    return videoMap;
}

/**
 * Check if a product has a video (client-side version using fetch).
 * This is useful for client components that can't use fs.
 * 
 * @param sku - The product SKU
 * @returns Promise resolving to video URL if exists, null otherwise
 */
export async function checkProductVideoExists(sku: string): Promise<string | null> {
    if (!sku) return null;

    const videoUrl = `/media/videos/${sku}.mp4`;

    try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        if (response.ok) {
            return videoUrl;
        }
    } catch (error) {
        // Video doesn't exist or network error
    }

    return null;
}
