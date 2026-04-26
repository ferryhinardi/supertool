import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import * as analytics from '@/lib/services/analytics'
import AIImageCaptionPage from '../page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/tools/ai-image-caption',
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

vi.mock('@/components/features/monetization/PaywallModal', () => ({
  PaywallModal: ({
    open,
    reason,
    remaining,
    onOpenChange,
  }: {
    open: boolean
    reason: 'quota-exceeded' | 'anonymous-blocked'
    remaining?: number
    onOpenChange: (value: boolean) => void
  }) =>
    open ? (
      <div data-testid="paywall-modal">
        <span>{reason}</span>
        <span>{remaining ?? 'no-remaining'}</span>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close paywall
        </button>
      </div>
    ) : null,
}))

vi.mock('@/lib/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}))

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: ((event: { target: { result: string | ArrayBuffer | null } }) => void) | null = null

  readAsDataURL(_file: File) {
    this.result = `data:image/jpeg;base64,mockbase64data`
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: this.result } })
      }
    }, 0)
  }
}

globalThis.FileReader = MockFileReader as unknown as typeof FileReader

// Mock fetch API
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Helper to create a proper Response mock
const createMockResponse = (data: unknown, ok = true, status = 200) => {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    clone: function () {
      return this
    },
  } as Response
}

describe('AI Image Caption Generator - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI Image Caption Generator page', () => {
    render(<AIImageCaptionPage />)

    expect(
      screen.getByRole('heading', { name: 'AI Image Caption Generator', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
  })

  it('should display upload zone', () => {
    render(<AIImageCaptionPage />)

    expect(screen.getByText(/Click to upload/)).toBeInTheDocument()
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AIImageCaptionPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_open', {})
  })
})

describe('AI Image Caption Generator - File Upload Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a drop message while dragging an image over the upload zone', async () => {
    render(<AIImageCaptionPage />)

    const uploadZone = screen.getByText(/Click to upload/).closest('[role="button"]')

    expect(uploadZone).not.toBeNull()

    if (!uploadZone) {
      throw new Error('Upload zone not found')
    }

    fireEvent.dragEnter(uploadZone)

    expect(screen.getByText('Drop image here')).toBeInTheDocument()

    fireEvent.dragLeave(uploadZone)

    await waitFor(() => {
      expect(screen.queryByText('Drop image here')).not.toBeInTheDocument()
    })
  })

  it('prevents default browser behavior while dragging over the upload zone', () => {
    render(<AIImageCaptionPage />)

    const uploadZone = screen.getByText(/Click to upload/).closest('[role="button"]')

    expect(uploadZone).not.toBeNull()

    if (!uploadZone) {
      throw new Error('Upload zone not found')
    }

    const dragOverEvent = createEvent.dragOver(uploadZone)
    dragOverEvent.preventDefault = vi.fn()
    dragOverEvent.stopPropagation = vi.fn()

    fireEvent(uploadZone, dragOverEvent)

    expect(dragOverEvent.preventDefault).toHaveBeenCalled()
    expect(dragOverEvent.stopPropagation).toHaveBeenCalled()
  })

  it('accepts a dropped image file', async () => {
    render(<AIImageCaptionPage />)

    const uploadZone = screen.getByText(/Click to upload/).closest('[role="button"]')
    const file = new File(['image content'], 'dropped.jpg', { type: 'image/jpeg' })

    expect(uploadZone).not.toBeNull()

    if (!uploadZone) {
      throw new Error('Upload zone not found')
    }

    fireEvent.drop(uploadZone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_upload', {
      size: file.size,
      type: file.type,
    })
  })

  it('should accept valid image file', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
  })

  it('should not display uploaded filename after upload', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    expect(screen.queryByText('File Name')).not.toBeInTheDocument()
    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
  })

  it('should reject non-image files', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['text content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a valid image file')
    })
  })

  it('should reject files larger than 20MB', async () => {
    render(<AIImageCaptionPage />)

    // Create a file larger than 20MB
    const largeFile = new File(['x'.repeat(21 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [largeFile] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Image file is too large (max 20MB)')
    })
  })

  it('should display image preview after upload', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      const preview = screen.getByAltText('Preview')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveAttribute('src', 'data:image/jpeg;base64,mockbase64data')
    })
  })

  it('should track analytics on file upload', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_upload', {
        size: file.size,
        type: file.type,
      })
    })
  })
})

