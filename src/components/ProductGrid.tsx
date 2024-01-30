"use client";
import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import classes from "@/components/ProductGrid.module.css";
import { FaSearch } from "react-icons/fa";
import Spinner from "@/components/Spinner";
// import { createClient } from "@supabase/supabase-js";
import fabricData from "@/vir_db/products_embroidered_sheer_curtain_fabrics.json";
// import {prisma} from "@/lib/prisma"

// below is to check to see if the user is logged in
import { useSession } from "next-auth/react";

// import supabase from "@/vir_db/supabase";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

// const supabase = createClient(
//   supabaseUrl!,
//   // process.env.SUPABASE_SECRET!,
//   supabaseKey!
// );

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
  // created_at: string;
  // id: number;
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

// let fabricData = prisma
// let firat = prisma.products.findMany()
// console.log(firat);
// const {data, error} = await supabase .from('products').select()
// const firat = async()=>{
//   // await supabase.from('products').select()
//   await prisma.products.findMany()
// }
// console.log(firat());

// console.log(fabricData);

function is_numeric(str: string) {
  return /^\d+$/.test(str);
}

let shuffle = (array: EmbroideryFabric[], seed: number) => {
  // <-- ADDED ARGUMENT
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(random(seed) * m--); // <-- MODIFIED LINE

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed; // <-- ADDED LINE
  }

  return array;
};
let random = (seed: number) => {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export default function ProductGrid(props: { product: Product }) {
  const [productLoadAmount, setproductLoadAmount] = useState<number>(20);
  const [fetchData, setFetchData] = useState<EmbroideryFabric[] | null>(null);
  const [loadedProducts, setloadedProducts] = useState<
    EmbroideryFabric[] | null
  >(null);
  const [filterUsed, setfilterUsed] = useState<boolean>(false);
  const searchTermRef = useRef<HTMLInputElement | null>(null);
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user not authenticated, handle here
      console.log("Not logged in!: " + status);
    },
  });
  console.log(status);
  
  const filter = (e: any) => {
    setfilterUsed(true);

    let query = e.currentTarget.value;
    let prefix = query[0];
    if (!query) {
      setfilterUsed(false);
      setproductLoadAmount(20);
      return;
    }

    if (!is_numeric(prefix)) {
      query = query?.slice(1);
    }
    if (query.length < 4) {
      return;
    }
    // console.log("the query is:" + query);

    let array: EmbroideryFabric[] = [];
    fetchData?.map((item, index) => {
      // console.log(item.design);

      if (item.design.toString().includes(query, 0)) {
        array.push(item);
      }
    });
    setloadedProducts(array);
  };

  useEffect(() => {
    const fetchshit = async () => {
      try {
        // let { data: embroidery_fabric, error } = await supabase
        //   .from("embroidery_fabric_curtain")
        //   .select("*");
        // // console.log(embroidery_fabric);

        setFetchData(fabricData);

        setloadedProducts(fabricData!.slice(0, productLoadAmount));

        // if (error) {
        //   // Handle the error if necessary
        //   console.error("Error fetching data:", error.message);
        //   return;
        // }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // console.log(await supabase.from("embroidery_fabric").select("*"));
    };

    if (filterUsed == false) {
      fetchshit();
    }

    function handleScrollEvent() {
      console.log(status);
      
      if (
        ((window.innerHeight + window.scrollY) >=
          (document.body.offsetHeight - 20)) &&
        (filterUsed === false)    
      ) {
        console.log("you're at the bottom of the page");
        setproductLoadAmount(productLoadAmount + 20);
        console.log(productLoadAmount);
      } else {
        return (
          <h3>
            Please contact info@demfirat.com to open account and see all designs
          </h3>
        );

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
          style={{
            backgroundImage: "url('/media/karven_banner.webp')",
            backgroundSize: "900px",
            // scale:"110%"
          }}
        >
          <div className={classes.headlineBox}>Embroidery</div>
        </div>
        {/* search bar below */}
        {status === "loading" ? (
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Products
          </h2>
        ) : (
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
                <FaSearch />
              </button>
            </div>
          </div>
        )}
        {/* search bar ends here */}

        {/* <div className={classes.products}> */}

        {/* {loadedProducts?.map((fabric, index: number) => {
            return <ProductCard key={index} product={fabric} />;
          })} */}
        {/* </div> */}
        <div>
          {status === "loading" ? (
            <>
              <div className={classes.products}>
                {/* {shuffle(fabricData!, 497) */}
                {fabricData
                  ?.slice(687, 702)
                  .map((fabric, index: number) => {
                    return <ProductCard key={index} product={fabric} />;
                  })}
              </div>
              <h3 style={{ textAlign: "center" }}>
                To see all the designs, email info@demfirat with your business
                info and we'll create an online account for you.
              </h3>
            </>
          ) : (
            <div className={classes.products}>
              {loadedProducts?.map((fabric, index: number) => {
                return <ProductCard key={index} product={fabric} />;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}
