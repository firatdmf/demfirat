"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import CurtainWizard from './CurtainWizard';
import TryAtHomeSidebar from './TryAtHomeSidebar';
import ImageZoom from './ImageZoom';
import IadeSartlari from './IadeSartlari';
import Image from "next/image";

import { FaCut, FaCamera, FaSwatchbook, FaTruck, FaUndo, FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import classes from "./ProductDetailCard.module.css";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile, ProductCategory, ProductAttribute } from '@/lib/interfaces';
import { useSession } from 'next-auth/react';
import { getColorCode, isTwoToneColor, splitTwoToneColor } from '@/lib/colorMap';
import { useFavorites } from '@/contexts/FavoriteContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import ProductReviewsList from './ProductReviewsList';
import SimilarProducts from './SimilarProducts';
import { translateTextSync } from '@/lib/translate';
import { getLocalizedProductField } from '@/lib/productUtils';
import { trackViewItem, trackAddToCart, trackSelectFabric, trackRequestSample } from '@/lib/tracking';
import { trackKlaviyoAddToCart } from '@/lib/klaviyo';


type ProductDetailCardPageProps = {
  product: Product,
  product_category: string | null;
  product_variants: ProductVariant[] | null,
  product_variant_attributes: ProductVariantAttribute[] | null,
  product_variant_attribute_values: ProductVariantAttributeValue[] | null,
  searchParams: { [key: string]: string | string[] | undefined };
  product_files: ProductFile[] | null;
  product_attributes?: ProductAttribute[] | null;
  variant_attributes?: ProductAttribute[] | null;
  locale?: string;
};

