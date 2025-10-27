import ProductGrid from "@/components/ProductGrid";
import fabricData from "@/vir_db/products_embroidered_sheer_curtain_fabrics.json";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces";

// Transform fabric data to Product interface format
const transformFabricToProduct = (fabric: any): Product => {
  return {
    id: fabric.design as any,
    pk: parseInt(fabric.design) || 0,
    sku: fabric.design,
    title: `Design ${fabric.design}`,
    description: `Embroidered sheer curtain fabric with design ${fabric.design}`,
    price: null, // Price will be shown after authentication
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

export default async function EmbroideryPage(props: PageProps<'/[locale]/product/fabrics/embroidery'>) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;

  // Transform fabric data to Product interface
  const products: Product[] = fabricData.map(transformFabricToProduct);

  // Mock data for variants (embroidery fabrics usually don't have variants)
  const product_variants: ProductVariant[] = [];
  const product_variant_attributes: ProductVariantAttribute[] = [];
  const product_variant_attribute_values: ProductVariantAttributeValue[] = [];

  return (
    <ProductGrid
      products={products}
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
  );
}
