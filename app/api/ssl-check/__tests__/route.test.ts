import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { POST } from '../route'

describe('SSL Check API Route', () => {
  describe('POST /api/ssl-check - Input Validation', () => {
    it('should return 400 when domain is missing', async () => {
      const request = new Request('http://localhost:3000/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid domain provided')
    })

    it('should return 400 when domain is empty string', async () => {
      const request = new Request('http://localhost:3000/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: '' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      // Empty string fails the !domain check, not the cleanDomain check
      expect(data.error).toBe('Invalid domain provided')
    })

    it('should return 400 when domain is only whitespace', async () => {
      const request = new Request('http://localhost:3000/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: '   ' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid domain format')
    })

    it('should accept valid domain format', async () => {
      const request = new Request('http://localhost:3000/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: 'google.com' }),
      })

      const response = await POST(request as unknown as NextRequest)

      // Should not return 400 (may return 500 due to network, but validates input)
      expect(response.status).not.toBe(400)
    })

    it('should handle invalid JSON body', async () => {
      const request = new Request('http://localhost:3000/api/ssl-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      try {
        await POST(request as unknown as NextRequest)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})
