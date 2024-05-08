import classes from "@/components/Footer.module.css";
import Link from "next/link";

interface FooterProps{
  StayConnected:string;
  OurStory:string;
  ContactUs:string;
  AllRightsReserved:string;
}


function Footer({StayConnected,OurStory,ContactUs,AllRightsReserved}:FooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    // <div className="FooterPage" style={{backgroundColor:"black"}}>
    <div className={classes.FooterPage}>
      <div className={classes.footerMenu}>
        <div className={classes.col1}>
          <h3>DEMFIRAT Karven</h3>
          <ul>
            {/* <Link
          href="/about"
          onClick={() => {
            window.scroll(0, 0);
          }}
        > */}
            <Link href="/about" id={classes.link}>
              <li>{OurStory}</li>
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
          <h3>{StayConnected}</h3>
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
              <li>{ContactUs}</li>
            </Link>
            {/* <Link href="/blogs" id={classes.link}>
              <li>Blog</li>
            </Link> */}

            {/* <li onClick={() => window.location = 'mailto:info@karvenhome.com'}>info@karvenhome.com</li> */}
          </ul>
        </div>

        <div className={classes.col4}>
          <img
            className={classes.karvenLogo}
            src="/media/karvenLogo.webp"
            alt="Karven Logo"
          />
          {/* <p style={{ fontWeight: "bold" }}>
        One Family. One Passion. One Resource.
      </p> */}
        </div>
      </div>
      <div className={classes.copyright}>
        <p>© {currentYear} Demfirat Karven | {AllRightsReserved}</p>
      </div>
    </div>
  );
}

export default Footer;
