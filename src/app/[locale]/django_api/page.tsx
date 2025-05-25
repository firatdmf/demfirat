import React from 'react'
import classes from "@/app/[locale]/trash/page.module.css"
import { Product,Product_API } from '@/lib/interfaces';

export default async function page() {
  // if (process.env.NODE_ENV === "production") {
  const startTime = performance.now()
  const nejum_api_link = new URL(`${process.env.NEJUM_API_URL}/marketing/api/get_products`);
  const nejum_response = await fetch(nejum_api_link)
  const endTime = performance.now()
  console.log(`Call to do took ${endTime - startTime} milliseconds`)
  let products = [];
  if (nejum_response.ok) {
    products = await nejum_response.json()
    console.log(products);

  } else {
    console.log("response was bad");

  }
  const data = await fetch('https://api.vercel.app/blog')
  return (<>

    <div>I am trash</div>
    <div>
      {products.map((product: Product_API,index:number) => {
        return <p key={index}>{product.fields.title} | pk:{product.pk}</p>
      })}
    </div>

  </>
  )
}
