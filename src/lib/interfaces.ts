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
}

export type ProductVariantAttribute = {
  id: bigint;
  name: string | null;
}

export type ProductVariantAttributeValue = {
  id: bigint;
  product_variant_attribute_value: string;
  product_variant_attribute_id: bigint | null;
  product_variant_id: bigint | null;
  product_id: bigint | null;
  // attribute_id:bigint | null;
}


export type ProductFile = {
  id: bigint;
  file: string;
  product_id: bigint | null;
  product_variant_id?: bigint | null;
}


export type ProductCategory = {
  id: bigint;
  name: string;
  created_at: Date;
  image: string | null;
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
  product_category:string;
  product_sku:string;
  product_title: string;
  description: string | null;
  quantity: Decimal;
  status: string;
  unit_of_measurement:string;
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
