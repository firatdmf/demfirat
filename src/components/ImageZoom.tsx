'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageZoom.module.css';

interface ImageZoomProps {
    src: string;
    alt: string;
    onLoad?: () => void;
}

export default function ImageZoom({ src, alt, onLoad }: ImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    // Ref is used to calculate mouse position relative to the wrapper
    const imageWrapperRef = useRef<HTMLDivElement>(null);

    const toggleZoom = () => {
        // Only allow zooming on desktop
        if (window.innerWidth >= 1024) {
            setIsZoomed(!isZoomed);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !imageWrapperRef.current) return;

        const rect = imageWrapperRef.current.getBoundingClientRect();

        // Calculate percentages
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Keep bounds between 0 and 100 to prevent weird scrolling at edges
        setZoomPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        });
    };

    const handleMouseLeave = () => {
        // Automatically zoom out when the mouse leaves the image area
        if (isZoomed) {
            setIsZoomed(false);
        }
    };

    return (
        <div
            ref={imageWrapperRef}
            className={`${styles.imageWrapper} ${isZoomed ? styles.zoomedIn : styles.zoomedOut}`}
            onClick={toggleZoom}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <Image
                src={src}
                alt={alt}
                className={styles.mainImage}
                onLoad={onLoad}
                draggable={false}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                style={{
                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : '50% 50%',
                    transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                }}
            />
        </div>
    );
}
