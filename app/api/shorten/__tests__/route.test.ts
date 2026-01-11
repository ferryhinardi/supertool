import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'abc123'),
}))

// Mock Supabase client
vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

import { nanoid } from 'nanoid'
import { supabase } from '@/lib/auth/supabaseClient'
import { GET, POST } from '../route'

describe('URL Shortener API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/shorten', () => {
    it('should return 400 if URL is missing', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('URL is required')
    })

    it('should return 400 if URL format is invalid', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'not-a-valid-url' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid URL format')
    })

    it('should return 400 if URL protocol is not http or https', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'ftp://example.com/file' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid URL protocol')
    })

    it('should return 400 if custom alias contains invalid characters', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          customAlias: 'Invalid_Alias!',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Custom alias can only contain')
    })

    it('should return 400 if custom alias is too short', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          customAlias: 'ab',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('must be between 3 and 50 characters')
    })

    it('should return 400 if custom alias is too long', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          customAlias: 'a'.repeat(51),
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('must be between 3 and 50 characters')
    })

    it('should return 409 if custom alias already exists', async () => {
      const mockFrom = vi.mocked(supabase.from)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { short_code: 'my-custom' },
              error: null,
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          customAlias: 'my-custom',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already taken')
    })

    it('should successfully create short URL with random code', async () => {
      vi.mocked(nanoid).mockReturnValue('xyz789')

      const mockFrom = vi.mocked(supabase.from)

      // First call - check if short code exists (should not exist)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      // Second call - insert new record
      mockFrom.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 1,
                short_code: 'xyz789',
                original_url: 'https://example.com',
              },
              error: null,
            }),
          }),
        }),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          host: 'localhost:3000',
        },
        body: JSON.stringify({ url: 'https://example.com' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.shortCode).toBe('xyz789')
      expect(data.originalUrl).toBe('https://example.com')
      expect(data.shortUrl).toContain('/s/xyz789')
    })

    it('should successfully create short URL with custom alias', async () => {
      const mockFrom = vi.mocked(supabase.from)

      // First call - check if custom alias exists (should not exist)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      // Second call - insert new record
      mockFrom.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 1,
                short_code: 'my-link',
                original_url: 'https://example.com/long-url',
              },
              error: null,
            }),
          }),
        }),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          url: 'https://example.com/long-url',
          customAlias: 'my-link',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.shortCode).toBe('my-link')
    })

    it('should return 500 if database insert fails', async () => {
      const mockFrom = vi.mocked(supabase.from)

      // First call - check if short code exists
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      // Second call - insert fails
      mockFrom.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create short URL')
    })

    it('should accept valid custom alias with hyphens', async () => {
      const mockFrom = vi.mocked(supabase.from)

      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      mockFrom.mockReturnValueOnce({
        select: vi.fn(),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1, short_code: 'my-custom-link', original_url: 'https://example.com' },
              error: null,
            }),
          }),
        }),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          customAlias: 'my-custom-link',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.shortCode).toBe('my-custom-link')
    })
  })

  describe('GET /api/shorten', () => {
    it('should return 400 if short code is missing', async () => {
      const request = new Request('http://localhost:3000/api/shorten', {
        method: 'GET',
      })

      const response = await GET(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Short code is required')
    })

    it('should return 404 if short URL not found', async () => {
      const mockFrom = vi.mocked(supabase.from)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten?code=notfound', {
        method: 'GET',
      })

      const response = await GET(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Short URL not found')
    })

    it('should successfully return URL info for valid short code', async () => {
      const mockFrom = vi.mocked(supabase.from)
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                short_code: 'abc123',
                original_url: 'https://example.com/some/path',
                created_at: '2024-01-15T10:00:00Z',
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
        insert: vi.fn(),
      } as never)

      const request = new Request('http://localhost:3000/api/shorten?code=abc123', {
        method: 'GET',
      })

      const response = await GET(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.shortCode).toBe('abc123')
      expect(data.originalUrl).toBe('https://example.com/some/path')
      expect(data.isActive).toBe(true)
    })
  })
})
