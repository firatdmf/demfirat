import ProductDetailCardNew from "@/components/ProductDetailCardNew"
// import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { Product } from "@/components/ProductGridNew";
// import { useRouter } from 'next/router'
// interface ProductDetailCardProps{
//   product: Product | null;
// }

// interface Params {
//   sku: string;
// }

interface PageProps {
  params: {
    sku:string
  }
}

// Params is an object that is passed from the url so you put braces around it.
async function page({ params }:PageProps) {
  // const router = useRouter()
  // const {asd} = router.query
  // const {asd} = params
  const sku = params.sku
  const product = await prisma.marketing_product.findFirst({
    where: {
      sku: sku as string,
    },
  });

  return (
    <div>
      <p>Hello {sku}</p>
      <p>Your product title is: {product?.title}</p>
      
    </div>
  )
}
export default page
