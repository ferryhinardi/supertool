/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getKeyboardShortcuts, useKeyboardShortcuts } from '../split-bill-shortcuts'

describe('split-bill-shortcuts', () => {
  let mockCallbacks: {
    onAddPerson: () => void
    onAddItem: () => void
    onReset: () => void
    onShare: () => void
    onSwitchToEqual: () => void
    onSwitchToPercentage: () => void
    onSwitchToItems: () => void
    onClearForm: () => void
    onExport: () => void
  }

  beforeEach(() => {
    mockCallbacks = {
      onAddPerson: vi.fn(),
      onAddItem: vi.fn(),
      onReset: vi.fn(),
      onShare: vi.fn(),
      onSwitchToEqual: vi.fn(),
      onSwitchToPercentage: vi.fn(),
      onSwitchToItems: vi.fn(),
      onClearForm: vi.fn(),
      onExport: vi.fn(),
    }

    // Setup default navigator with all required properties
    Object.defineProperty(window, 'navigator', {
      writable: true,
      configurable: true,
      value: {
        platform: 'Win32',
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
          readText: vi.fn().mockResolvedValue(''),
        },
        userAgent: 'Mozilla/5.0',
      },
    })

    // Mock alert and other DOM methods
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('useKeyboardShortcuts hook', () => {
    it('should register event listener when enabled', () => {
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, enabled: true }))

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should not register event listener when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, enabled: false }))

      // When disabled, the hook still registers listener but returns early
      const event = new KeyboardEvent('keydown', { key: 'p' })
      window.dispatchEvent(event)

      // Callbacks should not be called when disabled
      expect(mockCallbacks.onAddPerson).not.toHaveBeenCalled()
    })

    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts(mockCallbacks))

      unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    describe('simple key shortcuts', () => {
      it('should call onAddPerson when "+" is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: '+' })
        window.dispatchEvent(event)

        expect(mockCallbacks.onAddPerson).toHaveBeenCalledTimes(1)
      })

      it('should call onAddPerson when "p" is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'p' })
        window.dispatchEvent(event)

        expect(mockCallbacks.onAddPerson).toHaveBeenCalledTimes(1)
      })

      it('should call onAddItem when "i" is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'i' })
        window.dispatchEvent(event)

        expect(mockCallbacks.onAddItem).toHaveBeenCalledTimes(1)
      })

      it('should call onClearForm when Escape is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'Escape' })
        window.dispatchEvent(event)

        expect(mockCallbacks.onClearForm).toHaveBeenCalledTimes(1)
      })

      it('should handle "?" key to show shortcuts help', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
        const event = new KeyboardEvent('keydown', { key: '?' })
        window.dispatchEvent(event)

        // Should dispatch custom event
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'show-shortcuts-help',
          })
        )
      })
    })

    describe('Ctrl/Cmd + key shortcuts', () => {
      it('should call onShare when Ctrl+S is pressed (Windows)', () => {
        Object.defineProperty(window, 'navigator', {
          writable: true,
          value: { platform: 'Win32' },
        })

        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onShare).toHaveBeenCalledTimes(1)
      })

      it('should call onShare when Cmd+S is pressed (Mac)', () => {
        Object.defineProperty(window, 'navigator', {
          writable: true,
          value: { platform: 'MacIntel' },
        })

        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 's', metaKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onShare).toHaveBeenCalledTimes(1)
      })

      it('should call onExport when Ctrl+E is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'e', ctrlKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onExport).toHaveBeenCalledTimes(1)
      })

      it('should call onReset when Ctrl+R is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onReset).toHaveBeenCalledTimes(1)
      })

      it('should handle lowercase keys with Ctrl modifier', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: 'S', ctrlKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onShare).toHaveBeenCalledTimes(1)
      })
    })

    describe('Alt + key shortcuts', () => {
      it('should call onSwitchToEqual when Alt+1 is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: '1', altKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onSwitchToEqual).toHaveBeenCalledTimes(1)
      })

      it('should call onSwitchToPercentage when Alt+2 is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: '2', altKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onSwitchToPercentage).toHaveBeenCalledTimes(1)
      })

      it('should call onSwitchToItems when Alt+3 is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: '3', altKey: true })
        Object.defineProperty(event, 'preventDefault', {
          writable: false,
          value: vi.fn(),
        })
        window.dispatchEvent(event)

        expect(mockCallbacks.onSwitchToItems).toHaveBeenCalledTimes(1)
      })

      it('should not trigger callbacks for Alt+other keys', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const event = new KeyboardEvent('keydown', { key: '4', altKey: true })
        window.dispatchEvent(event)

        expect(mockCallbacks.onSwitchToEqual).not.toHaveBeenCalled()
        expect(mockCallbacks.onSwitchToPercentage).not.toHaveBeenCalled()
        expect(mockCallbacks.onSwitchToItems).not.toHaveBeenCalled()
      })
    })

    describe('input field detection', () => {
      it('should not trigger shortcuts when typing in INPUT', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const input = document.createElement('input')
        document.body.appendChild(input)

        const event = new KeyboardEvent('keydown', {
          key: 'p',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          writable: false,
          value: input,
        })

        input.dispatchEvent(event)

        expect(mockCallbacks.onAddPerson).not.toHaveBeenCalled()

        document.body.removeChild(input)
      })

      it('should not trigger shortcuts when typing in TEXTAREA', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)

        const event = new KeyboardEvent('keydown', {
          key: 'i',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          writable: false,
          value: textarea,
        })

        textarea.dispatchEvent(event)

        expect(mockCallbacks.onAddItem).not.toHaveBeenCalled()

        document.body.removeChild(textarea)
      })

      it('should not trigger shortcuts when typing in SELECT', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const select = document.createElement('select')
        document.body.appendChild(select)

        const event = new KeyboardEvent('keydown', {
          key: 'p',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          writable: false,
          value: select,
        })

        select.dispatchEvent(event)

        expect(mockCallbacks.onAddPerson).not.toHaveBeenCalled()

        document.body.removeChild(select)
      })

      it('should not trigger shortcuts in contentEditable elements', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const div = document.createElement('div')
        div.contentEditable = 'true'
        document.body.appendChild(div)

        // Manually set isContentEditable since jsdom might not set it automatically
        Object.defineProperty(div, 'isContentEditable', {
          writable: false,
          value: true,
        })

        const event = new KeyboardEvent('keydown', {
          key: 'i',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          writable: false,
          value: div,
        })

        div.dispatchEvent(event)

        expect(mockCallbacks.onAddItem).not.toHaveBeenCalled()

        document.body.removeChild(div)
      })

      it('should blur input and call onClearForm when Escape is pressed in input', () => {
        renderHook(() => useKeyboardShortcuts(mockCallbacks))

        const input = document.createElement('input')
        document.body.appendChild(input)
        const blurSpy = vi.spyOn(input, 'blur')

        const event = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        })
        Object.defineProperty(event, 'target', {
          writable: false,
          value: input,
        })

        input.dispatchEvent(event)

        expect(blurSpy).toHaveBeenCalledTimes(1)
        expect(mockCallbacks.onClearForm).toHaveBeenCalledTimes(1)

        document.body.removeChild(input)
      })
    })

    describe('disabled state', () => {
      it('should not trigger callbacks when disabled', () => {
        renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, enabled: false }))

        const event = new KeyboardEvent('keydown', { key: 'p' })
        window.dispatchEvent(event)

        expect(mockCallbacks.onAddPerson).not.toHaveBeenCalled()
      })

      it('should re-enable when prop changes', () => {
        const { rerender } = renderHook(
          ({ enabled }) => useKeyboardShortcuts({ ...mockCallbacks, enabled }),
          { initialProps: { enabled: false } }
        )

        // Initially disabled
        let event = new KeyboardEvent('keydown', { key: 'p' })
        window.dispatchEvent(event)
        expect(mockCallbacks.onAddPerson).not.toHaveBeenCalled()

        // Enable
        rerender({ enabled: true })

        event = new KeyboardEvent('keydown', { key: 'p' })
        window.dispatchEvent(event)
        expect(mockCallbacks.onAddPerson).toHaveBeenCalledTimes(1)
      })
    })

    describe('optional callbacks', () => {
      it('should not throw when callbacks are undefined', () => {
        renderHook(() => useKeyboardShortcuts({}))

        expect(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }))
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'i' }))
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        }).not.toThrow()
      })
    })
  })

  describe('getKeyboardShortcuts', () => {
    it('should return array of shortcuts', () => {
      const shortcuts = getKeyboardShortcuts()

      expect(Array.isArray(shortcuts)).toBe(true)
      expect(shortcuts.length).toBeGreaterThan(0)
    })

    it('should return shortcuts with required fields', () => {
      const shortcuts = getKeyboardShortcuts()

      shortcuts.forEach((shortcut) => {
        expect(shortcut).toHaveProperty('key')
        expect(shortcut).toHaveProperty('description')
        expect(shortcut).toHaveProperty('category')
        expect(typeof shortcut.key).toBe('string')
        expect(typeof shortcut.description).toBe('string')
        expect(typeof shortcut.category).toBe('string')
      })
    })

    it('should return 10 shortcuts', () => {
      const shortcuts = getKeyboardShortcuts()
      expect(shortcuts).toHaveLength(10)
    })

    it('should use Ctrl modifier on Windows', () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: { platform: 'Win32' },
      })

      const shortcuts = getKeyboardShortcuts()
      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')

      expect(shareShortcut?.key).toContain('Ctrl')
      expect(shareShortcut?.key).not.toContain('⌘')
    })

    it('should use Cmd modifier on Mac', () => {
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: { platform: 'MacIntel' },
      })

      const shortcuts = getKeyboardShortcuts()
      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')

      expect(shareShortcut?.key).toContain('⌘')
      expect(shareShortcut?.key).not.toContain('Ctrl')
    })

    it('should categorize shortcuts correctly', () => {
      const shortcuts = getKeyboardShortcuts()

      const categories = [...new Set(shortcuts.map((s) => s.category))]
      expect(categories).toContain('Actions')
      expect(categories).toContain('Split Type')
      expect(categories).toContain('Navigation')
      expect(categories).toContain('Help')
    })

    it('should include all expected shortcut keys', () => {
      const shortcuts = getKeyboardShortcuts()
      const keys = shortcuts.map((s) => s.key)

      expect(keys).toContain('P or +')
      expect(keys).toContain('I')
      expect(keys).toContain('Alt+1')
      expect(keys).toContain('Alt+2')
      expect(keys).toContain('Alt+3')
      expect(keys).toContain('Esc')
      expect(keys).toContain('?')
    })

    it('should include modifier-based shortcuts', () => {
      const shortcuts = getKeyboardShortcuts()
      const descriptions = shortcuts.map((s) => s.description)

      expect(descriptions).toContain('Share summary')
      expect(descriptions).toContain('Export bill')
      expect(descriptions).toContain('Reset bill')
    })

    it('should handle undefined navigator gracefully', () => {
      const originalNavigator = window.navigator
      Object.defineProperty(window, 'navigator', {
        writable: true,
        configurable: true,
        value: undefined,
      })

      expect(() => getKeyboardShortcuts()).not.toThrow()

      // Restore navigator
      Object.defineProperty(window, 'navigator', {
        writable: true,
        configurable: true,
        value: originalNavigator,
      })
    })
  })

  describe('showShortcutsHelp (via "?" key)', () => {
    it('should dispatch custom event when "?" is pressed', () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')
      const event = new KeyboardEvent('keydown', { key: '?' })
      window.dispatchEvent(event)

      expect(dispatchEventSpy).toHaveBeenCalled()
      const customEvent = dispatchEventSpy.mock.calls.find(
        (call) => call[0].type === 'show-shortcuts-help'
      )
      expect(customEvent).toBeDefined()
    })

    it('should include shortcuts in custom event detail', () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))

      let eventDetail: any = null
      window.addEventListener('show-shortcuts-help', ((e: CustomEvent) => {
        eventDetail = e.detail
      }) as EventListener)

      const event = new KeyboardEvent('keydown', { key: '?' })
      window.dispatchEvent(event)

      expect(eventDetail).toBeDefined()
      expect(eventDetail.shortcuts).toBeDefined()
      expect(Array.isArray(eventDetail.shortcuts)).toBe(true)
    })

    it('should show alert fallback if no modal exists', async () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))

      const alertSpy = vi.spyOn(window, 'alert')
      const event = new KeyboardEvent('keydown', { key: '?' })
      window.dispatchEvent(event)

      // Wait for setTimeout
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(alertSpy).toHaveBeenCalled()
      expect(alertSpy.mock.calls[0][0]).toContain('Keyboard Shortcuts')
    })

    it('should not show alert if modal element exists', async () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))

      const modal = document.createElement('div')
      modal.setAttribute('data-shortcuts-modal', 'true')
      document.body.appendChild(modal)

      const alertSpy = vi.spyOn(window, 'alert')
      const event = new KeyboardEvent('keydown', { key: '?' })
      window.dispatchEvent(event)

      // Wait for setTimeout
      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(alertSpy).not.toHaveBeenCalled()

      document.body.removeChild(modal)
    })
  })
})
