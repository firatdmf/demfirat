import classes from "./page.module.css"
import { prisma } from "@/lib/prisma";
import ProductGridNew from '@/components/ProductGridNew';
import { Decimal } from "@prisma/client/runtime/library";

import { Product } from '@/components/ProductGridNew';
import { ProductVariant } from '@/components/ProductGridNew';

// import { Category } from '@/components/ProductGridNew';
// import { ProductWithCategory } from '@/components/ProductGridNew';

// export interface ProductWithCategory extends Product {
//   marketing_productcategory: Category | null;
// }


// This is a server component, so we can do async and database calls.
async function CurtainsReadyMade() {
  const link = new URL(`${process.env.NEXTAUTH_URL}/api/get_products`);
  // const product_category:ProductVariant[] = await prisma.marketing_productvariant.findMany({})
  // console.log('your product category is:')
  // console.log(product_category);
  

  // const products: Product[] = await prisma.marketing_product.findMany({
  //   orderBy: {
  //     id: 'desc'
  //   },
  //   where: {
  //     featured: true
  //   },

  // });
  const response = await fetch(link);
  let products:Product[] = []
  if(response.ok){
    products = await response.json();
  }

  return (
    <div className={classes.CurtainsReadyMadePage}>

      <h1>Hello This is the curtains ready made page.</h1>
      <p>The title of your product is:</p>
      {/* <p>{products?[0].title}</p> */}
      <ProductGridNew products={products} />
    </div>
  )
}

export default CurtainsReadyMade