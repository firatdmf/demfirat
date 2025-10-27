"use client";
import React, { useRef, useState, useEffect } from 'react';
import ClientTestimonials from './ClientTestimonials';
import classes from './DraggableTestimonials.module.css';

interface Review {
  image: string;
  name: string;
  review: string;
}

interface DraggableTestimonialsProps {
  reviews: Review[];
  locale: string;
}

export default function DraggableTestimonials({ reviews, locale }: DraggableTestimonialsProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    setHasMoved(true);
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={classes.clientReviews}>
      <h2>
        {locale === 'tr' ? 'Müşterilerimizden Fotoğraflar' :
         locale === 'ru' ? 'Фотографии от наших клиентов' :
         locale === 'pl' ? 'Zdjęcia od naszych klientów' :
         locale === 'de' ? 'Fotos von unseren Kunden' :
         'Photos from our Clients'}
      </h2>
      <div className={classes.clientReviewsContainer}>
        <div
          ref={sliderRef}
          className={classes.clientReviewsSlider}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {reviews.map((review, index) => (
            <ClientTestimonials
              key={`review-${index}`}
              image={review.image}
              name={review.name}
              review={review.review}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
