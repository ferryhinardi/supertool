'use client'

import { Keyboard, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ToolKeyboardShortcut } from '@/lib/data/tool-components-types'
import { css } from '@/styled-system/css'

interface ToolKeyboardShortcutsProps {
  /** List of keyboard shortcuts to display */
  shortcuts: ToolKeyboardShortcut[]
  /** Custom trigger button (optional, defaults to keyboard icon button) */
  trigger?: React.ReactNode
  /** Dialog title */
  title?: string
  /** Show platform-specific shortcuts only */
  filterByPlatform?: boolean
}

/**
 * ToolKeyboardShortcuts Component
 *
 * A reusable modal dialog for displaying keyboard shortcuts with
 * platform-specific indicators and category grouping.
 *
 * @example
 * <ToolKeyboardShortcuts
 *   shortcuts={[
 *     { key: 'Ctrl+S', description: 'Save file', category: 'File Operations' },
 *     { key: 'Ctrl+Z', description: 'Undo', category: 'Editing' },
 *     { key: 'Ctrl+Y', description: 'Redo', category: 'Editing' },
 *   ]}
 *   title="Keyboard Shortcuts"
 * />
 */
export function ToolKeyboardShortcuts({
  shortcuts,
  trigger,
  title = 'Keyboard Shortcuts',
  filterByPlatform = true,
}: ToolKeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Detect platform
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.userAgent)

  // Filter shortcuts by platform if enabled
  const filteredShortcuts = filterByPlatform
    ? shortcuts.filter(
        (s) =>
          !s.platform ||
          s.platform === 'all' ||
          (isMac && s.platform === 'mac') ||
          (!isMac && (s.platform === 'windows' || s.platform === 'linux'))
      )
    : shortcuts

  // Group shortcuts by category
  const categorizedShortcuts = filteredShortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || 'General'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, ToolKeyboardShortcut[]>
  )

  // Replace Ctrl with Cmd on Mac
  const formatKey = (key: string) => {
    if (isMac) {
      return key.replace(/Ctrl/g, 'Cmd').replace(/Alt/g, 'Opt')
    }
    return key
  }

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={css({ appearance: 'none', bg: 'transparent', border: 'none', p: 0 })}
        >
          {trigger}
        </button>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className={css({
            gap: '2',
            borderColor: 'gray.700',
            color: 'gray.400',
            _hover: {
              bg: 'gray.800',
              borderColor: 'gray.600',
            },
          })}
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className={css({ h: '4', w: '4' })} />
          <span className={css({ display: { base: 'none', sm: 'inline' } })}>Shortcuts</span>
        </Button>
      )}

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className={css({
              position: 'fixed',
              inset: '0',
              bg: 'black/60',
              backdropFilter: 'blur(4px)',
              zIndex: '50',
              animation: 'fadeIn 0.2s ease-out',
            })}
          />

          {/* Dialog */}
          <div
            className={css({
              animation: 'scaleIn 0.2s ease-out',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              w: { base: '11/12', sm: 'lg' },
              maxW: 'lg',
              maxH: '90vh',
              overflowY: 'auto',
              zIndex: '50',
            })}
          >
            <div
              className={css({
                rounded: 'xl',
                border: '1px solid',
                borderColor: 'gray.700',
                bg: 'gray.900',
                shadow: '2xl',
              })}
            >
              {/* Header */}
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: '6',
                  borderBottom: '1px solid',
                  borderColor: 'gray.800',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <Keyboard className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  <h2
                    className={css({
                      fontSize: 'xl',
                      fontWeight: 'bold',
                      color: 'gray.100',
                    })}
                  >
                    {title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={css({
                    rounded: 'lg',
                    p: '1',
                    color: 'gray.500',
                    transition: 'colors 0.2s',
                    _hover: {
                      color: 'gray.300',
                      bg: 'gray.800',
                    },
                  })}
                  aria-label="Close"
                >
                  <X className={css({ h: '5', w: '5' })} />
                </button>
              </div>

              {/* Content */}
              <div className={css({ p: '6', spaceY: '6' })}>
                {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3
                      className={css({
                        mb: '3',
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: 'gray.400',
                        textTransform: 'uppercase',
                        letterSpacing: 'wider',
                      })}
                    >
                      {category}
                    </h3>

                    <div className={css({ spaceY: '2' })}>
                      {categoryShortcuts.map((shortcut) => (
                        <div
                          key={`${category}-${shortcut.key}-${shortcut.description}`}
                          className={css({
                            animation: 'slideInLeft 0.3s ease-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4',
                            p: '3',
                            rounded: 'lg',
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                          })}
                        >
                          <span
                            className={css({
                              flex: '1',
                              fontSize: 'sm',
                              color: 'gray.300',
                            })}
                          >
                            {shortcut.description}
                          </span>

                          <div className={css({ display: 'flex', gap: '1', flexShrink: 0 })}>
                            {formatKey(shortcut.key)
                              .split('+')
                              .map((part, i, arr) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: Keyboard key parts may repeat in combinations
                                <span key={`${part}-${i}`}>
                                  <kbd
                                    className={css({
                                      px: '2',
                                      py: '1',
                                      rounded: 'md',
                                      bg: 'gray.700',
                                      border: '1px solid',
                                      borderColor: 'gray.600',
                                      fontSize: 'xs',
                                      fontFamily: 'mono',
                                      fontWeight: 'semibold',
                                      color: 'gray.200',
                                      shadow: 'sm',
                                    })}
                                  >
                                    {part}
                                  </kbd>
                                  {i < arr.length - 1 && (
                                    <span
                                      className={css({
                                        mx: '1',
                                        color: 'gray.500',
                                        fontSize: 'xs',
                                      })}
                                    >
                                      +
                                    </span>
                                  )}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Platform indicator */}
                <div
                  className={css({
                    mt: '6',
                    p: '3',
                    rounded: 'lg',
                    bg: 'blue.500/10',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                    textAlign: 'center',
                  })}
                >
                  <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
                    Shortcuts optimized for{' '}
                    <span className={css({ fontWeight: 'semibold', color: 'blue.300' })}>
                      {isMac ? 'macOS' : 'Windows/Linux'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
