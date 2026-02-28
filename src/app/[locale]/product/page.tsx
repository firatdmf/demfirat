import ProductCategories from "@/components/ProductCategories";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import classes from './page.module.css'
import { ProductCategory } from "@/lib/interfaces"
import { Metadata } from "next";
import Image from 'next/image';

export async function generateMetadata(props: PageProps<'/[locale]/product'>): Promise<Metadata> {
  const { locale } = await props.params;
  const baseUrl = `https://karven.com`;
  const canonicalUrl = `${baseUrl}/${locale}/product`;

  const title = locale === 'tr' ? 'Tüm Ürünler | Karven'
    : locale === 'ru' ? 'Все Продукты | Karven'
      : locale === 'pl' ? 'Wszystkie Produkty | Karven'
        : 'All Products | Karven';

  const desc = locale === 'tr' ? 'Lüks ev tekstili koleksiyonumuzu keşfedin. Her mekan için özel tasarımlar.'
    : locale === 'ru' ? 'Откройте для себя нашу коллекцию роскошного домашнего текстиля. Уникальные дизайны для каждого пространства.'
      : locale === 'pl' ? 'Odkryj naszą kolekcję luksusowych tekstyliów domowych. Unikalne wzory dla każdej przestrzeni.'
        : 'Discover our luxury home textile collection. Unique designs for every space.';

  return {
    title,
    description: desc,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/product`,
        'tr': `${baseUrl}/tr/product`,
        'ru': `${baseUrl}/ru/product`,
        'pl': `${baseUrl}/pl/product`,
        'x-default': `${baseUrl}/en/product`,
      }
    }
  };
}

export default async function Products(props: PageProps<'/[locale]/product'>) {
  const { locale } = await props.params;
  const productCategoriesT = await getTranslations({ locale, namespace: "Products" })

  // Multi-language content
  const pageContent = {
    slogan: locale === 'tr' ? 'Her detayda incelik, her dokunuşta konfor' :
      locale === 'ru' ? 'Изящество в каждой детали, комфорт в каждом прикосновении' :
        locale === 'pl' ? 'Elegancja w każdym detalu, komfort w każdym dotyku' :
          locale === 'de' ? 'Eleganz in jedem Detail, Komfort in jeder Berührung' :
            'Elegance in every detail, comfort in every touch',
    description: locale === 'tr' ? 'Lüks ev tekstili koleksiyonumuzu keşfedin. Her mekan için özel tasarımlar.' :
      locale === 'ru' ? 'Откройте для себя нашу коллекцию роскошного домашнего текстиля. Уникальные дизайны для каждого пространства.' :
        locale === 'pl' ? 'Odkryj naszą kolekcję luksusowych tekstyliów domowych. Unikalne wzory dla każdej przestrzeni.' :
          locale === 'de' ? 'Entdecken Sie unsere luxuriöse Heimtextilien-Kollektion. Einzigartige Designs für jeden Raum.' :
            'Discover our luxury home textile collection. Unique designs for every space.'
  };

  const get_product_categories_API_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_categories`);
  let product_categories: ProductCategory[] = [];
  try {
    // sending HTTP request to the backend API.
    // The { next: { revalidate: 300 } } option tells Next.js to cache the response and revalidate it every 300 seconds (5 minutes), so the data stays fresh but is not fetched on every request.
    const get_product_categories_response = await fetch(get_product_categories_API_link, { next: { revalidate: 300 } })
    //It is used to check if the response is JSON (i.e., 'application/json'), so you know whether you can safely call .json() on the response.
    const contentType = get_product_categories_response.headers.get('content-type') || '';
    if (!get_product_categories_response.ok || !contentType.includes('application/json')) {
      const body = await get_product_categories_response.text();
      console.error('get_product_categories failed:', get_product_categories_response.status, body.slice(0, 300));
    } else {
      // [
      // {
      //   pk: 1,
      //   name: 'curtain',
      //   image_url: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1749961086/curtain_thumbnail_qrff0f.avif'
      // },
      // {
      //   pk: 2,
      //   name: 'fabric',
      //   image_url: 'https://res.cloudinary.com/dnnrxuhts/image/upload/v1749961112/fabric_category_image_ixm9ts.avif'
      // }
      // ]
      product_categories = await get_product_categories_response.json();
      console.log("Product Categories are fetched successfully:\n", product_categories);
    }
  } catch (err) {
    console.error('get_product_categories exception:', err);
  }

  return (
    <div className={classes.ProductsPage}>
      {/* Hero Section */}
      <section className={classes.heroSection}>
        <div className={classes.heroContent}>
          <div className={classes.brandHeader}>
            <div className={classes.brand}>Karven</div>
            <div className={classes.slogan}>{pageContent.slogan}</div>
          </div>
          <div className={classes.showcaseArea}>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTrack}>
                {/* Slide 1 */}
                <div className={classes.slide}>
                  <Image
                    src="/media/showcase/products-hero.jpg"
                    alt="Karven textile collection"
                    className={classes.showcaseImage}
                    fill
                    sizes="100vw"
                    priority
                  />
                </div>

                {/* Slide 2 */}
                <div className={classes.slide}>
                  <Image
                    src="/media/showcase/slide-2.jpg"
                    alt="Karven collection slide 2"
                    className={classes.showcaseImage}
                    fill
                    sizes="100vw"
                    loading="lazy"
                  />
                </div>

                {/* Slide 3 */}
                <div className={classes.slide}>
                  <Image
                    src="/media/showcase/slide-3.jpg"
                    alt="Karven collection slide 3"
                    className={classes.showcaseImage}
                    fill
                    sizes="100vw"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className={classes.textOverlay}>
              <p className={classes.description}>{pageContent.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className={classes.categoriesSection}>
        <div className={classes.ProductCategoriesComponent}>
          <ProductCategories Headline="" product_categories={product_categories} locale={locale} />
        </div>
      </section>
    </div>
  );
}

