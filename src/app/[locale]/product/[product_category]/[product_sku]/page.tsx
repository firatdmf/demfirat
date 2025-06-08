import ProductDetailCard from "@/components/ProductDetailCard"
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute } from "@/lib/interfaces";
import classes from "./page.module.css";

interface PageParamProps {
  params: {
    product_sku: string
  }
  searchParams: { [key: string]: string | string[] | undefined };
}

type ProductData  =
  {
  id: 13,
  title: 'Confetti',
  sku: 'RN1381',
  price: null,
  primary_image: '/media/product_files/RN1381/images/productSKU_RN1381_variantSKU_RN1381RM9_1381_far.jpg',
  variants: [
    {
      id: 30,
      variant_sku: 'RN1381RM9',
      variant_price: '18.70',
      variant_quantity: '99.00',
      variant_featured: true,
      attribute_values: []
    },
    {
      id: 29,
      variant_sku: 'RN1381RM8',
      variant_price: '18.70',
      variant_quantity: '163.00',
      variant_featured: true,
      attribute_values: []
    }
  ]
}



export default async function page({ params, searchParams }: PageParamProps) {
  // get the sku number from the url parameters. (http://localhost:3000/product/curtain/RN1381), RN1381 in this case.
  const product_sku = params.product_sku;
  // api call to get the product from database
  const nejum_api_link = new URL(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`);
  const nejum_response = await fetch(nejum_api_link)
  if (nejum_response.ok) {
    // Handle error response
    const product_data = await nejum_response.json()
    // const product: Product = product_data.product;
    console.log(product_data);
    // return <div>{product_data.title}</div>

  } else {
    const error_data = await nejum_response.json();
    console.error("Failed to fetch product:", error_data.message || "Unknown error");
    return <div className={classes.error}>Error fetching product details.</div>;

  }
  return(
    <>Hello</>
  )
}