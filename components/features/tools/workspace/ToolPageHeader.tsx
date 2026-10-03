'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/design-system/IconTile'
import type { ToolFamilyCategory } from '@/components/features/tools/ToolFamilyNav'
import { categoryWorkspace } from '@/components/features/tools/workspace/category-workspace'
import type { AccentName } from '@/lib/design-system'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export interface ToolPageHeaderProps {
  category: ToolFamilyCategory
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

function tileAccent(category: ToolFamilyCategory): AccentName {
  if (category === 'development') return 'blue'
  if (category === 'media') return 'orange'
  if (category === 'productivity') return 'amber'
  if (category === 'security' || category === 'finance') return 'emerald'
  return 'violet'
}

export function ToolPageHeader({
  category,
  title,
  description,
  eyebrow,
  icon,
  highlights = [],
}: ToolPageHeaderProps) {
  const config = categoryWorkspace[category]
  const eyebrowLabel = eyebrow ?? config.defaultEyebrow
  const visibleHighlights =
    config.highlightLimit === null ? highlights : highlights.slice(0, config.highlightLimit)
  const showHighlights = config.showBrowserChip || visibleHighlights.length > 0

  return (
    <header className={css({ spaceY: { base: '4', sm: '5' } })}>
      <Link
        href={config.href}
        onClick={() => {
          trackToolEvent('feature_interaction', {
            feature: config.backFeature,
            destination: config.backDestination,
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
            outlineColor:
              category === 'data'
                ? 'brand.violetBright'
                : category === 'design'
                  ? 'fuchsia.400'
                  : category === 'development'
                    ? 'brand.blue'
                    : category === 'media'
                      ? 'orange.400'
                      : category === 'productivity'
                        ? 'brand.amber'
                        : 'emerald.400',
            outlineOffset: '2px',
          },
        })}
      >
        <ArrowLeft className={css({ h: '4', w: '4' })} aria-hidden />
        {config.backLabel}
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
          <IconTile icon={icon} accent={tileAccent(category)} />
          {eyebrowLabel ? (
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'bold',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color:
                  category === 'data'
                    ? 'brand.violetBright'
                    : category === 'design'
                      ? 'fuchsia.400'
                      : category === 'development'
                        ? 'brand.blue'
                        : category === 'media'
                          ? 'orange.400'
                          : category === 'productivity'
                            ? 'brand.amber'
                            : 'emerald.400',
              })}
            >
              {eyebrowLabel}
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
            {config.wrapTitle ? <span>{title}</span> : title}
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

      {showHighlights ? (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '2',
          })}
        >
          {config.showBrowserChip ? (
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
          ) : null}
          {visibleHighlights.map((highlight) => (
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
