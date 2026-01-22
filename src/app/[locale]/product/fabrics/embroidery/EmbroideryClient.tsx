"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, SearchParams } from "@/lib/interfaces";
import { FaSearch, FaTimes } from 'react-icons/fa';
import classes from './page.module.css';

// Dynamically import ProductGrid for code splitting
const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #c9a961',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite'
      }}></div>
    </div>
  )
});

interface EmbroideryClientProps {
  locale: string;
  searchParams: SearchParams;
}

// Transform fabric data to Product interface format
const transformFabricToProduct = (fabric: any, index: number): Product => {
  // Use index + design to create unique ID
  const uniqueId = BigInt(parseInt(fabric.design) * 1000 + index);
  return {
    id: uniqueId as any,
    pk: parseInt(fabric.design) || 0,
    sku: fabric.design,
    title: `Design ${fabric.design}`,
    description: `Embroidered sheer curtain fabric with design ${fabric.design}`,
    price: null,
    quantity: null,
    barcode: fabric.design,
    tags: null,
    type: null,
    unit_of_measurement: null,
    featured: false,
    selling_while_out_of_stock: false,
    weight: null,
    unit_of_weight: null,
    category_id: null,
    supplier_id: null,
    datasheet_url: null,
    minimum_inventory_level: null,
    available_quantity: 0 as any,
    primary_image: fabric.files?.[0] ? `/media/products/embroidered_sheer_curtain_fabrics/thumbnails/${fabric.files[0].name}` : undefined,
    created_at: new Date(fabric.date || Date.now())
  };
};

export default function EmbroideryClient({ locale, searchParams }: EmbroideryClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [fabricData, setFabricData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load JSON data asynchronously
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await import("@/vir_db/products_embroidered_sheer_curtain_fabrics.json");
        setFabricData(data.default);
        setIsLoading(false);
      } catch (error) {
        console.error('[EMBROIDERY] Failed to load data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Process all products with search filtering
  const allProducts = useMemo(() => {
    if (fabricData.length === 0) return [];

    let dataToProcess = fabricData;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      dataToProcess = fabricData.filter(fabric =>
        fabric.design?.toString().toLowerCase().includes(query) ||
        (fabric.prefix && fabric.prefix.toLowerCase().includes(query)) ||
        fabric.files?.some((f: any) => f.variant && f.variant.toLowerCase().includes(query))
      );
    }

    const products: Product[] = dataToProcess.map(transformFabricToProduct);

    // Remove duplicate products by SKU (keep first occurrence)
    const uniqueProducts: Product[] = Array.from(
      new Map(products.map(product => [product.sku, product])).values()
    );

    console.log(`[EMBROIDERY] Search: "${searchTerm}", Found: ${uniqueProducts.length}`);
    return uniqueProducts;
  }, [fabricData, searchTerm]);

  const product_variants: ProductVariant[] = [];
  const product_variant_attributes: ProductVariantAttribute[] = [];
  const product_variant_attribute_values: ProductVariantAttributeValue[] = [];

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #c9a961',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>
          {locale === 'tr' ? 'Ürünler yükleniyor...' :
            locale === 'ru' ? 'Загрузка продуктов...' :
              locale === 'pl' ? 'Ładowanie produktów...' :
                'Loading products...'}
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className={classes.searchContainer}>
        <div className={classes.searchWrapper}>
          <FaSearch className={classes.searchIcon} />
          <input
            type="text"
            className={classes.searchInput}
            placeholder={
              locale === 'tr' ? 'Desen no veya varyant ara...' :
                locale === 'ru' ? 'Поиск по номеру дизайна или варианту...' :
                  locale === 'pl' ? 'Szukaj według numeru wzoru lub wariantu...' :
                    'Search by design number or variant...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className={classes.clearButton}
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <ProductGrid
        products={allProducts}
        product_variants={product_variants}
        product_variant_attributes={product_variant_attributes}
        product_variant_attribute_values={product_variant_attribute_values}
        product_category="embroidery"
        product_category_description={
          locale === 'tr' ? 'Nakışlı şeffaf perde kumaşları - Lüks ev tekstili koleksiyonu' :
            locale === 'ru' ? 'Вышитые прозрачные ткани для штор - Роскошная коллекция домашнего текстиля' :
              locale === 'pl' ? 'Haftowane przezroczyste tkaniny zasłonowe - Luksusowa kolekcja tekstyliów domowych' :
                locale === 'de' ? 'Bestickte transparente Vorhangsstoffe - Luxuriöse Heimtextilien-Kollektion' :
                  'Embroidered sheer curtain fabrics - Luxury home textile collection'
        }
        searchParams={searchParams}
        locale={locale}
        initialDisplayCount={30}
      />
    </>
  );
}
