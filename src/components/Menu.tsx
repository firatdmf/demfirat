import React from "react";
import Link from "next/link";
import classes from "@/components/Menu.module.css";
function Menu(menuTArray:any) {
    // console.log(menuTArray);
    
  return (
    <div className={classes.MenuPage}>
      <div className={classes.navbar}>
        <Link className={classes.a} href="/">
          {menuTArray['menuTArray'][0]}
        </Link>
        <Link className={classes.a} href="/products/fabrics/embroidery">
        {menuTArray['menuTArray'][1]}
        </Link>
        <Link className={classes.a} href="/about">
        {menuTArray['menuTArray'][2]}
        </Link>
        <Link className={classes.a} href="/contact">
        {menuTArray['menuTArray'][3]}
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
          {menuTArray['menuTArray'][4]}
        </p>
      </div>
    </div>
  );
}

export default Menu;
