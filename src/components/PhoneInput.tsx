'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { FaChevronDown } from 'react-icons/fa';
import {
  AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString,
  type CountryCode as PhoneCountry,
} from 'libphonenumber-js/min';
import { countryOptions, searchKey } from '@/lib/countries';
import { visitorCountry } from '@/lib/visitorCountry';
import classes from './PhoneInput.module.css';

type Props = {
  /** The number as stored: international E.164 ("+905551112233"). A number
   *  saved before this may be anything; it is shown as well as it parses. */
  value: string;
  onChange: (value: string) => void;
  /** The form's country (an ISO code): the calling code a new number starts
   *  with when the visitor's own country is not known. */
  country?: string;
  placeholder?: string;
  /** The page's own input class, so the box looks like its neighbours. */
  className?: string;
  /** Placement in the page's layout (a grid column, say), for the wrapper. */
  wrapperClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
};

const DIALLED = new Set<string>(getCountries());
const FALLBACK: PhoneCountry = 'TR';

function dialable(code: string | undefined): code is PhoneCountry {
  return !!code && DIALLED.has(code);
}

/** A stored number for reading: "+90 555 111 22 33"; one that does not
 *  parse, as it is. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  return parsePhoneNumberFromString(value)?.formatInternational() ?? value;
}

/*
 * A phone number in one box: the country (a flag that opens the list of
 * calling codes), its code, and the number, formatted for that country as
 * it is typed. A new number starts with the visitor's own country, as
 * Cloudflare saw them. Hands back E.164 ("+905551112233") — calling codes
 * are prefix-free, so the code is read back off the front unambiguously.
 */
export default function PhoneInput({ value, onChange, country, placeholder, className, wrapperClassName, required, disabled, id }: Props) {
  const locale = useLocale();
  const listId = useId();
  const options = useMemo(
    () => countryOptions(locale).filter((o) => DIALLED.has(o.code))
      .map((o) => ({ ...o, dial: `+${getCountryCallingCode(o.code as PhoneCountry)}` })),
    [locale]);

  const parsed = useMemo(() => (value ? parsePhoneNumberFromString(value) : undefined), [value]);
  const [dial, setDial] = useState<PhoneCountry>(parsed?.country ?? (dialable(country) ? country : FALLBACK));
  const [digits, setDigits] = useState<string>(parsed ? parsed.nationalNumber : (value || '').replace(/\D/g, ''));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  // The visitor's country is only known in the browser (the cookie the
  // middleware sets), so it is applied after the first render — to a new
  // number only.
  useEffect(() => {
    if (value) return;
    const here = visitorCountry();
    if (dialable(here)) setDial(here);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A value that arrives from outside — the saved number, loaded after the
  // page — replaces what is shown; the box's own echo does not.
  const sent = useRef(value);
  useEffect(() => {
    if (value === sent.current) return;
    sent.current = value;
    const next = value ? parsePhoneNumberFromString(value) : undefined;
    setDigits(next ? next.nationalNumber : (value || '').replace(/\D/g, ''));
    if (next?.country) setDial(next.country);
  }, [value]);

  const send = (nextDigits: string, nextDial: PhoneCountry) => {
    const number = nextDigits
      ? (parsePhoneNumberFromString(nextDigits, nextDial)?.number ?? `+${getCountryCallingCode(nextDial)}${nextDigits}`)
      : '';
    sent.current = number;
    onChange(number);
  };

  const onNumber = (typed: string) => {
    // A number pasted with its own "+code" says which country it is.
    if (typed.trim().startsWith('+')) {
      const intl = parsePhoneNumberFromString(typed);
      if (intl?.country) {
        setDial(intl.country);
        setDigits(intl.nationalNumber);
        return send(intl.nationalNumber, intl.country);
      }
    }
    let nextDigits = typed.replace(/\D/g, '');
    // Deleting a space the formatting put there would only see it put back;
    // take the digit before it instead.
    if (typed.length < formatted.length && nextDigits === digits) nextDigits = digits.slice(0, -1);
    setDigits(nextDigits);
    send(nextDigits, dial);
  };

  const choose = (code: PhoneCountry) => {
    setDial(code);
    setOpen(false);
    send(digits, code);
    numberRef.current?.focus();
  };

  const openList = () => {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.code === dial)));
    setOpen(true);
  };

  // The list closes on a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  // With the list open, typing letters goes to the first country they start.
  const typed = useRef({ text: '', at: 0 });
  const onListKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active].code as PhoneCountry); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 800 ? typed.current.text : '') + e.key, at: now };
      const key = searchKey(typed.current.text, locale);
      const found = options.findIndex((o) => searchKey(o.name, locale).startsWith(key));
      if (found >= 0) setActive(found);
    }
  };

  const formatted = digits ? new AsYouType(dial).input(digits) : '';
  const code = `+${getCountryCallingCode(dial)}`;

  return (
    <div ref={boxRef} className={`${classes.phone} ${wrapperClassName ?? ''}`}>
      <div
        className={`${classes.field} ${className ?? ''} ${disabled ? classes.disabled : ''}`}
        // A click on the box, not on the flag, is a click into the number.
        onClick={(e) => { if (!(e.target as HTMLElement).closest('button')) numberRef.current?.focus(); }}
      >
        <button
          type="button"
          className={classes.country}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${options.find((o) => o.code === dial)?.name ?? dial} ${code}`}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onListKey}
          disabled={disabled}
        >
          {/* An image, not an emoji flag: Windows shows those as two letters. */}
          <img src={`/flags/${dial}.svg`} alt="" width={22} height={16} className={classes.flag} />
          <FaChevronDown className={`${classes.chevron} ${open ? classes.up : ''}`} aria-hidden />
        </button>
        <span className={classes.code}>{code}</span>
        <input
          ref={numberRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={classes.number}
          placeholder={placeholder}
          value={formatted}
          onChange={(e) => onNumber(e.target.value)}
          required={required}
          disabled={disabled}
        />
      </div>
      {open && (
        <ul id={listId} role="listbox" ref={listRef} className={classes.list}>
          {options.map((o, i) => (
            <li
              key={o.code}
              role="option"
              aria-selected={o.code === dial}
              className={`${classes.option} ${o.code === dial ? classes.selected : ''} ${i === active ? classes.active : ''}`}
              onMouseDown={(e) => { e.preventDefault(); choose(o.code as PhoneCountry); }}
              onMouseEnter={() => setActive(i)}
            >
              <img src={`/flags/${o.code}.svg`} alt="" width={22} height={16} loading="lazy" className={classes.flag} />
              <span className={classes.optionCode}>{o.dial}</span>
              <span className={classes.optionName}>{o.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
