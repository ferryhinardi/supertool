import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as currencyConverter from '@/lib/currency-converter'
import { useCurrencyConverter } from '../useCurrencyConverter'

vi.mock('@/lib/currency-converter')

describe('useCurrencyConverter', () => {
  const mockRates = {
    base: 'USD',
    rates: {
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      USD: 1,
    },
    timestamp: Date.now(),
    lastUpdated: new Date().toISOString(),
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(currencyConverter.getCachedRates).mockReturnValue(null)
    vi.mocked(currencyConverter.fetchExchangeRates).mockResolvedValue(mockRates)
    vi.mocked(currencyConverter.getCacheAge).mockReturnValue(null)
    vi.mocked(currencyConverter.isCacheFresh).mockReturnValue(false)
    vi.mocked(currencyConverter.convertAmount).mockResolvedValue({
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      convertedAmount: 85,
      rate: 0.85,
      lastUpdated: new Date().toISOString(),
    })
    vi.mocked(currencyConverter.convertBatch).mockResolvedValue([])
  })

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.rates).toBeNull()
    })

    it('should load rates on mount', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(currencyConverter.fetchExchangeRates).toHaveBeenCalledWith('USD')
      expect(result.current.rates).toEqual(mockRates)
    })

    it('should use cached rates if available', async () => {
      vi.mocked(currencyConverter.getCachedRates).mockReturnValue(mockRates)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(currencyConverter.getCachedRates).toHaveBeenCalledWith('USD')
      expect(currencyConverter.fetchExchangeRates).not.toHaveBeenCalled()
      expect(result.current.rates).toEqual(mockRates)
    })

    it('should handle fetch error', async () => {
      vi.mocked(currencyConverter.fetchExchangeRates).mockRejectedValue(new Error('API error'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('API error')
    })
  })

  describe('cache info', () => {
    it('should update cache age when rates are loaded', async () => {
      vi.mocked(currencyConverter.getCacheAge).mockReturnValue(3600000)
      vi.mocked(currencyConverter.isCacheFresh).mockReturnValue(true)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      expect(result.current.cacheAge).toBe(3600000)
      expect(result.current.isCacheFresh).toBe(true)
    })

    it('should indicate stale cache', async () => {
      vi.mocked(currencyConverter.getCacheAge).mockReturnValue(7200000)
      vi.mocked(currencyConverter.isCacheFresh).mockReturnValue(false)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      expect(result.current.isCacheFresh).toBe(false)
    })
  })

  describe('convert', () => {
    it('should convert currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const conversionResult = await result.current.convert(100, 'USD', 'EUR')

      expect(currencyConverter.convertAmount).toHaveBeenCalledWith(100, 'USD', 'EUR')
      expect(conversionResult.convertedAmount).toBe(85)
    })

    it('should handle conversion error', async () => {
      vi.mocked(currencyConverter.convertAmount).mockRejectedValue(new Error('Conversion failed'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(result.current.convert(100, 'USD', 'EUR')).rejects.toThrow('Conversion failed')

      await waitFor(() => {
        expect(result.current.error).toBe('Conversion failed')
      })
    })

    it('should update rates after conversion', async () => {
      const updatedRates = { ...mockRates, timestamp: Date.now() }
      vi.mocked(currencyConverter.getCachedRates).mockReturnValue(updatedRates)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.convert(100, 'USD', 'EUR')

      expect(result.current.rates).toEqual(updatedRates)
    })
  })

  describe('convertMultiple', () => {
    it('should convert multiple currencies', async () => {
      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 200, fromCurrency: 'USD', toCurrency: 'GBP' },
      ]

      const mockResults = [
        {
          amount: 100,
          fromCurrency: 'USD',
          toCurrency: 'EUR',
          convertedAmount: 85,
          rate: 0.85,
          lastUpdated: new Date().toISOString(),
        },
        {
          amount: 200,
          fromCurrency: 'USD',
          toCurrency: 'GBP',
          convertedAmount: 146,
          rate: 0.73,
          lastUpdated: new Date().toISOString(),
        },
      ]

      vi.mocked(currencyConverter.convertBatch).mockResolvedValue(mockResults)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const results = await result.current.convertMultiple(conversions)

      expect(currencyConverter.convertBatch).toHaveBeenCalledWith(conversions)
      expect(results).toEqual(mockResults)
    })

    it('should handle batch conversion error', async () => {
      vi.mocked(currencyConverter.convertBatch).mockRejectedValue(new Error('Batch failed'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const conversions = [{ amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' }]

      await expect(result.current.convertMultiple(conversions)).rejects.toThrow('Batch failed')

      await waitFor(() => {
        expect(result.current.error).toBe('Batch failed')
      })
    })
  })

  describe('refreshRates', () => {
    it('should fetch fresh rates from API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          base: 'EUR',
          rates: { USD: 1.18, GBP: 0.86, JPY: 130.2 },
        }),
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.refreshRates('EUR')

      expect(global.fetch).toHaveBeenCalledWith('https://api.exchangerate-api.com/v4/latest/EUR')

      await waitFor(() => {
        expect(result.current.rates?.base).toBe('EUR')
      })
    })

    it('should handle refresh error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.refreshRates('INVALID')

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(result.current.error).toContain('Failed to fetch rates')
    })

    it('should cache refreshed rates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          base: 'GBP',
          rates: { USD: 1.37, EUR: 1.16, JPY: 151.5 },
        }),
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.refreshRates('GBP')

      const cached = localStorage.getItem('supertool_exchange_rates_GBP')
      expect(cached).toBeTruthy()

      const parsed = JSON.parse(cached!)
      expect(parsed.base).toBe('GBP')
      expect(parsed.rates.USD).toBe(1.37)
    })
  })

  describe('getRate', () => {
    it('should return 1 for same currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      const rate = result.current.getRate('USD', 'USD')
      expect(rate).toBe(1)
    })

    it('should return direct rate when base matches from currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      const rate = result.current.getRate('USD', 'EUR')
      expect(rate).toBe(0.85)
    })

    it('should return inverted rate when base matches to currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      const rate = result.current.getRate('EUR', 'USD')
      expect(rate).toBeCloseTo(1 / 0.85, 5)
    })

    it('should return cross-conversion rate', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      const rate = result.current.getRate('EUR', 'GBP')
      // EUR to GBP through USD: (0.73 / 0.85)
      expect(rate).toBeCloseTo(0.73 / 0.85, 5)
    })

    it('should return null when rates not loaded', () => {
      vi.mocked(currencyConverter.getCachedRates).mockReturnValue(null)
      vi.mocked(currencyConverter.fetchExchangeRates).mockImplementation(
        () => new Promise(() => {})
      )

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      const rate = result.current.getRate('USD', 'EUR')
      expect(rate).toBeNull()
    })

    it('should return null for unknown currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.rates).not.toBeNull()
      })

      const rate = result.current.getRate('USD', 'UNKNOWN')
      expect(rate).toBeNull()
    })
  })

  describe('base currency changes', () => {
    it('should reload rates when base currency changes', async () => {
      const { result, rerender } = renderHook(
        ({ baseCurrency }) => useCurrencyConverter(baseCurrency),
        { initialProps: { baseCurrency: 'USD' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(currencyConverter.fetchExchangeRates).toHaveBeenCalledWith('USD')

      rerender({ baseCurrency: 'EUR' })

      await waitFor(() => {
        expect(currencyConverter.fetchExchangeRates).toHaveBeenCalledWith('EUR')
      })
    })
  })
})
