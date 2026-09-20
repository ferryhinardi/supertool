import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.warn('Supabase environment variables are not set')
}

// Use a syntactically valid placeholder when env is missing so the app can still
// boot for local/tooling use. Auth and data features that need Supabase will fail
// at call time rather than crashing every page during module evaluation.
const clientUrl = hasSupabaseConfig ? supabaseUrl : 'https://placeholder.supabase.co'
const clientKey = hasSupabaseConfig
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase: SupabaseClient = createClient(clientUrl, clientKey)
export const isSupabaseConfigured = hasSupabaseConfig
