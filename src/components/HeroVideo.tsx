"use client";
import React from "react";
import classes from "./HeroVideo.module.css";

interface HeroVideoProps {
  videoSrc: string;
  title?: string;
  subtitle?: string;
}

export default function HeroVideo({ videoSrc, title, subtitle }: HeroVideoProps) {
  return (
    <div className={classes.heroVideoContainer}>
      <video
        className={classes.heroVideo}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {(title || subtitle) && (
        <div className={classes.heroOverlay}>
          <div className={classes.heroContent}>
            {subtitle && <p className={classes.heroSubtitle}>{subtitle}</p>}
            {title && <h1 className={classes.heroTitle}>{title}</h1>}
          </div>
        </div>
      )}
    </div>
  );
}
