import React from 'react'
import classes from "./page.module.css"
import { prisma } from "@/lib/prisma";
import ProductGridNew from '@/components/ProductGridNew';

// This is a server component, so we can do async and database calls.
async function CurtainsReadyMade() {
  const products = await prisma.marketing_product.findMany({
    orderBy: {
      id: 'desc'
    }
  });
  return (
    <div className={classes.CurtainsReadyMadePage}>

      <h1>Hello This is the curtains ready made page.</h1>
      <p>The title of your product is:</p>
      {/* <p>{products?[0].title}</p> */}
      <ProductGridNew products={products}/>
    </div>
  )
}

export default CurtainsReadyMade