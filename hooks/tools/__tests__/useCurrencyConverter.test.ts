import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { useCurrencyConverter } from '@/hooks/tools/useCurrencyConverter'
import type { ConversionResult, ExchangeRates } from '@/lib/tools/currency/currency-converter'

// Mock the currency-converter module
vi.mock('@/lib/tools/currency/currency-converter', () => ({
  convertAmount: vi.fn(),
  convertBatch: vi.fn(),
  fetchExchangeRates: vi.fn(),
  getCacheAge: vi.fn(),
  getCachedRates: vi.fn(),
  isCacheFresh: vi.fn(),
}))

// Import the mocked module
import * as currencyConverter from '@/lib/tools/currency/currency-converter'

// Mock fetch for refreshRates
const mockFetch = vi.fn()
global.fetch = mockFetch

// Spy on localStorage methods - using object spies since vitest.setup.ts
// creates a LocalStorageMock class instance (not native Storage)
// We'll set these up in beforeEach after localStorage is initialized
let localStorageSetItemSpy: ReturnType<typeof vi.spyOn>
let localStorageGetItemSpy: ReturnType<typeof vi.spyOn>
let localStorageClearSpy: ReturnType<typeof vi.spyOn>

// Create a reference object for test assertions (will be populated in beforeEach)
const localStorageMock = {
  get setItem() {
    return localStorageSetItemSpy
  },
  get getItem() {
    return localStorageGetItemSpy
  },
  get clear() {
    return localStorageClearSpy
  },
}

