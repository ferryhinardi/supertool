'use client'

import { FileJson, ShieldCheck } from 'lucide-react'
import { IconTile } from '@/components/design-system/IconTile'
import { css } from '@/styled-system/css'

export function WorkspaceHeader() {
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
        <IconTile icon={FileJson} accent="violet" size="sm" />
        <div className={css({ minW: '0' })}>
          <p
            className={css({
              fontSize: 'xs',
              fontWeight: 'bold',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'brand.violetBright',
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
            Data Processing
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
