'use client'

import { useCallback, useMemo, useState } from 'react'
import type { FileTreeItem, Issue, PullRequest, Repository } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface ContextItem {
  id: string
  type: 'file' | 'pr' | 'issue'
  data: FileTreeItem | PullRequest | Issue
}

export interface RepoContext {
  repository: Repository | null
  files: FileTreeItem[]
  pullRequest: PullRequest | null
  issue: Issue | null
}

export interface ContextPanelProps {
  context: RepoContext
  onRemoveFile: (path: string) => void
  onRemovePR: () => void
  onRemoveIssue: () => void
  onClearAll: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// ============================================
// Icons
// ============================================

function ChevronDownIcon({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '4',
        h: '4',
        flexShrink: 0,
        transition: 'transform 0.2s ease',
        transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
      })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function RepoIcon() {
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

function FileIcon() {
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function PullRequestIcon() {
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
        d="M8 7a4 4 0 108 0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h2m8-14h2a2 2 0 012 2v10a2 2 0 01-2 2h-2"
      />
    </svg>
  )
}

function IssueIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '3.5', h: '3.5', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function TrashIcon() {
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

function ContextIcon() {
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
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  )
}

// ============================================
// Utility Functions
// ============================================

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  return `${(num / 1000).toFixed(1)}K`
}

function getFileName(path: string): string {
  return path.split('/').pop() || path
}

// ============================================
// Styles
// ============================================

const containerStyles = css({
  display: 'flex',
  flexDir: 'column',
  bg: 'rgba(0, 0, 0, 0.2)',
  rounded: 'xl',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
})

const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '4',
  py: '3',
  bg: 'rgba(0, 0, 0, 0.3)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  _hover: {
    bg: 'rgba(0, 0, 0, 0.4)',
  },
})

const headerLeftStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: '500',
})

const headerRightStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
})

const badgeStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  px: '2',
  py: '0.5',
  bg: 'rgba(59, 130, 246, 0.2)',
  color: 'rgb(147, 197, 253)',
  fontSize: 'xs',
  fontWeight: '500',
  rounded: 'full',
})

const contentStyles = css({
  display: 'flex',
  flexDir: 'column',
  gap: '3',
  p: '4',
})

const sectionStyles = css({
  display: 'flex',
  flexDir: 'column',
  gap: '2',
})

const sectionHeaderStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 'xs',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  transition: 'color 0.2s ease',
  _hover: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
})

const sectionHeaderLeftStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const sectionContentStyles = css({
  display: 'flex',
  flexDir: 'column',
  gap: '1',
  pl: '1',
})

const itemStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
  px: '2',
  py: '1.5',
  bg: 'rgba(0, 0, 0, 0.2)',
  rounded: 'lg',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'all 0.2s ease',
  _hover: {
    bg: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
})

const itemLeftStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minW: '0',
  flex: '1',
})

const itemTextStyles = css({
  display: 'flex',
  flexDir: 'column',
  minW: '0',
  flex: '1',
})

const itemNameStyles = css({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: '500',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const itemMetaStyles = css({
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: 'xs',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const removeButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '1',
  color: 'rgba(255, 255, 255, 0.4)',
  rounded: 'md',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  flexShrink: 0,
  _hover: {
    bg: 'rgba(239, 68, 68, 0.2)',
    color: 'rgb(248, 113, 113)',
  },
})

const clearAllButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5',
  px: '3',
  py: '1.5',
  bg: 'rgba(239, 68, 68, 0.1)',
  color: 'rgb(248, 113, 113)',
  fontSize: 'xs',
  fontWeight: '500',
  rounded: 'lg',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  _hover: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
})

const emptyStateStyles = css({
  display: 'flex',
  flexDir: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  py: '6',
  color: 'rgba(255, 255, 255, 0.4)',
  textAlign: 'center',
})

const emptyIconStyles = css({
  w: '8',
  h: '8',
  opacity: 0.5,
})

const statsRowStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4',
  pt: '3',
  mt: '2',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
})

const statItemStyles = css({
  display: 'flex',
  flexDir: 'column',
  alignItems: 'center',
  gap: '0.5',
})

const statValueStyles = css({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: '600',
})

const statLabelStyles = css({
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: 'xs',
})

