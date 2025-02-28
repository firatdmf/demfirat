import { GetServerSideProps } from 'next';
import ProductDetailCardNew from '@/components/ProductDetailCardNew';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');

    const product = await prisma.marketing_product.findFirst({
        where: {
            sku: sku
        }
    });
    console.log(product)

    return NextResponse.json(product)

}