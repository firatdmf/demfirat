"use client";
import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import classes from "@/components/ProductGrid.module.css";
import { FaSearch } from "react-icons/fa";
import Spinner from "@/components/Spinner";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://qteyuvxsjoubyavjjize.supabase.co";
// const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZXl1dnhzam91YnlhdmpqaXplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjYyODA1MSwiZXhwIjoyMDE4MjA0MDUxfQ.MbqYQ80TmYi0Dsz_Dfji7FpMU-L5jfZBG3QCmpr7u1A"
);

type FilesArray = {
  name: string;
  design: string;
  annex: string;
  prefix: string;
  variant: string;
  imageNo: string;
};
type EmbroideryFabric = {
  // title: string;
  created_at: string;
  id: number;
  prefix: string;
  design: string;
  files: FilesArray[];
  // length: number;
  // product: string;
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
export default function ProductGrid(props: { product: Product }) {
  const [productLoadAmount, setproductLoadAmount] = useState<number>(20);
  const [fetchData, setFetchData] = useState<EmbroideryFabric[] | null>(null);
  const [loadedProducts, setloadedProducts] = useState<
    EmbroideryFabric[] | null
  >(null);
  const [filterUsed, setfilterUsed] = useState<boolean>(false);
  const searchTermRef = useRef<HTMLInputElement | null>(null);

  const filter = (e: any) => {
    setfilterUsed(true);

    let query = e.currentTarget.value;
    let prefix = query[0];
    if(!query){
      setfilterUsed(false);
      setproductLoadAmount(20)
      return;
    }
    // let query = searchTermRef.current!.value;
    // let prefix = searchTermRef.current!.value[0];
    // if (!query) {
    //   console.log("hello");
    //   setloadedProducts(fetchData);
    // }
    // console.log(is_numeric(prefix));
    if (!is_numeric(prefix)) {
      console.log(query?.slice(1));
      query = query?.slice(1);
      console.log(`${prefix} is not numeric`);

      // query = query?.slice(1);
    } else {
      console.log(`${prefix} is numeric`);
    }
    if(query.length<4){
      return;
    }
    console.log("the query is:" + query);

    // console.log(e);
    // console.log(filterUsed);
    let array: EmbroideryFabric[] = [];
    fetchData?.map((item, index) => {
      // console.log(item.design);

      if (
        // item.design.includes(e.currentTarget.value, 0)
        // item.design.includes(query, 0)
        item.design.toString().includes(query, 0)

        // item.design.toString() === query

        // item.design.includes(e.currentTarget.value.slice(0, -1))
      ) {
        array.push(item);
      }

    });
    // let filteredData = Array.prototype.concat.apply([], array);
    setloadedProducts(array);
  };

  useEffect(() => {
    console.log(filterUsed);

    // const fetchData = async () => {
    //   try {
    //     const response = await fetch("/api/getFabrics"); // Call your API route
    //     if (response.ok) {
    //       const result = await response.json();
    //       // setFetchData(result.data);
    //       console.log(fetchData);

    //       setloadedProducts(result.data.slice(0, productLoadAmount));
    //     } else {
    //       console.error("Error fetching data:", response.statusText);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // };

    const fetchshit = async () => {
      try {
        let { data: embroidery_fabric, error } = await supabase
          .from("embroidery_fabric")
          .select("*");

        setFetchData(embroidery_fabric);
        setloadedProducts(embroidery_fabric!.slice(0, productLoadAmount));

        if (error) {
          // Handle the error if necessary
          console.error("Error fetching data:", error.message);
          return;
        }
        // setFetchData(data());
        // console.log(embroidery_fabric);
        // console.log(fetchData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // console.log(await supabase.from("embroidery_fabric").select("*"));
    };

    if (filterUsed == false) {
      fetchshit();
    }

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
  }, [productLoadAmount,filterUsed]);
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
              ref={searchTermRef}
              type="text"
              className={classes.searchTerm}
              placeholder="Enter the design number"
              onChange={filter}
            />
            <button
              type="submit"
              className={classes.searchButton}
              // onClick={filter}
            >
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
