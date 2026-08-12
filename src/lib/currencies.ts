/**
 * Supported currencies for the Money Manager application.
 * BDT is the base/reporting currency.
 *
 * To add a new currency:
 *  1. Append an entry to SUPPORTED_CURRENCIES below.
 *  2. Add its fallback rate to FALLBACK_RATES in src/lib/exchange-rates.ts.
 *  That's it — the rest of the app picks it up automatically.
 */
export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "BDT", name: "Bangladeshi Taka",    symbol: "৳",    flag: "🇧🇩" },
  { code: "USD", name: "US Dollar",            symbol: "$",    flag: "🇺🇸" },
  { code: "EUR", name: "Euro",                 symbol: "€",    flag: "🇪🇺" },
  { code: "GBP", name: "British Pound",        symbol: "£",    flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee",         symbol: "₹",    flag: "🇮🇳" },
  { code: "AUD", name: "Australian Dollar",    symbol: "A$",   flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar",      symbol: "C$",   flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar",     symbol: "S$",   flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham",           symbol: "د.إ",  flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal",          symbol: "﷼",    flag: "🇸🇦" },
  { code: "JPY", name: "Japanese Yen",         symbol: "¥",    flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan",         symbol: "¥",    flag: "🇨🇳" },
];

/** Set of valid currency codes — used for Zod enum validation. */
export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code) as [string, ...string[]];

/** Quick O(1) lookup: code → CurrencyOption */
export const CURRENCY_MAP: Record<string, CurrencyOption> = Object.fromEntries(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

/** Returns the symbol for a given currency code, defaulting to the code itself. */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_MAP[code]?.symbol ?? code;
}
