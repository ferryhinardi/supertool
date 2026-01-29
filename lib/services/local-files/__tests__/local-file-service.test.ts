/**
 * Unit tests for Local File Service
 */
import { describe, expect, it } from 'vitest'

import {
  analyzeLocalFiles,
  buildFileTree,
  flattenFileTree,
  generateMoveScript,
  generateOrganizationSuggestions,
  parseUploadedFiles,
  previewFileMoves,
} from '../local-file-service'
import {
  formatFileSize,
  getCategoryForExtension,
  type LocalFileInfo,
  type LocalFileOrganizationPreferences,
} from '../types'

// ============================================
// Test Helpers
// ============================================

const createMockFile = (overrides: Partial<LocalFileInfo> = {}): LocalFileInfo => ({
  name: 'test.txt',
  path: 'test.txt',
  size: 1024,
  type: 'text/plain',
  extension: 'txt',
  modifiedAt: Date.now(),
  isDirectory: false,
  ...overrides,
})

const createMockDirectory = (
  name: string,
  children: LocalFileInfo[] = [],
  path?: string
): LocalFileInfo => ({
  name,
  path: path ?? name,
  size: 0,
  type: 'directory',
  extension: '',
  modifiedAt: Date.now(),
  isDirectory: true,
  children,
})

// ============================================
// getCategoryForExtension Tests
// ============================================

describe('getCategoryForExtension', () => {
  it('should return "documents" for pdf files', () => {
    expect(getCategoryForExtension('pdf')).toBe('documents')
  })

  it('should return "documents" for md files', () => {
    expect(getCategoryForExtension('md')).toBe('documents')
  })

  it('should return "images" for jpg files', () => {
    expect(getCategoryForExtension('jpg')).toBe('images')
  })

  it('should return "images" for png files', () => {
    expect(getCategoryForExtension('png')).toBe('images')
  })

  it('should return "code" for ts files', () => {
    expect(getCategoryForExtension('ts')).toBe('code')
  })

  it('should return "code" for tsx files', () => {
    expect(getCategoryForExtension('tsx')).toBe('code')
  })

  it('should return "videos" for mp4 files', () => {
    expect(getCategoryForExtension('mp4')).toBe('videos')
  })

  it('should return "audio" for mp3 files', () => {
    expect(getCategoryForExtension('mp3')).toBe('audio')
  })

  it('should return "data" for json files', () => {
    expect(getCategoryForExtension('json')).toBe('data')
  })

  it('should return "archives" for zip files', () => {
    expect(getCategoryForExtension('zip')).toBe('archives')
  })

  it('should return "other" for unknown extensions', () => {
    expect(getCategoryForExtension('xyz')).toBe('other')
    expect(getCategoryForExtension('unknown')).toBe('other')
  })

  it('should handle extensions with leading dot', () => {
    expect(getCategoryForExtension('.pdf')).toBe('documents')
    expect(getCategoryForExtension('.jpg')).toBe('images')
  })

  it('should be case insensitive', () => {
    expect(getCategoryForExtension('PDF')).toBe('documents')
    expect(getCategoryForExtension('JPG')).toBe('images')
    expect(getCategoryForExtension('Ts')).toBe('code')
  })
})

// ============================================
// formatFileSize Tests
// ============================================

describe('formatFileSize', () => {
  it('should return "0 Bytes" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
    expect(formatFileSize(1023)).toBe('1023 Bytes')
  })

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(10240)).toBe('10 KB')
  })

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatFileSize(100 * 1024 * 1024)).toBe('100 MB')
  })

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
  })

  it('should format terabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
  })
})

// ============================================
// analyzeLocalFiles Tests
// ============================================

describe('analyzeLocalFiles', () => {
  it('should return empty result for empty array', () => {
    const result = analyzeLocalFiles([])

    expect(result.totalFiles).toBe(0)
    expect(result.totalDirectories).toBe(0)
    expect(result.totalSize).toBe(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('should count files correctly', () => {
    const files = [
      createMockFile({ name: 'doc.pdf', extension: 'pdf', size: 1000 }),
      createMockFile({ name: 'image.jpg', extension: 'jpg', size: 2000 }),
      createMockFile({ name: 'code.ts', extension: 'ts', size: 500 }),
    ]

    const result = analyzeLocalFiles(files)

    expect(result.totalFiles).toBe(3)
    expect(result.totalDirectories).toBe(0)
    expect(result.totalSize).toBe(3500)
  })

  it('should categorize files by extension', () => {
    const files = [
      createMockFile({ name: 'doc.pdf', extension: 'pdf', size: 1000 }),
      createMockFile({ name: 'doc2.docx', extension: 'docx', size: 500 }),
      createMockFile({ name: 'image.jpg', extension: 'jpg', size: 2000 }),
    ]

    const result = analyzeLocalFiles(files)

    expect(result.byCategory.documents.count).toBe(2)
    expect(result.byCategory.documents.size).toBe(1500)
    expect(result.byCategory.images.count).toBe(1)
    expect(result.byCategory.images.size).toBe(2000)
  })

  it('should count extensions correctly', () => {
    const files = [
      createMockFile({ name: 'a.pdf', extension: 'pdf' }),
      createMockFile({ name: 'b.pdf', extension: 'pdf' }),
      createMockFile({ name: 'c.jpg', extension: 'jpg' }),
    ]

    const result = analyzeLocalFiles(files)

    expect(result.byExtension.pdf).toBe(2)
    expect(result.byExtension.jpg).toBe(1)
  })

  it('should process nested directories recursively', () => {
    const nestedFiles = [createMockFile({ name: 'nested.txt', path: 'folder/nested.txt' })]
    const files = [
      createMockFile({ name: 'root.txt', path: 'root.txt' }),
      createMockDirectory('folder', nestedFiles),
    ]

    const result = analyzeLocalFiles(files)

    expect(result.totalFiles).toBe(2)
    expect(result.totalDirectories).toBe(1)
  })

  it('should add warning for empty files', () => {
    const files = [createMockFile({ name: 'empty.txt', path: 'empty.txt', size: 0 })]

    const result = analyzeLocalFiles(files)

    expect(result.warnings).toContain('Empty file: empty.txt')
  })

  it('should add warning for hidden files', () => {
    const files = [createMockFile({ name: '.hidden', path: '.hidden' })]

    const result = analyzeLocalFiles(files)

    expect(result.warnings).toContain('Hidden file: .hidden')
  })

  it('should handle files with unknown extensions as "other"', () => {
    const files = [createMockFile({ name: 'unknown.xyz', extension: 'xyz', size: 100 })]

    const result = analyzeLocalFiles(files)

    expect(result.byCategory.other.count).toBe(1)
    expect(result.byCategory.other.size).toBe(100)
  })
})

// ============================================
// generateOrganizationSuggestions Tests
// ============================================

describe('generateOrganizationSuggestions', () => {
  const defaultPrefs: LocalFileOrganizationPreferences = {
    groupBy: 'type',
    basePath: 'organized',
  }

  it('should generate suggestions grouped by type', () => {
    const files = [
      createMockFile({ name: 'doc.pdf', path: 'doc.pdf', extension: 'pdf' }),
      createMockFile({ name: 'image.jpg', path: 'image.jpg', extension: 'jpg' }),
    ]

    const suggestions = generateOrganizationSuggestions(files, defaultPrefs)

    expect(suggestions).toHaveLength(2)

    const pdfSuggestion = suggestions.find((s) => s.file.name === 'doc.pdf')
    expect(pdfSuggestion?.suggestedPath).toBe('organized/documents/doc.pdf')
    expect(pdfSuggestion?.category).toBe('documents')

    const jpgSuggestion = suggestions.find((s) => s.file.name === 'image.jpg')
    expect(jpgSuggestion?.suggestedPath).toBe('organized/images/image.jpg')
    expect(jpgSuggestion?.category).toBe('images')
  })

  it('should generate suggestions grouped by date', () => {
    const timestamp = new Date('2024-03-15').getTime()
    const files = [
      createMockFile({
        name: 'file.txt',
        path: 'file.txt',
        extension: 'txt',
        modifiedAt: timestamp,
      }),
    ]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'date',
      basePath: 'organized',
      dateFormat: 'YYYY-MM',
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    expect(suggestions[0].suggestedPath).toBe('organized/2024-03/file.txt')
    expect(suggestions[0].category).toBe('2024-03')
  })

  it('should generate suggestions grouped by extension', () => {
    const files = [
      createMockFile({ name: 'code.ts', path: 'code.ts', extension: 'ts' }),
      createMockFile({ name: 'style.css', path: 'style.css', extension: 'css' }),
    ]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'extension',
      basePath: 'organized',
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    const tsSuggestion = suggestions.find((s) => s.file.name === 'code.ts')
    expect(tsSuggestion?.suggestedPath).toBe('organized/ts/code.ts')
    expect(tsSuggestion?.category).toBe('ts')

    const cssSuggestion = suggestions.find((s) => s.file.name === 'style.css')
    expect(cssSuggestion?.suggestedPath).toBe('organized/css/style.css')
    expect(cssSuggestion?.category).toBe('css')
  })

  it('should generate suggestions grouped by size', () => {
    const files = [
      createMockFile({ name: 'small.txt', path: 'small.txt', size: 50 * 1024 }), // 50KB - small
      createMockFile({ name: 'medium.txt', path: 'medium.txt', size: 5 * 1024 * 1024 }), // 5MB - medium
      createMockFile({ name: 'large.txt', path: 'large.txt', size: 50 * 1024 * 1024 }), // 50MB - large
      createMockFile({ name: 'huge.txt', path: 'huge.txt', size: 200 * 1024 * 1024 }), // 200MB - very-large
    ]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'size',
      basePath: 'organized',
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    expect(suggestions.find((s) => s.file.name === 'small.txt')?.category).toBe('small')
    expect(suggestions.find((s) => s.file.name === 'medium.txt')?.category).toBe('medium')
    expect(suggestions.find((s) => s.file.name === 'large.txt')?.category).toBe('large')
    expect(suggestions.find((s) => s.file.name === 'huge.txt')?.category).toBe('very-large')
  })

  it('should generate suggestions with custom categories', () => {
    const files = [
      createMockFile({ name: 'app.ts', path: 'app.ts', extension: 'ts' }),
      createMockFile({ name: 'test.spec.ts', path: 'test.spec.ts', extension: 'ts' }),
    ]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'custom',
      basePath: 'organized',
      customCategories: {
        source: ['ts', 'js'],
        tests: ['spec'],
      },
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    // Both should be categorized as 'source' since we're matching on extension
    expect(suggestions.find((s) => s.file.name === 'app.ts')?.category).toBe('source')
  })

  it('should sort suggestions by confidence (highest first)', () => {
    const files = [
      createMockFile({ name: 'a.txt', path: 'a.txt', extension: 'txt' }),
      createMockFile({ name: 'b.pdf', path: 'b.pdf', extension: 'pdf' }),
    ]

    const suggestions = generateOrganizationSuggestions(files, defaultPrefs)

    // All type-based suggestions have confidence 0.9
    expect(suggestions.every((s) => s.confidence === 0.9)).toBe(true)
  })

  it('should not generate suggestions for unchanged paths', () => {
    const files = [
      createMockFile({
        name: 'doc.pdf',
        path: 'organized/documents/doc.pdf',
        extension: 'pdf',
      }),
    ]

    const suggestions = generateOrganizationSuggestions(files, defaultPrefs)

    expect(suggestions).toHaveLength(0)
  })

  it('should preserve structure when option is enabled', () => {
    const nestedFile = createMockFile({
      name: 'nested.pdf',
      path: 'folder/nested.pdf',
      extension: 'pdf',
    })
    const folder = createMockDirectory('folder', [nestedFile])
    const files = [folder]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'type',
      basePath: 'organized',
      preserveStructure: true,
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    expect(suggestions[0].suggestedPath).toBe('organized/documents/folder/nested.pdf')
  })

  it('should handle files with no extension', () => {
    const files = [createMockFile({ name: 'README', path: 'README', extension: '' })]

    const prefs: LocalFileOrganizationPreferences = {
      groupBy: 'extension',
      basePath: 'organized',
    }

    const suggestions = generateOrganizationSuggestions(files, prefs)

    expect(suggestions[0].category).toBe('no-extension')
    expect(suggestions[0].suggestedPath).toBe('organized/no-extension/README')
  })
})

// ============================================
// previewFileMoves Tests
// ============================================

describe('previewFileMoves', () => {
  it('should generate operations from suggestions', () => {
    const suggestions = [
      {
        file: createMockFile({ name: 'doc.pdf', size: 1000 }),
        currentPath: 'doc.pdf',
        suggestedPath: 'organized/documents/doc.pdf',
        reason: 'Grouped by type',
        confidence: 0.9,
        category: 'documents',
      },
    ]

    const preview = previewFileMoves(suggestions)

    expect(preview.operations).toHaveLength(1)
    expect(preview.operations[0].source).toBe('doc.pdf')
    expect(preview.operations[0].destination).toBe('organized/documents/doc.pdf')
    expect(preview.operations[0].operation).toBe('move')
  })

  it('should calculate unique folders to create', () => {
    const suggestions = [
      {
        file: createMockFile({ name: 'a.pdf' }),
        currentPath: 'a.pdf',
        suggestedPath: 'organized/documents/a.pdf',
        reason: '',
        confidence: 0.9,
        category: 'documents',
      },
      {
        file: createMockFile({ name: 'b.pdf' }),
        currentPath: 'b.pdf',
        suggestedPath: 'organized/documents/b.pdf',
        reason: '',
        confidence: 0.9,
        category: 'documents',
      },
      {
        file: createMockFile({ name: 'c.jpg' }),
        currentPath: 'c.jpg',
        suggestedPath: 'organized/images/c.jpg',
        reason: '',
        confidence: 0.9,
        category: 'images',
      },
    ]

    const preview = previewFileMoves(suggestions)

    expect(preview.summary.newFoldersToCreate).toHaveLength(2)
    expect(preview.summary.newFoldersToCreate).toContain('organized/documents')
    expect(preview.summary.newFoldersToCreate).toContain('organized/images')
  })

  it('should calculate summary statistics', () => {
    const suggestions = [
      {
        file: createMockFile({ name: 'a.pdf', size: 1000 }),
        currentPath: 'a.pdf',
        suggestedPath: 'organized/documents/a.pdf',
        reason: '',
        confidence: 0.9,
        category: 'documents',
      },
      {
        file: createMockFile({ name: 'b.jpg', size: 2000 }),
        currentPath: 'b.jpg',
        suggestedPath: 'organized/images/b.jpg',
        reason: '',
        confidence: 0.9,
        category: 'images',
      },
    ]

    const preview = previewFileMoves(suggestions)

    expect(preview.summary.totalFiles).toBe(2)
    expect(preview.summary.totalFolders).toBe(2)
    expect(preview.summary.totalSize).toBe(3000)
  })

  it('should count files by category', () => {
    const suggestions = [
      {
        file: createMockFile({ name: 'a.pdf' }),
        currentPath: 'a.pdf',
        suggestedPath: 'organized/documents/a.pdf',
        reason: '',
        confidence: 0.9,
        category: 'documents',
      },
      {
        file: createMockFile({ name: 'b.pdf' }),
        currentPath: 'b.pdf',
        suggestedPath: 'organized/documents/b.pdf',
        reason: '',
        confidence: 0.9,
        category: 'documents',
      },
      {
        file: createMockFile({ name: 'c.jpg' }),
        currentPath: 'c.jpg',
        suggestedPath: 'organized/images/c.jpg',
        reason: '',
        confidence: 0.9,
        category: 'images',
      },
    ]

    const preview = previewFileMoves(suggestions)

    expect(preview.summary.filesByCategory.documents).toBe(2)
    expect(preview.summary.filesByCategory.images).toBe(1)
  })

  it('should handle empty suggestions', () => {
    const preview = previewFileMoves([])

    expect(preview.operations).toHaveLength(0)
    expect(preview.summary.totalFiles).toBe(0)
    expect(preview.summary.totalFolders).toBe(0)
    expect(preview.summary.totalSize).toBe(0)
    expect(preview.summary.newFoldersToCreate).toHaveLength(0)
  })
})

// ============================================
// generateMoveScript Tests
// ============================================

describe('generateMoveScript', () => {
  const createTestPreview = () => ({
    operations: [
      {
        source: 'doc.pdf',
        destination: 'organized/documents/doc.pdf',
        operation: 'move' as const,
        file: createMockFile({ name: 'doc.pdf', size: 1000 }),
      },
    ],
    summary: {
      totalFiles: 1,
      totalFolders: 1,
      totalSize: 1000,
      newFoldersToCreate: ['organized/documents'],
      filesByCategory: { documents: 1 },
    },
  })

  describe('bash format', () => {
    it('should generate bash script with mkdir and mv commands', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'bash' })

      expect(scripts).toHaveLength(1)
      expect(scripts[0].format).toBe('bash')
      expect(scripts[0].content).toContain('#!/bin/bash')
      expect(scripts[0].content).toContain('mkdir -p "organized/documents"')
      expect(scripts[0].content).toContain('mv "doc.pdf" "organized/documents/doc.pdf"')
      expect(scripts[0].suggestedFilename).toBe('organize-files.sh')
    })

    it('should include comments when option is enabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'bash',
        includeComments: true,
      })

      expect(scripts[0].content).toContain('# File Organization Script')
      expect(scripts[0].content).toContain('# Create destination directories')
      expect(scripts[0].content).toContain('# Move files')
    })

    it('should exclude comments when option is disabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'bash',
        includeComments: false,
      })

      expect(scripts[0].content).not.toContain('# File Organization Script')
      expect(scripts[0].content).not.toContain('# Create destination directories')
    })

    it('should add backup commands when createBackup is enabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'bash',
        createBackup: true,
      })

      expect(scripts[0].content).toContain('BACKUP_DIR=')
      expect(scripts[0].content).toContain('cp "doc.pdf" "$BACKUP_DIR/"')
    })

    it('should add echo prefix when dryRun is enabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'bash',
        dryRun: true,
      })

      expect(scripts[0].content).toContain('echo mkdir -p')
      expect(scripts[0].content).toContain('echo mv')
    })

    it('should apply destinationPrefix', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'bash',
        destinationPrefix: '/home/user',
      })

      expect(scripts[0].content).toContain('mkdir -p "/home/user/organized/documents"')
      expect(scripts[0].content).toContain('mv "doc.pdf" "/home/user/organized/documents/doc.pdf"')
    })
  })

  describe('powershell format', () => {
    it('should generate PowerShell script with New-Item and Move-Item', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'powershell' })

      expect(scripts).toHaveLength(1)
      expect(scripts[0].format).toBe('powershell')
      expect(scripts[0].content).toContain('New-Item -ItemType Directory -Force -Path')
      expect(scripts[0].content).toContain('Move-Item')
      expect(scripts[0].suggestedFilename).toBe('organize-files.ps1')
    })

    it('should convert paths to Windows format', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'powershell' })

      expect(scripts[0].content).toContain('organized\\documents')
    })

    it('should add -WhatIf when dryRun is enabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'powershell',
        dryRun: true,
      })

      expect(scripts[0].content).toContain('-WhatIf')
    })

    it('should add Copy-Item for backup when createBackup is enabled', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'powershell',
        createBackup: true,
      })

      expect(scripts[0].content).toContain('$BackupDir =')
      expect(scripts[0].content).toContain('Copy-Item')
    })
  })

  describe('json format', () => {
    it('should generate valid JSON', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'json' })

      expect(scripts).toHaveLength(1)
      expect(scripts[0].format).toBe('json')
      expect(scripts[0].suggestedFilename).toBe('organize-files.json')

      // Should be valid JSON
      const parsed = JSON.parse(scripts[0].content)
      expect(parsed).toHaveProperty('generated')
      expect(parsed).toHaveProperty('summary')
      expect(parsed).toHaveProperty('operations')
      expect(parsed).toHaveProperty('foldersToCreate')
    })

    it('should include formatted file sizes', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'json' })

      const parsed = JSON.parse(scripts[0].content)
      expect(parsed.summary.totalSizeFormatted).toBe('1000 Bytes')
      expect(parsed.operations[0].file.sizeFormatted).toBe('1000 Bytes')
    })

    it('should apply destinationPrefix to paths', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, {
        format: 'json',
        destinationPrefix: '/home/user',
      })

      const parsed = JSON.parse(scripts[0].content)
      expect(parsed.foldersToCreate[0]).toBe('/home/user/organized/documents')
      expect(parsed.operations[0].destination).toBe('/home/user/organized/documents/doc.pdf')
    })
  })

  describe('all formats', () => {
    it('should generate all three formats', () => {
      const preview = createTestPreview()
      const scripts = generateMoveScript(preview, { format: 'all' })

      expect(scripts).toHaveLength(3)
      expect(scripts.map((s) => s.format)).toContain('bash')
      expect(scripts.map((s) => s.format)).toContain('powershell')
      expect(scripts.map((s) => s.format)).toContain('json')
    })
  })
})

// ============================================
// buildFileTree Tests
// ============================================

describe('buildFileTree', () => {
  it('should keep root level files at root', () => {
    const files = [
      createMockFile({ name: 'a.txt', path: 'a.txt' }),
      createMockFile({ name: 'b.txt', path: 'b.txt' }),
    ]

    const tree = buildFileTree(files)

    expect(tree).toHaveLength(2)
    expect(tree[0].name).toBe('a.txt')
    expect(tree[1].name).toBe('b.txt')
  })

  it('should create directory nodes for nested files', () => {
    const files = [createMockFile({ name: 'nested.txt', path: 'folder/nested.txt' })]

    const tree = buildFileTree(files)

    expect(tree).toHaveLength(1)
    expect(tree[0].isDirectory).toBe(true)
    expect(tree[0].name).toBe('folder')
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children?.[0].name).toBe('nested.txt')
  })

  it('should handle deeply nested paths', () => {
    const files = [createMockFile({ name: 'deep.txt', path: 'a/b/c/deep.txt' })]

    const tree = buildFileTree(files)

    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('a')
    expect(tree[0].children?.[0].name).toBe('b')
    expect(tree[0].children?.[0].children?.[0].name).toBe('c')
    expect(tree[0].children?.[0].children?.[0].children?.[0].name).toBe('deep.txt')
  })

  it('should group files in same directory', () => {
    const files = [
      createMockFile({ name: 'a.txt', path: 'folder/a.txt' }),
      createMockFile({ name: 'b.txt', path: 'folder/b.txt' }),
    ]

    const tree = buildFileTree(files)

    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('folder')
    expect(tree[0].children).toHaveLength(2)
  })

  it('should handle mixed root and nested files', () => {
    const files = [
      createMockFile({ name: 'root.txt', path: 'root.txt' }),
      createMockFile({ name: 'nested.txt', path: 'folder/nested.txt' }),
    ]

    const tree = buildFileTree(files)

    expect(tree).toHaveLength(2)
    const rootFile = tree.find((f) => f.name === 'root.txt')
    const folder = tree.find((f) => f.name === 'folder')

    expect(rootFile?.isDirectory).toBe(false)
    expect(folder?.isDirectory).toBe(true)
  })

  it('should handle empty input', () => {
    const tree = buildFileTree([])

    expect(tree).toHaveLength(0)
  })
})

