import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted mocks
const mockValidateEvent = vi.hoisted(() => vi.fn())
const mockWebhookVerificationError = vi.hoisted(
  () =>
    class WebhookVerificationError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'WebhookVerificationError'
      }
    }
)
const mockUpsert = vi.hoisted(() => vi.fn())
const mockUpdate = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockSendDonationThankYou = vi.hoisted(() => vi.fn())
const mockPolarConfig = vi.hoisted(() => ({
  webhookSecret: 'test-webhook-secret',
}))

// Mock @polar-sh/sdk/webhooks
vi.mock('@polar-sh/sdk/webhooks', () => ({
  validateEvent: mockValidateEvent,
  WebhookVerificationError: mockWebhookVerificationError,
}))

// Mock Supabase
vi.mock('@/lib/auth/supabaseServer', () => ({
  supabaseServer: {
    from: mockFrom,
  },
}))

// Mock email service
vi.mock('@/lib/services/email', () => ({
  sendDonationThankYou: mockSendDonationThankYou,
}))

// Mock Polar config
vi.mock('@/lib/services/polar', () => ({
  POLAR_CONFIG: mockPolarConfig,
}))

// Import after mocks
import { POST } from '../route'

// Helper to create mock requests
const createMockRequest = (body: string, headers: Record<string, string> = {}): NextRequest => {
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  })

  return new NextRequest('http://localhost:3000/api/webhooks/polar', {
    method: 'POST',
    headers: requestHeaders,
    body,
  })
}

// Default webhook headers
const defaultWebhookHeaders = {
  'webhook-id': 'wh_123',
  'webhook-timestamp': '1234567890',
  'webhook-signature': 'v1,valid-signature',
}

