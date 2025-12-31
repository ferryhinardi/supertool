// TypeScript types for Webhook Tester

export interface WebhookEndpoint {
  id: string
  user_id: string
  name: string
  description?: string
  response_status_code: number
  response_body: Record<string, unknown>
  response_headers: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
  expires_at: string
  request_count: number
}

export interface WebhookRequest {
  id: string
  endpoint_id: string
  method: string
  headers: Record<string, string | string[]>
  query_params: Record<string, string | string[]>
  body: string | null
  body_size: number
  ip_address: string | null
  user_agent: string | null
  received_at: string
  response_time_ms: number | null
}

export interface CreateEndpointRequest {
  name: string
  description?: string
  response_status_code?: number
  response_body?: Record<string, unknown>
  response_headers?: Record<string, string>
}

export interface UpdateEndpointRequest {
  name?: string
  description?: string
  response_status_code?: number
  response_body?: Record<string, unknown>
  response_headers?: Record<string, string>
  is_active?: boolean
}

// HTTP Methods supported
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

// Common webhook response templates
export const RESPONSE_TEMPLATES = [
  {
    id: 'success',
    name: 'Success (200)',
    statusCode: 200,
    body: { success: true, message: 'Webhook received' },
  },
  {
    id: 'accepted',
    name: 'Accepted (202)',
    statusCode: 202,
    body: { success: true, message: 'Request accepted for processing' },
  },
  {
    id: 'bad_request',
    name: 'Bad Request (400)',
    statusCode: 400,
    body: { error: 'Bad request', message: 'Invalid payload' },
  },
  {
    id: 'unauthorized',
    name: 'Unauthorized (401)',
    statusCode: 401,
    body: { error: 'Unauthorized', message: 'Authentication required' },
  },
  {
    id: 'not_found',
    name: 'Not Found (404)',
    statusCode: 404,
    body: { error: 'Not found', message: 'Resource not found' },
  },
  {
    id: 'server_error',
    name: 'Server Error (500)',
    statusCode: 500,
    body: { error: 'Internal server error', message: 'Something went wrong' },
  },
] as const

// Format webhook URL
export function formatWebhookUrl(endpointId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/api/webhooks/${endpointId}`
}

// Generate cURL command for webhook
export function generateCurlCommand(
  url: string,
  method: HttpMethod = 'POST',
  headers?: Record<string, string>,
  body?: unknown
): string {
  let curl = `curl -X ${method} "${url}"`

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      curl += ` \\\n  -H "${key}: ${value}"`
    }
  }

  if (body) {
    curl += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`
  }

  return curl
}

// Format file size
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Validate JSON
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// Pretty print JSON
export function prettyPrintJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
