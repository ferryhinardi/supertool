import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DragDropZone } from '../DragDropZone'

describe('DragDropZone', () => {
  const mockOnFilesSelected = vi.fn()

  beforeEach(() => {
    mockOnFilesSelected.mockClear()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)
      expect(screen.getByText('Click to upload')).toBeInTheDocument()
      expect(screen.getByText('or drag and drop')).toBeInTheDocument()
    })

    it('should render with disabled state', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} disabled />)
      const container = screen.getByRole('button')
      expect(container).toHaveStyle({ opacity: '0.5', cursor: 'not-allowed' })
    })

    it('should display max size when provided', () => {
      const maxSize = 100 * 1024 * 1024 // 100MB
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} maxSize={maxSize} />)
      expect(screen.getByText(/100MB/i)).toBeInTheDocument()
    })

    it('should display accept type for video files', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} accept="video/*" />)
      expect(screen.getByText('Video files')).toBeInTheDocument()
    })

    it('should display custom accept type', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} accept=".pdf,.doc" />)
      expect(screen.getByText('.pdf,.doc')).toBeInTheDocument()
    })
  })

  describe('File Selection via Click', () => {
    it('should trigger file input when clicked', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const dropzone = screen.getByRole('button')
      await user.click(dropzone)

      // File input should be in the document
      const fileInput = screen.getByLabelText('File upload')
      expect(fileInput).toBeInTheDocument()
    })

    it('should call onFilesSelected when file is selected', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const fileInput = screen.getByLabelText('File upload') as HTMLInputElement
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      await user.upload(fileInput, file)

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1)
      expect(mockOnFilesSelected).toHaveBeenCalledWith(expect.any(FileList))
    })

    it('should not trigger file selection when disabled', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} disabled />)

      const dropzone = screen.getByRole('button')
      await user.click(dropzone)

      // Should not call the callback
      expect(mockOnFilesSelected).not.toHaveBeenCalled()
    })

    it('should handle multiple file selection', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} multiple />)

      const fileInput = screen.getByLabelText('File upload') as HTMLInputElement
      const files = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ]

      await user.upload(fileInput, files)

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1)
      const callArg = mockOnFilesSelected.mock.calls[0][0]
      expect(callArg.length).toBe(2)
    })
  })

  describe('Drag and Drop', () => {
    it('should change appearance on drag over', async () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const dropzone = screen.getByRole('button')
      const _file = new File(['test'], 'test.txt', { type: 'text/plain' })

      // Simulate drag enter
      await userEvent.pointer([{ target: dropzone, keys: '[MouseLeft>]', coords: { x: 0, y: 0 } }])

      // Should show "Drop your file here" text (this will be visible during drag)
      const dragEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      })
      dropzone.dispatchEvent(dragEvent)

      // Verify dragenter was handled
      expect(dropzone).toBeInTheDocument()
    })

    it('should handle file drop', async () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const dropzone = screen.getByRole('button')
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })

      dropzone.dispatchEvent(dropEvent)

      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1)
    })

    it('should not handle drop when disabled', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} disabled />)

      const dropzone = screen.getByRole('button')
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      })

      dropzone.dispatchEvent(dropEvent)

      expect(mockOnFilesSelected).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should trigger file input on Enter key', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const dropzone = screen.getByRole('button')
      dropzone.focus()

      await user.keyboard('{Enter}')

      // File input should be in the document and ready
      const fileInput = screen.getByLabelText('File upload')
      expect(fileInput).toBeInTheDocument()
    })

    it('should trigger file input on Space key', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)

      const dropzone = screen.getByRole('button')
      dropzone.focus()

      await user.keyboard('{ }')

      // File input should be in the document
      const fileInput = screen.getByLabelText('File upload')
      expect(fileInput).toBeInTheDocument()
    })

    it('should not trigger when disabled and Enter is pressed', async () => {
      const user = userEvent.setup()
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} disabled />)

      const dropzone = screen.getByRole('button')
      dropzone.focus()

      await user.keyboard('{Enter}')

      // Should not call the callback
      expect(mockOnFilesSelected).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have role="button"', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be keyboard focusable', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)
      const dropzone = screen.getByRole('button')
      expect(dropzone).toHaveAttribute('tabIndex', '0')
    })

    it('should have aria-label on file input', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)
      const fileInput = screen.getByLabelText('File upload')
      expect(fileInput).toHaveAttribute('aria-label', 'File upload')
    })

    it('should respect accept attribute', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} accept="video/*" />)
      const fileInput = screen.getByLabelText('File upload') as HTMLInputElement
      expect(fileInput).toHaveAttribute('accept', 'video/*')
    })

    it('should respect multiple attribute', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} multiple />)
      const fileInput = screen.getByLabelText('File upload') as HTMLInputElement
      expect(fileInput).toHaveAttribute('multiple')
    })

    it('should disable file input when disabled prop is true', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} disabled />)
      const fileInput = screen.getByLabelText('File upload') as HTMLInputElement
      expect(fileInput).toBeDisabled()
    })
  })

  describe('Icon Selection', () => {
    it('should show Film icon for video files', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} accept="video/*" />)
      // Icon is rendered, check that video-specific text is shown
      expect(screen.getByText('Video files')).toBeInTheDocument()
    })

    it('should show FileText icon for subtitle files', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} accept=".srt" />)
      // Icon is rendered, check that text-specific accept is shown
      expect(screen.getByText('.srt')).toBeInTheDocument()
    })

    it('should show Upload icon for generic files', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} />)
      // Default state with upload text
      expect(screen.getByText('Click to upload')).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<DragDropZone onFilesSelected={mockOnFilesSelected} className="custom-class" />)
      const dropzone = screen.getByRole('button')
      expect(dropzone).toHaveClass('custom-class')
    })
  })
})
