import { useCallback, useEffect, useState } from 'react'
import type { ConversionResult, ExchangeRates } from '@/lib/currency-converter'
import {
  convertAmount,
  convertBatch,
  fetchExchangeRates,
  getCacheAge,
  getCachedRates,
  isCacheFresh,
} from '@/lib/currency-converter'

export interface UseCurrencyConverterReturn {
  // State
  isLoading: boolean
  error: string | null
  rates: ExchangeRates | null
  cacheAge: number | null
  isCacheFresh: boolean

  // Methods
  convert: (amount: number, fromCurrency: string, toCurrency: string) => Promise<ConversionResult>
  convertMultiple: (
    conversions: Array<{
      amount: number
      fromCurrency: string
      toCurrency: string
    }>
  ) => Promise<ConversionResult[]>
  refreshRates: (baseCurrency: string) => Promise<void>
  getRate: (fromCurrency: string, toCurrency: string) => number | null
}

/**
 * Custom hook for currency conversion with caching
 */
export function useCurrencyConverter(baseCurrency: string): UseCurrencyConverterReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [cacheAge, setCacheAge] = useState<number | null>(null)
  const [isFresh, setIsFresh] = useState(false)

  const loadRates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get from cache first
      const cached = getCachedRates(baseCurrency)
      if (cached) {
        setRates(cached)
        setIsLoading(false)
        return
      }

      // Fetch from API
      const fetchedRates = await fetchExchangeRates(baseCurrency)
      setRates(fetchedRates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates')
      console.error('Error loading rates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [baseCurrency])

  // Load rates on mount or when base currency changes
  useEffect(() => {
    loadRates()
  }, [loadRates])

  // Update cache info
  useEffect(() => {
    if (rates) {
      setCacheAge(getCacheAge(baseCurrency))
      setIsFresh(isCacheFresh(baseCurrency))
    }
  }, [rates, baseCurrency])

  const convert = useCallback(
    async (amount: number, fromCurrency: string, toCurrency: string): Promise<ConversionResult> => {
      try {
        setError(null)
        const result = await convertAmount(amount, fromCurrency, toCurrency)

        // Update rates if we fetched new ones
        if (fromCurrency === baseCurrency) {
          const latestRates = getCachedRates(baseCurrency)
          if (latestRates) setRates(latestRates)
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Conversion failed'
        setError(errorMessage)
        throw err
      }
    },
    [baseCurrency]
  )

  const convertMultiple = useCallback(
    async (
      conversions: Array<{
        amount: number
        fromCurrency: string
        toCurrency: string
      }>
    ): Promise<ConversionResult[]> => {
      try {
        setError(null)
        const results = await convertBatch(conversions)

        // Update rates cache
        const latestRates = getCachedRates(baseCurrency)
        if (latestRates) setRates(latestRates)

        return results
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Batch conversion failed'
        setError(errorMessage)
        throw err
      }
    },
    [baseCurrency]
  )

  const refreshRates = useCallback(async (newBaseCurrency: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Force fetch from API (bypasses cache)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${newBaseCurrency}`)
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
      localStorage.setItem(
        `supertool_exchange_rates_${newBaseCurrency}`,
        JSON.stringify(exchangeRates)
      )

      setRates(exchangeRates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh rates')
      console.error('Error refreshing rates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getRate = useCallback(
    (fromCurrency: string, toCurrency: string): number | null => {
      if (!rates) return null
      if (fromCurrency === toCurrency) return 1

      // If base matches fromCurrency, directly get rate
      if (rates.base === fromCurrency) {
        return rates.rates[toCurrency] || null
      }

      // If base matches toCurrency, invert rate
      if (rates.base === toCurrency) {
        const rate = rates.rates[fromCurrency]
        return rate ? 1 / rate : null
      }

      // Cross-conversion through base currency
      const fromRate = rates.rates[fromCurrency]
      const toRate = rates.rates[toCurrency]
      if (fromRate && toRate) {
        return toRate / fromRate
      }

      return null
    },
    [rates]
  )

  return {
    isLoading,
    error,
    rates,
    cacheAge,
    isCacheFresh: isFresh,
    convert,
    convertMultiple,
    refreshRates,
    getRate,
  }
}
