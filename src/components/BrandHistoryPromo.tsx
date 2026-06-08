'use client';

import React from 'react';
import classes from './BrandHistoryPromo.module.css';
import Link from 'next/link';

interface BrandHistoryPromoProps {
  locale: string;
}

export default function BrandHistoryPromo({ locale }: BrandHistoryPromoProps) {
  const subtitle = locale === 'tr' ? "1991'DEN BERİ ÖZENLE" :
    locale === 'ru' ? 'С ЗАБОТОЙ С 1991 ГОДА' :
      locale === 'pl' ? 'STARANNIE OD 1991 ROKU' :
        'WITH CARE SINCE 1991';

  const title = "DEMFIRAT";

  const description = locale === 'tr' 
    ? "Dem Fırat olarak, 1991 yılından bu yana evinizi zarafet ve konforla buluşturuyoruz. Seçkin kumaş koleksiyonlarımız ve titiz işçiliğimiz ile her yaşam alanına değer katıyoruz."
    : locale === 'ru'
    ? "С 1991 года Dem Fırat наполняет ваш дом элегантностью и уютом. Наши изысканные ткани и безупречный пошив преображают любое жилое пространство."
    : locale === 'pl'
    ? "Od 1991 roku Dem Fırat łączy elegancję i komfort w Twoim domu. Nasze starannie dobrane tkaniny i precyzyjne rzemiosło wnoszą wyjątkową wartość do każdej przestrzeni."
    : "Since 1991, Dem Fırat has been bringing elegance and comfort to your home. With our exquisite fabric collections and precise craftsmanship, we elevate every living space.";

  const ctaText = locale === 'tr' ? 'Hikayemizi Keşfedin' :
    locale === 'ru' ? 'Наша история' :
      locale === 'pl' ? 'Nasza historia' :
        'Explore Our Story';

  return (
    <section className={classes.historySection}>
      <div className={classes.container}>
        <div className={classes.grid}>
          {/* Sol: Metin Bloğu */}
          <div className={classes.textBlock}>
            <span className={classes.subtitle}>{subtitle}</span>
            <h2 className={classes.logoTitle}>{title}</h2>
            <p className={classes.description}>{description}</p>
            <div className={classes.ctaWrapper}>
              <Link href={`/${locale}/about`} className={classes.storyButton}>
                {ctaText}
                <span className={classes.arrow}>→</span>
              </Link>
            </div>
          </div>

          {/* Sağ: İkili Görsel Vitrini */}
          <div className={classes.imageBlock}>
            <div className={classes.imageContainerLeft}>
              <img 
                src="/media/brand-section/image-1.png" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/media/young_Cuma_working.webp";
                }}
                alt="Dem Fırat craftsmanship history" 
                className={classes.img}
              />
            </div>
            <div className={classes.imageContainerRight}>
              <img 
                src="/media/brand-section/image-2.png" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/media/oldStoreFrontPic.jpg";
                }}
                alt="Dem Fırat legacy" 
                className={classes.img}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
