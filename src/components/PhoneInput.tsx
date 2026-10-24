'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AsYouType, parsePhoneNumberFromString, type CountryCode as PhoneCountry } from 'libphonenumber-js/min';
import CountryPicker, { callingCode } from '@/components/CountryPicker';
import classes from './PhoneInput.module.css';

type Props = {
  /** The number as stored: international E.164 ("+905551112233"). A number
   *  saved before this may be anything; it is shown as well as it parses. */
  value: string;
  onChange: (value: string) => void;
  /** The form's country (an ISO code). The calling code follows it until the
   *  customer picks another by hand. */
  country?: string;
  placeholder?: string;
  /** The page's own input class, for both boxes. */
  className?: string;
  /** Placement in the page's layout (a grid column, say), for the wrapper. */
  wrapperClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
};

const FALLBACK = 'TR';

/** A stored number for reading: "+90 555 111 22 33"; one that does not
 *  parse, as it is. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  return parsePhoneNumberFromString(value)?.formatInternational() ?? value;
}

function dialable(code: string | undefined): code is string {
  return !!code && !!callingCode(code);
}

/*
 * A phone number as a calling code (picked from the country list, "+90")
 * and the number itself, formatted for that country as it is typed. Hands
 * back the whole number in E.164 — one way to write it, whatever the
 * customer typed: "0555 111 22 33" and "555 111 2233" are both
 * "+905551112233".
 */
export default function PhoneInput({ value, onChange, country, placeholder, className, wrapperClassName, required, disabled, id }: Props) {
  const parsed = useMemo(() => (value ? parsePhoneNumberFromString(value) : undefined), [value]);
  const [dial, setDial] = useState<string>(
    parsed?.country ?? (dialable(country) ? country : FALLBACK));
  // A number already saved, or a code picked by hand, is the customer's
  // choice; until then the code follows the form's country.
  const [chosen, setChosen] = useState<boolean>(!!parsed?.country);
  const [digits, setDigits] = useState<string>(
    parsed ? parsed.nationalNumber : (value || '').replace(/\D/g, ''));

  useEffect(() => {
    if (!chosen && dialable(country)) setDial(country);
  }, [country, chosen]);

  // A value that arrives from outside — the saved number, loaded after the
  // page — replaces what is shown; the box's own echo does not.
  const sent = useRef(value);
  useEffect(() => {
    if (value === sent.current) return;
    sent.current = value;
    const next = value ? parsePhoneNumberFromString(value) : undefined;
    setDigits(next ? next.nationalNumber : (value || '').replace(/\D/g, ''));
    if (next?.country) { setDial(next.country); setChosen(true); }
  }, [value]);

  const send = (next: string) => { sent.current = next; onChange(next); };

  const emit = (nextDigits: string, nextDial: string) => {
    if (!nextDigits) return send('');
    const number = parsePhoneNumberFromString(nextDigits, nextDial as PhoneCountry);
    send(number?.number ?? `${callingCode(nextDial)}${nextDigits}`);
  };

  const onNumber = (typed: string) => {
    // A number pasted with its own "+code" says which country it is.
    if (typed.trim().startsWith('+')) {
      const intl = parsePhoneNumberFromString(typed);
      if (intl?.country) {
        setDial(intl.country);
        setChosen(true);
        setDigits(intl.nationalNumber);
        return send(intl.number);
      }
    }
    const nextDigits = typed.replace(/\D/g, '');
    setDigits(nextDigits);
    emit(nextDigits, dial);
  };

  const onDial = (code: string) => {
    setDial(code);
    setChosen(true);
    emit(digits, code);
  };

  const formatted = digits ? new AsYouType(dial as PhoneCountry).input(digits) : '';

  return (
    <div className={`${classes.phone} ${wrapperClassName ?? ''}`}>
      <CountryPicker
        callingCodes
        value={dial}
        onChange={onDial}
        className={className}
        wrapperClassName={classes.dial}
        disabled={disabled}
        ariaLabel="Country calling code"
      />
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className={`${classes.number} ${className ?? ''}`}
        placeholder={placeholder}
        value={formatted}
        onChange={(e) => onNumber(e.target.value)}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
