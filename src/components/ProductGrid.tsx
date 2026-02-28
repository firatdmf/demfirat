"use client"
// import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGrid.module.css";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useCurrency } from '@/contexts/CurrencyContext';
// below are react icons
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
// below are interfaces
import { SearchParams, Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces"
import { capitalizeFirstLetter } from "@/lib/functions"
import { log } from "node:console";

import { CatalogLeadModal } from "@/components/CatalogLeadModal";
import { trackKlaviyoCatalogRequest } from "@/lib/klaviyo";

type ProductGridProps = {
  products: Product[] | null;
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  product_category: string | null;
  product_category_description: string | null;
  searchParams: SearchParams;
  locale?: string;
  HeadlineT?: string;
  SearchBarT?: string;
  initialDisplayCount?: number;
  productVideoSKUs?: string[]; // SKUs of products that have local videos
}

// Import centralized translation utility
import { translateTextSync } from '@/lib/translate';

// Translation helper using centralized utility
const translateAttributeName = (name: string, locale: string): string => {
  return translateTextSync(name, locale);
};

// Below variables are passed down
function ProductGrid({ products, product_variants, product_variant_attributes, product_variant_attribute_values, product_category, product_category_description, searchParams, locale = 'en', HeadlineT, SearchBarT, initialDisplayCount = 30, productVideoSKUs = [] }: ProductGridProps) {
  // Create a Set for O(1) lookup of video SKUs
  const videoSKUsSet = new Set(productVideoSKUs);
  const { currency, symbol: currencySymbol } = useCurrency();
  // Pagination state
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Catalog download state
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // This is manipulated with (search params) but we need to initialize it first.
  let filteredProducts: Product[] | null = products ?? []; // Initialize as an empty array if products is null
  const [FilterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])) // First section open by default

  // Price range state
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [activePriceRange, setActivePriceRange] = useState<string>('');

  // ── Tab Counts Calculation (From original products prop) ──
  const tabCounts = useMemo(() => {
    if (!products) return { all: 0, embroidery: 0, solid: 0 };
    return {
      all: products.length,
      embroidery: products.filter(p =>
        p.product_attributes?.some(a => a.name?.toLowerCase() === 'fabric_type' && a.value?.toLowerCase() === 'embroidery')
      ).length,
      solid: products.filter(p =>
        p.product_attributes?.some(a => a.name?.toLowerCase() === 'fabric_type' && a.value?.toLowerCase() === 'solid')
      ).length
    };
  }, [products]);
  // ── Optimization: Pre-calculate Maps for O(1) lookups ──
  const variantsByProductId = useMemo(() => {
    const map = new Map<number, ProductVariant[]>();
    if (product_variants) {
      product_variants.forEach(v => {
        const pId = Number(v.product_id);
        const list = map.get(pId) || [];
        list.push(v);
        map.set(pId, list);
      });
    }
    return map;
  }, [product_variants]);

  const variantAttributeValuesMap = useMemo(() => {
    const map = new Map<number, ProductVariantAttributeValue>();
    if (product_variant_attribute_values) {
      product_variant_attribute_values.forEach(v => {
        map.set(Number(v.id), v);
      });
    }
    return map;
  }, [product_variant_attribute_values]);

  // Mobile temp filter states (initialized when drawer opens)
  const router = useRouter();
  const [tempMobileFilters, setTempMobileFilters] = useState<Record<string, string[]>>({});
  const [tempPriceMin, setTempPriceMin] = useState<string>('');
  const [tempPriceMax, setTempPriceMax] = useState<string>('');
  const [tempActivePriceRange, setTempActivePriceRange] = useState<string>('');

  const handleOpenMobileFilters = () => {
    // 1. Init temp attribute filters from current URL searchParams
    const initialFilters: Record<string, string[]> = {};
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== 'fabric_type') { // preserve fabric_type separately if needed, but it's not in the drawer
          initialFilters[k] = Array.isArray(v) ? [...v] : String(v).split(',');
        }
      });
    }
    setTempMobileFilters(initialFilters);

    // 2. Init temp price filters from current desktop state
    setTempPriceMin(priceMin);
    setTempPriceMax(priceMax);
    setTempActivePriceRange(activePriceRange);

    setFilterDrawerOpen(true);
  };

  const handleApplyMobileFilters = () => {
    // 1. Build URL params for attributes
    const params = new URLSearchParams();
    if (searchParams?.fabric_type) {
      params.set('fabric_type', String(searchParams.fabric_type));
    }

    Object.entries(tempMobileFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    // Push new attributes to URL (Next.js will trigger re-render with new searchParams)
    router.push(`?${params.toString()}`, { scroll: false });

    // 2. Apply price filters to desktop state (they operate locally)
    setPriceMin(tempPriceMin);
    setPriceMax(tempPriceMax);
    setActivePriceRange(tempActivePriceRange);

    // 3. Close drawer
    setFilterDrawerOpen(false);
  };

  const toggleTempFilter = (paramKey: string, paramValue: string) => {
    setTempMobileFilters(prev => {
      const currentValues = prev[paramKey] || [];
      const isChecked = currentValues.includes(paramValue);
      let newValues;
      if (isChecked) {
        newValues = currentValues.filter(val => val !== paramValue);
      } else {
        newValues = [...currentValues, paramValue];
      }
      return { ...prev, [paramKey]: newValues };
    });
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Catalog download handler (Opens Lead Modal)
  const handleDownloadCatalog = () => {
    if (!filteredProducts || filteredProducts.length === 0) return;
    setIsLeadModalOpen(true);
  };

  // Called when modal is submitted with user details
  const handleLeadSubmit = async (data: { name: string; email: string; phone: string }) => {
    setIsGeneratingCatalog(true);
    try {
      // Prepare products for PDF (same logic as before)
      const catalogProducts = filteredProducts?.map(product => {
        const productVars = product_variants.filter(v => v.product_id === product.id);
        const colors = new Set<string>();
        const attributes = new Map<string, Set<string>>();

        productVars.forEach(variant => {
          variant.product_variant_attribute_values.forEach(avId => {
            const av = product_variant_attribute_values.find(v => v.id === avId);
            if (av) {
              const attr = product_variant_attributes.find(a => a.id === av.product_variant_attribute_id);
              if (attr?.name) {
                const attrName = attr.name.toLowerCase();
                if (attrName === 'color') {
                  colors.add(av.product_variant_attribute_value);
                } else {
                  if (!attributes.has(attr.name)) {
                    attributes.set(attr.name, new Set());
                  }
                  attributes.get(attr.name)?.add(av.product_variant_attribute_value);
                }
              }
            }
          });
        });

        const attributesArray = Array.from(attributes.entries()).map(([name, values]) => ({
          name,
          values: Array.from(values).slice(0, 5)
        }));

        return {
          sku: product.sku || '',
          title: product.title || '',
          price: product.price ? Number(product.price) : null,
          description: product.description ? String(product.description) : '',
          primary_image: product.primary_image || '',
          colors: Array.from(colors),
          attributes: attributesArray,
          variants: productVars.slice(0, 8).map(v => ({
            sku: v.variant_sku,
            price: v.variant_price ? Number(v.variant_price) : null
          }))
        };
      });

      // Send to unified combined API endpoint
      const response = await fetch('/api/catalog/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: catalogProducts,
          locale,
          email: data.email,
          name: data.name,
          phone: data.phone
        })
      });

      if (response.ok) {
        setIsLeadModalOpen(false);
        trackKlaviyoCatalogRequest(data.email, data.name);
        alert('Katalog e-posta adresinize gönderildi!');
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Gönderim başarısız oldu.');
      }
    } catch (error: any) {
      console.error('Catalog email error:', error);
      throw error; // Let modal catch it display it
    } finally {
      setIsGeneratingCatalog(false);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Trigger when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        const currentProducts = filteredProducts || [];
        if (displayCount < currentProducts.length) {
          setIsLoadingMore(true);

          // Products are already in memory — render them instantly
          setDisplayCount(prev => prev + 30);
          setIsLoadingMore(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, displayCount, filteredProducts]);


  // If there are search params in the url (filter menu)
  if (searchParams && Object.keys(searchParams).length > 0) {

    // Iterate through the search params object
    Object.entries(searchParams).forEach(([key, value]) => {
      // ?color=white size=84,95
      // attribute names are unique so we use find instead of filter and this returns a single object
      const attribute = product_variant_attributes.find((attribute) => {
        return attribute.name === key;
      });
      if (attribute) {
        // If we have a multiple values such as 84 and 95 both selected for size, then we split them by comma (%2C)
        const values = Array.isArray(value) ? value : value?.split(',');
        // console.log("little values are");
        // console.log(values);

        // get the appropriate objects from passed down db object that match the attribute and values
        const attribute_values = product_variant_attribute_values.filter((attribute_value) => {
          return attribute_value.product_variant_attribute_id === attribute.id && values?.includes(attribute_value.product_variant_attribute_value);
        });
        // console.log("your attribute values are:");
        // console.log(attribute_values);

        const attribute_value_ids = attribute_values.map((attribute_value) => attribute_value.id);
        // const matching_variant_ids =  product_variants.product_variant_attribute_values
        // In this case, it means: // "Include this variant if it has at least one attribute value that matches the selected filter values."
        const matching_product_variants = product_variants.filter((variant) => { return variant.product_variant_attribute_values.some(valueId => attribute_value_ids.includes(valueId)) });
        const matching_product_ids = Array.from(new Set(matching_product_variants.map((variant) => variant.product_id)));

        // Extract distinct product IDs, eliminating duplicate productss
        // const productIds = Array.from(new Set(attribute_values.map((attribute_value) => attribute_value.product_id)));
        filteredProducts = filteredProducts?.filter((product) => matching_product_ids.includes(product.id)) || null;
        // console.log("filtered products are:");
        // console.log(filteredProducts);

      } else {
        console.log("you got no attribute defined")
      }
      // Printing params for reference
      // console.log(`${key} ${value}`);
    });
  }

  // ── Fabric type filtering (Nakışlı / Düz) ──
  const activeFabricType = (searchParams?.fabric_type as string) || '';
  if (activeFabricType && filteredProducts) {
    filteredProducts = filteredProducts.filter((product) => {
      const fabricAttr = product.product_attributes?.find(
        (attr) => attr.name?.toLowerCase() === 'fabric_type'
      );
      if (!fabricAttr) return false;
      return fabricAttr.value?.toLowerCase() === activeFabricType.toLowerCase();
    });
  }

  // ── Price range filtering ──
  const getProductPrice = (product: Product): number | null => {
    // Use the active currency's pre-converted price
    const currKey = currency as keyof NonNullable<typeof product.prices>;
    if (product.prices?.[currKey] && Number(product.prices[currKey]) > 0) {
      return Number(product.prices[currKey]);
    }
    // Fallback: check variant prices
    const productVars = product_variants.filter(v => v.product_id === product.id);
    for (const v of productVars) {
      if (v.variant_prices?.[currKey] && Number(v.variant_prices[currKey]) > 0) {
        return Number(v.variant_prices[currKey]);
      }
    }
    // Final fallback to raw price
    if (product.price && Number(product.price) > 0) return Number(product.price);
    return null;
  };

  // Apply price filter
  if (filteredProducts && (priceMin || priceMax || activePriceRange)) {
    let minVal = priceMin ? parseFloat(priceMin) : 0;
    let maxVal = priceMax ? parseFloat(priceMax) : Infinity;

    // If a preset range is active, use its values
    if (activePriceRange) {
      const [rMin, rMax] = activePriceRange.split('-').map(Number);
      minVal = rMin || 0;
      maxVal = rMax || Infinity;
    }

    filteredProducts = filteredProducts.filter((product) => {
      const price = getProductPrice(product);
      if (price === null) return true; // Show products without price
      return price >= minVal && price <= maxVal;
    });
  }

  // Reset price filter when currency changes
  useEffect(() => {
    setPriceMin('');
    setPriceMax('');
    setActivePriceRange('');
  }, [currency]);

  // Predefined price ranges per currency
  const priceRangePresets: Record<string, { min: number; max: number }[]> = {
    TRY: [{ min: 0, max: 150 }, { min: 150, max: 200 }, { min: 200, max: 300 }, { min: 300, max: Infinity }],
    USD: [{ min: 0, max: 5 }, { min: 5, max: 7 }, { min: 7, max: 10 }, { min: 10, max: Infinity }],
    EUR: [{ min: 0, max: 5 }, { min: 5, max: 7 }, { min: 7, max: 10 }, { min: 10, max: Infinity }],
    RUB: [{ min: 0, max: 400 }, { min: 400, max: 600 }, { min: 600, max: 900 }, { min: 900, max: Infinity }],
    PLN: [{ min: 0, max: 20 }, { min: 20, max: 30 }, { min: 30, max: 40 }, { min: 40, max: Infinity }],
  };
  const currentPresets = priceRangePresets[currency] || priceRangePresets.TRY;
  const priceRanges = currentPresets.map(r => ({
    min: r.min,
    max: r.max,
    label: r.max === Infinity
      ? `${r.min} ${currencySymbol} ${locale === 'tr' ? 've üzeri' : locale === 'ru' ? 'и выше' : locale === 'pl' ? 'i więcej' : '+'}`
      : `${r.min} - ${r.max} ${currencySymbol}`,
  }));

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGrid}>
        <div className={classes.headerSection}>
          <div className={classes.headerBackground}>
            {/* Dynamic Hero Image based on category */}
            <Image
              src={
                product_category?.toLowerCase().includes('fabric') ? '/media/hero/fabric-hero.png' :
                  product_category?.toLowerCase().includes('curtain') ? '/media/ks-curtains-image.jpg' :
                    '/image/category-hero.jpg'
              }
              alt={product_category || 'Category Hero'}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={classes.headerOverlay}></div>
          <div className={classes.headerContent}>
            <h1 className={classes.pageTitle}>
              {product_category?.toLowerCase().includes('fabric')
                ? (locale === 'tr' ? 'Tül Perdeler' :
                  locale === 'ru' ? 'Тюлевые шторы' :
                    locale === 'pl' ? 'Firany' :
                      locale === 'de' ? 'Tüllvorhänge' : 'Tulle Curtains')
                : product_category?.toLowerCase().includes('curtain')
                  ? (locale === 'tr' ? 'Perdeler' :
                    locale === 'ru' ? 'Шторы' :
                      locale === 'pl' ? 'Zasłony' :
                        locale === 'de' ? 'Vorhänge' : 'Curtains')
                  : (locale === 'tr' ? 'Ürünler' :
                    locale === 'ru' ? 'Продукты' :
                      locale === 'pl' ? 'Produkty' :
                        locale === 'de' ? 'Produkte' : 'Products')}
            </h1>
            <p className={classes.pageDescription}>
              {product_category?.toLowerCase().includes('fabric')
                ? (locale === 'tr' ? 'Nakışlı ve düz tül perde modelleri - Premium ev tekstili koleksiyonu' :
                  locale === 'ru' ? 'Модели вышитого и гладкого тюля - Премиальная коллекция домашнего текстиля' :
                    locale === 'pl' ? 'Modele haftowanych i gładkich firan - Luksusowa kolekcja tekstyliów domowych' :
                      locale === 'de' ? 'Bestickte und glatte Tüllvorhänge - Premium Heimtextilien-Kollektion' :
                        'Embroidered and solid tulle curtain models - Premium home textile collection')
                : product_category?.toLowerCase().includes('curtain')
                  ? (locale === 'tr' ? 'Terziyi beklemeyi bırakın. Premium hazır perdelerimizle bugün mükemmel pencere görünümünü yakalayın. Tamamen bitmiş olarak gelir ve dakikalar içinde pencerelerinizi süsler.' :
                    locale === 'ru' ? 'Забудьте о портном и ожидании. Получите идеальный вид окна сегодня с нашими премиальными готовыми шторами. Полностью готовы и украсят ваши окна за считанные минуты.' :
                      locale === 'pl' ? 'Pomiń krawca i czekanie. Uzyskaj idealny wygląd okna już dziś dzięki naszym gotowym zasłonom premium. Całkowicie wykończone i gotowe do dekoracji okien w kilka minut.' :
                        locale === 'de' ? 'Überspringen Sie den Schneider und das Warten. Erhalten Sie heute den perfekten Fenster-Look mit unseren Premium-Fertigvorhängen. Komplett fertig und bereit, Ihre Fenster in wenigen Minuten zu verschönern.' :
                          'Skip the tailor and the wait. Get the perfect window look today with our premium ready-made curtains. They arrive fully finished and ready to grace your windows in minutes.')
                  : product_category_description}
            </p>
          </div>
        </div>

        {/* Category Tabs - only show for fabric category */}
        {product_category?.toLowerCase().includes('fabric') && (
          <div className={classes.categoryTabs}>
            <Link
              href={`?${(() => { const p = new URLSearchParams(searchParams as Record<string, string>); p.delete('fabric_type'); return p.toString(); })()}`}
              replace={true}
              scroll={false}
              className={`${classes.categoryTab} ${!activeFabricType ? classes.categoryTabActive : ''}`}
            >
              {locale === 'tr' ? 'Tümü' : locale === 'ru' ? 'Все' : locale === 'pl' ? 'Wszystko' : 'All'}
              <span className={classes.tabCount}>{tabCounts.all}</span>
            </Link>
            <Link
              href={`?${(() => { const p = new URLSearchParams(searchParams as Record<string, string>); p.set('fabric_type', 'embroidery'); return p.toString(); })()}`}
              replace={true}
              scroll={false}
              className={`${classes.categoryTab} ${activeFabricType === 'embroidery' ? classes.categoryTabActive : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
              {locale === 'tr' ? 'Nakışlı' : locale === 'ru' ? 'Вышитые' : locale === 'pl' ? 'Haftowane' : 'Embroidered'}
            </Link>
            <Link
              href={`?${(() => { const p = new URLSearchParams(searchParams as Record<string, string>); p.set('fabric_type', 'solid'); return p.toString(); })()}`}
              replace={true}
              scroll={false}
              className={`${classes.categoryTab} ${activeFabricType === 'solid' ? classes.categoryTabActive : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
              {locale === 'tr' ? 'Düz Modeller' : locale === 'ru' ? 'Однотонные' : locale === 'pl' ? 'Tkaniny gładkie' : 'Solid Patterns'}
            </Link>
          </div>
        )}
        {/* Mobile Filter Button */}
        <div className={classes.filterButtonContainer}>
          <button
            className={classes.mobileFilterButton}
            onClick={handleOpenMobileFilters}
            aria-label="Open filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="14" y2="18"></line>
              <circle cx="18" cy="18" r="2"></circle>
            </svg>
            <span>
              {locale === 'tr' ? 'Filtrele' :
                locale === 'ru' ? 'Фильтры' :
                  locale === 'pl' ? 'Filtry' :
                    'Filters'}
            </span>
          </button>

          {/* Download Catalog Button */}
          <button
            className={classes.catalogDownloadButton}
            onClick={handleDownloadCatalog}
            disabled={isGeneratingCatalog || !filteredProducts || filteredProducts.length === 0}
            aria-label="Download catalog"
          >
            {isGeneratingCatalog ? (
              <svg className={classes.spinnerIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
            <span>
              {locale === 'tr' ? 'Katalog İndir' :
                locale === 'ru' ? 'Скачать каталог' :
                  locale === 'pl' ? 'Pobierz katalog' :
                    'Download Catalog'}
            </span>
          </button>
        </div>


        {/* Mobile Filter Drawer Overlay */}
        {FilterDrawerOpen && (
          <div
            className={classes.filterDrawerOverlay}
            onClick={() => setFilterDrawerOpen(false)}
          >
            <div
              className={`${classes.filterDrawer} ${FilterDrawerOpen ? classes.filterDrawerOpen : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drawer Header */}
              <div className={classes.filterDrawerHeader}>
                <h3>
                  {locale === 'tr' ? 'Filtreler' :
                    locale === 'ru' ? 'Фильтры' :
                      locale === 'pl' ? 'Filtry' :
                        'Filters'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link href="?" scroll={false} className={classes.clearFiltersButton} replace={true}>
                    {locale === 'tr' ? 'Temizle' :
                      locale === 'ru' ? 'Очистить' :
                        locale === 'pl' ? 'Wyczyść' :
                          'Reset'}
                  </Link>
                  <button
                    className={classes.closeDrawerButton}
                    onClick={() => setFilterDrawerOpen(false)}
                    aria-label="Close filters"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Drawer Content */}
              <div className={classes.filterDrawerContent}>
                {product_variant_attributes
                  .filter((attribute: ProductVariantAttribute) => {
                    // Only show 'Color' attribute for fabric pages — Kumaş, Kristal etc are confusing
                    const name = attribute.name?.toLowerCase() || '';
                    return name === 'color';
                  })
                  .map((attribute: ProductVariantAttribute, index: number) => {
                    const filteredValues = product_variant_attribute_values.filter(
                      (attribute_value) => attribute_value.product_variant_attribute_id === attribute.id
                    );
                    const uniqueValues = Array.from(new Set(filteredValues.map(value => value.product_variant_attribute_value)))
                      .map(value => filteredValues.find(attribute_value => attribute_value.product_variant_attribute_value === value));

                    const isExpanded = expandedSections.has(index);

                    return (
                      <div key={index} className={classes.filterSection}>
                        <div
                          className={classes.filterSectionHeader}
                          onClick={() => toggleSection(index)}
                        >
                          <span>{translateAttributeName(attribute.name || '', locale)}</span>
                          <svg
                            className={`${classes.chevron} ${isExpanded ? classes.chevronOpen : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                        {isExpanded && (
                          <div className={classes.filterSectionContent}>
                            {uniqueValues.map((attribute_value) => {
                              const paramKey = String(attribute.name);
                              const paramValue = String(attribute_value?.product_variant_attribute_value);
                              const currentValues = tempMobileFilters[paramKey] || [];
                              const isChecked = currentValues.includes(paramValue);

                              return (
                                <button
                                  key={attribute_value?.id}
                                  className={classes.filterOption}
                                  onClick={() => toggleTempFilter(paramKey, paramValue)}
                                >
                                  <div className={classes.checkbox}>
                                    {isChecked ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                                  </div>
                                  <span className={classes.filterLabel}>
                                    {translateAttributeName(attribute_value?.product_variant_attribute_value || '', locale)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Mobile Price Range Filter */}
                <div className={classes.filterSection}>
                  <div className={classes.filterSectionHeader} onClick={() => toggleSection(99)}>
                    <span>{locale === 'tr' ? 'Fiyat Aralığı' : locale === 'ru' ? 'Диапазон цен' : locale === 'pl' ? 'Zakres cenowy' : 'Price Range'}</span>
                    <svg
                      className={`${classes.chevron} ${expandedSections.has(99) ? classes.chevronOpen : ''}`}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  {expandedSections.has(99) && (
                    <div className={classes.filterSectionContent}>
                      <div className={classes.priceInputRow}>
                        <input
                          type="number"
                          className={classes.priceInput}
                          placeholder={locale === 'tr' ? 'En Az' : 'Min'}
                          value={tempPriceMin}
                          onChange={(e) => { setTempPriceMin(e.target.value); setTempActivePriceRange(''); }}
                        />
                        <span className={classes.priceDash}>–</span>
                        <input
                          type="number"
                          className={classes.priceInput}
                          placeholder={locale === 'tr' ? 'En Çok' : 'Max'}
                          value={tempPriceMax}
                          onChange={(e) => { setTempPriceMax(e.target.value); setTempActivePriceRange(''); }}
                        />
                      </div>
                      <div className={classes.priceRanges}>
                        {priceRanges.map((range) => {
                          const rangeKey = `${range.min}-${range.max === Infinity ? '' : range.max}`;
                          const isActive = tempActivePriceRange === rangeKey;
                          return (
                            <button
                              key={rangeKey}
                              className={`${classes.priceRangeBtn} ${isActive ? classes.priceRangeActive : ''}`}
                              onClick={() => {
                                if (isActive) {
                                  setTempActivePriceRange('');
                                  setTempPriceMin('');
                                  setTempPriceMax('');
                                } else {
                                  setTempActivePriceRange(rangeKey);
                                  setTempPriceMin(String(range.min));
                                  setTempPriceMax(range.max === Infinity ? '' : String(range.max));
                                }
                              }}
                            >
                              <div className={classes.checkbox}>
                                {isActive ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                              </div>
                              <span>{range.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Mobile Apply Button */}
              <div className={classes.mobileFilterFooter}>
                <button
                  className={classes.mobileApplyButton}
                  onClick={handleApplyMobileFilters}
                >
                  {locale === 'tr' ? 'Uygula' : locale === 'ru' ? 'Применить' : locale === 'pl' ? 'Zastosuj' : 'Apply Filters'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={classes.FiratDisplay}>
          <div className={classes.filterMenu}>
            {/* Sticky Reset Button */}
            <div className={classes.filterHeader}>
              <h3 className={classes.filterTitle}>
                {locale === 'tr' ? 'Filtreler' :
                  locale === 'ru' ? 'Фильтры' :
                    locale === 'pl' ? 'Filtry' :
                      'Filters'}
              </h3>
              <div className={classes.filterActions}>
                <Link href="?" scroll={false} className={classes.clearFiltersButton} replace={true}>
                  {locale === 'tr' ? 'Temizle' :
                    locale === 'ru' ? 'Очистить' :
                      locale === 'pl' ? 'Wyczyść' :
                        locale === 'de' ? 'Zurücksetzen' :
                          'Reset'}
                </Link>
              </div>
            </div>



            {/* Scrollable Filter Content */}
            <div className={classes.filterContent}>
              {product_variant_attributes
                .filter((attribute: ProductVariantAttribute) => {
                  // Only show 'Color' attribute for fabric pages — Kumaş, Kristal etc are confusing
                  const name = attribute.name?.toLowerCase() || '';
                  return name === 'color';
                })
                .map((attribute: ProductVariantAttribute, index: number) => {
                  const filteredValues = product_variant_attribute_values.filter(
                    (attribute_value) => attribute_value.product_variant_attribute_id === attribute.id
                  );
                  const uniqueValues = Array.from(new Set(filteredValues.map(value => value.product_variant_attribute_value)))
                    .map(value => filteredValues.find(attribute_value => attribute_value.product_variant_attribute_value === value));

                  const isExpanded = expandedSections.has(index);

                  return (
                    <div key={index} className={classes.filterSection}>
                      <div
                        className={classes.filterSectionHeader}
                        onClick={() => toggleSection(index)}
                      >
                        <span>{translateAttributeName(attribute.name || '', locale)}</span>
                        <svg
                          className={`${classes.chevron} ${isExpanded ? classes.chevronOpen : ''}`}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                      {isExpanded && (
                        <div className={classes.filterSectionContent}>
                          {uniqueValues.map((attribute_value) => {
                            const params = new URLSearchParams(searchParams as Record<string, string>);
                            const paramKey = String(attribute.name);
                            const paramValue = String(attribute_value?.product_variant_attribute_value);
                            const currentValues = params.get(paramKey)?.split(',') || [];
                            const isChecked = currentValues.includes(paramValue);

                            if (isChecked) {
                              const newValues = currentValues.filter((val) => val !== paramValue);
                              if (newValues.length > 0) {
                                params.set(paramKey, newValues.join(','));
                              } else {
                                params.delete(paramKey);
                              }
                            } else {
                              currentValues.push(paramValue);
                              params.set(paramKey, currentValues.join(','));
                            }

                            const href = `?${params.toString()}`;

                            return (
                              <Link key={attribute_value?.id} className={classes.filterOption} href={href} replace={true} scroll={false}>
                                <div className={classes.checkbox}>
                                  {isChecked ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                                </div>
                                <span className={classes.filterLabel}>
                                  {translateAttributeName(attribute_value?.product_variant_attribute_value || '', locale)}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Price Range Filter - Desktop */}
            <div className={classes.filterSection}>
              <div className={classes.filterSectionHeader} onClick={() => toggleSection(99)}>
                <span>{locale === 'tr' ? 'Fiyat Aralığı' : locale === 'ru' ? 'Диапазон цен' : locale === 'pl' ? 'Zakres cenowy' : 'Price Range'}</span>
                <svg
                  className={`${classes.chevron} ${expandedSections.has(99) ? classes.chevronOpen : ''}`}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {expandedSections.has(99) && (
                <div className={classes.filterSectionContent}>
                  <div className={classes.priceInputRow}>
                    <input
                      type="number"
                      className={classes.priceInput}
                      placeholder={locale === 'tr' ? 'En Az' : 'Min'}
                      value={priceMin}
                      onChange={(e) => { setPriceMin(e.target.value); setActivePriceRange(''); }}
                    />
                    <span className={classes.priceDash}>–</span>
                    <input
                      type="number"
                      className={classes.priceInput}
                      placeholder={locale === 'tr' ? 'En Çok' : 'Max'}
                      value={priceMax}
                      onChange={(e) => { setPriceMax(e.target.value); setActivePriceRange(''); }}
                    />
                    <button
                      className={classes.priceApplyBtn}
                      onClick={() => setActivePriceRange('')}
                      aria-label="Apply price filter"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                  <div className={classes.priceRanges}>
                    {priceRanges.map((range) => {
                      const rangeKey = `${range.min}-${range.max === Infinity ? '' : range.max}`;
                      const isActive = activePriceRange === rangeKey;
                      return (
                        <button
                          key={rangeKey}
                          className={`${classes.priceRangeBtn} ${isActive ? classes.priceRangeActive : ''}`}
                          onClick={() => {
                            if (isActive) {
                              setActivePriceRange('');
                              setPriceMin('');
                              setPriceMax('');
                            } else {
                              setActivePriceRange(rangeKey);
                              setPriceMin(String(range.min));
                              setPriceMax(range.max === Infinity ? '' : String(range.max));
                            }
                          }}
                        >
                          <div className={classes.checkbox}>
                            {isActive ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                          </div>
                          <span>{range.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Catalog Download Button - Desktop */}
            <div className={classes.catalogButtonWrapper}>
              <button
                className={classes.catalogDownloadButtonDesktop}
                onClick={handleDownloadCatalog}
                disabled={isGeneratingCatalog || !filteredProducts || filteredProducts.length === 0}
              >
                {isGeneratingCatalog ? (
                  <svg className={classes.spinnerIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10"></circle>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                )}
                <span>
                  {locale === 'tr' ? 'Katalog İndir' :
                    locale === 'ru' ? 'Скачать каталог' :
                      locale === 'pl' ? 'Pobierz katalog' :
                        'Download Catalog'}
                </span>
                <span className={classes.productCount}>({filteredProducts?.length || 0})</span>
              </button>
            </div>
          </div>
          <div className={classes.products}>
            {(Array.isArray(filteredProducts) ? filteredProducts : [])?.slice(0, displayCount).map((product: Product) => {
              // Get all variant prices for this product using O(1) map
              const productVariants = variantsByProductId.get(Number(product.id)) || product_variants.filter(v => v.product_id === product.id);
              const allVariantPrices = productVariants
                .map((v: ProductVariant) => v.variant_price ? Number(v.variant_price) : null)
                .filter((p: number | null) => p !== null) as number[];
              const firstVariantPrice = allVariantPrices.length > 0 ? allVariantPrices[0] : null;

              // Get fabric_type and intent from searchParams
              const fabricType = searchParams?.fabric_type as string | undefined;
              const intent = searchParams?.intent as string | undefined;

              return <ProductCard key={product.id} product={product} locale={locale} variant_price={firstVariantPrice} allVariantPrices={allVariantPrices} variantAttributes={product_variant_attributes} variantAttributeValues={product_variant_attribute_values} variantAttributeValuesMap={variantAttributeValuesMap} productVariants={productVariants} fabricType={fabricType} hasVideo={videoSKUsSet.has(product.sku)} intent={intent} />;
            })}
          </div>
        </div>

        {/* Loading indicator for infinite scroll */}
        {
          isLoadingMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px',
              width: '100%'
            }}>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #c9a961',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            </div>
          )
        }

        {/* End message */}
        {
          filteredProducts && displayCount >= filteredProducts.length && filteredProducts.length > initialDisplayCount && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '16px'
            }}>
              {locale === 'tr' ? 'Tüm ürünler yüklendi' :
                locale === 'ru' ? 'Все товары загружены' :
                  locale === 'pl' ? 'Wszystkie produkty załadowane' :
                    'All products loaded'}
            </div>
          )
        }

        <CatalogLeadModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          onSubmit={handleLeadSubmit}
          isLoading={isGeneratingCatalog}
        />
      </div >
    );
  }
}

export default ProductGrid;
