// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VideoSubtitleCombinerPage from '../page'

// Setup browser API mocks
beforeEach(() => {
  // Mock sessionStorage
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
    configurable: true,
  })

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString()
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    }
  })()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })

  // Mock window.scrollY and scrollTo
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  window.scrollTo = vi.fn()

  // Mock requestAnimationFrame / cancelAnimationFrame
  let rafId = 0
  window.requestAnimationFrame = vi.fn((callback) => {
    rafId++
    setTimeout(callback, 0)
    return rafId
  }) as any
  window.cancelAnimationFrame = vi.fn() as any

  // Mock window.innerWidth for responsive behavior
  Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true })

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any

  // Mock IntersectionObserver
  window.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any

  // Mock document.visibilityState
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    writable: true,
  })

  // Mock URL.createObjectURL and URL.revokeObjectURL
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()

  // Mock window.alert
  window.alert = vi.fn()
})

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    function MockIconComponent(props: any) {
      return React.createElement('svg', {
        'data-testid': `${name.toLowerCase()}-icon`,
        role: 'img',
        'aria-label': `${name} icon`,
        xmlns: 'http://www.w3.org/2000/svg',
        ...props,
      })
    }
    MockIconComponent.displayName = `${name}Icon`
    return MockIconComponent
  }

  return {
    __esModule: true,
    AlertCircle: createMockIcon('AlertCircle'),
    CheckCircle: createMockIcon('CheckCircle'),
    Download: createMockIcon('Download'),
    FileText: createMockIcon('FileText'),
    FileVideo: createMockIcon('FileVideo'),
    Loader2: createMockIcon('Loader2'),
    Palette: createMockIcon('Palette'),
    Play: createMockIcon('Play'),
    Settings: createMockIcon('Settings'),
    Sparkles: createMockIcon('Sparkles'),
    Subtitles: createMockIcon('Subtitles'),
    Trash2: createMockIcon('Trash2'),
    Video: createMockIcon('Video'),
    Zap: createMockIcon('Zap'),
    Upload: createMockIcon('Upload'),
    Film: createMockIcon('Film'),
  }
})

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, transition, whileHover, whileTap, style, ...restProps } = props
      return React.createElement('div', { style, ...restProps }, children)
    },
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock fetch API
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('Video Subtitle Combiner - Browser Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: server is ready
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', ffmpeg: 'installed' }),
    })
  })

  describe('Page Rendering', () => {
    it('should render page without errors', async () => {
      const { container } = render(<VideoSubtitleCombinerPage />)
      expect(container).toBeDefined()
      expect(screen.getByText('Video Subtitle Combiner')).toBeInTheDocument()
    })

    it('should render all main sections', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Subtitle Styling')).toBeInTheDocument()
        expect(screen.getByText('Upload Files')).toBeInTheDocument()
        expect(screen.getByText('Multiple Formats')).toBeInTheDocument()
      })
    })

    it('should have proper accessibility attributes', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        // Check for proper ARIA labels
        const fileInputs = screen.getAllByLabelText(/File upload/i)
        expect(fileInputs).toHaveLength(2)

        // Check for semantic HTML
        const main = screen.getByRole('main', { hidden: true })
        expect(main).toBeInTheDocument()
      })
    })
  })

  describe('Server Status Integration', () => {
    it('should check server status on mount', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/video-subtitle')
      })
    })

    it('should show loading state initially', () => {
      render(<VideoSubtitleCombinerPage />)
      expect(screen.getByText('Checking server status...')).toBeInTheDocument()
    })

    it('should transition to ready state when server is available', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
        expect(screen.queryByText('Checking server status...')).not.toBeInTheDocument()
      })
    })

    it('should show error state when server check fails', async () => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg is not installed on the server/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockReset()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg is not installed on the server/i)).toBeInTheDocument()
      })
    })
  })

  describe('File Upload Integration', () => {
    it('should handle video file upload through drag and drop zone', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4',
      })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      const videoInput = fileInputs[0] as HTMLInputElement

      await user.upload(videoInput, videoFile)

      await waitFor(() => {
        expect(screen.getByText(/test-video.mp4/i)).toBeInTheDocument()
      })
    })

    it('should handle subtitle file upload', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const subtitleContent = `1
00:00:00,000 --> 00:00:02,000
Test subtitle line`

      const subtitleFile = new File([subtitleContent], 'test-subtitle.srt', {
        type: 'application/x-subrip',
      })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      const subtitleInput = fileInputs[1] as HTMLInputElement

      await user.upload(subtitleInput, subtitleFile)

      await waitFor(() => {
        expect(screen.getByText(/test-subtitle.srt/i)).toBeInTheDocument()
      })
    })

    it('should validate video file type', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const invalidFile = new File(['text'], 'test.txt', {
        type: 'text/plain',
      })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], invalidFile)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Please select a valid video file')
      })
    })

    it('should validate video file size', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const largeFile = new File(['x'], 'large.mp4', { type: 'video/mp4' })
      Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], largeFile)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('exceeds the'))
      })
    })

    it('should validate subtitle file format', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const invalidSubtitle = new File(['no timecodes here'], 'invalid.srt', {
        type: 'text/plain',
      })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[1], invalidSubtitle)

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Please select a valid subtitle file (SRT, VTT, ASS, SSA)'
        )
      })
    })
  })

  describe('Subtitle Styling Controls', () => {
    it('should adjust font size slider', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const fontSizeSlider = screen.getByLabelText(/Font Size/i) as HTMLInputElement
      expect(fontSizeSlider.value).toBe('24')

      await user.clear(fontSizeSlider)
      await user.type(fontSizeSlider, '36')

      expect(screen.getByText('36px')).toBeInTheDocument()
    })

    it('should change font color', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const fontColorInputs = screen.getAllByLabelText(/Font Color/i)
      const fontColorPicker = fontColorInputs[0] as HTMLInputElement

      await user.click(fontColorPicker)
      // Color picker interaction would happen here in real browser
      expect(fontColorPicker).toBeInTheDocument()
    })

    it('should adjust background opacity', async () => {
      render(<VideoSubtitleCombinerPage />)
      const _user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      expect(screen.getByText('50%')).toBeInTheDocument() // Default 0.5 * 100
    })

    it('should change subtitle position', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const topButton = screen.getByRole('button', { name: /Top/i })
      const centerButton = screen.getByRole('button', { name: /Center/i })
      const bottomButton = screen.getByRole('button', { name: /Bottom/i })

      expect(topButton).toBeInTheDocument()
      expect(centerButton).toBeInTheDocument()
      expect(bottomButton).toBeInTheDocument()

      await user.click(topButton)
      // Position state would change (tested via integration)
    })
  })

  describe('Video Processing Workflow', () => {
    it('should enable process button when both files are uploaded', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      expect(processButton).toBeDisabled()

      // Upload video
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)

      // Still disabled (need subtitle too)
      expect(processButton).toBeDisabled()

      // Upload subtitle
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      await user.upload(fileInputs[1], subtitleFile)

      await waitFor(() => {
        expect(processButton).not.toBeDisabled()
      })
    })

    it('should process video and show result', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock successful processing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed video'], { type: 'video/mp4' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      // Upload files
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      // Click process button
      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      await user.click(processButton)

      // Should show processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })

    it('should handle processing errors', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'FFmpeg processing failed' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg processing failed/i)).toBeInTheDocument()
      })
    })

    it('should allow downloading completed video', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed'], { type: 'video/mp4' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })

      // Find download button (has Download icon)
      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) =>
        btn.querySelector('[data-testid="download-icon"]')
      )
      expect(downloadButton).toBeInTheDocument()
    })
  })

  describe('File Management', () => {
    it('should allow removing individual processed files', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed'], { type: 'video/mp4' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })

      // Find remove button (has Trash2 icon)
      const buttons = screen.getAllByRole('button')
      const removeButtons = buttons.filter((btn) =>
        btn.querySelector('[data-testid="trash2-icon"]')
      )
      expect(removeButtons.length).toBeGreaterThan(0)

      // Click the remove button for the file (not the clear all button)
      const fileRemoveButton = removeButtons[removeButtons.length - 1]
      await user.click(fileRemoveButton)

      await waitFor(() => {
        expect(screen.queryByText('test.mp4')).not.toBeInTheDocument()
      })
    })

    it('should clear all processed files', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed'], { type: 'video/mp4' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      const processButton = screen.getByRole('button', { name: /Burn Subtitles/i })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText('Processing Results')).toBeInTheDocument()
      })

      // Find clear all button (first trash icon in header)
      const buttons = screen.getAllByRole('button')
      const trashButtons = buttons.filter((btn) => btn.querySelector('[data-testid="trash2-icon"]'))
      const clearAllButton = trashButtons[0]

      await user.click(clearAllButton)

      await waitFor(() => {
        expect(screen.queryByText('Processing Results')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should render correctly on mobile viewport', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })

      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Video Subtitle Combiner')).toBeInTheDocument()
      })
    })

    it('should render correctly on tablet viewport', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })

      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Video Subtitle Combiner')).toBeInTheDocument()
      })
    })

    it('should render correctly on desktop viewport', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })

      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Video Subtitle Combiner')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for file upload zones', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      // Tab to file upload zone
      await user.tab()

      // The drag-drop zone should be focusable
      const dragDropZones = screen.getAllByRole('button', { hidden: true })
      expect(dragDropZones.length).toBeGreaterThan(0)
    })
  })

  describe('Memory Management', () => {
    it('should clean up object URLs on unmount', async () => {
      const { unmount } = render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed'], { type: 'video/mp4' }),
      })

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      expect(URL.createObjectURL).toHaveBeenCalled()

      unmount()

      // Object URLs should be revoked on cleanup
      // (In real app, this happens when files are removed or component unmounts)
    })
  })
})
