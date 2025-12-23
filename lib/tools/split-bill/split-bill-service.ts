// Split Bill Service - Supabase API Functions

import { supabase } from '../../auth/supabaseClient'
import type {
  BillDetailResponse,
  CreateBillData,
  CreateBillItemData,
  CreateBillResponse,
  PaymentStatus,
  SplitBill,
  SplitBillItem,
  SplitBillItemAssignment,
  SplitBillItemWithAssignments,
  SplitBillParticipant,
  SplitBillSummary,
  SplitBillTransaction,
  TransactionStatus,
} from './split-bill-types'

/**
 * Create a new split bill with participants
 */
export async function createBill(data: CreateBillData): Promise<CreateBillResponse> {
  try {
    // 1. Create the bill
    const { data: billData, error: billError } = await supabase
      .from('split_bills')
      .insert({
        title: data.title,
        description: data.description,
        total_amount: data.total_amount,
        currency: data.currency,
        organizer_name: data.organizer_name,
        organizer_bank_account: data.organizer_bank_account,
        organizer_bank_name: data.organizer_bank_name,
        split_type: data.split_type,
        receipt_image_url: data.receipt_image_url,
        status: 'active',
      })
      .select()
      .single()

    if (billError || !billData) {
      throw new Error(billError?.message || 'Failed to create bill')
    }

    // 2. Create participants
    const participantsData = data.participants.map((p) => ({
      bill_id: billData.id,
      name: p.name,
      email: p.email,
      share_amount: p.share_amount,
      share_percentage: p.share_percentage,
      payment_status: 'pending' as PaymentStatus,
    }))

    const { data: participants, error: participantsError } = await supabase
      .from('split_bill_participants')
      .insert(participantsData)
      .select()

    if (participantsError || !participants) {
      // Rollback: delete the bill if participants creation fails
      await supabase.from('split_bills').delete().eq('id', billData.id)
      throw new Error(participantsError?.message || 'Failed to create participants')
    }

    return {
      bill: billData as SplitBill,
      participants: participants as SplitBillParticipant[],
    }
  } catch (error) {
    console.error('Error creating bill:', error)
    throw error
  }
}

/**
 * Get a bill by ID with all participants
 */
export async function getBillById(billId: string): Promise<BillDetailResponse | null> {
  try {
    // Get bill
    const { data: billData, error: billError } = await supabase
      .from('split_bills')
      .select('*')
      .eq('id', billId)
      .single()

    if (billError || !billData) {
      console.error('Error fetching bill:', billError)
      return null
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('split_bill_participants')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at', { ascending: true })

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return null
    }

    // Get transactions (optional)
    const { data: transactions } = await supabase
      .from('split_bill_transactions')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at', { ascending: false })

    // Get items (optional)
    const items = await getBillItems(billId)

    return {
      bill: billData as SplitBill,
      participants: (participants || []) as SplitBillParticipant[],
      transactions: (transactions || []) as SplitBillTransaction[],
      items: items.length > 0 ? items : undefined,
    }
  } catch (error) {
    console.error('Error getting bill:', error)
    return null
  }
}

/**
 * Get all bills (with summary data)
 */
export async function getAllBills(): Promise<SplitBillSummary[]> {
  try {
    const { data, error } = await supabase
      .from('split_bill_summary')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bills:', error)
      return []
    }

    return (data || []) as SplitBillSummary[]
  } catch (error) {
    console.error('Error getting bills:', error)
    return []
  }
}

/**
 * Update participant payment status
 */
