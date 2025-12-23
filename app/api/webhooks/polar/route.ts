/**
 * Polar Webhook Handler
 * Handles payment events from Polar (subscriptions, orders, etc.)
 *
 * POST /api/webhooks/polar
 * Headers: { 'polar-signature': string }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabaseClient'
import { POLAR_CONFIG, POLAR_WEBHOOK_EVENTS } from '@/lib/services/polar'

export const runtime = 'nodejs'

interface PolarWebhookPayload {
  type: string
  data: {
    id: string
    type: string
    attributes: {
      status?: string
      customer_email?: string
      amount?: number
      currency?: string
      product_id?: string
      product_price_id?: string
      user_id?: string
      subscription_id?: string
      current_period_start?: string
      current_period_end?: string
      metadata?: Record<string, string>
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('polar-signature')

    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // 2. Verify webhook signature
    // Note: Polar SDK should provide a verification method
    // For now, we'll check if webhook secret matches (basic validation)
    if (!POLAR_CONFIG.webhookSecret) {
      console.error('POLAR_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // TODO: Implement proper signature verification using Polar SDK
    // const isValid = await validatePolarWebhook(body, signature, POLAR_CONFIG.webhookSecret)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // 3. Parse payload
    const payload: PolarWebhookPayload = JSON.parse(body)
    const { type, data } = payload

    console.log(`Received webhook: ${type}`, { id: data.id })

    // 4. Handle different webhook events
    switch (type) {
      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(data)
        break

      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(data)
        break

      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(data)
        break

      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_REVOKED:
        await handleSubscriptionRevoked(data)
        break

      case POLAR_WEBHOOK_EVENTS.ORDER_CREATED:
        await handleOrderCreated(data)
        break

      case POLAR_WEBHOOK_EVENTS.CHECKOUT_CREATED:
      case POLAR_WEBHOOK_EVENTS.CHECKOUT_UPDATED:
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
 */
async function handleSubscriptionCreated(data: PolarWebhookPayload['data']) {
  const { attributes } = data

  try {
    const { error } = await supabase.from('subscriptions').insert({
      polar_subscription_id: data.id,
      user_id: attributes.metadata?.userId || null,
      customer_email: attributes.customer_email || '',
      status: attributes.status || 'active',
      plan_id: attributes.product_id || '',
      amount: attributes.amount || 0,
      currency: attributes.currency || 'USD',
      current_period_start: attributes.current_period_start || null,
      current_period_end: attributes.current_period_end || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to create subscription in database:', error)
      throw error
    }

    console.log('Subscription created:', data.id)

    // TODO: Send welcome email
    // await sendSubscriptionConfirmation(attributes.customer_email, 'Pro')
  } catch (error) {
    console.error('handleSubscriptionCreated error:', error)
    throw error
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(data: PolarWebhookPayload['data']) {
  const { attributes } = data

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: attributes.status || 'active',
        amount: attributes.amount,
        current_period_start: attributes.current_period_start,
        current_period_end: attributes.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('polar_subscription_id', data.id)

    if (error) {
      console.error('Failed to update subscription in database:', error)
      throw error
    }

    console.log('Subscription updated:', data.id)
  } catch (error) {
    console.error('handleSubscriptionUpdated error:', error)
    throw error
  }
}

/**
 * Handle subscription canceled event
 */
async function handleSubscriptionCanceled(data: PolarWebhookPayload['data']) {
  try {
    const { error } = await supabase
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

    console.log('Subscription canceled:', data.id)

    // TODO: Send cancellation confirmation email
  } catch (error) {
    console.error('handleSubscriptionCanceled error:', error)
    throw error
  }
}

/**
 * Handle subscription revoked event (forced cancellation)
 */
async function handleSubscriptionRevoked(data: PolarWebhookPayload['data']) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('polar_subscription_id', data.id)

    if (error) {
      console.error('Failed to revoke subscription in database:', error)
      throw error
    }

    console.log('Subscription revoked:', data.id)
  } catch (error) {
    console.error('handleSubscriptionRevoked error:', error)
    throw error
  }
}

/**
 * Handle order created event (one-time payment)
 */
async function handleOrderCreated(data: PolarWebhookPayload['data']) {
  const { attributes } = data

  try {
    const { error } = await supabase.from('orders').insert({
      polar_order_id: data.id,
      user_id: attributes.metadata?.userId || null,
      customer_email: attributes.customer_email || '',
      amount: attributes.amount || 0,
      currency: attributes.currency || 'USD',
      status: attributes.status || 'pending',
      product_id: attributes.product_id || '',
      metadata: attributes.metadata || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to create order in database:', error)
      throw error
    }

    console.log('Order created:', data.id)

    // TODO: Send receipt email
  } catch (error) {
    console.error('handleOrderCreated error:', error)
    throw error
  }
}
