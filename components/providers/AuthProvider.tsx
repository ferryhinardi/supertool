'use client'

import type { Session, User } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { completeAuthFromUrl } from '@/lib/auth/auth-redirect'
import { useAuthStore } from '@/lib/auth/auth-store'
import { supabase } from '@/lib/auth/supabaseClient'
import { ensureUserProfile } from '@/lib/auth/user-profile'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    async function handleSessionChange(session: Session | null) {
      const user: User | null = session?.user ?? null
      setUser(user)

      if (user) {
        try {
          setProfile(await ensureUserProfile(user))
        } catch (error) {
          console.warn(
            'Failed to load user profile:',
            error instanceof Error ? error.message : error
          )
          setProfile(null)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    // OAuth can return on /auth/callback or on the Site URL root. Finish either
    // shape, then drop the code or hash from the address bar.
    void completeAuthFromUrl().finally(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        handleSessionChange(session)
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading])

  return <>{children}</>
}
