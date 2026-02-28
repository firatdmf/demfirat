'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import classes from './CustomCurtainPromo.module.css';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getLocalizedProductField } from '@/lib/productUtils';

interface Product {
    id: number;
    sku: string;
    title: string;
    price: number;
    primary_image: string;
    description?: string;
    product_attributes?: any[];
    prices?: any;
}

interface CustomCurtainPromoProps {
    locale: string;
}

export default function CustomCurtainPromo({ locale }: CustomCurtainPromoProps) {
    const { convertPrice } = useCurrency();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Translations
    const t = {
        title: {
            en: 'Create Your',
            tr: 'Hayalindeki',
            ru: 'Создайте',
            pl: 'Stwórz'
        },
        titleAccent: {
            en: 'Dream Curtain',
            tr: 'Perdeyi Tasarla',
            ru: 'Штору Мечты',
            pl: 'Wymarzoną Zasłonę'
        },
        subtitle: {
            en: 'Choose your fabric, enter measurements, select pleat type — we\'ll tailor it for you with precision and care.',
            tr: 'Kumaşını seç, ölçülerini gir, pile tipini belirle — özenle ve titizlikle diktirelim.',
            ru: 'Выберите ткань, укажите размеры, выберите тип складки — мы сошьём для вас с заботой.',
            pl: 'Wybierz tkaninę, podaj wymiary, wybierz typ zakładki — uszyjemy z dbałością.'
        },
        cta: {
            en: 'Start Designing',
            tr: 'Tasarlamaya Başla',
            ru: 'Начать дизайн',
            pl: 'Zacznij projektować'
        },
        viewAll: {
            en: 'View All',
            tr: 'Tümünü Gör',
            ru: 'Смотреть все',
            pl: 'Zobacz wszystkie'
        },
        featuredFabrics: {
            en: 'Featured Curtains',
            tr: 'Öne Çıkan Perdeler',
            ru: 'Избранные шторы',
            pl: 'Polecane zasłony'
        },
        step1: {
            en: 'Fabric',
            tr: 'Kumaş',
            ru: 'Ткань',
            pl: 'Tkanina'
        },
        step2: {
            en: 'Size',
            tr: 'Ölçü',
            ru: 'Размер',
            pl: 'Rozmiar'
        },
        step3: {
            en: 'Pleat',
            tr: 'Pile',
            ru: 'Складка',
            pl: 'Zakładka'
        },
        step4: {
            en: 'Order',
            tr: 'Sipariş',
            ru: 'Заказ',
            pl: 'Zamówienie'
        },
        measureGuide: {
            en: 'How to Measure?',
            tr: 'Doğru Ölçü Nasıl Alınır?',
            ru: 'Как измерить?',
            pl: 'Jak mierzyć?'
        },
        perMeter: {
            en: '/ meter',
            tr: '/ metre',
            ru: '/ метр',
            pl: '/ metr'
        }
    };

    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products?product_category=fabric&limit=12`
                );
                if (response.ok) {
                    const data = await response.json();
                    const prods = data.products || [];
                    const variants = data.product_variants || [];

                    const productsWithPrices = prods.slice(0, 12).map((p: any) => {
                        const productVariants = variants.filter((v: any) => v.product_id === p.id);
                        const variantPrice = productVariants[0]?.variant_price;
                        return {
                            id: p.id,
                            sku: p.sku,
                            title: p.title,
                            price: variantPrice ? parseFloat(variantPrice) : (p.price ? parseFloat(p.price) : 0),
                            primary_image: p.primary_image || '/media/karvenLogo.webp',
                            description: p.description,
                            product_attributes: p.product_attributes || [],
                            prices: p.prices
                        };
                    });
                    setProducts(productsWithPrices);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Calculate discount from attributes
    const getDiscountInfo = (product: Product) => {
        const discountAttr = product.product_attributes?.find(
            attr => attr.name?.toLowerCase() === 'discount_rate'
        );

        if (!discountAttr || !discountAttr.value) {
            return null;
        }

        const discountRate = parseFloat(discountAttr.value);
        if (isNaN(discountRate) || discountRate <= 0) {
            return null;
        }

        const originalPrice = product.price / (1 - discountRate / 100);

        return {
            discountPercent: Math.round(discountRate),
            originalPrice: originalPrice
        };
    };

    // Scroll handlers
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={classes.promoSection}>
            {/* Promo Header - Dark Hero Style */}
            <div className={classes.promoHeader}>
                <div className={classes.promoContent}>
                    {/* Steps Icons */}
                    <div className={classes.stepsRow}>
                        <div className={classes.stepItem}>
                            <div className={classes.stepIcon}>🎨</div>
                            <span className={classes.stepText}>{t.step1[lang]}</span>
                        </div>
                        <div className={classes.stepDivider}></div>
                        <div className={classes.stepItem}>
                            <div className={classes.stepIcon}>📐</div>
                            <span className={classes.stepText}>{t.step2[lang]}</span>
                        </div>
                        <div className={classes.stepDivider}></div>
                        <div className={classes.stepItem}>
                            <div className={classes.stepIcon}>✨</div>
                            <span className={classes.stepText}>{t.step3[lang]}</span>
                        </div>
                        <div className={classes.stepDivider}></div>
                        <div className={classes.stepItem}>
                            <div className={classes.stepIcon}>📦</div>
                            <span className={classes.stepText}>{t.step4[lang]}</span>
                        </div>
                    </div>

                    <h2 className={classes.promoTitle}>
                        {t.title[lang]} <span className={classes.promoTitleAccent}>{t.titleAccent[lang]}</span>
                    </h2>
                    <p className={classes.promoSubtitle}>{t.subtitle[lang]}</p>

                    <div className={classes.buttonRow}>
                        <Link
                            href={`/${locale}/product/fabric?intent=custom_curtain`}
                            className={classes.ctaButton}
                        >
                            {t.cta[lang]}
                            <span className={classes.ctaArrow}>→</span>
                        </Link>
                        <Link
                            href={`/${locale}/blog/dogru-olcu-nasil-alinir`}
                            className={classes.guideLink}
                        >
                            📐 {t.measureGuide[lang]}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Carousel */}
            <div className={classes.carouselSection}>
                <div className={classes.carouselHeader}>
                    <h3 className={classes.carouselTitle}>{t.featuredFabrics[lang]}</h3>
                    <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.viewAllLink}>
                        {t.viewAll[lang]} →
                    </Link>
                </div>

                <div className={classes.carouselWrapper}>
                    <button
                        className={`${classes.scrollBtn} ${classes.scrollLeft}`}
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        ‹
                    </button>

                    <div className={classes.carousel} ref={scrollContainerRef}>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={classes.productCardSkeleton}>
                                    <div className={classes.skeletonImage}></div>
                                    <div className={classes.skeletonText}></div>
                                    <div className={classes.skeletonPrice}></div>
                                </div>
                            ))
                        ) : (
                            products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/${locale}/product/fabric/${product.sku}/perde#ProductDetailCard`}
                                    className={classes.productCard}
                                >
                                    <div className={classes.imageWrapper}>
                                        <img
                                            src={product.primary_image}
                                            alt={getLocalizedProductField(product as any, 'title', locale)}
                                            className={classes.productImage}
                                            onError={(e) => {
                                                e.currentTarget.src = '/media/karvenLogo.webp';
                                            }}
                                        />
                                        {(() => {
                                            const discountInfo = getDiscountInfo(product);
                                            return discountInfo ? (
                                                <span className={classes.discountBadge}>%{discountInfo.discountPercent}</span>
                                            ) : null;
                                        })()}
                                    </div>
                                    <div className={classes.productInfo}>
                                        <h4 className={classes.productTitle}>{getLocalizedProductField(product as any, 'title', locale)}</h4>
                                        <div className={classes.priceRow}>
                                            {(() => {
                                                const discountInfo = getDiscountInfo(product);
                                                return (
                                                    <div className={classes.priceContainer}>
                                                        {discountInfo && (
                                                            <span className={classes.originalPrice}>
                                                                {convertPrice(discountInfo.originalPrice)} {t.perMeter[lang]}
                                                            </span>
                                                        )}
                                                        {product.price > 0 && (
                                                            <span className={classes.currentPrice}>
                                                                {convertPrice(product.price)} {t.perMeter[lang]}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <button
                        className={`${classes.scrollBtn} ${classes.scrollRight}`}
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
}
