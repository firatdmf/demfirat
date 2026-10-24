'use client';

import { useParams } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import classes from './page.module.css';

// Lazy-loaded map iframe - only loads when visible
function LazyMap({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <iframe
          title=" "
          src={src}
          loading="lazy"
          style={{ border: '0', width: '100%', height: '320px', borderRadius: '10px' }}
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div style={{ width: '100%', height: '320px', borderRadius: '10px', background: '#f0ede6' }} />
      )}
    </div>
  );
}

export default function Contact() {
  const params = useParams();
  const locale = params.locale as string;

  const siteLang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

  const t = (key: string, forLang: string = siteLang) => {
    const translations: Record<string, Record<string, string>> = {
      ManufacturingPlant: { en: 'Manufacturing Plant', tr: 'Üretim Tesisi', ru: 'Производственный завод', pl: 'Zakład Produkcyjny' },
      FabricShowroom: { en: 'Curtain Store', tr: 'Perde Mağazası', ru: 'Магазин занавесей', pl: 'Sklep z Zasłonami' },
      RetailStore: { en: 'Hometextiles Store', tr: 'Ev Tekstili Perakende Mağaza', ru: 'Магазин домашних текстилей', pl: 'Sklep z Tekstylami Domy' },
      OfficeWarehouse: { en: 'Office & Warehouse', tr: 'Ofis ve Depo', ru: 'Офис-склад' },
      Representative: { en: 'Representative', tr: 'Temsilci', ru: 'Представитель', pl: 'Przedstawiciel' },
      Phone: { en: 'Phone', tr: 'Telefon', ru: 'Телефон', pl: 'Telefon' },
      Email: { en: 'Email', tr: 'E-posta', ru: 'Эл. почта', pl: 'E-mail' },
      Address: { en: 'Address', tr: 'Adres', ru: 'Адрес', pl: 'Adres' },
      WorkHours: { en: 'Work Hours', tr: 'Çalışma Saatleri', ru: 'Часы работы', pl: 'Godziny Pracy' },
      ProductLines: { en: 'Product Lines', tr: 'Ürün Grupları', ru: 'Ассортимент', pl: 'Asortyment' },
      Website: { en: 'Website', tr: 'Website', ru: 'Веб-сайт', pl: 'Strona internetowa' },
      WorkHour1: { en: 'Mon - Fri 08:30-18:30 (Istanbul Time)', tr: 'Pzt - Cum 08:30-18:30 (İstanbul Saati)', ru: 'Пн - Пт 08:30-18:30 (стамбульское время)', pl: 'Pon - Pt 08:30-18:30 (Czasu Stambulskiego)' },
      WorkHour2: { en: 'Mon - Fri 08:30-19:00, Sat 08:30-14:00 (Istanbul Time)', tr: 'Pzt - Cum 08:30-19:00, Cmt 08:30-14:00', ru: 'Пн - Пт 08:30-19:00, Сб 08:30-14:00', pl: 'Pon - Pt 08:30-19:00, Sob 08:30-14:00' },
      WorkHour3: { en: 'Mon - Fri 09:00-20:30, Sat 09:00-16:00 (Istanbul Time)', tr: 'Pzt - Cum 09:00-20:30, Cmt 09:00-16:00', ru: 'Пн - Пт 09:00-20:30, Сб 09:00-16:00', pl: 'Pon - Pt 09:00-20:30, Sob 09:00-16:00' },
      WorkHour4: { en: 'Mon - Fri 08:30-18:00, Sat 09:30-16:00 (Moscow Time)', tr: 'Pzt - Cum 08:30-18:00, Cmt 09:30-16:00 (Moskova Saati)', ru: 'Пн - Пт 08:30-18:00, Сб 09:30-16:00 (московское время)' },
      ProductLine1: { en: 'Drapery, Upholstery, and Bridal Fabrics & Lace Table Runners', tr: 'Perde, Döşemelik ve Gelinlik Kumaşlar & Dantel Masa Örtüleri', ru: 'Ткани для штор, обивки и свадебных платьев', pl: 'Tkaniny zasłonowe, tapicerskie i ślubne' },
      ProductLine2: { en: 'Interior Fabrics: Drapery & Upholstery', tr: 'İç Mekan Kumaşları: Perde ve Döşemelik', ru: 'Интерьерные ткани: портьеры и обивка', pl: 'Tkaniny do Wnętrz: Zasłony i Tapicerka' },
      ProductLine3: { en: 'Bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, blankets, pillows, mattress covers', tr: 'Yatak çarşafı, yatak örtüsü, mobilya örtüleri, havlular, mutfak havluları', ru: 'Постельное белье, покрывала, чехлы для мебели, полотенца', pl: 'Pościel, narzuty, pokrowce na meble, ręczniki, obrusy' },
      ProductLine4: { en: 'Bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, duvets, pillows, mattress toppers, kids\' range, bathrobes, homewear, sheets, throws, aprons, sauna sets, ironing board covers', tr: 'Nevresim, yatak örtüsü, mobilya örtüsü, havlu, mutfak havlusu, havlu seti, masa örtüsü, yorgan, yastık, alez, çocuk ürünleri, bornoz, ev giyimi, çarşaf, battaniye, önlük, sauna seti, ütü masası kılıfı', ru: 'Постельное белье, покрывала, чехлы на мебель, полотенца, кухонные полотенца, наборы полотенец, скатерти, одеяла, подушки, наматрасники, детский ассортимент, халаты, домашняя одежда, простыни, пледы, фартуки, комплекты для сауны, чехлы для гладильных досок' },
      Headquarters: { en: 'Headquarters', tr: 'Genel Merkez', ru: 'Головной офис' },
      Tekirdag: { en: 'Tekirdag, Turkiye', tr: 'Tekirdağ, Türkiye', ru: 'Текирдаг, Турция' },
      Istanbul: { en: 'Istanbul, Turkiye', tr: 'İstanbul, Türkiye', ru: 'Стамбул, Турция' },
      Moscow: { en: 'Moscow, Russia', tr: 'Moskova, Rusya', ru: 'Москва, Россия' },
      Almaty: { en: 'Almaty, Kazakhstan', tr: 'Almatı, Kazakistan', ru: 'Алматы, Казахстан' },
      Reutov: { en: 'Reutov, Russia', tr: 'Reutov, Rusya', ru: 'Реутов, Россия' },
      Odesa: { en: 'Odesa, Ukraine', tr: 'Odessa, Ukrayna', ru: 'Одесса, Украина' },
      OdesaMarketAlt: { en: 'Aerial view of the 7th Kilometer market near Odesa, Ukraine: rows of market pavilions and car parks', tr: 'Odessa, Ukrayna yakınındaki 7. Kilometre pazarının havadan görünümü: sıra sıra pazar pavyonları ve otoparklar', ru: 'Вид сверху на рынок «7-й километр» под Одессой, Украина: ряды торговых павильонов и парковки' },
      Photo: { en: 'Photo', tr: 'Fotoğraf', ru: 'Фото' },
      TekirdagAddress: { tr: 'Vakıflar OSB Mah D100 Cad No 38\nErgene, Tekirdağ 59930\nTürkiye', en: 'Vakiflar OSB, D100 Avenue No 38\nErgene, Tekirdag 59930\nTurkiye', ru: 'Вакыфлар ОСБ, пр. D100, № 38\nЭргене, Текирдаг 59930\nТурция' },
      CurtainStoreAddress: { tr: 'Kemalpaşa Mah Gümrük Emini Sk\nSerap Apt No 20 Daire 4\n1. Kat\nFatih, İstanbul 34134\nTürkiye', en: 'Kemalpasa, Gumruk Emini St\nSerap Apt No 20, Suite 4\n1st Floor (one floor up)\nFatih, Istanbul 34134\nTurkiye', ru: 'Кемальпаша, ул. Гюмрюк Эмини\nСерап Апт., № 20, офис 4\n1-й этаж (на этаж выше улицы)\nФатих, Стамбул 34134\nТурция' },
      RetailStoreAddress: { tr: 'Mesihpaşa Mah Hayriye Tüccarı Cad\nFatih, İstanbul 34130\nTürkiye', en: 'Mesihpasa, Hayriye Tuccari Avenue\nFatih, Istanbul 34130\nTurkiye', ru: 'Месихпаша, пр. Хайрие Тюджжары\nФатих, Стамбул 34130\nТурция' },
      MoscowAddress: { ru: 'г. Москва, 2-й Южнопортовый проезд\nд.12Г, стр.1\nРоссия', en: '2nd Yuzhnoportovy Proezd\n12G, Building 1\nMoscow, Russia', tr: '2. Yujnoportovıy Geçidi\nNo 12G, Bina 1\nMoskova, Rusya' },
      OdesaAddress: { uk: 'Промринок «7-й кілометр»\nОвідіопольська дорога, 7-й км\nсмт Авангард, Одеська обл., Україна', en: 'Seventh-Kilometer Manufactured Goods Market\n7th km of the Odesa-Ovidiopol Highway\nAvanhard (Odesa Oblast), Ukraine, 65000', tr: '7. Kilometre Sanayi Malları Pazarı\nOdessa-Ovidiopol Yolu 7. km\nAvangard (Odessa Bölgesi), Ukrayna, 65000', ru: 'Промрынок «7-й километр»\nОвидиопольская дорога, 7-й км\nпгт Авангард, Одесская обл., Украина, 65000' },
      ReutovAddress: { ru: 'Московская обл., г. Реутов\nул. Победы, д. 1, корп. 2\nРоссия', en: '1 Pobedy St, Building 2\nReutov, Moscow Oblast\nRussia', tr: 'Pobedy Sokağı No 1, Blok 2\nReutov, Moskova Oblastı\nRusya' },
      ReutovStoreAlt: { en: 'Karven tulle and drapery fabrics store in Reutov, Russia: glass shop front with lace curtains and street signs', tr: 'Reutov, Rusya\'daki Karven tül ve perdelik kumaş mağazası: dantel perdeli cam vitrin ve kaldırım tabelaları', ru: 'Магазин тюля и портьерных тканей Karven в Реутове: стеклянная витрина с кружевным тюлем и штендеры у входа' },
      AlmatyAddress: { ru: 'Казахстан, г. Алматы, рынок Мизам\n2-й ряд, бутики № 13–14', en: 'Mizam Market, Row 2\nBoutiques 13–14\nAlmaty, Kazakhstan', tr: 'Mizam Pazarı, 2. Sıra\nButik No 13–14\nAlmatı, Kazakistan' },
      AlmatyStoreAlt: { en: 'Demfirat Karven home textile store in Almaty, Kazakhstan: towels, blankets and bed linen sets on the shelves', tr: 'Demfirat Karven Almatı, Kazakistan ev tekstili mağazası: raflarda havlular, battaniyeler ve nevresim takımları', ru: 'Магазин домашнего текстиля Demfirat Karven в Алматы, Казахстан: полотенца, пледы и комплекты постельного белья на полках' },
      WorkHour5: { en: 'Mon - Fri 07:30-18:00, Sat 08:00-17:00 (Moscow Time)', tr: 'Pzt - Cum 07:30-18:00, Cmt 08:00-17:00 (Moskova Saati)', ru: 'Пн - Пт 07:30-18:00, Сб 08:00-17:00 (московское время)' },
      ProductLine5: { en: 'Tulle and drapery fabrics, wholesale and retail', tr: 'Tül ve perdelik kumaşlar, toptan ve perakende', ru: 'Тюль и портьерные ткани оптом и в розницу' },
      PageTitle: { en: 'Contact Us', tr: 'Bize Ulaşın', ru: 'Свяжитесь с нами', pl: 'Skontaktuj się z nami' },
      PageSubtitle: { en: 'Our locations around the world', tr: 'Dünya genelindeki lokasyonlarımız', ru: 'Наши локации по всему миру', pl: 'Nasze lokalizacje na całym świecie' }
    };
    return translations[key]?.[forLang] || translations[key]?.en || key;
  };
  // A phone number, with a WhatsApp chat link when the number takes WhatsApp
  const phone = (number: string, name = '', onWhatsApp = false) => (
    <p>
      {number}{name && ` (${name})`}
      {onWhatsApp && (
        <a href={`https://wa.me/${number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={classes.whatsapp} aria-label={`WhatsApp ${number}`}>
          <FaWhatsapp />
        </a>
      )}
    </p>
  );
  // An address in its own language, and beside it in the site's language when that differs
  const address = (key: string, addressLang: string) => (
    <div className={siteLang === addressLang ? undefined : classes.addressPair}>
      <p className={classes.addressLines}>{t(key, addressLang)}</p>
      {siteLang !== addressLang && <p className={classes.addressLines}>{t(key)}</p>}
    </div>
  );
  const titleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.substring(1)
    ).join(' ');
  };
  return (
    <div className={classes.ContactPage}>
      <h1 className={classes.pageTitle}>{t('PageTitle')}</h1>
      <p className={classes.pageSubtitle}>{t('PageSubtitle')}</p>
      <div className={`${classes.row} ${classes.row1}`}>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <span className={classes.badge}>{t('Headquarters')}</span>
          <h2>{t('ManufacturingPlant')} ({t('Tekirdag')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Cuma Öztürk</p>
          <p>Muhammed Fırat Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+90 533 544 25 25', 'Cuma', true)}
            {phone('+90 501 057 18 84', 'Muhammed Fırat', true)}
          </div>
          <h4>{t('Email')}:</h4>
          <p>factory@demfirat.com</p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour1')}</p>
          <h4>{t('Address')}:</h4>
          {address('TekirdagAddress', 'tr')}
          <h4>{t('ProductLines')}:</h4>
          <p>{t('ProductLine1')}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.686713960122!2d27.633625475834872!3d41.27215670313513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b4c1844bb93f27%3A0xcc32597014cd891f!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692136980792!5m2!1sen!2sus" />
          <LazyMap src="https://www.google.com/maps/embed?pb=!4v1692136911765!6m8!1m7!1sbvQ2ILty-DqtI9eXYi8tew!2m2!1d41.27192773807073!2d27.63652985915878!3f218.88!4f3.6607593875984747!5f2" />
        </div>
      </div>

      <div className={`${classes.row} ${classes.row2}`}>
        <div className={` ${classes.map} ${classes.item}`}>
          <LazyMap src="https://maps.google.com/maps?q=41.010693,28.954970&z=17&output=embed" />
          <LazyMap src="https://www.google.com/maps/embed?pb=!4v1761300000000!6m8!1m7!1sXUlQaQ5Hp1Q4_3rP7hKGRw!2m2!1d41.0107448!2d28.9549283!3f170!4f13!5f0.7820865974627469" />
        </div>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{t('FabricShowroom')} ({t('Istanbul')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Muhammed Fırat Öztürk</p>
          <p>Mirza Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+90 501 057 18 84', 'Muhammed Fırat', true)}
            {phone('+90 501 007 07 77', 'Mirza', true)}
          </div>
          <h4>{t('Email')}:</h4>
          <p>fabrics@demfirat.com</p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour2')}</p>
          <h4>{t('Address')}:</h4>
          {address('CurtainStoreAddress', 'tr')}
          <h4>{t('ProductLines')}:</h4>
          <p>{t('ProductLine2')}</p>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row3}`}>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{t('RetailStore')} ({t('Istanbul')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Mustafa Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+90 533 648 92 08', 'Mustafa', true)}
            {phone('+90 282 675 15 52')}
          </div>
          <h4>{t('Email')}:</h4>
          <p>linens@demfirat.com</p>
          {/* <p>mustafadmf@hotmail.com</p> */}
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour3')}</p>
          <h4>{t('Address')}:</h4>
          {address('RetailStoreAddress', 'tr')}
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine3'))}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.82211472467!2d28.95293187582215!3d41.0072665194874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab98864d1f17f%3A0x8bfc30e20c812ba9!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692138941178!5m2!1sen!2sus" />
          <LazyMap src="https://www.google.com/maps/embed?pb=!4v1761300000000!6m8!1m7!1srwr_EE5PRC4AieOu0xvWKA!2m2!1d41.0071506!2d28.9555705!3f346.86!4f0!5f0.7820865974627469" />
        </div>
      </div>

      <div className={`${classes.row} ${classes.row4}`}>
        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2248.3406043395717!2d37.69408517663421!3d55.700451096022434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54ad91d0d5301%3A0x5d8683607752f34!2sCarven%20Wholesale%20Company!5e0!3m2!1sen!2sus!4v1692139145140!5m2!1sen!2sus" />
          <LazyMap src="https://www.google.com/maps/embed?pb=!6m7!1m6!2m2!1d55.700411!2d37.696772!3f165.2!4f22!5f0.7820865974627469" />
        </div>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{t('OfficeWarehouse')} ({t('Moscow')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Adem Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+7 (926) 620-92-22', 'Adem', true)}
            {phone('+7 (495) 958-89-60')}
            {phone('+7 (977) 766-13-00')}
            {phone('+7 (926) 614-92-22')}
            {phone('+7 (926) 101-25-96', '', true)}
          </div>
          <h4>{t('Email')}:</h4>
          <p>moscow@demfirat.com</p>
          {/* <p>demfiratmosk@mail.ru</p> */}
          {/* <p>karventekstil@mail.ru</p> */}
          <h4>{t('Website')}:</h4>
          <p><a href="https://www.karven.ru" target="_blank" >www.karven.ru</a></p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour4')}</p>
          <h4>{t('Address')}:</h4>
          {address('MoscowAddress', 'ru')}
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine4'))}</p>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row5}`}>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{t('FabricShowroom')} ({t('Reutov')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Muhammed Ali Dinç</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+7 (980) 206-04-04', 'Muhammed Ali', true)}
            {phone('+7 (968) 738-13-00')}
            {phone('+7 (916) 055-42-02')}
            {phone('+7 (991) 361-32-27')}
          </div>
          <h4>{t('Email')}:</h4>
          <p>reutov@demfirat.com</p>
          {/* <p>Demfiratreutov@mail.ru</p> */}
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour5')}</p>
          <h4>{t('Address')}:</h4>
          {address('ReutovAddress', 'ru')}
          <h4>{t('ProductLines')}:</h4>
          <p>{t('ProductLine5')}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://maps.google.com/maps?q=55.7586746,37.8642387&z=17&output=embed" />
          <div className={classes.image}>
            <img src="/media/store/demfirat-karven-curtain-store-reutov-russia.avif" alt={t('ReutovStoreAlt')} style={{ objectPosition: 'center 80%' }} />
          </div>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row6}`}>
        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://maps.google.com/maps?q=46.4419409,30.6401844&z=16&output=embed" />
          <div className={classes.image}>
            <img src="/media/store/odesa-7th-kilometer-market-aerial-view.avif" alt={t('OdesaMarketAlt')} />
          </div>
          <p className={classes.photoCredit}>
            <a href="https://commons.wikimedia.org/wiki/File:%D0%9F%D1%80%D0%BE%D0%BC%D1%82%D0%BE%D0%B2%D0%B0%D1%80%D0%BD%D1%8B%D0%B9_%D1%80%D1%8B%D0%BD%D0%BE%D0%BA_%227-%D0%B9_%D0%BA%D0%B8%D0%BB%D0%BE%D0%BC%D0%B5%D1%82%D1%80%22.JPG" target="_blank" rel="noopener noreferrer">{t('Photo')}: Bercana 7km</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>
          </p>
        </div>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{t('RetailStore')} ({t('Odesa')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Nihat Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+380 67 142 55 51', 'Nihat', true)}
          </div>
          <h4>{t('Email')}:</h4>
          <p>odesa@demfirat.com</p>
          <h4>{t('Address')}:</h4>
          {address('OdesaAddress', 'uk')}
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine3'))}</p>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row7}`}>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{t('RetailStore')} ({t('Almaty')})</h2>
          <h4>{t('Representative')}:</h4>
          <p>Burak İlhan</p>
          <p>Muhammed Ali Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <div className={classes.phoneList}>
            {phone('+90 532 610 67 65', 'Burak', true)}
            {phone('+90 554 160 09 70', 'Muhammed Ali', true)}
          </div>
          <h4>{t('Email')}:</h4>
          <p>almaty@demfirat.com</p>
          {/* <p>burakilhan1401@gmail.com</p> */}
          <h4>{t('Address')}:</h4>
          {address('AlmatyAddress', 'ru')}
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine3'))}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://maps.google.com/maps?q=43.3075732,76.8961238&z=17&output=embed" />
          <div className={classes.image}>
            <img src="/media/store/demfirat-karven-home-textile-store-almaty-kazakhstan.avif" alt={t('AlmatyStoreAlt')} />
          </div>
        </div>
      </div>
    </div>
  )
}
