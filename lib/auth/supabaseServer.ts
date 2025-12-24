import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Supabase client with service role key for server-side operations
 * This client bypasses RLS policies and should ONLY be used in secure server contexts
 *
 * Use cases:
 * - Webhook handlers that need to write to database
 * - Admin operations
 * - Server-side API routes that need full database access
 *
 * WARNING: Never expose this client or the service role key to the client-side
 *
 * Note: This is lazily initialized to allow builds to succeed without service role key.
 * The key is only required at runtime when the client is actually used.
 */
let _supabaseServerClient: SupabaseClient | null = null

export const getSupabaseServer = (): SupabaseClient => {
  if (!_supabaseServerClient) {
    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    }

    if (!supabaseServiceRoleKey) {
      throw new Error(
        'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
          'This is required for server-side operations like webhook handlers.'
      )
    }

    _supabaseServerClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _supabaseServerClient
}

// Export a getter-based client for backward compatibility
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseServer()[prop as keyof SupabaseClient]
  },
})
