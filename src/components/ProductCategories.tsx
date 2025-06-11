// "use client";
import classes from "./ProductCategories.module.css";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/lib/interfaces";
import { titleCase } from "@/lib/functions";
interface ProductCategoriesProps {
  Headline: string;
  // EmbroideredSheerCurtainFabrics: string;
  product_categories: ProductCategory[];
}
function ProductCategories({
  Headline,
  // EmbroideredSheerCurtainFabrics,
  product_categories
  // =
  // [
  // {
  //   id: 2,
  //   name: 'fabric',
  //   image: '/media/product_categories/fabric/fabric_category_image.avif'
  // },
  // {
  //   id: 1,
  //   name: 'curtain',
  //   image: '/media/product_categories/curtain/curtain_thumbnail.avif'
  // }
  // ]
}: ProductCategoriesProps) {
  let productCategories = [
    {
      name: "Curtains",
      link: "/product/curtain",
      imgLink: "/image/product/curtain/curtain_thumbnail.avif",
      alt: "Ready Made Curtain",
    },
    {
      // name: EmbroideredSheerCurtainFabrics,
      name: "Fabrics",
      link: "/product/fabrics/embroidery",
      imgLink: "/image/product/fabric/fabric_category_image.avif",
      alt: "Fabrics",
    },
    // {
    //   name: "Plain Sheer Fabrics",
    //   link: "#",
    //   imgLink: "/products/woven_sheer_fabrics/otto.jpg",
    //   alt: "Solid Sheer Fabrics",
    // },
    // {
    //   name: "Embroidered Sheer Bridal Fabrics",
    //   link: "#",
    //   imgLink: "products/embroidered_sheer_bridal_fabrics/FL_7016.jpg",
    //   alt: "Bridal Sheer Fabrics",
    // },
    // {
    //   name: "Ready-made Curtain Panels",
    //   link: "/Products/ready-made",
    //   // imgLink: "/products/ready-made/48061/K48061-cover-photo.jpg",
    //   imgLink:
    //     "/products/ready-made/72010/72010_champagne/Beige-dandelion-embroidery-sheer-curtain-model-72010-placed-curtain-rod-to-show-the-grommet-dimensions.jpg",
    //   alt: "Embroidered Sheer Fabrics",
    // },
  ];

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
          return product_category.name.toLowerCase() === "fabric" ? (
            <Link
              // href={"/products/" + product_category.name.toLowerCase()+"s"}
              href = {"/product/fabrics/embroidery"}
              className={classes.link}
              key={index}
            >
              <div className={classes.product}>
                {product_category.image ? (
                  <img
                    src={process.env.NEXT_PUBLIC_NEJUM_API_URL + product_category.image}
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
                {product_category.image ? (
                  <img
                    src={process.env.NEXT_PUBLIC_NEJUM_API_URL + product_category.image}
                    alt={product_category.name + " | product cover image."}
                    width={500}
                    height={500}
                  />
                ) : null}
              </div>
              <p className={classes.itemName}>{titleCase(product_category.name)}</p>
            </Link>
          );
        })}
      </div>
      <div className={classes.scallop_down}></div>
    </div>
  );
}

export default ProductCategories;
