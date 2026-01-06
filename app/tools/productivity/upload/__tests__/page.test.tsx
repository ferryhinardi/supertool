import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UploadPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockTrackToolEvent = vi.fn()
const mockTrackEvent = vi.fn()

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
  trackEvent: mockTrackEvent,
}))

const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}))

describe('Cloud File Upload Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpload.mockResolvedValue({ data: {}, error: null })
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/test-file.pdf' },
    })
  })

  describe('Basic Rendering', () => {
    it('should render the page without crashing', () => {
      render(<UploadPage />)
      expect(screen.getAllByText(/Upload|File/i)[0]).toBeTruthy()
    })

    it('should display the main heading', () => {
      render(<UploadPage />)
      expect(screen.getByText('File Upload')).toBeTruthy()
    })

    it('should display the subtitle', () => {
      render(<UploadPage />)
      expect(screen.getByText(/Upload files to cloud storage with instant sharing/i)).toBeTruthy()
    })

    it('should display upload area', () => {
      render(<UploadPage />)
      const elements = screen.queryAllByText(/Drop|Choose|Upload|File/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should display drag and drop zone', () => {
      render(<UploadPage />)
      // DragDropZone component should be rendered
      const dropZone = screen.getAllByText(/click to upload|drag and drop/i)[0]
      expect(dropZone).toBeTruthy()
    })
  })

  describe('Information Cards', () => {
    it('should display upload information section', () => {
      render(<UploadPage />)
      expect(screen.getByText('Upload Information')).toBeTruthy()
    })

    it('should display max file size info', () => {
      render(<UploadPage />)
      expect(screen.getByText('Max file size')).toBeTruthy()
      expect(screen.getByText('10 MB')).toBeTruthy()
    })

    it('should display storage provider info', () => {
      render(<UploadPage />)
      expect(screen.getByText('Storage')).toBeTruthy()
      expect(screen.getByText('Supabase Cloud')).toBeTruthy()
    })

    it('should display URL type info', () => {
      render(<UploadPage />)
      expect(screen.getByText('URL Type')).toBeTruthy()
      expect(screen.getByText('Public CDN')).toBeTruthy()
    })

    it('should display security message', () => {
      render(<UploadPage />)
      expect(
        screen.getByText(/Files are stored securely in cloud storage with instant CDN delivery/i)
      ).toBeTruthy()
    })
  })

  describe('File Selection', () => {
    it('should handle file selection via input', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' })

      // Find the file input (it might be hidden but accessible)
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThan(0)

      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Selected: test-file.pdf')
      })
    })

    it('should display selected file name', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test content'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('document.docx')).toBeTruthy()
      })
    })

    it('should display file size', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['x'.repeat(1024)], 'test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/1 KB/i)).toBeTruthy()
      })
    })

    it('should display file type', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test'], 'image.png', { type: 'image/png' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/image\/png/i)).toBeTruthy()
      })
    })

    it('should show badge for valid file type', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test'], 'data.json', { type: 'application/json' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Valid')).toBeTruthy()
      })
    })

    it('should show no type badge for files without type', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test'], 'unknown-file', { type: '' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('No type')).toBeTruthy()
      })
    })
  })

  describe('Upload Functionality', () => {
    it('should display upload button after file selection', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })
    })

    it('should handle successful file upload', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['test content'], 'success.pdf', { type: 'application/pdf' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('File uploaded successfully! 🎉')
      })
    })

    it('should show uploading state during upload', async () => {
      const user = userEvent.setup()
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 100))
      )

      render(<UploadPage />)

      const file = new File(['content'], 'loading.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      // During upload, button text should change
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        const uploadButton = buttons.find((btn) => btn.textContent?.match(/uploading/i))
        expect(uploadButton).toBeTruthy()
      })
    })

    it('should show upload progress', async () => {
      const user = userEvent.setup()
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 100))
      )

      render(<UploadPage />)

      const file = new File(['content'], 'progress.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText(/uploading to cloud storage/i)).toBeTruthy()
      })
    })

    it('should disable upload button during upload', async () => {
      const user = userEvent.setup()
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null }), 100))
      )

      render(<UploadPage />)

      const file = new File(['content'], 'disable.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud').closest('button')
      await user.click(uploadButton!)

      // Button should be disabled during upload
      await waitFor(() => {
        expect(uploadButton).toBeDisabled()
      })
    })

    it('should handle upload error', async () => {
      const user = userEvent.setup()
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Storage quota exceeded' },
      })

      render(<UploadPage />)

      const file = new File(['content'], 'error.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/Upload failed:/))
      })
    })

    it('should handle unknown upload error', async () => {
      const user = userEvent.setup()
      mockUpload.mockResolvedValue({
        data: null,
        error: 'Unknown error',
      })

      render(<UploadPage />)

      const file = new File(['content'], 'unknown-error.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Upload failed: Unknown error')
      })
    })
  })

  describe('Success State', () => {
    it('should display success message after upload', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'complete.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText(/upload successful/i)).toBeTruthy()
      })
    })

    it('should display success description', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'uploaded.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText(/Your file is now available via a public URL/i)).toBeTruthy()
      })
    })

    it('should display public URL after successful upload', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'url-test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getAllByText(/public url/i)[0]).toBeTruthy()
        const urlInput = screen.getByDisplayValue('https://example.com/test-file.pdf')
        expect(urlInput).toBeTruthy()
      })
    })

    it('should display file details in success state', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'details.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText(/file name/i)).toBeTruthy()
        expect(screen.getByText(/size:/i)).toBeTruthy()
      })
    })
  })

  describe('Copy URL Functionality', () => {
    it('should copy URL to clipboard', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'copy-test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-file.pdf')).toBeTruthy()
      })

      // Find copy button (icon button)
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.querySelector('svg'))
      expect(copyButton).toBeTruthy()

      if (copyButton) {
        await user.click(copyButton)

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('URL copied to clipboard! 📋')
        })
      }
    })

    it('should show check icon after copying', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'check-icon.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://example.com/test-file.pdf')).toBeTruthy()
      })

      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.querySelector('svg'))

      if (copyButton) {
        await user.click(copyButton)
        // Check icon should appear (component state changes)
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalled()
        })
      }
    })

    it('should have external link button', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'external.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        const link = document.querySelector('a[href="https://example.com/test-file.pdf"]')
        expect(link).toBeTruthy()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should display reset button after successful upload', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'reset-test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Upload Another File')).toBeTruthy()
      })
    })

    it('should reset to initial state when clicking reset', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'reset-complete.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText('Upload Another File')).toBeTruthy()
      })

      const resetButton = screen.getByText('Upload Another File')
      await user.click(resetButton)

      await waitFor(() => {
        // Should return to initial drag-drop state
        expect(screen.queryByText('Upload Successful!')).toBeNull()
      })
    })
  })

  describe('File Size Formatting', () => {
    it('should format bytes correctly', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['x'], 'tiny.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/1 Bytes/i)).toBeTruthy()
      })
    })

    it('should format kilobytes correctly', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['x'.repeat(2048)], 'medium.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/KB/i)).toBeTruthy()
      })
    })

    it('should format megabytes correctly', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['x'.repeat(1024 * 1024 * 2)], 'large.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        const mbElements = screen.getAllByText(/MB/i)
        expect(mbElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should not upload without file selection', async () => {
      render(<UploadPage />)
      // Upload button should not be visible without file selection
      expect(screen.queryByText('Upload to Cloud')).toBeNull()
    })

    it('should handle zero-size files', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File([], 'empty.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/0.*bytes/i)).toBeTruthy()
      })
    })

    it('should reset progress on new file selection', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file1 = new File(['content1'], 'first.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file1)

      await waitFor(() => {
        expect(screen.getByText('first.txt')).toBeTruthy()
      })

      // Select another file
      const file2 = new File(['content2'], 'second.txt', { type: 'text/plain' })
      await user.upload(fileInput, file2)

      await waitFor(() => {
        expect(screen.getByText('second.txt')).toBeTruthy()
        // Old file name should not be visible
        expect(screen.queryByText('first.txt')).toBeNull()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible main element', () => {
      render(<UploadPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<UploadPage />)
      const h1 = screen.getByText('File Upload')
      expect(h1.tagName).toBe('H1')
    })

    it('should have readonly URL input', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'readonly.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        const urlInput = screen.getByDisplayValue('https://example.com/test-file.pdf')
        expect(urlInput).toHaveAttribute('readonly')
      })
    })

    it('should have external link with proper attributes', async () => {
      const user = userEvent.setup()
      render(<UploadPage />)

      const file = new File(['content'], 'link-test.txt', { type: 'text/plain' })

      const fileInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = fileInputs[0] as HTMLInputElement
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Upload to Cloud')).toBeTruthy()
      })

      const uploadButton = screen.getByText('Upload to Cloud')
      await user.click(uploadButton)

      await waitFor(() => {
        const link = document.querySelector('a[href="https://example.com/test-file.pdf"]')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('Clipboard Support', () => {
    it('should have clipboard available for copy operations', () => {
      expect(navigator.clipboard).toBeTruthy()
      expect(navigator.clipboard.writeText).toBeTruthy()
    })
  })
})
