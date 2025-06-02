"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import classes from "./ProductDetailCard.module.css";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from '@/lib/interfaces';
import { useSession } from 'next-auth/react';
import { ProductFile } from '@/lib/interfaces';

type ProductDetailCardPageProps = {
  product: Product,
  product_variants: ProductVariant[] | null,
  product_variant_attributes: ProductVariantAttribute[] | null,
  product_variant_attribute_values: ProductVariantAttributeValue[] | null,
  // imageFiles: string[],
  product_category: string | null;
  searchParams: { [key: string]: string | string[] | undefined };
  image_directories: {
    thumbnail: string;
    main_images: string[];
    variant_images: {
      [key: string]: string[];
    };
  }
  product_images: ProductFile[] | null;
}

type ImageDirectories = {
  thumbnail: string;
  main_images: string[];
  variant_images: {
    [key: string]: string[];
  };
};

// this product passed down from app/[locale]/product/........./[sku]/page.tsx
function ProductDetailCard(
  {
    product,
    product_category,
    product_variants,
    product_variant_attributes,
    product_variant_attribute_values,
    image_directories,
    searchParams,
    product_images
  }: ProductDetailCardPageProps) {
  const [SelectedThumbIndex, setSelectedThumbIndex] = useState<number | null>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [productImages, setProductImages] = useState<ProductFile[]>(product_images || []);

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user not authenticated, handle here
      console.log("Not logged in!: " + status);
    },
  });

  // Function to find the corresponding product variant based on selected attribute values
  const findSelectedVariant = () => {
    return product_variants?.find(variant => {
      // Get all attribute values for this variant
      const variantAttributes = product_variant_attribute_values?.filter(
        vav => String(vav.product_variant_id) === String(variant.id)
      );
      // Check if every attribute in the URL matches this variant's attribute values
      return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
        // Find the attribute definition (to get its id)
        const attrDef = product_variant_attributes?.find(attr => attr.name === attrName);
        if (!attrDef) return false;
        // Find the value for this attribute in this variant
        const valueObj = variantAttributes?.find(
          vav => String(vav.product_variant_attribute_id) === String(attrDef.id)
        );
        return valueObj && valueObj.product_variant_attribute_value === attrValue;
      });
    });
  };


  const selectedVariant = findSelectedVariant();
  console.log("----------------------------------------------------");
  console.log("your selected variant is:");
  console.log(selectedVariant);
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
  //   variant_minimum_inventory_level: null
  // }
  console.log("----------------------------------------------------");

  // Initialize searchParams with default selections
  useEffect(() => {
    const initialAttributes: { [key: string]: string } = {};
    product_variant_attributes?.forEach(attribute => {
      const value = searchParams[attribute.name ?? ''] as string;
      if (value) {
        initialAttributes[attribute.name ?? ''] = value;
      } else {
        const firstValue = product_variant_attribute_values?.find(val => val.product_variant_attribute_id === attribute.id)?.product_variant_attribute_value;
        if (firstValue) {
          initialAttributes[attribute.name ?? ''] = firstValue;
        }
      }
    });
    setSelectedAttributes(initialAttributes);
    // console.log("your initial attributes are:");
    // console.log(initialAttributes);

    setProductImages((product_images ?? []).filter((image) => {
      // Filter images based on the selected variant SKU
      if (selectedVariant?.id) {
        console.log('hi');
        console.log(image.product_variant_id === selectedVariant.id);
        return image.product_variant_id === selectedVariant.id;
      }
      // If no variant is selected, return all images
      return true;
    }));

    console.log("your product images after filtering by variant are:");
    console.log(productImages);


  }, [product_variant_attributes, product_variant_attribute_values, searchParams]);


  // below two added later

  useEffect(() => {
    if (!product_images) {
      setProductImages([]);
      return;
    }
    if (selectedVariant?.id) {
      setProductImages(
        product_images.filter(
          (image) => String(image.product_variant_id) === String(selectedVariant.id)
        )
      );
    } else {
      setProductImages(product_images);
    }
  }, [selectedVariant, product_images]);

  // 3. If you want to see the updated images, use another useEffect:
  useEffect(() => {
    console.log("your product images after filtering by variant are:");
    console.log(productImages);
  }, [productImages]);

  // console.log("your product_variant_attributes aree -----------");
  // console.log(product_variant_attributes);


  // need an explanation of below later

  let imageFiles: string[] = [];
  if (selectedVariant?.variant_sku && image_directories.variant_images[selectedVariant.variant_sku]?.length) {
    imageFiles = image_directories.variant_images[selectedVariant.variant_sku];
  } else if (image_directories.main_images?.length) {
    imageFiles = image_directories.main_images;
  }

  // Fallback to a placeholder image if no images are available
  if (!imageFiles.length) {
    imageFiles = ["/placeholder.png"]; // Make sure this exists in your public folder
  }

  // Update the URL with the selected attributes
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.keys(selectedAttributes).forEach(key => {
      newParams.set(key, selectedAttributes[key]);
    });
    window.history.replaceState({}, '', `?${newParams.toString()}`);
    console.log("your selected attributes are:");

    console.log(selectedAttributes);

  }, [selectedAttributes]);

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

  // console.log("your product_variant_attribute_values is");
  // console.log(product_variant_attribute_values);


  // Group attribute values by attribute and filter out duplicates
  const groupedAttributeValues = product_variant_attributes?.map(attribute => ({
    attribute,
    values: Array.from(new Set(product_variant_attribute_values?.filter((value: ProductVariantAttributeValue) => value.product_variant_attribute_id === attribute.id)
      .map((value: ProductVariantAttributeValue) => value.product_variant_attribute_value)))
  }));

  // console.log("your grouped attribute values are:");
  // console.log(groupedAttributeValues);



  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedThumbIndex(0); // Reset the selected thumb index to 0
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={classes.ProductDetailCard}>
      <div className={classes.detailCardContainer}>
        <div className={classes.productMedia}>
          <div className={classes.thumbs}>
            {selectedVariant && selectedVariant.variant_sku && image_directories.variant_images[selectedVariant.variant_sku] ? image_directories.variant_images[selectedVariant.variant_sku].map((image, index) => {
              return (
                <div
                  className={`${classes.thumb} ${SelectedThumbIndex === index ? classes.thumb_selected : ''}`}
                  key={index}
                  onClick={() => selectThumb(index)}>
                  <div className={classes.img}>
                    <img
                      src={image}
                      alt=""
                    />
                  </div>
                </div>
              )
            }) :
              image_directories.main_images.map((image, index) => {
                return (
                  <div
                    className={`${classes.thumb} ${SelectedThumbIndex === index ? classes.thumb_selected : ''}`}
                    key={index}
                    onClick={() => selectThumb(index)}>
                    <div className={classes.img}>
                      <img
                        src={image}
                        alt=""
                      />
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className={classes.gallery}>
            <button className={classes.prevButton} onClick={handlePrevImage}>{"<"}</button>
            <div
              className={imageLoaded ? ` ${classes.img} ${classes.loaded}` : `${classes.img}`}
            >
              <img
                src={`${imageFiles[SelectedThumbIndex ?? 0]}`}
                alt=""
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {zoomPosition && zoomBoxPosition && (
                <div
                  className={classes.zoom}
                  style={{
                    backgroundImage: `url(${imageFiles[SelectedThumbIndex ?? 0]})`,
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
          {product_category ? <p className={classes.productCategory}>{product_category.toString()}</p> : <></>}
          <div className={classes.variant_menu}>
            <ul >
              {groupedAttributeValues?.map(({ attribute, values }) => (
                <li key={attribute.id.toString()}>
                  <label>{attribute.name}</label>
                  <div className={classes.variant_links}>
                    {values.map((value: any) => {
                      const href = `?${new URLSearchParams({ ...selectedAttributes, [attribute.name ?? '']: value }).toString()}`;
                      const paramKey = String(attribute.name);
                      const paramValue = String(value);

                      const isChecked = selectedAttributes[attribute.name ?? ''] === value;
                      return (
                        <div key={value}>
                          <Link href={href} replace className={`${classes.link} ${isChecked ? classes.checked_variant_link : ""}`} onClick={() => handleAttributeChange(attribute.name ?? '', value)}>
                            {value}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {selectedVariant && <p>Variant SKU: {selectedVariant.variant_sku}</p>}

          {status === "authenticated" && product.price ? <div>
            <p>${String(product.price)}</p>
            <button type='submit'>Add to Cart</button>
          </div> : <></>}
          <h3>Description</h3>
          <ul>
            <li>Width: 120 inches</li>
            <li>Composition: PES</li>
            <li>Estimated Delivery Time: 3-4 weeks</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailCard;