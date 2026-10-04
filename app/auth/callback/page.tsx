'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { recoverSessionFromUrlHash, safeNextPath } from '@/lib/auth/auth-redirect'
import { supabase } from '@/lib/auth/supabaseClient'
import { css } from '@/styled-system/css'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Signing you in…')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      const next = safeNextPath(searchParams.get('next'))
      const oauthError = searchParams.get('error')

      if (oauthError) {
        if (!cancelled) router.replace(`/auth/error?error=${encodeURIComponent(oauthError)}`)
        return
      }

      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          setMessage('Sign-in could not be completed.')
          router.replace('/auth/error')
          return
        }
        router.replace(next)
        return
      }

      const recovered = await recoverSessionFromUrlHash()
      if (cancelled) return
      if (recovered) {
        router.replace(next)
        return
      }

      setMessage('Sign-in could not be completed.')
      router.replace('/')
    }

    void completeSignIn()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <main
      className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'brand.canvas',
        color: 'brand.ink',
        px: '4',
      })}
    >
      <p className={css({ fontSize: 'sm', color: 'brand.muted' })}>{message}</p>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          className={css({
            minH: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bg: 'brand.canvas',
            color: 'brand.ink',
          })}
        >
          <p className={css({ fontSize: 'sm', color: 'brand.muted' })}>Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
