/**
 * GitHub Copilot SDK Integration - MCP Tool Registry
 *
 * Implements the Model Context Protocol (MCP) tool system for:
 * - Tool registration and discovery
 * - Tool execution with proper error handling
 * - Built-in tools for file analysis, PR fetching, and chart generation
 */

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

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com'

// GitHub token for API calls (must be set via environment variable)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

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

    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'SuperTool-Copilot-Integration',
        },
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw CopilotErrorHandler.createError(
          'TOOL_ERROR',
          `GitHub API error: ${response.status} ${response.statusText}`,
          { status: response.status, body: errorBody, owner, repo, prNumber }
        )
      }

      const data = await response.json()

      // Transform to PRInfo type
      const prInfo: PRInfo = {
        number: data.number,
        title: data.title,
        state: data.merged ? 'merged' : data.state,
        author: data.user?.login || 'unknown',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        mergedAt: data.merged_at,
        closedAt: data.closed_at,
        additions: data.additions || 0,
        deletions: data.deletions || 0,
        changedFiles: data.changed_files || 0,
        commits: data.commits || 0,
        comments: data.comments || 0,
        reviewComments: data.review_comments || 0,
        labels: data.labels?.map((l: { name: string }) => l.name) || [],
        milestone: data.milestone?.title,
        assignees: data.assignees?.map((a: { login: string }) => a.login) || [],
        reviewers: data.requested_reviewers?.map((r: { login: string }) => r.login) || [],
        draft: data.draft || false,
        mergeable: data.mergeable,
        baseRef: data.base?.ref || 'unknown',
        headRef: data.head?.ref || 'unknown',
        body: data.body,
      }

      return prInfo
    } catch (error) {
      if (CopilotErrorHandler.isCopilotError(error)) {
        throw error
      }
      throw CopilotErrorHandler.createError(
        'TOOL_ERROR',
        `Failed to fetch PR: ${error instanceof Error ? error.message : String(error)}`,
        { owner, repo, prNumber },
        error instanceof Error ? error : undefined
      )
    }
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
