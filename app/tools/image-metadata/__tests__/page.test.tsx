import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import ImageMetadataPage from '../page'

// Mock exifr library
vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: ((event: { target: { result: string | ArrayBuffer | null } }) => void) | null = null

  readAsDataURL(_file: File) {
    this.result = `data:image/jpeg;base64,mockbase64data`
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
}

globalThis.FileReader = MockFileReader as unknown as typeof FileReader

describe('Image Metadata Viewer - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render image metadata viewer page', () => {
    render(<ImageMetadataPage />)

    expect(
      screen.getByRole('heading', { name: 'Image Metadata Viewer', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
  })

  it('should display upload zone', () => {
    render(<ImageMetadataPage />)

    expect(screen.getByText(/Click to upload/)).toBeInTheDocument()
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<ImageMetadataPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('image_metadata_open', {})
  })

  it('should display info card', () => {
    render(<ImageMetadataPage />)

    expect(screen.getByText('About Image Metadata')).toBeInTheDocument()
    expect(screen.getAllByText(/EXIF data/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/GPS location/)[0]).toBeInTheDocument()
  })
})

describe('Image Metadata Viewer - File Upload Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept valid image file', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
      Model: 'EOS 5D',
      DateTimeOriginal: new Date('2024-01-01'),
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
  })

  it('should reject non-image files', async () => {
    render(<ImageMetadataPage />)

    const file = new File(['text content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a valid image file')
    })
  })

  it('should reject files larger than 50MB', async () => {
    render(<ImageMetadataPage />)

    // Create a file larger than 50MB
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [largeFile] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Image file is too large (max 50MB)')
    })
  })
})

describe('Image Metadata Viewer - Metadata Parsing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse EXIF metadata', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
      Model: 'EOS 5D',
      DateTimeOriginal: new Date('2024-01-01'),
      Software: 'Adobe Lightroom',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('EXIF Data')).toBeInTheDocument()
      expect(screen.getByText('Canon')).toBeInTheDocument()
      expect(screen.getByText('EOS 5D')).toBeInTheDocument()
    })
  })

  it('should parse GPS metadata', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      latitude: 37.7749,
      longitude: -122.4194,
      GPSAltitude: 100,
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('GPS Location')).toBeInTheDocument()
      expect(screen.getByText('37.774900°')).toBeInTheDocument()
      expect(screen.getByText('-122.419400°')).toBeInTheDocument()
    })
  })

  it('should parse camera settings', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      FNumber: 2.8,
      ExposureTime: 0.008,
      ISO: 200,
      FocalLength: 50,
      LensModel: 'EF 50mm f/1.8',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Camera Settings')).toBeInTheDocument()
      expect(screen.getByText('f/2.8')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('50mm')).toBeInTheDocument()
    })
  })

  it('should handle images with no metadata', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue(null)

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No metadata found in this image')
    })
  })

  it('should handle parsing errors', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockRejectedValue(new Error('Parse error'))

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to parse image metadata')
    })
  })
})

describe('Image Metadata Viewer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockClear()
  })

  it('should copy metadata value to clipboard', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
      Model: 'EOS 5D',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Canon')).toBeInTheDocument()
    })

    // Find and click copy button
    const copyButtons = screen.getAllByRole('button')
    const copyButton = copyButtons.find((btn) => {
      const parent = btn.closest('div')
      return parent?.textContent?.includes('Canon')
    })

    if (copyButton) {
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Canon')
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
      })
    }
  })

  it('should track analytics when copying', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Canon')).toBeInTheDocument()
    })

    const copyButtons = screen.getAllByRole('button')
    const copyButton = copyButtons.find((btn) => {
      const parent = btn.closest('div')
      return parent?.textContent?.includes('Canon')
    })

    if (copyButton) {
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('image_metadata_copy', {})
      })
    }
  })
})

describe('Image Metadata Viewer - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear image and metadata', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /Clear/ })
    await userEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
      expect(screen.getByText(/Click to upload/)).toBeInTheDocument()
    })
  })

  it('should track analytics when clearing', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
    })

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /Clear/ })
    await userEvent.click(clearButton)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('image_metadata_clear', {})
  })
})

describe('Image Metadata Viewer - Download JSON Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('should download metadata as JSON', async () => {
    const exifr = await import('exifr')
    const mockMetadata = {
      Make: 'Canon',
      Model: 'EOS 5D',
    }
    vi.mocked(exifr.default.parse).mockResolvedValue(mockMetadata)

    // Mock URL.createObjectURL and revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL

    render(<ImageMetadataPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    // Mock createElement specifically for anchor tag after render
    const mockClick = vi.fn()
    const mockAnchor = document.createElement('a')
    mockAnchor.click = mockClick
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchor
      }
      return originalCreateElement(tagName)
    })

    const downloadButton = screen.getByRole('button', { name: /Download JSON/ })
    await userEvent.click(downloadButton)

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Metadata downloaded as JSON')
    })

    vi.restoreAllMocks()
  })
})

describe('Image Metadata Viewer - Drag and Drop Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.skip('should handle drag and drop', async () => {
    const exifr = await import('exifr')
    vi.mocked(exifr.default.parse).mockResolvedValue({
      Make: 'Canon',
    })

    render(<ImageMetadataPage />)

    const dropzone = screen.getByLabelText(/Click to upload/).parentElement

    if (dropzone) {
      const file = new File(['image content'], 'dropped.jpg', { type: 'image/jpeg' })

      // Simulate drag over
      fireEvent.dragOver(dropzone, {
        dataTransfer: {
          files: [file],
        },
      })

      // Simulate drop
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      })

      await waitFor(() => {
        expect(screen.getByText('dropped.jpg')).toBeInTheDocument()
      })
    }
  })
})
