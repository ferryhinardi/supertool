'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PRDetail, PRFilters, PullRequest } from '@/lib/services/github/types'

/**
 * Parameters for the useGitHubPRs hook
 */
export interface UseGitHubPRsParams {
  /** Repository owner (username or organization) */
  owner: string
  /** Repository name */
  repo: string
  /** Optional filters for listing PRs */
  filters?: PRFilters
  /** Whether to fetch PRs automatically on mount (default: true) */
  autoFetch?: boolean
}

/**
 * Return type for the useGitHubPRs hook
 */
export interface UseGitHubPRsReturn {
  /** List of pull requests */
  pullRequests: PullRequest[]
  /** Currently selected PR detail (from fetchPRDetail) */
  selectedPR: PRDetail | null
  /** Loading state for list */
  isLoading: boolean
  /** Loading state for single PR detail */
  isLoadingDetail: boolean
  /** Error message if any */
  error: string | null
  /** Refetch the PR list */
  refetch: () => Promise<void>
  /** Fetch details for a specific PR by number */
  fetchPRDetail: (
    prNumber: number,
    includeFiles?: boolean,
    includeReviews?: boolean
  ) => Promise<PRDetail | null>
  /** Clear the selected PR detail */
  clearSelectedPR: () => void
  /** Update filters and refetch */
  setFilters: (filters: PRFilters) => void
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
 * Hook to fetch and manage GitHub pull requests for a repository
 *
 * @example
 * ```tsx
 * const { pullRequests, isLoading, fetchPRDetail } = useGitHubPRs({
 *   owner: 'facebook',
 *   repo: 'react',
 *   filters: { state: 'open', sort: 'updated' }
 * })
 *
 * // Fetch PR detail when needed
 * const detail = await fetchPRDetail(123, true, true)
 * ```
 */
export function useGitHubPRs({
  owner,
  repo,
  filters: initialFilters,
  autoFetch = true,
}: UseGitHubPRsParams): UseGitHubPRsReturn {
  // State for PR list
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for single PR detail
  const [selectedPR, setSelectedPR] = useState<PRDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // State for filters and pagination
  const [filters, setFiltersState] = useState<PRFilters>(initialFilters || {})
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    currentPage: 1,
  })

  /**
   * Fetch list of pull requests
   */
  const fetchPRs = useCallback(
    async (page?: number) => {
      if (!owner || !repo) {
        setError('Owner and repo are required')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Build URL with query params
        const url = new URL(`/api/github/repos/${owner}/${repo}/pulls`, window.location.origin)

        // Add filters
        if (filters.state) url.searchParams.set('state', filters.state)
        if (filters.head) url.searchParams.set('head', filters.head)
        if (filters.base) url.searchParams.set('base', filters.base)
        if (filters.sort) url.searchParams.set('sort', filters.sort)
        if (filters.direction) url.searchParams.set('direction', filters.direction)
        if (filters.per_page) url.searchParams.set('per_page', filters.per_page.toString())

        // Handle pagination - use page parameter directly, default to 1
        const targetPage = page ?? 1
        url.searchParams.set('page', targetPage.toString())

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch pull requests: ${response.status}`)
        }

        if (data.success && data.data) {
          // Handle paginated response
          if ('items' in data.data) {
            setPullRequests(data.data.items)
            setPagination({
              hasNextPage: data.data.hasNextPage || false,
              hasPreviousPage: data.data.hasPreviousPage || false,
              currentPage: targetPage,
            })
          } else if (Array.isArray(data.data)) {
            setPullRequests(data.data)
            setPagination((prev) => ({ ...prev, currentPage: targetPage }))
          }
        } else {
          throw new Error(data.error || 'Failed to fetch pull requests')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch pull requests'
        setError(message)
        console.error('useGitHubPRs error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [owner, repo, filters]
  )

  /**
   * Fetch details for a specific PR
   */
  const fetchPRDetail = useCallback(
    async (
      prNumber: number,
      includeFiles = false,
      includeReviews = false
    ): Promise<PRDetail | null> => {
      if (!owner || !repo) {
        setError('Owner and repo are required')
        return null
      }

      try {
        setIsLoadingDetail(true)
        setError(null)

        const url = new URL(
          `/api/github/repos/${owner}/${repo}/pulls/${prNumber}`,
          window.location.origin
        )

        if (includeFiles) url.searchParams.set('include_files', 'true')
        if (includeReviews) url.searchParams.set('include_reviews', 'true')

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch PR detail: ${response.status}`)
        }

        if (data.success && data.data) {
          setSelectedPR(data.data)
          return data.data
        } else {
          throw new Error(data.error || 'Failed to fetch PR detail')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch PR detail'
        setError(message)
        console.error('fetchPRDetail error:', err)
        return null
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [owner, repo]
  )

  /**
   * Clear the selected PR
   */
  const clearSelectedPR = useCallback(() => {
    setSelectedPR(null)
  }, [])

  /**
   * Update filters and refetch
   */
  const setFilters = useCallback((newFilters: PRFilters) => {
    setFiltersState(newFilters)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await fetchPRs(pagination.currentPage + 1)
    }
  }, [fetchPRs, pagination.hasNextPage, pagination.currentPage])

  /**
   * Navigate to previous page
   */
  const previousPage = useCallback(async () => {
    if (pagination.hasPreviousPage && pagination.currentPage > 1) {
      await fetchPRs(pagination.currentPage - 1)
    }
  }, [fetchPRs, pagination.hasPreviousPage, pagination.currentPage])

  // Auto-fetch on mount and when owner/repo/filters change
  useEffect(() => {
    if (autoFetch && owner && repo) {
      fetchPRs(1)
    }
  }, [fetchPRs, autoFetch, owner, repo])

  return {
    pullRequests,
    selectedPR,
    isLoading,
    isLoadingDetail,
    error,
    refetch: () => fetchPRs(),
    fetchPRDetail,
    clearSelectedPR,
    setFilters,
    pagination,
    nextPage,
    previousPage,
  }
}
