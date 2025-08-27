import ProductDetailCard_old from "@/components/ProductDetailCard_old";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

function is_numeric(str: string) {
  return /^\d+$/.test(str);
}

export default async function Page(props: PageProps<'/[locale]/product/fabrics/embroidery/[design]'>) {
  const { design, locale } = await props.params;
  const ProductDetailCardT = await getTranslations({ locale, namespace: "ProductDetailCardPage" });

  let validatedDesign = design;
  let prefix = validatedDesign[0];
  if (!is_numeric(prefix)) {
    if (prefix !== "N" && prefix !== "K" && prefix !== "n" && prefix !== "k") {
      return notFound();
    } else {
      if (
        (prefix === "k" || prefix === "K") &&
        (validatedDesign.length === 5 + 1 || validatedDesign[1] === "8")
      ) {
        validatedDesign = validatedDesign.slice(1);
      } else {
        if ((prefix === "n" || prefix === "N") && validatedDesign.length === 4 + 1) {
          validatedDesign = validatedDesign.slice(1);
        } else {
          return notFound();
        }
      }
    }
  }

  return (
    <div>
      <ProductDetailCard_old
        design={validatedDesign}
        designT={ProductDetailCardT("Design")}
        widthT={ProductDetailCardT("Width")}
        originT={ProductDetailCardT("Origin")}
        wantASampleT={ProductDetailCardT("WantASample")}
        sendEmailT={ProductDetailCardT("SendEmail")}
      />
    </div>
  );
}
