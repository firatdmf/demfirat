"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import classes from "@/components/ProductGrid.module.css";
import { FaSearch } from "react-icons/fa";
import Spinner from "@/components/Spinner";

type FilesArray = {
  name: string;
  design: string;
  annex: string;
  variant: string;
  imageNo: string;
};
type Fabric = {
  title: string;
  prefix: string;
  design: string;
  files: FilesArray[];
  length: number;
  product: string;
};
// type Data = {
//   id: number;
//   collection: string;
//   data: Fabric[];
// };
type Product = {
  name: string;
};

function is_numeric(str: string) {
  return /^\d+$/.test(str);
}
export default function Example2(props: { product: Product }) {
  const [productLoadAmount, setproductLoadAmount] = useState<number>(20);
  const [fetchData, setFetchData] = useState<Fabric[] | null>(null);
  const [loadedProducts, setloadedProducts] = useState<Fabric[] | null>(null);
  const [filterUsed, setfilterUsed] = useState<boolean>(false);

  const filter = (e: any) => {
    setfilterUsed(true);
    let query = e.currentTarget.value;
    let prefix = e.currentTarget.value[0];
    // console.log(is_numeric(prefix));
    if (!is_numeric(prefix)) {
      console.log(query.slice(1));
      query = query.slice(1);
    }
    // console.log(e);
    // console.log(filterUsed);
    let array: Fabric[] = [];
    fetchData?.map((item, index) => {
      if (
        // item.design.includes(e.currentTarget.value, 0)
        item.design.includes(query, 0)
        // item.design.includes(e.currentTarget.value.slice(0, -1))
      ) {
        array.push(item);
      }
    });
    // let filteredData = Array.prototype.concat.apply([], array);
    setloadedProducts(array);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getFabrics"); // Call your API route
        if (response.ok) {
          const result = await response.json();
          // setFetchData(result.data);
          console.log(fetchData);
          
          setloadedProducts(result.data.slice(0, productLoadAmount));
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    function handleScrollEvent() {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 20 &&
        filterUsed === false
      ) {
        console.log("you're at the bottom of the page");
        setproductLoadAmount(productLoadAmount + 20);
        console.log(productLoadAmount);
        // here add more items in the 'filteredData' state from the 'allData' state source.
      }
    }
    window.addEventListener("scroll", handleScrollEvent);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, [productLoadAmount, filterUsed]);
  if (!fetchData) {
    return (
      <div>
        <Spinner />
      </div>
    );
  } else {
    return (
      <div className={classes.ProductGrid}>
        <div
          className={classes.cover}
          id="karven-banner"
          style={{ backgroundImage: "url('/media/karven_banner.png')" }}
        >
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
          {loadedProducts?.map((fabric, index: number) => {
            return <ProductCard key={index} product={fabric} />;
          })}
        </div>
      </div>
    );
  }
}
