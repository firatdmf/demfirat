'use client';

import { useParams } from 'next/navigation';
import classes from "./page.module.css";

function About() {
  const params = useParams();
  const locale = params.locale as string;

  // Multi-language content
  const content = {
    hero: {
      title: "FOUNDER'S STORY",
      subtitle: 'Our parent company, Dem Fırat Karven Tekstil, was established in 1991 in Istanbul by Cuma Ozturk. Cuma was the eldest child in his family. He grew up in the east, rural side of Turkey. Due to limited resources during his childhood, he decided to pursue an entrepreneurial journey to support his family.'
    },
    timeline: [
      {
        year: '1991',
        title: "Broad Shoulders",
        description: 'Being the eldest among his siblings left him with an immense responsibility to work hard and provide for his family. So at young age, he moved to the West of Turkey by himself for better opportunities. After a decade of hard, laborious work at various places on the West side of the country at the age of 23, he opened his first textile shop in Laleli, Istanbul, with a business partner. However, in 1997, the partners had disagreements, leading them to separate ways.',
        image: '/media/heimtextile6.jpg'
      },
      {
        year: '1997',
        title: 'GOING SOLO',
        description: 'This only powered him to open his own textile store. His genuine attitude and fine quality of his products made his shop recognized.',
        image: '/media/oldStoreFrontPic.jpg'
      },
      {
        year: '2004',
        title: 'FIRST STEP TO OVERSEAS',
        description: 'Dem Fırat Karven opened its first abroad warehouse in Moscow and started supplying Turkish textiles to the Russian market, later expanding to Ukraine, Belarus, and Kazakhstan.',
        image: '/media/Cuma_in_Russian_Warehouse.webp'
      },
      {
        year: '2014',
        title: 'MANUFACTURING',
        description: "Soon Cuma's manufacturing partners could not meet his growing market demand. So, he acquired 60,000 SF of empty land and built his first textile mill just an hour from Istanbul to fully supervise the production and cut unnecessary costs bearing his clients.",
        image: '/media/factory/karven-factory-building-exterior-resized.webp'
      },
      {
        year: '2020',
        title: 'GRATITUDE',
        description: 'Having started a successful company and being able take care of his family has made the dreams come true. Dem Fırat Karven started as a small family-run textile shop in Istanbul in 1991. Today we grew into a manufacturing plant that produces over 20 million yards of fabric every month and supplies all around the globe with its strong supply chain network. The growth has been an exciting and ever-changing journey. However, our core values have always stayed the same. Our growing family is what encourages us to continue providing high-quality products and exceptional customer service.',
        image: '/media/russia_fair_pic.jpg'
      }
    ]
  };
  return (
    <main className={classes.main}>
      {/* Video Background Hero Section */}
      <section className={classes.hero}>
        <video autoPlay loop muted playsInline className={classes.heroVideo}>
          <source src="/media/karven.mp4" type="video/mp4" />
        </video>
        <div className={classes.heroOverlay}></div>
        <div className={classes.heroContent}>
          <h1 className={classes.heroTitle}>{content.hero.title}</h1>
          <p className={classes.heroSubtitle}>{content.hero.subtitle}</p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className={classes.timeline}>
        {content.timeline.map((item, index) => (
          <div 
            key={item.year} 
            className={`${classes.timelineItem} ${index % 2 === 0 ? classes.timelineLeft : classes.timelineRight}`}
          >
            {/* Left side content */}
            {index % 2 === 0 ? (
              <>
                <div className={classes.timelineContent}>
                  <span className={classes.timelineYear}>{item.year}</span>
                  <h3 className={classes.timelineTitle}>{item.title}</h3>
                  <p className={classes.timelineDescription}>{item.description}</p>
                </div>
                <div className={classes.timelineDot}></div>
                <div className={classes.timelineImageWrapper}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className={classes.timelineImage}
                    onError={(e) => {
                      e.currentTarget.src = '/media/heimtextile6.jpg';
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={classes.timelineImageWrapper}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className={classes.timelineImage}
                    onError={(e) => {
                      e.currentTarget.src = '/media/heimtextile6.jpg';
                    }}
                  />
                </div>
                <div className={classes.timelineDot}></div>
                <div className={classes.timelineContent}>
                  <span className={classes.timelineYear}>{item.year}</span>
                  <h3 className={classes.timelineTitle}>{item.title}</h3>
                  <p className={classes.timelineDescription}>{item.description}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

export default About;
