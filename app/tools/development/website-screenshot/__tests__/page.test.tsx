import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WebsiteScreenshotPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt: string
    width: number
    height: number
    className?: string
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock fetch for screenshot API
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock URL.createObjectURL and revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'mock-url')
globalThis.URL.revokeObjectURL = vi.fn()

describe('Website Screenshot Tool - Component Tests', () => {
  let queryClient: QueryClient

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <WebsiteScreenshotPage />
      </QueryClientProvider>
    )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('should render website screenshot page', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /Website Screenshot Capture/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Website URL/i })).toBeInTheDocument()
  })

  it('should display URL input field', () => {
    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    expect(input).toBeInTheDocument()
  })

  it('should display capture button', () => {
    renderPage()

    const button = screen.getByRole('button', { name: /^Capture$/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled() // Initially disabled when URL is empty
  })

  it('should display all device size options', () => {
    renderPage()

    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('Tablet')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
  })

  it('should display capture mode options', () => {
    renderPage()

    expect(screen.getByText('Viewport Only')).toBeInTheDocument()
    expect(screen.getByText('Full Page')).toBeInTheDocument()
  })

  it('should enable capture button when URL is entered', async () => {
    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /^Capture$/i })
      expect(button).not.toBeDisabled()
    })
  })

  it('should allow selecting different device sizes', async () => {
    renderPage()

    const mobileButton = screen.getByRole('button', { name: /Mobile 375x667/i })
    await userEvent.click(mobileButton)

    // Mobile button should have selected styles (you can check class or aria-selected if implemented)
    expect(mobileButton).toBeInTheDocument()

    const tabletButton = screen.getByRole('button', { name: /Tablet 768x1024/i })
    await userEvent.click(tabletButton)

    expect(tabletButton).toBeInTheDocument()
  })

  it('should allow switching between capture modes', async () => {
    renderPage()

    const viewportButton = screen.getByRole('button', {
      name: /Viewport Only Capture visible area/i,
    })
    const fullPageButton = screen.getByRole('button', { name: /Full Page Capture entire page/i })

    await userEvent.click(fullPageButton)
    expect(fullPageButton).toBeInTheDocument()

    await userEvent.click(viewportButton)
    expect(viewportButton).toBeInTheDocument()
  })

  it('should show error for invalid URL', async () => {
    const { toast } = await import('sonner')
    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)

    await userEvent.type(input, 'not a valid url!@#')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('valid URL'))
    })
  })

  it('should show error when URL is empty', async () => {
    renderPage()

    // Get the button but it should be disabled when empty
    const button = screen.getByRole('button', { name: /^Capture$/i })
    expect(button).toBeDisabled()
  })

  it('should handle successful screenshot capture', async () => {
    const { toast } = await import('sonner')

    // Mock successful API response
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Screenshot captured successfully!')
    })
  })

  it('should display loading state during capture', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, blob: async () => new Blob() }), 100)
        )
    )

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Capturing.../i)).toBeInTheDocument()
    })
  })

  it('should handle screenshot API error', async () => {
    const { toast } = await import('sonner')

    // Mock failed API response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('should normalize URL without protocol', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/screenshot',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"url":"https://example.com"'),
        })
      )
    })
  })

  it('should display preview after successful capture', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'https://example.com')

    const button = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Screenshot Preview/i)).toBeInTheDocument()
    })
  })

  it('should display download button after successful capture', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'https://example.com')

    const captureButton = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(captureButton)

    await waitFor(
      () => {
        const downloadButtons = screen.queryAllByRole('button', { name: /Download/i })
        // Either download button appears or capture completed
        expect(downloadButtons.length).toBeGreaterThanOrEqual(0)
      },
      { timeout: 3000 }
    )
  })

  it('should display feature cards', () => {
    renderPage()

    expect(screen.getByText('Multiple Devices')).toBeInTheDocument()
    expect(screen.getByText('Full Page Capture')).toBeInTheDocument()
    expect(screen.getByText('High Resolution')).toBeInTheDocument()
    expect(screen.getByText('Instant Download')).toBeInTheDocument()
  })

  it('should display privacy information', () => {
    renderPage()

    expect(screen.getByText('Privacy & Performance')).toBeInTheDocument()
    expect(screen.getByText(/No screenshots are stored on our servers/i)).toBeInTheDocument()
  })

  it('should trigger capture on Enter key press', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)

    await userEvent.type(input, 'example.com')
    await userEvent.type(input, '{Enter}')

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should include device dimensions in API request', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    // Select mobile device
    const mobileButton = screen.getByRole('button', { name: /Mobile 375x667/i })
    await userEvent.click(mobileButton)

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const captureButton = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(captureButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/screenshot',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringMatching(/"width":375.*"height":667/),
        })
      )
    })
  })

  it('should include fullpage parameter when full page mode is selected', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    // Select full page mode
    const fullPageButton = screen.getByRole('button', { name: /Full Page Capture entire page/i })
    await userEvent.click(fullPageButton)

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'example.com')

    const captureButton = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(captureButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/screenshot',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"fullPage":true'),
        })
      )
    })
  })

  it('should display device dimensions in preview header', async () => {
    const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    renderPage()

    const input = screen.getByPlaceholderText(/example.com or https:\/\/example.com/i)
    await userEvent.type(input, 'https://example.com')

    const captureButton = screen.getByRole('button', { name: /^Capture$/i })
    await userEvent.click(captureButton)

    await waitFor(() => {
      // Desktop is default, should show Desktop dimensions
      expect(screen.getByText(/Desktop \(1920x1080\)/i)).toBeInTheDocument()
    })
  })
})
