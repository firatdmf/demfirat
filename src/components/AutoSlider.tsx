"use client";
import React, { useState, useEffect, useCallback } from "react";
import classes from "./AutoSlider.module.css";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

interface AutoSliderProps {
  locale: string;
}

export default function AutoSlider({ locale }: AutoSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: Slide[] = [
    {
      image: "/media/slider/slide-1.jpg",
      title: locale === 'en' ? 'Luxury Fabrics' :
             locale === 'ru' ? 'Роскошные ткани' :
             locale === 'pl' ? 'Luksusowe tkaniny' :
             'Lüks Kumaşlar',
      subtitle: locale === 'en' ? 'Transform your space with premium textiles' :
                locale === 'ru' ? 'Преобразите свое пространство премиальным текстилем' :
                locale === 'pl' ? 'Przekształć swoją przestrzeń dzięki premium tekstyliom' :
                'Mekanınızı premium tekstillerle dönüştürün'
    },
    {
      image: "/media/slider/slide-2.jpg",
      title: locale === 'en' ? 'Elegant Designs' :
             locale === 'ru' ? 'Элегантный дизайн' :
             locale === 'pl' ? 'Eleganckie projekty' :
             'Zarif Tasarımlar',
      subtitle: locale === 'en' ? 'Handcrafted perfection for your home' :
                locale === 'ru' ? 'Ручная работа совершенства для вашего дома' :
                locale === 'pl' ? 'Ręcznie wykonana perfekcja dla Twojego domu' :
                'Eviniz için el işi mükemmellik'
    },
    {
      image: "/media/slider/slide-3.jpg",
      title: locale === 'en' ? 'Timeless Quality' :
             locale === 'ru' ? 'Вечное качество' :
             locale === 'pl' ? 'Ponadczasowa jakość' :
             'Zamansız Kalite',
      subtitle: locale === 'en' ? 'Crafted to last, designed to inspire' :
                locale === 'ru' ? 'Создано надолго, разработано для вдохновения' :
                locale === 'pl' ? 'Stworzone, by trwać, zaprojektowane, by inspirować' :
                'Kalıcı olmak için üretildi, ilham vermek için tasarlandı'
    },
    {
      image: "/media/slider/slide-4.jpg",
      title: locale === 'en' ? 'Exquisite Craftsmanship' :
             locale === 'ru' ? 'Изысканное мастерство' :
             locale === 'pl' ? 'Wyrafinowane rzemiosło' :
             'Mükemmel İşçilik',
      subtitle: locale === 'en' ? 'Where tradition meets modern elegance' :
                locale === 'ru' ? 'Где традиция встречается с современной элегантностью' :
                locale === 'pl' ? 'Gdzie tradycja spotyka nowoczesną elegancję' :
                'Gelenek ve modern zarafetin buluştuğu yer'
    }
  ];

  const next = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <div
      className={classes.sliderWrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Resim alanı — overlay YOK */}
      <div className={classes.imageArea}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${classes.slide} ${index === currentSlide ? classes.active : ""}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={classes.slideImage}
            />
          </div>
        ))}

        {/* Sol / Sağ Butonlar */}
        <button className={`${classes.navBtn} ${classes.navLeft}`} onClick={prev} aria-label="Önceki">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button className={`${classes.navBtn} ${classes.navRight}`} onClick={next} aria-label="Sonraki">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Nokta göstergeleri */}
        <div className={classes.dots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${classes.dot} ${index === currentSlide ? classes.activeDot : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slayt ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Yazılar resmin DIŞINDA, altında */}
      <div className={classes.textArea}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${classes.textSlide} ${index === currentSlide ? classes.textActive : ""}`}
          >
            <h3 className={classes.title}>{slide.title}</h3>
            <p className={classes.subtitle}>{slide.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
