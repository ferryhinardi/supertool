import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '../route'

// Store original env and fetch
const originalEnv = process.env
const originalFetch = global.fetch

describe('Screenshot API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env = { ...originalEnv, SCREENSHOTONE_ACCESS_KEY: 'test-api-key' }
    global.fetch = vi.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  function createRequest(body: Record<string, unknown>): NextRequest {
    return new NextRequest('http://localhost:3000/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  describe('Validation', () => {
    it('should return 400 if URL is missing', async () => {
      const request = createRequest({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('URL is required')
    })

    it('should return 400 if URL format is invalid', async () => {
      const request = createRequest({ url: 'not-a-valid-url' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid URL format')
    })
  })

  describe('Configuration', () => {
    it('should return 500 if SCREENSHOTONE_ACCESS_KEY is not configured', async () => {
      delete process.env.SCREENSHOTONE_ACCESS_KEY

      const request = createRequest({ url: 'https://example.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Screenshot service is not configured')
    })
  })

  describe('Screenshot Capture', () => {
    it('should return screenshot image on success', async () => {
      const mockImageBuffer = Buffer.from('fake-png-data')
      const mockArrayBuffer = mockImageBuffer.buffer.slice(
        mockImageBuffer.byteOffset,
        mockImageBuffer.byteOffset + mockImageBuffer.byteLength
      )

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      } as Response)

      const request = createRequest({ url: 'https://example.com' })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('image/png')
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledOnce()
      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const fetchUrl = new URL(fetchCall[0] as string)

      expect(fetchUrl.origin).toBe('https://api.screenshotone.com')
      expect(fetchUrl.pathname).toBe('/take')
      expect(fetchUrl.searchParams.get('access_key')).toBe('test-api-key')
      expect(fetchUrl.searchParams.get('url')).toBe('https://example.com')
      expect(fetchUrl.searchParams.get('format')).toBe('png')
    })

    it('should use default dimensions when not provided', async () => {
      const mockImageBuffer = Buffer.from('fake-png-data')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () =>
          Promise.resolve(
            mockImageBuffer.buffer.slice(
              mockImageBuffer.byteOffset,
              mockImageBuffer.byteOffset + mockImageBuffer.byteLength
            )
          ),
      } as Response)

      const request = createRequest({ url: 'https://example.com' })
      await POST(request)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const fetchUrl = new URL(fetchCall[0] as string)

      expect(fetchUrl.searchParams.get('viewport_width')).toBe('1920')
      expect(fetchUrl.searchParams.get('viewport_height')).toBe('1080')
    })

    it('should use custom dimensions when provided', async () => {
      const mockImageBuffer = Buffer.from('fake-png-data')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () =>
          Promise.resolve(
            mockImageBuffer.buffer.slice(
              mockImageBuffer.byteOffset,
              mockImageBuffer.byteOffset + mockImageBuffer.byteLength
            )
          ),
      } as Response)

      const request = createRequest({
        url: 'https://example.com',
        width: 1280,
        height: 720,
      })
      await POST(request)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const fetchUrl = new URL(fetchCall[0] as string)

      expect(fetchUrl.searchParams.get('viewport_width')).toBe('1280')
      expect(fetchUrl.searchParams.get('viewport_height')).toBe('720')
    })

    it('should enable full page capture when fullPage is true', async () => {
      const mockImageBuffer = Buffer.from('fake-png-data')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () =>
          Promise.resolve(
            mockImageBuffer.buffer.slice(
              mockImageBuffer.byteOffset,
              mockImageBuffer.byteOffset + mockImageBuffer.byteLength
            )
          ),
      } as Response)

      const request = createRequest({
        url: 'https://example.com',
        fullPage: true,
      })
      await POST(request)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const fetchUrl = new URL(fetchCall[0] as string)

      expect(fetchUrl.searchParams.get('full_page')).toBe('true')
    })

    it('should not include full_page param when fullPage is false', async () => {
      const mockImageBuffer = Buffer.from('fake-png-data')
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () =>
          Promise.resolve(
            mockImageBuffer.buffer.slice(
              mockImageBuffer.byteOffset,
              mockImageBuffer.byteOffset + mockImageBuffer.byteLength
            )
          ),
      } as Response)

      const request = createRequest({
        url: 'https://example.com',
        fullPage: false,
      })
      await POST(request)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const fetchUrl = new URL(fetchCall[0] as string)

      expect(fetchUrl.searchParams.has('full_page')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should return error status when screenshot service fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response)

      const request = createRequest({ url: 'https://example.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Screenshot service returned 403')
    })

    it('should return 500 on fetch network error', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const request = createRequest({ url: 'https://example.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Network error')
    })

    it('should return generic error message for non-Error exceptions', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce('String error')

      const request = createRequest({ url: 'https://example.com' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to capture screenshot')
    })
  })
})
