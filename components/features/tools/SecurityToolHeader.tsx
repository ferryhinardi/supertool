'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/design-system/IconTile'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export interface SecurityToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function SecurityToolHeader({
  title,
  description,
  eyebrow = 'Security',
  icon,
  highlights = [],
}: SecurityToolHeaderProps) {
  return (
    <header className={css({ spaceY: { base: '4', sm: '5' } })}>
      <Link
        href="/tools/security"
        onClick={() => {
          trackToolEvent('feature_interaction', {
            feature: 'security_tool_back',
            destination: 'security_hub',
          })
        }}
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2',
          minH: '11',
          px: '2',
          ml: '-2',
          rounded: 'lg',
          color: 'brand.muted',
          fontSize: 'sm',
          fontWeight: 'medium',
          _hover: { color: 'brand.ink' },
          _focusVisible: {
            outline: '2px solid',
            outlineColor: 'emerald.400',
            outlineOffset: '2px',
          },
        })}
      >
        <ArrowLeft className={css({ h: '4', w: '4' })} aria-hidden />
        Security Tools
      </Link>

      <div className={css({ spaceY: '3', minW: '0' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            minW: '0',
          })}
        >
          <IconTile icon={icon} accent="emerald" />
          {eyebrow ? (
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'emerald.400',
              })}
            >
              {eyebrow}
            </p>
          ) : null}
        </div>
        <div className={css({ spaceY: '2', minW: '0' })}>
          <h1
            className={css({
              fontFamily: 'display',
              fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
              fontWeight: 'bold',
              lineHeight: 'tight',
              color: 'brand.ink',
            })}
          >
            <span>{title}</span>
          </h1>
          <p
            className={css({
              fontSize: { base: 'sm', sm: 'md', md: 'lg' },
              color: 'brand.muted',
              maxW: '3xl',
              lineHeight: 'relaxed',
            })}
          >
            {description}
          </p>
        </div>
      </div>

      {highlights.length > 0 ? (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '2',
          })}
        >
          {highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                minH: '11',
                px: '3',
                rounded: 'full',
                border: '1px solid',
                borderColor: 'brand.line',
                bg: 'brand.surfaceRaised',
                color: 'brand.ink',
                fontSize: 'sm',
              })}
            >
              {highlight}
            </span>
          ))}
        </div>
      ) : null}
    </header>
  )
}
