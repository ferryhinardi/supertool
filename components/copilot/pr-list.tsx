'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Label, PullRequest } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface PRListProps {
  pullRequests: PullRequest[]
  onSelect: (pr: PullRequest) => void
  selectedPRs?: number[]
  isLoading?: boolean
  error?: string | null
  maxHeight?: string
}

type PRStateFilter = 'all' | 'open' | 'closed' | 'merged'

// ============================================
// Icons
// ============================================

function PROpenIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  )
}

function PRClosedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.28a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 0 1-1.06 1.06L12 3.56l-1.22 1.22a.75.75 0 1 1-1.06-1.06l2.5-2.5ZM3.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  )
}

function PRMergedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
    </svg>
  )
}

function DraftIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 14a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Zm-2.03-3.97a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-.97.97.97.97a.75.75 0 1 1-1.06 1.06l-.97-.97-.97.97a.75.75 0 1 1-1.06-1.06l.97-.97-.97-.97a.75.75 0 0 1 0-1.06ZM3.25 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
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

function FileChangeIcon() {
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function EmptyPRIcon() {
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
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
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

function getPRStateInfo(pr: PullRequest): {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  if (pr.merged || pr.merged_at) {
    return {
      icon: <PRMergedIcon />,
      label: 'Merged',
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    }
  }

  if (pr.draft) {
    return {
      icon: <DraftIcon />,
      label: 'Draft',
      color: 'rgba(255, 255, 255, 0.5)',
      bgColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    }
  }

  if (pr.state === 'closed') {
    return {
      icon: <PRClosedIcon />,
      label: 'Closed',
      color: 'rgb(239, 68, 68)',
      bgColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    }
  }

  return {
    icon: <PROpenIcon />,
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

// ============================================
// Sub-components
// ============================================

interface PRLabelBadgeProps {
  label: Label
}

function PRLabelBadge({ label }: PRLabelBadgeProps) {
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

interface PRItemProps {
  pr: PullRequest
  isSelected: boolean
  onSelect: () => void
}

function PRItem({ pr, isSelected, onSelect }: PRItemProps) {
  const stateInfo = getPRStateInfo(pr)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect()
      }
    },
    [onSelect]
  )

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
              {pr.title}
            </span>
            <span
              className={css({
                fontSize: 'xs',
                color: 'rgba(255, 255, 255, 0.4)',
                flexShrink: 0,
              })}
            >
              #{pr.number}
            </span>
          </div>

          {/* Labels */}
          {pr.labels && pr.labels.length > 0 && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
                flexWrap: 'wrap',
                mt: '1.5',
              })}
            >
              {pr.labels.slice(0, 4).map((label) => (
                <PRLabelBadge key={label.id} label={label} />
              ))}
              {pr.labels.length > 4 && (
                <span
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.4)',
                  })}
                >
                  +{pr.labels.length - 4}
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
            src={pr.user.avatar_url}
            alt={pr.user.login}
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
            {pr.user.login}
          </span>
        </div>

        {/* Time */}
        <span
          className={css({
            fontSize: 'xs',
            color: 'rgba(255, 255, 255, 0.4)',
          })}
        >
          {formatRelativeTime(pr.updated_at)}
        </span>

        {/* Stats Separator */}
        <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>

        {/* Additions/Deletions */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
          })}
        >
          <span
            className={css({
              fontSize: 'xs',
              color: 'rgb(34, 197, 94)',
              fontWeight: 'medium',
            })}
          >
            +{pr.additions}
          </span>
          <span
            className={css({
              fontSize: 'xs',
              color: 'rgb(239, 68, 68)',
              fontWeight: 'medium',
            })}
          >
            -{pr.deletions}
          </span>
        </div>

        {/* Changed Files */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1',
            color: 'rgba(255, 255, 255, 0.4)',
          })}
        >
          <FileChangeIcon />
          <span className={css({ fontSize: 'xs' })}>{pr.changed_files}</span>
        </div>

        {/* Comments */}
        {(pr.comments > 0 || pr.review_comments > 0) && (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              color: 'rgba(255, 255, 255, 0.4)',
            })}
          >
            <CommentIcon />
            <span className={css({ fontSize: 'xs' })}>{pr.comments + pr.review_comments}</span>
          </div>
        )}

        {/* Draft Badge */}
        {pr.draft && (
          <span
            className={css({
              px: '1.5',
              py: '0.5',
              rounded: 'full',
              fontSize: 'xs',
              bg: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            })}
          >
            Draft
          </span>
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

export function PRList({
  pullRequests,
  onSelect,
  selectedPRs = [],
  isLoading = false,
  error = null,
  maxHeight = '500px',
}: PRListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<PRStateFilter>('all')

  // Calculate counts for each filter
  const counts = useMemo(() => {
    const all = pullRequests.length
    const open = pullRequests.filter((pr) => pr.state === 'open' && !pr.draft).length
    const closed = pullRequests.filter(
      (pr) => pr.state === 'closed' && !pr.merged && !pr.merged_at
    ).length
    const merged = pullRequests.filter((pr) => pr.merged || pr.merged_at).length

    return { all, open, closed, merged }
  }, [pullRequests])

  // Filter PRs based on state and search query
  const filteredPRs = useMemo(() => {
    let filtered = [...pullRequests]

    // Apply state filter
    if (stateFilter === 'open') {
      filtered = filtered.filter((pr) => pr.state === 'open' && !pr.draft)
    } else if (stateFilter === 'closed') {
      filtered = filtered.filter((pr) => pr.state === 'closed' && !pr.merged && !pr.merged_at)
    } else if (stateFilter === 'merged') {
      filtered = filtered.filter((pr) => pr.merged || pr.merged_at)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (pr) =>
          pr.title.toLowerCase().includes(query) ||
          pr.number.toString().includes(query) ||
          pr.user.login.toLowerCase().includes(query) ||
          pr.labels?.some((label) => label.name.toLowerCase().includes(query))
      )
    }

    // Sort by updated_at (most recent first)
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    return filtered
  }, [pullRequests, stateFilter, searchQuery])

  const handleSelect = useCallback(
    (pr: PullRequest) => {
      onSelect(pr)
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
          Loading pull requests...
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
  if (pullRequests.length === 0) {
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
          <EmptyPRIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgba(255, 255, 255, 0.5)',
          })}
        >
          No pull requests found
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
            placeholder="Search pull requests..."
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
            label="Merged"
            count={counts.merged}
            isActive={stateFilter === 'merged'}
            onClick={() => setStateFilter('merged')}
          />
          <FilterTab
            label="Closed"
            count={counts.closed}
            isActive={stateFilter === 'closed'}
            onClick={() => setStateFilter('closed')}
          />
        </div>
      </div>

      {/* PR List */}
      <div
        className={css({
          overflowY: 'auto',
          p: '2',
        })}
        style={{ maxHeight }}
      >
        {filteredPRs.length > 0 ? (
          <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
            {filteredPRs.map((pr) => (
              <PRItem
                key={pr.id}
                pr={pr}
                isSelected={selectedPRs.includes(pr.number)}
                onSelect={() => handleSelect(pr)}
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
              No pull requests matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Footer - Selected Count */}
      {selectedPRs.length > 0 && (
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
            {selectedPRs.length} pull request{selectedPRs.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
