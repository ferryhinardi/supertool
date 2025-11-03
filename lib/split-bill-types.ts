// Split Bill System Types (LINE-Style)

export type SplitType = 'equal' | 'custom' | 'percentage'
export type BillStatus = 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'confirmed'
export type TransactionStatus = 'unverified' | 'verified' | 'rejected'

export interface SplitBillUser {
  id: string
  name: string
  email?: string
  bank_account?: string
  bank_name?: string
  created_at?: string
  updated_at?: string
  auth_user_id?: string
}

export interface SplitBillGroup {
  id: string
  name: string
  description?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface SplitBill {
  id: string
  title: string
  description?: string
  total_amount: number
  currency: string
  receipt_image_url?: string
  group_id?: string
  created_by?: string
  organizer_name: string
  organizer_bank_account?: string
  organizer_bank_name?: string
  split_type: SplitType
  status: BillStatus
  created_at?: string
  updated_at?: string
  completed_at?: string
}

export interface SplitBillParticipant {
  id: string
  bill_id: string
  user_id?: string
  name: string
  email?: string
  share_amount: number
  share_percentage?: number
  payment_status: PaymentStatus
  paid_at?: string
  confirmed_at?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface SplitBillTransaction {
  id: string
  bill_id: string
  participant_id: string
  amount: number
  proof_image_url?: string
  notes?: string
  status: TransactionStatus
  verified_by?: string
  verified_at?: string
  created_at?: string
  updated_at?: string
}

export interface SplitBillSummary extends SplitBill {
  total_participants: number
  pending_count: number
  paid_count: number
  confirmed_count: number
  total_paid_amount: number
  total_pending_amount: number
}

export interface SplitBillWithParticipants extends SplitBill {
  participants: SplitBillParticipant[]
}

// Form data types for creating new bills
export interface CreateBillData {
  title: string
  description?: string
  total_amount: number
  currency: string
  organizer_name: string
  organizer_bank_account?: string
  organizer_bank_name?: string
  split_type: SplitType
  receipt_image_url?: string
  participants: CreateParticipantData[]
  items?: CreateBillItemData[] // Optional: for itemized bills
}

export interface CreateParticipantData {
  name: string
  email?: string
  share_amount: number
  share_percentage?: number
}

export interface CreateBillItemData {
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
  notes?: string
  assigned_to?: string[] // participant indices or IDs
}

// Response types
export interface CreateBillResponse {
  bill: SplitBill
  participants: SplitBillParticipant[]
}

export interface SplitBillItem {
  id: string
  bill_id: string
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
  notes?: string
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface SplitBillItemAssignment {
  id: string
  item_id: string
  participant_id: string
  assigned_amount: number
  created_at?: string
  updated_at?: string
}

export interface SplitBillItemWithAssignments extends SplitBillItem {
  assignments: SplitBillItemAssignment[]
  assigned_to: string[] // participant names
  assigned_count: number
  total_price: number
}

export interface ParticipantWithItems extends SplitBillParticipant {
  assigned_items: SplitBillItemWithAssignments[]
  total_from_items: number
}

export interface BillDetailResponse {
  bill: SplitBill
  participants: SplitBillParticipant[]
  transactions?: SplitBillTransaction[]
  items?: SplitBillItemWithAssignments[]
}
