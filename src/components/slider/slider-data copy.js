import { useTranslations } from "next-intl";

const t = useTranslations("Slider");
// console.log(t("title"));

export const sliderData = [
  {
    image: "/media/factory/karven-factory-building-exterior-resized.webp",
    heading: "Indulge in Operational Brilliance",
    desc: "Superior quality fabrics through advanced technology and skilled craftsmanship.",
    obj_position: "bottom",
  },
  {
    // image: "/images/factory/factory-floor-image-industrial-curtain-embroidery-machines.jpg",
    image: "/media/factory/schiffli-embroidery-3.jpg",
    heading: "Unleash Unlimited Creativity",
    desc: "Crafting Every Design, Color, and Fabric Imaginable",
    obj_position: "top",
  },
];
