import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BackgroundRemoverPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools">Related Tools</div>,
}))

vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => <div data-testid="social-share">Social Share</div>,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating">Tool Rating</div>,
}))

vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search">Tool Search</div>,
}))

vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => (
    <div data-testid="faq-accordion">
      {faqs.map((faq) => (
        <div key={faq.question}>{faq.question}</div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/features/ads/AffiliateSuggestion', () => ({
  AffiliateSuggestion: () => <div data-testid="affiliate-suggestion">Affiliate</div>,
}))

// Mock Progress component
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" role="progressbar" aria-valuenow={value}>
      {value}%
    </div>
  ),
}))

// Mock the DragDropZone component
vi.mock('@/components/features/media/DragDropZone', () => ({
  DragDropZone: ({
    onFilesSelected,
    accept,
  }: {
    onFilesSelected: (files: FileList) => void
    accept?: string
  }) => (
    <div data-testid="drag-drop-zone">
      <input
        type="file"
        data-testid="file-input"
        accept={accept}
        onChange={(e) => {
          if (e.target.files) {
            onFilesSelected(e.target.files)
          }
        }}
      />
      <span>Drag and drop or click to upload</span>
    </div>
  ),
}))

// Mock the background removal library
const mockRemoveBackground = vi.fn()

vi.mock('@imgly/background-removal', () => ({
  removeBackground: (...args: unknown[]) => mockRemoveBackground(...args),
}))

// Import trackEvent for assertions
import { trackEvent } from '@/lib/services/analytics'

// Store original URL methods
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

