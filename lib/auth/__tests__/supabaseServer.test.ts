import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock createClient from @supabase/supabase-js
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    from: vi.fn(),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('supabaseServer', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('getSupabaseServer', () => {
    it('should create and return a Supabase client with correct configuration', async () => {
      const { getSupabaseServer } = await import('../supabaseServer')
      const { createClient } = await import('@supabase/supabase-js')

      const client = getSupabaseServer()

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-role-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
      expect(client).toBeDefined()
    })

    it('should return the same client instance on subsequent calls (singleton)', async () => {
      const { getSupabaseServer } = await import('../supabaseServer')
      const { createClient } = await import('@supabase/supabase-js')

      const client1 = getSupabaseServer()
      const client2 = getSupabaseServer()
      const client3 = getSupabaseServer()

      // createClient should only be called once
      expect(createClient).toHaveBeenCalledTimes(1)
      expect(client1).toBe(client2)
      expect(client2).toBe(client3)
    })

    it('should throw error if NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      vi.resetModules()

      const { getSupabaseServer } = await import('../supabaseServer')

      expect(() => getSupabaseServer()).toThrow(
        'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
      )
    })

    it('should throw error if SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''
      vi.resetModules()

      const { getSupabaseServer } = await import('../supabaseServer')

      expect(() => getSupabaseServer()).toThrow(
        'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
      )
    })

    it('should include helpful message when service role key is missing', async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''
      vi.resetModules()

      const { getSupabaseServer } = await import('../supabaseServer')

      expect(() => getSupabaseServer()).toThrow(
        'This is required for server-side operations like webhook handlers'
      )
    })
  })

  describe('supabaseServer proxy', () => {
    it('should proxy method calls to getSupabaseServer()', async () => {
      const { supabaseServer } = await import('../supabaseServer')

      // Access a property through the proxy
      const fromMethod = supabaseServer.from

      expect(fromMethod).toBe(mockSupabaseClient.from)
    })

    it('should proxy nested property access', async () => {
      const { supabaseServer } = await import('../supabaseServer')

      const authProperty = supabaseServer.auth

      expect(authProperty).toBe(mockSupabaseClient.auth)
    })

    it('should allow calling methods on the proxy', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({ data: [], error: null }),
      })

      const { supabaseServer } = await import('../supabaseServer')

      const result = supabaseServer.from('test_table')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('test_table')
      expect(result).toEqual({ select: expect.any(Function) })
    })
  })

  describe('lazy initialization', () => {
    it('should not create client until getSupabaseServer is called', async () => {
      vi.resetModules()
      const { createClient } = await import('@supabase/supabase-js')

      // Just importing should not create the client
      await import('../supabaseServer')

      // createClient should not have been called yet
      expect(createClient).not.toHaveBeenCalled()
    })

    it('should create client only when getSupabaseServer is first called', async () => {
      vi.resetModules()

      const { getSupabaseServer } = await import('../supabaseServer')
      const { createClient } = await import('@supabase/supabase-js')

      // Before first call
      expect(createClient).not.toHaveBeenCalled()

      // First call triggers creation
      getSupabaseServer()

      expect(createClient).toHaveBeenCalledTimes(1)
    })

    it('should allow builds to succeed without service role key (lazy init)', async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''
      vi.resetModules()

      // Import should not throw
      const serverModule = await import('../supabaseServer')

      expect(serverModule.getSupabaseServer).toBeDefined()
      expect(serverModule.supabaseServer).toBeDefined()

      // Only throw when actually used
      expect(() => serverModule.getSupabaseServer()).toThrow()
    })
  })
})
