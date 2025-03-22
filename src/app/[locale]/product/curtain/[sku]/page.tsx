import ProductDetailCardNew from "@/components/ProductDetailCardNew"
// import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { Product, ProductVariant } from "@/components/ProductGridNew";
import { ProductVariantAttribute } from "@/components/ProductGridNew";
import { ProductVariantAttributeValue } from "@/components/ProductGridNew";
import fs from 'fs'
import path from 'path'
// import { useRouter } from 'next/router'
// interface ProductDetailCardProps{
//   product: Product | null;
// }

// interface Params {
//   sku: string;
// }

interface PageProps {
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
}

type image_directories = {
  thumbnail: string;
  main_images: string[];
  variant_images: {
    [key: string]: string[];
  };
};




// Params is an object that is passed from the url so you put braces around it.
async function page({ params, searchParams }: PageProps) {

  // const router = useRouter()
  // const {asd} = router.query
  // const {asd} = params
  const sku = params.sku

  // make api call to get the product from database
  let data: Data
  let product
  let product_variants: ProductVariant[] = []
  let product_variant_attributes: ProductVariantAttribute[] = []
  let product_variant_attribute_values: ProductVariantAttributeValue[] = []
  let product_category = null
  const api_link = new URL(`${process.env.NEXTAUTH_URL}/api/get_product?sku=${sku}`);
  const response = await fetch(api_link)
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

  } else {
    const message = await response.json()
    console.log(message)
  }


  let image_directories: image_directories = {
    thumbnail: '',
    main_images: [""],
    variant_images: {},
  };


  let imageFiles: string[] = [];
  let variant_images: string[] = []

  if (product && product.sku) {
    const productImageFolder = path.join(process.cwd(), 'public', 'image', 'product', 'curtain', product.sku);

    try {
      const files = fs.readdirSync(productImageFolder);
      // folders represent variant skus
      const variant_folders = files.filter(file => !file.includes("."))
      console.log(variant_folders);
      variant_folders.map((variant_folder) => {
        variant_images = fs.readdirSync(path.join(productImageFolder, variant_folder));
        // image_directories.variant_images[folder] = folders.map(image => `image/product/curtain/${product.sku}/${folder}/${image}`);
        image_directories.variant_images[variant_folder] = variant_images.map(image => `/image/product/curtain/${product.sku}/${variant_folder}/${image}`);

      })
      // image_directories.variants = fs.readdirSync()


      const photoExtensions = /\.(jpg|jpeg|png|gif|avif|webp)$/i;
      imageFiles = files.filter(file => photoExtensions.test(file) && !file.includes('thumbnail'));
    } catch (err) {
      console.error(err);
    }
  }

  console.log('your image files are: ');
  console.log(imageFiles);

  console.log("your object is");
  console.log(image_directories);



  // imageFiles.map((file) => console.log(file))


  return (
    <>

      {product ?
        <div>
          <ProductDetailCardNew product={product} product_variants={product_variants} product_variant_attributes={product_variant_attributes} product_variant_attribute_values={product_variant_attribute_values} product_category={product_category} imageFiles={imageFiles} searchParams={searchParams} image_directories = {image_directories} />
        </div> : `No product found with sku: ${sku}`}


    </>
  )
}
export default page