const prStateBadgeStyles = (state: 'open' | 'closed', merged?: boolean) =>
  css({
    display: 'inline-flex',
    alignItems: 'center',
    px: '1.5',
    py: '0.5',
    fontSize: 'xs',
    fontWeight: '500',
    rounded: 'full',
    bg: merged
      ? 'rgba(168, 85, 247, 0.2)'
      : state === 'open'
        ? 'rgba(34, 197, 94, 0.2)'
        : 'rgba(239, 68, 68, 0.2)',
    color: merged
      ? 'rgb(192, 132, 252)'
      : state === 'open'
        ? 'rgb(74, 222, 128)'
        : 'rgb(248, 113, 113)',
  })

const issueStateBadgeStyles = (state: 'open' | 'closed') =>
  css({
    display: 'inline-flex',
    alignItems: 'center',
    px: '1.5',
    py: '0.5',
    fontSize: 'xs',
    fontWeight: '500',
    rounded: 'full',
    bg: state === 'open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)',
    color: state === 'open' ? 'rgb(74, 222, 128)' : 'rgb(192, 132, 252)',
  })

// ============================================
// Sub-Components
// ============================================

interface SectionProps {
  title: string
  icon: React.ReactNode
  count: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, icon, count, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className={sectionStyles}>
      <button
        type="button"
        className={sectionHeaderStyles}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={sectionHeaderLeftStyles}>
          <ChevronDownIcon rotated={!isExpanded} />
          {icon}
          {title}
        </span>
        <span className={badgeStyles}>{count}</span>
      </button>
      {isExpanded && <div className={sectionContentStyles}>{children}</div>}
    </div>
  )
}

interface FileItemProps {
  file: FileTreeItem
  onRemove: (path: string) => void
}