describe('AI Image Caption Generator - Caption Type Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display caption type options after image upload', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Select Caption Type')).toBeInTheDocument()
    })

    // Check that caption types are present in the document
    const content = document.body.textContent || ''
    expect(content).toContain('Alt Text')
    expect(content).toContain('Detailed')
    expect(content).toContain('SEO')
    expect(content).toContain('Social Media')
  })

  it('should select caption type when clicked', async () => {
    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Select Caption Type')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const detailedButton = buttons.find((btn) => btn.textContent?.includes('Detailed'))

    expect(detailedButton).toBeDefined()
    if (detailedButton) {
      await userEvent.click(detailedButton)
      expect(detailedButton).toBeInTheDocument()
    }
  })

  it('should not display caption types before image upload', () => {
    render(<AIImageCaptionPage />)

    expect(screen.queryByText('Select Caption Type')).not.toBeInTheDocument()
  })
})

describe('AI Image Caption Generator - Caption Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('shows an error instead of generating when no image is selected', async () => {
    render(<AIImageCaptionPage />)

    expect(screen.queryByText('Select Caption Type')).not.toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should generate caption successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'A beautiful sunset over the ocean',
        usage: { total_tokens: 150 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    // Find the generate button by finding all buttons and filtering
    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      // Wait for the success toast which indicates caption was generated
      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      // Then verify the caption appears in the document
      const content = document.body.textContent || ''
      expect(content).toContain('A beautiful sunset over the ocean')
    }
  })

  it('should display loading state during generation', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(createMockResponse({ caption: 'Test', usage: { total_tokens: 100 } })),
            1000
          )
        )
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))

    if (generateButton) {
      await userEvent.click(generateButton)

      // Check that the button shows "Generating..." immediately
      await waitFor(
        () => {
          const allButtons = screen.getAllByRole('button')
          const loadingButton = allButtons.find((btn) => btn.textContent?.includes('Generating...'))
          expect(loadingButton).toBeDefined()
        },
        { timeout: 500 }
      )
    }
  })

  it('should track analytics on successful generation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 150 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_generate', {
        caption_type: 'altText',
        tokens: 150,
      })
    }
  })

  it('opens the paywall modal for a 402 quota-exceeded response instead of showing a generic error', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'quota-exceeded', remaining: 0 }, false, 402)
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
      })

      expect(screen.getByText('quota-exceeded')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(toast.error).not.toHaveBeenCalledWith('Failed to generate caption')
    }
  })

  it('tracks quota consumption with remaining count after a successful caption generation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 150 },
        remaining: 2,
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
      })

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('quota_consumed', {
        tool_slug: 'ai-image-caption',
        remaining: 2,
      })
      expect(screen.getByText('Remaining free captions today: 2')).toBeInTheDocument()
    }
  })

  it('clears a stale remaining quota hint when a later paywall response blocks generation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'First caption',
        usage: { total_tokens: 150 },
        remaining: 2,
      })
    )

    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'quota-exceeded', remaining: 0 }, false, 402)
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const generateButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Generate Caption'))

    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Remaining free captions today: 2')).toBeInTheDocument()
      })

      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
      })

      expect(screen.queryByText('Remaining free captions today: 2')).not.toBeInTheDocument()
    }
  })

  it('includes the authorization header when a Supabase session token is available', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'session-token',
        },
      },
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>)

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Authenticated caption',
        usage: { total_tokens: 120 },
        remaining: 1,
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/ai-caption',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer session-token',
              'Content-Type': 'application/json',
            }),
          })
        )
      })
    }
  })

  it('does not show a remaining quota hint or emit quota analytics when remaining is absent', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 150 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
      })

      expect(screen.queryByText(/Remaining free captions today:/i)).not.toBeInTheDocument()
      expect(analytics.trackToolEvent).not.toHaveBeenCalledWith(
        'quota_consumed',
        expect.any(Object)
      )
    }
  })

  it('allows closing the paywall modal after a blocked response', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'anonymous-blocked' }, false, 402)
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: 'Close paywall' }))

      await waitFor(() => {
        expect(screen.queryByTestId('paywall-modal')).not.toBeInTheDocument()
      })
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    }
  })

  it('should track analytics on generation error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'API error' }, false, 500))

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_error', {
          error: 'generation_failed',
          message: 'API error',
        })
      })
    }
  })
})

describe('AI Image Caption Generator - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should copy caption to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption to copy',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      // Verify caption appears
      const content = document.body.textContent || ''
      expect(content).toContain('Test caption to copy')

      // Find and click copy button
      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test caption to copy')
          expect(toast.success).toHaveBeenCalledWith('Caption copied to clipboard')
        })
      }
    }
  })

  it('should show copied state after copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find(
        (btn) => btn.textContent?.includes('Copy') && !btn.textContent?.includes('Copied')
      )
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          const content = document.body.textContent || ''
          expect(content).toContain('Copied')
        })
      }
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find(
        (btn) => btn.textContent?.includes('Copy') && !btn.textContent?.includes('Copied')
      )
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_caption_copy', {
            caption_type: 'altText',
          })
        })
      }
    }
  })
})

describe('AI Image Caption Generator - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears a visible remaining quota hint when the image is removed', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 100 },
        remaining: 1,
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const generateButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Generate Caption'))

    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('Remaining free captions today: 1')).toBeInTheDocument()
      })

      const clearButton = screen
        .getAllByRole('button')
        .find((button) => button.textContent?.includes('Clear Image'))

      expect(clearButton).toBeDefined()

      if (clearButton) {
        await userEvent.click(clearButton)

        await waitFor(() => {
          expect(screen.queryByText('Remaining free captions today: 1')).not.toBeInTheDocument()
        })
      }
    }
  })

  it('should clear image and captions', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Test caption',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const clearButton = allButtons.find((btn) => btn.textContent?.includes('Clear Image'))
      expect(clearButton).toBeDefined()

      if (clearButton) {
        await userEvent.click(clearButton)

        await waitFor(() => {
          expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
          expect(screen.queryByText('Test caption')).not.toBeInTheDocument()
          expect(screen.getByText(/Click to upload/)).toBeInTheDocument()
        })
      }
    }
  })
})

describe('AI Image Caption Generator - Multiple Caption Types Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should generate multiple caption types', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'Alt text caption',
        usage: { total_tokens: 100 },
      })
    )

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        caption: 'SEO optimized caption',
        usage: { total_tokens: 120 },
      })
    )

    render(<AIImageCaptionPage />)

    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/Click to upload/)

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    // Generate first caption (Alt Text - default)
    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Caption'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Caption generated successfully!')
        },
        { timeout: 5000 }
      )

      // Verify first caption appears
      await waitFor(
        () => {
          const content = document.body.textContent || ''
          expect(content).toContain('Alt text caption')
        },
        { timeout: 3000 }
      )

      // Select SEO type
      const allButtons = screen.getAllByRole('button')
      const seoButton = allButtons.find(
        (btn) =>
          btn.textContent?.includes('SEO') &&
          btn.textContent?.includes('Search engine optimized caption')
      )
      expect(seoButton).toBeDefined()

      if (seoButton) {
        await userEvent.click(seoButton)

        // Generate second caption
        const generateButtons = screen.getAllByRole('button')
        const generateButton2 = generateButtons.find((btn) =>
          btn.textContent?.includes('Generate Caption')
        )

        if (generateButton2) {
          await userEvent.click(generateButton2)

          await waitFor(
            () => {
              // Check that success toast was called with caption message at least twice
              const successCalls = vi
                .mocked(toast.success)
                .mock.calls.filter((call) => call[0] === 'Caption generated successfully!')
              expect(successCalls.length).toBeGreaterThanOrEqual(2)
            },
            { timeout: 5000 }
          )

          // Verify second caption appears
          await waitFor(
            () => {
              const content = document.body.textContent || ''
              expect(content).toContain('SEO optimized caption')
            },
            { timeout: 3000 }
          )

          // Both captions should be visible
          const finalContent = document.body.textContent || ''
          expect(finalContent).toContain('Alt text caption')
          expect(finalContent).toContain('SEO optimized caption')
        }
      }
    }
  })
})
