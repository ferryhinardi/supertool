/**
 * GitHub API Integration - TypeScript Types
 *
 * Comprehensive type definitions for GitHub API entities including:
 * - Repository metadata
 * - File tree and content
 * - Pull requests and reviews
 * - Issues and comments
 * - Commits and branches
 * - Search results
 */

// ============================================
// User & Author Types
// ============================================

export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
  type: 'User' | 'Organization' | 'Bot'
}

export interface GitHubAuthor {
  name: string
  email: string
  date: string
}

// ============================================
// Repository Types
// ============================================

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  owner: GitHubUser
  html_url: string
  clone_url: string
  ssh_url: string
  default_branch: string
  language: string | null
  languages_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  topics: string[]
  visibility: 'public' | 'private' | 'internal'
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  archived: boolean
  disabled: boolean
}

export interface RepositoryStats {
  contributors: number
  commits: number
  branches: number
  releases: number
  tags: number
}

// ============================================
// File Tree Types
// ============================================

export interface FileTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export interface FileTree {
  sha: string
  url: string
  tree: FileTreeItem[]
  truncated: boolean
}

export interface FileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  content?: string // Base64 encoded for files
  encoding?: 'base64'
  _links: {
    self: string
    git: string
    html: string
  }
}

export interface DirectoryContent {
  items: FileContent[]
  truncated: boolean
}

// ============================================
// Branch Types
// ============================================

export interface Branch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface BranchDetail extends Branch {
  protection?: BranchProtection
  protection_url?: string
}

export interface BranchProtection {
  enabled: boolean
  required_status_checks?: {
    enforcement_level: string
    contexts: string[]
  }
}

// ============================================
// Commit Types
// ============================================

export interface Commit {
  sha: string
  node_id: string
  commit: {
    author: GitHubAuthor
    committer: GitHubAuthor
    message: string
    tree: {
      sha: string
      url: string
    }
    url: string
    comment_count: number
  }
  url: string
  html_url: string
  comments_url: string
  author: GitHubUser | null
  committer: GitHubUser | null
  parents: Array<{
    sha: string
    url: string
    html_url: string
  }>
  stats?: {
    total: number
    additions: number
    deletions: number
  }
  files?: CommitFile[]
}

export interface CommitFile {
  sha: string
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string
  previous_filename?: string
}

// ============================================
// Pull Request Types
// ============================================

export interface PullRequest {
  id: number
  number: number
  state: 'open' | 'closed'
  locked: boolean
  title: string
  body: string | null
  user: GitHubUser
  labels: Label[]
  milestone: Milestone | null
  assignees: GitHubUser[]
  requested_reviewers: GitHubUser[]
  draft: boolean
  html_url: string
  diff_url: string
  patch_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  merge_commit_sha: string | null
  head: PRRef
  base: PRRef
  mergeable?: boolean | null
  mergeable_state?: string
  merged?: boolean
  merged_by?: GitHubUser | null
  comments: number
  review_comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

export interface PRRef {
  label: string
  ref: string
  sha: string
  user: GitHubUser
  repo: Repository
}

export interface PRDetail extends PullRequest {
  files?: PRFile[]
  reviews?: PRReview[]
  reviewComments?: PRReviewComment[]
}

export interface PRFile {
  sha: string
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string
  previous_filename?: string
}

export interface PRReview {
  id: number
  user: GitHubUser
  body: string | null
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING'
  html_url: string
  submitted_at: string
  commit_id: string
}

export interface PRReviewComment {
  id: number
  pull_request_review_id: number
  diff_hunk: string
  path: string
  position?: number
  original_position?: number
  commit_id: string
  original_commit_id: string
  user: GitHubUser
  body: string
  created_at: string
  updated_at: string
  html_url: string
  in_reply_to_id?: number
  start_line?: number
  original_start_line?: number
  start_side?: 'LEFT' | 'RIGHT'
  line?: number
  original_line?: number
  side?: 'LEFT' | 'RIGHT'
}

// ============================================
// Issue Types
// ============================================

export interface Issue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  state_reason?: 'completed' | 'reopened' | 'not_planned' | null
  locked: boolean
  user: GitHubUser
  labels: Label[]
  assignees: GitHubUser[]
  milestone: Milestone | null
  comments: number
  created_at: string
  updated_at: string
  closed_at: string | null
  closed_by?: GitHubUser | null
  html_url: string
  pull_request?: {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
  }
  reactions?: Reactions
}

export interface IssueDetail extends Issue {
  timeline?: IssueEvent[]
  issueComments?: IssueComment[]
}

export interface IssueComment {
  id: number
  user: GitHubUser
  body: string
  created_at: string
  updated_at: string
  html_url: string
  reactions?: Reactions
}

export interface IssueEvent {
  id: number
  event: string
  actor: GitHubUser
  created_at: string
  commit_id?: string
  commit_url?: string
  label?: Label
  assignee?: GitHubUser
  assigner?: GitHubUser
  milestone?: Milestone
  rename?: {
    from: string
    to: string
  }
}

// ============================================
// Label & Milestone Types
// ============================================

export interface Label {
  id: number
  name: string
  description: string | null
  color: string
  default: boolean
}

export interface Milestone {
  id: number
  number: number
  title: string
  description: string | null
  state: 'open' | 'closed'
  open_issues: number
  closed_issues: number
  created_at: string
  updated_at: string
  due_on: string | null
  closed_at: string | null
}

// ============================================
// Reaction Types
// ============================================

