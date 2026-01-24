'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FileContent, FileTree, FileTreeItem } from '@/lib/services/github/types'

export interface UseGitHubFilesParams {
  owner: string
  repo: string
  sha?: string
  recursive?: boolean
}

export interface UseGitHubFilesReturn {
  tree: FileTree | null
  files: FileTreeItem[]
  directories: FileTreeItem[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  fetchFileContent: (path: string, ref?: string) => Promise<FileContent | null>
}

export function useGitHubFiles({
  owner,
  repo,
  sha,
  recursive = true,
}: UseGitHubFilesParams): UseGitHubFilesReturn {
  const [tree, setTree] = useState<FileTree | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!(owner && repo))
  const [error, setError] = useState<string | null>(() =>
    !owner || !repo ? 'Owner and repo are required' : null
  )

  const fetchTree = useCallback(async () => {
    if (!owner || !repo) {
      setError('Owner and repo are required')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const url = new URL(`/api/github/repos/${owner}/${repo}/tree`, window.location.origin)
      if (sha) {
        url.searchParams.set('sha', sha)
      }
      if (recursive) {
        url.searchParams.set('recursive', 'true')
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch file tree: ${response.status}`)
      }

      if (data.success && data.data) {
        setTree(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch file tree')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch file tree'
      setError(message)
      console.error('useGitHubFiles error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [owner, repo, sha, recursive])

  const fetchFileContent = useCallback(
    async (path: string, ref?: string): Promise<FileContent | null> => {
      if (!owner || !repo || !path) {
        console.error('Owner, repo, and path are required to fetch file content')
        return null
      }

      try {
        const url = new URL(
          `/api/github/repos/${owner}/${repo}/contents/${path}`,
          window.location.origin
        )
        if (ref) {
          url.searchParams.set('ref', ref)
        }

        const response = await fetch(url.toString())
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch file content: ${response.status}`)
        }

        if (data.success && data.data) {
          return data.data as FileContent
        }

        throw new Error(data.error || 'Failed to fetch file content')
      } catch (err) {
        console.error('fetchFileContent error:', err)
        return null
      }
    },
    [owner, repo]
  )

  useEffect(() => {
    if (owner && repo) {
      fetchTree()
    }
  }, [fetchTree, owner, repo])

  // Separate files and directories from tree
  const files = tree?.tree.filter((item) => item.type === 'blob') ?? []
  const directories = tree?.tree.filter((item) => item.type === 'tree') ?? []

  return {
    tree,
    files,
    directories,
    isLoading,
    error,
    refetch: fetchTree,
    fetchFileContent,
  }
}
