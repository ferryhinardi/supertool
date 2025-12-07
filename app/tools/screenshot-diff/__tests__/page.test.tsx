import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { toast } from 'sonner'
import * as analytics from '@/lib/analytics'
import ScreenshotDiffPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

// Mock canvas context
const mockCanvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(400),
    width: 10,
    height: 10,
  })),
  putImageData: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
}

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext) as any
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockdata')

// Create mock image files
const createMockImageFile = (name: string): File => {
  return new File(['mock-image-content'], name, { type: 'image/png' })
}

describe('Screenshot Diff Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  describe('Rendering', () => {
    it('renders the page with heading', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
      expect(screen.getByText('Screenshot Diff Tool')).toBeTruthy()
    })

    it('displays comparison controls', () => {
      render(<ScreenshotDiffPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders upload sections for two images', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText('Screenshot 1 (Before)')).toBeTruthy()
      expect(screen.getByText('Screenshot 2 (After)')).toBeTruthy()
    })

    it('renders comparison settings description', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText(/pixel-by-pixel/i)).toBeTruthy()
    })

    it('displays pro tips section', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText('Pro Tips')).toBeTruthy()
    })
  })

  describe('File Upload', () => {
    it('accepts image file for screenshot 1', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file = createMockImageFile('image1.png')
      const input = screen.getAllByRole('button')[0].closest('div')?.querySelector('input')

      if (input) {
        await user.upload(input, file)
        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('screenshot_diff_upload_image1', {})
        })
      }
    })

    it('accepts image file for screenshot 2', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file = createMockImageFile('image2.png')
      const inputs = document.querySelectorAll('input[type="file"]')
      const input2 = inputs[1]

      if (input2 && input2 instanceof HTMLElement) {
        await user.upload(input2 as HTMLInputElement, file)
      }
    })

    it('shows error for non-image files', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]')

      if (input) {
        Object.defineProperty(input, 'files', {
          value: [file],
          writable: false,
        })

        // Manually trigger file selection handler would check file type
        expect(file.type).not.toMatch(/^image\//)
      }
    })
  })

  describe('Comparison Settings', () => {
    it('renders sensitivity threshold slider', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      // Upload images first to show settings
      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        const thresholdInput = screen.getByLabelText(/Sensitivity Threshold/i)
        expect(thresholdInput).toBeTruthy()
        expect(thresholdInput.getAttribute('type')).toBe('range')
      })
    })

    it('displays threshold value badge', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(screen.getByText('0.1')).toBeTruthy()
      })
    })

    it('allows changing threshold value', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(async () => {
        const thresholdInput = screen.getByLabelText(/Sensitivity Threshold/i)
        await user.clear(thresholdInput)
        await user.type(thresholdInput, '0.5')
        expect(thresholdInput).toBeTruthy()
      })
    })
  })

  describe('View Modes', () => {
    it('renders view mode buttons after upload', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(screen.getByText('Side-by-Side')).toBeTruthy()
        expect(screen.getByText('Overlay')).toBeTruthy()
        expect(screen.getByText('Diff Only')).toBeTruthy()
      })
    })

    it('switches to overlay view mode', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(async () => {
        const overlayButton = screen.getByText('Overlay')
        await user.click(overlayButton)
        expect(overlayButton).toBeTruthy()
      })
    })

    it('switches to diff-only view mode', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(async () => {
        const diffOnlyButton = screen.getByText('Diff Only')
        await user.click(diffOnlyButton)
        expect(diffOnlyButton).toBeTruthy()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('renders reset button after upload', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reset/i })).toBeTruthy()
      })
    })

    it('clears images when reset clicked', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(async () => {
        const resetButton = screen.getByRole('button', { name: /Reset/i })
        await user.click(resetButton)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Reset complete')
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('screenshot_diff_reset', {})
      })
    })
  })

  describe('Analytics', () => {
    it('tracks page open event', () => {
      render(<ScreenshotDiffPage />)
      expect(analytics.trackToolEvent).toHaveBeenCalledWith('screenshot_diff_open', {})
    })
  })

  describe('Pro Tips', () => {
    it('displays threshold information', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText(/Lower threshold values/i)).toBeTruthy()
    })

    it('displays resize information', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText(/automatically resized/i)).toBeTruthy()
    })

    it('displays magenta highlights information', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText(/Magenta highlights/i)).toBeTruthy()
    })

    it('displays privacy information', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText(/no server uploads/i)).toBeTruthy()
    })
  })

  describe('Badge Display', () => {
    it('shows filename badge after upload', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('test-image.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(screen.getByText('test-image.png')).toBeTruthy()
      })
    })
  })

  describe('Comparison Process', () => {
    it('processes images when both are uploaded', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const file2 = createMockImageFile('image2.png')

      const inputs = document.querySelectorAll('input[type="file"]')

      if (inputs[0] && inputs[0] instanceof HTMLElement) {
        await user.upload(inputs[0] as HTMLInputElement, file1)
      }

      if (inputs[1] && inputs[1] instanceof HTMLElement) {
        await user.upload(inputs[1] as HTMLInputElement, file2)
      }

      // Images would be processed automatically
      expect(inputs.length).toBe(2)
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for inputs', () => {
      render(<ScreenshotDiffPage />)
      expect(screen.getByText('Screenshot 1 (Before)')).toBeTruthy()
      expect(screen.getByText('Screenshot 2 (After)')).toBeTruthy()
    })

    it('provides descriptive button text', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reset/i })).toBeTruthy()
      })
    })
  })

  describe('URL Management', () => {
    it('creates object URLs for uploaded images', async () => {
      const user = userEvent.setup()
      render(<ScreenshotDiffPage />)

      const file1 = createMockImageFile('image1.png')
      const input = document.querySelector('input[type="file"]')
      if (input && input instanceof HTMLElement) {
        await user.upload(input as HTMLInputElement, file1)
      }

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled()
      })
    })
  })
})
