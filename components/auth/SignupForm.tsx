'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabaseClient'
import { css } from '@/styled-system/css'
import { vstack } from '@/styled-system/patterns'
import { GoogleButton } from './GoogleButton'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { closeAuthModal } = useAuthStore()

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast.success('Account created! Please check your email to verify your account.')
      closeAuthModal()
    } catch (error) {
      console.error('Sign-up error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
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
          color: 'gray.500',
        })}
      >
        <div className={css({ flex: 1, h: '1px', bg: 'gray.300' })} />
        <span>or</span>
        <div className={css({ flex: 1, h: '1px', bg: 'gray.300' })} />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailSignup} className={vstack({ gap: 3 })}>
        <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
          <label htmlFor="signup-email" className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={css({
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'md',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.200',
              },
            })}
          />
        </div>

        <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
          <label
            htmlFor="signup-password"
            className={css({ fontSize: 'sm', fontWeight: 'medium' })}
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className={css({
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'md',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.200',
              },
            })}
          />
        </div>

        <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
          <label
            htmlFor="confirm-password"
            className={css({ fontSize: 'sm', fontWeight: 'medium' })}
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className={css({
              px: 3,
              py: 2,
              border: '1px solid',
              borderColor: 'gray.300',
              rounded: 'md',
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.200',
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
            bg: 'blue.600',
            color: 'white',
            fontWeight: 'medium',
            rounded: 'lg',
            cursor: 'pointer',
            transition: 'background 0.2s',
            _hover: { bg: 'blue.700' },
            _disabled: {
              opacity: 0.6,
              cursor: 'not-allowed',
            },
          })}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
