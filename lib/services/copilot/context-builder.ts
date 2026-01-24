/**
 * Repository Context Builder for AI Prompts
 *
 * Builds intelligent context from GitHub repository data for AI interactions.
 * Handles token budget management, content prioritization, and smart file selection.
 */

import type { IssueComment } from '@/lib/services/github'
import type {
  CommitContextInput,
  ContextBuilderOptions,
  ContextChunk,
  ContextChunkMetadata,
  ContextPriority,
  ContextSource,
  ContextSummary,
  ContextType,
  FileContextInput,
  FileRelevanceResult,
  FileSelectionOptions,
  FileTreeItem,
  IssueContextInput,
  LanguageInfo,
  PRContextInput,
  PrioritizationResult,
  RepoContext,
  RepoInfo,
  SearchContextInput,
  TokenBudget,
} from './context-types'

import { DEFAULT_CONTEXT_OPTIONS, DEFAULT_TOKEN_BUDGET } from './context-types'

// ============================================
// Language Detection
// ============================================

/**
 * File extension to language mapping
 */
const EXTENSION_LANGUAGE_MAP: Record<string, LanguageInfo> = {
  // JavaScript/TypeScript
  '.js': { language: 'javascript', extension: '.js', aliases: ['js'] },
  '.jsx': { language: 'jsx', extension: '.jsx', aliases: ['jsx', 'react'] },
  '.ts': { language: 'typescript', extension: '.ts', aliases: ['ts'] },
  '.tsx': { language: 'tsx', extension: '.tsx', aliases: ['tsx', 'react-ts'] },
  '.mjs': { language: 'javascript', extension: '.mjs', aliases: ['esm'] },
  '.cjs': { language: 'javascript', extension: '.cjs', aliases: ['commonjs'] },

  // Web
  '.html': { language: 'html', extension: '.html', aliases: ['htm'] },
  '.css': { language: 'css', extension: '.css', aliases: [] },
  '.scss': { language: 'scss', extension: '.scss', aliases: ['sass'] },
  '.less': { language: 'less', extension: '.less', aliases: [] },
  '.vue': { language: 'vue', extension: '.vue', aliases: [] },
  '.svelte': { language: 'svelte', extension: '.svelte', aliases: [] },

  // Data/Config
  '.json': { language: 'json', extension: '.json', aliases: [] },
  '.yaml': { language: 'yaml', extension: '.yaml', aliases: ['yml'] },
  '.yml': { language: 'yaml', extension: '.yml', aliases: [] },
  '.toml': { language: 'toml', extension: '.toml', aliases: [] },
  '.xml': { language: 'xml', extension: '.xml', aliases: [] },
  '.env': { language: 'env', extension: '.env', aliases: ['dotenv'] },

  // Python
  '.py': { language: 'python', extension: '.py', aliases: ['py', 'python3'] },
  '.pyi': { language: 'python', extension: '.pyi', aliases: ['stub'] },
  '.pyx': { language: 'cython', extension: '.pyx', aliases: [] },

  // Ruby
  '.rb': { language: 'ruby', extension: '.rb', aliases: [] },
  '.erb': { language: 'erb', extension: '.erb', aliases: [] },

  // Go
  '.go': { language: 'go', extension: '.go', aliases: ['golang'] },

  // Rust
  '.rs': { language: 'rust', extension: '.rs', aliases: [] },

  // Java/JVM
  '.java': { language: 'java', extension: '.java', aliases: [] },
  '.kt': { language: 'kotlin', extension: '.kt', aliases: [] },
  '.scala': { language: 'scala', extension: '.scala', aliases: [] },
  '.groovy': { language: 'groovy', extension: '.groovy', aliases: [] },

  // C/C++
  '.c': { language: 'c', extension: '.c', aliases: [] },
  '.h': { language: 'c', extension: '.h', aliases: ['header'] },
  '.cpp': { language: 'cpp', extension: '.cpp', aliases: ['c++'] },
  '.hpp': { language: 'cpp', extension: '.hpp', aliases: [] },
  '.cc': { language: 'cpp', extension: '.cc', aliases: [] },

  // C#
  '.cs': { language: 'csharp', extension: '.cs', aliases: ['c#'] },

  // PHP
  '.php': { language: 'php', extension: '.php', aliases: [] },

  // Shell
  '.sh': { language: 'bash', extension: '.sh', aliases: ['shell'] },
  '.bash': { language: 'bash', extension: '.bash', aliases: [] },
  '.zsh': { language: 'zsh', extension: '.zsh', aliases: [] },
  '.fish': { language: 'fish', extension: '.fish', aliases: [] },

  // SQL
  '.sql': { language: 'sql', extension: '.sql', aliases: [] },

  // Markdown/Docs
  '.md': { language: 'markdown', extension: '.md', aliases: ['markdown'] },
  '.mdx': { language: 'mdx', extension: '.mdx', aliases: [] },
  '.rst': { language: 'rst', extension: '.rst', aliases: ['restructuredtext'] },

  // Docker
  dockerfile: { language: 'dockerfile', extension: '', aliases: [] },

  // GraphQL
  '.graphql': { language: 'graphql', extension: '.graphql', aliases: ['gql'] },
  '.gql': { language: 'graphql', extension: '.gql', aliases: [] },

  // Swift/Objective-C
  '.swift': { language: 'swift', extension: '.swift', aliases: [] },
  '.m': { language: 'objective-c', extension: '.m', aliases: ['objc'] },

  // Other
  '.lua': { language: 'lua', extension: '.lua', aliases: [] },
  '.r': { language: 'r', extension: '.r', aliases: [] },
  '.pl': { language: 'perl', extension: '.pl', aliases: [] },
  '.ex': { language: 'elixir', extension: '.ex', aliases: [] },
  '.exs': { language: 'elixir', extension: '.exs', aliases: [] },
  '.erl': { language: 'erlang', extension: '.erl', aliases: [] },
  '.hs': { language: 'haskell', extension: '.hs', aliases: [] },
  '.clj': { language: 'clojure', extension: '.clj', aliases: [] },
  '.tf': { language: 'terraform', extension: '.tf', aliases: ['hcl'] },
  '.proto': { language: 'protobuf', extension: '.proto', aliases: [] },
}

