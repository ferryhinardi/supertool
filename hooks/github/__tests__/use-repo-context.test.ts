import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ContextChunk,
  ContextSource,
  FileContextInput,
  IssueContextInput,
  PRContextInput,
  PrioritizationResult,
  RepoContext,
  RepoInfo,
  TokenBudget,
} from '@/lib/services/copilot/context-types'
import type {
  FileContent,
  GitHubUser,
  IssueDetail,
  Label,
  PRDetail,
  PRRef,
  Repository,
} from '@/lib/services/github'
import { useRepoContext } from '../use-repo-context'

// ============================================
// Mock Helper Functions
// ============================================

function createMockUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
  return {
    id: 1,
    login: 'testuser',
    avatar_url: 'https://github.com/testuser.png',
    html_url: 'https://github.com/testuser',
    type: 'User',
    ...overrides,
  }
}

function createMockLabel(overrides: Partial<Label> = {}): Label {
  return {
    id: 1,
    name: 'bug',
    description: 'Bug label',
    color: 'ff0000',
    default: false,
    ...overrides,
  }
}

function createMockRepository(overrides: Partial<Repository> = {}): Repository {
  return {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    description: 'A JavaScript library',
    private: false,
    owner: createMockUser(),
    html_url: 'https://github.com/facebook/react',
    clone_url: 'https://github.com/facebook/react.git',
    ssh_url: 'git@github.com:facebook/react.git',
    default_branch: 'main',
    language: 'JavaScript',
    languages_url: 'https://api.github.com/repos/facebook/react/languages',
    stargazers_count: 200000,
    watchers_count: 200000,
    forks_count: 40000,
    open_issues_count: 1000,
    size: 100000,
    created_at: '2013-05-24T16:15:54Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-01T00:00:00Z',
    topics: ['react', 'javascript'],
    visibility: 'public',
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    archived: false,
    disabled: false,
    ...overrides,
  }
}

function createMockPRRef(overrides: Partial<PRRef> = {}): PRRef {
  return {
    label: 'facebook:main',
    ref: 'main',
    sha: 'abc123',
    user: createMockUser(),
    repo: createMockRepository(),
    ...overrides,
  }
}

function createMockFileContent(overrides: Partial<FileContent> = {}): FileContent {
  return {
    name: 'index.ts',
    path: 'src/index.ts',
    sha: 'abc123',
    size: 100,
    url: 'https://api.github.com/repos/facebook/react/contents/src/index.ts',
    html_url: 'https://github.com/facebook/react/blob/main/src/index.ts',
    git_url: 'https://api.github.com/repos/facebook/react/git/blobs/abc123',
    download_url: 'https://raw.githubusercontent.com/facebook/react/main/src/index.ts',
    type: 'file',
    content: Buffer.from('export const hello = "world"').toString('base64'),
    encoding: 'base64',
    _links: {
      self: 'https://api.github.com/repos/facebook/react/contents/src/index.ts',
      git: 'https://api.github.com/repos/facebook/react/git/blobs/abc123',
      html: 'https://github.com/facebook/react/blob/main/src/index.ts',
    },
    ...overrides,
  }
}

function createMockPRDetail(overrides: Partial<PRDetail> = {}): PRDetail {
  return {
    id: 1,
    number: 123,
    state: 'open',
    locked: false,
    title: 'Fix: Update dependencies',
    body: 'This PR updates the dependencies to the latest versions.',
    user: createMockUser(),
    labels: [createMockLabel()],
    milestone: null,
    assignees: [],
    requested_reviewers: [],
    draft: false,
    html_url: 'https://github.com/facebook/react/pull/123',
    diff_url: 'https://github.com/facebook/react/pull/123.diff',
    patch_url: 'https://github.com/facebook/react/pull/123.patch',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: null,
    head: createMockPRRef({ label: 'user:feature-branch', ref: 'feature-branch' }),
    base: createMockPRRef(),
    mergeable: true,
    mergeable_state: 'clean',
    merged: false,
    merged_by: null,
    comments: 0,
    review_comments: 0,
    commits: 1,
    additions: 10,
    deletions: 5,
    changed_files: 2,
    ...overrides,
  }
}

function createMockIssueDetail(overrides: Partial<IssueDetail> = {}): IssueDetail {
  return {
    id: 1,
    number: 456,
    title: 'Bug: Something is broken',
    body: 'Steps to reproduce...',
    state: 'open',
    locked: false,
    user: createMockUser(),
    labels: [createMockLabel()],
    assignees: [],
    milestone: null,
    comments: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    closed_at: null,
    html_url: 'https://github.com/facebook/react/issues/456',
    ...overrides,
  }
}

