/**
 * GitHub Copilot SDK Integration - Client Manager
 *
 * Singleton class that manages:
 * - Copilot API client lifecycle
 * - Session creation and management
 * - Message sending (both streaming and non-streaming)
 * - Graceful shutdown
 */

import OpenAI from 'openai'
import { CopilotErrorHandler } from './error-handler'
import { createSession, createSessionStore, generateSessionId } from './session-store'
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

// Global reference for singleton persistence across HMR (Hot Module Reloading)
// This ensures the same instance is reused in Next.js dev mode
const globalForCopilot = globalThis as unknown as {
  copilotManager: CopilotClientManager | undefined
}

// OpenAI model configuration
const OPENAI_MODEL = 'gpt-4o-mini'
const OPENAI_MAX_TOKENS = 2048
const OPENAI_TEMPERATURE = 0.7

// System prompt for the copilot assistant
const SYSTEM_PROMPT = `You are SuperTool Assistant, a helpful AI assistant integrated into the SuperTool platform.

SuperTool is a comprehensive toolkit application that provides various utilities including:
- Unit Converter: Convert between different units of measurement
- Color Picker: Select and convert colors between formats
- QR Code Generator: Create QR codes from text or URLs
- JSON Formatter: Format and validate JSON data
- Base64 Encoder/Decoder: Encode and decode Base64 strings
- UUID Generator: Generate unique identifiers
- Markdown Preview: Preview markdown content
- Regex Tester: Test and validate regular expressions
- AI Code Snippet Generator: Generate code snippets using AI
- And many more tools

Your role is to:
1. Help users understand and use the various tools available in SuperTool
2. Provide guidance on best practices for each tool
3. Answer questions about coding, development, and general technical topics
4. Be friendly, concise, and helpful in your responses
5. If you don't know something, admit it rather than making up information

Keep your responses clear and well-formatted. Use markdown when appropriate for code blocks, lists, and emphasis.`

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
  private store: SessionStore
  private config: Required<CopilotClientConfig>
  private isInitialized = false
  private activeSessionId?: string
  private lastError?: ReturnType<typeof CopilotErrorHandler.createError>
  private openai: OpenAI | null = null

  private constructor(config: CopilotClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.store = createSessionStore({
      ttl: this.config.sessionTTL * 1000, // Convert to ms
    })
  }

  /**
   * Get the singleton instance of CopilotClientManager
   * Uses globalThis to persist across Next.js HMR in development
   */
  static getInstance(config?: CopilotClientConfig): CopilotClientManager {
    if (!globalForCopilot.copilotManager) {
      globalForCopilot.copilotManager = new CopilotClientManager(config)
    }
    return globalForCopilot.copilotManager
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    if (globalForCopilot.copilotManager) {
      globalForCopilot.copilotManager.shutdown()
      globalForCopilot.copilotManager = undefined
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
      // Initialize OpenAI client if API key is available
      const apiKey = process.env.OPENAI_API_KEY
      if (apiKey) {
        this.openai = new OpenAI({ apiKey })
        this.log('OpenAI client initialized')
      } else {
        this.log('OPENAI_API_KEY not set - using mock responses')
      }

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
      // Destroy the session store if it supports it (stops cleanup interval for in-memory store)
      if ('destroy' in this.store && typeof this.store.destroy === 'function') {
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
      sessionCount: 'size' in this.store ? (this.store as { size: number }).size : 0,
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
   * Uses OpenAI API when available, falls back to mock responses
   */
  private async callCopilotAPI(
    session: CopilotSession,
    _userMessage: CopilotMessage,
    _options: ChatOptions
  ): Promise<ChatResponse> {
    // If no OpenAI client, fall back to mock response
    if (!this.openai) {
      this.log('No OpenAI client available, using mock response')
      await new Promise((resolve) => setTimeout(resolve, 500))

      const assistantMessage: CopilotMessage = {
        id: generateSessionId(),
        role: 'assistant',
        content: this.getMockResponse(session),
        timestamp: Date.now(),
        metadata: {
          model: 'mock',
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

    // Build messages array from session history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Call OpenAI API
    const response = await this.openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: OPENAI_MAX_TOKENS,
      temperature: OPENAI_TEMPERATURE,
    })

    const content = response.choices[0]?.message?.content || ''
    const usage: TokenUsage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    }

    const assistantMessage: CopilotMessage = {
      id: generateSessionId(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      metadata: { model: OPENAI_MODEL, usage },
    }

    return {
      sessionId: session.id,
      message: assistantMessage,
      usage,
    }
  }

  /**
   * Stream from the Copilot API
   * Uses OpenAI API streaming when available, falls back to mock streaming
   */
  private async *streamCopilotAPI(
    session: CopilotSession,
    _userMessage: CopilotMessage,
    _options: ChatOptions
  ): AsyncGenerator<StreamEvent> {
    // If no OpenAI client, fall back to mock streaming
    if (!this.openai) {
      this.log('No OpenAI client available, using mock streaming')
      const mockResponse = this.getMockResponse(session)
      const words = mockResponse.split(' ')

      for (const word of words) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        yield {
          type: 'token' as const,
          content: `${word} `,
        }
      }

      yield {
        type: 'done',
        usage: {
          promptTokens: 100,
          completionTokens: words.length * 2,
          totalTokens: 100 + words.length * 2,
        },
      }
      return
    }

    // Build messages array from session history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Call OpenAI API with streaming
    const stream = await this.openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: OPENAI_MAX_TOKENS,
      temperature: OPENAI_TEMPERATURE,
      stream: true,
    })

    let totalTokens = 0
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        totalTokens++
        yield { type: 'token', content }
      }
    }

    // Send done event with usage
    yield {
      type: 'done',
      usage: {
        promptTokens: 0, // Not available in streaming mode
        completionTokens: totalTokens,
        totalTokens: totalTokens,
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