/**
 * Important files that should be prioritized
 */
const IMPORTANT_FILES = [
  'README.md',
  'README',
  'readme.md',
  'package.json',
  'tsconfig.json',
  'pyproject.toml',
  'setup.py',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'requirements.txt',
  '.env.example',
  'docker-compose.yml',
  'Dockerfile',
  'Makefile',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
]

/**
 * Directories to exclude from relevance scoring
 */
const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '__pycache__',
  '.pytest_cache',
  'vendor',
  'target',
  '.cache',
]

// ============================================
// RepoContextBuilder Class
// ============================================

/**
 * Builder for creating AI-optimized repository context
 */
export class RepoContextBuilder {
  private options: Required<ContextBuilderOptions>

  constructor(options?: ContextBuilderOptions) {
    this.options = {
      ...DEFAULT_CONTEXT_OPTIONS,
      ...options,
      tokenBudget: {
        ...DEFAULT_TOKEN_BUDGET,
        ...options?.tokenBudget,
      },
    }
  }

  // ============================================
  // Token Estimation
  // ============================================

  /**
   * Estimate token count for text content
   * Uses rough estimate of ~4 characters per token (configurable)
   */
  estimateTokens(text: string): number {
    if (!text) return 0
    return Math.ceil(text.length / this.options.charsPerToken)
  }

  // ============================================
  // Language Detection
  // ============================================

  /**
   * Detect programming language from file path
   */
  detectLanguage(filePath: string): LanguageInfo {
    const lowerPath = filePath.toLowerCase()

    // Special case for Dockerfile
    if (lowerPath.endsWith('dockerfile') || lowerPath.includes('dockerfile.')) {
      return EXTENSION_LANGUAGE_MAP.dockerfile
    }

    // Extract extension
    const lastDot = filePath.lastIndexOf('.')
    if (lastDot === -1) {
      return { language: 'text', extension: '', aliases: [] }
    }

    const ext = filePath.slice(lastDot).toLowerCase()
    return EXTENSION_LANGUAGE_MAP[ext] || { language: 'text', extension: ext, aliases: [] }
  }

  // ============================================
  // Chunk ID Generation
  // ============================================

