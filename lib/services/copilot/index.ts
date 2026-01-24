/**
 * GitHub Copilot SDK Integration - Public API
 *
 * Barrel export for all Copilot service functionality.
 * This module provides a unified interface for:
 * - Error handling with retry logic and categorization
 * - Session management with TTL expiration
 * - Copilot client management for streaming/non-streaming chat
 * - MCP tool registry for extensible tool execution
 */

// Client Manager - Copilot API client with streaming support
export {
  CopilotClientManager,
  getCopilotManager,
  initializeCopilotManager,
} from './client-manager'

// Error Handler - Retry logic, timeout handling, error categorization
export {
  CopilotErrorHandler,
  createTimeoutAbortController,
  withCopilotErrorHandling,
} from './error-handler'
// MCP Tools - Tool registry and execution
export {
  executeToolCall,
  getMCPToolRegistry,
  MCPToolRegistry,
} from './mcp-tools'
export type { SessionStoreOptions } from './session-store'
// Session Store - In-memory session storage with TTL
export {
  createSession,
  createSessionStore,
  generateSessionId,
  InMemorySessionStore,
} from './session-store'
// Types - All type definitions for the Copilot integration
export type {
  // API Response types
  APIResponse,
  ChartConfig,
  ChartData,
  ChartDataPoint,
  // Chat types
  ChatOptions,
  ChatRequest,
  ChatResponse,
  ClientManagerState,
  // Analytics types
  CopilotAnalyticsEvent,
  // Client config types
  CopilotClientConfig,
  CopilotContext,
  CopilotError,
  CopilotMessage,
  // Session types
  CopilotSession,
  // Utility types
  DeepPartial,
  // Error types
  ErrorType,
  // File attachment types
  FileAttachment,
  // File management types (Recipe 3)
  FileInfo,
  FileOrganizationPreferences,
  FileOrganizationRequest,
  FileOrganizationResponse,
  FileOrganizationRule,
  FileSuggestion,
  MCPPropertySchema,
  MCPToolDefinition,
  // Core Message types
  MessageRole,
  PaginatedResponse,
  // PR visualization types (Recipe 4)
  PRInfo,
  PRVisualizationRequest,
  PRVisualizationResponse,
  PRVisualizationType,
  RequiredFields,
  RetryOptions,
  SessionMetadata,
  SessionStore,
  StreamEvent,
  // Streaming types
  StreamEventType,
  SupportedDocumentType,
  SupportedFileType,
  SupportedImageType,
  TimeoutOptions,
  TokenUsage,
  // MCP Tool types
  ToolCall,
  ToolResult,
} from './types'

// File attachment constants
export {
  MAX_ATTACHMENTS_PER_MESSAGE,
  MAX_FILE_SIZE,
  SUPPORTED_DOCUMENT_TYPES,
  SUPPORTED_FILE_TYPES,
  SUPPORTED_IMAGE_TYPES,
} from './types'
