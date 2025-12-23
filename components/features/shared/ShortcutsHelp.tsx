/**
 * Keyboard Shortcuts Help Modal
 * Displays available keyboard shortcuts for the split bill calculator
 */

'use client'

import { Command, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getKeyboardShortcuts } from '@/lib/split-bill-shortcuts'
import { css } from '@/styled-system/css'

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = getKeyboardShortcuts()

  useEffect(() => {
    const handleShowHelp = () => {
      setIsOpen(true)
    }

    window.addEventListener('show-shortcuts-help', handleShowHelp)

    return () => {
      window.removeEventListener('show-shortcuts-help', handleShowHelp)
    }
  }, [])

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, typeof shortcuts>
  )

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={css({
        position: 'fixed',
        inset: '0',
        zIndex: '50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s',
      })}
      onClick={() => setIsOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      data-shortcuts-modal
    >
      <div
        role="document"
        className={css({
          bg: 'gray.900',
          rounded: '2xl',
          border: '2px solid',
          borderColor: 'green.500/30',
          maxW: '2xl',
          w: 'full',
          mx: '4',
          maxH: '90vh',
          overflowY: 'auto',
          shadow: '2xl',
          animation: 'scaleIn 0.2s',
        })}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
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
            <Command className={css({ h: '6', w: '6', color: 'green.400' })} />
            <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className={css({
              color: 'gray.400',
              _hover: { color: 'white', bg: 'gray.800' },
            })}
          >
            <X className={css({ h: '5', w: '5' })} />
          </Button>
        </div>

        {/* Content */}
        <div className={css({ p: '6', spaceY: '6' })}>
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'green.400',
                  mb: '3',
                  textTransform: 'uppercase',
                  letterSpacing: 'wide',
                })}
              >
                {category}
              </h3>
              <div className={css({ spaceY: '2' })}>
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={`${category}-${shortcut.key}`}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: '3',
                      rounded: 'lg',
                      bg: 'gray.800/50',
                      transition: 'all 0.2s',
                      _hover: { bg: 'gray.800' },
                    })}
                  >
                    <span className={css({ color: 'gray.300', fontSize: 'sm' })}>
                      {shortcut.description}
                    </span>
                    <kbd
                      className={css({
                        px: '2',
                        py: '1',
                        rounded: 'md',
                        bg: 'gray.700',
                        border: '1px solid',
                        borderColor: 'gray.600',
                        color: 'white',
                        fontSize: 'xs',
                        fontWeight: 'semibold',
                        fontFamily: 'mono',
                      })}
                    >
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={css({
            p: '4',
            borderTop: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            textAlign: 'center',
          })}
        >
          <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
            Press <kbd className={css({ fontFamily: 'mono', fontWeight: 'bold' })}>?</kbd> to toggle
            this dialog, or{' '}
            <kbd className={css({ fontFamily: 'mono', fontWeight: 'bold' })}>Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
