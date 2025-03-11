import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGridNew.module.css"
import ProductCardNew from "./ProductCardNew";
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
  id:bigint;
  variant_sku: string | null;
  variant_barcode: string | null;
  variant_quantity: Decimal | null;
  variant_price: Decimal | null;
  variant_cost: Decimal | null;
  variant_featured: boolean | null;
  product_id: bigint | null;

}

// export interface ProductWithCategory extends Product {
//   marketing_productcategory: Category | null;
// }


interface ProductGridNewProps {
  products: Product[];
}
function ProductGridNew({ products }: ProductGridNewProps) {
  return (
    <div className={classes.ProductGridNew}>
      <div className={classes.FiratDisplay}>
        <div className={classes.filterMenu}>
          <ul>
            <li>
              Stock
            </li>
            <li>
              Price
            </li>
            <li>
              Tags
            </li>
          </ul>

        </div>
        <div className={classes.products}>
          {products?.map((product: Product, index: number) => {
            // return <p key={index}>{product.title ?? "No Title"}</p>
            return <ProductCardNew key={index} product={product} />
          })}
        </div>
      </div>


    </div>
  )
}

export default ProductGridNew