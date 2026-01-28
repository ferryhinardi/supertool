/**
 * API Services
 *
 * Shared utilities for API routes including rate limiting,
 * authentication helpers, and response utilities.
 */

export {
  APIRateLimiter,
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  getRateLimiter,
  type RateLimitConfig,
  RateLimitPresets,
  type RateLimitResult,
  resetAllRateLimiters,
} from './rate-limiter'
