import { FC } from "react";
import ProductDetailCard_old from "@/components/ProductDetailCard_old";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
interface pageProps {
  params: { design: string };
}

function is_numeric(str: string) {
  return /^\d+$/.test(str);
}
const page: FC<pageProps> = ({ params }) => {
  const ProductDetailCardT = useTranslations("ProductDetailCardPage");
  let design = params.design;
  // console.log(params);

  let prefix = design[0];
  if (!is_numeric(prefix)) {
    if (prefix !== "N" && prefix !== "K" && prefix !== "n" && prefix !== "k") {
      console.log("you failed already");

      return notFound();
    } else {
      if (
        (prefix === "k" || prefix === "K") &&
        (design.length === 5 + 1 || design[1] === "8")
      ) {
        console.log(design.slice(1));
        design = design.slice(1);
        console.log("hey k is satisfied!");
      } else {
        if ((prefix === "n" || prefix === "N") && design.length === 4 + 1) {
          console.log(design.slice(1));
          design = design.slice(1);
        } else {
          console.log("you do not satisfy anything");

          return notFound();
        }
      }
    }
  }

  // console.log(design);

  return (
    <div>
      <ProductDetailCard_old
        // product={product}
        // product_variants={product_variants}
        // product_variant_attributes={product_variant_attributes}
        // product_variant_attribute_values={product_variant_attribute_values}


        design={design}
        designT={ProductDetailCardT("Design")}
        widthT={ProductDetailCardT("Width")}
        originT={ProductDetailCardT("Origin")}
        wantASampleT={ProductDetailCardT("WantASample")}
        sendEmailT={ProductDetailCardT("SendEmail")}
      />
      {/* Your design is: {design} */}
    </div>
  );
};

export default page;
