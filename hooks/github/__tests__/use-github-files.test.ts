import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FileContent, FileTree } from '@/lib/services/github/types'
import { useGitHubFiles } from '../use-github-files'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useGitHubFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockFileTree: FileTree = {
    sha: 'abc123',
    url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
    tree: [
      {
        path: 'src/index.ts',
        mode: '100644',
        type: 'blob',
        sha: 'file1sha',
        size: 1024,
        url: 'https://api.github.com/repos/owner/repo/git/blobs/file1sha',
      },
      {
        path: 'src',
        mode: '040000',
        type: 'tree',
        sha: 'dir1sha',
        url: 'https://api.github.com/repos/owner/repo/git/trees/dir1sha',
      },
      {
        path: 'README.md',
        mode: '100644',
        type: 'blob',
        sha: 'file2sha',
        size: 512,
        url: 'https://api.github.com/repos/owner/repo/git/blobs/file2sha',
      },
    ],
    truncated: false,
  }

  const mockFileContent: FileContent = {
    type: 'file',
    encoding: 'base64',
    size: 1024,
    name: 'index.ts',
    path: 'src/index.ts',
    content: 'Y29uc29sZS5sb2coImhlbGxvIik=', // base64 of console.log("hello")
    sha: 'file1sha',
    url: 'https://api.github.com/repos/owner/repo/contents/src/index.ts',
    git_url: 'https://api.github.com/repos/owner/repo/git/blobs/file1sha',
    html_url: 'https://github.com/owner/repo/blob/main/src/index.ts',
    download_url: 'https://raw.githubusercontent.com/owner/repo/main/src/index.ts',
    _links: {
      self: 'https://api.github.com/repos/owner/repo/contents/src/index.ts',
      git: 'https://api.github.com/repos/owner/repo/git/blobs/file1sha',
      html: 'https://github.com/owner/repo/blob/main/src/index.ts',
    },
  }

  describe('initial state', () => {
    it('should start with null tree and loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      expect(result.current.tree).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should set error if owner or repo is missing', async () => {
      const { result } = renderHook(() => useGitHubFiles({ owner: '', repo: 'react' }))

      expect(result.current.error).toBe('Owner and repo are required')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetching file tree', () => {
    it('should fetch file tree on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tree).toEqual(mockFileTree)
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/tree')
      )
    })

    it('should include sha in URL when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react', sha: 'abc123' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('sha=abc123')
    })

    it('should include recursive param by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('recursive=true')
    })

    it('should separate files and directories', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.files).toHaveLength(2) // src/index.ts, README.md
      expect(result.current.directories).toHaveLength(1) // src
      expect(result.current.files.every((f) => f.type === 'blob')).toBe(true)
      expect(result.current.directories.every((d) => d.type === 'tree')).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Repository not found' }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'invalid', repo: 'repo' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Repository not found')
      expect(result.current.tree).toBeNull()
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })

    it('should handle malformed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Invalid data' }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Invalid data')
    })
  })

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refetch()
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetchFileContent', () => {
    it('should fetch file content by path', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFileTree }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFileContent }),
        })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const content = await result.current.fetchFileContent('src/index.ts')

      expect(content).toEqual(mockFileContent)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/contents/src/index.ts')
      )
    })

    it('should include ref param when provided', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFileTree }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFileContent }),
        })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.fetchFileContent('src/index.ts', 'develop')

      const calledUrl = mockFetch.mock.calls[1][0]
      expect(calledUrl).toContain('ref=develop')
    })

    it('should return null on fetch error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFileTree }),
        })
        .mockRejectedValueOnce(new Error('Failed to fetch'))

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const content = await result.current.fetchFileContent('invalid/path.ts')

      expect(content).toBeNull()
    })

    it('should return null if path is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result } = renderHook(() => useGitHubFiles({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const content = await result.current.fetchFileContent('')

      expect(content).toBeNull()
    })
  })

  describe('re-fetch on params change', () => {
    it('should refetch when owner changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result, rerender } = renderHook(
        ({ owner, repo }) => useGitHubFiles({ owner, repo }),
        { initialProps: { owner: 'facebook', repo: 'react' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      rerender({ owner: 'vercel', repo: 'react' })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })

    it('should refetch when repo changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockFileTree }),
      })

      const { result, rerender } = renderHook(
        ({ owner, repo }) => useGitHubFiles({ owner, repo }),
        { initialProps: { owner: 'facebook', repo: 'react' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      rerender({ owner: 'facebook', repo: 'react-native' })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      })
    })
  })
})
