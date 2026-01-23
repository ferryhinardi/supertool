/**
 * GitHub Copilot SDK Integration - Session Store
 *
 * In-memory session storage implementation with:
 * - TTL-based expiration
 * - Automatic cleanup interval
 * - Session metadata extraction
 * - Graceful shutdown support
 */

import type { CopilotSession, SessionMetadata, SessionStore } from './types'

// Default configuration
const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes in ms
const DEFAULT_CLEANUP_INTERVAL = 60 * 1000 // 60 seconds

export interface SessionStoreOptions {
  /** Time-to-live for sessions in milliseconds (default: 30 minutes) */
  ttl?: number
  /** Interval for automatic cleanup in milliseconds (default: 60 seconds) */
  cleanupIntervalMs?: number
  /** Maximum number of messages to include in preview */
  previewLength?: number
}

/**
 * Convert a CopilotSession to SessionMetadata for listing
 */
function toMetadata(session: CopilotSession, previewLength = 100): SessionMetadata {
  const lastMessage = session.messages[session.messages.length - 1]
  let preview: string | undefined

  if (lastMessage?.content) {
    preview =
      lastMessage.content.length > previewLength
        ? `${lastMessage.content.slice(0, previewLength)}...`
        : lastMessage.content
  }

  return {
    id: session.id,
    name: session.name,
    messageCount: session.messages.length,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    preview,
  }
}

/**
 * In-memory implementation of SessionStore
 *
 * Features:
 * - Map-based storage for O(1) access
 * - Automatic TTL-based expiration checking
 * - Background cleanup of expired sessions
 * - Thread-safe async interface (ready for Redis migration)
 */
export class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, CopilotSession>
  private ttl: number
  private previewLength: number
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(options: SessionStoreOptions = {}) {
    this.sessions = new Map()
    this.ttl = options.ttl ?? DEFAULT_TTL
    this.previewLength = options.previewLength ?? 100

    // Start automatic cleanup if interval is specified
    const cleanupIntervalMs = options.cleanupIntervalMs ?? DEFAULT_CLEANUP_INTERVAL
    if (cleanupIntervalMs > 0) {
      this.startCleanupInterval(cleanupIntervalMs)
    }
  }

  /**
   * Get a session by ID
   * Returns null if session doesn't exist or has expired
   */
  async get(sessionId: string): Promise<CopilotSession | null> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session has expired
    if (this.isExpired(session)) {
      // Remove expired session
      this.sessions.delete(sessionId)
      return null
    }

    return session
  }

  /**
   * Store or update a session
   * Automatically sets expiresAt based on TTL
   */
  async set(session: CopilotSession): Promise<void> {
    // Set expiration time if not already set
    const sessionWithExpiry: CopilotSession = {
      ...session,
      expiresAt: session.expiresAt ?? Date.now() + this.ttl,
      updatedAt: Date.now(),
    }

    this.sessions.set(session.id, sessionWithExpiry)
  }

  /**
   * Delete a session by ID
   * Returns true if session was deleted, false if it didn't exist
   */
  async delete(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId)
  }

  /**
   * List all active (non-expired) sessions as metadata
   * Sorted by updatedAt descending (most recent first)
   */
  async list(): Promise<SessionMetadata[]> {
    const now = Date.now()
    const metadata: SessionMetadata[] = []

    for (const session of this.sessions.values()) {
      // Skip expired sessions
      if (session.expiresAt && session.expiresAt <= now) {
        continue
      }
      metadata.push(toMetadata(session, this.previewLength))
    }

    // Sort by updatedAt descending
    return metadata.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  /**
   * Check if a session exists and is not expired
   */
  async exists(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId)
    return session !== null
  }

  /**
   * Clean up expired sessions
   * Returns the number of sessions that were removed
   */
  async cleanup(): Promise<number> {
    const now = Date.now()
    let removed = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isExpired(session, now)) {
        this.sessions.delete(sessionId)
        removed++
      }
    }

    return removed
  }

  /**
   * Get the current number of sessions (including possibly expired ones)
   */
  get size(): number {
    return this.sessions.size
  }

  /**
   * Extend a session's expiration time
   */
  async touch(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId)
    if (!session) {
      return false
    }

    session.expiresAt = Date.now() + this.ttl
    session.updatedAt = Date.now()
    this.sessions.set(sessionId, session)
    return true
  }

  /**
   * Clear all sessions
   */
  async clear(): Promise<void> {
    this.sessions.clear()
  }

  /**
   * Stop the cleanup interval and clear all sessions
   * Call this on application shutdown
   */
  destroy(): void {
    this.stopCleanupInterval()
    this.sessions.clear()
  }

  /**
   * Check if a session has expired
   */
  private isExpired(session: CopilotSession, now: number = Date.now()): boolean {
    return session.expiresAt !== undefined && session.expiresAt <= now
  }

  /**
   * Start the automatic cleanup interval
   */
  private startCleanupInterval(intervalMs: number): void {
    // Clear any existing interval first
    this.stopCleanupInterval()

    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch((error) => {
        // Log error but don't throw - cleanup should be resilient
        console.error('[SessionStore] Cleanup error:', error)
      })
    }, intervalMs)

    // Ensure the interval doesn't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Stop the automatic cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Create a new session store instance
 * Factory function for easier instantiation
 */
export function createSessionStore(options?: SessionStoreOptions): SessionStore {
  return new InMemorySessionStore(options)
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  // Use crypto.randomUUID if available (Node 16+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback to timestamp + random string
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}`
}

/**
 * Create a new empty session
 */
export function createSession(
  id: string = generateSessionId(),
  name: string = 'New Session'
): CopilotSession {
  const now = Date.now()
  return {
    id,
    name,
    messages: [],
    context: {},
    createdAt: now,
    updatedAt: now,
  }
}
