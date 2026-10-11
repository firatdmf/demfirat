"use client";
import React, { useState, ChangeEvent } from "react";
import { useLocale } from "next-intl";

const LOCALES = ["en", "tr", "ru"];
const DEFAULT_LOCALE = "en";

export default function LocaleSwitcher() {
  const [isPending, setIsPending] = useState(false);
  const localActive = useLocale();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    const { pathname, search, hash } = window.location;

    const segments = pathname.split("/");
    const rest = LOCALES.includes(segments[1]) ? "/" + segments.slice(2).join("/") : pathname;
    // The default language is served without a prefix.
    const prefix = nextLocale === DEFAULT_LOCALE ? "" : `/${nextLocale}`;
    const target = rest === "/" ? prefix || "/" : `${prefix}${rest}`;

    // An address without a prefix is answered in the language this cookie
    // names, so it has to change before the page is asked for. And the page
    // is loaded afresh: the router keeps an earlier answer for the same
    // address, which could land the visitor back in the language they left.
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    setIsPending(true);
    window.location.assign(`${target}${search}${hash}`);
  };
  return (
    <div className="locale-switcher">
      <svg className="globe-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <select
        value={localActive || DEFAULT_LOCALE}
        onChange={onSelectChange}
        disabled={isPending}
        className="locale-select"
      >
        <option value="en">EN</option>
        <option value="tr">TR</option>
        <option value="ru">RU</option>
      </select>
      <svg className="arrow-icon" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 9L1 4h10z" />
      </svg>
      <style jsx>{`
        .locale-switcher {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .globe-icon {
          color: #2c2c2c;
          flex-shrink: 0;
        }
        .locale-select {
          appearance: none;
          background: transparent;
          border: none;
          padding: 0;
          padding-right: 1.25rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #2c2c2c;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: var(--font-body, 'Montserrat', sans-serif);
        }
        .locale-select:hover {
          color: #c9a961;
        }
        .locale-select:focus {
          outline: none;
          color: #c9a961;
        }
        .locale-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .arrow-icon {
          position: absolute;
          right: 0;
          color: #2c2c2c;
          pointer-events: none;
        }
        .locale-select option {
          padding: 0.5rem;
          background: #ffffff;
          color: #2c2c2c;
        }
      `}</style>
    </div>
  );
}
