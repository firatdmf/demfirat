import React from "react";
import "./page.css";
import HeroVideo from "@/components/HeroVideo";
import ProductShowcase from "@/components/ProductShowcase";
import AutoSlider from "@/components/AutoSlider";
import DraggableTestimonials from "@/components/DraggableTestimonials";
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

  const reviews = [
    {
      image: "/media/client-images/iris.webp",
      name: "Iris",
      review:
        "Very nice curtains with great quality. Shipping issues were resolved quickly, customer service was always available and responded very quickly! Thanks! Always my pleasure!",
    },
    {
      image: "/media/client-images/jeanmarie.webp",
      name: "Jeanmarie",
      review: "Beautiful curtains/drapes. Outstanding service.",
    },
    {
      image: "/media/client-images/mary.webp",
      name: "Mary",
      review:
        "Love them! Exactly as pictured; so elegant looking! I’ll happily order from this shop again.",
    },
    {
      image: "/media/client-images/meredith.webp",
      name: "Meredith",
      review: "So pretty, and it arrived really fast!",
    },
    {
      image: "/media/client-images/maria.jpg",
      name: "Maria",
      review:
        "Wonderful quality. Friendly salesman, always available. Responds to messages in a timely manner. Again and again!",
    },
    {
      image: "/media/client-images/jane.webp",
      name: "Jane",
      review:
        "My first order came with a request to know if I was pleased with my purchase. Instead of answering the question I reordered my first purchase. I believe that's speaks more loudly. If I had more windows that needed sheers I would buy these all o we again and again. I have never seen any as beautiful!!! Even my adult sons who don't notice said 'Wow!' Those are beautiful Mom. Thank you thank you!",
    },
    {
      image: "/media/client-images/ava.webp",
      name: "Ava",
      review:
        "I love my curtains but I love the customer service even better they went beyond to make sure I received my beautiful curtains",
    },
  ];

  return (
    <main>
      <div className="HomePage">
        <HeroVideo
          videoSrc="/media/hero-video.mp4"
          subtitle="Premium Textile Collection"
          title="Where Elegance Meets Embroidery"
          locale={locale}
          showCatalogButton={false}
        />
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
