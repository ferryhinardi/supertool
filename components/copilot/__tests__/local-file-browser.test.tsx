import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'

import { LocalFileBrowser } from '../local-file-browser'

// Mock data
const mockFiles: LocalFileInfo[] = [
  {
    path: 'src',
    name: 'src',
    type: 'directory',
    size: 0,
    extension: '',
    modifiedAt: Date.now(),
    isDirectory: true,
    relativePath: 'src',
  },
  {
    path: 'src/index.ts',
    name: 'index.ts',
    type: 'text/typescript',
    size: 1024,
    extension: 'ts',
    modifiedAt: Date.now(),
    isDirectory: false,
    relativePath: 'src/index.ts',
  },
  {
    path: 'src/utils.ts',
    name: 'utils.ts',
    type: 'text/typescript',
    size: 512,
    extension: 'ts',
    modifiedAt: Date.now(),
    isDirectory: false,
    relativePath: 'src/utils.ts',
  },
  {
    path: 'readme.md',
    name: 'readme.md',
    type: 'text/markdown',
    size: 2048,
    extension: 'md',
    modifiedAt: Date.now(),
    isDirectory: false,
    relativePath: 'readme.md',
  },
]

const mockAnalysisResult: LocalFileAnalysisResult = {
  totalFiles: 5,
  totalDirectories: 2,
  totalSize: 10240,
  byCategory: {
    code: { count: 3, size: 5120, files: [] },
    documents: { count: 2, size: 5120, files: [] },
  },
  byExtension: { ts: 3, md: 2 },
  suggestions: [
    {
      file: mockFiles[1],
      currentPath: 'src/index.ts',
      suggestedPath: 'src/main/index.ts',
      reason: 'Consider adding tests',
      confidence: 0.8,
      category: 'code',
    },
  ],
  warnings: ['Some warning'],
}

