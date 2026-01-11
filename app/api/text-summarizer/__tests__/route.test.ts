import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI SDK using vi.hoisted pattern
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('openai', () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    }

    static APIError = class APIError extends Error {
      status: number
      constructor(
        status: number,
        _error: object | undefined,
        message: string,
        _headers: object | undefined
      ) {
        super(message)
        this.status = status
        this.name = 'APIError'
      }
    }
  },
}))

import OpenAI from 'openai'
// Import after mocking
import { POST } from '../route'

// Store original env
const originalEnv = process.env

describe('Text Summarizer API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-api-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  function createRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/text-summarizer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  describe('Validation', () => {
    it('should return 400 if text is missing', async () => {
      const request = createRequest({ length: 'short', format: 'bullets' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No text provided')
    })

    it('should return 400 if length is missing', async () => {
      const request = createRequest({ text: 'Some text', format: 'bullets' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid length option')
    })

    it('should return 400 if length is invalid', async () => {
      const request = createRequest({ text: 'Some text', length: 'extra-long', format: 'bullets' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid length option')
    })

    it('should return 400 if format is missing', async () => {
      const request = createRequest({ text: 'Some text', length: 'short' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid format option')
    })

    it('should return 400 if format is invalid', async () => {
      const request = createRequest({ text: 'Some text', length: 'short', format: 'table' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid format option')
    })
  })

  describe('Configuration', () => {
    it('should return 500 if OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = createRequest({ text: 'Some text', length: 'short', format: 'bullets' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })
  })

  describe('Successful Summarization', () => {
    it('should return summary with bullets format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: '• Point one.\n• Point two.\n• Point three.',
                highlights: ['Key point 1', 'Key point 2', 'Key point 3'],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      }

      mockCreate.mockResolvedValueOnce(mockResponse)

      const request = createRequest({
        text: 'This is a long text that needs to be summarized. It contains many important details.',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBe('• Point one.\n• Point two.\n• Point three.')
      expect(data.highlights).toEqual(['Key point 1', 'Key point 2', 'Key point 3'])
      expect(data.stats).toBeDefined()
      expect(data.stats.wordCount).toBeGreaterThan(0)
      expect(data.stats.charCount).toBeGreaterThan(0)
      expect(data.usage).toEqual(mockResponse.usage)
    })

    it('should return summary with paragraph format', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary:
                  'This is a cohesive summary paragraph that captures the main ideas of the text.',
                highlights: ['Main idea 1', 'Main idea 2'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      }

      mockCreate.mockResolvedValueOnce(mockResponse)

      const request = createRequest({
        text: 'Original text content here.',
        length: 'medium',
        format: 'paragraph',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toContain('cohesive summary paragraph')
      expect(data.highlights).toHaveLength(2)
    })

    it('should handle long format option', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Long detailed summary with multiple paragraphs.',
                highlights: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 200, completion_tokens: 100, total_tokens: 300 },
      }

      mockCreate.mockResolvedValueOnce(mockResponse)

      const request = createRequest({
        text: 'Very long original text...',
        length: 'long',
        format: 'paragraph',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.highlights).toHaveLength(5)
    })

    it('should return empty highlights array if not provided', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Just a summary without highlights.',
              }),
            },
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 25, total_tokens: 75 },
      }

      mockCreate.mockResolvedValueOnce(mockResponse)

      const request = createRequest({
        text: 'Some text.',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.highlights).toEqual([])
    })

    it('should calculate correct word and character counts', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Three word summary.',
                highlights: [],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 25, total_tokens: 75 },
      }

      mockCreate.mockResolvedValueOnce(mockResponse)

      const originalText = 'This original text has six words.'
      const request = createRequest({
        text: originalText,
        length: 'short',
        format: 'paragraph',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.stats.wordCount).toBe(3) // "Three word summary."
      expect(data.stats.charCount).toBe(19) // "Three word summary." (19 chars)
      expect(data.stats.originalWordCount).toBe(6)
      expect(data.stats.originalCharCount).toBe(originalText.length)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 if no content is generated', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
        usage: {},
      })

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No summary generated')
    })

    it('should return 500 if JSON parsing fails', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Not valid JSON' } }],
        usage: {},
      })

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to parse summary. Please try again.')
    })

    it('should return 500 if summary is missing from parsed response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ highlights: ['point 1'] }),
            },
          },
        ],
        usage: {},
      })

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No summary in response')
    })

    it('should return 401 for invalid API key', async () => {
      const apiError = new OpenAI.APIError(401, undefined, 'Invalid API key', undefined)
      mockCreate.mockRejectedValueOnce(apiError)

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should return 429 for rate limit exceeded', async () => {
      const apiError = new OpenAI.APIError(429, undefined, 'Rate limit exceeded', undefined)
      mockCreate.mockRejectedValueOnce(apiError)

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should return API error status for other OpenAI errors', async () => {
      const apiError = new OpenAI.APIError(503, undefined, 'Service unavailable', undefined)
      mockCreate.mockRejectedValueOnce(apiError)

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('Service unavailable')
    })

    it('should return 500 for generic errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Unknown error'))

      const request = createRequest({
        text: 'Some text',
        length: 'short',
        format: 'bullets',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate summary. Please try again.')
    })
  })
})
