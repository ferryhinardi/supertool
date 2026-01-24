/**
 * GitHub API Service Client
 *
 * Main service class for interacting with GitHub REST API.
 * Features:
 * - Automatic caching with TTL
 * - Rate limiting with automatic retry
 * - Conditional requests with ETags
 * - Comprehensive error handling
 * - Pagination support
 */

import { GitHubCache, generateCacheKey, getGitHubCache } from './cache'
import { GitHubRateLimiter, getGitHubRateLimiter, getResourceFromEndpoint } from './rate-limiter'
import type {
  Branch,
  CodeSearchItem,
  Commit,
  CommitFilters,
  FileContent,
  FileTree,
  GitHubAPIError,
  GitHubAPIResponse,
  GitHubServiceConfig,
  Issue,
  IssueComment,
  IssueDetail,
  IssueFilters,
  PaginatedResult,
  PRDetail,
  PRFile,
  PRFilters,
  PRReview,
  PRReviewComment,
  PullRequest,
  Repository,
  SearchFilters,
  SearchResult,
} from './types'

// ============================================
// Constants
// ============================================

const GITHUB_API_BASE = 'https://api.github.com'
const DEFAULT_USER_AGENT = 'SuperTool-GitHub-Integration/1.0'
const DEFAULT_TIMEOUT = 30000 // 30 seconds

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  repository: 5 * 60 * 1000, // 5 minutes
  fileTree: 10 * 60 * 1000, // 10 minutes
  fileContent: 15 * 60 * 1000, // 15 minutes
  pullRequests: 2 * 60 * 1000, // 2 minutes (more dynamic)
  issues: 2 * 60 * 1000, // 2 minutes
  commits: 5 * 60 * 1000, // 5 minutes
  branches: 5 * 60 * 1000, // 5 minutes
  search: 1 * 60 * 1000, // 1 minute
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: Required<GitHubServiceConfig> = {
  token: '',
  baseUrl: GITHUB_API_BASE,
  userAgent: DEFAULT_USER_AGENT,
  timeout: DEFAULT_TIMEOUT,
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000,
  },
  rateLimit: {
    enabled: true,
    maxConcurrent: 10,
  },
}

// ============================================
// GitHubService Class
// ============================================

export class GitHubService {
  private config: Required<GitHubServiceConfig>
  private cache: GitHubCache
  private rateLimiter: GitHubRateLimiter

  constructor(config: GitHubServiceConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      cache: { ...DEFAULT_CONFIG.cache, ...config.cache },
      rateLimit: { ...DEFAULT_CONFIG.rateLimit, ...config.rateLimit },
    }

