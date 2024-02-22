"use client";
import classes from "./page.module.css";
import Slider2 from "@/components/Slider2";
import { useEffect } from "react";
import Contact from "../contact/page";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import Link from "next/link";
const store_images = [
  "/media/store/store-1.jpeg",
  "/media/store/store-3.jpeg",
  "/media/store/store-5.jpeg",
];

const factory_images = [
  "/media/factory/akarven-schiffli-embroidery-closeup2.webp",
  // '/media/factory/akarven-schiffli-embroidery.webp',
  "/media/factory/akarven-schiffli-embroidery-2.webp",
  // '/media/factory/akarven-schiffli-embroidery-closeup.webp',
  // '/media/factory/schiffli-embroidery-closup.webp',
  // '/media/factory/schiffli-embroidery-closup2.webp',
  // '/media/factory/schiffli-embroidery-3.webp',
  // '/media/factory/schiffli-embroidery-2.jpeg',
  // '/media/factory/top-view-schiffli-embroidery-machines.webp',
  "/media/factory/flatboard-embroidery-closeup-2.webp",
  "/media/factory/schiffli-embroidery-machines.webp",

  // '/media/factory/flatboard-embroidery-closeup.webp',

  // '/media/factory/quality-control.jpeg',
  "/media/factory/karven-factory-exterior.webp",
];
const russian_text = [
  `
Karven придерживается принципа "лучшего качества по доступной цене", следя за современными дизайнами и предлагая новинки в моделях штор. Благодаря этому подходу, он лидирует среди интерьерных дизайнеров и мебельных магазинов. Компания успешно развивается и продолжает привносить инновации на мировом рынке.`,
  `В нашем производстве мы используем новейшие швейцарские вышивальные машины. Компания Karven Home, производящая около 500 000 метров в месяц, является известным производителем вышитых штор в Турции.`,
];
function page() {
  useEffect(
    () => {
      const landingPage = document.getElementById("landingPage");
      if (landingPage) {
        landingPage.scrollIntoView({ behavior: "smooth" });
      }
    },
    [] // Ensure this effect runs only once after the initial render
  );

  return (
    <div id="landingPage" className={classes.landingPage}>
      <h3 className={classes.headline}>Karven Home Collection</h3>
      <Slider2 images={store_images} />
      <h3 className={classes.headline}>Магазин</h3>

      {/* <p>Factory: Cuma Ozturk <br />Phone: +90 (533) 544-2525</p>
      <p>Store: Cuma Ozturk <br />Phone: +90 (555) 087-5555</p> */}
      <p className={classes.textInfo}>{russian_text[0]}</p>

      <Slider2 images={factory_images} />
      <h3 className={classes.headline}>Фабрика</h3>
      <p className={classes.textInfo}>{russian_text[1]}</p>
      <h3 className={classes.headline}>Контакт</h3>
      <table className={classes.myTable}>
        <tbody>
          <tr>
            <th className={classes.tableColumn}>Фабрика</th>
            <th className={classes.tableColumn}>Магазин</th>
          </tr>
          <tr>
            <th className={classes.tableColumn}>
              Cuma Öztürk <br />
              +90 (533) 544-2525
            </th>
            <th className={classes.tableColumn}>
              Özcan Öztürk
              <br />
              +90 (555) 087-5555
            </th>
          </tr>
        </tbody>
      </table>
      <div className={classes.socials}>
        <Link
          className={classes.link}
          href="https://www.instagram.com/karvenhomedecor"
        >
          <p>
            <FaInstagram />
            KarvenHomeDecor
          </p>
        </Link>
        <br />
        <Link className={classes.link} href="https://wa.me/905010571884">
          <p>
            <FaWhatsapp />
            +90 501 057 1884
          </p>
        </Link>
        <br />
        <Link className={classes.link} href="mailto:info@demfirat.com">
          <p>
            <TfiEmail />
            info@demfirat.com
          </p>
        </Link>
      </div>
    </div>
  );
}

export default page;
