"use client"
import classes from "@/components/ProductCard.module.css";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react';

// Importing Product interface from the parent.
import { Product } from '@/lib/interfaces';
// Icons
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { IoEyeOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi2";

interface ProductCardProps {
  product: Product;
  locale?: string;
  variant_price?: number | null;
}

function ProductCard({ product, locale = 'en', variant_price }: ProductCardProps) {
  const placeholder_image_link = "https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif";
  
  const [imageLoading, setImageLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.primary_image || placeholder_image_link);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

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

  const pathname = usePathname();
  let product_category_name = pathname.split("/").at(-1);

  // Format price with currency
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // PDF oluşturma sayfasına yönlendir - ürün bilgilerini URL parametresi olarak gönder
    const pdfUrl = `/api/generate-pdf?sku=${product.sku}&title=${encodeURIComponent(product.title)}&image=${encodeURIComponent(product.primary_image || '')}`;
    window.open(pdfUrl, '_blank');
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

          {/* PDF Button - Left Bottom */}
          <button 
            className={classes.pdfBtn}
            onClick={handlePdfClick}
            aria-label={locale === 'tr' ? 'PDF olarak indir' :
                       locale === 'ru' ? 'Скачать PDF' :
                       locale === 'pl' ? 'Pobierz PDF' :
                       locale === 'de' ? 'PDF herunterladen' :
                       'Download PDF'}
          >
            <HiDocumentText />
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
            
            {/* Price Section */}
            <div className={classes.priceSection}>
              {/* Try variant_price first, then product.price */}
              {(variant_price && Number(variant_price) > 0) ? (
                <span className={classes.currentPrice}>
                  {formatPrice(variant_price)}
                </span>
              ) : (product.price && Number(product.price) > 0) ? (
                <span className={classes.currentPrice}>
                  {formatPrice(product.price)}
                </span>
              ) : (
                <span className={classes.contactPrice}>
                  {locale === 'tr' ? 'Fiyat için iletişime geçin' :
                   locale === 'ru' ? 'Свяжитесь для уточнения цены' :
                   locale === 'pl' ? 'Skontaktuj się w sprawie ceny' :
                   locale === 'de' ? 'Kontaktieren Sie uns für den Preis' :
                   'Contact for price'}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
