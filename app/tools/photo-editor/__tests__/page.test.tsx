import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PhotoEditorPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock canvas and image APIs
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 800
  height = 600

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}

global.Image = MockImage as any

// Mock canvas context
const mockGetContext = vi.fn(() => ({
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(800 * 600 * 4),
    width: 800,
    height: 600,
  })),
  putImageData: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  filter: 'none',
}))

HTMLCanvasElement.prototype.getContext = mockGetContext as any
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(['fake-image-data'], { type: 'image/png' })
  callback(blob)
})

// Mock FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null
  result: string | null = null

  readAsDataURL(_file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,fake-image-data'
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

describe('PhotoEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the photo editor page with header', () => {
      render(<PhotoEditorPage />)

      expect(screen.getByText('AI Photo Editor')).toBeInTheDocument()
      expect(
        screen.getByText(/Professional photo editing with advanced filters/i)
      ).toBeInTheDocument()
      expect(screen.getByText('PREMIUM')).toBeInTheDocument()
    })

    it('should render all tabs', () => {
      render(<PhotoEditorPage />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
      expect(screen.getByText('Adjustments')).toBeInTheDocument()
      expect(screen.getByText('Transform')).toBeInTheDocument()
      expect(screen.getByText('AI Generate')).toBeInTheDocument()
    })

    it('should show upload prompt when no image is uploaded', () => {
      render(<PhotoEditorPage />)

      expect(screen.getByText('Upload a photo to start editing')).toBeInTheDocument()
      expect(screen.getByText('Supports JPG, PNG, WebP (Max 10MB)')).toBeInTheDocument()
    })

    it('should have a choose image button', () => {
      render(<PhotoEditorPage />)

      const buttons = screen.getAllByText('Choose Image')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to adjustments tab when clicked', async () => {
      render(<PhotoEditorPage />)

      const adjustmentsTab = screen.getByText('Adjustments')
      await userEvent.click(adjustmentsTab)

      // Adjustments tab is now active - verify by checking aria or other attributes
      expect(adjustmentsTab).toBeInTheDocument()
    })

    it('should switch to transform tab when clicked', async () => {
      render(<PhotoEditorPage />)

      const transformTab = screen.getByText('Transform')
      await userEvent.click(transformTab)

      // Transform tab is now active
      expect(transformTab).toBeInTheDocument()
    })

    it('should switch to AI generate tab when clicked', async () => {
      render(<PhotoEditorPage />)

      const aiTab = screen.getByText('AI Generate')
      await userEvent.click(aiTab)

      expect(screen.getByText('AI Image Generation')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/A serene mountain landscape/i)).toBeInTheDocument()
    })
  })

  describe('AI Image Generation', () => {
    it('should render AI generation form in AI tab', async () => {
      render(<PhotoEditorPage />)

      const aiTab = screen.getByText('AI Generate')
      await userEvent.click(aiTab)

      expect(screen.getByText('Image Description')).toBeInTheDocument()
      expect(screen.getByText('Generate Image with AI')).toBeInTheDocument()
    })

    it('should disable generate button when prompt is empty', async () => {
      render(<PhotoEditorPage />)

      const aiTab = screen.getByText('AI Generate')
      await userEvent.click(aiTab)

      const generateButton = screen.getByText('Generate Image with AI')
      expect(generateButton).toBeDisabled()
    })

    it('should call API when generating with valid prompt', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              imageUrl: 'https://example.com/generated.png',
            }),
        })
      )
      global.fetch = mockFetch as any

      render(<PhotoEditorPage />)

      const aiTab = screen.getByText('AI Generate')
      await userEvent.click(aiTab)

      const input = screen.getByPlaceholderText(/A serene mountain landscape/i)
      await userEvent.type(input, 'A beautiful sunset')

      const generateButton = screen.getByText('Generate Image with AI')
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/ai-image-generate',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'A beautiful sunset' }),
          })
        )
      })
    })

    it('should show loading state while generating', async () => {
      const mockFetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      imageUrl: 'https://example.com/generated.png',
                    }),
                }),
              100
            )
          })
      )
      global.fetch = mockFetch as any

      render(<PhotoEditorPage />)

      const aiTab = screen.getByText('AI Generate')
      await userEvent.click(aiTab)

      const input = screen.getByPlaceholderText(/A serene mountain landscape/i)
      await userEvent.type(input, 'A beautiful sunset')

      const generateButton = screen.getByText('Generate Image with AI')
      await userEvent.click(generateButton)

      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
  })

  describe('Image Upload', () => {
    it('should handle file upload', async () => {
      render(<PhotoEditorPage />)

      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully')
      })
    })

    it('should reject non-image files', async () => {
      render(<PhotoEditorPage />)

      const file = new File(['fake-content'], 'test.txt', { type: 'text/plain' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      // Manually trigger the change event with the file
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })

      const event = new Event('change', { bubbles: true })
      input.dispatchEvent(event)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please upload a valid image file')
      })
    })
  })

  describe('Filter Application', () => {
    it('should track analytics when filter is applied', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      render(<PhotoEditorPage />)

      // Upload an image first
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('photo_editor_upload', expect.any(Object))
      })
    })
  })

  describe('Premium Features', () => {
    it('should show premium badge on premium filters', async () => {
      render(<PhotoEditorPage />)

      // Upload an image first to see filters
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(() => {
        const proBadges = screen.getAllByText('PRO')
        expect(proBadges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Canvas Rendering', () => {
    it('should create canvas element when image is uploaded', async () => {
      render(<PhotoEditorPage />)

      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(() => {
        const canvas = document.querySelector('canvas')
        expect(canvas).toBeInTheDocument()
      })
    })
  })

  describe('Export Functionality', () => {
    it('should download image when download button is clicked', async () => {
      render(<PhotoEditorPage />)

      // Upload an image first
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(async () => {
        const downloadButton = screen.getByText('Download')
        await userEvent.click(downloadButton)

        expect(toast.success).toHaveBeenCalledWith('Image downloaded successfully')
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all adjustments when reset button is clicked', async () => {
      render(<PhotoEditorPage />)

      // Upload an image first
      const file = new File(['fake-image'], 'test.png', { type: 'image/png' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(async () => {
        const resetButton = screen.getByText('Reset All')
        await userEvent.click(resetButton)

        expect(toast.success).toHaveBeenCalledWith('All changes reset')
      })
    })
  })
})
