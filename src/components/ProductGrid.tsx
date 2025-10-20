"use client"
// import { Decimal } from "@prisma/client/runtime/library";
import classes from "./ProductGrid.module.css";
import ProductCard from "@/components/ProductCard";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useState } from "react";
// below are react icons
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { FaSearch } from "react-icons/fa";
// below are interfaces
import { SearchParams, Product, ProductVariant, ProductVariantAttribute, ProductVariantAttributeValue } from "@/lib/interfaces"
import { capitalizeFirstLetter } from "@/lib/functions"
import { log } from "node:console";

type ProductGridProps = {
  products: Product[] | null;
  product_variants: ProductVariant[];
  product_variant_attributes: ProductVariantAttribute[];
  product_variant_attribute_values: ProductVariantAttributeValue[];
  product_category: string | null;
  product_category_description: string | null;
  searchParams: SearchParams;
  locale?: string;
  HeadlineT?: string;
  SearchBarT?: string
}

// Translation helper for attribute names
const translateAttributeName = (name: string, locale: string): string => {
  const translations: { [key: string]: { [key: string]: string } } = {
    'color': {
      'tr': 'Renk',
      'ru': 'Цвет',
      'pl': 'Kolor',
      'de': 'Farbe',
      'en': 'Color'
    },
    'colour': {
      'tr': 'Renk',
      'ru': 'Цвет',
      'pl': 'Kolor',
      'de': 'Farbe',
      'en': 'Colour'
    },
    'size': {
      'tr': 'Boyut',
      'ru': 'Размер',
      'pl': 'Rozmiar',
      'de': 'Größe',
      'en': 'Size'
    },
    'width': {
      'tr': 'Genişlik',
      'ru': 'Ширина',
      'pl': 'Szerokość',
      'de': 'Breite',
      'en': 'Width'
    },
    'height': {
      'tr': 'Yükseklik',
      'ru': 'Высота',
      'pl': 'Wysokość',
      'de': 'Höhe',
      'en': 'Height'
    },
    'length': {
      'tr': 'Uzunluk',
      'ru': 'Длина',
      'pl': 'Długość',
      'de': 'Länge',
      'en': 'Length'
    },
    'material': {
      'tr': 'Malzeme',
      'ru': 'Материал',
      'pl': 'Materiał',
      'de': 'Material',
      'en': 'Material'
    },
    'fabric': {
      'tr': 'Kumaş',
      'ru': 'Ткань',
      'pl': 'Tkanina',
      'de': 'Stoff',
      'en': 'Fabric'
    },
    'pattern': {
      'tr': 'Desen',
      'ru': 'Узор',
      'pl': 'Wzór',
      'de': 'Muster',
      'en': 'Pattern'
    },
    'design': {
      'tr': 'Tasarım',
      'ru': 'Дизайн',
      'pl': 'Projekt',
      'de': 'Design',
      'en': 'Design'
    },
    'style': {
      'tr': 'Stil',
      'ru': 'Стиль',
      'pl': 'Styl',
      'de': 'Stil',
      'en': 'Style'
    },
    'type': {
      'tr': 'Tip',
      'ru': 'Тип',
      'pl': 'Typ',
      'de': 'Typ',
      'en': 'Type'
    },
    'category': {
      'tr': 'Kategori',
      'ru': 'Категория',
      'pl': 'Kategoria',
      'de': 'Kategorie',
      'en': 'Category'
    },
    'collection': {
      'tr': 'Koleksiyon',
      'ru': 'Коллекция',
      'pl': 'Kolekcja',
      'de': 'Kollektion',
      'en': 'Collection'
    },
    'finish': {
      'tr': 'Bitiş',
      'ru': 'Отделка',
      'pl': 'Wykończenie',
      'de': 'Finish',
      'en': 'Finish'
    },
    'texture': {
      'tr': 'Doku',
      'ru': 'Текстура',
      'pl': 'Tekstura',
      'de': 'Textur',
      'en': 'Texture'
    },
    'opacity': {
      'tr': 'Opaklık',
      'ru': 'Непрозрачность',
      'pl': 'Przezroczystość',
      'de': 'Deckkraft',
      'en': 'Opacity'
    },
    'weight': {
      'tr': 'Ağırlık',
      'ru': 'Вес',
      'pl': 'Waga',
      'de': 'Gewicht',
      'en': 'Weight'
    },
    'thickness': {
      'tr': 'Kalınlık',
      'ru': 'Толщина',
      'pl': 'Grubość',
      'de': 'Dicke',
      'en': 'Thickness'
    }
  };
  
  const lowerName = name.toLowerCase();
  if (translations[lowerName] && translations[lowerName][locale]) {
    return translations[lowerName][locale];
  }
  return capitalizeFirstLetter(name);
};

