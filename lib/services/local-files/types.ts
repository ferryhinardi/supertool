/**
 * Local File Management Types
 *
 * Types specific to local file operations for the Copilot file organizer.
 * Extends the base FileInfo types from the copilot service.
 */

import type { FileInfo, FileSuggestion } from '../copilot/types'

// ============================================
// Local File Extended Types
// ============================================

/**
 * Extended FileInfo for local files with directory support
 */
export interface LocalFileInfo extends FileInfo {
  /** Whether this is a directory */
  isDirectory: boolean
  /** Child files/directories (for folders) */
  children?: LocalFileInfo[]
  /** Relative path from the root of the uploaded folder */
  relativePath?: string
  /** Last modified date of the file */
  lastModified?: Date
}

/**
 * File operation to be performed
 */
export interface FileMoveOperation {
  /** Source file path */
  source: string
  /** Destination file path */
  destination: string
  /** Type of operation */
  operation: 'move' | 'copy' | 'rename'
  /** Original file info */
  file: LocalFileInfo
}

/**
 * Preview of file move operations before execution
 */
export interface FileMovePreview {
  /** List of operations to perform */
  operations: FileMoveOperation[]
  /** Summary statistics */
  summary: {
    totalFiles: number
    totalFolders: number
    totalSize: number
    newFoldersToCreate: string[]
    filesByCategory: Record<string, number>
  }
  /** Generated script content */
  script?: {
    bash?: string
    powershell?: string
    json?: string
  }
}

/**
 * Result of analyzing local files
 */
export interface LocalFileAnalysisResult {
  /** Total number of files analyzed */
  totalFiles: number
  /** Total number of directories */
  totalDirectories: number
  /** Total size in bytes */
  totalSize: number
  /** Files grouped by category */
  byCategory: Record<
    string,
    {
      count: number
      size: number
      files: LocalFileInfo[]
    }
  >
  /** Files grouped by extension */
  byExtension: Record<string, number>
  /** Organization suggestions */
  suggestions: FileSuggestion[]
  /** Potential issues or warnings */
  warnings: string[]
}

/**
 * Organization preferences for local files
 */
export interface LocalFileOrganizationPreferences {
  /** How to group files */
  groupBy: 'type' | 'date' | 'extension' | 'size' | 'custom'
  /** Base path for organization */
  basePath: string
  /** Date format for date-based grouping */
  dateFormat?: string
  /** Whether to create subfolders by year/month */
  dateSubfolders?: boolean
  /** Custom category mappings */
  customCategories?: Record<string, string[]>
  /** Whether to preserve original folder structure within categories */
  preserveStructure?: boolean
  /** Minimum file size to consider (in bytes) */
  minFileSize?: number
  /** Maximum depth for scanning directories */
  maxDepth?: number
}

/**
 * Script generation options
 */
export interface ScriptGenerationOptions {
  /** Script format to generate */
  format: 'bash' | 'powershell' | 'json' | 'all'
  /** Whether to include comments explaining each operation */
  includeComments?: boolean
  /** Whether to create backup commands */
  createBackup?: boolean
  /** Whether to use dry-run mode (echo commands instead of executing) */
  dryRun?: boolean
  /** Custom prefix for destination paths */
  destinationPrefix?: string
}

/**
 * Result of script generation
 */
export interface GeneratedScript {
  /** Script format */
  format: 'bash' | 'powershell' | 'json'
  /** Script content */
  content: string
  /** File name suggestion */
  suggestedFilename: string
  /** Number of operations in the script */
  operationCount: number
}

// ============================================
// File Category Definitions
// ============================================

/**
 * Default file categories for organization
 */
export const FILE_CATEGORIES: Record<string, string[]> = {
  documents: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'pages', 'epub'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'heic', 'raw'],
  videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v', 'wmv'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'aiff'],
  code: [
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'rb',
    'go',
    'rs',
    'java',
    'c',
    'cpp',
    'h',
    'cs',
    'php',
    'swift',
    'kt',
  ],
  data: ['json', 'xml', 'yaml', 'yml', 'csv', 'sql', 'db', 'sqlite'],
  archives: ['zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz'],
  config: ['env', 'ini', 'conf', 'toml', 'lock', 'config', 'properties'],
  spreadsheets: ['xls', 'xlsx', 'numbers', 'ods'],
  presentations: ['ppt', 'pptx', 'key', 'odp'],
  fonts: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
  executables: ['exe', 'msi', 'dmg', 'app', 'deb', 'rpm', 'sh', 'bat'],
} as const

/**
 * Get the category for a file extension
 */
export function getCategoryForExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '')
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category
    }
  }
  return 'other'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
