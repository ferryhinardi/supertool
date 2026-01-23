'use client'

/**
 * PR Visualization Hook
 *
 * React Query hook for fetching PR information and transforming
 * it into chart data for Recharts visualizations.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ChartConfig,
  ChartData,
  ChartDataPoint,
  PRInfo,
  PRVisualizationResponse,
  PRVisualizationType,
} from '@/lib/services/copilot'

// ============================================
// Constants
// ============================================

const DEFAULT_CHART_COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#00C49F', // Teal
  '#FFBB28', // Gold
  '#FF8042', // Coral
]

const ALL_VISUALIZATION_TYPES: PRVisualizationType[] = [
  'timeline',
  'file_changes',
  'review_status',
  'commit_activity',
  'line_changes',
]

// ============================================
// Query Keys Factory
// ============================================

export const prVisualizationKeys = {
  all: ['pr-visualization'] as const,
  pr: (owner: string, repo: string, prNumber: number) =>
    [...prVisualizationKeys.all, owner, repo, prNumber] as const,
  visualization: (owner: string, repo: string, prNumber: number, types: PRVisualizationType[]) =>
    [...prVisualizationKeys.pr(owner, repo, prNumber), types] as const,
}

// ============================================
// PR Data Fetcher
// ============================================

async function fetchPRInfo(owner: string, repo: string, prNumber: number): Promise<PRInfo> {
  const response = await fetch(
    `/api/copilot/pr?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&pr=${prNumber}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `Failed to fetch PR #${prNumber}`)
  }

  const data = await response.json()
  return data.data as PRInfo
}

// ============================================
// Chart Data Transformers
// ============================================

/**
 * Transform PR data into timeline chart data
 * Shows PR lifecycle events over time
 */
function transformToTimeline(pr: PRInfo): ChartData {
  const events: ChartDataPoint[] = []

  // Created event
  events.push({
    name: 'Created',
    value: new Date(pr.createdAt).getTime(),
    color: DEFAULT_CHART_COLORS[0],
    metadata: {
      date: pr.createdAt,
      event: 'created',
      author: pr.author,
    },
  })

  // Updated event (if different from created)
  if (pr.updatedAt !== pr.createdAt) {
    events.push({
      name: 'Last Updated',
      value: new Date(pr.updatedAt).getTime(),
      color: DEFAULT_CHART_COLORS[1],
      metadata: {
        date: pr.updatedAt,
        event: 'updated',
      },
    })
  }

  // Merged event
  if (pr.mergedAt) {
    events.push({
      name: 'Merged',
      value: new Date(pr.mergedAt).getTime(),
      color: DEFAULT_CHART_COLORS[2],
      metadata: {
        date: pr.mergedAt,
        event: 'merged',
      },
    })
  }

  // Closed event (if closed but not merged)
  if (pr.closedAt && !pr.mergedAt) {
    events.push({
      name: 'Closed',
      value: new Date(pr.closedAt).getTime(),
      color: DEFAULT_CHART_COLORS[6],
      metadata: {
        date: pr.closedAt,
        event: 'closed',
      },
    })
  }

  return {
    type: 'line',
    title: 'PR Timeline',
    data: events.sort((a, b) => a.value - b.value),
    config: {
      xAxis: 'Event',
      yAxis: 'Date',
      colors: DEFAULT_CHART_COLORS,
      showLegend: true,
      showTooltip: true,
      animate: true,
    },
  }
}

/**
 * Transform PR data into file changes bar chart
 */
function transformToFileChanges(pr: PRInfo): ChartData {
  return {
    type: 'bar',
    title: 'Files Changed',
    data: [
      {
        name: 'Changed Files',
        value: pr.changedFiles,
        color: DEFAULT_CHART_COLORS[0],
        metadata: {
          additions: pr.additions,
          deletions: pr.deletions,
        },
      },
    ],
    config: {
      xAxis: 'Category',
      yAxis: 'Count',
      colors: [DEFAULT_CHART_COLORS[0]],
      showLegend: false,
      showTooltip: true,
      animate: true,
    },
  }
}

/**
 * Transform PR data into review status pie chart
 * Shows distribution of reviewers, comments, and review comments
 */
