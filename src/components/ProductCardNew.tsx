import classes from "@/components/ProductCardNew.module.css";
import { NextPage } from "next";
import Link from "next/link";
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
function ProductCardNew( {product} : ProductCardNewProps) {
  const productType = "embroidered_sheer_curtain_fabrics";
  if (product.category === "uncategorized") {
    product.category = null;

  }

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
                "/media/products/" +
                productType +
                "/thumbnails/" +
                "1797T_G209.webp"
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
          {product.category ? (

            <div className={classes.theme}>
              <b>{product.category}</b>
            </div>
          ) : (
            ""
          )}
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
