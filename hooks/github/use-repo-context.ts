'use client'

import { useCallback, useMemo, useState } from 'react'
import { createContextBuilder } from '@/lib/services/copilot/context-builder'
import type {
  ContextBuilderOptions,
  ContextChunk,
  FileContextInput,
  IssueContextInput,
  PRContextInput,
  PrioritizationResult,
  RepoContext,
  RepoInfo,
} from '@/lib/services/copilot/context-types'

export interface UseRepoContextParams {
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Default branch (optional, defaults to 'main') */
  defaultBranch?: string
  /** Repository description (optional) */
  description?: string
  /** Primary language (optional) */
  language?: string
  /** Repository topics (optional) */
  topics?: string[]
  /** Context builder options (optional) */
  builderOptions?: ContextBuilderOptions
}

export interface UseRepoContextReturn {
  /** The built repository context, ready to pass to AI */
  context: RepoContext | null
  /** All collected context chunks (before prioritization) */
  chunks: ContextChunk[]
  /** Prioritization result (if context was built) */
  prioritization: PrioritizationResult | null
  /** Whether context is currently being built */
  isBuilding: boolean
  /** Error message if context building failed */
  error: string | null
  /** Total estimated tokens across all chunks */
  totalTokens: number
  /** Number of chunks collected */
  chunkCount: number

  // Actions
  /** Add file context from file content */
  addFileContext: (input: FileContextInput) => void
  /** Add PR context from PR details */
  addPRContext: (input: PRContextInput) => void
  /** Add issue context from issue details */
  addIssueContext: (input: IssueContextInput) => void
  /** Add custom context chunks directly */
  addChunks: (newChunks: ContextChunk[]) => void
  /** Remove a chunk by ID */
  removeChunk: (chunkId: string) => void
  /** Build the final context with prioritization */
  buildContext: (query?: string, maxTokens?: number) => RepoContext
  /** Clear all collected chunks and reset state */
  clearContext: () => void
  /** Get a preview of what would be included at a given token budget */
  previewPrioritization: (maxTokens?: number) => PrioritizationResult
}

export function useRepoContext({
  owner,
  repo,
  defaultBranch = 'main',
  description,
  language,
  topics,
  builderOptions,
}: UseRepoContextParams): UseRepoContextReturn {
  const [chunks, setChunks] = useState<ContextChunk[]>([])
  const [context, setContext] = useState<RepoContext | null>(null)
  const [prioritization, setPrioritization] = useState<PrioritizationResult | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create context builder instance (memoized)
  const builder = useMemo(() => createContextBuilder(builderOptions), [builderOptions])

  // Create repo info object (memoized)
  const repoInfo: RepoInfo = useMemo(
    () => ({
      owner,
      repo,
      defaultBranch,
      description,
      language,
      topics,
    }),
    [owner, repo, defaultBranch, description, language, topics]
  )

  // Calculate total tokens
  const totalTokens = useMemo(
    () => chunks.reduce((sum, chunk) => sum + chunk.estimatedTokens, 0),
    [chunks]
  )

  // Add file context
  const addFileContext = useCallback(
    (input: FileContextInput) => {
      try {
        setError(null)
        const fileChunks = builder.buildFileContext(input)
        setChunks((prev) => [...prev, ...fileChunks])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add file context'
        setError(message)
        console.error('addFileContext error:', err)
      }
    },
    [builder]
  )

  // Add PR context
  const addPRContext = useCallback(
    (input: PRContextInput) => {
      try {
        setError(null)
        const prChunks = builder.buildPRContext(input)
        setChunks((prev) => [...prev, ...prChunks])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add PR context'
        setError(message)
        console.error('addPRContext error:', err)
      }
    },
    [builder]
  )

  // Add issue context
  const addIssueContext = useCallback(
    (input: IssueContextInput) => {
      try {
        setError(null)
        const issueChunks = builder.buildIssueContext(input)
        setChunks((prev) => [...prev, ...issueChunks])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add issue context'
        setError(message)
        console.error('addIssueContext error:', err)
      }
    },
    [builder]
  )

  // Add custom chunks directly
  const addChunks = useCallback((newChunks: ContextChunk[]) => {
    setChunks((prev) => [...prev, ...newChunks])
  }, [])

  // Remove a chunk by ID
  const removeChunk = useCallback((chunkId: string) => {
    setChunks((prev) => prev.filter((chunk) => chunk.id !== chunkId))
  }, [])

  // Preview prioritization without building full context
  const previewPrioritization = useCallback(
    (maxTokens?: number): PrioritizationResult => {
      return builder.prioritizeContext(chunks, maxTokens)
    },
    [builder, chunks]
  )

  // Build the final context
  const buildContext = useCallback(
    (query?: string, maxTokens?: number): RepoContext => {
      try {
        setIsBuilding(true)
        setError(null)

        // First prioritize the chunks
        const result = builder.prioritizeContext(chunks, maxTokens)
        setPrioritization(result)

        // Build the final context with prioritized chunks
        const builtContext = builder.buildRepoContext(repoInfo, result.included, query)
        setContext(builtContext)

        return builtContext
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to build context'
        setError(message)
        console.error('buildContext error:', err)
        throw err
      } finally {
        setIsBuilding(false)
      }
    },
    [builder, chunks, repoInfo]
  )

  // Clear all context
  const clearContext = useCallback(() => {
    setChunks([])
    setContext(null)
    setPrioritization(null)
    setError(null)
  }, [])

  return {
    context,
    chunks,
    prioritization,
    isBuilding,
    error,
    totalTokens,
    chunkCount: chunks.length,

    addFileContext,
    addPRContext,
    addIssueContext,
    addChunks,
    removeChunk,
    buildContext,
    clearContext,
    previewPrioritization,
  }
}
