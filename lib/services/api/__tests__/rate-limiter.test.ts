import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APIRateLimiter,
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  getRateLimiter,
  RateLimitPresets,
  resetAllRateLimiters,
} from '../rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetAllRateLimiters()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    resetAllRateLimiters()
  })

  describe('APIRateLimiter', () => {
    describe('check()', () => {
      it('should allow requests under the limit', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })
        const result = limiter.check('test-user')

        expect(result.allowed).toBe(true)
        expect(result.current).toBe(0)
        expect(result.limit).toBe(5)
        expect(result.remaining).toBe(5)
      })

      it('should return correct state after multiple checks', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })

        // Check doesn't consume, so multiple checks return same result
        limiter.check('test-user')
        limiter.check('test-user')
        const result = limiter.check('test-user')

        expect(result.allowed).toBe(true)
        expect(result.current).toBe(0)
        expect(result.remaining).toBe(5)
      })

      it('should track different identifiers separately', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        // Record requests for user1
        limiter.record('user1')
        limiter.record('user1')

        // user1 should be at limit
        expect(limiter.check('user1').allowed).toBe(false)

        // user2 should still have full quota
        expect(limiter.check('user2').allowed).toBe(true)
        expect(limiter.check('user2').remaining).toBe(2)
      })
    })

    describe('record()', () => {
      it('should record a request and return updated result', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })
        const result = limiter.record('test-user')

        expect(result.allowed).toBe(true)
        expect(result.current).toBe(1)
        expect(result.remaining).toBe(4)
      })

      it('should increment count with multiple records', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })

        limiter.record('test-user')
        limiter.record('test-user')
        const result = limiter.record('test-user')

        expect(result.current).toBe(3)
        expect(result.remaining).toBe(2)
      })

      it('should not record if limit is already exceeded', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        limiter.record('test-user')
        limiter.record('test-user')
        const result = limiter.record('test-user')

        expect(result.allowed).toBe(false)
        expect(result.current).toBe(2)
        expect(result.remaining).toBe(0)
      })
    })

    describe('consume()', () => {
      it('should check and record in one operation', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })
        const result = limiter.consume('test-user')

        expect(result.allowed).toBe(true)
        expect(result.current).toBe(1)
        expect(result.remaining).toBe(4)
      })

      it('should reject when limit is exceeded', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        limiter.consume('test-user')
        limiter.consume('test-user')
        const result = limiter.consume('test-user')

        expect(result.allowed).toBe(false)
        expect(result.remaining).toBe(0)
      })
    })

    describe('sliding window behavior', () => {
      it('should expire old requests after window passes', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        // Use up the limit
        limiter.consume('test-user')
        limiter.consume('test-user')
        expect(limiter.check('test-user').allowed).toBe(false)

        // Advance time past the window
        vi.advanceTimersByTime(61000)

        // Should be allowed again
        const result = limiter.check('test-user')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(2)
      })

      it('should allow requests as old ones expire', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        // First request
        limiter.consume('test-user')

        // Advance 30 seconds
        vi.advanceTimersByTime(30000)

        // Second request
        limiter.consume('test-user')

        // At limit now
        expect(limiter.check('test-user').allowed).toBe(false)

        // Advance 31 more seconds (first request should expire)
        vi.advanceTimersByTime(31000)

        // Should have 1 slot available now
        const result = limiter.check('test-user')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(1)
      })

      it('should calculate resetAfter correctly', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        limiter.consume('test-user')

        // Advance 30 seconds
        vi.advanceTimersByTime(30000)

        const result = limiter.consume('test-user')
        expect(result.resetAfter).toBe(30) // 30 seconds until first request expires
      })
    })

    describe('skip functionality', () => {
      it('should skip rate limiting for configured identifiers', () => {
        const limiter = new APIRateLimiter({
          maxRequests: 1,
          windowMs: 60000,
          skip: (id) => id === 'admin',
        })

        // Regular user gets limited
        limiter.consume('regular-user')
        expect(limiter.check('regular-user').allowed).toBe(false)

        // Admin is never limited
        const adminResult = limiter.consume('admin')
        expect(adminResult.allowed).toBe(true)
        expect(adminResult.remaining).toBe(1) // Full quota always
      })
    })

    describe('getHeaders()', () => {
      it('should return correct headers for allowed request', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })
        const result = limiter.consume('test-user')
        const headers = limiter.getHeaders(result)

        expect(headers['X-RateLimit-Limit']).toBe('5')
        expect(headers['X-RateLimit-Remaining']).toBe('4')
        expect(headers['X-RateLimit-Reset']).toBeDefined()
        expect(headers['Retry-After']).toBeUndefined()
      })

      it('should include Retry-After header when rate limited', () => {
        const limiter = new APIRateLimiter({ maxRequests: 1, windowMs: 60000 })

        limiter.consume('test-user')
        const result = limiter.consume('test-user')
        const headers = limiter.getHeaders(result)

        expect(headers['Retry-After']).toBeDefined()
        expect(Number.parseInt(headers['Retry-After'], 10)).toBeGreaterThan(0)
      })
    })

    describe('reset()', () => {
      it('should reset rate limit for an identifier', () => {
        const limiter = new APIRateLimiter({ maxRequests: 2, windowMs: 60000 })

        limiter.consume('test-user')
        limiter.consume('test-user')
        expect(limiter.check('test-user').allowed).toBe(false)

        limiter.reset('test-user')

        const result = limiter.check('test-user')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(2)
      })

      it('should only reset specified identifier', () => {
        const limiter = new APIRateLimiter({ maxRequests: 1, windowMs: 60000 })

        limiter.consume('user1')
        limiter.consume('user2')

        limiter.reset('user1')

        expect(limiter.check('user1').allowed).toBe(true)
        expect(limiter.check('user2').allowed).toBe(false)
      })
    })

    describe('clear()', () => {
      it('should clear all rate limit entries', () => {
        const limiter = new APIRateLimiter({ maxRequests: 1, windowMs: 60000 })

        limiter.consume('user1')
        limiter.consume('user2')
        limiter.consume('user3')

        expect(limiter.check('user1').allowed).toBe(false)
        expect(limiter.check('user2').allowed).toBe(false)
        expect(limiter.check('user3').allowed).toBe(false)

        limiter.clear()

        expect(limiter.check('user1').allowed).toBe(true)
        expect(limiter.check('user2').allowed).toBe(true)
        expect(limiter.check('user3').allowed).toBe(true)
      })
    })

    describe('destroy()', () => {
      it('should stop cleanup interval', () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })

        limiter.destroy()

        expect(clearIntervalSpy).toHaveBeenCalled()
      })
    })

    describe('getStats()', () => {
      it('should return current stats', () => {
        const limiter = new APIRateLimiter({
          maxRequests: 5,
          windowMs: 60000,
          keyPrefix: 'test',
        })

        limiter.consume('user1')
        limiter.consume('user2')

        const stats = limiter.getStats()

        expect(stats.totalEntries).toBe(2)
        expect(stats.config.maxRequests).toBe(5)
        expect(stats.config.windowMs).toBe(60000)
        expect(stats.config.keyPrefix).toBe('test')
      })
    })

    describe('automatic cleanup', () => {
      it('should clean up old entries after 2x window time', () => {
        const limiter = new APIRateLimiter({ maxRequests: 5, windowMs: 60000 })

        limiter.consume('test-user')
        expect(limiter.getStats().totalEntries).toBe(1)

        // Advance time past 2x window (cleanup threshold)
        vi.advanceTimersByTime(5 * 60 * 1000) // 5 minutes (cleanup interval)

        // After cleanup runs, old entries should be removed
        expect(limiter.getStats().totalEntries).toBe(0)
      })
    })
  })

  describe('RateLimitPresets', () => {
    it('should have correct chat preset', () => {
      expect(RateLimitPresets.chat.maxRequests).toBe(20)
      expect(RateLimitPresets.chat.windowMs).toBe(60000)
      expect(RateLimitPresets.chat.keyPrefix).toBe('chat')
    })

    it('should have correct sessionCreate preset', () => {
      expect(RateLimitPresets.sessionCreate.maxRequests).toBe(10)
      expect(RateLimitPresets.sessionCreate.windowMs).toBe(60000)
      expect(RateLimitPresets.sessionCreate.keyPrefix).toBe('session-create')
    })

    it('should have correct sessionRead preset', () => {
      expect(RateLimitPresets.sessionRead.maxRequests).toBe(100)
      expect(RateLimitPresets.sessionRead.windowMs).toBe(60000)
      expect(RateLimitPresets.sessionRead.keyPrefix).toBe('session-read')
    })

    it('should have correct sessionMutate preset', () => {
      expect(RateLimitPresets.sessionMutate.maxRequests).toBe(30)
      expect(RateLimitPresets.sessionMutate.windowMs).toBe(60000)
      expect(RateLimitPresets.sessionMutate.keyPrefix).toBe('session-mutate')
    })

    it('should have correct default preset', () => {
      expect(RateLimitPresets.default.maxRequests).toBe(60)
      expect(RateLimitPresets.default.windowMs).toBe(60000)
      expect(RateLimitPresets.default.keyPrefix).toBe('api')
    })
  })

  describe('getRateLimiter()', () => {
    it('should return singleton for same preset', () => {
      const limiter1 = getRateLimiter('chat')
      const limiter2 = getRateLimiter('chat')

      expect(limiter1).toBe(limiter2)
    })

    it('should return different limiters for different presets', () => {
      const chatLimiter = getRateLimiter('chat')
      const sessionLimiter = getRateLimiter('sessionCreate')

      expect(chatLimiter).not.toBe(sessionLimiter)
    })

    it('should accept custom config', () => {
      const customConfig = { maxRequests: 100, windowMs: 30000, keyPrefix: 'custom' }
      const limiter = getRateLimiter(customConfig)

      const stats = limiter.getStats()
      expect(stats.config.maxRequests).toBe(100)
      expect(stats.config.windowMs).toBe(30000)
    })

    it('should return same limiter for same custom keyPrefix', () => {
      const config = { maxRequests: 100, windowMs: 30000, keyPrefix: 'same-key' }

      const limiter1 = getRateLimiter(config)
      const limiter2 = getRateLimiter(config)

      expect(limiter1).toBe(limiter2)
    })
  })

  describe('resetAllRateLimiters()', () => {
    it('should destroy and clear all limiters', () => {
      // Create some limiters
      const chatLimiter = getRateLimiter('chat')
      const sessionLimiter = getRateLimiter('sessionCreate')

      chatLimiter.consume('user1')
      sessionLimiter.consume('user1')

      resetAllRateLimiters()

      // New limiters should be created
      const newChatLimiter = getRateLimiter('chat')
      expect(newChatLimiter).not.toBe(chatLimiter)
      expect(newChatLimiter.getStats().totalEntries).toBe(0)
    })
  })

  describe('getClientIdentifier()', () => {
    const createMockRequest = (headers: Record<string, string>): Request => {
      return new Request('http://localhost/api/test', {
        headers: new Headers(headers),
      })
    }

    it('should return cf-connecting-ip when present', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '1.2.3.4',
        'x-forwarded-for': '5.6.7.8',
      })

      expect(getClientIdentifier(request)).toBe('1.2.3.4')
    })

    it('should return first IP from x-forwarded-for', () => {
      const request = createMockRequest({
        'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12',
      })

      expect(getClientIdentifier(request)).toBe('1.2.3.4')
    })

    it('should return x-real-ip when present', () => {
      const request = createMockRequest({
        'x-real-ip': '1.2.3.4',
      })

      expect(getClientIdentifier(request)).toBe('1.2.3.4')
    })

    it('should return x-vercel-forwarded-for when present', () => {
      const request = createMockRequest({
        'x-vercel-forwarded-for': '1.2.3.4',
      })

      expect(getClientIdentifier(request)).toBe('1.2.3.4')
    })

    it('should return "unknown" when no IP headers present', () => {
      const request = createMockRequest({})

      expect(getClientIdentifier(request)).toBe('unknown')
    })

    it('should prioritize headers in correct order', () => {
      // cf-connecting-ip has highest priority
      const request1 = createMockRequest({
        'cf-connecting-ip': '1.1.1.1',
        'x-forwarded-for': '2.2.2.2',
        'x-real-ip': '3.3.3.3',
        'x-vercel-forwarded-for': '4.4.4.4',
      })
      expect(getClientIdentifier(request1)).toBe('1.1.1.1')

      // x-forwarded-for is second
      const request2 = createMockRequest({
        'x-forwarded-for': '2.2.2.2',
        'x-real-ip': '3.3.3.3',
        'x-vercel-forwarded-for': '4.4.4.4',
      })
      expect(getClientIdentifier(request2)).toBe('2.2.2.2')

      // x-real-ip is third
      const request3 = createMockRequest({
        'x-real-ip': '3.3.3.3',
        'x-vercel-forwarded-for': '4.4.4.4',
      })
      expect(getClientIdentifier(request3)).toBe('3.3.3.3')
    })
  })

  describe('createRateLimitResponse()', () => {
    it('should create a 429 response', async () => {
      const result = {
        allowed: false,
        current: 10,
        limit: 10,
        remaining: 0,
        resetAfter: 30,
      }

      const response = createRateLimitResponse(result)

      expect(response.status).toBe(429)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should include rate limit headers', () => {
      const result = {
        allowed: false,
        current: 10,
        limit: 10,
        remaining: 0,
        resetAfter: 30,
      }

      const response = createRateLimitResponse(result)

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBe('30')
      expect(response.headers.get('Retry-After')).toBe('30')
    })

    it('should include error body', async () => {
      const result = {
        allowed: false,
        current: 10,
        limit: 10,
        remaining: 0,
        resetAfter: 30,
      }

      const response = createRateLimitResponse(result)
      const body = await response.json()

      expect(body.success).toBe(false)
      expect(body.error.type).toBe('RATE_LIMIT')
      expect(body.error.code).toBe('rate_limit_exceeded')
      expect(body.error.message).toContain('30 seconds')
    })

    it('should use custom message when provided', async () => {
      const result = {
        allowed: false,
        current: 10,
        limit: 10,
        remaining: 0,
        resetAfter: 30,
      }

      const response = createRateLimitResponse(result, 'Custom error message')
      const body = await response.json()

      expect(body.error.message).toBe('Custom error message')
    })
  })

  describe('checkRateLimit()', () => {
    const createMockRequest = (ip: string): Request => {
      return new Request('http://localhost/api/test', {
        headers: new Headers({
          'x-forwarded-for': ip,
        }),
      })
    }

    it('should return null response when allowed', () => {
      const request = createMockRequest('1.2.3.4')
      const { result, response } = checkRateLimit(request, 'default')

      expect(response).toBeNull()
      expect(result.allowed).toBe(true)
    })

    it('should return 429 response when rate limited', () => {
      const limiter = getRateLimiter('sessionCreate') // 10 requests/min

      // Exhaust the limit
      for (let i = 0; i < 10; i++) {
        limiter.consume('1.2.3.4')
      }

      const request = createMockRequest('1.2.3.4')
      const { result, response } = checkRateLimit(request, 'sessionCreate')

      expect(response).not.toBeNull()
      expect(response?.status).toBe(429)
      expect(result.allowed).toBe(false)
    })

    it('should use default preset when not specified', () => {
      const request = createMockRequest('1.2.3.4')
      const { result } = checkRateLimit(request)

      expect(result.limit).toBe(60) // default preset
    })

    it('should accept custom config', () => {
      const customConfig = { maxRequests: 3, windowMs: 60000, keyPrefix: 'custom-check' }

      const request = createMockRequest('custom-ip')

      // Should allow first 3 requests
      for (let i = 0; i < 3; i++) {
        const { response } = checkRateLimit(request, customConfig)
        expect(response).toBeNull()
      }

      // 4th request should be rejected
      const { response } = checkRateLimit(request, customConfig)
      expect(response?.status).toBe(429)
    })
  })
})
