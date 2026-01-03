import { Decimal } from "@prisma/client/runtime/library";


// below are for produc interfaces
// ----------------------------------------------------------------------
export type Product = {
  id: bigint;
  pk: number;
  created_at: Date;
  title: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  tags: String[] | null;
  type: string | null;
  unit_of_measurement: string | null;
  quantity: Decimal | null;
  available_quantity: Decimal | null;  // Available stock in cm for curtain fabrics
  price: number | null;
  featured: boolean;
  selling_while_out_of_stock: boolean;
  weight: Decimal | null;
  unit_of_weight: string | null;
  category_id: bigint | null;
  supplier_id: bigint | null;
  // has_variants: boolean | null;
  datasheet_url: string | null;
  minimum_inventory_level: Decimal | null;
  primary_image?: string;
  product_attributes?: ProductAttribute[] | null;  // Product-level attributes including discount_rate

}

export type Product_API = {
  model: string;
  pk: number;
  fields: Product;
}


export type ProductVariant = {
  id: bigint;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_quantity: Decimal | null;
  variant_price: Decimal | null;
  variant_cost: Decimal | null;
  variant_featured: boolean | null;
  product_id: bigint | null;
  primary_image?: string;
  product_variant_attribute_values: bigint[];
}

export type ProductVariantAttribute = {
  id: bigint;
  name: string | null;
}

export type ProductVariantAttributeValue = {
  variants: any;
  id: bigint;
  product_variant_attribute_value: string;
  product_variant_attribute_id: bigint | null;
  product_variant_id: bigint | null;
  product_id: bigint | null;
  // attribute_id:bigint | null;
}

export type ProductAttribute = {
  id: bigint;
  name: string;
  value: string;
  sequence: number;
  variant_id?: bigint; // Only for variant attributes
}


export type ProductFile = {
  id: bigint;
  file: string;
  product_id: bigint | null;
  product_variant_id?: bigint | null;
  sequence?: number | null;
}


export type ProductCategory = {
  pk: bigint;
  name: string;
  description: string | null;
  created_at: Date;
  image_url: string | null;
}
// ----------------------------------------------------------------------
// this is for order interfaces
export type Order = {
  id: bigint;
  status: string;
  created_at: Date;
  updated_at: Date;
  items: OrderItem[];
}

export type OrderItem = {
  id: bigint;
  product_category: string;
  product_sku: string;
  product_title: string;
  product_image?: string | null;
  description: string | null;
  quantity: Decimal;
  status: string;
  unit_of_measurement: string;
  // Custom Curtain Fields
  is_custom_curtain?: boolean;
  custom_fabric_used_meters?: string | null;
  custom_attributes?: {
    mounting_type?: string | null;
    pleat_type?: string | null;
    pleat_density?: string | null;
    width?: string | null;
    height?: string | null;
    wing_type?: string | null;
  } | null;
}

// ----------------------------------------------------------------------

export type SearchParams = {
  [key: string]: string | string[] | undefined;
}

export type PageParamProps = {
  params: {
    sku: string
  }
  searchParams: { [key: string]: string | string[] | undefined };
}
