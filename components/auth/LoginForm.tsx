'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabaseClient'
import { css } from '@/styled-system/css'
import { vstack } from '@/styled-system/patterns'
import { GoogleButton } from './GoogleButton'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { closeAuthModal } = useAuthStore()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      closeAuthModal()
    } catch (error) {
      console.error('Sign-in error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={vstack({ gap: 4, alignItems: 'stretch' })}>
      {/* Google Sign In */}
      <GoogleButton />

      {/* Divider */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'sm',
          color: 'gray.400',
        })}
      >
        <div className={css({ flex: 1, h: '1px', bg: 'gray.700' })} />
        <span>or</span>
        <div className={css({ flex: 1, h: '1px', bg: 'gray.700' })} />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailLogin} className={vstack({ gap: 3 })}>
        <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
          <label
            htmlFor="email"
            className={css({
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.200',
            })}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={css({
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.800',
              color: 'gray.100',
              rounded: 'md',
              _focus: {
                outline: 'none',
                borderColor: 'purple.500',
                ring: '2px',
                ringColor: 'purple.500/30',
              },
            })}
          />
        </div>

        <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
          <label
            htmlFor="password"
            className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.200' })}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={css({
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'gray.700',
              bg: 'gray.800',
              color: 'gray.100',
              rounded: 'md',
              _focus: {
                outline: 'none',
                borderColor: 'purple.500',
                ring: '2px',
                ringColor: 'purple.500/30',
              },
            })}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={css({
            w: 'full',
            px: 4,
            py: 3,
            bg: 'purple.600',
            color: 'white',
            fontWeight: 'semibold',
            rounded: 'lg',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'purple.500',
            shadow: 'md',
            transition: 'all 0.2s',
            _hover: { bg: 'purple.700', shadow: 'lg' },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          })}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
