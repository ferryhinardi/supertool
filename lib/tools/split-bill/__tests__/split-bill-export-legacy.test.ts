import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Currency } from '../../currency/currency'
import {
  copyToClipboard,
  downloadCSV,
  exportAsText,
  exportToCSV,
  generatePaymentLink,
  generatePaymentRequest,
} from '../split-bill-export-legacy'

// Mock Currency for testing
const mockCurrency: Currency = {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
  iconName: 'DollarSign',
}

const mockCurrencyEUR: Currency = {
  code: 'EUR',
  name: 'Euro',
  symbol: '€',
  iconName: 'Euro',
}

// Base mock data for export tests
const createMockExportData = (overrides = {}) => ({
  title: 'Dinner at Restaurant',
  billAmount: 100,
  tipAmount: 15,
  tipPercent: '15',
  taxAmount: 8,
  taxPercent: '8',
  total: 123,
  currency: mockCurrency,
  people: [
    { name: 'Alice', amount: 41, hasPaid: true, percentage: 33.33 },
    { name: 'Bob', amount: 41, hasPaid: false, percentage: 33.33 },
    { name: 'Charlie', amount: 41, hasPaid: false, percentage: 33.34 },
  ],
  splitType: 'equal' as const,
  createdAt: '2024-01-15T12:00:00Z',
  ...overrides,
})