  /**
   * Generate unique chunk ID
   */
  private generateChunkId(type: ContextType, ref: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const sanitizedRef = ref.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)
    return `${type}-${sanitizedRef}-${timestamp}-${random}`
  }

  // ============================================
  // Content Decoding
  // ============================================

  /**
   * Decode base64 content (handles GitHub file content)
   */
  private decodeBase64(encoded: string): string {
    try {
      // Handle multiline base64 from GitHub
      const cleaned = encoded.replace(/\s/g, '')
      return Buffer.from(cleaned, 'base64').toString('utf-8')
    } catch {
      return encoded
    }
  }

  // ============================================
  // Content Formatting
  // ============================================

  /**
   * Format file content for AI prompt
   */
  private formatFileContent(
    path: string,
    content: string,
    language: string,
    lineRange?: { start: number; end: number }
  ): string {
    const lines = content.split('\n')
    let selectedContent = content

    if (lineRange) {
      selectedContent = lines.slice(lineRange.start - 1, lineRange.end).join('\n')
    }

    const header = lineRange
      ? `// File: ${path} (lines ${lineRange.start}-${lineRange.end})`
      : `// File: ${path}`

    return `${header}\n\`\`\`${language}\n${selectedContent}\n\`\`\``
  }

  /**
   * Format PR content for AI prompt
   */
  private formatPRContent(pr: PRContextInput['pr']): string {
    const parts: string[] = [
      `## Pull Request #${pr.number}: ${pr.title}`,
      `**State:** ${pr.state}`,
      `**Author:** ${pr.user.login}`,
      `**Branch:** ${pr.head.ref} → ${pr.base.ref}`,
      `**Created:** ${pr.created_at}`,
      `**Updated:** ${pr.updated_at}`,
      '',
      '### Description',
      pr.body || '_No description provided_',
    ]

    if (pr.labels && pr.labels.length > 0) {
      parts.push('', `**Labels:** ${pr.labels.map((l) => l.name).join(', ')}`)
    }

    if (pr.requested_reviewers && pr.requested_reviewers.length > 0) {
      parts.push('', `**Reviewers:** ${pr.requested_reviewers.map((r) => r.login).join(', ')}`)
    }

    return parts.join('\n')
  }

  /**
   * Format issue content for AI prompt
   */
  private formatIssueContent(issue: IssueContextInput['issue']): string {
    const parts: string[] = [
      `## Issue #${issue.number}: ${issue.title}`,
      `**State:** ${issue.state}`,
      `**Author:** ${issue.user.login}`,
      `**Created:** ${issue.created_at}`,
      `**Updated:** ${issue.updated_at}`,
    ]

    if (issue.labels && issue.labels.length > 0) {
      const labelNames = issue.labels
        .map((l) => (typeof l === 'string' ? l : l.name))
        .filter(Boolean)
      if (labelNames.length > 0) {
        parts.push(`**Labels:** ${labelNames.join(', ')}`)
      }
    }

    if (issue.assignees && issue.assignees.length > 0) {
      parts.push(`**Assignees:** ${issue.assignees.map((a) => a.login).join(', ')}`)
    }

    parts.push('', '### Description', issue.body || '_No description provided_')

    return parts.join('\n')
  }

  // ============================================
  // Context Building Methods
  // ============================================

  /**
   * Build context from file content
   */
  buildFileContext(input: FileContextInput): ContextChunk[] {
    const { file, decodedContent, lineRange, priority } = input

    // Decode content if not provided
    const content = decodedContent || this.decodeBase64(file.content || '')

    // Skip empty files
    if (!content.trim()) {
      return []
    }

    // Detect language
    const langInfo = this.detectLanguage(file.path)

    // Format content
    const formattedContent = this.formatFileContent(
      file.path,
      content,
      langInfo.language,
      lineRange
    )

    // Check content length and potentially truncate
    let finalContent = formattedContent
    let wasTruncated = false

    if (finalContent.length > this.options.maxContentLength && this.options.truncateLongContent) {
      finalContent =
        finalContent.substring(0, this.options.maxContentLength) +
        '\n\n... [Content truncated due to length] ...'
      wasTruncated = true
    }

    const source: ContextSource = {
      owner: '', // Will be set by caller
      repo: '',
      ref: file.path,
      sha: file.sha,
    }

    if (this.options.includeSourceUrls && file.html_url) {
      source.url = file.html_url
    }

    const metadata: ContextChunkMetadata = {
      language: langInfo.language,
      fileSize: file.size,
      lineRange,
    }

    if (wasTruncated) {
      metadata.tags = ['truncated']
    }

    const chunk: ContextChunk = {
      id: this.generateChunkId('file', file.path),
      type: 'file',
      priority: priority || this.options.defaultPriority,
      label: `File: ${file.path}`,
      content: finalContent,
      estimatedTokens: this.estimateTokens(finalContent),
      source,
      metadata,
    }

    return [chunk]
  }

  /**
   * Build context from PR details
   */
  buildPRContext(input: PRContextInput): ContextChunk[] {
    const { pr, includeDiff = false, includeReviews = false, priority } = input
    const chunks: ContextChunk[] = []

    // Main PR content
    const prContent = this.formatPRContent(pr)
    const prSource: ContextSource = {
      owner: pr.base.repo.owner.login,
      repo: pr.base.repo.name,
      ref: `PR #${pr.number}`,
      url: pr.html_url,
    }

    chunks.push({
      id: this.generateChunkId('pr', `${pr.number}`),
      type: 'pr',
      priority: priority || 'high',
      label: `PR #${pr.number}: ${pr.title}`,
      content: prContent,
      estimatedTokens: this.estimateTokens(prContent),
      source: prSource,
      metadata: {
        author: pr.user.login,
        modifiedAt: pr.updated_at,
        tags: [pr.state, pr.draft ? 'draft' : 'ready'].filter(Boolean),
      },
    })

    // Add diff if requested and available (using files with patches)
    if (includeDiff && pr.files && pr.files.length > 0) {
      const filesWithPatches = pr.files.filter((f) => f.patch)
      if (filesWithPatches.length > 0) {
        const diffParts = filesWithPatches.map(
          (f) => `diff --git a/${f.filename} b/${f.filename}\n${f.patch}`
        )
        const diffContent = `## PR Diff\n\`\`\`diff\n${diffParts.join('\n\n')}\n\`\`\``
        let finalDiff = diffContent

        if (finalDiff.length > this.options.maxContentLength && this.options.truncateLongContent) {
          finalDiff =
            finalDiff.substring(0, this.options.maxContentLength) +
            '\n\n... [Diff truncated due to length] ...'
        }

        chunks.push({
          id: this.generateChunkId('pr_diff', `${pr.number}`),
          type: 'pr_diff',
          priority: 'medium',
          label: `PR #${pr.number} Diff`,
          content: finalDiff,
          estimatedTokens: this.estimateTokens(finalDiff),
          source: { ...prSource, ref: `PR #${pr.number} diff` },
          metadata: { relatedChunks: [chunks[0].id] },
        })
      }
    }

    // Add reviews if requested
    if (includeReviews && pr.reviews && pr.reviews.length > 0) {
      const reviewContent = pr.reviews
        .map(
          (review) =>
            `### Review by ${review.user?.login || 'Unknown'} (${review.state})\n${review.body || '_No comment_'}`
        )
        .join('\n\n')

      chunks.push({
        id: this.generateChunkId('pr_review', `${pr.number}`),
        type: 'pr_review',
        priority: 'medium',
        label: `PR #${pr.number} Reviews`,
        content: reviewContent,
        estimatedTokens: this.estimateTokens(reviewContent),
        source: { ...prSource, ref: `PR #${pr.number} reviews` },
        metadata: { relatedChunks: [chunks[0].id] },
      })
    }

    return chunks
  }

  /**
   * Build context from issue details
   */
  buildIssueContext(input: IssueContextInput): ContextChunk[] {
    const { issue, includeComments = true, maxComments = 10, priority } = input
    const chunks: ContextChunk[] = []

    // Main issue content
    const issueContent = this.formatIssueContent(issue)
    const issueSource: ContextSource = {
      owner: '', // Will be set by caller
      repo: '',
      ref: `Issue #${issue.number}`,
      url: issue.html_url,
    }

    chunks.push({
      id: this.generateChunkId('issue', `${issue.number}`),
      type: 'issue',
      priority: priority || 'high',
      label: `Issue #${issue.number}: ${issue.title}`,
      content: issueContent,
      estimatedTokens: this.estimateTokens(issueContent),
      source: issueSource,
      metadata: {
        author: issue.user.login,
        modifiedAt: issue.updated_at,
        tags: [issue.state],
      },
    })

    // Add comments if requested
    if (includeComments && issue.issueComments && issue.issueComments.length > 0) {
      const commentsToInclude = issue.issueComments.slice(0, maxComments)
      const commentContent = commentsToInclude
        .map(
          (comment: IssueComment) =>
            `### Comment by ${comment.user?.login || 'Unknown'} (${comment.created_at})\n${comment.body}`
        )
        .join('\n\n')

      const truncationNote =
        issue.issueComments.length > maxComments
          ? `\n\n_... ${issue.issueComments.length - maxComments} more comments not shown ..._`
          : ''

      chunks.push({
        id: this.generateChunkId('issue_comment', `${issue.number}`),
        type: 'issue_comment',
        priority: 'low',
        label: `Issue #${issue.number} Comments`,
        content: commentContent + truncationNote,
        estimatedTokens: this.estimateTokens(commentContent + truncationNote),
        source: { ...issueSource, ref: `Issue #${issue.number} comments` },
        metadata: { relatedChunks: [chunks[0].id] },
      })
    }

    return chunks
  }

  /**
   * Build context from code search results
   */
  buildSearchContext(input: SearchContextInput): ContextChunk[] {
    const { results, query, maxResults = 10, priority } = input
    const chunks: ContextChunk[] = []

    const resultsToInclude = results.slice(0, maxResults)

    for (const result of resultsToInclude) {
      const langInfo = this.detectLanguage(result.path)

      // Format search result with text matches
      let content = `// Search result: ${result.path}\n`
      content += `// Repository: ${result.repository.full_name}\n`
      content += `// Score: ${result.score}\n\n`

      if (result.text_matches && result.text_matches.length > 0) {
        content += '// Matching fragments:\n'
        for (const match of result.text_matches) {
          content += `\`\`\`${langInfo.language}\n${match.fragment}\n\`\`\`\n\n`
        }
      }

      const source: ContextSource = {
        owner: result.repository.owner.login,
        repo: result.repository.name,
        ref: result.path,
        url: result.html_url,
        sha: result.sha,
      }

      chunks.push({
        id: this.generateChunkId('search', result.path),
        type: 'search',
        priority: priority || 'medium',
        label: `Search: ${result.path}`,
        content,
        estimatedTokens: this.estimateTokens(content),
        source,
        metadata: {
          language: langInfo.language,
          tags: ['search', `query:${query}`],
        },
      })
    }

    return chunks
  }

  /**
   * Build context from commit data
   */
  buildCommitContext(input: CommitContextInput): ContextChunk[] {
    const { commit, includeChanges = false, priority } = input

    const parts: string[] = [
      `## Commit: ${commit.sha.substring(0, 7)}`,
      `**Message:** ${commit.commit.message}`,
      `**Author:** ${commit.commit.author?.name || 'Unknown'} <${commit.commit.author?.email || ''}>`,
      `**Date:** ${commit.commit.author?.date || 'Unknown'}`,
    ]

    if (commit.stats) {
      parts.push(`**Stats:** +${commit.stats.additions} -${commit.stats.deletions}`)
    }

    if (includeChanges && commit.files && commit.files.length > 0) {
      parts.push('', '### Changed Files')
      for (const file of commit.files.slice(0, 20)) {
        parts.push(`- ${file.status}: ${file.filename} (+${file.additions} -${file.deletions})`)
      }
      if (commit.files.length > 20) {
        parts.push(`- ... and ${commit.files.length - 20} more files`)
      }
    }

    const content = parts.join('\n')
    const source: ContextSource = {
      owner: '', // Will be set by caller
      repo: '',
      ref: commit.sha,
      url: commit.html_url,
      sha: commit.sha,
    }

    const chunk: ContextChunk = {
      id: this.generateChunkId('commit', commit.sha),
      type: 'commit',
      priority: priority || 'medium',
      label: `Commit: ${commit.sha.substring(0, 7)}`,
      content,
      estimatedTokens: this.estimateTokens(content),
      source,
      metadata: {
        author: commit.commit.author?.name,
        modifiedAt: commit.commit.author?.date,
      },
    }

    return [chunk]
  }

  // ============================================
  // Prioritization
  // ============================================

  /**
   * Prioritize context chunks to fit within token budget
   */
  prioritizeContext(chunks: ContextChunk[], maxTokens?: number): PrioritizationResult {
    const budget =
      maxTokens ||
      (this.options.tokenBudget?.maxTokens ?? 0) -
        (this.options.tokenBudget?.systemReserved ?? 0) -
        (this.options.tokenBudget?.userReserved ?? 0) -
        (this.options.tokenBudget?.responseReserved ?? 0)

    // Sort by priority (critical first), then by token count (smaller first for same priority)
    const priorityOrder: Record<ContextPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    }

    const sortedChunks = [...chunks].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.estimatedTokens - b.estimatedTokens
    })

    const included: ContextChunk[] = []
    const excluded: ContextChunk[] = []
    let usedTokens = 0
    let wasTruncated = false

    for (const chunk of sortedChunks) {
      if (usedTokens + chunk.estimatedTokens <= budget) {
        included.push(chunk)
        usedTokens += chunk.estimatedTokens
      } else if (this.options.truncateLongContent && chunk.priority === 'critical') {
        // Try to fit critical content with truncation
        const availableTokens = budget - usedTokens
        const availableChars = availableTokens * this.options.charsPerToken

        if (availableChars > 500) {
          // Only truncate if we can keep meaningful content
          const truncatedContent =
            chunk.content.substring(0, availableChars) +
            '\n\n... [Content truncated to fit context window] ...'

          included.push({
            ...chunk,
            content: truncatedContent,
            estimatedTokens: this.estimateTokens(truncatedContent),
            metadata: {
              ...chunk.metadata,
              tags: [...(chunk.metadata?.tags || []), 'truncated'],
            },
          })
          usedTokens += this.estimateTokens(truncatedContent)
          wasTruncated = true
        } else {
          excluded.push(chunk)
        }
      } else {
        excluded.push(chunk)
      }
    }

    const tokenBudget: TokenBudget = {
      maxTokens: this.options.tokenBudget?.maxTokens ?? 0,
      systemReserved: this.options.tokenBudget?.systemReserved ?? 0,
      userReserved: this.options.tokenBudget?.userReserved ?? 0,
      responseReserved: this.options.tokenBudget?.responseReserved ?? 0,
      allocationByPriority: this.options.tokenBudget?.allocationByPriority ?? {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      usedTokens,
      remainingTokens: budget - usedTokens,
    }

    return { included, excluded, tokenBudget, wasTruncated }
  }

  // ============================================
  // Smart File Selection
  // ============================================

  /**
   * Get relevant files based on query and file tree
   */
  getRelevantFiles(
    query: string,
    fileTree: FileTreeItem[],
    options?: FileSelectionOptions
  ): FileRelevanceResult[] {
    const {
      maxFiles = 20,
      includeExtensions,
      excludeExtensions = [],
      excludePaths = [],
      minRelevance = 0.1,
    } = options || {}

    const results: FileRelevanceResult[] = []
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 2)

    // Flatten file tree
    const flattenTree = (items: FileTreeItem[], parentPath = ''): FileTreeItem[] => {
      const flat: FileTreeItem[] = []
      for (const item of items) {
        const fullPath = parentPath ? `${parentPath}/${item.path}` : item.path

        // Skip excluded directories
        if (
          EXCLUDED_DIRECTORIES.some(
            (dir) => fullPath.includes(`/${dir}/`) || fullPath.startsWith(`${dir}/`)
          )
        ) {
          continue
        }

        if (item.type === 'blob') {
          flat.push({ ...item, path: fullPath })
        }

        // Note: If tree items have children, recursively flatten
        // GitHub file tree is usually flat, but handle nested case
      }
      return flat
    }

    const files = flattenTree(fileTree)

    for (const file of files) {
      const path = file.path
      const pathLower = path.toLowerCase()
      const fileName = path.split('/').pop() || ''
      const fileNameLower = fileName.toLowerCase()

      // Check extension filters
      const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : ''

      if (includeExtensions && includeExtensions.length > 0) {
        if (!includeExtensions.includes(ext)) continue
      }

      if (excludeExtensions.includes(ext)) continue

      // Check path exclusions
      if (excludePaths.some((pattern) => pathLower.includes(pattern.toLowerCase()))) {
        continue
      }

      // Calculate relevance score
      let score = 0
      const reasons: string[] = []

      // Important file bonus
      if (IMPORTANT_FILES.some((f) => fileNameLower === f.toLowerCase())) {
        score += 0.4
        reasons.push('Important file')
      }

      // Query term matching
      for (const term of queryTerms) {
        if (pathLower.includes(term)) {
          score += 0.2
          reasons.push(`Path contains "${term}"`)
        }
        if (fileNameLower.includes(term)) {
          score += 0.15
          reasons.push(`Filename contains "${term}"`)
        }
      }

      // Language relevance
      const langTerms = ['typescript', 'javascript', 'python', 'react', 'api', 'test', 'config']
      for (const term of langTerms) {
        if (queryLower.includes(term)) {
          const langInfo = this.detectLanguage(path)
          if (
            langInfo.language.includes(term) ||
            langInfo.aliases.includes(term) ||
            (term === 'test' && pathLower.includes('test')) ||
            (term === 'config' &&
              (fileNameLower.includes('config') || fileNameLower.includes('rc')))
          ) {
            score += 0.15
            reasons.push(`Relevant to "${term}"`)
          }
        }
      }

      // Entry point bonus
      if (['index', 'main', 'app', 'server'].some((e) => fileNameLower.startsWith(e))) {
        score += 0.1
        reasons.push('Entry point file')
      }

      // Normalize score to 0-1
      score = Math.min(1, score)

      if (score >= minRelevance) {
        results.push({
          path,
          score,
          reasons: [...new Set(reasons)], // Dedupe reasons
          item: file,
        })
      }
    }

    // Sort by score descending and limit
    return results.sort((a, b) => b.score - a.score).slice(0, maxFiles)
  }

  // ============================================
  // Full Context Building
  // ============================================

  /**
   * Build complete repository context
   */
  buildRepoContext(repoInfo: RepoInfo, chunks: ContextChunk[], query?: string): RepoContext {
    // Update source info on all chunks
    const updatedChunks = chunks.map((chunk) => ({
      ...chunk,
      source: {
        ...chunk.source,
        owner: chunk.source.owner || repoInfo.owner,
        repo: chunk.source.repo || repoInfo.repo,
      },
    }))

    // Prioritize to fit budget
    const { included, excluded, tokenBudget, wasTruncated } = this.prioritizeContext(updatedChunks)

    // Build summary
    const summary: ContextSummary = {
      totalChunks: included.length,
      chunksByType: {} as Record<ContextType, number>,
      chunksByPriority: {} as Record<ContextPriority, number>,
      totalTokens: tokenBudget.usedTokens,
      truncatedChunks: wasTruncated ? 1 : 0,
      excludedChunks: excluded.length,
    }

    // Initialize counters
    const contextTypes: ContextType[] = [
      'file',
      'pr',
      'pr_diff',
      'pr_review',
      'issue',
      'issue_comment',
      'commit',
      'search',
      'tree',
      'custom',
    ]
    const priorities: ContextPriority[] = ['critical', 'high', 'medium', 'low']

    for (const type of contextTypes) {
      summary.chunksByType[type] = 0
    }
    for (const priority of priorities) {
      summary.chunksByPriority[priority] = 0
    }

    // Count chunks
    for (const chunk of included) {
      summary.chunksByType[chunk.type] = (summary.chunksByType[chunk.type] || 0) + 1
      summary.chunksByPriority[chunk.priority] = (summary.chunksByPriority[chunk.priority] || 0) + 1
    }

    return {
      repository: repoInfo,
      chunks: included,
      tokenBudget,
      generatedAt: Date.now(),
      query,
      summary,
    }
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a new context builder instance
 */
export function createContextBuilder(options?: ContextBuilderOptions): RepoContextBuilder {
  return new RepoContextBuilder(options)
}
