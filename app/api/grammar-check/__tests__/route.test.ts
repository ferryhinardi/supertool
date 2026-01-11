import type { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI before importing the route - use vi.hoisted for proper hoisting
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      }
      static APIError = class APIError extends Error {
        status: number
        constructor(status: number, _error: unknown, message: string, _headers: unknown) {
          super(message)
          this.status = status
          this.name = 'APIError'
        }
      }
    },
  }
})

import OpenAI from 'openai'
import { POST } from '../route'

describe('Grammar Check API Route', () => {
  const originalEnv = process.env.OPENAI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    if (originalEnv) {
      process.env.OPENAI_API_KEY = originalEnv
    } else {
      delete process.env.OPENAI_API_KEY
    }
  })

  describe('POST /api/grammar-check', () => {
    it('should return 500 if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello world' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })

    it('should return 400 if text is missing', async () => {
      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No text provided')
    })

    it('should return 400 if text is empty', async () => {
      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No text provided')
    })

    it('should return 400 if text exceeds maximum length', async () => {
      const longText = 'a'.repeat(10001)
      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: longText }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Text is too long')
    })

    it('should successfully check grammar with valid text', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                issues: [
                  {
                    text: 'teh',
                    type: 'spelling',
                    message: 'Misspelled word',
                    suggestion: 'the',
                    offset: 0,
                    length: 3,
                  },
                ],
                correctedText: 'the quick brown fox',
                summary: { spelling: 1 },
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'teh quick brown fox' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.issues).toHaveLength(1)
      expect(data.issues[0].type).toBe('spelling')
      expect(data.correctedText).toBe('the quick brown fox')
      expect(data.issueCount).toBe(1)
    })

    it('should return empty issues array for text with no errors', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                issues: [],
                correctedText: 'The quick brown fox jumps over the lazy dog.',
                summary: {},
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'The quick brown fox jumps over the lazy dog.' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.issues).toHaveLength(0)
      expect(data.issueCount).toBe(0)
    })

    it('should handle text at maximum allowed length', async () => {
      const maxText = 'a'.repeat(10000)
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                issues: [],
                correctedText: maxText,
                summary: {},
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: maxText }),
      })

      const response = await POST(request as unknown as NextRequest)

      // Should not return 400 for text at exactly max length
      expect(response.status).not.toBe(400)
    })

    it('should return 500 if OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No analysis generated')
    })

    it('should return 500 if OpenAI returns invalid JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'invalid json content' } }],
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse grammar check results')
    })

    it('should return 500 if OpenAI response is missing issues field', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                correctedText: 'Some text',
                summary: {},
              }),
            },
          },
        ],
      })

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No issues data in response')
    })

    it('should handle OpenAI 401 authentication error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, undefined, 'Invalid API key', undefined)
      )

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should handle OpenAI 429 rate limit error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(429, undefined, 'Rate limit exceeded', undefined)
      )

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should handle generic errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = new Request('http://localhost:3000/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Some text to check' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to check grammar')
    })
  })
})
