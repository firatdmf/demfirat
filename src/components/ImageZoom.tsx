'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    const imageWrapperRef = useRef<HTMLDivElement>(null);

    // Crossfade: keep previous image visible until new one loads
    const [displayedSrc, setDisplayedSrc] = useState(src);
    const [nextSrc, setNextSrc] = useState<string | null>(null);
    const [nextReady, setNextReady] = useState(false);

    useEffect(() => {
        if (src !== displayedSrc && src !== nextSrc) {
            setNextSrc(src);
            setNextReady(false);
        }
    }, [src, displayedSrc, nextSrc]);

    // When next image is loaded, promote it to displayed
    useEffect(() => {
        if (nextReady && nextSrc) {
            setDisplayedSrc(nextSrc);
            setNextSrc(null);
            setNextReady(false);
        }
    }, [nextReady, nextSrc]);

    const handleNextLoad = () => {
        setNextReady(true);
        onLoad?.();
    };

    const handleFirstLoad = () => {
        onLoad?.();
    };

    const toggleZoom = () => {
        if (window.innerWidth >= 1024) {
            setIsZoomed(!isZoomed);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !imageWrapperRef.current) return;
        const rect = imageWrapperRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        });
    };

    const handleMouseLeave = () => {
        if (isZoomed) setIsZoomed(false);
    };

    const zoomStyle = {
        transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : '50% 50%',
        transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
    };

    return (
        <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.preventDefault()}
            style={{ display: 'contents' }}
        >
            <div
                ref={imageWrapperRef}
                className={`${styles.imageWrapper} ${isZoomed ? styles.zoomedIn : styles.zoomedOut}`}
                onClick={toggleZoom}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Current displayed image - always visible */}
                <Image
                    key={displayedSrc}
                    src={displayedSrc}
                    alt={alt}
                    className={styles.mainImage}
                    onLoad={handleFirstLoad}
                    draggable={false}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    style={zoomStyle}
                />
                {/* Next image loading on top - hidden until loaded, then replaces current */}
                {nextSrc && nextSrc !== displayedSrc && (
                    <Image
                        key={nextSrc}
                        src={nextSrc}
                        alt={alt}
                        className={styles.mainImage}
                        onLoad={handleNextLoad}
                        draggable={false}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                        style={{
                            ...zoomStyle,
                            opacity: nextReady ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                        }}
                    />
                )}
            </div>
        </a>
    );
}
