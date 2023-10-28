import React from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import { AiFillInstagram, AiOutlineMail } from "react-icons/ai";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa"; //fa stands for font awesome (there are many others)
function Header() {
  const capitilize = function (string: any) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  return (
    <header className={classes.HeaderPage}>
      <div className={classes.topBar2}>
        <span className={classes.span2}>
          <div className={classes.span2flex2}>
            <span>
              <Link href="/login" className={classes.loginButton}>
                {/* <FaSignInAlt /> */}
                <p>Login</p>
              </Link>
            </span>
            <span>|</span>
            <span>
              <Link href="/register" className={classes.registerButton}>
                {/* <FaUser /> */}
                <p>Register</p>
              </Link>
            </span>
          </div>
        </span>
      </div>

      <div className={classes.logoGrid}>
        <div className={`${classes.item1} ${classes.item}`}>
          <div>
            <p>
              VAKIFLAR OSB MAH D100 CAD NO 38 <br />
              ERGENE TEKIRDAG, 59930 <br />
              TURKIYE
            </p>
            <p>+90 (533) 544-2525</p>
          </div>
        </div>
        <div className={`${classes.item2} ${classes.item}`}>
          <div className={classes.img}>
            <Link href="/" id={classes.link}>
              <img
                src="/media/karvenLogo.png"
                alt="logo"
                className={classes.logo}
              />
            </Link>
          </div>
        </div>
        <div className={`${classes.item3} ${classes.item}`}>
          <div>
            <Link
              className={classes.a}
              href="https://www.instagram.com/karvenhomedecor/"
              target="_blank"
              id={classes.link}
            >
              <p>
                  <AiFillInstagram />
                    :/karvenhomedecor
              </p>
            </Link>
            <Link href="mailto:info@demfirat.com" className={classes.a} id={classes.link}>
              <p>
                  <AiOutlineMail />: info@demfirat.com
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div className={classes.navbar}>
        <Link className={classes.a} href="/">
          Home
        </Link>
        <Link className={classes.a} href="/products">
          Products
        </Link>
        {/* <Link className={classes.a} to="/fabricUpload">
          Upload Fabrics
        </Link> */}
        <Link className={classes.a} href="/about">
          About Us
        </Link>
        <Link className={classes.a} href="/contact">
          Contact
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
          Think Holistic, Think Embroidered
        </p>
      </div>
    </header>
  );
}

export default Header;