// ============================================
// flattenFileTree Tests
// ============================================

describe('flattenFileTree', () => {
  it('should return flat list for flat input', () => {
    const files = [createMockFile({ name: 'a.txt' }), createMockFile({ name: 'b.txt' })]

    const flat = flattenFileTree(files)

    expect(flat).toHaveLength(2)
  })

  it('should flatten nested directories', () => {
    const nestedFile = createMockFile({ name: 'nested.txt', path: 'folder/nested.txt' })
    const folder = createMockDirectory('folder', [nestedFile])
    const tree = [folder]

    const flat = flattenFileTree(tree)

    expect(flat).toHaveLength(2)
    expect(flat[0].name).toBe('folder')
    expect(flat[1].name).toBe('nested.txt')
  })

  it('should handle deeply nested structures', () => {
    const deepFile = createMockFile({ name: 'deep.txt' })
    const innerFolder = createMockDirectory('inner', [deepFile])
    const outerFolder = createMockDirectory('outer', [innerFolder])
    const tree = [outerFolder]

    const flat = flattenFileTree(tree)

    expect(flat).toHaveLength(3)
    expect(flat.map((f) => f.name)).toEqual(['outer', 'inner', 'deep.txt'])
  })

  it('should handle empty input', () => {
    const flat = flattenFileTree([])

    expect(flat).toHaveLength(0)
  })

  it('should include both files and directories', () => {
    const file = createMockFile({ name: 'file.txt' })
    const folder = createMockDirectory('folder', [])
    const tree = [file, folder]

    const flat = flattenFileTree(tree)

    expect(flat).toHaveLength(2)
    expect(flat.some((f) => !f.isDirectory)).toBe(true)
    expect(flat.some((f) => f.isDirectory)).toBe(true)
  })
})

