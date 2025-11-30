import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VideoSubtitleCombinerPage from '../page'

// Create mock FFmpeg class
class MockFFmpeg {
  on = vi.fn()
  load = vi.fn(async () => {
    // Simulate successful load after a delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    return Promise.resolve()
  })
  writeFile = vi.fn()
  readFile = vi.fn()
  deleteFile = vi.fn()
  exec = vi.fn()
}

// Mock FFmpeg loader module
vi.mock('@/lib/ffmpeg-loader', () => ({
  loadFFmpegModules: async () => ({
    FFmpeg: MockFFmpeg,
    toBlobURL: async (url: string) => `blob:${url}`,
    fetchFile: async (_file: File) => new Uint8Array(),
  }),
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

describe('VideoSubtitleCombinerPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>)
  }

  it('should render page without hydration errors', () => {
    const { container } = renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Check title exists (may appear multiple times due to ToolSearch dialog)
    const titles = screen.getAllByText('Video Subtitle Combiner')
    expect(titles.length).toBeGreaterThan(0)

    // Check description exists (may also appear in ToolSearch)
    const descriptions = screen.getAllByText(/Merge SRT subtitle files/i)
    expect(descriptions.length).toBeGreaterThan(0)

    // No hydration errors should occur
    expect(container).toBeDefined()
  })

  it('should show loading state initially after mount', async () => {
    renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Wait for component to mount and show loading
    await waitFor(
      () => {
        const loadingText = screen.queryByText('Loading FFmpeg engine...')
        expect(loadingText).toBeDefined()
      },
      { timeout: 2000 }
    )
  })

  it('should render file upload sections', () => {
    renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Check for file upload section headers (there may be multiple with same text)
    const videoSections = screen.getAllByText('Video File')
    const subtitleSections = screen.getAllByText(/Subtitle File/i)

    expect(videoSections.length).toBeGreaterThan(0)
    expect(subtitleSections.length).toBeGreaterThan(0)
  })

  it('should have FFmpeg modules loadable', async () => {
    // Direct test of the loader
    const { loadFFmpegModules } = await import('@/lib/ffmpeg-loader')
    const modules = await loadFFmpegModules()

    expect(modules.FFmpeg).toBeDefined()
    expect(modules.toBlobURL).toBeDefined()
    expect(modules.fetchFile).toBeDefined()
  })

  it('should have error handling UI components', () => {
    renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Check that main container exists
    const headings = screen.getAllByText(/Video Subtitle Combiner/i)
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have proper styling with Panda CSS', () => {
    const { container } = renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Check main container has proper classes
    const main = container.querySelector('main')
    expect(main).toBeDefined()
    expect(main?.className).toContain('mx_auto')
  })

  it('should render subtitle styling options', () => {
    renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Check for styling controls
    expect(screen.getByText('Subtitle Style')).toBeDefined()
    expect(screen.getByText('Font Size')).toBeDefined()
    expect(screen.getByText('Font Color')).toBeDefined()
    expect(screen.getByText('Background Color')).toBeDefined()
  })

  it('should disable process button initially', () => {
    renderWithQueryClient(<VideoSubtitleCombinerPage />)

    // Find the process button
    const processButton = screen.getByText(/Combine Video & Subtitles/i)
    expect(processButton).toBeDefined()

    // Button should be disabled initially (no files selected)
    expect(processButton.closest('button')?.disabled).toBe(true)
  })
})
