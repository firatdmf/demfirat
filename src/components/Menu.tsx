import React from "react";
import Link, {LinkProps} from "next/link";
import classes from "@/components/Menu.module.css";
// To get the current locale data
import { useLocale } from "next-intl";


function Menu(menuTArray:any) {
    // console.log(menuTArray);
    const localActive = useLocale();
  return (
    <div className={classes.MenuPage}>
      <div className={classes.navbar}>
        <a className={classes.a} href="/">
          {menuTArray['menuTArray'][0]}
        </a>
        <a className={classes.a} href="/product"  >
        {menuTArray['menuTArray'][1]}
        </a>
        <a className={classes.a} href="/about">
        {menuTArray['menuTArray'][2]}
        </a>
        <a className={classes.a} href="/contact" >
        {menuTArray['menuTArray'][3]}
        </a>
        <p
          className={classes.quote}
          style={{
            float: "right",
            marginTop: "20px",
            marginRight: "17px",
            fontSize: "1.1rem",
          }}
        >
          {menuTArray['menuTArray'][4]}
        </p>
      </div>
    </div>
  );
}

export default Menu;