// Mock console.error to suppress expected error logs
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('useCurrencyConverter', () => {
  const mockRates: ExchangeRates = {
    base: 'USD',
    rates: {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      CAD: 1.25,
    },
    timestamp: Date.now(),
    lastUpdated: new Date().toISOString(),
  }

  const mockConversionResult: ConversionResult = {
    amount: 100,
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    rate: 0.85,
    convertedAmount: 85,
    lastUpdated: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Set up localStorage spies after localStorage is initialized by vitest.setup.ts
    localStorageSetItemSpy = vi.spyOn(localStorage, 'setItem')
    localStorageGetItemSpy = vi.spyOn(localStorage, 'getItem')
    localStorageClearSpy = vi.spyOn(localStorage, 'clear')

    ;(currencyConverter.getCachedRates as Mock).mockReturnValue(null)
    ;(currencyConverter.fetchExchangeRates as Mock).mockResolvedValue(mockRates)
    ;(currencyConverter.getCacheAge as Mock).mockReturnValue(1)
    ;(currencyConverter.isCacheFresh as Mock).mockReturnValue(true)
    ;(currencyConverter.convertAmount as Mock).mockResolvedValue(mockConversionResult)
    ;(currencyConverter.convertBatch as Mock).mockResolvedValue([mockConversionResult])
  })

  describe('initialization', () => {
    it('should start with loading state', () => {
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

      expect(result.current.rates).toEqual(mockRates)
      expect(result.current.error).toBeNull()
    })

    it('should use cached rates if available', async () => {
      ;(currencyConverter.getCachedRates as Mock).mockReturnValue(mockRates)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.rates).toEqual(mockRates)
      expect(currencyConverter.fetchExchangeRates).not.toHaveBeenCalled()
    })

    it('should fetch rates if cache is empty', async () => {
      ;(currencyConverter.getCachedRates as Mock).mockReturnValue(null)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(currencyConverter.fetchExchangeRates).toHaveBeenCalledWith('USD')
      expect(result.current.rates).toEqual(mockRates)
    })

    it('should reload rates when base currency changes', async () => {
      const eurRates: ExchangeRates = {
        ...mockRates,
        base: 'EUR',
        rates: { EUR: 1, USD: 1.18, GBP: 0.86 },
      }

      ;(currencyConverter.getCachedRates as Mock).mockReturnValue(null)
      ;(currencyConverter.fetchExchangeRates as Mock)
        .mockResolvedValueOnce(mockRates)
        .mockResolvedValueOnce(eurRates)

      const { result, rerender } = renderHook(({ base }) => useCurrencyConverter(base), {
        initialProps: { base: 'USD' },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.rates?.base).toBe('USD')

      // Change base currency
      rerender({ base: 'EUR' })

      await waitFor(() => {
        expect(result.current.rates?.base).toBe('EUR')
      })

      expect(currencyConverter.fetchExchangeRates).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should handle API errors', async () => {
      ;(currencyConverter.getCachedRates as Mock).mockReturnValue(null)
      ;(currencyConverter.fetchExchangeRates as Mock).mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('API Error')
      expect(result.current.rates).toBeNull()
    })

    it('should handle non-Error exceptions', async () => {
      ;(currencyConverter.getCachedRates as Mock).mockReturnValue(null)
      ;(currencyConverter.fetchExchangeRates as Mock).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load exchange rates')
    })
  })

  describe('cache info', () => {
    it('should update cache age when rates are loaded', async () => {
      ;(currencyConverter.getCacheAge as Mock).mockReturnValue(2.5)
      ;(currencyConverter.isCacheFresh as Mock).mockReturnValue(true)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.cacheAge).toBe(2.5)
      expect(result.current.isCacheFresh).toBe(true)
    })

    it('should indicate stale cache', async () => {
      ;(currencyConverter.getCacheAge as Mock).mockReturnValue(25)
      ;(currencyConverter.isCacheFresh as Mock).mockReturnValue(false)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isCacheFresh).toBe(false)
    })
  })

  describe('convert', () => {
    it('should convert amount between currencies', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let conversionResult: ConversionResult | undefined
      await act(async () => {
        conversionResult = await result.current.convert(100, 'USD', 'EUR')
      })

      expect(conversionResult).toEqual(mockConversionResult)
      expect(currencyConverter.convertAmount).toHaveBeenCalledWith(100, 'USD', 'EUR')
    })

    it('should update rates after conversion when fromCurrency matches baseCurrency', async () => {
      const updatedRates: ExchangeRates = {
        ...mockRates,
        timestamp: Date.now() + 1000,
      }
      ;(currencyConverter.getCachedRates as Mock)
        .mockReturnValueOnce(null) // Initial load
        .mockReturnValueOnce(updatedRates) // After convert

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.convert(100, 'USD', 'EUR')
      })

      // getCachedRates should be called again after conversion
      expect(currencyConverter.getCachedRates).toHaveBeenCalledWith('USD')
    })

    it('should set error on conversion failure', async () => {
      ;(currencyConverter.convertAmount as Mock).mockRejectedValue(new Error('Conversion failed'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call convert and catch the error - don't wrap in act() to avoid swallowing state updates
      let caughtError: Error | null = null
      try {
        await result.current.convert(100, 'USD', 'INVALID')
      } catch (e) {
        caughtError = e as Error
      }

      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError?.message).toBe('Conversion failed')

      // Wait for React to flush the error state update
      await waitFor(() => {
        expect(result.current.error).toBe('Conversion failed')
      })
    })

    it('should handle non-Error exceptions in convert', async () => {
      ;(currencyConverter.convertAmount as Mock).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call convert and catch the error - don't wrap in act() to avoid swallowing state updates
      let caughtError: unknown = null
      try {
        await result.current.convert(100, 'USD', 'EUR')
      } catch (e) {
        caughtError = e
      }

      expect(caughtError).toBe('Unknown error')

      // Wait for React to flush the error state update
      await waitFor(() => {
        expect(result.current.error).toBe('Conversion failed')
      })
    })

    it('should clear error before starting conversion', async () => {
      // First, cause an error
      ;(currencyConverter.convertAmount as Mock).mockRejectedValueOnce(new Error('First error'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call convert and catch the error - don't wrap in act() to avoid swallowing state updates
      let caughtError: Error | null = null
      try {
        await result.current.convert(100, 'USD', 'EUR')
      } catch (e) {
        caughtError = e as Error
      }

      expect(caughtError).toBeInstanceOf(Error)

      await waitFor(() => {
        expect(result.current.error).toBe('First error')
      })

      // Now succeed
      ;(currencyConverter.convertAmount as Mock).mockResolvedValueOnce(mockConversionResult)

      await act(async () => {
        await result.current.convert(100, 'USD', 'EUR')
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('convertMultiple', () => {
    const mockBatchResults: ConversionResult[] = [
      {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        convertedAmount: 85,
        lastUpdated: new Date().toISOString(),
      },
      {
        amount: 200,
        fromCurrency: 'USD',
        toCurrency: 'GBP',
        rate: 0.73,
        convertedAmount: 146,
        lastUpdated: new Date().toISOString(),
      },
    ]

    it('should convert multiple amounts', async () => {
      ;(currencyConverter.convertBatch as Mock).mockResolvedValue(mockBatchResults)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 200, fromCurrency: 'USD', toCurrency: 'GBP' },
      ]

      let results: ConversionResult[] | undefined
      await act(async () => {
        results = await result.current.convertMultiple(conversions)
      })

      expect(results).toEqual(mockBatchResults)
      expect(currencyConverter.convertBatch).toHaveBeenCalledWith(conversions)
    })

    it('should update rates after batch conversion', async () => {
      const updatedRates: ExchangeRates = {
        ...mockRates,
        timestamp: Date.now() + 1000,
      }
      ;(currencyConverter.convertBatch as Mock).mockResolvedValue(mockBatchResults)
      ;(currencyConverter.getCachedRates as Mock)
        .mockReturnValueOnce(null) // Initial load
        .mockReturnValueOnce(updatedRates) // After batch convert

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.convertMultiple([
          { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        ])
      })

      expect(currencyConverter.getCachedRates).toHaveBeenCalledWith('USD')
    })

    it('should set error on batch conversion failure', async () => {
      ;(currencyConverter.convertBatch as Mock).mockRejectedValue(
        new Error('Batch conversion failed')
      )

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call convertMultiple and catch the error - don't wrap in act() to avoid swallowing state updates
      let caughtError: Error | null = null
      try {
        await result.current.convertMultiple([
          { amount: 100, fromCurrency: 'USD', toCurrency: 'INVALID' },
        ])
      } catch (e) {
        caughtError = e as Error
      }

      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError?.message).toBe('Batch conversion failed')

      await waitFor(() => {
        expect(result.current.error).toBe('Batch conversion failed')
      })
    })

    it('should handle non-Error exceptions in convertMultiple', async () => {
      ;(currencyConverter.convertBatch as Mock).mockRejectedValue('Unknown batch error')

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call convertMultiple and catch the error - don't wrap in act() to avoid swallowing state updates
      let caughtError: unknown = null
      try {
        await result.current.convertMultiple([
          { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        ])
      } catch (e) {
        caughtError = e
      }

      expect(caughtError).toBe('Unknown batch error')

      await waitFor(() => {
        expect(result.current.error).toBe('Batch conversion failed')
      })
    })
  })

  describe('refreshRates', () => {
    it('should fetch fresh rates from API', async () => {
      const freshRates = {
        base: 'EUR',
        rates: { EUR: 1, USD: 1.18, GBP: 0.86 },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(freshRates),
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshRates('EUR')
      })

      expect(mockFetch).toHaveBeenCalledWith('https://api.exchangerate-api.com/v4/latest/EUR')
      expect(result.current.rates?.base).toBe('EUR')
    })

    it('should set loading state during refresh', async () => {
      let resolvePromise: ((value: unknown) => void) | undefined
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      mockFetch.mockReturnValueOnce(pendingPromise)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.refreshRates('EUR')
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        if (resolvePromise) {
          resolvePromise({
            ok: true,
            json: () => Promise.resolve({ base: 'EUR', rates: {} }),
          })
        }
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should cache refreshed rates in localStorage', async () => {
      const freshRates = {
        base: 'EUR',
        rates: { EUR: 1, USD: 1.18 },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(freshRates),
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear any prior setItem calls
      localStorageMock.setItem.mockClear()

      await act(async () => {
        await result.current.refreshRates('EUR')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'supertool_exchange_rates_EUR',
        expect.any(String)
      )

      // Verify the stored data structure
      const setItemCall = localStorageMock.setItem.mock.calls.find(
        (call: [string, string]) => call[0] === 'supertool_exchange_rates_EUR'
      )
      expect(setItemCall).toBeDefined()
      const savedData = JSON.parse(setItemCall?.[1])
      expect(savedData.base).toBe('EUR')
      expect(savedData.rates).toEqual(freshRates.rates)
    })

    it('should handle API error during refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      })

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshRates('INVALID')
      })

      expect(result.current.error).toBe('Failed to fetch rates: Service Unavailable')
    })

    it('should handle network error during refresh', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshRates('USD')
      })

      expect(result.current.error).toBe('Network error')
    })

    it('should handle non-Error exceptions during refresh', async () => {
      mockFetch.mockRejectedValueOnce('Unknown refresh error')

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refreshRates('USD')
      })

      expect(result.current.error).toBe('Failed to refresh rates')
    })
  })

  describe('getRate', () => {
    it('should return null when rates are not loaded', async () => {
      // Keep isLoading true by making fetchExchangeRates hang
      ;(currencyConverter.fetchExchangeRates as Mock).mockReturnValue(new Promise(() => {}))

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      expect(result.current.getRate('USD', 'EUR')).toBeNull()
    })

    it('should return 1 for same currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.getRate('USD', 'USD')).toBe(1)
      expect(result.current.getRate('EUR', 'EUR')).toBe(1)
    })

    it('should return direct rate when fromCurrency matches base', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // USD is base, EUR rate is 0.85
      expect(result.current.getRate('USD', 'EUR')).toBe(0.85)
      expect(result.current.getRate('USD', 'GBP')).toBe(0.73)
    })

    it('should return inverted rate when toCurrency matches base', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // USD is base, EUR rate is 0.85, so EUR to USD should be 1/0.85
      const rate = result.current.getRate('EUR', 'USD')
      expect(rate).toBeCloseTo(1 / 0.85, 5)
    })

    it('should return cross-conversion rate', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // EUR to GBP: GBP/EUR = 0.73/0.85
      const rate = result.current.getRate('EUR', 'GBP')
      expect(rate).toBeCloseTo(0.73 / 0.85, 5)
    })

    it('should return null for unknown currency', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.getRate('USD', 'INVALID')).toBeNull()
      expect(result.current.getRate('INVALID', 'USD')).toBeNull()
    })

    it('should return null when fromCurrency rate is not found for cross-conversion', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // UNKNOWN1 to GBP - fromRate will be undefined
      expect(result.current.getRate('UNKNOWN1', 'GBP')).toBeNull()
    })

    it('should return null when toCurrency rate is not found for cross-conversion', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // EUR to UNKNOWN2 - toRate will be undefined
      expect(result.current.getRate('EUR', 'UNKNOWN2')).toBeNull()
    })
  })

  describe('return value structure', () => {
    it('should return all expected properties', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Check all return properties exist
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('rates')
      expect(result.current).toHaveProperty('cacheAge')
      expect(result.current).toHaveProperty('isCacheFresh')
      expect(result.current).toHaveProperty('convert')
      expect(result.current).toHaveProperty('convertMultiple')
      expect(result.current).toHaveProperty('refreshRates')
      expect(result.current).toHaveProperty('getRate')

      // Check types
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.convert).toBe('function')
      expect(typeof result.current.convertMultiple).toBe('function')
      expect(typeof result.current.refreshRates).toBe('function')
      expect(typeof result.current.getRate).toBe('function')
    })
  })

  describe('memoization', () => {
    it('should maintain stable function references', async () => {
      const { result, rerender } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialConvert = result.current.convert
      const initialConvertMultiple = result.current.convertMultiple
      const initialRefreshRates = result.current.refreshRates
      const initialGetRate = result.current.getRate

      // Rerender without changing props
      rerender()

      expect(result.current.convert).toBe(initialConvert)
      expect(result.current.convertMultiple).toBe(initialConvertMultiple)
      expect(result.current.refreshRates).toBe(initialRefreshRates)
      expect(result.current.getRate).toBe(initialGetRate)
    })

    it('should update function references when baseCurrency changes', async () => {
      const eurRates: ExchangeRates = {
        ...mockRates,
        base: 'EUR',
      }

      ;(currencyConverter.fetchExchangeRates as Mock)
        .mockResolvedValueOnce(mockRates)
        .mockResolvedValueOnce(eurRates)

      const { result, rerender } = renderHook(({ base }) => useCurrencyConverter(base), {
        initialProps: { base: 'USD' },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialConvert = result.current.convert
      const initialConvertMultiple = result.current.convertMultiple

      // Change base currency
      rerender({ base: 'EUR' })

      await waitFor(() => {
        expect(result.current.rates?.base).toBe('EUR')
      })

      // convert and convertMultiple should have new references (they depend on baseCurrency)
      expect(result.current.convert).not.toBe(initialConvert)
      expect(result.current.convertMultiple).not.toBe(initialConvertMultiple)
    })

    it('should update getRate when rates change', async () => {
      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialGetRate = result.current.getRate

      // Refresh rates to trigger rates state update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ base: 'USD', rates: { EUR: 0.9 } }),
      })

      await act(async () => {
        await result.current.refreshRates('USD')
      })

      // getRate should have new reference since rates changed
      expect(result.current.getRate).not.toBe(initialGetRate)
    })
  })

  describe('concurrent operations', () => {
    it('should handle multiple conversions in parallel', async () => {
      const results = [
        { ...mockConversionResult, toCurrency: 'EUR', convertedAmount: 85 },
        { ...mockConversionResult, toCurrency: 'GBP', convertedAmount: 73 },
        { ...mockConversionResult, toCurrency: 'JPY', convertedAmount: 11050 },
      ]

      ;(currencyConverter.convertAmount as Mock)
        .mockResolvedValueOnce(results[0])
        .mockResolvedValueOnce(results[1])
        .mockResolvedValueOnce(results[2])

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Run multiple conversions in parallel
      let conversionResults: ConversionResult[] = []
      await act(async () => {
        conversionResults = await Promise.all([
          result.current.convert(100, 'USD', 'EUR'),
          result.current.convert(100, 'USD', 'GBP'),
          result.current.convert(100, 'USD', 'JPY'),
        ])
      })

      expect(conversionResults).toHaveLength(3)
      expect(currencyConverter.convertAmount).toHaveBeenCalledTimes(3)
    })
  })

  describe('edge cases', () => {
    it('should handle zero amount conversion', async () => {
      const zeroResult: ConversionResult = {
        ...mockConversionResult,
        amount: 0,
        convertedAmount: 0,
      }
      ;(currencyConverter.convertAmount as Mock).mockResolvedValueOnce(zeroResult)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let conversionResult: ConversionResult | undefined
      await act(async () => {
        conversionResult = await result.current.convert(0, 'USD', 'EUR')
      })

      expect(conversionResult?.convertedAmount).toBe(0)
    })

    it('should handle negative amount conversion', async () => {
      const negativeResult: ConversionResult = {
        ...mockConversionResult,
        amount: -100,
        convertedAmount: -85,
      }
      ;(currencyConverter.convertAmount as Mock).mockResolvedValueOnce(negativeResult)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let conversionResult: ConversionResult | undefined
      await act(async () => {
        conversionResult = await result.current.convert(-100, 'USD', 'EUR')
      })

      expect(conversionResult?.convertedAmount).toBe(-85)
    })

    it('should handle very large amount conversion', async () => {
      const largeResult: ConversionResult = {
        ...mockConversionResult,
        amount: 1e12,
        convertedAmount: 8.5e11,
      }
      ;(currencyConverter.convertAmount as Mock).mockResolvedValueOnce(largeResult)

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let conversionResult: ConversionResult | undefined
      await act(async () => {
        conversionResult = await result.current.convert(1e12, 'USD', 'EUR')
      })

      expect(conversionResult?.convertedAmount).toBe(8.5e11)
    })

    it('should handle empty batch conversion', async () => {
      ;(currencyConverter.convertBatch as Mock).mockResolvedValueOnce([])

      const { result } = renderHook(() => useCurrencyConverter('USD'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let results: ConversionResult[] | undefined
      await act(async () => {
        results = await result.current.convertMultiple([])
      })

      expect(results).toEqual([])
    })
  })
})
