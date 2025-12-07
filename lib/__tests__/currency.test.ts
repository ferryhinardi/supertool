import { describe, expect, it } from 'vitest'
import {
  CURRENCIES,
  CURRENCY_LOCALES,
  type Currency,
  formatCurrency,
  getCurrencyByCode,
  getCurrencySymbol,
  getDefaultCurrency,
} from '../currency'

describe('Currency Utilities', () => {
  describe('CURRENCIES constant', () => {
    it('should have all required major currencies', () => {
      const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY']
      for (const code of majorCurrencies) {
        const currency = CURRENCIES.find((c) => c.code === code)
        expect(currency).toBeDefined()
        expect(currency?.code).toBe(code)
        expect(currency?.symbol).toBeTruthy()
        expect(currency?.name).toBeTruthy()
        expect(currency?.iconName).toBeTruthy()
      }
    })

    it('should have valid iconName for all currencies', () => {
      const validIcons = [
        'Banknote',
        'DollarSign',
        'Euro',
        'PoundSterling',
        'Coins',
        'CircleDollarSign',
      ]
      for (const currency of CURRENCIES) {
        expect(validIcons).toContain(currency.iconName)
      }
    })

    it('should have unique currency codes', () => {
      const codes = CURRENCIES.map((c) => c.code)
      const uniqueCodes = new Set(codes)
      expect(codes.length).toBe(uniqueCodes.size)
    })

    it('should include cryptocurrencies', () => {
      const btc = CURRENCIES.find((c) => c.code === 'BTC')
      const eth = CURRENCIES.find((c) => c.code === 'ETH')
      expect(btc).toBeDefined()
      expect(btc?.symbol).toBe('₿')
      expect(eth).toBeDefined()
      expect(eth?.symbol).toBe('Ξ')
    })

    it('should have Southeast Asian currencies', () => {
      const seaCurrencies = ['IDR', 'SGD', 'MYR', 'THB', 'PHP', 'VND']
      for (const code of seaCurrencies) {
        const currency = CURRENCIES.find((c) => c.code === code)
        expect(currency).toBeDefined()
      }
    })

    it('should contain at least 128 currencies', () => {
      // Comprehensive coverage check
      expect(CURRENCIES.length).toBeGreaterThanOrEqual(128)
    })
  })

  describe('CURRENCY_LOCALES constant', () => {
    it('should have locales for major currencies', () => {
      expect(CURRENCY_LOCALES.USD).toBe('en-US')
      expect(CURRENCY_LOCALES.EUR).toBe('de-DE')
      expect(CURRENCY_LOCALES.GBP).toBe('en-GB')
      expect(CURRENCY_LOCALES.JPY).toBe('ja-JP')
    })

    it('should have locales for Southeast Asian currencies', () => {
      expect(CURRENCY_LOCALES.IDR).toBe('id-ID')
      expect(CURRENCY_LOCALES.SGD).toBe('en-SG')
      expect(CURRENCY_LOCALES.MYR).toBe('ms-MY')
      expect(CURRENCY_LOCALES.THB).toBe('th-TH')
    })

    it('should have default fallback locale', () => {
      expect(CURRENCY_LOCALES.default).toBe('en-US')
    })

    it('should use valid locale codes', () => {
      // Locale codes should follow the pattern: language-REGION
      const localePattern = /^[a-z]{2}-[A-Z]{2}$/
      for (const [key, locale] of Object.entries(CURRENCY_LOCALES)) {
        if (key !== 'default') {
          expect(locale).toMatch(localePattern)
        }
      }
    })
  })

  describe('formatCurrency()', () => {
    it('should format USD with comma separators and two decimals', () => {
      const result = formatCurrency(1234567.89, 'USD')
      expect(result).toBe('1,234,567.89')
    })

    it('should format IDR with period separators and comma decimals', () => {
      const result = formatCurrency(1234567.89, 'IDR')
      expect(result).toBe('1.234.567,89')
    })

    it('should format EUR with German locale (period for thousands, comma for decimals)', () => {
      const result = formatCurrency(1234567.89, 'EUR')
      expect(result).toBe('1.234.567,89')
    })

    it('should format GBP with comma separators', () => {
      const result = formatCurrency(1234567.89, 'GBP')
      expect(result).toBe('1,234,567.89')
    })

    it('should format JPY with comma separators (typically no decimals)', () => {
      const result = formatCurrency(1234567, 'JPY', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      expect(result).toBe('1,234,567')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'USD')
      expect(result).toBe('0.00')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-1234.56, 'USD')
      expect(result).toContain('1,234.56')
      expect(result).toContain('-') // Should have minus sign somewhere
    })

    it('should handle small amounts with proper decimals', () => {
      const result = formatCurrency(0.01, 'USD')
      expect(result).toBe('0.01')
    })

    it('should use fallback locale for unknown currency code', () => {
      const result = formatCurrency(1234.56, 'UNKNOWN')
      // Should use 'en-US' as fallback
      expect(result).toBe('1,234.56')
    })

    it('should respect custom minimumFractionDigits option', () => {
      const result = formatCurrency(1234, 'USD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      expect(result).toBe('1,234')
    })

    it('should respect custom maximumFractionDigits option', () => {
      const result = formatCurrency(1234.56789, 'USD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
      expect(result).toBe('1,234.5679')
    })

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000000, 'USD')
      expect(result).toBe('1,000,000,000.00')
    })

    it('should format cryptocurrency amounts', () => {
      const result = formatCurrency(0.12345678, 'BTC', {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
      })
      expect(result).toContain('0.12345678')
    })
  })

  describe('getCurrencyByCode()', () => {
    it('should return USD currency object', () => {
      const currency = getCurrencyByCode('USD')
      expect(currency).toEqual({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        iconName: 'DollarSign',
      })
    })

    it('should return IDR currency object', () => {
      const currency = getCurrencyByCode('IDR')
      expect(currency).toEqual({
        code: 'IDR',
        symbol: 'Rp',
        name: 'Indonesian Rupiah',
        iconName: 'Banknote',
      })
    })

    it('should return EUR currency object', () => {
      const currency = getCurrencyByCode('EUR')
      expect(currency).toEqual({
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        iconName: 'Euro',
      })
    })

    it('should return undefined for unknown currency code', () => {
      const currency = getCurrencyByCode('INVALID')
      expect(currency).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const currency = getCurrencyByCode('')
      expect(currency).toBeUndefined()
    })

    it('should be case-sensitive', () => {
      const currency = getCurrencyByCode('usd')
      expect(currency).toBeUndefined()
    })

    it('should return cryptocurrency objects', () => {
      const btc = getCurrencyByCode('BTC')
      expect(btc?.code).toBe('BTC')
      expect(btc?.symbol).toBe('₿')
      expect(btc?.name).toBe('Bitcoin')
    })
  })

  describe('getDefaultCurrency()', () => {
    it('should return IDR as default currency', () => {
      const currency = getDefaultCurrency()
      expect(currency.code).toBe('IDR')
      expect(currency.symbol).toBe('Rp')
      expect(currency.name).toBe('Indonesian Rupiah')
      expect(currency.iconName).toBe('Banknote')
    })

    it('should return a complete Currency object', () => {
      const currency = getDefaultCurrency()
      expect(currency).toHaveProperty('code')
      expect(currency).toHaveProperty('symbol')
      expect(currency).toHaveProperty('name')
      expect(currency).toHaveProperty('iconName')
    })

    it('should always return the same object structure', () => {
      const currency1 = getDefaultCurrency()
      const currency2 = getDefaultCurrency()
      expect(currency1).toEqual(currency2)
    })
  })

  describe('getCurrencySymbol()', () => {
    it('should return $ for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
    })

    it('should return Rp for IDR', () => {
      expect(getCurrencySymbol('IDR')).toBe('Rp')
    })

    it('should return € for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€')
    })

    it('should return £ for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£')
    })

    it('should return ¥ for JPY', () => {
      expect(getCurrencySymbol('JPY')).toBe('¥')
    })

    it('should return $ as fallback for unknown currency', () => {
      expect(getCurrencySymbol('INVALID')).toBe('$')
    })

    it('should return $ as fallback for empty string', () => {
      expect(getCurrencySymbol('')).toBe('$')
    })

    it('should return cryptocurrency symbols', () => {
      expect(getCurrencySymbol('BTC')).toBe('₿')
      expect(getCurrencySymbol('ETH')).toBe('Ξ')
    })

    it('should handle various regional symbols', () => {
      expect(getCurrencySymbol('AED')).toBe('د.إ')
      expect(getCurrencySymbol('INR')).toBe('₹')
      expect(getCurrencySymbol('KRW')).toBe('₩')
      expect(getCurrencySymbol('RUB')).toBe('₽')
      expect(getCurrencySymbol('TRY')).toBe('₺')
    })
  })

  describe('Currency Type', () => {
    it('should accept valid Currency object', () => {
      const currency: Currency = {
        code: 'TEST',
        symbol: 'T',
        name: 'Test Currency',
        iconName: 'Coins',
      }
      expect(currency.code).toBe('TEST')
    })

    it('should enforce iconName to be one of valid types', () => {
      // This is a compile-time check, but we can verify the type exists
      const validIcons: Currency['iconName'][] = [
        'Banknote',
        'DollarSign',
        'Euro',
        'PoundSterling',
        'Coins',
        'CircleDollarSign',
      ]
      expect(validIcons).toHaveLength(6)
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should format all currencies in CURRENCIES array without errors', () => {
      for (const currency of CURRENCIES) {
        expect(() => formatCurrency(1000, currency.code)).not.toThrow()
      }
    })

    it('should have currency symbols for all currencies in array', () => {
      for (const currency of CURRENCIES) {
        const symbol = getCurrencySymbol(currency.code)
        expect(symbol).toBeTruthy()
        expect(symbol).toBe(currency.symbol)
      }
    })

    it('should retrieve all currencies by code successfully', () => {
      for (const currency of CURRENCIES) {
        const retrieved = getCurrencyByCode(currency.code)
        expect(retrieved).toEqual(currency)
      }
    })

    it('should handle very large numbers without overflow', () => {
      const result = formatCurrency(Number.MAX_SAFE_INTEGER, 'USD')
      expect(result).toBeTruthy()
      expect(result).toContain(',')
    })

    it('should handle very small numbers', () => {
      const result = formatCurrency(0.000001, 'BTC', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })
      expect(result).toContain('0.000001')
    })
  })
})
