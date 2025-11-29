/**
 * Keyboard shortcuts hook for Split Bill Calculator
 * Provides keyboard navigation and hotkeys
 */

import { useEffect } from 'react'

interface KeyboardShortcuts {
  onAddPerson?: () => void
  onAddItem?: () => void
  onReset?: () => void
  onShare?: () => void
  onSwitchToEqual?: () => void
  onSwitchToPercentage?: () => void
  onSwitchToItems?: () => void
  onClearForm?: () => void
  onExport?: () => void
  enabled?: boolean
}

/**
 * Hook to handle keyboard shortcuts for the split bill calculator
 */
export function useKeyboardShortcuts({
  onAddPerson,
  onAddItem,
  onReset,
  onShare,
  onSwitchToEqual,
  onSwitchToPercentage,
  onSwitchToItems,
  onClearForm,
  onExport,
  enabled = true,
}: KeyboardShortcuts) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape to clear input focus
        if (event.key === 'Escape') {
          target.blur()
          onClearForm?.()
        }
        return
      }

      // Check for modifier keys
      const isMac =
        typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      // Cmd/Ctrl + shortcuts
      if (modifierKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault()
            onShare?.()
            break
          case 'e':
            event.preventDefault()
            onExport?.()
            break
          case 'r':
            event.preventDefault()
            onReset?.()
            break
          default:
            break
        }
        return
      }

      // Alt + shortcuts for split type switching
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            onSwitchToEqual?.()
            break
          case '2':
            event.preventDefault()
            onSwitchToPercentage?.()
            break
          case '3':
            event.preventDefault()
            onSwitchToItems?.()
            break
          default:
            break
        }
        return
      }

      // Simple key shortcuts (no modifiers)
      switch (event.key) {
        case '+':
        case 'p':
          event.preventDefault()
          onAddPerson?.()
          break
        case 'i':
          event.preventDefault()
          onAddItem?.()
          break
        case 'Escape':
          onClearForm?.()
          break
        case '?':
          // Show shortcuts help
          event.preventDefault()
          showShortcutsHelp()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    enabled,
    onAddPerson,
    onAddItem,
    onReset,
    onShare,
    onSwitchToEqual,
    onSwitchToPercentage,
    onSwitchToItems,
    onClearForm,
    onExport,
  ])
}

/**
 * Show keyboard shortcuts help modal/toast
 */
function showShortcutsHelp() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
  const modifierKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    { key: 'P or +', description: 'Add person' },
    { key: 'I', description: 'Add item (in item mode)' },
    { key: 'Alt+1', description: 'Switch to equal split' },
    { key: 'Alt+2', description: 'Switch to percentage split' },
    { key: 'Alt+3', description: 'Switch to item-based split' },
    { key: `${modifierKey}+S`, description: 'Share summary' },
    { key: `${modifierKey}+E`, description: 'Export bill' },
    { key: `${modifierKey}+R`, description: 'Reset bill' },
    { key: 'Esc', description: 'Clear form/unfocus input' },
    { key: '?', description: 'Show this help' },
  ]

  // Create a simple alert for now (can be replaced with a modal later)
  const message = shortcuts.map((s) => `${s.key}: ${s.description}`).join('\n')

  // Use a custom event that the parent component can listen to
  window.dispatchEvent(
    new CustomEvent('show-shortcuts-help', {
      detail: { shortcuts },
    })
  )

  // Fallback to alert if no listener
  setTimeout(() => {
    if (typeof window !== 'undefined' && !document.querySelector('[data-shortcuts-modal]')) {
      alert(`⌨️ Keyboard Shortcuts:\n\n${message}`)
    }
  }, 100)
}

/**
 * Get keyboard shortcuts list for display
 */
export function getKeyboardShortcuts(): Array<{
  key: string
  description: string
  category: string
}> {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC')
  const modifierKey = isMac ? '⌘' : 'Ctrl'

  return [
    { key: 'P or +', description: 'Add person', category: 'Actions' },
    { key: 'I', description: 'Add item (item mode)', category: 'Actions' },
    { key: 'Alt+1', description: 'Equal split', category: 'Split Type' },
    { key: 'Alt+2', description: 'Percentage split', category: 'Split Type' },
    { key: 'Alt+3', description: 'Item-based split', category: 'Split Type' },
    {
      key: `${modifierKey}+S`,
      description: 'Share summary',
      category: 'Actions',
    },
    {
      key: `${modifierKey}+E`,
      description: 'Export bill',
      category: 'Actions',
    },
    { key: `${modifierKey}+R`, description: 'Reset bill', category: 'Actions' },
    { key: 'Esc', description: 'Clear/unfocus', category: 'Navigation' },
    { key: '?', description: 'Show shortcuts', category: 'Help' },
  ]
}
