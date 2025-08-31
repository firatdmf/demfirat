import ProductCategories from "@/components/ProductCategories";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import classes from './page.module.css'
import { ProductCategory } from "@/lib/interfaces"


export default async function Products(props: PageProps<'/[locale]/product'>) {
  const { locale } = await props.params;
  const productCategoriesT = await getTranslations({ locale, namespace: "Products" })

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
      <div className={classes.ProductCategoriesComponent}>
        <ProductCategories Headline={productCategoriesT('Headline')} product_categories={product_categories} />
      </div>
    </div>
  );
}

