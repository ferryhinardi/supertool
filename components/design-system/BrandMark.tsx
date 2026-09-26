import { Sparkles } from 'lucide-react'
import { elevation, palette } from '@/lib/design-system'
import { css } from '@/styled-system/css'

interface BrandMarkProps {
  size?: number
}

export function BrandMark({ size = 35 }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={css({
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        color: 'white',
      })}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        boxShadow: elevation.brandGlow,
        backgroundImage: `linear-gradient(145deg, ${palette.violetBright}, ${palette.violetDeep})`,
      }}
    >
      <Sparkles style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.8} />
    </span>
  )
}
