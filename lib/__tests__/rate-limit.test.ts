import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, getClientIp } from '../rate-limit'

// Helper to build a mock NextRequest-like object
function makeRequest(ip: string, forwarded?: string): Request {
  const headers = new Headers()
  if (forwarded) {
    headers.set('x-forwarded-for', forwarded)
  } else {
    headers.set('x-real-ip', ip)
  }
  return new Request('https://example.com/api/test', { headers })
}

describe('rate-limit', () => {
  describe('getClientIp', () => {
    it('extracts IP from x-forwarded-for header (first entry)', () => {
      const req = makeRequest('', '10.0.0.1, 10.0.0.2, 10.0.0.3')
      expect(getClientIp(req)).toBe('10.0.0.1')
    })

    it('extracts IP from x-real-ip header when x-forwarded-for is absent', () => {
      const req = makeRequest('192.168.1.1')
      expect(getClientIp(req)).toBe('192.168.1.1')
    })

    it('returns "unknown" when no IP headers are present', () => {
      const req = new Request('https://example.com/')
      expect(getClientIp(req)).toBe('unknown')
    })

    it('trims whitespace from x-forwarded-for values', () => {
      const req = makeRequest('', '  1.2.3.4  , 5.6.7.8')
      expect(getClientIp(req)).toBe('1.2.3.4')
    })
  })

  describe('checkRateLimit', () => {
    let now: number

    beforeEach(() => {
      // Pin the clock so window boundaries are predictable
      now = Date.now()
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('allows the first request', () => {
      const req = makeRequest('1.1.1.1')
      const result = checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      expect(result.resetAt).toBe(now + 60_000)
    })

    it('allows requests up to the limit', () => {
      const req = makeRequest('2.2.2.2')
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(req, { limit: 5, windowMs: 60_000 })
        expect(result.allowed).toBe(true)
      }
    })

    it('blocks the (limit + 1)th request', () => {
      const req = makeRequest('3.3.3.3')
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      }
      const result = checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets the window after windowMs elapses', () => {
      const req = makeRequest('4.4.4.4')
      for (let i = 0; i < 5; i++) {
        checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      }
      // Exhaust the window then advance time past it
      vi.advanceTimersByTime(60_001)
      const result = checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks different IPs independently', () => {
      const req1 = makeRequest('10.0.0.1')
      const req2 = makeRequest('10.0.0.2')

      for (let i = 0; i < 5; i++) {
        checkRateLimit(req1, { limit: 5, windowMs: 60_000 })
      }
      const blocked = checkRateLimit(req1, { limit: 5, windowMs: 60_000 })
      expect(blocked.allowed).toBe(false)

      const allowed = checkRateLimit(req2, { limit: 5, windowMs: 60_000 })
      expect(allowed.allowed).toBe(true)
    })

    it('uses default limit (10) and window (60s) when options are omitted', () => {
      const req = makeRequest('5.5.5.5')
      for (let i = 0; i < 10; i++) {
        const r = checkRateLimit(req)
        expect(r.allowed).toBe(true)
      }
      const r = checkRateLimit(req)
      expect(r.allowed).toBe(false)
    })

    it('returns remaining = 0 (not negative) when well over limit', () => {
      const req = makeRequest('6.6.6.6')
      for (let i = 0; i < 20; i++) {
        checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      }
      const result = checkRateLimit(req, { limit: 5, windowMs: 60_000 })
      expect(result.remaining).toBe(0)
    })
  })
})