export async function updateParticipantPaymentStatus(
  participantId: string,
  status: PaymentStatus
): Promise<boolean> {
  try {
    const updateData: Partial<SplitBillParticipant> = {
      payment_status: status,
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('split_bill_participants')
      .update(updateData)
      .eq('id', participantId)

    if (error) {
      console.error('Error updating participant status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating participant:', error)
    return false
  }
}

/**
 * Update bill status
 */
export async function updateBillStatus(
  billId: string,
  status: 'active' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    const updateData: Partial<SplitBill> = {
      status,
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from('split_bills').update(updateData).eq('id', billId)

    if (error) {
      console.error('Error updating bill status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating bill:', error)
    return false
  }
}

/**
 * Create a transaction (payment proof)
 */
export async function createTransaction(
  billId: string,
  participantId: string,
  amount: number,
  proofImageUrl?: string,
  notes?: string
): Promise<SplitBillTransaction | null> {
  try {
    const { data, error } = await supabase
      .from('split_bill_transactions')
      .insert({
        bill_id: billId,
        participant_id: participantId,
        amount,
        proof_image_url: proofImageUrl,
        notes,
        status: 'unverified' as TransactionStatus,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating transaction:', error)
      return null
    }

    return data as SplitBillTransaction
  } catch (error) {
    console.error('Error creating transaction:', error)
    return null
  }
}

/**
 * Update transaction status (verify/reject)
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  verifiedBy?: string
): Promise<boolean> {
  try {
    const updateData: Partial<SplitBillTransaction> = {
      status,
    }

    if (status === 'verified' && verifiedBy) {
      updateData.verified_by = verifiedBy
      updateData.verified_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('split_bill_transactions')
      .update(updateData)
      .eq('id', transactionId)

    if (error) {
      console.error('Error updating transaction status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating transaction:', error)
    return false
  }
}

/**
 * Delete a bill and all related data
 */
export async function deleteBill(billId: string): Promise<boolean> {
  try {
    // Cascade delete will handle participants and transactions
    const { error } = await supabase.from('split_bills').delete().eq('id', billId)

    if (error) {
      console.error('Error deleting bill:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting bill:', error)
    return false
  }
}

/**
 * Subscribe to real-time updates for a specific bill
 */
export function subscribeToBillUpdates(
  billId: string,
  onUpdate: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: SplitBillParticipant
    old: SplitBillParticipant
  }) => void
) {
  const channel = supabase
    .channel(`bill-${billId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'split_bill_participants',
        filter: `bill_id=eq.${billId}`,
      },
      (payload) => {
        onUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as SplitBillParticipant,
          old: payload.old as SplitBillParticipant,
        })
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Calculate equal split shares
 */
export function calculateEqualSplit(totalAmount: number, participantCount: number): number {
  if (participantCount === 0) return 0
  return Math.round((totalAmount / participantCount) * 100) / 100
}

/**
 * Validate custom split shares
 */
export function validateCustomSplit(
  totalAmount: number,
  shares: number[]
): { isValid: boolean; difference: number } {
  const sum = shares.reduce((acc, share) => acc + share, 0)
  const difference = Math.round((totalAmount - sum) * 100) / 100

  return {
    isValid: Math.abs(difference) < 0.01, // Allow 1 cent difference for rounding
    difference,
  }
}

// =====================================================
// ITEM MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Create a bill item
 */
export async function createBillItem(
  billId: string,
  itemData: CreateBillItemData
): Promise<SplitBillItem | null> {
  try {
    const { data, error } = await supabase
      .from('split_bill_items')
      .insert({
        bill_id: billId,
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        quantity: itemData.quantity || 1,
        category: itemData.category,
        notes: itemData.notes,
        display_order: 0,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating bill item:', error)
      return null
    }

    return data as SplitBillItem
  } catch (error) {
    console.error('Error creating bill item:', error)
    return null
  }
}

/**
 * Get all items for a bill
 */
export async function getBillItems(billId: string): Promise<SplitBillItemWithAssignments[]> {
  try {
    // Get items
    const { data: items, error: itemsError } = await supabase
      .from('split_bill_items')
      .select('*')
      .eq('bill_id', billId)
      .order('display_order', { ascending: true })

    if (itemsError || !items) {
      console.error('Error fetching bill items:', itemsError)
      return []
    }

    // Get all assignments for these items
    const itemIds = items.map((item) => item.id)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('split_bill_item_assignments')
      .select('*, split_bill_participants(name)')
      .in('item_id', itemIds)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
    }

    // Combine items with assignments
    const itemsWithAssignments: SplitBillItemWithAssignments[] = items.map((item) => {
      const itemAssignments = (assignments || []).filter((a) => a.item_id === item.id)
      const assignedTo = itemAssignments
        .map((a) => {
          const participant = a.split_bill_participants as { name: string } | null
          return participant?.name
        })
        .filter((name): name is string => Boolean(name))

      return {
        ...item,
        assignments: itemAssignments,
        assigned_to: assignedTo,
        assigned_count: itemAssignments.length,
        total_price: item.price * item.quantity,
      }
    })

    return itemsWithAssignments
  } catch (error) {
    console.error('Error getting bill items:', error)
    return []
  }
}

/**
 * Update a bill item
 */
export async function updateBillItem(
  itemId: string,
  updates: Partial<SplitBillItem>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('split_bill_items').update(updates).eq('id', itemId)

    if (error) {
      console.error('Error updating bill item:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating bill item:', error)
    return false
  }
}

/**
 * Delete a bill item
 */
export async function deleteBillItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('split_bill_items').delete().eq('id', itemId)

    if (error) {
      console.error('Error deleting bill item:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting bill item:', error)
    return false
  }
}

/**
 * Assign an item to a participant
 */
export async function assignItemToParticipant(
  itemId: string,
  participantId: string
): Promise<SplitBillItemAssignment | null> {
  try {
    // First, get the item to calculate the assigned amount
    const { data: item, error: itemError } = await supabase
      .from('split_bill_items')
      .select('price, quantity')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      console.error('Error fetching item:', itemError)
      return null
    }

    // Count existing assignments
    const { data: existingAssignments } = await supabase
      .from('split_bill_item_assignments')
      .select('id')
      .eq('item_id', itemId)

    const assignedCount = (existingAssignments || []).length + 1
    const totalPrice = item.price * item.quantity
    const assignedAmount = Math.round((totalPrice / assignedCount) * 100) / 100

    // Create the assignment
    const { data, error } = await supabase
      .from('split_bill_item_assignments')
      .insert({
        item_id: itemId,
        participant_id: participantId,
        assigned_amount: assignedAmount,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error assigning item:', error)
      return null
    }

    // Trigger will recalculate all amounts
    return data as SplitBillItemAssignment
  } catch (error) {
    console.error('Error assigning item:', error)
    return null
  }
}

/**
 * Unassign an item from a participant
 */
export async function unassignItemFromParticipant(
  itemId: string,
  participantId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('split_bill_item_assignments')
      .delete()
      .eq('item_id', itemId)
      .eq('participant_id', participantId)

    if (error) {
      console.error('Error unassigning item:', error)
      return false
    }

    // Trigger will recalculate remaining amounts
    return true
  } catch (error) {
    console.error('Error unassigning item:', error)
    return false
  }
}

/**
 * Get participant's total from items
 */
export async function getParticipantItemsTotal(participantId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('split_bill_item_assignments')
      .select('assigned_amount')
      .eq('participant_id', participantId)

    if (error || !data) {
      console.error('Error fetching participant items:', error)
      return 0
    }

    const total = data.reduce((sum, assignment) => sum + assignment.assigned_amount, 0)
    return Math.round(total * 100) / 100
  } catch (error) {
    console.error('Error calculating participant total:', error)
    return 0
  }
}

/**
 * Bulk assign items to multiple participants
 */
export async function bulkAssignItems(
  assignments: Array<{ itemId: string; participantId: string }>
): Promise<boolean> {
  try {
    // Get all unique item IDs to fetch prices
    const uniqueItemIds = [...new Set(assignments.map((a) => a.itemId))]
    const { data: items } = await supabase
      .from('split_bill_items')
      .select('id, price, quantity')
      .in('id', uniqueItemIds)

    if (!items) return false

    // Calculate assigned amounts for each item
    const itemPrices = Object.fromEntries(
      items.map((item) => [item.id, item.price * item.quantity])
    )

    // Count assignments per item
    const assignmentCounts: Record<string, number> = {}
    for (const assignment of assignments) {
      assignmentCounts[assignment.itemId] = (assignmentCounts[assignment.itemId] || 0) + 1
    }

    // Create assignment records with calculated amounts
    const assignmentRecords = assignments.map((assignment) => ({
      item_id: assignment.itemId,
      participant_id: assignment.participantId,
      assigned_amount:
        Math.round((itemPrices[assignment.itemId] / assignmentCounts[assignment.itemId]) * 100) /
        100,
    }))

    const { error } = await supabase.from('split_bill_item_assignments').insert(assignmentRecords)

    if (error) {
      console.error('Error bulk assigning items:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error bulk assigning items:', error)
    return false
  }
}
