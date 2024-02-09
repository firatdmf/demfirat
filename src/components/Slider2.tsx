// components/Slider2.tsx
"use client";
import React, { useState, useEffect } from "react";
import styles from "@/components/Slider2.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


interface Slider2Props {
  images: string[];
}
function Slider2({ images }: Slider2Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000); //changes the image every 15 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className={styles.Slider2}>
      <div className={styles.heroImage}>
        <img
          src={images[currentImageIndex]}
          alt={`Image ${currentImageIndex + 1}`}
        />
        <button className={styles.prevBtn} onClick={goToPrevImage}>
          {/* Prev */}
          <FaArrowLeft />
        </button>
        <button className={styles.nextBtn} onClick={goToNextImage}>
          <FaArrowRight />
        </button>
      </div>
      <div className={styles.contactInfo}>
        {/* Include your contact information here */}
      </div>
    </div>
  );
}

export default Slider2;
