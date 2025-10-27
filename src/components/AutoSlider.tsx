"use client";
import React, { useState, useEffect } from "react";
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

  const slides: Slide[] = [
    {
      image: "/media/slider/slide-1.avif",
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
      image: "/media/slider/slide-2.avif",
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
      image: "/media/slider/slide-3.avif",
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
      image: "/media/slider/slide-4.avif",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 saniyede bir değişir

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className={classes.sliderSection}>
      <div className={classes.sliderContainer}>
        <div className={classes.slides}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`${classes.slide} ${
                index === currentSlide ? classes.active : ""
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={classes.slideImage}
              />
              <div className={classes.overlay}></div>
              <div className={classes.content}>
                <h2 className={classes.title}>{slide.title}</h2>
                <p className={classes.subtitle}>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
