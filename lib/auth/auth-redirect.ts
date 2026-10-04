import { supabase } from '@/lib/auth/supabaseClient'

export function safeNextPath(next: string | null | undefined): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  if (next.includes('://') || next.includes('\\')) return '/'
  return next
}

export function getOAuthRedirectUrl(origin: string, nextPath?: string): string {
  const callback = new URL('/auth/callback', origin)
  const next = nextPath ? safeNextPath(nextPath) : null
  if (next && next !== '/') callback.searchParams.set('next', next)
  return callback.toString()
}

export function readImplicitSessionFromHash(hash: string): {
  access_token: string
  refresh_token: string
} | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw.includes('access_token=')) return null
  const params = new URLSearchParams(raw)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) return null
  return { access_token: accessToken, refresh_token: refreshToken }
}

export function stripAuthCredentialsFromUrl(): void {
  if (typeof window === 'undefined') return
  const { hash, pathname, search } = window.location
  const hasCredential =
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    hash.includes('provider_token')
  if (!hasCredential) return
  window.history.replaceState(window.history.state, '', `${pathname}${search}`)
}

export async function recoverSessionFromUrlHash(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const tokens = readImplicitSessionFromHash(window.location.hash)
  stripAuthCredentialsFromUrl()
  if (!tokens) return false
  const { error } = await supabase.auth.setSession(tokens)
  return !error
}
