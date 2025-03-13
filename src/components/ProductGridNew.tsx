"use client"
import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGridNew.module.css"
import ProductCardNew from "./ProductCardNew";
import Spinner from "@/components/Spinner"
import { useState } from "react";
// export interface Category {
//   id: bigint;
//   name: string | null;
// }

export interface Product {
  id: bigint;
  created_at: Date | null;
  title: string | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  tags: string[];
  category_id?: bigint | null;
  // category: String | null;
  type: string | null;
  price: Decimal | null;
  quantity: Decimal | null;
  unit_of_weight: string | null;
}

export interface ProductVariant {
  id: bigint;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_quantity: Decimal | null;
  variant_price: Decimal | null;
  variant_cost: Decimal | null;
  variant_featured: boolean | null;
  product_id: bigint | null;

}

export interface ProductVariantAttribute {
  id: bigint;
  name: string | null;

}

export interface ProductVariantAttributeValue {
  id: bigint;
  value: string;
  product_id?: bigint | null;
  attribute_id?: bigint | null;
  variant_id?: bigint | null;

}

// export interface ProductWithCategory extends Product {
//   marketing_productcategory: Category | null;
// }


interface ProductGridNewProps {
  products: Product[];
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
}


function ProductGridNew({ products, product_variants, product_variant_attributes, product_variant_attribute_values }: ProductGridNewProps) {

  const [filteredProducts, setfilteredProducts] = useState<Product[]>(products)
  const filterProducts = (id: bigint) => {
    setfilteredProducts(filteredProducts.filter((product) => product.id === id))
  }



  console.log("your product variants are");

  console.log(product_variants);
  console.log("and their values are: ");
  console.log(product_variant_attribute_values)



  if (!products) {
    return <Spinner />
  } else {
    return (
      <div className={classes.ProductGridNew}>
        <div className={classes.FiratDisplay}>
          <div className={classes.filterMenu}>
            <ul>
              {/* color, or size */}
              {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {
                // Filter the attribute values based on the attribute_id
                const filteredValues = product_variant_attribute_values.filter(
                  (value) => value.attribute_id === attribute.id
                );

                return (
                  <li key={index}>
                    {attribute.name}
                    <ul>
                      {filteredValues.map((value) => (
                        // <li key={value.id}>{value.value}</li>
                        <div key={value.id}>
                          <label htmlFor={value.value}>{value.value}</label>
                          <input type="checkbox" id={value.value} name={value.value} value={value.value} />
                        </div>

                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>


          </div>
          <div className={classes.products}>
            {filteredProducts?.map((product: Product, index: number) => {
              // return <p key={index}>{product.title ?? "No Title"}</p>
              return <ProductCardNew key={index} product={product} />
            })}
          </div>
        </div>


      </div>
    )

  }

}

export default ProductGridNew