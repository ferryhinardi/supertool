import type React from 'react'
import { css } from '@/styled-system/css'

interface EyebrowProps {
  icon?: React.ElementType
  children: React.ReactNode
}

export function Eyebrow({ icon: Icon, children }: EyebrowProps) {
  return (
    <div
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2',
        w: 'max-content',
        mb: '5',
        px: '2.5',
        py: '1.5',
        color: 'brand.violetBright',
        bg: 'rgba(139, 108, 255, 0.08)',
        border: '1px solid rgba(139, 108, 255, 0.22)',
        rounded: 'full',
        fontSize: 'xs',
        fontWeight: 'bold',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      })}
    >
      {Icon ? <Icon className={css({ h: '3.5', w: '3.5' })} aria-hidden /> : null}
      {children}
    </div>
  )
}
