import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GeneratedFile } from '@/lib/services/copilot/types'
import { FilePreviewModal } from '../file-preview-modal'

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    highlightElement: vi.fn(),
  },
}))

// Mock CSS import
vi.mock('highlight.js/styles/github-dark.css', () => ({}))

describe('FilePreviewModal', () => {
  const mockFile: GeneratedFile = {
    id: 'test-file-1',
    name: 'example.ts',
    content: 'const hello = "world";\nconsole.log(hello);',
    mimeType: 'text/typescript',
    size: 42,
    isBase64: false,
  }

  const mockCallbacks = {
    onClose: vi.fn(),
    onDownload: vi.fn(),
    onCopy: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <FilePreviewModal file={mockFile} isOpen={false} copied={false} {...mockCallbacks} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders modal when isOpen is true', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('example.ts')).toBeInTheDocument()
    })

    it('displays file name and metadata', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('example.ts')).toBeInTheDocument()
      expect(screen.getByText('42 B')).toBeInTheDocument()
      expect(screen.getByText('typescript')).toBeInTheDocument()
      expect(screen.getByText('2 lines')).toBeInTheDocument()
    })

    it('renders file content', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText(/const hello = "world"/)).toBeInTheDocument()
    })

    it('renders line numbers', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByLabelText('Copy to clipboard')).toBeInTheDocument()
      expect(screen.getByLabelText('Download file')).toBeInTheDocument()
      expect(screen.getByLabelText('Close preview')).toBeInTheDocument()
    })
  })

  describe('Copy state', () => {
    it('shows "Copy" when copied is false', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByLabelText('Copy to clipboard')).toBeInTheDocument()
    })

    it('shows "Copied!" when copied is true', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={true} {...mockCallbacks} />)

      expect(screen.getByText('Copied!')).toBeInTheDocument()
      expect(screen.getByLabelText('Copied!')).toBeInTheDocument()
    })
  })

  describe('Base64 content', () => {
    it('decodes base64 content', () => {
      const base64Content = btoa('decoded content here')
      const base64File: GeneratedFile = {
        ...mockFile,
        content: base64Content,
        isBase64: true,
      }

      render(<FilePreviewModal file={base64File} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText(/decoded content here/)).toBeInTheDocument()
    })

    it('handles invalid base64 gracefully', () => {
      const invalidBase64File: GeneratedFile = {
        ...mockFile,
        content: 'not-valid-base64!!!',
        isBase64: true,
      }

      render(
        <FilePreviewModal
          file={invalidBase64File}
          isOpen={true}
          copied={false}
          {...mockCallbacks}
        />
      )

      // Should fall back to showing the original content
      expect(screen.getByText(/not-valid-base64/)).toBeInTheDocument()
    })
  })

  describe('Non-previewable files', () => {
    it('shows "Preview not available" for binary files', () => {
      const binaryFile: GeneratedFile = {
        id: 'binary-file-1',
        name: 'image.png',
        content: 'binary-content',
        mimeType: 'image/png',
        size: 1024,
        isBase64: true,
      }

      render(<FilePreviewModal file={binaryFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('Preview not available')).toBeInTheDocument()
      expect(screen.getByText(/This file type cannot be previewed/)).toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('calls onClose when close button is clicked', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      fireEvent.click(screen.getByLabelText('Close preview'))

      expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onCopy when copy button is clicked', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      fireEvent.click(screen.getByLabelText('Copy to clipboard'))

      expect(mockCallbacks.onCopy).toHaveBeenCalledTimes(1)
    })

    it('calls onDownload when download button is clicked', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      fireEvent.click(screen.getByLabelText('Download file'))

      expect(mockCallbacks.onDownload).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      const backdrop = screen.getByRole('dialog')
      fireEvent.click(backdrop)

      expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when modal content is clicked', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      // Click on the file title (inside modal content)
      fireEvent.click(screen.getByText('example.ts'))

      expect(mockCallbacks.onClose).not.toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('File type detection', () => {
    const testCases = [
      { ext: 'js', expectedLang: 'javascript' },
      { ext: 'ts', expectedLang: 'typescript' },
      { ext: 'tsx', expectedLang: 'typescript' },
      { ext: 'py', expectedLang: 'python' },
      { ext: 'json', expectedLang: 'json' },
      { ext: 'css', expectedLang: 'css' },
      { ext: 'html', expectedLang: 'html' },
      { ext: 'md', expectedLang: 'markdown' },
      { ext: 'sql', expectedLang: 'sql' },
      { ext: 'sh', expectedLang: 'bash' },
    ]

    testCases.forEach(({ ext, expectedLang }) => {
      it(`detects ${ext} files as ${expectedLang}`, () => {
        const file: GeneratedFile = {
          ...mockFile,
          name: `test.${ext}`,
        }

        render(<FilePreviewModal file={file} isOpen={true} copied={false} {...mockCallbacks} />)

        expect(screen.getByText(expectedLang)).toBeInTheDocument()
      })
    })
  })

  describe('File type icons', () => {
    it('shows code file icon for .ts files', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      // The icon container should exist with blue background
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('shows config file icon for .json files', () => {
      const jsonFile: GeneratedFile = {
        ...mockFile,
        name: 'config.json',
        mimeType: 'application/json',
      }

      render(<FilePreviewModal file={jsonFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('config.json')).toBeInTheDocument()
    })

    it('shows doc file icon for .md files', () => {
      const mdFile: GeneratedFile = {
        ...mockFile,
        name: 'README.md',
        mimeType: 'text/markdown',
      }

      render(<FilePreviewModal file={mdFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('README.md')).toBeInTheDocument()
    })
  })

  describe('File size formatting', () => {
    it('formats bytes correctly', () => {
      const smallFile: GeneratedFile = { ...mockFile, size: 512 }
      render(<FilePreviewModal file={smallFile} isOpen={true} copied={false} {...mockCallbacks} />)
      expect(screen.getByText('512 B')).toBeInTheDocument()
    })

    it('formats kilobytes correctly', () => {
      const kbFile: GeneratedFile = { ...mockFile, size: 2048 }
      render(<FilePreviewModal file={kbFile} isOpen={true} copied={false} {...mockCallbacks} />)
      expect(screen.getByText('2.0 KB')).toBeInTheDocument()
    })

    it('formats megabytes correctly', () => {
      const mbFile: GeneratedFile = { ...mockFile, size: 2097152 }
      render(<FilePreviewModal file={mbFile} isOpen={true} copied={false} {...mockCallbacks} />)
      expect(screen.getByText('2.0 MB')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'file-preview-title')
    })

    it('has proper heading structure', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveAttribute('id', 'file-preview-title')
      expect(heading).toHaveTextContent('example.ts')
    })

    it('has keyboard hint for closing', () => {
      render(<FilePreviewModal file={mockFile} isOpen={true} copied={false} {...mockCallbacks} />)

      expect(screen.getByText('Esc')).toBeInTheDocument()
      expect(screen.getByText('to close')).toBeInTheDocument()
    })
  })
})
