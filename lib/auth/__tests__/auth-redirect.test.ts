import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import {
  completeAuthFromUrl,
  getOAuthRedirectUrl,
  readImplicitSessionFromHash,
  safeNextPath,
} from '../auth-redirect'

describe('safeNextPath', () => {
  it('keeps an in-app path', () => {
    expect(safeNextPath('/dashboard')).toBe('/dashboard')
    expect(safeNextPath('/auth/reset-password')).toBe('/auth/reset-password')
  })

  it('rejects external and protocol-relative targets', () => {
    expect(safeNextPath(null)).toBe('/')
    expect(safeNextPath('https://evil.example')).toBe('/')
    expect(safeNextPath('//evil.example')).toBe('/')
    expect(safeNextPath('/\\evil.example')).toBe('/')
  })
})

describe('getOAuthRedirectUrl', () => {
  it('points OAuth back at the current origin callback', () => {
    expect(getOAuthRedirectUrl('https://supertool.id')).toBe('https://supertool.id/auth/callback')
    expect(getOAuthRedirectUrl('http://localhost:3000', '/auth/reset-password')).toBe(
      'http://localhost:3000/auth/callback?next=%2Fauth%2Freset-password'
    )
  })

  it('drops an unsafe next path', () => {
    expect(getOAuthRedirectUrl('https://supertool.id', 'https://evil.example')).toBe(
      'https://supertool.id/auth/callback'
    )
  })
})

describe('readImplicitSessionFromHash', () => {
  it('reads the session pair and ignores a hash without a refresh token', () => {
    expect(
      readImplicitSessionFromHash('#access_token=access-token&refresh_token=refresh-token')
    ).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    })
    expect(readImplicitSessionFromHash('#access_token=access-token')).toBeNull()
    expect(readImplicitSessionFromHash('')).toBeNull()
  })
})

describe('completeAuthFromUrl', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    vi.mocked(supabase.auth.exchangeCodeForSession).mockReset()
    vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>)
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
  })

  it('exchanges a code left on the site root and removes it from the url', async () => {
    window.history.replaceState(null, '', '/?code=auth-code&foo=1')

    await expect(completeAuthFromUrl()).resolves.toBe(true)

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('auth-code')
    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?foo=1')
    expect(window.location.href).not.toContain('code=')
  })
})
