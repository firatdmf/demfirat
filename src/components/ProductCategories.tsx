// "use client";
import classes from "./ProductCategories.module.css";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/lib/interfaces";
import { titleCase } from "@/lib/functions";
interface ProductCategoriesProps {
  Headline: string;
  product_categories: ProductCategory[];
}
function ProductCategories({
  Headline,
  // [
  // {
  //   pk: 1,
  //   name: 'curtain',
  //   image_url: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1749961086/curtain_thumbnail_qrff0f.avif'
  // },
  // {
  //   pk: 2,
  //   name: 'fabric',
  //   image_url: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1749961112/fabric_category_image_ixm9ts.avif'
  // }
  // ]
  product_categories
}: ProductCategoriesProps) {

  return (
    <div className={classes.ProductCategoriesPage}>
      <div className={classes.scallop_up}></div>
      <h2 className={classes.componentTitle}>{Headline}</h2>
      <div className={classes.container}>
        {(product_categories ?? []).map((product_category, index) => {
          // console.log(item.imgLink);

          // fabric category was created manually and is complex, so we created it like this.
          // any other category is printed normally.
          // when you add woven fabrics in future, you may change it here.
          return (product_category.name.toLowerCase() === "fabric" ? (
            <Link
              // href={"/products/" + product_category.name.toLowerCase()+"s"}
              href={"/product/fabrics/embroidery"}
              className={classes.link}
              key={index}
            >
              <div className={classes.product}>
                {product_category.image_url ? (
                  <img
                    src={product_category.image_url}
                    alt={product_category.name + " | product cover image."}
                    width={500}
                    height={500}
                  />
                ) : null}
              </div>
              <p className={classes.itemName}>{titleCase(product_category.name)}</p>
            </Link>
          ) : (
            <Link
              href={"/product/" + product_category.name.toLowerCase()}
              className={classes.link}
              key={index}
            >
              <div className={classes.product}>
                {product_category.image_url ? (
                  <img
                    src={product_category.image_url}
                    alt={product_category.name + " | product cover image."}
                    width={500}
                    height={500}
                  />
                ) : null}
              </div>
              <p className={classes.itemName}>{titleCase(product_category.name)}</p>
            </Link>
          ));
        })}
      </div>
      <div className={classes.scallop_down}></div>
    </div>
  );
}

export default ProductCategories;
