'use client'

/**
 * PR Chart Component
 *
 * Visualizes Pull Request data using Recharts.
 * Supports bar, line, pie, and timeline chart types.
 */

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { usePRVisualization } from '@/lib/hooks/use-pr-visualization'
import type { ChartData } from '@/lib/services/copilot'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface PRChartProps {
  owner: string
  repo: string
  prNumber: number
}

// ============================================
// Constants
// ============================================

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042']

// ============================================
// Chart Renderers
// ============================================

function renderBarChart(chart: ChartData) {
  const colors = chart.config?.colors ?? DEFAULT_COLORS

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
        />
        <YAxis
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chart.data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={entry.color ?? colors[index % colors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderLineChart(chart: ChartData) {
  const colors = chart.config?.colors ?? DEFAULT_COLORS

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
        />
        <YAxis
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ fill: colors[0], strokeWidth: 2 }}
          activeDot={{ r: 6, fill: colors[0] }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function renderPieChart(chart: ChartData) {
  const colors = chart.config?.colors ?? DEFAULT_COLORS

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chart.data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
        >
          {chart.data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={entry.color ?? colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        />
        <Legend
          wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
          formatter={(value) => <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function renderChart(chart: ChartData) {
  switch (chart.type) {
    case 'bar':
      return renderBarChart(chart)
    case 'line':
    case 'timeline':
      return renderLineChart(chart)
    case 'pie':
      return renderPieChart(chart)
    default:
      return renderBarChart(chart)
  }
}

// ============================================
// Subcomponents
// ============================================

function LoadingState() {
  return (
    <div
      className={css({
        p: '6',
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'xl',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      })}
    >
      <div className={css({ spaceY: '4' })}>
        <div
          className={css({
            h: '6',
            w: '48',
            bg: 'rgba(255, 255, 255, 0.1)',
            rounded: 'md',
            animation: 'pulse 2s infinite',
          })}
        />
        <div
          className={css({
            h: '300px',
            bg: 'rgba(255, 255, 255, 0.05)',
            rounded: 'lg',
            animation: 'pulse 2s infinite',
          })}
        />
        <div className={css({ display: 'flex', gap: '2' })}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={css({
                h: '4',
                flex: '1',
                bg: 'rgba(255, 255, 255, 0.1)',
                rounded: 'md',
                animation: 'pulse 2s infinite',
              })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  error: Error | null
  onRetry: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      className={css({
        p: '6',
        bg: 'rgba(239, 68, 68, 0.1)',
        rounded: 'xl',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      })}
    >
      <div className={css({ spaceY: '4' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
          <svg
            className={css({ w: '6', h: '6', color: 'rgb(252, 165, 165)' })}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Error icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className={css({ color: 'rgb(252, 165, 165)', fontWeight: 'medium' })}>
            Failed to load PR data
          </span>
        </div>
        <p className={css({ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'sm' })}>
          {error?.message ?? 'An unexpected error occurred'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className={css({
            px: '4',
            py: '2',
            rounded: 'lg',
            bg: 'rgba(239, 68, 68, 0.2)',
            color: 'rgb(252, 165, 165)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            _hover: { bg: 'rgba(239, 68, 68, 0.3)' },
          })}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

interface ChartCardProps {
  chart: ChartData
}

function ChartCard({ chart }: ChartCardProps) {
  return (
    <div
      className={css({
        p: '4',
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'xl',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      })}
    >
      <h3
        className={css({
          mb: '4',
          fontSize: 'md',
          fontWeight: 'semibold',
          color: 'rgba(255, 255, 255, 0.9)',
        })}
      >
        {chart.title}
      </h3>
      {renderChart(chart)}
    </div>
  )
}

interface InsightsListProps {
  insights: string[]
}

function InsightsList({ insights }: InsightsListProps) {
  if (insights.length === 0) return null

  return (
    <div
      className={css({
        p: '4',
        bg: 'rgba(59, 130, 246, 0.1)',
        rounded: 'xl',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      })}
    >
      <h3
        className={css({
          mb: '3',
          fontSize: 'md',
          fontWeight: 'semibold',
          color: 'rgb(147, 197, 253)',
          display: 'flex',
          alignItems: 'center',
          gap: '2',
        })}
      >
        <svg
          className={css({ w: '5', h: '5' })}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <title>Insights icon</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Insights
      </h3>
      <ul className={css({ spaceY: '2' })}>
        {insights.map((insight) => (
          <li
            key={insight}
            className={css({
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2',
              fontSize: 'sm',
              color: 'rgba(255, 255, 255, 0.8)',
            })}
          >
            <span className={css({ color: 'rgb(147, 197, 253)', mt: '0.5' })}>•</span>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function PRChart({ owner, repo, prNumber }: PRChartProps) {
  const { pr, charts, insights, summary, isLoading, isError, error, refetch, isRefetching } =
    usePRVisualization(owner, repo, prNumber)

  if (isLoading) {
    return <LoadingState />
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (!pr) {
    return (
      <div
        className={css({
          p: '6',
          bg: 'rgba(0, 0, 0, 0.2)',
          rounded: 'xl',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
        })}
      >
        No PR data available
      </div>
    )
  }

  return (
    <div className={css({ spaceY: '6' })}>
      {/* Header with PR info and refresh button */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '4',
        })}
      >
        <div>
          <h2
            className={css({
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.95)',
            })}
          >
            {pr.title}
          </h2>
          <p className={css({ fontSize: 'sm', color: 'rgba(255, 255, 255, 0.6)', mt: '1' })}>
            {owner}/{repo} #{prNumber} by {pr.author}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className={css({
            px: '4',
            py: '2',
            rounded: 'lg',
            bg: 'rgba(59, 130, 246, 0.2)',
            color: 'rgb(147, 197, 253)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            _hover: { bg: 'rgba(59, 130, 246, 0.3)' },
            _disabled: { opacity: 0.5, cursor: 'not-allowed' },
          })}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div
          className={css({
            p: '4',
            bg: 'rgba(0, 0, 0, 0.2)',
            rounded: 'xl',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <p
            className={css({
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 'sm',
              lineHeight: '1.6',
            })}
          >
            {summary}
          </p>
        </div>
      )}

      {/* Charts Grid */}
      {charts.length > 0 && (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
            gap: '4',
          })}
        >
          {charts.map((chart, index) => (
            <ChartCard key={`chart-${chart.title}-${index}`} chart={chart} />
          ))}
        </div>
      )}

      {/* Insights */}
      <InsightsList insights={insights} />
    </div>
  )
}
