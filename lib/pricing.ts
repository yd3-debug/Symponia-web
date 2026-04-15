// ── Regional pricing ───────────────────────────────────────────────────────────
// Prices are approximate App Store tier equivalents per region.
// Actual price charged is always shown in the app before purchase.

export interface RegionalPricing {
  symbol: string;       // currency symbol
  code: string;         // ISO 4217 currency code
  monthly: string;      // subscription monthly price
  pack50: string;       // 50-token pack
  pack150: string;      // 150-token pack
  locale: string;       // BCP 47 locale for Intl formatting
}

const PRICING: Record<string, RegionalPricing> = {
  // British Isles
  GB: { symbol: '£', code: 'GBP', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'en-GB' },
  // Eurozone
  DE: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'de-DE' },
  FR: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'fr-FR' },
  IT: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'it-IT' },
  ES: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'es-ES' },
  NL: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'nl-NL' },
  PT: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'pt-PT' },
  BE: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'fr-BE' },
  AT: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'de-AT' },
  IE: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'en-IE' },
  FI: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'fi-FI' },
  GR: { symbol: '€', code: 'EUR', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'el-GR' },
  // Non-eurozone Europe
  SE: { symbol: 'kr', code: 'SEK', monthly: '149',  pack50: '59',    pack150: '119',   locale: 'sv-SE' },
  NO: { symbol: 'kr', code: 'NOK', monthly: '149',  pack50: '59',    pack150: '119',   locale: 'nb-NO' },
  DK: { symbol: 'kr', code: 'DKK', monthly: '99',   pack50: '39',    pack150: '75',    locale: 'da-DK' },
  CH: { symbol: 'Fr', code: 'CHF', monthly: '13.99',pack50: '5.49',  pack150: '10.99', locale: 'de-CH' },
  PL: { symbol: 'zł', code: 'PLN', monthly: '59.99',pack50: '22.99', pack150: '45.99', locale: 'pl-PL' },
  // Americas
  US: { symbol: '$',  code: 'USD', monthly: '12.99', pack50: '4.99',  pack150: '9.99',  locale: 'en-US' },
  CA: { symbol: 'CA$',code: 'CAD', monthly: '17.99', pack50: '6.99',  pack150: '13.99', locale: 'en-CA' },
  MX: { symbol: 'MX$',code: 'MXN', monthly: '249',  pack50: '99',    pack150: '189',   locale: 'es-MX' },
  BR: { symbol: 'R$', code: 'BRL', monthly: '69.99', pack50: '27.99', pack150: '54.99', locale: 'pt-BR' },
  // Asia-Pacific
  AU: { symbol: 'A$', code: 'AUD', monthly: '19.99', pack50: '7.99',  pack150: '14.99', locale: 'en-AU' },
  NZ: { symbol: 'NZ$',code: 'NZD', monthly: '21.99', pack50: '8.99',  pack150: '16.99', locale: 'en-NZ' },
  JP: { symbol: '¥',  code: 'JPY', monthly: '1900',  pack50: '750',   pack150: '1500',  locale: 'ja-JP' },
  SG: { symbol: 'S$', code: 'SGD', monthly: '17.98', pack50: '6.98',  pack150: '13.98', locale: 'en-SG' },
  IN: { symbol: '₹',  code: 'INR', monthly: '1099',  pack50: '429',   pack150: '849',   locale: 'hi-IN' },
  // Middle East
  AE: { symbol: 'AED',code: 'AED', monthly: '49.99', pack50: '19.99', pack150: '39.99', locale: 'ar-AE' },
  SA: { symbol: 'SAR',code: 'SAR', monthly: '49.99', pack50: '19.99', pack150: '39.99', locale: 'ar-SA' },
};

// Default fallback
const DEFAULT: RegionalPricing = { symbol: '$', code: 'USD', monthly: '12.99', pack50: '4.99', pack150: '9.99', locale: 'en-US' };

export function getPricingForCountry(countryCode: string | null | undefined): RegionalPricing {
  if (!countryCode) return DEFAULT;
  return PRICING[countryCode.toUpperCase()] ?? DEFAULT;
}

// Client-side: derive country from navigator.language (e.g. "en-GB" → "GB")
export function getPricingForLocale(locale: string | undefined): RegionalPricing {
  if (!locale) return DEFAULT;
  // BCP 47 tags: "en-GB", "fr-FR", "zh-TW" etc. — take the region subtag.
  const parts = locale.split('-');
  const region = parts.length >= 2 ? parts[parts.length - 1].toUpperCase() : '';
  return getPricingForCountry(region);
}

// Returns a formatted price string, e.g. "£12.99"
export function fmt(p: RegionalPricing, amount: string): string {
  return `${p.symbol}${amount}`;
}
