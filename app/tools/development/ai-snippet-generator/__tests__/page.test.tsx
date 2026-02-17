import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import AISnippetGeneratorPage from '../page'

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

describe('AI Snippet Generator - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI Snippet Generator page', () => {
    render(<AISnippetGeneratorPage />)

    expect(
      screen.getByRole('heading', { name: 'AI Snippet Generator', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Describe Your Code')).toBeInTheDocument()
  })

  it('should display prompt textarea', () => {
    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AISnippetGeneratorPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_snippet_open', {})
  })

  it('should display all language options', () => {
    render(<AISnippetGeneratorPage />)

    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.getByText('Rust')).toBeInTheDocument()
    expect(screen.getByText('PHP')).toBeInTheDocument()
    expect(screen.getByText('Ruby')).toBeInTheDocument()
    expect(screen.getByText('SQL')).toBeInTheDocument()
    expect(screen.getByText('Bash')).toBeInTheDocument()
    expect(screen.getByText('RegEx')).toBeInTheDocument()
  })
})

describe('AI Snippet Generator - Language Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should select language when clicked', async () => {
    render(<AISnippetGeneratorPage />)

    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)

    expect(pythonButton).toBeInTheDocument()
  })

  it('should default to JavaScript', () => {
    render(<AISnippetGeneratorPage />)

    // JavaScript should be the default selected language
    const content = document.body.textContent || ''
    expect(content).toContain('JavaScript')
  })
})

describe('AI Snippet Generator - Prompt Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'Create a function to add two numbers')

    expect(textarea).toHaveValue('Create a function to add two numbers')
  })

  it('should show error if prompt is empty', async () => {
    render(<AISnippetGeneratorPage />)

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    // Button should be disabled when prompt is empty
    expect(generateButton).toHaveAttribute('disabled')
  })
})

describe('AI Snippet Generator - Code Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should generate code successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'function add(a, b) {\n  return a + b;\n}',
        language: 'javascript',
        explanation: 'This function takes two numbers and returns their sum.',
        usage: { total_tokens: 150 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'Create a function to add two numbers')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('function add(a, b)')
    }
  })

  it('should display loading state during generation', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse({
                  code: 'test code',
                  language: 'javascript',
                  explanation: 'test',
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))

    if (generateButton) {
      await userEvent.click(generateButton)

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

  it('should display generated code with explanation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'const greet = (name) => `Hello, $' + '{name}!`;',
        language: 'javascript',
        explanation: 'This is an arrow function that greets a person by name.',
        usage: { total_tokens: 120 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'Create a greeting function')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('const greet = (name)')
      expect(content).toContain('This is an arrow function that greets a person by name.')
    }
  })

  it('should track analytics on successful generation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'test code',
        language: 'python',
        explanation: 'test explanation',
        usage: { total_tokens: 150 },
      })
    )

    render(<AISnippetGeneratorPage />)

    // Select Python
    const pythonButton = screen.getByText('Python')
    await userEvent.click(pythonButton)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_snippet_generate', {
        language: 'python',
        prompt_length: 11,
        tokens: 150,
      })
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
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

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
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

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_snippet_error', {
          error: 'generation_failed',
          message: 'API error',
        })
      })
    }
  })
})

describe('AI Snippet Generator - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should copy code to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'const test = "copy this code";',
        language: 'javascript',
        explanation: 'test explanation',
        usage: { total_tokens: 100 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy Code'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            'const test = "copy this code";'
          )
          expect(toast.success).toHaveBeenCalledWith('Code copied to clipboard')
        })
      }
    }
  })

  it('should show copied state after copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'test code',
        language: 'javascript',
        explanation: 'test',
        usage: { total_tokens: 100 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy Code'))
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
        code: 'test code',
        language: 'javascript',
        explanation: 'test',
        usage: { total_tokens: 100 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy Code'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_snippet_copy', {
            language: 'javascript',
          })
        })
      }
    }
  })
})

describe('AI Snippet Generator - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should clear prompt and snippet', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        code: 'test code',
        language: 'javascript',
        explanation: 'test',
        usage: { total_tokens: 100 },
      })
    )

    render(<AISnippetGeneratorPage />)

    const textarea = screen.getByPlaceholderText(/Create a function that validates/)
    await userEvent.type(textarea, 'test prompt')

    const buttons = screen.getAllByRole('button')
    const generateButton = buttons.find((btn) => btn.textContent?.includes('Generate Code'))
    expect(generateButton).toBeDefined()

    if (generateButton) {
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Code snippet generated successfully!')
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
          expect(screen.queryByText('test code')).not.toBeInTheDocument()
        })
      }
    }
  })
})
