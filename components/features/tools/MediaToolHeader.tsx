'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/design-system/IconTile'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export interface MediaToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function MediaToolHeader({
  title,
  description,
  eyebrow = 'Media',
  icon,
  highlights = [],
}: MediaToolHeaderProps) {
  return (
    <header className={css({ spaceY: { base: '4', sm: '5' } })}>
      <Link
        href="/tools/media"
        onClick={() => {
          trackToolEvent('feature_interaction', {
            feature: 'media_tool_back',
            destination: 'media_hub',
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
            outlineColor: 'orange.400',
            outlineOffset: '2px',
          },
        })}
      >
        <ArrowLeft className={css({ h: '4', w: '4' })} aria-hidden />
        Media Tools
      </Link>

      <div
        className={css({
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          alignItems: { base: 'flex-start', sm: 'center' },
          gap: { base: '3', sm: '4' },
        })}
      >
        <IconTile icon={icon} accent="orange" />
        <div className={css({ spaceY: '2', minW: '0' })}>
          {eyebrow ? (
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'orange.400',
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
