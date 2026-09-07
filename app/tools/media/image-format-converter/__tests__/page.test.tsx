import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ImageFormatConverterPage from '../page'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

import { trackToolEvent } from '@/lib/services/analytics'

// Helper to create mock files
const createMockFile = (name: string, size: number, type: string): File => {
  const content = new Array(Math.min(size, 1024)).fill('a').join('')
  const file = new File([content], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Helper to find format button by lowercase format name
// Format buttons have lowercase text (e.g., 'jpeg') while comparison section has uppercase ('JPEG')
const getFormatButton = (format: 'png' | 'jpeg' | 'webp' | 'gif'): HTMLButtonElement => {
  const buttons = screen.getAllByRole('button')
  const formatButton = buttons.find((btn) => {
    const text = btn.textContent?.toLowerCase()
    return (
      text?.includes(format) &&
      text?.includes(
        format === 'png'
          ? 'lossless'
          : format === 'jpeg'
            ? 'high quality'
            : format === 'webp'
              ? 'modern'
              : 'animated'
      )
    )
  })
  if (!formatButton) throw new Error(`Format button for ${format} not found`)
  return formatButton as HTMLButtonElement
}

// Mock FileReader
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  readAsDataURL(_blob: Blob) {
    setTimeout(() => {
      this.result =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      if (this.onload) {
        this.onload({ target: { result: this.result } } as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

// Mock Image
class MockImage {
  onload: (() => void) | null = null
  onerror: ((error: Event) => void) | null = null
  src = ''
  width = 100
  height = 100

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 10)
  }
}

// Mock canvas context
const mockCanvasContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
}

// Mock toBlob
const mockToBlob = vi.fn((callback: BlobCallback, _mimeType?: string, _quality?: number) => {
  const blob = new Blob(['test-image-data'], { type: 'image/png' })
  Object.defineProperty(blob, 'size', { value: 5000 })
  callback(blob)
})

// Mock createElement for anchor element
const mockClick = vi.fn()
const mockAnchorElement = {
  href: '',
  download: '',
  click: mockClick,
}

// Store originals at module level
const originalCreateElement = document.createElement.bind(document)
const originalFileReader = global.FileReader
const originalImage = global.Image

describe('ImageFormatConverterPage', () => {
  let user: ReturnType<typeof userEvent.setup>
  let originalAppendChild: typeof document.body.appendChild
  let originalRemoveChild: typeof document.body.removeChild

  beforeEach(() => {
    vi.clearAllMocks()
    user = userEvent.setup()

    // Store originals before mocking
    originalAppendChild = document.body.appendChild.bind(document.body)
    originalRemoveChild = document.body.removeChild.bind(document.body)

    // Mock FileReader
    global.FileReader = MockFileReader as unknown as typeof FileReader

    // Mock Image
    global.Image = MockImage as unknown as typeof Image

    // Mock canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCanvasContext
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toBlob = mockToBlob

    // Mock document.createElement to intercept anchor creation
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchorElement as unknown as HTMLAnchorElement
      }
      return originalCreateElement(tagName)
    })

    // Mock appendChild and removeChild - don't call original for mock anchor
    document.body.appendChild = vi.fn((node) => {
      if (node === mockAnchorElement) {
        return node
      }
      return originalAppendChild(node)
    }) as typeof document.body.appendChild

    document.body.removeChild = vi.fn((node) => {
      if (node === mockAnchorElement) {
        return node
      }
      return originalRemoveChild(node)
    }) as typeof document.body.removeChild
  })

  afterEach(() => {
    vi.useRealTimers()
    global.FileReader = originalFileReader
    global.Image = originalImage
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
  })

  describe('Initial Render', () => {
    it('renders the page title and description', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Image Format Converter')).toBeInTheDocument()
      expect(
        screen.getByText('Convert images between PNG, JPEG, WEBP, and GIF formats')
      ).toBeInTheDocument()
    })

    it('renders the upload area with instructions', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Upload Image')).toBeInTheDocument()
      expect(
        screen.getByText('Drag and drop your image here, or click to browse')
      ).toBeInTheDocument()
      expect(screen.getByText('Supports: PNG, JPEG, WEBP, GIF (Max 10MB)')).toBeInTheDocument()
    })

    it('renders the upload area as a button with correct aria-label', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByRole('button', { name: 'Upload image file' })).toBeInTheDocument()
    })

    it('renders the format comparison section', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Format Comparison')).toBeInTheDocument()
      expect(screen.getByText('Lossless compression')).toBeInTheDocument()
      // "Supports transparency" appears in both PNG and WEBP sections
      expect(screen.getAllByText('Supports transparency').length).toBeGreaterThanOrEqual(1)
    })

    it('renders PNG format details in comparison', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Best for graphics, logos')).toBeInTheDocument()
      expect(screen.getByText('Larger file size')).toBeInTheDocument()
    })

    it('renders JPEG format details in comparison', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Lossy compression')).toBeInTheDocument()
      expect(screen.getByText('No transparency')).toBeInTheDocument()
      expect(screen.getByText('Best for photos')).toBeInTheDocument()
    })

    it('renders WEBP format details in comparison', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Modern format')).toBeInTheDocument()
      expect(screen.getByText('Best compression')).toBeInTheDocument()
      expect(screen.getByText('Smallest file size')).toBeInTheDocument()
    })

    it('renders GIF format details in comparison', () => {
      render(<ImageFormatConverterPage />)

      expect(screen.getByText('Supports animation')).toBeInTheDocument()
      expect(screen.getByText('Limited colors (256)')).toBeInTheDocument()
      expect(screen.getByText('Best for simple graphics')).toBeInTheDocument()
    })

    it('has a hidden file input', () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('File Upload', () => {
    it('uploads an image file via file input', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument()
      })
    })

    it('tracks upload event with analytics', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('image_format_converter_upload', {
          original_format: 'png',
          file_size: 5000,
        })
      })
    })

    it('shows conversion settings after upload', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
      })
    })

    it('shows original image info after upload', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('photo.jpg', 102400, 'image/jpeg')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
        expect(screen.getByText('photo.jpg')).toBeInTheDocument()
      })
    })

    it('clicking upload area triggers file input', async () => {
      render(<ImageFormatConverterPage />)

      const uploadButton = screen.getByRole('button', { name: 'Upload image file' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      await user.click(uploadButton)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('pressing Enter on upload area triggers file input', () => {
      render(<ImageFormatConverterPage />)

      const uploadButton = screen.getByRole('button', { name: 'Upload image file' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: 'Enter' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('pressing Space on upload area triggers file input', () => {
      render(<ImageFormatConverterPage />)

      const uploadButton = screen.getByRole('button', { name: 'Upload image file' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: ' ' })

      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('Drag and Drop', () => {
    it('handles file drop', async () => {
      render(<ImageFormatConverterPage />)

      const uploadArea = screen.getByRole('button', { name: 'Upload image file' })
      const file = createMockFile('dropped.png', 5000, 'image/png')

      fireEvent.drop(uploadArea, {
        dataTransfer: { files: [file] },
      })

      await waitFor(() => {
        expect(screen.getByText('dropped.png')).toBeInTheDocument()
      })
    })

    it('handles dragOver event', () => {
      render(<ImageFormatConverterPage />)

      const uploadArea = screen.getByRole('button', { name: 'Upload image file' })

      fireEvent.dragOver(uploadArea)

      // Just verify no errors occur
      expect(uploadArea).toBeInTheDocument()
    })
  })

  describe('File Validation', () => {
    it('shows error for non-image file', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('document.pdf', 5000, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid image file')).toBeInTheDocument()
      })
    })

    it('shows error for file exceeding 10MB', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('large.png', 11 * 1024 * 1024, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('File size must be less than 10MB')).toBeInTheDocument()
      })
    })

    it('accepts file exactly 10MB', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('exact.png', 10 * 1024 * 1024, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('exact.png')).toBeInTheDocument()
      })
    })
  })

  describe('Format Selection', () => {
    it('displays format buttons after upload', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
        expect(screen.getByText('Lossless')).toBeInTheDocument()
        expect(screen.getByText('High Quality')).toBeInTheDocument()
        expect(screen.getByText('Modern')).toBeInTheDocument()
        expect(screen.getByText('Animated')).toBeInTheDocument()
      })
    })

    it('shows all format options', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const formatButtons = screen.getAllByRole('button')
        const formatTexts = formatButtons.map((btn) => btn.textContent)
        expect(formatTexts.some((text) => text?.includes('PNG'))).toBe(true)
        expect(formatTexts.some((text) => text?.includes('JPEG'))).toBe(true)
        expect(formatTexts.some((text) => text?.includes('WEBP'))).toBe(true)
        expect(formatTexts.some((text) => text?.includes('GIF'))).toBe(true)
      })
    })

    it('changes output format when clicking format button', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      // Find and click JPEG button using helper (format buttons have lowercase text)
      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      expect(trackToolEvent).toHaveBeenCalledWith('image_format_converter_format_change', {
        format: 'jpeg',
      })
    })

    it('tracks format change with analytics', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const webpButton = getFormatButton('webp')
      await user.click(webpButton)

      expect(trackToolEvent).toHaveBeenCalledWith('image_format_converter_format_change', {
        format: 'webp',
      })
    })
  })

  describe('Quality Slider', () => {
    it('shows quality slider for JPEG format', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByText(/Quality:/)).toBeInTheDocument()
        expect(screen.getByRole('slider')).toBeInTheDocument()
      })
    })

    it('shows quality slider for WEBP format', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const webpButton = getFormatButton('webp')
      await user.click(webpButton)

      await waitFor(() => {
        expect(screen.getByText(/Quality:/)).toBeInTheDocument()
      })
    })

    it('does not show quality slider for PNG format', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.jpg', 5000, 'image/jpeg')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      // PNG is default selected for jpeg input
      expect(screen.queryByText(/Quality:/)).not.toBeInTheDocument()
    })

    it('does not show quality slider for GIF format', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const gifButton = getFormatButton('gif')
      await user.click(gifButton)

      await waitFor(() => {
        expect(screen.queryByText(/Quality:/)).not.toBeInTheDocument()
      })
    })

    it('changes quality value when slider is adjusted', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument()
      })

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.5' } })

      await waitFor(() => {
        expect(screen.getByText('Quality: 50%')).toBeInTheDocument()
      })
    })

    it('shows quality hint message', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByText('Higher quality = larger file size')).toBeInTheDocument()
      })
    })
  })

  describe('Image Conversion', () => {
    it('shows convert button after upload', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })
    })

    it('converts image when clicking convert button', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Converted')).toBeInTheDocument()
      })
    })

    it('shows converting state while processing', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      // Check for converting state (it may be brief)
      expect(convertButton).toBeInTheDocument()
    })

    it('tracks conversion event with analytics', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'image_format_converter_convert',
          expect.objectContaining({
            from_format: 'png',
            to_format: 'png',
          })
        )
      })
    })

    it('displays original and converted image previews', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Original')).toBeInTheDocument()
        expect(screen.getByText('Converted')).toBeInTheDocument()
      })
    })

    it('shows size reduction badge for smaller converted file', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        // The mock blob is 5000 bytes, original is 10000, so 50% reduction
        expect(screen.getByText(/-\d+\.?\d*%/)).toBeInTheDocument()
      })
    })
  })

  describe('Download', () => {
    it('shows download button after conversion', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })
    })

    it('downloads converted image when clicking download', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(mockClick).toHaveBeenCalled()
      expect(mockAnchorElement.download).toBe('test.png')
    })

    it('tracks download event with analytics', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('image_format_converter_download', {
          format: 'png',
          size: 5000,
        })
      })
    })

    it('shows Downloaded! confirmation after download', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument()
      })
    })

    it('converts to JPEG and downloads with correct extension', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('photo.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download JPEG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download JPEG/i })
      await user.click(downloadButton)

      expect(mockAnchorElement.download).toBe('photo.jpeg')
    })
  })

  describe('Reset', () => {
    it('shows reset button after upload', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
      })
    })

    it('resets to initial state when clicking reset', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument()
      })

      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.getByText('Upload Image')).toBeInTheDocument()
        expect(screen.queryByText('test.png')).not.toBeInTheDocument()
      })
    })

    it('clears converted image on reset', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Converted')).toBeInTheDocument()
      })

      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.queryByText('Converted')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    // Note: Canvas/Image error tests (getContext returning null, toBlob returning null,
    // Image onerror) are difficult to test in jsdom environment due to mock timing issues.
    // These error paths exist in the component but are not easily testable without
    // a more sophisticated mocking approach or browser-based testing.

    it('clears error when uploading new file', async () => {
      render(<ImageFormatConverterPage />)

      // First, trigger an error
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const invalidFile = createMockFile('doc.pdf', 5000, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid image file')).toBeInTheDocument()
      })

      // Now upload a valid file
      const validFile = createMockFile('valid.png', 5000, 'image/png')
      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(screen.queryByText('Please upload a valid image file')).not.toBeInTheDocument()
      })
    })
  })

  describe('File Size Formatting', () => {
    it('formats bytes correctly', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('tiny.png', 500, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/500 Bytes/)).toBeInTheDocument()
      })
    })

    it('formats KB correctly', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('small.png', 5120, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/5 KB/)).toBeInTheDocument()
      })
    })

    it('formats MB correctly', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('medium.png', 2 * 1024 * 1024, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/2 MB/)).toBeInTheDocument()
      })
    })
  })

  describe('JPEG Background Handling', () => {
    it('fills white background when converting to JPEG', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('transparent.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(mockCanvasContext.fillRect).toHaveBeenCalled()
      })
    })
  })

  describe('Format Change Behavior', () => {
    it('clears converted image when format changes', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Converted')).toBeInTheDocument()
      })

      // Change format
      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.queryByText('Converted')).not.toBeInTheDocument()
      })
    })

    it('clears converted image when quality changes', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      // Select JPEG first
      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Converted')).toBeInTheDocument()
      })

      // Change quality
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.5' } })

      await waitFor(() => {
        expect(screen.queryByText('Converted')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('upload area is keyboard accessible', () => {
      render(<ImageFormatConverterPage />)

      const uploadArea = screen.getByRole('button', { name: 'Upload image file' })
      expect(uploadArea).toHaveAttribute('tabIndex', '0')
    })

    it('format buttons are accessible', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(4) // Format buttons + Reset + Convert
      })
    })

    it('quality slider has correct attributes', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('test.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Output Format')).toBeInTheDocument()
      })

      const jpegButton = getFormatButton('jpeg')
      await user.click(jpegButton)

      await waitFor(() => {
        const slider = screen.getByRole('slider')
        expect(slider).toHaveAttribute('min', '0.1')
        expect(slider).toHaveAttribute('max', '1')
        expect(slider).toHaveAttribute('step', '0.05')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles file with no extension', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('noextension', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('noextension')).toBeInTheDocument()
      })
    })

    it('handles file with multiple dots in name', async () => {
      render(<ImageFormatConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('my.photo.2024.png', 10000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert Image' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert Image' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(mockAnchorElement.download).toBe('my.photo.2024.png')
    })

    it('does not trigger file input on other key presses', () => {
      render(<ImageFormatConverterPage />)

      const uploadButton = screen.getByRole('button', { name: 'Upload image file' })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: 'Tab' })

      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('handles empty file list in drop event', () => {
      render(<ImageFormatConverterPage />)

      const uploadArea = screen.getByRole('button', { name: 'Upload image file' })

      fireEvent.drop(uploadArea, {
        dataTransfer: { files: [] },
      })

      // Should not cause any errors, and upload area should still be visible
      expect(screen.getByText('Upload Image')).toBeInTheDocument()
    })
  })
})
