'use client';

import { useParams } from 'next/navigation';
import classes from "./page.module.css";

// DEMFIRAT founder's story — copied verbatim from demfirat.com main
// storefront so the wholesale portal tells the same heritage story
// with the exact same milestone years (1991, 1997, 2004, 2014, 2020).
function About() {
  const params = useParams();
  const locale = params.locale as string;

  const translations = {
    en: {
      hero: {
        title: "FOUNDER'S STORY",
        subtitle:
          'Our parent company, Dem Fırat Karven Tekstil, was established in 1991 in Istanbul by Cuma Ozturk. Cuma was the eldest child in his family. He grew up in the east, rural side of Turkey. Due to limited resources during his childhood, he decided to pursue an entrepreneurial journey to support his family.',
      },
      timeline: [
        {
          year: '1991',
          title: 'Broad Shoulders',
          description:
            'Being the eldest among his siblings left him with an immense responsibility to work hard and provide for his family. So at young age, he moved to the West of Turkey by himself for better opportunities. After a decade of hard, laborious work at various places on the West side of the country at the age of 23, he opened his first textile shop in Laleli, Istanbul, with a business partner. However, in 1997, the partners had disagreements, leading them to separate ways.',
          image: '/media/heimtextile6.jpg',
        },
        {
          year: '1997',
          title: 'GOING SOLO',
          description:
            'This only powered him to open his own textile store. His genuine attitude and fine quality of his products made his shop recognized.',
          image: '/media/oldStoreFrontPic.jpg',
        },
        {
          year: '2004',
          title: 'FIRST STEP TO OVERSEAS',
          description:
            'Dem Fırat Karven opened its first abroad warehouse in Moscow and started supplying Turkish textiles to the Russian market, later expanding to Ukraine, Belarus, and Kazakhstan.',
          image: '/media/Cuma_in_Russian_Warehouse.webp',
        },
        {
          year: '2014',
          title: 'MANUFACTURING',
          description:
            "Soon Cuma's manufacturing partners could not meet his growing market demand. So, he acquired 60,000 SF of empty land and built his first textile mill just an hour from Istanbul to fully supervise the production and cut unnecessary costs bearing his clients.",
          image: '/media/factory/karven-factory-building-exterior-resized.webp',
        },
        {
          year: '2020',
          title: 'GRATITUDE',
          description:
            'Having started a successful company and being able take care of his family has made the dreams come true. Dem Fırat Karven started as a small family-run textile shop in Istanbul in 1991. Today we grew into a manufacturing plant that produces over 20 million yards of fabric every month and supplies all around the globe with its strong supply chain network. The growth has been an exciting and ever-changing journey. However, our core values have always stayed the same. Our growing family is what encourages us to continue providing high-quality products and exceptional customer service.',
          image: '/media/russia_fair_pic.jpg',
        },
      ],
    },
    tr: {
      hero: {
        title: 'KURUCUNUN HİKAYESİ',
        subtitle:
          "Ana şirketimiz Dem Fırat Karven Tekstil, 1991 yılında İstanbul'da Cuma Öztürk tarafından kurulmuştur. Cuma, ailesinin en büyük çocuğuydu. Türkiye'nin doğusundaki kırsal kesimde büyüdü. Çocukluğundaki kısıtlı imkanlar nedeniyle, ailesini desteklemek için girişimcilik yolculuğuna çıkmaya karar verdi.",
      },
      timeline: [
        {
          year: '1991',
          title: 'GÜÇLÜ OMUZLAR',
          description:
            "Kardeşleri arasında en büyük olmak, ona çok çalışmak ve ailesine bakmak gibi büyük bir sorumluluk yükledi. Bu yüzden genç yaşta daha iyi fırsatlar için tek başına Türkiye'nin batısına taşındı. Ülkenin batı tarafında çeşitli yerlerde on yıllık zorlu ve meşakkatli bir çalışmanın ardından, 23 yaşında bir iş ortağıyla birlikte İstanbul Laleli'de ilk tekstil dükkanını açtı. Ancak 1997'de ortaklar anlaşmazlığa düştü ve yollarını ayırdı.",
          image: '/media/heimtextile6.jpg',
        },
        {
          year: '1997',
          title: 'BAĞIMSIZ YOLCULUK',
          description:
            'Bu durum onu kendi tekstil mağazasını açmaya daha da motive etti. Samimi tavrı ve ürünlerinin kalitesi, dükkanını tanınır hale getirdi.',
          image: '/media/oldStoreFrontPic.jpg',
        },
        {
          year: '2004',
          title: 'YURT DIŞINA İLK ADIM',
          description:
            "Dem Fırat Karven, Moskova'da ilk yurt dışı deposunu açtı ve Türk tekstillerini Rusya pazarına sunmaya başladı; daha sonra Ukrayna, Belarus ve Kazakistan'a genişledi.",
          image: '/media/Cuma_in_Russian_Warehouse.webp',
        },
        {
          year: '2014',
          title: 'ÜRETİM',
          description:
            "Kısa sürede Cuma'nın üretim ortakları büyüyen pazar talebini karşılayamaz hale geldi. Bu yüzden İstanbul'a sadece bir saat uzaklıkta 5.500 metrekarelik boş bir arazi satın aldı ve üretimi tam olarak denetlemek ve müşterilerine gereksiz maliyetleri yansıtmamak için ilk tekstil fabrikasını kurdu.",
          image: '/media/factory/karven-factory-building-exterior-resized.webp',
        },
        {
          year: '2020',
          title: 'MİNNETTARLIK',
          description:
            "Başarılı bir şirket kurmak ve ailesine bakabilmek hayallerini gerçeğe dönüştürdü. Dem Fırat Karven, 1991 yılında İstanbul'da küçük bir aile tekstil dükkanı olarak başladı. Bugün her ay 20 milyon metreden fazla kumaş üreten ve güçlü tedarik zinciri ağıyla dünya geneline ürün sağlayan bir üretim tesisine dönüştük. Bu büyüme heyecan verici ve sürekli değişen bir yolculuk oldu. Ancak temel değerlerimiz her zaman aynı kaldı. Büyüyen ailemiz, yüksek kaliteli ürünler ve olağanüstü müşteri hizmeti sunmaya devam etmemiz için bizi motive ediyor.",
          image: '/media/russia_fair_pic.jpg',
        },
      ],
    },
  };

  const content = translations[locale as keyof typeof translations] || translations.en;

  return (
    <main className={classes.main}>
      {/* Video background hero — same brand video used on demfirat.com /about */}
      <section className={classes.hero}>
        <video autoPlay loop muted playsInline className={classes.heroVideo}>
          <source src="https://demfiratkarven.b-cdn.net/website-videos/karven.mp4" type="video/mp4" />
        </video>
        <div className={classes.heroOverlay}></div>
        <div className={classes.heroContent}>
          <h1 className={classes.heroTitle}>{content.hero.title}</h1>
          <p className={classes.heroSubtitle}>{content.hero.subtitle}</p>
        </div>
      </section>

      {/* Timeline — alternating left/right milestones, identical structure to demfirat.com */}
      <section className={classes.timeline}>
        {content.timeline.map((item, index) => (
          <div
            key={item.year}
            className={`${classes.timelineItem} ${index % 2 === 0 ? classes.timelineLeft : classes.timelineRight}`}
          >
            {index % 2 === 0 ? (
              <>
                <div className={classes.timelineContent}>
                  <span className={classes.timelineYear}>{item.year}</span>
                  <h3 className={classes.timelineTitle}>{item.title}</h3>
                  <p className={classes.timelineDescription}>{item.description}</p>
                </div>
                <div className={classes.timelineDot}></div>
                <div className={classes.timelineImageWrapper}>
                  <span className={classes.timelineYearMobile}>{item.year}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={classes.timelineImage}
                    onError={(e) => {
                      e.currentTarget.src = '/home/hero-a.png';
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={classes.timelineImageWrapper}>
                  <span className={classes.timelineYearMobile}>{item.year}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className={classes.timelineImage}
                    onError={(e) => {
                      e.currentTarget.src = '/home/hero-a.png';
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