function transformToReviewStatus(pr: PRInfo): ChartData {
  const data: ChartDataPoint[] = []

  if (pr.reviewers.length > 0) {
    data.push({
      name: 'Reviewers',
      value: pr.reviewers.length,
      color: DEFAULT_CHART_COLORS[0],
      metadata: {
        reviewers: pr.reviewers,
      },
    })
  }

  if (pr.comments > 0) {
    data.push({
      name: 'Comments',
      value: pr.comments,
      color: DEFAULT_CHART_COLORS[1],
    })
  }

  if (pr.reviewComments > 0) {
    data.push({
      name: 'Review Comments',
      value: pr.reviewComments,
      color: DEFAULT_CHART_COLORS[2],
    })
  }

  // If no review activity, show a placeholder
  if (data.length === 0) {
    data.push({
      name: 'No Review Activity',
      value: 1,
      color: DEFAULT_CHART_COLORS[5],
    })
  }

  return {
    type: 'pie',
    title: 'Review Activity',
    data,
    config: {
      colors: data.map((d) => d.color || DEFAULT_CHART_COLORS[0]),
      showLegend: true,
      showTooltip: true,
      animate: true,
    },
  }
}

/**
 * Transform PR data into commit activity bar chart
 */
function transformToCommitActivity(pr: PRInfo): ChartData {
  return {
    type: 'bar',
    title: 'Commit Activity',
    data: [
      {
        name: 'Commits',
        value: pr.commits,
        color: DEFAULT_CHART_COLORS[4],
        metadata: {
          author: pr.author,
          branch: pr.headRef,
        },
      },
    ],
    config: {
      xAxis: 'Category',
      yAxis: 'Count',
      colors: [DEFAULT_CHART_COLORS[4]],
      showLegend: false,
      showTooltip: true,
      animate: true,
    },
  }
}

/**
 * Transform PR data into line changes bar chart
 * Shows additions (green) and deletions (red)
 */
function transformToLineChanges(pr: PRInfo): ChartData {
  return {
    type: 'bar',
    title: 'Line Changes',
    data: [
      {
        name: 'Additions',
        value: pr.additions,
        color: '#22c55e', // Green
        metadata: {
          type: 'addition',
        },
      },
      {
        name: 'Deletions',
        value: pr.deletions,
        color: '#ef4444', // Red
        metadata: {
          type: 'deletion',
        },
      },
    ],
    config: {
      xAxis: 'Change Type',
      yAxis: 'Lines',
      colors: ['#22c55e', '#ef4444'],
      showLegend: true,
      showTooltip: true,
      animate: true,
    },
  }
}

// ============================================
// Main Transform Function
// ============================================

/**
 * Transform PR information into chart data for a specific visualization type
 */
export function transformPRToChartData(pr: PRInfo, type: PRVisualizationType): ChartData {
  switch (type) {
    case 'timeline':
      return transformToTimeline(pr)
    case 'file_changes':
      return transformToFileChanges(pr)
    case 'review_status':
      return transformToReviewStatus(pr)
    case 'commit_activity':
      return transformToCommitActivity(pr)
    case 'line_changes':
      return transformToLineChanges(pr)
    default: {
      // Exhaustive check
      const _exhaustive: never = type
      throw new Error(`Unknown visualization type: ${_exhaustive}`)
    }
  }
}

/**
 * Transform PR info into multiple chart data based on requested visualization types
 */
function transformPRToCharts(pr: PRInfo, types: PRVisualizationType[]): ChartData[] {
  return types.map((type) => transformPRToChartData(pr, type))
}

/**
 * Generate insights based on PR data
 */
