/**
 * Local File Management Service
 *
 * Provides functionality for analyzing and organizing local files.
 * Based on GitHub Copilot SDK Cookbook - Managing Local Files
 *
 * Features:
 * - Analyze uploaded file structures
 * - Generate organization suggestions
 * - Preview file move operations
 * - Generate executable scripts (bash/powershell)
 */

import type { FileSuggestion } from '../copilot/types'
import {
  FILE_CATEGORIES,
  type FileMoveOperation,
  type FileMovePreview,
  formatFileSize,
  type GeneratedScript,
  getCategoryForExtension,
  type LocalFileAnalysisResult,
  type LocalFileInfo,
  type LocalFileOrganizationPreferences,
  type ScriptGenerationOptions,
} from './types'

// ============================================
// File Analysis
// ============================================

/**
 * Analyze a collection of local files
 */
export function analyzeLocalFiles(files: LocalFileInfo[]): LocalFileAnalysisResult {
  const result: LocalFileAnalysisResult = {
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
    byCategory: {},
    byExtension: {},
    suggestions: [],
    warnings: [],
  }

  // Initialize categories
  for (const category of Object.keys(FILE_CATEGORIES)) {
    result.byCategory[category] = { count: 0, size: 0, files: [] }
  }
  result.byCategory.other = { count: 0, size: 0, files: [] }

  // Process files recursively
  const processFile = (file: LocalFileInfo) => {
    if (file.isDirectory) {
      result.totalDirectories++
      if (file.children) {
        for (const child of file.children) {
          processFile(child)
        }
      }
    } else {
      result.totalFiles++
      result.totalSize += file.size

      // Categorize by extension
      const category = getCategoryForExtension(file.extension)
      if (!result.byCategory[category]) {
        result.byCategory[category] = { count: 0, size: 0, files: [] }
      }
      result.byCategory[category].count++
      result.byCategory[category].size += file.size
      result.byCategory[category].files.push(file)

      // Count by extension
      const ext = file.extension.toLowerCase()
      result.byExtension[ext] = (result.byExtension[ext] || 0) + 1

      // Check for potential issues
      if (file.size === 0) {
        result.warnings.push(`Empty file: ${file.path}`)
      }
      if (file.name.startsWith('.')) {
        result.warnings.push(`Hidden file: ${file.path}`)
      }
    }
  }

  for (const file of files) {
    processFile(file)
  }

  return result
}

// ============================================
// Organization Suggestions
// ============================================

/**
 * Generate organization suggestions for files
 */
