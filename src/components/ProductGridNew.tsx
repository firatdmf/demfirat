"use client"
import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGridNew.module.css";
import ProductCardNew from "./ProductCardNew";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useRef, useState } from "react";
// below are react icons
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { FaSearch } from "react-icons/fa";



export type Product = {
  id: bigint;
  created_at: Date | null;
  title: string | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  tags: string[];
  category_id?: bigint | null;
  type: string | null;
  price: Decimal | null;
  quantity: Decimal | null;
  unit_of_weight: string | null;
}

export type ProductVariant = {
  id: bigint;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_quantity: Decimal | null;
  variant_price: Decimal | null;
  variant_cost: Decimal | null;
  variant_featured: boolean | null;
  product_id: bigint | null;
}

export type ProductVariantAttribute = {
  id: bigint;
  name: string | null;
}

export type ProductVariantAttributeValue = {
  id: bigint;
  value: string;
  product_id?: bigint | null;
  attribute_id?: bigint | null;
  variant_id?: bigint | null;
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
}

type ProductGridNewProps = {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  // searchParams: { [key: string]: string | string[] | undefined };
  searchParams: SearchParams;
}

// Below variables are passed down
function ProductGridNew({ products, product_variants, product_variant_attributes, product_variant_attribute_values, searchParams }: ProductGridNewProps) {

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

  // If there are search params in the url (filter menu)
  if (Object.keys(searchParams).length > 0) {
    // Iterate through the search params object
    Object.entries(searchParams).forEach(([key, value]) => {
      // attribute names are unique so we use find instead of filter and this returns a single object
      const attribute = product_variant_attributes.find((attribute) => {
        return attribute.name === key;
      });
      if (attribute) {
        // If we have a multiple values such as 84 and 95 both selected for size, then we split them by comma (%2C)
        const values = Array.isArray(value) ? value : value?.split(',');
        // get the appropriate objects from passed down db object that match the attribute and values
        const attribute_values = product_variant_attribute_values.filter((attribute_value) => {
          return attribute_value.attribute_id === attribute.id && values?.includes(attribute_value.value);
        });


        // Extract distinct product IDs, eliminating duplicate products
        const productIds = Array.from(new Set(attribute_values.map((attribute_value) => attribute_value.product_id)));
        filteredProducts = filteredProducts.filter((product) => productIds.includes(product.id));
      }
      // Printing params for reference
      // console.log(`${key} ${value}`);
    });
  }

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGridNew}>
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
                  (attribute_value) => attribute_value.attribute_id === attribute.id
                );
                const uniqueValues = Array.from(new Set(filteredValues.map(value => value.value)))
                  .map(value => filteredValues.find(attribute_value => attribute_value.value === value));

                return (
                  <li key={index}>
                    {capitalizeFirstLetter(attribute.name)}
                    <ul>
                      {uniqueValues.map((attribute_value) => {
                        // Record<string, string> is a utility type that represents an object with string keys, and string values. 
                        // in our case, keys are attribute names, and values are either strings or array of strings.
                        const params = new URLSearchParams(searchParams as Record<string, string>);
                        const paramKey = String(attribute.name);
                        const paramValue = String(attribute_value?.value);

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
                              <div className={classes.iconText}>{capitalizeFirstLetter(attribute_value?.value)}</div>
                            </Link>
                            <br />
                          </div>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={classes.products}>
            {SearchFilterUsed ? SearchFilteredProducts?.map((product: Product, index: number) => {
              return <ProductCardNew key={index} product={product} />;
            }) :
              filteredProducts?.map((product: Product, index: number) => {
                return <ProductCardNew key={index} product={product} />;
              })}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductGridNew;