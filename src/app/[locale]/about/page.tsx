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
      {/* <h2 className={classes.textCenter}>
    ...Pearlins Linen is the US branch of the textile manufacturing group
    Demfirat Karven Tekstil.
  </h2> */}
      <div className={`${classes.headText} ${classes.textCenter}`}>
        <h2>{`FOUNDER'S STORY`}</h2>
        {/* <h2>{AboutUsPageT("Section1Headline")}</h2> */}
        <br />
        <p>
          Our parent company, Dem Fırat Karven Tekstil, was established in 1991
          in Istanbul by Cuma Ozturk. Cuma was the eldest child in his family. He grew up in the east, rural side of
          Turkey. Due to limited resources during his childhood, he decided to pursue an entreprenerial journey to support his family. 
          {/* {AboutUsPageT("Section1Text")} */}
        </p>
      </div>
      <div className={`${classes.container}`}>
        <div className={`${classes.row} ${classes.row1}`}>
          <div className={`${classes.box1} ${classes.textCenter}`}>
            <h1>
              Broad Sholders
              {/* {AboutUsPageT("Section2Headline")} */}
            </h1>
            <p>
              {`Being the eldest among his siblings
              left him with an immense responsibility to work hard and provide
              for his family.`}

              {/* {AboutUsPageT("Section2Text1")} */}
            </p>
            <p>
              So at young age, he moved to the West of Turkey by
              himself for better opportunities. After a decade of hard,
              laborious work at various places on the West side of the country at the age of 23,
              he opened his first textile shop in Laleli, Istanbul, with a
              business partner. However, in 1997, the partners had disagreements, leading them to
              separate ways.
              {/* {AboutUsPageT("Section2Text2")} */}
            </p>
          </div>
          <div className={classes.box2}>
            <img
              src="/media/heimtextile6.jpg"
              alt="The Founder of Karven Home sitting on chair with crossed arms"
            />
          </div>
        </div>
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
              This only powered him to open his own textile store.
              His genuine attitude and fine quality of his products made his
              shop recognized.
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
              Dem Fırat Karven opened its first abroad warehouse in
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
              his family has made the dreams come true.
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
        {/* <div className={`${classes.row} ${classes.row6}`}>
      <div className={classes.box1}>
        <img
          src="/images/cover/hometex.jpg"
          alt="Hometex 2023 Istanbul Team Photograph  "
        />
      </div>
      <div className={`${classes.box2} ${classes.textCenter}`}>
        <h3>HomeTex</h3>
        <h1>2023</h1>
      </div>
    </div> */}

        {/* <div className={`${classes.row} ${classes.row6}`}>
      <div className={classes.box1}>
        <img
          src="https://cdn.shopify.com/s/files/1/0570/3945/4375/files/Z_Moe_at_the_HD_Expo_900x.jpg?v=1660275883"
          alt="MUHAMMED FIRAT OZTURK standing next to his booth in HD Expo Tradeshow in Las Vegas joined as Pearlins Linen"
        />
      </div>
      <div className={`${classes.box2} ${classes.textCenter}`}>
        <h3>SHOOTING BEYOND THE</h3>
        <h1>OCEAN</h1>
        <p>
          My dad was well aware of the limitations the lack of educational
          background brought to his life. Therefore, he sent me to the
          United States in 2015.
        </p>
        <p>
          Upon earning my degree from Rutgers University with the highest
          honors in Industrial and Systems Engineering, I started this
          company, Pearlins Linen, to distribute fabrics and textiles
          produced in our family mill.(...and started nagging you with my
          never-ending cold calls and emails)
        </p>
      </div>
    </div>
    <div className={`${classes.row} ${classes.row7}`}>
      <div className={classes.box1}>
        <h3>PEARLINS LINEN</h3>
        <h1>2021</h1>
        <p>Today, Pearlins Linen is the leading distributor of home textiles and interior fabrics in the US market, serving the hospitality, department stores, converters, furniture manufacturers, jobbers, and more.</p>
      </div>
      <div className={classes.box2}>
        <img src="https://cdn.shopify.com/s/files/1/0570/3945/4375/files/IMG_2220_1080x.jpg?v=1660322339" alt="PEARLINS LINEN warehouse interior entrance" />
      </div>
    </div> */}
      </div>
      {/* <img src="https://cdn.shopify.com/s/files/1/0570/3945/4375/files/ec1d7292-a258-4e1c-a520-d17cf5f3d585_51cb89ce-8118-4b60-a48a-0f63cb7e5344_1080x.jpg?v=1660333805" alt="The Founder of Karven Home sitting on chair with crossed arms" /> */}
      {/* <div className={classes.video2}>
    <video autoPlay loop muted className={classes.videoItself}>
      <source src={footerVideo} type="video/mp4" />
    </video>
    <div className={classes.text}>
      <h3>STAY TUNED!</h3>
      <h2>2024</h2>
      <br />
      <p>
        We are constantly continuing to look for the next first—we are not
        done innovating yet.
      </p>
    </div>
  </div> */}
    </div>
  );
}

export default About;
