'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Repository, RepositoryStats } from '@/lib/services/github/types'

export interface UseGitHubRepoParams {
  owner: string
  repo: string
  includeStats?: boolean
}

export interface UseGitHubRepoReturn {
  repository: Repository | null
  stats: RepositoryStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGitHubRepo({
  owner,
  repo,
  includeStats = false,
}: UseGitHubRepoParams): UseGitHubRepoReturn {
  const [repository, setRepository] = useState<Repository | null>(null)
  const [stats, setStats] = useState<RepositoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepository = useCallback(async () => {
    if (!owner || !repo) {
      setError('Owner and repo are required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const url = new URL(`/api/github/repos/${owner}/${repo}`, window.location.origin)
      if (includeStats) {
        url.searchParams.set('includeStats', 'true')
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch repository: ${response.status}`)
      }

      if (data.success && data.data) {
        setRepository(data.data.repository)
        if (data.data.stats) {
          setStats(data.data.stats)
        }
      } else {
        throw new Error(data.error || 'Failed to fetch repository')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch repository'
      setError(message)
      console.error('useGitHubRepo error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [owner, repo, includeStats])

  useEffect(() => {
    if (owner && repo) {
      fetchRepository()
    }
  }, [fetchRepository, owner, repo])

  return {
    repository,
    stats,
    isLoading,
    error,
    refetch: fetchRepository,
  }
}
