import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/auth/auth-types'
import { supabase } from '@/lib/auth/supabaseClient'

function metadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

// Mirrors public.handle_new_user() so accounts created before that trigger existed
// still get a profile row.
export function buildProfileInsert(user: User) {
  const metadata = user.user_metadata ?? {}
  const email = user.email ?? ''
  const provider = metadataString(user.app_metadata ?? {}, 'provider') ?? 'email'

  return {
    id: user.id,
    email,
    display_name:
      metadataString(metadata, 'full_name') ??
      metadataString(metadata, 'name') ??
      (email ? email.split('@')[0] : null),
    avatar_url: metadataString(metadata, 'avatar_url'),
    provider,
  }
}

const UNIQUE_VIOLATION = '23505'

const pendingProfiles = new Map<string, Promise<UserProfile | null>>()

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return (data as UserProfile | null) ?? null
}

async function loadOrCreateProfile(user: User): Promise<UserProfile | null> {
  const existing = await fetchProfile(user.id)
  if (existing) return existing

  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert(buildProfileInsert(user))
    .select('*')
    .maybeSingle()

  // Another tab or the signup trigger created the row first.
  if (insertError?.code === UNIQUE_VIOLATION) return fetchProfile(user.id)
  if (insertError) throw insertError
  return (created as UserProfile | null) ?? null
}

// getSession() and onAuthStateChange both fire on sign-in; share one request so
// the second caller does not race the first insert.
export function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const pending = pendingProfiles.get(user.id)
  if (pending) return pending

  const request = loadOrCreateProfile(user).finally(() => {
    pendingProfiles.delete(user.id)
  })
  pendingProfiles.set(user.id, request)
  return request
}
