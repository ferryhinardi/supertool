import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the Polar SDK before importing the module
const mockPolarInstance = {
  checkouts: { create: vi.fn() },
  orders: { list: vi.fn() },
  products: { list: vi.fn() },
}

// Create a class-based mock for Polar
class MockPolar {
  checkouts = mockPolarInstance.checkouts
  orders = mockPolarInstance.orders
  products = mockPolarInstance.products
  constructor(public config: { accessToken: string }) {}
}

vi.mock('@polar-sh/sdk', () => ({
  Polar: MockPolar,
}))

describe('polar', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module state by clearing the module cache
    vi.resetModules()
    // Reset env vars
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('POLAR_CONFIG', () => {
    it('should use environment variables when set', async () => {
      process.env.POLAR_ORGANIZATION_ID = 'test-org-id'
      process.env.POLAR_WEBHOOK_SECRET = 'test-webhook-secret'
      process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'test-product-id'
      process.env.POLAR_ACCESS_TOKEN = 'test-token'

      const { POLAR_CONFIG } = await import('../polar')

      expect(POLAR_CONFIG.organizationId).toBe('test-org-id')
      expect(POLAR_CONFIG.webhookSecret).toBe('test-webhook-secret')
      expect(POLAR_CONFIG.donationProductId).toBe('test-product-id')
    })

    it('should default to empty strings when environment variables are not set', async () => {
      delete process.env.POLAR_ORGANIZATION_ID
      delete process.env.POLAR_WEBHOOK_SECRET
      delete process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID

      const { POLAR_CONFIG } = await import('../polar')

      expect(POLAR_CONFIG.organizationId).toBe('')
      expect(POLAR_CONFIG.webhookSecret).toBe('')
      expect(POLAR_CONFIG.donationProductId).toBe('')
    })
  })

  describe('getPolar', () => {
    it('should create and return a Polar client instance', async () => {
      process.env.POLAR_ACCESS_TOKEN = 'test-access-token'

      const { getPolar } = await import('../polar')

      const client = getPolar()

      expect(client).toBeInstanceOf(MockPolar)
      expect(client.checkouts).toBeDefined()
      expect(client.orders).toBeDefined()
      expect(client.products).toBeDefined()
    })

    it('should return the same instance on subsequent calls', async () => {
      process.env.POLAR_ACCESS_TOKEN = 'test-access-token'

      const { getPolar } = await import('../polar')

      const client1 = getPolar()
      const client2 = getPolar()

      expect(client1).toBe(client2)
    })

    it('should throw error when POLAR_ACCESS_TOKEN is not set', async () => {
      delete process.env.POLAR_ACCESS_TOKEN

      const { getPolar } = await import('../polar')

      expect(() => getPolar()).toThrow('POLAR_ACCESS_TOKEN is not set')
    })

    it('should include helpful message in error when token is missing', async () => {
      delete process.env.POLAR_ACCESS_TOKEN

      const { getPolar } = await import('../polar')

      expect(() => getPolar()).toThrow(/https:\/\/polar\.sh\/dashboard\/settings/)
    })
  })

  describe('polar proxy', () => {
    it('should proxy property access to getPolar instance', async () => {
      process.env.POLAR_ACCESS_TOKEN = 'test-access-token'

      const { polar } = await import('../polar')

      // Access a property through the proxy
      const checkouts = polar.checkouts

      expect(checkouts).toBeDefined()
      expect(checkouts.create).toBeDefined()
    })

    it('should allow accessing multiple properties through proxy', async () => {
      process.env.POLAR_ACCESS_TOKEN = 'test-access-token'

      const { polar } = await import('../polar')

      // Access multiple properties
      const checkouts = polar.checkouts
      const orders = polar.orders
      const products = polar.products

      expect(checkouts).toBeDefined()
      expect(orders).toBeDefined()
      expect(products).toBeDefined()
    })
  })

  describe('POLAR_WEBHOOK_EVENTS', () => {
    it('should have subscription lifecycle events', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')

      expect(POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED).toBe('subscription.created')
      expect(POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED).toBe('subscription.updated')
      expect(POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED).toBe('subscription.canceled')
      expect(POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_REVOKED).toBe('subscription.revoked')
    })

    it('should have product events', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')

      expect(POLAR_WEBHOOK_EVENTS.PRODUCT_CREATED).toBe('product.created')
      expect(POLAR_WEBHOOK_EVENTS.PRODUCT_UPDATED).toBe('product.updated')
    })

    it('should have order events', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')

      expect(POLAR_WEBHOOK_EVENTS.ORDER_CREATED).toBe('order.created')
    })

    it('should have checkout events', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')

      expect(POLAR_WEBHOOK_EVENTS.CHECKOUT_CREATED).toBe('checkout.created')
      expect(POLAR_WEBHOOK_EVENTS.CHECKOUT_UPDATED).toBe('checkout.updated')
    })

    it('should have correct number of event types', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')

      const eventKeys = Object.keys(POLAR_WEBHOOK_EVENTS)
      expect(eventKeys).toHaveLength(9)
    })
  })

  describe('console warnings', () => {
    it('should warn when POLAR_ORGANIZATION_ID is not set', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      delete process.env.POLAR_ORGANIZATION_ID
      process.env.POLAR_WEBHOOK_SECRET = 'secret'
      process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'product'

      await import('../polar')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('POLAR_ORGANIZATION_ID is not set')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should warn when POLAR_WEBHOOK_SECRET is not set', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.POLAR_ORGANIZATION_ID = 'org-id'
      delete process.env.POLAR_WEBHOOK_SECRET
      process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'product'

      await import('../polar')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('POLAR_WEBHOOK_SECRET is not set')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should warn when NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID is not set', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.POLAR_ORGANIZATION_ID = 'org-id'
      process.env.POLAR_WEBHOOK_SECRET = 'secret'
      delete process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID

      await import('../polar')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID is not set')
      )
      consoleWarnSpy.mockRestore()
    })

    it('should not warn when all config values are set', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      process.env.POLAR_ORGANIZATION_ID = 'org-id'
      process.env.POLAR_WEBHOOK_SECRET = 'secret'
      process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'product'

      await import('../polar')

      expect(consoleWarnSpy).not.toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('PolarWebhookEvent type', () => {
    it('should allow valid event values', async () => {
      const { POLAR_WEBHOOK_EVENTS } = await import('../polar')
      type PolarWebhookEvent = (typeof POLAR_WEBHOOK_EVENTS)[keyof typeof POLAR_WEBHOOK_EVENTS]

      // Type assertion tests - these should compile without error
      const validEvent1: PolarWebhookEvent = 'subscription.created'
      const validEvent2: PolarWebhookEvent = 'order.created'
      const validEvent3: PolarWebhookEvent = 'checkout.created'

      expect(validEvent1).toBe('subscription.created')
      expect(validEvent2).toBe('order.created')
      expect(validEvent3).toBe('checkout.created')
    })
  })

  describe('POLAR_CONFIG immutability', () => {
    it('should export POLAR_CONFIG as a const object', async () => {
      process.env.POLAR_ORGANIZATION_ID = 'org-id'
      process.env.POLAR_WEBHOOK_SECRET = 'secret'
      process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'product'

      const { POLAR_CONFIG } = await import('../polar')

      // Verify it has the expected shape
      expect(typeof POLAR_CONFIG.organizationId).toBe('string')
      expect(typeof POLAR_CONFIG.webhookSecret).toBe('string')
      expect(typeof POLAR_CONFIG.donationProductId).toBe('string')
    })
  })
})
