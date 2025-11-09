// Shared currency utilities for formatting and display across tools

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  iconName:
    | "Banknote"
    | "DollarSign"
    | "Euro"
    | "PoundSterling"
    | "Coins"
    | "CircleDollarSign";
}

export const CURRENCIES: Currency[] = [
  // Major Currencies
  { code: "USD", symbol: "$", name: "US Dollar", iconName: "DollarSign" },
  { code: "EUR", symbol: "€", name: "Euro", iconName: "Euro" },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    iconName: "PoundSterling",
  },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", iconName: "Coins" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", iconName: "Coins" },

  // Southeast Asia
  {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    iconName: "Banknote",
  },
  {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    iconName: "CircleDollarSign",
  },
  {
    code: "MYR",
    symbol: "RM",
    name: "Malaysian Ringgit",
    iconName: "Banknote",
  },
  { code: "THB", symbol: "฿", name: "Thai Baht", iconName: "Banknote" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", iconName: "Coins" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", iconName: "Banknote" },

  // Oceania
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    iconName: "CircleDollarSign",
  },
  {
    code: "NZD",
    symbol: "NZ$",
    name: "New Zealand Dollar",
    iconName: "CircleDollarSign",
  },

  // Americas
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    iconName: "CircleDollarSign",
  },
  { code: "MXN", symbol: "$", name: "Mexican Peso", iconName: "DollarSign" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", iconName: "Banknote" },
  { code: "ARS", symbol: "$", name: "Argentine Peso", iconName: "DollarSign" },
  { code: "CLP", symbol: "$", name: "Chilean Peso", iconName: "DollarSign" },
  { code: "COP", symbol: "$", name: "Colombian Peso", iconName: "DollarSign" },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", iconName: "Banknote" },

  // Europe
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", iconName: "Banknote" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", iconName: "Coins" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", iconName: "Coins" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", iconName: "Coins" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", iconName: "Coins" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", iconName: "Coins" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", iconName: "Coins" },
  { code: "RON", symbol: "lei", name: "Romanian Leu", iconName: "Banknote" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", iconName: "Banknote" },
  { code: "HRK", symbol: "kn", name: "Croatian Kuna", iconName: "Banknote" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", iconName: "Banknote" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", iconName: "Banknote" },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", iconName: "Banknote" },

  // Middle East
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", iconName: "Banknote" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", iconName: "Banknote" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", iconName: "Coins" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", iconName: "Banknote" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", iconName: "Banknote" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar", iconName: "Banknote" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial", iconName: "Banknote" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", iconName: "Banknote" },
  {
    code: "LBP",
    symbol: "£",
    name: "Lebanese Pound",
    iconName: "PoundSterling",
  },

  // Africa
  {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    iconName: "Banknote",
  },
  {
    code: "EGP",
    symbol: "£",
    name: "Egyptian Pound",
    iconName: "PoundSterling",
  },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", iconName: "Banknote" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", iconName: "Banknote" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", iconName: "Coins" },
  {
    code: "MAD",
    symbol: "د.م.",
    name: "Moroccan Dirham",
    iconName: "Banknote",
  },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar", iconName: "Banknote" },
  {
    code: "UGX",
    symbol: "USh",
    name: "Ugandan Shilling",
    iconName: "Banknote",
  },
  {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    iconName: "Banknote",
  },
  { code: "MUR", symbol: "₨", name: "Mauritian Rupee", iconName: "Banknote" },

  // Asia
  { code: "INR", symbol: "₹", name: "Indian Rupee", iconName: "Banknote" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", iconName: "Coins" },
  {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    iconName: "DollarSign",
  },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", iconName: "DollarSign" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", iconName: "Banknote" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", iconName: "Banknote" },
  { code: "LKR", symbol: "₨", name: "Sri Lankan Rupee", iconName: "Banknote" },
  { code: "NPR", symbol: "₨", name: "Nepalese Rupee", iconName: "Banknote" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", iconName: "Banknote" },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", iconName: "Banknote" },
  { code: "LAK", symbol: "₭", name: "Lao Kip", iconName: "Banknote" },
  { code: "BND", symbol: "B$", name: "Brunei Dollar", iconName: "DollarSign" },
  {
    code: "MOP",
    symbol: "MOP$",
    name: "Macanese Pataca",
    iconName: "DollarSign",
  },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", iconName: "Banknote" },
  {
    code: "UZS",
    symbol: "so'm",
    name: "Uzbekistani Som",
    iconName: "Banknote",
  },
  { code: "MNT", symbol: "₮", name: "Mongolian Tugrik", iconName: "Banknote" },

  // Additional Americas
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", iconName: "DollarSign" },
  {
    code: "BOB",
    symbol: "Bs",
    name: "Bolivian Boliviano",
    iconName: "Banknote",
  },
  {
    code: "PYG",
    symbol: "₲",
    name: "Paraguayan Guarani",
    iconName: "Banknote",
  },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", iconName: "Coins" },
  {
    code: "GTQ",
    symbol: "Q",
    name: "Guatemalan Quetzal",
    iconName: "Banknote",
  },
  { code: "HNL", symbol: "L", name: "Honduran Lempira", iconName: "Banknote" },
  {
    code: "NIO",
    symbol: "C$",
    name: "Nicaraguan Córdoba",
    iconName: "DollarSign",
  },
  {
    code: "PAB",
    symbol: "B/.",
    name: "Panamanian Balboa",
    iconName: "Banknote",
  },
  {
    code: "DOP",
    symbol: "RD$",
    name: "Dominican Peso",
    iconName: "DollarSign",
  },
  {
    code: "JMD",
    symbol: "J$",
    name: "Jamaican Dollar",
    iconName: "DollarSign",
  },
  {
    code: "TTD",
    symbol: "TT$",
    name: "Trinidad and Tobago Dollar",
    iconName: "DollarSign",
  },
  {
    code: "BBD",
    symbol: "Bds$",
    name: "Barbadian Dollar",
    iconName: "DollarSign",
  },
  {
    code: "BSD",
    symbol: "B$",
    name: "Bahamian Dollar",
    iconName: "DollarSign",
  },
  { code: "BZD", symbol: "BZ$", name: "Belize Dollar", iconName: "DollarSign" },

  // Additional Europe
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", iconName: "Coins" },
  { code: "ALL", symbol: "L", name: "Albanian Lek", iconName: "Banknote" },
  { code: "RSD", symbol: "дин.", name: "Serbian Dinar", iconName: "Banknote" },
  {
    code: "MKD",
    symbol: "ден",
    name: "Macedonian Denar",
    iconName: "Banknote",
  },
  {
    code: "BAM",
    symbol: "KM",
    name: "Bosnia-Herzegovina Convertible Mark",
    iconName: "Banknote",
  },
  { code: "MDL", symbol: "L", name: "Moldovan Leu", iconName: "Banknote" },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", iconName: "Banknote" },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", iconName: "Banknote" },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", iconName: "Banknote" },
  { code: "BYN", symbol: "Br", name: "Belarusian Ruble", iconName: "Banknote" },

  // Additional Africa
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", iconName: "Banknote" },
  { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", iconName: "Banknote" },
  {
    code: "MZN",
    symbol: "MT",
    name: "Mozambican Metical",
    iconName: "Banknote",
  },
  { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", iconName: "Banknote" },
  { code: "BWP", symbol: "P", name: "Botswanan Pula", iconName: "Banknote" },
  {
    code: "NAD",
    symbol: "N$",
    name: "Namibian Dollar",
    iconName: "DollarSign",
  },
  { code: "SZL", symbol: "E", name: "Swazi Lilangeni", iconName: "Banknote" },
  { code: "LSL", symbol: "L", name: "Lesotho Loti", iconName: "Banknote" },
  { code: "MWK", symbol: "MK", name: "Malawian Kwacha", iconName: "Banknote" },
  { code: "RWF", symbol: "FRw", name: "Rwandan Franc", iconName: "Banknote" },
  { code: "BIF", symbol: "FBu", name: "Burundian Franc", iconName: "Banknote" },
  {
    code: "DJF",
    symbol: "Fdj",
    name: "Djiboutian Franc",
    iconName: "Banknote",
  },
  { code: "SCR", symbol: "₨", name: "Seychellois Rupee", iconName: "Banknote" },
  { code: "GMD", symbol: "D", name: "Gambian Dalasi", iconName: "Banknote" },
  {
    code: "SLL",
    symbol: "Le",
    name: "Sierra Leonean Leone",
    iconName: "Banknote",
  },
  {
    code: "LRD",
    symbol: "L$",
    name: "Liberian Dollar",
    iconName: "DollarSign",
  },

  // Additional Middle East & Central Asia
  { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar", iconName: "Banknote" },
  { code: "IRR", symbol: "﷼", name: "Iranian Rial", iconName: "Banknote" },
  { code: "SYP", symbol: "£", name: "Syrian Pound", iconName: "PoundSterling" },
  { code: "YER", symbol: "﷼", name: "Yemeni Rial", iconName: "Banknote" },
  { code: "AFN", symbol: "؋", name: "Afghan Afghani", iconName: "Banknote" },
  {
    code: "TJS",
    symbol: "ЅМ",
    name: "Tajikistani Somoni",
    iconName: "Banknote",
  },
  { code: "KGS", symbol: "с", name: "Kyrgyzstani Som", iconName: "Banknote" },
  {
    code: "TMT",
    symbol: "T",
    name: "Turkmenistani Manat",
    iconName: "Banknote",
  },

  // Additional Asia-Pacific
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", iconName: "DollarSign" },
  {
    code: "PGK",
    symbol: "K",
    name: "Papua New Guinean Kina",
    iconName: "Banknote",
  },
  { code: "WST", symbol: "T", name: "Samoan Tala", iconName: "Banknote" },
  { code: "TOP", symbol: "T$", name: "Tongan Paʻanga", iconName: "DollarSign" },
  { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", iconName: "Banknote" },
  {
    code: "SBD",
    symbol: "SI$",
    name: "Solomon Islands Dollar",
    iconName: "DollarSign",
  },

  // Special Administrative Regions & Territories
  {
    code: "XCD",
    symbol: "EC$",
    name: "East Caribbean Dollar",
    iconName: "DollarSign",
  },
  {
    code: "XOF",
    symbol: "CFA",
    name: "West African CFA Franc",
    iconName: "Banknote",
  },
  {
    code: "XAF",
    symbol: "FCFA",
    name: "Central African CFA Franc",
    iconName: "Banknote",
  },
  { code: "XPF", symbol: "₣", name: "CFP Franc", iconName: "Banknote" },

  // Cryptocurrencies (if supported by exchange API)
  { code: "BTC", symbol: "₿", name: "Bitcoin", iconName: "Coins" },
  { code: "ETH", symbol: "Ξ", name: "Ethereum", iconName: "Coins" },
];

// Currency locale mapping for proper number formatting
export const CURRENCY_LOCALES: Record<string, string> = {
  // Major Currencies
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  CNY: "zh-CN",

  // Southeast Asia
  IDR: "id-ID",
  SGD: "en-SG",
  MYR: "ms-MY",
  THB: "th-TH",
  PHP: "en-PH",
  VND: "vi-VN",

  // Oceania
  AUD: "en-AU",
  NZD: "en-NZ",

  // Americas
  CAD: "en-CA",
  MXN: "es-MX",
  BRL: "pt-BR",
  ARS: "es-AR",
  CLP: "es-CL",
  COP: "es-CO",
  PEN: "es-PE",

  // Europe
  CHF: "de-CH",
  SEK: "sv-SE",
  NOK: "no-NO",
  DKK: "da-DK",
  PLN: "pl-PL",
  CZK: "cs-CZ",
  HUF: "hu-HU",
  RON: "ro-RO",
  BGN: "bg-BG",
  HRK: "hr-HR",
  RUB: "ru-RU",
  TRY: "tr-TR",
  UAH: "uk-UA",

  // Middle East
  AED: "ar-AE",
  SAR: "ar-SA",
  ILS: "he-IL",
  QAR: "ar-QA",
  KWD: "ar-KW",
  BHD: "ar-BH",
  OMR: "ar-OM",
  JOD: "ar-JO",
  LBP: "ar-LB",

  // Africa
  ZAR: "en-ZA",
  EGP: "ar-EG",
  NGN: "en-NG",
  KES: "en-KE",
  GHS: "en-GH",
  MAD: "ar-MA",
  TND: "ar-TN",

  // Asia
  INR: "en-IN",
  KRW: "ko-KR",
  HKD: "zh-HK",
  TWD: "zh-TW",
  PKR: "en-PK",
  BDT: "bn-BD",
  LKR: "si-LK",

  // Default fallback for others
  default: "en-US",
};

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
  const locale = CURRENCY_LOCALES[currencyCode] || "en-US";
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(amount);
}

/**
 * Get currency by code
 * @param code The ISO currency code
 * @returns Currency object or undefined if not found
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

/**
 * Get default currency (IDR)
 * @returns Default currency object
 */
export function getDefaultCurrency(): Currency {
  return {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    iconName: "Banknote",
  };
}

/**
 * Get currency symbol by code
 * @param code The ISO currency code
 * @returns Currency symbol or '$' as fallback
 */
export function getCurrencySymbol(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || "$";
}
