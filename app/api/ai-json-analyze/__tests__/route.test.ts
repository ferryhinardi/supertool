import { beforeEach, describe, expect, it, vi } from 'vitest'

// Hoist mock function
const mockCreate = vi.hoisted(() => vi.fn())
const mockCheckPremiumAccess = vi.hoisted(() => vi.fn())
const mockRecordUsage = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

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

describe('AI JSON Analyze API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
    mockCheckPremiumAccess.mockResolvedValue({
      allowed: true,
      reason: 'within-quota',
      remaining: 8,
    })
    mockRecordUsage.mockResolvedValue(undefined)
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
  })

  const createRequest = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('http://localhost/api/ai-json-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })

  describe('POST /api/ai-json-analyze', () => {
    describe('Input Validation', () => {
      it('should return 413 when the request payload exceeds the configured limit', async () => {
        vi.stubEnv('AI_JSON_ANALYZER_MAX_PAYLOAD_BYTES', '40')

        const request = createRequest({
          jsonData: { value: 'payload that is definitely too large' },
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(413)
        expect(data.error).toContain('payload is too large')
        expect(mockCreate).not.toHaveBeenCalled()
      })

      it('should return 500 if OPENAI_API_KEY is not configured', async () => {
        vi.stubEnv('OPENAI_API_KEY', '')

        const request = createRequest({ jsonData: { name: 'test' } })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('OpenAI API key not configured')
      })

      it('should return 400 if jsonData is missing', async () => {
        const request = createRequest({})

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No JSON data provided')
      })

      it('should return 400 if jsonData is null', async () => {
        const request = createRequest({ jsonData: null })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('No JSON data provided')
      })

      it('should return 400 if jsonData string is invalid JSON', async () => {
        const request = createRequest({ jsonData: 'not valid json {' })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid JSON format')
      })

      it('should accept jsonData as an object', async () => {
        const mockAnalysis = {
          summary: 'Simple user object',
          structure: 'Flat object structure',
          patterns: 'Standard naming conventions',
          insights: 'No issues detected',
          relationships: 'Independent fields',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = createRequest({ jsonData: { name: 'John', age: 30 } })

        const response = await POST(request as never)
        expect(response.status).toBe(200)
      })

      it('should accept jsonData as a valid JSON string', async () => {
        const mockAnalysis = {
          summary: 'User data object',
          structure: 'Simple flat structure',
          patterns: 'Standard key-value pairs',
          insights: 'Consider adding type hints',
          relationships: 'No complex relationships',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = createRequest({ jsonData: '{"name": "Jane", "email": "jane@example.com"}' })

        const response = await POST(request as never)
        expect(response.status).toBe(200)
      })
    })

    describe('Successful Analysis', () => {
      it('should return complete analysis for simple object', async () => {
        const mockAnalysis = {
          summary: 'This JSON represents a user profile with basic personal information.',
          structure: 'Single-level flat object with 3 string fields and 1 numeric field.',
          patterns: ['Uses camelCase naming convention, all primitive types.'],
          insights: ['Consider adding validation for email format and age range.'],
          relationships: ['Name and email are independent, age could be derived from birthDate.'],
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonData: {
              name: 'John Doe',
              email: 'john@example.com',
              age: 30,
            },
          }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary).toBe(mockAnalysis.summary)
        expect(data.structure).toBe(mockAnalysis.structure)
        expect(data.patterns).toEqual(mockAnalysis.patterns)
        expect(data.insights).toEqual(mockAnalysis.insights)
        expect(data.relationships).toEqual(mockAnalysis.relationships)
        expect(data.usage).toBeDefined()
      })

      it('should normalize string analysis sections into arrays', async () => {
        const mockAnalysis = {
          summary: 'This JSON represents a user profile with basic personal information.',
          structure: 'Single-level flat object with 3 string fields and 1 numeric field.',
          patterns: 'Uses camelCase naming convention, all primitive types.',
          insights: 'Consider adding validation for email format and age range.',
          relationships: 'Name and email are independent, age could be derived from birthDate.',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        })

        const request = createRequest({
          jsonData: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 30,
          },
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.patterns).toEqual([mockAnalysis.patterns])
        expect(data.insights).toEqual([mockAnalysis.insights])
        expect(data.relationships).toEqual([mockAnalysis.relationships])
      })

      it('should return complete analysis for nested object', async () => {
        const mockAnalysis = {
          summary: 'E-commerce order with nested product information and customer details.',
          structure: 'Two-level nesting with arrays for products.',
          patterns: 'Uses UUID for IDs, ISO 8601 timestamps.',
          insights: 'Products array should have validation for quantity > 0.',
          relationships: 'Products linked to order via orderId.',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 150, completion_tokens: 250, total_tokens: 400 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonData: {
              orderId: 'ORD-123',
              customer: {
                name: 'Jane Smith',
                address: { city: 'NYC', zip: '10001' },
              },
              products: [
                { id: 'P1', name: 'Widget', quantity: 2 },
                { id: 'P2', name: 'Gadget', quantity: 1 },
              ],
            },
          }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary).toContain('order')
      })

      it('should call OpenAI with correct parameters', async () => {
        const mockAnalysis = {
          summary: 'Test summary',
          structure: 'Test structure',
          patterns: 'Test patterns',
          insights: 'Test insights',
          relationships: 'Test relationships',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const testJson = { test: 'data', nested: { value: 123 } }

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: testJson }),
        })

        await POST(request as never)

        expect(mockCreate).toHaveBeenCalledTimes(1)
        const callArgs = mockCreate.mock.calls[0][0]
        expect(callArgs.model).toBe('gpt-4o-mini')
        expect(callArgs.max_tokens).toBe(2000)
        expect(callArgs.temperature).toBe(0.7)
        expect(callArgs.response_format).toEqual({ type: 'json_object' })
        expect(callArgs.messages).toHaveLength(2)
        expect(callArgs.messages[0].role).toBe('system')
        expect(callArgs.messages[1].role).toBe('user')
        expect(callArgs.messages[1].content).toContain('"test"')
        expect(callArgs.messages[1].content).toContain('"nested"')
      })

      it('should handle array as root JSON', async () => {
        const mockAnalysis = {
          summary: 'Array of user objects',
          structure: 'Top-level array with consistent object elements',
          patterns: 'Homogeneous array structure',
          insights: 'Consider adding unique identifiers to each element',
          relationships: 'Elements are independent',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonData: [
              { name: 'Alice', age: 25 },
              { name: 'Bob', age: 30 },
            ],
          }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary).toContain('Array')
      })

      it('should provide fallbacks for missing optional fields', async () => {
        const mockAnalysis = {
          summary: 'Basic data summary',
          structure: 'Simple structure',
          // patterns, insights, relationships are missing
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.patterns).toEqual([])
        expect(data.insights).toEqual([])
        expect(data.relationships).toEqual([])
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
          { jsonData: { name: 'John Doe', email: 'john@example.com' } },
          { 'x-forwarded-for': '203.0.113.30' }
        )

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(402)
        expect(data).toEqual({
          status: 'paywall',
          reason: 'quota-exceeded',
          remaining: 0,
        })
        expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
          userId: undefined,
          metricName: 'ai-json-analyzer',
          freeQuotaPerDay: 8,
          ipAddress: '203.0.113.30',
        })
        expect(mockCreate).not.toHaveBeenCalled()
        expect(mockRecordUsage).not.toHaveBeenCalled()
      })

      it('should preserve reserved remaining quota for authenticated free-tier analysis', async () => {
        const mockAnalysis = {
          summary: 'This JSON represents a user profile with basic personal information.',
          structure: 'Single-level flat object with 3 string fields and 1 numeric field.',
          patterns: 'Uses camelCase naming convention, all primitive types.',
          insights: 'Consider adding validation for email format and age range.',
          relationships: 'Name and email are independent, age could be derived from birthDate.',
        }

        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        })

        const request = createRequest(
          { jsonData: { name: 'John Doe', email: 'john@example.com', age: 30 } },
          {
            authorization: 'Bearer valid-token',
            'x-real-ip': '198.51.100.31',
          }
        )

        const response = await POST(request as never)
        const data = await response.json()

        expect(mockGetUser).toHaveBeenCalledWith('valid-token')
        expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
          userId: 'user-123',
          metricName: 'ai-json-analyzer',
          freeQuotaPerDay: 8,
          ipAddress: '198.51.100.31',
        })
        expect(mockRecordUsage).not.toHaveBeenCalled()
        expect(response.status).toBe(200)
        expect(data.remaining).toBe(8)
      })

      it('should allow subscribed users to bypass gating while preserving premium remaining quota', async () => {
        const mockAnalysis = {
          summary: 'Premium access keeps the analyzer available without decrementing free quota.',
          structure: 'Simple flat object with premium metadata.',
          patterns: 'Uses explicit subscription status fields.',
          insights:
            'Premium users still succeed even when free quota would otherwise be exhausted.',
          relationships: 'Subscription status controls gating while metering stays recorded.',
        }

        mockCheckPremiumAccess.mockResolvedValueOnce({
          allowed: true,
          reason: 'subscription',
          remaining: 8,
        })
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
          usage: { prompt_tokens: 90, completion_tokens: 180, total_tokens: 270 },
        })

        const request = createRequest(
          { jsonData: { subscription: 'active', name: 'Premium User' } },
          {
            authorization: 'Bearer premium-token',
            'x-real-ip': '198.51.100.32',
          }
        )

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(mockGetUser).toHaveBeenCalledWith('premium-token')
        expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
          userId: 'user-123',
          metricName: 'ai-json-analyzer',
          freeQuotaPerDay: 8,
          ipAddress: '198.51.100.32',
        })
        expect(mockRecordUsage).toHaveBeenCalledWith({
          userId: 'user-123',
          metricName: 'ai-json-analyzer',
          quantity: 1,
        })
        expect(data.summary).toBe(mockAnalysis.summary)
        expect(data.remaining).toBe(8)
      })
    })

    describe('Error Handling - OpenAI Response Issues', () => {
      it('should return 500 if OpenAI returns no content', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: null } }],
          usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
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

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('No analysis generated')
      })

      it('should return 500 if OpenAI returns invalid JSON', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: 'not valid json' } }],
          usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Failed to parse analysis')
      })

      it('should return 500 if summary is missing from response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  structure: 'Test structure',
                  patterns: 'Test patterns',
                  // summary is missing
                }),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Incomplete analysis response')
      })

      it('should return 500 if structure is missing from response', async () => {
        mockCreate.mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test summary',
                  patterns: 'Test patterns',
                  // structure is missing
                }),
              },
            },
          ],
          usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
        })

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Incomplete analysis response')
      })
    })

    describe('Error Handling - OpenAI API Errors', () => {
      it('should handle OpenAI 401 authentication error', async () => {
        mockCreate.mockRejectedValueOnce(
          new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
        )

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
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

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
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

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(503)
        expect(data.error).toContain('OpenAI API error')
        expect(data.error).toContain('Service unavailable')
      })

      it('should handle generic errors gracefully', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Network error'))

        const request = new Request('http://localhost/api/ai-json-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonData: { test: 'data' } }),
        })

        const response = await POST(request as never)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to analyze JSON. Please try again.')
      })
    })
  })
})
