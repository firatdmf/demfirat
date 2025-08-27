import ProductCategories from "@/components/ProductCategories";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import classes from './page.module.css'
import { ProductCategory } from "@/lib/interfaces"


export default async function Products(props: PageProps<'/[locale]/product'>) {
  const { locale } = await props.params;
  const productCategoriesT = await getTranslations({ locale, namespace: "Products" })

  const get_product_categories_API_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product_categories`);
  const get_product_categories_response = await fetch(get_product_categories_API_link)
  const product_categories: ProductCategory[] = await get_product_categories_response.json();
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

