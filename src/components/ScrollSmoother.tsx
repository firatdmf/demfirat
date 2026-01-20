'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollSmoother() {
    const pathname = usePathname();

    useEffect(() => {
        // Only apply on desktop
        if (window.innerWidth < 769) return;

        // Only apply on product detail pages (contains /product/ followed by category and SKU)
        const isProductDetail = /\/product\/[^/]+\/[^/]+/.test(pathname);
        if (!isProductDetail) return;

        const slowMultiplier = 0.5; // Yavaş scroll hızı

        const handleWheel = (e: WheelEvent) => {
            // Find gallery element
            const gallery = document.querySelector('[class*="gallery"]') as HTMLElement;

            if (!gallery) {
                // No gallery found, use normal scroll
                return;
            }

            const galleryRect = gallery.getBoundingClientRect();
            const galleryBottom = galleryRect.bottom;
            const windowHeight = window.innerHeight;

            // Check if gallery is fully visible (bottom is within viewport)
            const isGalleryFullyVisible = galleryBottom <= windowHeight;

            if (isGalleryFullyVisible) {
                // Gallery is fully visible - normal scroll (don't prevent default)
                return;
            }

            // Gallery not fully visible yet - slow scroll
            e.preventDefault();
            const reducedDelta = e.deltaY * slowMultiplier;
            window.scrollBy({
                top: reducedDelta,
                behavior: 'auto'
            });
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [pathname]);

    return null;
}
