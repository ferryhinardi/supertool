import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI before importing the route
const mockCreate = vi.hoisted(() => vi.fn())
const mockCheckPremiumAccess = vi.hoisted(() => vi.fn())
const mockRecordUsage = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

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

vi.mock('@/lib/services/premium-gate', () => ({
  checkPremiumAccess: mockCheckPremiumAccess,
  recordUsage: mockRecordUsage,
}))

vi.mock('@/lib/auth/supabaseServer', () => ({
  getSupabaseServer: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

import OpenAI from 'openai'
import { POST } from '../route'

describe('AI Text Rewriter API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-api-key' }
    mockCheckPremiumAccess.mockResolvedValue({
      allowed: true,
      reason: 'within-quota',
      remaining: 5,
    })
    mockRecordUsage.mockResolvedValue(true)
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // Helper function to create a mock request
  function createMockRequest(
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
  ): Request {
    return new Request('http://localhost:3000/api/ai-text-rewriter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  }

  describe('POST /api/ai-text-rewriter', () => {
    it('returns a 402 paywall response before calling OpenAI when quota is exceeded', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: false,
        reason: 'quota-exceeded',
        remaining: 0,
      })

      const request = createMockRequest(
        {
          text: 'Please rewrite this text',
          tone: 'professional',
        },
        {
          'x-forwarded-for': '203.0.113.10',
        }
      )

      const response = await POST(request as never)
      const data = await response.json()

      expect(response.status).toBe(402)
      expect(data).toEqual({
        status: 'paywall',
        reason: 'quota-exceeded',
        remaining: 0,
      })
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRecordUsage).not.toHaveBeenCalled()
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: undefined,
        metricName: 'ai-text-rewriter',
        freeQuotaPerDay: 5,
        ipAddress: '203.0.113.10',
      })
    })

    it('preserves reserved remaining quota for authenticated free-tier rewrites', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                variants: ['Rewritten text'],
                improvements: ['Improved clarity'],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      })

      const request = createMockRequest(
        {
          text: 'Please rewrite this text',
          tone: 'professional',
        },
        {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '198.51.100.8',
        }
      )

      const response = await POST(request as never)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.remaining).toBe(5)
      expect(mockGetUser).toHaveBeenCalledWith('valid-token')
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'ai-text-rewriter',
        freeQuotaPerDay: 5,
        ipAddress: '198.51.100.8',
      })
      expect(mockRecordUsage).not.toHaveBeenCalled()
    })
    describe('Environment Configuration', () => {
      it('should return 500 if OPENAI_API_KEY is not configured', async () => {
        delete process.env.OPENAI_API_KEY

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('OpenAI API key not configured')
      })
    })

    describe('Input Validation', () => {
      it('should return 400 if no text is provided', async () => {
        const request = createMockRequest({
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No text provided')
      })

      it('should return 400 if text is empty string', async () => {
        const request = createMockRequest({
          text: '',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No text provided')
      })

      it('should return 400 if no tone is provided', async () => {
        const request = createMockRequest({
          text: 'Hello world',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No tone specified')
      })

      it('should return 400 if text exceeds 5000 characters', async () => {
        const longText = 'a'.repeat(5001)
        const request = createMockRequest({
          text: longText,
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Text is too long')
        expect(data.error).toContain('Maximum 5000 characters')
      })

      it('should accept text at exactly 5000 characters', async () => {
        const maxText = 'a'.repeat(5000)

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  improvements: ['Improved tone'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: maxText,
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toBeDefined()
      })
    })

    describe('Successful Text Rewriting', () => {
      it('should rewrite text with professional tone', async () => {
        const mockResponse = {
          variants: ['The meeting will commence at 9 AM tomorrow.'],
          improvements: ['Improved formality', 'Added precision'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toEqual(mockResponse.variants)
        expect(data.improvements).toEqual(mockResponse.improvements)
        expect(data.tone).toBe('professional')
        expect(data.style).toBe('balanced')
        expect(data.originalLength).toBe(32)
        expect(data.usage).toBeDefined()
      })

      it('should rewrite text with casual tone', async () => {
        const mockResponse = {
          variants: ["Hey! Meeting's at 9 tomorrow!"],
          improvements: ['Made it more friendly', 'Added casual expression'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'casual',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.tone).toBe('casual')
      })

      it('should rewrite text with simple style', async () => {
        const mockResponse = {
          variants: ['Meeting at 9 tomorrow.'],
          improvements: ['Simplified language', 'Shortened sentence'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'professional',
          style: 'simple',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.style).toBe('simple')
      })

      it('should rewrite text with advanced style', async () => {
        const mockResponse = {
          variants: ['The scheduled meeting shall convene promptly at 9:00 AM on the morrow.'],
          improvements: ['Enhanced vocabulary', 'Added sophistication'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'formal',
          style: 'advanced',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.style).toBe('advanced')
        expect(data.tone).toBe('formal')
      })

      it('should generate multiple variants when requested', async () => {
        const mockResponse = {
          variants: [
            'The meeting is scheduled for 9 AM tomorrow.',
            'Tomorrow at 9 AM, we will convene for a meeting.',
            'A meeting has been arranged for 9 AM tomorrow.',
          ],
          improvements: ['Added variety', 'Multiple perspectives'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 150, total_tokens: 250 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'professional',
          variants: 3,
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toHaveLength(3)
      })

      it('should limit variants to maximum of 3', async () => {
        const mockResponse = {
          variants: ['Variant 1', 'Variant 2', 'Variant 3'],
          improvements: ['Limited variants'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify(mockResponse),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 100, total_tokens: 200 },
        })

        const request = createMockRequest({
          text: 'The meeting starts at 9 tomorrow',
          tone: 'professional',
          variants: 10, // Request 10, but should be capped at 3
        })

        const response = await POST(request as never)
        await response.json()

        expect(response.status).toBe(200)
        // Verify the OpenAI call requested at most 3 variants
        expect(mockCreate).toHaveBeenCalledTimes(1)
        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.messages[0].content).toContain('3')
      })

      it('should handle different tone options', async () => {
        const tones = [
          'professional',
          'casual',
          'friendly',
          'formal',
          'persuasive',
          'creative',
          'concise',
          'detailed',
          'humorous',
          'empathetic',
        ]

        for (const tone of tones) {
          mockCreate.mockResolvedValueOnce({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    variants: [`Rewritten in ${tone} tone`],
                    improvements: ['Tone adjusted'],
                  }),
                },
              },
            ],
            usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
          })

          const request = createMockRequest({
            text: 'Test text',
            tone,
          })

          const response = await POST(request as never)
          const data = await response.json()

          expect(response.status).toBe(200)
          expect(data.tone).toBe(tone)
        }
      })

      it('should handle unknown tone gracefully with default description', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  improvements: ['General improvements'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test text',
          tone: 'unknown-tone',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.tone).toBe('unknown-tone')
      })

      it('should return default style as balanced when not specified', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  improvements: ['Improvements'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test text',
          tone: 'professional',
          // No style specified
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.style).toBe('balanced')
      })

      it('should return empty improvements array if not in response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  // No improvements key
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test text',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.improvements).toEqual([])
      })
    })

    describe('OpenAI API Call Configuration', () => {
      it('should use correct model and parameters', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  improvements: ['Improvement'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        await POST(request as never)

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: 'gpt-4o-mini',
            max_tokens: 2000,
            temperature: 0.8,
            response_format: { type: 'json_object' },
          })
        )
      })

      it('should include proper system and user prompts', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten text'],
                  improvements: ['Improvement'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test message',
          tone: 'professional',
        })

        await POST(request as never)

        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.messages).toHaveLength(2)
        expect(callArgs.messages[0].role).toBe('system')
        expect(callArgs.messages[0].content).toContain('copywriter')
        expect(callArgs.messages[1].role).toBe('user')
        expect(callArgs.messages[1].content).toContain('Test message')
        expect(callArgs.messages[1].content).toContain('professional')
      })
    })

    describe('Error Handling - OpenAI Response Issues', () => {
      it('should return 500 if no content in response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No rewritten text generated')
      })

      it('should return 500 if choices array is empty', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [],
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No rewritten text generated')
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
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Failed to parse rewritten text')
      })

      it('should return 500 if variants array is missing', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  improvements: ['Some improvement'],
                }),
              },
            },
          ],
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No variants in response')
      })

      it('should return 500 if variants array is empty', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: [],
                  improvements: ['Some improvement'],
                }),
              },
            },
          ],
        })

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No variants in response')
      })
    })

    describe('Error Handling - OpenAI API Errors', () => {
      it('should handle OpenAI 401 authentication error', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
        )

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toContain('Invalid OpenAI API key')
      })

      it('should handle OpenAI 429 rate limit error', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(429, { error: 'rate_limit' }, 'Rate limit exceeded', undefined)
        )

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
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

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(503)
        expect(data.error).toContain('OpenAI API error')
      })

      it('should handle OpenAI API error with undefined status', async () => {
        const error = new OpenAI.APIError(0, { error: 'unknown' }, 'Unknown error', undefined)
        // Simulate undefined status
        Object.defineProperty(error, 'status', { value: undefined })

        mockCreate.mockRejectedValueOnce(error)

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('OpenAI API error')
      })

      it('should handle generic errors gracefully', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Network error'))

        const request = createMockRequest({
          text: 'Hello world',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to rewrite text. Please try again.')
      })
    })

    describe('Edge Cases', () => {
      it('should handle special characters in text', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten with special chars: <>&"\''],
                  improvements: ['Preserved special characters'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Text with special chars: <>&"\'',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toBeDefined()
      })

      it('should handle unicode characters in text', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Rewritten: 你好世界 🌍'],
                  improvements: ['Preserved unicode'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Hello 你好世界 🌍',
          tone: 'friendly',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toBeDefined()
      })

      it('should handle multiline text', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Line 1\nLine 2\nLine 3'],
                  improvements: ['Preserved structure'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Line 1\nLine 2\nLine 3',
          tone: 'professional',
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.variants).toBeDefined()
      })

      it('should handle variant count of 0 (defaults to 1)', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Single variant'],
                  improvements: ['One variant generated'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test text',
          tone: 'professional',
          variants: 0,
        })

        const response = await POST(request as never)
        await response.json()

        expect(response.status).toBe(200)
        // Should default to 1 variant
        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.messages[0].content).toContain('1')
      })

      it('should handle negative variant count (defaults to 1)', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  variants: ['Single variant'],
                  improvements: ['One variant generated'],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        })

        const request = createMockRequest({
          text: 'Test text',
          tone: 'professional',
          variants: -5,
        })

        const response = await POST(request as never)
        await response.json()

        expect(response.status).toBe(200)
        // Should default to 1 variant
        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.messages[0].content).toContain('1')
      })
    })
  })
})
