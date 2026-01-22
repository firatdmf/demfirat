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
  hasVideo?: boolean; // Whether product has a local video
}

function ProductCard({ product, locale = 'en', variant_price, allVariantPrices, variantAttributes = [], variantAttributeValues = [], productVariants = [], fabricType, hasVideo = false }: ProductCardProps) {
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
  const [isTouching, setIsTouching] = useState(false);

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

  // Review stats removed for performance - was causing N+1 API calls
  // If needed, these should be included in the main product API response

  const pathname = usePathname();
  let product_category_name = pathname.split("/").at(-1);

  // Format price with currency (using global context)
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return convertPrice(numPrice);
  };

  // Discount calculation based on backend discount_rate attribute
  // Returns null if no discount_rate attribute exists
  const getDiscountInfo = (currentPrice: number) => {
    // Find discount_rate from product attributes
    const discountAttr = product.product_attributes?.find(
      attr => attr.name?.toLowerCase() === 'discount_rate'
    );

    if (!discountAttr || !discountAttr.value) {
      return null; // No discount for this product
    }

    const discountRate = parseFloat(discountAttr.value);
    if (isNaN(discountRate) || discountRate <= 0) {
      return null; // Invalid discount rate
    }

    // Calculate original price: currentPrice = originalPrice * (1 - discountRate/100)
    // So: originalPrice = currentPrice / (1 - discountRate/100)
    const originalPrice = currentPrice / (1 - discountRate / 100);

    return {
      discountPercent: Math.round(discountRate),
      originalPrice: originalPrice
    };
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

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Initialize selectedVariantId from initial primary_image if possible
  useEffect(() => {
    if (product.primary_image && productVariants.length > 0) {
      const initialVariant = productVariants.find(v => v.primary_image === product.primary_image);
      if (initialVariant) {
        setSelectedVariantId(String(initialVariant.id));
      }
    }
  }, [product.primary_image, productVariants]);

  const handleColorSwatchClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();

    // DEBUG: Start Click
    // console.log(`[ColorClick] Start for color: '${color}', ProductID: ${product.id}`);

    // Find the variant that matches this color
    if (!colorAttribute) {
      // console.warn("[ColorClick] No color attribute found");
      return;
    }

    try {
      const selectedVariant = productVariants
        .filter(v => String(v.product_id) === String(product.id)) // Robust ID comparison
        .find(variant => {
          if (!variant.product_variant_attribute_values) return false;

          // Check if any of this variant's attributes match the selected color
          const hasMatch = variant.product_variant_attribute_values.some((valId: any) => {
            // valId might be the ID directly or an object? API usually returns IDs in array
            const valIdStr = String(valId);

            const attrValue = variantAttributeValues.find(av => String(av.id) === valIdStr);

            if (!attrValue) return false;

            const isColorAttr = String(attrValue.product_variant_attribute_id) === String(colorAttribute.id);
            const isValueMatch = attrValue.product_variant_attribute_value?.trim() === color;

            return isColorAttr && isValueMatch;
          });

          return hasMatch;
        });

      // console.log("[ColorClick] Selected Variant:", selectedVariant);

      if (selectedVariant) {
        if (selectedVariant.primary_image) {
          setImageSrc(selectedVariant.primary_image);
        }
        setSelectedVariantId(String(selectedVariant.id));
      } else {
        // console.log("[ColorClick] No matching variant found");
      }
    } catch (err) {
      console.error("Error switching variant image:", err);
    }
  };

  const handleFabricSwatchClick = (e: React.MouseEvent, fabric: string) => {
    e.preventDefault();
    e.stopPropagation();
    const baseHref = `${product_category_name}/${product.sku}`;
    const url = `${baseHref}?fabric=${encodeURIComponent(fabric)}#ProductDetailCard`;
    router.push(url);
  };



  const secondImage = useMemo(() => {
    if (!product.product_files || product.product_files.length === 0) return null;

    // Filter for valid images - STRICTLY exclude videos by extension if type is missing
    const images = product.product_files.filter(f => {
      // 1. Check explicit type
      if (f.file_type === 'video') return false;

      // 2. Check file extension if type is loose
      const isVideoFile = f.file?.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)$/);
      if (isVideoFile) return false;

      return !f.file_type || f.file_type === 'image';
    });

    // We need at least one other image besides the current one to show a hover effect
    if (images.length === 0) return null;

    const currentSrc = (imageSrc || product.primary_image || '').trim();

    // Helper to check if two image URLs are effectively the same
    const areImagesSame = (url1: string, url2: string) => {
      if (!url1 || !url2) return false;
      // 1. Remove domain (http/https)
      const stripDomain = (u: string) => u.replace(/^https?:\/\/[^\/]+/, '');
      // 2. Remove query params
      const stripQuery = (u: string) => u.split('?')[0];
      // 3. Remove leading slash
      const normalize = (u: string) => stripQuery(stripDomain(u)).replace(/^\//, '');

      return normalize(url1) === normalize(url2);
    };

    // 1. Identify Target Variant (if any)
    let targetVariantId = selectedVariantId;

    if (!targetVariantId) {
      // Try to infer from current image
      const activeVariant = productVariants.find(v => areImagesSame(v.primary_image || '', currentSrc));
      const activeFile = images.find(f => areImagesSame(f.file, currentSrc) && f.product_variant_id);

      if (activeVariant) {
        targetVariantId = String(activeVariant.id);
      } else if (activeFile) {
        targetVariantId = String(activeFile.product_variant_id);
      }
    }

    let candidate = null;

    // Strategy A: Strict Variant Match (The Ideal Case)
    // Look for a secondary image explicitly assigned to this variant
    if (targetVariantId) {
      candidate = images.find(f =>
        f.product_variant_id &&
        String(f.product_variant_id) === String(targetVariantId) &&
        !areImagesSame(f.file, currentSrc)
      );
    }

    // Strategy B: Generic Image Match (Good Fallback)
    // If A failed (or no variant), look for an image that belongs to NO variant
    if (!candidate) {
      candidate = images.find(f =>
        !f.product_variant_id &&
        !areImagesSame(f.file, currentSrc)
      );
    }

    // Strategy C: Ultimate Fallback (Any Image)
    // If A and B failed, just grab ANY image that isn't the current one.
    // This handles cases where data might be messy (e.g. all images have wrong variant IDs)
    if (!candidate) {
      candidate = images.find(f => !areImagesSame(f.file, currentSrc));
    }

    return candidate ? candidate.file : null;
  }, [product.product_files, imageSrc, product.primary_image, productVariants, selectedVariantId]);

  return (
    <div className={classes.productCard}>
      <div className={classes.cardContainer}>
        {/* Product Image Container */}
        <div className={classes.imageContainer}>
          <Link
            href={product_category_name + "/" + product.sku + "#ProductDetailCard"}
            className={classes.imageLink}
          >
            <div
              className={`${classes.imageWrapper} ${isTouching ? classes.imageWrapperTouching : ''}`}
              onTouchStart={() => setIsTouching(true)}
              onTouchEnd={() => setIsTouching(false)}
              onTouchCancel={() => setIsTouching(false)}
            >
              {imageLoading && (
                <div className={classes.imageLoader}>
                  <div className={classes.spinner}></div>
                </div>
              )}
              <img
                src={imageSrc}
                alt={`${product.title} - ${product.sku}`}
                className={classes.productImage}
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                  if (e.currentTarget.complete) {
                    setImageLoading(false);
                  }
                }}
                onError={(e) => {
                  setImageLoading(false);
                  const currentSrc = e.currentTarget.src;
                  if (!hasTriedFallback && currentSrc.includes('/thumbnails/')) {
                    setHasTriedFallback(true);
                    setImageSrc(currentSrc.replace('/thumbnails/', '/'));
                  } else if (!imageError) {
                    setImageError(true);
                    setImageSrc(placeholder_image_link);
                  }
                }}
              />

              {/* Secondary Image for Hover */}
              {secondImage && (
                <img
                  src={secondImage}
                  alt={`${product.title} - Secondary`}
                  className={classes.productImageHover}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

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

          {/* Video Badge */}
          {hasVideo && (
            <div className={classes.videoBadge} title="Video available" />
          )}

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
