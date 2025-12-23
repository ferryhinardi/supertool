# Authentication Implementation Plan - Google Sign-In & Email Auth

**Document Version:** 1.0  
**Created:** November 15, 2025  
**Status:** Planning Phase  
**Tech Stack:** Next.js 16, Supabase Auth, React 19

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Phase 1: Supabase Auth Setup](#phase-1-supabase-auth-setup)
4. [Phase 2: Auth Components](#phase-2-auth-components)
5. [Phase 3: Auth Context & Hooks](#phase-3-auth-context--hooks)
6. [Phase 4: Protected Routes](#phase-4-protected-routes)
7. [Phase 5: User Profile](#phase-5-user-profile)
8. [Phase 6: Testing](#phase-6-testing)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Goals
- ✅ Google OAuth Sign-In (One-click authentication)
- ✅ Email/Password Authentication (Traditional method)
- ✅ Email Verification
- ✅ Password Reset Flow
- ✅ Session Management
- ✅ Protected Routes
- ✅ User Profile Management

### User Benefits
- **Personalization**: Save tool preferences, history, and favorites
- **Sync Across Devices**: Access saved presets from any device
- **Enhanced Features**: Unlock premium tools and features
- **Data Privacy**: Secure, encrypted user data storage

### Technical Stack
- **Auth Provider**: Supabase Auth
- **OAuth Provider**: Google Identity Platform
- **Session Management**: Supabase client-side sessions
- **State Management**: React Context + Custom Hooks
- **UI Framework**: Ark UI + Panda CSS (consistent with existing)

---

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Landing Page                            │
│  • No auth required for basic tool usage                   │
│  • "Sign In" button in Sidebar/Header                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Auth Modal/Page                           │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Google Sign-In  │  │  Email Sign-In   │               │
│  │  (OAuth)         │  │  (Email/Pass)    │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
└───────────┼────────────────────┼─────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────────────────────────────────────────────────┐
│                    Supabase Auth                              │
│  • Validate credentials                                       │
│  • Create session                                             │
│  • Generate JWT token                                         │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                  Authenticated State                           │
│  • User object available globally                             │
│  • Session stored in localStorage                             │
│  • Auto-refresh token                                         │
│  • Protected routes accessible                                │
└────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
// User Profile (stored in Supabase)
interface UserProfile {
  id: string                    // UUID from Supabase Auth
  email: string
  display_name: string | null
  avatar_url: string | null
  provider: 'google' | 'email'
  created_at: string
  updated_at: string
  
  // User preferences
  preferences: {
    theme?: 'dark' | 'light' | 'system'
    default_tools?: string[]
    notifications_enabled?: boolean
  }
  
  // Usage tracking
  usage: {
    tools_used: number
    last_login: string
    subscription_tier?: 'free' | 'pro' | 'enterprise'
  }
}

// Session
interface Session {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}
```

---

## Phase 1: Supabase Auth Setup

### 1.1 Configure Supabase Dashboard

**Steps:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
   - Enable email confirmations (optional)
   - Set up email templates
3. Enable **Google** provider
   - Get Google OAuth credentials
   - Configure authorized domains

### 1.2 Get Google OAuth Credentials

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (development)
     - `https://supertool.id` (production)
   - Authorized redirect URIs:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret
6. Add to Supabase → Authentication → Google provider

### 1.3 Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.4 Create Database Tables

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  preferences JSONB DEFAULT '{}',
  usage JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_profile_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## Phase 2: Auth Components

### 2.1 Component Structure

```
components/
  auth/
    __tests__/
      AuthModal.test.tsx
      LoginForm.test.tsx
      SignupForm.test.tsx
    AuthModal.tsx              # Main auth modal
    LoginForm.tsx              # Email login form
    SignupForm.tsx             # Email signup form
    GoogleButton.tsx           # Google OAuth button
    ForgotPasswordForm.tsx     # Password reset form
    ResetPasswordForm.tsx      # New password form
    AuthGuard.tsx              # Protected route wrapper
```

### 2.2 AuthModal Component

```typescript
// components/auth/AuthModal.tsx
'use client'

import { Dialog } from '@ark-ui/react'
import { X } from 'lucide-react'
import { useState } from 'react'
import { css } from '@/styled-system/css'
import GoogleButton from './GoogleButton'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

type AuthView = 'login' | 'signup' | 'forgot-password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultView?: AuthView
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  defaultView = 'login' 
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(defaultView)

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop
        className={css({
          position: 'fixed',
          inset: 0,
          bg: 'black/60',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
        })}
      />
      <Dialog.Positioner
        className={css({
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        })}
      >
        <Dialog.Content
          className={css({
            position: 'relative',
            w: 'full',
            maxW: 'md',
            mx: 4,
            bg: 'gray.800',
            border: '1px solid',
            borderColor: 'gray.700',
            rounded: 'xl',
            p: 6,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          })}
        >
          {/* Header */}
          <div className={css({ mb: 6 })}>
            <Dialog.Title
              className={css({
                fontSize: '2xl',
                fontWeight: 'bold',
                color: 'white',
                mb: 2,
              })}
            >
              {view === 'login' && 'Sign in to SuperTool'}
              {view === 'signup' && 'Create your account'}
              {view === 'forgot-password' && 'Reset your password'}
            </Dialog.Title>
            <Dialog.Description
              className={css({
                fontSize: 'sm',
                color: 'gray.400',
              })}
            >
              {view === 'login' && 'Access your saved tools and preferences'}
              {view === 'signup' && 'Start saving your favorite tools and settings'}
              {view === 'forgot-password' && "We'll send you a reset link"}
            </Dialog.Description>
          </div>

          {/* Close button */}
          <Dialog.CloseTrigger
            className={css({
              position: 'absolute',
              top: 4,
              right: 4,
              p: 2,
              color: 'gray.400',
              cursor: 'pointer',
              _hover: { color: 'white' },
            })}
          >
            <X size={20} />
          </Dialog.CloseTrigger>

          {/* Google Sign-In */}
          <GoogleButton onSuccess={onClose} />

          {/* Divider */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              my: 6,
            })}
          >
            <div className={css({ flex: 1, h: '1px', bg: 'gray.700' })} />
            <span className={css({ mx: 4, fontSize: 'sm', color: 'gray.400' })}>
              or continue with email
            </span>
            <div className={css({ flex: 1, h: '1px', bg: 'gray.700' })} />
          </div>

          {/* Forms */}
          {view === 'login' && (
            <LoginForm onSuccess={onClose} onForgotPassword={() => setView('forgot-password')} />
          )}
          {view === 'signup' && <SignupForm onSuccess={onClose} />}
          {view === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setView('login')} />
          )}

          {/* Toggle view */}
          <div className={css({ mt: 6, textAlign: 'center', fontSize: 'sm' })}>
            {view === 'login' ? (
              <p className={css({ color: 'gray.400' })}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className={css({
                    color: 'blue.400',
                    fontWeight: 'medium',
                    _hover: { color: 'blue.300', textDecoration: 'underline' },
                  })}
                >
                  Sign up
                </button>
              </p>
            ) : view === 'signup' ? (
              <p className={css({ color: 'gray.400' })}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className={css({
                    color: 'blue.400',
                    fontWeight: 'medium',
                    _hover: { color: 'blue.300', textDecoration: 'underline' },
                  })}
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
```

### 2.3 GoogleButton Component

```typescript
// components/auth/GoogleButton.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { css } from '@/styled-system/css'

interface GoogleButtonProps {
  onSuccess?: () => void
}

export default function GoogleButton({ onSuccess }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      // OAuth will redirect, so we don't need to do anything here
      // The callback page will handle the session
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={css({
        w: 'full',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 4,
        py: 3,
        bg: 'white',
        color: 'gray.800',
        fontSize: 'sm',
        fontWeight: 'medium',
        rounded: 'lg',
        border: '1px solid',
        borderColor: 'gray.300',
        cursor: 'pointer',
        transition: 'all 0.2s',
        _hover: {
          bg: 'gray.50',
          borderColor: 'gray.400',
        },
        _disabled: {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      })}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
          fill="#EA4335"
        />
      </svg>
      {loading ? 'Signing in...' : 'Continue with Google'}
    </button>
  )
}
```

### 2.4 LoginForm Component

```typescript
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { css } from '@/styled-system/css'

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
}

export default function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: 4 })}>
      {/* Email Input */}
      <div>
        <label htmlFor="email" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.300', mb: 2 })}>
          Email address
        </label>
        <div className={css({ position: 'relative' })}>
          <Mail
            size={18}
            className={css({
              position: 'absolute',
              left: 3,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'gray.400',
            })}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={css({
              w: 'full',
              pl: 10,
              pr: 4,
              py: 3,
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
              color: 'white',
              rounded: 'lg',
              fontSize: 'sm',
              _placeholder: { color: 'gray.500' },
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.500/20',
              },
            })}
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.300', mb: 2 })}>
          Password
        </label>
        <div className={css({ position: 'relative' })}>
          <Lock
            size={18}
            className={css({
              position: 'absolute',
              left: 3,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'gray.400',
            })}
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={css({
              w: 'full',
              pl: 10,
              pr: 10,
              py: 3,
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
              color: 'white',
              rounded: 'lg',
              fontSize: 'sm',
              _placeholder: { color: 'gray.500' },
              _focus: {
                outline: 'none',
                borderColor: 'blue.500',
                ring: '2px',
                ringColor: 'blue.500/20',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={css({
              position: 'absolute',
              right: 3,
              top: '50%',
              transform: 'translateY(-50%)',
              p: 1,
              color: 'gray.400',
              cursor: 'pointer',
              _hover: { color: 'gray.300' },
            })}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className={css({ textAlign: 'right' })}>
        <button
          type="button"
          onClick={onForgotPassword}
          className={css({
            fontSize: 'sm',
            color: 'blue.400',
            _hover: { color: 'blue.300', textDecoration: 'underline' },
          })}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={css({
          w: 'full',
          py: 3,
          bg: 'blue.600',
          color: 'white',
          fontSize: 'sm',
          fontWeight: 'medium',
          rounded: 'lg',
          cursor: 'pointer',
          transition: 'all 0.2s',
          _hover: { bg: 'blue.700' },
          _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        })}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

---

## Phase 3: Auth Context & Hooks

### 3.1 Create Auth Context

```typescript
// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.refreshSession()
    setSession(session)
    setUser(session?.user ?? null)
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 3.2 Create useAuthModal Hook

```typescript
// hooks/useAuthModal.ts
import { create } from 'zustand'

interface AuthModalStore {
  isOpen: boolean
  view: 'login' | 'signup' | 'forgot-password'
  open: (view?: 'login' | 'signup' | 'forgot-password') => void
  close: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',
  open: (view = 'login') => set({ isOpen: true, view }),
  close: () => set({ isOpen: false }),
}))
```

---

## Phase 4: Protected Routes

### 4.1 Create Auth Callback Page

```typescript
// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
```

### 4.2 Create AuthGuard Component

```typescript
// components/auth/AuthGuard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { css } from '@/styled-system/css'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minH: '100vh',
        })}
      >
        <div className={css({ fontSize: 'lg', color: 'gray.400' })}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
```

---

## Phase 5: User Profile

### 5.1 Create Profile Page

```typescript
// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabaseClient'
import { css } from '@/styled-system/css'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setProfile(data)
      setDisplayName(data.display_name || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <AuthGuard>
      <div className={css({ maxW: '2xl', mx: 'auto', py: 8 })}>
        <h1 className={css({ fontSize: '3xl', fontWeight: 'bold', mb: 8 })}>
          Profile Settings
        </h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className={css({ bg: 'gray.800', rounded: 'xl', p: 6, border: '1px solid', borderColor: 'gray.700' })}>
            {/* Avatar */}
            <div className={css({ mb: 6 })}>
              <div
                className={css({
                  w: 20,
                  h: 20,
                  rounded: 'full',
                  bg: 'gray.700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  color: 'blue.400',
                })}
              >
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
            </div>

            {/* Email */}
            <div className={css({ mb: 4 })}>
              <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.300', mb: 2 })}>
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className={css({
                  w: 'full',
                  px: 4,
                  py: 3,
                  bg: 'gray.900',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  color: 'gray.400',
                  rounded: 'lg',
                  fontSize: 'sm',
                  cursor: 'not-allowed',
                })}
              />
            </div>

            {/* Display Name */}
            <div className={css({ mb: 6 })}>
              <label className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'gray.300', mb: 2 })}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className={css({
                  w: 'full',
                  px: 4,
                  py: 3,
                  bg: 'gray.900',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  color: 'white',
                  rounded: 'lg',
                  fontSize: 'sm',
                  _placeholder: { color: 'gray.500' },
                  _focus: {
                    outline: 'none',
                    borderColor: 'blue.500',
                    ring: '2px',
                    ringColor: 'blue.500/20',
                  },
                })}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={updateProfile}
              className={css({
                px: 6,
                py: 3,
                bg: 'blue.600',
                color: 'white',
                fontSize: 'sm',
                fontWeight: 'medium',
                rounded: 'lg',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: { bg: 'blue.700' },
              })}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
```

---

## Phase 6: Testing

### 6.1 Test Coverage

```typescript
// components/auth/__tests__/AuthModal.test.tsx
// components/auth/__tests__/GoogleButton.test.tsx
// components/auth/__tests__/LoginForm.test.tsx
// components/auth/__tests__/SignupForm.test.tsx
// contexts/__tests__/AuthContext.test.tsx
// hooks/__tests__/useAuthModal.test.ts
```

### 6.2 E2E Testing Scenarios

1. **Google OAuth Flow**
   - Click "Continue with Google"
   - Redirect to Google consent screen
   - Approve permissions
   - Redirect back to app with session

2. **Email Sign-Up Flow**
   - Enter email and password
   - Receive verification email
   - Click verification link
   - Login with credentials

3. **Password Reset Flow**
   - Click "Forgot password"
   - Enter email
   - Receive reset email
   - Click reset link
   - Set new password
   - Login with new password

4. **Session Management**
   - Login and verify session persists on refresh
   - Verify auto-refresh before expiry
   - Logout and verify session cleared

---

## Implementation Checklist

### Phase 1: Supabase Setup ☐
- [ ] Enable Email provider in Supabase
- [ ] Enable Google provider in Supabase
- [ ] Get Google OAuth credentials
- [ ] Configure redirect URLs
- [ ] Update environment variables
- [ ] Create user_profiles table
- [ ] Set up Row Level Security policies
- [ ] Create auto-profile creation trigger

### Phase 2: Auth Components ☐
- [ ] Create AuthModal component
- [ ] Create GoogleButton component
- [ ] Create LoginForm component
- [ ] Create SignupForm component
- [ ] Create ForgotPasswordForm component
- [ ] Create ResetPasswordForm component
- [ ] Add to Sidebar/Header

### Phase 3: Auth Context ☐
- [ ] Create AuthContext
- [ ] Create useAuth hook
- [ ] Wrap app with AuthProvider
- [ ] Create useAuthModal hook
- [ ] Install zustand for state management

### Phase 4: Routes ☐
- [ ] Create /auth/callback route
- [ ] Create /auth/error page
- [ ] Create AuthGuard component
- [ ] Test protected routes

### Phase 5: User Profile ☐
- [ ] Create /profile page
- [ ] Add profile edit functionality
- [ ] Add avatar upload (optional)
- [ ] Add preferences management

### Phase 6: Integration ☐
- [ ] Update Sidebar with auth button
- [ ] Add user menu dropdown
- [ ] Connect saved tools to user account
- [ ] Connect presets to user account
- [ ] Connect favorites to user account

### Phase 7: Testing ☐
- [ ] Write unit tests for components
- [ ] Write integration tests
- [ ] Test Google OAuth flow
- [ ] Test email auth flow
- [ ] Test password reset flow
- [ ] Test session management
- [ ] Test protected routes

### Phase 8: Polish ☐
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add form validation
- [ ] Add accessibility features
- [ ] Add analytics tracking
- [ ] Update documentation

---

## Additional Features (Future)

### User Dashboard
- Usage statistics
- Favorite tools
- Recent activity
- Saved presets

### Premium Features
- Extended history (30 days vs 7 days)
- Cloud storage for exports
- API access
- Custom branding

### Social Features
- Share presets with team
- Collaborative tools
- Public profiles

---

## Security Considerations

1. **Never store passwords in plain text** - Supabase handles this
2. **Use HTTPS only** - Enforce in production
3. **Implement rate limiting** - Prevent brute force attacks
4. **Validate on server side** - Don't trust client input
5. **Use environment variables** - Never commit secrets
6. **Implement CSRF protection** - Use Supabase's built-in protection
7. **Regular security audits** - Keep dependencies updated

---

## Performance Optimizations

1. **Lazy load auth modal** - Only load when needed
2. **Cache user session** - Reduce Supabase calls
3. **Optimize bundle size** - Code split auth components
4. **Use suspense boundaries** - Better loading UX
5. **Prefetch on hover** - Faster auth modal open

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Auth Patterns](https://nextjs.org/docs/authentication)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)

---

**Next Steps:** Start with Phase 1 (Supabase Setup) and work through each phase sequentially.
