import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock useTrackToolView
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock DragDropZone component
vi.mock('@/components/features/media/DragDropZone', () => ({
  DragDropZone: ({
    onFilesSelected,
    accept,
  }: {
    onFilesSelected: (files: FileList) => void
    accept?: string
  }) => (
    <div data-testid="drag-drop-zone" data-accept={accept}>
      <input
        type="file"
        data-testid="file-input"
        accept={accept}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
    </div>
  ),
}))

// Mock ToolSearch component
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search" />,
}))

// Mock JSZip
const mockJSZipFile = vi.fn().mockReturnThis()
const mockJSZipFolder = vi.fn().mockReturnValue({
  file: mockJSZipFile,
})
const mockJSZipGenerateAsync = vi
  .fn()
  .mockResolvedValue(new Blob(['test-zip'], { type: 'application/zip' }))

vi.mock('jszip', () => {
  class MockJSZip {
    folder = mockJSZipFolder
    file = mockJSZipFile
    generateAsync = mockJSZipGenerateAsync
  }
  return { default: MockJSZip }
})

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockObjectURLs: string[] = []
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

// Save original Image constructor
const OriginalImage = globalThis.Image

// Mock canvas context
const mockCanvasContext = {
  drawImage: vi.fn(),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
}

// Mock HTMLCanvasElement prototype
HTMLCanvasElement.prototype.getContext = vi.fn(
  () => mockCanvasContext
) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => 'data:image/png;base64,mockresized'
) as unknown as typeof HTMLCanvasElement.prototype.toDataURL

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const mockBlob = new Blob(['mock-resized-image'], { type: 'image/png' })
  callback(mockBlob)
}) as unknown as typeof HTMLCanvasElement.prototype.toBlob

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import SocialMediaResizerPage from '../page'

// Helper to create a mock image file
function createMockImageFile(name = 'test-image.png', size = 1024, type = 'image/png'): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

// Helper to create a FileList from files
function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file
      }
    },
  } as unknown as FileList
  for (let i = 0; i < files.length; i++) {
    Object.defineProperty(fileList, i, { value: files[i], enumerable: true })
  }
  return fileList
}

// Helper to click a preset button by its label text
function clickPresetByText(text: string) {
  const label = screen.getByText(text)
  const btn = label.closest('button')
  if (btn) fireEvent.click(btn)
}

// Helper to upload a mock image file
async function uploadImage(file?: File) {
  const imageFile = file ?? createMockImageFile()
  const fileInput = screen.getByTestId('file-input')

  Object.defineProperty(fileInput, 'files', {
    value: createFileList([imageFile]),
    configurable: true,
  })

  fireEvent.change(fileInput)

  // Wait for upload to complete
  await waitFor(() => {
    expect(screen.queryByTestId('drag-drop-zone')).not.toBeInTheDocument()
  })
}

