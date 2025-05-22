import { GetServerSideProps } from 'next';
import ProductDetailCardNew from '@/components/ProductDetailCardNew';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from "@prisma/client/runtime/library";
import { marketing_product, marketing_productvariant, marketing_productvariantattribute, marketing_productvariantattributevalue } from '@prisma/client';

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

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
interface Data {
    product: Product;
    product_category: string | null;
    product_variants: ProductVariant[];
    product_variant_attributes: ProductVariantAttribute[];
    product_variant_attribute_values: ProductVariantAttributeValue[];
}



export async function GET(request: Request) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');


    console.time('measuredo')
    const product = await prisma.marketing_product.findFirst({
        where: {
            sku: sku
        }
    });

    if (product) {
        let data: Data = {
            product: product,
            product_category: "",
            product_variants: [],
            product_variant_attributes: [],
            product_variant_attribute_values: [],
        }


        const product_category = await prisma.marketing_productcategory.findUniqueOrThrow({
            where: {
                id: Number(product.category_id)
            }
        })
        const product_variants = await prisma.marketing_productvariant.findMany({
            where: {
                product_id: product.id
            }
        })

        if (product_variants) {
            // const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany())
            const product_variant_attribute_values = await prisma.marketing_productvariantattributevalue.findMany({
                where: {
                    product_id: product.id
                }
            })
            // const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany()).filter((item)=>item)

            // let data ={}
            // data["product"] = product

            // console.log(product_variant_attribute_values);

            // Filter attributes based on attribute_values
            const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany()).filter(attribute =>
                product_variant_attribute_values.some(attribute_value => attribute_value.product_variant_attribute_id === attribute.id)
            );
            // console.log(product_variant_attributes);

            data["product"] = product
            data["product_category"] = product_category.name
            data["product_variants"] = product_variants
            data["product_variant_attributes"] = product_variant_attributes
            data["product_variant_attribute_values"] = product_variant_attribute_values.map(val => ({
                ...val,
                value: val.product_variant_attribute_value
            }));
            // console.log(data);

            console.timeEnd('measuredo')
            return NextResponse.json(data)






        }
    } else {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // console.log(product)

}