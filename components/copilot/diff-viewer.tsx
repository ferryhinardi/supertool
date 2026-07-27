'use client'

import { useCallback, useMemo, useState } from 'react'
import type { PRFile } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface DiffViewerProps {
  files: PRFile[]
  onFileSelect?: (file: PRFile) => void
  selectedFile?: string | null
  isLoading?: boolean
  error?: string | null
  maxHeight?: string
  showStats?: boolean
}

interface ParsedHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: ParsedLine[]
}

interface ParsedLine {
  type: 'addition' | 'deletion' | 'context' | 'header'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

function getParsedLineKey(line: ParsedLine, index: number) {
  if (line.type === 'header') {
    return `header-${line.content}-${index}`
  }

  return `${line.type}-${line.oldLineNumber ?? 'none'}-${line.newLineNumber ?? 'none'}-${line.content}`
}

type FileStatusFilter = 'all' | 'added' | 'modified' | 'removed' | 'renamed'

// ============================================
// Icons
// ============================================

function ChevronDownIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '4',
        h: '4',
        flexShrink: 0,
        transition: 'transform 0.15s',
        transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
      })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function FileAddedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011ZM8 8.75a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0V12.5h-1.5a.75.75 0 0 1 0-1.5h1.5V9.5A.75.75 0 0 1 8 8.75Z" />
    </svg>
  )
}

function FileRemovedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011ZM5.75 10.5a.75.75 0 0 1 0-1.5h4.5a.75.75 0 0 1 0 1.5h-4.5Z" />
    </svg>
  )
}

function FileModifiedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011ZM8 7a.75.75 0 0 1 .75.75v.69l.49-.49a.75.75 0 0 1 1.06 1.06l-1.72 1.72a.75.75 0 0 1-1.06 0l-1.72-1.72a.75.75 0 1 1 1.06-1.06l.49.49V7.75A.75.75 0 0 1 8 7Zm-1.75 4.25a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
    </svg>
  )
}

function FileRenamedIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011ZM5.5 8.75a.75.75 0 0 0 0 1.5h2.19l-.72.72a.75.75 0 0 0 1.06 1.06l2-2a.75.75 0 0 0 0-1.06l-2-2a.75.75 0 0 0-1.06 1.06l.72.72H5.5Z" />
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

