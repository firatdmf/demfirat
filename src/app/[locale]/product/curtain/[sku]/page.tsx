import ProductDetailCardNew from "@/components/ProductDetailCardNew"
// import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { Product, ProductVariant } from "@/components/ProductGridNew";
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
}



// Params is an object that is passed from the url so you put braces around it.
async function page({ params }: PageProps) {

  // const router = useRouter()
  // const {asd} = router.query
  // const {asd} = params
  const sku = params.sku
  const product: Product | null = await prisma.marketing_product.findFirst({
    where: {
      // sku: sku as string,
      sku: sku,
    },
  });
  // const productVariant: ProductVariant[] | null = await prisma.marketing_productvariant.findMany({
  //   where: {
  //     product_id: product?.id
  //   }
  // })
  // console.log("your product variants are");
  // console.log(productVariant);




  let imageFiles: string[] = [];

  if (product && product.sku) {
    const productImageFolder = path.join(process.cwd(), 'public', 'image', 'product', 'curtain', product.sku);

    fs.readdir(productImageFolder, (err: NodeJS.ErrnoException | null, files: string[]) => {
      if (err) {
        console.error(err);
        return;
      }
      files.forEach((file) => { imageFiles.push(file) })
      imageFiles.push()

    });
  }

  // console.log(imageFiles);


  return (
    <>

      {product ?
        <div>
          <ProductDetailCardNew product={product} imageFiles={imageFiles} />
        </div> : `No product found with sku: ${sku}`}


    </>
  )
}
export default page
