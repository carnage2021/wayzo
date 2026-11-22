/** Common travel currencies (ISO 4217). Expand as launch markets are decided. */
export const CURRENCIES = [
  { code: "USD", name: "US dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British pound" },
  { code: "INR", name: "Indian rupee" },
  { code: "AUD", name: "Australian dollar" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "JPY", name: "Japanese yen" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "AED", name: "UAE dirham" },
  { code: "THB", name: "Thai baht" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "MXN", name: "Mexican peso" },
  { code: "BRL", name: "Brazilian real" },
  { code: "ZAR", name: "South African rand" },
  { code: "TRY", name: "Turkish lira" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "SEK", name: "Swedish krona" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "DKK", name: "Danish krone" },
  { code: "ISK", name: "Icelandic króna" },
  { code: "MAD", name: "Moroccan dirham" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

/** Format integer minor units as money, e.g. 184000 USD -> "$1,840". */
export function formatMoney(amountMinor: number, currency: string, locale = "en-US"): string {
  const digits =
    new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ??
    2;
  const value = amountMinor / 10 ** digits;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : digits,
  }).format(value);
}
