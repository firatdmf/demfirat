import ProductDetailCard from "@/components/ProductDetailCard"
// import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { Product, ProductVariant, ProductVariantAttributeValue, ProductVariantAttribute } from "@/lib/interfaces";
import fs from 'fs'
import path from 'path'
import { ProductFile } from "@/lib/interfaces";
// import { useRouter } from 'next/router'
// interface ProductDetailCardProps{
//   product: Product | null;
// }

// interface Params {
//   sku: string;
// }

interface PageParamProps {
  params: {
    sku: string
  }
  searchParams: { [key: string]: string | string[] | undefined };
}

type Data = {
  product: Product;
  product_category: string | null;
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  product_images: ProductFile[];
}

type image_directories = {
  thumbnail: string;
  main_images: string[];
  variant_images: {
    [key: string]: string[];
  };
};





// Params is an object that is passed from the url so you put braces around it.
async function page({ params, searchParams }: PageParamProps) {

  // const router = useRouter()
  // const {asd} = router.query
  // const {asd} = params
  const sku = params.sku

  // make api call to get the product from database
  let data: Data;
  let product: Product | null = null;
  let product_variants: ProductVariant[] = [];
  let product_variant_attributes: ProductVariantAttribute[] = [];
  let product_variant_attribute_values: ProductVariantAttributeValue[] = [];
  let product_category = null;
  let product_images: ProductFile[] = [];
  // console.log("your sku is ");
  // console.log(sku);


  const api_link = new URL(`${process.env.NEXTAUTH_URL}/api/get_product?sku=${sku}`);
  const response = await fetch(api_link)
  const image_api_link = new URL(`${process.env.NEJUM_API_URL}media/`);
  if (response.ok) {
    data = await response.json();
    // console.log("your data is");
    // console.log(data);
    product = data.product

    product_category = data.product_category

    product_variants = data.product_variants
    // console.log(product_variants);
    product_variant_attributes = data.product_variant_attributes
    product_variant_attribute_values = data.product_variant_attribute_values
    product_images = data.product_images;

  } else {
    const response_text = await response.text()
    try {
      const response_message = JSON.parse(response_text)
      console.log(response_message);

    } catch {
      console.log("Non-JSON error response:", response_text);
    }
  }

  console.log("your product images are");
  console.log(product_images);



  let image_directories: image_directories = {
    thumbnail: '',
    main_images: [""],
    variant_images: {},
  };


  let imageFiles: string[] = [];
  let variant_images: string[] = []


  // console.log('your image files are: ');
  // console.log(imageFiles);

  // console.log("your object is");
  // console.log(image_directories);



  // imageFiles.map((file) => console.log(file))


  return (
    <>

      {product ?
        <div>
          <ProductDetailCard
            product={product}
            product_category={product_category}
            product_variants={product_variants}
            product_variant_attributes={product_variant_attributes}
            product_variant_attribute_values={product_variant_attribute_values}
            // imageFiles={imageFiles} 
            searchParams={searchParams}
            // image_directories={image_directories}
            product_files={product_images}
            image_api_link={image_api_link.toString()}

          />
        </div> : `No product found with sku: ${sku}`}


    </>
  )
}
export default page
