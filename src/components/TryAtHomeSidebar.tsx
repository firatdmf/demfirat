'use client';

import React, { useState, useRef, useCallback } from 'react';
import { FaTimes, FaCamera, FaUpload, FaDownload, FaRedo, FaSpinner } from 'react-icons/fa';
import classes from './TryAtHomeSidebar.module.css';

interface TryAtHomeSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    productImages: string[];
    productVideos?: string[];
    productTitle: string;
    locale: string;
}

export default function TryAtHomeSidebar({
    isOpen,
    onClose,
    productImages,
    productVideos = [],
    productTitle,
    locale
}: TryAtHomeSidebarProps) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            title: {
                tr: 'Evinde Dene',
                en: 'Try at Home',
                ru: 'Примерить дома',
                pl: 'Wypróbuj w domu'
            },
            uploadPhoto: {
                tr: 'Fotoğraf Yükle',
                en: 'Upload Photo',
                ru: 'Загрузить фото',
                pl: 'Prześlij zdjęcie'
            },
            takePhoto: {
                tr: 'Fotoğraf Çek',
                en: 'Take Photo',
                ru: 'Сделать фото',
                pl: 'Zrób zdjęcie'
            },
            generate: {
                tr: 'Görüntüle',
                en: 'Generate',
                ru: 'Создать',
                pl: 'Generuj'
            },
            generating: {
                tr: 'Oluşturuluyor...',
                en: 'Generating...',
                ru: 'Создание...',
                pl: 'Generowanie...'
            },
            download: {
                tr: 'İndir',
                en: 'Download',
                ru: 'Скачать',
                pl: 'Pobierz'
            },
            tryAgain: {
                tr: 'Tekrar Dene',
                en: 'Try Again',
                ru: 'Попробовать снова',
                pl: 'Spróbuj ponownie'
            },
            instruction: {
                tr: 'Perdeyi görmek istediğiniz odanızın fotoğrafını yükleyin veya çekin.',
                en: 'Upload or take a photo of your room where you want to see the curtain.',
                ru: 'Загрузите или сделайте фото комнаты, где хотите увидеть шторы.',
                pl: 'Prześlij lub zrób zdjęcie pokoju, w którym chcesz zobaczyć zasłonę.'
            },
            error: {
                tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
                en: 'An error occurred. Please try again.',
                ru: 'Произошла ошибка. Попробуйте снова.',
                pl: 'Wystąpił błąd. Spróbuj ponownie.'
            },
            processing: {
                tr: 'AI perdeyi evinize yerleştiriyor...',
                en: 'AI is placing the curtain in your home...',
                ru: 'ИИ размещает штору в вашем доме...',
                pl: 'AI umieszcza zasłonę w Twoim domu...'
            }
        };
        return translations[key]?.[locale] || translations[key]?.['en'] || key;
    };

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
                setGeneratedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Convert image URL to base64 using server-side proxy
    const imageUrlToBase64 = async (url: string): Promise<string | null> => {
        try {
            console.log('Fetching image via proxy:', url);
            const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.base64) {
                    console.log('✓ Image fetched via proxy, type:', data.contentType);
                    return data.base64;
                }
            }
            console.error('Proxy failed for:', url);
            return null;
        } catch (e) {
            console.error('Error fetching via proxy:', e);
            return null;
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;

        setIsLoading(true);
        setError(null);

        try {
            // Convert 2nd and 3rd product images to base64 (index 1 and 2)
            const imagesToConvert = productImages.slice(1, 3);
            console.log('Converting', imagesToConvert.length, 'product images to base64...');

            const convertedImages: string[] = [];
            for (const imgUrl of imagesToConvert) {
                if (imgUrl.startsWith('data:')) {
                    convertedImages.push(imgUrl);
                } else {
                    const base64 = await imageUrlToBase64(imgUrl);
                    if (base64) {
                        convertedImages.push(base64);
                    }
                }
            }

            console.log('Successfully converted', convertedImages.length, 'images');
            console.log('Product videos to send:', productVideos.length);

            const response = await fetch('/api/try-at-home', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomImage: uploadedImage,
                    curtainImages: convertedImages,
                    curtainVideos: productVideos,
                    productTitle: productTitle
                }),
            });

            const data = await response.json();

            if (data.success && data.generatedImage) {
                setGeneratedImage(data.generatedImage);
            } else {
                setError(data.error || t('error'));
            }
        } catch (err) {
            console.error('Try at home error:', err);
            setError(t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `curtain-preview-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImage(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.overlay} onClick={onClose}>
            <div className={classes.sidebar} onClick={e => e.stopPropagation()}>
                <div className={classes.header}>
                    <h2>{t('title')}</h2>
                    <button onClick={onClose} className={classes.closeBtn}>
                        <FaTimes />
                    </button>
                </div>

                <div className={classes.content}>
                    {!generatedImage ? (
                        <>
                            {/* Instructions */}
                            <p className={classes.instruction}>{t('instruction')}</p>

                            {/* Upload/Camera Buttons */}
                            {!uploadedImage && (
                                <div className={classes.uploadButtons}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className={classes.hiddenInput}
                                    />
                                    <input
                                        ref={cameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileUpload}
                                        className={classes.hiddenInput}
                                    />
                                    <button
                                        className={classes.uploadBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FaUpload /> {t('uploadPhoto')}
                                    </button>
                                    <button
                                        className={classes.cameraBtn}
                                        onClick={() => cameraInputRef.current?.click()}
                                    >
                                        <FaCamera /> {t('takePhoto')}
                                    </button>
                                </div>
                            )}

                            {/* Preview of uploaded image */}
                            {uploadedImage && (
                                <div className={classes.previewSection}>
                                    <img
                                        src={uploadedImage}
                                        alt="Room preview"
                                        className={classes.previewImage}
                                    />
                                    <div className={classes.previewActions}>
                                        <button
                                            className={classes.resetBtn}
                                            onClick={handleReset}
                                        >
                                            <FaRedo /> {t('tryAgain')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Product being tried - show all images */}
                            <div className={classes.productPreview}>
                                <div className={classes.productImagesRow}>
                                    {productImages.slice(0, 4).map((img, idx) => (
                                        <img key={idx} src={img} alt={`${productTitle} ${idx + 1}`} />
                                    ))}
                                </div>
                                <span>{productTitle}</span>
                            </div>

                            {/* Generate Button */}
                            {uploadedImage && (
                                <button
                                    className={classes.generateBtn}
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <FaSpinner className={classes.spinner} />
                                            {t('generating')}
                                        </>
                                    ) : (
                                        t('generate')
                                    )}
                                </button>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className={classes.loadingMessage}>
                                    <p>{t('processing')}</p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className={classes.errorMessage}>
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Generated Result */}
                            <div className={classes.resultSection}>
                                <img
                                    src={generatedImage}
                                    alt="Generated preview"
                                    className={classes.resultImage}
                                />
                                <div className={classes.resultActions}>
                                    <button
                                        className={classes.downloadBtn}
                                        onClick={handleDownload}
                                    >
                                        <FaDownload /> {t('download')}
                                    </button>
                                    <button
                                        className={classes.resetBtn}
                                        onClick={handleReset}
                                    >
                                        <FaRedo /> {t('tryAgain')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
