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

export async function GET(request: Request){
    const products = await prisma.marketing_product.findMany({
        orderBy: {
            id: 'desc'
          },
          where:{
            featured: true
          }
    })
    console.log(products);
    
    return NextResponse.json(products)
}