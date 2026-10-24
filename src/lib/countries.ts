/*
 * Countries, stored as their ISO 3166-1 alpha-2 code ("TR", "PL"): the code
 * never changes, and it is what carriers' rate tables and customs duty
 * tables key on. Names are never stored — they come from Intl in the
 * reader's language, so a Turkish customer sees "Almanya" and a Russian
 * one "Германия" for the same "DE".
 *
 * Addresses saved before codes may still hold a typed name; countryName
 * shows those as they are.
 */

export const COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

const CODES = new Set<string>(COUNTRY_CODES);

export function isCountryCode(value: string | null | undefined): value is CountryCode {
  return !!value && CODES.has(value);
}

const displayNames = new Map<string, Intl.DisplayNames>();

function namesFor(locale: string): Intl.DisplayNames {
  let names = displayNames.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale, 'en'], { type: 'region' });
    displayNames.set(locale, names);
  }
  return names;
}

/** The country's name in `locale`; a value that is not a code as it is. */
export function countryName(value: string | null | undefined, locale: string): string {
  if (!value) return '';
  if (!isCountryCode(value)) return value;
  return namesFor(locale).of(value) || value;
}

export type CountryOption = { code: CountryCode; name: string };

const optionsByLocale = new Map<string, CountryOption[]>();

/** Every country, named in `locale` and sorted the way `locale` sorts. */
export function countryOptions(locale: string): CountryOption[] {
  let options = optionsByLocale.get(locale);
  if (!options) {
    options = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
    optionsByLocale.set(locale, options);
  }
  return options;
}

/** For matching what someone types: case- and accent-blind, in `locale`'s
 *  own casing (Turkish "I" lowercases to "ı"). */
export function searchKey(text: string, locale: string): string {
  return text.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
