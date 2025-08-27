import React from "react";
import Link, {LinkProps} from "next/link";
import classes from "@/components/Menu.module.css";
// To get the current locale data
// import { useLocale } from "next-intl";


function Menu(props: { menuTArray: string[]; locale: string }) {
    const { menuTArray, locale } = props;
  return (
    <div className={classes.MenuPage}>
      <div className={classes.navbar}>
        <Link className={classes.a} href={`/${locale}`}>
          {menuTArray[0]}
        </Link>
        <Link className={classes.a} href={`/${locale}/product`}  >
        {menuTArray[1]}
        </Link>
        <Link className={classes.a} href={`/${locale}/about`}>
        {menuTArray[2]}
        </Link>
        <Link className={classes.a} href={`/${locale}/contact`} >
        {menuTArray[3]}
        </Link>
        <p
          className={classes.quote}
          style={{
            float: "right",
            marginTop: "20px",
            marginRight: "17px",
            fontSize: "1.1rem",
          }}
        >
          {menuTArray[4]}
        </p>
      </div>
    </div>
  );
}

export default Menu;
