'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Issue, Label, Reactions } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface IssueListProps {
  issues: Issue[]
  onSelect: (issue: Issue) => void
  selectedIssues?: number[]
  isLoading?: boolean
  error?: string | null
  maxHeight?: string
}

type IssueStateFilter = 'all' | 'open' | 'closed'

// ============================================
// Icons
// ============================================

function IssueOpenIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  )
}

function IssueClosedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z" />
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z" />
    </svg>
  )
}

function IssueNotPlannedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '5',
        h: '5',
        animation: 'spin 1s linear infinite',
        flexShrink: 0,
      })}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className={css({ opacity: 0.25 })}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className={css({ opacity: 0.75 })}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '3', h: '3', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '3.5', h: '3.5', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  )
}

function EmptyIssueIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '12', h: '12', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

// ============================================
// Helper Functions
// ============================================

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  return `${diffMonths}mo ago`
}

function getIssueStateInfo(issue: Issue): {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  if (issue.state === 'closed') {
    // Check state_reason for closed issues
    if (issue.state_reason === 'not_planned') {
      return {
        icon: <IssueNotPlannedIcon />,
        label: 'Not Planned',
        color: 'rgb(239, 68, 68)',
        bgColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }
    }
    // Default closed state (completed)
    return {
      icon: <IssueClosedIcon />,
      label: 'Closed',
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    }
  }

  // Open state
  return {
    icon: <IssueOpenIcon />,
    label: 'Open',
    color: 'rgb(34, 197, 94)',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  }
}

