/**
 * Polar Payment Integration
 * https://polar.sh/docs
 *
 * This module configures the Polar SDK for server-side operations.
 * Polar is a Merchant of Record with 4% + $0.40 transaction fees.
 */

import { Polar } from '@polar-sh/sdk'

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error(
    'POLAR_ACCESS_TOKEN is not set. Please add it to your .env file. Get it from: https://polar.sh/dashboard/settings'
  )
}

/**
 * Initialize Polar SDK with access token
 * This instance should only be used in server-side code (API routes, server components)
 */
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
})

/**
 * Polar Configuration
 */
export const POLAR_CONFIG = {
  organizationId: process.env.POLAR_ORGANIZATION_ID || '',
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || '',
} as const

/**
 * Verify required configuration
 */
if (!POLAR_CONFIG.organizationId) {
  console.warn(
    'POLAR_ORGANIZATION_ID is not set. Some features may not work. Get it from: https://polar.sh/dashboard/settings'
  )
}

if (!POLAR_CONFIG.webhookSecret) {
  console.warn(
    'POLAR_WEBHOOK_SECRET is not set. Webhook verification will fail. Create a webhook endpoint at: https://polar.sh/dashboard/webhooks'
  )
}

/**
 * Polar webhook event types
 * These are the events we'll handle in our webhook endpoint
 */
export const POLAR_WEBHOOK_EVENTS = {
  // Subscription lifecycle
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  SUBSCRIPTION_REVOKED: 'subscription.revoked',

  // Product/Benefit events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',

  // Order events
  ORDER_CREATED: 'order.created',

  // Checkout events
  CHECKOUT_CREATED: 'checkout.created',
  CHECKOUT_UPDATED: 'checkout.updated',
} as const

export type PolarWebhookEvent = (typeof POLAR_WEBHOOK_EVENTS)[keyof typeof POLAR_WEBHOOK_EVENTS]
