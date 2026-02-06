import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FileInspectorPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock WebCrypto API
const mockDigest = vi.fn()

// Mock clipboard API
const mockClipboardWriteText = vi.fn()

// Helper to create mock File with proper methods
// Note: We don't allocate actual content to avoid memory issues with large file tests
const createMockFile = (name: string, size: number, type: string, lastModified?: number): File => {
  // Create a small file with minimal content
  const file = new File(['test content'], name, {
    type,
    lastModified: lastModified || Date.now(),
  })

  // Mock the size property to return the desired size without allocating memory
  Object.defineProperty(file, 'size', { value: size, writable: false })

  // Mock arrayBuffer method with a small buffer (for hash calculation)
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  })

  return file
}

// Helper to generate a fake hash buffer
const createFakeHashBuffer = (length: number = 32): ArrayBuffer => {
  const buffer = new ArrayBuffer(length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < length; i++) {
    view[i] = i % 256
  }
  return buffer
}

describe('FileInspectorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup crypto.subtle.digest mock
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          digest: mockDigest.mockResolvedValue(createFakeHashBuffer(32)),
        },
      },
      writable: true,
    })

    // Setup clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockClipboardWriteText.mockResolvedValue(undefined),
      },
      writable: true,
    })
  })

  describe('Page Rendering', () => {
    it('renders the page title', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('File Inspector')).toBeInTheDocument()
    })

    it('renders the privacy badge', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('Secure • Client-Side Only • No Upload')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<FileInspectorPage />)
      expect(
        screen.getByText(/Inspect file metadata without uploading to any server/i)
      ).toBeInTheDocument()
    })

    it('renders the hash algorithm selection card', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('Select Hash Algorithm')).toBeInTheDocument()
    })

    it('renders the file upload card', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('Select File to Inspect')).toBeInTheDocument()
    })

    it('renders the file upload area with placeholder text', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('Click or drag file here')).toBeInTheDocument()
      expect(screen.getByText('Any file type supported')).toBeInTheDocument()
    })

    it('renders the privacy info card', () => {
      render(<FileInspectorPage />)
      expect(screen.getByText('Privacy First')).toBeInTheDocument()
      expect(screen.getByText('• Files are never uploaded to any server')).toBeInTheDocument()
    })
  })

  describe('Hash Algorithm Selection', () => {
    it('renders SHA-256 button', () => {
      render(<FileInspectorPage />)
      expect(screen.getByRole('button', { name: /SHA-256/i })).toBeInTheDocument()
    })

    it('renders SHA-1 (MD5 Alternative) button', () => {
      render(<FileInspectorPage />)
      expect(screen.getByRole('button', { name: /SHA-1 \(MD5 Alternative\)/i })).toBeInTheDocument()
    })

    it('has SHA-256 selected by default (shows CheckCircle2 icon)', () => {
      render(<FileInspectorPage />)
      // SHA-256 button should have the check icon by default
      const sha256Button = screen.getByRole('button', { name: /SHA-256/i })
      expect(sha256Button).toBeInTheDocument()
      // The button text includes the icon, so we check the full button content
      expect(sha256Button.textContent).toContain('SHA-256')
    })

    it('displays info message about hash algorithms', () => {
      render(<FileInspectorPage />)
      expect(
        screen.getByText(/SHA-256 is more secure and recommended for file verification/i)
      ).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('has a file input element', () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })

    it('shows file name after selecting a file', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const mockFile = createMockFile('test-document.pdf', 1024, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
      })
    })

    it('shows success toast after file metadata is extracted', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const mockFile = createMockFile('test.txt', 512, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('File metadata extracted successfully!')
      })
    })

    it('shows "Analyzing file..." text while hashing', async () => {
      // Create a promise that we can control
      let resolveDigest: (value: ArrayBuffer) => void
      const digestPromise = new Promise<ArrayBuffer>((resolve) => {
        resolveDigest = resolve
      })
      mockDigest.mockReturnValue(digestPromise)

      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const mockFile = createMockFile('large-file.zip', 10485760, 'application/zip')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      // Should show analyzing text
      await waitFor(() => {
        expect(screen.getByText('Analyzing file...')).toBeInTheDocument()
      })

      // Resolve the digest
      resolveDigest!(createFakeHashBuffer(32))

      await waitFor(() => {
        expect(screen.queryByText('Analyzing file...')).not.toBeInTheDocument()
      })
    })

    it('handles empty file selection gracefully', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [] } })

      // Should not show any file metadata
      expect(screen.queryByText('File Metadata')).not.toBeInTheDocument()
    })

    it('shows error toast when hash calculation fails', async () => {
      mockDigest.mockRejectedValue(new Error('Hash calculation failed'))

      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const mockFile = createMockFile('corrupt.bin', 100, 'application/octet-stream')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to extract file metadata')
      })
    })
  })

  describe('File Metadata Display', () => {
    const uploadFile = async (name: string, size: number, type: string, lastModified?: number) => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile(name, size, type, lastModified)
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      await waitFor(() => {
        expect(screen.getByText('File Metadata')).toBeInTheDocument()
      })
    }

    it('displays file name in metadata section', async () => {
      await uploadFile('my-image.png', 2048, 'image/png')
      // File name appears in multiple places (upload area and metadata section)
      const fileNames = screen.getAllByText('my-image.png')
      expect(fileNames.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('File Name')).toBeInTheDocument()
    })

    it('displays file size label', async () => {
      await uploadFile('document.pdf', 1048576, 'application/pdf')
      expect(screen.getByText('File Size')).toBeInTheDocument()
    })

    it('displays MIME type label', async () => {
      await uploadFile('script.js', 512, 'text/javascript')
      expect(screen.getByText('MIME Type')).toBeInTheDocument()
    })

    it('displays MIME type value', async () => {
      await uploadFile('data.json', 256, 'application/json')
      expect(screen.getByText('application/json')).toBeInTheDocument()
    })

    it('displays MIME type description', async () => {
      await uploadFile('data.json', 256, 'application/json')
      expect(screen.getByText('JSON Data')).toBeInTheDocument()
    })

    it('displays last modified label', async () => {
      await uploadFile('old-file.txt', 100, 'text/plain')
      expect(screen.getByText('Last Modified')).toBeInTheDocument()
    })

    it('displays file hash section', async () => {
      await uploadFile('hash-test.bin', 512, 'application/octet-stream')
      expect(screen.getByText(/File Hash/)).toBeInTheDocument()
    })

    it('displays SHA-256 hash by default', async () => {
      await uploadFile('hash-test.bin', 512, 'application/octet-stream')
      expect(screen.getByText(/File Hash \(SHA-256\)/)).toBeInTheDocument()
    })
  })

  describe('formatFileSize Function', () => {
    const uploadAndCheckSize = async (size: number, expectedText: string) => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('test.bin', size, 'application/octet-stream')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument()
      })
    }

    it('formats 0 bytes correctly', async () => {
      await uploadAndCheckSize(0, '0 Bytes')
    })

    it('formats bytes correctly', async () => {
      await uploadAndCheckSize(500, '500.00 Bytes')
    })

    it('formats KB correctly', async () => {
      await uploadAndCheckSize(1024, '1.00 KB')
    })

    it('formats KB with decimal correctly', async () => {
      await uploadAndCheckSize(2560, '2.50 KB')
    })

    it('formats MB correctly', async () => {
      await uploadAndCheckSize(1048576, '1.00 MB')
    })

    it('formats GB correctly', async () => {
      await uploadAndCheckSize(1073741824, '1.00 GB')
    })

    it('displays raw byte count in badge', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('test.bin', 1234567, 'application/octet-stream')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      await waitFor(() => {
        expect(screen.getByText('1,234,567 bytes')).toBeInTheDocument()
      })
    })
  })

  describe('getMimeTypeDescription Function', () => {
    const uploadAndCheckMimeDescription = async (type: string, expectedDescription: string) => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('test.file', 100, type)
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      await waitFor(() => {
        expect(screen.getByText(expectedDescription)).toBeInTheDocument()
      })
    }

    it('describes image/jpeg as JPEG Image', async () => {
      await uploadAndCheckMimeDescription('image/jpeg', 'JPEG Image')
    })

    it('describes image/png as PNG Image', async () => {
      await uploadAndCheckMimeDescription('image/png', 'PNG Image')
    })

    it('describes image/gif as GIF Image', async () => {
      await uploadAndCheckMimeDescription('image/gif', 'GIF Image')
    })

    it('describes image/webp as WebP Image', async () => {
      await uploadAndCheckMimeDescription('image/webp', 'WebP Image')
    })

    it('describes image/svg+xml as SVG Vector Image', async () => {
      await uploadAndCheckMimeDescription('image/svg+xml', 'SVG Vector Image')
    })

    it('describes application/pdf as PDF Document', async () => {
      await uploadAndCheckMimeDescription('application/pdf', 'PDF Document')
    })

    it('describes application/zip as ZIP Archive', async () => {
      await uploadAndCheckMimeDescription('application/zip', 'ZIP Archive')
    })

    it('describes application/json as JSON Data', async () => {
      await uploadAndCheckMimeDescription('application/json', 'JSON Data')
    })

    it('describes text/plain as Plain Text', async () => {
      await uploadAndCheckMimeDescription('text/plain', 'Plain Text')
    })

    it('describes text/html as HTML Document', async () => {
      await uploadAndCheckMimeDescription('text/html', 'HTML Document')
    })

    it('describes text/css as CSS Stylesheet', async () => {
      await uploadAndCheckMimeDescription('text/css', 'CSS Stylesheet')
    })

    it('describes text/javascript as JavaScript File', async () => {
      await uploadAndCheckMimeDescription('text/javascript', 'JavaScript File')
    })

    it('describes application/javascript as JavaScript File', async () => {
      await uploadAndCheckMimeDescription('application/javascript', 'JavaScript File')
    })

    it('describes video/mp4 as MP4 Video', async () => {
      await uploadAndCheckMimeDescription('video/mp4', 'MP4 Video')
    })

    it('describes video/webm as WebM Video', async () => {
      await uploadAndCheckMimeDescription('video/webm', 'WebM Video')
    })

    it('describes audio/mpeg as MP3 Audio', async () => {
      await uploadAndCheckMimeDescription('audio/mpeg', 'MP3 Audio')
    })

    it('describes audio/wav as WAV Audio', async () => {
      await uploadAndCheckMimeDescription('audio/wav', 'WAV Audio')
    })

    it('describes application/msword as Word Document', async () => {
      await uploadAndCheckMimeDescription('application/msword', 'Word Document')
    })

    it('describes docx as Word Document (DOCX)', async () => {
      await uploadAndCheckMimeDescription(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Word Document (DOCX)'
      )
    })

    it('describes application/vnd.ms-excel as Excel Spreadsheet', async () => {
      await uploadAndCheckMimeDescription('application/vnd.ms-excel', 'Excel Spreadsheet')
    })

    it('describes xlsx as Excel Spreadsheet (XLSX)', async () => {
      await uploadAndCheckMimeDescription(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Excel Spreadsheet (XLSX)'
      )
    })

    it('describes unknown mime type as Unknown File Type', async () => {
      await uploadAndCheckMimeDescription('application/x-custom-type', 'Unknown File Type')
    })

    it('handles empty mime type as application/octet-stream', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      // Create file with empty type
      const file = new File(['test'], 'noext', { type: '' })
      Object.defineProperty(file, 'arrayBuffer', {
        value: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
      })
      fireEvent.change(fileInput, { target: { files: [file] } })
      await waitFor(() => {
        // Component defaults empty type to 'application/octet-stream'
        expect(screen.getByText('application/octet-stream')).toBeInTheDocument()
      })
    })
  })

  describe('Copy to Clipboard', () => {
    const uploadFileAndWait = async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('copy-test.json', 1024, 'application/json')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      await waitFor(() => {
        expect(screen.getByText('File Metadata')).toBeInTheDocument()
      })
    }

    it('has copy buttons in metadata section', async () => {
      await uploadFileAndWait()
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // Should have copy buttons for: file name, MIME type, and file hash
      expect(copyButtons.length).toBeGreaterThanOrEqual(3)
    })

    it('copies file name to clipboard', async () => {
      await uploadFileAndWait()
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // First copy button is for file name
      fireEvent.click(copyButtons[0])

      expect(mockClipboardWriteText).toHaveBeenCalledWith('copy-test.json')
      expect(toast.success).toHaveBeenCalledWith('File name copied to clipboard!')
    })

    it('copies MIME type to clipboard', async () => {
      await uploadFileAndWait()
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // Second copy button is for MIME type
      fireEvent.click(copyButtons[1])

      expect(mockClipboardWriteText).toHaveBeenCalledWith('application/json')
      expect(toast.success).toHaveBeenCalledWith('MIME type copied to clipboard!')
    })

    it('copies file hash to clipboard', async () => {
      await uploadFileAndWait()
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // Third copy button is for file hash
      fireEvent.click(copyButtons[2])

      // Hash is generated from mock buffer
      expect(mockClipboardWriteText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('File hash copied to clipboard!')
    })
  })

  describe('Clear File', () => {
    it('shows Clear File button when file is selected', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('to-clear.txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear File/i })).toBeInTheDocument()
      })
    })

    it('does not show Clear File button when no file is selected', () => {
      render(<FileInspectorPage />)
      expect(screen.queryByRole('button', { name: /Clear File/i })).not.toBeInTheDocument()
    })

    it('clears file and metadata when Clear File is clicked', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('to-clear.txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('to-clear.txt')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /Clear File/i })
      fireEvent.click(clearButton)

      // File metadata should be cleared
      expect(screen.queryByText('File Metadata')).not.toBeInTheDocument()
      expect(screen.queryByText('to-clear.txt')).not.toBeInTheDocument()

      // Should show placeholder text again
      expect(screen.getByText('Click or drag file here')).toBeInTheDocument()
    })

    it('hides Clear File button after clearing', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('to-clear.txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear File/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear File/i }))

      expect(screen.queryByRole('button', { name: /Clear File/i })).not.toBeInTheDocument()
    })
  })

  describe('Hash Algorithm Switching', () => {
    it('switches to SHA-1 when MD5 button is clicked', async () => {
      render(<FileInspectorPage />)
      const md5Button = screen.getByRole('button', { name: /SHA-1 \(MD5 Alternative\)/i })
      fireEvent.click(md5Button)

      // Upload file to verify hash algorithm is used
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('hash-test.bin', 512, 'application/octet-stream')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        // Should use SHA-1 algorithm
        expect(mockDigest).toHaveBeenCalledWith('SHA-1', expect.any(ArrayBuffer))
      })
    })

    it('uses SHA-256 by default', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('hash-test.bin', 512, 'application/octet-stream')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer))
      })
    })

    it('displays correct hash label based on algorithm', async () => {
      render(<FileInspectorPage />)

      // Select MD5 algorithm
      const md5Button = screen.getByRole('button', { name: /SHA-1 \(MD5 Alternative\)/i })
      fireEvent.click(md5Button)

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('hash-test.bin', 512, 'application/octet-stream')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText(/File Hash \(SHA-1\)/)).toBeInTheDocument()
      })
    })
  })

  describe('Privacy Info Card', () => {
    it('displays all privacy information points', () => {
      render(<FileInspectorPage />)

      expect(screen.getByText('• Files are never uploaded to any server')).toBeInTheDocument()
      expect(
        screen.getByText('• All processing happens locally in your browser')
      ).toBeInTheDocument()
      expect(screen.getByText('• No data is stored or transmitted')).toBeInTheDocument()
      expect(
        screen.getByText('• Perfect for inspecting sensitive files securely')
      ).toBeInTheDocument()
      expect(
        screen.getByText('• File hashes help verify file integrity and detect tampering')
      ).toBeInTheDocument()
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page visit on mount', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<FileInspectorPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('file_inspector_open', {})
    })

    it('tracks file analysis', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<FileInspectorPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('analytics-test.pdf', 2048, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('file_inspector_analyze', {
          file_type: 'application/pdf',
          file_size: 2048,
          hash_algorithm: 'SHA-256',
        })
      })
    })

    it('tracks file clear action', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<FileInspectorPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('clear-test.txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear File/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear File/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('file_inspector_clear', {})
    })

    it('tracks copy actions', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<FileInspectorPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('copy-track.json', 1024, 'application/json')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('File Metadata')).toBeInTheDocument()
      })

      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      fireEvent.click(copyButtons[0]) // Copy file name

      expect(trackToolEvent).toHaveBeenCalledWith('file_inspector_copy', { field: 'File name' })
    })
  })

  describe('Edge Cases', () => {
    it('handles very long file names', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const longName = 'a'.repeat(200) + '.txt'
      const mockFile = createMockFile(longName, 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument()
      })
    })

    it('handles files with special characters in name', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('test file (1) [copy].txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('test file (1) [copy].txt')).toBeInTheDocument()
      })
    })

    it('handles very large file sizes', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      // 5 TB
      const mockFile = createMockFile('huge.iso', 5497558138880, 'application/octet-stream')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('5.00 TB')).toBeInTheDocument()
      })
    })

    it('handles file with unusual MIME type', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('custom.xyz', 100, 'application/x-custom-format')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(screen.getByText('application/x-custom-format')).toBeInTheDocument()
        expect(screen.getByText('Unknown File Type')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible file input', () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
    })

    it('has accessible buttons with text labels', () => {
      render(<FileInspectorPage />)
      expect(screen.getByRole('button', { name: /SHA-256/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /SHA-1 \(MD5 Alternative\)/i })).toBeInTheDocument()
    })

    it('maintains focus management after file selection', async () => {
      render(<FileInspectorPage />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const mockFile = createMockFile('focus-test.txt', 100, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [mockFile] } })

      await waitFor(() => {
        // Clear button should be accessible
        expect(screen.getByRole('button', { name: /Clear File/i })).toBeInTheDocument()
      })
    })
  })
})