// ============================================
// parseUploadedFiles Tests
// ============================================

describe('parseUploadedFiles', () => {
  it('should parse File objects to LocalFileInfo array', async () => {
    // Create a mock File object
    const mockFile = new File(['content'], 'test.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    })

    const result = await parseUploadedFiles([mockFile])

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('test.txt')
    expect(result[0].extension).toBe('txt')
    expect(result[0].type).toBe('text/plain')
    expect(result[0].isDirectory).toBe(false)
  })

  it('should extract extension correctly', async () => {
    const mockFile = new File([''], 'document.pdf', { type: 'application/pdf' })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].extension).toBe('pdf')
  })

  it('should handle files without extension', async () => {
    const mockFile = new File([''], 'README', { type: '' })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].extension).toBe('')
  })

  it('should handle files with multiple dots', async () => {
    const mockFile = new File([''], 'archive.tar.gz', { type: 'application/gzip' })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].extension).toBe('gz')
  })

  it('should use path from webkitRelativePath when available', async () => {
    // webkitRelativePath is read-only on File, so we need to mock it
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' })
    Object.defineProperty(mockFile, 'webkitRelativePath', {
      value: 'folder/test.txt',
      writable: false,
    })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].path).toBe('folder/test.txt')
    expect(result[0].relativePath).toBe('folder/test.txt')
  })

  it('should handle empty array', async () => {
    const result = await parseUploadedFiles([])

    expect(result).toHaveLength(0)
  })

  it('should preserve file size', async () => {
    const content = 'Hello, World!'
    const mockFile = new File([content], 'test.txt', { type: 'text/plain' })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].size).toBe(content.length)
  })

  it('should use fallback type for unknown MIME types', async () => {
    const mockFile = new File([''], 'unknown.xyz', { type: '' })

    const result = await parseUploadedFiles([mockFile])

    expect(result[0].type).toBe('application/octet-stream')
  })
})
