'use client';

import { useParams } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
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

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ManufacturingPlant: { en: 'Manufacturing Plant', tr: 'Üretim Tesisi', ru: 'Производственный завод', pl: 'Zakład Produkcyjny' },
      FabricShowroom: { en: 'Curtain Store', tr: 'Perde Mağazası', ru: 'Магазин занавесей', pl: 'Sklep z Zasłonami' },
      RetailStore: { en: 'Hometextiles Store', tr: 'Ev Tekstili Perakende Mağaza', ru: 'Магазин домашних текстилей', pl: 'Sklep z Tekstylami Domy' },
      WarehouseShowroom: { en: 'Warehouse & Showroom', tr: 'Depo ve Showroom', ru: 'Склад и Шоу-рум', pl: 'Hurtownia i Showroom' },
      Representative: { en: 'Representative', tr: 'Temsilci', ru: 'Представитель', pl: 'Przedstawiciel' },
      Phone: { en: 'Phone', tr: 'Telefon', ru: 'Телефон', pl: 'Telefon' },
      Email: { en: 'Email', tr: 'E-posta', ru: 'Эл. почта', pl: 'E-mail' },
      Address: { en: 'Address', tr: 'Adres', ru: 'Адрес', pl: 'Adres' },
      WorkHours: { en: 'Work Hours', tr: 'Çalışma Saatleri', ru: 'Часы работы', pl: 'Godziny Pracy' },
      ProductLines: { en: 'Product Lines', tr: 'Ürün Grupları', ru: 'Ассортимент', pl: 'Asortyment' },
      Website: { en: 'Website', tr: 'Website', ru: 'Веб-сайт', pl: 'Strona internetowa' },
      GeneralInquiries: { en: 'General Inquiries', tr: 'Genel Sorular', ru: 'Общие вопросы', pl: 'Zapytania Ogólne' },
      AccountingInquiries: { en: 'Accounting Inquiries', tr: 'Muhasebe Soruları', ru: 'Бухгалтерские вопросы', pl: 'Zapytania Księgowe' },
      WorkHour1: { en: 'Mon - Fri 08:30-18:30 (Istanbul Time)', tr: 'Pzt - Cum 08:30-18:30 (İstanbul Saati)', ru: 'Пн - Пт 08:30-18:30 (стамбульское время)', pl: 'Pon - Pt 08:30-18:30 (Czasu Stambulskiego)' },
      WorkHour2: { en: 'Mon - Fri 08:30-19:00, Sat 08:30-14:00 (Istanbul Time)', tr: 'Pzt - Cum 08:30-19:00, Cmt 08:30-14:00', ru: 'Пн - Пт 08:30-19:00, Сб 08:30-14:00', pl: 'Pon - Pt 08:30-19:00, Sob 08:30-14:00' },
      WorkHour3: { en: 'Mon - Fri 09:00-20:30, Sat 09:00-16:00 (Istanbul Time)', tr: 'Pzt - Cum 09:00-20:30, Cmt 09:00-16:00', ru: 'Пн - Пт 09:00-20:30, Сб 09:00-16:00', pl: 'Pon - Pt 09:00-20:30, Sob 09:00-16:00' },
      WorkHour4: { en: 'Mon - Fri 09:00-18:00, Sat 09:00-16:00 (Moscow Time)', tr: 'Pzt - Cum 09:00-18:00, Cmt 09:00-16:00', ru: 'Пн - Пт 09:00-18:00, Сб 09:00-16:00', pl: 'Pon - Pt 09:00-18:00, Sob 09:00-16:00' },
      ProductLine1: { en: 'Drapery, Upholstery, and Bridal Fabrics & Lace Table Runners', tr: 'Perde, Döşemelik ve Gelinlik Kumaşlar & Dantel Masa Örtüleri', ru: 'Ткани для штор, обивки и свадебных платьев', pl: 'Tkaniny zasłonowe, tapicerskie i ślubne' },
      ProductLine2: { en: 'Interior Fabrics: Drapery & Upholstery', tr: 'İç Mekan Kumaşları: Perde ve Döşemelik', ru: 'Интерьерные ткани: портьеры и обивка', pl: 'Tkaniny do Wnętrz: Zasłony i Tapicerka' },
      ProductLine3: { en: 'Bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, blankets, pillows, mattress covers', tr: 'Yatak çarşafı, yatak örtüsü, mobilya örtüleri, havlular, mutfak havluları', ru: 'Постельное белье, покрывала, чехлы для мебели, полотенца', pl: 'Pościel, narzuty, pokrowce na meble, ręczniki, obrusy' },
      ProductLine4: { en: 'Bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, blankets, pillows, mattress covers', tr: 'Yatak çarşafı, yatak örtüsü, mobilya örtüleri, havlular, mutfak havluları', ru: 'Постельное белье, покрывала, чехлы для мебели, полотенца', pl: 'Pościel, narzuty, pokrowce na meble, ręczniki, obrusy' },
      PageTitle: { en: 'Contact Us', tr: 'Bize Ulaşın', ru: 'Свяжитесь с нами', pl: 'Skontaktuj się z nami' },
      PageSubtitle: { en: 'Our locations around the world', tr: 'Dünya genelindeki lokasyonlarımız', ru: 'Наши локации по всему миру', pl: 'Nasze lokalizacje na całym świecie' }
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };
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
          <h2>{t('ManufacturingPlant')} (Tekirdağ, Türkiye)</h2>
          <h4>{t('Representative')}:</h4>
          <p>Cuma Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <p>+90 (282) 675-1552 (Office)</p>
          <p>+90 (533) 544-2525 (Mobile)</p>
          <h4>{t('Email')}:</h4>
          <p>info@demfirat.com ({t('GeneralInquiries')})</p>
          <p>karvenmuhasebe@gmail.com ({t('AccountingInquiries')})</p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour1')}</p>
          <h4>{t('Address')}:</h4>
          <p>         
            Vakıflar OSB Mah D100 Cad No 38 <br />
            Ergene, Tekirdağ 59930 <br />
            Türkiye
          </p>
          <h4>{t('ProductLines')}:</h4>
          <p>{t('ProductLine1')}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.686713960122!2d27.633625475834872!3d41.27215670313513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b4c1844bb93f27%3A0xcc32597014cd891f!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692136980792!5m2!1sen!2sus" />
          <LazyMap src="https://www.google.com/maps/embed?pb=!4v1692136911765!6m8!1m7!1sbvQ2ILty-DqtI9eXYi8tew!2m2!1d41.27192773807073!2d27.63652985915878!3f225.87813419497698!4f3.6607593875984747!5f0.7820865974627469" />
        </div>
      </div>

      <div className={`${classes.row} ${classes.row2}`}>
        <div className={` ${classes.map} ${classes.item}`}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d752.6692567557905!2d28.95524754012674!3d41.01044178468319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1692137913829!5m2!1sen!2sus" />
          <div className={classes.image}>
            <img src="/media/store/store-5.jpeg" alt="Demfirat Karven Store Image" />
          </div>
        </div>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{t('FabricShowroom')} (İstanbul, Türkiye)</h2>
          <h4>{t('Representative')}:</h4>
          <p>Muhammed Fırat Öztürk</p>
          <p>Özcan Öztürk</p>
          <p>Devrim Eraslan</p>
          <h4>{t('Phone')}:</h4>
          <p>+90 (501) 057-1884 (Muhammed Fırat)</p>
          <p>+90 (555) 087-5555 (Özcan)</p>
          <p>+90 (543) 440-2157 (Devrim)</p>
          <h4>{t('Email')}:</h4>
          <p>krvn.dmf@gmail.com</p>
          <p>info@demfirat.com</p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour2')}</p>
          <h4>{t('Address')}:</h4>
          <p>

            Kemalpaşa Mah Gençtürk Cad No 21A <br />
            Fatih, İstanbul 34134 <br />
            Türkiye
          </p>
          <h4>{t('ProductLines')}:</h4>
          <p>{t('ProductLine2')}</p>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row3}`}>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{t('RetailStore')} (İstanbul, Türkiye)</h2>
          <h4>{t('Representative')}:</h4>
          <p>Mustafa Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <p>+90 (282) 675-1552 (Office)</p>
          <p>+90 (533) 648-9208 (Mobile)</p>
          <h4>{t('Email')}:</h4>
          <p>info@demfirat.com</p>
          <p>mustafadmf@hotmail.com</p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour3')}</p>
          <h4>{t('Address')}:</h4>
          <p>

            Mesihpaşa Mah Hayriye Tüccarı Cad <br />
            Fatih İstanbul, 34130 <br />
            Türkiye
          </p>
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine3'))}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.82211472467!2d28.95293187582215!3d41.0072665194874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab98864d1f17f%3A0x8bfc30e20c812ba9!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692138941178!5m2!1sen!2sus" />
          <div className={classes.image}>
            <img src="/media/store/demfirat_karven_1_exterior.jpg" alt="" />
          </div>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row4}`}>
        <div className={`${classes.item} ${classes.map} `}>
          <LazyMap src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2248.3406043395717!2d37.69408517663421!3d55.700451096022434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54ad91d0d5301%3A0x5d8683607752f34!2sCarven%20Wholesale%20Company!5e0!3m2!1sen!2sus!4v1692139145140!5m2!1sen!2sus" />
          <div className={classes.image}>
            <img src="/media/store/moscow_store_1.jpg" alt="" />
          </div>
        </div>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{t('WarehouseShowroom')} (Москва, Pоссия)</h2>
          <h4>{t('Representative')}:</h4>
          <p>Adem Öztürk</p>
          <h4>{t('Phone')}:</h4>
          <p>+7 (968) 738 13 00 (Cell)</p>
          <p>+7 (916) 055 42 02 (Cell)</p>
          <p>+7 (926) 101 25 96 (Office)</p>
          <h4>{t('Email')}:</h4>
          <p>demfiratmosk@mail.ru</p>
          <p>karventekstil@mail.ru</p>
          <h4>{t('Website')}:</h4>
          <p><a href="https://www.karven.ru" target="_blank" >www.karven.ru</a></p>
          <h4>{t('WorkHours')}</h4>
          <p>{t('WorkHour4')}</p>
          <h4>{t('Address')}:</h4>
          <p>
            г. Москва, 2-й Южнопортовый проезд <br />
            д.12Г, стр.1 <br />
            Pоссия
          </p>
          <p>2nd Yuzhnoportovy proezd, 12G, building 1s <br /> Moscow, Russia</p>
          <h4>{t('ProductLines')}:</h4>
          <p>{titleCase(t('ProductLine4'))}</p>
        </div>
      </div>
    </div>
  )
}
