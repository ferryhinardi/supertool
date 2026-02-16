import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COPILOT_SHORTCUTS,
  formatShortcut,
  type KeyboardShortcut,
  useKeyboardShortcuts,
} from '../use-keyboard-shortcuts'

describe('useKeyboardShortcuts', () => {
  let originalNavigator: typeof navigator

  beforeEach(() => {
    originalNavigator = global.navigator
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  function mockNavigator(platform: string) {
    Object.defineProperty(global, 'navigator', {
      value: { platform },
      writable: true,
    })
  }

  function createKeyboardEvent(
    key: string,
    options: Partial<KeyboardEventInit> = {}
  ): KeyboardEvent {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ...options,
    })
  }

  function dispatchKey(key: string, options: Partial<KeyboardEventInit> = {}): void {
    document.dispatchEvent(createKeyboardEvent(key, options))
  }

  describe('basic functionality', () => {
    it('triggers handler when correct key is pressed', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('Escape')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('does not trigger handler for different key', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('Enter')

      expect(handler).not.toHaveBeenCalled()
    })

    it('triggers correct handler when multiple shortcuts defined', () => {
      const escapeHandler = vi.fn()
      const enterHandler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Escape', handler: escapeHandler },
        { key: 'Enter', handler: enterHandler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('Enter')

      expect(escapeHandler).not.toHaveBeenCalled()
      expect(enterHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('modifier keys', () => {
    it('triggers handler when meta modifier matches (Mac)', () => {
      mockNavigator('MacIntel')
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'n', modifiers: ['meta'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('n', { metaKey: true })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('triggers handler when ctrl modifier matches (Windows)', () => {
      mockNavigator('Win32')
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'n', modifiers: ['meta'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('n', { ctrlKey: true })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('does not trigger handler when modifiers do not match', () => {
      mockNavigator('MacIntel')
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'n', modifiers: ['meta'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Press 'n' without meta key
      dispatchKey('n')

      expect(handler).not.toHaveBeenCalled()
    })

    it('handles shift modifier correctly', () => {
      mockNavigator('MacIntel')
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'd', modifiers: ['meta', 'shift'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Without shift - should not trigger
      dispatchKey('d', { metaKey: true })
      expect(handler).not.toHaveBeenCalled()

      // With shift - should trigger
      dispatchKey('d', { metaKey: true, shiftKey: true })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('handles alt modifier correctly', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'ArrowUp', modifiers: ['alt'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Without alt - should not trigger
      dispatchKey('ArrowUp')
      expect(handler).not.toHaveBeenCalled()

      // With alt - should trigger
      dispatchKey('ArrowUp', { altKey: true })
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('does not trigger when extra modifiers are pressed', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'n', modifiers: ['meta'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Meta+Shift+N when only Meta+N is expected
      dispatchKey('n', { metaKey: true, shiftKey: true })

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('input element handling', () => {
    it('does not trigger shortcut without modifiers when typing in input', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'n', handler }, // No modifiers
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Create input element and focus it
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      // Dispatch event with input as target
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, writable: false })
      document.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()

      document.body.removeChild(input)
    })

    it('triggers shortcut with modifiers even when typing in input', () => {
      mockNavigator('MacIntel')
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'n', modifiers: ['meta'], handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      // Create input element
      const input = document.createElement('input')
      document.body.appendChild(input)

      // Dispatch event with input as target but with meta key
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        metaKey: true,
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: input, writable: false })
      document.dispatchEvent(event)

      expect(handler).toHaveBeenCalledTimes(1)

      document.body.removeChild(input)
    })

    it('handles textarea elements the same as input', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Escape', handler }, // No modifiers
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      Object.defineProperty(event, 'target', { value: textarea, writable: false })
      document.dispatchEvent(event)

      // Escape has no modifiers, but it should still work as it's a special key
      // Actually, based on the hook logic, shortcuts without modifiers are skipped in inputs
      expect(handler).not.toHaveBeenCalled()

      document.body.removeChild(textarea)
    })
  })

  describe('enabled option', () => {
    it('does not trigger when enabled is false', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }))

      dispatchKey('Escape')

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not trigger when individual shortcut is disabled', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler, enabled: false }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      dispatchKey('Escape')

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('preventDefault', () => {
    it('prevents default by default', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = createKeyboardEvent('Escape')
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does not prevent default when preventDefault is false', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [{ key: 'Escape', handler, preventDefault: false }]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      const event = createKeyboardEvent('Escape')
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })
})

describe('formatShortcut', () => {
  let originalNavigator: typeof navigator

  beforeEach(() => {
    originalNavigator = global.navigator
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  function mockNavigator(platform: string) {
    Object.defineProperty(global, 'navigator', {
      value: { platform },
      writable: true,
    })
  }

  describe('Mac formatting', () => {
    beforeEach(() => {
      mockNavigator('MacIntel')
    })

    it('formats meta modifier as Command symbol', () => {
      const result = formatShortcut({ key: 'n', modifiers: ['meta'] })
      expect(result).toBe('⌘N')
    })

    it('formats alt modifier as Option symbol', () => {
      const result = formatShortcut({ key: 'ArrowUp', modifiers: ['alt'] })
      expect(result).toBe('⌥↑')
    })

    it('formats shift modifier as Shift symbol', () => {
      const result = formatShortcut({ key: 'd', modifiers: ['meta', 'shift'] })
      expect(result).toBe('⌘⇧D')
    })

    it('formats multiple modifiers correctly', () => {
      const result = formatShortcut({ key: 'l', modifiers: ['meta', 'shift'] })
      expect(result).toBe('⌘⇧L')
    })

    it('formats special keys correctly', () => {
      expect(formatShortcut({ key: 'ArrowUp' })).toBe('↑')
      expect(formatShortcut({ key: 'ArrowDown' })).toBe('↓')
      expect(formatShortcut({ key: 'Escape' })).toBe('Esc')
      expect(formatShortcut({ key: 'Enter' })).toBe('↵')
    })
  })

  describe('Windows formatting', () => {
    beforeEach(() => {
      mockNavigator('Win32')
    })

    it('formats meta modifier as Ctrl', () => {
      const result = formatShortcut({ key: 'n', modifiers: ['meta'] })
      expect(result).toBe('Ctrl+N')
    })

    it('formats alt modifier as Alt', () => {
      const result = formatShortcut({ key: 'ArrowUp', modifiers: ['alt'] })
      expect(result).toBe('Alt+↑')
    })

    it('formats shift modifier as Shift', () => {
      const result = formatShortcut({ key: 'd', modifiers: ['meta', 'shift'] })
      expect(result).toBe('Ctrl+Shift+D')
    })

    it('uses plus separator for multiple parts', () => {
      const result = formatShortcut({ key: 'l', modifiers: ['meta', 'alt', 'shift'] })
      expect(result).toBe('Ctrl+Alt+Shift+L')
    })
  })

  describe('key without modifiers', () => {
    it('formats simple key uppercase', () => {
      mockNavigator('MacIntel')
      const result = formatShortcut({ key: '/' })
      expect(result).toBe('/')
    })

    it('formats lowercase keys as uppercase', () => {
      mockNavigator('MacIntel')
      const result = formatShortcut({ key: 'n' })
      expect(result).toBe('N')
    })
  })
})

describe('COPILOT_SHORTCUTS', () => {
  it('defines all expected shortcuts', () => {
    expect(COPILOT_SHORTCUTS).toHaveProperty('NEW_SESSION')
    expect(COPILOT_SHORTCUTS).toHaveProperty('DELETE_SESSION')
    expect(COPILOT_SHORTCUTS).toHaveProperty('RENAME_SESSION')
    expect(COPILOT_SHORTCUTS).toHaveProperty('SEARCH')
    expect(COPILOT_SHORTCUTS).toHaveProperty('FOCUS_INPUT')
    expect(COPILOT_SHORTCUTS).toHaveProperty('CLEAR_INPUT')
    expect(COPILOT_SHORTCUTS).toHaveProperty('PREV_SESSION')
    expect(COPILOT_SHORTCUTS).toHaveProperty('NEXT_SESSION')
    expect(COPILOT_SHORTCUTS).toHaveProperty('HELP')
    expect(COPILOT_SHORTCUTS).toHaveProperty('CLOSE')
  })

  it('NEW_SESSION uses meta+n', () => {
    expect(COPILOT_SHORTCUTS.NEW_SESSION.key).toBe('n')
    expect(COPILOT_SHORTCUTS.NEW_SESSION.modifiers).toContain('meta')
  })

  it('DELETE_SESSION uses meta+shift+d', () => {
    expect(COPILOT_SHORTCUTS.DELETE_SESSION.key).toBe('d')
    expect(COPILOT_SHORTCUTS.DELETE_SESSION.modifiers).toContain('meta')
    expect(COPILOT_SHORTCUTS.DELETE_SESSION.modifiers).toContain('shift')
  })

  it('CLOSE uses Escape without modifiers', () => {
    expect(COPILOT_SHORTCUTS.CLOSE.key).toBe('Escape')
    expect(COPILOT_SHORTCUTS.CLOSE.modifiers).toEqual([])
    expect(COPILOT_SHORTCUTS.CLOSE.preventDefault).toBe(false)
  })

  it('all shortcuts have descriptions', () => {
    for (const key of Object.keys(COPILOT_SHORTCUTS)) {
      const shortcut = COPILOT_SHORTCUTS[key as keyof typeof COPILOT_SHORTCUTS]
      expect(shortcut.description).toBeDefined()
      expect(shortcut.description.length).toBeGreaterThan(0)
    }
  })
})
