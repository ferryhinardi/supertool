import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  CreateBillData,
  SplitBill,
  SplitBillItem,
  SplitBillItemAssignment,
  SplitBillParticipant,
  SplitBillTransaction,
} from '../split-bill-types'

// Mock Supabase client
const mockFrom = vi.fn()
const mockChannel = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    channel: (...args: unknown[]) => mockChannel(...args),
  },
}))

// Import after mocking
import {
  assignItemToParticipant,
  bulkAssignItems,
  calculateEqualSplit,
  createBill,
  createBillItem,
  createTransaction,
  deleteBill,
  deleteBillItem,
  getAllBills,
  getBillById,
  getBillItems,
  getParticipantItemsTotal,
  subscribeToBillUpdates,
  unassignItemFromParticipant,
  updateBillItem,
  updateBillStatus,
  updateParticipantPaymentStatus,
  updateTransactionStatus,
  validateCustomSplit,
} from '../split-bill-service'

// Test data factories
const createMockBill = (overrides: Partial<SplitBill> = {}): SplitBill => ({
  id: 'bill-123',
  title: 'Dinner at Restaurant',
  description: 'Team dinner',
  total_amount: 150.0,
  currency: 'USD',
  organizer_name: 'John Doe',
  organizer_bank_account: '1234567890',
  organizer_bank_name: 'Bank A',
  split_type: 'equal',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockParticipant = (
  overrides: Partial<SplitBillParticipant> = {}
): SplitBillParticipant => ({
  id: 'participant-1',
  bill_id: 'bill-123',
  name: 'Alice',
  email: 'alice@example.com',
  share_amount: 50.0,
  payment_status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockTransaction = (
  overrides: Partial<SplitBillTransaction> = {}
): SplitBillTransaction => ({
  id: 'transaction-1',
  bill_id: 'bill-123',
  participant_id: 'participant-1',
  amount: 50.0,
  status: 'unverified',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockItem = (overrides: Partial<SplitBillItem> = {}): SplitBillItem => ({
  id: 'item-1',
  bill_id: 'bill-123',
  name: 'Pizza',
  price: 20.0,
  quantity: 1,
  display_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

const createMockAssignment = (
  overrides: Partial<SplitBillItemAssignment> = {}
): SplitBillItemAssignment => ({
  id: 'assignment-1',
  item_id: 'item-1',
  participant_id: 'participant-1',
  assigned_amount: 20.0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Helper to create chainable mock
const createChainableMock = () => {
  const mock: Record<string, Mock> = {}
  mock.insert = vi.fn().mockReturnValue(mock)
  mock.select = vi.fn().mockReturnValue(mock)
  mock.update = vi.fn().mockReturnValue(mock)
  mock.delete = vi.fn().mockReturnValue(mock)
  mock.eq = vi.fn().mockReturnValue(mock)
  mock.in = vi.fn().mockReturnValue(mock)
  mock.order = vi.fn().mockReturnValue(mock)
  mock.single = vi.fn()
  return mock
}

describe('Split Bill Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console.error mock
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // =====================================================
  // PURE UTILITY FUNCTIONS
  // =====================================================

  describe('calculateEqualSplit', () => {
    it('should calculate equal split correctly', () => {
      expect(calculateEqualSplit(100, 4)).toBe(25)
      expect(calculateEqualSplit(150, 3)).toBe(50)
      expect(calculateEqualSplit(99.99, 3)).toBe(33.33)
    })

    it('should handle zero participants', () => {
      expect(calculateEqualSplit(100, 0)).toBe(0)
    })

    it('should handle single participant', () => {
      expect(calculateEqualSplit(100, 1)).toBe(100)
    })

    it('should round to 2 decimal places', () => {
      // 100 / 3 = 33.333...
      expect(calculateEqualSplit(100, 3)).toBe(33.33)
      // 100 / 7 = 14.2857...
      expect(calculateEqualSplit(100, 7)).toBe(14.29)
    })

    it('should handle large amounts', () => {
      expect(calculateEqualSplit(10000, 7)).toBe(1428.57)
    })

    it('should handle small amounts', () => {
      expect(calculateEqualSplit(1, 3)).toBe(0.33)
    })
  })

  describe('validateCustomSplit', () => {
    it('should validate correct split', () => {
      const result = validateCustomSplit(100, [25, 25, 25, 25])
      expect(result.isValid).toBe(true)
      expect(result.difference).toBe(0)
    })

    it('should detect under-split', () => {
      const result = validateCustomSplit(100, [20, 20, 20])
      expect(result.isValid).toBe(false)
      expect(result.difference).toBe(40)
    })

    it('should detect over-split', () => {
      const result = validateCustomSplit(100, [50, 50, 50])
      expect(result.isValid).toBe(false)
      expect(result.difference).toBe(-50)
    })

    it('should allow small rounding differences (less than 1 cent)', () => {
      // Sum is 99.999 which is 0.001 off from 100
      const result = validateCustomSplit(100, [33.333, 33.333, 33.333])
      expect(result.isValid).toBe(true)
    })

    it('should reject differences of 1 cent or more', () => {
      const result = validateCustomSplit(100, [33, 33, 33])
      expect(result.isValid).toBe(false)
      expect(result.difference).toBe(1)
    })

    it('should handle empty shares array', () => {
      const result = validateCustomSplit(100, [])
      expect(result.isValid).toBe(false)
      expect(result.difference).toBe(100)
    })

    it('should handle single share', () => {
      const result = validateCustomSplit(100, [100])
      expect(result.isValid).toBe(true)
      expect(result.difference).toBe(0)
    })
  })

  // =====================================================
  // DATABASE FUNCTIONS
  // =====================================================

  describe('createBill', () => {
    it('should create bill with participants successfully', async () => {
      const mockBill = createMockBill()
      const mockParticipants = [
        createMockParticipant({ id: 'p1', name: 'Alice' }),
        createMockParticipant({ id: 'p2', name: 'Bob' }),
      ]

      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({ data: mockBill, error: null })

      const participantMock = createChainableMock()
      participantMock.select.mockResolvedValue({ data: mockParticipants, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bills') return billMock
        if (table === 'split_bill_participants') return participantMock
        return createChainableMock()
      })

      const createData: CreateBillData = {
        title: 'Dinner at Restaurant',
        description: 'Team dinner',
        total_amount: 150.0,
        currency: 'USD',
        organizer_name: 'John Doe',
        organizer_bank_account: '1234567890',
        organizer_bank_name: 'Bank A',
        split_type: 'equal',
        participants: [
          { name: 'Alice', share_amount: 75 },
          { name: 'Bob', share_amount: 75 },
        ],
      }

      const result = await createBill(createData)

      expect(result.bill).toEqual(mockBill)
      expect(result.participants).toEqual(mockParticipants)
      expect(mockFrom).toHaveBeenCalledWith('split_bills')
      expect(mockFrom).toHaveBeenCalledWith('split_bill_participants')
    })

    it('should throw error when bill creation fails', async () => {
      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      mockFrom.mockReturnValue(billMock)

      const createData: CreateBillData = {
        title: 'Test Bill',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'John',
        split_type: 'equal',
        participants: [{ name: 'Alice', share_amount: 100 }],
      }

      await expect(createBill(createData)).rejects.toThrow('Database error')
    })

    it('should rollback bill when participant creation fails', async () => {
      const mockBill = createMockBill()

      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({ data: mockBill, error: null })

      const deleteMock = createChainableMock()
      deleteMock.eq.mockResolvedValue({ error: null })

      const participantMock = createChainableMock()
      participantMock.select.mockResolvedValue({
        data: null,
        error: { message: 'Participant creation failed' },
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bills') {
          // Return different mock based on operation context
          const mock = createChainableMock()
          mock.single.mockResolvedValue({ data: mockBill, error: null })
          mock.eq.mockResolvedValue({ error: null })
          return mock
        }
        if (table === 'split_bill_participants') return participantMock
        return createChainableMock()
      })

      const createData: CreateBillData = {
        title: 'Test Bill',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'John',
        split_type: 'equal',
        participants: [{ name: 'Alice', share_amount: 100 }],
      }

      await expect(createBill(createData)).rejects.toThrow('Participant creation failed')
    })
  })

  describe('getBillById', () => {
    it('should return bill with participants and transactions', async () => {
      const mockBill = createMockBill()
      const mockParticipants = [createMockParticipant()]
      const mockTransactions = [createMockTransaction()]
      const mockItems: SplitBillItem[] = []

      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({ data: mockBill, error: null })

      const participantMock = createChainableMock()
      participantMock.order.mockResolvedValue({ data: mockParticipants, error: null })

      const transactionMock = createChainableMock()
      transactionMock.order.mockResolvedValue({ data: mockTransactions, error: null })

      const itemsMock = createChainableMock()
      itemsMock.order.mockResolvedValue({ data: mockItems, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bills') return billMock
        if (table === 'split_bill_participants') return participantMock
        if (table === 'split_bill_transactions') return transactionMock
        if (table === 'split_bill_items') return itemsMock
        if (table === 'split_bill_item_assignments') {
          const mock = createChainableMock()
          mock.in.mockResolvedValue({ data: [], error: null })
          return mock
        }
        return createChainableMock()
      })

      const result = await getBillById('bill-123')

      expect(result).not.toBeNull()
      expect(result?.bill).toEqual(mockBill)
      expect(result?.participants).toEqual(mockParticipants)
      expect(result?.transactions).toEqual(mockTransactions)
    })

    it('should return null when bill not found', async () => {
      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      mockFrom.mockReturnValue(billMock)

      const result = await getBillById('nonexistent-id')

      expect(result).toBeNull()
    })

    it('should return null when participants fetch fails', async () => {
      const mockBill = createMockBill()

      const billMock = createChainableMock()
      billMock.single.mockResolvedValue({ data: mockBill, error: null })

      const participantMock = createChainableMock()
      participantMock.order.mockResolvedValue({
        data: null,
        error: { message: 'Participants error' },
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bills') return billMock
        if (table === 'split_bill_participants') return participantMock
        return createChainableMock()
      })

      const result = await getBillById('bill-123')

      expect(result).toBeNull()
    })
  })

  describe('getAllBills', () => {
    it('should return all bills summary', async () => {
      const mockSummaries = [
        { ...createMockBill(), total_participants: 3, pending_count: 1, paid_count: 2 },
        {
          ...createMockBill({ id: 'bill-456' }),
          total_participants: 2,
          pending_count: 0,
          paid_count: 2,
        },
      ]

      const summaryMock = createChainableMock()
      summaryMock.order.mockResolvedValue({ data: mockSummaries, error: null })

      mockFrom.mockReturnValue(summaryMock)

      const result = await getAllBills()

      expect(result).toHaveLength(2)
      expect(mockFrom).toHaveBeenCalledWith('split_bill_summary')
    })

    it('should return empty array on error', async () => {
      const summaryMock = createChainableMock()
      summaryMock.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      mockFrom.mockReturnValue(summaryMock)

      const result = await getAllBills()

      expect(result).toEqual([])
    })
  })

  describe('updateParticipantPaymentStatus', () => {
    it('should update status to paid with timestamp', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateParticipantPaymentStatus('participant-1', 'paid')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_status: 'paid',
          paid_at: expect.any(String),
        })
      )
    })

    it('should update status to confirmed with timestamp', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateParticipantPaymentStatus('participant-1', 'confirmed')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_status: 'confirmed',
          confirmed_at: expect.any(String),
        })
      )
    })

    it('should update status to pending without extra timestamps', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateParticipantPaymentStatus('participant-1', 'pending')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith({
        payment_status: 'pending',
      })
    })

    it('should return false on error', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateParticipantPaymentStatus('participant-1', 'paid')

      expect(result).toBe(false)
    })
  })

  describe('updateBillStatus', () => {
    it('should update status to completed with timestamp', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateBillStatus('bill-123', 'completed')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          completed_at: expect.any(String),
        })
      )
    })

    it('should update status to cancelled without timestamp', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateBillStatus('bill-123', 'cancelled')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith({
        status: 'cancelled',
      })
    })

    it('should return false on error', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateBillStatus('bill-123', 'completed')

      expect(result).toBe(false)
    })
  })

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockTransaction = createMockTransaction()

      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({ data: mockTransaction, error: null })

      mockFrom.mockReturnValue(insertMock)

      const result = await createTransaction(
        'bill-123',
        'participant-1',
        50.0,
        'https://example.com/proof.jpg',
        'Payment note'
      )

      expect(result).toEqual(mockTransaction)
      expect(insertMock.insert).toHaveBeenCalledWith({
        bill_id: 'bill-123',
        participant_id: 'participant-1',
        amount: 50.0,
        proof_image_url: 'https://example.com/proof.jpg',
        notes: 'Payment note',
        status: 'unverified',
      })
    })

    it('should create transaction without optional fields', async () => {
      const mockTransaction = createMockTransaction()

      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({ data: mockTransaction, error: null })

      mockFrom.mockReturnValue(insertMock)

      const result = await createTransaction('bill-123', 'participant-1', 50.0)

      expect(result).toEqual(mockTransaction)
      expect(insertMock.insert).toHaveBeenCalledWith({
        bill_id: 'bill-123',
        participant_id: 'participant-1',
        amount: 50.0,
        proof_image_url: undefined,
        notes: undefined,
        status: 'unverified',
      })
    })

    it('should return null on error', async () => {
      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      mockFrom.mockReturnValue(insertMock)

      const result = await createTransaction('bill-123', 'participant-1', 50.0)

      expect(result).toBeNull()
    })
  })

  describe('updateTransactionStatus', () => {
    it('should update status to verified with verifiedBy and timestamp', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateTransactionStatus('transaction-1', 'verified', 'admin-user')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'verified',
          verified_by: 'admin-user',
          verified_at: expect.any(String),
        })
      )
    })

    it('should update status to rejected without verifiedBy fields', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateTransactionStatus('transaction-1', 'rejected')

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith({
        status: 'rejected',
      })
    })

    it('should return false on error', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateTransactionStatus('transaction-1', 'verified')

      expect(result).toBe(false)
    })
  })

  describe('deleteBill', () => {
    it('should delete bill successfully', async () => {
      const deleteMock = createChainableMock()
      deleteMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(deleteMock)

      const result = await deleteBill('bill-123')

      expect(result).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('split_bills')
    })

    it('should return false on error', async () => {
      const deleteMock = createChainableMock()
      deleteMock.eq.mockResolvedValue({ error: { message: 'Delete failed' } })

      mockFrom.mockReturnValue(deleteMock)

      const result = await deleteBill('bill-123')

      expect(result).toBe(false)
    })
  })

  describe('subscribeToBillUpdates', () => {
    it('should set up real-time subscription', () => {
      mockOn.mockReturnValue({ subscribe: mockSubscribe })
      mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe })
      mockChannel.mockReturnValue({
        on: mockOn,
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
      })

      const onUpdate = vi.fn()
      const unsubscribe = subscribeToBillUpdates('bill-123', onUpdate)

      expect(mockChannel).toHaveBeenCalledWith('bill-bill-123')
      expect(typeof unsubscribe).toBe('function')
    })

    it('should return unsubscribe function', () => {
      mockOn.mockReturnValue({ subscribe: mockSubscribe })
      mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe })
      mockChannel.mockReturnValue({
        on: mockOn,
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribe,
      })

      const onUpdate = vi.fn()
      const unsubscribe = subscribeToBillUpdates('bill-123', onUpdate)

      unsubscribe()
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  // =====================================================
  // ITEM MANAGEMENT FUNCTIONS
  // =====================================================

  describe('createBillItem', () => {
    it('should create item successfully', async () => {
      const mockItem = createMockItem()

      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({ data: mockItem, error: null })

      mockFrom.mockReturnValue(insertMock)

      const result = await createBillItem('bill-123', {
        name: 'Pizza',
        price: 20.0,
        quantity: 1,
      })

      expect(result).toEqual(mockItem)
      expect(insertMock.insert).toHaveBeenCalledWith({
        bill_id: 'bill-123',
        name: 'Pizza',
        description: undefined,
        price: 20.0,
        quantity: 1,
        category: undefined,
        notes: undefined,
        display_order: 0,
      })
    })

    it('should create item with all optional fields', async () => {
      const mockItem = createMockItem({
        description: 'Large pepperoni',
        category: 'Food',
        notes: 'Extra cheese',
      })

      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({ data: mockItem, error: null })

      mockFrom.mockReturnValue(insertMock)

      const result = await createBillItem('bill-123', {
        name: 'Pizza',
        price: 20.0,
        quantity: 2,
        description: 'Large pepperoni',
        category: 'Food',
        notes: 'Extra cheese',
      })

      expect(result).toEqual(mockItem)
    })

    it('should return null on error', async () => {
      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      mockFrom.mockReturnValue(insertMock)

      const result = await createBillItem('bill-123', {
        name: 'Pizza',
        price: 20.0,
        quantity: 1,
      })

      expect(result).toBeNull()
    })
  })

  describe('getBillItems', () => {
    it('should return items with assignments', async () => {
      const mockItems = [
        createMockItem({ id: 'item-1', price: 20, quantity: 1 }),
        createMockItem({ id: 'item-2', name: 'Salad', price: 15, quantity: 1 }),
      ]

      const mockAssignments = [
        {
          ...createMockAssignment({ item_id: 'item-1' }),
          split_bill_participants: { name: 'Alice' },
        },
      ]

      const itemsMock = createChainableMock()
      itemsMock.order.mockResolvedValue({ data: mockItems, error: null })

      const assignmentsMock = createChainableMock()
      assignmentsMock.in.mockResolvedValue({ data: mockAssignments, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bill_items') return itemsMock
        if (table === 'split_bill_item_assignments') return assignmentsMock
        return createChainableMock()
      })

      const result = await getBillItems('bill-123')

      expect(result).toHaveLength(2)
      expect(result[0].assigned_to).toContain('Alice')
      expect(result[0].total_price).toBe(20)
    })

    it('should return empty array on error', async () => {
      const itemsMock = createChainableMock()
      itemsMock.order.mockResolvedValue({
        data: null,
        error: { message: 'Fetch failed' },
      })

      mockFrom.mockReturnValue(itemsMock)

      const result = await getBillItems('bill-123')

      expect(result).toEqual([])
    })
  })

  describe('updateBillItem', () => {
    it('should update item successfully', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateBillItem('item-1', { name: 'Updated Pizza', price: 25 })

      expect(result).toBe(true)
      expect(updateMock.update).toHaveBeenCalledWith({ name: 'Updated Pizza', price: 25 })
    })

    it('should return false on error', async () => {
      const updateMock = createChainableMock()
      updateMock.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      mockFrom.mockReturnValue(updateMock)

      const result = await updateBillItem('item-1', { name: 'Updated' })

      expect(result).toBe(false)
    })
  })

  describe('deleteBillItem', () => {
    it('should delete item successfully', async () => {
      const deleteMock = createChainableMock()
      deleteMock.eq.mockResolvedValue({ error: null })

      mockFrom.mockReturnValue(deleteMock)

      const result = await deleteBillItem('item-1')

      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      const deleteMock = createChainableMock()
      deleteMock.eq.mockResolvedValue({ error: { message: 'Delete failed' } })

      mockFrom.mockReturnValue(deleteMock)

      const result = await deleteBillItem('item-1')

      expect(result).toBe(false)
    })
  })

  describe('assignItemToParticipant', () => {
    it('should assign item and calculate amount', async () => {
      const mockItem = { price: 30, quantity: 2 } // total = 60
      const mockExistingAssignments: SplitBillItemAssignment[] = [] // No existing, so this will be first
      const mockNewAssignment = createMockAssignment({ assigned_amount: 60 })

      const itemMock = createChainableMock()
      itemMock.single.mockResolvedValue({ data: mockItem, error: null })

      const existingMock = createChainableMock()
      existingMock.eq.mockResolvedValue({ data: mockExistingAssignments, error: null })

      const insertMock = createChainableMock()
      insertMock.single.mockResolvedValue({ data: mockNewAssignment, error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bill_items') return itemMock
        if (table === 'split_bill_item_assignments') {
          // Return different mock based on context
          const mock = createChainableMock()
          mock.eq.mockResolvedValue({ data: mockExistingAssignments, error: null })
          mock.single.mockResolvedValue({ data: mockNewAssignment, error: null })
          return mock
        }
        return createChainableMock()
      })

      const result = await assignItemToParticipant('item-1', 'participant-1')

      expect(result).toEqual(mockNewAssignment)
    })

    it('should return null when item not found', async () => {
      const itemMock = createChainableMock()
      itemMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Item not found' },
      })

      mockFrom.mockReturnValue(itemMock)

      const result = await assignItemToParticipant('nonexistent-item', 'participant-1')

      expect(result).toBeNull()
    })
  })

  describe('unassignItemFromParticipant', () => {
    it('should unassign item successfully', async () => {
      const deleteMock = createChainableMock()
      const eqMock = vi.fn().mockResolvedValue({ error: null })
      deleteMock.eq.mockReturnValue({ eq: eqMock })

      mockFrom.mockReturnValue(deleteMock)

      const result = await unassignItemFromParticipant('item-1', 'participant-1')

      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      const deleteMock = createChainableMock()
      const eqMock = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      deleteMock.eq.mockReturnValue({ eq: eqMock })

      mockFrom.mockReturnValue(deleteMock)

      const result = await unassignItemFromParticipant('item-1', 'participant-1')

      expect(result).toBe(false)
    })
  })

  describe('getParticipantItemsTotal', () => {
    it('should calculate total from assignments', async () => {
      const mockAssignments = [
        { assigned_amount: 20 },
        { assigned_amount: 15 },
        { assigned_amount: 10.5 },
      ]

      const selectMock = createChainableMock()
      selectMock.eq.mockResolvedValue({ data: mockAssignments, error: null })

      mockFrom.mockReturnValue(selectMock)

      const result = await getParticipantItemsTotal('participant-1')

      expect(result).toBe(45.5)
    })

    it('should return 0 on error', async () => {
      const selectMock = createChainableMock()
      selectMock.eq.mockResolvedValue({
        data: null,
        error: { message: 'Fetch failed' },
      })

      mockFrom.mockReturnValue(selectMock)

      const result = await getParticipantItemsTotal('participant-1')

      expect(result).toBe(0)
    })

    it('should return 0 for empty assignments', async () => {
      const selectMock = createChainableMock()
      selectMock.eq.mockResolvedValue({ data: [], error: null })

      mockFrom.mockReturnValue(selectMock)

      const result = await getParticipantItemsTotal('participant-1')

      expect(result).toBe(0)
    })
  })

  describe('bulkAssignItems', () => {
    it('should bulk assign items successfully', async () => {
      const mockItems = [
        { id: 'item-1', price: 20, quantity: 1 },
        { id: 'item-2', price: 30, quantity: 2 },
      ]

      const itemsMock = createChainableMock()
      itemsMock.in.mockResolvedValue({ data: mockItems, error: null })

      const insertMock = createChainableMock()
      insertMock.insert.mockResolvedValue({ error: null })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bill_items') return itemsMock
        if (table === 'split_bill_item_assignments') return insertMock
        return createChainableMock()
      })

      const result = await bulkAssignItems([
        { itemId: 'item-1', participantId: 'participant-1' },
        { itemId: 'item-2', participantId: 'participant-2' },
      ])

      expect(result).toBe(true)
    })

    it('should return false when items fetch fails', async () => {
      const itemsMock = createChainableMock()
      itemsMock.in.mockResolvedValue({ data: null, error: null })

      mockFrom.mockReturnValue(itemsMock)

      const result = await bulkAssignItems([{ itemId: 'item-1', participantId: 'participant-1' }])

      expect(result).toBe(false)
    })

    it('should return false on insert error', async () => {
      const mockItems = [{ id: 'item-1', price: 20, quantity: 1 }]

      const itemsMock = createChainableMock()
      itemsMock.in.mockResolvedValue({ data: mockItems, error: null })

      const insertMock = createChainableMock()
      insertMock.insert.mockResolvedValue({ error: { message: 'Insert failed' } })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bill_items') return itemsMock
        if (table === 'split_bill_item_assignments') return insertMock
        return createChainableMock()
      })

      const result = await bulkAssignItems([{ itemId: 'item-1', participantId: 'participant-1' }])

      expect(result).toBe(false)
    })

    it('should calculate correct amounts for multiple assignments to same item', async () => {
      const mockItems = [{ id: 'item-1', price: 30, quantity: 1 }] // Total = 30

      const itemsMock = createChainableMock()
      itemsMock.in.mockResolvedValue({ data: mockItems, error: null })

      let insertedRecords: unknown[] = []
      const insertMock = createChainableMock()
      insertMock.insert.mockImplementation((records: unknown[]) => {
        insertedRecords = records
        return { error: null }
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'split_bill_items') return itemsMock
        if (table === 'split_bill_item_assignments') return insertMock
        return createChainableMock()
      })

      // Assign same item to 3 participants
      await bulkAssignItems([
        { itemId: 'item-1', participantId: 'participant-1' },
        { itemId: 'item-1', participantId: 'participant-2' },
        { itemId: 'item-1', participantId: 'participant-3' },
      ])

      // Each should get 30/3 = 10
      expect(insertedRecords).toHaveLength(3)
      expect((insertedRecords[0] as { assigned_amount: number }).assigned_amount).toBe(10)
      expect((insertedRecords[1] as { assigned_amount: number }).assigned_amount).toBe(10)
      expect((insertedRecords[2] as { assigned_amount: number }).assigned_amount).toBe(10)
    })
  })

  // =====================================================
  // ERROR HANDLING
  // =====================================================

  describe('Error handling', () => {
    it('should handle exceptions in createBill', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      await expect(
        createBill({
          title: 'Test',
          total_amount: 100,
          currency: 'USD',
          organizer_name: 'John',
          split_type: 'equal',
          participants: [],
        })
      ).rejects.toThrow('Unexpected error')
    })

    it('should handle exceptions in getBillById', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await getBillById('bill-123')
      expect(result).toBeNull()
    })

    it('should handle exceptions in getAllBills', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await getAllBills()
      expect(result).toEqual([])
    })

    it('should handle exceptions in updateParticipantPaymentStatus', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await updateParticipantPaymentStatus('p1', 'paid')
      expect(result).toBe(false)
    })

    it('should handle exceptions in deleteBill', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await deleteBill('bill-123')
      expect(result).toBe(false)
    })

    it('should handle exceptions in createTransaction', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await createTransaction('bill-123', 'p1', 50)
      expect(result).toBeNull()
    })

    it('should handle exceptions in updateTransactionStatus', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await updateTransactionStatus('t1', 'verified')
      expect(result).toBe(false)
    })

    it('should handle exceptions in createBillItem', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await createBillItem('bill-123', { name: 'Test', price: 10, quantity: 1 })
      expect(result).toBeNull()
    })

    it('should handle exceptions in getBillItems', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await getBillItems('bill-123')
      expect(result).toEqual([])
    })

    it('should handle exceptions in updateBillItem', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await updateBillItem('item-1', { name: 'Test' })
      expect(result).toBe(false)
    })

    it('should handle exceptions in deleteBillItem', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await deleteBillItem('item-1')
      expect(result).toBe(false)
    })

    it('should handle exceptions in assignItemToParticipant', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await assignItemToParticipant('item-1', 'p1')
      expect(result).toBeNull()
    })

    it('should handle exceptions in unassignItemFromParticipant', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await unassignItemFromParticipant('item-1', 'p1')
      expect(result).toBe(false)
    })

    it('should handle exceptions in getParticipantItemsTotal', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await getParticipantItemsTotal('p1')
      expect(result).toBe(0)
    })

    it('should handle exceptions in bulkAssignItems', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await bulkAssignItems([{ itemId: 'i1', participantId: 'p1' }])
      expect(result).toBe(false)
    })

    it('should handle exceptions in updateBillStatus', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await updateBillStatus('bill-123', 'completed')
      expect(result).toBe(false)
    })
  })
})
