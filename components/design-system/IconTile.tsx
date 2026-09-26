import type { LucideIcon } from 'lucide-react'
import type React from 'react'
import { type AccentName, accents } from '@/lib/design-system'
import { css } from '@/styled-system/css'

interface IconTileProps {
  icon: LucideIcon | React.ElementType
  accent?: AccentName
  size?: 'sm' | 'md'
}

const sizes = {
  sm: { box: '30px', icon: '16px', radius: '8px' },
  md: { box: '42px', icon: '22px', radius: '11px' },
} as const

export function IconTile({ icon: Icon, accent = 'violet', size = 'md' }: IconTileProps) {
  const tone = accents[accent]
  const metrics = sizes[size]

  return (
    <span
      aria-hidden
      className={css({
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
      })}
      style={{
        width: metrics.box,
        height: metrics.box,
        borderRadius: metrics.radius,
        color: tone.color,
        background: tone.background,
      }}
    >
      <Icon style={{ width: metrics.icon, height: metrics.icon }} strokeWidth={1.8} />
    </span>
  )
}