    this.cache = config.cache?.enabled !== false ? getGitHubCache() : new GitHubCache()
    this.rateLimiter =
      config.rateLimit?.enabled !== false ? getGitHubRateLimiter() : new GitHubRateLimiter()
  }

  // ============================================
  // Core Request Method
  // ============================================

  /**
   * Make an authenticated request to the GitHub API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & {
      cacheKey?: string
      cacheTTL?: number
      skipCache?: boolean
    } = {}
  ): Promise<GitHubAPIResponse<T>> {
    const { cacheKey, cacheTTL, skipCache, ...fetchOptions } = options
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`
    const resource = getResourceFromEndpoint(endpoint)

    // Check cache first
    if (this.config.cache.enabled && cacheKey && !skipCache) {
      const cached = this.cache.getEntry<T>(cacheKey)
      if (cached) {
        return { success: true, data: cached.data }
      }
    }

    // Check rate limits
    if (this.config.rateLimit.enabled && !this.rateLimiter.canMakeRequest(resource)) {
      await this.rateLimiter.waitForReset(resource)
    }

    // Build headers
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'User-Agent': this.config.userAgent,
      'X-GitHub-Api-Version': '2022-11-28',
      ...fetchOptions.headers,
    }

    if (this.config.token) {
      ;(headers as Record<string, string>).Authorization = `Bearer ${this.config.token}`
    }

    // Add ETag for conditional request if cached
    if (this.config.cache.enabled && cacheKey) {
      const cached = this.cache.getEntry<T>(cacheKey)
      if (cached?.etag) {
        ;(headers as Record<string, string>)['If-None-Match'] = cached.etag
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Update rate limiter from response headers
      if (this.config.rateLimit.enabled) {
        this.rateLimiter.updateFromHeaders(response.headers, resource)
      }

      // Handle 304 Not Modified
      if (response.status === 304 && cacheKey) {
        const cached = this.cache.get<T>(cacheKey)
        if (cached) {
          return { success: true, data: cached }
        }
      }

      // Handle rate limit errors
      if (this.rateLimiter.isRateLimitError(response.status, response.headers)) {
        await this.rateLimiter.handleRateLimitError(response.headers, resource)
        // Retry the request
        return this.request<T>(endpoint, options)
      }

      // Handle other errors
      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as GitHubAPIError
        return {
          success: false,
          error: {
            message: errorBody.message || `GitHub API error: ${response.status}`,
            status: response.status,
            documentation_url: errorBody.documentation_url,
            errors: errorBody.errors,
          },
        }
      }

      // Parse response
      const data = (await response.json()) as T

      // Cache successful response
      if (this.config.cache.enabled && cacheKey) {
        const etag = response.headers.get('etag') || undefined
        const ttl = cacheTTL || this.config.cache.defaultTTL
        if (etag) {
          this.cache.setWithETag(cacheKey, data, etag, { ttl })
        } else {
          this.cache.set(cacheKey, data, { ttl })
        }
      }

      return { success: true, data }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            message: 'Request timeout',
            status: 408,
          },
        }
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
        },
      }
    }
  }

  // ============================================
  // Repository Methods
  // ============================================

  /**
   * Fetch repository metadata
   */
  async fetchRepository(owner: string, repo: string): Promise<GitHubAPIResponse<Repository>> {
    const cacheKey = generateCacheKey('repo', owner, repo)
    return this.request<Repository>(`/repos/${owner}/${repo}`, {
      cacheKey,
      cacheTTL: CACHE_TTL.repository,
    })
  }

  // ============================================
  // File Tree & Content Methods
  // ============================================

  /**
   * Fetch repository file tree (recursive)
   */
  async fetchFileTree(
    owner: string,
    repo: string,
    sha: string = 'HEAD'
  ): Promise<GitHubAPIResponse<FileTree>> {
    const cacheKey = generateCacheKey('tree', owner, repo, sha)
    return this.request<FileTree>(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, {
      cacheKey,
      cacheTTL: CACHE_TTL.fileTree,
    })
  }

  /**
   * Fetch file content
   */
  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubAPIResponse<FileContent>> {
    const cacheKey = generateCacheKey('content', owner, repo, path, ref || 'HEAD')
    const endpoint = ref
      ? `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
      : `/repos/${owner}/${repo}/contents/${path}`

    return this.request<FileContent>(endpoint, {
      cacheKey,
      cacheTTL: CACHE_TTL.fileContent,
    })
  }

  /**
   * Fetch raw file content (decoded)
   */
  async fetchRawContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubAPIResponse<string>> {
    const response = await this.fetchFileContent(owner, repo, path, ref)

    if (!response.success) {
      return { success: false, error: response.error }
    }

    if (!response.data) {
      return {
        success: false,
        error: { message: 'File content not available', status: 404 },
      }
    }

    if (response.data.encoding === 'base64' && response.data.content) {
      try {
        const decoded = atob(response.data.content.replace(/\n/g, ''))
        return { success: true, data: decoded }
      } catch {
        return {
          success: false,
          error: { message: 'Failed to decode file content', status: 500 },
        }
      }
    }

    return {
      success: false,
      error: { message: 'File content not available', status: 404 },
    }
  }

  // ============================================
  // Branch Methods
  // ============================================

  /**
   * Fetch repository branches
   */
  async fetchBranches(
    owner: string,
    repo: string,
    options?: { per_page?: number; page?: number }
  ): Promise<GitHubAPIResponse<PaginatedResult<Branch>>> {
    const params = new URLSearchParams()
    if (options?.per_page) params.set('per_page', options.per_page.toString())
    if (options?.page) params.set('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/branches${queryString ? `?${queryString}` : ''}`
    const cacheKey = generateCacheKey('branches', owner, repo, queryString)

    const response = await this.request<Branch[]>(endpoint, {
      cacheKey,
      cacheTTL: CACHE_TTL.branches,
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      data: {
        items: response.data || [],
        hasNextPage: (response.data?.length || 0) === (options?.per_page || 30),
        hasPreviousPage: (options?.page || 1) > 1,
        nextPage: (options?.page || 1) + 1,
        previousPage: Math.max(1, (options?.page || 1) - 1),
      },
    }
  }

  // ============================================
  // Pull Request Methods
  // ============================================

  /**
   * Fetch pull requests with filtering
   */
  async fetchPullRequests(
    owner: string,
    repo: string,
    filters?: PRFilters
  ): Promise<GitHubAPIResponse<PaginatedResult<PullRequest>>> {
    const params = new URLSearchParams()
    if (filters?.state) params.set('state', filters.state)
    if (filters?.head) params.set('head', filters.head)
    if (filters?.base) params.set('base', filters.base)
    if (filters?.sort) params.set('sort', filters.sort)
    if (filters?.direction) params.set('direction', filters.direction)
    if (filters?.per_page) params.set('per_page', filters.per_page.toString())
    if (filters?.page) params.set('page', filters.page.toString())

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/pulls${queryString ? `?${queryString}` : ''}`
    const cacheKey = generateCacheKey('pulls', owner, repo, queryString)

    const response = await this.request<PullRequest[]>(endpoint, {
      cacheKey,
      cacheTTL: CACHE_TTL.pullRequests,
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      data: {
        items: response.data || [],
        hasNextPage: (response.data?.length || 0) === (filters?.per_page || 30),
        hasPreviousPage: (filters?.page || 1) > 1,
        nextPage: (filters?.page || 1) + 1,
        previousPage: Math.max(1, (filters?.page || 1) - 1),
      },
    }
  }

  /**
   * Fetch a single pull request with details
   */
  async fetchPullRequest(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<PRDetail>> {
    const cacheKey = generateCacheKey('pr', owner, repo, number.toString())
    return this.request<PRDetail>(`/repos/${owner}/${repo}/pulls/${number}`, {
      cacheKey,
      cacheTTL: CACHE_TTL.pullRequests,
    })
  }

  /**
   * Fetch pull request files (changes)
   */
  async fetchPullRequestFiles(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<PRFile[]>> {
    const cacheKey = generateCacheKey('pr-files', owner, repo, number.toString())
    return this.request<PRFile[]>(`/repos/${owner}/${repo}/pulls/${number}/files`, {
      cacheKey,
      cacheTTL: CACHE_TTL.pullRequests,
    })
  }

  /**
   * Fetch pull request reviews
   */
  async fetchPullRequestReviews(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<PRReview[]>> {
    const cacheKey = generateCacheKey('pr-reviews', owner, repo, number.toString())
    return this.request<PRReview[]>(`/repos/${owner}/${repo}/pulls/${number}/reviews`, {
      cacheKey,
      cacheTTL: CACHE_TTL.pullRequests,
    })
  }

  /**
   * Fetch pull request review comments
   */
  async fetchPullRequestComments(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<PRReviewComment[]>> {
    const cacheKey = generateCacheKey('pr-comments', owner, repo, number.toString())
    return this.request<PRReviewComment[]>(`/repos/${owner}/${repo}/pulls/${number}/comments`, {
      cacheKey,
      cacheTTL: CACHE_TTL.pullRequests,
    })
  }

  // ============================================
  // Issue Methods
  // ============================================

  /**
   * Fetch issues with filtering
   */
  async fetchIssues(
    owner: string,
    repo: string,
    filters?: IssueFilters
  ): Promise<GitHubAPIResponse<PaginatedResult<Issue>>> {
    const params = new URLSearchParams()
    if (filters?.state) params.set('state', filters.state)
    if (filters?.labels) params.set('labels', filters.labels)
    if (filters?.sort) params.set('sort', filters.sort)
    if (filters?.direction) params.set('direction', filters.direction)
    if (filters?.since) params.set('since', filters.since)
    if (filters?.per_page) params.set('per_page', filters.per_page.toString())
    if (filters?.page) params.set('page', filters.page.toString())
    if (filters?.assignee) params.set('assignee', filters.assignee)
    if (filters?.creator) params.set('creator', filters.creator)
    if (filters?.mentioned) params.set('mentioned', filters.mentioned)

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`
    const cacheKey = generateCacheKey('issues', owner, repo, queryString)

    const response = await this.request<Issue[]>(endpoint, {
      cacheKey,
      cacheTTL: CACHE_TTL.issues,
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    // Filter out pull requests (GitHub returns PRs in issues endpoint)
    const issuesOnly = (response.data || []).filter((issue) => !issue.pull_request)

    return {
      success: true,
      data: {
        items: issuesOnly,
        hasNextPage: (response.data?.length || 0) === (filters?.per_page || 30),
        hasPreviousPage: (filters?.page || 1) > 1,
        nextPage: (filters?.page || 1) + 1,
        previousPage: Math.max(1, (filters?.page || 1) - 1),
      },
    }
  }

  /**
   * Fetch a single issue with details
   */
  async fetchIssue(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<IssueDetail>> {
    const cacheKey = generateCacheKey('issue', owner, repo, number.toString())
    return this.request<IssueDetail>(`/repos/${owner}/${repo}/issues/${number}`, {
      cacheKey,
      cacheTTL: CACHE_TTL.issues,
    })
  }

  /**
   * Fetch issue comments
   */
  async fetchIssueComments(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubAPIResponse<IssueComment[]>> {
    const cacheKey = generateCacheKey('issue-comments', owner, repo, number.toString())
    return this.request<IssueComment[]>(`/repos/${owner}/${repo}/issues/${number}/comments`, {
      cacheKey,
      cacheTTL: CACHE_TTL.issues,
    })
  }

  // ============================================
  // Commit Methods
  // ============================================

  /**
   * Fetch commits with filtering
   */
  async fetchCommits(
    owner: string,
    repo: string,
    filters?: CommitFilters
  ): Promise<GitHubAPIResponse<PaginatedResult<Commit>>> {
    const params = new URLSearchParams()
    if (filters?.sha) params.set('sha', filters.sha)
    if (filters?.path) params.set('path', filters.path)
    if (filters?.author) params.set('author', filters.author)
    if (filters?.since) params.set('since', filters.since)
    if (filters?.until) params.set('until', filters.until)
    if (filters?.per_page) params.set('per_page', filters.per_page.toString())
    if (filters?.page) params.set('page', filters.page.toString())

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/commits${queryString ? `?${queryString}` : ''}`
    const cacheKey = generateCacheKey('commits', owner, repo, queryString)

    const response = await this.request<Commit[]>(endpoint, {
      cacheKey,
      cacheTTL: CACHE_TTL.commits,
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      data: {
        items: response.data || [],
        hasNextPage: (response.data?.length || 0) === (filters?.per_page || 30),
        hasPreviousPage: (filters?.page || 1) > 1,
        nextPage: (filters?.page || 1) + 1,
        previousPage: Math.max(1, (filters?.page || 1) - 1),
      },
    }
  }

  /**
   * Fetch a single commit
   */
  async fetchCommit(owner: string, repo: string, sha: string): Promise<GitHubAPIResponse<Commit>> {
    const cacheKey = generateCacheKey('commit', owner, repo, sha)
    return this.request<Commit>(`/repos/${owner}/${repo}/commits/${sha}`, {
      cacheKey,
      cacheTTL: CACHE_TTL.commits,
    })
  }

  // ============================================
  // Search Methods
  // ============================================

  /**
   * Search code in a repository
   */
  async searchCode(
    owner: string,
    repo: string,
    query: string,
    filters?: Omit<SearchFilters, 'q'>
  ): Promise<GitHubAPIResponse<SearchResult<CodeSearchItem>>> {
    // Build the search query with repo scope
    const fullQuery = `${query} repo:${owner}/${repo}`
    const params = new URLSearchParams({ q: fullQuery })

    if (filters?.sort) params.set('sort', filters.sort)
    if (filters?.order) params.set('order', filters.order)
    if (filters?.per_page) params.set('per_page', filters.per_page.toString())
    if (filters?.page) params.set('page', filters.page.toString())

    const queryString = params.toString()
    const cacheKey = generateCacheKey('search-code', owner, repo, queryString)

    // Search requests require text-match media type for highlighting
    return this.request<SearchResult<CodeSearchItem>>(`/search/code?${queryString}`, {
      cacheKey,
      cacheTTL: CACHE_TTL.search,
      headers: {
        Accept: 'application/vnd.github.text-match+json',
      },
    })
  }

  // ============================================
  // Cache Management
  // ============================================

  /**
   * Clear cache for a specific repository
   */
  clearRepositoryCache(owner: string, repo: string): void {
    this.cache.deletePattern(`*:${owner}:${repo}:*`)
    this.cache.delete(generateCacheKey('repo', owner, repo))
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear()
  }

  // ============================================
  // Rate Limit Info
  // ============================================

  /**
   * Get current rate limit status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getSummary()
  }
}

// ============================================
// Singleton Instance
// ============================================

let globalGitHubService: GitHubService | null = null

/**
 * Get the global GitHub service instance
 */
export function getGitHubService(config?: GitHubServiceConfig): GitHubService {
  if (!globalGitHubService) {
    globalGitHubService = new GitHubService({
      token: process.env.GITHUB_TOKEN,
      ...config,
    })
  }
  return globalGitHubService
}

/**
 * Reset the global GitHub service (useful for testing)
 */
export function resetGitHubService(): void {
  globalGitHubService = null
}

/**
 * Create a new GitHub service instance with custom config
 */
export function createGitHubService(config: GitHubServiceConfig): GitHubService {
  return new GitHubService({
    token: process.env.GITHUB_TOKEN,
    ...config,
  })
}
