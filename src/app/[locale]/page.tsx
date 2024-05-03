import Image from "next/image";
import React from "react";
import "./page.css";
import Slider from "@/components/slider/Slider";
import ProductCategories from "@/components/ProductCategories";
// below is irrelevant
// import { getDictionary } from "@/app/[locale]/dictionaries/dictionaries";
import { useTranslations } from "next-intl";
// export default async function Home({params:{lang}}) {
export default function Home() {
  // below code gives not found error when invalid parameter is provided: http://demfirat.com/asdsadsad
  const sliderLocale = useTranslations("Slider");
  const ProductsLocale = useTranslations("Products");
  const sliderData = [
    {
      image: "/media/factory/schiffli-embroidery-3.jpg",
      heading: sliderLocale("heading_2"),
      desc: sliderLocale("desc_2"),
      obj_position: "top",
    },
    {
      image: "/media/factory/flatboard-embroidery-closeup.jpg",
      heading: sliderLocale("heading_3"),
      desc: sliderLocale("desc_3"),
      obj_position: "top",
    },
    {
      image: "/media/factory/Karven_Tekstil_Factory-Exterior3_edited.jpg",
      heading: sliderLocale("heading_1"),
      desc: sliderLocale("desc_1"),
      obj_position: "bottom",
    },
  ];

  return (
    <main>
      <div className="HomePage">
        <div className="Home">
          <div className="slider">
            <Slider sliderData={sliderData} />
          </div>
        </div>
        <ProductCategories
          Headline={ProductsLocale("Headline")}
          EmbroideredSheerCurtainFabrics={ProductsLocale(
            "EmbroideredSheerCurtainFabrics"
          )}
        />
        {/* <p>{t('title')}</p> */}
        <div className="certifications">
          <b>
            <p>Global Recycled Standard | NFPA 701 | GOTS | OEKO TEX</p>
          </b>
        </div>
      </div>
    </main>
  );
}
