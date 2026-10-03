'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/design-system/IconTile'
import { accentForCategory } from '@/lib/design-system'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export interface DataToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function DataToolHeader({
  title,
  description,
  eyebrow = 'Data Processing',
  icon,
  highlights = [],
}: DataToolHeaderProps) {
  return (
    <header className={css({ spaceY: { base: '4', sm: '5' } })}>
      <Link
        href="/tools/data"
        onClick={() => {
          trackToolEvent('feature_interaction', {
            feature: 'data_tool_back',
            destination: 'data_hub',
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
            outlineColor: 'brand.violetBright',
            outlineOffset: '2px',
          },
        })}
      >
        <ArrowLeft className={css({ h: '4', w: '4' })} aria-hidden />
        Data Processing
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
          <IconTile icon={icon} accent={accentForCategory('data')} />
          {eyebrow ? (
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'brand.violetBright',
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
        {highlights.map((highlight) => (
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
