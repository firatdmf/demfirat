"use client";
import React from "react";
import classes from "./HeroVideo.module.css";
import CatalogRequestForm from "./CatalogRequestForm";
import Link from "next/link";

interface HeroVideoProps {
  videoSrc: string;
  title?: string;
  subtitle?: string;
  locale?: string;
  showCatalogButton?: boolean;
  primaryCta?: { text: string; link: string; };
  secondaryCta?: { text: string; link: string; };
}

export default function HeroVideo({ videoSrc, title, subtitle, locale = 'en', showCatalogButton = false, primaryCta, secondaryCta }: HeroVideoProps) {
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

            {/* Decorative divider */}
            {(primaryCta || secondaryCta) && (
              <div className={classes.heroDivider}>
                <span className={classes.heroDividerLine}></span>
                <span className={classes.heroDividerIcon}>✦</span>
                <span className={classes.heroDividerLine}></span>
              </div>
            )}

            {(primaryCta || secondaryCta) && (
              <div className={classes.heroCtaGroup}>
                {primaryCta && (
                  <Link href={primaryCta.link} className={classes.primaryCta}>
                    <span className={classes.ctaShimmer}></span>
                    <span className={classes.ctaContent}>
                      <svg className={classes.ctaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                      </svg>
                      {primaryCta.text}
                    </span>
                  </Link>
                )}
                {secondaryCta && (
                  <Link href={secondaryCta.link} className={classes.secondaryCta}>
                    <span className={classes.ctaContent}>
                      {secondaryCta.text}
                      <svg className={classes.ctaArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </Link>
                )}
              </div>
            )}

            {showCatalogButton && (
              <div className={classes.catalogButtonWrapper}>
                <CatalogRequestForm locale={locale} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
