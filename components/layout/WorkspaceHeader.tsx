'use client'

import type { LucideIcon } from 'lucide-react'
import { FileJson, ShieldCheck } from 'lucide-react'
import { IconTile } from '@/components/design-system/IconTile'
import type { AccentName } from '@/lib/design-system'
import { css } from '@/styled-system/css'

export interface WorkspaceHeaderProps {
  title?: string
  icon?: LucideIcon
  accent?: AccentName
}

export function WorkspaceHeader({
  title = 'Data Processing',
  icon = FileJson,
  accent = 'violet',
}: WorkspaceHeaderProps) {
  return (
    <header
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '3',
        minH: '14',
        px: { base: '3', sm: '4', md: '6' },
        py: '2',
        bg: 'brand.surface',
        borderBottom: '1px solid',
        borderColor: 'brand.line',
      })}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3', minW: '0' })}>
        <IconTile icon={icon} accent={accent} size="sm" />
        <div className={css({ minW: '0' })}>
          <p
            className={css({
              fontSize: 'xs',
              fontWeight: 'bold',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: accent === 'amber' ? 'brand.amber' : 'brand.violetBright',
            })}
          >
            Workspace
          </p>
          <p
            className={css({
              fontFamily: 'display',
              fontSize: { base: 'sm', sm: 'md' },
              fontWeight: 'bold',
              color: 'brand.ink',
              lineHeight: 'tight',
              truncate: true,
            })}
          >
            {title}
          </p>
        </div>
      </div>
      <p
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2',
          flexShrink: 0,
          minH: '11',
          px: '3',
          rounded: 'full',
          border: '1px solid',
          borderColor: 'brand.line',
          bg: 'brand.canvas',
          color: 'brand.mint',
          fontSize: { base: 'xs', sm: 'sm' },
          fontWeight: 'medium',
        })}
      >
        <ShieldCheck className={css({ h: '4', w: '4' })} aria-hidden />
        <span>Runs in your browser</span>
      </p>
    </header>
  )
}
