import classes from "@/components/ProductCard.module.css";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
// below is to be used later
// import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";

interface Props {
  product:any,
}

const ProductCard: NextPage<Props> = (props) => {
  const { product } = props;
  const productType = "embroidered_sheer_curtain_fabrics"
  return (
    <div className={classes.ProductCardComponent}>
      <Link
        href={"/products/fabrics/embroidery/" + product.design}
        className={classes.link}
      >
        <div className={classes.card}>
          <div className={classes.image}>
            <Image
              src={"/products/"+productType+"/thumbnails/"+product.files[0].name}
              alt={"Image of the "+productType.replace(/_/g,' ') + " product: " + product.design}
              key={product.files[0].name}
              // If the thumbnail does not exist, or broken that display the original image instead
              onError={({currentTarget})=>{currentTarget.onerror=null;currentTarget.src=currentTarget.src.replace('/thumbnails','')}}
            />
          </div>
          {product.theme ? (
            <div className={classes.theme}>
              <b>{product.theme}</b>
            </div>
          ) : (
            ""
          )}
          <div className={classes.productName}>{product.prefix}{product.design}</div>
          <div className={classes.SKU}>{product.sku}</div>
          {/* {heartIcon} */}
          {/* <div className={classes.favorites}>Add to Favorites</div> */}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
