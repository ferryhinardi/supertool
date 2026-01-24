import { type NextRequest, NextResponse } from 'next/server'

import {
  type APIResponse,
  type CopilotError,
  CopilotErrorHandler,
  type CopilotSession,
  type ErrorType,
  getCopilotManager,
  type SessionMetadata,
} from '@/lib/services/copilot'

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

interface CreateSessionRequest {
  name?: string
}

interface ValidationResult<T> {
  valid: boolean
  data?: T
  error?: CopilotError
}

/**
 * Validate create session request
 */
function validateCreateSessionRequest(body: unknown): ValidationResult<CreateSessionRequest> {
  if (body !== null && typeof body === 'object') {
    const data = body as Record<string, unknown>

    // Name is optional, but if provided must be a string
    if (data.name !== undefined && typeof data.name !== 'string') {
      return {
        valid: false,
        error: CopilotErrorHandler.createError('VALIDATION_ERROR', 'name must be a string'),
      }
    }

    // Name length validation
    if (typeof data.name === 'string' && data.name.length > 100) {
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
        name: data.name as string | undefined,
      },
    }
  }

  // Empty body is valid (all fields are optional)
  return {
    valid: true,
    data: {},
  }
}

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * GET /api/copilot/sessions
 *
 * List all active sessions with metadata
 *
 * Response: APIResponse<SessionMetadata[]>
 */
export async function GET(): Promise<NextResponse<APIResponse<SessionMetadata[]>>> {
  try {
    const manager = getCopilotManager()
    await manager.initialize()

    const sessions = await manager.listSessions()

    return NextResponse.json({
      success: true,
      data: sessions,
    })
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * POST /api/copilot/sessions
 *
 * Create a new chat session
 *
 * Request body:
 * - name?: string - Optional session name (max 100 chars)
 *
 * Response: APIResponse<CopilotSession>
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResponse<CopilotSession>>> {
  try {
    let body: unknown = {}

    // Parse request body (empty body is valid)
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const text = await request.text()
        if (text.trim()) {
          body = JSON.parse(text)
        }
      } catch {
        return createErrorResponse(
          CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid JSON in request body')
        )
      }
    }

    // Validate request
    const validation = validateCreateSessionRequest(body)
    if (!validation.valid) {
      const error =
        validation.error ?? CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid request')
      return createErrorResponse(error)
    }

    const manager = getCopilotManager()
    await manager.initialize()

    // Create session with optional name
    const session = await manager.createSession(validation.data?.name)

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      { status: 201 }
    )
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * OPTIONS /api/copilot/sessions
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
