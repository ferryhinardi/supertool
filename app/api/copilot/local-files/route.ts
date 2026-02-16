import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/services/api'
import { CopilotErrorHandler, type ErrorType } from '@/lib/services/copilot'
import type { FileSuggestion } from '@/lib/services/copilot/types'
import {
  analyzeLocalFiles,
  type FileMovePreview,
  generateMoveScript,
  generateOrganizationSuggestions,
  type LocalFileInfo,
  type LocalFileOrganizationPreferences,
  previewFileMoves,
  type ScriptGenerationOptions,
} from '@/lib/services/local-files'

/**
 * API Response type
 */
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    type: string
    message: string
    code?: string
  }
}

/**
 * Request body types
 */
interface AnalyzeFilesRequest {
  action: 'analyze'
  files: LocalFileInfo[]
}

interface SuggestOrganizationRequest {
  action: 'suggest'
  files: LocalFileInfo[]
  preferences: LocalFileOrganizationPreferences
}

interface PreviewMovesRequest {
  action: 'preview'
  suggestions: FileSuggestion[]
}

interface GenerateScriptRequest {
  action: 'generate-script'
  preview: FileMovePreview
  options: ScriptGenerationOptions
}

type LocalFilesRequestBody =
  | AnalyzeFilesRequest
  | SuggestOrganizationRequest
  | PreviewMovesRequest
  | GenerateScriptRequest

/**
 * Maps error types to HTTP status codes
 */
function getStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case 'AUTH_ERROR':
      return 401
    case 'RATE_LIMIT':
      return 429
    case 'VALIDATION_ERROR':
      return 400
    default:
      return 500
  }
}

/**
 * Creates an error response
 */
function createErrorResponse(
  type: ErrorType,
  message: string,
  status?: number
): NextResponse<APIResponse<never>> {
  return NextResponse.json<APIResponse<never>>(
    {
      success: false,
      error: {
        type,
        message,
      },
    },
    { status: status ?? getStatusCode(type) }
  )
}

/**
 * Validates the request body
 */
function validateRequest(body: unknown): {
  valid: boolean
  data?: LocalFilesRequestBody
  error?: string
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' }
  }

  const data = body as Record<string, unknown>

  if (!data.action || typeof data.action !== 'string') {
    return { valid: false, error: 'Action is required' }
  }

  const action = data.action as string

  switch (action) {
    case 'analyze':
      if (!Array.isArray(data.files)) {
        return { valid: false, error: 'Files array is required for analyze action' }
      }
      return { valid: true, data: data as unknown as AnalyzeFilesRequest }

    case 'suggest':
      if (!Array.isArray(data.files)) {
        return { valid: false, error: 'Files array is required for suggest action' }
      }
      if (!data.preferences || typeof data.preferences !== 'object') {
        return { valid: false, error: 'Preferences object is required for suggest action' }
      }
      return { valid: true, data: data as unknown as SuggestOrganizationRequest }

    case 'preview':
      if (!Array.isArray(data.suggestions)) {
        return { valid: false, error: 'Suggestions array is required for preview action' }
      }
      return { valid: true, data: data as unknown as PreviewMovesRequest }

    case 'generate-script':
      if (!data.preview || typeof data.preview !== 'object') {
        return { valid: false, error: 'Preview object is required for generate-script action' }
      }
      if (!data.options || typeof data.options !== 'object') {
        return { valid: false, error: 'Options object is required for generate-script action' }
      }
      return { valid: true, data: data as unknown as GenerateScriptRequest }

    default:
      return { valid: false, error: `Unknown action: ${action}` }
  }
}

/**
 * POST /api/copilot/local-files
 *
 * Handles local file operations:
 * - analyze: Analyze files and categorize them
 * - suggest: Generate organization suggestions
 * - preview: Preview file move operations
 * - generate-script: Generate shell/batch scripts for moves
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const { response: rateLimitResponse } = checkRateLimit(request, 'default')
  if (rateLimitResponse) {
    return rateLimitResponse as NextResponse
  }

  try {
    const body = await request.json()
    const validation = validateRequest(body)

    if (!validation.valid || !validation.data) {
      return createErrorResponse('VALIDATION_ERROR', validation.error ?? 'Invalid request')
    }

    const data = validation.data

    switch (data.action) {
      case 'analyze': {
        const result = analyzeLocalFiles(data.files)
        return NextResponse.json<APIResponse<typeof result>>({
          success: true,
          data: result,
        })
      }

      case 'suggest': {
        const result = generateOrganizationSuggestions(data.files, data.preferences)
        return NextResponse.json<APIResponse<typeof result>>({
          success: true,
          data: result,
        })
      }

      case 'preview': {
        const result = previewFileMoves(data.suggestions)
        return NextResponse.json<APIResponse<typeof result>>({
          success: true,
          data: result,
        })
      }

      case 'generate-script': {
        const result = generateMoveScript(data.preview, data.options)
        return NextResponse.json<APIResponse<typeof result>>({
          success: true,
          data: result,
        })
      }

      default:
        return createErrorResponse('VALIDATION_ERROR', 'Unknown action')
    }
  } catch (error) {
    const copilotError = CopilotErrorHandler.categorizeError(error)
    return createErrorResponse(copilotError.type, copilotError.message)
  }
}

/**
 * GET /api/copilot/local-files
 *
 * Returns API documentation and supported actions
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json<APIResponse<{ actions: string[]; description: string }>>({
    success: true,
    data: {
      description: 'Local file management API for Copilot',
      actions: ['analyze', 'suggest', 'preview', 'generate-script'],
    },
  })
}
