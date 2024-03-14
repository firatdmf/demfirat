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
  const ProductsLocale = useTranslations("Products")
  const sliderData = [
    {
      image: "/media/factory/karven-factory-building-exterior-resized.webp",
      heading: sliderLocale('heading_1'),
      desc: sliderLocale('desc_1'),
      obj_position: "bottom",
    },
    {
      image: "/media/embroideryCover.jpg",
      heading: sliderLocale('heading_2'),
      desc: sliderLocale('desc_2'),
      obj_position: "top",
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
        <ProductCategories Headline={ProductsLocale('Headline')} EmbroideredSheerCurtainFabrics={ProductsLocale('EmbroideredSheerCurtainFabrics')}/>
        {/* <p>{t('title')}</p> */}
        <div className="certifications">
          <p>Global Recycled Standard | NFPA 701 | GOTS | OEKO TEX</p>
        </div>
      </div>
    </main>
  );
}
