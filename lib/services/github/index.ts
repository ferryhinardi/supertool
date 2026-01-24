/**
 * GitHub Service - Barrel Exports
 *
 * Central export point for all GitHub API integration components.
 * Import from '@/lib/services/github' for a clean API.
 *
 * @example
 * ```typescript
 * import {
 *   GitHubService,
 *   GitHubCache,
 *   GitHubRateLimiter,
 *   createGitHubService,
 *   type Repository,
 *   type PullRequest,
 * } from '@/lib/services/github'
 *
 * const github = createGitHubService()
 * const repo = await github.fetchRepository('owner', 'repo')
 * ```
 */

// Cache management
export {
  GitHubCache,
  type GitHubCacheConfig,
  generateCacheKey,
  getGitHubCache,
  resetGitHubCache,
} from './cache'
// Core service client
export {
  createGitHubService,
  GitHubService,
  getGitHubService,
  resetGitHubService,
} from './client'

// Rate limiting
export {
  GitHubRateLimiter,
  getGitHubRateLimiter,
  getResourceFromEndpoint,
  parseLinkHeader,
  type RateLimiterConfig,
  type RateLimitState,
  resetGitHubRateLimiter,
} from './rate-limiter'
// Types - User & Author
// Types - Repository
// Types - File Tree & Content
// Types - Branches
// Types - Pull Requests
// Types - Issues
// Types - Commits
// Types - Search
// Types - API Response & Rate Limit
// Types - Cache
// Types - Configuration
// Types - Pagination
export type {
  Branch,
  BranchDetail,
  BranchProtection,
  CacheEntry,
  CacheOptions,
  CodeSearchItem,
  Commit,
  CommitFile,
  CommitFilters,
  DirectoryContent,
  FileContent,
  FileTree,
  FileTreeItem,
  GitHubAPIError,
  GitHubAPIResponse,
  GitHubAuthor,
  GitHubServiceConfig,
  GitHubUser,
  Issue,
  IssueComment,
  IssueDetail,
  IssueEvent,
  IssueFilters,
  Label,
  Milestone,
  PaginatedResult,
  PaginationParams,
  PRDetail,
  PRFile,
  PRFilters,
  PRRef,
  PRReview,
  PRReviewComment,
  PullRequest,
  RateLimitInfo,
  Reactions,
  Repository,
  RepositoryStats,
  SearchFilters,
  SearchResult,
  TextMatch,
} from './types'
