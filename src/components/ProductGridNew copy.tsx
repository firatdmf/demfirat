// "use client"
import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGridNew.module.css";
import ProductCardNew from "./ProductCardNew";
import Spinner from "@/components/Spinner";
// import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";

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

type ProductGridNewProps = {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  searchParams: { [key: string]: string | string[] | undefined };
}

function ProductGridNew({ products, product_variants, product_variant_attributes, product_variant_attribute_values, searchParams }: ProductGridNewProps) {

  const capitalizeFirstLetter = (val: string | null | undefined) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }
  let filteredProducts: Product[] = products;

  // If there are search params
  if (Object.keys(searchParams).length > 0) {
    console.log("your search params are: ");
    console.log(searchParams);

    // Iterate through search params
    Object.entries(searchParams).forEach(([key, value]) => {
      // get the attribute from database
      const attribute = product_variant_attributes.find((attribute) => {
        return attribute.name === key;
      });
      console.log(attribute);
      if (attribute) {
        const values = Array.isArray(value) ? value : value?.split(',');
        const attribute_values = product_variant_attribute_values.filter((attribute_value) => {
          return attribute_value.attribute_id === attribute.id && values?.includes(attribute_value.value);
        });
        console.log(attribute_values);

        // Extract distinct product IDs
        const productIds = Array.from(new Set(attribute_values.map((attribute_value) => attribute_value.product_id)));

        // Filter products based on distinct product IDs
        filteredProducts = filteredProducts.filter((product) => productIds.includes(product.id));
      }
      console.log(`${key} ${value}`);
    });
  }

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGridNew}>
        <div className={classes.FiratDisplay}>
          <div className={classes.filterMenu}>

            <Link href="?" className={classes.clearFiltersButton}>Reset Filters</Link>
            <ul>
              {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {
                // Filter the attribute values based on the attribute_id
                const filteredValues = product_variant_attribute_values.filter(
                  (attribute_value) => attribute_value.attribute_id === attribute.id
                );

                // Use a Set to keep track of unique values and eliminate duplicates
                const uniqueValues = Array.from(new Set(filteredValues.map(value => value.value)))
                  .map(value => filteredValues.find(attribute_value => attribute_value.value === value));

                return (
                  <li key={index}>
                    {capitalizeFirstLetter(attribute.name)}
                    <ul>
                      {uniqueValues.map((attribute_value) => {
                        const params = new URLSearchParams(searchParams as any);
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
                            <Link className={classes.link} href={href}>
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
            {filteredProducts?.map((product: Product, index: number) => {
              return <ProductCardNew key={index} product={product} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductGridNew;