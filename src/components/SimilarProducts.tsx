'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import classes from './SimilarProducts.module.css';

interface ProductVariant {
    id: number;
    product_id: number;
    variant_price: number | null;
}

interface SimilarProduct {
    id: number;
    sku: string;
    title: string;
    price: number | null;
    primary_image: string;
    minPrice?: number | null;
    maxPrice?: number | null;
}

interface SimilarProductsProps {
    fabricType: 'solid' | 'embroidery' | string;
    currentProductSku: string;
    locale: string;
}

export default function SimilarProducts({ fabricType, currentProductSku, locale }: SimilarProductsProps) {
    const [products, setProducts] = useState<SimilarProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { convertPrice } = useCurrency();

    const title = locale === 'tr' ? 'Benzer Ürünler'
        : locale === 'ru' ? 'Похожие товары'
            : locale === 'pl' ? 'Podobne produkty'
                : 'Similar Products';

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                const response = await fetch(
                    `/api/products/similar?fabric_type=${fabricType}&exclude_sku=${currentProductSku}&limit=12`
                );
                if (response.ok) {
                    const data = await response.json();
                    const rawProducts = data.products || [];
                    const variants: ProductVariant[] = data.product_variants || [];

                    // Calculate price ranges for each product based on variants
                    const productsWithPrices = rawProducts.map((product: SimilarProduct) => {
                        // Find all variants for this product
                        const productVariants = variants.filter(v => v.product_id === product.id);

                        // Get all valid variant prices
                        const variantPrices = productVariants
                            .map(v => v.variant_price)
                            .filter((p): p is number => p !== null && p > 0);

                        // Also include product.price as a fallback
                        if (product.price && product.price > 0) {
                            if (variantPrices.length === 0) {
                                variantPrices.push(product.price);
                            }
                        }

                        if (variantPrices.length > 0) {
                            const minPrice = Math.min(...variantPrices);
                            const maxPrice = Math.max(...variantPrices);
                            return {
                                ...product,
                                minPrice,
                                maxPrice: maxPrice !== minPrice ? maxPrice : null
                            };
                        }

                        return {
                            ...product,
                            minPrice: product.price,
                            maxPrice: null
                        };
                    });

                    setProducts(productsWithPrices);
                }
            } catch (error) {
                console.error('Error fetching similar products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (fabricType) {
            fetchSimilarProducts();
        } else {
            setLoading(false);
        }
    }, [fabricType, currentProductSku]);

    // Format price display: single price or range
    const formatPriceDisplay = (product: SimilarProduct) => {
        if (product.minPrice === null || product.minPrice === undefined || product.minPrice <= 0) {
            return null;
        }

        if (product.maxPrice && product.maxPrice > product.minPrice) {
            return `${convertPrice(product.minPrice)} - ${convertPrice(product.maxPrice)}`;
        }

        return convertPrice(product.minPrice);
    };

    if (loading) {
        return (
            <div className={classes.container}>
                <h2 className={classes.title}>{title}</h2>
                <div className={classes.loading}>
                    <div className={classes.spinner}></div>
                </div>
            </div>
        );
    }

    if (!products.length) {
        return null;
    }

    return (
        <section className={classes.container}>
            <h2 className={classes.title}>{title}</h2>
            <div className={classes.scrollContainer}>
                <div className={classes.productGrid}>
                    {products.map((product) => {
                        const priceDisplay = formatPriceDisplay(product);
                        return (
                            <Link
                                key={product.sku}
                                href={`/${locale}/product/fabric/${product.sku}`}
                                className={classes.productCard}
                            >
                                <div className={classes.imageWrapper}>
                                    <img
                                        src={product.primary_image || 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif'}
                                        alt={product.title}
                                        className={classes.productImage}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif';
                                        }}
                                    />
                                </div>
                                <div className={classes.productInfo}>
                                    <h3 className={classes.productTitle}>{product.title}</h3>
                                    {priceDisplay && (
                                        <span className={classes.productPrice}>
                                            {priceDisplay}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
