import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  provider: string
  preferences: Record<string, unknown>
  usage: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authView: 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password'
}

export interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (isLoading: boolean) => void
  openAuthModal: (view?: AuthState['authView']) => void
  closeAuthModal: () => void
  setAuthView: (view: AuthState['authView']) => void
  signOut: () => Promise<void>
}
