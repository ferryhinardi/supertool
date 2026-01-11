import { describe, expect, it } from 'vitest'

import {
  CURRENCIES,
  CURRENCY_LOCALES,
  formatCurrency,
  getCurrencyByCode,
  getCurrencySymbol,
  getDefaultCurrency,
} from '../currency'

describe('currency utilities', () => {
  describe('CURRENCIES constant', () => {
    it('should contain major world currencies', () => {
      const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY']
      for (const code of majorCurrencies) {
        const currency = CURRENCIES.find((c) => c.code === code)
        expect(currency).toBeDefined()
      }
    })

    it('should contain Southeast Asian currencies', () => {
      const seaCurrencies = ['IDR', 'SGD', 'MYR', 'THB', 'PHP', 'VND']
      for (const code of seaCurrencies) {
        const currency = CURRENCIES.find((c) => c.code === code)
        expect(currency).toBeDefined()
      }
    })

    it('should have valid currency structure for all entries', () => {
      for (const currency of CURRENCIES) {
        expect(currency.code).toBeDefined()
        expect(currency.code.length).toBe(3)
        expect(currency.symbol).toBeDefined()
        expect(currency.name).toBeDefined()
        expect(currency.iconName).toBeDefined()
        expect([
          'Banknote',
          'DollarSign',
          'Euro',
          'PoundSterling',
          'Coins',
          'CircleDollarSign',
        ]).toContain(currency.iconName)
      }
    })

    it('should have unique currency codes', () => {
      const codes = CURRENCIES.map((c) => c.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })

    it('should contain cryptocurrencies', () => {
      const cryptos = ['BTC', 'ETH']
      for (const code of cryptos) {
        const currency = CURRENCIES.find((c) => c.code === code)
        expect(currency).toBeDefined()
      }
    })

    it('should have correct symbol for USD', () => {
      const usd = CURRENCIES.find((c) => c.code === 'USD')
      expect(usd?.symbol).toBe('$')
      expect(usd?.name).toBe('US Dollar')
      expect(usd?.iconName).toBe('DollarSign')
    })

    it('should have correct symbol for EUR', () => {
      const eur = CURRENCIES.find((c) => c.code === 'EUR')
      expect(eur?.symbol).toBe('€')
      expect(eur?.name).toBe('Euro')
      expect(eur?.iconName).toBe('Euro')
    })

    it('should have correct symbol for GBP', () => {
      const gbp = CURRENCIES.find((c) => c.code === 'GBP')
      expect(gbp?.symbol).toBe('£')
      expect(gbp?.name).toBe('British Pound')
      expect(gbp?.iconName).toBe('PoundSterling')
    })

    it('should have correct symbol for IDR', () => {
      const idr = CURRENCIES.find((c) => c.code === 'IDR')
      expect(idr?.symbol).toBe('Rp')
      expect(idr?.name).toBe('Indonesian Rupiah')
      expect(idr?.iconName).toBe('Banknote')
    })

    it('should have correct symbol for JPY', () => {
      const jpy = CURRENCIES.find((c) => c.code === 'JPY')
      expect(jpy?.symbol).toBe('¥')
      expect(jpy?.name).toBe('Japanese Yen')
      expect(jpy?.iconName).toBe('Coins')
    })
  })

  describe('CURRENCY_LOCALES constant', () => {
    it('should have locale for major currencies', () => {
      expect(CURRENCY_LOCALES.USD).toBe('en-US')
      expect(CURRENCY_LOCALES.EUR).toBe('de-DE')
      expect(CURRENCY_LOCALES.GBP).toBe('en-GB')
      expect(CURRENCY_LOCALES.JPY).toBe('ja-JP')
      expect(CURRENCY_LOCALES.CNY).toBe('zh-CN')
    })

    it('should have locale for Southeast Asian currencies', () => {
      expect(CURRENCY_LOCALES.IDR).toBe('id-ID')
      expect(CURRENCY_LOCALES.SGD).toBe('en-SG')
      expect(CURRENCY_LOCALES.MYR).toBe('ms-MY')
      expect(CURRENCY_LOCALES.THB).toBe('th-TH')
      expect(CURRENCY_LOCALES.PHP).toBe('en-PH')
      expect(CURRENCY_LOCALES.VND).toBe('vi-VN')
    })

    it('should have locale for Oceania currencies', () => {
      expect(CURRENCY_LOCALES.AUD).toBe('en-AU')
      expect(CURRENCY_LOCALES.NZD).toBe('en-NZ')
    })

    it('should have locale for Americas currencies', () => {
      expect(CURRENCY_LOCALES.CAD).toBe('en-CA')
      expect(CURRENCY_LOCALES.MXN).toBe('es-MX')
      expect(CURRENCY_LOCALES.BRL).toBe('pt-BR')
    })

    it('should have locale for European currencies', () => {
      expect(CURRENCY_LOCALES.CHF).toBe('de-CH')
      expect(CURRENCY_LOCALES.SEK).toBe('sv-SE')
      expect(CURRENCY_LOCALES.NOK).toBe('no-NO')
      expect(CURRENCY_LOCALES.PLN).toBe('pl-PL')
    })

    it('should have locale for Middle Eastern currencies', () => {
      expect(CURRENCY_LOCALES.AED).toBe('ar-AE')
      expect(CURRENCY_LOCALES.SAR).toBe('ar-SA')
      expect(CURRENCY_LOCALES.ILS).toBe('he-IL')
    })

    it('should have locale for African currencies', () => {
      expect(CURRENCY_LOCALES.ZAR).toBe('en-ZA')
      expect(CURRENCY_LOCALES.EGP).toBe('ar-EG')
      expect(CURRENCY_LOCALES.NGN).toBe('en-NG')
    })

    it('should have locale for Asian currencies', () => {
      expect(CURRENCY_LOCALES.INR).toBe('en-IN')
      expect(CURRENCY_LOCALES.KRW).toBe('ko-KR')
      expect(CURRENCY_LOCALES.HKD).toBe('zh-HK')
      expect(CURRENCY_LOCALES.TWD).toBe('zh-TW')
    })

    it('should have default fallback locale', () => {
      expect(CURRENCY_LOCALES.default).toBe('en-US')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD with US locale (comma separators)', () => {
      const result = formatCurrency(1234567.89, 'USD')
      expect(result).toBe('1,234,567.89')
    })

    it('should format EUR with German locale (period separators)', () => {
      const result = formatCurrency(1234567.89, 'EUR')
      // German locale uses period as thousands separator and comma as decimal
      expect(result).toBe('1.234.567,89')
    })

    it('should format IDR with Indonesian locale', () => {
      const result = formatCurrency(1234567.89, 'IDR')
      // Indonesian locale uses period as thousands separator and comma as decimal
      expect(result).toBe('1.234.567,89')
    })

    it('should format JPY with Japanese locale', () => {
      const result = formatCurrency(1234567, 'JPY')
      // Japanese locale uses comma as thousands separator
      expect(result).toContain('1,234,567')
    })

    it('should format GBP with British locale', () => {
      const result = formatCurrency(1234567.89, 'GBP')
      expect(result).toBe('1,234,567.89')
    })

    it('should use en-US locale for unknown currency codes', () => {
      const result = formatCurrency(1234567.89, 'XYZ')
      expect(result).toBe('1,234,567.89')
    })

    it('should format zero amount', () => {
      const result = formatCurrency(0, 'USD')
      expect(result).toBe('0.00')
    })

    it('should format negative amounts', () => {
      const result = formatCurrency(-1234.56, 'USD')
      expect(result).toContain('1,234.56')
    })

    it('should format very large amounts', () => {
      const result = formatCurrency(1234567890123.45, 'USD')
      expect(result).toBe('1,234,567,890,123.45')
    })

    it('should format small decimal amounts', () => {
      const result = formatCurrency(0.01, 'USD')
      expect(result).toBe('0.01')
    })

    it('should respect custom minimumFractionDigits option', () => {
      const result = formatCurrency(1234.5, 'USD', { minimumFractionDigits: 0 })
      expect(result).toBe('1,234.5')
    })

    it('should respect custom maximumFractionDigits option', () => {
      const result = formatCurrency(1234.5678, 'USD', {
        maximumFractionDigits: 4,
      })
      expect(result).toBe('1,234.5678')
    })

    it('should respect both fraction digit options', () => {
      const result = formatCurrency(1234, 'USD', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      expect(result).toBe('1,234')
    })

    it('should format BRL with Brazilian locale', () => {
      const result = formatCurrency(1234567.89, 'BRL')
      // Brazilian Portuguese uses period as thousands separator and comma as decimal
      expect(result).toBe('1.234.567,89')
    })

    it('should format INR with Indian locale', () => {
      const result = formatCurrency(1234567.89, 'INR')
      // Indian locale has unique grouping: 12,34,567.89
      expect(result).toContain('567.89')
    })

    it('should format KRW with Korean locale', () => {
      const result = formatCurrency(1234567, 'KRW')
      expect(result).toContain('1,234,567')
    })

    it('should format CHF with Swiss locale', () => {
      const result = formatCurrency(1234567.89, 'CHF')
      // Swiss German locale
      expect(result).toContain('234')
    })
  })

  describe('getCurrencyByCode', () => {
    it('should return USD currency object', () => {
      const result = getCurrencyByCode('USD')
      expect(result).toEqual({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        iconName: 'DollarSign',
      })
    })

    it('should return EUR currency object', () => {
      const result = getCurrencyByCode('EUR')
      expect(result).toEqual({
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        iconName: 'Euro',
      })
    })

    it('should return GBP currency object', () => {
      const result = getCurrencyByCode('GBP')
      expect(result).toEqual({
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        iconName: 'PoundSterling',
      })
    })

    it('should return IDR currency object', () => {
      const result = getCurrencyByCode('IDR')
      expect(result).toEqual({
        code: 'IDR',
        symbol: 'Rp',
        name: 'Indonesian Rupiah',
        iconName: 'Banknote',
      })
    })

    it('should return JPY currency object', () => {
      const result = getCurrencyByCode('JPY')
      expect(result).toEqual({
        code: 'JPY',
        symbol: '¥',
        name: 'Japanese Yen',
        iconName: 'Coins',
      })
    })

    it('should return SGD currency object', () => {
      const result = getCurrencyByCode('SGD')
      expect(result).toEqual({
        code: 'SGD',
        symbol: 'S$',
        name: 'Singapore Dollar',
        iconName: 'CircleDollarSign',
      })
    })

    it('should return undefined for unknown currency code', () => {
      const result = getCurrencyByCode('XYZ')
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const result = getCurrencyByCode('')
      expect(result).toBeUndefined()
    })

    it('should be case-sensitive (lowercase returns undefined)', () => {
      const result = getCurrencyByCode('usd')
      expect(result).toBeUndefined()
    })

    it('should return BTC cryptocurrency', () => {
      const result = getCurrencyByCode('BTC')
      expect(result).toEqual({
        code: 'BTC',
        symbol: '₿',
        name: 'Bitcoin',
        iconName: 'Coins',
      })
    })

    it('should return ETH cryptocurrency', () => {
      const result = getCurrencyByCode('ETH')
      expect(result).toEqual({
        code: 'ETH',
        symbol: 'Ξ',
        name: 'Ethereum',
        iconName: 'Coins',
      })
    })
  })

  describe('getDefaultCurrency', () => {
    it('should return IDR as the default currency', () => {
      const result = getDefaultCurrency()
      expect(result).toEqual({
        code: 'IDR',
        symbol: 'Rp',
        name: 'Indonesian Rupiah',
        iconName: 'Banknote',
      })
    })

    it('should return valid currency structure', () => {
      const result = getDefaultCurrency()
      expect(result.code).toBeDefined()
      expect(result.code.length).toBe(3)
      expect(result.symbol).toBeDefined()
      expect(result.name).toBeDefined()
      expect(result.iconName).toBeDefined()
    })

    it('should return consistent result on multiple calls', () => {
      const result1 = getDefaultCurrency()
      const result2 = getDefaultCurrency()
      expect(result1).toEqual(result2)
    })
  })

  describe('getCurrencySymbol', () => {
    it('should return $ for USD', () => {
      const result = getCurrencySymbol('USD')
      expect(result).toBe('$')
    })

    it('should return € for EUR', () => {
      const result = getCurrencySymbol('EUR')
      expect(result).toBe('€')
    })

    it('should return £ for GBP', () => {
      const result = getCurrencySymbol('GBP')
      expect(result).toBe('£')
    })

    it('should return ¥ for JPY', () => {
      const result = getCurrencySymbol('JPY')
      expect(result).toBe('¥')
    })

    it('should return ¥ for CNY', () => {
      const result = getCurrencySymbol('CNY')
      expect(result).toBe('¥')
    })

    it('should return Rp for IDR', () => {
      const result = getCurrencySymbol('IDR')
      expect(result).toBe('Rp')
    })

    it('should return S$ for SGD', () => {
      const result = getCurrencySymbol('SGD')
      expect(result).toBe('S$')
    })

    it('should return ₹ for INR', () => {
      const result = getCurrencySymbol('INR')
      expect(result).toBe('₹')
    })

    it('should return ₩ for KRW', () => {
      const result = getCurrencySymbol('KRW')
      expect(result).toBe('₩')
    })

    it('should return ₿ for BTC', () => {
      const result = getCurrencySymbol('BTC')
      expect(result).toBe('₿')
    })

    it('should return Ξ for ETH', () => {
      const result = getCurrencySymbol('ETH')
      expect(result).toBe('Ξ')
    })

    it('should return $ as fallback for unknown currency code', () => {
      const result = getCurrencySymbol('XYZ')
      expect(result).toBe('$')
    })

    it('should return $ as fallback for empty string', () => {
      const result = getCurrencySymbol('')
      expect(result).toBe('$')
    })

    it('should be case-sensitive (lowercase returns fallback)', () => {
      const result = getCurrencySymbol('usd')
      expect(result).toBe('$')
    })
  })

  describe('currency data integrity', () => {
    it('should have more than 100 currencies defined', () => {
      expect(CURRENCIES.length).toBeGreaterThan(100)
    })

    it('should have locale mappings for common currencies', () => {
      const commonCurrencies = [
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CNY',
        'IDR',
        'SGD',
        'AUD',
        'CAD',
        'INR',
      ]
      for (const code of commonCurrencies) {
        expect(CURRENCY_LOCALES[code]).toBeDefined()
      }
    })

    it('should have all major region categories represented', () => {
      // Check that we have currencies from all major regions
      const regions = {
        americas: ['USD', 'CAD', 'BRL', 'MXN'],
        europe: ['EUR', 'GBP', 'CHF', 'SEK'],
        asia: ['JPY', 'CNY', 'INR', 'KRW'],
        oceania: ['AUD', 'NZD'],
        africa: ['ZAR', 'EGP', 'NGN'],
        middleEast: ['AED', 'SAR', 'ILS'],
      }

      for (const [_region, codes] of Object.entries(regions)) {
        for (const code of codes) {
          const currency = CURRENCIES.find((c) => c.code === code)
          expect(currency).toBeDefined()
        }
      }
    })
  })
})
