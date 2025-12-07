import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  copyToClipboard,
  downloadCSV,
  exportBillToCSV,
  generateBillSummary,
} from '../split-bill-export'
import type { BillDetailResponse } from '../split-bill-types'

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

// Mock document methods for downloadCSV
const mockLink = {
  setAttribute: vi.fn(),
  click: vi.fn(),
  style: {} as any,
}

// Spy on document methods instead of reassigning
vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any)
vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any)

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')

describe('split-bill-export', () => {
  let mockBillData: BillDetailResponse

  beforeEach(() => {
    vi.clearAllMocks()

    mockBillData = {
      bill: {
        id: 'bill-123',
        title: 'Team Dinner',
        description: 'Monthly team dinner at restaurant',
        total_amount: 1000,
        currency: 'USD',
        split_type: 'equal',
        status: 'active',
        organizer_name: 'John Doe',
        organizer_bank_name: 'Chase Bank',
        organizer_bank_account: '1234567890',
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
      },
      participants: [
        {
          id: 'p1',
          bill_id: 'bill-123',
          name: 'Alice',
          email: 'alice@example.com',
          share_amount: 500,
          share_percentage: 50,
          payment_status: 'paid',
          created_at: '2024-01-15T12:00:00Z',
        },
        {
          id: 'p2',
          bill_id: 'bill-123',
          name: 'Bob',
          email: 'bob@example.com',
          share_amount: 300,
          share_percentage: 30,
          payment_status: 'confirmed',
          created_at: '2024-01-15T12:00:00Z',
        },
        {
          id: 'p3',
          bill_id: 'bill-123',
          name: 'Charlie',
          share_amount: 200,
          share_percentage: 20,
          payment_status: 'pending',
          created_at: '2024-01-15T12:00:00Z',
        },
      ],
      items: [
        {
          id: 'item1',
          bill_id: 'bill-123',
          name: 'Appetizers',
          description: 'Spring rolls and dumplings',
          price: 50,
          quantity: 2,
          display_order: 1,
          assigned_to: ['Alice', 'Bob'],
          assignments: [],
          assigned_count: 2,
          total_price: 100,
          created_at: '2024-01-15T12:00:00Z',
        },
        {
          id: 'item2',
          bill_id: 'bill-123',
          name: 'Main Course',
          price: 150,
          quantity: 3,
          display_order: 2,
          assigned_to: [],
          assignments: [],
          assigned_count: 0,
          total_price: 450,
          created_at: '2024-01-15T12:00:00Z',
        },
      ],
    }
  })

  describe('exportBillToCSV', () => {
    it('should generate CSV with bill information', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Bill Information"')
      expect(csv).toContain('"Title","Team Dinner"')
      expect(csv).toContain('"Currency","USD"')
    })

    it('should include description in CSV', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Description","Monthly team dinner at restaurant"')
    })

    it('should include organizer information', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Organizer Information"')
      expect(csv).toContain('"Name","John Doe"')
      expect(csv).toContain('"Bank Name","Chase Bank"')
      expect(csv).toContain('"Account Number","1234567890"')
    })

    it('should include participants with correct columns for equal split', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Participants"')
      expect(csv).toContain('"Name","Email","Amount","Status"')
      expect(csv).toContain('"Alice","alice@example.com"')
      expect(csv).toContain('"Bob","bob@example.com"')
      expect(csv).toContain('"Charlie"')
    })

    it('should include percentage column for percentage split', () => {
      const percentageBill: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, split_type: 'percentage' },
      }
      const csv = exportBillToCSV(percentageBill)
      expect(csv).toContain('"Name","Email","Amount","Share %","Status"')
      expect(csv).toContain('50.00%')
      expect(csv).toContain('30.00%')
    })

    it('should include items section when items exist', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Items"')
      expect(csv).toContain('"Appetizers"')
      expect(csv).toContain('"Main Course"')
      expect(csv).toContain('Alice; Bob')
    })

    it('should not include items section when no items', () => {
      const noItemsData: BillDetailResponse = {
        ...mockBillData,
        items: [],
      }
      const csv = exportBillToCSV(noItemsData)
      expect(csv).not.toContain('"Items"')
    })

    it('should handle empty description', () => {
      const noDescData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, description: undefined },
      }
      const csv = exportBillToCSV(noDescData)
      expect(csv).toContain('"Description",""')
    })

    it('should format currency amounts in CSV', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('$ 500.00')
      expect(csv).toContain('$ 300.00')
    })

    it('should handle items with no assigned users', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('N/A')
    })

    it('should format dates correctly', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('January 15, 2024')
    })

    it('should handle EUR currency', () => {
      const eurData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, currency: 'EUR', total_amount: 999.99 },
      }
      const csv = exportBillToCSV(eurData)
      expect(csv).toContain('€ 999.99')
    })

    it('should handle GBP currency', () => {
      const gbpData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, currency: 'GBP', total_amount: 888.88 },
      }
      const csv = exportBillToCSV(gbpData)
      expect(csv).toContain('£ 888.88')
    })

    it('should handle IDR currency', () => {
      const idrData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, currency: 'IDR', total_amount: 15000000 },
      }
      const csv = exportBillToCSV(idrData)
      expect(csv).toContain('Rp 15,000,000.00')
    })

    it('should show "Equal Split" for equal type', () => {
      const csv = exportBillToCSV(mockBillData)
      expect(csv).toContain('"Split Type","Equal Split"')
    })

    it('should show "Percentage-Based Split" for percentage type', () => {
      const percentageData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, split_type: 'percentage' },
      }
      const csv = exportBillToCSV(percentageData)
      expect(csv).toContain('"Split Type","Percentage-Based Split"')
    })

    it('should show "Per-Item Split" for custom type', () => {
      const customData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, split_type: 'custom' },
      }
      const csv = exportBillToCSV(customData)
      expect(csv).toContain('"Split Type","Per-Item Split"')
    })
  })

  describe('downloadCSV', () => {
    it('should create blob and trigger download', () => {
      const csvContent = 'test,csv\n1,2'
      const filename = 'test.csv'

      downloadCSV(csvContent, filename)

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename)
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
    })

    it('should set link visibility to hidden', () => {
      downloadCSV('test', 'test.csv')

      expect(mockLink.style.visibility).toBe('hidden')
    })

    it('should handle special characters in CSV content', () => {
      const csvContent = 'name,value\n"Test, Inc.",100\n'
      downloadCSV(csvContent, 'special.csv')

      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('generateBillSummary', () => {
    it('should generate summary with title and description', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('📋 Team Dinner')
      expect(summary).toContain('Monthly team dinner at restaurant')
    })

    it('should include total amount and participant count', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('💰 Total: $ 1,000.00')
      expect(summary).toContain('👥 People: 3')
    })

    it('should show confirmed count', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('✅ Confirmed: 1/3')
    })

    it('should show total paid amount', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('💳 Paid: $ 800.00')
    })

    it('should include organizer payment details', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('🏦 Payment to: John Doe')
      expect(summary).toContain('Chase Bank - 1234567890')
    })

    it('should list all participants with status icons', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('👤 Participants:')
      expect(summary).toContain('💳 Alice: $ 500.00')
      expect(summary).toContain('✅ Bob: $ 300.00')
      expect(summary).toContain('⏳ Charlie: $ 200.00')
    })

    it('should show percentage for percentage split type', () => {
      const percentageBill: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, split_type: 'percentage' },
      }
      const summary = generateBillSummary(percentageBill)
      expect(summary).toContain('(50.00%)')
      expect(summary).toContain('(30.00%)')
    })

    it('should not show percentage for equal split type', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).not.toContain('(50.00%)')
    })

    it('should handle missing description', () => {
      const noDescData: BillDetailResponse = {
        ...mockBillData,
        bill: { ...mockBillData.bill, description: undefined },
      }
      const summary = generateBillSummary(noDescData)
      expect(summary).toContain('📋 Team Dinner')
      expect(summary).not.toContain('undefined')
    })

    it('should include view link placeholder', () => {
      const summary = generateBillSummary(mockBillData)
      expect(summary).toContain('🔗 View & update:')
    })

    it('should count only confirmed participants, not paid', () => {
      const summary = generateBillSummary(mockBillData)
      // Only Bob is "confirmed", Alice is "paid" (not confirmed)
      expect(summary).toContain('✅ Confirmed: 1/3')
    })

    it('should sum paid and confirmed for total paid', () => {
      const summary = generateBillSummary(mockBillData)
      // Alice (500) + Bob (300) = 800
      expect(summary).toContain('💳 Paid: $ 800.00')
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)

      const result = await copyToClipboard('test text')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Permission denied'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle empty string', async () => {
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)

      const result = await copyToClipboard('')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('')
      expect(result).toBe(true)
    })

    it('should handle long text', async () => {
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)

      const longText = 'a'.repeat(10000)
      const result = await copyToClipboard(longText)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longText)
      expect(result).toBe(true)
    })
  })
})
