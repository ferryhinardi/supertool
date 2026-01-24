import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GitHubUser, PRDetail, PullRequest, Repository } from '@/lib/services/github/types'
import { useGitHubPRs } from '../use-github-prs'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useGitHubPRs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create a mock GitHubUser
  const createMockUser = (overrides: Partial<GitHubUser> = {}): GitHubUser => ({
    id: 1,
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/testuser',
    type: 'User',
    ...overrides,
  })

  // Helper to create a mock Repository (minimal for PRRef)
  const createMockRepo = (overrides: Partial<Repository> = {}): Repository => ({
    id: 1,
    name: 'repo',
    full_name: 'owner/repo',
    description: 'Test repository',
    private: false,
    owner: createMockUser(),
    html_url: 'https://github.com/owner/repo',
    clone_url: 'https://github.com/owner/repo.git',
    ssh_url: 'git@github.com:owner/repo.git',
    default_branch: 'main',
    language: 'TypeScript',
    languages_url: 'https://api.github.com/repos/owner/repo/languages',
    stargazers_count: 100,
    watchers_count: 100,
    forks_count: 10,
    open_issues_count: 5,
    size: 1000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-01T00:00:00Z',
    topics: ['typescript', 'react'],
    visibility: 'public',
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    archived: false,
    disabled: false,
    ...overrides,
  })

  const createMockPR = (overrides: Partial<PullRequest> = {}): PullRequest => ({
    id: 1,
    number: 123,
    title: 'Fix: Update dependencies',
    body: 'This PR updates the dependencies',
    state: 'open',
    locked: false,
    html_url: 'https://github.com/owner/repo/pull/123',
    diff_url: 'https://github.com/owner/repo/pull/123.diff',
    patch_url: 'https://github.com/owner/repo/pull/123.patch',
    user: createMockUser(),
    labels: [],
    milestone: null,
    assignees: [],
    requested_reviewers: [],
    head: {
      label: 'owner:feature-branch',
      ref: 'feature-branch',
      sha: 'abc123',
      user: createMockUser(),
      repo: createMockRepo(),
    },
    base: {
      label: 'owner:main',
      ref: 'main',
      sha: 'def456',
      user: createMockUser(),
      repo: createMockRepo(),
    },
    draft: false,
    merged: false,
    mergeable: true,
    mergeable_state: 'clean',
    merged_by: null,
    comments: 0,
    review_comments: 0,
    commits: 1,
    additions: 10,
    deletions: 5,
    changed_files: 2,
    merge_commit_sha: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    closed_at: null,
    merged_at: null,
    ...overrides,
  })

  const mockPRList: PullRequest[] = [
    createMockPR({ number: 123, title: 'PR 1' }),
    createMockPR({ number: 124, title: 'PR 2' }),
    createMockPR({ number: 125, title: 'PR 3' }),
  ]

  const createMockPRDetail = (overrides: Partial<PRDetail> = {}): PRDetail => ({
    ...createMockPR(),
    files: [
      {
        sha: 'file1sha',
        filename: 'src/index.ts',
        status: 'modified',
        additions: 5,
        deletions: 2,
        changes: 7,
        blob_url: 'https://github.com/owner/repo/blob/abc123/src/index.ts',
        raw_url: 'https://raw.githubusercontent.com/owner/repo/abc123/src/index.ts',
        contents_url: 'https://api.github.com/repos/owner/repo/contents/src/index.ts',
        patch: '@@ -1,5 +1,8 @@',
      },
    ],
    reviews: [
      {
        id: 1,
        user: createMockUser({ id: 2, login: 'reviewer' }),
        body: 'LGTM!',
        state: 'APPROVED',
        html_url: 'https://github.com/owner/repo/pull/123#pullrequestreview-1',
        submitted_at: '2024-01-02T00:00:00Z',
        commit_id: 'abc123',
      },
    ],
    ...overrides,
  })

  describe('initial state', () => {
    it('should start with empty pullRequests and loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPRList }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      expect(result.current.pullRequests).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.selectedPR).toBeNull()
    })

    it('should not fetch if owner or repo is missing', async () => {
      const { result } = renderHook(() => useGitHubPRs({ owner: '', repo: 'react' }))

      // When owner/repo is empty, the hook should not attempt to fetch
      expect(result.current.pullRequests).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not auto-fetch when autoFetch is false', () => {
      const { result } = renderHook(() =>
        useGitHubPRs({ owner: 'facebook', repo: 'react', autoFetch: false })
      )

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetching PRs', () => {
    it('should fetch PR list on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPRList }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pullRequests).toEqual(mockPRList)
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/pulls')
      )
    })

    it('should apply filters to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPRList }),
      })

      renderHook(() =>
        useGitHubPRs({
          owner: 'facebook',
          repo: 'react',
          filters: {
            state: 'open',
            sort: 'updated',
            direction: 'desc',
            per_page: 50,
          },
        })
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('state=open')
      expect(calledUrl).toContain('sort=updated')
      expect(calledUrl).toContain('direction=desc')
      expect(calledUrl).toContain('per_page=50')
    })

    it('should handle paginated response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              items: mockPRList,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pullRequests).toEqual(mockPRList)
      expect(result.current.pagination.hasNextPage).toBe(true)
      expect(result.current.pagination.hasPreviousPage).toBe(false)
      expect(result.current.pagination.currentPage).toBe(1)
    })
  })

  describe('error handling', () => {
    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Repository not found' }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'invalid', repo: 'repo' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Repository not found')
      expect(result.current.pullRequests).toEqual([])
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('fetchPRDetail', () => {
    it('should fetch PR detail by number', async () => {
      const mockDetail = createMockPRDetail({ number: 123 })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockPRList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let detail = null
      await act(async () => {
        detail = await result.current.fetchPRDetail(123, true, true)
      })

      expect(detail).toEqual(mockDetail)
      await waitFor(() => {
        expect(result.current.selectedPR).toEqual(mockDetail)
      })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/pulls/123')
      )
    })

    it('should include files and reviews params when requested', async () => {
      const mockDetail = createMockPRDetail()

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockPRList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await result.current.fetchPRDetail(123, true, true)

      const calledUrl = mockFetch.mock.calls[1][0]
      expect(calledUrl).toContain('include_files=true')
      expect(calledUrl).toContain('include_reviews=true')
    })

    it('should return null on fetch error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockPRList }),
        })
        .mockRejectedValueOnce(new Error('Failed to fetch'))

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const detail = await result.current.fetchPRDetail(999)

      expect(detail).toBeNull()
    })
  })

  describe('clearSelectedPR', () => {
    it('should clear the selected PR', async () => {
      const mockDetail = createMockPRDetail()

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockPRList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.fetchPRDetail(123)
      })
      await waitFor(() => {
        expect(result.current.selectedPR).toEqual(mockDetail)
      })

      act(() => {
        result.current.clearSelectedPR()
      })

      expect(result.current.selectedPR).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should update filters and reset to page 1', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPRList }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ state: 'closed' })
      })

      expect(result.current.pagination.currentPage).toBe(1)
    })
  })

  describe('pagination', () => {
    it('should navigate to next page', async () => {
      // Use mockImplementation to handle multiple calls
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                items: mockPRList,
                hasNextPage: true,
                hasPreviousPage: false,
              },
            }),
        })
      )

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pagination.currentPage).toBe(1)

      await act(async () => {
        await result.current.nextPage()
      })

      // Verify page=2 was called at some point
      await waitFor(() => {
        const page2Calls = mockFetch.mock.calls.filter((call) => call[0].includes('page=2'))
        expect(page2Calls.length).toBeGreaterThan(0)
      })
    })

    it('should not navigate to next page if no next page', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              items: mockPRList,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.nextPage()
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should navigate to previous page', async () => {
      // Use mockImplementation that always allows navigation
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                items: mockPRList,
                hasNextPage: true,
                hasPreviousPage: true,
              },
            }),
        })
      )

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Go to page 2
      await act(async () => {
        await result.current.nextPage()
      })

      // Verify page=2 was called
      await waitFor(() => {
        const page2Calls = mockFetch.mock.calls.filter((call) => call[0].includes('page=2'))
        expect(page2Calls.length).toBeGreaterThan(0)
      })

      // Go back to page 1
      await act(async () => {
        await result.current.previousPage()
      })

      // Verify page=1 was called after page=2
      await waitFor(() => {
        const page1Calls = mockFetch.mock.calls.filter((call) => call[0].includes('page=1'))
        expect(page1Calls.length).toBeGreaterThan(0)
      })
    })
  })

  describe('refetch', () => {
    it('should refetch data when refetch is called', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPRList }),
      })

      const { result } = renderHook(() => useGitHubPRs({ owner: 'facebook', repo: 'react' }))

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
})
