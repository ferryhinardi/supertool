import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

// Mock fetch globally
global.fetch = vi.fn()

describe('Exchange Rates API Route', () => {
  const originalEnv = process.env.EXCHANGE_RATE_API_KEY

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Restore original env
    if (originalEnv) {
      process.env.EXCHANGE_RATE_API_KEY = originalEnv
    } else {
      delete process.env.EXCHANGE_RATE_API_KEY
    }
  })

  describe('GET /api/exchange-rates', () => {
    it('should return exchange rates from ExchangeRate-API when API key is configured', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-api-key'

      const mockRates = {
        result: 'success',
        base_code: 'USD',
        time_last_update_unix: 1700000000,
        conversion_rates: {
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 149.5,
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRates,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.rates).toEqual(mockRates.conversion_rates)
      expect(data.base).toBe('USD')
      expect(data.timestamp).toBe(1700000000)

      // Verify API was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        'https://v6.exchangerate-api.com/v6/test-api-key/latest/USD',
        expect.any(Object)
      )
    })

    it('should fall back to Frankfurter API when ExchangeRate-API fails', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-api-key'

      // First call (ExchangeRate-API) fails
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      // Second call (Frankfurter) succeeds
      const mockFrankfurterData = {
        amount: 1,
        base: 'USD',
        date: '2024-01-15',
        rates: {
          EUR: 0.85,
          GBP: 0.73,
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFrankfurterData,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.rates.USD).toBe(1)
      expect(data.rates.EUR).toBe(0.85)
      expect(data.base).toBe('USD')
    })

    it('should use Frankfurter API directly when no API key is configured', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY

      const mockFrankfurterData = {
        amount: 1,
        base: 'USD',
        date: '2024-01-15',
        rates: {
          EUR: 0.85,
          GBP: 0.73,
          JPY: 149.5,
        },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFrankfurterData,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.rates.USD).toBe(1)
      expect(data.rates.EUR).toBe(0.85)
      expect(data.base).toBe('USD')

      // Verify Frankfurter API was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.frankfurter.app/latest?from=USD',
        expect.any(Object)
      )
    })

    it('should return 500 when both APIs fail', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exchange rates')
    })

    it('should handle network errors gracefully', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY

      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch exchange rates')
    })

    it('should fall back to Frankfurter when ExchangeRate-API returns non-success result', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-api-key'

      // First call returns non-success result
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'error', 'error-type': 'invalid-key' }),
      })

      // Frankfurter fallback
      const mockFrankfurterData = {
        amount: 1,
        base: 'USD',
        date: '2024-01-15',
        rates: { EUR: 0.85 },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFrankfurterData,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.rates.EUR).toBe(0.85)
    })

    it('should set proper cache headers', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY

      const mockFrankfurterData = {
        amount: 1,
        base: 'USD',
        date: '2024-01-15',
        rates: { EUR: 0.85 },
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFrankfurterData,
      })

      const response = await GET()

      expect(response.headers.get('Cache-Control')).toContain('public')
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600')
    })
  })
})
