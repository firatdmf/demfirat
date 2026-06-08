"use client";
import React from "react";
import classes from "./ProductShowcase.module.css";
import AutoSlider from "./AutoSlider";

interface ProductShowcaseProps {
  title: string;
  locale: string;
  editId?: number;
}

export default function ProductShowcase({ title, locale, editId }: ProductShowcaseProps) {
  const fieldLocale = locale === 'tr' ? 'tr' : 'en';
  const slogan = locale === 'en' ? 'Elegance in every detail, comfort in every touch' :
    locale === 'ru' ? 'Изящество в каждой детали, комфорт в каждом прикосновении' :
      locale === 'pl' ? 'Elegancja w każdym detalu, komfort w każdym dotyku' :
        'Her detayda incelik, her dokunuşta konfor';

  const sliderLabel = locale === 'tr' ? 'Koleksiyondan' :
    locale === 'ru' ? 'Из коллекции' :
      locale === 'pl' ? 'Z kolekcji' :
        'From the Collection';

  return (
    <>
      {/* ── BÖLÜM 1: Fotoğraf Galerisi ── */}
      <section className={classes.gallerySection}>
        <div className={classes.container}>
          <div className={classes.header}>
            <h2
              className={classes.slogan}
              data-edit-text={editId ? `homesection:${editId}:body_${fieldLocale}` : undefined}
            >{slogan}</h2>
          </div>

          <div className={classes.gallery}>
            {/* Sol büyük resim */}
            <div className={`${classes.galleryItem} ${classes.large}`}>
              <img
                src="/media/showcase/showcase-1.avif"
                alt="Luxury curtain showcase"
                className={classes.image}
              />
            </div>

            {/* Sağ üst sol */}
            <div className={classes.galleryItem}>
              <img
                src="/media/showcase/showcase-2.avif"
                alt="Elegant fabric showcase"
                className={classes.image}
              />
            </div>

            {/* Sağ üst sağ */}
            <div className={classes.galleryItem}>
              <img
                src="/media/showcase/showcase-3.avif"
                alt="Interior design showcase"
                className={classes.image}
              />
            </div>

            {/* Sağ alt geniş */}
            <div className={`${classes.galleryItem} ${classes.wide}`}>
              <img
                src="/media/showcase/showcase-4.avif"
                alt="Living room showcase"
                className={classes.image}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BÖLÜM 2: Slider ── */}
      <section className={classes.sliderSection}>
        <div className={classes.container}>
          <p className={classes.sliderLabel}>{sliderLabel}</p>
          <AutoSlider locale={locale} />
        </div>
      </section>
    </>
  );
}
