/**
 * TypeScript types for payment system database tables
 * Generated from supabase/migrations/20251223000000_payment_system.sql
 */

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export type SubscriptionInterval = 'month' | 'year'

export interface Subscription {
  id: string

  // Polar IDs
  polarSubscriptionId: string
  polarCustomerId: string
  polarProductId: string
  polarPriceId: string

  // User reference
  userId: string | null
  customerEmail: string

  // Subscription details
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  endedAt: string | null
  trialStart: string | null
  trialEnd: string | null

  // Pricing
  amount: number // Amount in cents
  currency: string
  interval: SubscriptionInterval
  intervalCount: number

  // Metadata
  metadata: Record<string, unknown>

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Database row type (snake_case as stored in DB)
export interface SubscriptionRow {
  id: string
  polar_subscription_id: string
  polar_customer_id: string
  polar_product_id: string
  polar_price_id: string
  user_id: string | null
  customer_email: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  ended_at: string | null
  trial_start: string | null
  trial_end: string | null
  amount: number
  currency: string
  interval: SubscriptionInterval
  interval_count: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// =============================================================================
// ORDER TYPES
// =============================================================================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'

export interface Order {
  id: string

  // Polar IDs
  polarOrderId: string
  polarCustomerId: string
  polarProductId: string

  // User reference
  userId: string | null
  customerEmail: string

  // Order details
  status: OrderStatus
  amount: number // Amount in cents
  currency: string

  // Payment details
  paymentProcessor: string | null
  paymentProcessorOrderId: string | null

  // Metadata
  metadata: Record<string, unknown>

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Database row type (snake_case as stored in DB)
export interface OrderRow {
  id: string
  polar_order_id: string
  polar_customer_id: string
  polar_product_id: string
  user_id: string | null
  customer_email: string
  status: OrderStatus
  amount: number
  currency: string
  payment_processor: string | null
  payment_processor_order_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// =============================================================================
// USAGE RECORD TYPES
// =============================================================================

export interface UsageRecord {
  id: string

  // References
  subscriptionId: string
  userId: string | null

  // Usage details
  metricName: string
  quantity: number

  // Billing period
  periodStart: string
  periodEnd: string

  // Status
  reportedToPolar: boolean
  polarUsageEventId: string | null

  // Metadata
  metadata: Record<string, unknown>

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Database row type (snake_case as stored in DB)
export interface UsageRecordRow {
  id: string
  subscription_id: string
  user_id: string | null
  metric_name: string
  quantity: number
  period_start: string
  period_end: string
  reported_to_polar: boolean
  polar_usage_event_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// =============================================================================
// VIEW TYPES
// =============================================================================

export interface ActiveSubscription extends Subscription {
  userEmail: string | null
}

export interface SubscriptionRevenue30d {
  date: string
  newSubscriptions: number
  revenueCents: number
  revenueUsd: number
}

export interface OrderRevenue30d {
  date: string
  orderCount: number
  revenueCents: number
  revenueUsd: number
}

// =============================================================================
// HELPER TYPES
// =============================================================================

// For creating new subscriptions
export type CreateSubscription = Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>

// For updating subscriptions
export type UpdateSubscription = Partial<Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>>

// For creating new orders
export type CreateOrder = Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>

// For updating orders
export type UpdateOrder = Partial<Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>>

// For creating usage records
export type CreateUsageRecord = Omit<UsageRecordRow, 'id' | 'created_at' | 'updated_at'>

// For updating usage records
export type UpdateUsageRecord = Partial<Omit<UsageRecordRow, 'id' | 'created_at' | 'updated_at'>>

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface SubscriptionWithUser extends Subscription {
  user?: {
    email: string
    name?: string
  }
}

export interface OrderWithUser extends Order {
  user?: {
    email: string
    name?: string
  }
}

// =============================================================================
// POLAR WEBHOOK PAYLOAD TYPES
// =============================================================================

export interface PolarSubscriptionPayload {
  id: string
  customer_id: string
  product_id: string
  price_id: string
  status: SubscriptionStatus
  current_period_start: number // Unix timestamp
  current_period_end: number // Unix timestamp
  cancel_at_period_end: boolean
  canceled_at?: number | null
  ended_at?: number | null
  trial_start?: number | null
  trial_end?: number | null
  amount: number
  currency: string
  recurring_interval: SubscriptionInterval
  metadata?: Record<string, unknown>
}

export interface PolarOrderPayload {
  id: string
  customer_id: string
  product_id: string
  amount: number
  currency: string
  billing_reason: string
  metadata?: Record<string, unknown>
}