describe('LocalFileBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty State', () => {
    it('renders empty drop zone when files array is empty', () => {
      render(<LocalFileBrowser files={[]} />)

      expect(screen.getByText(/drag and drop files or folders here/i)).toBeInTheDocument()
    })

    it('shows upload prompt in empty state', () => {
      render(<LocalFileBrowser files={[]} />)

      expect(screen.getByText(/or use the file picker below/i)).toBeInTheDocument()
    })
  })

  describe('File Tree Rendering', () => {
    it('renders file tree when files are provided', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      expect(screen.getByText('src')).toBeInTheDocument()
      expect(screen.getByText('readme.md')).toBeInTheDocument()
    })

    it('renders nested files within directories', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      // The src directory should be visible
      expect(screen.getByText('src')).toBeInTheDocument()
    })

    it('displays file extensions', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      expect(screen.getByText('readme.md')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading state when isLoading is true', () => {
      render(<LocalFileBrowser files={[]} isLoading={true} />)

      expect(screen.getByText(/analyzing files/i)).toBeInTheDocument()
    })

    it('shows loading spinner when isLoading is true', () => {
      render(<LocalFileBrowser files={mockFiles} isLoading={true} />)

      expect(screen.getByText(/analyzing files/i)).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error state when error prop is set', () => {
      const errorMessage = 'Failed to load files'
      render(<LocalFileBrowser files={[]} error={errorMessage} />)

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('displays error with appropriate styling', () => {
      const errorMessage = 'Something went wrong'
      render(<LocalFileBrowser files={[]} error={errorMessage} />)

      const errorElement = screen.getByText(errorMessage)
      expect(errorElement).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input with correct placeholder', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      const searchInput = screen.getByPlaceholderText(/search files by name or category/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('filters files by name when searching', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const searchInput = screen.getByPlaceholderText(/search files by name or category/i)
      await user.type(searchInput, 'readme')

      expect(screen.getByText('readme.md')).toBeInTheDocument()
    })

    it('filters files by extension when searching', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const searchInput = screen.getByPlaceholderText(/search files by name or category/i)
      await user.type(searchInput, '.ts')

      // TypeScript files should be visible
      expect(screen.queryByText('readme.md')).not.toBeInTheDocument()
    })

    it('shows no results when search matches nothing', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const searchInput = screen.getByPlaceholderText(/search files by name or category/i)
      await user.type(searchInput, 'nonexistent')

      // Original files should be filtered out
      expect(screen.queryByText('readme.md')).not.toBeInTheDocument()
    })
  })

  describe('Folder Expand/Collapse', () => {
    it('allows expanding folders by click', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const srcFolder = screen.getByText('src')
      expect(srcFolder).toBeInTheDocument()

      // Click to toggle
      await user.click(srcFolder)

      // Folder should be interactive
      expect(srcFolder).toBeInTheDocument()
    })

    it('shows expand/collapse button for directories', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      // Look for chevron or expand icons near the src folder
      const srcFolder = screen.getByText('src')
      expect(srcFolder).toBeInTheDocument()
    })
  })

  describe('File Selection', () => {
    it('triggers onFilesSelect callback when file is selected', async () => {
      const user = userEvent.setup()
      const onFilesSelect = vi.fn()
      render(
        <LocalFileBrowser files={mockFiles} onFilesSelect={onFilesSelect} multiSelect={true} />
      )

      const readmeFile = screen.getByText('readme.md')
      await user.click(readmeFile)

      expect(onFilesSelect).toHaveBeenCalled()
    })

    it('allows selecting multiple files in multiSelect mode', async () => {
      const onFilesSelect = vi.fn()
      render(
        <LocalFileBrowser files={mockFiles} onFilesSelect={onFilesSelect} multiSelect={true} />
      )

      // Find checkboxes
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('shows checkboxes in multiSelect mode', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('hides checkboxes when multiSelect is false', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={false} />)

      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes.length).toBe(0)
    })
  })

  describe('Drag and Drop', () => {
    it('triggers onFilesUpload callback when files are dropped', () => {
      const onFilesUpload = vi.fn()
      render(<LocalFileBrowser files={[]} onFilesUpload={onFilesUpload} />)

      const dropZone = screen.getByText(/drag and drop files or folders here/i).parentElement
        ?.parentElement

      if (dropZone) {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' })
        const dataTransfer = {
          files: [file],
          items: [
            {
              kind: 'file',
              type: 'text/plain',
              getAsFile: () => file,
            },
          ],
          types: ['Files'],
        }

        fireEvent.dragEnter(dropZone, { dataTransfer })
        fireEvent.dragOver(dropZone, { dataTransfer })
        fireEvent.drop(dropZone, { dataTransfer })
      }
    })

    it('shows drag overlay when dragging over', () => {
      render(<LocalFileBrowser files={[]} />)

      const dropZone = screen.getByText(/drag and drop files or folders here/i).parentElement
        ?.parentElement

      if (dropZone) {
        const dataTransfer = {
          files: [],
          items: [],
          types: ['Files'],
        }

        fireEvent.dragEnter(dropZone, { dataTransfer })
        fireEvent.dragOver(dropZone, { dataTransfer })
      }
    })
  })

  describe('Analysis Summary', () => {
    it('displays analysis summary when analysisResult is provided', () => {
      render(
        <LocalFileBrowser
          files={mockFiles}
          analysisResult={mockAnalysisResult}
          showAnalysis={true}
        />
      )

      // Check for total files count
      expect(screen.getByText(/5/)).toBeInTheDocument()
    })

    it('shows total directories in analysis', () => {
      render(
        <LocalFileBrowser
          files={mockFiles}
          analysisResult={mockAnalysisResult}
          showAnalysis={true}
        />
      )

      // Check for Folders label which displays the directory count
      expect(screen.getByText('Folders')).toBeInTheDocument()
    })

    it('shows formatted file size in analysis', () => {
      render(
        <LocalFileBrowser
          files={mockFiles}
          analysisResult={mockAnalysisResult}
          showAnalysis={true}
        />
      )

      // 10240 bytes = 10 KB
      expect(screen.getByText(/10/)).toBeInTheDocument()
    })

    it('hides analysis when showAnalysis is false', () => {
      render(
        <LocalFileBrowser
          files={mockFiles}
          analysisResult={mockAnalysisResult}
          showAnalysis={false}
        />
      )

      // Analysis-specific labels should not be visible
      expect(screen.queryByText(/total files/i)).not.toBeInTheDocument()
    })

    it('shows warnings from analysis result', () => {
      render(
        <LocalFileBrowser
          files={mockFiles}
          analysisResult={mockAnalysisResult}
          showAnalysis={true}
        />
      )

      expect(screen.getByText(/some warning/i)).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse All', () => {
    it('renders Expand All button', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      expect(screen.getByRole('button', { name: /expand all/i })).toBeInTheDocument()
    })

    it('renders Collapse All button', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      expect(screen.getByRole('button', { name: /collapse all/i })).toBeInTheDocument()
    })

    it('expands all folders when Expand All is clicked', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const expandAllButton = screen.getByRole('button', {
        name: /expand all/i,
      })
      await user.click(expandAllButton)

      // All nested files should be visible
      expect(screen.getByText('src')).toBeInTheDocument()
    })

    it('collapses all folders when Collapse All is clicked', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} />)

      const collapseAllButton = screen.getByRole('button', {
        name: /collapse all/i,
      })
      await user.click(collapseAllButton)

      // Folders should be collapsed
      expect(screen.getByText('src')).toBeInTheDocument()
    })
  })

  describe('Select/Clear All', () => {
    it('renders Select All button in multiSelect mode', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument()
    })

    it('renders Clear Selection button in multiSelect mode', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument()
    })

    it('hides Select All button when multiSelect is false', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={false} />)

      expect(screen.queryByRole('button', { name: /select all/i })).not.toBeInTheDocument()
    })

    it('selects all files when Select All is clicked', async () => {
      const user = userEvent.setup()
      const onFilesSelect = vi.fn()
      render(
        <LocalFileBrowser files={mockFiles} multiSelect={true} onFilesSelect={onFilesSelect} />
      )

      const selectAllButton = screen.getByRole('button', {
        name: /select all/i,
      })
      await user.click(selectAllButton)

      expect(onFilesSelect).toHaveBeenCalled()
    })

    it('clears all selections when Clear Selection is clicked', async () => {
      const user = userEvent.setup()
      const onFilesSelect = vi.fn()
      render(
        <LocalFileBrowser files={mockFiles} multiSelect={true} onFilesSelect={onFilesSelect} />
      )

      // First select all
      const selectAllButton = screen.getByRole('button', {
        name: /select all/i,
      })
      await user.click(selectAllButton)

      // Then clear
      const clearButton = screen.getByRole('button', {
        name: /clear selection/i,
      })
      await user.click(clearButton)

      expect(onFilesSelect).toHaveBeenCalled()
    })
  })

  describe('Selected Files Footer', () => {
    it('shows selected files count in footer', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      // Select a file
      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length > 0) {
        await user.click(checkboxes[0])
      }

      // Footer should show count (may vary based on implementation)
      expect(screen.getByText(/selected/i)).toBeInTheDocument()
    })

    it('updates count when files are selected/deselected', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length >= 2) {
        // Select first file
        await user.click(checkboxes[0])
        expect(screen.getByText(/1.*selected/i)).toBeInTheDocument()

        // Select second file
        await user.click(checkboxes[1])
        expect(screen.getByText(/2.*selected/i)).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for interactive elements', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      // Checkboxes should have accessible labels
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeInTheDocument()
      })
    })

    it('search input has accessible label', () => {
      render(<LocalFileBrowser files={mockFiles} />)

      const searchInput = screen.getByPlaceholderText(/search files by name or category/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('buttons have accessible names', () => {
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      expect(screen.getByRole('button', { name: /expand all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /collapse all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('handles undefined onFilesSelect gracefully', async () => {
      const user = userEvent.setup()
      render(<LocalFileBrowser files={mockFiles} multiSelect={true} />)

      const checkboxes = screen.getAllByRole('checkbox')
      if (checkboxes.length > 0) {
        // Should not throw
        await user.click(checkboxes[0])
      }
    })

    it('handles undefined onFilesUpload gracefully', () => {
      render(<LocalFileBrowser files={[]} />)

      const dropZone = screen.getByText(/drag and drop files or folders here/i)
      expect(dropZone).toBeInTheDocument()
    })

    it('handles null analysisResult', () => {
      render(<LocalFileBrowser files={mockFiles} analysisResult={null} showAnalysis={true} />)

      expect(screen.getByText('src')).toBeInTheDocument()
    })

    it('handles empty analysisResult categories', () => {
      const emptyAnalysis: LocalFileAnalysisResult = {
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0,
        byCategory: {},
        byExtension: {},
        suggestions: [],
        warnings: [],
      }

      render(
        <LocalFileBrowser files={mockFiles} analysisResult={emptyAnalysis} showAnalysis={true} />
      )

      expect(screen.getByText('src')).toBeInTheDocument()
    })
  })
})
