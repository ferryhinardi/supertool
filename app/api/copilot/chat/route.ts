import { type NextRequest, NextResponse } from 'next/server'
import {
  type APIResponse,
  type ChatResponse,
  type CopilotError,
  CopilotErrorHandler,
  type ErrorType,
  getCopilotManager,
  type StreamEvent,
} from '@/lib/services/copilot'

/**
 * Request body for chat endpoint
 */
interface ChatRequestBody {
  sessionId?: string
  message: string
  stream?: boolean
  options?: {
    maxTokens?: number
    temperature?: number
  }
}

/**
 * Maps error types to HTTP status codes
 */
function getStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case 'AUTH_ERROR':
      return 401
    case 'RATE_LIMIT':
      return 429
    case 'TIMEOUT':
      return 408
    case 'VALIDATION_ERROR':
      return 400
    case 'SESSION_NOT_FOUND':
      return 404
    case 'SESSION_EXPIRED':
      return 410
    case 'TOOL_ERROR':
      return 500
    case 'COPILOT_ERROR':
      return 502
    default:
      return 500
  }
}

/**
 * Creates an error response with proper typing
 */
function createErrorResponse(
  error: CopilotError,
  status?: number
): NextResponse<APIResponse<never>> {
  return NextResponse.json<APIResponse<never>>(
    {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        code: error.code,
      },
    },
    { status: status ?? getStatusCode(error.type) }
  )
}

/**
 * Validates the chat request body
 */
function validateChatRequest(body: unknown): {
  valid: boolean
  error?: CopilotError
  data?: ChatRequestBody
} {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: CopilotErrorHandler.createError('VALIDATION_ERROR', 'Request body is required'),
    }
  }

  const request = body as Record<string, unknown>

  if (!request.message || typeof request.message !== 'string') {
    return {
      valid: false,
      error: CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Message is required and must be a string'
      ),
    }
  }

  if (request.message.trim().length === 0) {
    return {
      valid: false,
      error: CopilotErrorHandler.createError('VALIDATION_ERROR', 'Message cannot be empty'),
    }
  }

  if (request.message.length > 32000) {
    return {
      valid: false,
      error: CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Message exceeds maximum length of 32000 characters'
      ),
    }
  }

  return {
    valid: true,
    data: {
      sessionId: request.sessionId as string | undefined,
      message: request.message as string,
      stream: request.stream as boolean | undefined,
      options: request.options as ChatRequestBody['options'] | undefined,
    },
  }
}

/**
 * POST /api/copilot/chat
 *
 * Send a message to GitHub Copilot and receive a response.
 * Supports both streaming (SSE) and non-streaming modes.
 *
 * Request body:
 * - sessionId?: string - Existing session ID (creates new if not provided)
 * - message: string - The user's message
 * - stream?: boolean - Enable SSE streaming (default: false)
 * - options?: { maxTokens?: number, temperature?: number }
 *
 * Response (non-streaming):
 * - APIResponse<ChatResponse>
 *
 * Response (streaming):
 * - Server-Sent Events with StreamEvent objects
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(
        CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid JSON in request body')
      )
    }

    const validation = validateChatRequest(body)
    if (!validation.valid || !validation.data) {
      const error =
        validation.error ?? CopilotErrorHandler.createError('VALIDATION_ERROR', 'Invalid request')
      return createErrorResponse(error)
    }

    const chatRequest = validation.data
    const manager = getCopilotManager()

    // Ensure manager is initialized
    await manager.initialize()

    // Get or create session
    let sessionId = chatRequest.sessionId
    if (!sessionId) {
      // Create a new session
      const newSession = await manager.createSession(`Chat ${new Date().toLocaleString()}`)
      sessionId = newSession.id
    }

    // Verify session exists
    const session = await manager.getSession(sessionId)
    if (!session) {
      return createErrorResponse(
        CopilotErrorHandler.createError('SESSION_NOT_FOUND', `Session not found: ${sessionId}`)
      )
    }

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return createErrorResponse(
        CopilotErrorHandler.createError('SESSION_EXPIRED', `Session has expired: ${sessionId}`)
      )
    }

    const options = chatRequest.options ?? {}

    // Handle streaming mode
    if (chatRequest.stream) {
      return handleStreamingResponse(manager, sessionId, chatRequest.message, options)
    }

    // Handle non-streaming mode
    return handleNonStreamingResponse(manager, sessionId, chatRequest.message, options)
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * Handles streaming chat response using Server-Sent Events
 */
function handleStreamingResponse(
  manager: ReturnType<typeof getCopilotManager>,
  sessionId: string,
  message: string,
  options: ChatRequestBody['options']
): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send initial event with session ID (as a token event since 'start' is not a valid type)
        const startEvent = {
          type: 'token' as const,
          sessionId,
          content: '',
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(startEvent)}\n\n`))

        // Stream the response using the async generator
        const streamGenerator = manager.streamMessage(sessionId, message, {
          maxTokens: options?.maxTokens,
          temperature: options?.temperature,
        })

        for await (const event of streamGenerator) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))

            // Close stream on done or error
            if (event.type === 'done' || event.type === 'error') {
              controller.close()
              return
            }
          } catch {
            // Controller may already be closed
          }
        }

        // Ensure stream is closed if generator finishes without done/error
        controller.close()
      } catch (error) {
        // Send error event
        const copilotError = CopilotErrorHandler.categorizeError(error)
        const errorEvent: StreamEvent = {
          type: 'error',
          error: copilotError,
        }

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`))
          controller.close()
        } catch {
          // Controller may already be closed
        }
      }
    },

    cancel() {
      // Stream was cancelled by client
      // Could add cleanup logic here if needed
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}

/**
 * Handles non-streaming chat response
 */
async function handleNonStreamingResponse(
  manager: ReturnType<typeof getCopilotManager>,
  sessionId: string,
  message: string,
  options: ChatRequestBody['options']
): Promise<NextResponse<APIResponse<ChatResponse>>> {
  try {
    const response = await manager.sendMessage(sessionId, message, {
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
    })

    // Get updated session for metadata
    const session = await manager.getSession(sessionId)

    return NextResponse.json<APIResponse<ChatResponse>>({
      success: true,
      data: {
        sessionId,
        message: response.message,
        usage: response.usage,
        // Include additional metadata if needed
        ...(session && {
          _metadata: {
            messageCount: session.messages.length,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          },
        }),
      },
    })
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError)
  }
}

/**
 * OPTIONS /api/copilot/chat
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
