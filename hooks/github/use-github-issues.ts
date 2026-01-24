'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Issue, IssueDetail, IssueFilters } from '@/lib/services/github/types'

/**
 * Parameters for the useGitHubIssues hook
 */
export interface UseGitHubIssuesParams {
  /** Repository owner (username or organization) */
  owner: string
  /** Repository name */
  repo: string
  /** Optional filters for listing issues */
  filters?: IssueFilters
  /** Whether to fetch issues automatically on mount (default: true) */
  autoFetch?: boolean
}

/**
 * Return type for the useGitHubIssues hook
 */
export interface UseGitHubIssuesReturn {
  /** List of issues */
  issues: Issue[]
  /** Currently selected issue detail (from fetchIssueDetail) */
  selectedIssue: IssueDetail | null
  /** Loading state for list */
  isLoading: boolean
  /** Loading state for single issue detail */
  isLoadingDetail: boolean
  /** Error message if any */
  error: string | null
  /** Refetch the issue list */
  refetch: () => Promise<void>
  /** Fetch details for a specific issue by number */
  fetchIssueDetail: (
    issueNumber: number,
    includeComments?: boolean,
    includeTimeline?: boolean
  ) => Promise<IssueDetail | null>
  /** Clear the selected issue detail */
  clearSelectedIssue: () => void
  /** Update filters and refetch */
  setFilters: (filters: IssueFilters) => void
  /** Pagination info */
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    currentPage: number
  }
  /** Go to next page */
  nextPage: () => Promise<void>
  /** Go to previous page */
  previousPage: () => Promise<void>
}

/**
 * Hook to fetch and manage GitHub issues for a repository
 *
 * @example
 * ```tsx
 * const { issues, isLoading, fetchIssueDetail } = useGitHubIssues({
 *   owner: 'facebook',
 *   repo: 'react',
 *   filters: { state: 'open', sort: 'updated', labels: 'bug' }
 * })
 *
 * // Fetch issue detail when needed
 * const detail = await fetchIssueDetail(456, true, true)
 * ```
 */
export function useGitHubIssues({
  owner,
  repo,
  filters: initialFilters,
  autoFetch = true,
}: UseGitHubIssuesParams): UseGitHubIssuesReturn {
  // State for issue list
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for single issue detail
  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // State for filters and pagination
  const [filters, setFiltersState] = useState<IssueFilters>(initialFilters || {})
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
  })

  /**
   * Fetch list of issues
   */
  const fetchIssues = useCallback(
    async (page?: number) => {
      if (!owner || !repo) {
        setError('Owner and repo are required')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Build URL with query params
        const url = new URL(`/api/github/repos/${owner}/${repo}/issues`, window.location.origin)

        // Add filters
        if (filters.state) url.searchParams.set('state', filters.state)
        if (filters.labels) url.searchParams.set('labels', filters.labels)
        if (filters.sort) url.searchParams.set('sort', filters.sort)
        if (filters.direction) url.searchParams.set('direction', filters.direction)
        if (filters.since) url.searchParams.set('since', filters.since)
        if (filters.assignee) url.searchParams.set('assignee', filters.assignee)
        if (filters.creator) url.searchParams.set('creator', filters.creator)
        if (filters.mentioned) url.searchParams.set('mentioned', filters.mentioned)
        if (filters.per_page) url.searchParams.set('per_page', filters.per_page.toString())

        // Handle pagination
        const currentPage = page ?? pagination.currentPage
        url.searchParams.set('page', currentPage.toString())

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch issues: ${response.status}`)
        }

        if (data.success && data.data) {
          // Handle paginated response
          if ('items' in data.data) {
            setIssues(data.data.items)
            setPagination({
              hasNextPage: data.data.hasNextPage || false,
              hasPreviousPage: data.data.hasPreviousPage || false,
              currentPage,
            })
          } else if (Array.isArray(data.data)) {
            setIssues(data.data)
            setPagination((prev) => ({ ...prev, currentPage }))
          }
        } else {
          throw new Error(data.error || 'Failed to fetch issues')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch issues'
        setError(message)
        console.error('useGitHubIssues error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [owner, repo, filters, pagination.currentPage]
  )

  /**
   * Fetch details for a specific issue
   */
  const fetchIssueDetail = useCallback(
    async (
      issueNumber: number,
      includeComments = false,
      includeTimeline = false
    ): Promise<IssueDetail | null> => {
      if (!owner || !repo) {
        setError('Owner and repo are required')
        return null
      }

      try {
        setIsLoadingDetail(true)
        setError(null)

        const url = new URL(
          `/api/github/repos/${owner}/${repo}/issues/${issueNumber}`,
          window.location.origin
        )

        if (includeComments) url.searchParams.set('include_comments', 'true')
        if (includeTimeline) url.searchParams.set('include_timeline', 'true')

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch issue detail: ${response.status}`)
        }

        if (data.success && data.data) {
          setSelectedIssue(data.data)
          return data.data
        } else {
          throw new Error(data.error || 'Failed to fetch issue detail')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch issue detail'
        setError(message)
        console.error('fetchIssueDetail error:', err)
        return null
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [owner, repo]
  )

  /**
   * Clear the selected issue
   */
  const clearSelectedIssue = useCallback(() => {
    setSelectedIssue(null)
  }, [])

  /**
   * Update filters and refetch
   */
  const setFilters = useCallback((newFilters: IssueFilters) => {
    setFiltersState(newFilters)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await fetchIssues(pagination.currentPage + 1)
    }
  }, [fetchIssues, pagination.hasNextPage, pagination.currentPage])

  /**
   * Navigate to previous page
   */
  const previousPage = useCallback(async () => {
    if (pagination.hasPreviousPage && pagination.currentPage > 1) {
      await fetchIssues(pagination.currentPage - 1)
    }
  }, [fetchIssues, pagination.hasPreviousPage, pagination.currentPage])

  // Auto-fetch on mount and when owner/repo/filters change
  useEffect(() => {
    if (autoFetch && owner && repo) {
      fetchIssues(1)
    }
  }, [fetchIssues, autoFetch, owner, repo])

  return {
    issues,
    selectedIssue,
    isLoading,
    isLoadingDetail,
    error,
    refetch: () => fetchIssues(),
    fetchIssueDetail,
    clearSelectedIssue,
    setFilters,
    pagination,
    nextPage,
    previousPage,
  }
}
