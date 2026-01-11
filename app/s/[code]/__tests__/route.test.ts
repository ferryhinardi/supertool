import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/auth/supabaseClient'
import { GET } from '../route'

describe('URL Shortener Redirect Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Set to development for most tests
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  const createRequest = (code: string, headers: Record<string, string> = {}) => {
    return new Request(`http://localhost:3000/s/${code}`, {
      method: 'GET',
      headers: {
        host: 'localhost:3000',
        ...headers,
      },
    }) as unknown as NextRequest
  }

  const createParams = (code: string) => Promise.resolve({ code })

  const setupMocks = (
    selectResult: { data: unknown; error: unknown },
    insertCallback?: (data: unknown) => void
  ) => {
    const mockFrom = vi.mocked(supabase.from)
    mockFrom.mockImplementation((table) => {
      if (table === 'shortened_urls') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(selectResult),
            }),
          }),
        } as never
      }
      if (table === 'url_analytics') {
        return {
          insert: vi.fn().mockImplementation((data) => {
            if (insertCallback) insertCallback(data)
            return Promise.resolve({ error: null })
          }),
        } as never
      }
      return {} as never
    })
  }

  it('should redirect to original URL for valid active short code', async () => {
    setupMocks({
      data: { original_url: 'https://example.com/long-url', is_active: true },
      error: null,
    })

    const request = createRequest('abc123')
    const response = await GET(request, { params: createParams('abc123') })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://example.com/long-url')
    expect(supabase.from).toHaveBeenCalledWith('shortened_urls')
  })

  it('should redirect to error page if short code not found', async () => {
    setupMocks({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })

    const request = createRequest('notfound')
    const response = await GET(request, { params: createParams('notfound') })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/tools/url-shortener?error=notfound'
    )
  })

  it('should redirect to error page if short code is inactive', async () => {
    setupMocks({
      data: { original_url: 'https://example.com', is_active: false },
      error: null,
    })

    const request = createRequest('inactive123')
    const response = await GET(request, { params: createParams('inactive123') })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/tools/url-shortener?error=notfound'
    )
  })

  it('should redirect to error page if data is null', async () => {
    setupMocks({
      data: null,
      error: null,
    })

    const request = createRequest('empty')
    const response = await GET(request, { params: createParams('empty') })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/tools/url-shortener?error=notfound'
    )
  })

  it('should track analytics with user agent and referer', async () => {
    let insertedData: Record<string, string> | null = null
    setupMocks(
      { data: { original_url: 'https://example.com', is_active: true }, error: null },
      (data) => {
        insertedData = data as Record<string, string>
      }
    )

    const request = createRequest('abc123', {
      'user-agent': 'Mozilla/5.0 Test Browser',
      referer: 'https://google.com',
      'x-forwarded-for': '192.168.1.1',
    })

    await GET(request, { params: createParams('abc123') })

    // Give the fire-and-forget analytics a tick to run
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(insertedData).toEqual({
      short_code: 'abc123',
      user_agent: 'Mozilla/5.0 Test Browser',
      referrer: 'https://google.com',
      ip_address: '192.168.1.1',
    })
  })

  it('should extract first IP from x-forwarded-for header', async () => {
    let insertedData: Record<string, string> | null = null
    setupMocks(
      { data: { original_url: 'https://example.com', is_active: true }, error: null },
      (data) => {
        insertedData = data as Record<string, string>
      }
    )

    const request = createRequest('abc123', {
      'x-forwarded-for': '10.0.0.1, 192.168.1.1, 172.16.0.1',
    })

    await GET(request, { params: createParams('abc123') })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect((insertedData as Record<string, string> | null)?.ip_address).toBe('10.0.0.1')
  })

  it('should use x-real-ip if x-forwarded-for is not available', async () => {
    let insertedData: Record<string, string> | null = null
    setupMocks(
      { data: { original_url: 'https://example.com', is_active: true }, error: null },
      (data) => {
        insertedData = data as Record<string, string>
      }
    )

    const request = createRequest('abc123', {
      'x-real-ip': '8.8.8.8',
    })

    await GET(request, { params: createParams('abc123') })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect((insertedData as Record<string, string> | null)?.ip_address).toBe('8.8.8.8')
  })

  it('should handle empty headers gracefully', async () => {
    let insertedData: Record<string, string> | null = null
    setupMocks(
      { data: { original_url: 'https://example.com', is_active: true }, error: null },
      (data) => {
        insertedData = data as Record<string, string>
      }
    )

    const request = createRequest('abc123')
    await GET(request, { params: createParams('abc123') })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(insertedData).toEqual({
      short_code: 'abc123',
      user_agent: '',
      referrer: '',
      ip_address: '',
    })
  })

  it('should redirect to server error page on exception', async () => {
    const mockFrom = vi.mocked(supabase.from)
    mockFrom.mockImplementation(() => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      } as never
    })

    const request = createRequest('error123')
    const response = await GET(request, { params: createParams('error123') })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/tools/url-shortener?error=server'
    )
  })

  it('should use https in production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    setupMocks({
      data: null,
      error: { code: 'PGRST116' },
    })

    const request = createRequest('notfound')
    const response = await GET(request, { params: createParams('notfound') })

    expect(response.headers.get('location')).toBe(
      'https://localhost:3000/tools/url-shortener?error=notfound'
    )
  })

  it('should continue redirect even if analytics tracking fails', async () => {
    const mockFrom = vi.mocked(supabase.from)
    mockFrom.mockImplementation((table) => {
      if (table === 'shortened_urls') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { original_url: 'https://example.com', is_active: true },
                error: null,
              }),
            }),
          }),
        } as never
      }
      if (table === 'url_analytics') {
        return {
          insert: vi
            .fn()
            .mockReturnValue(Promise.resolve({ error: { message: 'Analytics insert failed' } })),
        } as never
      }
      return {} as never
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const request = createRequest('abc123')
    const response = await GET(request, { params: createParams('abc123') })

    // Should still redirect successfully
    expect(response.status).toBe(302)
    // NextResponse.redirect normalizes URLs - may add trailing slash
    expect(response.headers.get('location')).toMatch(/^https:\/\/example\.com\/?$/)

    consoleSpy.mockRestore()
  })

  it('should handle params promise correctly', async () => {
    setupMocks({
      data: { original_url: 'https://example.com/test', is_active: true },
      error: null,
    })

    const request = createRequest('async-code')
    // Simulate async params resolution
    const asyncParams = new Promise<{ code: string }>((resolve) => {
      setTimeout(() => resolve({ code: 'async-code' }), 10)
    })

    const response = await GET(request, { params: asyncParams })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://example.com/test')
  })
})
