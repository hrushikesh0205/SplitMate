/**
 * Centralized currency configuration and formatting.
 * Add new currencies to SUPPORTED_CURRENCIES — no other changes required.
 */

export const DEFAULT_CURRENCY = 'INR';

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
];

const currencyMap = Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));

export function isValidCurrency(code) {
  return Boolean(currencyMap[code]);
}

export function normalizeCurrency(code) {
  return isValidCurrency(code) ? code : DEFAULT_CURRENCY;
}

export function getCurrencyMeta(code = DEFAULT_CURRENCY) {
  return currencyMap[normalizeCurrency(code)] || currencyMap[DEFAULT_CURRENCY];
}

export function getCurrencySymbol(code = DEFAULT_CURRENCY) {
  return getCurrencyMeta(code).symbol;
}

export function getCurrencyLocale(code = DEFAULT_CURRENCY) {
  return getCurrencyMeta(code).locale;
}

export function formatMoney(amount, currency = DEFAULT_CURRENCY, opts = {}) {
  const value = Number(amount || 0);
  const code = normalizeCurrency(currency);
  const locale = getCurrencyLocale(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: opts.decimals ?? 2,
      minimumFractionDigits: opts.decimals ?? 2,
    }).format(value);
  } catch {
    return `${getCurrencySymbol(code)}${value.toFixed(opts.decimals ?? 2)}`;
  }
}

export function formatCompact(amount, currency = DEFAULT_CURRENCY) {
  const value = Number(amount || 0);
  const code = normalizeCurrency(currency);
  const locale = getCurrencyLocale(code);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${getCurrencySymbol(code)}${value.toFixed(0)}`;
  }
}