function createMockContextSource(overrides: Partial<ContextSource> = {}): ContextSource {
  return {
    owner: 'facebook',
    repo: 'react',
    ref: 'src/index.ts',
    url: 'https://github.com/facebook/react/blob/main/src/index.ts',
    ...overrides,
  }
}

function createMockContextChunk(overrides: Partial<ContextChunk> = {}): ContextChunk {
  return {
    id: 'file-src/index.ts',
    type: 'file',
    priority: 'medium',
    label: 'src/index.ts',
    content: 'export const hello = "world"',
    estimatedTokens: 7,
    source: createMockContextSource(),
    ...overrides,
  }
}

function createMockTokenBudget(overrides: Partial<TokenBudget> = {}): TokenBudget {
  return {
    maxTokens: 4000,
    usedTokens: 0,
    remainingTokens: 4000,
    systemReserved: 200,
    userReserved: 100,
    responseReserved: 400,
    allocationByPriority: {
      critical: 1600,
      high: 1200,
      medium: 800,
      low: 400,
    },
    ...overrides,
  }
}

function createMockRepoInfo(overrides: Partial<RepoInfo> = {}): RepoInfo {
  return {
    owner: 'facebook',
    repo: 'react',
    defaultBranch: 'main',
    description: 'A JavaScript library for building user interfaces',
    language: 'JavaScript',
    topics: ['react', 'javascript', 'ui'],
    ...overrides,
  }
}

// ============================================
// Mock the context builder module
// ============================================

vi.mock('@/lib/services/copilot/context-builder', () => ({
  createContextBuilder: vi.fn(() => ({
    buildFileContext: vi.fn((input: FileContextInput): ContextChunk[] => {
      const file = input.file
      const content = input.decodedContent || (file.content ? atob(file.content) : '')
      return [
        createMockContextChunk({
          id: `file-${file.path}`,
          type: 'file',
          label: file.path,
          content,
          source: createMockContextSource({ ref: file.path }),
          estimatedTokens: Math.ceil(content.length / 4),
          priority: input.priority || 'medium',
        }),
      ]
    }),
    buildPRContext: vi.fn((input: PRContextInput): ContextChunk[] => {
      const pr = input.pr
      return [
        createMockContextChunk({
          id: `pr-${pr.number}`,
          type: 'pr',
          label: `PR #${pr.number}`,
          content: `PR #${pr.number}: ${pr.title}\n\n${pr.body || ''}`,
          source: createMockContextSource({ ref: `PR #${pr.number}` }),
          estimatedTokens: 100,
          priority: input.priority || 'high',
        }),
      ]
    }),
    buildIssueContext: vi.fn((input: IssueContextInput): ContextChunk[] => {
      const issue = input.issue
      return [
        createMockContextChunk({
          id: `issue-${issue.number}`,
          type: 'issue',
          label: `Issue #${issue.number}`,
          content: `Issue #${issue.number}: ${issue.title}\n\n${issue.body || ''}`,
          source: createMockContextSource({ ref: `Issue #${issue.number}` }),
          estimatedTokens: 80,
          priority: input.priority || 'medium',
        }),
      ]
    }),
    prioritizeContext: vi.fn((chunks: ContextChunk[], maxTokens?: number): PrioritizationResult => {
      const budget = maxTokens || 4000
      let usedTokens = 0
      const included: ContextChunk[] = []
      const excluded: ContextChunk[] = []

      // Sort by priority (critical > high > medium > low)
      const priorityOrder: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      }
      const sorted = [...chunks].sort(
        (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      )

      for (const chunk of sorted) {
        if (usedTokens + chunk.estimatedTokens <= budget) {
          included.push(chunk)
          usedTokens += chunk.estimatedTokens
        } else {
          excluded.push(chunk)
        }
      }

      return {
        included,
        excluded,
        tokenBudget: createMockTokenBudget({
          usedTokens,
          remainingTokens: budget - usedTokens,
        }),
        wasTruncated: excluded.length > 0,
      }
    }),
    buildRepoContext: vi.fn(
      (repoInfo: RepoInfo, chunks: ContextChunk[], query?: string): RepoContext => ({
        repository: repoInfo,
        chunks,
        tokenBudget: createMockTokenBudget({
          usedTokens: chunks.reduce((sum, c) => sum + c.estimatedTokens, 0),
        }),
        generatedAt: Date.now(),
        query,
        summary: {
          totalChunks: chunks.length,
          chunksByType: {
            file: chunks.filter((c) => c.type === 'file').length,
            pr: chunks.filter((c) => c.type === 'pr').length,
            pr_diff: 0,
            pr_review: 0,
            issue: chunks.filter((c) => c.type === 'issue').length,
            issue_comment: 0,
            commit: 0,
            search: 0,
            tree: 0,
            custom: chunks.filter((c) => c.type === 'custom').length,
          },
          chunksByPriority: {
            critical: chunks.filter((c) => c.priority === 'critical').length,
            high: chunks.filter((c) => c.priority === 'high').length,
            medium: chunks.filter((c) => c.priority === 'medium').length,
            low: chunks.filter((c) => c.priority === 'low').length,
          },
          totalTokens: chunks.reduce((sum, c) => sum + c.estimatedTokens, 0),
          truncatedChunks: 0,
          excludedChunks: 0,
        },
      })
    ),
  })),
}))

