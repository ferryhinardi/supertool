import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import AuthCallbackPage from '../page'

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}))

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    replace.mockReset()
    for (const key of [...searchParams.keys()]) {
      searchParams.delete(key)
    }
    window.history.replaceState(null, '', '/auth/callback')
    vi.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    })
    vi.mocked(supabase.auth.setSession).mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    })
  })

  it('exchanges the PKCE code and returns to the next path', async () => {
    searchParams.set('code', 'test-auth-code')
    searchParams.set('next', '/dashboard')

    render(<AuthCallbackPage />)

    expect(screen.getByText('Signing you in…')).toBeInTheDocument()
    await waitFor(() => {
      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-auth-code')
    })
    expect(replace).toHaveBeenCalledWith('/dashboard')
  })

  it('ignores an external next path', async () => {
    searchParams.set('code', 'test-auth-code')
    searchParams.set('next', 'https://evil.example')

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/')
    })
  })

  it('sends provider errors to the auth error page', async () => {
    searchParams.set('error', 'access_denied')

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/auth/error?error=access_denied')
    })
    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('stores a hash session and removes the credentials from the url', async () => {
    window.history.replaceState(
      null,
      '',
      '/auth/callback#access_token=access-token&refresh_token=refresh-token&provider_token=provider-token'
    )

    render(<AuthCallbackPage />)

    await waitFor(() => {
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      })
    })
    expect(window.location.hash).toBe('')
    expect(window.location.href).not.toContain('provider_token')
    expect(replace).toHaveBeenCalledWith('/')
  })
})
