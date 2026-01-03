import React from "react";
import "./page.css";
import HeroVideo from "@/components/HeroVideo";
import ProductShowcase from "@/components/ProductShowcase";
import AutoSlider from "@/components/AutoSlider";
import DraggableTestimonials from "@/components/DraggableTestimonials";
import CustomCurtainPromo from "@/components/CustomCurtainPromo";
// below is irrelevant
// import { getDictionary } from "@/app/[locale]/dictionaries/dictionaries";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ProductCategory } from "@/lib/interfaces";
// export default async function Home({params:{lang}}) {
export default async function Home(props: PageProps<'/[locale]'>) {
  // below code gives not found error when invalid parameter is provided: http://demfirat.com/asdsadsad
  // const sliderLocale = await getTranslations("Slider");
  // const ProductsLocale = await getTranslations("Products");
  const { locale } = await props.params;
  console.log("your locale is", locale);

  const sliderLocale = await getTranslations({ locale, namespace: "Slider" });
  const productsLocale = await getTranslations({ locale, namespace: "Products" });

  // This is for fetching product categories from Backend API
  const get_product_categories_API_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_categories`);
  let product_categories: ProductCategory[] = [];
  try {
    const get_product_categories_response = await fetch(get_product_categories_API_link, { next: { revalidate: 300 } });
    const contentType = get_product_categories_response.headers.get('content-type') || '';
    if (!get_product_categories_response.ok || !contentType.includes('application/json')) {
      const body = await get_product_categories_response.text();
      console.error('get_product_categories failed:', get_product_categories_response.status, body.slice(0, 300));
    } else {
      product_categories = await get_product_categories_response.json();
    }
  } catch (err) {
    console.error('get_product_categories exception:', err);
  }


  const slickSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };
  const sliderData = [
    {
      image: "/media/factory/schiffli-embroidery-3.webp",
      heading: sliderLocale("heading_2"),
      desc: sliderLocale("desc_2"),
      obj_position: "top",
    },
    {
      image: "/media/factory/flatboard-embroidery-closeup.webp",
      heading: sliderLocale("heading_3"),
      desc: sliderLocale("desc_3"),
      obj_position: "top",
    },
    {
      image: "/media/factory/Karven_Tekstil_Factory-Exterior3_edited.webp",
      heading: sliderLocale("heading_1"),
      desc: sliderLocale("desc_1"),
      obj_position: "bottom",
    },
  ];

  const homeReviewsLocale = await getTranslations({ locale, namespace: "HomeReviews" });

  const reviews = [
    {
      image: "/media/client-images/iris.webp",
      name: "Iris",
      review: homeReviewsLocale("review_1_text"),
    },
    {
      image: "/media/client-images/jeanmarie.webp",
      name: "Jeanmarie",
      review: homeReviewsLocale("review_2_text"),
    },
    {
      image: "/media/client-images/mary.webp",
      name: "Mary",
      review: homeReviewsLocale("review_3_text"),
    },
    {
      image: "/media/client-images/meredith.webp",
      name: "Meredith",
      review: homeReviewsLocale("review_4_text"),
    },
    {
      image: "/media/client-images/maria.jpg",
      name: "Maria",
      review: homeReviewsLocale("review_5_text"),
    },
    {
      image: "/media/client-images/jane.webp",
      name: "Jane",
      review: homeReviewsLocale("review_6_text"),
    },
    {
      image: "/media/client-images/ava.webp",
      name: "Ava",
      review: homeReviewsLocale("review_7_text"),
    },
  ];

  return (
    <main>
      <div className="HomePage">
        <HeroVideo
          videoSrc="/media/hero-video.mp4"
          subtitle={locale === 'tr' ? 'Premium Tekstil Koleksiyonu' :
            locale === 'ru' ? 'Премиальная текстильная коллекция' :
              locale === 'pl' ? 'Kolekcja Premium Tekstyliów' :
                'Premium Textile Collection'}
          title={locale === 'tr' ? 'Zarafet Nakışla Buluşuyor' :
            locale === 'ru' ? 'Где элегантность встречается с вышивкой' :
              locale === 'pl' ? 'Gdzie elegancja spotyka haft' :
                'Where Elegance Meets Embroidery'}
          locale={locale}
          showCatalogButton={false}
        />
        <CustomCurtainPromo locale={locale} />
        <ProductShowcase
          title={productsLocale("Headline")}
          locale={locale}
        />
        <AutoSlider locale={locale} />
        <DraggableTestimonials reviews={reviews} locale={locale} />
      </div>
    </main>
  );
}
