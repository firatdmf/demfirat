import classes from "./page.module.css"
import { prisma } from "@/lib/prisma";
import ProductGridNew from '@/components/ProductGridNew';
import { Decimal } from "@prisma/client/runtime/library";

import { Product } from '@/components/ProductGridNew';
import { ProductVariant } from '@/components/ProductGridNew';
import { ProductVariantAttributeValue } from "@/components/ProductGridNew";

// import { Category } from '@/components/ProductGridNew';
// import { ProductWithCategory } from '@/components/ProductGridNew';

// export interface ProductWithCategory extends Product {
//   marketing_productcategory: Category | null;
// }



// This is a server component, so we can do async and database calls.
async function CurtainsReadyMade() {
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
  const api_link = new URL(`${process.env.NEXTAUTH_URL}/api/get_products`);
  const response = await fetch(api_link);
  let data
  let products:Product[] = []
  let product_variants:ProductVariant[] = []
  let product_variant_attribute_values:ProductVariantAttributeValue[] = []
  if(response.ok){
    data = await response.json();
    products = data.products
    product_variants = data.product_variants
    product_variant_attribute_values = data.product_variant_attribute_values
  }
  

  // ------------------------------------------------------------------------------------------------
  // Below is an api call to our django application
  
  // const django_api_link = new URL(`${process.env.DJANGO_URL}/marketing/api/get_products`);
  // const django_response = await fetch(django_api_link)
  // let django_products
  // if(django_response.ok){
    //   django_products = await django_response.json()
    //   console.log('your django response is: ')
    //   console.log(django_products);
    
    // }else{
      //   console.log("django api call is not ok")
      // }
      
  // ------------------------------------------------------------------------------------------------
  return (
    <div className={classes.CurtainsReadyMadePage}>

      {/* <p>{products?[0].title}</p> */}
      <ProductGridNew products={products} product_variants={product_variants} product_variant_attribute_values = {product_variant_attribute_values} />
    </div>
  )
}

export default CurtainsReadyMade