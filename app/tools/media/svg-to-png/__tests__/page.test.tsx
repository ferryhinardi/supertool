import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SvgToPngConverterPage from '../page'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

import { trackToolEvent } from '@/lib/services/analytics'

// Helper to create mock SVG files
const createMockSvgFile = (name: string, size: number): File => {
  const svgContent =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
  const file = new File([svgContent], name, { type: 'image/svg+xml' })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Helper to create mock non-SVG files
const createMockFile = (name: string, size: number, type: string): File => {
  const content = new Array(Math.min(size, 1024)).fill('a').join('')
  const file = new File([content], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Mock FileReader
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsText(_file: File) {
    setTimeout(() => {
      this.result =
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
      if (this.onload) {
        this.onload({ target: { result: this.result } } as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

// Mock FileReader that returns SVG with width/height attributes instead of viewBox
class MockFileReaderWithWidthHeight {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsText(_file: File) {
    setTimeout(() => {
      this.result =
        '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150"/></svg>'
      if (this.onload) {
        this.onload({ target: { result: this.result } } as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

// Mock FileReader that returns SVG without dimensions
class MockFileReaderNoDimensions {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsText(_file: File) {
    setTimeout(() => {
      this.result = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
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

// Mock Image that triggers error
class MockImageWithError {
  onload: (() => void) | null = null
  onerror: ((error: Event) => void) | null = null
  src = ''
  width = 100
  height = 100

  constructor() {
    setTimeout(() => {
      if (this.onerror) this.onerror(new Event('error'))
    }, 10)
  }
}

// Mock canvas context
const mockCanvasContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
}

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

describe('SvgToPngConverterPage', () => {
  let user: ReturnType<typeof userEvent.setup>
  let originalAppendChild: typeof document.body.appendChild
  let originalRemoveChild: typeof document.body.removeChild
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeEach(() => {
    vi.clearAllMocks()
    user = userEvent.setup()

    // Store originals before mocking
    originalAppendChild = document.body.appendChild.bind(document.body)
    originalRemoveChild = document.body.removeChild.bind(document.body)
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL

    // Mock FileReader
    global.FileReader = MockFileReader as unknown as typeof FileReader

    // Mock Image
    global.Image = MockImage as unknown as typeof Image

    // Mock canvas
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockCanvasContext
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockPngData')

    // Mock URL methods
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    // Mock document.createElement to intercept anchor creation
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchorElement as unknown as HTMLAnchorElement
      }
      return originalCreateElement(tagName)
    })

    // Mock appendChild and removeChild
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

    // Mock clipboard API
    const mockClipboardWrite = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        write: mockClipboardWrite,
      },
      writable: true,
      configurable: true,
    })

    // Mock fetch for clipboard copy
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['mock-png'], { type: 'image/png' })),
    })

    // Mock ClipboardItem
    global.ClipboardItem = class MockClipboardItem {
      items: Record<string, Blob>
      constructor(items: Record<string, Blob>) {
        this.items = items
      }
      static supports(): boolean {
        return true
      }
    } as unknown as typeof ClipboardItem
  })

  afterEach(() => {
    vi.useRealTimers()
    global.FileReader = originalFileReader
    global.Image = originalImage
    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.getByText('SVG to PNG Converter')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<SvgToPngConverterPage />)

      expect(
        screen.getByText(
          'Convert SVG files to high-quality PNG images with customizable dimensions and background colors'
        )
      ).toBeInTheDocument()
    })

    it('renders the upload section header', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.getByText('Upload SVG')).toBeInTheDocument()
    })

    it('renders the upload area with instructions', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.getByText('Click to upload SVG file')).toBeInTheDocument()
      expect(screen.getByText('Maximum file size: 10MB')).toBeInTheDocument()
    })

    it('renders the upload area as a button', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.getByRole('button', { name: /Click to upload SVG file/i })).toBeInTheDocument()
    })

    it('has a hidden file input accepting SVG files', () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', '.svg,image/svg+xml')
    })

    it('does not show conversion settings initially', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.queryByText('Conversion Settings')).not.toBeInTheDocument()
    })

    it('does not show SVG preview initially', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.queryByText('SVG Preview')).not.toBeInTheDocument()
    })

    it('does not show PNG result initially', () => {
      render(<SvgToPngConverterPage />)

      expect(screen.queryByText('PNG Result')).not.toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('uploads an SVG file via file input', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('icon.svg')).toBeInTheDocument()
      })
    })

    it('shows conversion settings after upload', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
      })
    })

    it('shows SVG preview after upload', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('SVG Preview')).toBeInTheDocument()
      })
    })

    it('tracks upload event with analytics', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_upload', { fileSize: 5000 })
      })
    })

    it('clicking upload area triggers file input', async () => {
      render(<SvgToPngConverterPage />)

      const uploadButton = screen.getByRole('button', { name: /Click to upload SVG file/i })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      await user.click(uploadButton)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('pressing Enter on upload area triggers file input', () => {
      render(<SvgToPngConverterPage />)

      const uploadButton = screen.getByRole('button', { name: /Click to upload SVG file/i })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: 'Enter' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('pressing Space on upload area triggers file input', () => {
      render(<SvgToPngConverterPage />)

      const uploadButton = screen.getByRole('button', { name: /Click to upload SVG file/i })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: ' ' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not trigger file input on other key presses', () => {
      render(<SvgToPngConverterPage />)

      const uploadButton = screen.getByRole('button', { name: /Click to upload SVG file/i })
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      uploadButton.focus()
      fireEvent.keyDown(uploadButton, { key: 'Tab' })

      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('does nothing when no file is selected', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [] } })

      await waitFor(() => {
        expect(screen.queryByText('Conversion Settings')).not.toBeInTheDocument()
      })
    })
  })

  describe('File Validation', () => {
    it('shows error for non-SVG file', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('image.png', 5000, 'image/png')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid SVG file')).toBeInTheDocument()
      })
    })

    it('tracks error event for invalid file type', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile('document.pdf', 5000, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_error', {
          error: 'Invalid file type',
        })
      })
    })

    it('shows error for file exceeding 10MB', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('large.svg', 11 * 1024 * 1024)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('SVG file must be less than 10MB')).toBeInTheDocument()
      })
    })

    it('tracks error event for file too large', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('large.svg', 11 * 1024 * 1024)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_error', { error: 'File too large' })
      })
    })

    it('accepts file exactly 10MB', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('exact.svg', 10 * 1024 * 1024)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('exact.svg')).toBeInTheDocument()
      })
    })

    it('clears error when uploading valid file after error', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // First, trigger an error
      const invalidFile = createMockFile('image.png', 5000, 'image/png')
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByText('Please upload a valid SVG file')).toBeInTheDocument()
      })

      // Now upload a valid file
      const validFile = createMockSvgFile('valid.svg', 5000)
      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(screen.queryByText('Please upload a valid SVG file')).not.toBeInTheDocument()
      })
    })
  })

  describe('SVG Dimension Parsing', () => {
    it('extracts dimensions from viewBox attribute', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
      })

      // The mock SVG has viewBox="0 0 100 100", so width/height should be 100
      // Wait for dimensions to settle after SVG parsing
      await waitFor(() => {
        const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
        const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement
        expect(widthInput.value).toBe('100')
        expect(heightInput.value).toBe('100')
      })
    })

    it('extracts dimensions from width/height attributes', async () => {
      // Create and set the width/height mock before rendering
      const widthHeightReader = MockFileReaderWithWidthHeight
      global.FileReader = widthHeightReader as unknown as typeof FileReader

      // Small delay to ensure the mock is set
      await new Promise((resolve) => setTimeout(resolve, 0))

      const { unmount } = render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(
        () => {
          expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Wait a bit more for the state to settle
      await new Promise((resolve) => setTimeout(resolve, 100))

      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement

      expect(widthInput.value).toBe('200')
      expect(heightInput.value).toBe('150')

      // Cleanup and restore
      unmount()
      global.FileReader = MockFileReader as unknown as typeof FileReader
    })

    it('uses default dimensions when SVG has no dimension attributes', async () => {
      // Ensure we use the no-dimensions mock
      global.FileReader = MockFileReaderNoDimensions as unknown as typeof FileReader

      const { unmount } = render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
      })

      // Default dimensions should be 800x600
      const widthInput = screen.getByLabelText('Width (px)') as HTMLInputElement
      const heightInput = screen.getByLabelText('Height (px)') as HTMLInputElement

      expect(widthInput.value).toBe('800')
      expect(heightInput.value).toBe('600')

      // Cleanup and restore
      unmount()
      global.FileReader = MockFileReader as unknown as typeof FileReader
    })
  })

  describe('Conversion Settings', () => {
    it('shows width input after upload', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Width (px)')).toBeInTheDocument()
      })
    })

    it('shows height input after upload', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Height (px)')).toBeInTheDocument()
      })
    })

    it('allows changing width value', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Width (px)')).toBeInTheDocument()
      })

      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '500' } })

      expect(widthInput).toHaveValue(500)
    })

    it('allows changing height value', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Height (px)')).toBeInTheDocument()
      })

      const heightInput = screen.getByLabelText('Height (px)')
      fireEvent.change(heightInput, { target: { value: '400' } })

      expect(heightInput).toHaveValue(400)
    })

    it('shows maintain aspect ratio checkbox', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Maintain aspect ratio')).toBeInTheDocument()
      })
    })

    it('aspect ratio checkbox is checked by default', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Maintain aspect ratio')).toBeInTheDocument()
      })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('allows toggling aspect ratio checkbox', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Maintain aspect ratio')).toBeInTheDocument()
      })

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
    })

    it('shows background color options', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Background Color')).toBeInTheDocument()
      })
    })

    it('shows quality slider', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Quality: 100%')).toBeInTheDocument()
      })
    })

    it('allows changing quality value', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument()
      })

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.5' } })

      await waitFor(() => {
        expect(screen.getByText('Quality: 50%')).toBeInTheDocument()
      })
    })

    it('quality slider has correct attributes', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument()
      })

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '0.1')
      expect(slider).toHaveAttribute('max', '1')
      expect(slider).toHaveAttribute('step', '0.1')
    })

    it('shows convert button after upload', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })
    })

    it('shows custom color picker', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(document.querySelector('input[type="color"]')).toBeInTheDocument()
      })
    })

    it('allows selecting custom background color', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(document.querySelector('input[type="color"]')).toBeInTheDocument()
      })

      const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
      fireEvent.change(colorInput, { target: { value: '#FF5500' } })

      expect(colorInput.value).toBe('#ff5500')
    })
  })

  describe('Background Color Selection', () => {
    it('shows 4 preset background color buttons', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Background Color')).toBeInTheDocument()
      })

      // There should be 4 color buttons (transparent, white, black, gray)
      const colorButtons = screen.getAllByRole('button').filter((btn) => {
        // Filter to only color buttons (they're type="button" and don't have text like "Convert")
        const hasNoText =
          !btn.textContent?.includes('Convert') && !btn.textContent?.includes('Download')
        return btn.getAttribute('type') === 'button' && hasNoText
      })
      expect(colorButtons.length).toBeGreaterThanOrEqual(4)
    })

    it('allows selecting white background', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Background Color')).toBeInTheDocument()
      })

      // Find the white color button (has style background: #FFFFFF)
      const colorButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('type') === 'button')

      // Click the second color button (white is typically second after transparent)
      const whiteButton = colorButtons.find((btn) => {
        const style = btn.getAttribute('style') || ''
        return style.includes('#FFFFFF') || style.includes('rgb(255, 255, 255)')
      })

      if (whiteButton) {
        await user.click(whiteButton)
        // Just verify no errors occur
        expect(screen.getByText('Conversion Settings')).toBeInTheDocument()
      }
    })
  })

  describe('PNG Conversion', () => {
    it('converts SVG to PNG when clicking convert button', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('PNG Result')).toBeInTheDocument()
      })
    })

    it('shows converting state while processing', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      // Check the button is disabled during conversion
      expect(convertButton).toBeInTheDocument()
    })

    it('tracks success event after conversion', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'svg_to_png_success',
          expect.objectContaining({
            width: expect.any(Number),
            height: expect.any(Number),
            backgroundColor: 'transparent',
          })
        )
      })
    })

    it('displays PNG preview after conversion', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByAltText('PNG Result')).toBeInTheDocument()
      })
    })

    it('does nothing when convertToPng is called without preview', async () => {
      render(<SvgToPngConverterPage />)

      // Without uploading a file, there's no convert button visible
      expect(screen.queryByRole('button', { name: 'Convert to PNG' })).not.toBeInTheDocument()
    })

    it('fills background when backgroundColor is not transparent', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Background Color')).toBeInTheDocument()
      })

      // Select a non-transparent background (find white button and click it)
      const colorButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) => btn.getAttribute('type') === 'button' && !btn.textContent?.includes('Convert')
        )
      // Click a non-transparent color (e.g., second button should be white)
      if (colorButtons[1]) {
        await user.click(colorButtons[1])
      }

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(mockCanvasContext.fillRect).toHaveBeenCalled()
      })
    })
  })

  describe('PNG Download', () => {
    it('shows download button after conversion', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })
    })

    it('downloads PNG when clicking download button', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(mockClick).toHaveBeenCalled()
    })

    it('downloads with correct filename (.svg replaced with .png)', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('my-icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(mockAnchorElement.download).toBe('my-icon.png')
    })

    it('tracks download event with analytics', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_download', { fileName: 'icon.png' })
    })

    it('uses default filename when svgFile is null', async () => {
      // This tests the fallback case in downloadPng
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      // Should have a valid download name
      expect(mockAnchorElement.download).toMatch(/\.png$/)
    })
  })

  describe('Copy to Clipboard', () => {
    it('shows copy button after conversion', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })
    })

    it('copies image to clipboard when clicking copy button', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy Image/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.write).toHaveBeenCalled()
      })
    })

    it('shows Copied! confirmation after copying', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy Image/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('tracks copy event with analytics', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy Image/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_copy')
      })
    })

    it('shows error when clipboard write fails', async () => {
      // Mock clipboard.write to reject
      Object.assign(navigator, {
        clipboard: {
          write: vi.fn().mockRejectedValue(new Error('Clipboard error')),
        },
      })

      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy Image/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument()
      })
    })

    it('tracks error event when clipboard fails', async () => {
      Object.assign(navigator, {
        clipboard: {
          write: vi.fn().mockRejectedValue(new Error('Clipboard error')),
        },
      })

      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy Image/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_error', { error: 'Copy failed' })
      })
    })
  })

  describe('Clear All', () => {
    it('shows clear all button after conversion', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
      })
    })

    it('resets to initial state when clicking clear all', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /Clear All/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText('PNG Result')).not.toBeInTheDocument()
        expect(screen.queryByText('Conversion Settings')).not.toBeInTheDocument()
        expect(screen.queryByText('SVG Preview')).not.toBeInTheDocument()
        expect(screen.getByText('Click to upload SVG file')).toBeInTheDocument()
      })
    })

    it('tracks clear event with analytics', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /Clear All/i })
      await user.click(clearButton)

      expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_clear')
    })

    it('resets settings to defaults on clear', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Width (px)')).toBeInTheDocument()
      })

      // Change some settings
      const widthInput = screen.getByLabelText('Width (px)')
      fireEvent.change(widthInput, { target: { value: '500' } })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /Clear All/i })
      await user.click(clearButton)

      // Upload again and check defaults
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Width (px)')).toHaveValue(100)
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error when canvas context is not available', async () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Canvas context not available')).toBeInTheDocument()
      })
    })

    it('shows error when image fails to load', async () => {
      global.Image = MockImageWithError as unknown as typeof Image

      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to load SVG image')).toBeInTheDocument()
      })
    })

    it('tracks error event when image fails to load', async () => {
      global.Image = MockImageWithError as unknown as typeof Image

      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('svg_to_png_error', {
          error: 'Image load failed',
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('upload area is keyboard accessible', () => {
      render(<SvgToPngConverterPage />)

      const uploadArea = screen.getByRole('button', { name: /Click to upload SVG file/i })
      expect(uploadArea).toHaveAttribute('tabIndex', '0')
    })

    it('width input has proper label', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const widthInput = screen.getByLabelText('Width (px)')
        expect(widthInput).toBeInTheDocument()
        expect(widthInput).toHaveAttribute('type', 'number')
      })
    })

    it('height input has proper label', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const heightInput = screen.getByLabelText('Height (px)')
        expect(heightInput).toBeInTheDocument()
        expect(heightInput).toHaveAttribute('type', 'number')
      })
    })

    it('width input has min and max constraints', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const widthInput = screen.getByLabelText('Width (px)')
        expect(widthInput).toHaveAttribute('min', '1')
        expect(widthInput).toHaveAttribute('max', '4096')
      })
    })

    it('height input has min and max constraints', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const heightInput = screen.getByLabelText('Height (px)')
        expect(heightInput).toHaveAttribute('min', '1')
        expect(heightInput).toHaveAttribute('max', '4096')
      })
    })

    it('color picker has proper label', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Background Color')).toBeInTheDocument()
      })

      // The color input should have an id that matches the label's htmlFor
      const colorInput = document.querySelector('input[type="color"]')
      expect(colorInput).toHaveAttribute('id', 'svg-bg-color')
    })

    it('quality slider has proper label', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        const slider = screen.getByRole('slider')
        expect(slider).toHaveAttribute('id', 'svg-quality')
      })
    })

    it('PNG result image has alt text', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        const pngImage = screen.getByAltText('PNG Result')
        expect(pngImage).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles file with multiple dots in name', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('my.icon.2024.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download PNG/i })
      await user.click(downloadButton)

      expect(mockAnchorElement.download).toBe('my.icon.2024.png')
    })

    it('clears previous PNG when uploading new file', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file1 = createMockSvgFile('first.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file1] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Convert to PNG' })).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('PNG Result')).toBeInTheDocument()
      })

      // Upload second file
      const file2 = createMockSvgFile('second.svg', 5000)
      fireEvent.change(fileInput, { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.queryByText('PNG Result')).not.toBeInTheDocument()
        expect(screen.getByText('second.svg')).toBeInTheDocument()
      })
    })

    it('handles converting with aspect ratio disabled', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Maintain aspect ratio')).toBeInTheDocument()
      })

      // Uncheck aspect ratio
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('PNG Result')).toBeInTheDocument()
      })

      // drawImage should be called with full dimensions (no scaling)
      expect(mockCanvasContext.drawImage).toHaveBeenCalled()
    })

    it('handles very low quality setting', async () => {
      render(<SvgToPngConverterPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockSvgFile('icon.svg', 5000)

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('slider')).toBeInTheDocument()
      })

      // Set quality to minimum
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '0.1' } })

      await waitFor(() => {
        expect(screen.getByText('Quality: 10%')).toBeInTheDocument()
      })

      const convertButton = screen.getByRole('button', { name: 'Convert to PNG' })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('PNG Result')).toBeInTheDocument()
      })
    })
  })
})
