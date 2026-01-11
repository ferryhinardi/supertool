import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock polar service
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/services/polar', () => ({
  POLAR_CONFIG: {
    organizationId: 'test-org-id',
    webhookSecret: 'test-webhook-secret',
    donationProductId: 'test-donation-product-id',
  },
  polar: {
    checkouts: {
      create: mockCreate,
    },
  },
}))

// Mock supabaseServer
const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth/supabaseServer', () => ({
  supabaseServer: {
    auth: {
      getUser: mockGetUser,
    },
  },
}))

// Import after mocking
import { POST } from '../route'

describe('POST /api/payment/checkout', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const createMockRequest = (
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  }

  describe('Validation', () => {
    it('should return 400 if productId is missing', async () => {
      const request = createMockRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product ID is required')
    })

    it('should return 400 if productId is empty string', async () => {
      const request = createMockRequest({ productId: '' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product ID is required')
    })

    it('should return 400 if productId does not match configured donation product', async () => {
      const request = createMockRequest({ productId: 'invalid-product-id' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid product ID')
    })

    it('should return 400 if amount is less than $1 (100 cents)', async () => {
      const request = createMockRequest({
        productId: 'test-donation-product-id',
        amount: 50, // 50 cents
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Amount must be between $1.00 and $10,000.00')
    })

    it('should return 400 if amount is more than $10,000 (1000000 cents)', async () => {
      const request = createMockRequest({
        productId: 'test-donation-product-id',
        amount: 1000001,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Amount must be between $1.00 and $10,000.00')
    })
  })

  describe('Successful Checkout Creation', () => {
    it('should create checkout session successfully without auth', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-123',
        url: 'https://polar.sh/checkout/checkout-123',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.checkoutId).toBe('checkout-123')
      expect(data.url).toBe('https://polar.sh/checkout/checkout-123')
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
      })
    })

    it('should create checkout session with custom successUrl', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-456',
        url: 'https://polar.sh/checkout/checkout-456',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
        successUrl: 'https://example.com/thank-you',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'https://example.com/thank-you',
      })
    })

    it('should create checkout session with amount', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-789',
        url: 'https://polar.sh/checkout/checkout-789',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
        amount: 500, // $5.00
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
        amount: 500,
      })
    })

    it('should create checkout session with customerEmail', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-abc',
        url: 'https://polar.sh/checkout/checkout-abc',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
        customerEmail: 'customer@example.com',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
        customerEmail: 'customer@example.com',
      })
    })

    it('should create checkout session with authenticated user', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
      })

      mockCreate.mockResolvedValue({
        id: 'checkout-auth',
        url: 'https://polar.sh/checkout/checkout-auth',
      })

      const request = createMockRequest(
        {
          productId: 'test-donation-product-id',
        },
        { authorization: 'Bearer test-token' }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.checkoutId).toBe('checkout-auth')
      expect(mockGetUser).toHaveBeenCalledWith('test-token')
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
        customerEmail: 'user@example.com',
        metadata: {
          userId: 'user-123',
          userEmail: 'user@example.com',
        },
      })
    })

    it('should prefer customerEmail over user email when both provided', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
      })

      mockCreate.mockResolvedValue({
        id: 'checkout-email',
        url: 'https://polar.sh/checkout/checkout-email',
      })

      const request = createMockRequest(
        {
          productId: 'test-donation-product-id',
          customerEmail: 'custom@example.com',
        },
        { authorization: 'Bearer test-token' }
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
        customerEmail: 'custom@example.com',
        metadata: {
          userId: 'user-123',
          userEmail: 'user@example.com',
        },
      })
    })

    it('should handle authenticated user without email', async () => {
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-456',
            email: undefined,
          },
        },
      })

      mockCreate.mockResolvedValue({
        id: 'checkout-noemail',
        url: 'https://polar.sh/checkout/checkout-noemail',
      })

      const request = createMockRequest(
        {
          productId: 'test-donation-product-id',
        },
        { authorization: 'Bearer test-token' }
      )

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
        metadata: {
          userId: 'user-456',
          userEmail: '',
        },
      })
    })

    it('should accept minimum valid amount ($1 = 100 cents)', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-min',
        url: 'https://polar.sh/checkout/checkout-min',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
        amount: 100,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept maximum valid amount ($10,000 = 1000000 cents)', async () => {
      mockCreate.mockResolvedValue({
        id: 'checkout-max',
        url: 'https://polar.sh/checkout/checkout-max',
      })

      const request = createMockRequest({
        productId: 'test-donation-product-id',
        amount: 1000000,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 with error message when Polar throws Error', async () => {
      mockCreate.mockRejectedValue(new Error('Polar API error'))

      const request = createMockRequest({
        productId: 'test-donation-product-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Polar API error')
    })

    it('should return generic error message for non-Error exceptions', async () => {
      mockCreate.mockRejectedValue('Unknown error')

      const request = createMockRequest({
        productId: 'test-donation-product-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create checkout session')
    })

    it('should handle getUser failure gracefully', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      mockCreate.mockResolvedValue({
        id: 'checkout-noauth',
        url: 'https://polar.sh/checkout/checkout-noauth',
      })

      const request = createMockRequest(
        {
          productId: 'test-donation-product-id',
        },
        { authorization: 'Bearer invalid-token' }
      )

      const response = await POST(request)

      // Should still succeed, just without user metadata
      expect(response.status).toBe(200)
      expect(mockCreate).toHaveBeenCalledWith({
        products: ['test-donation-product-id'],
        successUrl: 'http://localhost:3000/pricing?payment=success',
      })
    })
  })
})

describe('POST /api/payment/checkout - Donation Product Not Configured', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module to test unconfigured scenario
    vi.resetModules()
  })

  it('should return 500 if donation product is not configured', async () => {
    // Re-mock with empty donationProductId
    vi.doMock('@/lib/services/polar', () => ({
      POLAR_CONFIG: {
        organizationId: 'test-org-id',
        webhookSecret: 'test-webhook-secret',
        donationProductId: '', // Not configured
      },
      polar: {
        checkouts: {
          create: vi.fn(),
        },
      },
    }))

    vi.doMock('@/lib/auth/supabaseServer', () => ({
      supabaseServer: {
        auth: {
          getUser: vi.fn(),
        },
      },
    }))

    // Dynamic import to get fresh module with new mocks
    const { POST: POST_unconfigured } = await import('../route')

    const request = new NextRequest('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ productId: 'some-product-id' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST_unconfigured(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Donation product not configured. Please contact support.')
  })
})
