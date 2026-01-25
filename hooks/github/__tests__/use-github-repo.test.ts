import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GitHubUser, Repository, RepositoryStats } from '@/lib/services/github/types'
import { useGitHubRepo } from '../use-github-repo'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useGitHubRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create a mock GitHubUser
  const createMockUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
    id: 1,
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631',
    html_url: 'https://github.com/facebook',
    type: 'Organization',
    ...overrides,
  })

  // Helper to create a mock Repository
  const createMockRepository = (overrides: Partial<Repository> = {}): Repository => ({
    id: 10270250,
    name: 'react',
    full_name: 'facebook/react',
    description:
      'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    private: false,
    owner: createMockUser(),
    html_url: 'https://github.com/facebook/react',
    clone_url: 'https://github.com/facebook/react.git',
    ssh_url: 'git@github.com:facebook/react.git',
    default_branch: 'main',
    language: 'JavaScript',
    languages_url: 'https://api.github.com/repos/facebook/react/languages',
    stargazers_count: 220000,
    watchers_count: 220000,
    forks_count: 45000,
    open_issues_count: 1500,
    size: 350000,
    created_at: '2013-05-24T16:15:54Z',
    updated_at: '2024-01-15T00:00:00Z',
    pushed_at: '2024-01-15T00:00:00Z',
    topics: ['javascript', 'react', 'ui', 'frontend'],
    visibility: 'public',
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    archived: false,
    disabled: false,
    ...overrides,
  })

  // Helper to create mock RepositoryStats
  const createMockStats = (overrides: Partial<RepositoryStats> = {}): RepositoryStats => ({
    contributors: 1500,
    commits: 17000,
    branches: 100,
    releases: 200,
    tags: 250,
    ...overrides,
  })

  describe('initial state', () => {
    it('should start with null repository and loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { repository: createMockRepository() },
          }),
      })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      expect(result.current.repository).toBeNull()
      expect(result.current.stats).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should not fetch if owner is missing', async () => {
      const { result } = renderHook(() => useGitHubRepo({ owner: '', repo: 'react' }))

      // When owner is empty, the hook doesn't fetch and stays in initial state
      expect(result.current.repository).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not fetch if repo is missing', async () => {
      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: '' }))

      // When repo is empty, the hook doesn't fetch and stays in initial state
      expect(result.current.repository).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should set error when refetch is called with missing params', async () => {
      const { result } = renderHook(() => useGitHubRepo({ owner: '', repo: '' }))

      // Manually trigger refetch to get the validation error
      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBe('Owner and repo are required')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetching repository', () => {
    it('should fetch repository on mount', async () => {
      const mockRepo = createMockRepository()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { repository: mockRepo },
          }),
      })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.repository).toEqual(mockRepo)
      expect(result.current.stats).toBeNull()
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react')
      )
    })

    it('should fetch repository with stats when includeStats is true', async () => {
      const mockRepo = createMockRepository()
      const mockStats = createMockStats()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { repository: mockRepo, stats: mockStats },
          }),
      })

      const { result } = renderHook(() =>
        useGitHubRepo({ owner: 'facebook', repo: 'react', includeStats: true })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.repository).toEqual(mockRepo)
      expect(result.current.stats).toEqual(mockStats)
      expect(result.current.error).toBeNull()

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('includeStats=true')
    })

    it('should not include stats param when includeStats is false', async () => {
      const mockRepo = createMockRepository()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { repository: mockRepo },
          }),
      })

      renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react', includeStats: false }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).not.toContain('includeStats')
    })
  })

  describe('error handling', () => {
    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Repository not found' }),
      })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'invalid', repo: 'repo' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Repository not found')
      expect(result.current.repository).toBeNull()
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.repository).toBeNull()
    })

    it('should handle malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Malformed response' }),
      })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Malformed response')
      expect(result.current.repository).toBeNull()
    })
  })

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockRepo = createMockRepository()

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { repository: mockRepo },
          }),
      })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.refetch()
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should update repository data on refetch', async () => {
      const mockRepoV1 = createMockRepository({ stargazers_count: 220000 })
      const mockRepoV2 = createMockRepository({ stargazers_count: 221000 })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: mockRepoV1 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: mockRepoV2 },
            }),
        })

      const { result } = renderHook(() => useGitHubRepo({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.repository?.stargazers_count).toBe(220000)

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.repository?.stargazers_count).toBe(221000)
    })
  })

  describe('re-render behavior', () => {
    it('should refetch when owner changes', async () => {
      const reactRepo = createMockRepository({ name: 'react', full_name: 'facebook/react' })
      const vueRepo = createMockRepository({ name: 'vue', full_name: 'vuejs/vue' })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: reactRepo },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: vueRepo },
            }),
        })

      const { result, rerender } = renderHook(({ owner, repo }) => useGitHubRepo({ owner, repo }), {
        initialProps: { owner: 'facebook', repo: 'react' },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.repository?.full_name).toBe('facebook/react')

      rerender({ owner: 'vuejs', repo: 'vue' })

      await waitFor(() => {
        expect(result.current.repository?.full_name).toBe('vuejs/vue')
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should refetch when repo changes', async () => {
      const reactRepo = createMockRepository({ name: 'react', full_name: 'facebook/react' })
      const jestRepo = createMockRepository({ name: 'jest', full_name: 'facebook/jest' })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: reactRepo },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { repository: jestRepo },
            }),
        })

      const { result, rerender } = renderHook(({ owner, repo }) => useGitHubRepo({ owner, repo }), {
        initialProps: { owner: 'facebook', repo: 'react' },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.repository?.name).toBe('react')

      rerender({ owner: 'facebook', repo: 'jest' })

      await waitFor(() => {
        expect(result.current.repository?.name).toBe('jest')
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