function FileItem({ file, onRemove }: FileItemProps) {
  const handleRemove = useCallback(() => {
    onRemove(file.path)
  }, [file.path, onRemove])

  return (
    <div className={itemStyles}>
      <div className={itemLeftStyles}>
        <span className={css({ color: 'rgb(59, 130, 246)' })}>
          <FileIcon />
        </span>
        <div className={itemTextStyles}>
          <span className={itemNameStyles}>{getFileName(file.path)}</span>
          <span className={itemMetaStyles}>{file.path}</span>
        </div>
      </div>
      <button
        type="button"
        className={removeButtonStyles}
        onClick={handleRemove}
        aria-label={`Remove ${file.path} from context`}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

interface PRItemProps {
  pr: PullRequest
  onRemove: () => void
}

function PRItem({ pr, onRemove }: PRItemProps) {
  return (
    <div className={itemStyles}>
      <div className={itemLeftStyles}>
        <span className={css({ color: 'rgb(34, 197, 94)' })}>
          <PullRequestIcon />
        </span>
        <div className={itemTextStyles}>
          <span className={itemNameStyles}>
            #{pr.number} {pr.title}
          </span>
          <span className={itemMetaStyles}>
            {pr.user.login} · {pr.additions}+ {pr.deletions}- · {pr.changed_files} files
          </span>
        </div>
        <span className={prStateBadgeStyles(pr.state, pr.merged)}>
          {pr.merged ? 'Merged' : pr.state}
        </span>
      </div>
      <button
        type="button"
        className={removeButtonStyles}
        onClick={onRemove}
        aria-label={`Remove PR #${pr.number} from context`}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

interface IssueItemProps {
  issue: Issue
  onRemove: () => void
}

function IssueItem({ issue, onRemove }: IssueItemProps) {
  return (
    <div className={itemStyles}>
      <div className={itemLeftStyles}>
        <span className={css({ color: 'rgb(251, 191, 36)' })}>
          <IssueIcon />
        </span>
        <div className={itemTextStyles}>
          <span className={itemNameStyles}>
            #{issue.number} {issue.title}
          </span>
          <span className={itemMetaStyles}>
            {issue.user.login} · {issue.comments} comments
          </span>
        </div>
        <span className={issueStateBadgeStyles(issue.state)}>{issue.state}</span>
      </div>
      <button
        type="button"
        className={removeButtonStyles}
        onClick={onRemove}
        aria-label={`Remove issue #${issue.number} from context`}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function ContextPanel({
  context,
  onRemoveFile,
  onRemovePR,
  onRemoveIssue,
  onClearAll,
  isCollapsed = false,
  onToggleCollapse,
}: ContextPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    repository: true,
    files: true,
    pullRequest: true,
    issue: true,
  })

  // Calculate context stats
  const stats = useMemo(() => {
    let totalSize = 0
    let totalTokens = 0
    let itemCount = 0

    // Repository context
    if (context.repository) {
      const repoText = JSON.stringify(context.repository)
      totalSize += repoText.length
      totalTokens += estimateTokens(repoText)
      itemCount += 1
    }

    // Files context
    for (const file of context.files) {
      totalSize += file.size || 0
      totalTokens += estimateTokens(file.path) + (file.size ? Math.ceil(file.size / 4) : 100)
      itemCount += 1
    }

    // PR context
    if (context.pullRequest) {
      const prText = JSON.stringify(context.pullRequest)
      totalSize += prText.length
      totalTokens += estimateTokens(prText)
      itemCount += 1
    }

    // Issue context
    if (context.issue) {
      const issueText = JSON.stringify(context.issue)
      totalSize += issueText.length
      totalTokens += estimateTokens(issueText)
      itemCount += 1
    }

    return { totalSize, totalTokens, itemCount }
  }, [context])

  const hasContext = stats.itemCount > 0

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  const handleToggleCollapse = useCallback(() => {
    onToggleCollapse?.()
  }, [onToggleCollapse])

  return (
    <div className={containerStyles}>
      {/* Header */}
      <button
        type="button"
        className={headerStyles}
        onClick={handleToggleCollapse}
        aria-expanded={!isCollapsed}
        aria-label="Toggle context panel"
      >
        <span className={headerLeftStyles}>
          <ContextIcon />
          Context
        </span>
        <span className={headerRightStyles}>
          {hasContext && (
            <>
              <span className={badgeStyles}>
                {stats.itemCount} {stats.itemCount === 1 ? 'item' : 'items'}
              </span>
              <span className={badgeStyles}>~{formatNumber(stats.totalTokens)} tokens</span>
            </>
          )}
          <ChevronDownIcon rotated={isCollapsed} />
        </span>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className={contentStyles}>
          {!hasContext ? (
            <div className={emptyStateStyles}>
              <ContextIcon />
              <span className={css({ fontSize: 'sm' })}>No context selected</span>
              <span className={css({ fontSize: 'xs' })}>
                Select files, PRs, or issues to add context to your conversation
              </span>
            </div>
          ) : (
            <>
              {/* Repository Section */}
              {context.repository && (
                <Section
                  title="Repository"
                  icon={<RepoIcon />}
                  count={1}
                  isExpanded={expandedSections.repository}
                  onToggle={() => toggleSection('repository')}
                >
                  <div className={itemStyles}>
                    <div className={itemLeftStyles}>
                      <span className={css({ color: 'rgb(251, 191, 36)' })}>
                        <RepoIcon />
                      </span>
                      <div className={itemTextStyles}>
                        <span className={itemNameStyles}>{context.repository.full_name}</span>
                        <span className={itemMetaStyles}>
                          {context.repository.language} · {context.repository.stargazers_count}{' '}
                          stars
                        </span>
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Files Section */}
              {context.files.length > 0 && (
                <Section
                  title="Files"
                  icon={<FileIcon />}
                  count={context.files.length}
                  isExpanded={expandedSections.files}
                  onToggle={() => toggleSection('files')}
                >
                  {context.files.map((file) => (
                    <FileItem key={file.path} file={file} onRemove={onRemoveFile} />
                  ))}
                </Section>
              )}

              {/* Pull Request Section */}
              {context.pullRequest && (
                <Section
                  title="Pull Request"
                  icon={<PullRequestIcon />}
                  count={1}
                  isExpanded={expandedSections.pullRequest}
                  onToggle={() => toggleSection('pullRequest')}
                >
                  <PRItem pr={context.pullRequest} onRemove={onRemovePR} />
                </Section>
              )}

              {/* Issue Section */}
              {context.issue && (
                <Section
                  title="Issue"
                  icon={<IssueIcon />}
                  count={1}
                  isExpanded={expandedSections.issue}
                  onToggle={() => toggleSection('issue')}
                >
                  <IssueItem issue={context.issue} onRemove={onRemoveIssue} />
                </Section>
              )}

              {/* Stats Row */}
              <div className={statsRowStyles}>
                <div className={statItemStyles}>
                  <span className={statValueStyles}>{stats.itemCount}</span>
                  <span className={statLabelStyles}>Items</span>
                </div>
                <div className={statItemStyles}>
                  <span className={statValueStyles}>{formatSize(stats.totalSize)}</span>
                  <span className={statLabelStyles}>Size</span>
                </div>
                <div className={statItemStyles}>
                  <span className={statValueStyles}>~{formatNumber(stats.totalTokens)}</span>
                  <span className={statLabelStyles}>Tokens</span>
                </div>
                <button
                  type="button"
                  className={clearAllButtonStyles}
                  onClick={onClearAll}
                  aria-label="Clear all context"
                >
                  <TrashIcon />
                  Clear All
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ContextPanel