describe('split-bill-export-legacy', () => {
  describe('exportToCSV', () => {
    it('should generate CSV with bill details header', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      expect(csv).toContain('"Split Bill Summary"')
      expect(csv).toContain('"Bill Details"')
    })

    it('should include subtotal, tip, tax and total', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      expect(csv).toContain('"Subtotal","$100.00"')
      expect(csv).toContain('"Tip (15%)","$15.00"')
      expect(csv).toContain('"Tax (8%)","$8.00"')
      expect(csv).toContain('"Total","$123.00"')
    })

    it('should include participants section with equal split', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      expect(csv).toContain('"Participants","Amount","Status",""')
      expect(csv).toContain('"Alice","$41.00","Paid",""')
      expect(csv).toContain('"Bob","$41.00","Pending",""')
      expect(csv).toContain('"Charlie","$41.00","Pending",""')
    })

    it('should include percentage column for percentage split', () => {
      const data = createMockExportData({ splitType: 'percentage' })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Participants","Amount","Status","Percentage"')
      expect(csv).toContain('"Alice","$41.00","Paid","33.3%"')
      expect(csv).toContain('"Bob","$41.00","Pending","33.3%"')
    })

    it('should handle undefined percentage gracefully', () => {
      const data = createMockExportData({
        splitType: 'percentage',
        people: [{ name: 'Alice', amount: 100, hasPaid: true }],
      })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Alice","$100.00","Paid","undefined%"')
    })

    it('should include items section for item-based split', () => {
      const data = createMockExportData({
        splitType: 'items',
        items: [
          { name: 'Pizza', price: 20, quantity: 2, assignedTo: ['Alice', 'Bob'] },
          { name: 'Salad', price: 10, quantity: 1, assignedTo: ['Charlie'] },
        ],
      })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Items","Price","Quantity","Total","Assigned To"')
      expect(csv).toContain('"Pizza","$20.00","2","$40.00","Alice, Bob"')
      expect(csv).toContain('"Salad","$10.00","1","$10.00","Charlie"')
    })

    it('should not include items section when items array is empty', () => {
      const data = createMockExportData({
        splitType: 'items',
        items: [],
      })
      const csv = exportToCSV(data)

      expect(csv).not.toContain('"Items","Price","Quantity","Total","Assigned To"')
    })

    it('should not include items section when splitType is not items', () => {
      const data = createMockExportData({
        splitType: 'equal',
        items: [{ name: 'Pizza', price: 20, quantity: 2, assignedTo: ['Alice'] }],
      })
      const csv = exportToCSV(data)

      expect(csv).not.toContain('"Items","Price","Quantity","Total","Assigned To"')
    })

    it('should filter out non-matching assigned names', () => {
      const data = createMockExportData({
        splitType: 'items',
        items: [{ name: 'Pizza', price: 20, quantity: 1, assignedTo: ['Alice', 'NonExistent'] }],
      })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Pizza","$20.00","1","$20.00","Alice"')
    })

    it('should include summary stats', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      expect(csv).toContain('"Summary"')
      expect(csv).toContain('"Total Participants","3"')
      expect(csv).toContain('"Paid","1"')
      expect(csv).toContain('"Unpaid","2"')
    })

    it('should include created date when provided', () => {
      const data = createMockExportData({ createdAt: '2024-01-15T12:00:00Z' })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Created"')
    })

    it('should not include created date when not provided', () => {
      const data = createMockExportData({ createdAt: undefined })
      const csv = exportToCSV(data)

      expect(csv).not.toContain('"Created"')
    })

    it('should include currency and generator info', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      expect(csv).toContain('"Currency","USD (US Dollar)"')
      expect(csv).toContain('"Generated by","SuperTool Split Bill Calculator"')
    })

    it('should work with different currencies', () => {
      const data = createMockExportData({ currency: mockCurrencyEUR })
      const csv = exportToCSV(data)

      expect(csv).toContain('"Subtotal","€100.00"')
      expect(csv).toContain('"Currency","EUR (Euro)"')
    })

    it('should properly escape CSV values with quotes', () => {
      const data = createMockExportData()
      const csv = exportToCSV(data)

      // Each cell should be wrapped in quotes
      const lines = csv.split('\n')
      for (const line of lines) {
        if (line.trim()) {
          expect(line).toMatch(/^".*"/)
        }
      }
    })
  })

  describe('downloadCSV', () => {
    let mockLink: {
      setAttribute: ReturnType<typeof vi.fn>
      click: ReturnType<typeof vi.fn>
      style: { visibility: string }
    }
    let mockCreateObjectURL: ReturnType<typeof vi.fn>
    let mockAppendChild: ReturnType<typeof vi.fn>
    let mockRemoveChild: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: { visibility: '' },
      }
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
      mockAppendChild = vi.fn()
      mockRemoveChild = vi.fn()

      vi.stubGlobal('document', {
        createElement: vi.fn().mockReturnValue(mockLink),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      })
      vi.stubGlobal('URL', {
        createObjectURL: mockCreateObjectURL,
      })
      vi.stubGlobal(
        'Blob',
        class MockBlob {
          constructor(
            public content: string[],
            public options: { type: string }
          ) {}
        }
      )
    })

    it('should create a blob with CSV content', () => {
      const data = createMockExportData()
      downloadCSV(data)

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('should create an anchor element', () => {
      const data = createMockExportData()
      downloadCSV(data)

      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('should set href attribute with blob URL', () => {
      const data = createMockExportData()
      downloadCSV(data)

      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:test-url')
    })

    it('should use provided filename', () => {
      const data = createMockExportData()
      downloadCSV(data, 'my-custom-bill.csv')

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'my-custom-bill.csv')
    })

    it('should generate default filename with current date', () => {
      const data = createMockExportData()
      const today = new Date().toISOString().split('T')[0]
      downloadCSV(data)

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', `split-bill-${today}.csv`)
    })

    it('should set link visibility to hidden', () => {
      const data = createMockExportData()
      downloadCSV(data)

      expect(mockLink.style.visibility).toBe('hidden')
    })

    it('should append link to body, click, and remove', () => {
      const data = createMockExportData()
      downloadCSV(data)

      expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink)
    })
  })

  describe('exportAsText', () => {
    it('should include header emoji and title', () => {
      const data = createMockExportData()
      const text = exportAsText(data)

      expect(text).toContain('💰 Bill Split Summary')
    })

    it('should include optional title when provided', () => {
      const data = createMockExportData({ title: 'Birthday Dinner' })
      const text = exportAsText(data)

      expect(text).toContain('📋 Birthday Dinner')
    })

    it('should not include title section when not provided', () => {
      const data = createMockExportData({ title: undefined })
      const text = exportAsText(data)

      // Should only have one 📋 (Bill Details), not two
      const matches = text.match(/📋/g)
      expect(matches?.length).toBe(1)
    })

    it('should include bill details', () => {
      const data = createMockExportData()
      const text = exportAsText(data)

      expect(text).toContain('📋 Bill Details:')
      expect(text).toContain('- Subtotal: $100.00')
      expect(text).toContain('- Tip (15%): $15.00')
      expect(text).toContain('- Tax (8%): $8.00')
      expect(text).toContain('- Total: $123.00')
    })

    it('should show Equal Split type text', () => {
      const data = createMockExportData({ splitType: 'equal' })
      const text = exportAsText(data)

      expect(text).toContain('👥 Split Among 3 People (Equal Split):')
    })

    it('should show Custom Percentage type text', () => {
      const data = createMockExportData({ splitType: 'percentage' })
      const text = exportAsText(data)

      expect(text).toContain('(Custom Percentage)')
    })

    it('should show Item-Based type text', () => {
      const data = createMockExportData({ splitType: 'items' })
      const text = exportAsText(data)

      expect(text).toContain('(Item-Based)')
    })

    it('should list all participants with amounts and status', () => {
      const data = createMockExportData()
      const text = exportAsText(data)

      expect(text).toContain('- Alice: $41.00 ✅ Paid')
      expect(text).toContain('- Bob: $41.00 ⏳ Pending')
      expect(text).toContain('- Charlie: $41.00 ⏳ Pending')
    })

    it('should include percentage for percentage split', () => {
      const data = createMockExportData({ splitType: 'percentage' })
      const text = exportAsText(data)

      expect(text).toContain('- Alice: $41.00 (33.3%) ✅ Paid')
    })

    it('should handle undefined percentage gracefully', () => {
      const data = createMockExportData({
        splitType: 'percentage',
        people: [{ name: 'Alice', amount: 100, hasPaid: true }],
      })
      const text = exportAsText(data)

      expect(text).toContain('(undefined%)')
    })

    it('should include payment summary stats', () => {
      const data = createMockExportData()
      const text = exportAsText(data)

      expect(text).toContain('💵 Per Person (Average): $41.00')
      expect(text).toContain('✅ Paid: 1 ($41.00)')
      expect(text).toContain('⏳ Unpaid: 2 ($82.00)')
    })

    it('should include currency and generator info', () => {
      const data = createMockExportData()
      const text = exportAsText(data)

      expect(text).toContain('Currency: USD (US Dollar)')
      expect(text).toContain('Generated by SuperTool Split Bill Calculator')
    })

    it('should work with different currencies', () => {
      const data = createMockExportData({ currency: mockCurrencyEUR })
      const text = exportAsText(data)

      expect(text).toContain('- Subtotal: €100.00')
      expect(text).toContain('Currency: EUR (Euro)')
    })

    it('should calculate correct totals for paid and unpaid', () => {
      const data = createMockExportData({
        people: [
          { name: 'Alice', amount: 50, hasPaid: true },
          { name: 'Bob', amount: 30, hasPaid: true },
          { name: 'Charlie', amount: 43, hasPaid: false },
        ],
        total: 123,
      })
      const text = exportAsText(data)

      expect(text).toContain('✅ Paid: 2 ($80.00)')
      expect(text).toContain('⏳ Unpaid: 1 ($43.00)')
    })
  })

  describe('generatePaymentRequest', () => {
    it('should generate basic payment request', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency)

      expect(text).toContain('💰 Payment Request')
      expect(text).toContain('Hi John! 👋')
      expect(text).toContain('Your share of the bill is: $50.00')
      expect(text).toContain('Thank you! 😊')
    })

    it('should include organizer name when provided', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency, 'Alice')

      expect(text).toContain('Please send payment to: Alice')
    })

    it('should not include organizer line when not provided', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency)

      expect(text).not.toContain('Please send payment to:')
    })

    it('should include bank details when both account and name provided', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency, 'Alice', '123456789', 'Chase')

      expect(text).toContain('📱 Payment Details:')
      expect(text).toContain('Bank: Chase')
      expect(text).toContain('Account: 123456789')
    })

    it('should not include bank details when only account provided', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency, 'Alice', '123456789')

      expect(text).not.toContain('📱 Payment Details:')
      expect(text).not.toContain('Bank:')
    })

    it('should not include bank details when only bank name provided', () => {
      const text = generatePaymentRequest('John', 50, mockCurrency, 'Alice', undefined, 'Chase')

      expect(text).not.toContain('📱 Payment Details:')
      expect(text).not.toContain('Account:')
    })

    it('should format amount with correct decimals', () => {
      const text = generatePaymentRequest('John', 123.456, mockCurrency)

      expect(text).toContain('$123.46')
    })

    it('should work with different currencies', () => {
      const text = generatePaymentRequest('John', 50, mockCurrencyEUR)

      expect(text).toContain('Your share of the bill is: €50.00')
    })
  })

  describe('generatePaymentLink', () => {
    it('should generate Venmo deep link', () => {
      const link = generatePaymentLink('venmo', 50, 'johnsmith', 'Dinner split')

      expect(link).toBe(
        'venmo://paycharge?txn=pay&recipients=johnsmith&amount=50&note=Dinner%20split'
      )
    })

    it('should generate Venmo link with default note', () => {
      const link = generatePaymentLink('venmo', 50, 'johnsmith')

      expect(link).toContain('note=Bill%20split%20payment')
    })

    it('should generate PayPal.Me link', () => {
      const link = generatePaymentLink('paypal', 50, 'johnsmith', 'Dinner split')

      expect(link).toBe('https://paypal.me/johnsmith/50')
    })

    it('should generate PayPal.Me link (note is not used)', () => {
      const link = generatePaymentLink('paypal', 100, 'jane')

      expect(link).toBe('https://paypal.me/jane/100')
    })

    it('should generate Cash App link', () => {
      const link = generatePaymentLink('cashapp', 50, 'johnsmith', 'Dinner split')

      expect(link).toBe('https://cash.app/$johnsmith/50')
    })

    it('should generate Cash App link (note is not used)', () => {
      const link = generatePaymentLink('cashapp', 75, 'bob')

      expect(link).toBe('https://cash.app/$bob/75')
    })

    it('should handle special characters in note', () => {
      const link = generatePaymentLink('venmo', 50, 'john', 'Dinner & drinks @ restaurant!')

      expect(link).toContain('note=Dinner%20%26%20drinks%20%40%20restaurant!')
    })

    it('should return empty string for unsupported app', () => {
      // @ts-expect-error Testing invalid input
      const link = generatePaymentLink('zelle', 50, 'john')

      expect(link).toBe('')
    })

    it('should handle decimal amounts', () => {
      const venmoLink = generatePaymentLink('venmo', 50.5, 'john')
      const paypalLink = generatePaymentLink('paypal', 50.5, 'john')
      const cashappLink = generatePaymentLink('cashapp', 50.5, 'john')

      expect(venmoLink).toContain('amount=50.5')
      expect(paypalLink).toContain('/50.5')
      expect(cashappLink).toContain('/50.5')
    })
  })

  describe('copyToClipboard', () => {
    const originalWindow = global.window

    beforeEach(() => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      })
    })

    afterEach(() => {
      vi.stubGlobal('window', originalWindow)
    })

    it('should return false when window is undefined (SSR)', async () => {
      vi.stubGlobal('window', undefined)

      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
    })

    it('should copy text to clipboard successfully', async () => {
      const result = await copyToClipboard('Hello World')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World')
      expect(result).toBe(true)
    })

    it('should return false when clipboard API fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied')),
        },
      })

      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy to clipboard:',
        expect.any(Error)
      )
      consoleErrorSpy.mockRestore()
    })

    it('should handle empty string', async () => {
      const result = await copyToClipboard('')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('')
      expect(result).toBe(true)
    })

    it('should handle special characters', async () => {
      const specialText = '💰 Payment: $50.00 for "Dinner & drinks"'
      const result = await copyToClipboard(specialText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialText)
      expect(result).toBe(true)
    })

    it('should handle multiline text', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const result = await copyToClipboard(multilineText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(multilineText)
      expect(result).toBe(true)
    })
  })

  describe('edge cases and integration', () => {
    it('should handle zero amounts', () => {
      const data = createMockExportData({
        billAmount: 0,
        tipAmount: 0,
        taxAmount: 0,
        total: 0,
        people: [{ name: 'Alice', amount: 0, hasPaid: false }],
      })

      const csv = exportToCSV(data)
      const text = exportAsText(data)

      expect(csv).toContain('"Subtotal","$0.00"')
      expect(text).toContain('- Subtotal: $0.00')
    })

    it('should handle large amounts', () => {
      const data = createMockExportData({
        billAmount: 999999.99,
        total: 1099999.99,
      })

      const csv = exportToCSV(data)
      const text = exportAsText(data)

      expect(csv).toContain('"Subtotal","$999999.99"')
      expect(text).toContain('- Subtotal: $999999.99')
    })

    it('should handle single participant', () => {
      const data = createMockExportData({
        people: [{ name: 'Solo', amount: 123, hasPaid: true }],
      })

      const csv = exportToCSV(data)
      const text = exportAsText(data)

      expect(csv).toContain('"Total Participants","1"')
      expect(text).toContain('👥 Split Among 1 People')
      expect(text).toContain('💵 Per Person (Average): $123.00')
    })

    it('should handle many participants', () => {
      const people = Array.from({ length: 10 }, (_, i) => ({
        name: `Person${i + 1}`,
        amount: 12.3,
        hasPaid: i % 2 === 0,
      }))
      const data = createMockExportData({ people, total: 123 })

      const csv = exportToCSV(data)
      const text = exportAsText(data)

      expect(csv).toContain('"Total Participants","10"')
      expect(csv).toContain('"Paid","5"')
      expect(csv).toContain('"Unpaid","5"')
      expect(text).toContain('👥 Split Among 10 People')
    })

    it('should handle names with special characters', () => {
      const data = createMockExportData({
        people: [{ name: 'José "JJ" O\'Brien', amount: 100, hasPaid: true }],
      })

      const csv = exportToCSV(data)
      const text = exportAsText(data)

      expect(csv).toContain('José "JJ" O\'Brien')
      expect(text).toContain('José "JJ" O\'Brien')
    })

    it('should handle items with special characters', () => {
      const data = createMockExportData({
        splitType: 'items',
        items: [{ name: 'Pizza "Supreme" (Large)', price: 25, quantity: 1, assignedTo: ['Alice'] }],
      })

      const csv = exportToCSV(data)

      expect(csv).toContain('Pizza "Supreme" (Large)')
    })

    it('should handle all people paid', () => {
      const data = createMockExportData({
        people: [
          { name: 'Alice', amount: 41, hasPaid: true },
          { name: 'Bob', amount: 41, hasPaid: true },
          { name: 'Charlie', amount: 41, hasPaid: true },
        ],
      })

      const text = exportAsText(data)

      expect(text).toContain('✅ Paid: 3 ($123.00)')
      expect(text).toContain('⏳ Unpaid: 0 ($0.00)')
    })

    it('should handle all people unpaid', () => {
      const data = createMockExportData({
        people: [
          { name: 'Alice', amount: 41, hasPaid: false },
          { name: 'Bob', amount: 41, hasPaid: false },
          { name: 'Charlie', amount: 41, hasPaid: false },
        ],
      })

      const text = exportAsText(data)

      expect(text).toContain('✅ Paid: 0 ($0.00)')
      expect(text).toContain('⏳ Unpaid: 3 ($123.00)')
    })
  })
})
