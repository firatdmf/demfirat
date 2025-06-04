import { GetServerSideProps } from 'next';
import ProductDetailCardNew from '@/components/ProductDetailCard';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from "@prisma/client/runtime/library";
import { ProductFile } from '@/lib/interfaces';
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
    product_images: ProductFile[];
}



export async function GET(request: Request) {
    BigInt.prototype.toJSON = function () {
        return this.toString();
    };
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    let product: Product | null = null;

    if (!sku) {
        return NextResponse.json({ message: "SKU is required" }, { status: 400 });
    } else {
        product = await prisma.marketing_product.findUnique({
            where: { sku: sku }
        });
    }
    console.time('measuredo')


    if (product) {
        // console.log("the product you fetched is");
        // console.log(product);
        let data: Data = {
            product: product,
            product_category: "",
            product_variants: [],
            product_variant_attributes: [],
            product_variant_attribute_values: [],
            product_images: [],
        }


        const product_category_record = await prisma.marketing_productcategory.findUnique({
            where: {
                id: Number(product.category_id)
            }
        })



        let product_category = "";
        if (!product_category_record) {
            console.warn(`Category with id ${product.category_id} does not exist in the database.`);
        } else {
            product_category = product_category_record.name ?? "";
        }
        const product_variants = await prisma.marketing_productvariant.findMany({
            where: {
                product_id: product.id,
                // variant_featured: true,
            }
        })

        if (product_variants) {
            // const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany())
            const product_variant_attribute_values = await prisma.marketing_productvariantattributevalue.findMany({
                where: {
                    product_id: product.id
                }
            })

            const product_images = await prisma.marketing_productfile.findMany({
                where: {
                    product_id: product.id
                }
            })
            // console.log("here it comes my friend: ");
            // console.log("--------------------------------------------------------------------");
            // console.log(product_variant_attribute_values);
            // product_variant_attribute_values = [
            //     {
            //         id: 329n,
            //         product_variant_attribute_value: 'black',
            //         product_variant_attribute_id: 1n,
            //         product_variant_id: 12n,
            //         product_id: 14n
            //     },
            //     {
            //         id: 330n,
            //         product_variant_attribute_value: 'blue',
            //         product_variant_attribute_id: 1n,
            //         product_variant_id: 9n,
            //         product_id: 14n
            //     }
            // ]
            // console.log("--------------------------------------------------------------------");
            // const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany()).filter((item)=>item)

            // let data ={}
            // data["product"] = product

            // console.log(product_variant_attribute_values);

            // Filter attributes based on attribute_values
            const product_variant_attributes = (await prisma.marketing_productvariantattribute.findMany()).filter(attribute =>
                product_variant_attribute_values.some(attribute_value => attribute_value.product_variant_attribute_id === attribute.id)
            );


            data["product"] = product
            data["product_category"] = product_category
            data["product_variants"] = product_variants
            data["product_variant_attributes"] = product_variant_attributes
            data["product_variant_attribute_values"] = product_variant_attribute_values.map(val => ({
                ...val,
                value: val.product_variant_attribute_value
            }));
            data["product_images"] = product_images
            // console.log(data);

            console.timeEnd('measuredo')
            return NextResponse.json(data)






        }
    } else {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // console.log(product)

}