/**
 * Repository Context Types for AI Prompts
 *
 * Type definitions for building intelligent context from GitHub repository data.
 * Used by RepoContextBuilder to prepare structured context for AI interactions.
 */

import type {
  CodeSearchItem,
  Commit,
  FileContent,
  FileTreeItem,
  Issue,
  IssueDetail,
  PRDetail,
  PullRequest,
} from '@/lib/services/github'

// ============================================
// Context Type Enums
// ============================================

/**
 * Types of context chunks that can be included in AI prompts
 */
export type ContextType =
  | 'file'
  | 'pr'
  | 'pr_diff'
  | 'pr_review'
  | 'issue'
  | 'issue_comment'
  | 'commit'
  | 'search'
  | 'tree'
  | 'custom'

/**
 * Priority levels for token budget allocation
 * Higher priority chunks are kept when trimming to fit token limits
 */
export type ContextPriority = 'critical' | 'high' | 'medium' | 'low'

// ============================================
// Context Chunk Types
// ============================================

/**
 * Individual piece of context to include in AI prompt
 */
export interface ContextChunk {
  /** Unique identifier for this chunk */
  id: string
  /** Type of content */
  type: ContextType
  /** Priority for token budget allocation */
  priority: ContextPriority
  /** Human-readable label for this chunk */
  label: string
  /** The actual content to include in the prompt */
  content: string
  /** Estimated token count (calculated by context builder) */
  estimatedTokens: number
  /** Original source reference */
  source: ContextSource
  /** Additional metadata */
  metadata?: ContextChunkMetadata
}

/**
 * Source reference for a context chunk
 */
export interface ContextSource {
  /** GitHub owner */
  owner: string
  /** GitHub repo name */
  repo: string
  /** File path, PR number, issue number, etc. */
  ref: string
  /** Direct URL to the source */
  url?: string
  /** SHA for version pinning */
  sha?: string
}

/**
 * Optional metadata for context chunks
 */
export interface ContextChunkMetadata {
  /** Programming language (for syntax highlighting hints) */
  language?: string
  /** Line range if partial file */
  lineRange?: { start: number; end: number }
  /** File size in bytes */
  fileSize?: number
  /** Last modified date */
  modifiedAt?: string
  /** Author information */
  author?: string
  /** Related chunks (e.g., PR has related diff chunks) */
  relatedChunks?: string[]
  /** Custom tags for filtering */
  tags?: string[]
}

// ============================================
// Token Budget Types
// ============================================

/**
 * Token budget configuration and tracking
 */
export interface TokenBudget {
  /** Maximum total tokens allowed */
  maxTokens: number
  /** Tokens used so far */
  usedTokens: number
  /** Tokens remaining */
  remainingTokens: number
  /** Reserved tokens for system prompt */
  systemReserved: number
  /** Reserved tokens for user message */
  userReserved: number
  /** Reserved tokens for response */
  responseReserved: number
  /** Allocation by priority level */
  allocationByPriority: Record<ContextPriority, number>
}

/**
 * Default token budget configuration
 */
export const DEFAULT_TOKEN_BUDGET: TokenBudget = {
  maxTokens: 128000, // GPT-4 Turbo context window
  usedTokens: 0,
  remainingTokens: 128000,
  systemReserved: 2000,
  userReserved: 1000,
  responseReserved: 4000,
  allocationByPriority: {
    critical: 40000, // ~31% of available
    high: 30000, // ~23%
    medium: 20000, // ~16%
    low: 10000, // ~8%
  },
}

// ============================================
// Repository Context Types
// ============================================

/**
 * Full context object to pass to AI
 */
export interface RepoContext {
  /** Repository information */
  repository: RepoInfo
  /** Context chunks organized by type */
  chunks: ContextChunk[]
  /** Token budget tracking */
  tokenBudget: TokenBudget
  /** Context generation timestamp */
  generatedAt: number
  /** Query or intent that generated this context */
  query?: string
  /** Summary of included context for debugging */
  summary: ContextSummary
}

/**
 * Basic repository information
 */
export interface RepoInfo {
  owner: string
  repo: string
  defaultBranch: string
  description?: string
  language?: string
  topics?: string[]
}

/**
 * Summary of context for debugging and display
 */