describe('BackgroundRemoverPage', () => {
  let urlCounter = 0

  beforeEach(() => {
    vi.clearAllMocks()
    urlCounter = 0

    // Mock URL.createObjectURL
    URL.createObjectURL = vi.fn((obj: Blob | MediaSource) => {
      return `blob:test-url-${urlCounter++}-${obj instanceof Blob ? obj.size : 'media'}`
    })

    // Mock URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn()

    // Reset removeBackground mock with default implementation
    mockRemoveBackground.mockReset()
    mockRemoveBackground.mockImplementation(async (_file, options) => {
      // Simulate progress callbacks
      if (options?.progress) {
        options.progress('loading', 0, 100)
        options.progress('processing', 50, 100)
        options.progress('done', 100, 100)
      }
      return new Blob(['processed-image'], { type: 'image/png' })
    })
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  const createMockImageFile = (name = 'test-image.jpg', size = 1000): File => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type: 'image/jpeg' })
  }

  const createMockFileList = (files: File[]): FileList => {
    const fileList = {
      length: files.length,
      item: (index: number) => files[index] || null,
      [Symbol.iterator]: function* () {
        for (let i = 0; i < files.length; i++) {
          yield files[i]
        }
      },
    }
    files.forEach((file, index) => {
      Object.defineProperty(fileList, index, { value: file, enumerable: true })
    })
    return fileList as FileList
  }

  const uploadFile = (file: File) => {
    const input = screen.getByTestId('file-input') as HTMLInputElement
    const fileList = createMockFileList([file])
    Object.defineProperty(input, 'files', { value: fileList, configurable: true })
    fireEvent.change(input, { target: { files: fileList } })
  }

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText('Background Remover')).toBeInTheDocument()
    })

    it('renders the AI-Powered badge', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText('AI-Powered Background Removal')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<BackgroundRemoverPage />)
      expect(
        screen.getByText(/Remove backgrounds from images instantly with AI/i)
      ).toBeInTheDocument()
    })

    it('renders the drag-drop zone initially', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
    })

    it('renders the Remove Background card title', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText('Remove Background')).toBeInTheDocument()
    })

    it('renders the card description', () => {
      render(<BackgroundRemoverPage />)
      expect(
        screen.getByText(/Upload an image to remove its background automatically using AI/i)
      ).toBeInTheDocument()
    })

    it('renders feature cards', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText('AI-Powered')).toBeInTheDocument()
      expect(screen.getByText('Instant Results')).toBeInTheDocument()
      expect(screen.getByText('High Quality')).toBeInTheDocument()
      expect(screen.getByText('100% Private')).toBeInTheDocument()
    })

    it('renders feature descriptions', () => {
      render(<BackgroundRemoverPage />)
      expect(
        screen.getByText('Advanced machine learning models for accurate background detection')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Get results in seconds, no waiting for server processing')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Preserves edges and details for professional-grade output')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Images never leave your browser - complete privacy guaranteed')
      ).toBeInTheDocument()
    })

    it('renders how-to section', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText('How to Remove Background from Image')).toBeInTheDocument()
      expect(screen.getByText('Upload Your Image')).toBeInTheDocument()
      expect(screen.getByText('Click Remove Background')).toBeInTheDocument()
      expect(screen.getByText('Preview & Customize')).toBeInTheDocument()
      expect(screen.getByText('Download Your Image')).toBeInTheDocument()
    })

    it('renders FAQ section', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
    })

    it('renders related tools section', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
    })

    it('renders social share component', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByTestId('social-share')).toBeInTheDocument()
    })

    it('renders tool rating component', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
    })

    it('tracks page view on mount', () => {
      render(<BackgroundRemoverPage />)
      expect(trackEvent).toHaveBeenCalledWith({
        action: 'page_view',
        category: 'background_remover',
        label: 'tool_opened',
      })
    })
  })

  describe('File Upload', () => {
    it('shows original image section after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
      })
    })

    it('shows background removed section after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText('Background Removed')).toBeInTheDocument()
      })
    })

    it('shows Remove Background button after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })
    })

    it('shows Clear button after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })
    })

    it('creates object URL for uploaded image', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalledWith(file)
      })
    })

    it('tracks upload event', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'image_uploaded',
          category: 'background_remover',
          label: 'upload',
        })
      })
    })

    it('displays original image with correct alt text', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        const img = screen.getByAltText('Original')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', expect.stringContaining('blob:test-url'))
      })
    })

    it('hides drag-drop zone after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.queryByTestId('drag-drop-zone')).not.toBeInTheDocument()
      })
    })

    it('shows ready to process message before processing', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText(/Click "Remove Background" to process/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Validation', () => {
    it('rejects non-image files and keeps drop zone visible', async () => {
      render(<BackgroundRemoverPage />)

      const textFile = new File(['text content'], 'document.txt', { type: 'text/plain' })
      uploadFile(textFile)

      // Should still show the drag-drop zone (not transition to image preview)
      await waitFor(() => {
        expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
      })

      // Original Image section should NOT appear for invalid files
      expect(screen.queryByText('Original Image')).not.toBeInTheDocument()

      // Upload tracking should NOT be called for invalid files
      expect(trackEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'image_uploaded',
        })
      )
    })

    it('accepts PNG files', async () => {
      render(<BackgroundRemoverPage />)

      const pngFile = new File(['png content'], 'image.png', { type: 'image/png' })
      uploadFile(pngFile)

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
      })
    })

    it('accepts WebP files', async () => {
      render(<BackgroundRemoverPage />)

      const webpFile = new File(['webp content'], 'image.webp', { type: 'image/webp' })
      uploadFile(webpFile)

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
      })
    })

    it('accepts GIF files', async () => {
      render(<BackgroundRemoverPage />)

      const gifFile = new File(['gif content'], 'image.gif', { type: 'image/gif' })
      uploadFile(gifFile)

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
      })
    })
  })

  describe('Background Removal Process', () => {
    it('calls removeBackground when clicking Remove Background button', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(mockRemoveBackground).toHaveBeenCalled()
      })
    })

    it('shows loading model message during initial processing', async () => {
      mockRemoveBackground.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 5000))
      )

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Loading AI model...')).toBeInTheDocument()
      })
    })

    it('shows progress bar during processing', async () => {
      mockRemoveBackground.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 5000))
      )

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
      })
    })

    it('displays processed image after completion', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        const processedImage = screen.getByAltText('Background removed')
        expect(processedImage).toBeInTheDocument()
      })
    })

    it('shows success message after completion', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Background removed successfully!')).toBeInTheDocument()
      })
    })

    it('tracks success event after completion', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'background_removed',
            category: 'background_remover',
            label: 'success',
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error message when background removal fails', async () => {
      mockRemoveBackground.mockRejectedValue(new Error('Processing failed'))

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Processing failed')).toBeInTheDocument()
      })
    })

    it('tracks error event when processing fails', async () => {
      mockRemoveBackground.mockRejectedValue(new Error('Network error'))

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'background_removal_error',
          category: 'background_remover',
          label: 'Network error',
        })
      })
    })

    it('shows generic error message for unknown errors', async () => {
      mockRemoveBackground.mockRejectedValue('unknown')

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Failed to remove background')).toBeInTheDocument()
      })
    })

    it('tracks unknown error event', async () => {
      mockRemoveBackground.mockRejectedValue(null)

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith({
          action: 'background_removal_error',
          category: 'background_remover',
          label: 'unknown_error',
        })
      })
    })
  })

  describe('Download Functionality', () => {
    it('shows Download PNG button after processing', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })
    })

    it('tracks download event when Download button is clicked', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile('photo.jpg')
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Download PNG/i }))

      expect(trackEvent).toHaveBeenCalledWith({
        action: 'image_downloaded',
        category: 'background_remover',
        label: 'download',
      })
    })

    it('shows Reprocess button after completion', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reprocess/i })).toBeInTheDocument()
      })
    })

    it('reprocesses image when clicking Reprocess button', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reprocess/i })).toBeInTheDocument()
      })

      mockRemoveBackground.mockClear()

      fireEvent.click(screen.getByRole('button', { name: /Reprocess/i }))

      await waitFor(() => {
        expect(mockRemoveBackground).toHaveBeenCalled()
      })
    })
  })

  describe('Background Color Selection', () => {
    it('shows background color selector after processing', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Preview Background')).toBeInTheDocument()
      })
    })

    it('renders all background color options', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByTitle('Transparent')).toBeInTheDocument()
        expect(screen.getByTitle('White')).toBeInTheDocument()
        expect(screen.getByTitle('Black')).toBeInTheDocument()
        expect(screen.getByTitle('Red')).toBeInTheDocument()
        expect(screen.getByTitle('Green')).toBeInTheDocument()
        expect(screen.getByTitle('Blue')).toBeInTheDocument()
      })
    })

    it('allows selecting different background colors', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByTitle('White')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTitle('White'))

      // The button should still be in the document
      const whiteButton = screen.getByTitle('White')
      expect(whiteButton).toBeInTheDocument()
    })
  })

  describe('Reset/Clear Functionality', () => {
    it('resets state when clicking Clear button', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear/i }))

      await waitFor(() => {
        expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
      })
    })

    it('revokes object URLs when clearing', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear/i }))

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalled()
      })
    })

    it('clears processed image when resetting', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByAltText('Background removed')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear/i }))

      await waitFor(() => {
        expect(screen.queryByAltText('Background removed')).not.toBeInTheDocument()
      })
    })

    it('allows uploading new image after clear', async () => {
      render(<BackgroundRemoverPage />)
      const file1 = createMockImageFile('image1.jpg')
      uploadFile(file1)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Clear/i }))

      await waitFor(() => {
        expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
      })

      const file2 = createMockImageFile('image2.jpg')
      uploadFile(file2)

      await waitFor(() => {
        expect(screen.getByText('Original Image')).toBeInTheDocument()
      })
    })
  })

  describe('Progress Updates', () => {
    it('updates progress during processing', async () => {
      mockRemoveBackground.mockImplementation(async (_file, options) => {
        if (options?.progress) {
          options.progress('loading', 0, 100)
          await new Promise((resolve) => setTimeout(resolve, 50))
          options.progress('processing', 50, 100)
          await new Promise((resolve) => setTimeout(resolve, 50))
          options.progress('done', 100, 100)
        }
        return new Blob(['processed'], { type: 'image/png' })
      })

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByText('Background removed successfully!')).toBeInTheDocument()
      })
    })
  })

  describe('How-to Step Descriptions', () => {
    it('displays step descriptions', () => {
      render(<BackgroundRemoverPage />)
      expect(screen.getByText(/Drag and drop an image or click to browse/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Our AI will automatically detect and remove the background/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Preview the result with different background colors/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Download the processed image as a transparent PNG file/i)
      ).toBeInTheDocument()
    })
  })

  describe('Status Messages', () => {
    it('shows ready message before processing', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByText(/Click "Remove Background" to process/i)).toBeInTheDocument()
      })
    })

    it('shows removing background message during processing', async () => {
      mockRemoveBackground.mockImplementation(async (_file, options) => {
        if (options?.progress) {
          options.progress('processing', 50, 100)
        }
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return new Blob()
      })

      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(
        () => {
          expect(screen.getByText('Removing background...')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })
  })

  describe('Button State Management', () => {
    it('Clear button is always visible after upload', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })

      // Clear button should be visible
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })

    it('shows both Download and Reprocess after completion', async () => {
      render(<BackgroundRemoverPage />)
      const file = createMockImageFile()
      uploadFile(file)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Remove Background/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Remove Background/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Reprocess/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      })
    })
  })

  describe('File Input Configuration', () => {
    it('file input accepts image files', () => {
      render(<BackgroundRemoverPage />)
      const input = screen.getByTestId('file-input')
      expect(input).toHaveAttribute('accept', 'image/*')
    })
  })
})
