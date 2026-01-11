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

describe('AI Snippet API Route', () => {
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

  describe('POST /api/ai-snippet', () => {
    it('should return 500 if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Create a function', language: 'javascript' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })

    it('should return 400 if prompt is missing', async () => {
      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'javascript' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No prompt provided')
    })

    it('should return 400 if language is missing', async () => {
      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Create a function that adds two numbers' }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No language specified')
    })

    it('should successfully generate a JavaScript code snippet', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                code: 'function add(a, b) {\n  // Return the sum of two numbers\n  return a + b;\n}',
                explanation:
                  'This function takes two parameters and returns their sum using the + operator.',
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function that adds two numbers',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toContain('function add')
      expect(data.language).toBe('javascript')
      expect(data.explanation).toBeDefined()
      expect(data.usage).toBeDefined()
    })

    it('should successfully generate a Python code snippet', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                code: 'def fibonacci(n):\n    """Generate fibonacci sequence up to n"""\n    a, b = 0, 1\n    while a < n:\n        yield a\n        a, b = b, a + b',
                explanation:
                  'This generator function yields fibonacci numbers up to the given limit n using a while loop.',
              }),
            },
          },
        ],
        usage: { prompt_tokens: 120, completion_tokens: 60, total_tokens: 180 },
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a fibonacci generator',
          language: 'python',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toContain('def fibonacci')
      expect(data.language).toBe('python')
      expect(data.explanation).toContain('generator')
    })

    it('should successfully generate a TypeScript code snippet', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                code: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction createUser(name: string, email: string): User {\n  return {\n    id: Date.now(),\n    name,\n    email\n  };\n}',
                explanation:
                  'Defines a User interface with type-safe properties and a factory function that creates User objects.',
              }),
            },
          },
        ],
        usage: { prompt_tokens: 130, completion_tokens: 70, total_tokens: 200 },
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a User interface and a function to create users',
          language: 'typescript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toContain('interface User')
      expect(data.language).toBe('typescript')
    })

    it('should provide default explanation when not provided by AI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                code: 'console.log("Hello, World!");',
                // No explanation provided
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 30, total_tokens: 130 },
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Print hello world',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.code).toBeDefined()
      expect(data.explanation).toBe('Code snippet generated successfully.')
    })

    it('should return 500 if OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No code generated')
    })

    it('should return 500 if OpenAI returns invalid JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'invalid json content' } }],
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse generated code')
    })

    it('should return 500 if OpenAI response is missing code field', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'Some explanation but no code',
              }),
            },
          },
        ],
      })

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No code in response')
    })

    it('should handle OpenAI 401 authentication error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, undefined, 'Invalid API key', undefined)
      )

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
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

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should handle other OpenAI API errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(503, undefined, 'Service unavailable', undefined)
      )

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should handle generic errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = new Request('http://localhost:3000/api/ai-snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create a function',
          language: 'javascript',
        }),
      })

      const response = await POST(request as unknown as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to generate code snippet')
    })
  })
})
