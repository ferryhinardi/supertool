import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase
const mockSingle = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn(() => ({ single: mockSingle })))
const mockSelect = vi.hoisted(() => vi.fn(() => ({ eq: mockEq })))
const mockFrom = vi.hoisted(() => vi.fn(() => ({ select: mockSelect })))

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Import after mocking
import { GET } from '../route'

describe('GET /api/analytics/[code]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = () => {
    return new NextRequest('http://localhost:3000/api/analytics/abc123')
  }

  const createParams = (code: string) => ({
    params: Promise.resolve({ code }),
  })

  describe('Successful Analytics Retrieval', () => {
    it('should return analytics data for a valid short code', async () => {
      const mockData = {
        short_code: 'abc123',
        original_url: 'https://example.com/long-url',
        created_at: '2024-01-15T10:00:00Z',
        is_active: true,
        total_clicks: 150,
        unique_visitors: 100,
        last_clicked: '2024-01-20T15:30:00Z',
        countries_reached: 5,
        mobile_clicks: 60,
        desktop_clicks: 80,
        tablet_clicks: 10,
      }

      mockSingle.mockResolvedValue({ data: mockData, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('abc123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        shortCode: 'abc123',
        originalUrl: 'https://example.com/long-url',
        createdAt: '2024-01-15T10:00:00Z',
        isActive: true,
        totalClicks: 150,
        uniqueVisitors: 100,
        lastClicked: '2024-01-20T15:30:00Z',
        countriesReached: 5,
        mobileClicks: 60,
        desktopClicks: 80,
        tabletClicks: 10,
      })

      expect(mockFrom).toHaveBeenCalledWith('url_statistics')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('short_code', 'abc123')
    })

    it('should handle null values with defaults', async () => {
      const mockData = {
        short_code: 'xyz789',
        original_url: 'https://example.com',
        created_at: '2024-01-15T10:00:00Z',
        is_active: true,
        total_clicks: null,
        unique_visitors: null,
        last_clicked: null,
        countries_reached: null,
        mobile_clicks: null,
        desktop_clicks: null,
        tablet_clicks: null,
      }

      mockSingle.mockResolvedValue({ data: mockData, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('xyz789'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalClicks).toBe(0)
      expect(data.uniqueVisitors).toBe(0)
      expect(data.countriesReached).toBe(0)
      expect(data.mobileClicks).toBe(0)
      expect(data.desktopClicks).toBe(0)
      expect(data.tabletClicks).toBe(0)
      expect(data.lastClicked).toBeNull()
    })

    it('should handle zero values correctly', async () => {
      const mockData = {
        short_code: 'new123',
        original_url: 'https://example.com',
        created_at: '2024-01-15T10:00:00Z',
        is_active: true,
        total_clicks: 0,
        unique_visitors: 0,
        last_clicked: null,
        countries_reached: 0,
        mobile_clicks: 0,
        desktop_clicks: 0,
        tablet_clicks: 0,
      }

      mockSingle.mockResolvedValue({ data: mockData, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('new123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalClicks).toBe(0)
      expect(data.uniqueVisitors).toBe(0)
      expect(data.countriesReached).toBe(0)
    })

    it('should handle inactive URLs', async () => {
      const mockData = {
        short_code: 'inactive1',
        original_url: 'https://example.com',
        created_at: '2024-01-15T10:00:00Z',
        is_active: false,
        total_clicks: 50,
        unique_visitors: 30,
        last_clicked: '2024-01-18T12:00:00Z',
        countries_reached: 2,
        mobile_clicks: 20,
        desktop_clicks: 25,
        tablet_clicks: 5,
      }

      mockSingle.mockResolvedValue({ data: mockData, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('inactive1'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isActive).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 if URL not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('notfound'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('URL not found')
    })

    it('should return 404 on database error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'PGRST116' },
      })

      const request = createMockRequest()
      const response = await GET(request, createParams('error123'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('URL not found')
    })

    it('should return 500 on unexpected error', async () => {
      mockSingle.mockRejectedValue(new Error('Connection failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest()
      const response = await GET(request, createParams('crash123'))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')

      consoleSpy.mockRestore()
    })
  })

  describe('Parameter Handling', () => {
    it('should extract code from params correctly', async () => {
      const mockData = {
        short_code: 'test-code-123',
        original_url: 'https://example.com',
        created_at: '2024-01-15T10:00:00Z',
        is_active: true,
        total_clicks: 10,
        unique_visitors: 5,
        last_clicked: null,
        countries_reached: 1,
        mobile_clicks: 3,
        desktop_clicks: 6,
        tablet_clicks: 1,
      }

      mockSingle.mockResolvedValue({ data: mockData, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('test-code-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockEq).toHaveBeenCalledWith('short_code', 'test-code-123')
      expect(data.shortCode).toBe('test-code-123')
    })

    it('should handle special characters in code', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })

      const request = createMockRequest()
      const response = await GET(request, createParams('code_with-special.chars'))

      expect(mockEq).toHaveBeenCalledWith('short_code', 'code_with-special.chars')
      expect(response.status).toBe(404)
    })
  })
})
