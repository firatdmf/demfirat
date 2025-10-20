"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import classes from "./ProductDetailCard.module.css";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue, ProductFile, ProductCategory } from '@/lib/interfaces';
import { useSession } from 'next-auth/react';


type ProductDetailCardPageProps = {
  product: Product,
  product_category: string | null;
  product_variants: ProductVariant[] | null,
  product_variant_attributes: ProductVariantAttribute[] | null,
  product_variant_attribute_values: ProductVariantAttributeValue[] | null,
  searchParams: { [key: string]: string | string[] | undefined };
  product_files: ProductFile[] | null;
  locale?: string;
};

function ProductDetailCard({
  product,
  product_category,
  product_variants,
  product_variant_attributes,
  product_variant_attribute_values,
  searchParams,
  product_files,
  locale = 'en'
}: ProductDetailCardPageProps) {

  const placeholder_image_link = "https://res.cloudinary.com/dnnrxuhts/image/upload/v1750547519/product_placeholder.avif";

  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [filteredImages, setFilteredImages] = useState<ProductFile[]>([]);

  // console.log("your product images are:", product_files);



  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // handle unauthenticated
      console.log("Not logged in!: " + status);
    },
  });

  // Find the selected variant based on selectedAttributes
  //   const findSelectedVariant = () => {
  //     console.log(product_variants);

  //     console.log(product_variant_attribute_values);


  //     return product_variants?.find(variant => {
  //       const variantAttributes = product_variant_attribute_values?.filter(

  //         vav => String(vav.product_variant_id) === String(variant.id)
  //       );
  //       console.log("variantAttributes:", variantAttributes);

  //       return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
  //         const attrDef = product_variant_attributes?.find(attr => attr.name === attrName);
  //         if (!attrDef) return false;
  //         const valueObj = variantAttributes?.find(
  //           vav => String(vav.product_variant_attribute_id) === String(attrDef.id)
  //         );
  //         // console.log("selected variant:", valueObj && valueObj.product_variant_attribute_value === attrValue; )
  //       return valueObj && valueObj.product_variant_attribute_value === attrValue;
  //     });
  //   });
  // };

  const findSelectedVariant = () => {
    if (!product_variants || !product_variant_attributes || !product_variant_attribute_values) return undefined;
    // console.log("All variants:", product_variants);
    // console.log("All attribute values:", product_variant_attribute_values);
    // console.log("Selected attributes:", selectedAttributes);
    // selected attribute is set with url parameters.

    // --------------
    // return Object.entries(selectedAttributes).forEach(([key, value]) => {
    //   let product_variant_attribute = product_variant_attributes?.find(attr => attr.name === key)
    //   let product_variant_attribute_value = product_variant_attribute_values?.find(val => String(val.product_variant_attribute_id) === String(product_variant_attribute?.id && val.product_variant_attribute_value === value));
    //   let product_variant = product_variants?.find(variant => variant.product_variant_attribute_values?.some(vav => vav === product_variant_attribute_value?.id));
    // }
    // )
    // ----------

    return product_variants.find(variant => {
      // For each selected attribute, check if the variant has the matching attribute value
      return Object.entries(selectedAttributes).every(([key, value]) => {
        // Find the attribute definition by name
        const attrDef = product_variant_attributes.find(attr => attr.name === key);
        if (!attrDef) return false;

        // Find the attribute value object by attribute id and value
        const valueObj = product_variant_attribute_values.find(
          val =>
            String(val.product_variant_attribute_id) === String(attrDef.id) &&
            val.product_variant_attribute_value === value
        );
        if (!valueObj) return false;

        // Check if the variant includes this attribute value's id
        return variant.product_variant_attribute_values?.includes(valueObj.id);
      });
    });
  };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(findSelectedVariant());


  // const selectedVariant = findSelectedVariant();

  // selectedVariant = 
  //   {
  //   id: '6',
  //   variant_sku: 'RK24562GC9',
  //   variant_barcode: '712179795235',
  //   variant_quantity: '46',
  //   variant_price: '0',
  //   variant_cost: '15.7',
  //   variant_featured: true,
  //   product_id: '3',
  //   variant_datasheet_url: null,
  //   variant_minimum_inventory_level: null,
  //   product_variant_attribute_values:[2538, 2540]
  // }

  // Initialize selectedAttributes from searchParams or defaults
  useEffect(() => {
    const initialAttributes: { [key: string]: string } = {};
    product_variant_attributes?.forEach(attribute => {
      const value = searchParams[attribute.name ?? ''] as string;
      if (value) {
        initialAttributes[attribute.name ?? ''] = value;
      } else {
        const firstValue = product_variant_attribute_values?.find(
          val => val.product_variant_attribute_id === attribute.id
        )?.product_variant_attribute_value;
        if (firstValue) {
          initialAttributes[attribute.name ?? ''] = firstValue;
        }
      }
    });
    setSelectedAttributes(initialAttributes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_variant_attributes, product_variant_attribute_values, searchParams]);



  // 

  useEffect(() => {
    console.log("now this is running my fellas");
    Object.entries(selectedAttributes).forEach(([key, value]) => {

      let product_variant_attribute = product_variant_attributes?.find(attr => attr.name === key)
      let product_variant_attribute_value = product_variant_attribute_values?.find(
        vav => String(vav.product_variant_attribute_id) === String(product_variant_attribute?.id)
          && vav.product_variant_attribute_value === value
      )
      let product_variant = product_variants?.find(variant => variant.product_variant_attribute_values?.some(vav => vav === product_variant_attribute_value?.id))
    }
    )


    setSelectedVariant(findSelectedVariant());
    console.log("selected variant updated to:", findSelectedVariant());

  }, [selectedAttributes, product_variants, product_variant_attributes, product_variant_attribute_values]);

  // 

  // Filter images for the selected variant
  useEffect(() => {
    console.log("selected variant id:", selectedVariant?.id)
    if (!product_files) {
      setFilteredImages([]);
      return;
    }
    if (selectedVariant?.id) {
      console.log("you have hit here my friends");

      setFilteredImages(
        product_files.filter(
          img => String(img.product_variant_id) === String(selectedVariant.id)
        )
      );
    } else {
      setFilteredImages(product_files);
    }
    setSelectedThumbIndex(0); // Reset thumb index on variant change
    console.log("Selected Variant: ", selectedVariant);
  }, [selectedVariant, product_files]);
  // console.log("your product variant attributes are:", product_variant_attributes);


  // Group attribute values by attribute and filter out duplicates
  const groupedAttributeValues = product_variant_attributes?.map(attribute => ({
    attribute,
    values: Array.from(
      new Set(
        product_variant_attribute_values
          ?.filter((value: ProductVariantAttributeValue) => value.product_variant_attribute_id === attribute.id)
          .map((value: ProductVariantAttributeValue) => value.product_variant_attribute_value)
      )
    )
  }));
  // = 
  //   [
  //     {
  //         "attribute": {
  //             "id": "1",
  //             "name": "color"
  //         },
  //         "values": [
  //             "blue",
  //             "black"
  //         ]
  //     }
  // ]

  // Update the URL with the selected attributes
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.keys(selectedAttributes).forEach(key => {
      newParams.set(key, selectedAttributes[key]);
    });
    window.history.replaceState({}, '', `?${newParams.toString()}`);
  }, [selectedAttributes]);

  // const getImageUrl = (image: string) => {
  //   if (!image_api_link) return image;
  //   // Remove leading slash if present
  //   return image_api_link.replace(/\/$/, '') + '/' + image.replace(/^\//, '');
  // };

  // Thumbnail/image navigation
  const selectThumb = (index: number) => setSelectedThumbIndex(index);

  const handleNextImage = () => {
    setSelectedThumbIndex((prev) =>
      filteredImages.length ? (prev + 1) % filteredImages.length : 0
    );
  };

  const handlePrevImage = () => {
    setSelectedThumbIndex((prev) =>
      filteredImages.length ? (prev - 1 + filteredImages.length) % filteredImages.length : 0
    );
  };

  // Zoom logic
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const img = e.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const xRelative = (e.clientX - rect.left) / rect.width;
    const yRelative = (e.clientY - rect.top) / rect.height;
    const xPercent = xRelative * 100;
    const yPercent = yRelative * 100;
    const zoomBoxX = e.clientX - 100;
    const zoomBoxY = e.clientY - 100;
    setZoomPosition({ x: xPercent, y: yPercent });
    setZoomBoxPosition({ x: zoomBoxX, y: zoomBoxY });
  };

  const handleMouseLeave = () => {
    setZoomPosition(null);
    setZoomBoxPosition(null);
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    console.log("your attribute name is:", attributeName);
    console.log("and the value is:", value);


    setSelectedThumbIndex(0);
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
    // const newAttributes = { ...selectedAttributes, [attributeName]: value };
    // const newParams = new URLSearchParams(newAttributes).toString();
    // router.replace(`?${newParams}`);
  };


  // Prepare image files for display (fallback to placeholder)
  const imageFiles: string[] =
    filteredImages.length > 0
      ? filteredImages.map(img => img.file)
      // : ["/placeholder.png"];
      : [(placeholder_image_link)];

  // src={}

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={classes.ProductDetailCard} id="ProductDetailCard">
      <div className={classes.detailCardContainer}>
        <div className={classes.productMedia}>
          <div className={classes.thumbs}>
            {imageFiles.map((image, index) => (
              <div
                className={`${classes.thumb} ${selectedThumbIndex === index ? classes.thumb_selected : ''}`}
                key={index}
                onClick={() => selectThumb(index)}
              >
                <div className={classes.img}>
                  <img src={image || placeholder_image_link} alt="product image" />
                </div>
              </div>
            ))}
          </div>
          <div className={classes.gallery}>
            <button className={classes.prevButton} onClick={handlePrevImage}>{"<"}</button>
            <div className={imageLoaded ? ` ${classes.img} ${classes.loaded}` : `${classes.img}`}>
              <Link href={(imageFiles[selectedThumbIndex]
                || placeholder_image_link)} target="_blank"
                onClick={e => {
                  e.preventDefault();
                  window.open(
                    ((imageFiles[selectedThumbIndex] || placeholder_image_link),
                      'targetWindow',
                      'width=500,height=500'
                    ));
                }}>

                <img
                  // src={getImageUrl(imageFiles[selectedThumbIndex]) || "/placeholder.png"}
                  src={(imageFiles[selectedThumbIndex]
                    || placeholder_image_link)}
                  alt=""
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onLoad={() => setImageLoaded(true)}
                />
              </Link>
              {zoomPosition && zoomBoxPosition && (
                <div
                  className={classes.zoom}
                  style={{
                    backgroundImage: `url(${imageFiles[selectedThumbIndex]})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    top: `${zoomBoxPosition.y}px`,
                    left: `${zoomBoxPosition.x}px`,
                  }}
                />
              )}
            </div>
            <button className={classes.nextButton} onClick={handleNextImage}>{">"}</button>
          </div>
        </div>
        <div className={classes.productHero}>
          <h2>{product.title}</h2>
          <p>SKU: {product.sku}</p>
          {product_category ? <p className={classes.productCategory}>{product_category.toString()}</p> : null}


          {/* If the product has variants, display the variant information. */}
          {product_variant_attributes && product_variant_attributes.length > 0 ? (
            <div className={classes.variant_menu}>
              <ul>
                {groupedAttributeValues?.map(({ attribute, values }) => (
                  <li key={attribute.id.toString()}>
                    <label><h3>{attribute.name}</h3></label>
                    <div className={classes.variant_links}>
                      {values.map((value: string) => {
                        const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                        const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                        return (
                          <div key={value}>
                            <Link
                              href={href}
                              replace
                              className={`${classes.link} ${isChecked ? classes.checked_variant_link : ""}`}
                              onClick={e => {
                                e.preventDefault();
                                handleAttributeChange(attribute.name ?? '', value);
                              }}
                            >
                              {/* replace underscored with spaces for better client visual */}
                              {value.replace(/_/g," ")} 
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
              <div className={classes.variant_info}>
                {selectedVariant && <p>Variant SKU: {selectedVariant.variant_sku}</p>}
                {selectedVariant && selectedVariant.variant_price ? (
                  <p>Price: ${String(selectedVariant.variant_price)}</p>
                ) : (
                  <p>Price: ${String(product.price)}</p>
                )}
                {selectedVariant && selectedVariant.variant_quantity ? (
                  <p>Available Quantity: {Number(selectedVariant.variant_quantity)}</p>
                ) : (
                  <p>Available Quantity: {Number(product.quantity)}</p>
                )}
                {selectedVariant && selectedVariant.variant_barcode ? (
                  <p>Variant Barcode Number: {selectedVariant.variant_barcode}</p>
                ) : (
                  <p>Barcode: {product.barcode}</p>
                )}
                {/* {selectedVariant && selectedVariant.variant_cost ? (<>
                  <p>Variant Cost: ${String(selectedVariant.variant_cost)}</p>
                  <button type='submit'>Add to Cart</button>
                </>
                ) : (
                  product.price ? <>
                    <p>Cost: ${product.price}</p>
                    <button type='submit'>Add to Cart</button>
                  </> : <></>
                )} */}
              </div>
            </div>
          ) :
            <div className={classes.parent_product_info}>

            </div>
          }

          {/* {selectedVariant && <p>Variant SKU: {selectedVariant.variant_sku}</p>} */}

          {/* {status === "authenticated" && product.price && !selectedVariant ? (
            <div>
              <p>${String(product.price)}</p>
              <button type='submit'>Add to Cart</button>
            </div>
          ) : null} */}
          <h3>
            {locale === 'tr' ? 'Açıklama' :
             locale === 'ru' ? 'Описание' :
             locale === 'pl' ? 'Opis' :
             locale === 'de' ? 'Beschreibung' :
             'Description'}
          </h3>
          <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>

        </div>
      </div>
    </div>
  );
}

export default ProductDetailCard;