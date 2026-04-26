import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI - must be hoisted
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

// Mock the templates module
vi.mock('@/app/tools/development/ai-code-converter/templates', () => ({
  generateSystemPrompt: vi.fn(
    (sourceLanguage: string, targetLanguage: string, options: { addComments: boolean }) => {
      return `Convert from ${sourceLanguage} to ${targetLanguage}. Add comments: ${options.addComments}`
    }
  ),
}))

import OpenAI from 'openai'
import { POST } from '../route'

describe('POST /api/ai-code-converter', () => {
  const originalEnv = process.env.OPENAI_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
    mockCheckPremiumAccess.mockResolvedValue({
      allowed: true,
      reason: 'within-quota',
      remaining: 10,
    })
    mockRecordUsage.mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
  })

  const createRequest = (body: unknown, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/ai-code-converter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  }

  describe('Configuration Validation', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      process.env.OPENAI_API_KEY = ''

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })
  })

  describe('Input Validation', () => {
    it('should return 400 when sourceCode is missing', async () => {
      const request = createRequest({
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 400 when sourceLanguage is missing', async () => {
      const request = createRequest({
        sourceCode: 'console.log("hello")',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 400 when targetLanguage is missing', async () => {
      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })

    it('should return 400 when sourceCode exceeds 10000 characters', async () => {
      const longCode = 'a'.repeat(10001)
      const request = createRequest({
        sourceCode: longCode,
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('too long')
      expect(data.error).toContain('10,000 characters')
    })

    it('should return 400 when source and target languages are the same', async () => {
      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'javascript',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('cannot be the same')
    })
  })

  describe('Successful Conversion', () => {
    it('should successfully convert JavaScript to Python', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
                explanation: 'Converted console.log to Python print function',
                warnings: [],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.convertedCode).toBe('print("hello")')
      expect(data.explanation).toBe('Converted console.log to Python print function')
      expect(data.warnings).toEqual([])
      expect(data.usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      })
    })

    it('should successfully convert TypeScript to Java with warnings', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode:
                  'public class Main {\n  public static void main(String[] args) {\n    System.out.println("hello");\n  }\n}',
                explanation: 'Converted TypeScript to Java class structure',
                warnings: ['TypeScript interfaces cannot be directly converted to Java'],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 100,
          total_tokens: 250,
        },
      })

      const request = createRequest({
        sourceCode: 'const message: string = "hello"; console.log(message);',
        sourceLanguage: 'typescript',
        targetLanguage: 'java',
        options: { addComments: false, preserveStructure: false, optimizeCode: true },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.convertedCode).toContain('System.out.println')
      expect(data.warnings).toContain('TypeScript interfaces cannot be directly converted to Java')
    })

    it('should handle response without explanation', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 20,
          total_tokens: 70,
        },
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: false, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.convertedCode).toBe('print("hello")')
      expect(data.explanation).toBeUndefined()
      expect(data.warnings).toEqual([])
    })

    it('should handle response without usage information', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'fmt.Println("hello")',
                explanation: 'Converted to Go',
              }),
            },
          },
        ],
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'go',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.convertedCode).toBe('fmt.Println("hello")')
      expect(data.usage).toBeUndefined()
    })

    it('should call OpenAI with correct parameters', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 20,
          total_tokens: 70,
        },
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      await POST(request)

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.any(String),
          },
          {
            role: 'user',
            content: expect.stringContaining('console.log("hello")'),
          },
        ],
        max_tokens: 4000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })
    })

    it('should include source and target language in user prompt', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
              }),
            },
          },
        ],
      })

      const request = createRequest({
        sourceCode: 'const x = 5;',
        sourceLanguage: 'typescript',
        targetLanguage: 'rust',
        options: { addComments: false, preserveStructure: false, optimizeCode: true },
      })

      await POST(request)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringMatching(/typescript[\s\S]*const x = 5;[\s\S]*rust/i),
            }),
          ]),
        })
      )
    })
  })

  describe('Premium Gate', () => {
    it('should return 402 paywall response before calling OpenAI when quota is exceeded', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: false,
        reason: 'quota-exceeded',
        remaining: 0,
      })

      const request = createRequest(
        {
          sourceCode: 'console.log("hello")',
          sourceLanguage: 'javascript',
          targetLanguage: 'python',
          options: { addComments: true, preserveStructure: true, optimizeCode: false },
        },
        { 'x-forwarded-for': '203.0.113.20' }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(402)
      expect(data).toEqual({
        status: 'paywall',
        reason: 'quota-exceeded',
        remaining: 0,
      })
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: undefined,
        metricName: 'ai-code-converter',
        freeQuotaPerDay: 10,
        ipAddress: '203.0.113.20',
      })
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRecordUsage).not.toHaveBeenCalled()
    })

    it('should record usage after a successful authenticated conversion and return remaining quota', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
                explanation: 'Converted console.log to Python print function',
                warnings: [],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      })

      const request = createRequest(
        {
          sourceCode: 'console.log("hello")',
          sourceLanguage: 'javascript',
          targetLanguage: 'python',
          options: { addComments: true, preserveStructure: true, optimizeCode: false },
        },
        {
          authorization: 'Bearer valid-token',
          'x-real-ip': '198.51.100.21',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(mockGetUser).toHaveBeenCalledWith('valid-token')
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'ai-code-converter',
        freeQuotaPerDay: 10,
        ipAddress: '198.51.100.21',
      })
      expect(mockRecordUsage).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'ai-code-converter',
        quantity: 1,
      })
      expect(response.status).toBe(200)
      expect(data.remaining).toBe(9)
    })
  })

  describe('Response Validation', () => {
    it('should return 500 when OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('No conversion generated')
    })

    it('should return 500 when OpenAI response is not valid JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'not valid json' } }],
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to parse conversion')
    })

    it('should return 500 when response has no convertedCode', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'Some explanation without code',
              }),
            },
          },
        ],
      })

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('No converted code in response')
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when OpenAI API key is invalid', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
      )

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid OpenAI API key')
    })

    it('should return 429 when rate limited', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(429, { error: 'rate_limit' }, 'Rate limit exceeded', undefined)
      )

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('should return appropriate status for other OpenAI API errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(503, { error: 'service_unavailable' }, 'Service unavailable', undefined)
      )

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should return 500 for generic OpenAI API errors without status', async () => {
      // Pass 0 as status which will use fallback 500
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(0, { error: 'unknown' }, 'Unknown error', undefined)
      )

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API error')
    })

    it('should return 500 for non-OpenAI errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options: { addComments: true, preserveStructure: true, optimizeCode: false },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to convert code')
    })

    it('should handle request JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai-code-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to convert code. Please try again.')
    })
  })

  describe('Language Conversion Scenarios', () => {
    const languages = [
      { source: 'javascript', target: 'python' },
      { source: 'python', target: 'java' },
      { source: 'typescript', target: 'go' },
      { source: 'java', target: 'csharp' },
      { source: 'cpp', target: 'rust' },
      { source: 'ruby', target: 'php' },
    ]

    languages.forEach(({ source, target }) => {
      it(`should handle conversion from ${source} to ${target}`, async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  convertedCode: `converted_${target}_code`,
                  explanation: `Converted from ${source} to ${target}`,
                }),
              },
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        })

        const request = createRequest({
          sourceCode: `// ${source} code`,
          sourceLanguage: source,
          targetLanguage: target,
          options: { addComments: true, preserveStructure: true, optimizeCode: false },
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.convertedCode).toBe(`converted_${target}_code`)
      })
    })
  })

  describe('Options Handling', () => {
    it('should pass options correctly to system prompt generation', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                convertedCode: 'print("hello")',
              }),
            },
          },
        ],
      })

      const options = {
        addComments: true,
        preserveStructure: false,
        optimizeCode: true,
      }

      const request = createRequest({
        sourceCode: 'console.log("hello")',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        options,
      })

      await POST(request)

      // Verify the system message was included in the call
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
            }),
          ]),
        })
      )
    })
  })
})
