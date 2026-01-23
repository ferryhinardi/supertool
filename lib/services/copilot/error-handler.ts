/**
 * GitHub Copilot SDK Integration - Error Handler
 *
 * Implements robust error handling with:
 * - Exponential backoff retry logic
 * - AbortController-based timeouts
 * - Error categorization and classification
 * - Graceful shutdown support
 */

import type { CopilotError, ErrorType, RetryOptions, TimeoutOptions } from './types'

// Default retry configuration
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'signal' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  timeout: 30000,
}

// Default timeout configuration
const DEFAULT_TIMEOUT = 30000 // 30 seconds

// Error messages by type
const ERROR_MESSAGES: Record<ErrorType, string> = {
  AUTH_ERROR: 'Authentication failed. Please check your GitHub credentials.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait before making more requests.',
  TIMEOUT: 'Request timed out. Please try again.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  VALIDATION_ERROR: 'Invalid input provided.',
  SESSION_NOT_FOUND: 'Session not found. It may have expired or been deleted.',
  SESSION_EXPIRED: 'Session has expired. Please start a new session.',
  TOOL_ERROR: 'Tool execution failed.',
  COPILOT_ERROR: 'GitHub Copilot service error.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
}

// Retryable error types
const RETRYABLE_ERRORS: Set<ErrorType> = new Set([
  'RATE_LIMIT',
  'TIMEOUT',
  'NETWORK_ERROR',
  'COPILOT_ERROR',
])

