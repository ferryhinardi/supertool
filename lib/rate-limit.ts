/**
 * Simple in-memory IP-based rate limiter for Next.js API routes.
 *
 * Limits are tracked per IP address with a sliding window. This is suitable
 * for protecting AI/OpenAI-backed routes from abuse. For multi-instance
 * deployments, consider replacing with a Redis-backed solution such as
 * @upstash/ratelimit.
 *
 * Usage:
 *   const result = checkRateLimit(request, { limit: 10, windowMs: 60_000 })
 *   if (!result.allowed) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 *   }
 */

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. Default: 10 */
  limit?: number
  /** Window size in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number
}

interface RateLimitResult {
  allowed: boolean
  /** How many requests remain in the current window */
  remaining: number
  /** Unix timestamp (ms) when the window resets */
  resetAt: number
}

interface WindowEntry {
  count: number
  resetAt: number
}

// Module-level store shared across all calls within the same serverless process.
// Each key is an IP address, each value tracks request count and reset time.
const store = new Map<string, WindowEntry>()

// Periodically remove expired entries to avoid unbounded memory growth.
// Runs lazily on each rate-limit check rather than a background timer so it
// works in both Node.js server and edge runtimes.
function cleanExpired(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}

/**
 * Extract the best available IP address from the request headers.
 * Supports Vercel's x-forwarded-for and x-real-ip headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; the first is the client
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Check whether the given request is within the rate limit.
 *
 * @param request - The incoming Next.js request
 * @param options - Rate limit configuration
 * @returns RateLimitResult with `allowed`, `remaining`, and `resetAt`
 */
export function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { limit = 10, windowMs = 60_000 } = options
  const ip = getClientIp(request)
  const now = Date.now()

  // Run lazy cleanup every call (cheap O(n) but store stays small)
  if (store.size > 5000) {
    cleanExpired()
  }

  const existing = store.get(ip)

  if (!existing || existing.resetAt <= now) {
    // Start a new window
    const resetAt = now + windowMs
    store.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  existing.count += 1
  const remaining = Math.max(0, limit - existing.count)
  return {
    allowed: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  }
}
