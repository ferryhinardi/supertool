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
    beforeEach(() => {
      // Clean up any existing live region
      const existing = document.getElementById('split-bill-sr-announcer')
      if (existing) {
        existing.remove()
      }
    })

    it('should create live region if it does not exist', () => {
      announceToScreenReader('Test message')

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion).toBeTruthy()
      expect(liveRegion?.getAttribute('role')).toBe('status')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should apply correct CSS for screen reader only', () => {
      announceToScreenReader('Test message')

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.style.position).toBe('absolute')
      expect(liveRegion?.style.left).toBe('-10000px')
      expect(liveRegion?.style.width).toBe('1px')
      expect(liveRegion?.style.height).toBe('1px')
      expect(liveRegion?.style.overflow).toBe('hidden')
    })

    it('should announce message with polite priority by default', async () => {
      announceToScreenReader('Test announcement')

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')

      // Wait for setTimeout
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(liveRegion?.textContent).toBe('Test announcement')
    })

    it('should announce message with assertive priority', async () => {
      announceToScreenReader('Urgent message', 'assertive')

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(liveRegion?.textContent).toBe('Urgent message')
    })

    it('should reuse existing live region', () => {
      announceToScreenReader('First message')
      const firstRegion = document.getElementById('split-bill-sr-announcer')

      announceToScreenReader('Second message')
      const secondRegion = document.getElementById('split-bill-sr-announcer')

      expect(firstRegion).toBe(secondRegion)
    })

    it('should update aria-live priority if changed', () => {
      announceToScreenReader('Polite message', 'polite')
      let liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')

      announceToScreenReader('Assertive message', 'assertive')
      liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')
    })

    it('should clear previous message before announcing new one', async () => {
      announceToScreenReader('First message')
      await new Promise((resolve) => setTimeout(resolve, 150))

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      expect(liveRegion?.textContent).toBe('First message')

      announceToScreenReader('Second message')
      // Immediately after call, content should be cleared
      expect(liveRegion?.textContent).toBe('')

      // After timeout, should have new message
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(liveRegion?.textContent).toBe('Second message')
    })

    it('should handle empty messages', async () => {
      announceToScreenReader('')

      const liveRegion = document.getElementById('split-bill-sr-announcer')
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(liveRegion?.textContent).toBe('')
    })
  })

  describe('trapFocusInModal', () => {
    let modal: HTMLElement

    beforeEach(() => {
      modal = document.createElement('div')
      modal.innerHTML = `
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a id="link1" href="#">Link</a>
        <button id="btn2">Button 2</button>
      `
      document.body.appendChild(modal)
    })

    afterEach(() => {
      modal.remove()
    })

    it('should focus first element when initialized', () => {
      const btn1 = document.getElementById('btn1')
      trapFocusInModal(modal)

      expect(document.activeElement).toBe(btn1)
    })

    it('should trap focus on Tab from last element to first', () => {
      const btn1 = document.getElementById('btn1') as HTMLElement
      const btn2 = document.getElementById('btn2') as HTMLElement

      trapFocusInModal(modal)
      btn2.focus()

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      modal.dispatchEvent(event)

      // Note: In real browser, focus would move to btn1
      // In JSDOM, we just verify preventDefault was called
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should trap focus on Shift+Tab from first element to last', () => {
      const btn2 = document.getElementById('btn2') as HTMLElement
      trapFocusInModal(modal)

      // First element is already focused, now press Shift+Tab
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      modal.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not interfere with other keys', () => {
      trapFocusInModal(modal)

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      modal.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should return cleanup function', () => {
      const cleanup = trapFocusInModal(modal)

      expect(typeof cleanup).toBe('function')
    })

    it('should remove event listener when cleanup is called', () => {
      const cleanup = trapFocusInModal(modal)
      const removeEventListenerSpy = vi.spyOn(modal, 'removeEventListener')

      cleanup?.()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should handle modal with no focusable elements', () => {
      const emptyModal = document.createElement('div')
      emptyModal.innerHTML = '<p>No focusable elements</p>'
      document.body.appendChild(emptyModal)

      const result = trapFocusInModal(emptyModal)

      expect(result).toBeUndefined()
      emptyModal.remove()
    })

    it('should handle modal with tabindex elements', () => {
      modal.innerHTML = `
        <div tabindex="0" id="div1">Focusable div</div>
        <div tabindex="-1" id="div2">Not focusable</div>
        <div tabindex="0" id="div3">Focusable div 2</div>
      `

      const div1 = document.getElementById('div1')
      trapFocusInModal(modal)

      expect(document.activeElement).toBe(div1)
    })
  })

  describe('formatCurrencyForScreenReader', () => {
    it('should format currency with code', () => {
      const result = formatCurrencyForScreenReader(100, 'USD', '$')
      expect(result).toBe('100.00 USD')
    })

    it('should format currency with two decimal places', () => {
      const result = formatCurrencyForScreenReader(99.5, 'EUR', '€')
      expect(result).toBe('99.50 EUR')
    })

    it('should handle zero amount', () => {
      const result = formatCurrencyForScreenReader(0, 'GBP', '£')
      expect(result).toBe('0.00 GBP')
    })

    it('should handle large amounts', () => {
      const result = formatCurrencyForScreenReader(1234567.89, 'JPY', '¥')
      expect(result).toBe('1234567.89 JPY')
    })

    it('should round to two decimal places', () => {
      const result = formatCurrencyForScreenReader(10.999, 'USD', '$')
      expect(result).toBe('11.00 USD')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrencyForScreenReader(-50.5, 'USD', '$')
      expect(result).toBe('-50.50 USD')
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
    it('should return paid message', () => {
      const result = getPaymentStatusMessage(true, 'Alice')
      expect(result).toBe('Alice has paid their share')
    })

    it('should return unpaid message', () => {
      const result = getPaymentStatusMessage(false, 'Bob')
      expect(result).toBe('Bob has not paid yet')
    })

    it('should handle names with special characters', () => {
      const result = getPaymentStatusMessage(true, "O'Brien")
      expect(result).toBe("O'Brien has paid their share")
    })

    it('should handle empty names', () => {
      const result = getPaymentStatusMessage(false, '')
      expect(result).toBe(' has not paid yet')
    })
  })

  describe('generateAccessibleSummary', () => {
    it('should generate summary for single person bill', () => {
      const result = generateAccessibleSummary({
        total: 50,
        peopleCount: 1,
        paidCount: 0,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('Total amount: 50.00 USD')
      expect(result).toContain('Split among 1 person')
      expect(result).toContain('Split type: equal')
      expect(result).toContain('0 people have paid')
      expect(result).toContain('1 person still owes money')
    })

    it('should generate summary for multiple people', () => {
      const result = generateAccessibleSummary({
        total: 150,
        peopleCount: 3,
        paidCount: 1,
        splitType: 'percentage',
        currency: 'EUR',
      })

      expect(result).toContain('Total amount: 150.00 EUR')
      expect(result).toContain('Split among 3 people')
      expect(result).toContain('Split type: percentage')
      expect(result).toContain('1 person has paid')
      expect(result).toContain('2 people still owe money')
    })

    it('should handle all paid scenario', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 2,
        paidCount: 2,
        splitType: 'items',
        currency: 'GBP',
      })

      expect(result).toContain('2 people have paid')
      expect(result).toContain('0 people still owe money')
    })

    it('should handle nobody paid scenario', () => {
      const result = generateAccessibleSummary({
        total: 200,
        peopleCount: 4,
        paidCount: 0,
        splitType: 'equal',
        currency: 'CAD',
      })

      expect(result).toContain('0 people have paid')
      expect(result).toContain('4 people still owe money')
    })

    it('should format decimal amounts correctly', () => {
      const result = generateAccessibleSummary({
        total: 99.99,
        peopleCount: 2,
        paidCount: 1,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('Total amount: 99.99 USD')
    })

    it('should remove extra whitespace', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 2,
        paidCount: 1,
        splitType: 'equal',
        currency: 'USD',
      })

      // Should not have multiple consecutive spaces
      expect(result).not.toMatch(/\s{2,}/)
      // Should not have leading/trailing whitespace
      expect(result).toBe(result.trim())
    })

    it('should handle large amounts', () => {
      const result = generateAccessibleSummary({
        total: 9999.99,
        peopleCount: 10,
        paidCount: 5,
        splitType: 'items',
        currency: 'JPY',
      })

      expect(result).toContain('Total amount: 9999.99 JPY')
      expect(result).toContain('Split among 10 people')
      expect(result).toContain('5 people have paid')
      expect(result).toContain('5 people still owe money')
    })

    it('should handle zero total', () => {
      const result = generateAccessibleSummary({
        total: 0,
        peopleCount: 1,
        paidCount: 0,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('Total amount: 0.00 USD')
    })

    it('should use correct grammar for single unpaid person', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 3,
        paidCount: 2,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('1 person still owes money')
      expect(result).not.toContain('1 person still owe money')
    })

    it('should use correct grammar for multiple unpaid people', () => {
      const result = generateAccessibleSummary({
        total: 100,
        peopleCount: 5,
        paidCount: 2,
        splitType: 'equal',
        currency: 'USD',
      })

      expect(result).toContain('3 people still owe money')
      expect(result).not.toContain('3 people still owes money')
    })
  })
})
