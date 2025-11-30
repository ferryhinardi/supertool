import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VideoSubtitleCombinerPage from '../page'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch as any

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Video Subtitle Combiner - Upload Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful server status check by default
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', ffmpeg: 'installed' }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Server Status Check', () => {
    it('should check server status on mount', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/video-subtitle')
      })
    })

    it('should show ready status when server is available', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })
    })

    it('should show error status when server is unavailable', async () => {
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

    it('should show checking status initially', () => {
      render(<VideoSubtitleCombinerPage />)

      expect(screen.getByText('Checking server status...')).toBeInTheDocument()
    })
  })

  describe('Video File Upload', () => {
    it('should accept valid video file', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Wait for server to be ready
      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      // Create a mock video file
      const videoFile = new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4',
      })

      // Find video upload input
      const videoInputs = screen.getAllByLabelText(/File upload/i)
      const videoInput = videoInputs[0] as HTMLInputElement

      await user.upload(videoInput, videoFile)

      await waitFor(() => {
        expect(screen.getByText(/test-video.mp4/i)).toBeInTheDocument()
      })
    })

    it('should reject non-video file', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      // Create a mock text file (not video)
      const invalidFile = new File(['text content'], 'test.txt', {
        type: 'text/plain',
      })

      const videoInputs = screen.getAllByLabelText(/File upload/i)
      const videoInput = videoInputs[0] as HTMLInputElement

      await user.upload(videoInput, invalidFile)

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Please select a valid video file')
      })

      alertMock.mockRestore()
    })

    it('should reject video file exceeding size limit', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      // Create a file larger than 500MB (mock by setting size property)
      const largeFile = new File(['x'], 'large-video.mp4', {
        type: 'video/mp4',
      })
      Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 })

      const videoInputs = screen.getAllByLabelText(/File upload/i)
      const videoInput = videoInputs[0] as HTMLInputElement

      await user.upload(videoInput, largeFile)

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('exceeds the'))
      })

      alertMock.mockRestore()
    })

    it('should display video file size', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4',
      })
      Object.defineProperty(videoFile, 'size', { value: 1024 * 1024 }) // 1MB

      const videoInputs = screen.getAllByLabelText(/File upload/i)
      const videoInput = videoInputs[0] as HTMLInputElement

      await user.upload(videoInput, videoFile)

      await waitFor(() => {
        expect(screen.getByText(/1 MB/i)).toBeInTheDocument()
      })
    })
  })

  describe('Subtitle File Upload', () => {
    it('should accept valid SRT subtitle file', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const subtitleContent = `1
00:00:00,000 --> 00:00:02,000
Test subtitle`

      const subtitleFile = new File([subtitleContent], 'test-subtitle.srt', {
        type: 'application/x-subrip',
      })

      const subtitleInputs = screen.getAllByLabelText(/File upload/i)
      const subtitleInput = subtitleInputs[1] as HTMLInputElement

      await user.upload(subtitleInput, subtitleFile)

      await waitFor(() => {
        expect(screen.getByText(/test-subtitle.srt/i)).toBeInTheDocument()
      })
    })

    it('should accept valid VTT subtitle file', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const subtitleContent = `WEBVTT

00:00:00.000 --> 00:00:02.000
Test subtitle`

      const subtitleFile = new File([subtitleContent], 'test-subtitle.vtt', {
        type: 'text/vtt',
      })

      const subtitleInputs = screen.getAllByLabelText(/File upload/i)
      const subtitleInput = subtitleInputs[1] as HTMLInputElement

      await user.upload(subtitleInput, subtitleFile)

      await waitFor(() => {
        expect(screen.getByText(/test-subtitle.vtt/i)).toBeInTheDocument()
      })
    })

    it('should reject invalid subtitle file without timecodes', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const invalidContent = 'This is not a valid subtitle file'

      const subtitleFile = new File([invalidContent], 'invalid.srt', {
        type: 'text/plain',
      })

      const subtitleInputs = screen.getAllByLabelText(/File upload/i)
      const subtitleInput = subtitleInputs[1] as HTMLInputElement

      await user.upload(subtitleInput, subtitleFile)

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          'Please select a valid subtitle file (SRT, VTT, ASS, SSA)'
        )
      })

      alertMock.mockRestore()
    })
  })

  describe('Process Button State', () => {
    it('should disable process button when no files are selected', async () => {
      render(<VideoSubtitleCombinerPage />)

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      expect(processButton).toBeDisabled()
    })

    it('should disable process button when only video is selected', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const videoInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(videoInputs[0], videoFile)

      await waitFor(() => {
        const processButton = screen.getByRole('button', {
          name: /Burn Subtitles/i,
        })
        expect(processButton).toBeDisabled()
      })
    })

    it('should disable process button when only subtitle is selected', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('Server ready for processing')).toBeInTheDocument()
      })

      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })
      const subtitleInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(subtitleInputs[1], subtitleFile)

      await waitFor(() => {
        const processButton = screen.getByRole('button', {
          name: /Burn Subtitles/i,
        })
        expect(processButton).toBeDisabled()
      })
    })

    it('should enable process button when both files are selected', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

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

      await waitFor(() => {
        const processButton = screen.getByRole('button', {
          name: /Burn Subtitles/i,
        })
        expect(processButton).not.toBeDisabled()
      })
    })

    it('should disable process button when server is not ready', async () => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg is not installed on the server/i)).toBeInTheDocument()
      })

      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' })
      const subtitleFile = new File(['1\n00:00:00,000 --> 00:00:02,000\nTest'], 'test.srt', {
        type: 'text/plain',
      })

      const fileInputs = screen.getAllByLabelText(/File upload/i)
      await user.upload(fileInputs[0], videoFile)
      await user.upload(fileInputs[1], subtitleFile)

      await waitFor(() => {
        const processButton = screen.getByRole('button', {
          name: /Burn Subtitles/i,
        })
        expect(processButton).toBeDisabled()
      })
    })
  })

  describe('Video Processing', () => {
    it('should call API with correct parameters', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed video'], { type: 'video/mp4' }),
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

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      await user.click(processButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/video-subtitle',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        )
      })
    })

    it('should show processing state during upload', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock API with delay
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  blob: async () => new Blob(['processed'], { type: 'video/mp4' }),
                }),
              1000
            )
          )
      )

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

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      await user.click(processButton)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('should show error message on API failure', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock API error
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

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText(/FFmpeg processing failed/i)).toBeInTheDocument()
      })
    })

    it('should show completed state after successful processing', async () => {
      render(<VideoSubtitleCombinerPage />)
      const user = userEvent.setup()

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['processed video'], { type: 'video/mp4' }),
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

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      await user.click(processButton)

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })
  })

  describe('Subtitle Styling Options', () => {
    it('should include styling options in API request', async () => {
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

      const processButton = screen.getByRole('button', {
        name: /Burn Subtitles/i,
      })
      await user.click(processButton)

      await waitFor(() => {
        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
        const formData = lastCall[1].body as FormData
        const options = formData.get('options')
        expect(options).toBeTruthy()

        const parsedOptions = JSON.parse(options as string)
        expect(parsedOptions).toHaveProperty('fontSize')
        expect(parsedOptions).toHaveProperty('fontColor')
        expect(parsedOptions).toHaveProperty('backgroundColor')
        expect(parsedOptions).toHaveProperty('backgroundOpacity')
        expect(parsedOptions).toHaveProperty('position')
      })
    })
  })
})
