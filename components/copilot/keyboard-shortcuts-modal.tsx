'use client'

import { useCallback, useEffect } from 'react'
import { COPILOT_SHORTCUTS, formatShortcut } from '@/lib/hooks'
import { css } from '@/styled-system/css'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal component displaying all available keyboard shortcuts for the Copilot chat
 */
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  // Group shortcuts for organized display
  const shortcutGroups = [
    {
      title: 'Sessions',
      shortcuts: [
        COPILOT_SHORTCUTS.NEW_SESSION,
        COPILOT_SHORTCUTS.DELETE_SESSION,
        COPILOT_SHORTCUTS.RENAME_SESSION,
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        COPILOT_SHORTCUTS.PREV_SESSION,
        COPILOT_SHORTCUTS.NEXT_SESSION,
        COPILOT_SHORTCUTS.SEARCH,
      ],
    },
    {
      title: 'Input',
      shortcuts: [COPILOT_SHORTCUTS.FOCUS_INPUT, COPILOT_SHORTCUTS.CLEAR_INPUT],
    },
    {
      title: 'General',
      shortcuts: [COPILOT_SHORTCUTS.HELP, COPILOT_SHORTCUTS.CLOSE],
    },
  ]

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click handled, keyboard via Escape
    <div
      className={css({
        position: 'fixed',
        inset: '0',
        zIndex: '100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 200ms ease-out',
        p: '4',
      })}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          w: 'full',
          maxW: 'lg',
          maxH: '90vh',
          bg: 'rgba(17, 17, 17, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          rounded: 'xl',
          overflow: 'hidden',
          animation: 'scaleIn 200ms ease-out',
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: '4',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '10',
                h: '10',
                rounded: 'lg',
                bg: 'rgba(139, 92, 246, 0.2)',
                color: 'rgb(167, 139, 250)',
              })}
            >
              <KeyboardIcon />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className={css({
                  fontSize: 'lg',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.95)',
                })}
              >
                Keyboard Shortcuts
              </h2>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: '0.5',
                })}
              >
                Quick actions for Copilot Chat
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '9',
              h: '9',
              rounded: 'lg',
              bg: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              _hover: {
                bg: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            })}
            aria-label="Close shortcuts modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div
          className={css({
            flex: '1',
            overflow: 'auto',
            p: '4',
          })}
        >
          <div className={css({ display: 'flex', flexDir: 'column', gap: '6' })}>
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3
                  className={css({
                    fontSize: 'xs',
                    fontWeight: '600',
                    color: 'rgba(139, 92, 246, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: '3',
                  })}
                >
                  {group.title}
                </h3>
                <div
                  className={css({
                    display: 'flex',
                    flexDir: 'column',
                    gap: '2',
                    bg: 'rgba(255, 255, 255, 0.03)',
                    rounded: 'lg',
                    p: '3',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  })}
                >
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key + (shortcut.modifiers?.join('') || '')}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: '2',
                        px: '2',
                        rounded: 'md',
                        transition: 'background 0.15s ease',
                        _hover: {
                          bg: 'rgba(255, 255, 255, 0.05)',
                        },
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'sm',
                          color: 'rgba(255, 255, 255, 0.8)',
                        })}
                      >
                        {shortcut.description}
                      </span>
                      <ShortcutKeys shortcut={shortcut} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4',
            px: '4',
            py: '3',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(0, 0, 0, 0.3)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1.5',
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.4)',
            })}
          >
            <kbd
              className={css({
                px: '1.5',
                py: '0.5',
                rounded: 'md',
                bg: 'rgba(255, 255, 255, 0.1)',
                fontSize: 'xs',
                fontFamily: 'mono',
              })}
            >
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display formatted shortcut keys
 */
function ShortcutKeys({
  shortcut,
}: {
  shortcut: Pick<(typeof COPILOT_SHORTCUTS)[keyof typeof COPILOT_SHORTCUTS], 'key' | 'modifiers'>
}) {
  const formatted = formatShortcut(shortcut)

  // Split the formatted string to render each key individually
  // On Mac: ⌘⇧D -> ['⌘', '⇧', 'D']
  // On Windows: Ctrl+Shift+D -> ['Ctrl', 'Shift', 'D']
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')

  let keys: string[]
  if (isMac) {
    // Split by character for Mac symbols
    keys = formatted.split('').filter((k) => k.trim())
  } else {
    // Split by + for Windows
    keys = formatted.split('+').filter((k) => k.trim())
  }

  const keyOccurrences = new Map<string, number>()

  return (
    <div className={css({ display: 'flex', alignItems: 'center', gap: '1' })}>
      {keys.map((key) => {
        const occurrence = keyOccurrences.get(key) ?? 0
        keyOccurrences.set(key, occurrence + 1)

        return (
          <kbd
            key={`${key}-${occurrence}`}
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minW: '6',
              h: '6',
              px: '1.5',
              rounded: 'md',
              bg: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'rgba(167, 139, 250, 0.9)',
              fontSize: 'xs',
              fontFamily: 'mono',
              fontWeight: '500',
            })}
          >
            {key}
          </kbd>
        )
      })}
    </div>
  )
}

// ============================================
// Icons
// ============================================

function KeyboardIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className={css({ w: '5', h: '5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
