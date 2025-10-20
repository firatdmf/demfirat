"use client"
import classes from "@/components/ProductCard.module.css";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useState } from 'react';

// Importing Product interface from the parent.
import { Product } from '@/lib/interfaces';
import { useSession } from "next-auth/react";
// Icons
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { IoEyeOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi2";

interface ProductCardProps {
  product: Product;
  locale?: string;
}

function ProductCard({ product, locale = 'en' }: ProductCardProps) {
  const placeholder_image_link = "https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif";
  
  const [imageLoading, setImageLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if the user is logged in. If they are then display price.
  const { status } = useSession({
    required: false,
    onUnauthenticated() {
      console.log("Not logged in!");
    },
  });

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
                src={imageError ? placeholder_image_link : (product.primary_image || placeholder_image_link)}
                alt={`${product.title} - ${product.sku}`}
                className={classes.productImage}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  // First try removing /thumbnails from path (fallback to original image)
                  const currentSrc = e.currentTarget.src;
                  if (currentSrc.includes('/thumbnails/')) {
                    e.currentTarget.src = currentSrc.replace('/thumbnails/', '/');
                  } else {
                    // If that also fails, use placeholder
                    setImageError(true);
                    setImageLoading(false);
                  }
                }}
                loading="lazy"
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
            {status === "authenticated" && product.price ? (
              <div className={classes.priceSection}>
                <span className={classes.currentPrice}>
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <div className={classes.loginPrompt}>
                {locale === 'tr' ? 'Fiyat için giriş yapın' :
                 locale === 'ru' ? 'Войдите, чтобы увидеть цену' :
                 locale === 'pl' ? 'Zaloguj się, aby zobaczyć cenę' :
                 locale === 'de' ? 'Anmelden für Preise' :
                 'Login to see price'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
