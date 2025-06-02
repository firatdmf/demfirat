import classes from "./page.module.css"
import { prisma } from "@/lib/prisma";
import ProductGrid from '@/components/ProductGrid';
import { Decimal } from "@prisma/client/runtime/library";

import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from '@/lib/interfaces';
// import { ProductVariant } from '@/components/ProductGrid';
// import { ProductVariantAttribute } from "@/components/ProductGrid";
// import { ProductVariantAttributeValue } from "@/components/ProductGrid";
import { usePathname } from "next/navigation";

// import { Category } from '@/components/ProductGridNew';
// import { ProductWithCategory } from '@/components/ProductGridNew';

// export interface ProductWithCategory extends Product {
//   marketing_productcategory: Category | null;
// }



// This is a server component, so we can do async and database calls.
// passing the url parameters alsoto passed over to the productgrid page
async function CurtainsReadyMade({ searchParams, }: { searchParams: { [key: string]: string | string[] | undefined }; }) {
  // console.log("your search params are: " + JSON.stringify(searchParams));

  // const pathname = usePathname()
  // console.log("your pathname is: " + pathname);
  // let product_category_name = pathname.split("/").at(-1)?.split("?")[0];
  // console.log("the product category name is: " + product_category_name);
  const product_category_name = "curtain";



  // const products: Product[] = await prisma.marketing_product.findMany({
  //   orderBy: {
  //     id: 'desc'
  //   },
  //   where: {
  //     featured: true
  //   },

  // });


  console.time('doSomething')
  const api_link = new URL(`${process.env.NEXTAUTH_URL}/api/get_products`);

  const response = await fetch(api_link);
  let data
  let products: Product[] = []
  let product_variants: ProductVariant[] = []
  let product_variant_attributes: ProductVariantAttribute[] = []
  let product_variant_attribute_values: ProductVariantAttributeValue[] = []
  if (response.ok) {
    data = await response.json();
    products = data.products
    product_variants = data.product_variants
    product_variant_attributes = data.product_variant_attributes
    product_variant_attribute_values = data.product_variant_attribute_values
  }
  console.timeEnd('doSomething')

  // ------------------------------------------------------------------------------------------------
  // Below is an api call to our django application
  // console.time('doSomethingElse')
  // const django_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_products_grid`);
  // const django_response = await fetch(django_api_link)
  // let django_data;
  // if (django_response.ok) {
  //   django_data = await django_response.json()
  //   console.log('your django response is: ')
  //   console.log(django_data);

  // } else {
  //   console.log("django api call is not ok")
  // }
  // console.timeEnd('doSomethingElse')

  // ------------------------------------------------------------------------------------------------
  return (
    <div className={classes.CurtainsReadyMadePage}>

      {/* <p>{products?[0].title}</p> */}
      {/* <ProductGrid products={django_products} product_variants={product_variants} product_variant_attributes={product_variant_attributes} product_variant_attribute_values={product_variant_attribute_values} searchParams={searchParams} /> */}
      <ProductGrid products={products} product_variants={product_variants} product_variant_attributes={product_variant_attributes} product_variant_attribute_values={product_variant_attribute_values} searchParams={searchParams} />
    </div>
  )
}

export default CurtainsReadyMade