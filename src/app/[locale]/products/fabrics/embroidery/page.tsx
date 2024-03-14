import classes from "./page.module.css";
import ProductGrid from "@/components/ProductGrid";
// below two packages is to get session information in server
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { User } from "@/app/user";
import { useTranslations } from "next-intl";

// type Product = {
//   name:string,
// }

// It was async before but it didn't work with useTranslations so I changed it back to normal
// async function Embroidery() {
function Embroidery() {
  // below is to get the session information and display it
  // authOptions is the same info that is in api/auth/[...nextauth]/route.ts
  // const session = await getServerSession(authOptions);
  // const mydata = data[0]
  const product = {
    name: "products_embroidered_sheer_curtain_fabrics",
  };
  const ProductsGridT= useTranslations('ProductsGrid')
  return (
    <div className={classes.EmbroideryPage}>
      {/* <h2>Server Session</h2>
      <pre>{JSON.stringify(session)}</pre>
      <h2>Client Call</h2>
      <User/> */}
      {/* <ProductGrid product={product} /> */}
      <ProductGrid HeadlineT={ProductsGridT('Headline')} SearchBarT={ProductsGridT('SearchBar')} />
    </div>
  );
}

export default Embroidery;
