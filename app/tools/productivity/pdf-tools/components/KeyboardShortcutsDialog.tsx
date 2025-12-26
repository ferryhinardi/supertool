'use client'

import { Command, Download, FileUp, RotateCcw, RotateCw, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { css } from '@/styled-system/css'

interface ShortcutItem {
  keys: string[]
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

const shortcuts: ShortcutItem[] = [
  {
    keys: ['Ctrl', 'O'],
    description: 'Open / Upload files',
    icon: FileUp,
  },
  {
    keys: ['Ctrl', 'P'],
    description: 'Process PDFs',
    icon: Zap,
  },
  {
    keys: ['Ctrl', 'D'],
    description: 'Download all completed files',
    icon: Download,
  },
  {
    keys: ['Ctrl', 'Z'],
    description: 'Undo last operation',
    icon: RotateCcw,
  },
  {
    keys: ['Ctrl', 'Shift', 'Z'],
    description: 'Redo operation',
    icon: RotateCw,
  },
  {
    keys: ['Ctrl', 'Shift', 'X'],
    description: 'Clear all files',
    icon: Trash2,
  },
  {
    keys: ['Esc'],
    description: 'Close modal / Cancel operation',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
  },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '2',
        py: '1',
        minW: '8',
        fontSize: 'xs',
        fontWeight: 'semibold',
        fontFamily: 'mono',
        rounded: 'md',
        bg: 'gray.800',
        border: '1px solid',
        borderColor: 'gray.700',
        shadow: 'sm',
        color: 'white',
      })}
    >
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={css({
            gap: '2',
            color: 'white',
            _hover: {
              color: 'white',
              bg: 'gray.800',
            },
          })}
        >
          <Command
            className={css({
              h: '4',
              w: '4',
            })}
          />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent
        className={css({
          maxW: '2xl',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'gray.800',
        })}
      >
        <DialogHeader>
          <DialogTitle
            className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'gray.100',
            })}
          >
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription
            className={css({
              color: 'white',
            })}
          >
            Use these shortcuts to speed up your workflow
          </DialogDescription>
        </DialogHeader>

        <div
          className={css({
            mt: '4',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2',
          })}
        >
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon
            return (
              <div
                key={shortcut.description}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '4',
                  p: '3',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'gray.800',
                    borderColor: 'gray.700',
                  },
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                    flex: '1',
                  })}
                >
                  {Icon && (
                    <Icon
                      className={css({
                        h: '4',
                        w: '4',
                        color: 'red.400',
                        flexShrink: 0,
                      })}
                    />
                  )}
                  <span
                    className={css({
                      fontSize: 'sm',
                      color: 'gray.200',
                    })}
                  >
                    {shortcut.description}
                  </span>
                </div>

                <div
                  className={css({
                    display: 'flex',
                    gap: '1',
                    alignItems: 'center',
                  })}
                >
                  {shortcut.keys.map((key, index) => (
                    <div
                      key={key}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1',
                      })}
                    >
                      <Kbd>{key}</Kbd>
                      {index < shortcut.keys.length - 1 && (
                        <span
                          className={css({
                            fontSize: 'xs',
                            color: 'white',
                          })}
                        >
                          +
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div
          className={css({
            mt: '4',
            p: '3',
            rounded: 'lg',
            bg: 'yellow.500/10',
            border: '1px solid',
            borderColor: 'yellow.500/20',
          })}
        >
          <p
            className={css({
              fontSize: 'xs',
              color: 'yellow.200',
            })}
          >
            <strong>Tip:</strong> Press <Kbd>?</Kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
