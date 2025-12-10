import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImageToPdfPage from '../page'

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

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
  })),
}))

// Mock Image for dimension loading
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 800
  height = 600

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

global.Image = MockImage as unknown as typeof Image

describe('ImageToPdfPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the page with title and description', () => {
      render(<ImageToPdfPage />)

      expect(screen.getByText('Image to PDF Converter')).toBeInTheDocument()
      expect(screen.getByText(/Convert JPG, PNG, WebP/i)).toBeInTheDocument()
    })

    it('should render the upload section', () => {
      render(<ImageToPdfPage />)

      expect(screen.getByText('Upload Images')).toBeInTheDocument()
      expect(screen.getByText(/Select one or more images/i)).toBeInTheDocument()
    })

    it('should not show settings or generate button initially', () => {
      render(<ImageToPdfPage />)

      expect(screen.queryByText('PDF Settings')).not.toBeInTheDocument()
      expect(screen.queryByText('Generate PDF')).not.toBeInTheDocument()
    })

    it('should render related tools section', () => {
      render(<ImageToPdfPage />)

      expect(screen.getByText(/Related Tools/i)).toBeInTheDocument()
    })

    it('should render pro tips section', () => {
      render(<ImageToPdfPage />)

      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText(/Drag and drop multiple images/i)).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('should show Clear All button when images are uploaded', async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument()
      })
    })

    it('should show image count after upload', async () => {
      render(<ImageToPdfPage />)

      const files = [
        new File(['image1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'test2.png', { type: 'image/png' }),
      ]
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, files)

      await waitFor(() => {
        expect(screen.getByText(/2 images selected/i)).toBeInTheDocument()
      })
    })

    it('should show error toast for non-image files', async () => {
      const { toast } = await import('sonner')
      render(<ImageToPdfPage />)

      const file = new File(['text'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select valid image files')
      })
    })
  })

  describe('PDF Settings', () => {
    beforeEach(async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('PDF Settings')).toBeInTheDocument()
      })
    })

    it('should show PDF settings when images are uploaded', () => {
      expect(screen.getByText('PDF Settings')).toBeInTheDocument()
      expect(screen.getByLabelText('Page Size')).toBeInTheDocument()
      expect(screen.getByLabelText('Orientation')).toBeInTheDocument()
      expect(screen.getByLabelText('Image Fit')).toBeInTheDocument()
    })

    it('should allow changing page size', async () => {
      const pageSelect = screen.getByLabelText('Page Size') as HTMLSelectElement

      await userEvent.selectOptions(pageSelect, 'Letter')

      expect(pageSelect.value).toBe('Letter')
    })

    it('should allow changing orientation', async () => {
      const orientationSelect = screen.getByLabelText('Orientation') as HTMLSelectElement

      await userEvent.selectOptions(orientationSelect, 'landscape')

      expect(orientationSelect.value).toBe('landscape')
    })

    it('should allow changing image fit', async () => {
      const fitSelect = screen.getByLabelText('Image Fit') as HTMLSelectElement

      await userEvent.selectOptions(fitSelect, 'cover')

      expect(fitSelect.value).toBe('cover')
    })

    it('should allow adjusting margin with slider', async () => {
      const marginSlider = screen.getByLabelText(/Margin: \d+mm/) as HTMLInputElement

      await userEvent.clear(marginSlider)
      await userEvent.type(marginSlider, '20')

      expect(screen.getByText(/Margin: 20mm/)).toBeInTheDocument()
    })
  })

  describe('Generate PDF', () => {
    it('should show Generate PDF button when images are uploaded', async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Generate PDF')).toBeInTheDocument()
      })
    })

    it('should disable Generate button when generating', async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Generate PDF')).toBeInTheDocument()
      })

      const generateBtn = screen.getByText('Generate PDF')
      await userEvent.click(generateBtn)

      // Button should be disabled during generation
      expect(generateBtn).toBeDisabled()
    })

    it('should track analytics event when generating PDF', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Generate PDF')).toBeInTheDocument()
      })

      const generateBtn = screen.getByText('Generate PDF')
      await userEvent.click(generateBtn)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('pdf_generation_started', expect.any(Object))
      })
    })
  })

  describe('Clear All', () => {
    it('should remove all images when Clear All is clicked', async () => {
      const { toast } = await import('sonner')
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument()
      })

      const clearBtn = screen.getByText('Clear All')
      await userEvent.click(clearBtn)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('All images cleared')
        expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
      })
    })
  })

  describe('Remove Individual Image', () => {
    it('should remove individual image when X button is clicked', async () => {
      const { toast } = await import('sonner')
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        const removeBtn = screen.getByLabelText('Remove image')
        expect(removeBtn).toBeInTheDocument()
      })

      const removeBtn = screen.getByLabelText('Remove image')
      await userEvent.click(removeBtn)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image removed')
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('should track page view on mount', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      render(<ImageToPdfPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('image_to_pdf_opened', expect.any(Object))
    })

    it('should track when images are added', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('images_added', { count: 1 })
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible labels for all form controls', async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByLabelText('Page Size')).toBeInTheDocument()
        expect(screen.getByLabelText('Orientation')).toBeInTheDocument()
        expect(screen.getByLabelText('Image Fit')).toBeInTheDocument()
        expect(screen.getByLabelText(/Margin:/)).toBeInTheDocument()
      })
    })

    it('should have proper alt text for images', async () => {
      render(<ImageToPdfPage />)

      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        const img = screen.getByAltText('Preview 1')
        expect(img).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty file selection gracefully', async () => {
      render(<ImageToPdfPage />)

      const input = screen.getByLabelText('File upload') as HTMLInputElement

      // Upload empty file list
      await userEvent.upload(input, [])

      // Should not crash or show error
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
    })

    it('should handle Generate PDF with no images', async () => {
      render(<ImageToPdfPage />)

      // Try to call generate without images (simulated - button shouldn't even be visible)
      // This tests the error handling in generatePDF function
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' })
      const input = screen.getByLabelText('File upload') as HTMLInputElement

      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument()
      })

      // Clear all
      const clearBtn = screen.getByText('Clear All')
      await userEvent.click(clearBtn)

      // Button should be hidden
      expect(screen.queryByText('Generate PDF')).not.toBeInTheDocument()
    })
  })
})
