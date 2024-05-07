// import classes from '@/app/about/page.module.css'
import { useTranslations } from "next-intl";
import classes from "./page.module.css";
function About() {
  const AboutUsPageT = useTranslations("AboutUsPage");
  return (
    <div className={classes.AboutPage}>
      <div className={classes.video}>
        <video autoPlay loop muted className={classes.videoItself}>
          <source src="/media/karven.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={`${classes.headText} ${classes.textCenter}`}>
        <h2>{`FOUNDER'S STORY`}</h2>
        {/* <h2>{AboutUsPageT("Section1Headline")}</h2> */}
        <br />
        <p>
          Our parent company, Dem Fırat Karven Tekstil, was established in 1991
          in Istanbul by Cuma Ozturk. Cuma was the eldest child in a family with
          21 kids. He grew up near the eastern border on the rural side of
          Turkey. Because of the lack of resources during his childhood, he
          dropped out of school at the age of nine and started working at local
          shops.
          {/* {AboutUsPageT("Section1Text")} */}
        </p>
      </div>
      <div className={`${classes.container}`}>
        <div className={`${classes.row} ${classes.row2}`}>
          <div className={classes.box1}>
            <img
              src="/media/oldStoreFrontPic.jpg"
              alt="Store Front of the first store Cuma opened in Laleli"
            />
          </div>
          <div className={`${classes.box2} ${classes.textEnd}`}>
            <h3>GOING SOLO</h3>
            {/* <h3>{AboutUsPageT('Section3Headline')}</h3> */}
            <h1>1997</h1>
            <p>
              In 1997, he started his own textile store. His genuine attitude
              and fine quality of his products made his shop recognized. With
              the growing demand, he started bringing his siblings left on the
              East side of the country and employing them one after the other.
              {/* {AboutUsPageT('Section3Text')} */}
            </p>
          </div>
        </div>
        <div className={`${classes.row} ${classes.row3}`}>
          <div className={classes.box1}>
            <h3>FIRST STEP TO OVERSEAS</h3>
            {/* <h3>{AboutUsPageT('Section4Headline')}</h3> */}
            <h1>2004</h1>
            <p>
              Cuma and his siblings opened their first abroad warehouse in
              Moscow and started supplying Turkish textiles to the Russian
              market, later expanding to Ukraine, Belarus, and Kazakhstan.
              {/* {AboutUsPageT('Section4Text')} */}
            </p>
          </div>
          <div className={classes.box2}>
            <img
              src="/media/Cuma_in_Russian_Warehouse.webp"
              alt="Cuma Ozturk standing next to the products in the Moscow Warehouse"
            />
          </div>
        </div>
        <div className={`${classes.row} ${classes.row4}`}>
          <div className={classes.box1}>
            <img
              // src="https://cdn.shopify.com/s/files/1/0570/3945/4375/files/Karven_Tekstil_Factory-Exterior_1080x.jpg?v=1660321830"
              src="/media/factory/karven-factory-building-exterior-resized.webp"
              alt="Karven Home Factory/Plant Exterior"
            />
          </div>
          <div className={`${classes.box2} ${classes.textEnd}`}>
            <h3>MANUFACTURING</h3>
            {/* <h3>{AboutUsPageT('Section5Headline')}</h3> */}
            <h1>2014</h1>
            <p>
              {`
              Soon Cuma's manufacturing partners could not meet his growing
              market demand. So, he acquired 60,000 SF of empty land and built
              his first textile mill just an hour from Istanbul to fully
              supervise the production and cut unnecessary costs bearing his
              clients.`}
              {/* {AboutUsPageT('Section5Text')} */}
            </p>
          </div>
        </div>
        <div className={`${classes.row} ${classes.row5}`}>
          <div className={`${classes.box1} ${classes.textCenter}`}>
            <h3>GRATITUDE</h3>
            {/* <h3>{AboutUsPageT('Section6Headline')}</h3> */}
            <h1>2020</h1>
            <p>
              Having started a successful company and being able take care of
              his siblings by employing them has made Cuma's dreams come true.
              {/* {AboutUsPageT('Section6Text1')} */}
            </p>
            <p>
              Dem Fırat Karven started as a small family-run textile shop in
              Istanbul in 1991. Today we grew into a manufacturing plant that
              produces over 20 million yards of fabric every month and supplies
              all around the globe with its strong supply chain network.
              {/* {AboutUsPageT('Section6Text2')} */}
            </p>
            <p>
              The growth has been an exciting and ever-changing journey.
              However, our core values have always stayed the same. Our growing
              family is what encourages us to continue providing high-quality
              products and exceptional customer service.
              {/* {AboutUsPageT('Section6Text3')} */}
            </p>
          </div>
          <div className={classes.box2}>
            <img
              src="/media/russia_fair_pic.jpg"
              alt="Cuma, his brother, and his son standing next to each other in a textile tradeshow in Russia"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
