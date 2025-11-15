import { create } from 'zustand'
import type { AuthStore } from './auth-types'
import { supabase } from './supabaseClient'

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthModalOpen: false,
  authView: 'sign-in',

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  openAuthModal: (view = 'sign-in') => set({ isAuthModalOpen: true, authView: view }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setAuthView: (authView) => set({ authView }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
