"use client"
// import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGrid.module.css";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useState, useEffect } from "react";
// below are react icons
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
// below are interfaces
import { SearchParams, Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces"
import { capitalizeFirstLetter } from "@/lib/functions"
import { log } from "node:console";

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
  // Pagination state
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Catalog download state
  const [isGeneratingCatalog, setIsGeneratingCatalog] = useState(false);

  // This is manipulated with (search params) but we need to initialize it first.
  let filteredProducts: Product[] | null = products ?? []; // Initialize as an empty array if products is null
  const [FilterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])) // First section open by default

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Catalog download handler
  const handleDownloadCatalog = async () => {
    if (!filteredProducts || filteredProducts.length === 0) return;

    setIsGeneratingCatalog(true);
    try {
      // Prepare products for PDF
      const catalogProducts = filteredProducts.map(product => {
        // Get variants for this product
        const productVars = product_variants.filter(v => v.product_id === product.id);

        // Get colors from variants
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
                  // Collect other attributes
                  if (!attributes.has(attr.name)) {
                    attributes.set(attr.name, new Set());
                  }
                  attributes.get(attr.name)?.add(av.product_variant_attribute_value);
                }
              }
            }
          });
        });

        // Convert attributes map to array
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

      const response = await fetch('/api/catalog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: catalogProducts, locale })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalog-${product_category || 'all'}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate catalog');
      }
    } catch (error) {
      console.error('Catalog download error:', error);
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

          setTimeout(() => {
            setDisplayCount(prev => prev + 30);
            setIsLoadingMore(false);
          }, 500);
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

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGrid}>
        <div className={classes.headerSection}>
          <div className={classes.headerBackground}>
            {/* Dynamic Hero Image based on category */}
            <img
              src={
                product_category?.toLowerCase().includes('fabric') ? '/media/hero/fabric-hero.png' :
                  product_category?.toLowerCase().includes('curtain') ? '/media/ks-curtains-image.jpg' :
                    '/image/category-hero.jpg'
              }
              alt={product_category || 'Category Hero'}
              onError={(e) => {
                // Fallback if image fails
                e.currentTarget.src = '/media/hero/fabric-hero.png';
              }}
            />
          </div>
          <div className={classes.headerOverlay}></div>
          <div className={classes.headerContent}>
            <h1 className={classes.pageTitle}>
              {product_category?.toLowerCase().includes('fabric')
                ? (locale === 'tr' ? 'Kumaşlar' :
                  locale === 'ru' ? 'Ткани' :
                    locale === 'pl' ? 'Tkaniny' :
                      locale === 'de' ? 'Stoffe' : 'Fabrics')
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
                ? (locale === 'tr' ? 'Nakışlı tül perde kumaşları - Premium ev tekstili koleksiyonu' :
                  locale === 'ru' ? 'Вышитые прозрачные ткани для штор - Роскошная коллекция домашнего текстиля' :
                    locale === 'pl' ? 'Haftowane przezroczyste tkaniny zasłonowe - Luksusowa kolekcja tekstyliów domowych' :
                      locale === 'de' ? 'Bestickte transparente Vorhangsstoffe - Luxuriöse Heimtextilien-Kollektion' :
                        'Embroidered sheer curtain fabrics - Luxury home textile collection')
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

        {/* Mobile Filter Button */}
        <div className={classes.filterButtonContainer}>
          <button
            className={classes.mobileFilterButton}
            onClick={() => setFilterDrawerOpen(true)}
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
                {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {
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
                              <Link
                                key={attribute_value?.id}
                                className={classes.filterOption}
                                href={href}
                                replace={true}
                                scroll={false}
                                onClick={() => setFilterDrawerOpen(false)}
                              >
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
              {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {
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
              // Get all variant prices for this product
              const productVariants = product_variants.filter(v => v.product_id === product.id);
              const allVariantPrices = productVariants
                .map(v => v.variant_price ? Number(v.variant_price) : null)
                .filter(p => p !== null) as number[];
              const firstVariantPrice = allVariantPrices.length > 0 ? allVariantPrices[0] : null;

              // Get fabric_type from searchParams for discount display
              const fabricType = searchParams?.fabric_type as string | undefined;

              return <ProductCard key={product.id} product={product} locale={locale} variant_price={firstVariantPrice} allVariantPrices={allVariantPrices} variantAttributes={product_variant_attributes} variantAttributeValues={product_variant_attribute_values} productVariants={productVariants} fabricType={fabricType} hasVideo={videoSKUsSet.has(product.sku)} />;
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
      </div >
    );
  }
}

export default ProductGrid;
