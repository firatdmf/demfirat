"use client";

import classes from "./ProductCategories.module.css";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/lib/interfaces";
import { titleCase } from "@/lib/functions";
interface ProductCategoriesProps {
  Headline: string;
  product_categories: ProductCategory[];
  locale?: string;
}
function ProductCategories({
  Headline,
  product_categories,
  locale = 'en'
}: ProductCategoriesProps) {

  const getCategoryDescription = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name === 'curtain') {
      return locale === 'tr' ? 'Lüks perde koleksiyonu - Evinizi zarafetle süsleyin' :
        locale === 'ru' ? 'Роскошная коллекция штор - украсьте свой дом элегантностью' :
          locale === 'pl' ? 'Luksusowa kolekcja zasłon - ozdobić dom elegancją' :
            locale === 'de' ? 'Luxuriöse Vorhang-Kollektion - schmücken Sie Ihr Zuhause mit Eleganz' :
              'Luxury curtain collection - Decorate your home with elegance';
    } else if (name === 'fabric') {
      return locale === 'tr' ? 'Nakışlı kumaş koleksiyonu - Her detayda sanat eseri' :
        locale === 'ru' ? 'Коллекция вышитых тканей - произведение искусства в каждой детали' :
          locale === 'pl' ? 'Kolekcja haftowanych tkanin - dzieło sztuki w każdym detalu' :
            locale === 'de' ? 'Bestickte Stoffkollektion - Kunstwerk in jedem Detail' :
              'Embroidered fabric collection - Artwork in every detail';
    }
    return '';
  };
  // just a comment
  return (
    <div className={classes.ProductCategoriesPage}>
      {Headline && <h2 className={classes.componentTitle}>{Headline}</h2>}
      <div className={classes.container}>
        {(product_categories ?? []).map((product_category, index) => {
          const href = product_category.name.toLowerCase() === "fabrics" ?
            "/product/fabric" :
            "/product/" + product_category.name.toLowerCase();

          return (
            <Link
              href={href}
              className={classes.link}
              key={index}
            >
              <div className={classes.categoryCard}>
                <div className={classes.imageContainer}>
                  {product_category.image_url ? (
                    <img
                      src={product_category.image_url}
                      alt={product_category.name + " | product cover image."}
                      className={classes.categoryImage}
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className={classes.placeholderImage}>
                      <span>{titleCase(product_category.name)}</span>
                    </div>
                  )}
                </div>
                <div className={classes.categoryInfo}>
                  <h3 className={classes.categoryName}>{titleCase(product_category.name)}</h3>
                  <p className={classes.categoryDescription}>
                    {getCategoryDescription(product_category.name)}
                  </p>
                  <div className={classes.exploreLink}>
                    {locale === 'tr' ? 'Koleksiyonu Keşfet' :
                      locale === 'ru' ? 'Исследовать коллекцию' :
                        locale === 'pl' ? 'Poznaj kolekcję' :
                          locale === 'de' ? 'Kollektion entdecken' :
                            'Explore Collection'}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ProductCategories;
