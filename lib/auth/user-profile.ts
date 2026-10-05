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

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  if (data) return data as UserProfile

  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert(buildProfileInsert(user))
    .select('*')
    .maybeSingle()

  if (insertError) throw insertError
  return (created as UserProfile | null) ?? null
}
