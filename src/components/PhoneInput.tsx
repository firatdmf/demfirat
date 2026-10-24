'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString,
  type CountryCode as PhoneCountry,
} from 'libphonenumber-js/min';
import classes from './PhoneInput.module.css';

type Props = {
  /** The number as stored: international E.164 ("+905551112233"). A number
   *  saved before this may be anything; it is shown as it was. */
  value: string;
  onChange: (value: string) => void;
  /** The form's country (an ISO code): its calling code starts an empty
   *  field, and a number typed without one ("0555…") is read as its. */
  country?: string;
  placeholder?: string;
  /** The page's own input class. */
  className?: string;
  /** Placement in the page's layout (a grid column, say), for the wrapper. */
  wrapperClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
};

const DIALLED = new Set<string>(getCountries());
const FALLBACK: PhoneCountry = 'TR';
const FLAG_INDENT = 44; // px: the flag's 14px inset + its 20px + a 10px gap

function home(country: string | undefined): PhoneCountry {
  return country && DIALLED.has(country) ? (country as PhoneCountry) : FALLBACK;
}

function prefix(country: PhoneCountry): string {
  return `+${getCountryCallingCode(country)} `;
}

/** A stored number for reading: "+90 555 111 22 33"; one that does not
 *  parse, as it is. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  return parsePhoneNumberFromString(value)?.formatInternational() ?? value;
}

/** What the box shows, the country it is, and the E.164 number ('' while
 *  there are no digits past the calling code). Calling codes are
 *  prefix-free — no country's is the start of another's — so the code is
 *  read off the front unambiguously. */
function read(typed: string, country: PhoneCountry) {
  const international = typed.trim().startsWith('+');
  const asYouType = international ? new AsYouType() : new AsYouType(country);
  const shown = asYouType.input(typed);
  const parsed = asYouType.getNumber();
  const number = parsed?.nationalNumber ? parsed.number : '';
  return {
    // A number typed the national way ("0555…") is shown the international way.
    shown: international || !number ? shown : new AsYouType().input(number),
    country: asYouType.getCountry() ?? (international ? undefined : country),
    number,
  };
}

/*
 * One box for the whole number, international: it starts with the form's
 * calling code, formats as it is typed, and shows the flag of whatever
 * country the code says. Hands back E.164, one way to write any number.
 */
export default function PhoneInput({
  value, onChange, country, placeholder, className, wrapperClassName, required, disabled, id, name,
}: Props) {
  const start = (v: string) => (v ? formatPhone(v) : prefix(home(country)));
  const [shown, setShown] = useState(() => start(value));
  const [flag, setFlag] = useState<string | undefined>(() => read(start(value), home(country)).country);

  // A value that arrives from outside — the saved number, loaded after the
  // page — replaces what is shown; the box's own echo does not.
  const sent = useRef(value);
  useEffect(() => {
    if (value === sent.current) return;
    sent.current = value;
    const next = start(value);
    setShown(next);
    setFlag(read(next, home(country)).country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Until a number is typed, the code follows the form's country.
  useEffect(() => {
    if (sent.current) return;
    const next = prefix(home(country));
    setShown(next);
    setFlag(home(country));
  }, [country]);

  const onType = (typed: string) => {
    let text = typed;
    // Deleting a space the formatting put there would only see it put back;
    // take the digit before it instead.
    if (typed.length < shown.length && typed.replace(/\D/g, '') === shown.replace(/\D/g, '')) {
      text = typed.replace(/\d(?=\D*$)/, '');
    }
    const next = read(text, home(country));
    setShown(next.shown);
    setFlag(next.country);
    sent.current = next.number;
    onChange(next.number);
  };

  return (
    <div className={`${classes.phone} ${wrapperClassName ?? ''}`}>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        className={`${classes.number} ${className ?? ''}`}
        style={flag ? { paddingLeft: FLAG_INDENT } : undefined}
        placeholder={placeholder}
        value={shown}
        onChange={(e) => onType(e.target.value)}
        required={required}
        // The box is never empty (it starts with "+90 "), so "required" alone
        // would always pass: ask for a number's worth of digits.
        pattern={required ? '(\\D*\\d){7,}\\D*' : undefined}
        disabled={disabled}
      />
      {/* An image, not an emoji flag: Windows shows those as two letters. */}
      {flag && <img src={`/flags/${flag}.svg`} alt="" width={20} height={14} className={classes.flag} />}
    </div>
  );
}
