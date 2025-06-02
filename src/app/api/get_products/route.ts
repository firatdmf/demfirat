import { NextResponse } from 'next/server';
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from '@/lib/prisma';

export interface Product {
  id: bigint;
  created_at: Date | null;
  title: string | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  tags: string[];
  category_id?: bigint | null;
  // category: String | null;
  type: string | null;
  price: Decimal | null;
  quantity: Decimal | null;
  unit_of_weight: string | null;
}

export interface ProductVariant {
  id: bigint;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_quantity: Decimal | null;
  variant_price: Decimal | null;
  variant_cost: Decimal | null;
  variant_featured: boolean | null;
  product_id: bigint | null;

}

export interface ProductVariantAttribute {
  id: bigint;
  name: string | null;

}

export interface ProductVariantAttributeValue {
  id: bigint;
  product_variant_attribute_value: string;
  product_id?: bigint | null;
  product_variant_attribute_id?: bigint | null;
  product_variant_id?: bigint | null;

}

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

interface Data {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request: Request) {
  let data: Data = {
    products: [],
    product_variants: [],
    product_variant_attributes: [],
    product_variant_attribute_values: [],
  }
  const products = await prisma.marketing_product.findMany({
    orderBy: {
      id: 'desc'
    },
    where: {
      featured: true
    }
  })
  const product_variants = await prisma.marketing_productvariant.findMany({

  })
  const product_variant_attributes = await prisma.marketing_productvariantattribute.findMany({

  })
  const product_variant_attribute_values = await prisma.marketing_productvariantattributevalue.findMany({

  })
  console.log("here comesss my friendd");
  console.log(product_variant_attribute_values);
  
  

  const product_files = await prisma.marketing_productfile.findMany({});

  // Group files by product_id
  const filesByProductId: { [key: string]: any[] } = {};
  product_files.forEach(file => {
    const key = file.product_id?.toString() ?? '';
    if (!filesByProductId[key]) filesByProductId[key] = [];
    filesByProductId[key].push(file);
  });

  const productsWithCover = products.map(product => {
    const files = filesByProductId[product.id.toString()] || [];
    // Pick the first file as cover, or null if none
    const coverImage = files.length > 0 ? files[0].file : null;
    return {
      ...product,
      coverImage,
    };
  });



  // console.log(product_variants);
  // console.log(product_variant_attributes);
  // data = {...products,...product_variants,...product_variant_attributes}
  // data["products"] = products
  data["products"] = productsWithCover;
  data["product_variants"] = product_variants
  data["product_variant_attributes"] = product_variant_attributes
  data["product_variant_attribute_values"] = product_variant_attribute_values
  // console.log(data);




  return NextResponse.json(data)
}