import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import AITextRewriterPage from '../page'

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
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

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

describe('AI Text Rewriter - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI Text Rewriter page', () => {
    render(<AITextRewriterPage />)

    expect(screen.getByRole('heading', { name: 'AI Text Rewriter', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Your Text')).toBeInTheDocument()
  })

  it('should display text textarea', () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AITextRewriterPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_text_rewriter_open', {})
  })

  it('should display pro tips card', () => {
    render(<AITextRewriterPage />)

    expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    const content = document.body.textContent || ''
    expect(content).toMatch(
      /Best results with complete sentences|Tone selection affects word choice|Generate multiple variants/i
    )
  })

  it('should display tone selection buttons', () => {
    render(<AITextRewriterPage />)

    expect(screen.getByText('Professional')).toBeInTheDocument()
    expect(screen.getByText('Casual')).toBeInTheDocument()
    expect(screen.getByText('Friendly')).toBeInTheDocument()
    expect(screen.getByText('Formal')).toBeInTheDocument()
  })

  it('should display style options', () => {
    render(<AITextRewriterPage />)

    expect(screen.getByText('Simple')).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })
})

describe('AI Text Rewriter - Tone Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should select a tone when clicked', async () => {
    render(<AITextRewriterPage />)

    const casualButton = screen.getByText('Casual')
    await userEvent.click(casualButton)

    // Check if the button is highlighted (Panda CSS will apply active styles)
    expect(casualButton.closest('button')).toHaveAttribute('data-active', 'true')
  })

  it('should change tone selection', async () => {
    render(<AITextRewriterPage />)

    // Default is Professional
    const professionalButton = screen.getByText('Professional')
    expect(professionalButton.closest('button')).toHaveAttribute('data-active', 'true')

    // Click Casual
    const casualButton = screen.getByText('Casual')
    await userEvent.click(casualButton)

    expect(casualButton.closest('button')).toHaveAttribute('data-active', 'true')
    expect(professionalButton.closest('button')).toHaveAttribute('data-active', 'false')
  })
})

describe('AI Text Rewriter - Style Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should select a style when clicked', async () => {
    render(<AITextRewriterPage />)

    const advancedButton = screen.getByText('Advanced')
    await userEvent.click(advancedButton)

    // Check if the button is active
    expect(advancedButton.closest('button')).toHaveAttribute('data-active', 'true')
  })

  it('should change style selection', async () => {
    render(<AITextRewriterPage />)

    // Default is Balanced
    const balancedButton = screen.getByText('Balanced')
    expect(balancedButton.closest('button')).toHaveAttribute('data-active', 'true')

    // Click Simple
    const simpleButton = screen.getByText('Simple')
    await userEvent.click(simpleButton)

    expect(simpleButton.closest('button')).toHaveAttribute('data-active', 'true')
    expect(balancedButton.closest('button')).toHaveAttribute('data-active', 'false')
  })
})

describe('AI Text Rewriter - Text Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Hello, this is a test message.' } })

    expect(textarea).toHaveValue('Hello, this is a test message.')
  })

  it('should display character count', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const content = document.body.textContent || ''
    expect(content).toMatch(/12.*\/.*5000/i)
  })

  it('should show error for empty text', async () => {
    render(<AITextRewriterPage />)

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter some text to rewrite')
      })
    }
  })

  it('should show error for text exceeding 5000 characters', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    const longText = 'a'.repeat(5001)
    fireEvent.change(textarea, { target: { value: longText } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Text must be 5000 characters or less')
      })
    }
  })

  it('should disable rewrite button when textarea is empty', () => {
    render(<AITextRewriterPage />)

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    // Button should be disabled when textarea is empty
    expect(rewriteButton).toHaveAttribute('disabled')
  })
})

