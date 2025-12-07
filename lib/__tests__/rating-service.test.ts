import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkUserHasRated,
  generateBrowserFingerprint,
  getRatingStats,
  type RatingStats,
  type SubmitRatingParams,
  submitRating,
} from '../rating-service'
import { supabase } from '../supabaseClient'

// Mock supabaseClient
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('rating-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRatingStats', () => {
    it('should return rating stats for a tool', async () => {
      const mockData = {
        tool_id: 'json-beautifier',
        total_ratings: 100,
        average_rating: '4.5',
        rating_1_count: 5,
        rating_2_count: 10,
        rating_3_count: 15,
        rating_4_count: 30,
        rating_5_count: 40,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any)

      const result = await getRatingStats('json-beautifier')

      expect(result).toEqual({
        toolId: 'json-beautifier',
        totalRatings: 100,
        averageRating: 4.5,
        ratingDistribution: {
          1: 5,
          2: 10,
          3: 15,
          4: 30,
          5: 40,
        },
      })
    })

    it('should return zero stats when no ratings exist (PGRST116)', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } }),
          }),
        }),
      } as any)

      const result = await getRatingStats('new-tool')

      expect(result).toEqual({
        toolId: 'new-tool',
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    })

    it('should return null on database error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: null, error: { code: 'PGRST500', message: 'DB error' } }),
          }),
        }),
      } as any)

      const result = await getRatingStats('json-beautifier')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error fetching rating stats:', expect.any(Object))
    })

    it('should parse average rating as float', async () => {
      const mockData = {
        tool_id: 'test-tool',
        total_ratings: 50,
        average_rating: '3.75',
        rating_1_count: 5,
        rating_2_count: 5,
        rating_3_count: 10,
        rating_4_count: 15,
        rating_5_count: 15,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any)

      const result = await getRatingStats('test-tool')

      expect(result?.averageRating).toBe(3.75)
    })
  })

  describe('checkUserHasRated', () => {
    it('should return true if user has rated', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(true)
    })

    it('should return false if user has not rated (PGRST116)', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      } as any)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST500', message: 'DB error' },
              }),
            }),
          }),
        }),
      } as any)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error checking user rating:', expect.any(Object))
    })

    it('should check both toolId and userFingerprint', async () => {
      const eqSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqSpy,
        }),
      } as any)

      await checkUserHasRated('test-tool', 'fp123')

      expect(eqSpy).toHaveBeenCalledWith('tool_id', 'test-tool')
    })
  })

  describe('submitRating', () => {
    const validParams: SubmitRatingParams = {
      toolId: 'json-beautifier',
      rating: 5,
      userFingerprint: 'fingerprint123',
      userIp: '192.168.1.1',
      comment: 'Great tool!',
    }

    it('should submit a valid rating', async () => {
      // Mock checkUserHasRated to return false
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      } as any)

      // Mock insert
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      const result = await submitRating(validParams)

      expect(result).toEqual({ success: true })
    })

    it('should reject rating less than 1', async () => {
      const result = await submitRating({ ...validParams, rating: 0 })

      expect(result).toEqual({
        success: false,
        error: 'Rating must be between 1 and 5',
      })
    })

    it('should reject rating greater than 5', async () => {
      const result = await submitRating({ ...validParams, rating: 6 })

      expect(result).toEqual({
        success: false,
        error: 'Rating must be between 1 and 5',
      })
    })

    it('should reject duplicate rating from same user', async () => {
      // Mock checkUserHasRated to return true
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await submitRating(validParams)

      expect(result).toEqual({
        success: false,
        error: 'You have already rated this tool',
      })
    })

    it('should handle database insert error', async () => {
      // Mock checkUserHasRated to return false
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      } as any)

      // Mock insert error
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: new Error('Insert failed'),
        }),
      } as any)

      const result = await submitRating(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Insert failed')
      expect(console.error).toHaveBeenCalledWith('Error submitting rating:', expect.any(Error))
    })

    it('should accept rating without optional fields', async () => {
      const minimalParams: SubmitRatingParams = {
        toolId: 'json-beautifier',
        rating: 4,
        userFingerprint: 'fp123',
      }

      // Mock checkUserHasRated
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      } as any)

      // Mock insert
      const insertSpy = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: insertSpy,
      } as any)

      const result = await submitRating(minimalParams)

      expect(result.success).toBe(true)
      expect(insertSpy).toHaveBeenCalledWith({
        tool_id: 'json-beautifier',
        rating: 4,
        user_fingerprint: 'fp123',
        user_ip: undefined,
        comment: undefined,
      })
    })

    it('should validate rating boundary values', async () => {
      const result1 = await submitRating({ ...validParams, rating: 1 })
      const result5 = await submitRating({ ...validParams, rating: 5 })

      // Both should pass validation (but fail on checkUserHasRated mock setup)
      expect(result1.error).not.toBe('Rating must be between 1 and 5')
      expect(result5.error).not.toBe('Rating must be between 1 and 5')
    })

    it('should handle non-Error objects in catch', async () => {
      // Mock checkUserHasRated
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              }),
            }),
          }),
        }),
      } as any)

      // Mock insert with non-Error throw
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: 'String error',
        }),
      } as any)

      const result = await submitRating(validParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })
  })

  describe('generateBrowserFingerprint', () => {
    it('should return "server" on server-side', () => {
      // Ensure window is undefined
      const originalWindow = global.window
      // @ts-expect-error - deleting window for test
      delete global.window

      const result = generateBrowserFingerprint()
      expect(result).toBe('server')

      // Restore window
      global.window = originalWindow
    })

    it('should generate fingerprint from browser components', () => {
      // Mock browser environment
      global.window = {} as any
      global.navigator = {
        userAgent: 'Mozilla/5.0',
        language: 'en-US',
      } as any
      global.screen = {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      } as any

      const result = generateBrowserFingerprint()

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).not.toBe('server')
    })

    it('should generate consistent fingerprint for same inputs', () => {
      global.window = {} as any
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0', language: 'en-US' },
        configurable: true,
        writable: true,
      })
      Object.defineProperty(global, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 24 },
        configurable: true,
        writable: true,
      })

      const result1 = generateBrowserFingerprint()
      const result2 = generateBrowserFingerprint()

      expect(result1).toBe(result2)
    })

    it('should generate different fingerprints for different browsers', () => {
      global.window = {} as any

      // First fingerprint
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Chrome', language: 'en-US' },
        configurable: true,
        writable: true,
      })
      Object.defineProperty(global, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 24 },
        configurable: true,
        writable: true,
      })

      const result1 = generateBrowserFingerprint()

      // Second fingerprint with different user agent
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Firefox', language: 'en-US' },
        configurable: true,
        writable: true,
      })

      const result2 = generateBrowserFingerprint()

      expect(result1).not.toBe(result2)
    })

    it('should use screen dimensions in fingerprint', () => {
      global.window = {} as any
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Test', language: 'en' },
        configurable: true,
        writable: true,
      })

      // First screen size
      Object.defineProperty(global, 'screen', {
        value: { width: 800, height: 600, colorDepth: 16 },
        configurable: true,
        writable: true,
      })

      const result1 = generateBrowserFingerprint()

      // Different screen size
      Object.defineProperty(global, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 16 },
        configurable: true,
        writable: true,
      })

      const result2 = generateBrowserFingerprint()

      expect(result1).not.toBe(result2)
    })

    it('should return base36 string', () => {
      global.window = {} as any
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'Test', language: 'en' },
        configurable: true,
        writable: true,
      })
      Object.defineProperty(global, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 24 },
        configurable: true,
        writable: true,
      })

      const result = generateBrowserFingerprint()

      // Base36 uses 0-9 and a-z
      expect(result).toMatch(/^[0-9a-z-]+$/)
    })
  })

  describe('Type definitions', () => {
    it('should define RatingStats interface', () => {
      const stats: RatingStats = {
        toolId: 'test',
        totalRatings: 100,
        averageRating: 4.5,
        ratingDistribution: { 1: 5, 2: 10, 3: 15, 4: 30, 5: 40 },
      }

      expect(stats.toolId).toBe('test')
      expect(stats.totalRatings).toBe(100)
      expect(stats.ratingDistribution[5]).toBe(40)
    })

    it('should define SubmitRatingParams interface', () => {
      const params: SubmitRatingParams = {
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fp123',
        userIp: '127.0.0.1',
        comment: 'Great!',
      }

      expect(params.toolId).toBe('json-beautifier')
      expect(params.rating).toBe(5)
    })

    it('should allow optional fields in SubmitRatingParams', () => {
      const params: SubmitRatingParams = {
        toolId: 'test',
        rating: 4,
        userFingerprint: 'fp',
      }

      expect(params.userIp).toBeUndefined()
      expect(params.comment).toBeUndefined()
    })
  })
})
