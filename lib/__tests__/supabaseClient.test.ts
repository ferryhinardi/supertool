import { describe, expect, it } from 'vitest'
import { supabase } from '../supabaseClient'

describe('supabaseClient', () => {
  describe('client export', () => {
    it('should export supabase client', () => {
      expect(supabase).toBeDefined()
      expect(supabase).toHaveProperty('auth')
      expect(supabase).toHaveProperty('from')
    })

    it('should be callable as Supabase client', () => {
      expect(typeof supabase.from).toBe('function')
      expect(typeof supabase.auth.getSession).toBe('function')
    })
  })

  describe('client functionality', () => {
    it('should have auth methods', () => {
      expect(supabase.auth).toBeDefined()
      expect(supabase.auth.signOut).toBeDefined()
    })

    it('should have database query methods', () => {
      expect(typeof supabase.from).toBe('function')
      // Test that from returns a query builder
      const query = supabase.from('test')
      expect(query).toBeDefined()
    })
  })
})
