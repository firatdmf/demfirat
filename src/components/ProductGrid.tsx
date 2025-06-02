"use client"
import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGrid.module.css";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useRef, useState } from "react";
// below are react icons
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { FaSearch } from "react-icons/fa";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces"





type SearchParams = {
  [key: string]: string | string[] | undefined;
}

type ProductGridProps = {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  // searchParams: { [key: string]: string | string[] | undefined };
  searchParams: SearchParams;
}

// Below variables are passed down
function ProductGrid({ products, product_variants, product_variant_attributes, product_variant_attribute_values, searchParams }: ProductGridProps) {

  // console.log("your attribute values are: ");
  // console.log(product_variant_attribute_values);



  const capitalizeFirstLetter = (val: string | null | undefined) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  // In this component the search bar works with client side components, and the filtering works finely on the server side.

  // This is manipulated with with (search params) but we need to initialize it first.
  let filteredProducts: Product[] = products;
  // const [fi, setfirst] = useState(second)
  const [SearchFilteredProducts, setSearchFilteredProducts] = useState<Product[]>(filteredProducts)
  const [SearchFilterUsed, setSearchFilterUsed] = useState<boolean>(false)
  const [FilterMenuOpen, setFilterMenuOpen] = useState<boolean>(false)


  // Handling of the search bar
  const search_filter = (e: React.ChangeEvent<HTMLInputElement>) => {
    let query = e.currentTarget.value;

    if (!query) {
      setSearchFilterUsed(false)
    } else {
      setSearchFilterUsed(true)
      // filter the products
      setSearchFilteredProducts(filteredProducts.filter((product) =>
        // search product title or product sku and return matching products
        product.title?.toLowerCase().includes(query.toLowerCase()) || product.sku?.toLowerCase().includes(query.toLowerCase())
      ))
    }


  }

  // if (!searchParams) {
  //   searchParams = {};
  // }

  // If there are search params in the url (filter menu)
  if (Object.keys(searchParams).length > 0) {
    console.log("your search params are:");

    console.log(searchParams);

    // Iterate through the search params object
    Object.entries(searchParams).forEach(([key, value]) => {
      // attribute names are unique so we use find instead of filter and this returns a single object
      const attribute = product_variant_attributes.find((attribute) => {
        return attribute.name === key;
      });
      if (attribute) {
        // If we have a multiple values such as 84 and 95 both selected for size, then we split them by comma (%2C)
        const values = Array.isArray(value) ? value : value?.split(',');
        console.log("little values are");
        console.log(values);



        // get the appropriate objects from passed down db object that match the attribute and values
        const attribute_values = product_variant_attribute_values.filter((attribute_value) => {
          return attribute_value.product_variant_attribute_id === attribute.id && values?.includes(attribute_value.product_variant_attribute_value);
        });


        // Extract distinct product IDs, eliminating duplicate products
        const productIds = Array.from(new Set(attribute_values.map((attribute_value) => attribute_value.product_id)));
        filteredProducts = filteredProducts.filter((product) => productIds.includes(product.id));
      } else {
        console.log("you got no attribute defined")
      }
      // Printing params for reference
      // console.log(`${key} ${value}`);
    });
  }

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGrid}>
        <div className={classes.search}>
          <input
            type="text"
            className={classes.searchTerm}
            placeholder="Search for product title or sku"
            onChange={search_filter}
          />
          {/* This button is for visual only, it is non-functional */}
          <button
            className={classes.searchButton}
          >
            <FaSearch />
          </button>

        </div>
        {/* Not shown on computer screen, only for tablets and phones */}
        <div className={classes.filterToggleContainer}>
          <button
            className={classes.filterToggleButton}
            onClick={() => setFilterMenuOpen(!FilterMenuOpen)}
          >
            {FilterMenuOpen ? "Close Filter" : "Open Filter"}
          </button>
        </div>



        <div className={classes.FiratDisplay}>
          <div className={`${classes.filterMenu} ${FilterMenuOpen ? classes.filterMenuOpen : classes.filterMenuClosed}`}>


            <Link href="?" scroll={false} className={classes.clearFiltersButton} replace={true}>Reset Filters</Link>
            <ul>
              {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {

                // Filter the attribute values based on the attribute_id, delete duplicate values, and iterate through it

                const filteredValues = product_variant_attribute_values.filter(
                  (attribute_value) => attribute_value.product_variant_attribute_id === attribute.id
                );
                const uniqueValues =
                  // filteredValues.map(value =>value.product_variant_attribute_value) creates an array of just the values (like ["blue", "red", "blue"]).
                  // new Set(...) removes duplicates (so you get ["blue", "red"]).
                  // Array.from(...) turns the Set back into an array.
                  Array.from(new Set(filteredValues.map(value => value.product_variant_attribute_value)))
                    // .map(value => filteredValues.find(...)) finds the first object in filteredValues for each unique value, so you get an array of objects (not just strings).
                    .map(value => filteredValues.find(attribute_value => attribute_value.product_variant_attribute_value === value));

                console.log("uniqueValues");
                console.log(uniqueValues);



                return (
                  <li key={index}>
                    {capitalizeFirstLetter(attribute.name)}
                    {/* <p> */}
                    {uniqueValues.map((attribute_value) => {
                      // Record<string, string> is a utility type that represents an object with string keys, and string values. 
                      // in our case, keys are attribute names, and values are either strings or array of strings.
                      const params = new URLSearchParams(searchParams as Record<string, string>);
                      const paramKey = String(attribute.name);
                      const paramValue = String(attribute_value?.product_variant_attribute_value);

                      const currentValues = params.get(paramKey)?.split(',') || [];
                      const isChecked = currentValues.includes(paramValue);

                      if (isChecked) {
                        const newValues = currentValues.filter((val) => val !== paramValue);
                        if (newValues.length > 0) {
                          params.set(paramKey, newValues.join(','));
                        } else {
                          params.delete(paramKey);
                        }
                      } else {
                        currentValues.push(paramValue);
                        params.set(paramKey, currentValues.join(','));
                      }

                      const href = `?${params.toString()}`;

                      return (
                        <div key={attribute_value?.id} className={classes.attribute_value_item_box}>
                          <Link className={classes.link} href={href} replace={true}>
                            <div className={classes.icon}>
                              {isChecked ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                            </div>
                            <div className={classes.iconText}>{capitalizeFirstLetter(attribute_value?.product_variant_attribute_value)}</div>
                          </Link>
                          <br />
                        </div>
                      );
                    })}
                    {/* </ul> */}
                    {/* </p> */}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={classes.products}>
            {SearchFilterUsed ? SearchFilteredProducts?.map((product: Product, index: number) => {
              return <ProductCard key={index} product={product} />;
            }) :
              filteredProducts?.map((product: Product, index: number) => {
                return <ProductCard key={index} product={product} />;
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductGrid;