/**
 * GitHub Hooks - Barrel Exports
 *
 * React hooks for interacting with GitHub repositories through the SuperTool API.
 * These hooks provide a convenient interface for fetching repository data,
 * files, pull requests, issues, and building AI context.
 */

export {
  type UseGitHubFilesParams,
  type UseGitHubFilesReturn,
  useGitHubFiles,
} from './use-github-files'
export {
  type UseGitHubIssuesParams,
  type UseGitHubIssuesReturn,
  useGitHubIssues,
} from './use-github-issues'
export { type UseGitHubPRsParams, type UseGitHubPRsReturn, useGitHubPRs } from './use-github-prs'
// Repository data hooks
export {
  type UseGitHubRepoParams,
  type UseGitHubRepoReturn,
  useGitHubRepo,
} from './use-github-repo'

// Context building hook
export {
  type UseRepoContextParams,
  type UseRepoContextReturn,
  useRepoContext,
} from './use-repo-context'
