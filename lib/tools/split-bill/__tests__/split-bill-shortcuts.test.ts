import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getKeyboardShortcuts, useKeyboardShortcuts } from '../split-bill-shortcuts'

describe('split-bill-shortcuts', () => {
  describe('useKeyboardShortcuts', () => {
    let addEventListenerSpy: ReturnType<typeof vi.fn>
    let removeEventListenerSpy: ReturnType<typeof vi.fn>
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null

    beforeEach(() => {
      addEventListenerSpy = vi.fn((event, handler) => {
        if (event === 'keydown') {
          keydownHandler = handler
        }
      })
      removeEventListenerSpy = vi.fn()

      vi.stubGlobal('window', {
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })

      vi.stubGlobal('navigator', {
        platform: 'MacIntel',
      })
    })

    afterEach(() => {
      keydownHandler = null
      vi.restoreAllMocks()
    })

    const simulateKeydown = (options: Partial<KeyboardEvent>) => {
      const event = {
        key: '',
        target: { tagName: 'DIV', isContentEditable: false },
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: vi.fn(),
        ...options,
      } as unknown as KeyboardEvent

      act(() => {
        keydownHandler?.(event)
      })

      return event
    }

    it('should add keydown event listener on mount', () => {
      renderHook(() => useKeyboardShortcuts({}))

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should remove keydown event listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts({}))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should not add event listener when disabled', () => {
      renderHook(() => useKeyboardShortcuts({ enabled: false }))

      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })

    describe('input field handling', () => {
      it('should not trigger shortcuts when typing in INPUT', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        simulateKeydown({
          key: 'p',
          target: { tagName: 'INPUT', isContentEditable: false } as HTMLElement,
        })

        expect(onAddPerson).not.toHaveBeenCalled()
      })

      it('should not trigger shortcuts when typing in TEXTAREA', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        simulateKeydown({
          key: 'p',
          target: { tagName: 'TEXTAREA', isContentEditable: false } as HTMLElement,
        })

        expect(onAddPerson).not.toHaveBeenCalled()
      })

      it('should not trigger shortcuts when typing in SELECT', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        simulateKeydown({
          key: 'p',
          target: { tagName: 'SELECT', isContentEditable: false } as HTMLElement,
        })

        expect(onAddPerson).not.toHaveBeenCalled()
      })

      it('should not trigger shortcuts in contentEditable elements', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        simulateKeydown({
          key: 'p',
          target: { tagName: 'DIV', isContentEditable: true } as HTMLElement,
        })

        expect(onAddPerson).not.toHaveBeenCalled()
      })

      it('should blur input and call onClearForm when Escape pressed in input', () => {
        const onClearForm = vi.fn()
        const blurFn = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onClearForm }))

        simulateKeydown({
          key: 'Escape',
          target: {
            tagName: 'INPUT',
            isContentEditable: false,
            blur: blurFn,
          } as unknown as HTMLElement,
        })

        expect(blurFn).toHaveBeenCalled()
        expect(onClearForm).toHaveBeenCalled()
      })
    })

    describe('modifier key shortcuts (Cmd/Ctrl)', () => {
      it('should call onShare on Cmd+S (Mac)', () => {
        const onShare = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onShare }))

        const event = simulateKeydown({ key: 's', metaKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onShare).toHaveBeenCalled()
      })

      it('should call onShare on Ctrl+S (Windows)', () => {
        vi.stubGlobal('navigator', { platform: 'Win32' })
        const onShare = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onShare }))

        const event = simulateKeydown({ key: 's', ctrlKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onShare).toHaveBeenCalled()
      })

      it('should call onExport on Cmd+E', () => {
        const onExport = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onExport }))

        const event = simulateKeydown({ key: 'e', metaKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onExport).toHaveBeenCalled()
      })

      it('should call onReset on Cmd+R', () => {
        const onReset = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onReset }))

        const event = simulateKeydown({ key: 'r', metaKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onReset).toHaveBeenCalled()
      })

      it('should handle uppercase modifier keys', () => {
        const onShare = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onShare }))

        simulateKeydown({ key: 'S', metaKey: true })

        expect(onShare).toHaveBeenCalled()
      })

      it('should not call anything for unhandled modifier shortcuts', () => {
        const onShare = vi.fn()
        const onExport = vi.fn()
        const onReset = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onShare, onExport, onReset }))

        simulateKeydown({ key: 'z', metaKey: true })

        expect(onShare).not.toHaveBeenCalled()
        expect(onExport).not.toHaveBeenCalled()
        expect(onReset).not.toHaveBeenCalled()
      })
    })

    describe('Alt key shortcuts', () => {
      it('should call onSwitchToEqual on Alt+1', () => {
        const onSwitchToEqual = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onSwitchToEqual }))

        const event = simulateKeydown({ key: '1', altKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onSwitchToEqual).toHaveBeenCalled()
      })

      it('should call onSwitchToPercentage on Alt+2', () => {
        const onSwitchToPercentage = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onSwitchToPercentage }))

        const event = simulateKeydown({ key: '2', altKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onSwitchToPercentage).toHaveBeenCalled()
      })

      it('should call onSwitchToItems on Alt+3', () => {
        const onSwitchToItems = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onSwitchToItems }))

        const event = simulateKeydown({ key: '3', altKey: true })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onSwitchToItems).toHaveBeenCalled()
      })

      it('should not call anything for unhandled Alt shortcuts', () => {
        const onSwitchToEqual = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onSwitchToEqual }))

        simulateKeydown({ key: '4', altKey: true })

        expect(onSwitchToEqual).not.toHaveBeenCalled()
      })
    })

    describe('simple key shortcuts (no modifiers)', () => {
      it('should call onAddPerson on "p" key', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        const event = simulateKeydown({ key: 'p' })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onAddPerson).toHaveBeenCalled()
      })

      it('should call onAddPerson on "+" key', () => {
        const onAddPerson = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson }))

        const event = simulateKeydown({ key: '+' })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onAddPerson).toHaveBeenCalled()
      })

      it('should call onAddItem on "i" key', () => {
        const onAddItem = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddItem }))

        const event = simulateKeydown({ key: 'i' })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(onAddItem).toHaveBeenCalled()
      })

      it('should call onClearForm on Escape key', () => {
        const onClearForm = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onClearForm }))

        simulateKeydown({ key: 'Escape' })

        expect(onClearForm).toHaveBeenCalled()
      })

      it('should call preventDefault and dispatch event on "?" key', () => {
        const dispatchEventFn = vi.fn()
        vi.stubGlobal('window', {
          addEventListener: addEventListenerSpy,
          removeEventListener: removeEventListenerSpy,
          dispatchEvent: dispatchEventFn,
        })

        renderHook(() => useKeyboardShortcuts({}))

        const event = simulateKeydown({ key: '?' })

        expect(event.preventDefault).toHaveBeenCalled()
        expect(dispatchEventFn).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'show-shortcuts-help',
          })
        )
      })

      it('should not call anything for unhandled simple keys', () => {
        const onAddPerson = vi.fn()
        const onAddItem = vi.fn()
        renderHook(() => useKeyboardShortcuts({ onAddPerson, onAddItem }))

        simulateKeydown({ key: 'x' })

        expect(onAddPerson).not.toHaveBeenCalled()
        expect(onAddItem).not.toHaveBeenCalled()
      })
    })

    describe('callback safety', () => {
      it('should not throw when callback is undefined', () => {
        renderHook(() => useKeyboardShortcuts({}))

        expect(() => {
          simulateKeydown({ key: 'p' })
          simulateKeydown({ key: 's', metaKey: true })
          simulateKeydown({ key: '1', altKey: true })
        }).not.toThrow()
      })
    })

    describe('re-render behavior', () => {
      it('should update callbacks when props change', () => {
        const onAddPerson1 = vi.fn()
        const onAddPerson2 = vi.fn()

        const { rerender } = renderHook(
          ({ onAddPerson }) => useKeyboardShortcuts({ onAddPerson }),
          { initialProps: { onAddPerson: onAddPerson1 } }
        )

        simulateKeydown({ key: 'p' })
        expect(onAddPerson1).toHaveBeenCalledTimes(1)

        rerender({ onAddPerson: onAddPerson2 })

        simulateKeydown({ key: 'p' })
        expect(onAddPerson2).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('getKeyboardShortcuts', () => {
    it('should return array of shortcuts', () => {
      const shortcuts = getKeyboardShortcuts()

      expect(Array.isArray(shortcuts)).toBe(true)
      expect(shortcuts.length).toBeGreaterThan(0)
    })

    it('should have required properties for each shortcut', () => {
      const shortcuts = getKeyboardShortcuts()

      for (const shortcut of shortcuts) {
        expect(shortcut).toHaveProperty('key')
        expect(shortcut).toHaveProperty('description')
        expect(shortcut).toHaveProperty('category')
        expect(typeof shortcut.key).toBe('string')
        expect(typeof shortcut.description).toBe('string')
        expect(typeof shortcut.category).toBe('string')
      }
    })

    it('should use ⌘ modifier on Mac', () => {
      vi.stubGlobal('navigator', { platform: 'MacIntel' })

      const shortcuts = getKeyboardShortcuts()

      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')
      expect(shareShortcut?.key).toContain('⌘')
    })

    it('should use Ctrl modifier on Windows', () => {
      vi.stubGlobal('navigator', { platform: 'Win32' })

      const shortcuts = getKeyboardShortcuts()

      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')
      expect(shareShortcut?.key).toContain('Ctrl')
    })

    it('should use Ctrl modifier on Linux', () => {
      vi.stubGlobal('navigator', { platform: 'Linux x86_64' })

      const shortcuts = getKeyboardShortcuts()

      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')
      expect(shareShortcut?.key).toContain('Ctrl')
    })

    it('should include all expected shortcuts', () => {
      const shortcuts = getKeyboardShortcuts()
      const descriptions = shortcuts.map((s) => s.description)

      expect(descriptions).toContain('Add person')
      expect(descriptions).toContain('Add item (item mode)')
      expect(descriptions).toContain('Equal split')
      expect(descriptions).toContain('Percentage split')
      expect(descriptions).toContain('Item-based split')
      expect(descriptions).toContain('Share summary')
      expect(descriptions).toContain('Export bill')
      expect(descriptions).toContain('Reset bill')
      expect(descriptions).toContain('Clear/unfocus')
      expect(descriptions).toContain('Show shortcuts')
    })

    it('should have valid categories', () => {
      const shortcuts = getKeyboardShortcuts()
      const validCategories = ['Actions', 'Split Type', 'Navigation', 'Help']

      for (const shortcut of shortcuts) {
        expect(validCategories).toContain(shortcut.category)
      }
    })

    it('should handle undefined navigator gracefully', () => {
      vi.stubGlobal('navigator', undefined)

      const shortcuts = getKeyboardShortcuts()

      // Should default to Ctrl when navigator is undefined
      const shareShortcut = shortcuts.find((s) => s.description === 'Share summary')
      expect(shareShortcut?.key).toContain('Ctrl')
    })
  })
})
