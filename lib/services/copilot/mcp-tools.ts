/**
 * GitHub Copilot SDK Integration - MCP Tool Registry
 *
 * Implements the Model Context Protocol (MCP) tool system for:
 * - Tool registration and discovery
 * - Tool execution with proper error handling
 * - Built-in tools for file analysis, PR fetching, and chart generation
 */

import { getGitHubService } from '@/lib/services/github/client'
import type {
  CodeSearchItem,
  CreatePRParams,
  CreatePRReviewParams,
  FileTree,
  Issue,
  IssueComment,
  IssueDetail,
  IssueFilters,
  PaginatedResult,
  PRFile,
  PRFilters,
  PRReview,
  PRReviewComment,
  PullRequest,
  SearchFilters,
  SearchResult,
} from '@/lib/services/github/types'
import { CopilotErrorHandler } from './error-handler'
import type {
  ChartData,
  ChartDataPoint,
  FileInfo,
  FileOrganizationPreferences,
  FileSuggestion,
  MCPPropertySchema,
  MCPToolDefinition,
  PRInfo,
  ToolCall,
  ToolResult,
} from './types'

/**
 * File category mappings for organization suggestions
 */
const FILE_CATEGORIES: Record<string, string[]> = {
  documents: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
  videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h'],
  data: ['json', 'xml', 'yaml', 'yml', 'csv', 'sql'],
  archives: ['zip', 'tar', 'gz', 'rar', '7z'],
  config: ['env', 'ini', 'conf', 'toml', 'lock'],
}

/**
 * Get category for a file extension
 */
function getCategoryForExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '')
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category
    }
  }
  return 'other'
}

/**
 * MCP Tool Registry - Singleton class for managing MCP tools
 */
export class MCPToolRegistry {
  private static instance: MCPToolRegistry | null = null
  private tools: Map<string, MCPToolDefinition> = new Map()
  private initialized = false

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): MCPToolRegistry {
    if (!MCPToolRegistry.instance) {
      MCPToolRegistry.instance = new MCPToolRegistry()
    }
    return MCPToolRegistry.instance
  }

  /**
   * Initialize the registry with built-in tools
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    // Register built-in tools
    this.registerBuiltInTools()
    this.initialized = true
  }

  /**
   * Register built-in tools
   */
  private registerBuiltInTools(): void {
    // Tool 1: Fetch PR data from GitHub
    this.register({
      name: 'fetch_pr',
      description:
        'Fetch pull request data from GitHub API including details about changes, reviews, and timeline',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          prNumber: {
            type: 'number',
            description: 'The pull request number',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'prNumber'],
      },
      handler: this.fetchPRHandler.bind(this),
    })

    // Tool 2: Analyze files
    this.register({
      name: 'analyze_files',
      description:
        'Analyze file metadata including size distribution, type categorization, and organization patterns',
      inputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            description: 'Array of file information objects to analyze',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'File name' },
                path: { type: 'string', description: 'File path' },
                size: { type: 'number', description: 'File size in bytes' },
                type: { type: 'string', description: 'MIME type' },
                extension: { type: 'string', description: 'File extension' },
                modifiedAt: { type: 'number', description: 'Last modified timestamp' },
              },
            },
          } as MCPPropertySchema,
        },
        required: ['files'],
      },
      handler: this.analyzeFilesHandler.bind(this),
    })

    // Tool 3: Suggest file organization
    this.register({
      name: 'suggest_organization',
      description:
        'Generate intelligent file organization suggestions based on file types, dates, and custom preferences',
      inputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            description: 'Array of file information objects',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'File name' },
                path: { type: 'string', description: 'File path' },
                size: { type: 'number', description: 'File size in bytes' },
                type: { type: 'string', description: 'MIME type' },
                extension: { type: 'string', description: 'File extension' },
                modifiedAt: { type: 'number', description: 'Last modified timestamp' },
              },
            },
          } as MCPPropertySchema,
          preferences: {
            type: 'object',
            description: 'Organization preferences',
            properties: {
              groupBy: {
                type: 'string',
                description: 'How to group files: type, date, project, or custom',
                enum: ['type', 'date', 'project', 'custom'],
              },
              basePath: {
                type: 'string',
                description: 'Base path for organized files',
              },
              dateFormat: {
                type: 'string',
                description: 'Date format for date-based grouping',
              },
            },
          } as MCPPropertySchema,
        },
        required: ['files'],
      },
      handler: this.suggestOrganizationHandler.bind(this),
    })

    // Tool 4: Generate chart data
    this.register({
      name: 'generate_chart',
      description:
        'Generate chart data for visualization including timeline, bar, pie, treemap, and line charts',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Type of chart to generate',
            enum: ['timeline', 'bar', 'pie', 'treemap', 'line'],
          } as MCPPropertySchema,
          data: {
            type: 'array',
            description: 'Data points for the chart',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Data point name/label' },
                value: { type: 'number', description: 'Data point value' },
                color: { type: 'string', description: 'Optional color for the data point' },
              },
            },
          } as MCPPropertySchema,
          title: {
            type: 'string',
            description: 'Title for the chart',
          } as MCPPropertySchema,
        },
        required: ['type', 'data', 'title'],
      },
      handler: this.generateChartHandler.bind(this),
    })

    // Tool 5: Browse repository file tree
    this.register({
      name: 'browse_repo',
      description:
        'Browse the file tree structure of a GitHub repository to explore its contents and organization',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          path: {
            type: 'string',
            description: 'Optional path to browse within the repository (defaults to root)',
          } as MCPPropertySchema,
          ref: {
            type: 'string',
            description: 'Optional branch, tag, or commit SHA (defaults to default branch)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo'],
      },
      handler: this.browseRepoHandler.bind(this),
    })

    // Tool 6: Read file contents from repository
    this.register({
      name: 'read_file',
      description: 'Read the raw contents of a file from a GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          path: {
            type: 'string',
            description: 'The path to the file within the repository',
          } as MCPPropertySchema,
          ref: {
            type: 'string',
            description: 'Optional branch, tag, or commit SHA (defaults to default branch)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'path'],
      },
      handler: this.readFileHandler.bind(this),
    })

    // Tool 7: Search code in repository
    this.register({
      name: 'search_code',
      description: 'Search for code within a GitHub repository using keywords and optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          query: {
            type: 'string',
            description: 'The search query string',
          } as MCPPropertySchema,
          filters: {
            type: 'object',
            description: 'Optional search filters',
            properties: {
              language: { type: 'string', description: 'Filter by programming language' },
              path: { type: 'string', description: 'Filter by file path prefix' },
              extension: { type: 'string', description: 'Filter by file extension' },
            },
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'query'],
      },
      handler: this.searchCodeHandler.bind(this),
    })

    // Tool 8: List pull requests
    this.register({
      name: 'list_prs',
      description: 'List pull requests in a GitHub repository with optional filtering and sorting',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          filters: {
            type: 'object',
            description: 'Optional filters for pull requests',
            properties: {
              state: {
                type: 'string',
                description: 'Filter by state: open, closed, or all',
                enum: ['open', 'closed', 'all'],
              },
              sort: {
                type: 'string',
                description: 'Sort by: created, updated, popularity, long-running',
                enum: ['created', 'updated', 'popularity', 'long-running'],
              },
              direction: {
                type: 'string',
                description: 'Sort direction: asc or desc',
                enum: ['asc', 'desc'],
              },
              per_page: {
                type: 'number',
                description: 'Number of results per page (max 100)',
              },
            },
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo'],
      },
      handler: this.listPRsHandler.bind(this),
    })

    // Tool 9: Analyze a pull request in detail
    this.register({
      name: 'analyze_pr',
      description:
        'Get comprehensive analysis of a pull request including files changed, reviews, and comments',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          prNumber: {
            type: 'number',
            description: 'The pull request number',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'prNumber'],
      },
      handler: this.analyzePRHandler.bind(this),
    })

    // Tool 10: List issues
    this.register({
      name: 'list_issues',
      description: 'List issues in a GitHub repository with optional filtering and sorting',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          filters: {
            type: 'object',
            description: 'Optional filters for issues',
            properties: {
              state: {
                type: 'string',
                description: 'Filter by state: open, closed, or all',
                enum: ['open', 'closed', 'all'],
              },
              labels: {
                type: 'string',
                description: 'Comma-separated list of label names',
              },
              sort: {
                type: 'string',
                description: 'Sort by: created, updated, comments',
                enum: ['created', 'updated', 'comments'],
              },
              direction: {
                type: 'string',
                description: 'Sort direction: asc or desc',
                enum: ['asc', 'desc'],
              },
              per_page: {
                type: 'number',
                description: 'Number of results per page (max 100)',
              },
            },
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo'],
      },
      handler: this.listIssuesHandler.bind(this),
    })

    // Tool 11: Analyze an issue in detail
    this.register({
      name: 'analyze_issue',
      description: 'Get comprehensive analysis of an issue including details and all comments',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          issueNumber: {
            type: 'number',
            description: 'The issue number',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'issueNumber'],
      },
      handler: this.analyzeIssueHandler.bind(this),
    })

    // ============================================
    // Write Tools - File Operations
    // ============================================

    // Tool 12: Create a file in repository
    this.register({
      name: 'create_file',
      description:
        'Create a new file in a GitHub repository. The file content should be provided as plain text and will be automatically base64 encoded.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          path: {
            type: 'string',
            description: 'The path where the file should be created (e.g., "src/utils/helper.ts")',
          } as MCPPropertySchema,
          content: {
            type: 'string',
            description: 'The content of the file (plain text, will be base64 encoded)',
          } as MCPPropertySchema,
          message: {
            type: 'string',
            description: 'The commit message for creating the file',
          } as MCPPropertySchema,
          branch: {
            type: 'string',
            description: 'The branch to create the file in (defaults to default branch)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'path', 'content', 'message'],
      },
      handler: this.createFileHandler.bind(this),
    })

    // Tool 13: Update a file in repository
    this.register({
      name: 'update_file',
      description:
        'Update an existing file in a GitHub repository. You must provide the current SHA of the file (get it using read_file or browse_repo first).',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          path: {
            type: 'string',
            description: 'The path to the file to update',
          } as MCPPropertySchema,
          content: {
            type: 'string',
            description: 'The new content for the file (plain text, will be base64 encoded)',
          } as MCPPropertySchema,
          message: {
            type: 'string',
            description: 'The commit message for the update',
          } as MCPPropertySchema,
          sha: {
            type: 'string',
            description: 'The current SHA of the file (required for updates)',
          } as MCPPropertySchema,
          branch: {
            type: 'string',
            description: 'The branch to update the file in (defaults to default branch)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'path', 'content', 'message', 'sha'],
      },
      handler: this.updateFileHandler.bind(this),
    })

    // Tool 14: Delete a file from repository
    this.register({
      name: 'delete_file',
      description:
        'Delete a file from a GitHub repository. You must provide the current SHA of the file.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          path: {
            type: 'string',
            description: 'The path to the file to delete',
          } as MCPPropertySchema,
          message: {
            type: 'string',
            description: 'The commit message for the deletion',
          } as MCPPropertySchema,
          sha: {
            type: 'string',
            description: 'The current SHA of the file (required for deletion)',
          } as MCPPropertySchema,
          branch: {
            type: 'string',
            description: 'The branch to delete the file from (defaults to default branch)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'path', 'message', 'sha'],
      },
      handler: this.deleteFileHandler.bind(this),
    })

    // ============================================
    // Write Tools - Branch Operations
    // ============================================

    // Tool 15: Create a new branch
    this.register({
      name: 'create_branch',
      description:
        'Create a new branch in a GitHub repository from an existing branch or commit SHA.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          branchName: {
            type: 'string',
            description: 'The name for the new branch',
          } as MCPPropertySchema,
          fromBranch: {
            type: 'string',
            description:
              'The source branch to create from (defaults to default branch). Use this OR fromSha.',
          } as MCPPropertySchema,
          fromSha: {
            type: 'string',
            description: 'The commit SHA to create the branch from. Use this OR fromBranch.',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'branchName'],
      },
      handler: this.createBranchHandler.bind(this),
    })

    // ============================================
    // Write Tools - Pull Request Operations
    // ============================================

    // Tool 16: Create a pull request
    this.register({
      name: 'create_pull_request',
      description: 'Create a new pull request in a GitHub repository.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          title: {
            type: 'string',
            description: 'The title of the pull request',
          } as MCPPropertySchema,
          body: {
            type: 'string',
            description: 'The description/body of the pull request',
          } as MCPPropertySchema,
          head: {
            type: 'string',
            description: 'The branch containing the changes (source branch)',
          } as MCPPropertySchema,
          base: {
            type: 'string',
            description: 'The branch to merge into (target branch, e.g., "main")',
          } as MCPPropertySchema,
          draft: {
            type: 'boolean',
            description: 'Whether to create the PR as a draft (default: false)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'title', 'head', 'base'],
      },
      handler: this.createPullRequestHandler.bind(this),
    })

    // Tool 17: Submit a PR review
    this.register({
      name: 'submit_pr_review',
      description: 'Submit a review on a pull request (approve, request changes, or comment).',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          prNumber: {
            type: 'number',
            description: 'The pull request number',
          } as MCPPropertySchema,
          event: {
            type: 'string',
            description: 'The review action: APPROVE, REQUEST_CHANGES, or COMMENT',
            enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'],
          } as MCPPropertySchema,
          body: {
            type: 'string',
            description: 'The review comment/body (required for REQUEST_CHANGES and COMMENT)',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'prNumber', 'event'],
      },
      handler: this.submitPRReviewHandler.bind(this),
    })

    // ============================================
    // Write Tools - Issue/Comment Operations
    // ============================================

    // Tool 18: Create an issue
    this.register({
      name: 'create_issue',
      description: 'Create a new issue in a GitHub repository.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          title: {
            type: 'string',
            description: 'The title of the issue',
          } as MCPPropertySchema,
          body: {
            type: 'string',
            description: 'The description/body of the issue',
          } as MCPPropertySchema,
          labels: {
            type: 'array',
            description: 'Labels to apply to the issue',
            items: { type: 'string' },
          } as MCPPropertySchema,
          assignees: {
            type: 'array',
            description: 'GitHub usernames to assign to the issue',
            items: { type: 'string' },
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'title'],
      },
      handler: this.createIssueHandler.bind(this),
    })

    // Tool 19: Add a comment to an issue or PR
    this.register({
      name: 'add_comment',
      description: 'Add a comment to an issue or pull request.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'The owner/organization of the repository',
          } as MCPPropertySchema,
          repo: {
            type: 'string',
            description: 'The repository name',
          } as MCPPropertySchema,
          issueNumber: {
            type: 'number',
            description: 'The issue or PR number',
          } as MCPPropertySchema,
          body: {
            type: 'string',
            description: 'The comment text',
          } as MCPPropertySchema,
        },
        required: ['owner', 'repo', 'issueNumber', 'body'],
      },
      handler: this.addCommentHandler.bind(this),
    })
  }

  /**
   * Handler: Fetch PR from GitHub
   */
  private async fetchPRHandler(args: Record<string, unknown>): Promise<PRInfo> {
    const owner = args.owner as string
    const repo = args.repo as string
    const prNumber = args.prNumber as number

    if (!owner || !repo || !prNumber) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, prNumber',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.fetchPullRequest(owner, repo, prNumber)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to fetch PR',
        { owner, repo, prNumber, status: response.error?.status }
      )
    }

    const data = response.data

    if (!data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        prNumber,
      })
    }

    const prInfo: PRInfo = {
      number: data.number,
      title: data.title,
      state: data.merged ? 'merged' : data.state,
      author: data.user?.login || 'unknown',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at ?? undefined,
      closedAt: data.closed_at ?? undefined,
      additions: data.additions || 0,
      deletions: data.deletions || 0,
      changedFiles: data.changed_files || 0,
      commits: data.commits || 0,
      comments: data.comments || 0,
      reviewComments: data.review_comments || 0,
      labels: data.labels?.map((l: { name: string }) => l.name) || [],
      milestone: data.milestone?.title ?? undefined,
      assignees: data.assignees?.map((a: { login: string }) => a.login) || [],
      reviewers: data.requested_reviewers?.map((r: { login: string }) => r.login) || [],
      draft: data.draft || false,
      mergeable: data.mergeable ?? undefined,
      baseRef: data.base?.ref || 'unknown',
      headRef: data.head?.ref || 'unknown',
      body: data.body ?? undefined,
    }

    return prInfo
  }

  /**
   * Handler: Analyze files
   */
  private async analyzeFilesHandler(args: Record<string, unknown>): Promise<{
    totalFiles: number
    totalSize: number
    byCategory: Record<string, { count: number; size: number; files: string[] }>
    byExtension: Record<string, number>
    largestFiles: Array<{ name: string; size: number }>
    oldestFiles: Array<{ name: string; modifiedAt: number }>
    newestFiles: Array<{ name: string; modifiedAt: number }>
  }> {
    const files = args.files as FileInfo[]

    if (!files || !Array.isArray(files)) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing or invalid files parameter',
        { args }
      )
    }

    // Initialize analysis results
    const byCategory: Record<string, { count: number; size: number; files: string[] }> = {}
    const byExtension: Record<string, number> = {}
    let totalSize = 0

    // Process each file
    for (const file of files) {
      const category = getCategoryForExtension(file.extension)
      const ext = file.extension.toLowerCase()

      // Update category stats
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, size: 0, files: [] }
      }
      byCategory[category].count++
      byCategory[category].size += file.size
      byCategory[category].files.push(file.name)

      // Update extension stats
      byExtension[ext] = (byExtension[ext] || 0) + 1

      // Update total size
      totalSize += file.size
    }

    // Get largest files (top 5)
    const largestFiles = [...files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map((f) => ({ name: f.name, size: f.size }))

    // Get oldest files (top 5)
    const oldestFiles = [...files]
      .sort((a, b) => a.modifiedAt - b.modifiedAt)
      .slice(0, 5)
      .map((f) => ({ name: f.name, modifiedAt: f.modifiedAt }))

    // Get newest files (top 5)
    const newestFiles = [...files]
      .sort((a, b) => b.modifiedAt - a.modifiedAt)
      .slice(0, 5)
      .map((f) => ({ name: f.name, modifiedAt: f.modifiedAt }))

    return {
      totalFiles: files.length,
      totalSize,
      byCategory,
      byExtension,
      largestFiles,
      oldestFiles,
      newestFiles,
    }
  }

  /**
   * Handler: Suggest file organization
   */
  private async suggestOrganizationHandler(
    args: Record<string, unknown>
  ): Promise<FileSuggestion[]> {
    const files = args.files as FileInfo[]
    const preferences = (args.preferences as FileOrganizationPreferences) || { groupBy: 'type' }

    if (!files || !Array.isArray(files)) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing or invalid files parameter',
        { args }
      )
    }

    const suggestions: FileSuggestion[] = []
    const basePath = preferences.basePath || '/organized'
    const groupBy = preferences.groupBy || 'type'

    for (const file of files) {
      let suggestedPath: string
      let reason: string
      let category: string

      switch (groupBy) {
        case 'type':
          category = getCategoryForExtension(file.extension)
          suggestedPath = `${basePath}/${category}/${file.name}`
          reason = `Grouped by file type: ${category}`
          break

        case 'date': {
          const date = new Date(file.modifiedAt)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const dateFormat = preferences.dateFormat || 'YYYY/MM'
          category = `${year}/${month}`
          suggestedPath = `${basePath}/${year}/${month}/${file.name}`
          reason = `Grouped by modification date using format: ${dateFormat}`
          break
        }

        case 'project': {
          // Extract project name from path (first directory in path)
          const pathParts = file.path.split('/')
          const projectName = pathParts.length > 1 ? pathParts[1] : 'default'
          category = projectName
          suggestedPath = `${basePath}/${projectName}/${getCategoryForExtension(file.extension)}/${file.name}`
          reason = `Grouped by project: ${projectName}`
          break
        }

        default:
          category = getCategoryForExtension(file.extension)
          suggestedPath = `${basePath}/${category}/${file.name}`
          reason = `Default organization by file type`
      }

      // Calculate confidence based on extension match
      const confidence = FILE_CATEGORIES[category] ? 0.9 : 0.6

      suggestions.push({
        file,
        currentPath: file.path,
        suggestedPath,
        reason,
        confidence,
        category,
      })
    }

    return suggestions
  }

  /**
   * Handler: Generate chart data
   */
  private async generateChartHandler(args: Record<string, unknown>): Promise<ChartData> {
    const type = args.type as ChartData['type']
    const data = args.data as ChartDataPoint[]
    const title = args.title as string

    if (!type || !data || !title) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: type, data, title',
        { args }
      )
    }

    const validTypes = ['timeline', 'bar', 'pie', 'treemap', 'line']
    if (!validTypes.includes(type)) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        `Invalid chart type: ${type}. Must be one of: ${validTypes.join(', ')}`,
        { type, validTypes }
      )
    }

    // Generate colors if not provided
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ]

    const enrichedData = data.map((point, index) => ({
      ...point,
      color: point.color || colors[index % colors.length],
    }))

    const chartData: ChartData = {
      type,
      title,
      data: enrichedData,
      config: {
        showLegend: true,
        showTooltip: true,
        animate: true,
        colors,
      },
    }

    return chartData
  }

  /**
   * Handler: Browse repository file tree
   */
  private async browseRepoHandler(args: Record<string, unknown>): Promise<FileTree> {
    const owner = args.owner as string
    const repo = args.repo as string
    const ref = args.ref as string | undefined

    if (!owner || !repo) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.fetchFileTree(owner, repo, ref)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to fetch repository file tree',
        { owner, repo, ref, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        ref,
      })
    }

    return response.data
  }

  /**
   * Handler: Read file contents from repository
   */
  private async readFileHandler(
    args: Record<string, unknown>
  ): Promise<{ content: string; path: string }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const path = args.path as string
    const ref = args.ref as string | undefined

    if (!owner || !repo || !path) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, path',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.fetchRawContent(owner, repo, path, ref)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to read file contents',
        { owner, repo, path, ref, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        path,
        ref,
      })
    }

    return {
      content: response.data,
      path,
    }
  }

  /**
   * Handler: Search code in repository
   */
  private async searchCodeHandler(
    args: Record<string, unknown>
  ): Promise<SearchResult<CodeSearchItem>> {
    const owner = args.owner as string
    const repo = args.repo as string
    const query = args.query as string
    const filters = args.filters as SearchFilters | undefined

    if (!owner || !repo || !query) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, query',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.searchCode(owner, repo, query, filters)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to search code',
        { owner, repo, query, filters, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        query,
      })
    }
    return response.data
  }

  /**
   * Handler: List pull requests
   */
  private async listPRsHandler(
    args: Record<string, unknown>
  ): Promise<PaginatedResult<PullRequest>> {
    const owner = args.owner as string
    const repo = args.repo as string
    const filters = args.filters as PRFilters | undefined

    if (!owner || !repo) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.fetchPullRequests(owner, repo, filters)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to list pull requests',
        { owner, repo, filters, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
      })
    }
    return response.data
  }

  /**
   * Handler: Analyze a pull request in detail
   */
  private async analyzePRHandler(args: Record<string, unknown>): Promise<{
    pr: PRInfo
    files: PRFile[]
    reviews: PRReview[]
    comments: PRReviewComment[]
    summary: {
      totalFiles: number
      totalAdditions: number
      totalDeletions: number
      reviewCount: number
      commentCount: number
      approvalCount: number
      changesRequestedCount: number
    }
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const prNumber = args.prNumber as number

    if (!owner || !repo || !prNumber) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, prNumber',
        { args }
      )
    }

    const github = getGitHubService()

    // Fetch all PR data in parallel
    const [prResponse, filesResponse, reviewsResponse, commentsResponse] = await Promise.all([
      github.fetchPullRequest(owner, repo, prNumber),
      github.fetchPullRequestFiles(owner, repo, prNumber),
      github.fetchPullRequestReviews(owner, repo, prNumber),
      github.fetchPullRequestComments(owner, repo, prNumber),
    ])

    // Check for errors
    if (!prResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        prResponse.error?.message || 'Failed to fetch pull request',
        { owner, repo, prNumber, status: prResponse.error?.status }
      )
    }

    if (!filesResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        filesResponse.error?.message || 'Failed to fetch PR files',
        { owner, repo, prNumber, status: filesResponse.error?.status }
      )
    }

    if (!reviewsResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        reviewsResponse.error?.message || 'Failed to fetch PR reviews',
        { owner, repo, prNumber, status: reviewsResponse.error?.status }
      )
    }

    if (!commentsResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        commentsResponse.error?.message || 'Failed to fetch PR comments',
        { owner, repo, prNumber, status: commentsResponse.error?.status }
      )
    }

    // Validate all data is present (checked via success flags above)
    if (
      !prResponse.data ||
      !filesResponse.data ||
      !reviewsResponse.data ||
      !commentsResponse.data
    ) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        'Incomplete data returned from GitHub API',
        {
          owner,
          repo,
          prNumber,
        }
      )
    }

    const prData = prResponse.data
    const files = filesResponse.data
    const reviews = reviewsResponse.data
    const comments = commentsResponse.data

    // Build PRInfo from raw data
    const pr: PRInfo = {
      number: prData.number,
      title: prData.title,
      state: prData.merged ? 'merged' : prData.state,
      author: prData.user?.login || 'unknown',
      createdAt: prData.created_at,
      updatedAt: prData.updated_at,
      mergedAt: prData.merged_at ?? undefined,
      closedAt: prData.closed_at ?? undefined,
      additions: prData.additions || 0,
      deletions: prData.deletions || 0,
      changedFiles: prData.changed_files || 0,
      commits: prData.commits || 0,
      comments: prData.comments || 0,
      reviewComments: prData.review_comments || 0,
      labels: prData.labels?.map((l: { name: string }) => l.name) || [],
      milestone: prData.milestone?.title ?? undefined,
      assignees: prData.assignees?.map((a: { login: string }) => a.login) || [],
      reviewers: prData.requested_reviewers?.map((r: { login: string }) => r.login) || [],
      draft: prData.draft || false,
      mergeable: prData.mergeable ?? undefined,
      baseRef: prData.base?.ref || 'unknown',
      headRef: prData.head?.ref || 'unknown',
      body: prData.body ?? undefined,
    }

    // Calculate summary statistics
    const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0)
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0)
    const approvalCount = reviews.filter((r) => r.state === 'APPROVED').length
    const changesRequestedCount = reviews.filter((r) => r.state === 'CHANGES_REQUESTED').length

    return {
      pr,
      files,
      reviews,
      comments,
      summary: {
        totalFiles: files.length,
        totalAdditions,
        totalDeletions,
        reviewCount: reviews.length,
        commentCount: comments.length,
        approvalCount,
        changesRequestedCount,
      },
    }
  }

  /**
   * Handler: List issues
   */
  private async listIssuesHandler(args: Record<string, unknown>): Promise<PaginatedResult<Issue>> {
    const owner = args.owner as string
    const repo = args.repo as string
    const filters = args.filters as IssueFilters | undefined

    if (!owner || !repo) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo',
        { args }
      )
    }

    const github = getGitHubService()
    const response = await github.fetchIssues(owner, repo, filters)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to list issues',
        { owner, repo, filters, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
      })
    }

    return response.data
  }

  /**
   * Handler: Analyze an issue in detail
   */
  private async analyzeIssueHandler(args: Record<string, unknown>): Promise<{
    issue: IssueDetail
    comments: IssueComment[]
    summary: {
      commentCount: number
      participantCount: number
      labelCount: number
      isOpen: boolean
      daysSinceCreation: number
      daysSinceLastUpdate: number
    }
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const issueNumber = args.issueNumber as number

    if (!owner || !repo || !issueNumber) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, issueNumber',
        { args }
      )
    }

    const github = getGitHubService()

    // Fetch issue and comments in parallel
    const [issueResponse, commentsResponse] = await Promise.all([
      github.fetchIssue(owner, repo, issueNumber),
      github.fetchIssueComments(owner, repo, issueNumber),
    ])

    if (!issueResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        issueResponse.error?.message || 'Failed to fetch issue',
        { owner, repo, issueNumber, status: issueResponse.error?.status }
      )
    }

    if (!commentsResponse.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        commentsResponse.error?.message || 'Failed to fetch issue comments',
        { owner, repo, issueNumber, status: commentsResponse.error?.status }
      )
    }

    // Validate all data is present (checked via success flags above)
    if (!issueResponse.data || !commentsResponse.data) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        'Incomplete data returned from GitHub API',
        {
          owner,
          repo,
          issueNumber,
        }
      )
    }

    const issue = issueResponse.data
    const comments = commentsResponse.data

    // Calculate unique participants
    const participants = new Set<string>()
    if (issue.user?.login) {
      participants.add(issue.user.login)
    }
    for (const comment of comments) {
      if (comment.user?.login) {
        participants.add(comment.user.login)
      }
    }

    // Calculate time-based metrics
    const now = Date.now()
    const createdAt = new Date(issue.created_at).getTime()
    const updatedAt = new Date(issue.updated_at).getTime()
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
    const daysSinceLastUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24))

    return {
      issue,
      comments,
      summary: {
        commentCount: comments.length,
        participantCount: participants.size,
        labelCount: issue.labels?.length || 0,
        isOpen: issue.state === 'open',
        daysSinceCreation,
        daysSinceLastUpdate,
      },
    }
  }

  // ============================================
  // Write Operation Handlers
  // ============================================

  /**
   * Handler: Create a file in repository
   */
  private async createFileHandler(args: Record<string, unknown>): Promise<{
    path: string
    sha: string
    commitSha: string
    commitUrl: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const path = args.path as string
    const content = args.content as string
    const message = args.message as string
    const branch = args.branch as string | undefined

    if (!owner || !repo || !path || !content || !message) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, path, content, message',
        { args }
      )
    }

    const github = getGitHubService()

    // Base64 encode the content
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64')

    const response = await github.createOrUpdateFile(owner, repo, path, {
      path,
      message,
      content: encodedContent,
      branch,
    })

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to create file',
        { owner, repo, path, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        path,
      })
    }

    return {
      path,
      sha: response.data.content?.sha || '',
      commitSha: response.data.commit.sha,
      commitUrl: response.data.commit.html_url,
      message: `File created successfully at ${path}`,
    }
  }

  /**
   * Handler: Update a file in repository
   */
  private async updateFileHandler(args: Record<string, unknown>): Promise<{
    path: string
    sha: string
    commitSha: string
    commitUrl: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const path = args.path as string
    const content = args.content as string
    const message = args.message as string
    const sha = args.sha as string
    const branch = args.branch as string | undefined

    if (!owner || !repo || !path || !content || !message || !sha) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, path, content, message, sha',
        { args }
      )
    }

    const github = getGitHubService()

    // Base64 encode the content
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64')

    const response = await github.createOrUpdateFile(owner, repo, path, {
      path,
      message,
      content: encodedContent,
      sha,
      branch,
    })

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to update file',
        { owner, repo, path, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        path,
      })
    }

    return {
      path,
      sha: response.data.content?.sha || '',
      commitSha: response.data.commit.sha,
      commitUrl: response.data.commit.html_url,
      message: `File updated successfully at ${path}`,
    }
  }

  /**
   * Handler: Delete a file from repository
   */
  private async deleteFileHandler(args: Record<string, unknown>): Promise<{
    path: string
    commitSha: string
    commitUrl: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const path = args.path as string
    const message = args.message as string
    const sha = args.sha as string
    const branch = args.branch as string | undefined

    if (!owner || !repo || !path || !message || !sha) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, path, message, sha',
        { args }
      )
    }

    const github = getGitHubService()

    const response = await github.deleteFile(owner, repo, path, {
      message,
      sha,
      branch,
    })

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to delete file',
        { owner, repo, path, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        path,
      })
    }

    return {
      path,
      commitSha: response.data.commit.sha,
      commitUrl: response.data.commit.html_url,
      message: `File deleted successfully: ${path}`,
    }
  }

  /**
   * Handler: Create a new branch
   */
  private async createBranchHandler(args: Record<string, unknown>): Promise<{
    branchName: string
    ref: string
    sha: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const branchName = args.branchName as string
    const fromBranch = args.fromBranch as string | undefined
    const fromSha = args.fromSha as string | undefined

    if (!owner || !repo || !branchName) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, branchName',
        { args }
      )
    }

    const github = getGitHubService()
    let sha = fromSha

    // If no SHA provided, get SHA from the source branch
    if (!sha) {
      const sourceBranch = fromBranch || 'main'
      const refResponse = await github.getRef(owner, repo, `heads/${sourceBranch}`)

      if (!refResponse.success) {
        // Try 'master' as fallback
        const masterResponse = await github.getRef(owner, repo, 'heads/master')
        if (!masterResponse.success) {
          throw CopilotErrorHandler.createError(
            'TOOL_ERROR',
            refResponse.error?.message || `Failed to get reference for branch: ${sourceBranch}`,
            { owner, repo, sourceBranch, status: refResponse.error?.status }
          )
        }
        sha = masterResponse.data?.object.sha
      } else {
        sha = refResponse.data?.object.sha
      }
    }

    if (!sha) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        'Could not determine SHA for new branch',
        { owner, repo, branchName, fromBranch, fromSha }
      )
    }

    const response = await github.createBranch(owner, repo, branchName, sha)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to create branch',
        { owner, repo, branchName, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        branchName,
      })
    }

    return {
      branchName,
      ref: response.data.ref,
      sha: response.data.object.sha,
      message: `Branch '${branchName}' created successfully`,
    }
  }

  /**
   * Handler: Create a pull request
   */
  private async createPullRequestHandler(args: Record<string, unknown>): Promise<{
    number: number
    title: string
    url: string
    state: string
    head: string
    base: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const title = args.title as string
    const body = args.body as string | undefined
    const head = args.head as string
    const base = args.base as string
    const draft = args.draft as boolean | undefined

    if (!owner || !repo || !title || !head || !base) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, title, head, base',
        { args }
      )
    }

    const github = getGitHubService()

    const params: CreatePRParams = {
      title,
      body,
      head,
      base,
      draft,
    }

    const response = await github.createPullRequest(owner, repo, params)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to create pull request',
        { owner, repo, title, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        title,
      })
    }

    return {
      number: response.data.number,
      title: response.data.title,
      url: response.data.html_url,
      state: response.data.state,
      head,
      base,
      message: `Pull request #${response.data.number} created successfully`,
    }
  }

  /**
   * Handler: Submit a PR review
   */
  private async submitPRReviewHandler(args: Record<string, unknown>): Promise<{
    id: number
    state: string
    prNumber: number
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const prNumber = args.prNumber as number
    const event = args.event as 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
    const body = args.body as string | undefined

    if (!owner || !repo || !prNumber || !event) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, prNumber, event',
        { args }
      )
    }

    // Validate that body is provided for REQUEST_CHANGES
    if (event === 'REQUEST_CHANGES' && !body) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Body is required when requesting changes',
        { args }
      )
    }

    const github = getGitHubService()

    const params: CreatePRReviewParams = {
      event,
      body,
    }

    const response = await github.createPRReview(owner, repo, prNumber, params)

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to submit PR review',
        { owner, repo, prNumber, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        prNumber,
      })
    }

    const eventMessages: Record<string, string> = {
      APPROVE: 'approved',
      REQUEST_CHANGES: 'requested changes on',
      COMMENT: 'commented on',
    }

    return {
      id: response.data.id,
      state: response.data.state,
      prNumber,
      message: `Successfully ${eventMessages[event]} PR #${prNumber}`,
    }
  }

  /**
   * Handler: Create an issue
   */
  private async createIssueHandler(args: Record<string, unknown>): Promise<{
    number: number
    title: string
    url: string
    state: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const title = args.title as string
    const body = args.body as string | undefined
    const labels = args.labels as string[] | undefined
    const assignees = args.assignees as string[] | undefined

    if (!owner || !repo || !title) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, title',
        { args }
      )
    }

    const github = getGitHubService()

    const response = await github.createIssue(owner, repo, {
      title,
      body,
      labels,
      assignees,
    })

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to create issue',
        { owner, repo, title, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        title,
      })
    }

    return {
      number: response.data.number,
      title: response.data.title,
      url: response.data.html_url,
      state: response.data.state,
      message: `Issue #${response.data.number} created successfully`,
    }
  }

  /**
   * Handler: Add a comment to an issue or PR
   */
  private async addCommentHandler(args: Record<string, unknown>): Promise<{
    id: number
    issueNumber: number
    url: string
    message: string
  }> {
    const owner = args.owner as string
    const repo = args.repo as string
    const issueNumber = args.issueNumber as number
    const body = args.body as string

    if (!owner || !repo || !issueNumber || !body) {
      throw CopilotErrorHandler.createError(
        'VALIDATION_ERROR',
        'Missing required parameters: owner, repo, issueNumber, body',
        { args }
      )
    }

    const github = getGitHubService()

    const response = await github.createIssueComment(owner, repo, issueNumber, { body })

    if (!response.success) {
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        response.error?.message || 'Failed to add comment',
        { owner, repo, issueNumber, status: response.error?.status }
      )
    }

    if (!response.data) {
      throw CopilotErrorHandler.createError('TOOL_ERROR', 'No data returned from GitHub API', {
        owner,
        repo,
        issueNumber,
      })
    }

    return {
      id: response.data.id,
      issueNumber,
      url: response.data.html_url,
      message: `Comment added successfully to #${issueNumber}`,
    }
  }

  /**
   * Register a new tool
   */
  register(tool: MCPToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`)
    }
    this.tools.set(tool.name, tool)
  }

  /**
   * Get a tool by name
   */
  get(name: string): MCPToolDefinition | undefined {
    return this.tools.get(name)
  }

  /**
   * List all registered tools
   */
  list(): MCPToolDefinition[] {
    return Array.from(this.tools.values())
  }

  /**
   * Check if a tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name)
  }

  /**
   * Execute a tool call and return the result
   */
  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name)

    if (!tool) {
      return {
        toolCallId: toolCall.id,
        result: null,
        error: `Tool "${toolCall.name}" not found`,
      }
    }

    try {
      const result = await tool.handler(toolCall.arguments)
      return {
        toolCallId: toolCall.id,
        result,
      }
    } catch (error) {
      const copilotError = CopilotErrorHandler.categorizeError(error)
      return {
        toolCallId: toolCall.id,
        result: null,
        error: copilotError.message,
      }
    }
  }

  /**
   * Get tool definitions for API (without handlers)
   */
  getToolDefinitions(): Array<Omit<MCPToolDefinition, 'handler'>> {
    return this.list().map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    }))
  }

  /**
   * Reset the registry (mainly for testing)
   */
  reset(): void {
    this.tools.clear()
    this.initialized = false
  }
}

/**
 * Get the singleton MCP tool registry instance
 */
export function getMCPToolRegistry(): MCPToolRegistry {
  return MCPToolRegistry.getInstance()
}

/**
 * Execute a tool call using the global registry
 */
export async function executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
  const registry = getMCPToolRegistry()
  if (!registry.has(toolCall.name)) {
    // Ensure registry is initialized
    await registry.initialize()
  }
  return registry.execute(toolCall)
}
