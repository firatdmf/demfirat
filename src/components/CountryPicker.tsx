'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { FaCheck } from 'react-icons/fa';
import { getCountries, getCountryCallingCode, type CountryCode as PhoneCountry } from 'libphonenumber-js/min';
import { countryName, countryOptions, isCountryCode, searchKey } from '@/lib/countries';
import classes from './CountryPicker.module.css';

const FLAG_INDENT = 44; // px: the flag's 14px inset + its 20px + a 10px gap

const DIALLED = new Set<string>(getCountries());

/** "+90" for TR; '' for a place no phone number belongs to. */
export function callingCode(code: string): string {
  return DIALLED.has(code) ? `+${getCountryCallingCode(code as PhoneCountry)}` : '';
}

type Props = {
  /** The chosen country's ISO code, or '' for none. */
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  /** The page's own input class, so the picker looks like its neighbours. */
  className?: string;
  /** Placement in the page's layout (a grid column, say), for the wrapper. */
  wrapperClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** For a phone number's country: the box shows "+90", the list each
   *  country's code, a search by digits finds it, and places no number
   *  belongs to (Antarctica, say) are left out. */
  callingCodes?: boolean;
  ariaLabel?: string;
};

/*
 * A text box that offers the countries matching what is typed, in the
 * visitor's language, and hands back the chosen one's ISO code. Typing is
 * only for finding: the value is always a code from the list, so an
 * address can never say "Turkiye" in one place and "Turkey" in another.
 */
export default function CountryPicker({
  value, onChange, placeholder, className, wrapperClassName, required, disabled, id, callingCodes, ariaLabel,
}: Props) {
  const locale = useLocale();
  const listId = useId();
  const options = useMemo(() => {
    const all = countryOptions(locale);
    return callingCodes
      ? all.filter((o) => DIALLED.has(o.code)).map((o) => ({ ...o, dial: callingCode(o.code) }))
      : all.map((o) => ({ ...o, dial: '' }));
  }, [locale, callingCodes]);
  const [query, setQuery] = useState<string | null>(null); // null = not typing
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  // The chosen country's flag sits in the box — not while typing a new search.
  const showFlag = query === null && isCountryCode(value);

  const matches = useMemo(() => {
    if (!query) return options;
    const key = searchKey(query.trim(), locale);
    const digits = key.replace(/^\+/, '');
    const dialMatch = (dial: string) => callingCodes && /^\d+$/.test(digits) && dial.slice(1).startsWith(digits);
    const starts = options.filter((o) => searchKey(o.name, locale).startsWith(key) || o.code.toLowerCase() === key || dialMatch(o.dial));
    const contains = options.filter((o) => !starts.includes(o) && searchKey(o.name, locale).includes(key));
    return [...starts, ...contains];
  }, [query, options, locale, callingCodes]);

  const choose = (code: string) => {
    onChange(code);
    setQuery(null);
    setOpen(false);
  };

  const move = (step: number) => {
    if (!matches.length) return;
    const next = (active + step + matches.length) % matches.length;
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' && open && matches[active]) { e.preventDefault(); choose(matches[active].code); }
    else if (e.key === 'Escape') { setQuery(null); setOpen(false); }
  };

  const shown = callingCodes ? callingCode(value) : countryName(value, locale);

  return (
    <div className={`${classes.picker} ${wrapperClassName ?? ''}`}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className={`${classes.input} ${className ?? ''}`}
        // Room for the chosen country's flag, whatever padding the page gives.
        style={showFlag ? { paddingLeft: FLAG_INDENT } : undefined}
        placeholder={placeholder}
        required={required && !value}
        disabled={disabled}
        value={query ?? shown}
        onFocus={(e) => { setOpen(true); e.target.select(); }}
        onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={onKeyDown}
        // Leaving without picking keeps the country already chosen.
        onBlur={() => { setQuery(null); setOpen(false); }}
      />
      {showFlag && <img src={`/flags/${value}.svg`} alt="" width={20} height={14} className={`${classes.flag} ${classes.chosenFlag}`} />}
      {open && !disabled && (
        <ul id={listId} role="listbox" ref={listRef} className={classes.list}>
          {matches.length === 0 && <li className={classes.empty}>—</li>}
          {matches.map((o, i) => (
            <li
              key={o.code}
              role="option"
              aria-selected={o.code === value}
              className={`${classes.option} ${i === active ? classes.active : ''}`}
              // mousedown, not click: it fires before the input's blur closes the list.
              onMouseDown={(e) => { e.preventDefault(); choose(o.code); }}
              onMouseEnter={() => setActive(i)}
            >
              {/* An image, not an emoji flag: Windows shows those as two letters. */}
              <img src={`/flags/${o.code}.svg`} alt="" width={20} height={14} loading="lazy" className={classes.flag} />
              <span className={classes.name}>{o.name}</span>
              {o.dial && <span className={classes.dial}>{o.dial}</span>}
              {o.code === value && <FaCheck className={classes.check} aria-hidden />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
