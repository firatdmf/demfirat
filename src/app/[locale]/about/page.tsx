'use client';

import { useParams } from 'next/navigation';
import classes from "./page.module.css";

function About() {
  const params = useParams();
  const locale = params.locale as string;

  // Multi-language content
  const translations = {
    en: {
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
    },
    tr: {
      hero: {
        title: "KURUCUNUN HİKAYESİ",
        subtitle: 'Ana şirketimiz Dem Fırat Karven Tekstil, 1991 yılında İstanbul\'da Cuma Öztürk tarafından kurulmuştur. Cuma, ailesinin en büyük çocuğuydu. Türkiye\'nin doğusundaki kırsal kesimde büyüdü. Çocukluğundaki kısıtlı imkanlar nedeniyle, ailesini desteklemek için girişimcilik yolculuğuna çıkmaya karar verdi.'
      },
      timeline: [
        {
          year: '1991',
          title: "GÜÇLÜ OMUZLAR",
          description: 'Kardeşleri arasında en büyük olmak, ona çok çalışmak ve ailesine bakmak gibi büyük bir sorumluluk yükledi. Bu yüzden genç yaşta daha iyi fırsatlar için tek başına Türkiye\'nin batısına taşındı. Ülkenin batı tarafında çeşitli yerlerde on yıllık zorlu ve meşakkatli bir çalışmanın ardından, 23 yaşında bir iş ortağıyla birlikte İstanbul Laleli\'de ilk tekstil dükkanını açtı. Ancak 1997\'de ortaklar anlaşmazlığa düştü ve yollarını ayırdı.',
          image: '/media/heimtextile6.jpg'
        },
        {
          year: '1997',
          title: 'BAĞIMSIZ YOLCULUK',
          description: 'Bu durum onu kendi tekstil mağazasını açmaya daha da motive etti. Samimi tavrı ve ürünlerinin kalitesi, dükkanını tanınır hale getirdi.',
          image: '/media/oldStoreFrontPic.jpg'
        },
        {
          year: '2004',
          title: 'YURT DIŞINA İLK ADIM',
          description: 'Dem Fırat Karven, Moskova\'da ilk yurt dışı deposunu açtı ve Türk tekstillerini Rusya pazarına sunmaya başladı; daha sonra Ukrayna, Belarus ve Kazakistan\'a genişledi.',
          image: '/media/Cuma_in_Russian_Warehouse.webp'
        },
        {
          year: '2014',
          title: 'ÜRETİM',
          description: "Kısa sürede Cuma'nın üretim ortakları büyüyen pazar talebini karşılayamaz hale geldi. Bu yüzden İstanbul'a sadece bir saat uzaklıkta 5.500 metrekarelik boş bir arazi satın aldı ve üretimi tam olarak denetlemek ve müşterilerine gereksiz maliyetleri yansıtmamak için ilk tekstil fabrikasını kurdu.",
          image: '/media/factory/karven-factory-building-exterior-resized.webp'
        },
        {
          year: '2020',
          title: 'MİNNETTARLIK',
          description: 'Başarılı bir şirket kurmak ve ailesine bakabilmek hayallerini gerçeğe dönüştürdü. Dem Fırat Karven, 1991 yılında İstanbul\'da küçük bir aile tekstil dükkanı olarak başladı. Bugün her ay 20 milyon metreden fazla kumaş üreten ve güçlü tedarik zinciri ağıyla dünya geneline ürün sağlayan bir üretim tesisine dönüştük. Bu büyüme heyecan verici ve sürekli değişen bir yolculuk oldu. Ancak temel değerlerimiz her zaman aynı kaldı. Büyüyen ailemiz, yüksek kaliteli ürünler ve olağanüstü müşteri hizmeti sunmaya devam etmemiz için bizi motive ediyor.',
          image: '/media/russia_fair_pic.jpg'
        }
      ]
    },
    ru: {
      hero: {
        title: "ИСТОРИЯ ОСНОВАТЕЛЯ",
        subtitle: 'Наша материнская компания Dem Fırat Karven Tekstil была основана в 1991 году в Стамбуле Джумой Озтюрком. Джума был старшим ребенком в семье. Он вырос в сельской местности на востоке Турции. Из-за ограниченных ресурсов в детстве он решил начать предпринимательский путь, чтобы поддержать свою семью.'
      },
      timeline: [
        {
          year: '1991',
          title: "ШИРОКИЕ ПЛЕЧИ",
          description: 'Будучи старшим среди братьев и сестер, на него легла огромная ответственность - много работать и обеспечивать семью. Поэтому в юном возрасте он переехал на запад Турции в поисках лучших возможностей. После десяти лет тяжелой работы в различных местах западной части страны, в возрасте 23 лет он открыл свой первый текстильный магазин в Лалели, Стамбул, вместе с деловым партнером. Однако в 1997 году партнеры разошлись во мнениях и разошлись.',
          image: '/media/heimtextile6.jpg'
        },
        {
          year: '1997',
          title: 'САМОСТОЯТЕЛЬНЫЙ ПУТЬ',
          description: 'Это только подтолкнуло его открыть собственный текстильный магазин. Его искренность и высокое качество продукции сделали его магазин известным.',
          image: '/media/oldStoreFrontPic.jpg'
        },
        {
          year: '2004',
          title: 'ПЕРВЫЙ ШАГ ЗА РУБЕЖ',
          description: 'Dem Fırat Karven открыл свой первый зарубежный склад в Москве и начал поставлять турецкий текстиль на российский рынок, позже расширившись на Украину, Беларусь и Казахстан.',
          image: '/media/Cuma_in_Russian_Warehouse.webp'
        },
        {
          year: '2014',
          title: 'ПРОИЗВОДСТВО',
          description: 'Вскоре производственные партнеры Джумы не смогли удовлетворить растущий рыночный спрос. Поэтому он приобрел 5 500 квадратных метров пустой земли и построил свою первую текстильную фабрику всего в часе езды от Стамбула, чтобы полностью контролировать производство и сократить ненужные расходы для своих клиентов.',
          image: '/media/factory/karven-factory-building-exterior-resized.webp'
        },
        {
          year: '2020',
          title: 'БЛАГОДАРНОСТЬ',
          description: 'Создание успешной компании и возможность заботиться о своей семье воплотили мечты в реальность. Dem Fırat Karven начинался как небольшой семейный текстильный магазин в Стамбуле в 1991 году. Сегодня мы выросли в производственное предприятие, которое производит более 20 миллионов метров ткани каждый месяц и поставляет продукцию по всему миру благодаря своей мощной сети поставок. Рост был захватывающим и постоянно меняющимся путешествием. Однако наши основные ценности всегда оставались неизменными. Наша растущая семья - это то, что побуждает нас продолжать предоставлять высококачественную продукцию и исключительное обслуживание клиентов.',
          image: '/media/russia_fair_pic.jpg'
        }
      ]
    },
    pl: {
      hero: {
        title: "HISTORIA ZAŁOŻYCIELA",
        subtitle: 'Nasza firma macierzysta, Dem Fırat Karven Tekstil, została założona w 1991 roku w Stambule przez Cumę Ozturka. Cuma był najstarszym dzieckiem w rodzinie. Dorastał na wiejskich terenach wschodniej Turcji. Z powodu ograniczonych zasobów w dzieciństwie postanowił rozpocząć podróż przedsiębiorczą, aby wesprzeć swoją rodzinę.'
      },
      timeline: [
        {
          year: '1991',
          title: "SZEROKIE BARKI",
          description: 'Bycie najstarszym wśród rodzeństwa nałożyło na niego ogromną odpowiedzialność ciężkiej pracy i utrzymania rodziny. Dlatego w młodym wieku przeniósł się sam na zachód Turcji w poszukiwaniu lepszych możliwości. Po dekadzie ciężkiej pracy w różnych miejscach zachodniej części kraju, w wieku 23 lat otworzył swój pierwszy sklep tekstylny w Laleli w Stambule ze wspólnikiem. Jednak w 1997 roku partnerzy mieli nieporozumienia i rozeszli się.',
          image: '/media/heimtextile6.jpg'
        },
        {
          year: '1997',
          title: 'SAMODZIELNA DROGA',
          description: 'To tylko zmotywowało go do otwarcia własnego sklepu tekstylnego. Jego szczere podejście i doskonała jakość produktów sprawiły, że jego sklep stał się rozpoznawalny.',
          image: '/media/oldStoreFrontPic.jpg'
        },
        {
          year: '2004',
          title: 'PIERWSZY KROK ZA GRANICĘ',
          description: 'Dem Fırat Karven otworzył swój pierwszy zagraniczny magazyn w Moskwie i zaczął dostarczać tureckie tekstylia na rynek rosyjski, później rozszerzając działalność na Ukrainę, Białoruś i Kazachstan.',
          image: '/media/Cuma_in_Russian_Warehouse.webp'
        },
        {
          year: '2014',
          title: 'PRODUKCJA',
          description: 'Wkrótce partnerzy produkcyjni Cumy nie byli w stanie zaspokoić rosnącego popytu rynkowego. Dlatego nabył 5 500 metrów kwadratowych pustego terenu i zbudował swoją pierwszą fabrykę tekstylną zaledwie godzinę drogi od Stambułu, aby w pełni nadzorować produkcję i obniżyć zbędne koszty dla swoich klientów.',
          image: '/media/factory/karven-factory-building-exterior-resized.webp'
        },
        {
          year: '2020',
          title: 'WDZIĘCZNOŚĆ',
          description: 'Założenie udanej firmy i możliwość zaopiekowania się rodziną sprawiły, że marzenia się spełniły. Dem Fırat Karven zaczynał jako mały rodzinny sklep tekstylny w Stambule w 1991 roku. Dziś wyrosliśmy na zakład produkcyjny, który produkuje ponad 20 milionów metrów tkaniny miesięcznie i dostarcza produkty na cały świat dzięki silnej sieci dostaw. Wzrost był ekscytującą i stale zmieniającą się podróżą. Jednak nasze podstawowe wartości zawsze pozostawały takie same. Nasza rosnąca rodzina jest tym, co motywuje nas do dalszego dostarczania wysokiej jakości produktów i wyjątkowej obsługi klienta.',
          image: '/media/russia_fair_pic.jpg'
        }
      ]
    }
  };

  const content = translations[locale as keyof typeof translations] || translations.en;
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
                  <span className={classes.timelineYearMobile}>{item.year}</span>
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
                  <span className={classes.timelineYearMobile}>{item.year}</span>
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