function ProductDetailCard({
  product,
  product_category,
  product_variants,
  product_variant_attributes,
  product_variant_attribute_values,
  searchParams,
  product_files,
  product_attributes = [],
  variant_attributes = [],
  locale = 'en'
}: ProductDetailCardPageProps) {

  const t = useTranslations('ProductDetailCard');
  const { currency, convertPrice, formatPreconvertedPrice, rates, loading } = useCurrency();
  const placeholder_image_link = "/media/woocommerce-placeholder.svg";

  const [imageLoaded, setImageLoaded] = useState<boolean>(true);
  const viewItemFiredRef = useRef<string | null>(null);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);
  const [isTryAtHomeSidebarOpen, setIsTryAtHomeSidebarOpen] = useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Video URL is set only on thumbnail hover, keeping page load fast
  const [videoPreloadUrl, setVideoPreloadUrl] = useState<string | null>(null);

  // Format price with currency - uses pre-converted prices dict from backend when available
  const formatPrice = (
    price: any,
    pricesDict?: { USD: number; TRY: number; EUR: number; RUB: number; PLN: number } | null
  ) => {
    if (pricesDict) return formatPreconvertedPrice(pricesDict, parseFloat(String(price)));
    const numPrice = parseFloat(String(price));
    return convertPrice(numPrice);
  };

  // Translation helper for attribute names and values
  const translateAttributeName = (name: string): string => {
    return translateTextSync(name, locale);
  };

  // Translation helper for category names (uses same utility)
  const translateCategory = (category: string): string => {
    return translateTextSync(category, locale);
  };

  // Helper to get localized field (title or description) from JSON format
  // Format: {"translations": {"tr": {"title": "...", "description": "..."}, "en": {...}}}
  // const getLocalizedField = (field: 'title' | 'description'): string | null => {
  //   /* Logic moved to @/lib/productUtils */
  //   return getLocalizedProductField(product, field, locale);
  // };

  // URL parametrelerinden veya ilk varyanttan initial attributes'ı hesapla
  const getInitialAttributes = () => {
    const initialAttributes: { [key: string]: string } = {};

    // 1. Check if a specific variant ID was passed in URL (e.g. from ProductCard)
    const variantIdParam = searchParams['variant'];
    if (variantIdParam && typeof variantIdParam === 'string' && product_variants) {
      const targetVariant = product_variants.find(v => String(v.id) === variantIdParam);
      if (targetVariant && targetVariant.product_variant_attribute_values && product_variant_attribute_values && product_variant_attributes) {
        targetVariant.product_variant_attribute_values.forEach((valId: any) => {
          const valObj = product_variant_attribute_values.find(v => String(v.id) === String(valId));
          if (valObj) {
            const attrDef = product_variant_attributes.find(a => String(a.id) === String(valObj.product_variant_attribute_id));
            if (attrDef && attrDef.name) {
              initialAttributes[attrDef.name] = valObj.product_variant_attribute_value || '';
            }
          }
        });
        return initialAttributes;
      }
    }

    // 2. Önce URL parametrelerini (isim bazlı: ?color=Red) kontrol et
    const hasUrlParams = Object.keys(searchParams).length > 0;

    if (hasUrlParams) {
      // URL'den parametreleri al
      product_variant_attributes?.forEach(attribute => {
        const attrName = attribute.name ?? '';
        const urlValue = searchParams[attrName];

        if (urlValue && typeof urlValue === 'string') {
          // URL'deki değerin geçerli olup olmadığını kontrol et
          const isValidValue = product_variant_attribute_values?.some(
            val =>
              val.product_variant_attribute_id === attribute.id &&
              val.product_variant_attribute_value === urlValue
          );

          if (isValidValue) {
            initialAttributes[attrName] = urlValue;
            console.log(`[ProductDetailCard] Taken from the URL: ${attrName} = ${urlValue}`);
          }
        }
      });
    }

    // 3. Eksik attribute'lar için ilk varyanttan al
    product_variant_attributes?.forEach(attribute => {
      const attrName = attribute.name ?? '';

      if (!initialAttributes[attrName]) {
        // Get the first variant's value for this attribute to ensure consistency
        let firstValue = undefined;
        if (product_variants && product_variants.length > 0 && product_variants[0].product_variant_attribute_values && product_variant_attribute_values) {
          const firstVariantValIds = product_variants[0].product_variant_attribute_values;
          const valObj = product_variant_attribute_values.find(v => firstVariantValIds.some((id: any) => String(id) === String(v.id)) && String(v.product_variant_attribute_id) === String(attribute.id));
          if (valObj) {
            firstValue = valObj.product_variant_attribute_value;
          }
        }

        // Fallback to the first available value for this attribute if variant didn't have it
        if (!firstValue) {
          firstValue = product_variant_attribute_values?.find(
            val => val.product_variant_attribute_id === attribute.id
          )?.product_variant_attribute_value;
        }

        if (firstValue) {
          initialAttributes[attrName] = firstValue;
        }
      }
    });

    return initialAttributes;
  };

  const initialAttributes = useMemo(() => getInitialAttributes(), [
    product_variant_attributes,
    product_variant_attribute_values,
    searchParams
  ]);

  // Determine context from category and intent param.
  // The /curtain route forces intent=custom_curtain server-side, so this is always reliable.
  const isFabricProduct = product_category?.toLowerCase().includes('fabric') || product_category?.toLowerCase().includes('kumaş');
  const isCustomCurtainIntent = searchParams?.intent === 'custom_curtain';
  const hasStandardCartOptions = !isCustomCurtainIntent;
  const [showWizard, setShowWizard] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showPleatGuide, setShowPleatGuide] = useState(false);

  // Initialize selectedAttributes synchronously with initialAttributes 
  // to avoid rendering empty state and flashing the fallback product image.
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>(initialAttributes);
  const [userHasSelectedVariant, setUserHasSelectedVariant] = useState<boolean>(
    !!(product_variant_attributes && product_variant_attributes.length > 0)
  );

  // URL parametreleri veya initial attributes değiştiğinde selectedAttributes'u güncelle
  useEffect(() => {
    // Component ilk mount olduğunda veya URL parametreleri değiştiğinde
    if (Object.keys(initialAttributes).length > 0) {
      setSelectedAttributes(initialAttributes);
    }
  }, [JSON.stringify(initialAttributes)]); // JSON string ile karşılaştır

  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // handle unauthenticated - silent fail for guests
    },
  });

  const { isFavorite, toggleFavorite } = useFavorites();
  const { refreshCart, addToGuestCart, isGuest } = useCart();
  const [quantity, setQuantity] = useState<string>('1');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'delivery' | 'returns' | null>('description');
  const [isAdding, setIsAdding] = useState(false);

  const findSelectedVariant = () => {
    if (!product_variants || !product_variant_attributes || !product_variant_attribute_values) return undefined;

    return product_variants.find(variant => {
      // For each selected attribute, check if the variant has the matching attribute value
      return Object.entries(selectedAttributes).every(([key, value]) => {
        // Find the attribute definition by name
        const attrDef = product_variant_attributes.find(attr => attr.name === key);
        if (!attrDef) return false;

        // Find the attribute value object by attribute id and value
        const valueObj = product_variant_attribute_values.find(
          val =>
            String(val.product_variant_attribute_id) === String(attrDef.id) &&
            val.product_variant_attribute_value === value
        );
        if (!valueObj) return false;

        // Check if the variant includes this attribute value's id
        return variant.product_variant_attribute_values?.includes(valueObj.id);
      });
    });
  };

  // Compute which attribute values lead ONLY to sku-"0" variants (non-selectable)
  // Hierarchy uses the API's natural attribute order.
  // Each attribute is only filtered by attributes that come BEFORE it in that order.
  const precedingAttributes = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    if (!product_variant_attributes) return result;
    for (let i = 0; i < product_variant_attributes.length; i++) {
      const name = product_variant_attributes[i].name ?? '';
      const preceding = new Set<string>();
      for (let j = 0; j < i; j++) {
        preceding.add(product_variant_attributes[j].name ?? '');
      }
      result[name] = preceding;
    }
    return result;
  }, [product_variant_attributes]);

  const getHierarchyFilteredVariants = (attrName: string) => {
    const preceding = precedingAttributes[attrName] ?? new Set<string>();
    const relevantSelections = Object.entries(selectedAttributes).filter(
      ([key]) => preceding.has(key)
    );
    if (relevantSelections.length === 0) return product_variants || [];
    return (product_variants || []).filter(variant =>
      relevantSelections.every(([key, val]) => {
        const attrDef = product_variant_attributes?.find(attr => attr.name === key);
        if (!attrDef) return false;
        const valueObj = product_variant_attribute_values?.find(
          v => String(v.product_variant_attribute_id) === String(attrDef.id) && v.product_variant_attribute_value === val
        );
        if (!valueObj) return false;
        return variant.product_variant_attribute_values?.includes(valueObj.id);
      })
    );
  };

  const disabledValues = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    if (!product_variants || !product_variant_attributes || !product_variant_attribute_values) return result;

    for (const attribute of product_variant_attributes) {
      const attrName = attribute.name ?? '';
      const disabled = new Set<string>();
      const eligibleVariants = getHierarchyFilteredVariants(attrName);
      const allValuesForAttr = product_variant_attribute_values.filter(
        v => String(v.product_variant_attribute_id) === String(attribute.id)
      );
      for (const attrValue of allValuesForAttr) {
        const matchingVariants = eligibleVariants.filter(variant =>
          variant.product_variant_attribute_values?.includes(attrValue.id)
        );
        if (matchingVariants.length > 0 && matchingVariants.every(v => Number(v.variant_quantity ?? 0) <= 0)) {
          disabled.add(attrValue.product_variant_attribute_value);
        }
      }
      result[attrName] = disabled;
    }
    return result;
  }, [selectedAttributes, product_variants, product_variant_attributes, product_variant_attribute_values, precedingAttributes]);

  // useMemo ile selectedVariant'ı hesapla
  const selectedVariant = useMemo(() => {
    if (!product_variants || !product_variant_attributes || !product_variant_attribute_values) return undefined;
    if (Object.keys(selectedAttributes).length === 0) return undefined;

    return product_variants.find(variant => {
      return Object.entries(selectedAttributes).every(([key, value]) => {
        const attrDef = product_variant_attributes.find(attr => attr.name === key);
        if (!attrDef) return false;

        const valueObj = product_variant_attribute_values.find(
          val =>
            String(val.product_variant_attribute_id) === String(attrDef.id) &&
            val.product_variant_attribute_value === value
        );
        if (!valueObj) return false;

        return variant.product_variant_attribute_values?.includes(valueObj.id);
      });
    });
  }, [selectedAttributes, product_variants, product_variant_attributes, product_variant_attribute_values]);


  // Sayfa yüklenince en üste scroll yap
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // Meta Pixel & GA4: ViewItem Event
  useEffect(() => {
    if (product && !loading) {
      if (viewItemFiredRef.current === product.sku) return; // Only fire once per product view

      const basePrice = Number(selectedVariant?.variant_price || product.price || 0);
      const currentRate = rates.find(r => r.currency_code === currency)?.rate || 1;
      const convertedPrice = basePrice * currentRate;

      trackViewItem(
        product_category || 'fabric',
        product.sku,
        product.title,
        convertedPrice,
        currency
      );
      viewItemFiredRef.current = product.sku; // Mark as fired
      console.log(`[Tracking] view_item event fired`, { sku: product.sku, title: product.title, currency: currency, value: convertedPrice });
    }
  }, [product.sku, currency, rates, loading]); // Wait for currency data to load

  // URL parametrelerini güncelle
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.keys(selectedAttributes).forEach(key => {
      newParams.set(key, selectedAttributes[key]);
    });
    window.history.replaceState({}, '', `?${newParams.toString()}`);
  }, [selectedAttributes]);



  // useMemo ile filtrelenmiş resimleri hesapla
  const filteredImages = useMemo(() => {
    if (!product_files) return [];

    let images: ProductFile[] = [];

    if (userHasSelectedVariant && selectedVariant?.id) {
      images = product_files.filter(
        img => String(img.product_variant_id) === String(selectedVariant.id)
      );
    } else {
      const mainProductImages = product_files.filter(img => !img.product_variant_id);
      images = mainProductImages.length > 0 ? mainProductImages : [...product_files];
    }

    // Filter out video files - they will be handled separately
    images = images.filter(file => {
      const isVideo = file.file_type === 'video' ||
        file.file?.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/);
      return !isVideo;
    });

    // Helper function to normalize Cloudinary URLs for strict deduplication
    const normalizeUrl = (url: string | null) => {
      if (!url) return '';
      // Remove query parameters
      let clean = url.split('?')[0];
      // Optional: remove Cloudinary version numbers like /v169000000/
      clean = clean.replace(/\/v\d+\//, '/');
      return clean;
    };

    // Deduplicate images by normalized URL to prevent showing clones from Virtual Sharing
    images = Array.from(new Map(images.filter(v => v.file).map(v => [normalizeUrl(v.file), v])).values());

    // Sequence'e göre sırala
    images.sort((a, b) => {
      const seqA = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const seqB = b.sequence ?? Number.MAX_SAFE_INTEGER;
      return seqA - seqB;
    });

    return images;
  }, [selectedVariant, product_files, userHasSelectedVariant]);

  // Thumb index'i sıfırla ve image loaded state'i resetle
  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0);
  useEffect(() => {
    setSelectedThumbIndex(0);
  }, [filteredImages]);


  // Group attribute values by attribute, filtered using the hierarchy
  // (each attribute only filtered by attributes before it in the API order)
  const groupedAttributeValues = useMemo(() => {
    const grouped = product_variant_attributes?.map(attribute => {
      const currentAttributeName = attribute.name ?? '';

      const allAttributeValuesForThisAttribute = product_variant_attribute_values?.filter(
        (value: ProductVariantAttributeValue) => value.product_variant_attribute_id === attribute.id
      ) || [];

      const eligibleVariants = getHierarchyFilteredVariants(currentAttributeName);

      const valuesUsedInEligibleVariants = allAttributeValuesForThisAttribute.filter(attrValue => {
        return eligibleVariants.some(variant =>
          variant.product_variant_attribute_values?.includes(attrValue.id)
        );
      });

      const uniqueValues = Array.from(
        new Set(
          valuesUsedInEligibleVariants.map((value: ProductVariantAttributeValue) => value.product_variant_attribute_value)
        )
      );

      return {
        attribute,
        values: uniqueValues
      };
    });

    // Preserve the API's attribute order
    return grouped?.sort((a, b) => {
      const aIdx = product_variant_attributes?.indexOf(a.attribute) ?? 0;
      const bIdx = product_variant_attributes?.indexOf(b.attribute) ?? 0;
      return aIdx - bIdx;
    });
  }, [product_variant_attributes, product_variant_attribute_values, product_variants, selectedAttributes, precedingAttributes]);

  // Tek değerli attribute'ları otomatik olarak seç
  // VE seçili değer artık mevcut değilse, ilk mevcut değere geç
  useEffect(() => {
    if (!groupedAttributeValues) return;

    const updatedAttributes = { ...selectedAttributes };
    let hasChanges = false;

    groupedAttributeValues.forEach(({ attribute, values }) => {
      const attrName = attribute.name ?? '';
      const disabledSet = disabledValues[attrName];
      const enabledValues = values.filter(v => !disabledSet?.has(v));
      const firstAvailable = enabledValues.length > 0 ? enabledValues[0] : values[0];

      // Auto-select if only one value and not yet selected
      if (values.length === 1 && !updatedAttributes[attrName]) {
        updatedAttributes[attrName] = firstAvailable;
        hasChanges = true;
      }

      // If current selection is no longer in the list, switch to first available
      if (values.length > 0 && updatedAttributes[attrName] && !values.includes(updatedAttributes[attrName])) {
        updatedAttributes[attrName] = firstAvailable;
        hasChanges = true;
      }

      // If current selection is disabled (out of stock), switch to first enabled value
      if (values.length > 0 && updatedAttributes[attrName] && disabledSet?.has(updatedAttributes[attrName]) && enabledValues.length > 0) {
        updatedAttributes[attrName] = firstAvailable;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // console.log('Updated attributes:', updatedAttributes);
      setSelectedAttributes(updatedAttributes);
    }
  }, [groupedAttributeValues, disabledValues]);


  // Thumbnail/image navigation
  // Zoom logic
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const img = e.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const xRelative = (e.clientX - rect.left) / rect.width;
    const yRelative = (e.clientY - rect.top) / rect.height;
    const xPercent = xRelative * 100;
    const yPercent = yRelative * 100;
    const zoomBoxX = e.clientX - 100;
    const zoomBoxY = e.clientY - 100;
    setZoomPosition({ x: xPercent, y: yPercent });
    setZoomBoxPosition({ x: zoomBoxX, y: zoomBoxY });
  };

  const handleMouseLeave = () => {
    setZoomPosition(null);
    setZoomBoxPosition(null);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50; // minimum swipe distance in pixels

    if (diff > threshold) {
      // Swiped left → next image
      handleNextImage();
    } else if (diff < -threshold) {
      // Swiped right → previous image
      handlePrevImage();
    }
    touchStartX.current = null;
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedThumbIndex(0);
    setUserHasSelectedVariant(true); // Kullanıcı varyant seçti
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));

    // Tracking: Select Fabric Event if in custom curtain flow AND changing the primary fabric attribute (usually color/fabric type)
    if (isCustomCurtainIntent && (attributeName.toLowerCase() === 'color' || attributeName.toLowerCase() === 'fabric_type')) {
      trackSelectFabric(attributeName, value);
      console.log(`[Tracking] select_fabric event fired`, { fabric_type: attributeName, fabric_name: value });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    const currentQty = parseFloat(quantity) || 0;
    const step = isFabricProduct ? 0.5 : 1; // Kumaşlar için 0.5 metre, hazır perdeler için 1 adet
    setQuantity((currentQty + step).toFixed(1));
  };

  const handleDecrement = () => {
    const currentQty = parseFloat(quantity) || 0;
    const step = isFabricProduct ? 0.5 : 1;
    const minQty = step;
    if (currentQty > minQty) {
      setQuantity(Math.max(minQty, currentQty - step).toFixed(1));
    }
  };

  const handleRequestSample = async () => {
    // Check if user is logged in
    if (!session?.user && !isGuest) {
      alert(t('pleaseLogin'));
      return;
    }
    await handleBuySampleButtonClick();
  };

  const handleBuySampleButtonClick = async () => {
    if (isAdding) return;
    setIsAdding(true);

    const price = 0; // Samples are usually free or predefined price
    try {
      if (isGuest) {
        addToGuestCart({
          product_sku: product.sku + '-SAMPLE',
          variant_sku: selectedVariant?.variant_sku ? selectedVariant.variant_sku + '-SAMPLE' : null,
          quantity: '1',
          product_category: product_category || undefined,
          product: {
            title: `${product.title} (${t('requestSample')})`,
            price: 0,
            primary_image: product.primary_image || placeholder_image_link,
            category: product_category || undefined,
          },
          // Sample specific flags
          is_sample: true,
          custom_price: 0,
          custom_attributes: {
            type: 'sample'
          }
        });
        setSuccessMessage(t('sampleAdded'));
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        // For authenticated users, add via API
        const userId = (session?.user as any)?.id || session?.user?.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_to_cart/${userId}/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_sku: product.sku,
              variant_sku: selectedVariant?.variant_sku || null,
              quantity: 1,
              is_sample: true,
              custom_price: 0,
              custom_attributes: {
                type: 'sample'
              }
            }),
          }
        );

        if (response.ok) {
          setSuccessMessage(t('sampleAddedToCart'));
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
          await refreshCart();

          // Tracking: Request Sample Event
          trackRequestSample(product.title, product.sku);
          console.log('[Tracking] request_sample event fired (Auth)', { sample: product.title, id: product.sku });
        } else {
          alert(t('errorAddingToCart'));
        }
      }
    } catch (error) {
      console.error('Error adding sample:', error);
      alert(t('errorAddingToCart'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (isAdding) return false;

    // Check if variant selection is required but missing
    if (product_variants && product_variants.length > 0 && !selectedVariant && !isCustomCurtainIntent) {
      alert(locale === 'tr' ? 'Lütfen gerekli seçimleri yapınız (kumaş, renk vb.).' : 'Please select the required options (fabric, color, etc.).');
      return false;
    }

    setIsAdding(true);

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert(t('enterValidQuantity'));
      setIsAdding(false);
      return false;
    }

    // Stock validation
    const availableQty = selectedVariant?.variant_quantity
      ? Number(selectedVariant.variant_quantity)
      : (product.available_quantity ? Number(product.available_quantity) : Number(product.quantity));

    if (qty > availableQty) {
      alert(
        locale === 'tr'
          ? `Yetersiz stok! Gerekli: ${qty}, Mevcut: ${availableQty}`
          : `Insufficient stock! Required: ${qty}, Available: ${availableQty}`
      );
      setIsAdding(false);
      return false;
    }

    // Get price for Meta Pixel
    const itemPrice = Number(selectedVariant?.variant_price || product.price || 0);

    try {
      if (isGuest) {
        // For guests, add to localStorage cart
        addToGuestCart({
          product_sku: product.sku,
          variant_sku: selectedVariant?.variant_sku || null,
          quantity: qty.toString(),
          product_category: product_category || undefined,
          product: {
            title: product.title,
            price: Number(selectedVariant?.variant_price || product.price || 0),
            primary_image: product.primary_image || placeholder_image_link,
            category: product_category || undefined,
          }
        });
        setSuccessMessage(t('productAddedToCart'));
        setShowSuccessMessage(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Tracking: AddToCart Event
        const currentRate = rates.find(r => r.currency_code === currency)?.rate || 1;
        const convertedItemPrice = itemPrice * currentRate;

        trackAddToCart(
          product_category || 'fabric',
          product.sku,
          product.title,
          convertedItemPrice,
          qty,
          currency,
          searchParams?.intent as string | undefined
        );
        trackKlaviyoAddToCart({
          ProductName: product.title,
          ProductID: product.sku,
          SKU: selectedVariant?.variant_sku || product.sku,
          Categories: [product_category || 'product'],
          ImageURL: product.primary_image || placeholder_image_link,
          URL: window.location.href,
          Price: convertedItemPrice,
          Quantity: qty
        });
        console.log(`[Tracking] add_to_cart event fired (Guest)`, { sku: product.sku, value: convertedItemPrice * qty, currency: currency });
        setIsAdding(false);
        return true;
      } else {
        // For authenticated users, add via API
        const userId = (session?.user as any)?.id || session?.user?.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_to_cart/${userId}/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_sku: product.sku,
              variant_sku: selectedVariant?.variant_sku || null,
              quantity: qty
            }),
          }
        );

        if (response.ok) {
          setSuccessMessage(t('productAddedToCart'));
          setShowSuccessMessage(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setShowSuccessMessage(false), 3000);
          // Refresh cart count
          await refreshCart();

          // Tracking: AddToCart Event
          const currentRate = rates.find(r => r.currency_code === currency)?.rate || 1;
          const convertedItemPrice = itemPrice * currentRate;

          trackAddToCart(
            product_category || 'fabric',
            product.sku,
            product.title,
            convertedItemPrice,
            qty,
            currency,
            searchParams?.intent as string | undefined
          );
          trackKlaviyoAddToCart({
            ProductName: product.title,
            ProductID: product.sku,
            SKU: selectedVariant?.variant_sku || product.sku,
            Categories: [product_category || 'product'],
            ImageURL: product.primary_image || placeholder_image_link,
            URL: window.location.href,
            Price: convertedItemPrice,
            Quantity: qty
          });
          console.log(`[Tracking] add_to_cart event fired (Auth)`, { sku: product.sku, value: convertedItemPrice * qty, currency: currency });
          setIsAdding(false);
          return true;
        } else {
          alert(t('errorAddingToCart'));
          setIsAdding(false);
          return false;
        }
      }
    } catch (error) {
      console.error('Cart error:', error);
      alert(t('errorAddingToCart'));
      setIsAdding(false);
      return false;
    }
  };

  const handleCustomCurtainAddToCart = async (customizationData: any, totalPrice: number, quantity: number = 1, isBuyNow: boolean = false) => {
    // Stock validation for custom curtain
    const requiredFabric = customizationData.width && customizationData.height
      ? (parseFloat(customizationData.width) / 100) *
      (customizationData.wingType === 'double' ? 2 : 1) *
      (customizationData.pleatDensity && customizationData.pleatDensity !== '0'
        ? parseFloat(customizationData.pleatDensity.split('x')[1])
        : 1)
      : 0;

    const availableQty = selectedVariant?.variant_quantity
      ? Number(selectedVariant.variant_quantity)
      : (product.available_quantity ? Number(product.available_quantity) : Number(product.quantity));

    const totalRequiredFabric = requiredFabric * quantity;

    if (totalRequiredFabric > availableQty) {
      alert(
        locale === 'tr'
          ? `Yetersiz stok! Gerekli: ${totalRequiredFabric.toFixed(2)}m, Mevcut: ${availableQty}cm`
          : `Insufficient stock! Required: ${totalRequiredFabric.toFixed(2)}m, Available: ${availableQty}cm`
      );
      return;
    }

    try {
      if (isGuest) {
        // For guests, add to localStorage cart
        addToGuestCart({
          product_sku: product.sku,
          variant_sku: selectedVariant?.variant_sku || null,
          quantity: String(quantity),
          product_category: product_category || undefined,
          is_custom_curtain: true,
          custom_attributes: customizationData,
          custom_price: totalPrice,
          product: {
            title: product.title,
            price: totalPrice,
            primary_image: product.primary_image || placeholder_image_link,
            category: product_category || undefined,
          }
        });
        setSuccessMessage(t('customCurtainAddedToCart'));
        setShowSuccessMessage(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setShowSuccessMessage(false), 5000); // Keep custom message slightly longer
        // sidebar closed by wizard internally
        if (isBuyNow) {
          router.push(`/${locale}/cart`);
        }
      } else {
        // For authenticated users, add via API
        const userId = (session?.user as any)?.id || session?.user?.email;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_to_cart/${userId}/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_sku: product.sku,
              variant_sku: selectedVariant?.variant_sku || null,
              quantity: quantity,
              is_custom_curtain: true,
              custom_attributes: customizationData,
              custom_price: totalPrice
            }),
          }
        );

        if (response.ok) {
          setSuccessMessage(t('customCurtainAddedToCart'));
          setShowSuccessMessage(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setShowSuccessMessage(false), 5000);
          // sidebar closed by wizard internally
          await refreshCart();
          if (isBuyNow) {
            router.push(`/${locale}/cart`);
          }
        } else {
          const errorData = await response.json();
          alert(errorData.message || t('errorAddingToCart'));
        }
      }
    } catch (error) {
      console.error('Cart error:', error);
      alert(t('errorAddingToCart'));
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      // Navigate to cart page
      router.push(`/${locale}/cart`);
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(product.sku);
  };

  // Determine if product is fabric (sold by meters) or ready-made curtain (sold by pieces)

  const quantityLabel = isFabricProduct ? t('quantityMeters') : t('quantityPieces');

  // Prepare image files for display (fallback to placeholder)
  const imageFiles: string[] =
    filteredImages.length > 0
      ? filteredImages.map(img => img.file)
      : [(placeholder_image_link)];

  // Preload ALL gallery images at the correct Next.js optimized size
  // This warms the browser cache so thumbnail switching is instant
  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) return;
    imageFiles.forEach((url, i) => {
      if (!url) return;
      // Use <link rel="preload"> for first image (highest priority)
      // Use Image() for the rest (background preload)
      if (i === 0 && typeof document !== 'undefined') {
        const optimizedUrl = `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`;
        const existing = document.querySelector(`link[href="${CSS.escape(optimizedUrl)}"]`);
        if (!existing) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = optimizedUrl;
          link.setAttribute('fetchpriority', 'high');
          document.head.appendChild(link);
        }
      } else {
        const img = new window.Image();
        img.src = `/_next/image?url=${encodeURIComponent(url)}&w=1080&q=75`;
      }
    });
  }, [imageFiles]);

  // Prepare media items: images first, then video at 2nd position (if available)
  type MediaItem = { type: 'video' | 'image'; url: string; alt_text?: string };

  const mediaItems = useMemo(() => {
    const items: MediaItem[] = [];

    const videoFiles = product_files?.filter(file => {
      const isVideo = file.file_type === 'video' ||
        file.file?.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/);

      if (!isVideo) return false;

      // If a variant is selected
      if (selectedVariant) {
        // Check if the current variant has ANY videos specifically assigned to it
        const variantHasOwnVideos = product_files.some(
          vFile => (vFile.file_type === 'video' || vFile.file?.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/)) && String(vFile.product_variant_id) === String(selectedVariant.id)
        );

        // If the variant HAS its own videos, ONLY show those. Don't bleed product-level videos in.
        if (variantHasOwnVideos) {
          return String(file.product_variant_id) === String(selectedVariant.id);
        }

        // IF the variant has NO videos assigned, fall back to showing the general product-level videos
        return !file.product_variant_id;
      }

      // If no variant selected, only show product-level videos (no variant_id)
      return !file.product_variant_id;
    }) || [];

    // 1. Add first image
    if (filteredImages.length > 0) {
      items.push({ type: 'image', url: filteredImages[0].file, alt_text: filteredImages[0].alt_text || '' });
    }

    const normalizeUrl = (url: string | null) => {
      if (!url) return '';
      let clean = url.split('?')[0];
      clean = clean.replace(/\/v\d+\//, '/');
      return clean;
    };

    // 2. Add videos at 2nd position
    const uniqueVideos = Array.from(new Map(videoFiles.filter(v => v.file).map(v => [normalizeUrl(v.file), v])).values());
    uniqueVideos.forEach(video => {
      items.push({ type: 'video', url: video.file, alt_text: video.alt_text || '' });
    });

    // 3. Add remaining images
    filteredImages.slice(1).forEach(img => {
      items.push({ type: 'image', url: img.file, alt_text: img.alt_text || '' });
    });

    return items;
  }, [imageFiles, filteredImages, product_files, selectedVariant]);

  // Thumbnail/image navigation
  const selectThumb = (index: number) => setSelectedThumbIndex(index);

  const handleNextImage = () => {
    setSelectedThumbIndex((prev) =>
      mediaItems.length ? (prev + 1) % mediaItems.length : 0
    );
  };

  const handlePrevImage = () => {
    setSelectedThumbIndex((prev) =>
      mediaItems.length ? (prev - 1 + mediaItems.length) % mediaItems.length : 0
    );
  };

  // Check if current selection is a video
  const currentMedia = mediaItems[selectedThumbIndex];
  const isVideoSelected = currentMedia?.type === 'video';

  // Extract video files again for sidebar use (since we need them separately)
  const videoFilesForSidebar = useMemo(() => {
    const allVideos = product_files?.filter(file => {
      const isVideo = file.file_type === 'video' ||
        file.file?.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/);
      return isVideo;
    }) || [];

    const normalizeUrl = (url: string | null) => {
      if (!url) return '';
      let clean = url.split('?')[0];
      clean = clean.replace(/\/v\d+\//, '/');
      return clean;
    };

    // Deduplicate by URL
    return Array.from(new Map(allVideos.filter(v => v.file).map(v => [normalizeUrl(v.file), v])).values());
  }, [product_files]);

  if (!product) {
    return <div>{translateAttributeName('loading...')}</div>;
  }

  return (
    <div className={classes.ProductDetailCard} id="ProductDetailCard">
      <div className={classes.detailCardContainer}>
        <div className={classes.productMedia}>
          <div className={classes.thumbs}>
            {mediaItems.map((media, index) => (
              <div
                className={`${classes.thumb} ${selectedThumbIndex === index ? classes.thumb_selected : ''} ${media.type === 'video' ? classes.videoThumb : ''}`}
                key={index}
                onClick={() => selectThumb(index)}
                onMouseEnter={() => {
                  // Preload video on hover so it's ready when clicked
                  if (media.type === 'video' && media.url) setVideoPreloadUrl(media.url);
                }}
              >
                <div className={classes.img}>
                  {media.type === 'video' ? (
                    <>
                      {/* Don't load video for thumbnail - use static placeholder */}
                      <div
                        className={classes.videoThumbnailPlaceholder}
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', color: 'white' }}>🎬</span>
                      </div>
                      <div className={classes.videoPlayOverlay}>
                        <span className={classes.playIcon}>▶</span>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={media.url || placeholder_image_link}
                      alt={media.alt_text || getLocalizedProductField(product, 'title', locale) || 'product image'}
                      fill
                      sizes="80px"
                      priority={index < 3}
                      loading={index < 3 ? undefined : 'lazy'}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div
            className={classes.gallery}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button className={classes.prevButton} onClick={handlePrevImage}>{"<"}</button>
            <div className={imageLoaded || isVideoSelected ? ` ${classes.img} ${classes.loaded}` : `${classes.img}`}>
              {isVideoSelected && currentMedia ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
                  <video
                    ref={videoRef}
                    key={`${currentMedia.url}-${selectedVariant?.id || 'default'}`}
                    src={videoPreloadUrl || currentMedia.url}
                    controls
                    autoPlay
                    muted
                    preload="none"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onPlay={(e) => {
                      const overlay = (e.currentTarget.parentElement as HTMLDivElement)?.querySelector('.video-play-overlay') as HTMLDivElement;
                      if (overlay) overlay.style.display = 'none';
                    }}
                    onPause={(e) => {
                      const overlay = (e.currentTarget.parentElement as HTMLDivElement)?.querySelector('.video-play-overlay') as HTMLDivElement;
                      if (overlay) overlay.style.display = 'flex';
                    }}
                  />
                  {/* Centered play button — hides when video plays */}
                  <div
                    className="video-play-overlay"
                    onClick={() => videoRef.current?.play()}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 80, height: 80, borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <polygon points="6,3 20,12 6,21" fill="#111" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ImageZoom
                    src={currentMedia?.url || imageFiles[selectedThumbIndex] || placeholder_image_link}
                    alt={currentMedia?.alt_text || getLocalizedProductField(product, 'title', locale) || 'Product image'}
                  />
                </>
              )}
            </div>
            <button className={classes.nextButton} onClick={handleNextImage}>{">"}</button>


          </div>
        </div>
        <div className={classes.productHero}>
          <div className={classes.titleRow}>
            <h1>{getLocalizedProductField(product, 'title', locale)}</h1>
            <div className={classes.titleActions}>
              <button
                onClick={handleToggleFavorite}
                className={`${classes.titleFavoriteBtn} ${isFavorite(product.sku) ? classes.favorited : ''}`}
                title={isFavorite(product.sku) ? t('removeFromFavorites') : t('addToFavorites')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={isFavorite(product.sku) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              {/* PDF Download Button */}
              <button
                onClick={() => {
                  const pdfUrl = `/api/generate-pdf?sku=${product.sku}&title=${encodeURIComponent(product.title)}&image=${encodeURIComponent(product.primary_image || '')}`;
                  window.open(pdfUrl, '_blank');
                }}
                className={classes.titlePdfBtn}
                title={locale === 'tr' ? 'PDF olarak indir' :
                  locale === 'ru' ? 'Скачать PDF' :
                    locale === 'pl' ? 'Pobierz PDF' :
                      'Download PDF'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="12" y2="18" />
                  <line x1="15" y1="15" x2="12" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          {/* SKU under product name */}
          <div className={classes.skuCode}>
            {locale === 'tr' ? 'Ürün Kodu' :
              locale === 'ru' ? 'Артикул' :
                locale === 'pl' ? 'Kod produktu' : 'Product Code'}: {selectedVariant?.variant_sku ? `${selectedVariant.variant_sku}` : product.sku}
          </div>

          {/* Category + Attributes in one row */}
          <div className={classes.categoryAndAttributes}>
            {product_category && <span className={classes.productCategory}>{translateCategory(product_category.toString())}</span>}
            {(() => {
              const variantAttrs = selectedVariant && variant_attributes
                ? variant_attributes.filter(attr => attr.variant_id === selectedVariant.id)
                : [];
              const attributesToShow = (variantAttrs.length > 0 ? variantAttrs : (product_attributes || []))
                .filter(attr => attr.name?.toLowerCase() !== 'discount_rate');

              return attributesToShow.map((attr, index) => {
                const attrNameLower = (attr.name || '').toLowerCase();
                const isProperty = attrNameLower === 'property';

                return (
                  <span key={`attr-${attr.name}-${index}`} className={classes.attributeBadge}>
                    {!isProperty && <span className={classes.attrName}>{translateAttributeName(attr.name || '')}:</span>}
                    <span className={classes.attrValue}>{translateAttributeName(attr.value)}</span>
                  </span>
                );
              });
            })()}
          </div>

          {/* If the product has variants, display the variant information. */}
          {product_variant_attributes && product_variant_attributes.length > 0 ? (
            <div className={classes.variant_menu}>
              <ul>
                {groupedAttributeValues?.filter(({ values }) => values.length > 0).map(({ attribute, values }) => {
                  const isSizeAttribute = attribute.name?.toLowerCase() === 'width' || attribute.name?.toLowerCase() === 'genişlik' || attribute.name?.toLowerCase() === 'beden' || attribute.name?.toLowerCase() === 'ölçü' || attribute.name?.toLowerCase() === 'size';
                  return (
                    <li key={attribute.id.toString()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {['en', 'width', 'genişlik'].includes(attribute.name?.toLowerCase() || '') ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#666' }}>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                              <polygon points="6,8 2,12 6,16"></polygon>
                              <polygon points="18,8 22,12 18,16"></polygon>
                            </svg>
                          ) : ['boy', 'height', 'yükseklik', 'uzunluk'].includes(attribute.name?.toLowerCase() || '') ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#666' }}>
                              <line x1="12" y1="2" x2="12" y2="22"></line>
                              <polygon points="8,6 12,2 16,6"></polygon>
                              <polygon points="8,18 12,22 16,18"></polygon>
                            </svg>
                          ) : null}
                          <h3 style={{ margin: 0 }}>{translateAttributeName(attribute.name || '')}</h3>
                        </label>
                        {isSizeAttribute && (
                          <div className={classes.sizeGuideLink} onClick={() => setShowSizeGuide(true)}>
                            {locale === 'tr' ? 'Nasıl Ölçü Alırım?' : locale === 'ru' ? 'Как снять мерки?' : locale === 'pl' ? 'Jak zmierzyć?' : locale === 'de' ? 'Wie man misst?' : 'Size Guide'}
                          </div>
                        )}
                      </div>
                      {/* Check if this is Fabric attribute */}
                      {attribute.name?.toLowerCase() === 'fabric' || attribute.name?.toLowerCase() === 'kumaş' ? (
                        <div className={classes.fabric_swatches}>
                          {values.map((value: string) => {
                            const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                            const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                            const isDisabled = disabledValues[attribute.name ?? '']?.has(value) ?? false;
                            // Image path: /media/fabrics/{value}.jpg (assuming jpg, can be adjusted)
                            // value usually comes as "bamboo", "grek" etc.
                            const bgImage = `/media/fabrics/${value.toLowerCase()}.avif`;

                            return (
                              <div key={value} className={classes.fabric_swatch_container}>
                                {isDisabled ? (
                                  <span
                                    className={`${classes.fabric_swatch} ${classes.disabled_swatch}`}
                                    style={{ backgroundImage: `url(${bgImage})` }}
                                    title={translateAttributeName(value)}
                                  >
                                    <span className={classes.sr_only}>{translateAttributeName(value)}</span>
                                  </span>
                                ) : (
                                  <Link
                                    href={href}
                                    replace
                                    className={`${classes.fabric_swatch} ${isChecked ? classes.checked_fabric_swatch : ""}`}
                                    onClick={e => {
                                      e.preventDefault();
                                      handleAttributeChange(attribute.name ?? '', value);
                                    }}
                                    style={{ backgroundImage: `url(${bgImage})` }}
                                    title={translateAttributeName(value)}
                                  >
                                    <span className={classes.sr_only}>{translateAttributeName(value)}</span>
                                  </Link>
                                )}
                                <span className={classes.color_label}>{translateAttributeName(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : attribute.name?.toLowerCase() === 'color' ? (
                        <div className={classes.color_swatches}>
                          {values.map((value: string) => {
                            const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                            const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                            const isDisabled = disabledValues[attribute.name ?? '']?.has(value) ?? false;
                            const isTwoTone = isTwoToneColor(value);

                            return (
                              <div key={value} className={classes.color_swatch_container}>
                                {isDisabled ? (
                                  <span
                                    className={`${classes.color_swatch} ${classes.disabled_swatch}`}
                                    style={isTwoTone ? {} : { backgroundColor: getColorCode(value) }}
                                    title={translateAttributeName(value)}
                                  >
                                    {isTwoTone ? (
                                      <>
                                        <span
                                          className={classes.half_circle_left}
                                          style={{ backgroundColor: splitTwoToneColor(value).color1 }}
                                        />
                                        <span
                                          className={classes.half_circle_right}
                                          style={{ backgroundColor: splitTwoToneColor(value).color2 }}
                                        />
                                      </>
                                    ) : null}
                                    <span className={classes.sr_only}>{translateAttributeName(value)}</span>
                                  </span>
                                ) : (
                                  <Link
                                    href={href}
                                    replace
                                    className={`${classes.color_swatch} ${isChecked ? classes.checked_color_swatch : ""}`}
                                    onClick={e => {
                                      e.preventDefault();
                                      handleAttributeChange(attribute.name ?? '', value);
                                    }}
                                    style={isTwoTone ? {} : { backgroundColor: getColorCode(value) }}
                                    title={translateAttributeName(value)}
                                  >
                                    {isTwoTone ? (
                                      <>
                                        <span
                                          className={classes.half_circle_left}
                                          style={{ backgroundColor: splitTwoToneColor(value).color1 }}
                                        />
                                        <span
                                          className={classes.half_circle_right}
                                          style={{ backgroundColor: splitTwoToneColor(value).color2 }}
                                        />
                                      </>
                                    ) : null}
                                    <span className={classes.sr_only}>{translateAttributeName(value)}</span>
                                  </Link>
                                )}
                                <span className={classes.color_label}>{translateAttributeName(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={classes.variant_links}>
                          {values.map((value: string) => {
                            const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                            const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                            const isDisabled = disabledValues[attribute.name ?? '']?.has(value) ?? false;
                            return (
                              <div key={value}>
                                {isDisabled ? (
                                  <span className={`${classes.link} ${classes.disabled_variant_link}`}>
                                    {translateAttributeName(value)}
                                  </span>
                                ) : (
                                  <Link
                                    href={href}
                                    replace
                                    className={`${classes.link} ${isChecked ? classes.checked_variant_link : ""}`}
                                    onClick={e => {
                                      e.preventDefault();
                                      handleAttributeChange(attribute.name ?? '', value);
                                    }}
                                  >
                                    {translateAttributeName(value)}
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) :
            <div className={classes.parent_product_info}>
              {/* Info removed from here */}
            </div>
          }

          {/* Success Message */}
          {showSuccessMessage && (
            <div className={classes.successMessage}>
              {successMessage}
            </div>
          )}

          {/* Cart Actions */}
          <div className={classes.cartActions} id="cartActions">
            {/* Price and Stock Display */}
            <div className={classes.priceAndStock}>
              {(() => {
                // Get current price
                const currentPrice = (selectedVariant?.variant_price && Number(selectedVariant.variant_price) > 0)
                  ? Number(selectedVariant.variant_price)
                  : (product.price && Number(product.price) > 0)
                    ? Number(product.price)
                    : null;

                // Find discount_rate from product attributes
                const discountAttr = product_attributes?.find(
                  attr => attr.name?.toLowerCase() === 'discount_rate'
                );
                const discountRate = discountAttr?.value ? parseFloat(discountAttr.value) : 0;

                if (currentPrice) {
                  if (discountRate > 0) {
                    // Calculate original price
                    const originalPrice = currentPrice / (1 - discountRate / 100);
                    return (
                      <div className={classes.priceWithDiscount}>
                        <span className={classes.discountBadge}>%{Math.round(discountRate)}</span>
                        <span className={classes.originalPrice}>{formatPrice(originalPrice)}</span>
                        <span className={classes.priceDisplay}>{formatPrice(currentPrice)}</span>
                        {isFabricProduct && (
                          <span className={classes.pricePerMeterNote}>
                            {locale === 'tr' ? 'Belirtilen fiyat metre fiyatıdır.' :
                              locale === 'ru' ? 'Указанная цена за метр.' :
                                locale === 'pl' ? 'Podana cena jest ceną za metr.' :
                                  'Price shown is per meter.'}
                          </span>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className={classes.priceWrapper}>
                        <span className={classes.priceDisplay}>{formatPrice(currentPrice)}</span>
                        {isFabricProduct && (
                          <span className={classes.pricePerMeterNote}>
                            {locale === 'tr' ? 'Belirtilen fiyat metre fiyatıdır.' :
                              locale === 'ru' ? 'Указанная цена за метр.' :
                                locale === 'pl' ? 'Podana cena jest ceną za metr.' :
                                  'Price shown is per meter.'}
                          </span>
                        )}
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {(selectedVariant?.variant_quantity && Number(selectedVariant.variant_quantity) > 0) ? (
                <span className={classes.stockDisplay}>{t('availableQuantity') || 'Available'}: {Number(selectedVariant.variant_quantity)}</span>
              ) : (product.quantity && Number(product.quantity) > 0) ? (
                <span className={classes.stockDisplay}>{t('availableQuantity') || 'Available'}: {Number(product.quantity)}</span>
              ) : null}
            </div>

            {hasStandardCartOptions && (
              <>
                <div className={classes.actionRowTop}>
                  <button onClick={handleBuyNow} className={classes.buyNowBtn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={classes.buyNowIcon}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {t('buyNow')}
                  </button>
                </div>
                <div className={classes.actionRowBottom}>
                  <div className={classes.quantityWrapper}>
                    <div className={classes.quantitySelector}>
                      <button type="button" onClick={handleDecrement} className={classes.quantityBtn} aria-label="Decrease quantity">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      </button>
                      <input id="quantity" type="text" value={quantity} onChange={handleQuantityChange} className={classes.quantityInput} placeholder="1.0" />
                      <button type="button" onClick={handleIncrement} className={classes.quantityBtn} aria-label="Increase quantity">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAddToCart} className={classes.addToCartBtn} disabled={isAdding}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                    </svg>
                    {isAdding ? (locale === 'tr' ? 'Ekleniyor...' : 'Adding...') : t('addToCart')}
                  </button>
                </div>
              </>
            )}

            {/* PERDE DIKTIR — Wizard on demand (no button) */}
            {isFabricProduct && isCustomCurtainIntent && (
              <div id="curtainWizardContainer">
                <CurtainWizard
                  product={product}
                  selectedVariant={selectedVariant}
                  unitPrice={selectedVariant?.variant_price ? parseFloat(String(selectedVariant.variant_price)) : (product.price ? parseFloat(String(product.price)) : 0)}
                  onAddToCart={handleCustomCurtainAddToCart}
                  selectedAttributes={selectedAttributes}
                  forceOpen={true}
                  hideHeader={true}
                  onSizeGuideClick={() => setShowSizeGuide(true)}
                  onPleatGuideClick={() => setShowPleatGuide(true)}
                />
              </div>
            )}


            {/* SAMPLE HINT (fabric only, when not forcing custom curtain) */}
            {isFabricProduct && !isCustomCurtainIntent && (
              <div className={classes.sampleHint}>
                <FaSwatchbook className={classes.sampleHintIcon} />
                <span>
                  {locale === 'tr' ? 'Kararsız mısınız?' : locale === 'ru' ? 'Не уверены?' : locale === 'pl' ? 'Niezdecydowany?' : 'Not decided yet?'}
                </span>
                <button onClick={handleRequestSample} className={classes.sampleHintBtn}>
                  {locale === 'tr' ? 'Numune isteyin' : locale === 'ru' ? 'Запросите образец' : locale === 'pl' ? 'Zamów próbkę' : 'Request a sample'}
                </button>
              </div>
            )}

            {/* TRUST BAR REMOVED */}
          </div>

          {/* Expandable Accordion Sections - Replaces Tabs */}
          <div className={classes.accordionWrapper}>
            <div className={classes.accordionItem}>
              <button className={classes.accordionHeader} onClick={() => setActiveTab(activeTab === 'description' ? null : 'description')}>
                <span>{locale === 'tr' ? 'Ürün Açıklaması' : locale === 'ru' ? 'Описание продукта' : locale === 'pl' ? 'Opis produktu' : locale === 'de' ? 'Produktbeschreibung' : 'Product Description'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeTab === 'description' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className={`${classes.accordionPanel} ${activeTab === 'description' ? classes.accordionPanelOpen : ''}`}>
                <div className={classes.accordionContent}>
                  {getLocalizedProductField(product, 'description', locale) ? (
                    <div className={classes.descriptionHtml} dangerouslySetInnerHTML={{ __html: getLocalizedProductField(product, 'description', locale) || '' }} />
                  ) : (
                    <p style={{ margin: 0 }}>{locale === 'tr' ? 'Açıklama bulunmamaktadır.' : 'No description available.'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={classes.accordionItem}>
              <button className={classes.accordionHeader} onClick={() => setActiveTab(activeTab === 'details' ? null : 'details')}>
                <span>{locale === 'tr' ? 'Ürün Detayları' : locale === 'ru' ? 'Детали продукта' : locale === 'pl' ? 'Szczegóły produktu' : locale === 'de' ? 'Produktdetails' : 'Details'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeTab === 'details' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className={`${classes.accordionPanel} ${activeTab === 'details' ? classes.accordionPanelOpen : ''}`}>
                <div className={classes.accordionContent}>
                  <table className={classes.detailsTable}>
                    <tbody>
                      <tr><td className={classes.detailTableLabel}>SKU</td><td className={classes.detailTableValue}>{selectedVariant?.variant_sku ? `${selectedVariant.variant_sku}` : product.sku}</td></tr>
                      {(selectedVariant?.variant_barcode || product.barcode) && (
                        <tr><td className={classes.detailTableLabel}>{locale === 'tr' ? 'Barkod' : 'Barcode'}</td><td className={classes.detailTableValue}>{selectedVariant?.variant_barcode || product.barcode}</td></tr>
                      )}
                      {Object.entries(selectedAttributes).map(([attrName, attrValue]) => (
                        <tr key={attrName}><td className={classes.detailTableLabel}>{translateAttributeName(attrName)}</td><td className={classes.detailTableValue}>{translateAttributeName(attrValue)}</td></tr>
                      ))}
                      {product_attributes && product_attributes.filter(attr => attr.name?.toLowerCase() !== 'discount_rate').map((attr, index) => (
                        <tr key={`product-attr-${index}`}>
                          <td className={classes.detailTableLabel}>
                            {attr.name?.toLowerCase() !== 'property' ? translateAttributeName(attr.name || '') : ''}
                          </td>
                          <td className={classes.detailTableValue}>{translateAttributeName(attr.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={classes.accordionItem}>
              <button className={classes.accordionHeader} onClick={() => setActiveTab(activeTab === 'delivery' ? null : 'delivery')}>
                <span>{locale === 'tr' ? 'Teslimat Bilgileri' : locale === 'ru' ? 'Информация о доставке' : locale === 'pl' ? 'Informacje o dostawie' : locale === 'de' ? 'Lieferinformationen' : 'Delivery Information'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeTab === 'delivery' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className={`${classes.accordionPanel} ${activeTab === 'delivery' ? classes.accordionPanelOpen : ''}`}>
                <div className={classes.accordionContent}>
                  <IadeSartlari embedded={true} mode="delivery" />
                </div>
              </div>
            </div>

            <div className={classes.accordionItem}>
              <button className={classes.accordionHeader} onClick={() => setActiveTab(activeTab === 'returns' ? null : 'returns')}>
                <span>{locale === 'tr' ? 'İade ve Değişim Koşulları' : locale === 'ru' ? 'Условия возврата и обмена' : locale === 'pl' ? 'Warunki zwrotów i wymian' : locale === 'de' ? 'Rückgabe und Umtausch' : 'Returns & Exchange Conditions'}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeTab === 'returns' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className={`${classes.accordionPanel} ${activeTab === 'returns' ? classes.accordionPanelOpen : ''}`}>
                <div className={classes.accordionContent}>
                  <IadeSartlari embedded={true} mode="compact" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div >

      {/* STANDALONE SAMPLE BLOCK FOR CUSTOM CURTAINS */}
      {isFabricProduct && isCustomCurtainIntent && (
        <div className={classes.standaloneSampleBlock}>
          <FaSwatchbook className={classes.standaloneSampleIcon} />
          <div className={classes.standaloneSampleText}>
            <h4>
              {locale === 'tr' ? 'Kumaştan emin değil misiniz?' : locale === 'ru' ? 'Не уверены в ткани?' : locale === 'pl' ? 'Nie jesteś pewien tkaniny?' : 'Not sure about the fabric?'}
            </h4>
            <p>
              {locale === 'tr' ? 'Sipariş vermeden önce kumaşı hissedin. Numunelerimiz sayesinde rengi ve dokuyu evinizde gerçek ışıkta inceleyebilirsiniz.' : locale === 'ru' ? 'Почувствуйте ткань перед заказом. Наши образцы позволяют оценить цвет и текстуру.' : locale === 'pl' ? 'Poczuj tkaninę przed zamówieniem. Nasze próbki pozwalają ocenić kolor i teksturę.' : 'Feel the fabric before ordering. Our samples let you evaluate color and texture in your own home lighting.'}
            </p>
          </div>
          <button onClick={handleRequestSample} className={classes.standaloneSampleBtn}>
            {locale === 'tr' ? 'Numune İste' : locale === 'ru' ? 'Запросить образец' : locale === 'pl' ? 'Zamów próbkę' : 'Request Sample'}
          </button>
        </div>
      )}

      {/* CustomCurtainSidebar removed — wizard is now inline */}

      {/* Try at Home Sidebar */}
      <TryAtHomeSidebar
        isOpen={isTryAtHomeSidebarOpen}
        onClose={() => setIsTryAtHomeSidebarOpen(false)}
        productImages={imageFiles.length > 0 ? imageFiles : [placeholder_image_link]}
        productVideos={videoFilesForSidebar.map(v => v.file).filter(Boolean) as string[]}
        productTitle={product.title || 'Curtain'}
        locale={locale}
      />

      <ProductReviewsList productSku={product.sku} />

      {/* Similar Products Section */}
      {
        product_category === 'fabric' && (
          <SimilarProducts
            fabricType={
              product_attributes?.find((attr) => attr.name?.toLowerCase() === 'fabric_type')?.value ||
              (product.tags?.includes('embroidery') ? 'embroidery' : 'solid')
            }
            currentProductSku={product.sku}
            locale={locale}
          />
        )
      }

      {/* Size Guide Sidebar / Drawer */}
      <div
        className={classes.sizeGuideOverlay}
        style={{ opacity: showSizeGuide ? 1 : 0, pointerEvents: showSizeGuide ? 'auto' : 'none' }}
        onClick={() => setShowSizeGuide(false)}
      />
      <div
        className={classes.sizeGuideDrawer}
        style={{ right: showSizeGuide ? 0 : '-500px' }}>
        <div className={classes.drawerHeader}>
          <h3>{locale === 'tr' ? 'Nasıl Ölçü Alırım?' : locale === 'ru' ? 'Как снять мерки?' : locale === 'pl' ? 'Jak zmierzyć?' : locale === 'de' ? 'Wie man misst?' : 'Size Guide'}</h3>
          <button className={classes.closeDrawerBtn} onClick={() => setShowSizeGuide(false)}>×</button>
        </div>
        <div className={classes.drawerContent}>
          <p>
            {locale === 'tr' ? 'Perdenizi en doğru şekilde ölçmek için aşağıdaki görsel rehberi kullanabilirsiniz. Pile sıklığını ve boyu belirlerken korniş veya rustik mesafesine dikkat ediniz.' :
              locale === 'ru' ? 'Используйте это визуальное руководство для правильного снятия мерок. Обратите внимание на расстояние до карниза.' :
                locale === 'pl' ? 'Użyj tego przewodnika wizualnego, aby poprawnie zmierzyć zasłony. Zwróć uwagę na odległość karnisza.' :
                  locale === 'de' ? 'Verwenden Sie diese visuelle Anleitung, um Ihre Vorhänge richtig zu messen.' :
                    'Use this visual guide to correctly measure your curtains. Pay attention to the cornice distance.'}
          </p>
          {/* Use standard placeholder image for now, user can replace this file at /media/size-guide.jpg */}
          <img
            src={`/media/guides/size-guide-${locale}.avif`}
            alt="Size Guide Instructions"
            className={classes.sizeGuideImg}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/media/woocommerce-placeholder.svg";
            }}
          />
        </div>
      </div>

      {/* Pleat Guide Sidebar / Drawer */}
      <div
        className={classes.sizeGuideOverlay}
        style={{ opacity: showPleatGuide ? 1 : 0, pointerEvents: showPleatGuide ? 'auto' : 'none' }}
        onClick={() => setShowPleatGuide(false)}
      />
      <div
        className={classes.sizeGuideDrawer}
        style={{ right: showPleatGuide ? 0 : '-500px' }}>
        <div className={classes.drawerHeader}>
          <h3>{locale === 'tr' ? 'Pile Rehberi' : locale === 'ru' ? 'Руководство по складкам' : locale === 'pl' ? 'Przewodnik po fałdach' : locale === 'de' ? 'Faltenführer' : 'Pleat Guide'}</h3>
          <button className={classes.closeDrawerBtn} onClick={() => setShowPleatGuide(false)}>×</button>
        </div>
        <div className={classes.drawerContent}>
          <p>
            {locale === 'tr' ? 'Perdenizin pile sıklığını ve görünümünü belirlemek için aşağıdaki rehberi inceleyebilirsiniz. Pile sıklığı arttıkça kumaş kullanımı ve dalgalanma efekti artar.' :
              locale === 'ru' ? 'Используйте это руководство для выбора типа и плотности складок. Чем плотнее складки, тем больше расход ткани.' :
                locale === 'pl' ? 'Skorzystaj z tego przewodnika, aby wybrać gęstość i rodzaj fałd. Gęstsze fałdy oznaczają większe zużycie tkaniny.' :
                  locale === 'de' ? 'Verwenden Sie diese Anleitung, um die Faltenart und -dichte zu bestimmen.' :
                    'Use this guide to determine the pleat density and appearance of your curtain. More pleats mean more fabric and a richer effect.'}
          </p>
          <img
            src={`/media/guides/pleat-guide-${locale}.avif`}
            alt="Pleat Guide Instructions"
            className={classes.sizeGuideImg}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/media/woocommerce-placeholder.svg";
            }}
          />
        </div>
      </div>
    </div >
  );
}

export default ProductDetailCard;