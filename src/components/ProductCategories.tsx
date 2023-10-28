"use client";
import classes from "./ProductCategories.module.css";
import Link from "next/link";
import db from "@/vir_db/db.js";
function ProductCategories() {
  let productCategories = [
    // {
    //   name: "Read-made Curtains",
    //   link: "#",
    //   imgLink: "/images/ready-made/1337/1337_white/1337_grommets_displayed.jpg",
    //   alt: "Ready Made Curtain",
    // },
    {
      name: "Embroidered Sheer Curtain Fabrics",
      link: "/products/fabrics/embroidery",
      imgLink: "/products/kirat/8159.jpg",
      alt: "Embroidered Sheer Fabrics",
    },
    {
      name: "Plain Sheer Fabrics",
      link: "#",
      imgLink: "/products/woven_sheer_fabrics/otto.jpg",
      alt: "Solid Sheer Fabrics",
    },
    {
      name: "Embroidered Sheer Bridal Fabrics",
      link: "#",
      imgLink: "products/embroidered_sheer_bridal_fabrics/FL_7016.jpg",
      alt: "Bridal Sheer Fabrics",
    },
    {
      name: "Ready-made Curtain Panels",
      link: "/Products/ready-made",
      // imgLink: "/products/ready-made/48061/K48061-cover-photo.jpg",
      imgLink:
        "/products/ready-made/72010/72010_champagne/Beige-dandelion-embroidery-sheer-curtain-model-72010-placed-curtain-rod-to-show-the-grommet-dimensions.jpg",
      alt: "Embroidered Sheer Fabrics",
    },
  ];

  return (
    <div className={classes.ProductCategoriesPage}>
      <div className={classes.scallop_up}></div>
      <h2 className={classes.componentTitle}>PRODUCTS</h2>
      <div className={classes.container}>
        {productCategories.map((item, index) => {
          return (
            // Below link attributes makes the user start on top of the page when going to the link
            <Link
              href={item.link}
              className={classes.link}
              key={index}
              onClick={() => {
                window.scroll(0, 0);
              }}
            >
              <div className={classes.product}>
                <img src={item.imgLink} alt={item.alt} />
              </div>
              <p className={classes.itemName}>{item.name}</p>
            </Link>
          );
        })}
      </div>
      <div className={classes.scallop_down}></div>
    </div>
  );
}

export default ProductCategories;
