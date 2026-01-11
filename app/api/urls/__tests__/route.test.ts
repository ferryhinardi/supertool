import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase client
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table)
      return {
        select: (columns: string) => {
          mockSelect(columns)
          return {
            order: (column: string, options: { ascending: boolean }) => {
              mockOrder(column, options)
              return {
                limit: (count: number) => {
                  mockLimit(count)
                  return Promise.resolve({
                    data: mockData,
                    error: mockError,
                  })
                },
              }
            },
          }
        },
      }
    },
  },
}))

// Import after mocking
import { GET } from '../route'

let mockData: unknown[] | null = null
let mockError: { message: string } | null = null

describe('URLs API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockData = null
    mockError = null
  })

  function createRequest(): NextRequest {
    return new NextRequest('http://localhost:3000/api/urls', {
      method: 'GET',
    })
  }

  describe('Successful Fetch', () => {
    it('should return formatted URL list', async () => {
      mockData = [
        {
          short_code: 'abc123',
          original_url: 'https://example.com/long-url-1',
          created_at: '2024-01-15T10:30:00Z',
          is_active: true,
          total_clicks: 42,
          unique_visitors: 28,
          last_clicked: '2024-01-20T15:45:00Z',
        },
        {
          short_code: 'def456',
          original_url: 'https://example.com/long-url-2',
          created_at: '2024-01-10T08:00:00Z',
          is_active: false,
          total_clicks: 10,
          unique_visitors: 8,
          last_clicked: null,
        },
      ]

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.urls).toHaveLength(2)
      expect(data.count).toBe(2)

      // Check first URL
      expect(data.urls[0]).toEqual({
        shortCode: 'abc123',
        originalUrl: 'https://example.com/long-url-1',
        createdAt: '2024-01-15T10:30:00Z',
        isActive: true,
        totalClicks: 42,
        uniqueVisitors: 28,
        lastClicked: '2024-01-20T15:45:00Z',
      })

      // Check second URL
      expect(data.urls[1]).toEqual({
        shortCode: 'def456',
        originalUrl: 'https://example.com/long-url-2',
        createdAt: '2024-01-10T08:00:00Z',
        isActive: false,
        totalClicks: 10,
        uniqueVisitors: 8,
        lastClicked: null,
      })
    })

    it('should return empty array when no URLs exist', async () => {
      mockData = []

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.urls).toEqual([])
      expect(data.count).toBe(0)
    })

    it('should handle null data from Supabase', async () => {
      mockData = null

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.urls).toEqual([])
      expect(data.count).toBe(0)
    })

    it('should default totalClicks to 0 when null', async () => {
      mockData = [
        {
          short_code: 'xyz789',
          original_url: 'https://example.com',
          created_at: '2024-01-01T00:00:00Z',
          is_active: true,
          total_clicks: null,
          unique_visitors: null,
          last_clicked: null,
        },
      ]

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.urls[0].totalClicks).toBe(0)
      expect(data.urls[0].uniqueVisitors).toBe(0)
    })

    it('should query with correct parameters', async () => {
      mockData = []

      const request = createRequest()
      await GET(request)

      expect(mockFrom).toHaveBeenCalledWith('url_statistics')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockLimit).toHaveBeenCalledWith(100)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when Supabase query fails', async () => {
      mockError = { message: 'Database connection error' }
      mockData = null

      const request = createRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch URLs')
    })
  })
})
