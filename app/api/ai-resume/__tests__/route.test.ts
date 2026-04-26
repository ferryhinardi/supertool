import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreate = vi.hoisted(() => vi.fn())
const mockCheckPremiumAccess = vi.hoisted(() => vi.fn())
const mockRecordUsage = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('openai', () => ({
  default: class OpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  },
}))

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

function createRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai-resume', () => {
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

  it('should return 402 paywall response before calling OpenAI when quota is exceeded', async () => {
    mockCheckPremiumAccess.mockResolvedValueOnce({
      allowed: false,
      reason: 'quota-exceeded',
      remaining: 0,
    })

    const request = createRequest(
      {
        type: 'summary',
        context: {
          role: 'Software Engineer',
          currentContent: 'Existing summary',
        },
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
      metricName: 'resume-builder',
      freeQuotaPerDay: 3,
      ipAddress: '203.0.113.40',
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockRecordUsage).not.toHaveBeenCalled()
  })

  it('should record usage after a successful authenticated AI request and return remaining quota', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: ['Tailored summary'],
              keywords: ['TypeScript', 'Leadership'],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 90, completion_tokens: 120, total_tokens: 210 },
    })

    const request = createRequest(
      {
        type: 'summary',
        context: {
          role: 'Software Engineer',
          currentContent: 'Existing summary',
          skills: ['TypeScript', 'React'],
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
      metricName: 'resume-builder',
      freeQuotaPerDay: 3,
      ipAddress: '198.51.100.41',
    })
    expect(mockRecordUsage).toHaveBeenCalledWith({
      userId: 'user-123',
      metricName: 'resume-builder',
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
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: ['Subscribed summary'],
              keywords: ['Architecture'],
            }),
          },
        },
      ],
      usage: { prompt_tokens: 50, completion_tokens: 80, total_tokens: 130 },
    })

    const request = createRequest(
      {
        type: 'summary',
        context: {
          role: 'Staff Engineer',
          currentContent: 'Existing summary',
        },
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
      metricName: 'resume-builder',
      quantity: 1,
    })
    expect(data.remaining).toBe(3)
  })

  it('should generate resume AI suggestions successfully', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: ['Strong summary'],
              keywords: ['React', 'Leadership'],
              improvements: ['Add measurable impact'],
            }),
          },
        },
      ],
    })

    const request = createRequest({
      type: 'summary',
      context: {
        role: 'Software Engineer',
        currentContent: 'Existing summary',
        yearsOfExperience: 6,
        skills: ['TypeScript', 'React'],
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.suggestions).toEqual(['Strong summary'])
    expect(data.data.keywords).toEqual(['React', 'Leadership'])
    expect(data.data.improvements).toEqual(['Add measurable impact'])
  })
})
