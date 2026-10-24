import { isCountryCode } from '@/lib/countries';

// Where the visitor is, as Cloudflare saw the request: the middleware copies
// its CF-IPCountry header into this cookie. Read in the browser only — pages
// are cached for every visitor, so the server must not render by it.
export const VISITOR_COUNTRY_COOKIE = 'visitor_country';

export function visitorCountry(): string {
  if (typeof document === 'undefined') return '';
  const found = document.cookie.split('; ').find(c => c.startsWith(`${VISITOR_COUNTRY_COOKIE}=`));
  return found ? decodeURIComponent(found.split('=')[1] || '').toUpperCase() : '';
}

/** The country a new address or number starts with: the visitor's own,
 *  else the US. Browser only, like visitorCountry — call it after the
 *  first render, or the page would differ from the one the server sent. */
export function defaultCountry(): string {
  const here = visitorCountry();
  return isCountryCode(here) ? here : 'US';
}
