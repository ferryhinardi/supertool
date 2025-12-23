import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

export interface CompressionPreset {
  id: string
  name: string
  description: string
  level: 'low' | 'medium' | 'high'
  useCase: string
}

export const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: 'email',
    name: 'Email Attachment',
    description: 'Maximum compression for email',
    level: 'high',
    useCase: 'Reduce file size by ~80% for easy sharing',
  },
  {
    id: 'web',
    name: 'Web Publishing',
    description: 'Balanced for online viewing',
    level: 'medium',
    useCase: 'Optimize for fast loading while maintaining quality',
  },
  {
    id: 'print',
    name: 'Print Quality',
    description: 'Minimal compression',
    level: 'low',
    useCase: 'Preserve maximum quality for printing',
  },
  {
    id: 'archive',
    name: 'Archive Storage',
    description: 'High compression for storage',
    level: 'high',
    useCase: 'Long-term storage with reduced space',
  },
]

interface PresetsDialogProps {
  onSelect: (preset: CompressionPreset) => void
  onClose: () => void
}

export function PresetsDialog({ onSelect, onClose }: PresetsDialogProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Modal overlay is interactive backdrop for closing
    <div
      className={css({
        position: 'fixed',
        inset: '0',
        zIndex: '50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'black/60',
        backdropFilter: 'blur(4px)',
      })}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <Card
        className={css({
          maxW: '2xl',
          w: 'full',
          mx: '4',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'red.500/20',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className={css({ color: 'red.400' })}>Compression Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={css({ spaceY: '3', p: '6' })}>
            {COMPRESSION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelect(preset)
                  onClose()
                }}
                className={css({
                  w: 'full',
                  p: '4',
                  textAlign: 'left',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  bg: 'gray.900/50',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: 'red.500/50',
                    bg: 'red.500/10',
                    transform: 'translateX(4px)',
                  },
                })}
              >
                <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2' })}>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.200' })}>
                    {preset.name}
                  </h3>
                  <span
                    className={css({
                      fontSize: 'xs',
                      px: '2',
                      py: '1',
                      rounded: 'full',
                      bg: 'red.500/20',
                      color: 'red.300',
                    })}
                  >
                    {preset.level}
                  </span>
                </div>
                <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                  {preset.description}
                </p>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>{preset.useCase}</p>
              </button>
            ))}
            <Button
              variant="outline"
              onClick={onClose}
              className={css({
                w: 'full',
                mt: '4',
              })}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
