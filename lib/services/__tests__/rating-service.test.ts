import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkUserHasRated,
  generateBrowserFingerprint,
  getRatingStats,
  submitRating,
} from '../rating-service'

// Mock supabase client
vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
    })),
  },
}))

// Import the mocked module
import { supabase } from '@/lib/auth/supabaseClient'

describe('rating-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRatingStats', () => {
    it('should return rating stats when data exists', async () => {
      const mockData = {
        tool_id: 'json-beautifier',
        total_ratings: 100,
        average_rating: '4.5',
        rating_1_count: 5,
        rating_2_count: 5,
        rating_3_count: 10,
        rating_4_count: 30,
        rating_5_count: 50,
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await getRatingStats('json-beautifier')

      expect(result).toEqual({
        toolId: 'json-beautifier',
        totalRatings: 100,
        averageRating: 4.5,
        ratingDistribution: { 1: 5, 2: 5, 3: 10, 4: 30, 5: 50 },
      })
      expect(supabase.from).toHaveBeenCalledWith('tool_rating_stats')
    })

    it('should return default stats when no ratings exist (PGRST116 error)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await getRatingStats('new-tool')

      expect(result).toEqual({
        toolId: 'new-tool',
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    })

    it('should return null on other errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await getRatingStats('json-beautifier')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching rating stats:', expect.any(Object))
    })

    it('should handle exceptions gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = await getRatingStats('json-beautifier')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching rating stats:', expect.any(Error))
    })
  })

  describe('checkUserHasRated', () => {
    it('should return true when user has rated', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('tool_ratings')
    })

    it('should return false when user has not rated (PGRST116 error)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(false)
    })

    it('should return false on errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'OTHER_ERROR' } })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking user rating:', expect.any(Object))
    })

    it('should handle exceptions gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = await checkUserHasRated('json-beautifier', 'fingerprint123')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking user rating:', expect.any(Error))
    })
  })

  describe('submitRating', () => {
    it('should return error for rating below 1', async () => {
      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 0,
        userFingerprint: 'fingerprint123',
      })

      expect(result).toEqual({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('should return error for rating above 5', async () => {
      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 6,
        userFingerprint: 'fingerprint123',
      })

      expect(result).toEqual({ success: false, error: 'Rating must be between 1 and 5' })
    })

    it('should return error when user has already rated', async () => {
      // Mock checkUserHasRated to return true
      const mockSingle = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never)

      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fingerprint123',
      })

      expect(result).toEqual({ success: false, error: 'You have already rated this tool' })
    })

    it('should successfully submit rating when user has not rated', async () => {
      // First call for checkUserHasRated (returns no data)
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })

      // Second call for insert
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'tool_ratings') {
          return {
            select: mockSelect,
            insert: mockInsert,
          } as never
        }
        return { select: mockSelect } as never
      })

      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fingerprint123',
        userIp: '192.168.1.1',
        comment: 'Great tool!',
      })

      expect(result).toEqual({ success: true })
      expect(mockInsert).toHaveBeenCalledWith({
        tool_id: 'json-beautifier',
        rating: 5,
        user_fingerprint: 'fingerprint123',
        user_ip: '192.168.1.1',
        comment: 'Great tool!',
      })
    })

    it('should return error when insert fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock checkUserHasRated to return false
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })

      // Mock insert to fail
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } })

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'tool_ratings') {
          return {
            select: mockSelect,
            insert: mockInsert,
          } as never
        }
        return { select: mockSelect } as never
      })

      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fingerprint123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting rating:', expect.any(Object))
    })

    it('should handle exceptions gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fingerprint123',
      })

      expect(result).toEqual({ success: false, error: 'Connection failed' })
      expect(consoleSpy).toHaveBeenCalledWith('Error submitting rating:', expect.any(Error))
    })

    it('should handle non-Error exceptions', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(supabase.from).mockImplementation(() => {
        throw 'string error'
      })

      const result = await submitRating({
        toolId: 'json-beautifier',
        rating: 5,
        userFingerprint: 'fingerprint123',
      })

      expect(result).toEqual({ success: false, error: 'Unknown error' })
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('generateBrowserFingerprint', () => {
    it('should generate a fingerprint string in browser environment', () => {
      // Browser environment is already mocked by jsdom
      const fingerprint = generateBrowserFingerprint()

      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
      expect(fingerprint).not.toBe('server')
    })

    it('should generate consistent fingerprint for same browser environment', () => {
      const fingerprint1 = generateBrowserFingerprint()
      const fingerprint2 = generateBrowserFingerprint()

      expect(fingerprint1).toBe(fingerprint2)
    })

    it('should return "server" when window is undefined', () => {
      const originalWindow = globalThis.window

      // @ts-expect-error - simulating SSR
      delete globalThis.window

      const fingerprint = generateBrowserFingerprint()

      expect(fingerprint).toBe('server')

      // Restore window
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      })
    })
  })
})