/**
 * Error handler for GitHub Copilot SDK operations
 * Using a class for namespacing related error handling utilities
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Class used as namespace for error handling utilities
export class CopilotErrorHandler {
  /**
   * Execute an operation with retry logic using exponential backoff
   */
  static async withRetry<T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
    let lastError: CopilotError | null = null
    let attempt = 0

    while (attempt < config.maxRetries) {
      try {
        // Check if operation was aborted
        if (options.signal?.aborted) {
          throw CopilotErrorHandler.createError('TIMEOUT', 'Operation was aborted', {
            reason: options.signal.reason,
          })
        }

        // Execute with timeout if specified
        if (config.timeout > 0) {
          return await CopilotErrorHandler.withTimeout(() => operation(options.signal), {
            timeout: config.timeout,
            signal: options.signal,
          })
        }

        return await operation(options.signal)
      } catch (error) {
        lastError = CopilotErrorHandler.categorizeError(error)
        attempt++

        // Don't retry if not retryable or max retries reached
        if (!CopilotErrorHandler.isRetryable(lastError) || attempt >= config.maxRetries) {
          throw lastError
        }

        // Check for abort before waiting
        if (options.signal?.aborted) {
          throw CopilotErrorHandler.createError(
            'TIMEOUT',
            'Operation was aborted during retry wait'
          )
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.initialDelay * config.backoffMultiplier ** (attempt - 1),
          config.maxDelay
        )

        // If rate limited, use the retry-after value if available
        const actualDelay = lastError.retryAfter ? Math.max(delay, lastError.retryAfter) : delay

        // Notify about retry
        options.onRetry?.(attempt, lastError)

        // Wait before retrying
        await CopilotErrorHandler.delay(actualDelay, options.signal)
      }
    }

    // This should never be reached, but TypeScript needs it
    throw (
      lastError ?? CopilotErrorHandler.createError('UNKNOWN_ERROR', 'Retry exhausted without error')
    )
  }

  /**
   * Execute an operation with a timeout using AbortController
   */
  static async withTimeout<T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT
    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Link to external signal if provided
    const abortHandler = () => {
      controller.abort()
    }

    if (options.signal) {
      if (options.signal.aborted) {
        throw CopilotErrorHandler.createError('TIMEOUT', 'Operation was already aborted')
      }
      options.signal.addEventListener('abort', abortHandler)
    }

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort()
          options.onTimeout?.()
          reject(
            CopilotErrorHandler.createError('TIMEOUT', `Operation timed out after ${timeout}ms`, {
              timeout,
            })
          )
        }, timeout)
      })

      // Race between operation and timeout
      const result = await Promise.race([operation(controller.signal), timeoutPromise])

      return result
    } finally {
      // Clean up
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      if (options.signal) {
        options.signal.removeEventListener('abort', abortHandler)
      }
    }
  }

  /**
   * Categorize an error into a CopilotError with proper type
   */
  static categorizeError(error: unknown): CopilotError {
    // Already a CopilotError
    if (CopilotErrorHandler.isCopilotError(error)) {
      return error
    }

    // Handle AbortError
    if (error instanceof DOMException && error.name === 'AbortError') {
      return CopilotErrorHandler.createError('TIMEOUT', 'Operation was aborted', {
        name: error.name,
      })
    }

    // Handle standard Error
    if (error instanceof Error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return CopilotErrorHandler.createError(
          'NETWORK_ERROR',
          error.message,
          {
            name: error.name,
          },
          error
        )
      }

      // Parse error message for known patterns
      const message = error.message.toLowerCase()

      if (message.includes('unauthorized') || message.includes('401')) {
        return CopilotErrorHandler.createError('AUTH_ERROR', error.message, {}, error)
      }

      if (message.includes('rate limit') || message.includes('429')) {
        const retryAfter = CopilotErrorHandler.parseRetryAfter(error.message)
        return CopilotErrorHandler.createError('RATE_LIMIT', error.message, { retryAfter }, error)
      }

      if (message.includes('timeout') || message.includes('timed out')) {
        return CopilotErrorHandler.createError('TIMEOUT', error.message, {}, error)
      }

      if (
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')
      ) {
        return CopilotErrorHandler.createError('NETWORK_ERROR', error.message, {}, error)
      }

      if (message.includes('validation') || message.includes('invalid')) {
        return CopilotErrorHandler.createError('VALIDATION_ERROR', error.message, {}, error)
      }

      if (message.includes('session not found') || message.includes('session_not_found')) {
        return CopilotErrorHandler.createError('SESSION_NOT_FOUND', error.message, {}, error)
      }

      if (message.includes('session expired') || message.includes('session_expired')) {
        return CopilotErrorHandler.createError('SESSION_EXPIRED', error.message, {}, error)
      }

      // Default to Copilot error for unrecognized errors
      return CopilotErrorHandler.createError(
        'COPILOT_ERROR',
        error.message,
        {
          name: error.name,
          stack: error.stack,
        },
        error
      )
    }

    // Handle HTTP response errors
    if (typeof error === 'object' && error !== null) {
      const obj = error as Record<string, unknown>

      if ('status' in obj && typeof obj.status === 'number') {
        return CopilotErrorHandler.categorizeHttpError(
          obj.status,
          obj.message as string | undefined
        )
      }

      if ('statusCode' in obj && typeof obj.statusCode === 'number') {
        return CopilotErrorHandler.categorizeHttpError(
          obj.statusCode,
          obj.message as string | undefined
        )
      }
    }

    // Unknown error type
    return CopilotErrorHandler.createError('UNKNOWN_ERROR', String(error), {
      originalValue: error,
    })
  }

  /**
   * Categorize HTTP status code errors
   */
  private static categorizeHttpError(status: number, message?: string): CopilotError {
    const errorMessage = message || `HTTP error ${status}`

    switch (status) {
      case 401:
      case 403:
        return CopilotErrorHandler.createError('AUTH_ERROR', errorMessage, { status })
      case 404:
        return CopilotErrorHandler.createError('SESSION_NOT_FOUND', errorMessage, { status })
      case 408:
        return CopilotErrorHandler.createError('TIMEOUT', errorMessage, { status })
      case 422:
        return CopilotErrorHandler.createError('VALIDATION_ERROR', errorMessage, { status })
      case 429: {
        return CopilotErrorHandler.createError('RATE_LIMIT', errorMessage, { status })
      }
      case 500:
      case 502:
      case 503:
      case 504:
        return CopilotErrorHandler.createError('COPILOT_ERROR', errorMessage, { status })
      default:
        return CopilotErrorHandler.createError('UNKNOWN_ERROR', errorMessage, { status })
    }
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: CopilotError): boolean {
    return error.retryable || RETRYABLE_ERRORS.has(error.type)
  }

  /**
   * Create a structured CopilotError
   */
  static createError(
    type: ErrorType,
    message?: string,
    details?: Record<string, unknown>,
    originalError?: Error
  ): CopilotError {
    return {
      type,
      message: message || ERROR_MESSAGES[type],
      retryable: RETRYABLE_ERRORS.has(type),
      retryAfter: details?.retryAfter as number | undefined,
      details,
      originalError,
    }
  }

  /**
   * Type guard for CopilotError
   */
  static isCopilotError(error: unknown): error is CopilotError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error &&
      'retryable' in error &&
      typeof (error as CopilotError).type === 'string' &&
      typeof (error as CopilotError).message === 'string' &&
      typeof (error as CopilotError).retryable === 'boolean'
    )
  }

  /**
   * Parse retry-after value from error message or headers
   */
  private static parseRetryAfter(message: string): number | undefined {
    // Try to find "retry after X seconds" pattern
    const match = message.match(/retry\s*(?:after|in)\s*(\d+)\s*(?:s|sec|seconds?)?/i)
    if (match) {
      return parseInt(match[1], 10) * 1000 // Convert to ms
    }
    return undefined
  }

  /**
   * Delay execution with abort support
   */
  private static delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(CopilotErrorHandler.createError('TIMEOUT', 'Delay was aborted'))
        return
      }

      const timeoutId = setTimeout(resolve, ms)

      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(CopilotErrorHandler.createError('TIMEOUT', 'Delay was aborted'))
      })
    })
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: CopilotError): Record<string, unknown> {
    return {
      type: error.type,
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      retryAfter: error.retryAfter,
      details: error.details,
      // Don't include originalError.stack in production logs
      hasOriginalError: !!error.originalError,
    }
  }

  /**
   * Format error for API response (safe to send to client)
   */
  static formatForResponse(error: CopilotError): {
    type: ErrorType
    message: string
    code?: string
    retryAfter?: number
  } {
    return {
      type: error.type,
      message: error.message,
      code: error.code,
      retryAfter: error.retryAfter,
    }
  }
}

/**
 * Convenience function for wrapping async operations with error handling
 */
export async function withCopilotErrorHandling<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return CopilotErrorHandler.withRetry(operation, options)
}

/**
 * Create an abort controller with timeout
 */
export function createTimeoutAbortController(timeout: number): {
  controller: AbortController
  cleanup: () => void
} {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  }
}
