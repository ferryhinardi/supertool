import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase
const mockSingle = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth/supabaseServer', () => ({
  getSupabaseServer: () => ({
    from: mockFrom,
  }),
}))

// Import after mocking
import { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } from '../route'

describe('Webhooks [id] API', () => {
  const mockEndpoint = {
    id: 'endpoint-123',
    user_id: 'user-123',
    name: 'Test Webhook',
    is_active: true,
    expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    response_status_code: 200,
    response_body: { success: true, message: 'Webhook received' },
    response_headers: { 'Content-Type': 'application/json' },
  }

  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  })

  const createMockRequest = (
    method: string,
    body?: Record<string, unknown>,
    headers: Record<string, string> = {},
    searchParams: Record<string, string> = {}
  ) => {
    const url = new URL('http://localhost:3000/api/webhooks/endpoint-123')
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }

    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      ...headers,
    })

    if (body && method !== 'GET' && method !== 'HEAD') {
      return new NextRequest(url.toString(), {
        method,
        headers: requestHeaders,
        body: JSON.stringify(body),
      })
    }

    return new NextRequest(url.toString(), {
      method,
      headers: requestHeaders,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Endpoint Not Found', () => {
    it('should return 404 if endpoint does not exist', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('non-existent-id'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Webhook endpoint not found')
    })

    it('should return 404 if endpoint data is null', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Webhook endpoint not found')
    })
  })

  describe('Endpoint Status Checks', () => {
    it('should return 410 if endpoint is inactive', async () => {
      const inactiveEndpoint = { ...mockEndpoint, is_active: false }

      mockSingle.mockResolvedValue({ data: inactiveEndpoint, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(response.status).toBe(410)
      expect(data.error).toBe('Webhook endpoint is inactive')
    })

    it('should return 410 if endpoint has expired', async () => {
      const expiredEndpoint = {
        ...mockEndpoint,
        expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      }

      mockSingle.mockResolvedValue({ data: expiredEndpoint, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(response.status).toBe(410)
      expect(data.error).toBe('Webhook endpoint has expired')
    })
  })

  describe('Successful Requests', () => {
    beforeEach(() => {
      // Setup successful endpoint fetch
      mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      // Insert for logging returns success
      mockInsert.mockResolvedValue({ data: null, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })
    })

    it('should handle GET request and return configured response', async () => {
      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Webhook received')
    })

    it('should handle POST request with JSON body', async () => {
      const request = createMockRequest('POST', { key: 'value', nested: { data: true } })
      const response = await POST(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint_id: 'endpoint-123',
          method: 'POST',
          body: JSON.stringify({ key: 'value', nested: { data: true } }),
        })
      )
    })

    it('should handle PUT request', async () => {
      const request = createMockRequest('PUT', { updated: 'data' })
      const response = await PUT(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('should handle PATCH request', async () => {
      const request = createMockRequest('PATCH', { patched: 'field' })
      const response = await PATCH(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })

    it('should handle DELETE request', async () => {
      const request = createMockRequest('DELETE')
      const response = await DELETE(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('should handle HEAD request without body', async () => {
      const request = createMockRequest('HEAD')
      const response = await HEAD(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'HEAD',
          body: null,
        })
      )
    })

    it('should handle OPTIONS request', async () => {
      const request = createMockRequest('OPTIONS')
      const response = await OPTIONS(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
    })

    it('should capture query parameters', async () => {
      const request = createMockRequest('GET', undefined, {}, { foo: 'bar', baz: 'qux' })
      await GET(request, createContext('endpoint-123'))

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          query_params: { foo: 'bar', baz: 'qux' },
        })
      )
    })

    it('should capture request headers', async () => {
      const request = createMockRequest('GET', undefined, {
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      })
      await GET(request, createContext('endpoint-123'))

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-custom-header': 'custom-value',
            'x-another-header': 'another-value',
          }),
        })
      )
    })

    it('should capture IP address from x-forwarded-for header', async () => {
      const request = createMockRequest('GET', undefined, {
        'x-forwarded-for': '192.168.1.1',
      })
      await GET(request, createContext('endpoint-123'))

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ip_address: '192.168.1.1',
        })
      )
    })

    it('should capture user agent', async () => {
      const request = createMockRequest('GET', undefined, {
        'user-agent': 'Mozilla/5.0 Test Browser',
      })
      await GET(request, createContext('endpoint-123'))

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_agent: 'Mozilla/5.0 Test Browser',
        })
      )
    })

    it('should return custom status code from endpoint config', async () => {
      const customEndpoint = { ...mockEndpoint, response_status_code: 201 }
      mockSingle.mockResolvedValue({ data: customEndpoint, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })

      const request = createMockRequest('POST', { data: 'test' })
      const response = await POST(request, createContext('endpoint-123'))

      expect(response.status).toBe(201)
    })

    it('should return custom response body from endpoint config', async () => {
      const customEndpoint = { ...mockEndpoint, response_body: { custom: 'response', code: 42 } }
      mockSingle.mockResolvedValue({ data: customEndpoint, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(data.custom).toBe('response')
      expect(data.code).toBe(42)
    })

    it('should set custom response headers from endpoint config', async () => {
      const customEndpoint = {
        ...mockEndpoint,
        response_headers: { 'X-Custom-Response': 'header-value' },
      }
      mockSingle.mockResolvedValue({ data: customEndpoint, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))

      expect(response.headers.get('X-Custom-Response')).toBe('header-value')
    })
  })

  describe('Logging', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
    })

    it('should continue even if logging fails', async () => {
      // Logging returns error but response should still succeed
      mockInsert.mockResolvedValue({ data: null, error: { message: 'Log failed' } })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))

      expect(response.status).toBe(200)
      expect(consoleSpy).toHaveBeenCalledWith('Error logging webhook request:', {
        message: 'Log failed',
      })

      consoleSpy.mockRestore()
    })

    it('should calculate body size correctly', async () => {
      mockInsert.mockResolvedValue({ data: null, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })

      const testBody = { test: 'data', number: 123 }
      const request = createMockRequest('POST', testBody)
      await POST(request, createContext('endpoint-123'))

      const expectedSize = new TextEncoder().encode(JSON.stringify(testBody)).length
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          body_size: expectedSize,
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for unexpected errors', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected database error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest('GET')
      const response = await GET(request, createContext('endpoint-123'))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')

      consoleSpy.mockRestore()
    })
  })

  describe('Form Data Handling', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockInsert.mockResolvedValue({ data: null, error: null })
      mockFrom.mockImplementation((table: string) => {
        if (table === 'webhook_endpoints') {
          return { select: mockSelect }
        }
        if (table === 'webhook_requests') {
          return { insert: mockInsert }
        }
        return {}
      })
    })

    it('should handle plain text body', async () => {
      const url = new URL('http://localhost:3000/api/webhooks/endpoint-123')
      const request = new NextRequest(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Plain text body content',
      })

      await POST(request, createContext('endpoint-123'))

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Plain text body content',
        })
      )
    })
  })
})
