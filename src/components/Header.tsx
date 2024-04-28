"use client";
import React from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import { AiFillInstagram, AiOutlineMail } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa"; //fa stands for font awesome (there are many others)
import { signIn, signOut } from "next-auth/react";
import { User } from "@/app/user";
import LocaleSwitcher from "./LocaleSwitcher";
// below is to check to see if the user is logged in
import { useSession } from "next-auth/react";

function Header(ShippingText: any) {
  // shipping:string,Home:string,Products:string, AboutUs:string, Contact:string, SideText:string

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

  // This is how you get the language of the user's browser
  // console.log(window?.navigator.language) ;

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
            ) : (
              <>
                <span>Merhaba, {session?.user?.name}</span>
                <span className="ml-2 mr-2">|</span>
                <span>
                  <button
                    onClick={() => signOut()}
                    className={classes.loginButton}
                  >
                    <p>Sign Out</p>
                  </button>
                </span>
              </>
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
            <span className="ml-2 mr-2">|</span>
            <span>
              <LocaleSwitcher />
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
            <p>+90 (501) 057-1884</p>
          </div>
        </div>
        <div className={`${classes.item2} ${classes.item}`}>
          <div className={classes.img}>
            <Link href="/" id={classes.link}>
              <img
                src="/media/karvenLogo.webp"
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
            <p style={{ textTransform: "capitalize" }}>
              <TbWorld />
              {/* below is for multi-language compliance */}
              {ShippingText["ShippingText"]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
