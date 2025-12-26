import { Archive, FileText, Mail, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { css } from '@/styled-system/css'

export interface CompressionPreset {
  id: string
  name: string
  description: string
  level: 'low' | 'medium' | 'high'
  icon: React.ElementType
  quality: number
  dpi: number
}

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Small file for email attachments',
    level: 'high',
    icon: Mail,
    quality: 0.3,
    dpi: 72,
  },
  {
    id: 'web',
    name: 'Web',
    description: 'Optimized for online viewing',
    level: 'medium',
    icon: FileText,
    quality: 0.5,
    dpi: 96,
  },
  {
    id: 'print',
    name: 'Print',
    description: 'High quality for printing',
    level: 'low',
    icon: Printer,
    quality: 0.85,
    dpi: 300,
  },
  {
    id: 'archive',
    name: 'Archive',
    description: 'Balanced quality & size for long-term storage',
    level: 'medium',
    icon: Archive,
    quality: 0.6,
    dpi: 150,
  },
]

interface CompressionPresetsProps {
  selected: string | null
  onSelect: (preset: CompressionPreset) => void
}

export function CompressionPresets({ selected, onSelect }: CompressionPresetsProps) {
  return (
    <div className={css({ spaceY: '2' })}>
      <div
        className={css({
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'white',
        })}
      >
        Quick Presets
      </div>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2',
        })}
      >
        {COMPRESSION_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant={selected === preset.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(preset)}
            className={css({
              h: 'auto',
              flexDirection: 'column',
              gap: '1',
              py: '3',
              px: '2',
              ...(selected === preset.id
                ? {
                    borderColor: 'red.500/50',
                    bg: 'red.500/20',
                    color: 'red.200',
                  }
                : {
                    borderColor: 'gray.700',
                  }),
            })}
          >
            <preset.icon className={css({ h: '4', w: '4' })} />
            <span className={css({ fontSize: 'xs', fontWeight: 'semibold' })}>{preset.name}</span>
            <span className={css({ fontSize: '2xs', color: 'white', textAlign: 'center' })}>
              {preset.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
