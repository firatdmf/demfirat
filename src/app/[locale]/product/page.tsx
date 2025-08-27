import ProductCategories from "@/components/ProductCategories";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import classes from './page.module.css'
import { ProductCategory } from "@/lib/interfaces"


export default async function Products(props: PageProps<'/[locale]/product'>) {
  const { locale } = await props.params;
  const productCategoriesT = await getTranslations({locale, namespace:"Products"})

  const get_product_categories_API_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_categories`);
  let product_categories: ProductCategory[] = [];
  try {
    const get_product_categories_response = await fetch(get_product_categories_API_link, { next: { revalidate: 300 } })
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
  console.log("your django data is");
  console.log(product_categories);


  return (
    <div className={classes.ProductsPage}>
      <div className={classes.ProductCategoriesComponent}>
        {/* <ProductCategories Headline={productCategoriesT('Headline')} EmbroideredSheerCurtainFabrics={productCategoriesT('EmbroideredSheerCurtainFabrics')} /> */}
        <ProductCategories Headline={productCategoriesT('Headline')} product_categories={product_categories} />
      </div>
    </div>
  );
}

