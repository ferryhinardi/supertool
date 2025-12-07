import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { KeyboardShortcutActions } from '../useKeyboardShortcuts'
import {
  useKeyboardShortcuts,
  useToolShortcuts,
  useToolWithExport,
  useToolWithHistory,
} from '../useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockActions: KeyboardShortcutActions

  beforeEach(() => {
    mockActions = {
      onExecute: vi.fn(),
      onSave: vi.fn(),
      onCopy: vi.fn(),
      onReset: vi.fn(),
      onHistory: vi.fn(),
      onEscape: vi.fn(),
      onHelp: vi.fn(),
    }
    vi.clearAllMocks()
  })

  const createKeyboardEvent = (
    key: string,
    modifiers: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean } = {}
  ): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      metaKey: modifiers.metaKey || false,
      ctrlKey: modifiers.ctrlKey || false,
      shiftKey: modifiers.shiftKey || false,
      bubbles: true,
    })
  }

  describe('initialization', () => {
    it('should return shortcuts, showHelp state, and modifierKey', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(mockActions))

      expect(result.current).toHaveProperty('shortcuts')
      expect(result.current).toHaveProperty('showHelp')
      expect(result.current).toHaveProperty('setShowHelp')
      expect(result.current).toHaveProperty('modifierKey')
    })

    it('should filter out shortcuts without actions', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          onExecute: mockActions.onExecute,
          // Only onExecute is provided
        })
      )

      expect(result.current.shortcuts.length).toBe(2) // onExecute + default onHelp
    })

    it('should include all shortcuts when all actions provided', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(mockActions))

      expect(result.current.shortcuts.length).toBe(7) // All 7 shortcuts
    })

    it('should set correct modifier key for Mac', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      })

      const { result } = renderHook(() => useKeyboardShortcuts(mockActions))

      expect(result.current.modifierKey).toBe('⌘')
    })

    it('should set correct modifier key for Windows', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
      })

      const { result } = renderHook(() => useKeyboardShortcuts(mockActions))

      expect(result.current.modifierKey).toBe('Ctrl')
    })
  })

  describe('keyboard event handling', () => {
    it('should call onExecute on Cmd/Ctrl+Enter', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('Enter', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onExecute).toHaveBeenCalledTimes(1)
    })

    it('should call onSave on Cmd/Ctrl+S', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('s', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onSave).toHaveBeenCalledTimes(1)
    })

    it('should call onCopy on Cmd/Ctrl+C when no selection', () => {
      window.getSelection = vi.fn().mockReturnValue({ toString: () => '' })

      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('c', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onCopy).toHaveBeenCalledTimes(1)
    })

    it('should not call onCopy when there is text selection', () => {
      window.getSelection = vi.fn().mockReturnValue({ toString: () => 'selected text' })

      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('c', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onCopy).not.toHaveBeenCalled()
    })

    it('should call onReset on Cmd/Ctrl+R', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('r', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onReset).toHaveBeenCalledTimes(1)
    })

    it('should call onHistory on Cmd/Ctrl+H', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('h', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onHistory).toHaveBeenCalledTimes(1)
    })

    it('should call onEscape on Escape key', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('Escape')
      window.dispatchEvent(event)

      expect(mockActions.onEscape).toHaveBeenCalledTimes(1)
    })

    it('should call onHelp on Cmd/Ctrl+/', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('/', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onHelp).toHaveBeenCalledTimes(1)
    })
  })

  describe('options', () => {
    it('should not handle shortcuts when enabled is false', () => {
      renderHook(() => useKeyboardShortcuts(mockActions, { enabled: false }))

      const event = createKeyboardEvent('Enter', { ctrlKey: true })
      window.dispatchEvent(event)

      expect(mockActions.onExecute).not.toHaveBeenCalled()
    })

    it('should not prevent default when preventDefault is false', () => {
      renderHook(() => useKeyboardShortcuts(mockActions, { preventDefault: false }))

      const event = createKeyboardEvent('s', { ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should prevent default by default', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const event = createKeyboardEvent('s', { ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not handle shortcuts in inputs by default', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(mockActions.onSave).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should handle shortcuts in inputs when allowInInputs is true', () => {
      renderHook(() => useKeyboardShortcuts(mockActions, { allowInInputs: true }))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(mockActions.onSave).toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('should always handle Escape in inputs', () => {
      renderHook(() => useKeyboardShortcuts(mockActions, { allowInInputs: false }))

      const input = document.createElement('input')
      document.body.appendChild(input)

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, enumerable: true })

      window.dispatchEvent(event)

      expect(mockActions.onEscape).toHaveBeenCalled()

      document.body.removeChild(input)
    })
  })

  describe('showHelp state', () => {
    it('should toggle showHelp when no onHelp action is provided', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          onExecute: mockActions.onExecute,
        })
      )

      expect(result.current.showHelp).toBe(false)

      const event = createKeyboardEvent('/', { ctrlKey: true })
      act(() => {
        window.dispatchEvent(event)
      })

      // State update should toggle showHelp
      expect(result.current.showHelp).toBe(true)
    })

    it('should allow manually setting showHelp', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(mockActions))

      expect(result.current.showHelp).toBe(false)

      // Use act to wrap state update
      act(() => {
        result.current.setShowHelp(true)
      })

      expect(result.current.showHelp).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useKeyboardShortcuts(mockActions))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should not add listener when disabled', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() => useKeyboardShortcuts(mockActions, { enabled: false }))

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })
})

