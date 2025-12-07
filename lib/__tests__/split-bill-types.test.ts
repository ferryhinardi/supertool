import { describe, expect, it } from 'vitest'
import type {
  BillDetailResponse,
  BillStatus,
  CreateBillData,
  CreateBillResponse,
  CreateParticipantData,
  ParticipantWithItems,
  PaymentStatus,
  SplitBill,
  SplitBillItemWithAssignments,
  SplitBillParticipant,
  SplitBillSummary,
  SplitBillTransaction,
  SplitBillUser,
  SplitBillWithParticipants,
  SplitType,
  TransactionStatus,
} from '../split-bill-types'

describe('split-bill-types', () => {
  describe('SplitType', () => {
    it('should define valid split types', () => {
      const validTypes: SplitType[] = ['equal', 'custom', 'percentage']
      expect(validTypes).toHaveLength(3)
    })

    it('should accept equal split type', () => {
      const type: SplitType = 'equal'
      expect(type).toBe('equal')
    })

    it('should accept custom split type', () => {
      const type: SplitType = 'custom'
      expect(type).toBe('custom')
    })

    it('should accept percentage split type', () => {
      const type: SplitType = 'percentage'
      expect(type).toBe('percentage')
    })
  })

  describe('BillStatus', () => {
    it('should define valid bill statuses', () => {
      const validStatuses: BillStatus[] = ['active', 'completed', 'cancelled']
      expect(validStatuses).toHaveLength(3)
    })
  })

  describe('PaymentStatus', () => {
    it('should define valid payment statuses', () => {
      const validStatuses: PaymentStatus[] = ['pending', 'paid', 'confirmed']
      expect(validStatuses).toHaveLength(3)
    })
  })

  describe('TransactionStatus', () => {
    it('should define valid transaction statuses', () => {
      const validStatuses: TransactionStatus[] = ['unverified', 'verified', 'rejected']
      expect(validStatuses).toHaveLength(3)
    })
  })

  describe('SplitBillUser', () => {
    it('should create valid user object', () => {
      const user: SplitBillUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      }

      expect(user.id).toBe('user-123')
      expect(user.name).toBe('John Doe')
      expect(user.email).toBe('john@example.com')
    })

    it('should allow optional fields', () => {
      const user: SplitBillUser = {
        id: 'user-123',
        name: 'John Doe',
      }

      expect(user.email).toBeUndefined()
      expect(user.bank_account).toBeUndefined()
    })
  })

  describe('SplitBill', () => {
    it('should create valid bill object', () => {
      const bill: SplitBill = {
        id: 'bill-123',
        title: 'Dinner at Restaurant',
        total_amount: 150.0,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        status: 'active',
      }

      expect(bill.id).toBe('bill-123')
      expect(bill.total_amount).toBe(150.0)
      expect(bill.split_type).toBe('equal')
    })

    it('should allow optional fields', () => {
      const bill: SplitBill = {
        id: 'bill-123',
        title: 'Test Bill',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        status: 'active',
        description: 'Test description',
        receipt_image_url: 'https://example.com/receipt.jpg',
      }

      expect(bill.description).toBe('Test description')
      expect(bill.receipt_image_url).toBeDefined()
    })
  })

  describe('SplitBillParticipant', () => {
    it('should create valid participant object', () => {
      const participant: SplitBillParticipant = {
        id: 'part-123',
        bill_id: 'bill-123',
        name: 'Bob',
        share_amount: 50.0,
        payment_status: 'pending',
      }

      expect(participant.id).toBe('part-123')
      expect(participant.share_amount).toBe(50.0)
      expect(participant.payment_status).toBe('pending')
    })

    it('should support all payment statuses', () => {
      const pending: SplitBillParticipant = {
        id: '1',
        bill_id: 'b1',
        name: 'User',
        share_amount: 10,
        payment_status: 'pending',
      }
      const paid: SplitBillParticipant = { ...pending, payment_status: 'paid' }
      const confirmed: SplitBillParticipant = { ...pending, payment_status: 'confirmed' }

      expect(pending.payment_status).toBe('pending')
      expect(paid.payment_status).toBe('paid')
      expect(confirmed.payment_status).toBe('confirmed')
    })
  })

  describe('SplitBillTransaction', () => {
    it('should create valid transaction object', () => {
      const transaction: SplitBillTransaction = {
        id: 'tx-123',
        bill_id: 'bill-123',
        participant_id: 'part-123',
        amount: 50.0,
        status: 'unverified',
      }

      expect(transaction.amount).toBe(50.0)
      expect(transaction.status).toBe('unverified')
    })

    it('should support transaction statuses', () => {
      const tx: SplitBillTransaction = {
        id: '1',
        bill_id: 'b1',
        participant_id: 'p1',
        amount: 10,
        status: 'verified',
      }

      expect(tx.status).toBe('verified')
    })
  })

  describe('SplitBillSummary', () => {
    it('should extend SplitBill with summary fields', () => {
      const summary: SplitBillSummary = {
        id: 'bill-123',
        title: 'Dinner',
        total_amount: 150.0,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        status: 'active',
        total_participants: 5,
        pending_count: 2,
        paid_count: 2,
        confirmed_count: 1,
        total_paid_amount: 90.0,
        total_pending_amount: 60.0,
      }

      expect(summary.total_participants).toBe(5)
      expect(summary.total_paid_amount).toBe(90.0)
    })
  })

  describe('SplitBillWithParticipants', () => {
    it('should include participants array', () => {
      const billWithParticipants: SplitBillWithParticipants = {
        id: 'bill-123',
        title: 'Dinner',
        total_amount: 150.0,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        status: 'active',
        participants: [
          {
            id: 'p1',
            bill_id: 'bill-123',
            name: 'Bob',
            share_amount: 50,
            payment_status: 'paid',
          },
        ],
      }

      expect(billWithParticipants.participants).toHaveLength(1)
      expect(billWithParticipants.participants[0].name).toBe('Bob')
    })
  })

  describe('CreateBillData', () => {
    it('should create valid bill creation data', () => {
      const createData: CreateBillData = {
        title: 'New Bill',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        participants: [
          {
            name: 'Bob',
            share_amount: 50,
          },
        ],
      }

      expect(createData.participants).toHaveLength(1)
      expect(createData.split_type).toBe('equal')
    })

    it('should support optional items', () => {
      const createData: CreateBillData = {
        title: 'New Bill',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        participants: [],
        items: [
          {
            name: 'Pizza',
            price: 20,
            quantity: 2,
          },
        ],
      }

      expect(createData.items).toHaveLength(1)
      expect(createData.items?.[0].name).toBe('Pizza')
    })
  })

  describe('CreateParticipantData', () => {
    it('should create valid participant data', () => {
      const participant: CreateParticipantData = {
        name: 'Bob',
        share_amount: 50,
      }

      expect(participant.name).toBe('Bob')
      expect(participant.share_amount).toBe(50)
    })

    it('should support share percentage', () => {
      const participant: CreateParticipantData = {
        name: 'Bob',
        share_amount: 50,
        share_percentage: 33.33,
      }

      expect(participant.share_percentage).toBe(33.33)
    })
  })

  describe('CreateBillResponse', () => {
    it('should include bill and participants', () => {
      const response: CreateBillResponse = {
        bill: {
          id: 'bill-123',
          title: 'Test',
          total_amount: 100,
          currency: 'USD',
          organizer_name: 'Alice',
          split_type: 'equal',
          status: 'active',
        },
        participants: [],
      }

      expect(response.bill.id).toBe('bill-123')
      expect(response.participants).toEqual([])
    })
  })

  describe('BillDetailResponse', () => {
    it('should include all detail fields', () => {
      const detail: BillDetailResponse = {
        bill: {
          id: 'bill-123',
          title: 'Test',
          total_amount: 100,
          currency: 'USD',
          organizer_name: 'Alice',
          split_type: 'equal',
          status: 'active',
        },
        participants: [],
        transactions: [],
        items: [],
      }

      expect(detail.bill).toBeDefined()
      expect(detail.participants).toEqual([])
      expect(detail.transactions).toEqual([])
    })

    it('should allow optional transactions and items', () => {
      const detail: BillDetailResponse = {
        bill: {
          id: 'bill-123',
          title: 'Test',
          total_amount: 100,
          currency: 'USD',
          organizer_name: 'Alice',
          split_type: 'equal',
          status: 'active',
        },
        participants: [],
      }

      expect(detail.transactions).toBeUndefined()
      expect(detail.items).toBeUndefined()
    })
  })

  describe('ParticipantWithItems', () => {
    it('should extend participant with item assignments', () => {
      const participantWithItems: ParticipantWithItems = {
        id: 'p1',
        bill_id: 'b1',
        name: 'Bob',
        share_amount: 50,
        payment_status: 'pending',
        assigned_items: [],
        total_from_items: 50,
      }

      expect(participantWithItems.assigned_items).toEqual([])
      expect(participantWithItems.total_from_items).toBe(50)
    })
  })

  describe('SplitBillItemWithAssignments', () => {
    it('should include assignment details', () => {
      const item: SplitBillItemWithAssignments = {
        id: 'item-1',
        bill_id: 'bill-1',
        name: 'Pizza',
        price: 20,
        quantity: 2,
        display_order: 1,
        assignments: [],
        assigned_to: ['Alice', 'Bob'],
        assigned_count: 2,
        total_price: 40,
      }

      expect(item.assigned_to).toHaveLength(2)
      expect(item.total_price).toBe(40)
    })
  })

  describe('Type compatibility', () => {
    it('should allow bill to be assigned to summary', () => {
      const bill: SplitBill = {
        id: 'b1',
        title: 'Test',
        total_amount: 100,
        currency: 'USD',
        organizer_name: 'Alice',
        split_type: 'equal',
        status: 'active',
      }

      const summary: SplitBillSummary = {
        ...bill,
        total_participants: 0,
        pending_count: 0,
        paid_count: 0,
        confirmed_count: 0,
        total_paid_amount: 0,
        total_pending_amount: 0,
      }

      expect(summary.id).toBe(bill.id)
    })
  })
})
