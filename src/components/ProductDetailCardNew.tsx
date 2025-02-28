"use client";
import React, { useEffect, useState } from 'react';
import classes from "./ProductDetailCardNew.module.css"
import { prisma } from "@/lib/prisma";
// import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation'
import { Decimal } from '@prisma/client/runtime/library';
import { Product } from '@/components/ProductGridNew';
// interface Product {
//   id: bigint;
//   created_at: Date;
//   title: string | null;
//   description: string | null;
//   sku: string | null;
//   barcode: string | null;
//   tags: string[];
//   category: string | null;
//   type: string | null;
//   price: Decimal | null;
//   quantity: Decimal | null;
//   // unit_of_weight: string;
// }

interface ProductDetailCardNewProps {
  product:Product
}





async function ProductDetailCardNew({product}:ProductDetailCardNewProps) {
  // const pathname = usePathname() // /products/curtains/ready-made/RK24562GW
  // const sku = pathname.split('/')[4]
  // const [product, setProduct] = useState<Product | null>(null);
  // useEffect(()=>{
  //   async function fetchProduct(){
  //     console.log('now sending a fetch request!!!!!!!!!');
      
  //     const response = await fetch(`http://localhost:3000/api/get_product?sku=${sku}`)
  //     console.log(`your response is: ${response}`);
      
  //     const fetchedProduct: Product = await response.json();
  //     setProduct(fetchedProduct)
  //   }
  //   fetchProduct();

  // },[sku]);

  if (!product) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className={classes.ProductDetailCardNew}>
      <p>Your object found is: {product.title}</p>
    </div>
  )
}

export default ProductDetailCardNew