import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import AIPromptExplainerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
  trackToolEvent: vi.fn(),
}))

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

describe('AI Prompt Explainer - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI Prompt Explainer page', () => {
    render(<AIPromptExplainerPage />)

    expect(
      screen.getByRole('heading', { name: 'AI Prompt Explainer', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Enter Your Prompt')).toBeInTheDocument()
  })

  it('should display prompt textarea', () => {
    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AIPromptExplainerPage />)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'open',
      category: 'ai_prompt_explainer',
    })
  })

  it('should display pro tips card', () => {
    render(<AIPromptExplainerPage />)

    expect(screen.getByText('Pro Tips for Better Prompts')).toBeInTheDocument()
    const content = document.body.textContent || ''
    expect(content).toMatch(/specific and clear|provide context/i)
  })

  it('should display example prompts', () => {
    render(<AIPromptExplainerPage />)

    expect(screen.getByText('Example Prompts')).toBeInTheDocument()
    expect(screen.getByText('Content Writing')).toBeInTheDocument()
    expect(screen.getByText('Code Generation')).toBeInTheDocument()
  })
})

describe('AI Prompt Explainer - Prompt Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'Write a story about AI')

    expect(textarea).toHaveValue('Write a story about AI')
  })

  it('should have disabled button when prompt is empty', async () => {
    render(<AIPromptExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()

    // Button should be disabled when prompt is empty
    expect(analyzeButton).toHaveAttribute('disabled')
  })

  it('should enable button when prompt is entered', async () => {
    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'Test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()
    expect(analyzeButton).not.toHaveAttribute('disabled')
  })
})

describe('AI Prompt Explainer - Example Loading Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load example prompt when clicked', async () => {
    render(<AIPromptExplainerPage />)

    const exampleButton = screen.getByText('Content Writing')
    const button = exampleButton.closest('button')
    if (button) await userEvent.click(button)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    expect(textarea).toHaveValue('Write an article about AI')
  })

  it('should track analytics when loading example', async () => {
    render(<AIPromptExplainerPage />)

    const exampleButton = screen.getByText('Code Generation')
    const button = exampleButton.closest('button')
    if (button) await userEvent.click(button)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'load_example',
      category: 'ai_prompt_explainer',
    })
  })
})

describe('AI Prompt Explainer - Prompt Analysis Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should analyze prompt successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'This prompt is quite vague and lacks specific details.',
        structure: {
          clarity: 5,
          specificity: 3,
          context: 4,
        },
        suggestions: [
          'Add more specific requirements about what the article should cover',
          'Specify the target audience and tone',
          'Include desired length or format',
        ],
        bestPractices: ['Good use of clear action verb', 'Could benefit from more context'],
        optimizedPrompt:
          'Write a 1000-word technical article about machine learning for developers, covering supervised learning, neural networks, and practical applications. Use a professional yet accessible tone.',
        usage: { total_tokens: 250 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'Write an article about AI')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('This prompt is quite vague')
      expect(content).toContain('Prompt Quality Scores')
    }
  })

  it('should display loading state during analysis', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse({
                  analysis: 'test',
                  structure: { clarity: 5, specificity: 5, context: 5 },
                  suggestions: ['test'],
                  bestPractices: ['test'],
                  optimizedPrompt: 'test',
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          const allButtons = screen.getAllByRole('button')
          const loadingButton = allButtons.find((btn) => btn.textContent?.includes('Analyzing...'))
          expect(loadingButton).toBeDefined()
        },
        { timeout: 500 }
      )
    }
  })

  it('should display quality scores with progress bars', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'Good prompt structure',
        structure: {
          clarity: 8,
          specificity: 6,
          context: 7,
        },
        suggestions: ['Add more details'],
        bestPractices: ['Clear intent'],
        optimizedPrompt: 'Optimized version',
        usage: { total_tokens: 150 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('clarity')
      expect(content).toContain('8/10')
      expect(content).toContain('specificity')
      expect(content).toContain('6/10')
    }
  })

  it('should show improvement suggestions', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'Prompt needs improvement',
        structure: { clarity: 5, specificity: 4, context: 5 },
        suggestions: [
          'Be more specific about the desired output format',
          'Add context about the audience',
          'Include constraints like word count',
        ],
        bestPractices: ['Uses action verb'],
        optimizedPrompt: 'Improved prompt',
        usage: { total_tokens: 200 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'Write something')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Improvement Suggestions')
      expect(content).toContain('Be more specific about the desired output format')
    }
  })

  it('should show optimized prompt', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'Basic prompt',
        structure: { clarity: 6, specificity: 5, context: 5 },
        suggestions: ['Add details'],
        bestPractices: ['Clear verb'],
        optimizedPrompt:
          'Write a comprehensive 1500-word blog post about artificial intelligence, targeting non-technical readers. Include real-world examples, explain key concepts in simple terms, and conclude with future implications.',
        usage: { total_tokens: 180 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'Write about AI')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Optimized Prompt')
      expect(content).toContain('comprehensive 1500-word blog post')
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should track analytics on successful analysis', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'test',
        structure: { clarity: 5, specificity: 5, context: 5 },
        suggestions: ['test'],
        bestPractices: ['test'],
        optimizedPrompt: 'test',
        usage: { total_tokens: 200 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackEvent).toHaveBeenCalledWith({
        action: 'analyze',
        category: 'ai_prompt_explainer',
        value: 200,
      })
    }
  })
})

describe('AI Prompt Explainer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should copy optimized prompt to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'test',
        structure: { clarity: 5, specificity: 5, context: 5 },
        suggestions: ['test'],
        bestPractices: ['test'],
        optimizedPrompt: 'This is the optimized prompt text',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            'This is the optimized prompt text'
          )
          expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
        })
      }
    }
  })
})

describe('AI Prompt Explainer - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should clear prompt and analysis', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        analysis: 'test',
        structure: { clarity: 5, specificity: 5, context: 5 },
        suggestions: ['test'],
        bestPractices: ['test'],
        optimizedPrompt: 'test',
        usage: { total_tokens: 100 },
      })
    )

    render(<AIPromptExplainerPage />)

    const textarea = screen.getByPlaceholderText(/Write a blog post about machine learning/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze Prompt'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Prompt analyzed successfully!')
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
          expect(screen.queryByText('Prompt Quality Scores')).not.toBeInTheDocument()
        })
      }
    }
  })
})
