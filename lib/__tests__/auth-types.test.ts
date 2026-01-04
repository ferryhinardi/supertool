import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import type { AuthState, AuthStore, UserProfile } from '../auth/auth-types'

describe('auth-types', () => {
  describe('UserProfile', () => {
    it('should create valid user profile', () => {
      const profile: UserProfile = {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        provider: 'google',
        preferences: { theme: 'dark' },
        usage: { api_calls: 100 },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.id).toBe('user-123')
      expect(profile.email).toBe('user@example.com')
      expect(profile.provider).toBe('google')
    })

    it('should allow null for optional fields', () => {
      const profile: UserProfile = {
        id: 'user-123',
        email: 'user@example.com',
        display_name: null,
        avatar_url: null,
        provider: 'email',
        preferences: {},
        usage: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.display_name).toBeNull()
      expect(profile.avatar_url).toBeNull()
    })

    it('should store preferences as record', () => {
      const profile: UserProfile = {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'John',
        avatar_url: null,
        provider: 'google',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
        },
        usage: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.preferences.theme).toBe('dark')
      expect(profile.preferences.language).toBe('en')
    })

    it('should store usage data as record', () => {
      const profile: UserProfile = {
        id: 'user-123',
        email: 'user@example.com',
        display_name: 'John',
        avatar_url: null,
        provider: 'google',
        preferences: {},
        usage: {
          api_calls: 150,
          tools_used: 25,
          last_activity: '2024-01-15',
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(profile.usage.api_calls).toBe(150)
      expect(profile.usage.tools_used).toBe(25)
    })
  })

  describe('AuthState', () => {
    it('should create valid auth state with user', () => {
      const state: AuthState = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        } as User,
        profile: null,
        isLoading: false,
        isAuthModalOpen: false,
        authView: 'sign-in',
      }

      expect(state.user).not.toBeNull()
      expect(state.isLoading).toBe(false)
    })

    it('should create valid auth state without user', () => {
      const state: AuthState = {
        user: null,
        profile: null,
        isLoading: true,
        isAuthModalOpen: false,
        authView: 'sign-in',
      }

      expect(state.user).toBeNull()
      expect(state.profile).toBeNull()
      expect(state.isLoading).toBe(true)
    })

    it('should support all auth views', () => {
      const signIn: AuthState = {
        user: null,
        profile: null,
        isLoading: false,
        isAuthModalOpen: true,
        authView: 'sign-in',
      }

      const signUp: AuthState = { ...signIn, authView: 'sign-up' }
      const forgotPassword: AuthState = { ...signIn, authView: 'forgot-password' }
      const resetPassword: AuthState = { ...signIn, authView: 'reset-password' }

      expect(signIn.authView).toBe('sign-in')
      expect(signUp.authView).toBe('sign-up')
      expect(forgotPassword.authView).toBe('forgot-password')
      expect(resetPassword.authView).toBe('reset-password')
    })

    it('should track modal open state', () => {
      const openState: AuthState = {
        user: null,
        profile: null,
        isLoading: false,
        isAuthModalOpen: true,
        authView: 'sign-in',
      }

      const closedState: AuthState = { ...openState, isAuthModalOpen: false }

      expect(openState.isAuthModalOpen).toBe(true)
      expect(closedState.isAuthModalOpen).toBe(false)
    })
  })

  describe('AuthStore', () => {
    it('should extend AuthState with methods', () => {
      const mockStore: AuthStore = {
        user: null,
        profile: null,
        isLoading: false,
        isAuthModalOpen: false,
        authView: 'sign-in',
        setUser: () => {},
        setProfile: () => {},
        setLoading: () => {},
        openAuthModal: () => {},
        closeAuthModal: () => {},
        setAuthView: () => {},
        signOut: async () => {},
      }

      expect(mockStore.setUser).toBeDefined()
      expect(mockStore.setProfile).toBeDefined()
      expect(mockStore.signOut).toBeDefined()
    })

    it('should have setUser method', () => {
      const setUser = (user: User | null) => user
      const store: Partial<AuthStore> = {
        setUser,
      }

      expect(typeof store.setUser).toBe('function')
    })

    it('should have setProfile method', () => {
      const setProfile = (profile: UserProfile | null) => profile
      const store: Partial<AuthStore> = {
        setProfile,
      }

      expect(typeof store.setProfile).toBe('function')
    })

    it('should have setLoading method', () => {
      const setLoading = (loading: boolean) => loading
      const store: Partial<AuthStore> = {
        setLoading,
      }

      expect(typeof store.setLoading).toBe('function')
    })

    it('should have openAuthModal method with optional view', () => {
      const openAuthModal = (view?: AuthState['authView']) => view
      const store: Partial<AuthStore> = {
        openAuthModal,
      }

      expect(typeof store.openAuthModal).toBe('function')
    })

    it('should have closeAuthModal method', () => {
      const closeAuthModal = () => {}
      const store: Partial<AuthStore> = {
        closeAuthModal,
      }

      expect(typeof store.closeAuthModal).toBe('function')
    })

    it('should have setAuthView method', () => {
      const setAuthView = (view: AuthState['authView']) => view
      const store: Partial<AuthStore> = {
        setAuthView,
      }

      expect(typeof store.setAuthView).toBe('function')
    })

    it('should have async signOut method', () => {
      const signOut = async () => {
        return Promise.resolve()
      }
      const store: Partial<AuthStore> = {
        signOut,
      }

      expect(typeof store.signOut).toBe('function')
    })
  })

  describe('Type constraints', () => {
    it('should enforce authView values', () => {
      const validViews: AuthState['authView'][] = [
        'sign-in',
        'sign-up',
        'forgot-password',
        'reset-password',
      ]

      expect(validViews).toHaveLength(4)
      expect(validViews).toContain('sign-in')
      expect(validViews).toContain('sign-up')
    })

    it('should require all AuthState fields', () => {
      const state: AuthState = {
        user: null,
        profile: null,
        isLoading: false,
        isAuthModalOpen: false,
        authView: 'sign-in',
      }

      expect(Object.keys(state)).toEqual([
        'user',
        'profile',
        'isLoading',
        'isAuthModalOpen',
        'authView',
      ])
    })

    it('should require all UserProfile fields', () => {
      const profile: UserProfile = {
        id: '1',
        email: 'test@test.com',
        display_name: null,
        avatar_url: null,
        provider: 'email',
        preferences: {},
        usage: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(Object.keys(profile).sort()).toEqual(
        [
          'avatar_url',
          'created_at',
          'display_name',
          'email',
          'id',
          'preferences',
          'provider',
          'updated_at',
          'usage',
        ].sort()
      )
    })
  })
})
