/**
 * Currency Converter with Exchange Rate Caching
 * Uses exchangerate-api.com free tier (1500 requests/month)
 */

export interface ExchangeRates {
  base: string
  rates: Record<string, number>
  timestamp: number
  lastUpdated: string
}

export interface ConversionResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  convertedAmount: number
  lastUpdated: string
}

const CACHE_KEY = 'supertool_exchange_rates'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

/**
 * Fetch exchange rates from API or cache
 */
export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
  // Check cache first
  const cached = getCachedRates(baseCurrency)
  if (cached) {
    return cached
  }

  // Fetch from API
  try {
    const response = await fetch(`${API_BASE_URL}/${baseCurrency}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`)
    }

    const data = await response.json()
    const exchangeRates: ExchangeRates = {
      base: data.base,
      rates: data.rates,
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString(),
    }

    // Cache the rates
    cacheRates(baseCurrency, exchangeRates)

    return exchangeRates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)

    // Try to return stale cache if available
    const staleCache = getStaleCache(baseCurrency)
    if (staleCache) {
      console.warn('Using stale cache due to API error')
      return staleCache
    }

    throw error
  }
}

/**
 * Get cached exchange rates if still valid
 */
export function getCachedRates(baseCurrency: string): ExchangeRates | null {
  try {
    const cacheData = localStorage.getItem(`${CACHE_KEY}_${baseCurrency}`)
    if (!cacheData) return null

    const cached: ExchangeRates = JSON.parse(cacheData)

    // Check if cache is still valid (within 24 hours)
    const age = Date.now() - cached.timestamp
    if (age < CACHE_DURATION) {
      return cached
    }

    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * Get stale cache (fallback for API errors)
 */
function getStaleCache(baseCurrency: string): ExchangeRates | null {
  try {
    const cacheData = localStorage.getItem(`${CACHE_KEY}_${baseCurrency}`)
    if (!cacheData) return null

    return JSON.parse(cacheData)
  } catch (error) {
    console.error('Error reading stale cache:', error)
    return null
  }
}

/**
 * Cache exchange rates
 */
function cacheRates(baseCurrency: string, rates: ExchangeRates): void {
  try {
    localStorage.setItem(`${CACHE_KEY}_${baseCurrency}`, JSON.stringify(rates))
  } catch (error) {
    console.error('Error caching rates:', error)
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      amount,
      fromCurrency,
      toCurrency,
      rate: 1,
      convertedAmount: amount,
      lastUpdated: new Date().toISOString(),
    }
  }

  // Fetch rates for base currency
  const rates = await fetchExchangeRates(fromCurrency)

  // Get conversion rate
  const rate = rates.rates[toCurrency]
  if (!rate) {
    throw new Error(`Exchange rate not found for ${toCurrency}`)
  }

  // Calculate converted amount
  const convertedAmount = amount * rate

  return {
    amount,
    fromCurrency,
    toCurrency,
    rate,
    convertedAmount,
    lastUpdated: rates.lastUpdated,
  }
}

/**
 * Convert multiple amounts in batch
 */
export async function convertBatch(
  conversions: Array<{
    amount: number
    fromCurrency: string
    toCurrency: string
  }>
): Promise<ConversionResult[]> {
  // Group by fromCurrency to minimize API calls
  const groupedByBase: Record<string, typeof conversions> = {}

  for (const conversion of conversions) {
    if (!groupedByBase[conversion.fromCurrency]) {
      groupedByBase[conversion.fromCurrency] = []
    }
    groupedByBase[conversion.fromCurrency].push(conversion)
  }

  // Fetch rates for each base currency
  const results: ConversionResult[] = []

  for (const [baseCurrency, group] of Object.entries(groupedByBase)) {
    const rates = await fetchExchangeRates(baseCurrency)

    for (const conversion of group) {
      if (conversion.fromCurrency === conversion.toCurrency) {
        results.push({
          amount: conversion.amount,
          fromCurrency: conversion.fromCurrency,
          toCurrency: conversion.toCurrency,
          rate: 1,
          convertedAmount: conversion.amount,
          lastUpdated: rates.lastUpdated,
        })
        continue
      }

      const rate = rates.rates[conversion.toCurrency]
      if (!rate) {
        throw new Error(`Exchange rate not found for ${conversion.toCurrency}`)
      }

      results.push({
        amount: conversion.amount,
        fromCurrency: conversion.fromCurrency,
        toCurrency: conversion.toCurrency,
        rate,
        convertedAmount: conversion.amount * rate,
        lastUpdated: rates.lastUpdated,
      })
    }
  }

  return results
}

/**
 * Check if cache is fresh (< 24 hours old)
 */
export function isCacheFresh(baseCurrency: string): boolean {
  const cached = getCachedRates(baseCurrency)
  return cached !== null
}

/**
 * Get cache age in hours
 */
export function getCacheAge(baseCurrency: string): number | null {
  try {
    const cacheData = localStorage.getItem(`${CACHE_KEY}_${baseCurrency}`)
    if (!cacheData) return null

    const cached: ExchangeRates = JSON.parse(cacheData)
    const ageMs = Date.now() - cached.timestamp
    return ageMs / (60 * 60 * 1000) // Convert to hours
  } catch (_error) {
    return null
  }
}

/**
 * Clear all cached exchange rates
 */
export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(CACHE_KEY)) {
        localStorage.removeItem(key)
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Get popular currency pairs for quick access
 */
export const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
] as const

/**
 * Get currency info by code
 */
export function getCurrencyInfo(code: string) {
  return POPULAR_CURRENCIES.find((c) => c.code === code)
}

/**
 * Format amount with currency symbol
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const info = getCurrencyInfo(currencyCode)
  const symbol = info?.symbol || currencyCode

  // Format with appropriate decimals
  const formatted = amount.toFixed(2)

  // Some currencies display symbol after amount
  if (['EUR', 'SEK', 'NOK', 'DKK', 'PLN'].includes(currencyCode)) {
    return `${formatted} ${symbol}`
  }

  return `${symbol}${formatted}`
}
