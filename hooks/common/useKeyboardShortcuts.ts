/**
 * Universal keyboard shortcuts hook for SuperTool
 * Provides consistent keyboard navigation across all tools
 *
 * Standard shortcuts:
 * - Cmd/Ctrl+Enter: Execute/Process main action
 * - Cmd/Ctrl+S: Save/Export result
 * - Cmd/Ctrl+C: Copy result to clipboard
 * - Cmd/Ctrl+R: Reset/Clear form
 * - Cmd/Ctrl+K: Open tool search (global)
 * - Cmd/Ctrl+H: Toggle history panel
 * - Escape: Clear/Cancel operation
 * - Cmd/Ctrl+/: Show keyboard shortcuts help
 */

import { useCallback, useEffect, useState } from 'react'

export interface KeyboardShortcutActions {
  onExecute?: () => void // Cmd/Ctrl+Enter - Main action
  onSave?: () => void // Cmd/Ctrl+S - Save/Export
  onCopy?: () => void // Cmd/Ctrl+C - Copy result
  onReset?: () => void // Cmd/Ctrl+R - Reset/Clear
  onHistory?: () => void // Cmd/Ctrl+H - Toggle history
  onEscape?: () => void // Escape - Cancel/Clear
  onHelp?: () => void // Cmd/Ctrl+/ - Show shortcuts
}

export interface KeyboardShortcutOptions {
  enabled?: boolean // Enable/disable shortcuts (default: true)
  preventDefault?: boolean // Prevent default browser behavior (default: true)
  allowInInputs?: boolean // Allow shortcuts when focus is in input/textarea (default: false)
}

interface ShortcutInfo {
  key: string
  label: string
  description: string
  action?: () => void
}

export function useKeyboardShortcuts(
  actions: KeyboardShortcutActions,
  options: KeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true, allowInInputs = false } = options
  const [showHelp, setShowHelp] = useState(false)

  // Get platform-specific modifier key
  const isMac =
    typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modifierKey = isMac ? '⌘' : 'Ctrl'

  // Define all available shortcuts with their info
  const shortcuts: ShortcutInfo[] = [
    {
      key: `${modifierKey}+Enter`,
      label: 'Execute',
      description: 'Process or execute main action',
      action: actions.onExecute,
    },
    {
      key: `${modifierKey}+S`,
      label: 'Save',
      description: 'Save or export result',
      action: actions.onSave,
    },
    {
      key: `${modifierKey}+C`,
      label: 'Copy',
      description: 'Copy result to clipboard',
      action: actions.onCopy,
    },
    {
      key: `${modifierKey}+R`,
      label: 'Reset',
      description: 'Reset or clear form',
      action: actions.onReset,
    },
    {
      key: `${modifierKey}+H`,
      label: 'History',
      description: 'Toggle history panel',
      action: actions.onHistory,
    },
    {
      key: 'Escape',
      label: 'Cancel',
      description: 'Cancel or clear operation',
      action: actions.onEscape,
    },
    {
      key: `${modifierKey}+/`,
      label: 'Help',
      description: 'Show keyboard shortcuts',
      action: actions.onHelp || (() => setShowHelp(!showHelp)),
    },
  ].filter((shortcut) => shortcut.action !== undefined)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Check if we're in an input/textarea/select
      const target = event.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      // Skip if in input and not allowed
      if (isInput && !allowInInputs && event.key !== 'Escape') {
        return
      }

      const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMacOS ? event.metaKey : event.ctrlKey

      // Cmd/Ctrl+Enter - Execute
      if (modifier && event.key === 'Enter' && actions.onExecute) {
        if (preventDefault) event.preventDefault()
        actions.onExecute()
        return
      }

      // Cmd/Ctrl+S - Save
      if (modifier && event.key === 's' && actions.onSave) {
        if (preventDefault) event.preventDefault()
        actions.onSave()
        return
      }

      // Cmd/Ctrl+C - Copy (only if not in input or selection exists)
      if (modifier && event.key === 'c' && actions.onCopy) {
        const hasSelection = window.getSelection()?.toString().length || 0
        if (!hasSelection && !isInput) {
          if (preventDefault) event.preventDefault()
          actions.onCopy()
        }
        return
      }

      // Cmd/Ctrl+R - Reset
      if (modifier && event.key === 'r' && actions.onReset) {
        if (preventDefault) event.preventDefault()
        actions.onReset()
        return
      }

      // Cmd/Ctrl+H - History
      if (modifier && event.key === 'h' && actions.onHistory) {
        if (preventDefault) event.preventDefault()
        actions.onHistory()
        return
      }

      // Escape - Cancel
      if (event.key === 'Escape' && actions.onEscape) {
        if (preventDefault) event.preventDefault()
        actions.onEscape()
        return
      }

      // Cmd/Ctrl+/ - Help
      if (modifier && event.key === '/' && (actions.onHelp || true)) {
        if (preventDefault) event.preventDefault()
        if (actions.onHelp) {
          actions.onHelp()
        } else {
          setShowHelp((prev) => !prev)
        }
        return
      }
    },
    [enabled, preventDefault, allowInInputs, actions]
  )

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [enabled, handleKeyDown])

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    modifierKey,
  }
}

/**
 * Simplified hook for tools that only need execute + reset
 */
export function useToolShortcuts(
  onExecute: () => void,
  onReset: () => void,
  options?: KeyboardShortcutOptions
) {
  return useKeyboardShortcuts(
    {
      onExecute,
      onReset,
      onEscape: onReset,
    },
    options
  )
}

/**
 * Hook for tools with history feature
 */
export function useToolWithHistory(
  onExecute: () => void,
  onReset: () => void,
  onToggleHistory: () => void,
  options?: KeyboardShortcutOptions
) {
  return useKeyboardShortcuts(
    {
      onExecute,
      onReset,
      onHistory: onToggleHistory,
      onEscape: onReset,
    },
    options
  )
}

/**
 * Hook for tools with copy + export functionality
 */
export function useToolWithExport(
  onExecute: () => void,
  onCopy: () => void,
  onExport: () => void,
  onReset: () => void,
  options?: KeyboardShortcutOptions
) {
  return useKeyboardShortcuts(
    {
      onExecute,
      onCopy,
      onSave: onExport,
      onReset,
      onEscape: onReset,
    },
    options
  )
}
