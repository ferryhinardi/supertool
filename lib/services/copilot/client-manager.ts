/**
 * GitHub Copilot SDK Integration - Client Manager
 *
 * Singleton class that manages:
 * - Copilot API client lifecycle
 * - Session creation and management
 * - Message sending (both streaming and non-streaming)
 * - Graceful shutdown
 */

import { CopilotErrorHandler } from './error-handler'
import { createSession, generateSessionId, InMemorySessionStore } from './session-store'
import type {
  ChatOptions,
  ChatResponse,
  ClientManagerState,
  CopilotClientConfig,
  CopilotMessage,
  CopilotSession,
  SessionMetadata,
  SessionStore,
  StreamEvent,
  TokenUsage,
} from './types'

// Default configuration
const DEFAULT_CONFIG: Required<CopilotClientConfig> = {
  sessionStorage: 'memory',
  sessionTTL: 30 * 60, // 30 minutes in seconds
  requestTimeout: 30000, // 30 seconds
  maxMessageLength: 32000,
  debug: false,
}

// GitHub Copilot API endpoint (placeholder - will be configured based on actual SDK)
const _COPILOT_API_BASE = 'https://api.github.com/copilot'

/**
 * Singleton class for managing GitHub Copilot SDK interactions
 *
 * Usage:
 * ```typescript
 * const manager = CopilotClientManager.getInstance()
 * await manager.initialize()
 *
 * const session = await manager.createSession('My Chat')
 * const response = await manager.sendMessage(session.id, 'Hello!')
 * ```
 */
export class CopilotClientManager {
  private static instance: CopilotClientManager | null = null
  private store: SessionStore
  private config: Required<CopilotClientConfig>
  private isInitialized = false
  private activeSessionId?: string
  private lastError?: ReturnType<typeof CopilotErrorHandler.createError>

  private constructor(config: CopilotClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.store = new InMemorySessionStore({
      ttl: this.config.sessionTTL * 1000, // Convert to ms
    })
  }

  /**
   * Get the singleton instance of CopilotClientManager
   */
  static getInstance(config?: CopilotClientConfig): CopilotClientManager {
    if (!CopilotClientManager.instance) {
      CopilotClientManager.instance = new CopilotClientManager(config)
    }
    return CopilotClientManager.instance
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    if (CopilotClientManager.instance) {
      CopilotClientManager.instance.shutdown()
      CopilotClientManager.instance = null
    }
  }

  /**
   * Initialize the client manager
   * Must be called before using other methods
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('Already initialized')
      return
    }

    try {
      // Future: Initialize Copilot SDK client here
      // For now, we just mark as initialized
      this.isInitialized = true
      this.log('Initialized successfully')
    } catch (error) {
      this.lastError = CopilotErrorHandler.categorizeError(error)
      throw this.lastError
    }
  }

  /**
   * Gracefully shutdown the client manager
   * Cleans up resources and stops background tasks
   */
  async shutdown(): Promise<void> {
    this.log('Shutting down...')

    try {
      // Destroy the session store (stops cleanup interval)
      if (this.store instanceof InMemorySessionStore) {
        this.store.destroy()
      }

      this.isInitialized = false
      this.activeSessionId = undefined
      this.log('Shutdown complete')
    } catch (error) {
      this.lastError = CopilotErrorHandler.categorizeError(error)
      console.error('[CopilotClientManager] Shutdown error:', error)
    }
  }

