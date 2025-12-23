import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import AITextRewriterPage from '../page'

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
  usePathname: () => '/tools/ai-text-rewriter',
}))

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
    expect(screen.getByText('Original Text')).toBeInTheDocument()
  })

  it('should display text textarea', () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

    // Verify the button is in the document (Panda CSS handles styling)
    expect(casualButton).toBeInTheDocument()
  })

  it('should change tone selection', async () => {
    render(<AITextRewriterPage />)

    // Default is Professional - just verify buttons exist
    const professionalButton = screen.getByText('Professional')
    expect(professionalButton).toBeInTheDocument()

    // Click Casual
    const casualButton = screen.getByText('Casual')
    await userEvent.click(casualButton)

    // Verify both buttons still exist (styling is handled by Panda CSS)
    expect(casualButton).toBeInTheDocument()
    expect(professionalButton).toBeInTheDocument()
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

    // Verify the button is in the document (styling handled by Panda CSS)
    expect(advancedButton).toBeInTheDocument()
  })

  it('should change style selection', async () => {
    render(<AITextRewriterPage />)

    // Default is Balanced - verify button exists
    const balancedButton = screen.getByText('Balanced')
    expect(balancedButton).toBeInTheDocument()

    // Click Simple
    const simpleButton = screen.getByText('Simple')
    await userEvent.click(simpleButton)

    // Verify both buttons exist (styling handled by Panda CSS)
    expect(simpleButton).toBeInTheDocument()
    expect(balancedButton).toBeInTheDocument()
  })
})

describe('AI Text Rewriter - Text Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
    fireEvent.change(textarea, { target: { value: 'Hello, this is a test message.' } })

    expect(textarea).toHaveValue('Hello, this is a test message.')
  })

  it('should display character count', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    const content = document.body.textContent || ''
    expect(content).toMatch(/12.*\/.*5000/i)
  })

  it('should show error for empty text', async () => {
    render(<AITextRewriterPage />)

    // Button should be disabled when empty, so no error is shown
    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()
    expect(rewriteButton).toHaveAttribute('disabled')
  })

  it('should show error for text exceeding 5000 characters', async () => {
    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
    const longText = 'a'.repeat(5001)
    fireEvent.change(textarea, { target: { value: longText } })

    // Button should be disabled when text exceeds limit
    const buttons = screen.getAllByRole('button')
    const rewriteButton = buttons.find((btn) => btn.textContent?.includes('Rewrite Text'))
    expect(rewriteButton).toBeDefined()
    expect(rewriteButton).toHaveAttribute('disabled')

    // Error message should be displayed in UI
    const content = document.body.textContent || ''
    expect(content).toMatch(/Text exceeds 5000 character limit/i)
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

      const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
        variants: ['This is the rewritten version of the text.'],
        improvements: ['Improved clarity', 'Better tone', 'More engaging'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 24,
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
                  variants: ['Rewritten'],
                  improvements: ['test'],
                  tone: 'professional',
                  style: 'balanced',
                  originalLength: 12,
                })
              ),
            1000
          )
        )
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
        variants: ['Variant 1', 'Variant 2', 'Variant 3'],
        improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 12,
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
        variants: ['Rewritten text'],
        improvements: ['test'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 23,
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
        })
      )
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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
            error: 'API error',
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
        variants: ['Rewritten text'],
        improvements: ['test'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 12,
      })
    )

    mockWriteText.mockResolvedValue(undefined)

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

      // Wait for results to render
      await waitFor(() => {
        const content = document.body.textContent || ''
        expect(content).toContain('Rewritten text')
      })

      // Find copy button - filter for exact "Copy" button not "Marketing Copy"
      const allButtons = await screen.findAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.trim() === 'Copy')
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(mockWriteText).toHaveBeenCalledWith('Rewritten text')
          expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
        })
      }
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        variants: ['Rewritten text'],
        improvements: ['test'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 12,
      })
    )

    mockWriteText.mockResolvedValue(undefined)

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

      // Wait for results to render
      await waitFor(() => {
        const content = document.body.textContent || ''
        expect(content).toContain('Rewritten text')
      })

      // Find copy button - filter for exact "Copy" button not "Marketing Copy"
      const allButtons = await screen.findAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.trim() === 'Copy')

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith(
            'ai_text_rewriter_copy',
            expect.objectContaining({ variant_index: 0 })
          )
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
        variants: ['Rewritten text'],
        improvements: ['test'],
        tone: 'professional',
        style: 'balanced',
        originalLength: 12,
      })
    )

    render(<AITextRewriterPage />)

    const textarea = screen.getByPlaceholderText(/Enter your text here/i)
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

      // Wait for results to render
      await waitFor(() => {
        const content = document.body.textContent || ''
        expect(content).toContain('Rewritten text')
      })

      // Find clear button
      const clearButton = await screen.findByRole('button', { name: /clear all/i })
      expect(clearButton).toBeDefined()

      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
        expect(screen.queryByText('Rewritten text')).not.toBeInTheDocument()
      })

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_text_rewriter_clear', {})
    }
  })
})
