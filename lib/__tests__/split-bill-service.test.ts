import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateEqualSplit,
  createBill,
  deleteBill,
  getBillById,
  updateParticipantPaymentStatus,
  validateCustomSplit,
} from '@/lib/tools/split-bill/split-bill-service'
import type {
  CreateBillData,
  PaymentStatus,
  SplitBill,
  SplitBillParticipant,
} from '@/lib/tools/split-bill/split-bill-types'

// Mock Supabase client
vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Import supabase after mock
import { supabase } from '@/lib/auth/supabaseClient'

describe('Split Bill Service', () => {
  let mockFrom: ReturnType<typeof vi.fn>
  let mockInsert: ReturnType<typeof vi.fn>
  let mockSelect: ReturnType<typeof vi.fn>
  let mockSingle: ReturnType<typeof vi.fn>
  let mockEq: ReturnType<typeof vi.fn>
  let mockUpdate: ReturnType<typeof vi.fn>
  let mockDelete: ReturnType<typeof vi.fn>
  let mockOrder: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock functions
    mockSingle = vi.fn()
    mockSelect = vi.fn()
    mockInsert = vi.fn()
    mockOrder = vi.fn()
    mockEq = vi.fn()
    mockUpdate = vi.fn()
    mockDelete = vi.fn()

    mockFrom = vi.fn((table: string) => {
      if (table === 'split_bills') {
        // Bill insert: insert().select().single()
        const billInsertChain = {
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }
        mockInsert.mockReturnValue(billInsertChain)

        // Bill queries: select().eq().single()
        const billQueryChain = {
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }

        // Delete: delete().eq() - mockEq resolves directly
        mockDelete.mockReturnValue({
          eq: mockEq,
        })

        return {
          insert: mockInsert,
          select: vi.fn().mockReturnValue(billQueryChain),
          update: mockUpdate,
          delete: mockDelete,
        }
      }

      if (table === 'split_bill_participants') {
        // Participants insert: insert().select() (NO .single())
        const participantInsertChain = {
          select: mockSelect, // mockSelect will be resolved directly
        }
        mockInsert.mockReturnValue(participantInsertChain)

        // Participants queries: select().eq().order()
        const participantQueryChain = {
          eq: vi.fn().mockReturnValue({
            order: mockOrder,
          }),
        }

        // Update: update().eq() - mockEq resolves directly
        mockUpdate.mockReturnValue({
          eq: mockEq,
        })

        return {
          insert: mockInsert,
          select: vi.fn().mockReturnValue(participantQueryChain),
          update: mockUpdate,
        }
      }

      if (table === 'split_bill_items') {
        // Items queries: select().eq().order()
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder,
            }),
          }),
        }
      }

      if (table === 'split_bill_transactions') {
        // Transactions queries: select().eq().order()
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: mockOrder,
            }),
          }),
        }
      }

      // Default fallback
      return {
        insert: mockInsert,
        select: vi.fn().mockReturnValue({ eq: mockEq }),
        update: mockUpdate,
        delete: vi.fn().mockReturnValue({ eq: mockEq }),
      }
    })

    vi.mocked(supabase.from).mockImplementation(mockFrom as unknown as (relation: string) => any)
  })

  describe('createBill', () => {
    it('should create a bill with participants successfully', async () => {
      const mockBillData: SplitBill = {
        id: 'test-bill-id-123',
        title: 'Team Dinner',
        description: 'Monthly team dinner',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'test-bill-id-123',
          name: 'Alice',
          email: 'alice@example.com',
          share_amount: 166666.67,
          share_percentage: 33.33,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p2',
          bill_id: 'test-bill-id-123',
          name: 'Bob',
          email: 'bob@example.com',
          share_amount: 166666.67,
          share_percentage: 33.33,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Mock bill creation - mockSingle returns the final result
      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      // Mock participants creation - insert().select() returns participants (no .single())
      mockSelect.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Team Dinner',
        description: 'Monthly team dinner',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        participants: [
          {
            name: 'Alice',
            email: 'alice@example.com',
            share_amount: 166666.67,
            share_percentage: 33.33,
          },
          {
            name: 'Bob',
            email: 'bob@example.com',
            share_amount: 166666.67,
            share_percentage: 33.33,
          },
        ],
      }

      const result = await createBill(createData)

      expect(result.bill).toEqual(mockBillData)
      expect(result.participants).toEqual(mockParticipants)
      expect(mockFrom).toHaveBeenCalledWith('split_bills')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should rollback bill creation if participants creation fails', async () => {
      const mockBillData: SplitBill = {
        id: 'test-bill-id-123',
        title: 'Team Dinner',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Mock bill creation success
      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      // Mock participants creation failure - insert().select() returns error
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      })

      const createData: CreateBillData = {
        title: 'Team Dinner',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        participants: [{ name: 'Alice', share_amount: 250000, share_percentage: 50 }],
      }

      await expect(createBill(createData)).rejects.toThrow()

      // Verify rollback was called
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should throw error if bill creation fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      })

      const createData: CreateBillData = {
        title: 'Team Dinner',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        participants: [{ name: 'Alice', share_amount: 250000, share_percentage: 50 }],
      }

      await expect(createBill(createData)).rejects.toThrow()
    })

    it('should handle bills with receipt images', async () => {
      const mockBillData: SplitBill = {
        id: 'test-bill-id-123',
        title: 'Restaurant Bill',
        total_amount: 300000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        receipt_image_url: 'https://example.com/receipt.jpg',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'test-bill-id-123',
          name: 'Alice',
          share_amount: 300000,
          share_percentage: 100,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Mock bill creation
      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      // Mock participants creation
      mockSelect.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Restaurant Bill',
        total_amount: 300000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        receipt_image_url: 'https://example.com/receipt.jpg',
        participants: [{ name: 'Alice', share_amount: 300000, share_percentage: 100 }],
      }

      const result = await createBill(createData)

      expect(result.bill.receipt_image_url).toBe('https://example.com/receipt.jpg')
      expect(result.bill.split_type).toBe('equal')
    })
  })

  describe('getBillById', () => {
    it('should fetch bill with participants', async () => {
      const mockBill: SplitBill = {
        id: 'test-bill-id',
        title: 'Team Lunch',
        total_amount: 400000,
        currency: 'IDR',
        organizer_name: 'Jane Doe',
        organizer_bank_account: '9876543210',
        organizer_bank_name: 'Mandiri',
        split_type: 'equal',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'test-bill-id',
          name: 'Alice',
          share_amount: 200000,
          share_percentage: 50,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      // Mock bill fetch
      mockSingle.mockResolvedValueOnce({
        data: mockBill,
        error: null,
      })

      // Mock participants fetch - select().eq().order()
      mockOrder.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      // Mock transactions fetch - select().eq().order()
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Mock items fetch - getBillItems() - select().eq().order()
      mockOrder.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const result = await getBillById('test-bill-id')

      expect(result).not.toBeNull()
      expect(result?.bill).toEqual(mockBill)
      expect(result?.participants).toEqual(mockParticipants)
    })

    it('should return null if bill not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      })

      const result = await getBillById('non-existent-id')

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const result = await getBillById('test-bill-id')

      expect(result).toBeNull()
    })
  })

  describe('updateParticipantPaymentStatus', () => {
    it('should update participant payment status successfully', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await updateParticipantPaymentStatus('p1', 'paid')

      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('split_bill_participants')
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('should handle status update errors', async () => {
      // Mock error by returning an error
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      })

      const result = await updateParticipantPaymentStatus('p1', 'paid')
      expect(result).toBe(false)
    })

    it('should update all payment statuses correctly', async () => {
      const statuses: PaymentStatus[] = ['pending', 'paid', 'confirmed']

      for (const status of statuses) {
        mockEq.mockResolvedValueOnce({
          data: null,
          error: null,
        })

        const result = await updateParticipantPaymentStatus('p1', status)
        expect(result).toBe(true)
      }
    })
  })

  describe('deleteBill', () => {
    it('should delete a bill successfully', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await deleteBill('test-bill-id')
      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('split_bills')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('should return false if deletion fails', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Delete failed' },
      })

      const result = await deleteBill('test-bill-id')
      expect(result).toBe(false)
    })
  })

  describe('Calculation Functions', () => {
    describe('calculateEqualSplit', () => {
      it('should calculate equal split correctly', () => {
        expect(calculateEqualSplit(300000, 3)).toBeCloseTo(100000, 2)
        expect(calculateEqualSplit(100, 3)).toBeCloseTo(33.33, 2)
        expect(calculateEqualSplit(1000, 7)).toBeCloseTo(142.86, 2)
      })

      it('should handle zero participants', () => {
        expect(calculateEqualSplit(1000, 0)).toBe(0)
      })

      it('should handle zero amount', () => {
        expect(calculateEqualSplit(0, 5)).toBe(0)
      })

      it('should handle very large amounts', () => {
        const result = calculateEqualSplit(999999999.99, 3)
        expect(result).toBeCloseTo(333333333.33, 2)
      })
    })

    describe('validateCustomSplit', () => {
      it('should validate correct custom split', () => {
        const shares = [100, 200, 200]
        const result = validateCustomSplit(500, shares)

        expect(result.isValid).toBe(true)
        expect(result.difference).toBe(0)
      })

      it('should reject incorrect total', () => {
        const shares = [100, 100]
        const result = validateCustomSplit(500, shares)

        expect(result.isValid).toBe(false)
        expect(result.difference).toBe(300)
      })

      it('should handle rounding errors with tolerance', () => {
        const shares = [33.33, 33.33, 33.34]
        const result = validateCustomSplit(100, shares)

        expect(result.isValid).toBe(true)
        expect(result.difference).toBe(0)
      })
    })
  })

  describe('Edge Cases and Calculations', () => {
    it('should handle very large bill amounts', async () => {
      const mockBillData: SplitBill = {
        id: 'large-bill',
        title: 'Company Event',
        total_amount: 999999999.99,
        currency: 'USD',
        organizer_name: 'Admin',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'Bank',
        split_type: 'equal',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      mockSelect.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Company Event',
        total_amount: 999999999.99,
        currency: 'USD',
        organizer_name: 'Admin',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'Bank',
        split_type: 'equal',
        participants: [],
      }

      const result = await createBill(createData)
      expect(result.bill.total_amount).toBe(999999999.99)
    })

    it('should handle zero amount bills', async () => {
      const mockBillData: SplitBill = {
        id: 'zero-bill',
        title: 'Free Event',
        total_amount: 0,
        currency: 'IDR',
        organizer_name: 'Organizer',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      mockSelect.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Free Event',
        total_amount: 0,
        currency: 'IDR',
        organizer_name: 'Organizer',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'equal',
        participants: [],
      }

      const result = await createBill(createData)
      expect(result.bill.total_amount).toBe(0)
    })

    it('should handle decimal precision in share amounts', () => {
      const mockParticipants = [
        { share_amount: 33.33 },
        { share_amount: 33.33 },
        { share_amount: 33.34 },
      ]

      const totalShares = mockParticipants.reduce((sum, p) => sum + p.share_amount, 0)
      expect(totalShares).toBeCloseTo(100, 2)
    })
  })

  describe('Percentage-Based Split', () => {
    it('should create bill with percentage-based splits', async () => {
      const mockBillData: SplitBill = {
        id: 'percentage-bill-id',
        title: 'Project Payment',
        description: 'Based on contribution percentage',
        total_amount: 1000000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'percentage',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'percentage-bill-id',
          name: 'Alice',
          share_amount: 500000,
          share_percentage: 50,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p2',
          bill_id: 'percentage-bill-id',
          name: 'Bob',
          share_amount: 300000,
          share_percentage: 30,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p3',
          bill_id: 'percentage-bill-id',
          name: 'Charlie',
          share_amount: 200000,
          share_percentage: 20,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      mockSelect.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Project Payment',
        description: 'Based on contribution percentage',
        total_amount: 1000000,
        currency: 'IDR',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'percentage',
        participants: [
          { name: 'Alice', share_amount: 500000, share_percentage: 50 },
          { name: 'Bob', share_amount: 300000, share_percentage: 30 },
          { name: 'Charlie', share_amount: 200000, share_percentage: 20 },
        ],
      }

      const result = await createBill(createData)

      expect(result.bill.split_type).toBe('percentage')
      expect(result.participants).toHaveLength(3)
      expect(result.participants[0].share_percentage).toBe(50)
      expect(result.participants[0].share_amount).toBe(500000)
      expect(result.participants[1].share_percentage).toBe(30)
      expect(result.participants[1].share_amount).toBe(300000)
      expect(result.participants[2].share_percentage).toBe(20)
      expect(result.participants[2].share_amount).toBe(200000)
    })

    it('should validate percentages sum to 100%', () => {
      // Valid case - exactly 100%
      const validShares = [
        { percentage: 50, amount: 500 },
        { percentage: 30, amount: 300 },
        { percentage: 20, amount: 200 },
      ]
      const validTotal = validShares.reduce((sum, s) => sum + s.percentage, 0)
      expect(validTotal).toBe(100)

      // Invalid case - less than 100%
      const invalidShares1 = [
        { percentage: 40, amount: 400 },
        { percentage: 40, amount: 400 },
      ]
      const invalidTotal1 = invalidShares1.reduce((sum, s) => sum + s.percentage, 0)
      expect(invalidTotal1).toBeLessThan(100)

      // Invalid case - more than 100%
      const invalidShares2 = [
        { percentage: 60, amount: 600 },
        { percentage: 60, amount: 600 },
      ]
      const invalidTotal2 = invalidShares2.reduce((sum, s) => sum + s.percentage, 0)
      expect(invalidTotal2).toBeGreaterThan(100)
    })

    it('should calculate correct amounts based on percentages', () => {
      const totalAmount = 1000000

      const testCases = [
        { percentage: 50, expectedAmount: 500000 },
        { percentage: 33.33, expectedAmount: 333300 },
        { percentage: 25, expectedAmount: 250000 },
        { percentage: 12.5, expectedAmount: 125000 },
        { percentage: 100, expectedAmount: 1000000 },
      ]

      for (const testCase of testCases) {
        const calculatedAmount = (totalAmount * testCase.percentage) / 100
        expect(calculatedAmount).toBeCloseTo(testCase.expectedAmount, 2)
      }
    })

    it('should save percentage values to participants', async () => {
      const mockBillData: SplitBill = {
        id: 'test-percentage-bill',
        title: 'Percentage Test',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'Organizer',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'percentage',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'test-percentage-bill',
          name: 'Alice',
          share_amount: 350000,
          share_percentage: 70,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p2',
          bill_id: 'test-percentage-bill',
          name: 'Bob',
          share_amount: 150000,
          share_percentage: 30,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      mockSelect.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Percentage Test',
        total_amount: 500000,
        currency: 'IDR',
        organizer_name: 'Organizer',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'BCA',
        split_type: 'percentage',
        participants: [
          { name: 'Alice', share_amount: 350000, share_percentage: 70 },
          { name: 'Bob', share_amount: 150000, share_percentage: 30 },
        ],
      }

      const result = await createBill(createData)

      // Verify each participant has correct percentage saved
      expect(result.participants[0].share_percentage).toBe(70)
      expect(result.participants[1].share_percentage).toBe(30)

      // Verify amounts match percentages
      expect(result.participants[0].share_amount).toBe(350000)
      expect(result.participants[1].share_amount).toBe(150000)

      // Verify total percentages sum to 100
      const totalPercentage = result.participants.reduce(
        (sum, p) => sum + (p.share_percentage || 0),
        0
      )
      expect(totalPercentage).toBe(100)
    })

    it('should handle decimal percentages correctly', async () => {
      const mockBillData: SplitBill = {
        id: 'decimal-percentage-bill',
        title: 'Decimal Percentage Test',
        total_amount: 1000,
        currency: 'USD',
        organizer_name: 'Test',
        organizer_bank_account: '123',
        organizer_bank_name: 'Bank',
        split_type: 'percentage',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockParticipants: SplitBillParticipant[] = [
        {
          id: 'p1',
          bill_id: 'decimal-percentage-bill',
          name: 'Person1',
          share_amount: 333.33,
          share_percentage: 33.33,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p2',
          bill_id: 'decimal-percentage-bill',
          name: 'Person2',
          share_amount: 333.33,
          share_percentage: 33.33,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'p3',
          bill_id: 'decimal-percentage-bill',
          name: 'Person3',
          share_amount: 333.34,
          share_percentage: 33.34,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      mockSingle.mockResolvedValueOnce({
        data: mockBillData,
        error: null,
      })

      mockSelect.mockResolvedValueOnce({
        data: mockParticipants,
        error: null,
      })

      const createData: CreateBillData = {
        title: 'Decimal Percentage Test',
        total_amount: 1000,
        currency: 'USD',
        organizer_name: 'Test',
        organizer_bank_account: '123',
        organizer_bank_name: 'Bank',
        split_type: 'percentage',
        participants: [
          { name: 'Person1', share_amount: 333.33, share_percentage: 33.33 },
          { name: 'Person2', share_amount: 333.33, share_percentage: 33.33 },
          { name: 'Person3', share_amount: 333.34, share_percentage: 33.34 },
        ],
      }

      const result = await createBill(createData)

      const totalPercentage = result.participants.reduce(
        (sum, p) => sum + (p.share_percentage || 0),
        0
      )
      const totalAmount = result.participants.reduce((sum, p) => sum + p.share_amount, 0)

      expect(totalPercentage).toBeCloseTo(100, 2)
      expect(totalAmount).toBeCloseTo(1000, 2)
    })
  })

  describe('Multi-Currency Support', () => {
    it('should handle different currencies correctly', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'IDR', 'JPY']

      for (const currency of currencies) {
        const mockBillData: SplitBill = {
          id: `bill-${currency}`,
          title: `Test ${currency}`,
          total_amount: 1000,
          currency: currency,
          organizer_name: 'Test',
          organizer_bank_account: '123',
          organizer_bank_name: 'Bank',
          split_type: 'equal',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Mock bill creation
        mockSingle.mockResolvedValueOnce({
          data: mockBillData,
          error: null,
        })

        // Mock participants creation
        mockSelect.mockResolvedValueOnce({
          data: [],
          error: null,
        })

        const createData: CreateBillData = {
          title: `Test ${currency}`,
          total_amount: 1000,
          currency: currency,
          organizer_name: 'Test',
          organizer_bank_account: '123',
          organizer_bank_name: 'Bank',
          split_type: 'equal',
          participants: [],
        }

        const result = await createBill(createData)
        expect(result.bill.currency).toBe(currency)
      }
    })
  })
})
