'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/auth/supabaseClient'
import { css } from '@/styled-system/css'
import { vstack } from '@/styled-system/patterns'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div
        className={vstack({
          gap: 4,
          alignItems: 'center',
          textAlign: 'center',
          p: 6,
        })}
      >
        <div
          className={css({
            w: 16,
            h: 16,
            rounded: 'full',
            bg: 'green.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <svg
            className={css({ w: 8, h: 8, color: 'green.600' })}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <title>Check</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className={vstack({ gap: 2 })}>
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Check your email</h3>
          <p className={css({ fontSize: 'sm', color: 'gray.600' })}>
            We've sent a password reset link to{' '}
            <span className={css({ fontWeight: 'medium' })}>{email}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handlePasswordReset} className={vstack({ gap: 4, alignItems: 'stretch' })}>
      <div className={vstack({ gap: 2, alignItems: 'stretch' })}>
        <label
          htmlFor="reset-email"
          className={css({
            fontSize: 'sm',
            fontWeight: 'medium',
            color: { base: 'gray.800', _dark: 'gray.100' },
          })}
        >
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className={css({
            px: 3,
            py: 2,
            border: '1px solid',
            borderColor: { base: 'gray.300', _dark: 'gray.700' },
            bg: { base: 'white', _dark: 'gray.900' },
            color: { base: 'gray.900', _dark: 'gray.100' },
            rounded: 'md',
            _focus: {
              outline: 'none',
              borderColor: 'blue.500',
              ring: '2px',
              ringColor: { base: 'blue.200', _dark: 'blue.800' },
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
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  )
}
