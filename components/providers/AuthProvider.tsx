'use client'

import type { Session, User } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import type { UserProfile } from '@/lib/auth/auth-types'
import { supabase } from '@/lib/auth/supabaseClient'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    async function handleSessionChange(session: Session | null) {
      const user: User | null = session?.user ?? null
      setUser(user)

      if (user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profile as UserProfile | null)
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session)
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
