import classes from "@/components/ProductCardNew.module.css";
import { NextPage } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Decimal } from "@prisma/client/runtime/library";

// Importing Product interface from the parent.
import { Product } from '@/components/ProductGridNew';
// below is to be used later
// import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";



interface ProductCardNewProps {
  product: Product;
}


// const ProductCardNew: React.FC<ProductCardNewProps> = ({ product }) => {
async function ProductCardNew( {product} : ProductCardNewProps) {
  const productType = "embroidered_sheer_curtain_fabrics";
  // if (product.category === "uncategorized") {
  //   product.category = null;

  // }


  interface ProductCategoryObject{
    name:string
  }


  

  // Prisma fails to bring the foreignkey properties, so I did it raw.
  const product_category:ProductCategoryObject[] = await prisma.$queryRaw`select name from marketing_productcategory where id = ${product.category_id}`;

  const product_category_name = product_category[0].name
  // console.log(typeof(product_category[0].name));
  

  return (
    <div className={classes.ProductCardNew}>
      <Link
        href={"/products/curtains/ready_made/" + product.sku}
        className={classes.link}
      >
        <div className={classes.card}>
          <div className={classes.image}>
            <img
              src={
                "/image/product/" +
                product_category_name +"/" +
                product.sku + "/1337_grommets_displayed.jpg"
              }
              alt={
                "Image of the " +
                productType.replace(/_/g, " ") +
                " product: " +
                product.sku
              }
              key={product.id}
              height={500}
              width={500}
            />
          </div>
          {/* {product.category ? (

            <div className={classes.theme}>
              <b>{product.category}</b>
            </div>
          ) : (
            ""
          )} */}
          {/* <div className={classes.productName}>
            {product.sku}
          </div> */}
          <div className={classes.SKU}>{product.sku}</div>
          {/* {heartIcon} */}
          {/* <div className={classes.favorites}>Add to Favorites</div> */}
        </div>
      </Link>
    </div>
  );
};

export default ProductCardNew;
