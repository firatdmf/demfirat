import React from "react";
import ProductCategories from "@/components/ProductCategories";
import "@/app/products/page.css";
function Products() {
  return (
    <div className="ProductsPage">
      <div className="ProductCategoriesComponent">
        <ProductCategories />
      </div>
    </div>
  );
}

export default Products;
