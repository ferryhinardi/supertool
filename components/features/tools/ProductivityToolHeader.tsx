'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/design-system/IconTile'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export interface ProductivityToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function ProductivityToolHeader({
  title,
  description,
  eyebrow = 'Productivity',
  icon,
  highlights = [],
}: ProductivityToolHeaderProps) {
  return (
    <header className={css({ spaceY: { base: '4', sm: '5' } })}>
      <Link
        href="/tools/productivity"
        onClick={() => {
          trackToolEvent('feature_interaction', {
            feature: 'productivity_tool_back',
            destination: 'productivity_hub',
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
            outlineColor: 'brand.amber',
            outlineOffset: '2px',
          },
        })}
      >
        <ArrowLeft className={css({ h: '4', w: '4' })} aria-hidden />
        Productivity Tools
      </Link>

      <div
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          alignItems: { base: 'flex-start', sm: 'center' },
          gap: { base: '3', sm: '4' },
        })}
      >
        <IconTile icon={icon} accent="amber" />
        <div className={css({ spaceY: '2', minW: '0' })}>
          {eyebrow ? (
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'brand.amber',
              })}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={css({
              fontFamily: 'display',
              fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
              fontWeight: 'bold',
              lineHeight: 'tight',
              color: 'brand.ink',
            })}
          >
            {title}
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

      <div
        className={css({
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '2',
        })}
      >
        <p
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            minH: '11',
            px: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'brand.line',
            bg: 'brand.surface',
            color: 'brand.mint',
            fontSize: 'sm',
            fontWeight: 'medium',
          })}
        >
          <ShieldCheck className={css({ h: '4', w: '4' })} aria-hidden />
          Processed in your browser
        </p>
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
    </header>
  )
}
