import classes from './page.module.css'
import { useTranslations } from 'next-intl';

function Contact() {
  const ContactPageT = useTranslations('ContactPage')
    // below function takes a string and capitilize the first letter of each word in it
    const titleCase = function (str:string) {
      let splitStr = str.toLowerCase().split(' ');
      for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
      }
      // Directly return the joined string
      return splitStr.join(' ');
    }
  return (
    <div className={classes.ContactPage}>
            <div className={`${classes.row} ${classes.row1}`}>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{ContactPageT('ManufacturingPlant')} (Tekirdağ, Türkiye)</h2>
          <h4>{ContactPageT('Representative')}:</h4>
          <p>Cuma Öztürk</p>
          <h4>{ContactPageT('Phone')}:</h4>
          <p>+90 (282) 675-1552 (Office)</p>
          <p>+90 (533) 544-2525 (Mobile)</p>
          <h4>{ContactPageT('Email')}:</h4>
          <p>info@demfirat.com ({ContactPageT('GeneralInquiries')})</p>
          <p>karvenmuhasebe@gmail.com ({ContactPageT('AccountingInquiries')})</p>
          <h4>{ContactPageT('WorkHours')}</h4>
          <p>{ContactPageT('WorkHour1')}</p>
          <h4>{ContactPageT('Address')}:</h4>
          <p>
            Karven Tekstil <br />
            Vakıflar OSB Mah D100 Cad No 38 <br />
            Ergene, Tekirdağ 59930 <br />
            Türkiye
          </p>
          <h4>{ContactPageT('ProductLines')}:</h4>
          {/* <p>Drapery, Upholstery, and Bridal Fabrics & Lace Table Runners</p> */}
          <p>{ContactPageT('ProductLine1')}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.686713960122!2d27.633625475834872!3d41.27215670313513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b4c1844bb93f27%3A0xcc32597014cd891f!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692136980792!5m2!1sen!2sus"
            // allowFullScreen=""
            loading="lazy"
            style={{ border: "0" }}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!4v1692136911765!6m8!1m7!1sbvQ2ILty-DqtI9eXYi8tew!2m2!1d41.27192773807073!2d27.63652985915878!3f225.87813419497698!4f3.6607593875984747!5f0.7820865974627469"
            // allowFullScreen=""
            loading="lazy"
            style={{ border: "0" }}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row2}`}>
        <div className={` ${classes.map} ${classes.item}`}>
          <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d752.6692567557905!2d28.95524754012674!3d41.01044178468319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1692137913829!5m2!1sen!2sus"
            // allowFullScreen=""
            loading="lazy"
            style={{ border: "0" }}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          {/* <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!4v1692136743712!6m8!1m7!1sH95SKn0zsoizFxc2esUcNw!2m2!1d41.01049627569196!2d28.95540105451114!3f298.7412353650941!4f-11.65487231269131!5f0.7820865974627469"
            // allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe> */}
          <div className={classes.image}>
            <img src="/media/store/store-5.jpeg" alt="Demfirat Karven Store Image" />
          </div>
        </div>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{ContactPageT('FabricShowroom')} (İstanbul, Türkiye)</h2>
          <h4>{ContactPageT('Representative')}:</h4>
          <p>Özcan Öztürk</p>
          <p>Ercan Öztürk</p>
          <h4>{ContactPageT('Phone')}:</h4>
          <p>+90 (555) 087-5555 (Özcan)</p>
          <p>+90 (542) 341-4845 (Ercan)</p>
          <h4>{ContactPageT('Email')}:</h4>
          <p>krvn.dmf@gmail.com</p>
          <p>info@demfirat.com</p>
          <h4>{ContactPageT('WorkHours')}</h4>
          {/* <p>Mon - Fri 08:30-19:00, Sat 08:30-14:00 (Istanbul Time)</p> */}
          <p>{ContactPageT('WorkHour2')}</p>
          <h4>{ContactPageT('Address')}:</h4>
          <p>
            Karven Home Collection <br />
            Kemalpaşa Mah Gençtürk Cad No 21A <br />
            Fatih, İstanbul 34134 <br />
            Türkiye
          </p>
          <h4>{ContactPageT('ProductLines')}:</h4>
          {/* <p>Interior Fabrics: Drapery & Upholstery</p> */}
          <p>{ContactPageT('ProductLine2')}</p>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row3}`}>
        <div className={` ${classes.item} ${classes.textInfo}`}>
          <h2>{ContactPageT('RetailStore')} (İstanbul, Türkiye)</h2>
          <h4>{ContactPageT('Representative')}:</h4>
          <p>Mustafa Öztürk</p>
          <h4>{ContactPageT('Phone')}:</h4>
          <p>+90 (282) 675-1552 (Office)</p>
          <p>+90 (533) 544-2525 (Mobile)</p>
          <h4>{ContactPageT('Email')}:</h4>
          <p>info@demfirat.com</p>
          <p>mustafadmf@hotmail.com</p>
          <h4>{ContactPageT('WorkHours')}</h4>
          {/* <p>Mon - Fri 09:00-20:30, Sat 09:00-16:00 (Istanbul Time)</p> */}
          <p>{ContactPageT('WorkHour3')}</p>
          <h4>{ContactPageT('Address')}:</h4>
          <p>
            Demfırat Tekstil <br />
            Mesihpaşa Mah Hayriye Tüccarı Cad <br />
            Fatih İstanbul, 34130 <br />
            Türkiye
          </p>
          <h4>{ContactPageT('ProductLines')}:</h4>
          {/* <p>{titleCase("bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, blankets, pillows, mattress covers, children's assortment, bathrobes, home clothes, sheets, blankets, aprons, sauna sets, ironing board covers.")}</p> */}
          <p>{titleCase(ContactPageT('ProductLine3'))}</p>
        </div>

        <div className={`${classes.item} ${classes.map} `}>
          <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.82211472467!2d28.95293187582215!3d41.0072665194874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab98864d1f17f%3A0x8bfc30e20c812ba9!2sDem%20F%C4%B1rat%20Karven%20Tekstil!5e0!3m2!1sen!2sus!4v1692138941178!5m2!1sen!2sus"
            // allowFullScreen=""
            loading="lazy"
            style={{ border: "0" }}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          {/* <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!4v1692139036103!6m8!1m7!1sJCzxW-kIO64pIRmdjbUmJg!2m2!1d41.00715116010365!2d28.95547816700329!3f35.09908123812337!4f-2.0610459668727827!5f1.7385114864122344"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe> */}
          <div className={classes.image}>
            <img src="/media/store/demfirat_karven_1_exterior.jpg" alt="" />
          </div>
        </div>
      </div>

      <div className={`${classes.row} ${classes.row4}`}>
        <div className={`${classes.item} ${classes.map} `}>
          <div className={classes.image}>
            <img src="/media/heimtextile6.jpg" alt="" />
          </div>
          <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2248.3406043395717!2d37.69408517663421!3d55.700451096022434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54ad91d0d5301%3A0x5d8683607752f34!2sCarven%20Wholesale%20Company!5e0!3m2!1sen!2sus!4v1692139145140!5m2!1sen!2sus"
            // allowFullScreen=""
            loading="lazy"
            style={{ border: "0" }}
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          {/* <iframe
            title=" "
            src="https://www.google.com/maps/embed?pb=!4v1692136743712!6m8!1m7!1sH95SKn0zsoizFxc2esUcNw!2m2!1d41.01049627569196!2d28.95540105451114!3f298.7412353650941!4f-11.65487231269131!5f0.7820865974627469"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe> */}
        </div>
        <div className={`${classes.item} ${classes.textInfo}`}>
          <h2>{ContactPageT('WarehouseShowroom')} (Москва, Pоссия)</h2>
          <h4>{ContactPageT('Representative')}:</h4>
          <p>Adem Öztürk</p>
          <h4>{ContactPageT('Phone')}:</h4>
          <p>+7 (968) 738 13 00 (Cell)</p>
          <p>+7 (916) 055 42 02 (Cell)</p>
          <p>+7 (926) 101 25 96 (Office)</p>
          <h4>{ContactPageT('Email')}:</h4>
          <p>demfiratmosk@mail.ru</p>
          <p>karventekstil@mail.ru</p>
          <h4>{ContactPageT('Website')}:</h4>
          <p><a href="https://www.karven.ru" target="_blank" >www.karven.ru</a></p>
          <h4>{ContactPageT('WorkHours')}</h4>
          {/* <p>Mon - Fri 09:00-18:00, Sat 09:00-16:00 (Moscow Time)</p> */}
          <p>{ContactPageT('WorkHour4')}</p>
          <h4>{ContactPageT('Address')}:</h4>
          <p>
            г. Москва, 2-й Южнопортовый проезд <br />
            д.12Г, стр.1 <br />
            Pоссия
          </p>
          <p>2nd Yuzhnoportovy proezd, 12G, building 1s <br /> Moscow, Russia</p>
          <h4>{ContactPageT('ProductLines')}:</h4>
          {/* <p>{titleCase("bed linen, bedspreads, furniture covers, towels, kitchen towels, towel sets, tablecloths, blankets, pillows, mattress covers, children's assortment, bathrobes, home clothes, sheets, blankets, aprons, sauna sets, ironing board covers.")}</p> */}
          <p>{titleCase(ContactPageT('ProductLine4'))}</p>

        </div>
      </div>
    </div>
  )
}

export default Contact