describe('AI Text Rewriter - Load Example Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load example text when example button is clicked', async () => {
    render(<AITextRewriterPage />)

    const buttons = screen.getAllByRole('button')
    const exampleButtons = buttons.filter((btn) =>
      btn.textContent?.match(/Business Email|Error Message|Marketing Copy/)
    )
    expect(exampleButtons.length).toBeGreaterThan(0)

    if (exampleButtons[0]) {
      await userEvent.click(exampleButtons[0])

      const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
      const value = (textarea as HTMLTextAreaElement).value
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('should track analytics when loading example', async () => {
    render(<AITextRewriterPage />)

    const buttons = screen.getAllByRole('button')
    const exampleButtons = buttons.filter((btn) =>
      btn.textContent?.match(/Business Email|Error Message|Marketing Copy/)
    )

    if (exampleButtons[0]) {
      await userEvent.click(exampleButtons[0])

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith(
          'ai_text_rewriter_load_example',
          expect.any(Object)
        )
      })
    }
  })
})

describe('AI Text Rewriter - Rewriting Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should rewrite text successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [
          {
            text: 'This is the rewritten version of the text.',
            improvements: ['Improved clarity', 'Better tone', 'More engaging'],
          },
        ],
        usage: { total_tokens: 150 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'This is a test message.' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('This is the rewritten version of the text.')
    }
  })

  it('should display loading state during rewriting', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse({
                  variants: [{ text: 'Rewritten', improvements: ['test'] }],
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          const allButtons = screen.getAllByRole('button')
          const loadingButton = allButtons.find((btn) => btn.textContent?.includes('Rewriting...'))
          expect(loadingButton).toBeDefined()
        },
        { timeout: 500 }
      )
    }
  })

  it('should display multiple variants', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [
          { text: 'Variant 1', improvements: ['Improvement 1'] },
          { text: 'Variant 2', improvements: ['Improvement 2'] },
          { text: 'Variant 3', improvements: ['Improvement 3'] },
        ],
        usage: { total_tokens: 200 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Variant 1')
      expect(content).toContain('Variant 2')
      expect(content).toContain('Variant 3')
    }
  })

  it('should track analytics on successful rewrite', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [{ text: 'Rewritten text', improvements: ['test'] }],
        usage: { total_tokens: 150 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    const testText = 'This is a test message.'
    fireEvent.change(textarea, { target: { value: testText } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith(
        'ai_text_rewriter_rewrite',
        expect.objectContaining({
          text_length: testText.length,
          tone: 'professional',
          style: 'balanced',
          variants: 1,
          tokens: 150,
        })
      )
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    }
  })

  it('should track analytics on rewrite error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'API error' }, false, 500))

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith(
          'ai_text_rewriter_error',
          expect.objectContaining({
            error: 'rewrite_failed',
          })
        )
      })
    }
  })
})

describe('AI Text Rewriter - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    mockWriteText.mockClear()
  })

  it('should copy rewritten text to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [{ text: 'Rewritten text', improvements: ['test'] }],
        usage: { total_tokens: 100 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButtons = allButtons.filter((btn) => btn.textContent?.includes('Copy'))
      expect(copyButtons.length).toBeGreaterThan(0)

      if (copyButtons[0]) {
        await userEvent.click(copyButtons[0])

        await waitFor(() => {
          expect(mockWriteText).toHaveBeenCalled()
          expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
        })
      }
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [{ text: 'Rewritten text', improvements: ['test'] }],
        usage: { total_tokens: 100 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButtons = allButtons.filter((btn) => btn.textContent?.includes('Copy'))

      if (copyButtons[0]) {
        await userEvent.click(copyButtons[0])

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_text_rewriter_copy', {})
        })
      }
    }
  })
})

describe('AI Text Rewriter - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should clear text and results', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: [{ text: 'Rewritten text', improvements: ['test'] }],
        usage: { total_tokens: 100 },
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter or paste text/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()

    if (rewriteButton) {
      await userEvent.click(rewriteButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Text rewritten successfully!')
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
          expect(screen.queryByText('Rewritten text')).not.toBeInTheDocument()
        })

        expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_text_rewriter_clear', {})
      }
    }
  })
})
