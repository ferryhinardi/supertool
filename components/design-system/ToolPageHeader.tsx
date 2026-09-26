import type { LucideIcon } from 'lucide-react'
import { type AccentName, palette } from '@/lib/design-system'
import { css } from '@/styled-system/css'
import { IconTile } from './IconTile'

interface ToolPageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  icon?: LucideIcon
  accent?: AccentName
}

export function ToolPageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  accent = 'lime',
}: ToolPageHeaderProps) {
  return (
    <header
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '3',
        maxW: '42rem',
      })}
    >
      {eyebrow ? (
        <p
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            m: '0',
            color: 'brand.ink',
            fontSize: 'sm',
            fontWeight: 'semibold',
          })}
        >
          {Icon ? <IconTile icon={Icon} accent={accent} size="sm" /> : null}
          <span style={{ color: palette[accent] }}>{eyebrow}</span>
        </p>
      ) : null}
      <h1
        className={css({
          m: '0',
          fontFamily: 'display',
          fontSize: { base: '4xl', md: '5xl' },
          fontWeight: 'bold',
          lineHeight: '1.05',
          letterSpacing: '-0.03em',
          color: 'brand.ink',
          textWrap: 'balance',
        })}
      >
        {title}
      </h1>
      <p
        className={css({
          m: '0',
          maxW: '65ch',
          color: 'brand.muted',
          fontSize: { base: 'md', md: 'lg' },
          lineHeight: 'relaxed',
          textWrap: 'pretty',
        })}
      >
        {description}
      </p>
    </header>
  )
}
