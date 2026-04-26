import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock OpenAI with vi.hoisted to ensure it's hoisted before imports
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

import { POST } from '../route'

// Helper function to create NextRequest with JSON body
function createRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai-cover-letter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-cover-letter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-api-key' }
    mockCheckPremiumAccess.mockResolvedValue({
      allowed: true,
      reason: 'within-quota',
      remaining: 3,
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

  describe('Input Validation', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Software Engineer' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })

    it('should return 400 when action is missing', async () => {
      const request = createRequest({ data: { position: 'Developer' } })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No action provided')
    })

    it('should return 400 when action is empty string', async () => {
      const request = createRequest({ action: '', data: {} })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No action provided')
    })

    it('should return 400 when action is invalid', async () => {
      const request = createRequest({ action: 'invalid-action', data: {} })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
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
          action: 'generate-opening',
          data: { position: 'Software Engineer', companyName: 'Acme' },
        },
        { 'x-forwarded-for': '203.0.113.40' }
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
        metricName: 'cover-letter-builder',
        freeQuotaPerDay: 3,
        ipAddress: '203.0.113.40',
      })
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRecordUsage).not.toHaveBeenCalled()
    })

    it('should record usage after a successful authenticated AI request and return remaining quota', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Premium-safe opening.' }) } }],
        usage: { prompt_tokens: 90, completion_tokens: 120, total_tokens: 210 },
      })

      const request = createRequest(
        {
          action: 'generate-opening',
          data: {
            position: 'Software Engineer',
            companyName: 'Acme',
            fullName: 'John Doe',
          },
        },
        {
          authorization: 'Bearer valid-token',
          'x-real-ip': '198.51.100.41',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockGetUser).toHaveBeenCalledWith('valid-token')
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'cover-letter-builder',
        freeQuotaPerDay: 3,
        ipAddress: '198.51.100.41',
      })
      expect(mockRecordUsage).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'cover-letter-builder',
        quantity: 1,
      })
      expect(data.remaining).toBe(2)
    })

    it('should allow subscribed users to bypass quota checks without decrementing remaining', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: true,
        reason: 'subscription',
        remaining: 3,
      })
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Subscribed opening.' }) } }],
        usage: { prompt_tokens: 50, completion_tokens: 80, total_tokens: 130 },
      })

      const request = createRequest(
        {
          action: 'generate-opening',
          data: { position: 'Staff Engineer', companyName: 'Acme' },
        },
        {
          authorization: 'Bearer premium-token',
          'x-real-ip': '198.51.100.42',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockGetUser).toHaveBeenCalledWith('premium-token')
      expect(mockRecordUsage).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'cover-letter-builder',
        quantity: 1,
      })
      expect(data.remaining).toBe(3)
    })
  })

  describe('generate-opening action', () => {
    it('should generate an opening paragraph successfully', async () => {
      const mockOpening = {
        opening:
          'I am excited to apply for the Software Engineer position at TechCorp. With over 5 years of experience in full-stack development, I am confident I can contribute to your innovative team.',
      }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockOpening) } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: {
          position: 'Software Engineer',
          companyName: 'TechCorp',
          fullName: 'John Doe',
          context: '5 years of full-stack development experience',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.opening).toBe(mockOpening.opening)
    })

    it('should use default values when data fields are missing', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Generic opening.' }) } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: {},
      })
      const response = await POST(request)

      expect(response.status).toBe(200)

      const callArgs = mockCreate.mock.calls[0][0]
      const userContent = callArgs.messages[1].content
      expect(userContent).toContain('the position')
      expect(userContent).toContain('the company')
      expect(userContent).toContain('the candidate')
      expect(userContent).toContain('relevant experience')
    })

    it('should include correct system prompt for opening', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Test opening.' }) } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const systemPrompt = callArgs.messages[0].content
      expect(systemPrompt).toContain('opening paragraph')
      expect(systemPrompt).toContain('2-4 sentences')
      expect(systemPrompt).toContain('enthusiasm')
    })
  })

  describe('generate-body action', () => {
    it('should generate body paragraphs successfully', async () => {
      const mockBody = {
        body: 'Throughout my career, I have led multiple successful projects. My expertise in React and Node.js has enabled me to deliver scalable solutions.\n\nAdditionally, I have mentored junior developers and improved team productivity by 30%.',
      }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockBody) } }],
      })

      const request = createRequest({
        action: 'generate-body',
        data: {
          position: 'Senior Developer',
          companyName: 'InnovateTech',
          department: 'Engineering',
          context: 'Expert in React, Node.js, and team leadership',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.body).toContain('successful projects')
    })

    it('should include correct system prompt for body', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ body: 'Test body.' }) } }],
      })

      const request = createRequest({
        action: 'generate-body',
        data: { position: 'Developer' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const systemPrompt = callArgs.messages[0].content
      expect(systemPrompt).toContain('body paragraphs')
      expect(systemPrompt).toContain('2-3 key achievements')
      expect(systemPrompt).toContain('150-250 words')
    })

    it('should use default values when data fields are missing', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ body: 'Generic body.' }) } }],
      })

      const request = createRequest({
        action: 'generate-body',
        data: {},
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const userContent = callArgs.messages[1].content
      expect(userContent).toContain('the position')
      expect(userContent).toContain('the company')
      expect(userContent).toContain('the team')
      expect(userContent).toContain('relevant experience and skills')
    })
  })

  describe('generate-closing action', () => {
    it('should generate a closing paragraph successfully', async () => {
      const mockClosing = {
        closing:
          'I would welcome the opportunity to discuss how my skills can benefit TechCorp. Thank you for considering my application. I look forward to hearing from you soon.',
      }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockClosing) } }],
      })

      const request = createRequest({
        action: 'generate-closing',
        data: {
          position: 'Product Manager',
          companyName: 'TechCorp',
          hiringManagerName: 'Jane Smith',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.closing).toContain('opportunity')
    })

    it('should include correct system prompt for closing', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ closing: 'Test closing.' }) } }],
      })

      const request = createRequest({
        action: 'generate-closing',
        data: { position: 'Designer' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const systemPrompt = callArgs.messages[0].content
      expect(systemPrompt).toContain('closing paragraph')
      expect(systemPrompt).toContain('2-3 sentences')
      expect(systemPrompt).toContain('gratitude')
    })

    it('should use default values when data fields are missing', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ closing: 'Generic closing.' }) } }],
      })

      const request = createRequest({
        action: 'generate-closing',
        data: {},
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const userContent = callArgs.messages[1].content
      expect(userContent).toContain('the position')
      expect(userContent).toContain('the company')
      expect(userContent).toContain('Hiring Manager')
    })
  })

  describe('improve-content action', () => {
    it('should improve content successfully', async () => {
      const mockImproved = {
        improved:
          'I am an experienced developer who has successfully delivered multiple high-impact projects.',
        suggestions: [
          'Made language more specific',
          'Added quantifiable achievements',
          'Removed passive voice',
        ],
        score: 6,
      }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockImproved) } }],
      })

      const request = createRequest({
        action: 'improve-content',
        data: {
          content: 'I am a developer who has done projects.',
          position: 'Senior Developer',
          companyName: 'TechCorp',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.improved).toContain('experienced developer')
      expect(data.data.suggestions).toHaveLength(3)
      expect(data.data.score).toBe(6)
    })

    it('should include correct system prompt for improve-content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ improved: 'Better text', suggestions: [], score: 7 }),
            },
          },
        ],
      })

      const request = createRequest({
        action: 'improve-content',
        data: { content: 'Original text' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const systemPrompt = callArgs.messages[0].content
      expect(systemPrompt).toContain('expert editor')
      expect(systemPrompt).toContain('Strengthening weak language')
      expect(systemPrompt).toContain('score')
    })
  })

  describe('check-tone action', () => {
    it('should analyze tone successfully', async () => {
      const mockToneAnalysis = {
        tone: 'professional and enthusiastic',
        score: 8,
        suggestions: ['Could be slightly more specific', 'Consider adding more industry keywords'],
        strengths: ['Good balance of confidence and humility'],
      }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockToneAnalysis) } }],
      })

      const request = createRequest({
        action: 'check-tone',
        data: {
          content:
            'I am thrilled to apply for this position. My experience makes me an ideal candidate.',
          companyName: 'TechCorp',
          department: 'Engineering',
        },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.tone).toBe('professional and enthusiastic')
      expect(data.data.score).toBe(8)
      expect(data.data.suggestions).toHaveLength(2)
      expect(data.data.strengths).toHaveLength(1)
    })

    it('should include correct system prompt for check-tone', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tone: 'formal',
                score: 7,
                suggestions: [],
                strengths: [],
              }),
            },
          },
        ],
      })

      const request = createRequest({
        action: 'check-tone',
        data: { content: 'Test content' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const systemPrompt = callArgs.messages[0].content
      expect(systemPrompt).toContain('Analyze the tone')
      expect(systemPrompt).toContain('score')
      expect(systemPrompt).toContain('suggestions')
      expect(systemPrompt).toContain('strengths')
    })

    it('should use default values when data fields are missing', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tone: 'neutral',
                score: 5,
                suggestions: [],
                strengths: [],
              }),
            },
          },
        ],
      })

      const request = createRequest({
        action: 'check-tone',
        data: { content: 'Some content' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const userContent = callArgs.messages[1].content
      expect(userContent).toContain('corporate')
      expect(userContent).toContain('general')
    })
  })

  describe('OpenAI API Configuration', () => {
    it('should call OpenAI with correct model and parameters', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Test opening.' }) } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      await POST(request)

      expect(mockCreate).toHaveBeenCalledTimes(1)
      const callArgs = mockCreate.mock.calls[0][0]

      expect(callArgs.model).toBe('gpt-4o-mini')
      expect(callArgs.temperature).toBe(0.7)
      expect(callArgs.response_format).toEqual({ type: 'json_object' })
    })

    it('should include system and user messages', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ opening: 'Test.' }) } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages).toHaveLength(2)
      expect(callArgs.messages[0].role).toBe('system')
      expect(callArgs.messages[1].role).toBe('user')
    })
  })

  describe('Response Handling', () => {
    it('should return 500 when OpenAI returns no content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No response from AI')
    })

    it('should return 500 when OpenAI returns empty content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '' } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No response from AI')
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when OpenAI throws an error', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'))

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('API Error')
    })

    it('should handle JSON parse errors gracefully', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'not valid json' } }],
      })

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBeDefined()
    })

    it('should handle request JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBeDefined()
    })

    it('should return generic error message for non-Error exceptions', async () => {
      mockCreate.mockRejectedValueOnce('string error')

      const request = createRequest({
        action: 'generate-opening',
        data: { position: 'Developer' },
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate content')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete cover letter generation workflow', async () => {
      // Generate opening
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                opening: 'I am excited to apply for the position at TechCorp.',
              }),
            },
          },
        ],
      })

      const openingRequest = createRequest({
        action: 'generate-opening',
        data: {
          position: 'Software Engineer',
          companyName: 'TechCorp',
        },
      })
      const openingResponse = await POST(openingRequest)
      const openingData = await openingResponse.json()
      expect(openingData.success).toBe(true)

      // Generate body
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                body: 'I have extensive experience in software development...',
              }),
            },
          },
        ],
      })

      const bodyRequest = createRequest({
        action: 'generate-body',
        data: {
          position: 'Software Engineer',
          companyName: 'TechCorp',
        },
      })
      const bodyResponse = await POST(bodyRequest)
      const bodyData = await bodyResponse.json()
      expect(bodyData.success).toBe(true)

      // Generate closing
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                closing: 'Thank you for your consideration.',
              }),
            },
          },
        ],
      })

      const closingRequest = createRequest({
        action: 'generate-closing',
        data: {
          position: 'Software Engineer',
          companyName: 'TechCorp',
        },
      })
      const closingResponse = await POST(closingRequest)
      const closingData = await closingResponse.json()
      expect(closingData.success).toBe(true)
    })

    it('should handle content improvement and tone check workflow', async () => {
      const content = 'I am a developer who wants this job.'

      // Improve content
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                improved: 'As an experienced developer, I am eager to contribute to your team.',
                suggestions: ['Made language more professional'],
                score: 5,
              }),
            },
          },
        ],
      })

      const improveRequest = createRequest({
        action: 'improve-content',
        data: { content },
      })
      const improveResponse = await POST(improveRequest)
      const improveData = await improveResponse.json()
      expect(improveData.success).toBe(true)
      expect(improveData.data.score).toBe(5)

      // Check tone of improved content
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                tone: 'professional',
                score: 8,
                suggestions: ['Good improvement'],
                strengths: ['Clear and concise'],
              }),
            },
          },
        ],
      })

      const toneRequest = createRequest({
        action: 'check-tone',
        data: { content: improveData.data.improved },
      })
      const toneResponse = await POST(toneRequest)
      const toneData = await toneResponse.json()
      expect(toneData.success).toBe(true)
      expect(toneData.data.score).toBe(8)
    })
  })
})
