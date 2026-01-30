'use client'

import { useCallback, useMemo, useState } from 'react'
import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'
import { formatFileSize, getCategoryForExtension } from '@/lib/services/local-files'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface LocalFileBrowserProps {
  /** Files loaded from user's local system */
  files: LocalFileInfo[]
  /** Callback when files are selected */
  onFilesSelect?: (files: LocalFileInfo[]) => void
  /** Callback when files are dropped/uploaded */
  onFilesUpload?: (files: LocalFileInfo[]) => void
  /** Callback when raw File objects are uploaded (for content access) */
  onRawFilesUpload?: (files: File[]) => void
  /** Analysis results if available */
  analysisResult?: LocalFileAnalysisResult | null
  /** Whether the component is in loading state */
  isLoading?: boolean
  /** Error message if any */
  error?: string | null
  /** Maximum height for the file tree */
  maxHeight?: string
  /** Whether multiple selection is allowed */
  multiSelect?: boolean
  /** Whether to show analysis summary */
  showAnalysis?: boolean
}

interface LocalTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  category: string
  isDirectory: boolean
  children: LocalTreeNode[]
  file: LocalFileInfo
}

// ============================================
// Icons
// ============================================

function FolderIcon({ isOpen }: { isOpen?: boolean }) {
  return isOpen ? (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v1H3v9a2 2 0 002 2h14a2 2 0 002-2v-5H5v7z" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" />
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

function ImageIcon() {
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
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function CodeIcon() {
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
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  )
}

function DocumentIcon() {
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
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  )
}

function VideoIcon() {
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
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

function AudioIcon() {
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
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  )
}

function ArchiveIcon() {
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
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  )
}

function ChevronRightIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '3',
        h: '3',
        flexShrink: 0,
        transition: 'transform 0.2s',
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
      })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

function UploadIcon() {
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
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

// ============================================
// Helper Functions
// ============================================

function getCategoryIcon(category: string) {
  switch (category) {
    case 'images':
      return <ImageIcon />
    case 'code':
      return <CodeIcon />
    case 'documents':
      return <DocumentIcon />
    case 'videos':
      return <VideoIcon />
    case 'audio':
      return <AudioIcon />
    case 'archives':
      return <ArchiveIcon />
    default:
      return <FileIcon />
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'images':
      return 'rgb(167, 139, 250)' // Purple
    case 'code':
      return 'rgb(74, 222, 128)' // Green
    case 'documents':
      return 'rgb(96, 165, 250)' // Blue
    case 'videos':
      return 'rgb(251, 146, 60)' // Orange
    case 'audio':
      return 'rgb(248, 113, 113)' // Red
    case 'archives':
      return 'rgb(251, 191, 36)' // Yellow
    default:
      return 'rgba(255, 255, 255, 0.6)'
  }
}

function buildLocalTreeStructure(files: LocalFileInfo[]): LocalTreeNode[] {
  const root: LocalTreeNode[] = []
  const pathMap = new Map<string, LocalTreeNode>()

  // Sort files: directories first, then by name
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  for (const file of sortedFiles) {
    const path = file.relativePath || file.path
    const parts = path.split('/').filter(Boolean)
    const name = parts[parts.length - 1] || file.name

    const node: LocalTreeNode = {
      name,
      path,
      type: file.isDirectory ? 'directory' : 'file',
      size: file.size,
      category: getCategoryForExtension(file.extension || ''),
      isDirectory: file.isDirectory,
      children: [],
      file,
    }

    if (parts.length <= 1) {
      // Root level item
      root.push(node)
    } else {
      // Nested item - find parent directory
      const parentPath = parts.slice(0, -1).join('/')
      const parent = pathMap.get(parentPath)
      if (parent) {
        parent.children.push(node)
      } else {
        // Parent doesn't exist, add to root
        root.push(node)
      }
    }

    pathMap.set(path, node)
  }

  return root
}

function filterLocalTree(nodes: LocalTreeNode[], query: string): LocalTreeNode[] {
  if (!query.trim()) return nodes

  const lowerQuery = query.toLowerCase()

  const filterNodes = (items: LocalTreeNode[]): LocalTreeNode[] => {
    const result: LocalTreeNode[] = []

    for (const node of items) {
      const nameMatches = node.name.toLowerCase().includes(lowerQuery)
      const categoryMatches = node.category.toLowerCase().includes(lowerQuery)
      const filteredChildren = filterNodes(node.children)

      if (nameMatches || categoryMatches || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        })
      }
    }

    return result
  }

  return filterNodes(nodes)
}

