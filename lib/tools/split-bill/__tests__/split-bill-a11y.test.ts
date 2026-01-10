import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  announceToScreenReader,
  formatCurrencyForScreenReader,
  generateAccessibleSummary,
  getPaymentStatusMessage,
  getSplitTypeDescription,
  trapFocusInModal,
} from '../split-bill-a11y'

describe('split-bill-a11y', () => {
  describe('announceToScreenReader', () => {
    let mockElement: {
      id: string
      setAttribute: ReturnType<typeof vi.fn>
      getAttribute: ReturnType<typeof vi.fn>
      className: string
      style: { cssText: string }
      textContent: string
    }
    let mockBody: {
      appendChild: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      vi.useFakeTimers()

      mockElement = {
        id: '',
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('polite'),
        className: '',
        style: { cssText: '' },
        textContent: '',
      }

      mockBody = {
        appendChild: vi.fn(),
      }

      vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(null),
        createElement: vi.fn().mockReturnValue(mockElement),
        body: mockBody,
      })
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    it('should create live region if it does not exist', () => {
      announceToScreenReader('Test message')

      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(mockElement.id).toBe('split-bill-sr-announcer')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('role', 'status')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true')
      expect(mockElement.className).toBe('sr-only')
      expect(mockBody.appendChild).toHaveBeenCalledWith(mockElement)
    })

    it('should reuse existing live region', () => {
      const existingElement = {
        id: 'split-bill-sr-announcer',
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('polite'),
        textContent: 'old message',
      }

      vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(existingElement),
        createElement: vi.fn(),
        body: mockBody,
      })

      announceToScreenReader('New message')

      expect(document.createElement).not.toHaveBeenCalled()
      expect(existingElement.textContent).toBe('')
    })

    it('should use assertive priority when specified', () => {
      announceToScreenReader('Urgent message', 'assertive')

      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
    })

    it('should update aria-live if priority changes', () => {
      const existingElement = {
        id: 'split-bill-sr-announcer',
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('polite'),
        textContent: '',
      }

      vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(existingElement),
        body: mockBody,
      })

      announceToScreenReader('Message', 'assertive')

      expect(existingElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
    })

    it('should not update aria-live if priority is the same', () => {
      const existingElement = {
        id: 'split-bill-sr-announcer',
        setAttribute: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('polite'),
        textContent: '',
      }

      vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(existingElement),
        body: mockBody,
      })

      announceToScreenReader('Message', 'polite')

      expect(existingElement.setAttribute).not.toHaveBeenCalled()
    })

    it('should set message after delay', () => {
      announceToScreenReader('Delayed message')

      // Initially cleared
      expect(mockElement.textContent).toBe('')

      // After timeout
      vi.advanceTimersByTime(100)
      expect(mockElement.textContent).toBe('Delayed message')
    })

    it('should default to polite priority', () => {
      announceToScreenReader('Default priority message')

      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
    })

    it('should set correct CSS for screen reader only visibility', () => {
      announceToScreenReader('Hidden message')

      expect(mockElement.style.cssText).toBe(
        'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;'
      )
    })
  })

  describe('trapFocusInModal', () => {
    let mockModal: HTMLElement
    let mockButtons: HTMLElement[]
    let keydownHandler: ((e: KeyboardEvent) => void) | null

    beforeEach(() => {
      keydownHandler = null

      mockButtons = [
        { focus: vi.fn(), tagName: 'BUTTON' } as unknown as HTMLElement,
        { focus: vi.fn(), tagName: 'BUTTON' } as unknown as HTMLElement,
        { focus: vi.fn(), tagName: 'BUTTON' } as unknown as HTMLElement,
      ]

      mockModal = {
        querySelectorAll: vi.fn().mockReturnValue(mockButtons),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'keydown') {
            keydownHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      } as unknown as HTMLElement

      vi.stubGlobal('document', {
        activeElement: mockButtons[0],
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should query for focusable elements', () => {
      trapFocusInModal(mockModal)

      expect(mockModal.querySelectorAll).toHaveBeenCalledWith(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    })

    it('should return early if no focusable elements', () => {
      mockModal.querySelectorAll = vi.fn().mockReturnValue([])

      const result = trapFocusInModal(mockModal)

      expect(result).toBeUndefined()
      expect(mockModal.addEventListener).not.toHaveBeenCalled()
    })

    it('should focus first focusable element', () => {
      trapFocusInModal(mockModal)

      expect(mockButtons[0].focus).toHaveBeenCalled()
    })

    it('should add keydown event listener', () => {
      trapFocusInModal(mockModal)

      expect(mockModal.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should return cleanup function that removes listener', () => {
      const cleanup = trapFocusInModal(mockModal)

      expect(cleanup).toBeInstanceOf(Function)

      cleanup?.()

      expect(mockModal.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should wrap focus to last element when shift+tab on first element', () => {
      vi.stubGlobal('document', {
        activeElement: mockButtons[0],
      })

      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockButtons[2].focus).toHaveBeenCalled()
    })

    it('should wrap focus to first element when tab on last element', () => {
      vi.stubGlobal('document', {
        activeElement: mockButtons[2],
      })

      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      // First element focus is called twice: once on setup, once on wrap
      expect(mockButtons[0].focus).toHaveBeenCalledTimes(2)
    })

    it('should not prevent default when pressing other keys', () => {
      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should not wrap focus when tab on middle element', () => {
      vi.stubGlobal('document', {
        activeElement: mockButtons[1],
      })

      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should not wrap focus when shift+tab on middle element', () => {
      vi.stubGlobal('document', {
        activeElement: mockButtons[1],
      })

      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should handle single focusable element', () => {
      const singleButton = { focus: vi.fn(), tagName: 'BUTTON' } as unknown as HTMLElement
      mockModal.querySelectorAll = vi.fn().mockReturnValue([singleButton])

      vi.stubGlobal('document', {
        activeElement: singleButton,
      })

      trapFocusInModal(mockModal)

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent

      keydownHandler?.(mockEvent)

      // Should wrap to itself
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(singleButton.focus).toHaveBeenCalledTimes(2)
    })
  })

  describe('formatCurrencyForScreenReader', () => {
    it('should format amount with currency code', () => {
      const result = formatCurrencyForScreenReader(100.5, 'USD', '$')

      expect(result).toBe('100.50 USD')
    })

    it('should format zero amount', () => {
      const result = formatCurrencyForScreenReader(0, 'EUR', '€')

      expect(result).toBe('0.00 EUR')
    })

    it('should format large amounts', () => {
      const result = formatCurrencyForScreenReader(1234567.89, 'GBP', '£')

      expect(result).toBe('1234567.89 GBP')
    })

    it('should round to 2 decimal places', () => {
      const result = formatCurrencyForScreenReader(10.999, 'JPY', '¥')

      expect(result).toBe('11.00 JPY')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrencyForScreenReader(-50.25, 'CAD', '$')

      expect(result).toBe('-50.25 CAD')
    })

    it('should add trailing zeros', () => {
      const result = formatCurrencyForScreenReader(42, 'AUD', '$')

      expect(result).toBe('42.00 AUD')
    })
  })

  describe('getSplitTypeDescription', () => {
    it('should return description for equal split', () => {
      const result = getSplitTypeDescription('equal')

      expect(result).toBe('Split bill equally among all participants')
    })

    it('should return description for percentage split', () => {
      const result = getSplitTypeDescription('percentage')

      expect(result).toBe('Split bill by custom percentage for each person')
    })

    it('should return description for items split', () => {
      const result = getSplitTypeDescription('items')

      expect(result).toBe('Split bill by assigning items to specific people')
    })
  })

  describe('getPaymentStatusMessage', () => {
    it('should return paid message when hasPaid is true', () => {
      const result = getPaymentStatusMessage(true, 'John')

      expect(result).toBe('John has paid their share')
    })

    it('should return unpaid message when hasPaid is false', () => {
      const result = getPaymentStatusMessage(false, 'Jane')

      expect(result).toBe('Jane has not paid yet')
    })

    it('should handle names with special characters', () => {
      const result = getPaymentStatusMessage(true, "Mary O'Brien")

      expect(result).toBe("Mary O'Brien has paid their share")
    })

    it('should handle empty name', () => {
      const result = getPaymentStatusMessage(false, '')

      expect(result).toBe(' has not paid yet')
    })
  })

  describe('generateAccessibleSummary', () => {
    it('should generate summary for single person', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 1,
        paidCount: 0,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toBe(
        'Bill summary: Total amount: 100.00 USD. Split among 1 person. Split type: equal. 0 people have paid. 1 person still owes money.'
      )
    })

    it('should generate summary for multiple people', () => {
      const result = generateAccessibleSummary({
        total: 300,
        peopleCount: 3,
        paidCount: 1,
        splitType: 'percentage',
        currency: 'EUR',
      })

      expect(result).toBe(
        'Bill summary: Total amount: 300.00 EUR. Split among 3 people. Split type: percentage. 1 person has paid. 2 people still owe money.'
      )
    })

    it('should handle all paid scenario', () => {
      const result = generateAccessibleSummary({
        total: 200,
        peopleCount: 2,
        paidCount: 2,
        splitType: 'items',
        currency: 'GBP',
      })

      expect(result).toBe(
        'Bill summary: Total amount: 200.00 GBP. Split among 2 people. Split type: items. 2 people have paid. 0 people still owe money.'
      )
    })

    it('should handle zero total', () => {
      const result = generateAccessibleSummary({
        total: 0,
        peopleCount: 4,
        paidCount: 0,
        splitType: 'equal',
        currency: 'CAD',
      })

      expect(result).toBe(
        'Bill summary: Total amount: 0.00 CAD. Split among 4 people. Split type: equal. 0 people have paid. 4 people still owe money.'
      )
    })

    it('should use singular form for 1 person paid', () => {
      const result = generateAccessibleSummary({
        total: 50,
        peopleCount: 5,
        paidCount: 1,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('1 person has paid')
    })

    it('should use plural form for multiple people paid', () => {
      const result = generateAccessibleSummary({
        total: 50,
        peopleCount: 5,
        paidCount: 3,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('3 people have paid')
    })

    it('should use singular form for 1 person owing', () => {
      const result = generateAccessibleSummary({
        total: 50,
        peopleCount: 2,
        paidCount: 1,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('1 person still owes money')
    })

    it('should use plural form for multiple people owing', () => {
      const result = generateAccessibleSummary({
        total: 50,
        peopleCount: 5,
        paidCount: 2,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('3 people still owe money')
    })

    it('should handle decimal amounts', () => {
      const result = generateAccessibleSummary({
        total: 99.99,
        peopleCount: 3,
        paidCount: 0,
        splitType: 'items',
        currency: 'USD',
      })

      expect(result).toContain('Total amount: 99.99 USD')
    })

    it('should normalize whitespace in output', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 2,
        paidCount: 1,
        splitType: 'equal',
        currency: 'USD',
      })

      // Should not contain multiple consecutive spaces
      expect(result).not.toMatch(/\s{2,}/)
      // Should not start or end with whitespace
      expect(result).toBe(result.trim())
    })
  })
})
