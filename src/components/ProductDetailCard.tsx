"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import classes from "./ProductDetailCard.module.css";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile, ProductCategory } from '@/lib/interfaces';
import { useSession } from 'next-auth/react';
import { getColorCode, isTwoToneColor, splitTwoToneColor } from '@/lib/colorMap';
import { useFavorites } from '@/contexts/FavoriteContext';
import { useCart } from '@/contexts/CartContext';


type ProductDetailCardPageProps = {
  product: Product,
  product_category: string | null;
  product_variants: ProductVariant[] | null,
  product_variant_attributes: ProductVariantAttribute[] | null,
  product_variant_attribute_values: ProductVariantAttributeValue[] | null,
  searchParams: { [key: string]: string | string[] | undefined };
  product_files: ProductFile[] | null;
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
  locale = 'en'
}: ProductDetailCardPageProps) {

  const placeholder_image_link = "https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif";

  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);
  
  // URL parametrelerinden veya ilk varyanttan initial attributes'ı hesapla
  const getInitialAttributes = () => {
    const initialAttributes: { [key: string]: string } = {};
    
    // Önce URL parametrelerini kontrol et
    const hasUrlParams = Object.keys(searchParams).length > 0;
    console.log('[ProductDetailCard] searchParams:', searchParams);
    
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
            console.log(`[ProductDetailCard] URL'den alındı: ${attrName} = ${urlValue}`);
          }
        }
      });
    }
    
    // Eksik attribute'lar için ilk varyanttan al
    product_variant_attributes?.forEach(attribute => {
      const attrName = attribute.name ?? '';
      
      if (!initialAttributes[attrName]) {
        const firstValue = product_variant_attribute_values?.find(
          val => val.product_variant_attribute_id === attribute.id
        )?.product_variant_attribute_value;
        
        if (firstValue) {
          initialAttributes[attrName] = firstValue;
        }
      }
    });
    
    console.log('[ProductDetailCard] Final initialAttributes:', initialAttributes);
    return initialAttributes;
  };

  const initialAttributes = useMemo(() => getInitialAttributes(), [
    product_variant_attributes, 
    product_variant_attribute_values, 
    searchParams
  ]);
  
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
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

  // console.log("your product images are:", product_files);



  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // handle unauthenticated
      console.log("Not logged in!: " + status);
    },
  });
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { refreshCart } = useCart();
  const [quantity, setQuantity] = useState<string>('1');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Find the selected variant based on selectedAttributes
  //   const findSelectedVariant = () => {
  //     console.log(product_variants);

  //     console.log(product_variant_attribute_values);


  //     return product_variants?.find(variant => {
  //       const variantAttributes = product_variant_attribute_values?.filter(

  //         vav => String(vav.product_variant_id) === String(variant.id)
  //       );
  //       console.log("variantAttributes:", variantAttributes);

  //       return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
  //         const attrDef = product_variant_attributes?.find(attr => attr.name === attrName);
  //         if (!attrDef) return false;
  //         const valueObj = variantAttributes?.find(
  //           vav => String(vav.product_variant_attribute_id) === String(attrDef.id)
  //         );
  //         // console.log("selected variant:", valueObj && valueObj.product_variant_attribute_value === attrValue; )
  //       return valueObj && valueObj.product_variant_attribute_value === attrValue;
  //     });
  //   });
  // };

  const findSelectedVariant = () => {
    if (!product_variants || !product_variant_attributes || !product_variant_attribute_values) return undefined;
    // console.log("All variants:", product_variants);
    // console.log("All attribute values:", product_variant_attribute_values);
    // console.log("Selected attributes:", selectedAttributes);
    // selected attribute is set with url parameters.

    // --------------
    // return Object.entries(selectedAttributes).forEach(([key, value]) => {
    //   let product_variant_attribute = product_variant_attributes?.find(attr => attr.name === key)
    //   let product_variant_attribute_value = product_variant_attribute_values?.find(val => String(val.product_variant_attribute_id) === String(product_variant_attribute?.id && val.product_variant_attribute_value === value));
    //   let product_variant = product_variants?.find(variant => variant.product_variant_attribute_values?.some(vav => vav === product_variant_attribute_value?.id));
    // }
    // )
    // ----------

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


  // const selectedVariant = findSelectedVariant();

  // selectedVariant = 
  //   {
  //   id: '6',
  //   variant_sku: 'RK24562GC9',
  //   variant_barcode: '712179795235',
  //   variant_quantity: '46',
  //   variant_price: '0',
  //   variant_cost: '15.7',
  //   variant_featured: true,
  //   product_id: '3',
  //   variant_datasheet_url: null,
  //   variant_minimum_inventory_level: null,
  //   product_variant_attribute_values:[2538, 2540]
  // }

  // Sayfa yüklenince en üste scroll yap
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    setImageLoaded(false);
  }, [filteredImages]);
  // console.log("your product variant attributes are:", product_variant_attributes);


  // Group attribute values by attribute and filter out duplicates
  // ONLY show values that actually exist in product_variants
  // NOW: Also filter based on currently selected attributes (dynamic filtering)
  const groupedAttributeValues = useMemo(() => {
    const grouped = product_variant_attributes?.map(attribute => {
      const currentAttributeName = attribute.name ?? '';
      
      // Get all attribute value objects for this attribute
      const allAttributeValuesForThisAttribute = product_variant_attribute_values?.filter(
        (value: ProductVariantAttributeValue) => value.product_variant_attribute_id === attribute.id
      ) || [];

      // Filter variants based on OTHER selected attributes (not the current one)
      const otherSelectedAttributes = Object.entries(selectedAttributes).filter(
        ([key]) => key !== currentAttributeName
      );

      // Find variants that match all OTHER selected attributes
      let eligibleVariants = product_variants || [];
      
      if (otherSelectedAttributes.length > 0) {
        eligibleVariants = product_variants?.filter(variant => {
          return otherSelectedAttributes.every(([key, value]) => {
            const attrDef = product_variant_attributes?.find(attr => attr.name === key);
            if (!attrDef) return false;
            
            const valueObj = product_variant_attribute_values?.find(
              val =>
                String(val.product_variant_attribute_id) === String(attrDef.id) &&
                val.product_variant_attribute_value === value
            );
            if (!valueObj) return false;
            
            return variant.product_variant_attribute_values?.includes(valueObj.id);
          });
        }) || [];
      }

      // Only keep values that are used in eligible variants
      const valuesUsedInEligibleVariants = allAttributeValuesForThisAttribute.filter(attrValue => {
        return eligibleVariants.some(variant => 
          variant.product_variant_attribute_values?.includes(attrValue.id)
        );
      });

      // Extract unique value strings
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
    
    // Sort: Color always first, then others
    return grouped?.sort((a, b) => {
      const aIsColor = a.attribute.name?.toLowerCase() === 'color';
      const bIsColor = b.attribute.name?.toLowerCase() === 'color';
      
      if (aIsColor && !bIsColor) return -1;
      if (!aIsColor && bIsColor) return 1;
      return 0; // Keep original order for non-color attributes
    });
  }, [product_variant_attributes, product_variant_attribute_values, product_variants, selectedAttributes]);

  // Tek değerli attribute'ları otomatik olarak seç
  // VE seçili değer artık mevcut değilse, ilk mevcut değere geç
  useEffect(() => {
    if (!groupedAttributeValues) return;
    
    const updatedAttributes = { ...selectedAttributes };
    let hasChanges = false;

    groupedAttributeValues.forEach(({ attribute, values }) => {
      const attrName = attribute.name ?? '';
      console.log(`Attribute: ${attrName}, Values: [${values.join(', ')}], Length: ${values.length}`);
      
      // Eğer sadece 1 değer varsa ve henüz seçilmemişse, otomatik seç
      if (values.length === 1 && !updatedAttributes[attrName]) {
        console.log(`Auto-selecting ${attrName}: ${values[0]}`);
        updatedAttributes[attrName] = values[0];
        hasChanges = true;
      }
      
      // Eğer seçili değer artık mevcut değilse, ilk mevcut değere geç
      if (values.length > 0 && updatedAttributes[attrName] && !values.includes(updatedAttributes[attrName])) {
        console.log(`Current selection "${updatedAttributes[attrName]}" for ${attrName} is no longer available. Switching to: ${values[0]}`);
        updatedAttributes[attrName] = values[0];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log('Updated attributes:', updatedAttributes);
      setSelectedAttributes(updatedAttributes);
    }
  }, [groupedAttributeValues]); // selectedAttributes'u buradan çıkardık, sonsuz loop olmasın

  // const getImageUrl = (image: string) => {
  //   if (!image_api_link) return image;
  //   // Remove leading slash if present
  //   return image_api_link.replace(/\/$/, '') + '/' + image.replace(/^\//, '');
  // };

  // Thumbnail/image navigation
  const selectThumb = (index: number) => setSelectedThumbIndex(index);

  const handleNextImage = () => {
    setSelectedThumbIndex((prev) =>
      filteredImages.length ? (prev + 1) % filteredImages.length : 0
    );
  };

  const handlePrevImage = () => {
    setSelectedThumbIndex((prev) =>
      filteredImages.length ? (prev - 1 + filteredImages.length) % filteredImages.length : 0
    );
  };

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

  const handleAttributeChange = (attributeName: string, value: string) => {
    console.log("your attribute name is:", attributeName);
    console.log("and the value is:", value);


    setSelectedThumbIndex(0);
    setUserHasSelectedVariant(true); // Kullanıcı varyant seçti
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
    // const newAttributes = { ...selectedAttributes, [attributeName]: value };
    // const newParams = new URLSearchParams(newAttributes).toString();
    // router.replace(`?${newParams}`);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = async () => {
    if (!session?.user?.email) {
      alert(t('pleaseLogin'));
      return;
    }
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert(t('enterValidQuantity'));
      return;
    }
    
    try {
      const userId = (session.user as any)?.id || session.user.email;
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
        setTimeout(() => setShowSuccessMessage(false), 3000);
        // Refresh cart count
        await refreshCart();
      } else {
        alert(t('errorAddingToCart'));
      }
    } catch (error) {
      console.error('Cart error:', error);
      alert(t('errorAddingToCart'));
    }
  };
  
  const handleBuyNow = async () => {
    await handleAddToCart();
    // TODO: Navigate to cart page
    // router.push('/cart');
  };
  
  const handleToggleFavorite = async () => {
    await toggleFavorite(product.sku);
  };
  
  // Translation helper
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      quantityMeters: { en: 'Quantity (m)', tr: 'Miktar (m)', ru: 'Количество (м)', pl: 'Ilość (m)', de: 'Menge (m)' },
      quantityPieces: { en: 'Quantity', tr: 'Adet', ru: 'Количество', pl: 'Ilość', de: 'Menge' },
      addToCart: { en: 'Add to Cart', tr: 'Sepete Ekle', ru: 'Добавить в корзину', pl: 'Dodaj do koszyka', de: 'In den Warenkorb' },
      buyNow: { en: 'Buy Now', tr: 'Şimdi Al', ru: 'Купить сейчас', pl: 'Kup teraz', de: 'Jetzt kaufen' },
      addToFavorites: { en: 'Add to favorites', tr: 'Favorilere ekle', ru: 'Добавить в избранное', pl: 'Dodaj do ulubionych', de: 'Zu Favoriten hinzufügen' },
      removeFromFavorites: { en: 'Remove from favorites', tr: 'Favorilerden çıkar', ru: 'Удалить из избранного', pl: 'Usuń z ulubionych', de: 'Aus Favoriten entfernen' },
      productAddedToCart: { en: 'Product added to cart!', tr: 'Ürün sepete eklendi!', ru: 'Товар добавлен в корзину!', pl: 'Produkt dodany do koszyka!', de: 'Produkt zum Warenkorb hinzugefügt!' },
      pleaseLogin: { en: 'Please log in', tr: 'Lütfen giriş yapın', ru: 'Пожалуйста, войдите', pl: 'Proszę się zalogować', de: 'Bitte einloggen' },
      enterValidQuantity: { en: 'Please enter a valid quantity', tr: 'Lütfen geçerli bir miktar girin', ru: 'Пожалуйста, введите правильное количество', pl: 'Proszę wprowadzić prawidłową ilość', de: 'Bitte geben Sie eine gültige Menge ein' },
      errorAddingToCart: { en: 'Error adding to cart', tr: 'Sepete eklenirken bir hata oluştu', ru: 'Ошибка при добавлении в корзину', pl: 'Błąd podczas dodawania do koszyka', de: 'Fehler beim Hinzufügen zum Warenkorb' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : locale === 'de' ? 'de' : 'en';
    return translations[key]?.[lang] || key;
  };
  
  // Determine if product is fabric (sold by meters) or ready-made curtain (sold by pieces)
  const isFabricProduct = product_category?.toLowerCase().includes('fabric') || product_category?.toLowerCase().includes('kumaş');
  const quantityLabel = isFabricProduct ? t('quantityMeters') : t('quantityPieces');


  // Prepare image files for display (fallback to placeholder)
  const imageFiles: string[] =
    filteredImages.length > 0
      ? filteredImages.map(img => img.file)
      // : ["/placeholder.png"];
      : [(placeholder_image_link)];

  // src={}

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={classes.ProductDetailCard} id="ProductDetailCard">
      <div className={classes.detailCardContainer}>
        <div className={classes.productMedia}>
          <div className={classes.thumbs}>
            {imageFiles.map((image, index) => (
              <div
                className={`${classes.thumb} ${selectedThumbIndex === index ? classes.thumb_selected : ''}`}
                key={index}
                onClick={() => selectThumb(index)}
              >
                <div className={classes.img}>
                  <img 
                    src={image || placeholder_image_link} 
                    alt="product image"
                    loading="eager"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={classes.gallery}>
            <button className={classes.prevButton} onClick={handlePrevImage}>{"<"}</button>
            <div className={imageLoaded ? ` ${classes.img} ${classes.loaded}` : `${classes.img}`}>
              <Link href={(imageFiles[selectedThumbIndex]
                || placeholder_image_link)} target="_blank"
                onClick={e => {
                  e.preventDefault();
                  window.open(
                    ((imageFiles[selectedThumbIndex] || placeholder_image_link),
                      'targetWindow',
                      'width=500,height=500'
                    ));
                }}>

                <img
                  key={imageFiles[selectedThumbIndex]}
                  src={(imageFiles[selectedThumbIndex]
                    || placeholder_image_link)}
                  alt="Product image"
                  loading="eager"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onLoad={() => setImageLoaded(true)}
                />
              </Link>
              {zoomPosition && zoomBoxPosition && (
                <div
                  className={classes.zoom}
                  style={{
                    backgroundImage: `url(${imageFiles[selectedThumbIndex]})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    top: `${zoomBoxPosition.y}px`,
                    left: `${zoomBoxPosition.x}px`,
                  }}
                />
              )}
            </div>
            <button className={classes.nextButton} onClick={handleNextImage}>{">"}</button>
          </div>
        </div>
        <div className={classes.productHero}>
          <h2>{product.title}</h2>
          <p>SKU: {product.sku}</p>
          {product_category ? <p className={classes.productCategory}>{product_category.toString()}</p> : null}


          {/* If the product has variants, display the variant information. */}
          {product_variant_attributes && product_variant_attributes.length > 0 ? (
            <div className={classes.variant_menu}>
              <ul>
                {groupedAttributeValues?.filter(({ values }) => values.length > 0).map(({ attribute, values }) => (
                  <li key={attribute.id.toString()}>
                    <label><h3>{attribute.name}</h3></label>
                    {/* Check if this is Color attribute */}
                    {attribute.name?.toLowerCase() === 'color' ? (
                      <div className={classes.color_swatches}>
                        {values.map((value: string) => {
                          const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                          const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                          const isTwoTone = isTwoToneColor(value);
                          
                          return (
                            <div key={value} className={classes.color_swatch_container}>
                              <Link
                                href={href}
                                replace
                                className={`${classes.color_swatch} ${isChecked ? classes.checked_color_swatch : ""}`}
                                onClick={e => {
                                  e.preventDefault();
                                  handleAttributeChange(attribute.name ?? '', value);
                                }}
                                style={isTwoTone ? {} : { backgroundColor: getColorCode(value) }}
                                title={value.replace(/_/g, " ").replace(/-/g, " ")}
                              >
                                {isTwoTone ? (
                                  // İki renkli swatch - daire yarıya bölünür
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
                                <span className={classes.sr_only}>{value.replace(/_/g, " ").replace(/-/g, " ")}</span>
                              </Link>
                              <span className={classes.color_label}>{value.replace(/_/g, " ").replace(/-/g, " ")}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={classes.variant_links}>
                        {values.map((value: string) => {
                          const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                          const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                          return (
                            <div key={value}>
                              <Link
                                href={href}
                                replace
                                className={`${classes.link} ${isChecked ? classes.checked_variant_link : ""}`}
                                onClick={e => {
                                  e.preventDefault();
                                  handleAttributeChange(attribute.name ?? '', value);
                                }}
                              >
                                {/* replace underscored with spaces for better client visual */}
                                {value.replace(/_/g," ")} 
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className={classes.variant_info}>
                {selectedVariant && selectedVariant.variant_sku && (
                  <p>Variant SKU: {selectedVariant.variant_sku}</p>
                )}
                {/* Price - variant veya product price */}
                {(selectedVariant?.variant_price && Number(selectedVariant.variant_price) > 0) ? (
                  <p>Price: ${String(selectedVariant.variant_price)}</p>
                ) : (product.price && Number(product.price) > 0) ? (
                  <p>Price: ${String(product.price)}</p>
                ) : null}
                {/* Quantity */}
                {(selectedVariant?.variant_quantity && Number(selectedVariant.variant_quantity) > 0) ? (
                  <p>Available Quantity: {Number(selectedVariant.variant_quantity)}</p>
                ) : (product.quantity && Number(product.quantity) > 0) ? (
                  <p>Available Quantity: {Number(product.quantity)}</p>
                ) : null}
                {/* Barcode */}
                {selectedVariant?.variant_barcode ? (
                  <p>Variant Barcode: {selectedVariant.variant_barcode}</p>
                ) : product.barcode ? (
                  <p>Barcode: {product.barcode}</p>
                ) : null}
                {/* {selectedVariant && selectedVariant.variant_cost ? (<>
                  <p>Variant Cost: ${String(selectedVariant.variant_cost)}</p>
                  <button type='submit'>Add to Cart</button>
                </>
                ) : (
                  product.price ? <>
                    <p>Cost: ${product.price}</p>
                    <button type='submit'>Add to Cart</button>
                  </> : <></>
                )} */}
              </div>
            </div>
          ) :
            <div className={classes.parent_product_info}>
              {/* Varyant olmayan ürünler için bilgiler */}
              {product.price && Number(product.price) > 0 && (
                <p>Price: ${String(product.price)}</p>
              )}
              {product.quantity && Number(product.quantity) > 0 && (
                <p>Available Quantity: {Number(product.quantity)}</p>
              )}
              {product.barcode && (
                <p>Barcode: {product.barcode}</p>
              )}
            </div>
          }

          {/* {selectedVariant && <p>Variant SKU: {selectedVariant.variant_sku}</p>} */}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className={classes.successMessage}>
              {successMessage}
            </div>
          )}

          {/* Cart Actions */}
          <div className={classes.cartActions}>
            <div className={classes.quantityWrapper}>
              <label htmlFor="quantity">{quantityLabel}:</label>
              <input
                id="quantity"
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                className={classes.quantityInput}
                placeholder="1.0"
              />
            </div>
            <div className={classes.buttonGroup}>
              <button onClick={handleAddToCart} className={classes.addToCartBtn}>
                {t('addToCart')}
              </button>
              <button onClick={handleBuyNow} className={classes.buyNowBtn}>
                {t('buyNow')}
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`${classes.favoriteBtn} ${isFavorite(product.sku) ? classes.favorited : ''}`}
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
            </div>
          </div>

          <h3>
            {locale === 'tr' ? 'Açıklama' :
             locale === 'ru' ? 'Описание' :
             locale === 'pl' ? 'Opis' :
             locale === 'de' ? 'Beschreibung' :
             'Description'}
          </h3>
          <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>

        </div>
      </div>
    </div>
  );
}

export default ProductDetailCard;