// Below variables are passed down
function ProductGrid({ products, product_variants, product_variant_attributes, product_variant_attribute_values, product_category, product_category_description, searchParams, locale = 'en', HeadlineT, SearchBarT }: ProductGridProps) {
  // console.log("your products are", products);

  // console.log("Products in product grid are: ");
  // console.log(products);
  // console.log("your attribute values are: ");
  // console.log(product_variant_attribute_values);

  // In this component the search bar works with client side components, and the filtering works finely on the server side.

  // This is manipulated with (search params) but we need to initialize it first.
  let filteredProducts: Product[] | null = products ?? []; // Initialize as an empty array if products is null
  // const [fi, setfirst] = useState(second)
  const [SearchFilteredProducts, setSearchFilteredProducts] = useState<Product[]>(filteredProducts ? filteredProducts : []);
  const [SearchFilterUsed, setSearchFilterUsed] = useState<boolean>(false)
  const [FilterMenuOpen, setFilterMenuOpen] = useState<boolean>(false)


  // Handling of the search bar
  const search_filter = (e: React.ChangeEvent<HTMLInputElement>) => {
    let query = e.currentTarget.value;

    if (!query) {
      setSearchFilterUsed(false)
    } else {
      setSearchFilterUsed(true)
      // filter the products, if we have them.
      if (filteredProducts) {
        setSearchFilteredProducts(filteredProducts.filter((product) =>
          // search product title or product sku and return matching products
          product.title?.toLowerCase().includes(query.toLowerCase()) || product.sku?.toLowerCase().includes(query.toLowerCase())
        ))
      }

    }
  }

  // If there are search params in the url (filter menu)
  if (searchParams && Object.keys(searchParams).length > 0) {

    // Iterate through the search params object
    Object.entries(searchParams).forEach(([key, value]) => {
      // ?color=white size=84,95
      // attribute names are unique so we use find instead of filter and this returns a single object
      const attribute = product_variant_attributes.find((attribute) => {
        return attribute.name === key;
      });
      if (attribute) {
        // If we have a multiple values such as 84 and 95 both selected for size, then we split them by comma (%2C)
        const values = Array.isArray(value) ? value : value?.split(',');
        // console.log("little values are");
        // console.log(values);

        // get the appropriate objects from passed down db object that match the attribute and values
        const attribute_values = product_variant_attribute_values.filter((attribute_value) => {
          return attribute_value.product_variant_attribute_id === attribute.id && values?.includes(attribute_value.product_variant_attribute_value);
        });
        // console.log("your attribute values are:");
        // console.log(attribute_values);

        const attribute_value_ids = attribute_values.map((attribute_value) => attribute_value.id);
        // const matching_variant_ids =  product_variants.product_variant_attribute_values
        // In this case, it means: // "Include this variant if it has at least one attribute value that matches the selected filter values."
        const matching_product_variants = product_variants.filter((variant) => { return variant.product_variant_attribute_values.some(valueId => attribute_value_ids.includes(valueId)) });
        const matching_product_ids = Array.from(new Set(matching_product_variants.map((variant) => variant.product_id)));

        // Extract distinct product IDs, eliminating duplicate productss
        // const productIds = Array.from(new Set(attribute_values.map((attribute_value) => attribute_value.product_id)));
        filteredProducts = filteredProducts?.filter((product) => matching_product_ids.includes(product.id)) || null;
        // console.log("filtered products are:");
        // console.log(filteredProducts);

      } else {
        console.log("you got no attribute defined")
      }
      // Printing params for reference
      // console.log(`${key} ${value}`);
    });
  }

  if (!products) {
    return <Spinner />;
  } else {
    return (
      <div className={classes.ProductGrid}>
        <div className={classes.headerSection}>
          <div className={classes.headerContent}>
            <h1 className={classes.pageTitle}>
              {product_category?.toLowerCase().includes('fabric') ? 'Fabrics' :
               product_category?.toLowerCase().includes('curtain') ? 'Curtains' :
               'Products'}
            </h1>
            {product_category_description && (
              <p className={classes.pageDescription}>{product_category_description}</p>
            )}
          </div>
        </div>
        <div className={classes.search}>
          <input
            type="text"
            className={classes.searchTerm}
            placeholder={
              locale === 'tr' ? 'Ürün adı veya SKU ile arayın' :
              locale === 'ru' ? 'Поиск по названию или SKU' :
              locale === 'pl' ? 'Szukaj po nazwie lub SKU' :
              locale === 'de' ? 'Nach Produktname oder SKU suchen' :
              'Search for product title or sku'
            }
            onChange={search_filter}
          />
          <button className={classes.searchButton}>
            <FaSearch />
          </button>
        </div>
        {/* Not shown on computer screen, only for tablets and phones */}
        <div className={classes.filterToggleContainer}>
          <button
            className={classes.filterToggleButton}
            onClick={() => setFilterMenuOpen(!FilterMenuOpen)}
          >
            {FilterMenuOpen ? (
              locale === 'tr' ? 'Filtreyi Kapat' :
              locale === 'ru' ? 'Закрыть фильтр' :
              locale === 'pl' ? 'Zamknij filtr' :
              locale === 'de' ? 'Filter schließen' :
              'Close Filter'
            ) : (
              locale === 'tr' ? 'Filtreyi Aç' :
              locale === 'ru' ? 'Открыть фильтр' :
              locale === 'pl' ? 'Otwórz filtr' :
              locale === 'de' ? 'Filter öffnen' :
              'Open Filter'
            )}
          </button>
        </div>



        <div className={classes.FiratDisplay}>
          <div className={`${classes.filterMenu} ${FilterMenuOpen ? classes.filterMenuOpen : classes.filterMenuClosed}`}>


            <Link href="?" scroll={false} className={classes.clearFiltersButton} replace={true}>
              {locale === 'tr' ? 'Filtreleri Temizle' :
               locale === 'ru' ? 'Очистить фильтры' :
               locale === 'pl' ? 'Wyczyść filtry' :
               locale === 'de' ? 'Filter zurücksetzen' :
               'Reset Filters'}
            </Link>
            <ul>
              {product_variant_attributes.map((attribute: ProductVariantAttribute, index: number) => {

                // Filter the attribute values based on the attribute_id, delete duplicate values, and iterate through it

                const filteredValues = product_variant_attribute_values.filter(
                  (attribute_value) => attribute_value.product_variant_attribute_id === attribute.id
                );
                const uniqueValues =
                  // filteredValues.map(value =>value.product_variant_attribute_value) creates an array of just the values (like ["blue", "red", "blue"]).
                  // new Set(...) removes duplicates (so you get ["blue", "red"]).
                  // Array.from(...) turns the Set back into an array.
                  Array.from(new Set(filteredValues.map(value => value.product_variant_attribute_value)))
                    // .map(value => filteredValues.find(...)) finds the first object in filteredValues for each unique value, so you get an array of objects (not just strings).
                    .map(value => filteredValues.find(attribute_value => attribute_value.product_variant_attribute_value === value));

                // console.log("uniqueValues");
                // console.log(uniqueValues);



                return (
                  <li key={index}>
                    {translateAttributeName(attribute.name || '', locale)}
                    {/* <p> */}
                    {uniqueValues.map((attribute_value) => {
                      // Record<string, string> is a utility type that represents an object with string keys, and string values. 
                      // in our case, keys are attribute names, and values are either strings or array of strings.
                      const params = new URLSearchParams(searchParams as Record<string, string>);
                      const paramKey = String(attribute.name);
                      const paramValue = String(attribute_value?.product_variant_attribute_value);

                      const currentValues = params.get(paramKey)?.split(',') || [];
                      const isChecked = currentValues.includes(paramValue);

                      if (isChecked) {
                        const newValues = currentValues.filter((val) => val !== paramValue);
                        if (newValues.length > 0) {
                          params.set(paramKey, newValues.join(','));
                        } else {
                          params.delete(paramKey);
                        }
                      } else {
                        currentValues.push(paramValue);
                        params.set(paramKey, currentValues.join(','));
                      }

                      const href = `?${params.toString()}`;

                      return (
                        <div key={attribute_value?.id} className={classes.attribute_value_item_box}>
                          <Link className={classes.link} href={href} replace={true} scroll={false}>
                            <div className={classes.icon}>
                              {isChecked ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                            </div>
                            <div className={classes.iconText}>{capitalizeFirstLetter(attribute_value?.product_variant_attribute_value.replace(/_/g, " "))}</div>
                          </Link>
                          <br />
                        </div>
                      );
                    })}
                    {/* </ul> */}
                    {/* </p> */}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={classes.products}>
            {SearchFilterUsed ? SearchFilteredProducts?.map((product: Product, index: number) => {
              return <ProductCard key={index} product={product} locale={locale} />;
            }) :
              (Array.isArray(filteredProducts) ? filteredProducts : [])?.map((product: Product, index: number) => (
                <ProductCard key={index} product={product} locale={locale} />
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ProductGrid;