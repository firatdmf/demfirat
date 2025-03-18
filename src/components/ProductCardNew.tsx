"use client"
import classes from "@/components/ProductCardNew.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Decimal } from "@prisma/client/runtime/library";
// used to get the url from the browser
import { usePathname } from 'next/navigation'

// Importing Product interface from the parent.
import { Product } from '@/components/ProductGridNew';
import { useSession } from "next-auth/react";
// below is to be used later
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";



interface ProductCardNewProps {
  product: Product;
}

interface ProductCategory {
  name: string;
}


// const ProductCardNew: React.FC<ProductCardNewProps> = ({ product }) => {
function ProductCardNew({ product }: ProductCardNewProps) {

  // Check if the user is logged in. If they are then display price.
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user not authenticated, handle here
      console.log("Not logged in!: " + status);
    },
  });





  // // Prisma fails to bring the foreignkey properties, so I did it raw.
  // const product_category:any[] = await prisma.$queryRaw`select name from marketing_productcategory where id = ${product.category_id}`;

  //   const product_category: ProductCategory[] = await prisma.$queryRaw`
  //   SELECT name 
  //   FROM marketing_productcategory 
  //   WHERE id = CAST(${product.category_id} AS bigint)
  // `;
  //   const product_category_name = product_category[0]?.name || "unknown";


  const pathname = usePathname()
  // product/curtain => curtain
  let product_category_name = pathname.split("/").at(-1);
  // let product_category_name = product.category_id



  return (
    <div className={classes.ProductCardNew}>
      <Link
        href={product_category_name + "/" + product.sku}
        className={classes.link}
      >
        <div className={classes.card}>
          <div className={classes.image}>
            <img
              src={
                "/image/product/" +
                product_category_name + "/" +
                product.sku + "/" + product.sku + "_thumbnail.avif"
              }
              alt={
                "Image of the " +
                product_category_name?.replace(/_/g, " ") +
                " product: " +
                product.sku
              }
              key={product.id}
            />
          </div>
          {/* {product_category_name ? (

            <div className={classes.theme}>
              <b>{product_category_name}</b>
            </div>
          ) : (
            ""
          )} */}
          {/* <div className={classes.productName}>
            {product.sku}
          </div> */}
          <div className={classes.title}><b>{product.title}</b></div>
          <div className={classes.SKU}>{product.sku}</div>
          {status === "authenticated" && product.price ?
            <div className={classes.price}>${String(product.price)}</div> : <></>
          }
          <BsSuitHeart />
          {/* <div className={classes.favorites}>Add to Favorites</div> */}
        </div>
      </Link >
    </div >
  );
};

export default ProductCardNew;
