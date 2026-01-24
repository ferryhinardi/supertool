/**
 * GitHub API Response Cache
 *
 * In-memory cache with TTL support for GitHub API responses.
 * Reduces API calls and improves response times for repeated requests.
 *
 * Features:
 * - TTL-based expiration
 * - ETag support for conditional requests
 * - Automatic cleanup of expired entries
 * - Memory-efficient with configurable max entries
 */

import type { CacheEntry, CacheOptions } from './types'

// Default cache configuration
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const DEFAULT_MAX_ENTRIES = 1000
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute

/**
 * Cache configuration options
 */
export interface GitHubCacheConfig {
  /** Default TTL for cache entries in milliseconds */
  defaultTTL?: number
  /** Maximum number of entries to store */
  maxEntries?: number
  /** Whether to enable automatic cleanup */
  enableAutoCleanup?: boolean
  /** Interval for automatic cleanup in milliseconds */
  cleanupInterval?: number
}

/**
 * In-memory cache for GitHub API responses
 */
export class GitHubCache {
  private cache: Map<string, CacheEntry<unknown>>
  private config: Required<GitHubCacheConfig>
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: GitHubCacheConfig = {}) {
    this.cache = new Map()
    this.config = {
      defaultTTL: config.defaultTTL ?? DEFAULT_TTL,
      maxEntries: config.maxEntries ?? DEFAULT_MAX_ENTRIES,
      enableAutoCleanup: config.enableAutoCleanup ?? true,
      cleanupInterval: config.cleanupInterval ?? CLEANUP_INTERVAL,
    }

    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * Get a cached value
   * @param key - Cache key
   * @returns The cached value or undefined if not found/expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    return entry.data
  }

  /**
   * Get a cached entry with metadata
   * @param key - Cache key
   * @returns The full cache entry or undefined
   */
  getEntry<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      return undefined
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return undefined
    }

    return entry
  }

  /**
   * Set a cache value
   * @param key - Cache key
   * @param data - Data to cache
   * @param options - Cache options
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest()
    }

    const ttl = options.ttl ?? this.config.defaultTTL
    const now = Date.now()

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    }

    this.cache.set(key, entry as CacheEntry<unknown>)
  }

  /**
   * Set a cache value with ETag for conditional requests
   * @param key - Cache key
   * @param data - Data to cache
   * @param etag - ETag from GitHub response
   * @param options - Cache options
   */
  setWithETag<T>(key: string, data: T, etag: string, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? this.config.defaultTTL
    const now = Date.now()

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      etag,
    }

    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest()
    }

    this.cache.set(key, entry as CacheEntry<unknown>)
  }

  /**
   * Get the ETag for a cached entry
   * @param key - Cache key
   * @returns The ETag or undefined
   */
  getETag(key: string): string | undefined {
    const entry = this.cache.get(key)
    return entry?.etag
  }

  /**
   * Check if a key exists in the cache
   * @param key - Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a cache entry
   * @param key - Cache key
   * @returns True if the entry was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Delete all entries matching a pattern
   * @param pattern - Pattern to match against keys (supports wildcards with *)
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    let deleted = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Clean up expired entries
   * @returns Number of entries cleaned up
   */
  cleanup(): number {
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(): void {
    this.stopAutoCleanup()
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Dispose of the cache and clean up resources
   */
  dispose(): void {
    this.stopAutoCleanup()
    this.clear()
  }

  /**
   * Check if an entry has expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt
  }

  /**
   * Evict the oldest entry to make room for new ones
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * Generate a cache key for GitHub API requests
 * @param parts - Parts of the cache key
 * @returns A normalized cache key
 */
export function generateCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':').toLowerCase()
}

// Singleton instance for shared cache
let globalCache: GitHubCache | null = null

/**
 * Get the global GitHub cache instance
 */
export function getGitHubCache(config?: GitHubCacheConfig): GitHubCache {
  if (!globalCache) {
    globalCache = new GitHubCache(config)
  }
  return globalCache
}

/**
 * Reset the global cache instance (useful for testing)
 */
export function resetGitHubCache(): void {
  if (globalCache) {
    globalCache.dispose()
    globalCache = null
  }
}