describe('POST /api/webhooks/polar', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock chain for Supabase
    mockEq.mockReturnValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockUpsert.mockReturnValue({ error: null })
    mockFrom.mockReturnValue({
      upsert: mockUpsert,
      update: mockUpdate,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Signature Verification', () => {
    it('returns 401 when webhook signature is missing', async () => {
      const request = createMockRequest('{}', {
        'webhook-id': 'wh_123',
        'webhook-timestamp': '1234567890',
        // No webhook-signature header
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Missing signature')
    })

    it('returns 500 when webhook secret is not configured', async () => {
      // Temporarily set webhook secret to empty
      mockPolarConfig.webhookSecret = ''

      const request = createMockRequest('{}', defaultWebhookHeaders)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook secret not configured')

      // Restore webhook secret
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('returns 401 when signature verification fails', async () => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
      mockValidateEvent.mockImplementation(() => {
        throw new mockWebhookVerificationError('Invalid signature')
      })

      const request = createMockRequest('{}', defaultWebhookHeaders)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid signature')
    })

    it('re-throws non-verification errors', async () => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
      mockValidateEvent.mockImplementation(() => {
        throw new Error('Some other error')
      })

      const request = createMockRequest('{}', defaultWebhookHeaders)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Some other error')
    })
  })

  describe('subscription.created', () => {
    const subscriptionData = {
      id: 'sub_123',
      customer: {
        id: 'cus_123',
        email: 'user@example.com',
        name: 'Test User',
      },
      product: { id: 'prod_123' },
      price: { id: 'price_123' },
      status: 'active',
      amount: 1000,
      currency: 'USD',
      recurring_interval: 'month',
      recurring_interval_count: 1,
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      trial_start: null,
      trial_end: null,
      cancel_at_period_end: false,
      metadata: { user_id: 'user_123' },
    }

    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('creates subscription successfully', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'subscription.created',
        data: subscriptionData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.created', data: subscriptionData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('subscriptions')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          polar_subscription_id: 'sub_123',
          polar_customer_id: 'cus_123',
          polar_product_id: 'prod_123',
          polar_price_id: 'price_123',
          customer_email: 'user@example.com',
          status: 'active',
          amount: 1000,
          currency: 'USD',
          interval: 'month',
          interval_count: 1,
        }),
        expect.objectContaining({
          onConflict: 'polar_subscription_id',
          ignoreDuplicates: false,
        })
      )
    })

    it('uses user email when customer email is not available', async () => {
      const dataWithUserEmail = {
        ...subscriptionData,
        customer: { id: 'cus_123' },
        user: { email: 'fallback@example.com' },
      }

      mockValidateEvent.mockReturnValue({
        type: 'subscription.created',
        data: dataWithUserEmail,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.created', data: dataWithUserEmail }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'fallback@example.com',
        }),
        expect.any(Object)
      )
    })

    it('calculates period end for monthly interval when not provided', async () => {
      const dataWithoutPeriodEnd = {
        ...subscriptionData,
        current_period_end: undefined,
      }

      mockValidateEvent.mockReturnValue({
        type: 'subscription.created',
        data: dataWithoutPeriodEnd,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.created', data: dataWithoutPeriodEnd }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUpsert).toHaveBeenCalled()
    })

    it('handles yearly interval calculation', async () => {
      const yearlyData = {
        ...subscriptionData,
        recurring_interval: 'year',
        current_period_end: undefined,
      }

      mockValidateEvent.mockReturnValue({
        type: 'subscription.created',
        data: yearlyData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.created', data: yearlyData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 'year',
        }),
        expect.any(Object)
      )
    })

    it('throws error when database upsert fails', async () => {
      mockUpsert.mockReturnValue({ error: new Error('Database error') })

      mockValidateEvent.mockReturnValue({
        type: 'subscription.created',
        data: subscriptionData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.created', data: subscriptionData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })

  describe('subscription.updated', () => {
    const updateData = {
      id: 'sub_123',
      status: 'past_due',
      amount: 2000,
      current_period_start: '2024-02-01T00:00:00Z',
      current_period_end: '2024-03-01T00:00:00Z',
      cancel_at_period_end: false,
    }

    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('updates subscription successfully', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'subscription.updated',
        data: updateData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.updated', data: updateData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('subscriptions')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'past_due',
          amount: 2000,
          cancel_at_period_end: false,
        })
      )
      expect(mockEq).toHaveBeenCalledWith('polar_subscription_id', 'sub_123')
    })

    it('throws error when database update fails', async () => {
      mockEq.mockReturnValue({ error: new Error('Update failed') })

      mockValidateEvent.mockReturnValue({
        type: 'subscription.updated',
        data: updateData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.updated', data: updateData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Update failed')
    })
  })

  describe('subscription.canceled', () => {
    const cancelData = {
      id: 'sub_123',
    }

    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('cancels subscription successfully', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'subscription.canceled',
        data: cancelData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.canceled', data: cancelData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
          cancel_at_period_end: true,
          canceled_at: expect.any(String),
        })
      )
      expect(mockEq).toHaveBeenCalledWith('polar_subscription_id', 'sub_123')
    })

    it('throws error when database cancel fails', async () => {
      mockEq.mockReturnValue({ error: new Error('Cancel failed') })

      mockValidateEvent.mockReturnValue({
        type: 'subscription.canceled',
        data: cancelData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.canceled', data: cancelData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Cancel failed')
    })
  })

  describe('subscription.revoked', () => {
    const revokeData = {
      id: 'sub_123',
    }

    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('revokes subscription successfully', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'subscription.revoked',
        data: revokeData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.revoked', data: revokeData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
          cancel_at_period_end: false,
          canceled_at: expect.any(String),
          ended_at: expect.any(String),
        })
      )
      expect(mockEq).toHaveBeenCalledWith('polar_subscription_id', 'sub_123')
    })

    it('throws error when database revoke fails', async () => {
      mockEq.mockReturnValue({ error: new Error('Revoke failed') })

      mockValidateEvent.mockReturnValue({
        type: 'subscription.revoked',
        data: revokeData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'subscription.revoked', data: revokeData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Revoke failed')
    })
  })

  describe('order.created', () => {
    const orderData = {
      id: 'ord_123',
      customer: {
        id: 'cus_123',
        email: 'donor@example.com',
        name: 'Generous Donor',
      },
      product: { id: 'prod_123' },
      amount: 5000,
      currency: 'USD',
      status: 'paid',
      payment_processor: 'stripe',
      payment_processor_order_id: 'pi_123',
      metadata: { user_id: 'user_123' },
    }

    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
      mockSendDonationThankYou.mockResolvedValue(undefined)
    })

    it('creates order successfully and sends thank you email', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: orderData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: orderData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          polar_order_id: 'ord_123',
          polar_customer_id: 'cus_123',
          polar_product_id: 'prod_123',
          customer_email: 'donor@example.com',
          amount: 5000,
          currency: 'USD',
          status: 'paid',
          payment_processor: 'stripe',
          payment_processor_order_id: 'pi_123',
        }),
        expect.objectContaining({
          onConflict: 'polar_order_id',
          ignoreDuplicates: false,
        })
      )
      expect(mockSendDonationThankYou).toHaveBeenCalledWith(
        'donor@example.com',
        'Generous Donor',
        5000,
        'USD'
      )
    })

    it('uses public_name when name is not available', async () => {
      const dataWithPublicName = {
        ...orderData,
        customer: {
          id: 'cus_123',
          email: 'donor@example.com',
          public_name: 'Public Name',
        },
      }

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: dataWithPublicName,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: dataWithPublicName }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSendDonationThankYou).toHaveBeenCalledWith(
        'donor@example.com',
        'Public Name',
        5000,
        'USD'
      )
    })

    it('uses username as fallback for customer name', async () => {
      const dataWithUsername = {
        ...orderData,
        customer: { id: 'cus_123', email: 'donor@example.com' },
        user: { email: 'donor@example.com', username: 'donor123' },
      }

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: dataWithUsername,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: dataWithUsername }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSendDonationThankYou).toHaveBeenCalledWith(
        'donor@example.com',
        'donor123',
        5000,
        'USD'
      )
    })

    it('does not send email when amount is 0', async () => {
      const freeOrderData = {
        ...orderData,
        amount: 0,
      }

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: freeOrderData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: freeOrderData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSendDonationThankYou).not.toHaveBeenCalled()
    })

    it('does not send email when customer email is missing', async () => {
      const noEmailData = {
        ...orderData,
        customer: { id: 'cus_123' },
      }

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: noEmailData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: noEmailData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockSendDonationThankYou).not.toHaveBeenCalled()
    })

    it('continues successfully even if email sending fails', async () => {
      mockSendDonationThankYou.mockRejectedValue(new Error('Email failed'))

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: orderData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: orderData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      // Should still return success even though email failed
      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })

    it('throws error when database upsert fails', async () => {
      mockUpsert.mockReturnValue({ error: new Error('Order insert failed') })

      mockValidateEvent.mockReturnValue({
        type: 'order.created',
        data: orderData,
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'order.created', data: orderData }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Order insert failed')
      expect(mockSendDonationThankYou).not.toHaveBeenCalled()
    })
  })

  describe('checkout events', () => {
    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('handles checkout.created event', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'checkout.created',
        data: { id: 'checkout_123' },
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'checkout.created', data: { id: 'checkout_123' } }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      // Should not call database for checkout events
      expect(mockUpsert).not.toHaveBeenCalled()
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('handles checkout.updated event', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'checkout.updated',
        data: { id: 'checkout_123' },
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'checkout.updated', data: { id: 'checkout_123' } }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('unhandled events', () => {
    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('handles unknown event types gracefully', async () => {
      mockValidateEvent.mockReturnValue({
        type: 'unknown.event',
        data: { id: 'unknown_123' },
      })

      const request = createMockRequest(
        JSON.stringify({ type: 'unknown.event', data: { id: 'unknown_123' } }),
        defaultWebhookHeaders
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockPolarConfig.webhookSecret = 'test-webhook-secret'
    })

    it('returns 500 with error message for Error instances', async () => {
      mockValidateEvent.mockImplementation(() => {
        throw new Error('Specific error message')
      })

      const request = createMockRequest('{}', defaultWebhookHeaders)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Specific error message')
    })

    it('returns generic error for non-Error throws', async () => {
      mockValidateEvent.mockImplementation(() => {
        throw 'string error'
      })

      const request = createMockRequest('{}', defaultWebhookHeaders)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook processing failed')
    })
  })
})
