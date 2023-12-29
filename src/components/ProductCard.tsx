import classes from "@/components/ProductCard.module.css";
import { NextPage } from "next";
import Link from "next/link";
// below is to be used later
// import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";

interface Props {
  product:any,
}

const ProductCard: NextPage<Props> = (props) => {
  const { product } = props;
  return (
    <div className={classes.ProductCardComponent}>
      <Link
        href={"/products/fabrics/embroidery/" + product.design}
        className={classes.link}
      >
        <div className={classes.card}>
          <div className={classes.image}>
            <img
              src={"/products/embroidered_sheer_curtain_fabrics/"+product.files[0].name}
              alt={"Image of the product: " + product.name}
              key={product.files[0].name}
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
