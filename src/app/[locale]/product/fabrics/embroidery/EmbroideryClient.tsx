"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, SearchParams } from "@/lib/interfaces";

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
    primary_image: fabric.files?.[0] ? `/media/products/embroidered_sheer_curtain_fabrics/thumbnails/${fabric.files[0].name}` : undefined,
    created_at: new Date(fabric.date || Date.now())
  };
};

export default function EmbroideryClient({ locale, searchParams }: EmbroideryClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [fabricData, setFabricData] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 30;

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

  // Process all products only when data is loaded
  const allProducts = useMemo(() => {
    if (fabricData.length === 0) return [];
    
    const products: Product[] = fabricData.map(transformFabricToProduct);
    
    // Remove duplicate products by SKU (keep first occurrence)
    const uniqueProducts: Product[] = Array.from(
      new Map(products.map(product => [product.sku, product])).values()
    );
    
    console.log(`[EMBROIDERY] Total: ${products.length}, Unique: ${uniqueProducts.length}`);
    return uniqueProducts;
  }, [fabricData]);

  // Load initial products and handle pagination
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    const startIndex = 0;
    const endIndex = page * PRODUCTS_PER_PAGE;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    setDisplayedProducts(newProducts);
    setHasMore(endIndex < allProducts.length);
  }, [allProducts, page]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore) return;
      
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Trigger when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        setIsLoadingMore(true);
        
        // Simulate loading delay
        setTimeout(() => {
          setPage(prev => prev + 1);
          setIsLoadingMore(false);
        }, 500);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore]);

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
        <p style={{ color: '#666', fontSize: '16px' }}>Loading products...</p>
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
      <ProductGrid
        products={displayedProducts}
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
      />
      
      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && (
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
        </div>
      )}
      
      {/* End of products message */}
      {!hasMore && displayedProducts.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666',
          fontSize: '16px',
          fontFamily: 'var(--font-body, \'Montserrat\', sans-serif)'
        }}>
          {locale === 'tr' ? 'Tüm ürünler yüklendi' :
           locale === 'ru' ? 'Все товары загружены' :
           locale === 'pl' ? 'Wszystkie produkty załadowane' :
           locale === 'de' ? 'Alle Produkte geladen' :
           'All products loaded'}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
