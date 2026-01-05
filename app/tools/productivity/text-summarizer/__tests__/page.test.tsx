import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import TextSummarizerPage from '../page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
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

// Mock clipboard API

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

describe('Text Summarizer - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render Text Summarizer page', () => {
    render(<TextSummarizerPage />)

    expect(screen.getByRole('heading', { name: 'Text Summarizer', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Text to Summarize')).toBeInTheDocument()
  })

  it('should display text input area', () => {
    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<TextSummarizerPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('text_summarizer_open', {})
  })

  it('should display pro tips card', () => {
    render(<TextSummarizerPage />)

    expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    const content = document.body.textContent || ''
    expect(content).toMatch(/best results|50 words/i)
  })

  it('should display length options', () => {
    render(<TextSummarizerPage />)

    expect(screen.getByText('Short')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Long')).toBeInTheDocument()
  })

  it('should display format options', () => {
    render(<TextSummarizerPage />)

    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Bullet Points')).toBeInTheDocument()
  })

  it('should show word and character count', async () => {
    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, 'Hello world')

    const content = document.body.textContent || ''
    expect(content).toContain('2 words')
    expect(content).toContain('11 characters')
  })
})

describe('Text Summarizer - Options Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should select length when clicked', async () => {
    render(<TextSummarizerPage />)

    const shortButton = screen.getByText('Short')
    await userEvent.click(shortButton)

    expect(shortButton).toBeInTheDocument()
  })

  it('should select format when clicked', async () => {
    render(<TextSummarizerPage />)

    const bulletsButton = screen.getByText('Bullet Points')
    await userEvent.click(bulletsButton)

    expect(bulletsButton).toBeInTheDocument()
  })

  it('should default to medium length and paragraph format', () => {
    render(<TextSummarizerPage />)

    const content = document.body.textContent || ''
    expect(content).toContain('Medium')
    expect(content).toContain('Paragraph')
  })
})

describe('Text Summarizer - Input Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, 'Sample text to summarize')

    expect(textarea).toHaveValue('Sample text to summarize')
  })

  it('should show error if text is empty', async () => {
    render(<TextSummarizerPage />)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    // Button should be disabled when text is empty
    expect(summarizeButton).toHaveAttribute('disabled')
  })

  it('should disable button for text under 50 words', async () => {
    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, 'Short text')

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))

    expect(summarizeButton).toHaveAttribute('disabled')
  })
})

describe('Text Summarizer - Summarization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  const longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'

  it('should generate summary successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'This is a brief summary of the text.',
        highlights: ['Key point 1', 'Key point 2', 'Key point 3'],
        stats: {
          wordCount: 8,
          charCount: 38,
          originalWordCount: 60,
          originalCharCount: 380,
        },
        usage: { total_tokens: 200 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('This is a brief summary of the text.')
    }
  })

  it('should display loading state during summarization', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse({
                  summary: 'Test summary',
                  highlights: [],
                  stats: {
                    wordCount: 2,
                    charCount: 12,
                    originalWordCount: 50,
                    originalCharCount: 300,
                  },
                  usage: { total_tokens: 150 },
                })
              ),
            1000
          )
        )
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          const allButtons = screen.getAllByRole('button')
          const loadingButton = allButtons.find((btn) =>
            btn.textContent?.includes('Summarizing...')
          )
          expect(loadingButton).toBeDefined()
        },
        { timeout: 500 }
      )
    }
  })

  it('should display summary with key highlights', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Comprehensive summary of the document content.',
        highlights: ['Important point A', 'Important point B', 'Important point C'],
        stats: {
          wordCount: 6,
          charCount: 47,
          originalWordCount: 60,
          originalCharCount: 380,
        },
        usage: { total_tokens: 180 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Key Highlights')
      expect(content).toContain('Important point A')
      expect(content).toContain('Important point B')
      expect(content).toContain('Important point C')
    }
  })

  it('should track analytics on successful summarization', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test summary',
        highlights: ['Point 1'],
        stats: {
          wordCount: 2,
          charCount: 12,
          originalWordCount: 60,
          originalCharCount: 380,
        },
        usage: { total_tokens: 200 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('text_summarizer_summarize', {
        length: 'medium',
        format: 'paragraph',
        originalWords: 60,
        summaryWords: 2,
        tokens: 200,
      })
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should track analytics on generation error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'API error' }, false, 500))

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('text_summarizer_error', {
          error: 'generation_failed',
          message: 'API error',
        })
      })
    }
  })
})

describe('Text Summarizer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  const longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

  it('should copy summary to clipboard', async () => {
    const testSummary = 'This is a test summary to be copied'
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: testSummary,
        highlights: ['Point 1'],
        stats: {
          wordCount: 8,
          charCount: 36,
          originalWordCount: 55,
          originalCharCount: 350,
        },
        usage: { total_tokens: 150 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testSummary)
          expect(toast.success).toHaveBeenCalledWith('Summary copied to clipboard')
        })
      }
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test summary',
        highlights: [],
        stats: {
          wordCount: 2,
          charCount: 12,
          originalWordCount: 55,
          originalCharCount: 350,
        },
        usage: { total_tokens: 100 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('text_summarizer_copy', {
            format: 'paragraph',
          })
        })
      }
    }
  })
})

describe('Text Summarizer - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  const longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'

  it('should clear text and summary', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test summary',
        highlights: [],
        stats: {
          wordCount: 2,
          charCount: 12,
          originalWordCount: 35,
          originalCharCount: 235,
        },
        usage: { total_tokens: 100 },
      })
    )

    render(<TextSummarizerPage />)

    const textarea = screen.getByPlaceholderText(/Paste your article, document/)
    await userEvent.type(textarea, longText)

    // Wait for button to become enabled
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
      expect(summarizeButton).toBeEnabled()
    })

    const buttons = screen.getAllByRole('button')
    const summarizeButton = buttons.find((btn) => btn.textContent?.includes('Summarize Text'))
    expect(summarizeButton).toBeDefined()

    if (summarizeButton) {
      await userEvent.click(summarizeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Summary generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const clearButton = allButtons.find((btn) => btn.textContent?.includes('Clear'))
      expect(clearButton).toBeDefined()

      if (clearButton) {
        await userEvent.click(clearButton)

        await waitFor(() => {
          expect(textarea).toHaveValue('')
          expect(screen.queryByText('Test summary')).not.toBeInTheDocument()
        })
      }
    }
  })
})
