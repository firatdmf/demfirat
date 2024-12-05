import Image from "next/image";
import React from "react";
import "./page.css";
import Slider from "@/components/slider/Slider";
import ProductCategories from "@/components/ProductCategories";
import ClientTestimonials from "@/components/ClientTestimonials";
// below is irrelevant
// import { getDictionary } from "@/app/[locale]/dictionaries/dictionaries";
import { useTranslations } from "next-intl";
// export default async function Home({params:{lang}}) {
export default function Home() {
  // below code gives not found error when invalid parameter is provided: http://demfirat.com/asdsadsad
  const sliderLocale = useTranslations("Slider");
  const ProductsLocale = useTranslations("Products");
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
        <div className="clientReviews">
          <h2>Photos from our Clients</h2>
          <div className="clientReviewsContainer">
            {reviews.map((review, index) => (
              <ClientTestimonials
                key={index}
                image={review.image}
                name={review.name}
                review={review.review}
              />
            ))}
          </div>
        </div>
        <div className="certifications">
          <b>
            <p><span>ISO 9001</span> | <span>NFPA 701</span> | <span>GOTS</span> | <span>OEKO TEX</span></p>
          </b>
        </div>
      </div>
    </main>
  );
}