describe('useToolShortcuts', () => {
  it('should set up execute and reset shortcuts', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    const { result } = renderHook(() => useToolShortcuts(onExecute, onReset))

    expect(result.current.shortcuts.length).toBeGreaterThan(0)
  })

  it('should call onExecute on Cmd/Ctrl+Enter', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolShortcuts(onExecute, onReset))

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onExecute).toHaveBeenCalled()
  })

  it('should call onReset on Cmd/Ctrl+R', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolShortcuts(onExecute, onReset))

    const event = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onReset).toHaveBeenCalled()
  })

  it('should call onReset on Escape', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolShortcuts(onExecute, onReset))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onReset).toHaveBeenCalled()
  })
})

describe('useToolWithHistory', () => {
  it('should set up execute, reset, and history shortcuts', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()
    const onToggleHistory = vi.fn()

    const { result } = renderHook(() => useToolWithHistory(onExecute, onReset, onToggleHistory))

    expect(result.current.shortcuts.length).toBeGreaterThan(0)
  })

  it('should call onToggleHistory on Cmd/Ctrl+H', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()
    const onToggleHistory = vi.fn()

    renderHook(() => useToolWithHistory(onExecute, onReset, onToggleHistory))

    const event = new KeyboardEvent('keydown', {
      key: 'h',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onToggleHistory).toHaveBeenCalled()
  })
})

describe('useToolWithExport', () => {
  it('should set up all export-related shortcuts', () => {
    const onExecute = vi.fn()
    const onCopy = vi.fn()
    const onExport = vi.fn()
    const onReset = vi.fn()

    const { result } = renderHook(() => useToolWithExport(onExecute, onCopy, onExport, onReset))

    expect(result.current.shortcuts.length).toBeGreaterThan(0)
  })

  it('should call onCopy on Cmd/Ctrl+C', () => {
    window.getSelection = vi.fn().mockReturnValue({ toString: () => '' })

    const onExecute = vi.fn()
    const onCopy = vi.fn()
    const onExport = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolWithExport(onExecute, onCopy, onExport, onReset))

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onCopy).toHaveBeenCalled()
  })

  it('should call onExport on Cmd/Ctrl+S', () => {
    const onExecute = vi.fn()
    const onCopy = vi.fn()
    const onExport = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolWithExport(onExecute, onCopy, onExport, onReset))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onExport).toHaveBeenCalled()
  })
})
