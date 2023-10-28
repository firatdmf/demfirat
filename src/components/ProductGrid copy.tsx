"use client";
import React from "react";
import classes from "@/components/ProductGrid.module.css";
import { useState, useEffect } from "react";
import productData from "@/vir_db/products_embroidered_sheer_curtain_fabrics.json";
import ProductCard from "@/components/ProductCard";
import { FaSearch } from "react-icons/fa";
function ProductGrid() {
  const [productLoadAmount, setproductLoadAmount] = useState<number>(20);
  const [loadedProducts, setloadedProducts] = useState<any>([]);
  const [filterUsed, setfilterUsed] = useState(false);
  const products = productData
  const filter = (e: any) => {
    setfilterUsed(true);
    // console.log(e);
    // console.log(filterUsed);
    let array: any = [];
    products.map((item, index) => {
      if (
        item.design.includes(e.currentTarget.value, 0)
        // item.design.includes(e.currentTarget.value.slice(0, -1))
      ) {
        array.push(item);
      }
    });
    // let filteredData = Array.prototype.concat.apply([], array);
    setloadedProducts(array);
  };

  useEffect(() => {
    // window.scrollTo(0, 0);
    // location.href = '#karven-banner'
    setloadedProducts(products.slice(0, productLoadAmount));
    function handleScrollEvent() {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 20 &&
        filterUsed === false
      ) {
        // console.log("you're at the bottom of the page");

        setproductLoadAmount(productLoadAmount + 20);
        // console.log(loadAmount);
        // here add more items in the 'filteredData' state from the 'allData' state source.
      }
    }
    window.addEventListener("scroll", handleScrollEvent);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, [productLoadAmount, filterUsed]);
  return (
    <div className={classes.ProductGrid}>
      <div className={classes.cover} id='karven-banner' style={{backgroundImage:"url('/media/karven_banner.png')"}}>
        <div className={classes.headlineBox}>Embroidery</div>
      </div>
      {/* search bar below */}
      <div className={classes.wrap}>
        <div className={classes.search}>
          <input
            type="text"
            className={classes.searchTerm}
            placeholder="Enter design number"
            onChange={filter}
          />
          <button type="submit" className={classes.searchButton}>
            {/* <i class="fa fa-search"></i> */}
            <FaSearch />
          </button>
        </div>
      </div>
      {/* search bar ends here */}
      <div className={classes.products}>
        {loadedProducts.map((product: any, index: number) => {
          return <ProductCard key={index} product={product} />;
        })}
      </div>
      {filterUsed === false ? (
        <div
          className={classes.loadMoreButton}
          onClick={() => {
            setproductLoadAmount(productLoadAmount + 20);
          }}
        >
          Load More
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ProductGrid;
