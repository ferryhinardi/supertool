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
import { POLAR_CONFIG } from '@/lib/services/polar'

export const runtime = 'nodejs'

/**
 * Polar webhook event types we handle
 */
type WebhookEvent =
  | { type: 'subscription.created'; data: any }
  | { type: 'subscription.updated'; data: any }
  | { type: 'subscription.canceled'; data: any }
  | { type: 'subscription.revoked'; data: any }
  | { type: 'order.created'; data: any }
  | { type: 'checkout.created'; data: any }
  | { type: 'checkout.updated'; data: any }

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
async function handleSubscriptionCreated(data: any) {
  try {
    // Extract customer email from subscription customer object
    const customerEmail = data.customer?.email || data.user?.email || ''

    // Note: Polar amounts are in cents (verified from SDK)
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
        interval: data.recurring_interval || data.recurringInterval || 'month',
        interval_count: data.recurring_interval_count || data.recurringIntervalCount || 1,
        current_period_start: data.current_period_start
          ? new Date(data.current_period_start).toISOString()
          : new Date().toISOString(),
        current_period_end: data.current_period_end
          ? new Date(data.current_period_end).toISOString()
          : null,
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
async function handleSubscriptionUpdated(data: any) {
  try {
    const { error } = await supabaseServer
      .from('subscriptions')
      .update({
        status: data.status,
        amount: data.amount,
        current_period_start: data.current_period_start
          ? new Date(data.current_period_start).toISOString()
          : undefined,
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
async function handleSubscriptionCanceled(data: any) {
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
async function handleSubscriptionRevoked(data: any) {
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
async function handleOrderCreated(data: any) {
  try {
    const customerEmail = data.customer?.email || data.user?.email || ''

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

    // TODO: Send receipt email
  } catch (error) {
    console.error('handleOrderCreated error:', error)
    throw error
  }
}
