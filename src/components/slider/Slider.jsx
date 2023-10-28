"use client";
import { useState, useEffect } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { sliderData } from "./slider-data";
import "./Slider.scss";
function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideLength = sliderData.length; //holding the number of items in our array from slider-data.js
  //slideLength = 1 2 3
  //currentSlide = 0 1 2

  const autoScroll = true;
  let slideInterval;
  let intervalTime = 5000; //in ms so it is equal to 5 seconds

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slideLength - 1 ? 0 : currentSlide + 1);
  };
  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slideLength - 1 : currentSlide - 1);
  };

  function auto() {
    slideInterval = setInterval(nextSlide, intervalTime);
  }

  // the below useEffect will run once when the page loads
  useEffect(() => {
    setCurrentSlide(0);
  }, []);
  useEffect(() => {
    if (autoScroll) {
      auto();
    }
    //now cleanup function
    return () => clearInterval(slideInterval);
  }, [currentSlide]);

  return (
    <div className="slider">
      <AiOutlineArrowLeft className="arrow prev" onClick={prevSlide} />
      <AiOutlineArrowRight className="arrow next" onClick={nextSlide} />

      {sliderData.map((slide, index) => {
        return (
          <div
            className={index === currentSlide ? "slide current" : "slide"}
            key={index}
          >
            {index === currentSlide && (
              <>
                <img src={slide.image} alt={slide.desc} style={{position:"top"}}/>
                <div className="content">
                  <h2>{slide.heading}</h2>
                  <p>{slide.desc}</p>
                  <hr />
                  {/* <button className="--btn --btn-primary">Get Started!</button> */}
                </div>
                
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Slider;
