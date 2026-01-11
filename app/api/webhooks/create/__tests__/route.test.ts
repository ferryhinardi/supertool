import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Supabase
const mockSingle = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockOrder = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth/supabaseServer', () => ({
  getSupabaseServer: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

// Import after mocking
import { GET, POST } from '../route'

describe('Webhooks Create API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
    headers: Record<string, string> = {}
  ) => {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      ...headers,
    })

    if (body) {
      return new NextRequest('http://localhost:3000/api/webhooks/create', {
        method,
        headers: requestHeaders,
        body: JSON.stringify(body),
      })
    }

    return new NextRequest('http://localhost:3000/api/webhooks/create', {
      method,
      headers: requestHeaders,
    })
  }

  describe('POST /api/webhooks/create', () => {
    describe('Authentication', () => {
      it('should return 401 if no authorization header', async () => {
        const request = createMockRequest('POST', { name: 'Test Webhook' })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 401 if token is invalid', async () => {
        mockGetUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' },
        })

        const request = createMockRequest(
          'POST',
          { name: 'Test Webhook' },
          { authorization: 'Bearer invalid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
      })

      it('should return 401 if user is not found', async () => {
        mockGetUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        const request = createMockRequest(
          'POST',
          { name: 'Test Webhook' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
      })
    })

    describe('Validation', () => {
      beforeEach(() => {
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        })
      })

      it('should return 400 if name is missing', async () => {
        const request = createMockRequest('POST', {}, { authorization: 'Bearer valid-token' })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name is required')
      })

      it('should return 400 if name is empty string', async () => {
        const request = createMockRequest(
          'POST',
          { name: '' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name is required')
      })

      it('should return 400 if name is whitespace only', async () => {
        const request = createMockRequest(
          'POST',
          { name: '   ' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name is required')
      })

      it('should return 400 if name is longer than 100 characters', async () => {
        const request = createMockRequest(
          'POST',
          { name: 'a'.repeat(101) },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name must be less than 100 characters')
      })
    })

    describe('Successful Creation', () => {
      beforeEach(() => {
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        })
      })

      it('should create webhook endpoint with minimal data', async () => {
        const mockEndpoint = {
          id: 'endpoint-123',
          user_id: 'user-123',
          name: 'Test Webhook',
          description: null,
          response_status_code: 200,
          response_body: { success: true, message: 'Webhook received' },
          response_headers: { 'Content-Type': 'application/json' },
          is_active: true,
        }

        mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
        mockSelect.mockReturnValue({ single: mockSingle })
        mockInsert.mockReturnValue({ select: mockSelect })
        mockFrom.mockReturnValue({ insert: mockInsert })

        const request = createMockRequest(
          'POST',
          { name: 'Test Webhook' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.id).toBe('endpoint-123')
        expect(data.name).toBe('Test Webhook')
        expect(mockInsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          name: 'Test Webhook',
          description: null,
          response_status_code: 200,
          response_body: { success: true, message: 'Webhook received' },
          response_headers: { 'Content-Type': 'application/json' },
          is_active: true,
        })
      })

      it('should create webhook endpoint with all optional fields', async () => {
        const mockEndpoint = {
          id: 'endpoint-456',
          user_id: 'user-123',
          name: 'Custom Webhook',
          description: 'My custom webhook',
          response_status_code: 201,
          response_body: { custom: 'response' },
          response_headers: { 'X-Custom': 'header' },
          is_active: true,
        }

        mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
        mockSelect.mockReturnValue({ single: mockSingle })
        mockInsert.mockReturnValue({ select: mockSelect })
        mockFrom.mockReturnValue({ insert: mockInsert })

        const request = createMockRequest(
          'POST',
          {
            name: 'Custom Webhook',
            description: 'My custom webhook',
            response_status_code: 201,
            response_body: { custom: 'response' },
            response_headers: { 'X-Custom': 'header' },
          },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.name).toBe('Custom Webhook')
        expect(data.description).toBe('My custom webhook')
        expect(data.response_status_code).toBe(201)
      })

      it('should trim name and description', async () => {
        const mockEndpoint = {
          id: 'endpoint-789',
          user_id: 'user-123',
          name: 'Trimmed Name',
          description: 'Trimmed Desc',
          is_active: true,
        }

        mockSingle.mockResolvedValue({ data: mockEndpoint, error: null })
        mockSelect.mockReturnValue({ single: mockSingle })
        mockInsert.mockReturnValue({ select: mockSelect })
        mockFrom.mockReturnValue({ insert: mockInsert })

        const request = createMockRequest(
          'POST',
          { name: '  Trimmed Name  ', description: '  Trimmed Desc  ' },
          { authorization: 'Bearer valid-token' }
        )

        await POST(request)

        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Trimmed Name',
            description: 'Trimmed Desc',
          })
        )
      })
    })

    describe('Error Handling', () => {
      beforeEach(() => {
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        })
      })

      it('should return 500 if database insert fails', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } })
        mockSelect.mockReturnValue({ single: mockSingle })
        mockInsert.mockReturnValue({ select: mockSelect })
        mockFrom.mockReturnValue({ insert: mockInsert })

        const request = createMockRequest(
          'POST',
          { name: 'Test Webhook' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to create webhook endpoint')
      })

      it('should return 500 for unexpected errors', async () => {
        mockFrom.mockImplementation(() => {
          throw new Error('Unexpected error')
        })

        const request = createMockRequest(
          'POST',
          { name: 'Test Webhook' },
          { authorization: 'Bearer valid-token' }
        )

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('GET /api/webhooks/create', () => {
    describe('Authentication', () => {
      it('should return 401 if no authorization header', async () => {
        const request = createMockRequest('GET')

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 401 if token is invalid', async () => {
        mockGetUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' },
        })

        const request = createMockRequest('GET', undefined, {
          authorization: 'Bearer invalid-token',
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Invalid authentication token')
      })
    })

    describe('Successful Fetch', () => {
      beforeEach(() => {
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        })
      })

      it('should return list of webhook endpoints', async () => {
        const mockEndpoints = [
          { id: 'endpoint-1', name: 'Webhook 1', user_id: 'user-123' },
          { id: 'endpoint-2', name: 'Webhook 2', user_id: 'user-123' },
        ]

        mockOrder.mockResolvedValue({ data: mockEndpoints, error: null })
        mockEq.mockReturnValue({ order: mockOrder })
        mockSelect.mockReturnValue({ eq: mockEq })
        mockFrom.mockReturnValue({ select: mockSelect })

        const request = createMockRequest('GET', undefined, { authorization: 'Bearer valid-token' })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveLength(2)
        expect(data[0].name).toBe('Webhook 1')
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      })

      it('should return empty array if no endpoints', async () => {
        mockOrder.mockResolvedValue({ data: [], error: null })
        mockEq.mockReturnValue({ order: mockOrder })
        mockSelect.mockReturnValue({ eq: mockEq })
        mockFrom.mockReturnValue({ select: mockSelect })

        const request = createMockRequest('GET', undefined, { authorization: 'Bearer valid-token' })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toEqual([])
      })
    })

    describe('Error Handling', () => {
      beforeEach(() => {
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        })
      })

      it('should return 500 if database fetch fails', async () => {
        mockOrder.mockResolvedValue({ data: null, error: { message: 'Database error' } })
        mockEq.mockReturnValue({ order: mockOrder })
        mockSelect.mockReturnValue({ eq: mockEq })
        mockFrom.mockReturnValue({ select: mockSelect })

        const request = createMockRequest('GET', undefined, { authorization: 'Bearer valid-token' })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to fetch webhook endpoints')
      })

      it('should return 500 for unexpected errors', async () => {
        mockFrom.mockImplementation(() => {
          throw new Error('Unexpected error')
        })

        const request = createMockRequest('GET', undefined, { authorization: 'Bearer valid-token' })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })
})
