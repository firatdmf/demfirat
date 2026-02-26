'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './ImageZoom.module.css';

interface ImageZoomProps {
    src: string;
    alt: string;
    onLoad?: () => void;
}

export default function ImageZoom({ src, alt, onLoad }: ImageZoomProps) {
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, height: 0 });
    const [mounted, setMounted] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePanelPosition = () => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        setPanelPosition({
            top: rect.top + window.scrollY,
            left: rect.right + 20,
            height: rect.height
        });
    };

    const handleMouseEnter = () => {
        // Only enable zoom on desktop
        if (window.innerWidth >= 1024) {
            setIsZooming(true);
            updatePanelPosition();
        }
    };

    const handleMouseLeave = () => {
        setIsZooming(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y))
        });

        // Update panel position on move to stay aligned
        updatePanelPosition();
    };

    const zoomPanel = mounted && isZooming ? createPortal(
        <div
            className={styles.zoomPanel}
            style={{
                position: 'absolute',
                top: `${panelPosition.top}px`,
                left: `${panelPosition.left}px`,
                height: `${Math.min(panelPosition.height, 500)}px`,
                width: `${Math.min(panelPosition.height, 500)}px`,
            }}
        >
            <div
                className={styles.zoomImage}
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
            />
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div
                ref={imageRef}
                className={styles.imageWrapper}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
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
                />
                {isZooming && (
                    <div
                        className={styles.lensBox}
                        style={{
                            left: `${zoomPosition.x}%`,
                            top: `${zoomPosition.y}%`,
                        }}
                    />
                )}
            </div>
            {zoomPanel}
        </>
    );
}
