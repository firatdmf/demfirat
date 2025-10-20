"use client";
import React from "react";
import classes from "./ProductShowcase.module.css";
import Link from "next/link";

interface ProductShowcaseProps {
  title: string;
  locale: string;
}

export default function ProductShowcase({ title, locale }: ProductShowcaseProps) {
  const slogan = locale === 'en' ? 'Elegance in every detail, comfort in every touch' :
                 locale === 'ru' ? 'Изящество в каждой детали, комфорт в каждом прикосновении' :
                 locale === 'pl' ? 'Elegancja w każdym detalu, komfort w każdym dotyku' :
                 'Her detayda incelik, her dokunuşta konfor';

  return (
    <section className={classes.showcaseSection}>
      <div className={classes.container}>
        <div className={classes.content}>
          <div className={classes.header}>
            <div className={classes.brand}>Karven</div>
            <div className={classes.slogan}>{slogan}</div>
          </div>
          
          <div className={classes.gallery}>
            {/* Sol büyük resim */}
            <div className={`${classes.galleryItem} ${classes.large}`}>
              <img 
                src="/media/showcase/showcase-1.jpg" 
                alt="Luxury curtain showcase"
                className={classes.image}
              />
            </div>
            
            {/* Sağ üst sol */}
            <div className={classes.galleryItem}>
              <img 
                src="/media/showcase/showcase-2.jpg" 
                alt="Elegant fabric showcase"
                className={classes.image}
              />
            </div>
            
            {/* Sağ üst sağ */}
            <div className={classes.galleryItem}>
              <img 
                src="/media/showcase/showcase-3.jpg" 
                alt="Interior design showcase"
                className={classes.image}
              />
            </div>
            
            {/* Sağ alt geniş */}
            <div className={`${classes.galleryItem} ${classes.wide}`}>
              <img 
                src="/media/showcase/showcase-4.jpg" 
                alt="Living room showcase"
                className={classes.image}
              />
            </div>
          </div>
          
          <div className={classes.ctaContainer}>
            <Link href={`/${locale}/product`} className={classes.ctaButton}>
              {locale === 'en' ? 'Explore Collection' : 
               locale === 'ru' ? 'Изучить коллекцию' :
               locale === 'pl' ? 'Odkryj kolekcję' :
               'Ürünlerimizi Keşfedin'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
