'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FileTree, FileTreeItem } from '@/lib/services/github/types'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export interface FileBrowserProps {
  fileTree: FileTree | null
  onFileSelect: (path: string) => void
  selectedFiles?: string[]
  isLoading?: boolean
  error?: string | null
  maxHeight?: string
}

interface TreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  sha: string
  children: TreeNode[]
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

function CodeFileIcon() {
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

function ImageFileIcon() {
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

function ConfigFileIcon() {
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
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

function EmptyFolderIcon() {
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

// ============================================
// Helper Functions
// ============================================

const CODE_EXTENSIONS = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'rb',
  'go',
  'rs',
  'java',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'php',
  'swift',
  'kt',
  'scala',
  'vue',
  'svelte',
]

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp']

const CONFIG_EXTENSIONS = ['json', 'yaml', 'yml', 'toml', 'xml', 'ini', 'env', 'config']

const CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'tailwind.config.js',
  'next.config.js',
  'vite.config.ts',
  '.eslintrc',
  '.prettierrc',
  'Dockerfile',
  'docker-compose.yml',
  '.gitignore',
  'Makefile',
]

function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function getFileIcon(filename: string) {
  const ext = getFileExtension(filename)
  const lowerFilename = filename.toLowerCase()

  if (CONFIG_FILES.some((f) => lowerFilename === f.toLowerCase())) {
    return <ConfigFileIcon />
  }

  if (CODE_EXTENSIONS.includes(ext)) {
    return <CodeFileIcon />
  }

  if (IMAGE_EXTENSIONS.includes(ext)) {
    return <ImageFileIcon />
  }

  if (CONFIG_EXTENSIONS.includes(ext)) {
    return <ConfigFileIcon />
  }

  return <FileIcon />
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return ''

  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildTreeStructure(items: FileTreeItem[]): TreeNode[] {
  const root: TreeNode[] = []
  const pathMap = new Map<string, TreeNode>()

  // Sort items: directories first, then files, both alphabetically
  const sortedItems = [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'tree' ? -1 : 1
    }
    return a.path.localeCompare(b.path)
  })

  for (const item of sortedItems) {
    const parts = item.path.split('/')
    const name = parts[parts.length - 1]

    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type === 'tree' ? 'directory' : 'file',
      size: item.size,
      sha: item.sha,
      children: [],
    }

    if (parts.length === 1) {
      // Root level item
      root.push(node)
    } else {
      // Nested item - find or create parent directories
      const parentPath = parts.slice(0, -1).join('/')
      const parent = pathMap.get(parentPath)
      if (parent) {
        parent.children.push(node)
      }
    }

    pathMap.set(item.path, node)
  }

  // Sort children: directories first, then alphabetically
  const sortChildren = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })
      .map((node) => ({
        ...node,
        children: sortChildren(node.children),
      }))
  }

  return sortChildren(root)
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes

  const lowerQuery = query.toLowerCase()

  const filterNodes = (items: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = []

    for (const node of items) {
      const nameMatches = node.name.toLowerCase().includes(lowerQuery)
      const filteredChildren = filterNodes(node.children)

      if (nameMatches || filteredChildren.length > 0) {
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

interface TreeNodeItemProps {
  node: TreeNode
  depth: number
  expandedPaths: Set<string>
  selectedFiles: string[]
  onToggle: (path: string) => void
  onSelect: (path: string) => void
}

function TreeNodeItem({
  node,
  depth,
  expandedPaths,
  selectedFiles,
  onToggle,
  onSelect,
}: TreeNodeItemProps) {
  const isExpanded = expandedPaths.has(node.path)
  const isSelected = selectedFiles.includes(node.path)
  const isDirectory = node.type === 'directory'

  const handleClick = useCallback(() => {
    if (isDirectory) {
      onToggle(node.path)
    } else {
      onSelect(node.path)
    }
  }, [isDirectory, node.path, onToggle, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
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
        aria-expanded={isDirectory ? isExpanded : undefined}
      >
        {/* Expand/Collapse Icon for Directories */}
        {isDirectory ? (
          <span className={css({ color: 'rgba(255, 255, 255, 0.4)' })}>
            <ChevronRightIcon isExpanded={isExpanded} />
          </span>
        ) : (
          <span className={css({ w: '3' })} />
        )}

        {/* File/Folder Icon */}
        <span
          className={css({
            color: isDirectory
              ? 'rgb(251, 191, 36)' // Amber for folders
              : isSelected
                ? 'rgb(147, 197, 253)'
                : 'rgba(255, 255, 255, 0.6)',
          })}
        >
          {isDirectory ? <FolderIcon isOpen={isExpanded} /> : getFileIcon(node.name)}
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

        {/* File Size */}
        {!isDirectory && node.size !== undefined && (
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

        {/* Selected Indicator */}
        {isSelected && (
          <span className={css({ color: 'rgb(59, 130, 246)', flexShrink: 0 })}>
            <CheckIcon />
          </span>
        )}
      </button>

      {/* Children */}
      {isDirectory && isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedFiles={selectedFiles}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function FileBrowser({
  fileTree,
  onFileSelect,
  selectedFiles = [],
  isLoading = false,
  error = null,
  maxHeight = '400px',
}: FileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  // Build tree structure from flat file list
  const treeNodes = useMemo(() => {
    if (!fileTree?.tree) return []
    return buildTreeStructure(fileTree.tree)
  }, [fileTree])

  // Filter tree based on search query
  const filteredNodes = useMemo(() => {
    return filterTree(treeNodes, searchQuery)
  }, [treeNodes, searchQuery])

  // Auto-expand all directories when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const getAllPaths = (nodes: TreeNode[]): string[] => {
        const paths: string[] = []
        for (const node of nodes) {
          if (node.type === 'directory') {
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

  const handleExpandAll = useCallback(() => {
    const getAllPaths = (nodes: TreeNode[]): string[] => {
      const paths: string[] = []
      for (const node of nodes) {
        if (node.type === 'directory') {
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
          Loading file tree...
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
  if (!fileTree || treeNodes.length === 0) {
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
          <EmptyFolderIcon />
        </div>
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgba(255, 255, 255, 0.5)',
          })}
        >
          No files found in repository
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
      {/* Header with Search */}
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

        {/* Expand/Collapse All */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            mt: '2',
          })}
        >
          <button
            type="button"
            onClick={handleExpandAll}
            className={css({
              fontSize: 'xs',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              _hover: {
                color: 'rgba(255, 255, 255, 0.8)',
              },
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
              _hover: {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            })}
          >
            Collapse All
          </button>
          {fileTree.truncated && (
            <>
              <span className={css({ color: 'rgba(255, 255, 255, 0.2)' })}>|</span>
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'rgb(251, 191, 36)',
                })}
              >
                Tree truncated (large repo)
              </span>
            </>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div
        className={css({
          overflowY: 'auto',
          p: '2',
        })}
        style={{ maxHeight }}
      >
        {filteredNodes.length > 0 ? (
          filteredNodes.map((node) => (
            <TreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              expandedPaths={expandedPaths}
              selectedFiles={selectedFiles}
              onToggle={handleToggle}
              onSelect={onFileSelect}
            />
          ))
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
              No files matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Footer - Selected Count */}
      {selectedFiles.length > 0 && (
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
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
