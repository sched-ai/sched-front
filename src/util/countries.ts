import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

export type Country = {
  iso: CountryCode;
  name: string;
  callingCode: string;
};

export const COUNTRIES: Country[] = (() => {
  const list: Country[] = getCountries().map((iso) => ({
    iso,
    name: regionNames.of(iso) || iso,
    callingCode: getCountryCallingCode(iso),
  }));
  const br = list.find((c) => c.iso === 'BR');
  const rest = list
    .filter((c) => c.iso !== 'BR')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return br ? [br, ...rest] : rest;
})();

export const DEFAULT_COUNTRY: CountryCode = 'BR';

export const getCountryByIso = (iso: CountryCode | string | undefined): Country | undefined => {
  if (!iso) return undefined;
  return COUNTRIES.find((c) => c.iso === iso);
};
