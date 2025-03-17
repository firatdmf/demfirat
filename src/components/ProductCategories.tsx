// "use client";
import classes from "./ProductCategories.module.css";
import Link from "next/link";
import Image from "next/image";
interface ProductCategoriesProps {
  Headline: string;
  EmbroideredSheerCurtainFabrics: string;
}
function ProductCategories({
  Headline,
  EmbroideredSheerCurtainFabrics,
}: ProductCategoriesProps) {
  let productCategories = [
    {
      name: "Curtains",
      link: "/product/curtain",
      imgLink: "/image/product/curtain/1337_grommets_displayed.avif",
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
        {productCategories.map((item, index) => {
          // console.log(item.imgLink);
          return (
            // Below link attributes makes the user start on top of the page when going to the link
            <Link
              href={item.link}
              className={classes.link}
              key={index}
              // onClick={() => {
              //   window.scroll(0, 0);
              // }}
            >
              <div className={classes.product}>
                <Image src={item.imgLink} alt={item.alt} width={500} height={500}/>
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
