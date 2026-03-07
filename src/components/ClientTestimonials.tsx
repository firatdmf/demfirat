"use client";
import { useState } from "react";
import classes from "./ClientTestimonials.module.css";
import Image from "next/image";

interface ReviewProps {
  image: string;
  name: string;
  review: string;
  date: string;
  locale: string;
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0] + "***";
    })
    .join(" ");
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const loc = locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : locale === "pl" ? "pl-PL" : "en-US";
  return date.toLocaleDateString(loc, { year: "numeric", month: "long" });
}

function ClientTestimonials({ image, name, review, date, locale }: ReviewProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.length > 120;
  const displayReview = !expanded && isLong ? review.slice(0, 120) + "..." : review;
  const readMoreText = locale === "tr" ? "Devamini oku" : locale === "ru" ? "Читать далее" : locale === "pl" ? "Czytaj dalej" : "Read more";

  return (
    <div className={classes.cardWrapper}>
      <div className={classes.reviewCard}>
        <div className={classes.reviewImage}>
          <Image className={classes.Image} src={image} alt={maskName(name)} width={500} height={500} />
        </div>
        <div className={classes.cardBody}>
          <div className={classes.stars}>
            {"★★★★★"}
          </div>
          <div className={classes.reviewText}>
            &ldquo;{displayReview}&rdquo;
            {isLong && !expanded && (
              <button
                className={classes.readMore}
                onClick={() => setExpanded(true)}
              >
                {readMoreText}
              </button>
            )}
          </div>
          <div className={classes.cardFooter}>
            <span className={classes.reviewerName}>{maskName(name)}</span>
            <span className={classes.reviewDate}>{formatDate(date, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientTestimonials;
