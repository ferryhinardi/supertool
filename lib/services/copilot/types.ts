/**
 * GitHub Copilot SDK Integration - TypeScript Types
 *
 * Comprehensive type definitions for the Copilot service layer,
 * covering all 5 cookbook recipes:
 * 1. Error Handling
 * 2. Multiple Sessions
 * 3. Managing Local Files
 * 4. PR Visualization
 * 5. Persisting Sessions
 */

// ============================================
// Core Message Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface CopilotMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  metadata?: {
    toolCalls?: ToolCall[]
    usage?: TokenUsage
    model?: string
  }
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

// ============================================
// Session Types
// ============================================

export interface CopilotSession {
  id: string
  name: string
  messages: CopilotMessage[]
  context: CopilotContext
  createdAt: number
  updatedAt: number
  expiresAt?: number
}

export interface CopilotContext {
  files?: FileInfo[]
  prNumber?: number
  owner?: string
  repo?: string
  customInstructions?: string
}

export interface SessionMetadata {
  id: string
  name: string
  messageCount: number
  createdAt: number
  updatedAt: number
  preview?: string // First few characters of last message
}

// ============================================
// Chat Request/Response Types
// ============================================

export interface ChatRequest {
  sessionId: string
  message: string
  context?: CopilotContext
  options?: ChatOptions
}

export interface ChatOptions {
  stream?: boolean
  maxTokens?: number
  temperature?: number
  signal?: AbortSignal
}

export interface ChatResponse {
  sessionId: string
  message: CopilotMessage
  usage?: TokenUsage
}

// ============================================
// Streaming Types
// ============================================

export type StreamEventType = 'token' | 'tool_call' | 'tool_result' | 'done' | 'error'

export interface StreamEvent {
  type: StreamEventType
  content?: string
  toolCall?: ToolCall
  toolResult?: ToolResult
  usage?: TokenUsage
  error?: CopilotError
}

// ============================================
// MCP Tool Types
// ============================================

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
  error?: string
}

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, MCPPropertySchema>
    required?: string[]
  }
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

export interface MCPPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: string[]
  items?: MCPPropertySchema
  properties?: Record<string, MCPPropertySchema>
}

// ============================================
// File Management Types (Recipe 3)
// ============================================

export interface FileInfo {
  name: string
  path: string
  size: number
  type: string
  extension: string
  modifiedAt: number
  createdAt?: number
  metadata?: {
    width?: number
    height?: number
    duration?: number
    author?: string
    tags?: string[]
  }
}

export interface FileSuggestion {
  file: FileInfo
  currentPath: string
  suggestedPath: string
  reason: string
  confidence: number // 0-1
  category: string
}

export interface FileOrganizationRequest {
  sessionId: string
  files: FileInfo[]
  preferences?: FileOrganizationPreferences
}

export interface FileOrganizationPreferences {
  groupBy?: 'type' | 'date' | 'project' | 'custom'
  basePath?: string
  dateFormat?: string
  rules?: FileOrganizationRule[]
}

export interface FileOrganizationRule {
  condition: {
    field: keyof FileInfo | string
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex'
    value: string
  }
  action: {
    moveTo: string
    rename?: string
  }
}

export interface FileOrganizationResponse {
  suggestions: FileSuggestion[]
  summary: string
  stats: {
    totalFiles: number
    categorized: number
    uncategorized: number
    byCategory: Record<string, number>
  }
}

// ============================================
// PR Visualization Types (Recipe 4)
// ============================================

export interface PRInfo {
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  author: string
  createdAt: string
  updatedAt: string
  mergedAt?: string
  closedAt?: string
  additions: number
  deletions: number
  changedFiles: number
  commits: number
  comments: number
  reviewComments: number
  labels: string[]
  milestone?: string
  assignees: string[]
  reviewers: string[]
  draft: boolean
  mergeable?: boolean
  baseRef: string
  headRef: string
  body?: string
}

export interface PRVisualizationRequest {
  sessionId: string
  owner: string
  repo: string
  prNumber: number
  visualizations?: PRVisualizationType[]
}

export type PRVisualizationType =
  | 'timeline'
  | 'file_changes'
  | 'review_status'
  | 'commit_activity'
  | 'line_changes'

export interface ChartData {
  type: 'timeline' | 'bar' | 'pie' | 'treemap' | 'line'
  title: string
  data: ChartDataPoint[]
  config?: ChartConfig
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
  children?: ChartDataPoint[]
  metadata?: Record<string, unknown>
}

export interface ChartConfig {
  xAxis?: string
  yAxis?: string
  colors?: string[]
  showLegend?: boolean
  showTooltip?: boolean
  animate?: boolean
}

export interface PRVisualizationResponse {
  pr: PRInfo
  charts: ChartData[]
  insights: string[]
  summary: string
}

// ============================================
// Error Types (Recipe 1)
// ============================================

export type ErrorType =
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'TOOL_ERROR'
  | 'COPILOT_ERROR'
  | 'UNKNOWN_ERROR'

export interface CopilotError {
  type: ErrorType
  message: string
  code?: string
  retryable: boolean
  retryAfter?: number // ms
  details?: Record<string, unknown>
  originalError?: Error
}

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number // ms
  maxDelay?: number // ms
  backoffMultiplier?: number
  timeout?: number // ms
  signal?: AbortSignal
  onRetry?: (attempt: number, error: CopilotError) => void
}

export interface TimeoutOptions {
  timeout: number // ms
  signal?: AbortSignal
  onTimeout?: () => void
}

// ============================================
// Client Manager Types
// ============================================

export interface CopilotClientConfig {
  sessionStorage?: 'memory' | 'redis'
  sessionTTL?: number // seconds
  requestTimeout?: number // ms
  maxMessageLength?: number
  debug?: boolean
}

export interface ClientManagerState {
  isInitialized: boolean
  activeSessionId?: string
  sessionCount: number
  lastError?: CopilotError
}

// ============================================
// API Route Types
// ============================================

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    type: ErrorType
    message: string
    code?: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Analytics Types
// ============================================

export interface CopilotAnalyticsEvent {
  event:
    | 'copilot_session_created'
    | 'copilot_session_deleted'
    | 'copilot_message_sent'
    | 'copilot_message_received'
    | 'copilot_tool_called'
    | 'copilot_file_organized'
    | 'copilot_pr_visualized'
    | 'copilot_error'
  properties: {
    sessionId?: string // anonymized
    messageLength?: number
    toolName?: string
    errorType?: ErrorType
    duration?: number
    [key: string]: unknown
  }
}

// ============================================
// Session Store Interface
// ============================================

export interface SessionStore {
  get(sessionId: string): Promise<CopilotSession | null>
  set(session: CopilotSession): Promise<void>
  delete(sessionId: string): Promise<boolean>
  list(): Promise<SessionMetadata[]>
  cleanup(): Promise<number> // Returns number of expired sessions cleaned
  exists(sessionId: string): Promise<boolean>
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