  /**
   * Get the current state of the client manager
   */
  getState(): ClientManagerState {
    return {
      isInitialized: this.isInitialized,
      activeSessionId: this.activeSessionId,
      sessionCount: this.store instanceof InMemorySessionStore ? this.store.size : 0,
      lastError: this.lastError,
    }
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Create a new chat session
   */
  async createSession(name?: string): Promise<CopilotSession> {
    this.ensureInitialized()

    const sessionId = generateSessionId()
    const sessionName = name || `Session ${new Date().toLocaleDateString()}`
    const session = createSession(sessionId, sessionName)

    await this.store.set(session)
    this.activeSessionId = session.id
    this.log(`Created session: ${session.id}`)

    return session
  }

  /**
   * Get a session by ID
   * Returns null if session doesn't exist or has expired
   */
  async getSession(sessionId: string): Promise<CopilotSession | null> {
    this.ensureInitialized()
    return this.store.get(sessionId)
  }

  /**
   * Delete a session by ID
   * Returns true if session was deleted
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    this.ensureInitialized()

    const deleted = await this.store.delete(sessionId)

    if (deleted) {
      this.log(`Deleted session: ${sessionId}`)
      if (this.activeSessionId === sessionId) {
        this.activeSessionId = undefined
      }
    }

    return deleted
  }

  /**
   * List all active sessions
   * Returns metadata for each session (not full message history)
   */
  async listSessions(): Promise<SessionMetadata[]> {
    this.ensureInitialized()
    return this.store.list()
  }

  /**
   * Update a session's name
   */
  async renameSession(sessionId: string, newName: string): Promise<CopilotSession | null> {
    this.ensureInitialized()

    const session = await this.store.get(sessionId)
    if (!session) {
      return null
    }

    const updatedSession: CopilotSession = {
      ...session,
      name: newName,
      updatedAt: Date.now(),
    }

    await this.store.set(updatedSession)
    return updatedSession
  }

  /**
   * Set the active session
   */
  setActiveSession(sessionId: string | undefined): void {
    this.activeSessionId = sessionId
  }

  /**
   * Get the active session ID
   */
  getActiveSessionId(): string | undefined {
    return this.activeSessionId
  }

  // ============================================
  // Message Handling
  // ============================================

  /**
   * Send a message and get a response (non-streaming)
   */
  async sendMessage(
    sessionId: string,
    message: string,
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    this.ensureInitialized()

    // Validate message length
    if (message.length > this.config.maxMessageLength) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        `Message exceeds maximum length of ${this.config.maxMessageLength} characters`
      )
    }

    // Get or validate session
    const session = await this.store.get(sessionId)
    if (!session) {
      throw CopilotErrorHandler.createError(
        'SESSION_NOT_FOUND',
        `Session ${sessionId} not found or expired`
      )
    }

    // Create user message
    const userMessage: CopilotMessage = {
      id: generateSessionId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }

    // Add user message to session
    session.messages.push(userMessage)

