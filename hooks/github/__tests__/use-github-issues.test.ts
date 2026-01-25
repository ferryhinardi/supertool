import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GitHubUser, Issue, IssueDetail, Label, Milestone } from '@/lib/services/github/types'
import { useGitHubIssues } from '../use-github-issues'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useGitHubIssues', () => {
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

  // Helper to create a mock Label
  const createMockLabel = (overrides: Partial<Label> = {}): Label => ({
    id: 1,
    name: 'bug',
    description: 'Something is not working',
    color: 'fc2929',
    default: false,
    ...overrides,
  })

  // Helper to create a mock Milestone
  const createMockMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
    id: 1,
    number: 1,
    title: 'v1.0',
    description: 'First release',
    state: 'open',
    open_issues: 5,
    closed_issues: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    due_on: '2024-02-01T00:00:00Z',
    closed_at: null,
    ...overrides,
  })

  const createMockIssue = (overrides: Partial<Issue> = {}): Issue => ({
    id: 1,
    number: 456,
    title: 'Bug: Something is broken',
    body: 'This is the issue description',
    state: 'open',
    state_reason: null,
    locked: false,
    user: createMockUser(),
    labels: [createMockLabel()],
    assignees: [],
    milestone: null,
    comments: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    closed_at: null,
    closed_by: null,
    html_url: 'https://github.com/owner/repo/issues/456',
    ...overrides,
  })

  const mockIssueList: Issue[] = [
    createMockIssue({ number: 456, title: 'Issue 1' }),
    createMockIssue({ number: 457, title: 'Issue 2' }),
    createMockIssue({ number: 458, title: 'Issue 3' }),
  ]

  const createMockIssueDetail = (overrides: Partial<IssueDetail> = {}): IssueDetail => ({
    ...createMockIssue(),
    issueComments: [
      {
        id: 1,
        user: createMockUser({ id: 2, login: 'commenter' }),
        body: 'This is a comment',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        html_url: 'https://github.com/owner/repo/issues/456#issuecomment-1',
      },
    ],
    timeline: [
      {
        id: 1,
        event: 'labeled',
        actor: createMockUser(),
        created_at: '2024-01-01T12:00:00Z',
        label: createMockLabel(),
      },
    ],
    ...overrides,
  })

  describe('initial state', () => {
    it('should start with empty issues and loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockIssueList }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      expect(result.current.issues).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.selectedIssue).toBeNull()
    })

    it('should not fetch if owner or repo is missing', async () => {
      const { result } = renderHook(() => useGitHubIssues({ owner: '', repo: 'react' }))

      // When owner/repo is empty, the hook doesn't fetch and stays in initial state
      expect(result.current.issues).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not auto-fetch when autoFetch is false', () => {
      const { result } = renderHook(() =>
        useGitHubIssues({ owner: 'facebook', repo: 'react', autoFetch: false })
      )

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetching issues', () => {
    it('should fetch issue list on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockIssueList }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.issues).toEqual(mockIssueList)
      expect(result.current.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/issues')
      )
    })

    it('should apply filters to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockIssueList }),
      })

      renderHook(() =>
        useGitHubIssues({
          owner: 'facebook',
          repo: 'react',
          filters: {
            state: 'open',
            labels: 'bug,enhancement',
            sort: 'updated',
            direction: 'desc',
            assignee: 'testuser',
            per_page: 50,
          },
        })
      )

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('state=open')
      expect(calledUrl).toContain('labels=bug%2Cenhancement')
      expect(calledUrl).toContain('sort=updated')
      expect(calledUrl).toContain('direction=desc')
      expect(calledUrl).toContain('assignee=testuser')
      expect(calledUrl).toContain('per_page=50')
    })

    it('should handle paginated response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              items: mockIssueList,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.issues).toEqual(mockIssueList)
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

      const { result } = renderHook(() => useGitHubIssues({ owner: 'invalid', repo: 'repo' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Repository not found')
      expect(result.current.issues).toEqual([])
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('fetchIssueDetail', () => {
    it('should fetch issue detail by number', async () => {
      const mockDetail = createMockIssueDetail({ number: 456 })

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockIssueList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let detail: IssueDetail | null = null
      await act(async () => {
        detail = await result.current.fetchIssueDetail(456, true, true)
      })

      expect(detail).toEqual(mockDetail)
      await waitFor(() => {
        expect(result.current.selectedIssue).toEqual(mockDetail)
      })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/github/repos/facebook/react/issues/456')
      )
    })

    it('should include comments and timeline params when requested', async () => {
      const mockDetail = createMockIssueDetail()

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockIssueList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.fetchIssueDetail(456, true, true)
      })

      const calledUrl = mockFetch.mock.calls[1][0]
      expect(calledUrl).toContain('include_comments=true')
      expect(calledUrl).toContain('include_timeline=true')
    })

    it('should return null on fetch error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockIssueList }),
        })
        .mockRejectedValueOnce(new Error('Failed to fetch'))

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const detail = await result.current.fetchIssueDetail(999)

      expect(detail).toBeNull()
    })
  })

  describe('clearSelectedIssue', () => {
    it('should clear the selected issue', async () => {
      const mockDetail = createMockIssueDetail()

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockIssueList }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDetail }),
        })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.fetchIssueDetail(456)
      })

      await waitFor(() => {
        expect(result.current.selectedIssue).toEqual(mockDetail)
      })

      act(() => {
        result.current.clearSelectedIssue()
      })

      expect(result.current.selectedIssue).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should update filters and reset to page 1', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockIssueList }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ state: 'closed', labels: 'bug' })
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
                items: mockIssueList,
                hasNextPage: true,
                hasPreviousPage: false,
              },
            }),
        })
      )

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

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
              items: mockIssueList,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

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
                items: mockIssueList,
                hasNextPage: true,
                hasPreviousPage: true,
              },
            }),
        })
      )

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

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
        json: () => Promise.resolve({ success: true, data: mockIssueList }),
      })

      const { result } = renderHook(() => useGitHubIssues({ owner: 'facebook', repo: 'react' }))

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
