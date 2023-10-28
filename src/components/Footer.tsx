import React from "react";
import classes from "@/components/Footer.module.css";
import Link from "next/link";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    // <div className="FooterPage" style={{backgroundColor:"black"}}>
    <div className={classes.FooterPage}>
      <div className={classes.footerMenu}>
        <div className={classes.col1}>
          <h3>Karven Home</h3>
          <ul>
            {/* <Link
          href="/about"
          onClick={() => {
            window.scroll(0, 0);
          }}
        > */}
            <Link href="/about" id={classes.link}>
              <li>Our Story</li>
            </Link>
            {/* <li>Blog</li> */}
            {/* <li>Our Corporate Heart</li>
        <li>Our Sustainable Commitment</li>
        <li>Services</li>
        <li>The Karven Standard</li>
        <li>Open Account</li>
        <li>Privacy Policy</li>
        <li>Cookies Policy</li>
        <li>Terms {"&"} Conditions</li>
        <li>Corporate Responsibility</li> */}
            {/* <li>Careers at Karven</li> */}
          </ul>
        </div>
        {/* 
    <div className={classes.col2}>
      <h3>Tools</h3>
      <ul>
        <li>Sample Books</li>
        <li>Catalogs</li>
        <li>Pricelists</li>
        <li>Website Help</li>
        <li>Represented Brands</li>
        <li>Find a Designer</li>
        <li>Design Grad Program</li>
      </ul>
    </div> */}

        <div className={classes.col3}>
          <h3>Stay Connected</h3>
          <ul>
            {/* <li>Showrooms</li> */}
            {/* <li>Showroom Safety Practices</li> */}
            {/* <Link
          href="/contact"
          onClick={() => {
            window.scroll(0, 0);
          }}
        > */}
            <Link href="/contact" id={classes.link}>
              <li>Contact Us</li>
            </Link>

            {/* <li onClick={() => window.location = 'mailto:info@karvenhome.com'}>info@karvenhome.com</li> */}
          </ul>
        </div>

        <div className={classes.col4}>
          <img
            className={classes.karvenLogo}
            src="/media/karvenLogo.png"
            alt="Karven Logo"
          />
          {/* <p style={{ fontWeight: "bold" }}>
        One Family. One Passion. One Resource.
      </p> */}
        </div>
      </div>
      <div className={classes.copyright}>
        <p>© {currentYear} Karven Home | All Rights Reserved</p>
      </div>
    </div>
  );
}

export default Footer;