export function generateOrganizationSuggestions(
  files: LocalFileInfo[],
  preferences: LocalFileOrganizationPreferences
): FileSuggestion[] {
  const suggestions: FileSuggestion[] = []
  const { groupBy, basePath, dateFormat, customCategories, preserveStructure } = preferences

  const processFile = (file: LocalFileInfo, parentPath = '') => {
    if (file.isDirectory) {
      if (file.children) {
        const newParentPath = preserveStructure ? `${parentPath}/${file.name}` : parentPath
        for (const child of file.children) {
          processFile(child, newParentPath)
        }
      }
      return
    }

    let suggestedFolder: string
    let reason: string
    let confidence = 0.8

    switch (groupBy) {
      case 'type': {
        const category = customCategories
          ? findCustomCategory(file.extension, customCategories)
          : getCategoryForExtension(file.extension)
        suggestedFolder = category
        reason = `Grouped by file type: ${category}`
        confidence = 0.9
        break
      }

      case 'date': {
        const date = new Date(file.modifiedAt)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        suggestedFolder = dateFormat === 'YYYY-MM' ? `${year}-${month}` : `${year}/${month}`
        reason = `Grouped by modification date: ${year}-${month}`
        confidence = 0.85
        break
      }

      case 'extension': {
        suggestedFolder = file.extension.toLowerCase() || 'no-extension'
        reason = `Grouped by file extension: .${file.extension}`
        confidence = 0.95
        break
      }

      case 'size': {
        const sizeCategory = getSizeCategory(file.size)
        suggestedFolder = sizeCategory
        reason = `Grouped by file size: ${sizeCategory} (${formatFileSize(file.size)})`
        confidence = 0.75
        break
      }

      case 'custom': {
        const category = customCategories
          ? findCustomCategory(file.extension, customCategories)
          : 'uncategorized'
        suggestedFolder = category
        reason = `Custom category: ${category}`
        confidence = 0.85
        break
      }

      default: {
        suggestedFolder = getCategoryForExtension(file.extension)
        reason = `Default grouping by type`
        confidence = 0.7
      }
    }

    // Add structure preservation if enabled
    const finalPath =
      preserveStructure && parentPath ? `${suggestedFolder}${parentPath}` : suggestedFolder

    const suggestedPath = `${basePath}/${finalPath}/${file.name}`

    // Only suggest if the path would change
    if (suggestedPath !== file.path) {
      suggestions.push({
        file: {
          name: file.name,
          path: file.path,
          size: file.size,
          type: file.type,
          extension: file.extension,
          modifiedAt: file.modifiedAt,
          createdAt: file.createdAt,
          metadata: file.metadata,
        },
        currentPath: file.path,
        suggestedPath,
        reason,
        confidence,
        category: suggestedFolder,
      })
    }
  }

  for (const file of files) {
    processFile(file)
  }

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Find custom category for an extension
 */
function findCustomCategory(extension: string, customCategories: Record<string, string[]>): string {
  const ext = extension.toLowerCase()
  for (const [category, extensions] of Object.entries(customCategories)) {
    if (extensions.includes(ext)) {
      return category
    }
  }
  return getCategoryForExtension(extension)
}

/**
 * Get size category for a file
 */
function getSizeCategory(bytes: number): string {
  if (bytes < 100 * 1024) return 'small' // < 100KB
  if (bytes < 10 * 1024 * 1024) return 'medium' // < 10MB
  if (bytes < 100 * 1024 * 1024) return 'large' // < 100MB
  return 'very-large' // >= 100MB
}

// ============================================
// File Move Preview
// ============================================

/**
 * Preview file move operations based on suggestions
 */
export function previewFileMoves(suggestions: FileSuggestion[]): FileMovePreview {
  const operations: FileMoveOperation[] = []
  const foldersToCreate = new Set<string>()
  let totalSize = 0
  const filesByCategory: Record<string, number> = {}

  for (const suggestion of suggestions) {
    // Extract destination folder
    const destFolder = suggestion.suggestedPath.substring(
      0,
      suggestion.suggestedPath.lastIndexOf('/')
    )
    foldersToCreate.add(destFolder)

    // Track category counts
    filesByCategory[suggestion.category] = (filesByCategory[suggestion.category] || 0) + 1

    // Create operation
    operations.push({
      source: suggestion.currentPath,
      destination: suggestion.suggestedPath,
      operation: 'move',
      file: {
        ...suggestion.file,
        isDirectory: false,
      },
    })

    totalSize += suggestion.file.size
  }

  return {
    operations,
    summary: {
      totalFiles: operations.length,
      totalFolders: foldersToCreate.size,
      totalSize,
      newFoldersToCreate: Array.from(foldersToCreate).sort(),
      filesByCategory,
    },
  }
}

// ============================================
// Script Generation
// ============================================

/**
 * Generate executable scripts for file operations
 */
export function generateMoveScript(
  preview: FileMovePreview,
  options: ScriptGenerationOptions
): GeneratedScript[] {
  const scripts: GeneratedScript[] = []
  const {
    format,
    includeComments = true,
    createBackup = false,
    dryRun = false,
    destinationPrefix = '',
  } = options

  const formatsToGenerate = format === 'all' ? ['bash', 'powershell', 'json'] : [format]

  for (const fmt of formatsToGenerate) {
    switch (fmt) {
      case 'bash':
        scripts.push(
          generateBashScript(preview, includeComments, createBackup, dryRun, destinationPrefix)
        )
        break
      case 'powershell':
        scripts.push(
          generatePowershellScript(
            preview,
            includeComments,
            createBackup,
            dryRun,
            destinationPrefix
          )
        )
        break
      case 'json':
        scripts.push(generateJsonScript(preview, destinationPrefix))
        break
    }
  }

  return scripts
}

/**
 * Generate bash script for file operations
 */
function generateBashScript(
  preview: FileMovePreview,
  includeComments: boolean,
  createBackup: boolean,
  dryRun: boolean,
  destinationPrefix: string
): GeneratedScript {
  const lines: string[] = []
  const cmd = dryRun ? 'echo' : ''
  const prefix = destinationPrefix || ''

  lines.push('#!/bin/bash')
  lines.push('')

  if (includeComments) {
    lines.push('# File Organization Script')
    lines.push(`# Generated: ${new Date().toISOString()}`)
    lines.push(`# Total files: ${preview.summary.totalFiles}`)
    lines.push(`# Total size: ${formatFileSize(preview.summary.totalSize)}`)
    lines.push('')
  }

  // Create directories
  if (includeComments) {
    lines.push('# Create destination directories')
  }
  for (const folder of preview.summary.newFoldersToCreate) {
    const destFolder = prefix ? `${prefix}/${folder}` : folder
    lines.push(`${cmd ? `${cmd} ` : ''}mkdir -p "${destFolder}"`)
  }
  lines.push('')

  // Backup if requested
  if (createBackup) {
    if (includeComments) {
      lines.push('# Create backup')
    }
    lines.push(`BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"`)
    lines.push(`mkdir -p "$BACKUP_DIR"`)
    lines.push('')
  }

  // Move files
  if (includeComments) {
    lines.push('# Move files')
  }
  for (const op of preview.operations) {
    const dest = prefix ? `${prefix}/${op.destination}` : op.destination
    if (createBackup) {
      lines.push(`${cmd ? `${cmd} ` : ''}cp "${op.source}" "$BACKUP_DIR/"`)
    }
    lines.push(`${cmd ? `${cmd} ` : ''}mv "${op.source}" "${dest}"`)
  }

  if (includeComments) {
    lines.push('')
    lines.push(`# Done! Moved ${preview.summary.totalFiles} files`)
  }

  return {
    format: 'bash',
    content: lines.join('\n'),
    suggestedFilename: 'organize-files.sh',
    operationCount: preview.operations.length,
  }
}

/**
 * Generate PowerShell script for file operations
 */
function generatePowershellScript(
  preview: FileMovePreview,
  includeComments: boolean,
  createBackup: boolean,
  dryRun: boolean,
  destinationPrefix: string
): GeneratedScript {
  const lines: string[] = []
  const whatIf = dryRun ? ' -WhatIf' : ''
  const prefix = destinationPrefix || ''

  if (includeComments) {
    lines.push('# File Organization Script')
    lines.push(`# Generated: ${new Date().toISOString()}`)
    lines.push(`# Total files: ${preview.summary.totalFiles}`)
    lines.push(`# Total size: ${formatFileSize(preview.summary.totalSize)}`)
    lines.push('')
  }

  // Create directories
  if (includeComments) {
    lines.push('# Create destination directories')
  }
  for (const folder of preview.summary.newFoldersToCreate) {
    const destFolder = prefix
      ? `${prefix}\\${folder.replace(/\//g, '\\')}`
      : folder.replace(/\//g, '\\')
    lines.push(`New-Item -ItemType Directory -Force -Path "${destFolder}"${whatIf}`)
  }
  lines.push('')

  // Backup if requested
  if (createBackup) {
    if (includeComments) {
      lines.push('# Create backup')
    }
    lines.push(`$BackupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"`)
    lines.push(`New-Item -ItemType Directory -Force -Path $BackupDir`)
    lines.push('')
  }

  // Move files
  if (includeComments) {
    lines.push('# Move files')
  }
  for (const op of preview.operations) {
    const source = op.source.replace(/\//g, '\\')
    const dest = prefix
      ? `${prefix}\\${op.destination.replace(/\//g, '\\')}`
      : op.destination.replace(/\//g, '\\')
    if (createBackup) {
      lines.push(`Copy-Item "${source}" -Destination $BackupDir${whatIf}`)
    }
    lines.push(`Move-Item "${source}" -Destination "${dest}"${whatIf}`)
  }

  if (includeComments) {
    lines.push('')
    lines.push(`Write-Host "Done! Moved ${preview.summary.totalFiles} files"`)
  }

  return {
    format: 'powershell',
    content: lines.join('\n'),
    suggestedFilename: 'organize-files.ps1',
    operationCount: preview.operations.length,
  }
}

/**
 * Generate JSON representation of file operations
 */
function generateJsonScript(preview: FileMovePreview, destinationPrefix: string): GeneratedScript {
  const prefix = destinationPrefix || ''

  const data = {
    generated: new Date().toISOString(),
    summary: {
      ...preview.summary,
      totalSizeFormatted: formatFileSize(preview.summary.totalSize),
    },
    foldersToCreate: preview.summary.newFoldersToCreate.map((f) => (prefix ? `${prefix}/${f}` : f)),
    operations: preview.operations.map((op) => ({
      operation: op.operation,
      source: op.source,
      destination: prefix ? `${prefix}/${op.destination}` : op.destination,
      file: {
        name: op.file.name,
        size: op.file.size,
        sizeFormatted: formatFileSize(op.file.size),
        extension: op.file.extension,
      },
    })),
  }

  return {
    format: 'json',
    content: JSON.stringify(data, null, 2),
    suggestedFilename: 'organize-files.json',
    operationCount: preview.operations.length,
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse uploaded File objects into LocalFileInfo array
 * (Browser-compatible: works with File API)
 */
export async function parseUploadedFiles(files: File[]): Promise<LocalFileInfo[]> {
  const result: LocalFileInfo[] = []

  for (const file of files) {
    const extension = file.name.includes('.') ? file.name.split('.').pop() || '' : ''

    result.push({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      extension,
      modifiedAt: file.lastModified,
      isDirectory: false,
      relativePath: file.webkitRelativePath || undefined,
    })
  }

  return result
}

/**
 * Build a tree structure from flat file list
 */
export function buildFileTree(files: LocalFileInfo[]): LocalFileInfo[] {
  const root: LocalFileInfo[] = []
  const directories = new Map<string, LocalFileInfo>()

  // Sort files by path depth (shortest first)
  const sortedFiles = [...files].sort(
    (a, b) => (a.path.match(/\//g) || []).length - (b.path.match(/\//g) || []).length
  )

  for (const file of sortedFiles) {
    const pathParts = file.path.split('/').filter(Boolean)

    if (pathParts.length === 1) {
      // Root level file
      root.push(file)
    } else {
      // Nested file - create parent directories as needed
      let currentPath = ''
      let currentLevel = root

      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i]

        if (!directories.has(currentPath)) {
          const dir: LocalFileInfo = {
            name: pathParts[i],
            path: currentPath,
            size: 0,
            type: 'directory',
            extension: '',
            modifiedAt: Date.now(),
            isDirectory: true,
            children: [],
          }
          directories.set(currentPath, dir)
          currentLevel.push(dir)
        }

        const parentDir = directories.get(currentPath)
        currentLevel = parentDir?.children ?? []
      }

      currentLevel.push(file)
    }
  }

  return root
}

/**
 * Flatten a file tree back to a list
 */
export function flattenFileTree(tree: LocalFileInfo[]): LocalFileInfo[] {
  const result: LocalFileInfo[] = []

  const traverse = (nodes: LocalFileInfo[]) => {
    for (const node of nodes) {
      result.push(node)
      if (node.isDirectory && node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return result
}

// Export types for consumers
export * from './types'