export interface ContextSummary {
  /** Total chunks included */
  totalChunks: number
  /** Chunks by type */
  chunksByType: Record<ContextType, number>
  /** Chunks by priority */
  chunksByPriority: Record<ContextPriority, number>
  /** Total estimated tokens */
  totalTokens: number
  /** Truncated chunks count */
  truncatedChunks: number
  /** Excluded chunks count (due to budget) */
  excludedChunks: number
}

// ============================================
// Builder Input Types
// ============================================

/**
 * Input for building file context
 */
export interface FileContextInput {
  /** File content from GitHub */
  file: FileContent
  /** Decoded content (if not provided, will decode from base64) */
  decodedContent?: string
  /** Specific line range to include */
  lineRange?: { start: number; end: number }
  /** Priority override */
  priority?: ContextPriority
}

/**
 * Input for building PR context
 */
export interface PRContextInput {
  /** PR detail from GitHub */
  pr: PRDetail
  /** Include full diff content */
  includeDiff?: boolean
  /** Include review comments */
  includeReviews?: boolean
  /** Priority override */
  priority?: ContextPriority
}

/**
 * Input for building issue context
 */
export interface IssueContextInput {
  /** Issue detail from GitHub */
  issue: IssueDetail
  /** Include comments */
  includeComments?: boolean
  /** Max comments to include */
  maxComments?: number
  /** Priority override */
  priority?: ContextPriority
}

/**
 * Input for building search context
 */
export interface SearchContextInput {
  /** Search results from GitHub */
  results: CodeSearchItem[]
  /** Search query for reference */
  query: string
  /** Max results to include */
  maxResults?: number
  /** Priority override */
  priority?: ContextPriority
}

/**
 * Input for building commit context
 */
export interface CommitContextInput {
  /** Commit data from GitHub */
  commit: Commit
  /** Include file changes */
  includeChanges?: boolean
  /** Priority override */
  priority?: ContextPriority
}

// ============================================
// File Selection Types
// ============================================

/**
 * Options for smart file selection
 */
export interface FileSelectionOptions {
  /** Maximum number of files to select */
  maxFiles?: number
  /** File extensions to include */
  includeExtensions?: string[]
  /** File extensions to exclude */
  excludeExtensions?: string[]
  /** Paths to exclude (glob patterns) */
  excludePaths?: string[]
  /** Minimum relevance score (0-1) */
  minRelevance?: number
}

/**
 * Result of file relevance scoring
 */
export interface FileRelevanceResult {
  /** File path */
  path: string
  /** Relevance score (0-1) */
  score: number
  /** Reasons for the score */
  reasons: string[]
  /** File tree item reference */
  item: FileTreeItem
}

// ============================================
// Context Builder Options
// ============================================

/**
 * Options for the context builder
 */
export interface ContextBuilderOptions {
  /** Token budget configuration */
  tokenBudget?: Partial<TokenBudget>
  /** Default priority for unspecified chunks */
  defaultPriority?: ContextPriority
  /** Characters per token estimate (default: 4) */
  charsPerToken?: number
  /** Truncate long content instead of excluding */
  truncateLongContent?: boolean
  /** Max content length before truncation (characters) */
  maxContentLength?: number
  /** Include source URLs in chunks */
  includeSourceUrls?: boolean
}

/**
 * Default context builder options
 */
export const DEFAULT_CONTEXT_OPTIONS: Required<ContextBuilderOptions> = {
  tokenBudget: DEFAULT_TOKEN_BUDGET,
  defaultPriority: 'medium',
  charsPerToken: 4,
  truncateLongContent: true,
  maxContentLength: 50000,
  includeSourceUrls: true,
}

// ============================================
// Utility Types
// ============================================

/**
 * Result of context prioritization
 */
export interface PrioritizationResult {
  /** Chunks that fit within budget */
  included: ContextChunk[]
  /** Chunks excluded due to budget constraints */
  excluded: ContextChunk[]
  /** Updated token budget */
  tokenBudget: TokenBudget
  /** Whether any truncation occurred */
  wasTruncated: boolean
}

/**
 * Parsed file with content and metadata
 */
export interface ParsedFile {
  path: string
  content: string
  language: string
  lineCount: number
  size: number
}

/**
 * Language detection result
 */
export interface LanguageInfo {
  language: string
  extension: string
  aliases: string[]
}

// ============================================
// Re-export GitHub types for convenience
// ============================================

export type {
  FileContent,
  FileTreeItem,
  PRDetail,
  PullRequest,
  IssueDetail,
  Issue,
  Commit,
  CodeSearchItem,
}
