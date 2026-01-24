'use client'

/**
 * GitHub Copilot Session Management Hooks
 *
 * React Query hooks for managing Copilot chat sessions.
 * Handles CRUD operations with proper cache invalidation.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  APIResponse,
  CopilotContext,
  CopilotSession,
  SessionMetadata,
} from '@/lib/services/copilot'

// ============================================
// Query Keys
// ============================================

export const sessionKeys = {
  all: ['copilot-sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: () => [...sessionKeys.lists()] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

// ============================================
// API Functions
// ============================================

async function fetchSessions(): Promise<SessionMetadata[]> {
  const response = await fetch('/api/copilot/sessions')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch sessions')
  }

  const result: APIResponse<SessionMetadata[]> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch sessions')
  }

  return result.data
}

async function fetchSession(id: string): Promise<CopilotSession> {
  const response = await fetch(`/api/copilot/sessions/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch session')
  }

  const result: APIResponse<CopilotSession> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to fetch session')
  }

  return result.data
}

interface CreateSessionParams {
  name?: string
  context?: CopilotContext
}

async function createSession(params: CreateSessionParams = {}): Promise<CopilotSession> {
  const response = await fetch('/api/copilot/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to create session')
  }

  const result: APIResponse<CopilotSession> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to create session')
  }

  return result.data
}

interface RenameSessionParams {
  id: string
  name: string
}

async function renameSession({ id, name }: RenameSessionParams): Promise<CopilotSession> {
  const response = await fetch(`/api/copilot/sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to rename session')
  }

  const result: APIResponse<CopilotSession> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to rename session')
  }

  return result.data
}

interface DeleteSessionResult {
  deleted: boolean
  sessionId: string
}

async function deleteSession(id: string): Promise<DeleteSessionResult> {
  const response = await fetch(`/api/copilot/sessions/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete session')
  }

  const result: APIResponse<DeleteSessionResult> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to delete session')
  }

  return result.data
}

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch all session metadata
 */
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: fetchSessions,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
  })
}

/**
 * Hook to fetch a single session by ID
 */
export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: sessionKeys.detail(id || ''),
    queryFn: () => fetchSession(id as string),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      // Invalidate sessions list to refetch
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })

      // Optimistically add to cache
      queryClient.setQueryData(sessionKeys.detail(newSession.id), newSession)
    },
  })
}

/**
 * Hook to rename a session
 */
export function useRenameSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: renameSession,
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: sessionKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() })

      // Snapshot the previous values
      const previousSession = queryClient.getQueryData<CopilotSession>(sessionKeys.detail(id))
      const previousSessions = queryClient.getQueryData<SessionMetadata[]>(sessionKeys.list())

      // Optimistically update the session detail
      if (previousSession) {
        queryClient.setQueryData<CopilotSession>(sessionKeys.detail(id), {
          ...previousSession,
          name,
          updatedAt: Date.now(),
        })
      }

      // Optimistically update the sessions list
      if (previousSessions) {
        queryClient.setQueryData<SessionMetadata[]>(
          sessionKeys.list(),
          previousSessions.map((s) => (s.id === id ? { ...s, name } : s))
        )
      }

      return { previousSession, previousSessions }
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousSession) {
        queryClient.setQueryData(sessionKeys.detail(id), context.previousSession)
      }
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionKeys.list(), context.previousSessions)
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
    },
  })
}

/**
 * Hook to delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSession,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() })

      // Snapshot the previous values
      const previousSessions = queryClient.getQueryData<SessionMetadata[]>(sessionKeys.list())

      // Optimistically remove from the list
      if (previousSessions) {
        queryClient.setQueryData<SessionMetadata[]>(
          sessionKeys.list(),
          previousSessions.filter((s) => s.id !== id)
        )
      }

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: sessionKeys.detail(id) })

      return { previousSessions, deletedId: id }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionKeys.list(), context.previousSessions)
      }
    },
    onSettled: () => {
      // Always refetch the list after mutation
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
    },
  })
}

// ============================================
// Prefetch Utilities
// ============================================

/**
 * Prefetch a session for faster navigation
 */
export function usePrefetchSession() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: sessionKeys.detail(id),
      queryFn: () => fetchSession(id),
      staleTime: 10 * 1000,
    })
  }
}

/**
 * Prefetch the sessions list
 */
export function usePrefetchSessions() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: sessionKeys.list(),
      queryFn: fetchSessions,
      staleTime: 30 * 1000,
    })
  }
}
