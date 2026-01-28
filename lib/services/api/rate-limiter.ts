/**
 * API Rate Limiter
 *
 * In-memory rate limiter for API routes using sliding window algorithm.
 * Tracks requests per IP/identifier and enforces configurable limits.
 *
 * Features:
 * - Sliding window rate limiting (more accurate than fixed window)
 * - Configurable limits per endpoint
 * - Automatic cleanup of expired entries
 * - Returns proper headers for 429 responses
 *
 * Note: This is an in-memory implementation suitable for single-instance
 * deployments. For distributed deployments, consider using Redis or
 * a similar distributed cache.
 */

// ============================================
// Types
// ============================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional identifier prefix for namespacing */
  keyPrefix?: string
  /** Skip rate limiting for certain identifiers */
  skip?: (identifier: string) => boolean
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Current request count in the window */
  current: number
  /** Maximum allowed requests */
  limit: number
  /** Remaining requests in the window */
  remaining: number
  /** Time in seconds until the window resets */
  resetAfter: number
}

interface RateLimitEntry {
  /** Timestamps of requests within the window */
  timestamps: number[]
  /** When this entry was last accessed (for cleanup) */
  lastAccess: number
}

// ============================================
// Default Configurations
// ============================================

/**
 * Preset rate limit configurations for different use cases
 */
export const RateLimitPresets = {
  /** Chat endpoint - more restrictive due to API costs */
  chat: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
    keyPrefix: 'chat',
  },
  /** Session creation - prevent spam */
  sessionCreate: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 sessions per minute
    keyPrefix: 'session-create',
  },
  /** Session read operations - more lenient */
  sessionRead: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 reads per minute
    keyPrefix: 'session-read',
  },
  /** Session mutations (update/delete) */
  sessionMutate: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 mutations per minute
    keyPrefix: 'session-mutate',
  },
  /** Generic API endpoint */
  default: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute
    keyPrefix: 'api',
  },
} as const satisfies Record<string, RateLimitConfig>

// ============================================
// APIRateLimiter Class
// ============================================

export class APIRateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map()
  private config: Required<RateLimitConfig>
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'api',
      skip: () => false,
      ...config,
    }

    // Start cleanup interval (every 5 minutes)
    this.startCleanup()
  }

  /**
   * Check if a request should be allowed
   */
  check(identifier: string): RateLimitResult {
    // Skip rate limiting if configured
    if (this.config.skip(identifier)) {
      return {
        allowed: true,
        current: 0,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetAfter: 0,
      }
    }

    const key = this.getKey(identifier)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create entry
    let entry = this.entries.get(key)
    if (!entry) {
      entry = { timestamps: [], lastAccess: now }
      this.entries.set(key, entry)
    }

    // Filter timestamps within the current window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)
    entry.lastAccess = now

    const current = entry.timestamps.length
    const remaining = Math.max(0, this.config.maxRequests - current)
    const allowed = current < this.config.maxRequests

    // Calculate time until oldest request expires
    let resetAfter = Math.ceil(this.config.windowMs / 1000)
    if (entry.timestamps.length > 0) {
      const oldestTimestamp = entry.timestamps[0]
      resetAfter = Math.ceil((oldestTimestamp + this.config.windowMs - now) / 1000)
    }

    return {
      allowed,
      current,
      limit: this.config.maxRequests,
      remaining,
      resetAfter: Math.max(0, resetAfter),
    }
  }

  /**
   * Record a request for an identifier
   */
  record(identifier: string): RateLimitResult {
    // First check if allowed
    const result = this.check(identifier)

    // If allowed, record the request
    if (result.allowed) {
      const key = this.getKey(identifier)
      const entry = this.entries.get(key)
      if (entry) {
        entry.timestamps.push(Date.now())
        // Update the result to reflect the new state
        return {
          ...result,
          current: result.current + 1,
          remaining: Math.max(0, result.remaining - 1),
        }
      }
    }

    return result
  }

  /**
   * Check and record in one operation (most common use case)
   */
  consume(identifier: string): RateLimitResult {
    const checkResult = this.check(identifier)

    if (!checkResult.allowed) {
      return checkResult
    }

    return this.record(identifier)
  }

  /**
   * Get rate limit headers for HTTP response
   */
  getHeaders(result: RateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetAfter.toString(),
      ...(result.allowed ? {} : { 'Retry-After': result.resetAfter.toString() }),
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    const key = this.getKey(identifier)
    this.entries.delete(key)
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.entries.clear()
  }

  /**
   * Stop the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Get current state for debugging
   */
  getStats(): {
    totalEntries: number
    config: RateLimitConfig
  } {
    return {
      totalEntries: this.entries.size,
      config: this.config,
    }
  }

  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${identifier}`
  }

  private startCleanup(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const maxAge = this.config.windowMs * 2 // Keep entries for 2x the window

    for (const [key, entry] of this.entries) {
      if (now - entry.lastAccess > maxAge) {
        this.entries.delete(key)
      }
    }
  }
}

// ============================================
// Singleton Instances for Each Preset
// ============================================

const rateLimiters: Map<string, APIRateLimiter> = new Map()

/**
 * Get or create a rate limiter for a specific preset
 */
export function getRateLimiter(
  preset: keyof typeof RateLimitPresets | RateLimitConfig
): APIRateLimiter {
  const config = typeof preset === 'string' ? RateLimitPresets[preset] : preset
  const key = config.keyPrefix ?? 'default'

  let limiter = rateLimiters.get(key)
  if (!limiter) {
    limiter = new APIRateLimiter(config)
    rateLimiters.set(key, limiter)
  }

  return limiter
}

/**
 * Reset all rate limiters (useful for testing)
 */
export function resetAllRateLimiters(): void {
  for (const limiter of rateLimiters.values()) {
    limiter.destroy()
  }
  rateLimiters.clear()
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract client identifier from request
 * Uses IP address with fallback to forwarded headers
 */
export function getClientIdentifier(request: Request): string {
  // Check common headers for real IP (behind proxies/load balancers)
  const headers = request.headers

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp

  // Standard forwarded header
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // Take the first IP (original client)
    return xForwardedFor.split(',')[0].trim()
  }

  // Real IP header (nginx)
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) return xRealIp

  // Vercel
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) return vercelForwardedFor

  // Fallback to a generic identifier
  return 'unknown'
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult, customMessage?: string): Response {
  const message =
    customMessage ?? `Rate limit exceeded. Please try again in ${result.resetAfter} seconds.`

  const limiter = new APIRateLimiter(RateLimitPresets.default)
  const headers = limiter.getHeaders(result)

  return new Response(
    JSON.stringify({
      success: false,
      error: {
        type: 'RATE_LIMIT',
        message,
        code: 'rate_limit_exceeded',
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  )
}

/**
 * Rate limit middleware helper
 * Returns null if allowed, or a Response if rate limited
 */
export function checkRateLimit(
  request: Request,
  preset: keyof typeof RateLimitPresets | RateLimitConfig = 'default'
): { result: RateLimitResult; response: Response | null } {
  const limiter = getRateLimiter(preset)
  const identifier = getClientIdentifier(request)
  const result = limiter.consume(identifier)

  if (!result.allowed) {
    return {
      result,
      response: createRateLimitResponse(result),
    }
  }

  return { result, response: null }
}
