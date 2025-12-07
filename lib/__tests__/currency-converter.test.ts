import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearCache,
  convertAmount,
  convertBatch,
  type ExchangeRates,
  fetchExchangeRates,
  formatCurrencyAmount,
  getCacheAge,
  getCachedRates,
  getCurrencyInfo,
  isCacheFresh,
  POPULAR_CURRENCIES,
} from '../currency-converter'

describe('currency-converter', () => {
  let store: Record<string, string> = {}

  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length
    },
  }

  const mockExchangeRatesResponse = {
    base: 'USD',
    rates: {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.5,
      CAD: 1.25,
    },
    date: '2024-01-01',
  }

  beforeEach(() => {
    // Reset store
    store = {}

    // Mock localStorage with support for Object.keys
    global.localStorage = new Proxy(mockLocalStorage as Storage, {
      ownKeys: () => Object.keys(store),
      getOwnPropertyDescriptor: (target, key) => {
        if (typeof key === 'string' && key in store) {
          return { enumerable: true, configurable: true }
        }
        return Object.getOwnPropertyDescriptor(target, key)
      },
    })

    // Mock fetch
    global.fetch = vi.fn()

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    store = {}
  })

  describe('fetchExchangeRates', () => {
    it('should fetch exchange rates from API', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const result = await fetchExchangeRates('USD')

      expect(result.base).toBe('USD')
      expect(result.rates).toEqual(mockExchangeRatesResponse.rates)
      expect(result.timestamp).toBeDefined()
      expect(result.lastUpdated).toBeDefined()
    })

    it('should cache fetched rates', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      await fetchExchangeRates('USD')

      const cached = localStorage.getItem('supertool_exchange_rates_USD')
      expect(cached).toBeTruthy()

      const parsedCache = JSON.parse(cached!)
      expect(parsedCache.base).toBe('USD')
      expect(parsedCache.rates).toEqual(mockExchangeRatesResponse.rates)
    })

    it('should return cached rates if fresh', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: mockExchangeRatesResponse.rates,
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = await fetchExchangeRates('USD')

      expect(result).toEqual(cachedRates)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should fetch new rates if cache is stale', async () => {
      const staleTimestamp = Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
      const staleCachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.8 },
        timestamp: staleTimestamp,
        lastUpdated: new Date(staleTimestamp).toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(staleCachedRates))

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const result = await fetchExchangeRates('USD')

      expect(fetch).toHaveBeenCalled()
      expect(result.rates).toEqual(mockExchangeRatesResponse.rates)
    })

    it('should throw error if API request fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response)

      await expect(fetchExchangeRates('INVALID')).rejects.toThrow('Failed to fetch rates')
    })

    it('should use stale cache on API error', async () => {
      const staleTimestamp = Date.now() - 25 * 60 * 60 * 1000
      const staleCachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.8 },
        timestamp: staleTimestamp,
        lastUpdated: new Date(staleTimestamp).toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(staleCachedRates))

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchExchangeRates('USD')

      expect(result).toEqual(staleCachedRates)
      expect(console.warn).toHaveBeenCalledWith('Using stale cache due to API error')
    })

    it('should throw if no cache available on API error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchExchangeRates('USD')).rejects.toThrow('Network error')
    })
  })

  describe('getCachedRates', () => {
    it('should return null if no cache exists', () => {
      const result = getCachedRates('USD')
      expect(result).toBeNull()
    })

    it('should return cached rates if fresh', () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = getCachedRates('USD')
      expect(result).toEqual(cachedRates)
    })

    it('should return null if cache is stale', () => {
      const staleTimestamp = Date.now() - 25 * 60 * 60 * 1000 // 25 hours
      const staleCachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: staleTimestamp,
        lastUpdated: new Date(staleTimestamp).toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(staleCachedRates))

      const result = getCachedRates('USD')
      expect(result).toBeNull()
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('supertool_exchange_rates_USD', 'invalid-json')

      const result = getCachedRates('USD')
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error reading cache:', expect.any(Error))
    })
  })

  describe('convertAmount', () => {
    it('should convert amount between currencies', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const result = await convertAmount(100, 'USD', 'EUR')

      expect(result.amount).toBe(100)
      expect(result.fromCurrency).toBe('USD')
      expect(result.toCurrency).toBe('EUR')
      expect(result.rate).toBe(0.85)
      expect(result.convertedAmount).toBe(85)
      expect(result.lastUpdated).toBeDefined()
    })

    it('should return same amount for same currency', async () => {
      const result = await convertAmount(100, 'USD', 'USD')

      expect(result.amount).toBe(100)
      expect(result.convertedAmount).toBe(100)
      expect(result.rate).toBe(1)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should throw error if target currency not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      await expect(convertAmount(100, 'USD', 'INVALID')).rejects.toThrow(
        'Exchange rate not found for INVALID'
      )
    })

    it('should calculate conversion correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const result = await convertAmount(50, 'USD', 'JPY')

      expect(result.convertedAmount).toBe(50 * 110.5)
    })
  })

  describe('convertBatch', () => {
    it('should convert multiple amounts', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 50, fromCurrency: 'USD', toCurrency: 'GBP' },
        { amount: 200, fromCurrency: 'USD', toCurrency: 'JPY' },
      ]

      const results = await convertBatch(conversions)

      expect(results).toHaveLength(3)
      expect(results[0].convertedAmount).toBe(85)
      expect(results[1].convertedAmount).toBe(36.5)
      expect(results[2].convertedAmount).toBe(22100)
    })

    it('should handle same currency conversions', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'USD' },
        { amount: 50, fromCurrency: 'USD', toCurrency: 'EUR' },
      ]

      const results = await convertBatch(conversions)

      expect(results[0].convertedAmount).toBe(100)
      expect(results[0].rate).toBe(1)
      expect(results[1].convertedAmount).toBe(42.5)
    })

    it('should group by base currency to minimize API calls', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockExchangeRatesResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            base: 'EUR',
            rates: { USD: 1.18, GBP: 0.86 },
            date: '2024-01-01',
          }),
        } as Response)

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 50, fromCurrency: 'EUR', toCurrency: 'GBP' },
        { amount: 200, fromCurrency: 'USD', toCurrency: 'GBP' },
      ]

      const results = await convertBatch(conversions)

      expect(fetch).toHaveBeenCalledTimes(2) // Called once per base currency
      expect(results).toHaveLength(3)
    })

    it('should throw error if target currency not found in batch', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExchangeRatesResponse,
      } as Response)

      const conversions = [{ amount: 100, fromCurrency: 'USD', toCurrency: 'INVALID' }]

      await expect(convertBatch(conversions)).rejects.toThrow('Exchange rate not found for INVALID')
    })
  })

  describe('isCacheFresh', () => {
    it('should return true if cache is fresh', () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      expect(isCacheFresh('USD')).toBe(true)
    })

    it('should return false if cache is stale', () => {
      const staleTimestamp = Date.now() - 25 * 60 * 60 * 1000
      const staleCachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: staleTimestamp,
        lastUpdated: new Date(staleTimestamp).toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(staleCachedRates))

      expect(isCacheFresh('USD')).toBe(false)
    })

    it('should return false if no cache exists', () => {
      expect(isCacheFresh('USD')).toBe(false)
    })
  })

  describe('getCacheAge', () => {
    it('should return cache age in hours', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: twoHoursAgo,
        lastUpdated: new Date(twoHoursAgo).toISOString(),
      }

      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const age = getCacheAge('USD')
      expect(age).toBeGreaterThan(1.9)
      expect(age).toBeLessThan(2.1)
    })

    it('should return null if no cache exists', () => {
      expect(getCacheAge('USD')).toBeNull()
    })

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('supertool_exchange_rates_USD', 'invalid-json')
      expect(getCacheAge('USD')).toBeNull()
    })
  })

  describe('clearCache', () => {
    it('should clear all exchange rate caches', () => {
      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify({}))
      localStorage.setItem('supertool_exchange_rates_EUR', JSON.stringify({}))
      localStorage.setItem('other_key', 'should_remain')

      clearCache()

      expect(localStorage.getItem('supertool_exchange_rates_USD')).toBeNull()
      expect(localStorage.getItem('supertool_exchange_rates_EUR')).toBeNull()
      expect(localStorage.getItem('other_key')).toBe('should_remain')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem('supertool_exchange_rates_USD', JSON.stringify({}))

      // Mock Object.keys to throw
      const originalKeys = Object.keys
      Object.keys = vi.fn((obj) => {
        if (obj === localStorage) {
          throw new Error('Keys error')
        }
        return originalKeys(obj)
      }) as any

      expect(() => clearCache()).not.toThrow()
      expect(console.error).toHaveBeenCalledWith('Error clearing cache:', expect.any(Error))

      Object.keys = originalKeys
    })
  })

  describe('POPULAR_CURRENCIES', () => {
    it('should contain 20 popular currencies', () => {
      expect(POPULAR_CURRENCIES).toHaveLength(20)
    })

    it('should have required fields for each currency', () => {
      for (const currency of POPULAR_CURRENCIES) {
        expect(currency.code).toBeDefined()
        expect(currency.name).toBeDefined()
        expect(currency.symbol).toBeDefined()
        expect(currency.flag).toBeDefined()
      }
    })

    it('should include major currencies', () => {
      const codes = POPULAR_CURRENCIES.map((c) => c.code)
      expect(codes).toContain('USD')
      expect(codes).toContain('EUR')
      expect(codes).toContain('GBP')
      expect(codes).toContain('JPY')
      expect(codes).toContain('CNY')
    })
  })

  describe('getCurrencyInfo', () => {
    it('should return currency info for valid code', () => {
      const info = getCurrencyInfo('USD')
      expect(info).toBeDefined()
      expect(info?.code).toBe('USD')
      expect(info?.name).toBe('US Dollar')
      expect(info?.symbol).toBe('$')
      expect(info?.flag).toBe('🇺🇸')
    })

    it('should return undefined for invalid code', () => {
      expect(getCurrencyInfo('INVALID')).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      expect(getCurrencyInfo('usd')).toBeUndefined()
    })
  })

  describe('formatCurrencyAmount', () => {
    it('should format USD with symbol before amount', () => {
      expect(formatCurrencyAmount(100, 'USD')).toBe('$100.00')
    })

    it('should format EUR with symbol after amount', () => {
      expect(formatCurrencyAmount(100, 'EUR')).toBe('100.00 €')
    })

    it('should format GBP with symbol before amount', () => {
      expect(formatCurrencyAmount(100, 'GBP')).toBe('£100.00')
    })

    it('should format SEK with symbol after amount', () => {
      expect(formatCurrencyAmount(100, 'SEK')).toBe('100.00 kr')
    })

    it('should format NOK with symbol after amount', () => {
      expect(formatCurrencyAmount(100, 'NOK')).toBe('100.00 kr')
    })

    it('should format DKK with symbol after amount', () => {
      expect(formatCurrencyAmount(100, 'DKK')).toBe('100.00 kr')
    })

    it('should format PLN with symbol after amount', () => {
      expect(formatCurrencyAmount(100, 'PLN')).toBe('100.00 zł')
    })

    it('should use currency code for unknown currencies', () => {
      expect(formatCurrencyAmount(100, 'UNKNOWN')).toBe('UNKNOWN100.00')
    })

    it('should always show 2 decimal places', () => {
      expect(formatCurrencyAmount(100.5, 'USD')).toBe('$100.50')
      expect(formatCurrencyAmount(100.123, 'USD')).toBe('$100.12')
    })

    it('should handle zero amount', () => {
      expect(formatCurrencyAmount(0, 'USD')).toBe('$0.00')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrencyAmount(-50, 'USD')).toBe('$-50.00')
    })

    it('should handle large amounts', () => {
      expect(formatCurrencyAmount(1000000, 'USD')).toBe('$1000000.00')
    })
  })
})
