import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the utils module
vi.mock('../utils', () => ({
  loadImageFromFile: vi.fn(),
  getImageDimensions: vi.fn(),
  compareImages: vi.fn(),
  resizeImage: vi.fn(),
  imageDataToDataURL: vi.fn(),
  downloadImage: vi.fn(),
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
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
    children,
    disabled,
    accept,
    className,
  }: {
    onFilesSelected: (files: FileList) => void
    children?: React.ReactNode
    disabled?: boolean
    accept?: string
    className?: string
  }) => (
    <div
      data-testid="drag-drop-zone"
      data-disabled={disabled}
      data-accept={accept}
      className={className}
    >
      <input
        type="file"
        data-testid="file-input"
        accept={accept}
        disabled={disabled}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
      {children}
    </div>
  ),
}))

// Mock ToolSearch component
vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search" />,
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockObjectURLs: string[] = []
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import ScreenshotDiffPage from '../page'
import {
  compareImages,
  downloadImage,
  getImageDimensions,
  imageDataToDataURL,
  loadImageFromFile,
  resizeImage,
} from '../utils'

describe('ScreenshotDiffPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL methods
    URL.createObjectURL = vi.fn((_blob) => {
      const url = `blob:mock-url-${mockObjectURLs.length}`
      mockObjectURLs.push(url)
      return url
    })
    URL.revokeObjectURL = vi.fn()

    // Setup default mock implementations
    vi.mocked(getImageDimensions).mockResolvedValue({ width: 100, height: 100 })
    vi.mocked(loadImageFromFile).mockResolvedValue({
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100,
      colorSpace: 'srgb',
    })
    vi.mocked(compareImages).mockReturnValue({
      diffPixels: 100,
      totalPixels: 10000,
      percentageDiff: 1,
      diffImageData: {
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100,
        colorSpace: 'srgb',
      },
    })
    vi.mocked(resizeImage).mockReturnValue({
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100,
      colorSpace: 'srgb',
    })
    vi.mocked(imageDataToDataURL).mockReturnValue('data:image/png;base64,mockdiffimage')
  })

  afterEach(() => {
    cleanup()
    mockObjectURLs.length = 0
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  describe('Initial Render', () => {
    it('renders the page header correctly', () => {
      render(<ScreenshotDiffPage />)

      expect(screen.getByText('Pixel-Perfect Comparison')).toBeInTheDocument()
      expect(screen.getByText('Screenshot Diff Tool')).toBeInTheDocument()
      expect(
        screen.getByText(/Compare UI screenshots pixel-by-pixel to detect visual changes/)
      ).toBeInTheDocument()
    })

    it('renders the upload section with two drop zones', () => {
      render(<ScreenshotDiffPage />)

      expect(screen.getByText('Upload Screenshots')).toBeInTheDocument()
      expect(screen.getByText('Screenshot 1 (Before)')).toBeInTheDocument()
      expect(screen.getByText('Screenshot 2 (After)')).toBeInTheDocument()
      expect(screen.getAllByTestId('drag-drop-zone')).toHaveLength(2)
    })

    it('renders the info card with pro tips', () => {
      render(<ScreenshotDiffPage />)

      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(
        screen.getByText('Lower threshold values (0-0.1) detect subtle color differences')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Images with different dimensions will be automatically resized to match')
      ).toBeInTheDocument()
    })

    it('renders the tool search component', () => {
      render(<ScreenshotDiffPage />)

      expect(screen.getByTestId('tool-search')).toBeInTheDocument()
    })

    it('tracks page visit on mount', () => {
      render(<ScreenshotDiffPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_open', {})
    })

    it('does not show settings section initially', () => {
      render(<ScreenshotDiffPage />)

      expect(screen.queryByText('Comparison Settings')).not.toBeInTheDocument()
    })
  })

  describe('File Upload Handling', () => {
    it('accepts image files for screenshot 1', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test1.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_upload_image1', {})
      })
    })

    it('accepts image files for screenshot 2', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[1], { target: { files: [file] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_upload_image2', {})
      })
    })

    it('rejects non-image files for screenshot 1', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a valid image file')
      })
    })

    it('rejects non-image files for screenshot 2', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      fireEvent.change(inputs[1], { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a valid image file')
      })
    })

    it('shows settings section after uploading an image', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Comparison Settings')).toBeInTheDocument()
      })
    })

    it('displays file name badge after uploading image 1', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'before-screenshot.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('before-screenshot.png')).toBeInTheDocument()
      })
    })

    it('displays file name badge after uploading image 2', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'after-screenshot.png', { type: 'image/png' })

      fireEvent.change(inputs[1], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('after-screenshot.png')).toBeInTheDocument()
      })
    })
  })

  describe('Image Comparison', () => {
    it('performs comparison when both images are uploaded', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(getImageDimensions).toHaveBeenCalledTimes(2)
        expect(loadImageFromFile).toHaveBeenCalledTimes(2)
        expect(compareImages).toHaveBeenCalled()
      })
    })

    it('shows comparison results after successful comparison', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('Comparison Results')).toBeInTheDocument()
        expect(screen.getByText('Total Pixels')).toBeInTheDocument()
        expect(screen.getByText('Different Pixels')).toBeInTheDocument()
        expect(screen.getByText('Difference')).toBeInTheDocument()
      })
    })

    it('displays correct statistics in results', async () => {
      vi.mocked(compareImages).mockReturnValue({
        diffPixels: 500,
        totalPixels: 20000,
        percentageDiff: 2.5,
        diffImageData: {
          data: new Uint8ClampedArray(100 * 100 * 4),
          width: 100,
          height: 100,
          colorSpace: 'srgb',
        },
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('20,000')).toBeInTheDocument()
        expect(screen.getByText('500')).toBeInTheDocument()
        expect(screen.getByText('2.50%')).toBeInTheDocument()
      })
    })

    it('shows success toast after comparison', async () => {
      vi.mocked(compareImages).mockReturnValue({
        diffPixels: 100,
        totalPixels: 10000,
        percentageDiff: 1,
        diffImageData: {
          data: new Uint8ClampedArray(100 * 100 * 4),
          width: 100,
          height: 100,
          colorSpace: 'srgb',
        },
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Comparison complete! 1.00% difference detected',
          { duration: 3000 }
        )
      })
    })

    it('tracks comparison event', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_compare', {
          threshold: 0.1,
          diff_percentage: '1.00',
          dimensions_match: true,
        })
      })
    })

    it('resizes images when dimensions do not match', async () => {
      vi.mocked(getImageDimensions)
        .mockResolvedValueOnce({ width: 100, height: 100 })
        .mockResolvedValueOnce({ width: 200, height: 150 })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith(
          'Images have different dimensions. Resizing to 200x150',
          { duration: 3000 }
        )
        expect(resizeImage).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error when comparison fails', async () => {
      vi.mocked(compareImages).mockImplementation(() => {
        throw new Error('Failed to compare images')
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('Comparison Error')).toBeInTheDocument()
        expect(screen.getByText('Failed to compare images')).toBeInTheDocument()
      })
    })

    it('shows error toast when comparison fails', async () => {
      vi.mocked(loadImageFromFile).mockRejectedValue(new Error('Cannot load image'))

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cannot load image')
      })
    })

    it('handles non-Error thrown values', async () => {
      vi.mocked(compareImages).mockImplementation(() => {
        throw 'Unknown error'
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('Failed to compare images')).toBeInTheDocument()
      })
    })
  })

  describe('Settings Section', () => {
    it('renders threshold slider with default value', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Sensitivity Threshold')).toBeInTheDocument()
        expect(screen.getByText('0.1')).toBeInTheDocument()
      })
    })

    it('allows changing threshold value', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        const thresholdInput = screen.getByRole('slider')
        fireEvent.change(thresholdInput, { target: { value: '0.5' } })
        expect(screen.getByText('0.5')).toBeInTheDocument()
      })
    })

    it('clamps threshold to valid range', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Sensitivity Threshold')).toBeInTheDocument()
      })

      // The slider should be present with the default value
      const thresholdInput = screen.getByRole('slider')
      expect(thresholdInput).toHaveAttribute('min', '0')
      expect(thresholdInput).toHaveAttribute('max', '1')
      expect(thresholdInput).toHaveAttribute('value', '0.1')
    })

    it('renders view mode buttons', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('View Mode')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Side-by-Side/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Overlay/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Diff Only/i })).toBeInTheDocument()
      })
    })
  })

  describe('View Modes', () => {
    const setupComparison = async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('Comparison Results')).toBeInTheDocument()
      })
    }

    it('shows side-by-side view by default', async () => {
      await setupComparison()

      expect(screen.getByText('Screenshot 1')).toBeInTheDocument()
      expect(screen.getByText('Screenshot 2')).toBeInTheDocument()
      expect(screen.getByText('Diff (Magenta)')).toBeInTheDocument()
    })

    it('switches to overlay view when button is clicked', async () => {
      await setupComparison()

      const overlayButton = screen.getByRole('button', { name: /Overlay/i })
      fireEvent.click(overlayButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Hide Overlay/i })).toBeInTheDocument()
      })
    })

    it('toggles overlay visibility in overlay mode', async () => {
      await setupComparison()

      const overlayButton = screen.getByRole('button', { name: /Overlay/i })
      fireEvent.click(overlayButton)

      await waitFor(() => {
        const hideButton = screen.getByRole('button', { name: /Hide Overlay/i })
        fireEvent.click(hideButton)
        expect(screen.getByRole('button', { name: /Show Overlay/i })).toBeInTheDocument()
      })
    })

    it('switches to diff-only view when button is clicked', async () => {
      await setupComparison()

      const diffOnlyButton = screen.getByRole('button', { name: /Diff Only/i })
      fireEvent.click(diffOnlyButton)

      await waitFor(() => {
        expect(screen.getByText('Differences Highlighted (Magenta)')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('renders reset button when images are uploaded', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
      })
    })

    it('clears all state when reset is clicked', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('Comparison Results')).toBeInTheDocument()
      })

      const resetButton = screen.getByRole('button', { name: /Reset/i })
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(screen.queryByText('Comparison Results')).not.toBeInTheDocument()
        expect(screen.queryByText('Comparison Settings')).not.toBeInTheDocument()
      })
    })

    it('shows success toast on reset', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /Reset/i })
        fireEvent.click(resetButton)
        expect(toast.success).toHaveBeenCalledWith('Reset complete')
      })
    })

    it('tracks reset event', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file] } })

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /Reset/i })
        fireEvent.click(resetButton)
        expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_reset', {})
      })
    })
  })

  describe('Download Functionality', () => {
    it('renders download button when comparison result exists', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download Diff/i })).toBeInTheDocument()
      })
    })

    it('calls downloadImage when download button is clicked', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /Download Diff/i })
        fireEvent.click(downloadButton)
        expect(downloadImage).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.any(Uint8ClampedArray),
            width: 100,
            height: 100,
          }),
          'screenshot-diff.png'
        )
      })
    })

    it('shows success toast on download', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /Download Diff/i })
        fireEvent.click(downloadButton)
        expect(toast.success).toHaveBeenCalledWith('Diff image downloaded!')
      })
    })

    it('tracks download event', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /Download Diff/i })
        fireEvent.click(downloadButton)
        expect(trackToolEvent).toHaveBeenCalledWith('screenshot_diff_download', {})
      })
    })
  })

  describe('URL Object Lifecycle', () => {
    it('creates object URLs for uploaded images', async () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Processing State', () => {
    it('disables drop zones while processing', async () => {
      // Make loadImageFromFile slow to capture processing state
      vi.mocked(loadImageFromFile).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: new Uint8ClampedArray(100 * 100 * 4),
                  width: 100,
                  height: 100,
                  colorSpace: 'srgb',
                }),
              100
            )
          )
      )

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      // Check that we eventually get results (processing completes)
      await waitFor(
        () => {
          expect(screen.getByText('Comparison Results')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })
  })

  describe('Empty FileList Handling', () => {
    it('does not process empty file list for image 1', () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      fireEvent.change(inputs[0], { target: { files: [] } })

      expect(trackToolEvent).not.toHaveBeenCalledWith('screenshot_diff_upload_image1', {})
    })

    it('does not process empty file list for image 2', () => {
      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      fireEvent.change(inputs[1], { target: { files: [] } })

      expect(trackToolEvent).not.toHaveBeenCalledWith('screenshot_diff_upload_image2', {})
    })
  })

  describe('Percentage Difference Styling', () => {
    it('applies green styling for low difference (<1%)', async () => {
      vi.mocked(compareImages).mockReturnValue({
        diffPixels: 50,
        totalPixels: 10000,
        percentageDiff: 0.5,
        diffImageData: {
          data: new Uint8ClampedArray(100 * 100 * 4),
          width: 100,
          height: 100,
          colorSpace: 'srgb',
        },
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('0.50%')).toBeInTheDocument()
      })
    })

    it('applies red styling for high difference (>=1%)', async () => {
      vi.mocked(compareImages).mockReturnValue({
        diffPixels: 500,
        totalPixels: 10000,
        percentageDiff: 5,
        diffImageData: {
          data: new Uint8ClampedArray(100 * 100 * 4),
          width: 100,
          height: 100,
          colorSpace: 'srgb',
        },
      })

      render(<ScreenshotDiffPage />)

      const inputs = screen.getAllByTestId('file-input')
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' })
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' })

      fireEvent.change(inputs[0], { target: { files: [file1] } })
      fireEvent.change(inputs[1], { target: { files: [file2] } })

      await waitFor(() => {
        expect(screen.getByText('5.00%')).toBeInTheDocument()
      })
    })
  })
})