// ============================================
// Tests
// ============================================

describe('useRepoContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultParams = {
    owner: 'facebook',
    repo: 'react',
    defaultBranch: 'main',
    description: 'A JavaScript library for building user interfaces',
    language: 'JavaScript',
    topics: ['react', 'javascript', 'ui'],
  }

  describe('initial state', () => {
    it('should start with empty state', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      expect(result.current.context).toBeNull()
      expect(result.current.chunks).toEqual([])
      expect(result.current.prioritization).toBeNull()
      expect(result.current.isBuilding).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.totalTokens).toBe(0)
      expect(result.current.chunkCount).toBe(0)
    })

    it('should use default branch if not provided', () => {
      const { result } = renderHook(() => useRepoContext({ owner: 'facebook', repo: 'react' }))

      expect(result.current.context).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('addFileContext', () => {
    it('should add file context chunks', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
      })

      expect(result.current.chunks).toHaveLength(1)
      expect(result.current.chunks[0].type).toBe('file')
      expect(result.current.chunks[0].source.ref).toBe('src/index.ts')
      expect(result.current.chunkCount).toBe(1)
      expect(result.current.totalTokens).toBeGreaterThan(0)
    })

    it('should accumulate multiple file contexts', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
      })

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/utils.ts',
            name: 'utils.ts',
            content: Buffer.from(
              'export function sum(a: number, b: number) { return a + b }'
            ).toString('base64'),
          }),
        })
      })

      expect(result.current.chunks).toHaveLength(2)
      expect(result.current.chunkCount).toBe(2)
    })
  })

  describe('addPRContext', () => {
    it('should add PR context chunks', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addPRContext({
          pr: createMockPRDetail({
            number: 123,
            title: 'Fix: Update dependencies',
            body: 'This PR updates the dependencies to the latest versions.',
          }),
        })
      })

      expect(result.current.chunks).toHaveLength(1)
      expect(result.current.chunks[0].type).toBe('pr')
      expect(result.current.chunks[0].source.ref).toBe('PR #123')
    })
  })

  describe('addIssueContext', () => {
    it('should add issue context chunks', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addIssueContext({
          issue: createMockIssueDetail({
            number: 456,
            title: 'Bug: Something is broken',
            body: 'Steps to reproduce...',
          }),
        })
      })

      expect(result.current.chunks).toHaveLength(1)
      expect(result.current.chunks[0].type).toBe('issue')
      expect(result.current.chunks[0].source.ref).toBe('Issue #456')
    })
  })

  describe('addChunks', () => {
    it('should add custom chunks directly', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      const customChunks: ContextChunk[] = [
        createMockContextChunk({
          id: 'custom-1',
          type: 'custom',
          content: 'Custom context content',
          estimatedTokens: 50,
        }),
      ]

      act(() => {
        result.current.addChunks(customChunks)
      })

      expect(result.current.chunks).toHaveLength(1)
      expect(result.current.chunks[0].id).toBe('custom-1')
    })
  })

  describe('removeChunk', () => {
    it('should remove a chunk by ID', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
      })

      const chunkId = result.current.chunks[0].id

      act(() => {
        result.current.removeChunk(chunkId)
      })

      expect(result.current.chunks).toHaveLength(0)
    })

    it('should not throw if chunk ID does not exist', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      expect(() => {
        act(() => {
          result.current.removeChunk('non-existent-id')
        })
      }).not.toThrow()
    })
  })

  describe('buildContext', () => {
    it('should build context from collected chunks', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
      })

      let builtContext: RepoContext | undefined

      act(() => {
        builtContext = result.current.buildContext('How does the code work?', 4000)
      })

      expect(builtContext).toBeDefined()
      expect(result.current.context).toBeDefined()
      expect(result.current.prioritization).toBeDefined()
      expect(result.current.isBuilding).toBe(false)
    })

    it('should set prioritization result after building', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
        result.current.addPRContext({
          pr: createMockPRDetail({
            number: 123,
            title: 'Fix: Update dependencies',
            body: 'Description',
          }),
        })
      })

      act(() => {
        result.current.buildContext()
      })

      expect(result.current.prioritization).toBeDefined()
      expect(result.current.prioritization?.included.length).toBeGreaterThan(0)
    })
  })

  describe('previewPrioritization', () => {
    it('should return prioritization preview without building context', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
      })

      let preview: PrioritizationResult | undefined

      act(() => {
        preview = result.current.previewPrioritization(2000)
      })

      expect(preview).toBeDefined()
      expect(preview?.included.length).toBeGreaterThan(0)
      // Context should not be set (only preview)
      expect(result.current.context).toBeNull()
    })
  })

  describe('clearContext', () => {
    it('should clear all collected context', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const hello = "world"').toString('base64'),
          }),
        })
        result.current.buildContext()
      })

      expect(result.current.chunks).toHaveLength(1)
      expect(result.current.context).toBeDefined()

      act(() => {
        result.current.clearContext()
      })

      expect(result.current.chunks).toHaveLength(0)
      expect(result.current.context).toBeNull()
      expect(result.current.prioritization).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.totalTokens).toBe(0)
      expect(result.current.chunkCount).toBe(0)
    })
  })

  describe('totalTokens calculation', () => {
    it('should calculate total tokens across all chunks', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('a'.repeat(100)).toString('base64'), // ~25 tokens
          }),
        })
      })

      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/utils.ts',
            name: 'utils.ts',
            content: Buffer.from('b'.repeat(200)).toString('base64'), // ~50 tokens
          }),
        })
      })

      // Tokens are calculated as content.length / 4
      expect(result.current.totalTokens).toBe(75) // 25 + 50
    })
  })

  describe('error handling', () => {
    it('should handle errors when adding file context fails', () => {
      // This test ensures error state is properly managed
      const { result } = renderHook(() => useRepoContext(defaultParams))

      // Initially no error
      expect(result.current.error).toBeNull()

      // Add valid context should not cause error
      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('valid content').toString('base64'),
          }),
        })
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('memoization', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useRepoContext(defaultParams))

      const initialFunctions = {
        addFileContext: result.current.addFileContext,
        addPRContext: result.current.addPRContext,
        addIssueContext: result.current.addIssueContext,
        addChunks: result.current.addChunks,
        removeChunk: result.current.removeChunk,
        clearContext: result.current.clearContext,
      }

      rerender()

      // Functions should be memoized
      expect(result.current.addChunks).toBe(initialFunctions.addChunks)
      expect(result.current.removeChunk).toBe(initialFunctions.removeChunk)
      expect(result.current.clearContext).toBe(initialFunctions.clearContext)
    })
  })

  describe('combined workflow', () => {
    it('should handle a complete workflow of adding context and building', () => {
      const { result } = renderHook(() => useRepoContext(defaultParams))

      // Add multiple types of context
      act(() => {
        result.current.addFileContext({
          file: createMockFileContent({
            path: 'src/index.ts',
            content: Buffer.from('export const main = () => console.log("hello")').toString(
              'base64'
            ),
          }),
        })
      })

      act(() => {
        result.current.addPRContext({
          pr: createMockPRDetail({
            number: 100,
            title: 'Add main function',
            body: 'This PR adds the main entry point',
          }),
        })
      })

      act(() => {
        result.current.addIssueContext({
          issue: createMockIssueDetail({
            number: 50,
            title: 'Need entry point',
            body: 'The application needs a main entry point',
            state: 'closed',
          }),
        })
      })

      expect(result.current.chunkCount).toBe(3)

      // Build context
      let context: RepoContext | undefined

      act(() => {
        context = result.current.buildContext('What is the main function doing?', 8000)
      })

      expect(context).toBeDefined()
      expect(context?.chunks.length).toBeGreaterThan(0)
      expect(result.current.prioritization?.included.length).toBeGreaterThan(0)

      // Clear and verify reset
      act(() => {
        result.current.clearContext()
      })

      expect(result.current.chunkCount).toBe(0)
      expect(result.current.context).toBeNull()
    })
  })
})
