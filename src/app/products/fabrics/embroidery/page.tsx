import classes from '@/app/products/fabrics/embroidery/page.module.css'
import ProductGrid from '@/components/ProductGrid'

// type Product = {
//   name:string,
// }
function Embroidery() {
  // const mydata = data[0]
  const product = {
    name:'products_embroidered_sheer_curtain_fabrics',
  }
  return (
    <div className={classes.EmbroideryPage}>
      {/* <ProductCard product={mydata}/> */}
      <ProductGrid product={product}/>
    </div>
  )
}

export default Embroidery