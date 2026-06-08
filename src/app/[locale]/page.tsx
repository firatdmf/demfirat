import React from "react";
import "./page.css";
import { Metadata } from "next";

// Revalidate homepage every 5 minutes to reduce SSR load
export const revalidate = 300;

export async function generateMetadata(props: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await props.params;
  const baseUrl = `https://www.demfirat.com`;
  const canonicalUrl = `${baseUrl}/${locale}`;

  const titles: Record<string, string> = {
    tr: 'DEMFIRAT® KARVEN | Lüks Ev Tekstili, Tül ve Perde Tasarımları',
    en: 'DEMFIRAT® KARVEN | Luxury Home Textiles & Custom Curtain Designs',
    ru: 'DEMFIRAT® KARVEN | Элитный домашний текстиль и дизайн штор',
    pl: 'DEMFIRAT® KARVEN | Luksusowe tekstylia domowe i projekty zasłon',
  };

  const descriptions: Record<string, string> = {
    tr: "1991'den beri Demfırat Karven kalitesiyle lüks ev tekstili, tül ve perde tasarımları. Koleksiyonlarımızı inceleyin ve hayalinizdeki perdeyi tasarlayın.",
    en: 'Premium home textiles, tulle, and custom curtain designs by Demfırat Karven since 1991. Explore our collections and design your dream curtain.',
    ru: 'Элитный домашний текстиль, тюль и индивидуальный дизайн штор от Demfırat Karven с 1991 года. Посетите наш сайт и создайте штору мечты.',
    pl: 'Luksusowe tekstylia domowe, firany i projekty zasłon na wymiar od Demfırat Karven od 1991 roku. Zobacz naszą kolekcję i zaprojektuj wymarzoną zasłonę.',
  };

  const keywords: Record<string, string> = {
    tr: 'Demfirat, Karven, Dem Fırat, perde, tül, kumaş, ev tekstili, lüks perde, özel dikim perde, hazır perde, Türk perde üreticisi, nakışlı perde',
    en: 'Demfirat, Karven, Dem Firat, curtain, tulle, fabric, home textiles, luxury curtains, custom curtains, ready-made curtains, Turkish curtain manufacturer',
    ru: 'Demfirat, Karven, Дем Фырат, шторы, тюль, ткани, домашний текстиль, роскошные шторы, шторы на заказ, турецкий производитель штор',
    pl: 'Demfirat, Karven, Dem Firat, zasłony, firany, tkaniny, tekstylia domowe, luksusowe zasłony, zasłony na wymiar, turecki producent zasłon',
  };

  return {
    title: titles[locale] || titles['en'],
    description: descriptions[locale] || descriptions['en'],
    keywords: keywords[locale] || keywords['en'],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'tr': `${baseUrl}/tr`,
        'ru': `${baseUrl}/ru`,
        'pl': `${baseUrl}/pl`,
        'x-default': `${baseUrl}/tr`,
      }
    },
    openGraph: {
      title: titles[locale] || titles['en'],
      description: descriptions[locale] || descriptions['en'],
      url: canonicalUrl,
      siteName: 'DEMFIRAT® KARVEN',
      locale: locale === 'tr' ? 'tr_TR' : locale === 'ru' ? 'ru_RU' : locale === 'pl' ? 'pl_PL' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/media/karvenLogo.png`,
          width: 512,
          height: 512,
          alt: 'DEMFIRAT KARVEN - Luxury Home Textiles',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles['en'],
      description: descriptions[locale] || descriptions['en'],
      images: [`${baseUrl}/media/karvenLogo.png`],
    },
  };
}
import HeroVideo from "@/components/HeroVideo";
import ProductShowcase from "@/components/ProductShowcase";
import DraggableTestimonials from "@/components/DraggableTestimonials";
import CustomCurtainPromo from "@/components/CustomCurtainPromo";
import BrandHistoryPromo from "@/components/BrandHistoryPromo";
import InstagramFeed from "@/components/InstagramFeed";
import { getStorefrontHome } from "@/lib/storefrontApi";
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

  // Storefront CMS sections — used to assign `editId` on each home
  // component so the visual editor can rename text + swap images
  // in place (Belino-style). Fail-soft: when the API is down the
  // values are undefined and components fall back to hardcoded copy.
  const homeSections = await getStorefrontHome();
  const heroSection = homeSections?.find((s) => s.kind === 'hero');
  const trustSection = homeSections?.find((s) => s.kind === 'trust');
  const featuredSection = homeSections?.find((s) => s.kind === 'featured');
  const seasonsSection = homeSections?.find((s) => s.kind === 'seasons');

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
      date: "2025-08-12",
    },
    {
      image: "/media/client-images/jeanmarie.webp",
      name: "Jeanmarie",
      review: homeReviewsLocale("review_2_text"),
      date: "2025-09-03",
    },
    {
      image: "/media/client-images/mary.webp",
      name: "Mary",
      review: homeReviewsLocale("review_3_text"),
      date: "2025-10-18",
    },
    {
      image: "/media/client-images/meredith.webp",
      name: "Meredith",
      review: homeReviewsLocale("review_4_text"),
      date: "2025-11-05",
    },
    {
      image: "/media/client-images/maria.jpg",
      name: "Maria",
      review: homeReviewsLocale("review_5_text"),
      date: "2025-12-22",
    },
    {
      image: "/media/client-images/jane.webp",
      name: "Jane",
      review: homeReviewsLocale("review_6_text"),
      date: "2026-01-14",
    },
    {
      image: "/media/client-images/ava.webp",
      name: "Ava",
      review: homeReviewsLocale("review_7_text"),
      date: "2026-02-08",
    },
  ];

  // JSON-LD Structured Data for the Homepage
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.demfirat.com'}/#organization`,
    name: 'DEMFIRAT KARVEN',
    alternateName: ['Dem Fırat', 'Demfirat Karven', 'Karven Home', 'Dem Fırat Karven', 'Karven Home Decor'],
    url: 'https://www.demfirat.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.demfirat.com/media/karvenLogo.png',
      width: 512,
      height: 512,
    },
    image: 'https://www.demfirat.com/media/karvenLogo.png',
    description: locale === 'tr'
      ? "1991'den beri lüks ev tekstili, tül ve perde üretimi yapan Dem Fırat Karven."
      : 'Dem Fırat Karven — luxury home textiles, tulle, and curtain manufacturer since 1991.',
    foundingDate: '1991',
    founder: {
      '@type': 'Person',
      name: 'Cuma Fırat',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bursa',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-224-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English', 'Russian', 'Polish'],
    },
    sameAs: [
      'https://www.instagram.com/karvenhomedecor',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.demfirat.com'}/#website`,
    name: 'DEMFIRAT KARVEN',
    alternateName: 'Dem Fırat Karven',
    url: 'https://www.demfirat.com',
    publisher: {
      '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.demfirat.com'}/#organization`,
    },
    inLanguage: ['tr', 'en', 'ru', 'pl'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.demfirat.com/{locale}/product/all?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'tr' ? 'Ana Sayfa' : 'Home',
        item: `https://www.demfirat.com/${locale}`,
      },
    ],
  };

  return (
    <main>
      {/* JSON-LD Structured Data — tells Google this is the brand homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="HomePage">
        {/* Editable section wrappers — clicked in ?edit=1 mode they
            dispatch a `select` postMessage; the ERP CMS receives it and
            opens that section's edit form. */}
        <div data-edit-zone="hero">
          <HeroVideo
            videoSrc="https://demfiratkarven.b-cdn.net/website-videos/new_hero.mp4"
            subtitle={heroSection?.eyebrow?.[locale === 'tr' ? 'tr' : 'en']
              || (locale === 'tr' ? 'Premium Tekstil Koleksiyonu' :
                  locale === 'ru' ? 'Премиальная текстильная коллекция' :
                    locale === 'pl' ? 'Kolekcja Premium Tekstyliów' :
                      'Premium Textile Collection')}
            title={heroSection?.title?.[locale === 'tr' ? 'tr' : 'en']
              || (locale === 'tr' ? 'Zarafet Nakışla Buluşuyor' :
                  locale === 'ru' ? 'Где элегантность встречается с вышивкой' :
                    locale === 'pl' ? 'Gdzie elegancja spotyka haft' :
                      'Where Elegance Meets Embroidery')}
            locale={locale}
            showCatalogButton={false}
            primaryCta={{
              text: locale === 'tr' ? 'Perdeni Tasarla (Özel Dikim)' :
                locale === 'ru' ? 'Создай свои шторы' :
                  locale === 'pl' ? 'Zaprojektuj swoje zasłony' :
                    'Design Your Curtain',
              link: `/${locale}/product/fabric?intent=custom_curtain`
            }}
            editId={heroSection?.id}
          />
        </div>
        <div data-edit-zone="trust">
          <CustomCurtainPromo locale={locale} editId={trustSection?.id} />
        </div>
        <div data-edit-zone="history">
          <BrandHistoryPromo locale={locale} />
        </div>
        <div data-edit-zone="featured">
          <ProductShowcase
            title={featuredSection?.title?.[locale === 'tr' ? 'tr' : 'en'] || productsLocale("Headline")}
            locale={locale}
            editId={featuredSection?.id}
          />
        </div>
        <div data-edit-zone="seasons">
          <DraggableTestimonials reviews={reviews} locale={locale} />
        </div>
        <div data-edit-zone="instagram">
          <InstagramFeed locale={locale} />
        </div>
      </div>
    </main>
  );
}
