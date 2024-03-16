import React from "react";
import ProductCategories from "@/components/ProductCategories";
import { useTranslations } from "next-intl";
import "./page.css";
function Products() {
  const productCategoriesT = useTranslations('Products')
  return (
    <div className="ProductsPage">
      <div className="ProductCategoriesComponent">
        <ProductCategories Headline={productCategoriesT('Headline')} EmbroideredSheerCurtainFabrics={productCategoriesT('EmbroideredSheerCurtainFabrics')}/>
      </div>
    </div>
  );
}

export default Products;
