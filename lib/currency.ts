// Shared currency utilities for formatting and display across tools

export interface Currency {
  code: string
  symbol: string
  name: string
  iconName: 'Banknote' | 'DollarSign' | 'Euro' | 'PoundSterling' | 'Coins' | 'CircleDollarSign'
}

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', iconName: 'Banknote' },
  { code: 'USD', symbol: '$', name: 'US Dollar', iconName: 'DollarSign' },
  { code: 'EUR', symbol: '€', name: 'Euro', iconName: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound', iconName: 'PoundSterling' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', iconName: 'Coins' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', iconName: 'CircleDollarSign' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', iconName: 'Banknote' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', iconName: 'Banknote' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', iconName: 'CircleDollarSign' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', iconName: 'CircleDollarSign' },
]

// Currency locale mapping for proper number formatting
export const CURRENCY_LOCALES: Record<string, string> = {
  IDR: 'id-ID', // Indonesia uses dot for thousands, comma for decimals
  USD: 'en-US', // US uses comma for thousands, dot for decimals
  EUR: 'de-DE', // Germany uses dot for thousands, comma for decimals
  GBP: 'en-GB', // UK uses comma for thousands, dot for decimals
  JPY: 'ja-JP', // Japan uses comma for thousands, no decimals
  SGD: 'en-SG', // Singapore uses comma for thousands, dot for decimals
  MYR: 'ms-MY', // Malaysia uses comma for thousands, dot for decimals
  THB: 'th-TH', // Thailand uses comma for thousands, dot for decimals
  AUD: 'en-AU', // Australia uses comma for thousands, dot for decimals
  CAD: 'en-CA', // Canada uses comma for thousands, dot for decimals
}

/**
 * Format a number as currency with proper locale-specific thousand separators and decimals
 * @param amount The numeric amount to format
 * @param currencyCode The ISO currency code (e.g., 'IDR', 'USD')
 * @param options Optional Intl.NumberFormatOptions to customize formatting
 * @returns Formatted currency string (without currency symbol)
 *
 * @example
 * formatCurrency(1234567.89, 'IDR') // "1.234.567,89"
 * formatCurrency(1234567.89, 'USD') // "1,234,567.89"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: Intl.NumberFormatOptions
): string {
  const locale = CURRENCY_LOCALES[currencyCode] || 'en-US'
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }

  return new Intl.NumberFormat(locale, defaultOptions).format(amount)
}

/**
 * Get currency by code
 * @param code The ISO currency code
 * @returns Currency object or undefined if not found
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code)
}

/**
 * Get default currency (IDR)
 * @returns Default currency object
 */
export function getDefaultCurrency(): Currency {
  return CURRENCIES[0] // IDR
}
