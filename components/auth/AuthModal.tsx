'use client'

import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { XIcon } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { css } from '@/styled-system/css'
import { hstack, vstack } from '@/styled-system/patterns'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authView, setAuthView } = useAuthStore()

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={closeAuthModal}>
      <Portal>
        <Dialog.Backdrop
          className={css({
            position: 'fixed',
            inset: 0,
            bg: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
            backdropFilter: 'blur(4px)',
          })}
        />
        <Dialog.Positioner
          className={css({
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          })}
        >
          <Dialog.Content
            className={css({
              bg: 'gray.900',
              rounded: 'lg',
              shadow: 'xl',
              border: '2px solid',
              borderColor: 'purple.500/30',
              maxW: 'md',
              w: 'full',
              p: 6,
              position: 'relative',
            })}
          >
            {/* Close Button */}
            <Dialog.CloseTrigger
              className={css({
                position: 'absolute',
                top: 4,
                right: 4,
                p: 2,
                rounded: 'md',
                cursor: 'pointer',
                color: 'gray.400',
                _hover: { bg: 'gray.800', color: 'white' },
                transition: 'all 0.2s',
              })}
            >
              <XIcon className={css({ w: 5, h: 5 })} />
            </Dialog.CloseTrigger>

            {/* Modal Content */}
            <div className={vstack({ gap: 4, alignItems: 'stretch', mt: 2 })}>
              <Dialog.Title
                className={css({
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: 'white',
                })}
              >
                {authView === 'sign-in' && 'Sign In'}
                {authView === 'sign-up' && 'Create Account'}
                {authView === 'forgot-password' && 'Reset Password'}
                {authView === 'reset-password' && 'New Password'}
              </Dialog.Title>

              <Dialog.Description
                className={css({
                  fontSize: 'sm',
                  color: 'gray.400',
                  textAlign: 'center',
                })}
              >
                {authView === 'sign-in' && 'Sign in to access your saved tools and preferences'}
                {authView === 'sign-up' &&
                  'Create an account to save your work and sync across devices'}
                {authView === 'forgot-password' &&
                  'Enter your email to receive a password reset link'}
                {authView === 'reset-password' && 'Enter your new password'}
              </Dialog.Description>

              {/* Auth Forms */}
              {authView === 'sign-in' && <LoginForm />}
              {authView === 'sign-up' && <SignupForm />}
              {authView === 'forgot-password' && <ForgotPasswordForm />}

              {/* Toggle Links */}
              {authView === 'sign-in' && (
                <div
                  className={vstack({
                    gap: 2,
                    fontSize: 'sm',
                    textAlign: 'center',
                  })}
                >
                  <button
                    type="button"
                    onClick={() => setAuthView('forgot-password')}
                    className={css({
                      color: 'purple.400',
                      fontWeight: 'medium',
                      _hover: { textDecoration: 'underline', color: 'purple.300' },
                    })}
                  >
                    Forgot password?
                  </button>
                  <div className={hstack({ gap: 1, justifyContent: 'center' })}>
                    <span className={css({ color: 'gray.400' })}>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={() => setAuthView('sign-up')}
                      className={css({
                        color: 'purple.400',
                        fontWeight: 'semibold',
                        _hover: { textDecoration: 'underline', color: 'purple.300' },
                      })}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              )}

              {authView === 'sign-up' && (
                <div
                  className={css({
                    fontSize: 'sm',
                    textAlign: 'center',
                    color: 'gray.400',
                  })}
                >
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('sign-in')}
                    className={css({
                      color: 'purple.400',
                      fontWeight: 'semibold',
                      _hover: { textDecoration: 'underline', color: 'purple.300' },
                    })}
                  >
                    Sign in
                  </button>
                </div>
              )}

              {authView === 'forgot-password' && (
                <div
                  className={css({
                    fontSize: 'sm',
                    textAlign: 'center',
                    color: 'gray.400',
                  })}
                >
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('sign-in')}
                    className={css({
                      color: 'purple.400',
                      fontWeight: 'semibold',
                      _hover: { textDecoration: 'underline', color: 'purple.300' },
                    })}
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
