/**
 * GitHub API Rate Limiter
 *
 * Handles GitHub API rate limiting to prevent 403 errors:
 * - Tracks rate limit state from response headers
 * - Provides methods to check if requests can be made
 * - Implements waiting/retry logic when limits are hit
 *
 * GitHub Rate Limits:
 * - Authenticated: 5,000 requests/hour
 * - Unauthenticated: 60 requests/hour
 * - Search API: 30 requests/minute (authenticated)
 */

import type { RateLimitInfo } from './types'

// ============================================
// Rate Limit State
// ============================================

export interface RateLimitState {
  /** Maximum requests allowed per hour */
  limit: number
  /** Remaining requests in current window */
  remaining: number
  /** Unix timestamp when the rate limit resets */
  reset: number
  /** Requests used in current window */
  used: number
  /** Resource type (core, search, graphql, etc.) */
  resource: string
  /** When this state was last updated */
  lastUpdated: number
}

export interface RateLimiterConfig {
  /** Minimum remaining requests before throttling (default: 100) */
  throttleThreshold?: number
  /** Buffer time in ms before reset to start retrying (default: 1000) */
  resetBuffer?: number
  /** Enable detailed logging (default: false) */
  debug?: boolean
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: Required<RateLimiterConfig> = {
  throttleThreshold: 100,
  resetBuffer: 1000,
  debug: false,
}

// Default state for unauthenticated requests
const DEFAULT_STATE: RateLimitState = {
  limit: 60,
  remaining: 60,
  reset: Math.floor(Date.now() / 1000) + 3600,
  used: 0,
  resource: 'core',
  lastUpdated: 0,
}

// ============================================
// GitHubRateLimiter Class
// ============================================

export class GitHubRateLimiter {
  private states: Map<string, RateLimitState> = new Map()
  private config: Required<RateLimiterConfig>
  private pendingRequests: Map<string, Promise<void>> = new Map()

  constructor(config: RateLimiterConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Update rate limit state from GitHub API response headers
   */
  updateFromHeaders(headers: Headers, resource: string = 'core'): void {
    const limit = headers.get('x-ratelimit-limit')
    const remaining = headers.get('x-ratelimit-remaining')
    const reset = headers.get('x-ratelimit-reset')
    const used = headers.get('x-ratelimit-used')

    if (limit && remaining && reset) {
      const state: RateLimitState = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
        used: used ? parseInt(used, 10) : 0,
        resource,
        lastUpdated: Date.now(),
      }

      this.states.set(resource, state)

      if (this.config.debug) {
        console.log(`[RateLimiter] Updated ${resource}:`, state)
      }
    }
  }

  /**
   * Update state from RateLimitInfo object (from API response)
   */
  updateFromInfo(info: RateLimitInfo): void {
    const state: RateLimitState = {
      limit: info.limit,
      remaining: info.remaining,
      reset: info.reset,
      used: info.used,
      resource: info.resource,
      lastUpdated: Date.now(),
    }

    this.states.set(info.resource, state)

    if (this.config.debug) {
      console.log(`[RateLimiter] Updated from info:`, state)
    }
  }

  /**
   * Get current rate limit state for a resource
   */
  getState(resource: string = 'core'): RateLimitState {
    return this.states.get(resource) || { ...DEFAULT_STATE, resource }
  }

  /**
   * Check if a request can be made without hitting rate limits
   */
  canMakeRequest(resource: string = 'core'): boolean {
    const state = this.getState(resource)
    const now = Math.floor(Date.now() / 1000)

    // If reset time has passed, we can make requests
    if (now >= state.reset) {
      return true
    }

    // Check if we have remaining requests
    return state.remaining > 0
  }

  /**
   * Check if we should throttle requests (approaching limit)
   */
  shouldThrottle(resource: string = 'core'): boolean {
    const state = this.getState(resource)
    const now = Math.floor(Date.now() / 1000)

    // If reset time has passed, no need to throttle
    if (now >= state.reset) {
      return false
    }

    // Throttle if remaining is below threshold
    return state.remaining <= this.config.throttleThreshold
  }

  /**
   * Get time in milliseconds until rate limit resets
   */
  getTimeUntilReset(resource: string = 'core'): number {
    const state = this.getState(resource)
    const now = Math.floor(Date.now() / 1000)

    if (now >= state.reset) {
      return 0
    }

    return (state.reset - now) * 1000 + this.config.resetBuffer
  }

