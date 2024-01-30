"use client";
import React from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import { AiFillInstagram, AiOutlineMail } from "react-icons/ai";
import {TbWorld} from "react-icons/tb"
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa"; //fa stands for font awesome (there are many others)
import { signIn, signOut } from "next-auth/react";
import { User } from "@/app/user";

// below is to check to see if the user is logged in
import { useSession } from "next-auth/react";

function Header() {
  const capitilize = function (string: any) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user not authenticated, handle here
      // console.log("Not logged in!: " + status);
    },
  });
  const { data: session } = useSession();

  return (
    <header className={classes.HeaderPage}>
      {/* below prints the username if the user is logged in */}
      {/* <p>{session?.user?.name}</p> */}
      <div className={classes.topBar2}>
        <span className={classes.span2}>
          <div className={classes.span2flex2}>
            {/* <Link href="/api/auth/signin" className={classes.loginButton}> */}
            {/* <FaSignInAlt /> */}
            {/* <p>Login</p> */}
            {/* </Link> */}

            {!session?.user?.name ? (
              <span>
                <button
                  onClick={() => signIn()}
                  className={classes.loginButton}
                >
                  {/* <FaSignInAlt /> */}
                  <p>Log In</p>
                </button>
              </span>
            ) : (<>
            <span>Merhaba, {session?.user?.name}</span>
               <span>|</span> 
              <span>
                <button
                  onClick={() => signOut()}
                  className={classes.loginButton}
                >
                  <p>Sign Out</p>
                </button>
              </span></>
            )}

            {/* <span>|</span> */}
            {/* <span> */}
            {/* <Link href="/api/auth/register" className={classes.registerButton}>
                {/* <FaUser /> */}
            {/* <p>Register</p> */}
            {/* </Link> */}

            {/* <button onClick={() => signOut()} className={classes.loginButton}> */}
            {/* <p>Sign Out</p> */}
            {/* </button> */}
            {/* </span> */}
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
            <Link
              href="mailto:info@demfirat.com"
              className={classes.a}
              id={classes.link}
            >
              <p>
                <AiOutlineMail />: info@demfirat.com
              </p>
            </Link>
            <p> <TbWorld/> Shipping Worldwide</p>
          </div>
        </div>
      </div>

      <div className={classes.navbar}>
        <Link className={classes.a} href="/">
          Home
        </Link>
        <Link className={classes.a} href="/products/fabrics/embroidery">
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