// ============================================
// Sub-components
// ============================================

interface LocalTreeNodeItemProps {
  node: LocalTreeNode
  depth: number
  expandedPaths: Set<string>
  selectedPaths: Set<string>
  onToggle: (path: string) => void
  onSelect: (node: LocalTreeNode) => void
  multiSelect: boolean
}

function LocalTreeNodeItem({
  node,
  depth,
  expandedPaths,
  selectedPaths,
  onToggle,
  onSelect,
  multiSelect,
}: LocalTreeNodeItemProps) {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedPaths.has(node.path)

  const handleClick = useCallback(() => {
    if (node.isDirectory) {
      onToggle(node.path)
    } else {
      onSelect(node)
    }
  }, [node, onToggle, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(node)
    },
    [node, onSelect]
  )

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          py: '1.5',
          px: '2',
          rounded: 'md',
          cursor: 'pointer',
          transition: 'all 0.15s',
          bg: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
          border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
          _hover: {
            bg: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
          },
        })}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        aria-expanded={node.isDirectory ? isExpanded : undefined}
      >
        {/* Checkbox for multi-select */}
        {multiSelect && !node.isDirectory && (
          <span
            role="checkbox"
            tabIndex={0}
            aria-checked={isSelected}
            onClick={handleCheckboxClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCheckboxClick(e as unknown as React.MouseEvent)
              }
            }}
            className={css({
              w: '4',
              h: '4',
              rounded: 'sm',
              border: '1px solid',
              borderColor: isSelected ? 'rgb(59, 130, 246)' : 'rgba(255, 255, 255, 0.3)',
              bg: isSelected ? 'rgb(59, 130, 246)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
              cursor: 'pointer',
            })}
          >
            {isSelected && (
              <span className={css({ color: 'white' })}>
                <CheckIcon />
              </span>
            )}
          </span>
        )}

        {/* Expand/Collapse Icon for Directories */}
        {node.isDirectory ? (
          <span className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
            <ChevronRightIcon isExpanded={isExpanded} />
          </span>
        ) : (
          !multiSelect && <span className={css({ w: '3' })} />
        )}

        {/* File/Folder Icon */}
        <span
          className={css({
            color: node.isDirectory ? 'rgb(251, 191, 36)' : getCategoryColor(node.category),
          })}
        >
          {node.isDirectory ? <FolderIcon isOpen={isExpanded} /> : getCategoryIcon(node.category)}
        </span>

        {/* Name */}
        <span
          className={css({
            flex: '1',
            fontSize: 'sm',
            color: isSelected ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.9)',
            textAlign: 'left',
            truncate: true,
          })}
        >
          {node.name}
        </span>

        {/* Category Badge */}
        {!node.isDirectory && (
          <span
            className={css({
              fontSize: 'xs',
              px: '1.5',
              py: '0.5',
              rounded: 'full',
              bg: 'rgba(255, 255, 255, 0.1)',
              color: getCategoryColor(node.category),
              flexShrink: 0,
            })}
          >
            {node.category}
          </span>
        )}

        {/* File Size */}
        {!node.isDirectory && node.size > 0 && (
          <span
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.4)',
              flexShrink: 0,
            })}
          >
            {formatFileSize(node.size)}
          </span>
        )}
      </button>

      {/* Children */}
      {node.isDirectory && isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <LocalTreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedPaths={selectedPaths}
              onToggle={onToggle}
              onSelect={onSelect}
              multiSelect={multiSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface AnalysisSummaryProps {
  result: LocalFileAnalysisResult
}

function AnalysisSummary({ result }: AnalysisSummaryProps) {
  return (
    <div
      className={css({
        p: '3',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bg: 'rgba(59, 130, 246, 0.05)',
      })}
    >
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4',
          mb: '3',
        })}
      >
        <div className={css({ textAlign: 'center' })}>
          <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'rgb(147, 197, 253)' })}>
            {result.totalFiles}
          </p>
          <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.5)' })}>Files</p>
        </div>
        <div className={css({ textAlign: 'center' })}>
          <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'rgb(251, 191, 36)' })}>
            {result.totalDirectories}
          </p>
          <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.5)' })}>Folders</p>
        </div>
        <div className={css({ textAlign: 'center' })}>
          <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'rgb(167, 139, 250)' })}>
            {Object.keys(result.byCategory).length}
          </p>
          <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.5)' })}>Categories</p>
        </div>
        <div className={css({ textAlign: 'center' })}>
          <p className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'rgb(74, 222, 128)' })}>
            {formatFileSize(result.totalSize)}
          </p>
          <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.5)' })}>Total Size</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
        {Object.entries(result.byCategory).map(([category, data]) => (
          <span
            key={category}
            className={css({
              fontSize: 'xs',
              px: '2',
              py: '1',
              rounded: 'full',
              bg: 'rgba(255, 255, 255, 0.1)',
              color: getCategoryColor(category),
            })}
          >
            {category}: {data.count}
          </span>
        ))}
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className={css({ mt: '3' })}>
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className={css({
                fontSize: 'xs',
                color: 'rgb(251, 191, 36)',
                mt: '1',
              })}
            >
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function LocalFileBrowser({
  files,
  onFilesSelect,
  onFilesUpload,
  onRawFilesUpload,
  analysisResult,
  isLoading = false,
  error = null,
  maxHeight = '400px',
  multiSelect = true,
  showAnalysis = true,
}: LocalFileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [isDragOver, setIsDragOver] = useState(false)

  // Build tree structure from flat file list
  const treeNodes = useMemo(() => buildLocalTreeStructure(files), [files])

  // Filter tree based on search query
  const filteredNodes = useMemo(
    () => filterLocalTree(treeNodes, searchQuery),
    [treeNodes, searchQuery]
  )

  // Auto-expand when searching
  useMemo(() => {
    if (searchQuery.trim()) {
      const getAllPaths = (nodes: LocalTreeNode[]): string[] => {
        const paths: string[] = []
        for (const node of nodes) {
          if (node.isDirectory) {
            paths.push(node.path)
            paths.push(...getAllPaths(node.children))
          }
        }
        return paths
      }
      setExpandedPaths(new Set(getAllPaths(filteredNodes)))
    }
  }, [searchQuery, filteredNodes])

  const handleToggle = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (node: LocalTreeNode) => {
      if (node.isDirectory) return

      setSelectedPaths((prev) => {
        const next = new Set(prev)
        if (multiSelect) {
          if (next.has(node.path)) {
            next.delete(node.path)
          } else {
            next.add(node.path)
          }
        } else {
          next.clear()
          next.add(node.path)
        }
        return next
      })

      // Notify parent of selection change
      if (onFilesSelect) {
        const selectedFiles = files.filter((f) =>
          multiSelect
            ? selectedPaths.has(f.relativePath || f.path) ||
              f.relativePath === node.path ||
              f.path === node.path
            : f.relativePath === node.path || f.path === node.path
        )
        onFilesSelect(selectedFiles)
      }
    },
    [files, multiSelect, onFilesSelect, selectedPaths]
  )

  const handleExpandAll = useCallback(() => {
    const getAllPaths = (nodes: LocalTreeNode[]): string[] => {
      const paths: string[] = []
      for (const node of nodes) {
        if (node.isDirectory) {
          paths.push(node.path)
          paths.push(...getAllPaths(node.children))
        }
      }
      return paths
    }
    setExpandedPaths(new Set(getAllPaths(treeNodes)))
  }, [treeNodes])

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set())
  }, [])

  const handleSelectAll = useCallback(() => {
    const allFilePaths = files.filter((f) => !f.isDirectory).map((f) => f.relativePath || f.path)
    setSelectedPaths(new Set(allFilePaths))
    if (onFilesSelect) {
      onFilesSelect(files.filter((f) => !f.isDirectory))
    }
  }, [files, onFilesSelect])

  const handleClearSelection = useCallback(() => {
    setSelectedPaths(new Set())
    if (onFilesSelect) {
      onFilesSelect([])
    }
  }, [onFilesSelect])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const items = e.dataTransfer.items
      if (!items || !onFilesUpload) return

      const fileInfos: LocalFileInfo[] = []
      const rawFiles: File[] = []

      // Process dropped items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) {
            const extension = file.name.split('.').pop() || ''
            fileInfos.push({
              path: file.name,
              name: file.name,
              type: file.type || 'application/octet-stream',
              size: file.size,
              extension,
              modifiedAt: file.lastModified || Date.now(),
              isDirectory: false,
              relativePath: file.name,
              lastModified: file.lastModified ? new Date(file.lastModified) : undefined,
            })
            rawFiles.push(file)
          }
        }
      }

      if (fileInfos.length > 0) {
        onFilesUpload(fileInfos)
        onRawFilesUpload?.(rawFiles)
      }
    },
    [onFilesUpload, onRawFilesUpload]
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
        <p className={css({ fontSize: 'sm', color: 'rgba(255, 255, 255, 0.5)' })}>
          Analyzing files...
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
        <p className={css({ fontSize: 'sm', color: 'rgb(252, 165, 165)' })}>{error}</p>
      </div>
    )
  }

  // Empty state / Drop zone
  if (files.length === 0) {
    return (
      <div
        role="region"
        aria-label="File drop zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={css({
          display: 'flex',
          flexDir: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: '12',
          gap: '3',
          bg: isDragOver ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.2)',
          rounded: 'xl',
          border: isDragOver
            ? '2px dashed rgba(59, 130, 246, 0.5)'
            : '2px dashed rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        })}
      >
        <div
          className={css({
            color: isDragOver ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.3)',
          })}
        >
          <UploadIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: isDragOver ? 'rgb(147, 197, 253)' : 'rgba(255, 255, 255, 0.5)',
          })}
        >
          {isDragOver ? 'Drop files here' : 'Drag and drop files or folders here'}
        </p>
        <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.3)' })}>
          Or use the file picker below
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
      {/* Analysis Summary */}
      {showAnalysis && analysisResult && <AnalysisSummary result={analysisResult} />}

      {/* Header with Search */}
      <div className={css({ p: '3', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' })}>
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
            placeholder="Search files by name or category..."
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

        {/* Action Buttons */}
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mt: '2' })}>
          <button
            type="button"
            onClick={handleExpandAll}
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              _hover: { color: 'rgba(255, 255, 255, 0.8)' },
            })}
          >
            Expand All
          </button>
          <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              _hover: { color: 'rgba(255, 255, 255, 0.8)' },
            })}
          >
            Collapse All
          </button>
          {multiSelect && (
            <>
              <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className={css({
                  fontSize: 'xs',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  _hover: { color: 'rgba(255, 255, 255, 0.8)' },
                })}
              >
                Select All
              </button>
              <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className={css({
                  fontSize: 'xs',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  _hover: { color: 'rgba(255, 255, 255, 0.8)' },
                })}
              >
                Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className={css({ overflowY: 'auto', p: '2' })} style={{ maxHeight }}>
        {filteredNodes.length > 0 ? (
          filteredNodes.map((node) => (
            <LocalTreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              expandedPaths={expandedPaths}
              selectedPaths={selectedPaths}
              onToggle={handleToggle}
              onSelect={handleSelect}
              multiSelect={multiSelect}
            />
          ))
        ) : (
          <div className={css({ py: '8', textAlign: 'center' })}>
            <p className={css({ fontSize: 'sm', color: 'rgba(255, 255, 255, 0.5)' })}>
              No files matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Footer - Selected Count */}
      {selectedPaths.size > 0 && (
        <div
          className={css({
            px: '3',
            py: '2',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            bg: 'rgba(59, 130, 246, 0.1)',
          })}
        >
          <p className={css({ fontSize: 'xs', color: 'rgb(147, 197, 253)' })}>
            {selectedPaths.size} file{selectedPaths.size !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
