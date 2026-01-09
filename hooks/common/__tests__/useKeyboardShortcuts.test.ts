import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useKeyboardShortcuts,
  useToolShortcuts,
  useToolWithExport,
  useToolWithHistory,
} from '../useKeyboardShortcuts'

// Mock navigator.platform for consistent testing
const mockNavigatorPlatform = (platform: string) => {
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    writable: true,
    configurable: true,
  })
}

describe('useKeyboardShortcuts', () => {
  let originalPlatform: string

  beforeEach(() => {
    originalPlatform = navigator.platform
    mockNavigatorPlatform('MacIntel')
  })

  afterEach(() => {
    mockNavigatorPlatform(originalPlatform)
    vi.restoreAllMocks()
  })

  it('returns shortcuts array with defined actions', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    const { result } = renderHook(() => useKeyboardShortcuts({ onExecute, onReset }))

    expect(result.current.shortcuts.length).toBeGreaterThan(0)
    expect(result.current.shortcuts.some((s) => s.label === 'Execute')).toBe(true)
    expect(result.current.shortcuts.some((s) => s.label === 'Reset')).toBe(true)
  })

  it('returns correct modifier key for Mac', () => {
    mockNavigatorPlatform('MacIntel')

    const { result } = renderHook(() => useKeyboardShortcuts({ onExecute: vi.fn() }))

    expect(result.current.modifierKey).toBe('⌘')
  })

  it('returns correct modifier key for Windows/Linux', () => {
    mockNavigatorPlatform('Win32')

    const { result } = renderHook(() => useKeyboardShortcuts({ onExecute: vi.fn() }))

    expect(result.current.modifierKey).toBe('Ctrl')
  })

  it('calls onExecute on Cmd+Enter (Mac)', () => {
    mockNavigatorPlatform('MacIntel')
    const onExecute = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onExecute }))

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onExecute).toHaveBeenCalledTimes(1)
  })

  it('calls onExecute on Ctrl+Enter (Windows)', () => {
    mockNavigatorPlatform('Win32')
    const onExecute = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onExecute }))

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onExecute).toHaveBeenCalledTimes(1)
  })

  it('calls onSave on Cmd+S', () => {
    const onSave = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onSave }))

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('calls onReset on Cmd+R', () => {
    const onReset = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onReset }))

    const event = new KeyboardEvent('keydown', {
      key: 'r',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('calls onHistory on Cmd+H', () => {
    const onHistory = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onHistory }))

    const event = new KeyboardEvent('keydown', {
      key: 'h',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onHistory).toHaveBeenCalledTimes(1)
  })

  it('calls onEscape on Escape key', () => {
    const onEscape = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onEscape }))

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('toggles showHelp on Cmd+/', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))

    expect(result.current.showHelp).toBe(false)

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        metaKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)
    })

    expect(result.current.showHelp).toBe(true)
  })

  it('calls custom onHelp instead of toggling showHelp', () => {
    const onHelp = vi.fn()

    const { result } = renderHook(() => useKeyboardShortcuts({ onHelp }))

    const event = new KeyboardEvent('keydown', {
      key: '/',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onHelp).toHaveBeenCalledTimes(1)
    expect(result.current.showHelp).toBe(false)
  })

  it('does not call actions when disabled', () => {
    const onExecute = vi.fn()

    renderHook(() => useKeyboardShortcuts({ onExecute }, { enabled: false }))

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      metaKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(onExecute).not.toHaveBeenCalled()
  })

  it('allows setShowHelp to be called directly', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({}))

    expect(result.current.showHelp).toBe(false)

    act(() => {
      result.current.setShowHelp(true)
    })

    expect(result.current.showHelp).toBe(true)
  })

  it('filters out shortcuts without actions', () => {
    const { result } = renderHook(() => useKeyboardShortcuts({ onExecute: vi.fn() }))

    // Should only include Execute and Help (help always has default action)
    const labels = result.current.shortcuts.map((s) => s.label)
    expect(labels).toContain('Execute')
    expect(labels).toContain('Help')
    expect(labels).not.toContain('Save')
    expect(labels).not.toContain('Copy')
    expect(labels).not.toContain('Reset')
  })

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const onExecute = vi.fn()

    const { unmount } = renderHook(() => useKeyboardShortcuts({ onExecute }))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes event listener when disabled changes to false', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const onExecute = vi.fn()

    const { rerender } = renderHook(
      ({ enabled }) => useKeyboardShortcuts({ onExecute }, { enabled }),
      { initialProps: { enabled: true } }
    )

    rerender({ enabled: false })

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })
})

describe('useToolShortcuts', () => {
  beforeEach(() => {
    mockNavigatorPlatform('MacIntel')
  })

  it('binds onExecute, onReset, and onEscape', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolShortcuts(onExecute, onReset))

    // Test Execute
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onExecute).toHaveBeenCalledTimes(1)

    // Test Reset
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onReset).toHaveBeenCalledTimes(1)

    // Test Escape (bound to onReset)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
    )
    expect(onReset).toHaveBeenCalledTimes(2)
  })

  it('passes options to underlying hook', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolShortcuts(onExecute, onReset, { enabled: false }))

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
      })
    )

    expect(onExecute).not.toHaveBeenCalled()
  })
})

describe('useToolWithHistory', () => {
  beforeEach(() => {
    mockNavigatorPlatform('MacIntel')
  })

  it('binds onExecute, onReset, onToggleHistory, and onEscape', () => {
    const onExecute = vi.fn()
    const onReset = vi.fn()
    const onToggleHistory = vi.fn()

    renderHook(() => useToolWithHistory(onExecute, onReset, onToggleHistory))

    // Test Execute
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onExecute).toHaveBeenCalledTimes(1)

    // Test History
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'h',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onToggleHistory).toHaveBeenCalledTimes(1)

    // Test Reset
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})

describe('useToolWithExport', () => {
  beforeEach(() => {
    mockNavigatorPlatform('MacIntel')
  })

  it('binds onExecute, onCopy, onExport, onReset, and onEscape', () => {
    const onExecute = vi.fn()
    const onCopy = vi.fn()
    const onExport = vi.fn()
    const onReset = vi.fn()

    renderHook(() => useToolWithExport(onExecute, onCopy, onExport, onReset))

    // Test Execute
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onExecute).toHaveBeenCalledTimes(1)

    // Test Save/Export
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onExport).toHaveBeenCalledTimes(1)

    // Test Reset
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'r',
        metaKey: true,
        bubbles: true,
      })
    )
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
