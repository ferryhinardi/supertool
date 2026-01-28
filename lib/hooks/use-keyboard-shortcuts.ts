'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * Modifier keys for keyboard shortcuts
 */
export type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift'

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** The main key (e.g., 'n', 'Enter', 'ArrowUp') */
  key: string
  /** Modifier keys required (ctrl/meta will be treated as Cmd on Mac, Ctrl on Windows) */
  modifiers?: ModifierKey[]
  /** Handler function when shortcut is triggered */
  handler: (event: KeyboardEvent) => void
  /** Description for help modal */
  description?: string
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean
  /** Whether shortcut is enabled */
  enabled?: boolean
}

/**
 * Options for useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled globally */
  enabled?: boolean
  /** Element to attach listeners to (defaults to document) */
  target?: EventTarget | null
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

/**
 * Check if modifier keys match
 */
function modifiersMatch(event: KeyboardEvent, modifiers: ModifierKey[] = []): boolean {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')

  // Check if Cmd/Ctrl is required
  const needsCmdCtrl = modifiers.includes('ctrl') || modifiers.includes('meta')
  const hasCmdCtrl = isMac ? event.metaKey : event.ctrlKey

  // Check other modifiers
  const needsAlt = modifiers.includes('alt')
  const needsShift = modifiers.includes('shift')

  // For Cmd/Ctrl shortcuts, we want either meta (Mac) or ctrl (Windows/Linux)
  if (needsCmdCtrl && !hasCmdCtrl) return false
  if (!needsCmdCtrl && (event.metaKey || event.ctrlKey)) return false

  if (needsAlt !== event.altKey) return false
  if (needsShift !== event.shiftKey) return false

  return true
}

/**
 * Normalize key for comparison
 */
function normalizeKey(key: string): string {
  // Handle common key aliases
  const keyMap: Record<string, string> = {
    esc: 'Escape',
    return: 'Enter',
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    del: 'Delete',
    backspace: 'Backspace',
    space: ' ',
    '?': '?',
  }
  return keyMap[key.toLowerCase()] || key
}

/**
 * Hook for managing keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'n',
 *     modifiers: ['meta'], // Cmd+N on Mac, Ctrl+N on Windows
 *     handler: () => createNewSession(),
 *     description: 'Create new session',
 *     preventDefault: true,
 *   },
 *   {
 *     key: 'Escape',
 *     handler: () => closeModal(),
 *     description: 'Close modal',
 *   },
 * ])
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, target } = options
  const shortcutsRef = useRef(shortcuts)

  // Keep shortcuts ref updated
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: Event) => {
      if (!enabled) return
      if (!(event instanceof KeyboardEvent)) return

      // Skip if typing in an input (unless shortcut explicitly handles it)
      const targetElement = event.target as HTMLElement
      const isInInput = isInputElement(targetElement)

      for (const shortcut of shortcutsRef.current) {
        // Skip disabled shortcuts
        if (shortcut.enabled === false) continue

        // Check if key matches
        const normalizedShortcutKey = normalizeKey(shortcut.key)
        const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key

        if (
          eventKey !== normalizedShortcutKey.toLowerCase() &&
          event.key !== normalizedShortcutKey
        ) {
          continue
        }

        // Check if modifiers match
        if (!modifiersMatch(event, shortcut.modifiers)) continue

        // Skip input-targeted events for shortcuts without modifiers
        // (allow Cmd+N even in inputs, but not just 'n')
        const hasModifiers = shortcut.modifiers && shortcut.modifiers.length > 0
        if (isInInput && !hasModifiers) continue

        // Execute handler
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.handler(event)
        return
      }
    },
    [enabled]
  )

  useEffect(() => {
    const targetElement = target ?? (typeof document !== 'undefined' ? document : null)
    if (!targetElement) return

    targetElement.addEventListener('keydown', handleKeyDown)
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [target, handleKeyDown])
}

/**
 * Format shortcut for display (e.g., "⌘N" on Mac, "Ctrl+N" on Windows)
 */
export function formatShortcut(shortcut: Pick<KeyboardShortcut, 'key' | 'modifiers'>): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
  const parts: string[] = []

  if (shortcut.modifiers?.includes('ctrl') || shortcut.modifiers?.includes('meta')) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.modifiers?.includes('alt')) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.modifiers?.includes('shift')) {
    parts.push(isMac ? '⇧' : 'Shift')
  }

  // Format key display
  let keyDisplay = shortcut.key
  const keyDisplayMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Enter: '↵',
    Escape: 'Esc',
    Backspace: '⌫',
    Delete: '⌦',
    ' ': 'Space',
  }
  keyDisplay = keyDisplayMap[shortcut.key] || shortcut.key.toUpperCase()
  parts.push(keyDisplay)

  return isMac ? parts.join('') : parts.join('+')
}

/**
 * Predefined shortcut definitions for copilot chat
 */
export const COPILOT_SHORTCUTS = {
  NEW_SESSION: {
    key: 'n',
    modifiers: ['meta'] as ModifierKey[],
    description: 'Create new session',
    preventDefault: true,
  },
  DELETE_SESSION: {
    key: 'd',
    modifiers: ['meta', 'shift'] as ModifierKey[],
    description: 'Delete current session',
    preventDefault: true,
  },
  RENAME_SESSION: {
    key: 'e',
    modifiers: ['meta'] as ModifierKey[],
    description: 'Rename current session',
    preventDefault: true,
  },
  SEARCH: {
    key: 'f',
    modifiers: ['meta'] as ModifierKey[],
    description: 'Search messages',
    preventDefault: true,
  },
  FOCUS_INPUT: {
    key: 'k',
    modifiers: ['meta'] as ModifierKey[],
    description: 'Focus chat input',
    preventDefault: true,
  },
  CLEAR_INPUT: {
    key: 'l',
    modifiers: ['meta', 'shift'] as ModifierKey[],
    description: 'Clear chat input',
    preventDefault: true,
  },
  PREV_SESSION: {
    key: 'ArrowUp',
    modifiers: ['alt'] as ModifierKey[],
    description: 'Previous session',
    preventDefault: true,
  },
  NEXT_SESSION: {
    key: 'ArrowDown',
    modifiers: ['alt'] as ModifierKey[],
    description: 'Next session',
    preventDefault: true,
  },
  HELP: {
    key: '/',
    modifiers: ['meta'] as ModifierKey[],
    description: 'Show keyboard shortcuts',
    preventDefault: true,
  },
  CLOSE: {
    key: 'Escape',
    modifiers: [] as ModifierKey[],
    description: 'Close modal / Cancel',
    preventDefault: false,
  },
} as const

export type CopilotShortcutKey = keyof typeof COPILOT_SHORTCUTS
