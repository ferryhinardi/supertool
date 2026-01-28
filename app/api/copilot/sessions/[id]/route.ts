import { type NextRequest, NextResponse } from 'next/server'

import { checkRateLimit, getRateLimiter } from '@/lib/services/api'
import {
  type APIResponse,
  type CopilotError,
  CopilotErrorHandler,
  type CopilotSession,
  type ErrorType,
  getCopilotManager,
} from '@/lib/services/copilot'

// =============================================================================
// Types
// =============================================================================

interface RouteParams {
  params: Promise<{ id: string }>
}

interface DeleteResponse {
  deleted: boolean
  sessionId: string
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get HTTP status code from error type
 */
function getStatusCode(errorType: ErrorType): number {
  const statusCodes: Record<ErrorType, number> = {
    AUTH_ERROR: 401,
    RATE_LIMIT: 429,
    TIMEOUT: 408,
    VALIDATION_ERROR: 400,
    SESSION_NOT_FOUND: 404,
    SESSION_EXPIRED: 410,
    TOOL_ERROR: 500,
    COPILOT_ERROR: 502,
    NETWORK_ERROR: 503,
    UNKNOWN_ERROR: 500,
  }
  return statusCodes[errorType] ?? 500
}

/**
 * Create error response with proper status code
 */
function createErrorResponse(error: CopilotError): NextResponse<APIResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        code: error.code,
      },
    },
    { status: getStatusCode(error.type) }
  )
}

// =============================================================================
// Request Validation
// =============================================================================

interface UpdateSessionRequest {
  name: string
}

interface ValidationResult<T> {
  valid: boolean
  data?: T
  error?: CopilotError
}

/**
 * Validate update session request
 */
function validateUpdateSessionRequest(body: unknown): ValidationResult<UpdateSessionRequest> {
  if (body === null || typeof body !== 'object') {
    return {
      valid: false,
      error: CopilotErrorHandler.createError('VALIDATION_ERROR', 'Request body must be an object'),
    }
  }

  const data = body as Record<string, unknown>

  // Name is required for update
  if (typeof data.name !== 'string') {
    return {
      valid: false,
      error: CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'name is required and must be a string'
      ),
    }
  }

  // Name cannot be empty
  if (data.name.trim().length === 0) {
    return {
      valid: false,
      error: CopilotErrorHandler.createError('VALIDATION_ERROR', 'name cannot be empty'),
    }
  }

  // Name length validation
  if (data.name.length > 100) {
    return {
      valid: false,
      error: CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'name must be 100 characters or less'
      ),
    }
  }

  return {
    valid: true,
    data: {
      name: data.name,
    },
  }
}

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * GET /api/copilot/sessions/[id]
 *
 * Get a specific session by ID with all messages
 *
 * Response: APIResponse<CopilotSession>
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<APIResponse<CopilotSession>>> {
  try {
    // Check rate limit
    const { result: rateLimitResult, response: rateLimitResponse } = checkRateLimit(
      request,
      'sessionRead'
    )
    if (rateLimitResponse) {
      return rateLimitResponse as NextResponse<APIResponse<CopilotSession>>
    }

    const rateLimiter = getRateLimiter('sessionRead')
    const rateLimitHeaders = rateLimiter.getHeaders(rateLimitResult)

    const { id } = await params

    if (!id || typeof id !== 'string') {
      return createErrorResponse(
        CopilotErrorHandler.createError('VALIDATION_ERROR', 'Session ID is required')
      )
    }

    const manager = getCopilotManager()
    await manager.initialize()

    const session = await manager.getSession(id)

    if (!session) {
      return createErrorResponse(
        CopilotErrorHandler.createError('SESSION_NOT_FOUND', `Session not found: ${id}`)
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      {
        headers: rateLimitHeaders,
      }
    )
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * PUT /api/copilot/sessions/[id]
 *
 * Update session (rename)
 *
 * Request body:
 * - name: string - New session name (required, max 100 chars)
 *
 * Response: APIResponse<CopilotSession>
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<APIResponse<CopilotSession>>> {
  try {
    // Check rate limit
    const { result: rateLimitResult, response: rateLimitResponse } = checkRateLimit(
      request,
      'sessionMutate'
    )
    if (rateLimitResponse) {
      return rateLimitResponse as NextResponse<APIResponse<CopilotSession>>
    }

    const rateLimiter = getRateLimiter('sessionMutate')
    const rateLimitHeaders = rateLimiter.getHeaders(rateLimitResult)

    const { id } = await params

    if (!id || typeof id !== 'string') {
      return createErrorResponse(
        CopilotErrorHandler.createError('VALIDATION_ERROR', 'Session ID is required')
      )
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(
        CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid JSON in request body')
      )
    }

    // Validate request
    const validation = validateUpdateSessionRequest(body)
    if (!validation.valid || !validation.data) {
      const error =
        validation.error ?? CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid request')
      return createErrorResponse(error)
    }

    const manager = getCopilotManager()
    await manager.initialize()

    // Rename session
    const session = await manager.renameSession(id, validation.data.name)

    if (!session) {
      return createErrorResponse(
        CopilotErrorHandler.createError('SESSION_NOT_FOUND', `Session not found: ${id}`)
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      {
        headers: rateLimitHeaders,
      }
    )
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * DELETE /api/copilot/sessions/[id]
 *
 * Delete a session
 *
 * Response: APIResponse<DeleteResponse>
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<APIResponse<DeleteResponse>>> {
  try {
    // Check rate limit
    const { result: rateLimitResult, response: rateLimitResponse } = checkRateLimit(
      request,
      'sessionMutate'
    )
    if (rateLimitResponse) {
      return rateLimitResponse as NextResponse<APIResponse<DeleteResponse>>
    }

    const rateLimiter = getRateLimiter('sessionMutate')
    const rateLimitHeaders = rateLimiter.getHeaders(rateLimitResult)

    const { id } = await params

    if (!id || typeof id !== 'string') {
      return createErrorResponse(
        CopilotErrorHandler.createError('VALIDATION_ERROR', 'Session ID is required')
      )
    }

    const manager = getCopilotManager()
    await manager.initialize()

    // Check if session exists first
    const session = await manager.getSession(id)
    if (!session) {
      return createErrorResponse(
        CopilotErrorHandler.createError('SESSION_NOT_FOUND', `Session not found: ${id}`)
      )
    }

    // Delete the session
    const deleted = await manager.deleteSession(id)

    return NextResponse.json(
      {
        success: true,
        data: {
          deleted,
          sessionId: id,
        },
      },
      {
        headers: rateLimitHeaders,
      }
    )
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * OPTIONS /api/copilot/sessions/[id]
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
