"use client";
import React, { useEffect, useState } from 'react';
import classes from "./ProductDetailCardNew.module.css"
import { prisma } from "@/lib/prisma";
// import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation'
import { Decimal } from '@prisma/client/runtime/library';
import { Product } from '@/components/ProductGridNew';
// import "@/lib/fotorama/fotorama.js"
// import "@/lib/fotorama/fotorama.css"
// type ProductDetailCardNewProps {
//   product: Product
// }

type ProductDetailCardNewPageProps = {
  product: Product,
  imageFiles: string[]
}




// this product passed down from app/[locale]/product/........./[sku]/page.tsx
function ProductDetailCardNew({ product, imageFiles }: ProductDetailCardNewPageProps) {
  // const pathname = usePathname() // /products/curtains/ready-made/RK24562GW
  // const sku = pathname.split('/')[4]
  // const [product, setProduct] = useState<Product | null>(null);
  // useEffect(()=>{
  //   async function fetchProduct(){
  //     console.log('now sending a fetch request!!!!!!!!!');

  //     const response = await fetch(`http://localhost:3000/api/get_product?sku=${sku}`)
  //     console.log(`your response is: ${response}`);

  //     const fetchedProduct: Product = await response.json();
  //     setProduct(fetchedProduct)
  //   }
  //   fetchProduct();

  // },[sku]);

  const [SelectedThumbIndex, setSelectedThumbIndex] = useState<number | null>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);

  const selectThumb = (index: number) => {
    setSelectedThumbIndex(index);
  };

  const handleNextImage = () => {
    if (SelectedThumbIndex !== null) {
      setSelectedThumbIndex((SelectedThumbIndex + 1) % imageFiles.length);
    }
  };

  const handlePrevImage = () => {
    if (SelectedThumbIndex !== null) {
      setSelectedThumbIndex((SelectedThumbIndex - 1 + imageFiles.length) % imageFiles.length);
    }
  };

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  //   const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
  //   const x = ((e.clientX - left) / width) * 100;
  //   const y = ((e.clientY - top) / height) * 100;
  //   setZoomPosition({ x, y });
  //   setZoomBoxPosition({ x: e.clientX, y: e.clientY });

  // };
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const img = e.currentTarget as HTMLImageElement; // Get the image element
    
    // Get intrinsic dimensions of the image
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
  
    // Get rendered dimensions and position of the image
    const rect = img.getBoundingClientRect();
    
    // Calculate the mouse position relative to the rendered image size
    const xRelative = (e.clientX - rect.left) / rect.width;
    const yRelative = (e.clientY - rect.top) / rect.height;
  
    // Convert the relative position to the intrinsic size
    const xPercent = xRelative * 100; // Percentage position within the image
    const yPercent = yRelative * 100;
  
    // Calculate zoom box position based on the cursor location
    const zoomBoxX = e.clientX - 100; // Offset by half the zoom box size (200px / 2)
    const zoomBoxY = e.clientY - 100;
  
    setZoomPosition({ x: xPercent, y: yPercent });
    setZoomBoxPosition({ x: zoomBoxX, y: zoomBoxY });
  };

  const handleMouseLeave = () => {
    setZoomPosition(null);
    setZoomBoxPosition(null);
  };

  // const handleImageLoad = () => {
  //   setImageLoaded(false); // Set image loaded state to true when image has loaded
  //   setImageLoaded(true); // Set image loaded state to true when image has loaded
  // };



  if (!product) {
    return <div>Loading...</div>;
  }



  return (
    <div className={classes.ProductDetailCardNew}>
      <div className={classes.detailCardContainer}>
        <div className={classes.productMedia}>
          <div className={classes.thumbs}>
            {/* <div className={` ${classes.thumb} ${classes.thumb_selected}`}></div> */}
            {imageFiles.map((image, index) => {
              return (
                <div
                  className={`${classes.thumb} ${SelectedThumbIndex === index ? classes.thumb_selected : ''}`}
                  key={index}
                  onClick={() => selectThumb(index)}>

                  <div className={classes.img}>
                    <img
                      src={`/image/product/curtain/${product.sku}/${image}`}
                      alt=""
                    // onLoad={handleImageLoad}
                    />
                  </div>

                </div>
              )
            })}
          </div>
          <div className={classes.gallery}>
            <button className={classes.prevButton} onClick={handlePrevImage}>{"<"}</button>
            <div
              className={imageLoaded ? ` ${classes.img} ${classes.loaded}` : `${classes.img}`}
            >

              <img
                src={`/image/product/curtain/${product.sku}/${imageFiles[SelectedThumbIndex ?? 0]}`}
                alt=""
                // onLoad={handleImageLoad}
                // className={imageLoaded ? `${classes.loaded}` : ''}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {zoomPosition && zoomBoxPosition && (
                <div
                  className={classes.zoom}
                  style={{
                    backgroundImage: `url(/image/product/curtain/${product.sku}/${imageFiles[SelectedThumbIndex ?? 0]})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    top: `${zoomBoxPosition.y}px`,
                    left: `${zoomBoxPosition.x}px`,
                    // transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>

            <button className={classes.nextButton} onClick={handleNextImage}>{">"}</button>
            {/* <img src="/media/products/embroidered_sheer_curtain_fabrics/1798T_G31.webp" alt="" /> */}
          </div>

        </div>
        <div className={classes.productHero}>
          <h2>{product.title}</h2>
          <p>{product.sku}</p>
          {product.price ? <p>{String(product.price)}</p> : <></>}

        </div>
      </div>
    </div>
  )
}

export default ProductDetailCardNew