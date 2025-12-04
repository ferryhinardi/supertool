import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '../route'

// Mock fetch globally
global.fetch = vi.fn()

describe('AI Image Generation API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/ai-image-generate', () => {
    it('should return 400 if prompt is missing', async () => {
      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Prompt is required and must be a string')
    })

    it('should return 400 if prompt is not a string', async () => {
      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 123 }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Prompt is required and must be a string')
    })

    it('should return 400 if prompt is too short', async () => {
      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'ab' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Prompt must be between 3 and 1000 characters')
    })

    it('should return 400 if prompt is too long', async () => {
      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'a'.repeat(1001) }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Prompt must be between 3 and 1000 characters')
    })

    it('should return 503 if OPENAI_API_KEY is not configured', async () => {
      const originalEnv = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('OpenAI API key not configured')

      // Restore original env
      if (originalEnv) {
        process.env.OPENAI_API_KEY = originalEnv
      }
    })

    it('should successfully generate image with valid prompt', async () => {
      // Mock environment variable
      process.env.OPENAI_API_KEY = 'test-api-key'

      // Mock successful OpenAI response
      const mockImageUrl = 'https://example.com/generated-image.png'
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ url: mockImageUrl }],
        }),
      })

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset over mountains' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.imageUrl).toBe(mockImageUrl)
      expect(data.model).toBe('dall-e-3')
      expect(data.size).toBe('1024x1024')
      expect(data.prompt).toBe('A beautiful sunset over mountains')
      expect(data.createdAt).toBeDefined()

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/images/generations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
        })
      )
    })

    it('should handle 401 unauthorized error from OpenAI', async () => {
      process.env.OPENAI_API_KEY = 'invalid-key'

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      })

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should handle 429 rate limit error from OpenAI', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      })

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should handle 400 bad request error from OpenAI', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Invalid prompt content' } }),
      })

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Inappropriate content' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid prompt or request')
    })

    it('should handle missing image URL in OpenAI response', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      })

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('No image URL returned from OpenAI')
    })

    it('should handle network errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'

      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

      const request = new Request('http://localhost:3000/api/ai-image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A beautiful sunset' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to generate image')
      expect(data.details).toContain('Network error')
    })
  })

  describe('GET /api/ai-image-generate', () => {
    it('should return 405 for GET requests', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(405)
      expect(data.error).toBe('Method not allowed')
      expect(data.message).toContain('POST requests')
    })
  })
})