function formatLabelColor(hexColor: string): { bg: string; text: string; border: string } {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate luminance to determine text color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.2)`,
    text:
      luminance > 0.5
        ? `rgb(${r}, ${g}, ${b})`
        : `rgb(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)})`,
    border: `rgba(${r}, ${g}, ${b}, 0.4)`,
  }
}

// Reaction emoji mapping
const REACTION_EMOJIS: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  laugh: '😄',
  hooray: '🎉',
  confused: '😕',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
}

function getReactionsSummary(reactions: Reactions | undefined): { emoji: string; count: number }[] {
  if (!reactions) return []

  const summary: { emoji: string; count: number }[] = []

  const reactionKeys: (keyof Reactions)[] = [
    '+1',
    '-1',
    'laugh',
    'hooray',
    'confused',
    'heart',
    'rocket',
    'eyes',
  ]

  for (const key of reactionKeys) {
    const count = reactions[key]
    if (typeof count === 'number' && count > 0) {
      summary.push({
        emoji: REACTION_EMOJIS[key] || key,
        count,
      })
    }
  }

  return summary
}

// ============================================
// Sub-components
// ============================================

interface IssueLabelBadgeProps {
  label: Label
}

function IssueLabelBadge({ label }: IssueLabelBadgeProps) {
  const colors = formatLabelColor(label.color)

  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        px: '1.5',
        py: '0.5',
        rounded: 'full',
        fontSize: 'xs',
        fontWeight: 'medium',
        whiteSpace: 'nowrap',
      })}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
      title={label.description || label.name}
    >
      {label.name}
    </span>
  )
}

interface FilterTabProps {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

function FilterTab({ label, count, isActive, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '1.5',
        px: '3',
        py: '1.5',
        rounded: 'lg',
        fontSize: 'sm',
        fontWeight: 'medium',
        transition: 'all 0.15s',
        cursor: 'pointer',
        bg: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        color: isActive ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.6)',
        border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
        _hover: {
          bg: isActive ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          color: isActive ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.8)',
        },
      })}
    >
      <span>{label}</span>
      <span
        className={css({
          px: '1.5',
          py: '0.5',
          rounded: 'full',
          fontSize: 'xs',
          bg: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          color: isActive ? 'rgb(191, 219, 254)' : 'rgba(255, 255, 255, 0.5)',
        })}
      >
        {count}
      </span>
    </button>
  )
}

interface ReactionBadgeProps {
  emoji: string
  count: number
}

function ReactionBadge({ emoji, count }: ReactionBadgeProps) {
  return (
    <span
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5',
        px: '1',
        py: '0.5',
        rounded: 'md',
        fontSize: 'xs',
        bg: 'rgba(255, 255, 255, 0.05)',
        color: 'rgba(255, 255, 255, 0.6)',
      })}
    >
      <span>{emoji}</span>
      <span>{count}</span>
    </span>
  )
}

interface IssueItemProps {
  issue: Issue
  isSelected: boolean
  onSelect: () => void
}

function IssueItem({ issue, isSelected, onSelect }: IssueItemProps) {
  const stateInfo = getIssueStateInfo(issue)
  const reactions = getReactionsSummary(issue.reactions)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect()
      }
    },
    [onSelect]
  )

  // Skip issues that are actually pull requests
  if (issue.pull_request) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={css({
        w: 'full',
        display: 'flex',
        flexDir: 'column',
        gap: '2',
        p: '3',
        rounded: 'lg',
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
        bg: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.2)',
        border: isSelected
          ? '1px solid rgba(59, 130, 246, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.05)',
        _hover: {
          bg: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.3)',
          borderColor: isSelected ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)',
        },
      })}
    >
      {/* Top Row: State, Title, Number */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'flex-start',
          gap: '2',
        })}
      >
        {/* State Icon */}
        <span style={{ color: stateInfo.color }} className={css({ mt: '0.5' })}>
          {stateInfo.icon}
        </span>

        {/* Title and Number */}
        <div className={css({ flex: '1', minW: '0' })}>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              flexWrap: 'wrap',
            })}
          >
            <span
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: isSelected ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.9)',
                lineHeight: 'tight',
              })}
            >
              {issue.title}
            </span>
            <span
              className={css({
                fontSize: 'xs',
                color: 'rgba(255, 255, 255, 0.4)',
                flexShrink: 0,
              })}
            >
              #{issue.number}
            </span>
          </div>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                flexWrap: 'wrap',
                mt: '1.5',
              })}
            >
              {issue.labels.slice(0, 4).map((label) => (
                <IssueLabelBadge key={label.id} label={label} />
              ))}
              {issue.labels.length > 4 && (
                <span
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.4)',
                  })}
                >
                  +{issue.labels.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <span className={css({ color: 'rgb(59, 130, 246)', flexShrink: 0 })}>
            <CheckIcon />
          </span>
        )}
      </div>

      {/* Bottom Row: Meta Info */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '3',
          pl: '6',
          flexWrap: 'wrap',
        })}
      >
        {/* Author Avatar and Info */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
          })}
        >
          <img
            src={issue.user.avatar_url}
            alt={issue.user.login}
            className={css({
              w: '4',
              h: '4',
              rounded: 'full',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          />
          <span
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
            })}
          >
            {issue.user.login}
          </span>
        </div>

        {/* Time */}
        <span
          className={css({
            fontSize: 'xs',
            color: 'rgba(255, 255, 255, 0.4)',
          })}
        >
          {formatRelativeTime(issue.updated_at)}
        </span>

        {/* Comments */}
        {issue.comments > 0 && (
          <>
            <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                color: 'rgba(255, 255, 255, 0.4)',
              })}
            >
              <CommentIcon />
              <span className={css({ fontSize: 'xs' })}>{issue.comments}</span>
            </div>
          </>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <>
            <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
              })}
            >
              {reactions.slice(0, 4).map((reaction) => (
                <ReactionBadge key={reaction.emoji} emoji={reaction.emoji} count={reaction.count} />
              ))}
              {reactions.length > 4 && (
                <span
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.4)',
                  })}
                >
                  +{reactions.length - 4}
                </span>
              )}
            </div>
          </>
        )}

        {/* State Badge */}
        <span
          className={css({
            px: '1.5',
            py: '0.5',
            rounded: 'full',
            fontSize: 'xs',
            fontWeight: 'medium',
            ml: 'auto',
          })}
          style={{
            backgroundColor: stateInfo.bgColor,
            color: stateInfo.color,
            border: `1px solid ${stateInfo.borderColor}`,
          }}
        >
          {stateInfo.label}
        </span>
      </div>
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export function IssueList({
  issues,
  onSelect,
  selectedIssues = [],
  isLoading = false,
  error = null,
  maxHeight = '500px',
}: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<IssueStateFilter>('all')

  // Filter out pull requests (they appear in issues API but have pull_request field)
  const actualIssues = useMemo(() => {
    return issues.filter((issue) => !issue.pull_request)
  }, [issues])

  // Calculate counts for each filter
  const counts = useMemo(() => {
    const all = actualIssues.length
    const open = actualIssues.filter((issue) => issue.state === 'open').length
    const closed = actualIssues.filter((issue) => issue.state === 'closed').length

    return { all, open, closed }
  }, [actualIssues])

  // Filter issues based on state and search query
  const filteredIssues = useMemo(() => {
    let filtered = [...actualIssues]

    // Apply state filter
    if (stateFilter === 'open') {
      filtered = filtered.filter((issue) => issue.state === 'open')
    } else if (stateFilter === 'closed') {
      filtered = filtered.filter((issue) => issue.state === 'closed')
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.number.toString().includes(query) ||
          issue.user.login.toLowerCase().includes(query) ||
          issue.labels?.some((label) => label.name.toLowerCase().includes(query)) ||
          issue.body?.toLowerCase().includes(query)
      )
    }

    // Sort by updated_at (most recent first)
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    return filtered
  }, [actualIssues, stateFilter, searchQuery])

  const handleSelect = useCallback(
    (issue: Issue) => {
      onSelect(issue)
    },
    [onSelect]
  )

  // Loading state
  if (isLoading) {
    return (
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: '12',
          gap: '3',
          bg: 'rgba(0, 0, 0, 0.2)',
          rounded: 'xl',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        <div className={css({ color: 'rgba(255, 255, 255, 0.5)' })}>
          <SpinnerIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgba(255, 255, 255, 0.5)',
          })}
        >
          Loading issues...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: '12',
          gap: '3',
          bg: 'rgba(239, 68, 68, 0.1)',
          rounded: 'xl',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        })}
      >
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgb(252, 165, 165)',
          })}
        >
          {error}
        </p>
      </div>
    )
  }

  // Empty state
  if (actualIssues.length === 0) {
    return (
      <div
        className={css({
          display: 'flex',
          flexDir: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: '12',
          gap: '3',
          bg: 'rgba(0, 0, 0, 0.2)',
          rounded: 'xl',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        <div className={css({ color: 'rgba(255, 255, 255, 0.3)' })}>
          <EmptyIssueIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgba(255, 255, 255, 0.5)',
          })}
        >
          No issues found
        </p>
      </div>
    )
  }

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        bg: 'rgba(0, 0, 0, 0.2)',
        rounded: 'xl',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      })}
    >
      {/* Header with Search and Filters */}
      <div
        className={css({
          p: '3',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        })}
      >
        {/* Search Input */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '3',
            py: '2',
            rounded: 'lg',
            bg: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            _focusWithin: {
              borderColor: 'rgba(59, 130, 246, 0.5)',
            },
          })}
        >
          <div className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
            <SearchIcon />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues..."
            className={css({
              flex: '1',
              bg: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'sm',
              color: 'rgba(255, 255, 255, 0.9)',
              _placeholder: {
                color: 'rgba(255, 255, 255, 0.4)',
              },
            })}
          />
        </div>

        {/* Filter Tabs */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1',
            mt: '3',
            overflowX: 'auto',
          })}
        >
          <FilterTab
            label="All"
            count={counts.all}
            isActive={stateFilter === 'all'}
            onClick={() => setStateFilter('all')}
          />
          <FilterTab
            label="Open"
            count={counts.open}
            isActive={stateFilter === 'open'}
            onClick={() => setStateFilter('open')}
          />
          <FilterTab
            label="Closed"
            count={counts.closed}
            isActive={stateFilter === 'closed'}
            onClick={() => setStateFilter('closed')}
          />
        </div>
      </div>

      {/* Issue List */}
      <div
        className={css({
          overflowY: 'auto',
          p: '2',
        })}
        style={{ maxHeight }}
      >
        {filteredIssues.length > 0 ? (
          <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
            {filteredIssues.map((issue) => (
              <IssueItem
                key={issue.id}
                issue={issue}
                isSelected={selectedIssues.includes(issue.number)}
                onSelect={() => handleSelect(issue)}
              />
            ))}
          </div>
        ) : (
          <div
            className={css({
              py: '8',
              textAlign: 'center',
            })}
          >
            <p
              className={css({
                fontSize: 'sm',
                color: 'rgba(255, 255, 255, 0.5)',
              })}
            >
              No issues matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Footer - Selected Count */}
      {selectedIssues.length > 0 && (
        <div
          className={css({
            px: '3',
            py: '2',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(59, 130, 246, 0.1)',
          })}
        >
          <p
            className={css({
              fontSize: 'xs',
              color: 'rgb(147, 197, 253)',
            })}
          >
            {selectedIssues.length} issue{selectedIssues.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