  /**
   * Wait until rate limit resets
   * Returns immediately if requests can be made
   */
  async waitForReset(resource: string = 'core'): Promise<void> {
    if (this.canMakeRequest(resource)) {
      return
    }

    // Check if there's already a pending wait for this resource
    const existingWait = this.pendingRequests.get(resource)
    if (existingWait) {
      return existingWait
    }

    const waitTime = this.getTimeUntilReset(resource)

    if (this.config.debug) {
      console.log(`[RateLimiter] Waiting ${waitTime}ms for ${resource} rate limit reset`)
    }

    const waitPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        this.pendingRequests.delete(resource)
        // Reset state after wait
        const state = this.getState(resource)
        this.states.set(resource, {
          ...state,
          remaining: state.limit,
          used: 0,
          reset: Math.floor(Date.now() / 1000) + 3600,
        })
        resolve()
      }, waitTime)
    })

    this.pendingRequests.set(resource, waitPromise)
    return waitPromise
  }

  /**
   * Handle a rate limit error (403 with rate limit exceeded)
   * Extracts retry-after info and waits appropriately
   */
  async handleRateLimitError(headers: Headers, resource: string = 'core'): Promise<void> {
    // Update state from headers first
    this.updateFromHeaders(headers, resource)

    // Check for Retry-After header
    const retryAfter = headers.get('retry-after')
    if (retryAfter) {
      const waitTime = parseInt(retryAfter, 10) * 1000

      if (this.config.debug) {
        console.log(`[RateLimiter] Retry-After header found, waiting ${waitTime}ms`)
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return
    }

    // Fall back to waiting for reset
    await this.waitForReset(resource)
  }

  /**
   * Decrement remaining count after a successful request
   */
  decrementRemaining(resource: string = 'core'): void {
    const state = this.getState(resource)
    if (state.remaining > 0) {
      this.states.set(resource, {
        ...state,
        remaining: state.remaining - 1,
        used: state.used + 1,
        lastUpdated: Date.now(),
      })
    }
  }

  /**
   * Check if a response indicates rate limiting
   */
  isRateLimitError(status: number, headers: Headers): boolean {
    if (status === 403) {
      const remaining = headers.get('x-ratelimit-remaining')
      return remaining === '0'
    }
    return status === 429
  }

  /**
   * Get all rate limit states
   */
  getAllStates(): Map<string, RateLimitState> {
    return new Map(this.states)
  }

  /**
   * Clear all rate limit state (useful for testing)
   */
  clear(): void {
    this.states.clear()
    this.pendingRequests.clear()
  }

  /**
   * Get a summary of current rate limits
   */
  getSummary(): Record<string, { remaining: number; limit: number; resetsIn: string }> {
    const summary: Record<string, { remaining: number; limit: number; resetsIn: string }> = {}
    const now = Math.floor(Date.now() / 1000)

    for (const [resource, state] of this.states) {
      const secondsUntilReset = Math.max(0, state.reset - now)
      const minutes = Math.floor(secondsUntilReset / 60)
      const seconds = secondsUntilReset % 60

      summary[resource] = {
        remaining: state.remaining,
        limit: state.limit,
        resetsIn: secondsUntilReset > 0 ? `${minutes}m ${seconds}s` : 'now',
      }
    }

    return summary
  }
}

// ============================================
// Singleton Instance
// ============================================

let globalRateLimiter: GitHubRateLimiter | null = null

/**
 * Get the global rate limiter instance
 */
export function getGitHubRateLimiter(config?: RateLimiterConfig): GitHubRateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new GitHubRateLimiter(config)
  }
  return globalRateLimiter
}

/**
 * Reset the global rate limiter (useful for testing)
 */
export function resetGitHubRateLimiter(): void {
  if (globalRateLimiter) {
    globalRateLimiter.clear()
  }
  globalRateLimiter = null
}

// ============================================
// Helper Functions
// ============================================

/**
 * Determine the rate limit resource from an API endpoint
 */
export function getResourceFromEndpoint(endpoint: string): string {
  if (endpoint.includes('/search/')) {
    return 'search'
  }
  if (endpoint.includes('/graphql')) {
    return 'graphql'
  }
  if (endpoint.includes('/rate_limit')) {
    return 'rate_limit'
  }
  return 'core'
}

/**
 * Parse Link header for pagination info
 */
export function parseLinkHeader(header: string | null): Record<string, string> {
  if (!header) {
    return {}
  }

  const links: Record<string, string> = {}
  const parts = header.split(',')

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
    if (match) {
      links[match[2]] = match[1]
    }
  }

  return links
}