function generateInsights(pr: PRInfo): string[] {
  const insights: string[] = []

  // Size analysis
  const totalChanges = pr.additions + pr.deletions
  if (totalChanges > 1000) {
    insights.push(
      `Large PR with ${totalChanges.toLocaleString()} total line changes. Consider breaking into smaller PRs.`
    )
  } else if (totalChanges < 50) {
    insights.push('Small, focused PR - great for easy review!')
  }

  // File count analysis
  if (pr.changedFiles > 20) {
    insights.push(
      `Touches ${pr.changedFiles} files. Wide-reaching changes may need careful review.`
    )
  }

  // Review status
  if (pr.reviewers.length === 0 && pr.state === 'open') {
    insights.push('No reviewers assigned yet. Consider requesting reviews.')
  }

  // Draft status
  if (pr.draft) {
    insights.push('This PR is still in draft mode.')
  }

  // Merge status
  if (pr.mergeable === false) {
    insights.push('This PR has merge conflicts that need to be resolved.')
  }

  // Activity analysis
  const totalComments = pr.comments + pr.reviewComments
  if (totalComments > 20) {
    insights.push(`Active discussion with ${totalComments} comments.`)
  }

  // Age analysis
  const ageInDays = Math.floor(
    (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (ageInDays > 14 && pr.state === 'open') {
    insights.push(`PR has been open for ${ageInDays} days. Consider prioritizing review.`)
  }

  return insights
}

/**
 * Generate a summary of the PR
 */
function generateSummary(pr: PRInfo): string {
  const stateEmoji = pr.state === 'merged' ? 'merged' : pr.state === 'closed' ? 'closed' : 'open'

  const parts = [
    `PR #${pr.number}: "${pr.title}"`,
    `Status: ${stateEmoji}${pr.draft ? ' (draft)' : ''}`,
    `Author: ${pr.author}`,
    `Changes: +${pr.additions}/-${pr.deletions} across ${pr.changedFiles} files`,
    `Commits: ${pr.commits}`,
  ]

  if (pr.reviewers.length > 0) {
    parts.push(`Reviewers: ${pr.reviewers.join(', ')}`)
  }

  return parts.join(' | ')
}

// ============================================
// React Query Hook
// ============================================

export interface UsePRVisualizationOptions {
  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
}

export interface UsePRVisualizationResult {
  /** PR information */
  pr: PRInfo | undefined
  /** Generated chart data */
  charts: ChartData[]
  /** AI-generated insights */
  insights: string[]
  /** Summary of the PR */
  summary: string
  /** Loading state */
  isLoading: boolean
  /** Error state */
  isError: boolean
  /** Error object */
  error: Error | null
  /** Refetch function */
  refetch: () => void
  /** Whether data is being refetched */
  isRefetching: boolean
}

/**
 * Hook to fetch PR information and generate visualizations
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param prNumber - Pull request number
 * @param visualizationTypes - Types of visualizations to generate (defaults to all)
 * @param options - Additional query options
 *
 * @example
 * ```tsx
 * const { pr, charts, insights, isLoading } = usePRVisualization(
 *   'facebook',
 *   'react',
 *   12345,
 *   ['timeline', 'line_changes']
 * )
 * ```
 */
export function usePRVisualization(
  owner: string,
  repo: string,
  prNumber: number,
  visualizationTypes: PRVisualizationType[] = ALL_VISUALIZATION_TYPES,
  options: UsePRVisualizationOptions = {}
): UsePRVisualizationResult {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false,
  } = options

  const query = useQuery({
    queryKey: prVisualizationKeys.visualization(owner, repo, prNumber, visualizationTypes),
    queryFn: async (): Promise<PRVisualizationResponse> => {
      const pr = await fetchPRInfo(owner, repo, prNumber)
      const charts = transformPRToCharts(pr, visualizationTypes)
      const insights = generateInsights(pr)
      const summary = generateSummary(pr)

      return { pr, charts, insights, summary }
    },
    enabled: enabled && !!owner && !!repo && prNumber > 0,
    staleTime,
    refetchOnWindowFocus,
  })

  return {
    pr: query.data?.pr,
    charts: query.data?.charts ?? [],
    insights: query.data?.insights ?? [],
    summary: query.data?.summary ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}

// ============================================
// Prefetch Utility
// ============================================

/**
 * Hook to get prefetch function for PR visualization
 */
export function usePrefetchPRVisualization() {
  const queryClient = useQueryClient()

  return (
    owner: string,
    repo: string,
    prNumber: number,
    visualizationTypes: PRVisualizationType[] = ALL_VISUALIZATION_TYPES
  ) => {
    return queryClient.prefetchQuery({
      queryKey: prVisualizationKeys.visualization(owner, repo, prNumber, visualizationTypes),
      queryFn: async (): Promise<PRVisualizationResponse> => {
        const pr = await fetchPRInfo(owner, repo, prNumber)
        const charts = transformPRToCharts(pr, visualizationTypes)
        const insights = generateInsights(pr)
        const summary = generateSummary(pr)

        return { pr, charts, insights, summary }
      },
    })
  }
}

// ============================================
// Chart Config Helpers
// ============================================

/**
 * Get default chart configuration for a visualization type
 */
export function getDefaultChartConfig(type: PRVisualizationType): ChartConfig {
  switch (type) {
    case 'timeline':
      return {
        xAxis: 'Event',
        yAxis: 'Date',
        colors: DEFAULT_CHART_COLORS,
        showLegend: true,
        showTooltip: true,
        animate: true,
      }
    case 'file_changes':
    case 'commit_activity':
      return {
        xAxis: 'Category',
        yAxis: 'Count',
        colors: DEFAULT_CHART_COLORS.slice(0, 1),
        showLegend: false,
        showTooltip: true,
        animate: true,
      }
    case 'review_status':
      return {
        colors: DEFAULT_CHART_COLORS.slice(0, 3),
        showLegend: true,
        showTooltip: true,
        animate: true,
      }
    case 'line_changes':
      return {
        xAxis: 'Change Type',
        yAxis: 'Lines',
        colors: ['#22c55e', '#ef4444'],
        showLegend: true,
        showTooltip: true,
        animate: true,
      }
    default:
      return {
        colors: DEFAULT_CHART_COLORS,
        showLegend: true,
        showTooltip: true,
        animate: true,
      }
  }
}

/**
 * Get chart colors array
 */
export function getChartColors(): string[] {
  return [...DEFAULT_CHART_COLORS]
}
