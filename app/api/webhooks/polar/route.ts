/**
 * Polar Webhook Handler
 * Handles payment events from Polar (subscriptions, orders, etc.)
 *
 * POST /api/webhooks/polar
 * Headers: { 'webhook-id': string, 'webhook-timestamp': string, 'webhook-signature': string }
 *
 * Security: Uses webhook signature verification via standard-webhooks
 * Idempotency: Uses upsert operations to handle duplicate webhook deliveries
 */

import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { type NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/auth/supabaseServer'
import { sendDonationThankYou } from '@/lib/services/email'
import { POLAR_CONFIG } from '@/lib/services/polar'

export const runtime = 'nodejs'

/**
 * Polar customer data structure
 */
interface PolarCustomer {
  id: string
  email?: string
  name?: string
  public_name?: string
}

/**
 * Polar product/price data structure
 */
interface PolarProduct {
  id: string
}

interface PolarPrice {
  id: string
}

/**
 * Polar subscription data from webhook
 */
interface PolarSubscriptionData {
  id: string
  customer?: PolarCustomer
  customer_id?: string
  product?: PolarProduct
  product_id?: string
  price?: PolarPrice
  price_id?: string
  user?: { email?: string; username?: string }
  status?: string
  amount?: number
  currency?: string
  recurring_interval?: string
  recurringInterval?: string
  recurring_interval_count?: number
  recurringIntervalCount?: number
  current_period_start?: string
  current_period_end?: string
  trial_start?: string | null
  trial_end?: string | null
  cancel_at_period_end?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Polar order data from webhook
 */
interface PolarOrderData {
  id: string
  customer?: PolarCustomer
  customer_id?: string
  product?: PolarProduct
  product_id?: string
  user?: { email?: string; username?: string }
  amount?: number
  currency?: string
  status?: string
  payment_processor?: string | null
  payment_processor_order_id?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Polar checkout data from webhook
 */
interface PolarCheckoutData {
  id: string
  [key: string]: unknown
}

/**
 * Polar webhook event types we handle
 */
type WebhookEvent =
  | { type: 'subscription.created'; data: PolarSubscriptionData }
  | { type: 'subscription.updated'; data: PolarSubscriptionData }
  | { type: 'subscription.canceled'; data: PolarSubscriptionData }
  | { type: 'subscription.revoked'; data: PolarSubscriptionData }
  | { type: 'order.created'; data: PolarOrderData }
  | { type: 'checkout.created'; data: PolarCheckoutData }
  | { type: 'checkout.updated'; data: PolarCheckoutData }

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const body = await request.text()

    // 2. Extract webhook headers (standard-webhooks format)
    const headers: Record<string, string> = {
      'webhook-id': request.headers.get('webhook-id') || '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') || '',
      'webhook-signature': request.headers.get('webhook-signature') || '',
    }

    if (!headers['webhook-signature']) {
      console.error('Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // 3. Verify webhook secret is configured
    if (!POLAR_CONFIG.webhookSecret) {
      console.error('POLAR_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // 4. Verify webhook signature using Polar SDK
    let event: WebhookEvent
    try {
      event = validateEvent(body, headers, POLAR_CONFIG.webhookSecret) as WebhookEvent
      console.log(`✓ Verified webhook signature: ${event.type}`, { id: headers['webhook-id'] })
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error('Invalid webhook signature:', error.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      throw error
    }

    // 5. Handle different webhook events
    const { type, data } = event

    switch (type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(data)
        break

      case 'subscription.revoked':
        await handleSubscriptionRevoked(data)
        break

      case 'order.created':
        await handleOrderCreated(data)
        break

      case 'checkout.created':
      case 'checkout.updated':
        // Just log these for now
        console.log(`Checkout event: ${type}`, data.id)
        break

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Handle subscription created event
 * Uses UPSERT for idempotency - handles duplicate webhook deliveries gracefully
 */
async function handleSubscriptionCreated(data: PolarSubscriptionData) {
  try {
    // Extract customer email from subscription customer object
    const customerEmail = data.customer?.email || data.user?.email || ''

    // Note: Polar amounts are in cents (verified from SDK)
    const interval = data.recurring_interval || data.recurringInterval || 'month'
    const intervalCount = data.recurring_interval_count || data.recurringIntervalCount || 1

    // Calculate period end based on interval if not provided
    const periodStart = data.current_period_start ? new Date(data.current_period_start) : new Date()
    let periodEnd: Date

    if (data.current_period_end) {
      periodEnd = new Date(data.current_period_end)
    } else {
      // Calculate based on interval: month, year, day, week
      periodEnd = new Date(periodStart)
      if (interval === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + intervalCount)
      } else if (interval === 'year') {
        periodEnd.setFullYear(periodEnd.getFullYear() + intervalCount)
      } else if (interval === 'day') {
        periodEnd.setDate(periodEnd.getDate() + intervalCount)
      } else if (interval === 'week') {
        periodEnd.setDate(periodEnd.getDate() + 7 * intervalCount)
      } else {
        // Default to 1 month if unknown interval
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }
    }

    const { error } = await supabaseServer.from('subscriptions').upsert(
      {
        polar_subscription_id: data.id,
        polar_customer_id: data.customer?.id || data.customer_id || '',
        polar_product_id: data.product?.id || data.product_id || '',
        polar_price_id: data.price?.id || data.price_id || '',
        user_id: data.metadata?.user_id || null,
        customer_email: customerEmail,
        status: data.status || 'active',
        amount: data.amount || 0, // Amount in cents
        currency: data.currency || 'USD',
        interval,
        interval_count: intervalCount,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: data.trial_start ? new Date(data.trial_start).toISOString() : null,
        trial_end: data.trial_end ? new Date(data.trial_end).toISOString() : null,
        cancel_at_period_end: data.cancel_at_period_end || false,
        canceled_at: null,
        ended_at: null,
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'polar_subscription_id',
        ignoreDuplicates: false, // Update if exists
      }
    )

    if (error) {
      console.error('Failed to upsert subscription in database:', error)
      throw error
    }

    console.log('✓ Subscription created/updated:', data.id)

    // TODO: Send welcome email
    // await sendSubscriptionConfirmation(customerEmail, 'Pro')
  } catch (error) {
    console.error('handleSubscriptionCreated error:', error)
    throw error
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(data: PolarSubscriptionData) {
  try {
    const { error } = await supabaseServer
      .from('subscriptions')
      .update({
        status: data.status,
        amount: data.amount,
        current_period_start: data.current_period_start
          ? new Date(data.current_period_start).toISOString()
          : null,
        current_period_end: data.current_period_end
          ? new Date(data.current_period_end).toISOString()
          : null,
        cancel_at_period_end: data.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('polar_subscription_id', data.id)

    if (error) {
      console.error('Failed to update subscription in database:', error)
      throw error
    }

    console.log('✓ Subscription updated:', data.id)
  } catch (error) {
    console.error('handleSubscriptionUpdated error:', error)
    throw error
  }
}

/**
 * Handle subscription canceled event
 */
async function handleSubscriptionCanceled(data: PolarSubscriptionData) {
  try {
    const { error } = await supabaseServer
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('polar_subscription_id', data.id)

    if (error) {
      console.error('Failed to cancel subscription in database:', error)
      throw error
    }

    console.log('✓ Subscription canceled:', data.id)

    // TODO: Send cancellation confirmation email
  } catch (error) {
    console.error('handleSubscriptionCanceled error:', error)
    throw error
  }
}

/**
 * Handle subscription revoked event (forced cancellation)
 */
async function handleSubscriptionRevoked(data: PolarSubscriptionData) {
  try {
    const { error } = await supabaseServer
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('polar_subscription_id', data.id)

    if (error) {
      console.error('Failed to revoke subscription in database:', error)
      throw error
    }

    console.log('✓ Subscription revoked:', data.id)
  } catch (error) {
    console.error('handleSubscriptionRevoked error:', error)
    throw error
  }
}

/**
 * Handle order created event (one-time payment)
 * Uses UPSERT for idempotency
 */
async function handleOrderCreated(data: PolarOrderData) {
  try {
    const customerEmail = data.customer?.email || data.user?.email || ''
    const customerName =
      data.customer?.name || data.customer?.public_name || data.user?.username || 'Valued Supporter'

    // Note: Polar amounts are in cents (verified from SDK)
    const { error } = await supabaseServer.from('orders').upsert(
      {
        polar_order_id: data.id,
        polar_customer_id: data.customer?.id || data.customer_id || '',
        polar_product_id: data.product?.id || data.product_id || '',
        user_id: data.metadata?.user_id || null,
        customer_email: customerEmail,
        amount: data.amount || 0, // Amount in cents
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        payment_processor: data.payment_processor || null,
        payment_processor_order_id: data.payment_processor_order_id || null,
        metadata: data.metadata || {},
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'polar_order_id',
        ignoreDuplicates: false, // Update if exists
      }
    )

    if (error) {
      console.error('Failed to upsert order in database:', error)
      throw error
    }

    console.log('✓ Order created/updated:', data.id)

    // Send thank you email if we have a valid email and amount
    if (customerEmail && data.amount && data.amount > 0) {
      try {
        await sendDonationThankYou(customerEmail, customerName, data.amount, data.currency || 'USD')
        console.log('✓ Thank you email sent to:', customerEmail)
      } catch (emailError) {
        // Log email errors but don't fail the webhook
        console.error('Failed to send thank you email:', emailError)
        // Consider: Store failed email attempts for retry later
      }
    }
  } catch (error) {
    console.error('handleOrderCreated error:', error)
    throw error
  }
}