describe('SocialMediaResizerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObjectURLs.length = 0

    // Mock URL methods
    URL.createObjectURL = vi.fn((_blob) => {
      const url = `blob:mock-url-${mockObjectURLs.length}`
      mockObjectURLs.push(url)
      return url
    })
    URL.revokeObjectURL = vi.fn()

    // Mock global Image constructor with a proper class
    globalThis.Image = class MockImage extends OriginalImage {
      constructor() {
        super()
        Object.defineProperty(this, 'naturalWidth', { value: 2000, writable: true })
        Object.defineProperty(this, 'naturalHeight', { value: 1500, writable: true })
        Object.defineProperty(this, 'width', { value: 2000, writable: true })
        Object.defineProperty(this, 'height', { value: 1500, writable: true })
        // Fire onload on next microtask after src is set
        const self = this
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(
          HTMLImageElement.prototype,
          'src'
        )
        Object.defineProperty(this, 'src', {
          set(value: string) {
            if (originalSrcDescriptor?.set) {
              originalSrcDescriptor.set.call(self, value)
            }
            // Fire onload asynchronously
            Promise.resolve().then(() => {
              if (self.onload) self.onload(new Event('load'))
            })
          },
          get() {
            return originalSrcDescriptor?.get?.call(self) ?? ''
          },
          configurable: true,
        })
      }
    } as unknown as typeof Image

    // Reset canvas mocks
    vi.mocked(mockCanvasContext.drawImage).mockClear()
  })

  afterEach(() => {
    cleanup()
    mockObjectURLs.length = 0
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    globalThis.Image = OriginalImage
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page heading and description', () => {
      render(<SocialMediaResizerPage />)

      expect(screen.getByText('Social Media Image Resizer')).toBeInTheDocument()
      expect(screen.getByText(/Resize images for Instagram, Facebook, Twitter/)).toBeInTheDocument()
    })

    it('renders the ToolSearch component', () => {
      render(<SocialMediaResizerPage />)
      expect(screen.getByTestId('tool-search')).toBeInTheDocument()
    })

    it('renders the upload section with DragDropZone', () => {
      render(<SocialMediaResizerPage />)

      expect(screen.getByText('Upload Image')).toBeInTheDocument()
      expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
    })

    it('does not show preset selection before upload', () => {
      render(<SocialMediaResizerPage />)

      expect(screen.queryByText('Select Sizes')).not.toBeInTheDocument()
    })

    it('renders the privacy info card', () => {
      render(<SocialMediaResizerPage />)

      expect(screen.getByText(/All processing happens in your browser/)).toBeInTheDocument()
    })
  })

  describe('Image Upload', () => {
    it('handles valid image upload', async () => {
      render(<SocialMediaResizerPage />)

      await uploadImage()

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_upload', {
          fileType: 'image/png',
        })
      })
      expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully')
    })

    it('shows file info after upload', async () => {
      render(<SocialMediaResizerPage />)

      const file = createMockImageFile('my-photo.png', 2 * 1024 * 1024)
      await uploadImage(file)

      expect(screen.getByText('my-photo.png')).toBeInTheDocument()
    })

    it('rejects non-image files', async () => {
      render(<SocialMediaResizerPage />)

      const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' })
      const fileInput = screen.getByTestId('file-input')

      Object.defineProperty(fileInput, 'files', {
        value: createFileList([textFile]),
        configurable: true,
      })

      fireEvent.change(fileInput)

      expect(toast.error).toHaveBeenCalledWith('Please upload an image file')
    })

    it('rejects files over 20MB', async () => {
      render(<SocialMediaResizerPage />)

      const largeFile = createMockImageFile('large.png', 25 * 1024 * 1024)
      const fileInput = screen.getByTestId('file-input')

      Object.defineProperty(fileInput, 'files', {
        value: createFileList([largeFile]),
        configurable: true,
      })

      fireEvent.change(fileInput)

      expect(toast.error).toHaveBeenCalledWith('File size must be under 20MB')
    })

    it('shows the Clear button after upload', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('clears the image when Clear is clicked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      fireEvent.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(screen.getByTestId('drag-drop-zone')).toBeInTheDocument()
      })

      expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_clear')
    })
  })

  describe('Preset Selection', () => {
    it('shows preset selection section after upload', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      expect(screen.getByText('Select Sizes')).toBeInTheDocument()
    })

    it('renders platform filter tabs', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Instagram' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Facebook' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Twitter / X' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'LinkedIn' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'YouTube' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'TikTok' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pinterest' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Snapchat' })).toBeInTheDocument()
    })

    it('filters presets by platform when a tab is clicked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      fireEvent.click(screen.getByRole('button', { name: 'Instagram' }))

      // Instagram presets should be visible
      expect(screen.getByText('Post (Square)')).toBeInTheDocument()
      expect(screen.getByText('Story / Reel')).toBeInTheDocument()

      // Non-Instagram presets should not be visible
      expect(screen.queryByText('Channel Banner')).not.toBeInTheDocument()
    })

    it('shows "Select All" button for specific platform', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      fireEvent.click(screen.getByRole('button', { name: 'Facebook' }))

      expect(screen.getByRole('button', { name: /Select All Facebook/i })).toBeInTheDocument()
    })

    it('selects a preset when clicked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      clickPresetByText('Post (Square)')

      expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_preset_toggle', {
        preset: 'ig-post-square',
      })
    })

    it('shows resize button with correct count', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select two presets
      clickPresetByText('Post (Square)')
      clickPresetByText('Post (Portrait)')

      expect(screen.getByRole('button', { name: /Resize 2 Images/i })).toBeInTheDocument()
    })

    it('deselects all presets when Deselect All is clicked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select a preset
      clickPresetByText('Post (Square)')

      // Deselect all
      fireEvent.click(screen.getByRole('button', { name: /Deselect All/i }))

      // Resize button should show 0 (disabled)
      expect(screen.getByRole('button', { name: /Resize 0 Images/i })).toBeInTheDocument()
    })
  })

  describe('Custom Dimensions', () => {
    it('shows custom dimensions inputs when checkbox is checked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(screen.getByLabelText(/Width/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
    })

    it('counts custom dimensions in total selected', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(screen.getByRole('button', { name: /Resize 1 Image$/i })).toBeInTheDocument()
    })
  })

  describe('Resize Processing', () => {
    it('resizes images when Resize button is clicked', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select a preset
      clickPresetByText('Post (Square)')

      // Click resize
      fireEvent.click(screen.getByRole('button', { name: /Resize 1 Image$/i }))

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_resize', { count: 1 })
      })

      expect(toast.success).toHaveBeenCalledWith('Resized to 1 format')
    })

    it('shows results after resizing', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select a preset
      clickPresetByText('Post (Square)')

      // Click resize
      fireEvent.click(screen.getByRole('button', { name: /Resize 1 Image$/i }))

      await waitFor(() => {
        expect(screen.getByText(/1 Image Resized/)).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Download All as ZIP/i })).toBeInTheDocument()
    })

    it('resizes multiple presets', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select multiple presets
      clickPresetByText('Post (Square)')
      clickPresetByText('Post (Portrait)')

      // Click resize
      fireEvent.click(screen.getByRole('button', { name: /Resize 2 Images/i }))

      await waitFor(() => {
        expect(screen.getByText(/2 Images Resized/)).toBeInTheDocument()
      })

      expect(toast.success).toHaveBeenCalledWith('Resized to 2 formats')
    })

    it('resizes button is disabled when no presets selected', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      const resizeBtn = screen.getByRole('button', { name: /Resize 0 Images/i })
      expect(resizeBtn).toBeDisabled()
    })
  })

  describe('Downloads', () => {
    async function resizeWithPreset() {
      await uploadImage()

      clickPresetByText('Post (Square)')

      fireEvent.click(screen.getByRole('button', { name: /Resize 1 Image$/i }))

      await waitFor(() => {
        expect(screen.getByText(/1 Image Resized/)).toBeInTheDocument()
      })
    }

    it('downloads a single resized image', async () => {
      render(<SocialMediaResizerPage />)
      await resizeWithPreset()

      // Find the individual download button by aria-label
      const singleDownloadBtn = screen.getByRole('button', {
        name: /Download Instagram Post \(Square\)/i,
      })

      fireEvent.click(singleDownloadBtn)

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_download_single', {
        preset: 'ig-post-square',
      })
    })

    it('downloads all as ZIP', async () => {
      render(<SocialMediaResizerPage />)
      await resizeWithPreset()

      fireEvent.click(screen.getByRole('button', { name: /Download All as ZIP/i }))

      await waitFor(() => {
        expect(mockJSZipFolder).toHaveBeenCalled()
        expect(mockJSZipGenerateAsync).toHaveBeenCalledWith({ type: 'blob' })
      })

      expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_download_zip', { count: 1 })
      expect(toast.success).toHaveBeenCalledWith('ZIP downloaded')
    })
  })

  describe('Preview Modal', () => {
    it('opens preview modal when a result image is clicked', async () => {
      render(<SocialMediaResizerPage />)

      await uploadImage()

      clickPresetByText('Post (Square)')

      fireEvent.click(screen.getByRole('button', { name: /Resize 1 Image$/i }))

      await waitFor(() => {
        expect(screen.getByText(/1 Image Resized/)).toBeInTheDocument()
      })

      // Click the preview button (the image container)
      const previewButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('img'))

      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /Image preview/i })).toBeInTheDocument()
        })

        expect(trackToolEvent).toHaveBeenCalledWith('social_resizer_preview', {
          preset: 'ig-post-square',
        })
      }
    })

    it('closes preview modal when close button is clicked', async () => {
      render(<SocialMediaResizerPage />)

      await uploadImage()

      clickPresetByText('Post (Square)')

      fireEvent.click(screen.getByRole('button', { name: /Resize 1 Image$/i }))

      await waitFor(() => {
        expect(screen.getByText(/1 Image Resized/)).toBeInTheDocument()
      })

      // Open preview
      const previewButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('img'))

      if (previewButtons.length > 0) {
        fireEvent.click(previewButtons[0])

        await waitFor(() => {
          expect(screen.getByRole('dialog', { name: /Image preview/i })).toBeInTheDocument()
        })

        // Close by clicking the backdrop overlay
        const closeOverlay = screen.getByRole('button', { name: /Close preview/i })
        fireEvent.click(closeOverlay)

        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: /Image preview/i })).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<SocialMediaResizerPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Social Media Image Resizer')
    })

    it('resize button has minimum touch target size', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      // Select a preset so button is enabled
      clickPresetByText('Post (Square)')

      const resizeBtn = screen.getByRole('button', { name: /Resize 1 Image$/i })
      expect(resizeBtn).toBeInTheDocument()
    })

    it('Clear button is accessible', async () => {
      render(<SocialMediaResizerPage />)
      await uploadImage()

      const clearBtn = screen.getByRole('button', { name: /clear/i })
      expect(clearBtn).toBeInTheDocument()
      expect(clearBtn).toBeEnabled()
    })
  })
})
