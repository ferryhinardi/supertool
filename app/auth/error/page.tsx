'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { css } from '@/styled-system/css'
import { vstack } from '@/styled-system/patterns'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div
      className={css({
        minH: 'screen',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50',
        p: 4,
      })}
    >
      <div
        className={vstack({
          gap: 6,
          maxW: 'md',
          w: 'full',
          bg: 'white',
          rounded: 'lg',
          shadow: 'lg',
          p: 8,
          textAlign: 'center',
        })}
      >
        <div
          className={css({
            w: 16,
            h: 16,
            rounded: 'full',
            bg: 'red.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <AlertCircle className={css({ w: 8, h: 8, color: 'red.600' })} />
        </div>

        <div className={vstack({ gap: 2 })}>
          <h1 className={css({ fontSize: '2xl', fontWeight: 'bold' })}>Authentication Error</h1>
          <p className={css({ color: 'gray.600' })}>
            {errorDescription || error || 'Something went wrong during authentication'}
          </p>
        </div>

        <Link
          href="/"
          className={css({
            px: 6,
            py: 3,
            bg: 'blue.600',
            color: 'white',
            fontWeight: 'medium',
            rounded: 'lg',
            _hover: { bg: 'blue.700' },
            transition: 'background 0.2s',
          })}
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div
          className={css({
            minH: 'screen',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div className={css({ color: 'gray.600' })}>Loading...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
