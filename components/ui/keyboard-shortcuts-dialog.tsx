'use client'

import { Command, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { css } from '@/styled-system/css'

interface Shortcut {
  key: string
  label: string
  description: string
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: Shortcut[]
  toolName?: string
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
  toolName = 'Tool',
}: KeyboardShortcutsDialogProps) {
  if (!open) return null

  const onClose = () => onOpenChange(false)

  return (
    // biome-ignore lint/a11y/useSemanticElements: Modal backdrop uses div for layout, button behavior via role
    <div
      className={css({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        bg: 'black/50',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '50',
        p: '4',
      })}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClose()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Card
        className={css({
          maxW: '2xl',
          w: 'full',
          maxH: '[90vh]',
          overflowY: 'auto',
          border: '2px solid',
          borderColor: 'purple.500/30',
          bg: 'gray.900',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <div>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Command className={css({ h: '5', w: '5', color: 'purple.400' })} />
                {toolName} Shortcuts
              </CardTitle>
              <CardDescription>Use these shortcuts to navigate faster</CardDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className={css({ h: '4', w: '4' })} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={css({ spaceY: '3' })}>
            {shortcuts.map((shortcut, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Shortcuts list is static and index is stable
                key={index}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '3',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  bg: 'gray.900/50',
                  transition: 'all 0.2s',
                  _hover: { borderColor: 'purple.500/50', bg: 'gray.900/70' },
                })}
              >
                <div className={css({ flex: '1' })}>
                  <div className={css({ fontWeight: 'medium', color: 'white', fontSize: 'sm' })}>
                    {shortcut.label}
                  </div>
                  <div className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
                    {shortcut.description}
                  </div>
                </div>
                <kbd
                  className={css({
                    px: '3',
                    py: '1.5',
                    rounded: 'md',
                    bg: 'gray.800',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    fontFamily: 'mono',
                    fontSize: 'xs',
                    fontWeight: 'semibold',
                    color: 'purple.400',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div
            className={css({
              mt: '6',
              pt: '4',
              borderTop: '1px solid',
              borderColor: 'gray.800',
              textAlign: 'center',
            })}
          >
            <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
              Press{' '}
              <kbd
                className={css({
                  px: '2',
                  py: '1',
                  rounded: 'sm',
                  bg: 'gray.800',
                  fontFamily: 'mono',
                })}
              >
                Esc
              </kbd>{' '}
              to close this dialog
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
