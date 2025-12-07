import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../auth-store'
import { supabase } from '../supabaseClient'

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

describe('auth-store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const { setUser, setProfile, setLoading, closeAuthModal, setAuthView } = useAuthStore.getState()
    setUser(null)
    setProfile(null)
    setLoading(true)
    closeAuthModal()
    setAuthView('sign-in')
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.profile).toBeNull()
      expect(state.isLoading).toBe(true)
      expect(state.isAuthModalOpen).toBe(false)
      expect(state.authView).toBe('sign-in')
    })
  })

  describe('setUser', () => {
    it('should update user state', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const { setUser } = useAuthStore.getState()

      setUser(mockUser as any)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
    })

    it('should set user to null', () => {
      const { setUser } = useAuthStore.getState()

      setUser({ id: '123' } as any)
      expect(useAuthStore.getState().user).not.toBeNull()

      setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setProfile', () => {
    it('should update profile state', () => {
      const mockProfile = {
        id: '123',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      }
      const { setProfile } = useAuthStore.getState()

      setProfile(mockProfile as any)

      const state = useAuthStore.getState()
      expect(state.profile).toEqual(mockProfile)
    })

    it('should set profile to null', () => {
      const { setProfile } = useAuthStore.getState()

      setProfile({ id: '123' } as any)
      expect(useAuthStore.getState().profile).not.toBeNull()

      setProfile(null)
      expect(useAuthStore.getState().profile).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should update loading state to false', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(false)

      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should update loading state to true', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(false)
      setLoading(true)

      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(true)
    })

    it('should toggle loading state multiple times', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)

      setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('openAuthModal', () => {
    it('should open modal with default sign-in view', () => {
      const { openAuthModal } = useAuthStore.getState()

      openAuthModal()

      const state = useAuthStore.getState()
      expect(state.isAuthModalOpen).toBe(true)
      expect(state.authView).toBe('sign-in')
    })

    it('should open modal with sign-up view', () => {
      const { openAuthModal } = useAuthStore.getState()

      openAuthModal('sign-up')

      const state = useAuthStore.getState()
      expect(state.isAuthModalOpen).toBe(true)
      expect(state.authView).toBe('sign-up')
    })

    it('should open modal with forgot-password view', () => {
      const { openAuthModal } = useAuthStore.getState()

      openAuthModal('forgot-password')

      const state = useAuthStore.getState()
      expect(state.isAuthModalOpen).toBe(true)
      expect(state.authView).toBe('forgot-password')
    })

    it('should change view when opening modal multiple times', () => {
      const { openAuthModal } = useAuthStore.getState()

      openAuthModal('sign-in')
      expect(useAuthStore.getState().authView).toBe('sign-in')

      openAuthModal('sign-up')
      expect(useAuthStore.getState().authView).toBe('sign-up')
    })
  })

  describe('closeAuthModal', () => {
    it('should close the modal', () => {
      const { openAuthModal, closeAuthModal } = useAuthStore.getState()

      openAuthModal()
      expect(useAuthStore.getState().isAuthModalOpen).toBe(true)

      closeAuthModal()
      expect(useAuthStore.getState().isAuthModalOpen).toBe(false)
    })

    it('should keep the auth view when closing', () => {
      const { openAuthModal, closeAuthModal } = useAuthStore.getState()

      openAuthModal('sign-up')
      closeAuthModal()

      const state = useAuthStore.getState()
      expect(state.isAuthModalOpen).toBe(false)
      expect(state.authView).toBe('sign-up')
    })
  })

  describe('setAuthView', () => {
    it('should update auth view to sign-in', () => {
      const { setAuthView } = useAuthStore.getState()

      setAuthView('sign-in')

      expect(useAuthStore.getState().authView).toBe('sign-in')
    })

    it('should update auth view to sign-up', () => {
      const { setAuthView } = useAuthStore.getState()

      setAuthView('sign-up')

      expect(useAuthStore.getState().authView).toBe('sign-up')
    })

    it('should update auth view to forgot-password', () => {
      const { setAuthView } = useAuthStore.getState()

      setAuthView('forgot-password')

      expect(useAuthStore.getState().authView).toBe('forgot-password')
    })

    it('should change view multiple times', () => {
      const { setAuthView } = useAuthStore.getState()

      setAuthView('sign-up')
      expect(useAuthStore.getState().authView).toBe('sign-up')

      setAuthView('forgot-password')
      expect(useAuthStore.getState().authView).toBe('forgot-password')

      setAuthView('sign-in')
      expect(useAuthStore.getState().authView).toBe('sign-in')
    })
  })

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      const { signOut } = useAuthStore.getState()

      await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    })

    it('should clear user and profile on sign out', async () => {
      const { setUser, setProfile, signOut } = useAuthStore.getState()

      // Set user and profile
      setUser({ id: '123', email: 'test@example.com' } as any)
      setProfile({ id: '123', username: 'testuser' } as any)

      expect(useAuthStore.getState().user).not.toBeNull()
      expect(useAuthStore.getState().profile).not.toBeNull()

      // Sign out
      await signOut()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.profile).toBeNull()
    })

    it('should handle sign out errors gracefully', async () => {
      const mockError = new Error('Sign out failed')
      vi.mocked(supabase.auth.signOut).mockRejectedValueOnce(mockError)

      const { signOut } = useAuthStore.getState()

      await expect(signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('state combinations', () => {
    it('should handle authenticated user with profile', () => {
      const { setUser, setProfile, setLoading } = useAuthStore.getState()

      const mockUser = { id: '123', email: 'test@example.com' }
      const mockProfile = { id: '123', username: 'testuser' }

      setUser(mockUser as any)
      setProfile(mockProfile as any)
      setLoading(false)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.profile).toEqual(mockProfile)
      expect(state.isLoading).toBe(false)
    })

    it('should handle modal open with authenticated user', () => {
      const { setUser, openAuthModal } = useAuthStore.getState()

      setUser({ id: '123' } as any)
      openAuthModal('sign-in')

      const state = useAuthStore.getState()
      expect(state.user).not.toBeNull()
      expect(state.isAuthModalOpen).toBe(true)
    })

    it('should maintain state independence between properties', () => {
      const { setUser, setLoading, openAuthModal } = useAuthStore.getState()

      setUser({ id: '123' } as any)
      setLoading(false)
      openAuthModal('sign-up')

      const state = useAuthStore.getState()
      expect(state.user?.id).toBe('123')
      expect(state.isLoading).toBe(false)
      expect(state.isAuthModalOpen).toBe(true)
      expect(state.authView).toBe('sign-up')
    })
  })
})
