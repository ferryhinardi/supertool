import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type ConversionResult,
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

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    keys: () => Object.keys(store),
  }
})()

// Mock global fetch
const mockFetch = vi.fn()

describe('currency-converter', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockLocalStorage.clear()

    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // Setup fetch mock
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCachedRates', () => {
    it('should return null when no cache exists', () => {
      const result = getCachedRates('USD')

      expect(result).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('supertool_exchange_rates_USD')
    })

    it('should return cached rates when cache is fresh', () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.72 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = getCachedRates('USD')

      expect(result).not.toBeNull()
      expect(result?.base).toBe('USD')
      expect(result?.rates.EUR).toBe(0.85)
    })

    it('should return null when cache is expired (> 24 hours)', () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: expiredTimestamp,
        lastUpdated: new Date(expiredTimestamp).toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = getCachedRates('USD')

      expect(result).toBeNull()
    })

    it('should return rates when cache is within 24 hours', () => {
      const freshTimestamp = Date.now() - 23 * 60 * 60 * 1000 // 23 hours ago
      const cachedRates: ExchangeRates = {
        base: 'EUR',
        rates: { USD: 1.18, GBP: 0.85 },
        timestamp: freshTimestamp,
        lastUpdated: new Date(freshTimestamp).toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_EUR', JSON.stringify(cachedRates))

      const result = getCachedRates('EUR')

      expect(result).not.toBeNull()
      expect(result?.rates.USD).toBe(1.18)
    })

    it('should return null on parse error', () => {
      mockLocalStorage.setItem('supertool_exchange_rates_USD', 'invalid json')

      const result = getCachedRates('USD')

      expect(result).toBeNull()
    })
  })

  describe('fetchExchangeRates', () => {
    it('should return cached rates when cache is fresh', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.72 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = await fetchExchangeRates('USD')

      expect(result.base).toBe('USD')
      expect(result.rates.EUR).toBe(0.85)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch from API when no cache exists', async () => {
      const apiResponse = {
        base: 'USD',
        rates: { EUR: 0.84, GBP: 0.71, JPY: 149.5 },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const result = await fetchExchangeRates('USD')

      expect(mockFetch).toHaveBeenCalledWith('https://api.exchangerate-api.com/v4/latest/USD')
      expect(result.base).toBe('USD')
      expect(result.rates.EUR).toBe(0.84)
      expect(result.rates.GBP).toBe(0.71)
      // Should cache the result
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should throw error when API fails and no cache exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      })

      await expect(fetchExchangeRates('INVALID')).rejects.toThrow(
        'Failed to fetch rates: Not Found'
      )
    })

    it('should use stale cache when API fails', async () => {
      const staleTimestamp = Date.now() - 30 * 60 * 60 * 1000 // 30 hours ago (stale)
      const staleRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.8 },
        timestamp: staleTimestamp,
        lastUpdated: new Date(staleTimestamp).toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(staleRates))

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchExchangeRates('USD')

      expect(result.rates.EUR).toBe(0.8)
    })

    it('should fetch from API when cache is expired', async () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000 // 25 hours ago
      const expiredRates: ExchangeRates = {
        base: 'GBP',
        rates: { USD: 1.35 },
        timestamp: expiredTimestamp,
        lastUpdated: new Date(expiredTimestamp).toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_GBP', JSON.stringify(expiredRates))

      const apiResponse = {
        base: 'GBP',
        rates: { USD: 1.27, EUR: 1.17 },
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const result = await fetchExchangeRates('GBP')

      expect(mockFetch).toHaveBeenCalled()
      expect(result.rates.USD).toBe(1.27)
    })
  })

  describe('convertAmount', () => {
    it('should return same amount when currencies are the same', async () => {
      const result = await convertAmount(100, 'USD', 'USD')

      expect(result.amount).toBe(100)
      expect(result.convertedAmount).toBe(100)
      expect(result.rate).toBe(1)
      expect(result.fromCurrency).toBe('USD')
      expect(result.toCurrency).toBe('USD')
    })

    it('should convert amount using exchange rate', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.72, JPY: 149.5 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = await convertAmount(100, 'USD', 'EUR')

      expect(result.amount).toBe(100)
      expect(result.rate).toBe(0.85)
      expect(result.convertedAmount).toBe(85)
      expect(result.fromCurrency).toBe('USD')
      expect(result.toCurrency).toBe('EUR')
    })

    it('should convert to JPY correctly', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { JPY: 150 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = await convertAmount(10, 'USD', 'JPY')

      expect(result.convertedAmount).toBe(1500)
      expect(result.rate).toBe(150)
    })

    it('should throw error when target currency rate not found', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      await expect(convertAmount(100, 'USD', 'XYZ')).rejects.toThrow(
        'Exchange rate not found for XYZ'
      )
    })

    it('should handle decimal amounts', async () => {
      const cachedRates: ExchangeRates = {
        base: 'EUR',
        rates: { USD: 1.1 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_EUR', JSON.stringify(cachedRates))

      const result = await convertAmount(99.99, 'EUR', 'USD')

      expect(result.convertedAmount).toBeCloseTo(109.989, 2)
    })

    it('should include lastUpdated in result', async () => {
      const lastUpdated = new Date().toISOString()
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated,
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = await convertAmount(100, 'USD', 'EUR')

      expect(result.lastUpdated).toBe(lastUpdated)
    })
  })

  describe('convertBatch', () => {
    it('should convert multiple amounts', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.72, JPY: 150 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 50, fromCurrency: 'USD', toCurrency: 'GBP' },
        { amount: 200, fromCurrency: 'USD', toCurrency: 'JPY' },
      ]

      const results = await convertBatch(conversions)

      expect(results).toHaveLength(3)
      expect(results[0].convertedAmount).toBe(85)
      expect(results[1].convertedAmount).toBe(36)
      expect(results[2].convertedAmount).toBe(30000)
    })

    it('should handle same currency conversions in batch', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'USD' },
        { amount: 50, fromCurrency: 'USD', toCurrency: 'EUR' },
      ]

      const results = await convertBatch(conversions)

      expect(results).toHaveLength(2)
      expect(results[0].convertedAmount).toBe(100)
      expect(results[0].rate).toBe(1)
      expect(results[1].convertedAmount).toBe(42.5)
    })

    it('should group API calls by base currency', async () => {
      const usdRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      const eurRates: ExchangeRates = {
        base: 'EUR',
        rates: { GBP: 0.86 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(usdRates))
      mockLocalStorage.setItem('supertool_exchange_rates_EUR', JSON.stringify(eurRates))

      const conversions = [
        { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR' },
        { amount: 50, fromCurrency: 'EUR', toCurrency: 'GBP' },
      ]

      const results = await convertBatch(conversions)

      expect(results).toHaveLength(2)
      expect(results[0].fromCurrency).toBe('USD')
      expect(results[1].fromCurrency).toBe('EUR')
    })

    it('should handle empty batch', async () => {
      const results = await convertBatch([])

      expect(results).toHaveLength(0)
    })

    it('should throw error when rate not found in batch', async () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const conversions = [{ amount: 100, fromCurrency: 'USD', toCurrency: 'INVALID' }]

      await expect(convertBatch(conversions)).rejects.toThrow('Exchange rate not found for INVALID')
    })
  })

  describe('isCacheFresh', () => {
    it('should return true when cache is fresh', () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = isCacheFresh('USD')

      expect(result).toBe(true)
    })

    it('should return false when no cache exists', () => {
      const result = isCacheFresh('USD')

      expect(result).toBe(false)
    })

    it('should return false when cache is expired', () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: expiredTimestamp,
        lastUpdated: new Date(expiredTimestamp).toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = isCacheFresh('USD')

      expect(result).toBe(false)
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
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = getCacheAge('USD')

      expect(result).toBeCloseTo(2, 0)
    })

    it('should return null when no cache exists', () => {
      const result = getCacheAge('USD')

      expect(result).toBeNull()
    })

    it('should return null on parse error', () => {
      mockLocalStorage.setItem('supertool_exchange_rates_USD', 'invalid json')

      const result = getCacheAge('USD')

      expect(result).toBeNull()
    })

    it('should return 0 for just-created cache', () => {
      const cachedRates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }
      mockLocalStorage.setItem('supertool_exchange_rates_USD', JSON.stringify(cachedRates))

      const result = getCacheAge('USD')

      expect(result).toBeLessThan(0.01) // Less than a minute in hours
    })
  })

  describe('clearCache', () => {
    it('should clear all exchange rate caches', () => {
      mockLocalStorage.setItem(
        'supertool_exchange_rates_USD',
        JSON.stringify({ base: 'USD', rates: {}, timestamp: Date.now(), lastUpdated: '' })
      )
      mockLocalStorage.setItem(
        'supertool_exchange_rates_EUR',
        JSON.stringify({ base: 'EUR', rates: {}, timestamp: Date.now(), lastUpdated: '' })
      )
      mockLocalStorage.setItem('other_key', 'should not be deleted')

      // Override Object.keys to work with our mock
      const originalKeys = Object.keys
      vi.spyOn(Object, 'keys').mockImplementation((obj) => {
        if (obj === localStorage) {
          return mockLocalStorage.keys()
        }
        return originalKeys(obj as object)
      })

      clearCache()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('supertool_exchange_rates_USD')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('supertool_exchange_rates_EUR')
    })
  })

  describe('POPULAR_CURRENCIES', () => {
    it('should contain USD', () => {
      const usd = POPULAR_CURRENCIES.find((c) => c.code === 'USD')

      expect(usd).toBeDefined()
      expect(usd?.name).toBe('US Dollar')
      expect(usd?.symbol).toBe('$')
    })

    it('should contain EUR', () => {
      const eur = POPULAR_CURRENCIES.find((c) => c.code === 'EUR')

      expect(eur).toBeDefined()
      expect(eur?.name).toBe('Euro')
      expect(eur?.symbol).toBe('€')
    })

    it('should contain at least 10 currencies', () => {
      expect(POPULAR_CURRENCIES.length).toBeGreaterThanOrEqual(10)
    })

    it('should have unique codes', () => {
      const codes = POPULAR_CURRENCIES.map((c) => c.code)
      const uniqueCodes = new Set(codes)

      expect(uniqueCodes.size).toBe(codes.length)
    })

    it('should have all required fields for each currency', () => {
      for (const currency of POPULAR_CURRENCIES) {
        expect(currency.code).toBeDefined()
        expect(currency.name).toBeDefined()
        expect(currency.symbol).toBeDefined()
        expect(currency.flag).toBeDefined()
        expect(currency.code.length).toBe(3) // ISO 4217 codes are 3 letters
      }
    })
  })

  describe('getCurrencyInfo', () => {
    it('should return currency info for valid code', () => {
      const result = getCurrencyInfo('GBP')

      expect(result).toBeDefined()
      expect(result?.name).toBe('British Pound')
      expect(result?.symbol).toBe('£')
      expect(result?.flag).toBe('🇬🇧')
    })

    it('should return undefined for invalid code', () => {
      const result = getCurrencyInfo('INVALID')

      expect(result).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const result = getCurrencyInfo('usd')

      expect(result).toBeUndefined()
    })

    it('should return info for JPY', () => {
      const result = getCurrencyInfo('JPY')

      expect(result?.name).toBe('Japanese Yen')
      expect(result?.symbol).toBe('¥')
    })
  })

  describe('formatCurrencyAmount', () => {
    it('should format USD with symbol before amount', () => {
      const result = formatCurrencyAmount(100, 'USD')

      expect(result).toBe('$100.00')
    })

    it('should format EUR with symbol after amount', () => {
      const result = formatCurrencyAmount(100, 'EUR')

      expect(result).toBe('100.00 €')
    })

    it('should format GBP with symbol before amount', () => {
      const result = formatCurrencyAmount(50.5, 'GBP')

      expect(result).toBe('£50.50')
    })

    it('should format SEK with symbol after amount', () => {
      const result = formatCurrencyAmount(500, 'SEK')

      expect(result).toBe('500.00 kr')
    })

    it('should format NOK with symbol after amount', () => {
      const result = formatCurrencyAmount(200, 'NOK')

      expect(result).toBe('200.00 kr')
    })

    it('should format DKK with symbol after amount', () => {
      const result = formatCurrencyAmount(300, 'DKK')

      expect(result).toBe('300.00 kr')
    })

    it('should format PLN with symbol after amount', () => {
      const result = formatCurrencyAmount(400, 'PLN')

      expect(result).toBe('400.00 zł')
    })

    it('should use currency code for unknown currencies', () => {
      const result = formatCurrencyAmount(100, 'XYZ')

      expect(result).toBe('XYZ100.00')
    })

    it('should format decimal amounts correctly', () => {
      const result = formatCurrencyAmount(99.99, 'USD')

      expect(result).toBe('$99.99')
    })

    it('should format zero amount', () => {
      const result = formatCurrencyAmount(0, 'USD')

      expect(result).toBe('$0.00')
    })

    it('should format large amounts', () => {
      const result = formatCurrencyAmount(1000000, 'JPY')

      expect(result).toBe('¥1000000.00')
    })

    it('should round to 2 decimal places', () => {
      const result = formatCurrencyAmount(99.999, 'USD')

      expect(result).toBe('$100.00')
    })
  })

  describe('types', () => {
    it('should have correct ExchangeRates type structure', () => {
      const rates: ExchangeRates = {
        base: 'USD',
        rates: { EUR: 0.85, GBP: 0.72 },
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      }

      expect(rates.base).toBe('USD')
      expect(rates.rates.EUR).toBe(0.85)
      expect(typeof rates.timestamp).toBe('number')
      expect(typeof rates.lastUpdated).toBe('string')
    })

    it('should have correct ConversionResult type structure', () => {
      const result: ConversionResult = {
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        convertedAmount: 85,
        lastUpdated: new Date().toISOString(),
      }

      expect(result.amount).toBe(100)
      expect(result.fromCurrency).toBe('USD')
      expect(result.toCurrency).toBe('EUR')
      expect(result.rate).toBe(0.85)
      expect(result.convertedAmount).toBe(85)
      expect(typeof result.lastUpdated).toBe('string')
    })
  })
})
