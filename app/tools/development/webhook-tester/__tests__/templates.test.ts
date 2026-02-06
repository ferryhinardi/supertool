import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type CreateEndpointRequest,
  formatBytes,
  formatRelativeTime,
  formatWebhookUrl,
  generateCurlCommand,
  HTTP_METHODS,
  type HttpMethod,
  isValidJson,
  prettyPrintJson,
  RESPONSE_TEMPLATES,
  type UpdateEndpointRequest,
  type WebhookEndpoint,
  type WebhookRequest,
} from '../templates'

describe('webhook-tester templates', () => {
  // ============================================
  // HTTP_METHODS constant tests
  // ============================================
  describe('HTTP_METHODS', () => {
    it('should contain all standard HTTP methods', () => {
      expect(HTTP_METHODS).toContain('GET')
      expect(HTTP_METHODS).toContain('POST')
      expect(HTTP_METHODS).toContain('PUT')
      expect(HTTP_METHODS).toContain('PATCH')
      expect(HTTP_METHODS).toContain('DELETE')
      expect(HTTP_METHODS).toContain('HEAD')
      expect(HTTP_METHODS).toContain('OPTIONS')
    })

    it('should have exactly 7 methods', () => {
      expect(HTTP_METHODS).toHaveLength(7)
    })

    it('should be a readonly array', () => {
      // TypeScript ensures this at compile time, but we verify structure
      expect(Array.isArray(HTTP_METHODS)).toBe(true)
    })
  })

  // ============================================
  // RESPONSE_TEMPLATES constant tests
  // ============================================
  describe('RESPONSE_TEMPLATES', () => {
    it('should contain 6 response templates', () => {
      expect(RESPONSE_TEMPLATES).toHaveLength(6)
    })

    it('should have success template with correct values', () => {
      const successTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'success')
      expect(successTemplate).toBeDefined()
      expect(successTemplate?.name).toBe('Success (200)')
      expect(successTemplate?.statusCode).toBe(200)
      expect(successTemplate?.body).toEqual({ success: true, message: 'Webhook received' })
    })

    it('should have accepted template with correct values', () => {
      const acceptedTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'accepted')
      expect(acceptedTemplate).toBeDefined()
      expect(acceptedTemplate?.name).toBe('Accepted (202)')
      expect(acceptedTemplate?.statusCode).toBe(202)
      expect(acceptedTemplate?.body).toEqual({
        success: true,
        message: 'Request accepted for processing',
      })
    })

    it('should have bad_request template with correct values', () => {
      const badRequestTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'bad_request')
      expect(badRequestTemplate).toBeDefined()
      expect(badRequestTemplate?.name).toBe('Bad Request (400)')
      expect(badRequestTemplate?.statusCode).toBe(400)
      expect(badRequestTemplate?.body).toEqual({ error: 'Bad request', message: 'Invalid payload' })
    })

    it('should have unauthorized template with correct values', () => {
      const unauthorizedTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'unauthorized')
      expect(unauthorizedTemplate).toBeDefined()
      expect(unauthorizedTemplate?.name).toBe('Unauthorized (401)')
      expect(unauthorizedTemplate?.statusCode).toBe(401)
      expect(unauthorizedTemplate?.body).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required',
      })
    })

    it('should have not_found template with correct values', () => {
      const notFoundTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'not_found')
      expect(notFoundTemplate).toBeDefined()
      expect(notFoundTemplate?.name).toBe('Not Found (404)')
      expect(notFoundTemplate?.statusCode).toBe(404)
      expect(notFoundTemplate?.body).toEqual({
        error: 'Not found',
        message: 'Resource not found',
      })
    })

    it('should have server_error template with correct values', () => {
      const serverErrorTemplate = RESPONSE_TEMPLATES.find((t) => t.id === 'server_error')
      expect(serverErrorTemplate).toBeDefined()
      expect(serverErrorTemplate?.name).toBe('Server Error (500)')
      expect(serverErrorTemplate?.statusCode).toBe(500)
      expect(serverErrorTemplate?.body).toEqual({
        error: 'Internal server error',
        message: 'Something went wrong',
      })
    })

    it('should have unique ids for all templates', () => {
      const ids = RESPONSE_TEMPLATES.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(RESPONSE_TEMPLATES.length)
    })

    it('should have all required properties for each template', () => {
      for (const template of RESPONSE_TEMPLATES) {
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('statusCode')
        expect(template).toHaveProperty('body')
        expect(typeof template.id).toBe('string')
        expect(typeof template.name).toBe('string')
        expect(typeof template.statusCode).toBe('number')
        expect(typeof template.body).toBe('object')
      }
    })
  })

  // ============================================
  // formatWebhookUrl tests
  // ============================================
  describe('formatWebhookUrl', () => {
    const originalWindow = global.window

    afterEach(() => {
      // Restore window
      if (originalWindow === undefined) {
        // @ts-expect-error - intentionally setting to undefined for SSR test
        delete global.window
      } else {
        global.window = originalWindow
      }
    })

    it('should format URL with provided baseUrl', () => {
      const result = formatWebhookUrl('endpoint-123', 'https://example.com')
      expect(result).toBe('https://example.com/api/webhooks/endpoint-123')
    })

    it('should format URL with different baseUrl', () => {
      const result = formatWebhookUrl('abc-def-ghi', 'https://api.myapp.io')
      expect(result).toBe('https://api.myapp.io/api/webhooks/abc-def-ghi')
    })

    it('should handle baseUrl without trailing slash', () => {
      const result = formatWebhookUrl('test-id', 'https://test.com')
      expect(result).toBe('https://test.com/api/webhooks/test-id')
    })

    it('should use window.location.origin when baseUrl not provided', () => {
      // Mock window.location.origin
      global.window = {
        ...global.window,
        location: {
          ...global.window?.location,
          origin: 'https://localhost:3000',
        },
      } as Window & typeof globalThis

      const result = formatWebhookUrl('my-endpoint')
      expect(result).toBe('https://localhost:3000/api/webhooks/my-endpoint')
    })

    it('should return empty base for SSR environment (no window)', () => {
      // @ts-expect-error - intentionally setting to undefined for SSR test
      global.window = undefined

      const result = formatWebhookUrl('ssr-endpoint')
      expect(result).toBe('/api/webhooks/ssr-endpoint')
    })

    it('should handle UUID-style endpoint ids', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const result = formatWebhookUrl(uuid, 'https://webhooks.app')
      expect(result).toBe(`https://webhooks.app/api/webhooks/${uuid}`)
    })

    it('should handle empty endpoint id', () => {
      const result = formatWebhookUrl('', 'https://example.com')
      expect(result).toBe('https://example.com/api/webhooks/')
    })
  })

  // ============================================
  // generateCurlCommand tests
  // ============================================
  describe('generateCurlCommand', () => {
    const testUrl = 'https://api.example.com/webhooks/test-123'

    it('should generate basic GET command', () => {
      const result = generateCurlCommand(testUrl, 'GET')
      expect(result).toBe(`curl -X GET "${testUrl}"`)
    })

    it('should generate basic POST command', () => {
      const result = generateCurlCommand(testUrl, 'POST')
      expect(result).toBe(`curl -X POST "${testUrl}"`)
    })

    it('should generate PUT command', () => {
      const result = generateCurlCommand(testUrl, 'PUT')
      expect(result).toBe(`curl -X PUT "${testUrl}"`)
    })

    it('should generate PATCH command', () => {
      const result = generateCurlCommand(testUrl, 'PATCH')
      expect(result).toBe(`curl -X PATCH "${testUrl}"`)
    })

    it('should generate DELETE command', () => {
      const result = generateCurlCommand(testUrl, 'DELETE')
      expect(result).toBe(`curl -X DELETE "${testUrl}"`)
    })

    it('should generate HEAD command', () => {
      const result = generateCurlCommand(testUrl, 'HEAD')
      expect(result).toBe(`curl -X HEAD "${testUrl}"`)
    })

    it('should generate OPTIONS command', () => {
      const result = generateCurlCommand(testUrl, 'OPTIONS')
      expect(result).toBe(`curl -X OPTIONS "${testUrl}"`)
    })

    it('should default to POST method when not specified', () => {
      const result = generateCurlCommand(testUrl)
      expect(result).toBe(`curl -X POST "${testUrl}"`)
    })

    it('should include single header', () => {
      const headers = { 'Content-Type': 'application/json' }
      const result = generateCurlCommand(testUrl, 'POST', headers)
      expect(result).toContain('-H "Content-Type: application/json"')
    })

    it('should include multiple headers', () => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      }
      const result = generateCurlCommand(testUrl, 'POST', headers)
      expect(result).toContain('-H "Content-Type: application/json"')
      expect(result).toContain('-H "Authorization: Bearer token123"')
      expect(result).toContain('-H "X-Custom-Header: custom-value"')
    })

    it('should include body as pretty-printed JSON', () => {
      const body = { key: 'value' }
      const result = generateCurlCommand(testUrl, 'POST', undefined, body)
      expect(result).toContain("-d '")
      expect(result).toContain('"key": "value"')
    })

    it('should handle complex nested body', () => {
      const body = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        items: [1, 2, 3],
        metadata: {
          source: 'api',
          version: 2,
        },
      }
      const result = generateCurlCommand(testUrl, 'POST', undefined, body)
      expect(result).toContain('"user":')
      expect(result).toContain('"name": "John"')
      expect(result).toContain('"items":')
      expect(result).toContain('"metadata":')
    })

    it('should include both headers and body', () => {
      const headers = { 'Content-Type': 'application/json' }
      const body = { event: 'test' }
      const result = generateCurlCommand(testUrl, 'POST', headers, body)
      expect(result).toContain('-H "Content-Type: application/json"')
      expect(result).toContain("-d '")
      expect(result).toContain('"event": "test"')
    })

    it('should format with line continuations for readability', () => {
      const headers = { 'Content-Type': 'application/json' }
      const result = generateCurlCommand(testUrl, 'POST', headers)
      expect(result).toContain(' \\\n  -H ')
    })

    it('should handle empty headers object', () => {
      const result = generateCurlCommand(testUrl, 'POST', {})
      expect(result).toBe(`curl -X POST "${testUrl}"`)
    })

    it('should handle array in body', () => {
      const body = [1, 2, 3]
      const result = generateCurlCommand(testUrl, 'POST', undefined, body)
      expect(result).toContain('[\n  1,\n  2,\n  3\n]')
    })

    it('should handle string body value', () => {
      const body = 'plain text body'
      const result = generateCurlCommand(testUrl, 'POST', undefined, body)
      expect(result).toContain('-d \'"plain text body"\'')
    })

    it('should handle number body value', () => {
      const body = 42
      const result = generateCurlCommand(testUrl, 'POST', undefined, body)
      expect(result).toContain("-d '42'")
    })

    it('should handle boolean body value', () => {
      const result = generateCurlCommand(testUrl, 'POST', undefined, true)
      expect(result).toContain("-d 'true'")
    })

    it('should handle null body value (not included due to falsy check)', () => {
      const result = generateCurlCommand(testUrl, 'POST', undefined, null)
      // null is falsy, so body is not included in the curl command
      expect(result).not.toContain('-d')
      expect(result).toBe(`curl -X POST "${testUrl}"`)
    })
  })

  // ============================================
  // formatBytes tests
  // ============================================
  describe('formatBytes', () => {
    it('should return "0 Bytes" for 0', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes (< 1024)', () => {
      expect(formatBytes(1)).toBe('1 Bytes')
      expect(formatBytes(100)).toBe('100 Bytes')
      expect(formatBytes(500)).toBe('500 Bytes')
      expect(formatBytes(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes (1024 - 1048575)', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(2048)).toBe('2 KB')
      expect(formatBytes(10240)).toBe('10 KB')
      expect(formatBytes(102400)).toBe('100 KB')
      expect(formatBytes(1048575)).toBe('1024 KB')
    })

    it('should format megabytes (1048576 - 1073741823)', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1572864)).toBe('1.5 MB')
      expect(formatBytes(10485760)).toBe('10 MB')
      expect(formatBytes(104857600)).toBe('100 MB')
      expect(formatBytes(536870912)).toBe('512 MB')
    })

    it('should format gigabytes (>= 1073741824)', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(1610612736)).toBe('1.5 GB')
      expect(formatBytes(2147483648)).toBe('2 GB')
      expect(formatBytes(10737418240)).toBe('10 GB')
    })

    it('should round to 2 decimal places', () => {
      // 1.33 KB = 1361.92 bytes
      expect(formatBytes(1362)).toBe('1.33 KB')
      // 2.67 MB
      expect(formatBytes(2800000)).toBe('2.67 MB')
    })

    it('should handle large numbers', () => {
      // 100 GB
      expect(formatBytes(107374182400)).toBe('100 GB')
    })
  })

  // ============================================
  // formatRelativeTime tests
  // ============================================
  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should format seconds ago', () => {
      const now = new Date('2024-01-15T12:00:30Z')
      vi.setSystemTime(now)

      expect(formatRelativeTime('2024-01-15T12:00:30Z')).toBe('0s ago')
      expect(formatRelativeTime('2024-01-15T12:00:25Z')).toBe('5s ago')
      expect(formatRelativeTime('2024-01-15T12:00:00Z')).toBe('30s ago')
      expect(formatRelativeTime('2024-01-15T11:59:31Z')).toBe('59s ago')
    })

    it('should format minutes ago', () => {
      const now = new Date('2024-01-15T12:30:00Z')
      vi.setSystemTime(now)

      expect(formatRelativeTime('2024-01-15T12:29:00Z')).toBe('1m ago')
      expect(formatRelativeTime('2024-01-15T12:25:00Z')).toBe('5m ago')
      expect(formatRelativeTime('2024-01-15T12:00:00Z')).toBe('30m ago')
      expect(formatRelativeTime('2024-01-15T11:31:00Z')).toBe('59m ago')
    })

    it('should format hours ago', () => {
      const now = new Date('2024-01-15T18:00:00Z')
      vi.setSystemTime(now)

      expect(formatRelativeTime('2024-01-15T17:00:00Z')).toBe('1h ago')
      expect(formatRelativeTime('2024-01-15T12:00:00Z')).toBe('6h ago')
      expect(formatRelativeTime('2024-01-15T06:00:00Z')).toBe('12h ago')
      expect(formatRelativeTime('2024-01-14T19:00:00Z')).toBe('23h ago')
    })

    it('should format days ago', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      vi.setSystemTime(now)

      expect(formatRelativeTime('2024-01-14T12:00:00Z')).toBe('1d ago')
      expect(formatRelativeTime('2024-01-12T12:00:00Z')).toBe('3d ago')
      expect(formatRelativeTime('2024-01-09T12:00:00Z')).toBe('6d ago')
    })

    it('should format dates older than 7 days as locale date string', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      vi.setSystemTime(now)

      // 7 days ago should show as formatted date
      const sevenDaysAgo = new Date('2024-01-08T12:00:00Z')
      const result = formatRelativeTime('2024-01-08T12:00:00Z')
      expect(result).toBe(sevenDaysAgo.toLocaleDateString())

      // Much older dates
      const oldDate = new Date('2023-06-15T12:00:00Z')
      expect(formatRelativeTime('2023-06-15T12:00:00Z')).toBe(oldDate.toLocaleDateString())
    })

    it('should handle boundary cases between time units', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      vi.setSystemTime(now)

      // 59 seconds -> seconds format
      expect(formatRelativeTime('2024-01-15T11:59:01Z')).toBe('59s ago')

      // 60 seconds (1 minute) -> minutes format
      expect(formatRelativeTime('2024-01-15T11:59:00Z')).toBe('1m ago')

      // 59 minutes -> minutes format
      expect(formatRelativeTime('2024-01-15T11:01:00Z')).toBe('59m ago')

      // 60 minutes (1 hour) -> hours format
      expect(formatRelativeTime('2024-01-15T11:00:00Z')).toBe('1h ago')
    })

    it('should handle ISO date strings with timezone', () => {
      const now = new Date('2024-01-15T12:00:00Z')
      vi.setSystemTime(now)

      expect(formatRelativeTime('2024-01-15T11:59:00+00:00')).toBe('1m ago')
    })
  })

  // ============================================
  // isValidJson tests
  // ============================================
  describe('isValidJson', () => {
    it('should return true for valid JSON object', () => {
      expect(isValidJson('{}')).toBe(true)
      expect(isValidJson('{"key": "value"}')).toBe(true)
      expect(isValidJson('{"nested": {"key": "value"}}')).toBe(true)
    })

    it('should return true for valid JSON array', () => {
      expect(isValidJson('[]')).toBe(true)
      expect(isValidJson('[1, 2, 3]')).toBe(true)
      expect(isValidJson('[{"id": 1}, {"id": 2}]')).toBe(true)
    })

    it('should return true for valid JSON primitives', () => {
      expect(isValidJson('"string"')).toBe(true)
      expect(isValidJson('123')).toBe(true)
      expect(isValidJson('123.456')).toBe(true)
      expect(isValidJson('true')).toBe(true)
      expect(isValidJson('false')).toBe(true)
      expect(isValidJson('null')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isValidJson('')).toBe(false)
      expect(isValidJson('undefined')).toBe(false)
      expect(isValidJson("{'key': 'value'}")).toBe(false) // single quotes
      expect(isValidJson('{key: "value"}')).toBe(false) // unquoted key
      expect(isValidJson('{"key": "value",}')).toBe(false) // trailing comma
      expect(isValidJson('not json at all')).toBe(false)
    })

    it('should return false for malformed JSON', () => {
      expect(isValidJson('{"key": }')).toBe(false)
      expect(isValidJson('{"key": "value"')).toBe(false) // missing closing brace
      expect(isValidJson('[1, 2, 3')).toBe(false) // missing closing bracket
      expect(isValidJson('{{}}')).toBe(false)
    })

    it('should handle whitespace in valid JSON', () => {
      expect(isValidJson('  {"key": "value"}  ')).toBe(true)
      expect(isValidJson('\n{"key": "value"}\n')).toBe(true)
      expect(isValidJson('{\n  "key": "value"\n}')).toBe(true)
    })

    it('should handle special characters in JSON strings', () => {
      expect(isValidJson('{"key": "value with \\"quotes\\"" }')).toBe(true)
      expect(isValidJson('{"key": "line1\\nline2"}')).toBe(true)
    })

    it('should handle complex nested structures', () => {
      const complexJson = JSON.stringify({
        users: [
          { name: 'Alice', roles: ['admin', 'user'] },
          { name: 'Bob', roles: ['user'] },
        ],
        metadata: {
          version: 1,
          timestamp: '2024-01-15T12:00:00Z',
        },
      })
      expect(isValidJson(complexJson)).toBe(true)
    })
  })

  // ============================================
  // prettyPrintJson tests
  // ============================================
  describe('prettyPrintJson', () => {
    it('should pretty print simple object', () => {
      const obj = { key: 'value' }
      const result = prettyPrintJson(obj)
      expect(result).toBe('{\n  "key": "value"\n}')
    })

    it('should pretty print nested object', () => {
      const obj = { outer: { inner: 'value' } }
      const result = prettyPrintJson(obj)
      expect(result).toContain('"outer":')
      expect(result).toContain('"inner": "value"')
    })

    it('should pretty print array', () => {
      const arr = [1, 2, 3]
      const result = prettyPrintJson(arr)
      expect(result).toBe('[\n  1,\n  2,\n  3\n]')
    })

    it('should pretty print array of objects', () => {
      const arr = [{ id: 1 }, { id: 2 }]
      const result = prettyPrintJson(arr)
      expect(result).toContain('"id": 1')
      expect(result).toContain('"id": 2')
    })

    it('should handle primitive values', () => {
      expect(prettyPrintJson('string')).toBe('"string"')
      expect(prettyPrintJson(123)).toBe('123')
      expect(prettyPrintJson(true)).toBe('true')
      expect(prettyPrintJson(false)).toBe('false')
      expect(prettyPrintJson(null)).toBe('null')
    })

    it('should handle empty structures', () => {
      expect(prettyPrintJson({})).toBe('{}')
      expect(prettyPrintJson([])).toBe('[]')
    })

    it('should handle complex nested structure', () => {
      const complex = {
        users: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 },
        ],
        metadata: {
          count: 2,
          page: 1,
        },
      }
      const result = prettyPrintJson(complex)
      expect(result).toContain('"users":')
      expect(result).toContain('"name": "Alice"')
      expect(result).toContain('"metadata":')
      // Check indentation (2 spaces)
      expect(result).toContain('  "users":')
    })

    it('should return string representation for circular references', () => {
      const circular: Record<string, unknown> = { key: 'value' }
      circular.self = circular

      // This should catch the error and return String(obj)
      const result = prettyPrintJson(circular)
      expect(result).toBe('[object Object]')
    })

    it('should handle undefined (JSON.stringify returns undefined)', () => {
      const result = prettyPrintJson(undefined)
      // JSON.stringify(undefined) returns undefined, not a string
      expect(result).toBeUndefined()
    })

    it('should use 2-space indentation', () => {
      const obj = { a: { b: { c: 'deep' } } }
      const result = prettyPrintJson(obj)
      const lines = result.split('\n')
      // Check that indentation increases by 2 spaces per level
      expect(lines[1]).toMatch(/^ {2}"a":/)
      expect(lines[2]).toMatch(/^ {4}"b":/)
      expect(lines[3]).toMatch(/^ {6}"c":/)
    })
  })

  // ============================================
  // Type interface tests (structural validation)
  // ============================================
  describe('Type interfaces', () => {
    it('should accept valid WebhookEndpoint structure', () => {
      const endpoint: WebhookEndpoint = {
        id: 'endpoint-123',
        user_id: 'user-456',
        name: 'My Webhook',
        description: 'Test webhook endpoint',
        response_status_code: 200,
        response_body: { success: true },
        response_headers: { 'Content-Type': 'application/json' },
        is_active: true,
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        expires_at: '2024-02-15T12:00:00Z',
        request_count: 10,
      }
      expect(endpoint.id).toBe('endpoint-123')
      expect(endpoint.is_active).toBe(true)
    })

    it('should accept WebhookEndpoint without optional description', () => {
      const endpoint: WebhookEndpoint = {
        id: 'endpoint-123',
        user_id: 'user-456',
        name: 'My Webhook',
        response_status_code: 200,
        response_body: {},
        response_headers: {},
        is_active: true,
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        expires_at: '2024-02-15T12:00:00Z',
        request_count: 0,
      }
      expect(endpoint.description).toBeUndefined()
    })

    it('should accept valid WebhookRequest structure', () => {
      const request: WebhookRequest = {
        id: 'request-789',
        endpoint_id: 'endpoint-123',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        query_params: { page: '1' },
        body: '{"data": "test"}',
        body_size: 16,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        received_at: '2024-01-15T12:00:00Z',
        response_time_ms: 50,
      }
      expect(request.method).toBe('POST')
      expect(request.body_size).toBe(16)
    })

    it('should accept WebhookRequest with null values', () => {
      const request: WebhookRequest = {
        id: 'request-789',
        endpoint_id: 'endpoint-123',
        method: 'GET',
        headers: {},
        query_params: {},
        body: null,
        body_size: 0,
        ip_address: null,
        user_agent: null,
        received_at: '2024-01-15T12:00:00Z',
        response_time_ms: null,
      }
      expect(request.body).toBeNull()
      expect(request.ip_address).toBeNull()
    })

    it('should accept WebhookRequest with array header values', () => {
      const request: WebhookRequest = {
        id: 'request-789',
        endpoint_id: 'endpoint-123',
        method: 'POST',
        headers: {
          Accept: ['application/json', 'text/plain'],
          'Content-Type': 'application/json',
        },
        query_params: {
          ids: ['1', '2', '3'],
          single: 'value',
        },
        body: null,
        body_size: 0,
        ip_address: null,
        user_agent: null,
        received_at: '2024-01-15T12:00:00Z',
        response_time_ms: null,
      }
      expect(Array.isArray(request.headers.Accept)).toBe(true)
      expect(Array.isArray(request.query_params.ids)).toBe(true)
    })

    it('should accept valid CreateEndpointRequest structure', () => {
      const createRequest: CreateEndpointRequest = {
        name: 'New Endpoint',
        description: 'A new webhook endpoint',
        response_status_code: 201,
        response_body: { created: true },
        response_headers: { 'X-Custom': 'header' },
      }
      expect(createRequest.name).toBe('New Endpoint')
    })

    it('should accept CreateEndpointRequest with only required name', () => {
      const createRequest: CreateEndpointRequest = {
        name: 'Minimal Endpoint',
      }
      expect(createRequest.name).toBe('Minimal Endpoint')
      expect(createRequest.description).toBeUndefined()
      expect(createRequest.response_status_code).toBeUndefined()
    })

    it('should accept valid UpdateEndpointRequest structure', () => {
      const updateRequest: UpdateEndpointRequest = {
        name: 'Updated Name',
        description: 'Updated description',
        response_status_code: 202,
        response_body: { updated: true },
        response_headers: { 'X-Updated': 'true' },
        is_active: false,
      }
      expect(updateRequest.is_active).toBe(false)
    })

    it('should accept UpdateEndpointRequest with partial fields', () => {
      const partialUpdate: UpdateEndpointRequest = {
        is_active: true,
      }
      expect(partialUpdate.is_active).toBe(true)
      expect(partialUpdate.name).toBeUndefined()
    })

    it('should accept empty UpdateEndpointRequest', () => {
      const emptyUpdate: UpdateEndpointRequest = {}
      expect(Object.keys(emptyUpdate)).toHaveLength(0)
    })
  })

  // ============================================
  // HttpMethod type tests
  // ============================================
  describe('HttpMethod type', () => {
    it('should accept all valid HTTP methods', () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      expect(methods).toHaveLength(7)
      for (const method of methods) {
        expect(HTTP_METHODS).toContain(method)
      }
    })

    it('should be usable in generateCurlCommand', () => {
      const method: HttpMethod = 'DELETE'
      const result = generateCurlCommand('https://example.com', method)
      expect(result).toContain('-X DELETE')
    })
  })
})
