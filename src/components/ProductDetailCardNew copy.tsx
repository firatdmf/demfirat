"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import classes from "./ProductDetailCardNew.module.css";
import { Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from '@/components/ProductGridNew';
import { useSession } from 'next-auth/react';

type ProductDetailCardNewPageProps = {
  product: Product,
  product_variants: ProductVariant[],
  product_variant_attributes: ProductVariantAttribute[],
  product_variant_attribute_values: ProductVariantAttributeValue[],
  imageFiles: string[],
  product_category: string | null;
  searchParams: { [key: string]: string | string[] | undefined };
  image_directories: {
    thumbnail: string;
    main_images: string[];
    variant_images: {
      [key: string]: string[];
    };
  }
}

type ImageDirectories = {
  thumbnail: string;
  main_images: string[];
  variant_images: {
    [key: string]: string[];
  };
};

// this product passed down from app/[locale]/product/........./[sku]/page.tsx
function ProductDetailCardNew({ product, product_category, product_variants, product_variant_attributes, product_variant_attribute_values, image_directories, searchParams }: ProductDetailCardNewPageProps) {
  const [SelectedThumbIndex, setSelectedThumbIndex] = useState<number | null>(0);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number, y: number } | null>(null);
  const [zoomBoxPosition, setZoomBoxPosition] = useState<{ x: number, y: number } | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user not authenticated, handle here
      console.log("Not logged in!: " + status);
    },
  });

  // Initialize searchParams with default selections
  useEffect(() => {
    const initialAttributes: { [key: string]: string } = {};
    product_variant_attributes.forEach(attribute => {
      const value = searchParams[attribute.name ?? ''] as string;
      if (value) {
        initialAttributes[attribute.name ?? ''] = value;
      } else {
        const firstValue = product_variant_attribute_values.find(val => val.attribute_id === attribute.id)?.value;
        if (firstValue) {
          initialAttributes[attribute.name ?? ''] = firstValue;
        }
      }
    });
    setSelectedAttributes(initialAttributes);
  }, [product_variant_attributes, product_variant_attribute_values, searchParams]);

  // Function to find the corresponding product variant based on selected attribute values
  const findSelectedVariant = () => {
    return product_variants.find(variant => {
      return product_variant_attributes.every(attribute => {
        const paramValue = selectedAttributes[attribute.name ?? ''];
        const matchingValue = product_variant_attribute_values.find(value => value.attribute_id === attribute.id && value.variant_id === variant.id);
        return matchingValue && paramValue === matchingValue.value;
      });
    });
  };

  const selectedVariant = findSelectedVariant();
  let imageFiles = [""];
  if (selectedVariant?.variant_sku) {
    imageFiles = image_directories.variant_images[selectedVariant.variant_sku];
  }

  // Update the URL with the selected attributes
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.keys(selectedAttributes).forEach(key => {
      newParams.set(key, selectedAttributes[key]);
    });
    window.history.replaceState({}, '', `?${newParams.toString()}`);
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

  // Group attribute values by attribute and filter out duplicates
  const groupedAttributeValues = product_variant_attributes.map(attribute => ({
    attribute,
    values: Array.from(new Set(product_variant_attribute_values
      .filter(value => value.attribute_id === attribute.id)
      .map(value => value.value)))
  }));

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
    <div className={classes.ProductDetailCardNew}>
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
              {groupedAttributeValues.map(({ attribute, values }) => (
                <li key={attribute.id.toString()}>
                  <label>{attribute.name}</label>
                  <div className={classes.variant_links}>
                    {values.map(value => {
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

export default ProductDetailCardNew;