import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock next/headers cookies
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

// Mock @supabase/ssr
const mockExchangeCodeForSession = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}))

import { GET } from '../route'

describe('Auth Callback Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('should redirect to next URL on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-auth-code&next=/dashboard'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-auth-code')
  })

  it('should redirect to home if next URL is not provided', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-auth-code'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('should redirect to home if code is missing', async () => {
    const request = new Request(
      'http://localhost:3000/auth/callback?next=/dashboard'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('should redirect to home if SUPABASE_URL is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-auth-code&next=/dashboard'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('should redirect to home if SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-auth-code&next=/dashboard'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('should redirect to home if code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: 'Invalid code' },
    })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=invalid-code&next=/dashboard'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('should handle cookies correctly during session exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
    mockCookieStore.get.mockReturnValue({ value: 'test-cookie-value' })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=test-auth-code'
    ) as unknown as NextRequest

    await GET(request)

    // Verify createServerClient was called (through the mock)
    const { createServerClient } = await import('@supabase/ssr')
    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      })
    )
  })

  it('should preserve URL origin during redirects', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const request = new Request(
      'https://supertool.io/auth/callback?code=test-code&next=/tools'
    ) as unknown as NextRequest

    const response = await GET(request)

    expect(response.headers.get('location')).toBe('https://supertool.io/tools')
  })
})