export interface Reactions {
  url: string
  total_count: number
  '+1': number
  '-1': number
  laugh: number
  hooray: number
  confused: number
  heart: number
  rocket: number
  eyes: number
}

// ============================================
// Search Types
// ============================================

export interface SearchResult<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

export interface CodeSearchItem {
  name: string
  path: string
  sha: string
  url: string
  git_url: string
  html_url: string
  repository: {
    id: number
    name: string
    full_name: string
    owner: GitHubUser
    html_url: string
  }
  score: number
  text_matches?: TextMatch[]
}

export interface TextMatch {
  object_url: string
  object_type: string
  property: string
  fragment: string
  matches: Array<{
    text: string
    indices: [number, number]
  }>
}

// ============================================
// Filter Types
// ============================================

export interface PRFilters {
  state?: 'open' | 'closed' | 'all'
  head?: string
  base?: string
  sort?: 'created' | 'updated' | 'popularity' | 'long-running'
  direction?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface IssueFilters {
  state?: 'open' | 'closed' | 'all'
  labels?: string
  sort?: 'created' | 'updated' | 'comments'
  direction?: 'asc' | 'desc'
  since?: string
  per_page?: number
  page?: number
  assignee?: string
  creator?: string
  mentioned?: string
}

export interface CommitFilters {
  sha?: string
  path?: string
  author?: string
  since?: string
  until?: string
  per_page?: number
  page?: number
}

export interface SearchFilters {
  q: string
  sort?: 'indexed'
  order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

// ============================================
// API Response Types
// ============================================

export interface GitHubAPIResponse<T> {
  success: boolean
  data?: T
  error?: GitHubAPIError
}

export interface GitHubAPIError {
  message: string
  status: number
  documentation_url?: string
  errors?: Array<{
    resource: string
    field: string
    code: string
    message?: string
  }>
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp
  used: number
  resource: string
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  etag?: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean
}

// ============================================
// Service Configuration
// ============================================

export interface GitHubServiceConfig {
  token?: string
  baseUrl?: string
  userAgent?: string
  timeout?: number
  cache?: {
    enabled: boolean
    defaultTTL: number // milliseconds
  }
  rateLimit?: {
    enabled: boolean
    maxConcurrent: number
  }
}

// ============================================
// Pagination Types
// ============================================

export interface PaginatedResult<T> {
  items: T[]
  totalCount?: number
  hasNextPage: boolean
  nextPage?: number
  hasPreviousPage: boolean
  previousPage?: number
  lastPage?: number
}

export interface PaginationParams {
  page?: number
  per_page?: number
}

// ============================================
// Write Operation Types
// ============================================

// File Operations
export interface CreateFileParams {
  path: string
  message: string
  content: string // base64 encoded
  branch?: string
  sha?: string // required for updates, get from fetchFileContent
  committer?: {
    name: string
    email: string
  }
  author?: {
    name: string
    email: string
  }
}

export interface UpdateFileParams extends CreateFileParams {
  sha: string // required for updates
}

export interface DeleteFileParams {
  message: string
  sha: string // required, get from fetchFileContent
  branch?: string
  committer?: {
    name: string
    email: string
  }
  author?: {
    name: string
    email: string
  }
}

export interface FileCommitResponse {
  content: {
    name: string
    path: string
    sha: string
    size: number
    url: string
    html_url: string
    git_url: string
    download_url: string | null
    type: string
  } | null
  commit: {
    sha: string
    node_id: string
    url: string
    html_url: string
    author: GitHubAuthor
    committer: GitHubAuthor
    message: string
    tree: {
      sha: string
      url: string
    }
    parents: Array<{
      sha: string
      url: string
      html_url: string
    }>
  }
}

// Branch Operations
export interface CreateBranchParams {
  ref: string // format: "refs/heads/branch-name"
  sha: string // commit SHA to branch from
}

export interface GitRef {
  ref: string
  node_id: string
  url: string
  object: {
    sha: string
    type: string
    url: string
  }
}

// Pull Request Operations
export interface CreatePRParams {
  title: string
  body?: string
  head: string // branch containing changes
  base: string // branch to merge into
  draft?: boolean
  maintainer_can_modify?: boolean
}

export interface UpdatePRParams {
  title?: string
  body?: string
  state?: 'open' | 'closed'
  base?: string
  maintainer_can_modify?: boolean
}

// Issue Operations
export interface CreateIssueParams {
  title: string
  body?: string
  assignees?: string[]
  milestone?: number
  labels?: string[]
}

export interface UpdateIssueParams {
  title?: string
  body?: string
  state?: 'open' | 'closed'
  state_reason?: 'completed' | 'not_planned' | 'reopened'
  assignees?: string[]
  milestone?: number | null
  labels?: string[]
}

// Comment Operations
export interface CreateCommentParams {
  body: string
}

export interface UpdateCommentParams {
  body: string
}

// PR Review Operations
export interface CreatePRReviewParams {
  body?: string
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  comments?: Array<{
    path: string
    position?: number
    body: string
    line?: number
    side?: 'LEFT' | 'RIGHT'
    start_line?: number
    start_side?: 'LEFT' | 'RIGHT'
  }>
}

// PR Review Comment Operations
export interface CreatePRReviewCommentParams {
  body: string
  commit_id: string
  path: string
  line?: number
  side?: 'LEFT' | 'RIGHT'
  start_line?: number
  start_side?: 'LEFT' | 'RIGHT'
}