function EmptyDiffIcon() {
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

// ============================================
// Helper Functions
// ============================================

function getFileStatusInfo(status: PRFile['status']): {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  switch (status) {
    case 'added':
      return {
        icon: <FileAddedIcon />,
        label: 'Added',
        color: 'rgb(34, 197, 94)',
        bgColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
      }
    case 'removed':
      return {
        icon: <FileRemovedIcon />,
        label: 'Removed',
        color: 'rgb(239, 68, 68)',
        bgColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }
    case 'renamed':
    case 'copied':
      return {
        icon: <FileRenamedIcon />,
        label: status === 'renamed' ? 'Renamed' : 'Copied',
        color: 'rgb(168, 85, 247)',
        bgColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgba(168, 85, 247, 0.3)',
      }
    default:
      return {
        icon: <FileModifiedIcon />,
        label: 'Modified',
        color: 'rgb(251, 191, 36)',
        bgColor: 'rgba(251, 191, 36, 0.2)',
        borderColor: 'rgba(251, 191, 36, 0.3)',
      }
  }
}

function getFileName(path: string): string {
  return path.split('/').pop() || path
}

function getFileDirectory(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

function parseDiffPatch(patch: string | undefined): ParsedHunk[] {
  if (!patch) return []

  const hunks: ParsedHunk[] = []
  const lines = patch.split('\n')

  let currentHunk: ParsedHunk | null = null
  let oldLineNumber = 0
  let newLineNumber = 0

  for (const line of lines) {
    // Parse hunk header: @@ -oldStart,oldLines +newStart,newLines @@
    const hunkMatch = line.match(/^@@\s*-(\d+)(?:,(\d+))?\s*\+(\d+)(?:,(\d+))?\s*@@(.*)$/)

    if (hunkMatch) {
      if (currentHunk) {
        hunks.push(currentHunk)
      }

      const oldStart = parseInt(hunkMatch[1], 10)
      const oldLines = hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1
      const newStart = parseInt(hunkMatch[3], 10)
      const newLines = hunkMatch[4] ? parseInt(hunkMatch[4], 10) : 1

      oldLineNumber = oldStart
      newLineNumber = newStart

      currentHunk = {
        oldStart,
        oldLines,
        newStart,
        newLines,
        lines: [
          {
            type: 'header',
            content: line,
          },
        ],
      }
      continue
    }

    if (!currentHunk) continue

    if (line.startsWith('+')) {
      currentHunk.lines.push({
        type: 'addition',
        content: line.substring(1),
        newLineNumber: newLineNumber++,
      })
    } else if (line.startsWith('-')) {
      currentHunk.lines.push({
        type: 'deletion',
        content: line.substring(1),
        oldLineNumber: oldLineNumber++,
      })
    } else if (line.startsWith(' ') || line === '') {
      currentHunk.lines.push({
        type: 'context',
        content: line.substring(1),
        oldLineNumber: oldLineNumber++,
        newLineNumber: newLineNumber++,
      })
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk)
  }

  return hunks
}

// ============================================
// Sub-components
// ============================================

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

interface DiffLineProps {
  line: ParsedLine
}

function DiffLine({ line }: DiffLineProps) {
  if (line.type === 'header') {
    return (
      <div
        className={css({
          display: 'flex',
          bg: 'rgba(59, 130, 246, 0.1)',
          color: 'rgba(147, 197, 253, 0.8)',
          fontFamily: 'mono',
          fontSize: 'xs',
          py: '1',
          px: '2',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        })}
      >
        <span className={css({ w: '20', textAlign: 'center', flexShrink: 0 })}>...</span>
        <span className={css({ flex: '1', pl: '2' })}>{line.content}</span>
      </div>
    )
  }

  const lineStyles = {
    addition: {
      bg: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      numBg: 'rgba(34, 197, 94, 0.2)',
      textColor: 'rgba(255, 255, 255, 0.9)',
      prefix: '+',
      prefixColor: 'rgb(34, 197, 94)',
    },
    deletion: {
      bg: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      numBg: 'rgba(239, 68, 68, 0.2)',
      textColor: 'rgba(255, 255, 255, 0.9)',
      prefix: '-',
      prefixColor: 'rgb(239, 68, 68)',
    },
    context: {
      bg: 'transparent',
      borderColor: 'transparent',
      numBg: 'rgba(255, 255, 255, 0.05)',
      textColor: 'rgba(255, 255, 255, 0.7)',
      prefix: ' ',
      prefixColor: 'transparent',
    },
  }

  const style = lineStyles[line.type] || lineStyles.context

  return (
    <div
      className={css({
        display: 'flex',
        fontFamily: 'mono',
        fontSize: 'xs',
        lineHeight: 'tight',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.03)',
        },
      })}
      style={{ backgroundColor: style.bg }}
    >
      {/* Old line number */}
      <span
        className={css({
          w: '10',
          textAlign: 'right',
          pr: '2',
          py: '0.5',
          color: 'rgba(255, 255, 255, 0.3)',
          userSelect: 'none',
          flexShrink: 0,
        })}
        style={{ backgroundColor: style.numBg }}
      >
        {line.oldLineNumber || ''}
      </span>

      {/* New line number */}
      <span
        className={css({
          w: '10',
          textAlign: 'right',
          pr: '2',
          py: '0.5',
          color: 'rgba(255, 255, 255, 0.3)',
          userSelect: 'none',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        })}
        style={{ backgroundColor: style.numBg }}
      >
        {line.newLineNumber || ''}
      </span>

      {/* Prefix (+/-/space) */}
      <span
        className={css({
          w: '4',
          textAlign: 'center',
          py: '0.5',
          fontWeight: 'bold',
          flexShrink: 0,
        })}
        style={{ color: style.prefixColor }}
      >
        {style.prefix}
      </span>

      {/* Content */}
      <span
        className={css({
          flex: '1',
          py: '0.5',
          pr: '2',
          whiteSpace: 'pre',
          overflowX: 'auto',
        })}
        style={{ color: style.textColor }}
      >
        {line.content || ' '}
      </span>
    </div>
  )
}

interface DiffFileProps {
  file: PRFile
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
}