    try {
      // Execute with retry and timeout
      const response = await CopilotErrorHandler.withRetry(
        async (signal) => {
          return this.callCopilotAPI(session, userMessage, {
            ...options,
            signal: signal ?? options.signal,
          })
        },
        {
          timeout: options.signal ? undefined : this.config.requestTimeout,
          signal: options.signal,
        }
      )

      // Add assistant message to session
      session.messages.push(response.message)
      session.updatedAt = Date.now()
      await this.store.set(session)

      this.log(`Message sent in session ${sessionId}`)
      return response
    } catch (error) {
      // Remove user message on failure
      session.messages.pop()
      this.lastError = CopilotErrorHandler.categorizeError(error)
      throw this.lastError
    }
  }

  /**
   * Send a message with streaming response
   */
  async *streamMessage(
    sessionId: string,
    message: string,
    options: ChatOptions = {}
  ): AsyncGenerator<StreamEvent> {
    this.ensureInitialized()

    // Validate message length
    if (message.length > this.config.maxMessageLength) {
      yield {
        type: 'error',
        error: CopilotErrorHandler.createError(
          'VALIDATION_ERROR',
          `Message exceeds maximum length of ${this.config.maxMessageLength} characters`
        ),
      }
      return
    }

    // Get or validate session
    const session = await this.store.get(sessionId)
    if (!session) {
      yield {
        type: 'error',
        error: CopilotErrorHandler.createError(
          'SESSION_NOT_FOUND',
          `Session ${sessionId} not found or expired`
        ),
      }
      return
    }

    // Create user message
    const userMessage: CopilotMessage = {
      id: generateSessionId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }

    // Add user message to session
    session.messages.push(userMessage)
    session.updatedAt = Date.now()
    await this.store.set(session)

    let fullContent = ''
    let usage: TokenUsage | undefined

    try {
      // Stream tokens from Copilot API
      for await (const event of this.streamCopilotAPI(session, userMessage, options)) {
        if (event.type === 'token' && event.content) {
          fullContent += event.content
        }
        if (event.type === 'done' && event.usage) {
          usage = event.usage
        }
        yield event
      }

      // Create and save assistant message
      const assistantMessage: CopilotMessage = {
        id: generateSessionId(),
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
        metadata: { usage },
      }

      session.messages.push(assistantMessage)
      session.updatedAt = Date.now()
      await this.store.set(session)

      this.log(`Streaming message completed in session ${sessionId}`)
    } catch (error) {
      this.lastError = CopilotErrorHandler.categorizeError(error)
      yield {
        type: 'error',
        error: this.lastError,
      }
    }
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * Ensure the client is initialized before operations
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'CopilotClientManager is not initialized. Call initialize() first.'
      )
    }
  }

  /**
   * Call the Copilot API (non-streaming)
   * This is a placeholder that will be replaced with actual SDK calls
   */
  private async callCopilotAPI(
    session: CopilotSession,
    _userMessage: CopilotMessage,
    _options: ChatOptions
  ): Promise<ChatResponse> {
    // TODO: Replace with actual GitHub Copilot SDK call
    // For now, return a mock response for development

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    const assistantMessage: CopilotMessage = {
      id: generateSessionId(),
      role: 'assistant',
      content: this.getMockResponse(session),
      timestamp: Date.now(),
      metadata: {
        model: 'gpt-4',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      },
    }

    return {
      sessionId: session.id,
      message: assistantMessage,
      usage: assistantMessage.metadata?.usage,
    }
  }

  /**
   * Stream from the Copilot API
   * This is a placeholder that will be replaced with actual SDK calls
   */
  private async *streamCopilotAPI(
    session: CopilotSession,
    _userMessage: CopilotMessage,
    _options: ChatOptions
  ): AsyncGenerator<StreamEvent> {
    // TODO: Replace with actual GitHub Copilot SDK streaming call
    // For now, simulate streaming response

    const mockResponse = this.getMockResponse(session)
    const words = mockResponse.split(' ')

    // Simulate streaming tokens
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      yield {
        type: 'token',
        content: `${word} `,
      }
    }

    // Send done event with usage
    yield {
      type: 'done',
      usage: {
        promptTokens: 100,
        completionTokens: words.length * 2,
        totalTokens: 100 + words.length * 2,
      },
    }
  }

  /**
   * Get a mock response for development
   */
  private getMockResponse(session: CopilotSession): string {
    const messageCount = session.messages.length
    const lastUserMessage = session.messages.filter((m) => m.role === 'user').pop()

    if (!lastUserMessage) {
      return 'Hello! How can I help you today?'
    }

    const content = lastUserMessage.content.toLowerCase()

    if (content.includes('hello') || content.includes('hi')) {
      return `Hello! I'm your AI assistant. This is session "${session.name}" with ${messageCount} messages so far. How can I help you?`
    }

    if (content.includes('help')) {
      return `I can help you with various tasks including:
- Answering questions about code
- Organizing files (Recipe 3)
- Visualizing PR data (Recipe 4)
- General assistance

What would you like to know more about?`
    }

    return `I received your message: "${lastUserMessage.content.slice(0, 50)}${lastUserMessage.content.length > 50 ? '...' : ''}". This is a mock response for development. The actual Copilot SDK integration will provide real AI responses.`
  }

  /**
   * Log debug messages if debug mode is enabled
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[CopilotClientManager] ${message}`)
    }
  }
}

/**
 * Get the global CopilotClientManager instance
 * Convenience function for accessing the singleton
 */
export function getCopilotManager(config?: CopilotClientConfig): CopilotClientManager {
  return CopilotClientManager.getInstance(config)
}

/**
 * Initialize and return the Copilot client manager
 * Convenience function for quick setup
 */
export async function initializeCopilotManager(
  config?: CopilotClientConfig
): Promise<CopilotClientManager> {
  const manager = CopilotClientManager.getInstance(config)
  await manager.initialize()
  return manager
}
