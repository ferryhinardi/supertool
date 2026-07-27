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

// Helper function to create NextRequest with JSON body
function createRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai-caption', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

// Valid base64 image for testing (minimal PNG)
const validBase64Image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('POST /api/ai-caption', () => {
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

  describe('Premium Gate', () => {
    it('should return 402 paywall response before calling OpenAI when quota is exceeded', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: false,
        reason: 'quota-exceeded',
        remaining: 0,
      })

      const request = createRequest(
        {
          image: validBase64Image,
          captionType: 'detailed',
        },
        {
          'x-forwarded-for': '203.0.113.10',
        }
      )

      const response = await POST(request)
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
        metricName: 'ai-image-caption',
        freeQuotaPerDay: 3,
        ipAddress: '203.0.113.10',
      })
    })

    it('should return 402 paywall response for anonymous-blocked requests before calling OpenAI', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: false,
        reason: 'anonymous-blocked',
        remaining: 0,
      })

      const request = createRequest(
        {
          image: validBase64Image,
          captionType: 'detailed',
        },
        {
          'x-real-ip': '198.51.100.42',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(402)
      expect(data).toEqual({
        status: 'paywall',
        reason: 'anonymous-blocked',
        remaining: 0,
      })
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockRecordUsage).not.toHaveBeenCalled()
      expect(mockGetUser).not.toHaveBeenCalled()
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: undefined,
        metricName: 'ai-image-caption',
        freeQuotaPerDay: 3,
        ipAddress: '198.51.100.42',
      })
    })

    it('should preserve reserved remaining quota for authenticated free-tier caption generation', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Accessible mountain sunset caption' } }],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
      })

      const request = createRequest(
        {
          image: validBase64Image,
          captionType: 'altText',
        },
        {
          authorization: 'Bearer valid-token',
          'x-real-ip': '198.51.100.8',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // checkPremiumAccess reserves the usage via RPC and already returns the
      // post-reservation remaining, so the route must not decrement it again.
      expect(data.remaining).toBe(3)
      expect(mockGetUser).toHaveBeenCalledWith('valid-token')
      expect(mockCheckPremiumAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'ai-image-caption',
        freeQuotaPerDay: 3,
        ipAddress: '198.51.100.8',
      })
      // The reservation RPC records free-tier usage; recordUsage is only for
      // metered subscribers.
      expect(mockRecordUsage).not.toHaveBeenCalled()
    })

    it('should record metered usage for subscribed users after successful caption generation', async () => {
      mockCheckPremiumAccess.mockResolvedValueOnce({
        allowed: true,
        reason: 'subscription',
        remaining: 3,
      })
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Subscriber mountain sunset caption' } }],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
      })

      const request = createRequest(
        {
          image: validBase64Image,
          captionType: 'altText',
        },
        {
          authorization: 'Bearer premium-token',
          'x-real-ip': '198.51.100.9',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockGetUser).toHaveBeenCalledWith('premium-token')
      expect(mockRecordUsage).toHaveBeenCalledWith({
        userId: 'user-123',
        metricName: 'ai-image-caption',
        quantity: 1,
      })
      expect(data.remaining).toBe(3)
    })
  })

  describe('Input Validation', () => {
    it('should return 500 when OPENAI_API_KEY is not configured', async () => {
      delete process.env.OPENAI_API_KEY

      const request = createRequest({ image: validBase64Image })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API key not configured')
    })

    it('should return 400 when image is missing', async () => {
      const request = createRequest({ captionType: 'detailed' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No image provided')
    })

    it('should return 400 when image is empty string', async () => {
      const request = createRequest({ image: '', captionType: 'detailed' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No image provided')
    })

    it('should return 400 when image is not base64 encoded', async () => {
      const request = createRequest({
        image: 'https://example.com/image.png',
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid image format. Must be a base64-encoded image.')
    })

    it('should return 400 when image does not start with data:image/', async () => {
      const request = createRequest({
        image: 'data:application/pdf;base64,JVBERi0xLjQ=',
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid image format. Must be a base64-encoded image.')
    })
  })

  describe('Caption Type Handling', () => {
    it('should use altText prompt when captionType is altText', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A colorful sunset over mountains' } }],
        usage: { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'altText',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A colorful sunset over mountains')

      // Verify the prompt includes alt text specific content
      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages[0].content[0].text).toContain('alt text')
      expect(callArgs.messages[0].content[0].text).toContain('accessibility')
    })

    it('should use detailed prompt when captionType is detailed', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                'A breathtaking sunset paints the sky in hues of orange and purple over a mountain range. The warm light creates dramatic shadows across the peaks.',
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 30, total_tokens: 130 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toContain('breathtaking sunset')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages[0].content[0].text).toContain('detailed')
      expect(callArgs.messages[0].content[0].text).toContain('2-3 sentences')
    })

    it('should use seo prompt when captionType is seo', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                'Mountain sunset photography showing vibrant orange sky and scenic landscape views perfect for travel and nature enthusiasts.',
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'seo',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toContain('Mountain sunset')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages[0].content[0].text).toContain('SEO-optimized')
      expect(callArgs.messages[0].content[0].text).toContain('keywords')
    })

    it('should use social prompt when captionType is social', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Golden hour hits different when the mountains are your backdrop! ✨',
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 15, total_tokens: 115 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'social',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toContain('Golden hour')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages[0].content[0].text).toContain('social media')
      expect(callArgs.messages[0].content[0].text).toContain('engaging')
    })

    it('should default to detailed prompt when captionType is not provided', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A detailed description of the image.' } }],
        usage: { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 },
      })

      const request = createRequest({ image: validBase64Image })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A detailed description of the image.')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.messages[0].content[0].text).toContain('detailed')
    })

    it('should default to detailed prompt when captionType is invalid', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A detailed caption for the image.' } }],
        usage: { prompt_tokens: 100, completion_tokens: 10, total_tokens: 110 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'invalidType',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A detailed caption for the image.')
    })
  })

  describe('OpenAI API Call Configuration', () => {
    it('should call OpenAI with correct model and parameters', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Test caption' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      await POST(request)

      expect(mockCreate).toHaveBeenCalledTimes(1)
      const callArgs = mockCreate.mock.calls[0][0]

      expect(callArgs.model).toBe('gpt-4o-mini')
      expect(callArgs.max_tokens).toBe(300)
      expect(callArgs.temperature).toBe(0.7)
    })

    it('should pass image with correct structure to OpenAI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Test caption' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      await POST(request)

      const callArgs = mockCreate.mock.calls[0][0]
      const content = callArgs.messages[0].content

      expect(content).toHaveLength(2)
      expect(content[0].type).toBe('text')
      expect(content[1].type).toBe('image_url')
      expect(content[1].image_url.url).toBe(validBase64Image)
      expect(content[1].image_url.detail).toBe('low')
    })
  })

  describe('Successful Response', () => {
    it('should return caption and usage on success', async () => {
      const mockUsage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 }
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Beautiful landscape with mountains and sunset' } }],
        usage: mockUsage,
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('Beautiful landscape with mountains and sunset')
      expect(data.usage).toEqual(mockUsage)
    })

    it('should handle different image formats (jpeg)', async () => {
      const jpegImage =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADQABpgA'
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A JPEG image description' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      })

      const request = createRequest({
        image: jpegImage,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A JPEG image description')
    })

    it('should handle different image formats (gif)', async () => {
      const gifImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A GIF image description' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      })

      const request = createRequest({
        image: gifImage,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A GIF image description')
    })

    it('should handle different image formats (webp)', async () => {
      const webpImage = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'A WebP image description' } }],
        usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
      })

      const request = createRequest({
        image: webpImage,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.caption).toBe('A WebP image description')
    })
  })

  describe('Empty Caption Handling', () => {
    it('should return 500 when OpenAI returns empty caption', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '' } }],
        usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No caption generated')
    })

    it('should return 500 when OpenAI returns null content', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
        usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No caption generated')
    })

    it('should return 500 when OpenAI returns empty choices', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [],
        usage: { prompt_tokens: 50, completion_tokens: 0, total_tokens: 50 },
      })

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('No caption generated')
    })
  })

  describe('OpenAI API Error Handling', () => {
    it('should return 401 when OpenAI returns invalid API key error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(401, { error: 'invalid_api_key' }, 'Invalid API key', undefined)
      )

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid OpenAI API key. Please check your configuration.')
    })

    it('should return 429 when OpenAI returns rate limit error', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(429, { error: 'rate_limit' }, 'Rate limit exceeded', undefined)
      )

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded. Please try again later.')
    })

    it('should return appropriate status for other OpenAI API errors', async () => {
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(503, { error: 'service_unavailable' }, 'Service unavailable', undefined)
      )

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('OpenAI API error: Service unavailable')
    })

    it('should return 500 for OpenAI API errors without status', async () => {
      // Create error with status 0 which should fall through to default 500
      mockCreate.mockRejectedValueOnce(
        new OpenAI.APIError(0, { error: 'unknown' }, 'Unknown error', undefined)
      )

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('OpenAI API error')
    })
  })

  describe('Generic Error Handling', () => {
    it('should return 500 for non-OpenAI errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate caption. Please try again.')
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate caption. Please try again.')
    })

    it('should handle unexpected error types', async () => {
      mockCreate.mockRejectedValueOnce('string error')

      const request = createRequest({
        image: validBase64Image,
        captionType: 'detailed',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate caption. Please try again.')
    })
  })
})