function DiffFile({ file, isExpanded, isSelected, onToggle, onSelect }: DiffFileProps) {
  const statusInfo = getFileStatusInfo(file.status)
  const hunks = useMemo(() => parseDiffPatch(file.patch), [file.patch])
  const fileName = getFileName(file.filename)
  const directory = getFileDirectory(file.filename)

  return (
    <div
      className={css({
        rounded: 'lg',
        overflow: 'hidden',
        border: isSelected
          ? '1px solid rgba(59, 130, 246, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'border-color 0.15s',
      })}
    >
      {/* File Header */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          p: '3',
          bg: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        })}
      >
        {/* Expand/Collapse Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={css({
            color: 'rgba(255, 255, 255, 0.5)',
            p: '1',
            rounded: 'md',
            _hover: {
              bg: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
            },
          })}
          aria-label={isExpanded ? 'Collapse diff' : 'Expand diff'}
        >
          <ChevronDownIcon expanded={isExpanded} />
        </button>

        {/* Status Icon */}
        <button
          type="button"
          onClick={onSelect}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            flex: '1',
            minW: '0',
            textAlign: 'left',
            cursor: 'pointer',
            rounded: 'md',
            bg: 'transparent',
            border: 'none',
            p: '0',
            _hover: {
              bg: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.4)',
            },
          })}
          aria-pressed={isSelected}
        >
          <span style={{ color: statusInfo.color }}>{statusInfo.icon}</span>

          {/* Filename */}
          <div className={css({ flex: '1', minW: '0' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
              })}
            >
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: isSelected ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.9)',
                  truncate: true,
                })}
              >
                {fileName}
              </span>
              {file.previous_filename && (
                <span
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.4)',
                  })}
                >
                  ← {getFileName(file.previous_filename)}
                </span>
              )}
            </div>
            {directory && (
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'rgba(255, 255, 255, 0.4)',
                  truncate: true,
                })}
              >
                {directory}
              </span>
            )}
          </div>

          {/* Stats */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              flexShrink: 0,
            })}
          >
            <span
              className={css({
                fontSize: 'xs',
                color: 'rgb(34, 197, 94)',
                fontWeight: 'medium',
              })}
            >
              +{file.additions}
            </span>
            <span
              className={css({
                fontSize: 'xs',
                color: 'rgb(239, 68, 68)',
                fontWeight: 'medium',
              })}
            >
              -{file.deletions}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={css({
              px: '2',
              py: '0.5',
              rounded: 'full',
              fontSize: 'xs',
              fontWeight: 'medium',
              flexShrink: 0,
            })}
            style={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.borderColor}`,
            }}
          >
            {statusInfo.label}
          </span>
        </button>
      </div>

      {/* Diff Content */}
      {isExpanded && (
        <div
          className={css({
            bg: 'rgba(0, 0, 0, 0.2)',
            overflowX: 'auto',
          })}
        >
          {hunks.length > 0 ? (
            hunks.map((hunk) => (
              <div key={`${hunk.oldStart}-${hunk.newStart}`}>
                {hunk.lines.map((line, lineIndex) => (
                  <DiffLine key={getParsedLineKey(line, lineIndex)} line={line} />
                ))}
              </div>
            ))
          ) : (
            <div
              className={css({
                py: '8',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 'sm',
              })}
            >
              {file.status === 'removed'
                ? 'File was deleted'
                : file.status === 'added'
                  ? 'New file (binary or no content)'
                  : 'No diff available'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function DiffViewer({
  files,
  onFileSelect,
  selectedFile = null,
  isLoading = false,
  error = null,
  maxHeight = '600px',
  showStats = true,
}: DiffViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FileStatusFilter>('all')
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)

  // Calculate counts for each filter
  const counts = useMemo(() => {
    const all = files.length
    const added = files.filter((f) => f.status === 'added').length
    const modified = files.filter((f) => f.status === 'modified' || f.status === 'changed').length
    const removed = files.filter((f) => f.status === 'removed').length
    const renamed = files.filter((f) => f.status === 'renamed' || f.status === 'copied').length

    return { all, added, modified, removed, renamed }
  }, [files])

  // Calculate total stats
  const totalStats = useMemo(() => {
    return files.reduce(
      (acc, file) => ({
        additions: acc.additions + file.additions,
        deletions: acc.deletions + file.deletions,
        files: acc.files + 1,
      }),
      { additions: 0, deletions: 0, files: 0 }
    )
  }, [files])

  // Filter files based on status and search query
  const filteredFiles = useMemo(() => {
    let filtered = [...files]

    // Apply status filter
    if (statusFilter === 'added') {
      filtered = filtered.filter((f) => f.status === 'added')
    } else if (statusFilter === 'modified') {
      filtered = filtered.filter((f) => f.status === 'modified' || f.status === 'changed')
    } else if (statusFilter === 'removed') {
      filtered = filtered.filter((f) => f.status === 'removed')
    } else if (statusFilter === 'renamed') {
      filtered = filtered.filter((f) => f.status === 'renamed' || f.status === 'copied')
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          f.filename.toLowerCase().includes(query) ||
          f.previous_filename?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [files, statusFilter, searchQuery])

  const handleToggleExpand = useCallback((filename: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(filename)) {
        next.delete(filename)
      } else {
        next.add(filename)
      }
      return next
    })
  }, [])

  const handleExpandAll = useCallback(() => {
    if (expandAll) {
      setExpandedFiles(new Set())
    } else {
      setExpandedFiles(new Set(filteredFiles.map((f) => f.filename)))
    }
    setExpandAll(!expandAll)
  }, [expandAll, filteredFiles])

  const handleFileSelect = useCallback(
    (file: PRFile) => {
      onFileSelect?.(file)
    },
    [onFileSelect]
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
          Loading diff...
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
  if (files.length === 0) {
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
          <EmptyDiffIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgba(255, 255, 255, 0.5)',
          })}
        >
          No files changed
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
      {/* Header with Stats */}
      {showStats && (
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: '4',
            py: '3',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(0, 0, 0, 0.2)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4',
            })}
          >
            <span
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'rgba(255, 255, 255, 0.9)',
              })}
            >
              {totalStats.files} file{totalStats.files !== 1 ? 's' : ''} changed
            </span>
            <span
              className={css({
                fontSize: 'sm',
                color: 'rgb(34, 197, 94)',
                fontWeight: 'medium',
              })}
            >
              +{totalStats.additions}
            </span>
            <span
              className={css({
                fontSize: 'sm',
                color: 'rgb(239, 68, 68)',
                fontWeight: 'medium',
              })}
            >
              -{totalStats.deletions}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExpandAll}
            className={css({
              px: '3',
              py: '1.5',
              rounded: 'lg',
              fontSize: 'xs',
              fontWeight: 'medium',
              color: 'rgba(255, 255, 255, 0.7)',
              bg: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              _hover: {
                bg: 'rgba(255, 255, 255, 0.15)',
                color: 'rgba(255, 255, 255, 0.9)',
              },
            })}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      )}

      {/* Search and Filters */}
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
            placeholder="Search files..."
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
            isActive={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <FilterTab
            label="Added"
            count={counts.added}
            isActive={statusFilter === 'added'}
            onClick={() => setStatusFilter('added')}
          />
          <FilterTab
            label="Modified"
            count={counts.modified}
            isActive={statusFilter === 'modified'}
            onClick={() => setStatusFilter('modified')}
          />
          <FilterTab
            label="Removed"
            count={counts.removed}
            isActive={statusFilter === 'removed'}
            onClick={() => setStatusFilter('removed')}
          />
          {counts.renamed > 0 && (
            <FilterTab
              label="Renamed"
              count={counts.renamed}
              isActive={statusFilter === 'renamed'}
              onClick={() => setStatusFilter('renamed')}
            />
          )}
        </div>
      </div>

      {/* File List with Diffs */}
      <div
        className={css({
          overflowY: 'auto',
          p: '3',
        })}
        style={{ maxHeight }}
      >
        {filteredFiles.length > 0 ? (
          <div className={css({ display: 'flex', flexDir: 'column', gap: '3' })}>
            {filteredFiles.map((file) => (
              <DiffFile
                key={file.sha + file.filename}
                file={file}
                isExpanded={expandedFiles.has(file.filename) || expandAll}
                isSelected={selectedFile === file.filename}
                onToggle={() => handleToggleExpand(file.filename)}
                onSelect={() => handleFileSelect(file)}
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
              No files matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
