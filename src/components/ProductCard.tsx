"use client"
import classes from "@/components/ProductCard.module.css";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, memo } from 'react';
import { useSession } from 'next-auth/react';
import { useFavorites } from '@/contexts/FavoriteContext';

// Importing Product interface from the parent.
import { Product } from '@/lib/interfaces';
// Icons
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { IoEyeOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi2";
import { useCurrency } from '@/contexts/CurrencyContext';
import { getColorCode, isTwoToneColor, splitTwoToneColor } from '@/lib/colorMap';

interface ProductCardProps {
  product: Product;
  locale?: string;
  variant_price?: number | null;
  allVariantPrices?: number[];
  variantAttributes?: any[];  // product_variant_attributes
  variantAttributeValues?: any[];  // product_variant_attribute_values
  productVariants?: any[];  // product_variants
  fabricType?: 'solid' | 'embroidery' | string; // For discount display
}

function ProductCard({ product, locale = 'en', variant_price, allVariantPrices, variantAttributes = [], variantAttributeValues = [], productVariants = [], fabricType }: ProductCardProps) {
  const { convertPrice } = useCurrency();
  const placeholder_image_link = "https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif";
  const { data: session } = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Renk ve kumaş attribute'larını al
  const colorAttribute = useMemo(() =>
    variantAttributes.find(attr => attr.name?.toLowerCase() === 'color'),
    [variantAttributes]
  );

  const fabricAttribute = useMemo(() =>
    variantAttributes.find(attr => attr.name?.toLowerCase() === 'fabric' || attr.name?.toLowerCase() === 'kumaş'),
    [variantAttributes]
  );

  // Genişlik (width) attribute'ını al
  const widthAttribute = useMemo(() =>
    variantAttributes.find(attr => attr.name?.toLowerCase() === 'width' || attr.name?.toLowerCase() === 'genişlik'),
    [variantAttributes]
  );

  // Renk değerlerini al - SADECE bu ürünün varyantlarında kullanılan renkleri
  const colorValues = useMemo(() => {
    if (!colorAttribute || !productVariants.length) return [];

    // Bu ürünün varyantlarını filtrele
    const productSpecificVariants = productVariants.filter(v => v.product_id === product.id);
    if (!productSpecificVariants.length) return [];

    // Bu varyantlarda kullanılan attribute value ID'lerini topla
    const usedValueIds = new Set<number>();
    productSpecificVariants.forEach(variant => {
      if (variant.product_variant_attribute_values) {
        variant.product_variant_attribute_values.forEach((valueId: number) => {
          usedValueIds.add(valueId);
        });
      }
    });

    // Sadece kullanılan value ID'leri filtrele ve renk attribute'\u0131naait olanları al
    const colorValuesForAttr = variantAttributeValues
      .filter(val =>
        val.product_variant_attribute_id === colorAttribute.id &&
        usedValueIds.has(val.id)
      )
      .map(val => val.product_variant_attribute_value?.trim() || '');

    // Unique values
    return Array.from(new Set(colorValuesForAttr)).filter(v => v.length > 0);
  }, [colorAttribute, variantAttributeValues, productVariants, product.id]);

  // Kumaş değerlerini al - SADECE bu ürünün varyantlarında kullanılan kumaşları
  const fabricValues = useMemo(() => {
    if (!fabricAttribute || !productVariants.length) return [];

    // Bu ürünün varyantlarını filtrele
    const productSpecificVariants = productVariants.filter(v => v.product_id === product.id);
    if (!productSpecificVariants.length) return [];

    // Bu varyantlarda kullanılan attribute value ID'lerini topla
    const usedValueIds = new Set<number>();
    productSpecificVariants.forEach(variant => {
      if (variant.product_variant_attribute_values) {
        variant.product_variant_attribute_values.forEach((valueId: number) => {
          usedValueIds.add(valueId);
        });
      }
    });

    // Sadece kullanılan value ID'leri filtrele ve kumaş attribute'\u0131na ait olanları al
    const fabricValuesForAttr = variantAttributeValues
      .filter(val =>
        val.product_variant_attribute_id === fabricAttribute.id &&
        usedValueIds.has(val.id)
      )
      .map(val => val.product_variant_attribute_value?.trim() || '');

    // Unique values
    return Array.from(new Set(fabricValuesForAttr)).filter(v => v.length > 0);
  }, [fabricAttribute, variantAttributeValues, productVariants, product.id]);

  // Genişlik değerlerini al - SADECE bu ürünün varyantlarında kullanılanları
  const widthValues = useMemo(() => {
    if (!widthAttribute || !productVariants.length) return [];

    // Bu ürünün varyantlarını filtrele
    const productSpecificVariants = productVariants.filter(v => v.product_id === product.id);
    if (!productSpecificVariants.length) return [];

    // Bu varyantlarda kullanılan attribute value ID'lerini topla
    const usedValueIds = new Set<number>();
    productSpecificVariants.forEach(variant => {
      if (variant.product_variant_attribute_values) {
        variant.product_variant_attribute_values.forEach((valueId: number) => {
          usedValueIds.add(valueId);
        });
      }
    });

    // Sadece kullanılan value ID'leri filtrele ve genişlik attribute'\u0131na ait olanları al
    const widthValuesForAttr = variantAttributeValues
      .filter(val =>
        val.product_variant_attribute_id === widthAttribute.id &&
        usedValueIds.has(val.id)
      )
      .map(val => val.product_variant_attribute_value?.trim() || '');

    // Unique values ve sayıya dönüştür
    const uniqueWidths = Array.from(new Set(widthValuesForAttr)).filter(v => v.length > 0);
    const numericWidths = uniqueWidths
      .map(w => parseFloat(w))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    return numericWidths;
  }, [widthAttribute, variantAttributeValues, productVariants, product.id]);

  // Genişlik display text'ini oluştur
  const widthDisplayText = useMemo(() => {
    if (widthValues.length === 0) return '';
    if (widthValues.length === 1) return `${widthValues[0]}cm`;
    // 2+ değer varı = aralık göster
    return `${widthValues[0]}-${widthValues[widthValues.length - 1]}cm`;
  }, [widthValues]);

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.primary_image || placeholder_image_link);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const isWishlisted = isFavorite(product.sku);

  // Reset image states when product changes
  useEffect(() => {
    const newSrc = product.primary_image || placeholder_image_link;
    setImageSrc(newSrc);
    setImageError(false);
    setHasTriedFallback(false);

    // Check if image is already cached/loaded
    const img = new Image();
    img.src = newSrc;
    if (img.complete) {
      setImageLoading(false);
    } else {
      setImageLoading(true);
      img.onload = () => setImageLoading(false);
      img.onerror = () => setImageLoading(false);
    }
  }, [product.primary_image, product.sku]);

  // Fetch review stats for product
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_product_reviews/${product.sku}/`
        );
        if (response.ok) {
          const data = await response.json();
          setAverageRating(data.average_rating || 0);
          setReviewCount(data.total_count || 0);
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };

    if (product.sku) {
      fetchReviewStats();
    }
  }, [product.sku]);

  const pathname = usePathname();
  let product_category_name = pathname.split("/").at(-1);

  // Format price with currency (using global context)
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return convertPrice(numPrice);
  };

  // Discount calculation based on fabric type
  // Solid fabrics: 50% off (original = current * 2)
  // Embroidery: 37% off (original = current / 0.63)
  const getDiscountInfo = (currentPrice: number) => {
    if (fabricType === 'solid') {
      return {
        discountPercent: 50,
        originalPrice: currentPrice * 2
      };
    } else if (fabricType === 'embroidery') {
      return {
        discountPercent: 37,
        originalPrice: currentPrice / 0.63
      };
    }
    return null;
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.email) {
      // Redirect to login if not authenticated
      window.location.href = `/${locale}/login`;
      return;
    }

    if (favoriteLoading) return;

    setFavoriteLoading(true);
    await toggleFavorite(product.sku);
    setFavoriteLoading(false);
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // PDF oluşturma sayfasına yönlendir - ürün bilgilerini URL parametresi olarak gönder
    const pdfUrl = `/api/generate-pdf?sku=${product.sku}&title=${encodeURIComponent(product.title)}&image=${encodeURIComponent(product.primary_image || '')}`;
    window.open(pdfUrl, '_blank');
  };

  const router = useRouter();

  const handleColorSwatchClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseHref = `${product_category_name}/${product.sku}`;
    const url = `${baseHref}?color=${encodeURIComponent(color)}#ProductDetailCard`;
    router.push(url);
  };

  const handleFabricSwatchClick = (e: React.MouseEvent, fabric: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseHref = `${product_category_name}/${product.sku}`;
    const url = `${baseHref}?fabric=${encodeURIComponent(fabric)}#ProductDetailCard`;
    router.push(url);
  };



  return (
    <div className={classes.productCard}>
      <div className={classes.cardContainer}>
        {/* Product Image Container */}
        <div className={classes.imageContainer}>
          <Link
            href={product_category_name + "/" + product.sku + "#ProductDetailCard"}
            className={classes.imageLink}
          >
            <div className={classes.imageWrapper}>
              {imageLoading && (
                <div className={classes.imageLoader}>
                  <div className={classes.spinner}></div>
                </div>
              )}
              <img
                src={imageSrc}
                alt={`${product.title} - ${product.sku}`}
                className={classes.productImage}
                fetchPriority="high"
                decoding="async"
                onLoad={(e) => {
                  if (e.currentTarget.complete) {
                    setImageLoading(false);
                  }
                }}
                onError={(e) => {
                  setImageLoading(false);
                  // First try removing /thumbnails from path (fallback to original image)
                  const currentSrc = e.currentTarget.src;
                  if (!hasTriedFallback && currentSrc.includes('/thumbnails/')) {
                    setHasTriedFallback(true);
                    setImageSrc(currentSrc.replace('/thumbnails/', '/'));
                  } else if (!imageError) {
                    // If that also fails, use placeholder
                    setImageError(true);
                    setImageSrc(placeholder_image_link);
                  }
                }}
              />
              <div className={classes.imageOverlay}></div>
            </div>
          </Link>

          {/* Wishlist Button */}
          <button
            className={classes.wishlistBtn}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? <BsSuitHeartFill /> : <BsSuitHeart />}
          </button>

          {/* Quick Actions */}
          {
            /*
             <div className={classes.quickActions}>
            <button className={classes.actionBtn} aria-label="Quick view">
              <IoEyeOutline />
            </button>
          </div>
            */

          }

        </div>

        {/* Product Info */}
        <div className={classes.productInfo}>
          <Link
            href={product_category_name + "/" + product.sku + "#ProductDetailCard"}
            className={classes.productLink}
          >
            <div className={classes.productTitle}>{product.title}</div>
            <div className={classes.productSku}>SKU: {product.sku}</div>

            {/* Attributes: Width and Fabric Type */}
            <div className={classes.productAttributes}>
              {widthDisplayText && <span className={classes.attributeTag}>{widthDisplayText}</span>}
              {fabricValues.length > 0 && (
                <span className={classes.attributeTag}>
                  {fabricValues.length === 1 ? fabricValues[0] : `${fabricValues.length} types`}
                </span>
              )}
            </div>

            {/* Review Stars and Count */}
            {reviewCount > 0 && (
              <div className={classes.reviewStats}>
                <div className={classes.starsContainer}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    i < Math.floor(averageRating) ? (
                      <span key={i} className={classes.filledStar}>★</span>
                    ) : (
                      <span key={i} className={classes.emptyStar}>☆</span>
                    )
                  ))}
                </div>
                <span className={classes.ratingText}>
                  {averageRating.toFixed(1)} ({reviewCount} {(() => {
                    switch (locale) {
                      case 'tr': return 'yorum';
                      case 'ru': return 'отзывов';
                      case 'pl': return 'opinii';
                      default: return 'reviews';
                    }
                  })()})
                </span>
              </div>
            )}

            {/* Price Section with Discount Display */}
            <div className={classes.priceSection}>
              {(() => {
                // Helper to render price with discount
                const renderPriceWithDiscount = (price: number) => {
                  const discountInfo = getDiscountInfo(price);
                  if (discountInfo) {
                    return (
                      <>
                        <span className={classes.discountBadge}>%{discountInfo.discountPercent}</span>
                        <span className={classes.originalPrice}>{formatPrice(discountInfo.originalPrice)}</span>
                        <span className={classes.currentPrice}>{formatPrice(price)}</span>
                      </>
                    );
                  }
                  return <span className={classes.currentPrice}>{formatPrice(price)}</span>;
                };

                // If multiple variant prices provided, check if they're all the same
                if (allVariantPrices && allVariantPrices.length > 0) {
                  const validPrices = allVariantPrices.filter(p => p && Number(p) > 0);
                  if (validPrices.length === 0) {
                    // No valid prices
                    return (
                      <span className={classes.contactPrice}>
                        {locale === 'tr' ? 'Fiyat için iletişime geçin' :
                          locale === 'ru' ? 'Свяжитесь для уточнения цены' :
                            locale === 'pl' ? 'Skontaktuj się w sprawie ceny' :
                              locale === 'de' ? 'Kontaktieren Sie uns für den Preis' :
                                'Contact for price'}
                      </span>
                    );
                  }

                  // Check if all prices are the same
                  const allSame = validPrices.every(p => p === validPrices[0]);
                  if (allSame) {
                    return renderPriceWithDiscount(validPrices[0]);
                  } else {
                    // Prices differ - show min price with discount
                    const minPrice = Math.min(...validPrices);
                    return renderPriceWithDiscount(minPrice);
                  }
                }

                // Fallback to variant_price or product.price
                if (variant_price && Number(variant_price) > 0) {
                  return renderPriceWithDiscount(Number(variant_price));
                }
                if (product.price && Number(product.price) > 0) {
                  return renderPriceWithDiscount(Number(product.price));
                }

                // No price available
                return (
                  <span className={classes.contactPrice}>
                    {locale === 'tr' ? 'Fiyat için iletişime geçin' :
                      locale === 'ru' ? 'Свяжитесь для уточнения цены' :
                        locale === 'pl' ? 'Skontaktuj się w sprawie ceny' :
                          locale === 'de' ? 'Kontaktieren Sie uns für den Preis' :
                            'Contact for price'}
                  </span>
                );
              })()}
            </div>

            {/* Color/Fabric Swatches - Below Price */}
            {colorValues.length > 0 && (
              <div className={classes.colorSwatchesContainer}>
                <div className={classes.colorSwatchesRow}>
                  {colorValues.slice(0, 4).map((color: string, index: number) => {
                    const isTwoTone = isTwoToneColor(color);

                    return (
                      <div
                        key={`${color}-${index}`}
                        className={classes.colorSwatchSmall}
                        title={color}
                        onClick={(e) => handleColorSwatchClick(e, color)}
                        style={!isTwoTone ? { backgroundColor: getColorCode(color) } : {}}
                      >
                        {isTwoTone ? (
                          <>
                            <span
                              style={{
                                position: 'absolute',
                                width: '50%',
                                height: '100%',
                                left: 0,
                                backgroundColor: splitTwoToneColor(color).color1,
                                borderRadius: '50% 0 0 50%'
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                width: '50%',
                                height: '100%',
                                right: 0,
                                backgroundColor: splitTwoToneColor(color).color2,
                                borderRadius: '0 50% 50% 0'
                              }}
                            />
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                  {colorValues.length > 4 && (
                    <div className={classes.moreSwatchesSmall} title={`+${colorValues.length - 4} more`}>
                      +{colorValues.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fabric Swatches - Below Price */}
            {fabricValues.length > 0 && (
              <div className={classes.colorSwatchesContainer}>
                <div className={classes.colorSwatchesRow}>
                  {fabricValues.slice(0, 4).map((fabric: string, index: number) => {
                    const bgImage = `/media/fabrics/${fabric.toLowerCase()}.avif`;

                    return (
                      <div
                        key={`${fabric}-${index}`}
                        className={classes.fabricSwatchSmall}
                        title={fabric}
                        onClick={(e) => handleFabricSwatchClick(e, fabric)}
                        style={{ backgroundImage: `url(${bgImage})` }}
                      />
                    );
                  })}
                  {fabricValues.length > 4 && (
                    <div className={classes.moreSwatchesSmall} title={`+${fabricValues.length - 4} more`}>
                      +{fabricValues.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductCard);
