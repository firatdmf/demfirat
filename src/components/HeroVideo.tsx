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
  /** Storefront HomeSection.id — when supplied, the visual editor
   *  (?edit=1) treats title/subtitle as inline-editable and the video
   *  region as a swappable image. */
  editId?: number;
}

export default function HeroVideo({ videoSrc, title, subtitle, locale = 'en', showCatalogButton = false, primaryCta, secondaryCta, editId }: HeroVideoProps) {
  const fieldLocale = locale === 'tr' ? 'tr' : 'en';
  return (
    <div className={classes.heroVideoContainer}>
      <video
        className={classes.heroVideo}
        autoPlay
        loop
        muted
        playsInline
        data-edit-image={editId ? `homesection:${editId}:image_url` : undefined}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Floating brand CTA to cover watermarks */}
      <Link href={`/${locale}/contact`} className={classes.watermarkCover}>
        <span className={classes.coverIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </span>
        <span>
          {locale === 'tr' ? 'BİZE ULAŞIN' :
           locale === 'ru' ? 'СВЯЗАТЬСЯ' :
           locale === 'pl' ? 'KONTAKT' :
           'CONTACT US'}
        </span>
      </Link>

      {(title || subtitle) && (
        <div className={classes.heroOverlay}>
          <div className={classes.heroContent}>
            {subtitle && (
              <p
                className={classes.heroSubtitle}
                data-edit-text={editId ? `homesection:${editId}:eyebrow_${fieldLocale}` : undefined}
              >{subtitle}</p>
            )}
            {title && (
              <h1
                className={classes.heroTitle}
                data-edit-text={editId ? `homesection:${editId}:title_${fieldLocale}` : undefined}
              >{title}</h1>
            )}

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
