import { beforeEach, describe, expect, it, vi } from 'vitest'

// Hoist mock function
const mockCreate = vi.hoisted(() => vi.fn())

// Mock OpenAI SDK
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

describe('AI Prompt Explainer API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
  })

  describe('POST /api/ai-prompt-explainer', () => {
    describe('Input Validation', () => {
      it('should return 500 if OPENAI_API_KEY is not configured', async () => {
        vi.stubEnv('OPENAI_API_KEY', '')

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('OpenAI API key not configured')
      })

      it('should return 400 if prompt is missing', async () => {
        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No prompt provided')
      })

      it('should return 400 if prompt is empty string', async () => {
        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No prompt provided')
      })

      it('should return 400 if prompt exceeds 5000 characters', async () => {
        const longPrompt = 'a'.repeat(5001)

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: longPrompt }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Prompt is too long')
        expect(data.error).toContain('5000 characters')
      })

      it('should accept prompt exactly at 5000 characters', async () => {
        const exactPrompt = 'a'.repeat(5000)

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'The prompt is a repetitive character string.',
                  structure: { clarity: 1, specificity: 1, context: 1 },
                  suggestions: ['Add meaningful content'],
                  bestPractices: ['Be specific'],
                  optimizedPrompt: 'Please provide specific instructions.',
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: exactPrompt }),
        })

        const response = await POST(request as never)
        expect(response.status).toBe(200)
      })
    })

    describe('Successful Analysis', () => {
      it('should return prompt analysis successfully', async () => {
        const mockAnalysis = {
          analysis: 'This prompt is clear but could benefit from more specificity.',
          structure: {
            clarity: 8,
            specificity: 6,
            context: 5,
          },
          suggestions: [
            'Specify the desired tone of the poem',
            'Include the target audience',
            'Define the desired length',
          ],
          bestPractices: [
            'Always include context about the purpose',
            'Specify the format and structure expected',
          ],
          optimizedPrompt:
            'Write a short, whimsical poem (4 stanzas) about nature for children ages 5-8.',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockAnalysis),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem about nature' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.analysis).toBe(mockAnalysis.analysis)
        expect(data.structure).toEqual(mockAnalysis.structure)
        expect(data.suggestions).toEqual(mockAnalysis.suggestions)
        expect(data.bestPractices).toEqual(mockAnalysis.bestPractices)
        expect(data.optimizedPrompt).toBe(mockAnalysis.optimizedPrompt)
        expect(data.usage).toBeDefined()
      })

      it('should call OpenAI with correct parameters', async () => {
        const mockAnalysis = {
          analysis: 'Good prompt',
          structure: { clarity: 9, specificity: 8, context: 7 },
          suggestions: ['Consider adding examples'],
          bestPractices: ['Use clear language'],
          optimizedPrompt: 'Optimized version',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockAnalysis),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const testPrompt = 'Help me write a compelling product description'

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: testPrompt }),
        })

        await POST(request as never)

        expect(mockCreate).toHaveBeenCalledTimes(1)
        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.model).toBe('gpt-4o-mini')
        expect(callArgs.max_tokens).toBe(2000)
        expect(callArgs.temperature).toBe(0.5)
        expect(callArgs.response_format).toEqual({ type: 'json_object' })
        expect(callArgs.messages).toHaveLength(2)
        expect(callArgs.messages[0].role).toBe('system')
        expect(callArgs.messages[1].role).toBe('user')
        expect(callArgs.messages[1].content).toContain(testPrompt)
      })

      it('should handle response with empty suggestions and bestPractices arrays', async () => {
        const mockAnalysis = {
          analysis: 'This prompt is already well-written.',
          structure: { clarity: 10, specificity: 10, context: 10 },
          suggestions: [],
          bestPractices: [],
          optimizedPrompt: 'The prompt is already optimal.',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockAnalysis),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Write a 500-word essay analyzing climate change impacts on agriculture',
          }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.suggestions).toEqual([])
        expect(data.bestPractices).toEqual([])
      })

      it('should handle response with missing optional arrays', async () => {
        const mockAnalysis = {
          analysis: 'Analysis provided',
          structure: { clarity: 7, specificity: 6, context: 5 },
          optimizedPrompt: 'Optimized prompt here',
          // suggestions and bestPractices intentionally missing
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockAnalysis),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Test prompt' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.suggestions).toEqual([])
        expect(data.bestPractices).toEqual([])
      })
    })

    describe('Error Handling - OpenAI Response Issues', () => {
      it('should return 500 if OpenAI returns no content', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a story' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No analysis generated')
      })

      it('should return 500 if OpenAI returns empty choices', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [],
          usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a story' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No analysis generated')
      })

      it('should return 500 if OpenAI returns invalid JSON', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'not valid json',
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a story' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Failed to parse analysis')
      })

      it('should return 500 if analysis is missing from response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  structure: { clarity: 5, specificity: 5, context: 5 },
                  optimizedPrompt: 'Optimized',
                  // analysis is missing
                }),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Test prompt' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Incomplete analysis in response')
      })

      it('should return 500 if structure is missing from response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'Good prompt',
                  optimizedPrompt: 'Optimized',
                  // structure is missing
                }),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Test prompt' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Incomplete analysis in response')
      })

      it('should return 500 if optimizedPrompt is missing from response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  analysis: 'Good prompt',
                  structure: { clarity: 5, specificity: 5, context: 5 },
                  // optimizedPrompt is missing
                }),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Test prompt' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Incomplete analysis in response')
      })
    })

    describe('Error Handling - OpenAI API Errors', () => {
      it('should handle OpenAI 401 authentication error', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
        )

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid OpenAI API key')
      })

      it('should handle OpenAI 429 rate limit error', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(
            429,
            { error: 'rate_limit_exceeded' },
            'Rate limit exceeded',
            undefined
          )
        )

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(429)
        expect(data.error).toContain('Rate limit exceeded')
      })

      it('should handle other OpenAI API errors with status', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(
            503,
            { error: 'service_unavailable' },
            'Service unavailable',
            undefined
          )
        )

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(503)
        expect(data.error).toContain('OpenAI API error')
        expect(data.error).toContain('Service unavailable')
      })

      it('should handle generic errors gracefully', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Network error'))

        const request = new Request('http://localhost/api/ai-prompt-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Write a poem' }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to analyze prompt. Please try again.')
      })
    })
  })
})
