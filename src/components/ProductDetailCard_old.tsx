"use client";
import "@/components/ProductDetailCard_old.css";
import { useState, useEffect, useRef } from "react";
import data from "@/vir_db/products_embroidered_sheer_curtain_fabrics.json";
import { notFound } from "next/navigation";
import Image from "next/image";
interface pageProps {
  design: string;
  designT: string;
  widthT: string;
  originT: string;
  wantASampleT: string;
  sendEmailT: string;
}
// function ProductDetailCard({ design }: any) {
function ProductDetailCard({
  design,
  designT,
  widthT,
  originT,
  wantASampleT,
  sendEmailT,
}: pageProps) {
  // console.log(typeof(design));

  // const API_URL = "/api/fabrics/";
  // const pathname = window.location.pathname;
  // const design = pathname.substring(pathname.lastIndexOf("/") + 1);
  // const design = data.design
  const [mainImageUrl, setMainImageUrl] = useState<any>();
  const [selectedVariant, setSelectedVariant] = useState();
  let findObjectWithKey = (array: any, key: any, value: any) => {
    let object;
    array.forEach((item: any, index: number) => {
      if (item[key] === value) {
        object = item;
        // console.log("matched");
      }
    });
    return object;
  };
  const [products, setProducts] = useState<any>(data);
  // console.log(data);

  const [product, setProduct] = useState<any>(
    findObjectWithKey(data, "design", design)
  );

  let designInitial = (designName: any) => {
    if (designName.length === 0) {
      return "undefined";
    } else if (designName.length === 5) {
      return "K";
    } else if (designName.length === 4 && designName[0] === "8") {
      return "K";
    } else {
      return "N";
    }
  };

  const capitalize = function (string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  let getVariants = (productInput: any) => {
    let variantArray: any = [];
    productInput["files"].forEach((item: any) => {
      if (item.variant !== "") {
        variantArray.push([capitalize(item.variant)]);
      }
    });
    return variantArray;
  };

  // -------------------------------------------------
  // I am keeping below just to be safe, I put them in useEffect because otherwise document is undefined
  // below is for settings the image carousel look
  // below is for settings the image carousel look
  // const imgs = document.querySelectorAll(".img-select a");
  // const imgBtns = [...imgs];
  // let imgId:number = 1;

  // imgBtns.forEach((imgItem) => {
  //   imgItem.addEventListener("click", (event) => {
  //     event.preventDefault();
  //     if(imgItem instanceof HTMLElement){

  //       imgId = parseInt(imgItem.dataset.id!)
  //       slideImage();
  //     }
  //   });
  // });

  // function slideImage() {
  //   const displayWidth = document.querySelector(
  //     ".img-showcase img:first-child"
  //   )!.clientWidth;

  //   (
  //     document.querySelector(".img-showcase") as HTMLElement
  //   ).style.transform = `translateX(${-(imgId - 1) * displayWidth}px)`;
  // }

  // window.addEventListener("resize", slideImage);
  // -------------------------------------------------

  useEffect(() => {
    const imgs = document.querySelectorAll(".img-select a");
    const imgBtns = [...imgs];
    let imgId: number = 1;
    function slideImage() {
      const displayWidth = document.querySelector(
        ".img-showcase img:first-child"
      )!.clientWidth;

      (
        document.querySelector(".img-showcase") as HTMLElement
      ).style.transform = `translateX(${-(imgId - 1) * displayWidth}px)`;
    }

    window.addEventListener("resize", slideImage);
    imgBtns.forEach((imgItem) => {
      imgItem.addEventListener("click", (event) => {
        event.preventDefault();
        if (imgItem instanceof HTMLElement) {
          imgId = parseInt(imgItem.dataset.id!);
          slideImage();
        }
      });
    });
    // console.log(productVariants.length);
    // setvariantUrl(variantArray[0]);
    // console.log(design);
    // console.log(product);
    // console.log(productVariants);
    if (product) {
      setMainImageUrl(
        "/media/products/embroidered_sheer_curtain_fabrics/" + product.files[0].name
      );
    }
  }, []);

  if (!product) {
    return notFound();
  } else {
    // image carousel finishes here
    return (
      <div className="ProductDetailCardPage" id="ProductDetailCardPage">
        <div className="card-wrapper">
          <div className="card">
            {/* card left */}
            <div className="product-imgs">
              <div className="img-display">
                {/* <div className="img-showcase" ref={imgShowcaseRef}> */}
                <div className="img-showcase">
                  {product.files.map((item: any, index: number) => {
                    return (
                      // <Image
                      //   key={index}
                      //   src={
                      //     "/media/products/embroidered_sheer_curtain_fabrics/" +
                      //     item.name
                      //   }
                      //   // src={mainImageUrl}
                      //   alt={item.name}
                      //   height={500}
                      //   width={500}
                      //   onClick={() =>
                      //     window.open(
                      //       "/media/products/embroidered_sheer_curtain_fabrics/" +
                      //         item.name,
                      //       "_blank"
                      //     )
                      //   }
                      // />
                      <img
                        key={index}
                        src={
                          "/media/products/embroidered_sheer_curtain_fabrics/" +
                          item.name
                        }
                        // src={mainImageUrl}
                        alt={item.name}
                        height={500}
                        width={500}
                        onClick={() =>
                          window.open(
                            "/media/products/embroidered_sheer_curtain_fabrics/" +
                              item.name,
                            "_blank"
                          )
                        }
                      />
                    );
                  })}
                </div>
              </div>
              <div className="img-select">
                {product.files.map((item: any, index: number) => {
                  return (
                    <div className="img-item" key={index}>
                      <a href="" data-id={index + 1}>
                        {"/media/products/embroidered_sheer_curtain_fabrics/" +
                          item.name ===
                        mainImageUrl ? (
                          // <Image
                          //   src={
                          //     "/media/products/embroidered_sheer_curtain_fabrics/" +
                          //     item.name
                          //   }
                          //   alt=""
                          //   className="clicked"
                          //   height={500}
                          //   width={500}
                          //   onClick={() => {
                          //     setMainImageUrl(
                          //       "/media/products/embroidered_sheer_curtain_fabrics/" +
                          //         item.name
                          //     );
                          //   }}
                          // />
                          <img
                            src={
                              "/media/products/embroidered_sheer_curtain_fabrics/" +
                              item.name
                            }
                            alt=""
                            className="clicked"
                            height={500}
                            width={500}
                            onClick={() => {
                              setMainImageUrl(
                                "/media/products/embroidered_sheer_curtain_fabrics/" +
                                  item.name
                              );
                            }}
                          />
                        ) : (
                          <img
                            src={
                              "/media/products/embroidered_sheer_curtain_fabrics/" +
                              item.name
                            }
                            alt=""
                            className="non-clicked"
                            onClick={() => {
                              setMainImageUrl(
                                "/media/products/embroidered_sheer_curtain_fabrics/" +
                                  item.name
                              );
                            }}
                          />
                        )}
                        <p
                          className="variant-label"
                          onClick={() =>
                            setMainImageUrl(
                              "/media/products/embroidered_sheer_curtain_fabrics/" +
                                item.name
                            )
                          }
                        >
                          {item.variant}
                        </p>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* card right */}
            <div className="product-content">
              <div className="titles">
                <h2 className="product-title">
                  {designInitial(product.design) + product.design}
                </h2>
                <h1 className="karvenTitle">Karven</h1>
              </div>

              <div className="product-detail">
                <ul>
                  <li>
                    {designT}: <span>{product.design}</span>
                  </li>
                  <li>
                    {widthT}: <span>300 cm</span>
                  </li>
                  <li>
                    {originT}: <span>Türkiye</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="sampleRequest">
          <h1>{wantASampleT}</h1>
          <p>{sendEmailT}</p>
        </div>
      </div>
    );
  }
}

export default ProductDetailCard;