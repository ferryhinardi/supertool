import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import * as analytics from '@/lib/services/analytics'
import AIJSONAnalyzerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
const mockTrackToolEvent = vi.hoisted(() => vi.fn())

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
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

describe('AI JSON Analyzer - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI JSON Analyzer page', () => {
    render(<AIJSONAnalyzerPage />)

    expect(screen.getByRole('heading', { name: 'AI JSON Analyzer', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Enter Your JSON')).toBeInTheDocument()
  })

  it('should display JSON textarea', () => {
    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AIJSONAnalyzerPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_json_open', {})
  })

  it('should display Load Example button', () => {
    render(<AIJSONAnalyzerPage />)

    const loadExampleButton = screen.getByText('Load Example')
    expect(loadExampleButton).toBeInTheDocument()
  })
})

describe('AI JSON Analyzer - Load Example Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load example JSON when Load Example is clicked', async () => {
    render(<AIJSONAnalyzerPage />)

    const loadExampleButton = screen.getByText('Load Example')
    await userEvent.click(loadExampleButton)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    const value = (textarea as HTMLTextAreaElement).value
    expect(value).toContain('"name"')
  })
})

describe('AI JSON Analyzer - JSON Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    expect(textarea).toHaveValue('{"test": "data"}')
  })

  it('should show error for invalid JSON', async () => {
    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{invalid json}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid JSON format. Please check your input.')
      })
    }
  })

  it('should disable analyze button when textarea is empty', () => {
    render(<AIJSONAnalyzerPage />)

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    // Button should be disabled when textarea is empty
    expect(analyzeButton).toHaveAttribute('disabled')
  })
})

describe('AI JSON Analyzer - Analysis Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should analyze JSON successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'This JSON represents a user profile with personal information.',
        structure: 'The JSON has a flat structure with string fields for name, email, and age.',
        patterns: ['All fields use camelCase naming convention.'],
        insights: ['Consider adding validation for email format and age range.'],
        relationships: ['The name field may relate to the user identifier system.'],
        usage: { total_tokens: 200 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, {
      target: { value: '{"name": "John", "email": "john@example.com"}' },
    })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('This JSON represents a user profile')
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
                  summary: 'test',
                  structure: 'test',
                  patterns: ['test'],
                  insights: ['test'],
                  relationships: ['test'],
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))

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

  it('should display analysis results with all sections', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test summary of JSON data',
        structure: 'Test structure analysis',
        patterns: ['Test patterns detected'],
        insights: ['Test insights and recommendations'],
        relationships: ['Test relationships between fields'],
        usage: { total_tokens: 150 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Summary')
      expect(content).toContain('Structure Analysis')
      expect(content).toContain('Detected Patterns')
      expect(content).toContain('Insights & Recommendations')
      expect(content).toContain('Data Relationships')
    }
  })

  it('should track analytics on successful analysis', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'test',
        structure: 'test',
        patterns: ['test'],
        insights: ['test'],
        relationships: ['test'],
        usage: { total_tokens: 200 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    const jsonData = '{"name": "test", "age": 25}'
    fireEvent.change(textarea, { target: { value: jsonData } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_json_analyze', {
        tokens: 200,
      })
    }
  })

  it('opens the paywall modal for a 402 quota-exceeded response instead of showing a generic error', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'quota-exceeded', remaining: 0 }, false, 402)
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const analyzeButton = screen.getByRole('button', { name: /Analyze JSON/i })
    await userEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
    })

    expect(screen.getByText('quota-exceeded')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalledWith('Failed to analyze JSON')
  })

  it('tracks quota consumption with remaining count after a successful analysis', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'This JSON represents test data.',
        structure: 'Flat object structure.',
        patterns: ['Consistent primitive fields'],
        insights: ['Looks valid'],
        relationships: ['Fields are independent'],
        usage: { total_tokens: 200 },
        remaining: 7,
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const analyzeButton = screen.getByRole('button', { name: /Analyze JSON/i })
    await userEvent.click(analyzeButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
    })

    expect(screen.getByText(/Remaining free analyses today: 7/i)).toBeInTheDocument()
    expect(mockTrackToolEvent).toHaveBeenCalledWith(
      'quota_consumed',
      expect.objectContaining({
        tool_slug: 'ai-json-analyzer',
        remaining: 7,
      })
    )
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
        summary: 'This JSON represents test data.',
        structure: 'Flat object structure.',
        patterns: ['Consistent primitive fields'],
        insights: ['Looks valid'],
        relationships: ['Fields are independent'],
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const analyzeButton = screen.getByRole('button', { name: /Analyze JSON/i })
    await userEvent.click(analyzeButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai-json-analyze',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer session-token',
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  it('does not show a remaining quota hint or emit quota analytics when remaining is absent', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'This JSON represents test data.',
        structure: 'Flat object structure.',
        patterns: ['Consistent primitive fields'],
        insights: ['Looks valid'],
        relationships: ['Fields are independent'],
        usage: { total_tokens: 200 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const analyzeButton = screen.getByRole('button', { name: /Analyze JSON/i })
    await userEvent.click(analyzeButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
    })

    expect(screen.queryByText(/Remaining free analyses today:/i)).not.toBeInTheDocument()
    expect(mockTrackToolEvent).not.toHaveBeenCalledWith('quota_consumed', expect.any(Object))
  })

  it('allows closing the paywall modal after a blocked anonymous-blocked response', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ status: 'paywall', reason: 'anonymous-blocked' }, false, 402)
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const analyzeButton = screen.getByRole('button', { name: /Analyze JSON/i })
    await userEvent.click(analyzeButton)

    await waitFor(() => {
      expect(screen.getByTestId('paywall-modal')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Close paywall' }))

    await waitFor(() => {
      expect(screen.queryByTestId('paywall-modal')).not.toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    }
  })

  it('should track analytics on analysis error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'API error' }, false, 500))

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_json_error', {
          error: 'analysis_failed',
          message: 'API error',
        })
      })
    }
  })
})

describe('AI JSON Analyzer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should copy analysis to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test summary',
        structure: 'Test structure',
        patterns: ['Test patterns'],
        insights: ['Test insights'],
        relationships: ['Test relationships'],
        usage: { total_tokens: 100 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy Analysis'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled()
          expect(toast.success).toHaveBeenCalledWith('Analysis copied to clipboard')
        })
      }
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'test',
        structure: 'test',
        patterns: ['test'],
        insights: ['test'],
        relationships: ['test'],
        usage: { total_tokens: 100 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
        },
        { timeout: 5000 }
      )

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy Analysis'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_json_copy', {})
        })
      }
    }
  })
})

describe('AI JSON Analyzer - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should clear JSON and analysis', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'test',
        structure: 'test',
        patterns: ['test'],
        insights: ['test'],
        relationships: ['test'],
        usage: { total_tokens: 100 },
      })
    )

    render(<AIJSONAnalyzerPage />)

    const textarea = screen.getByPlaceholderText(/users.*id.*name.*Alice/i)
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } })

    const buttons = screen.getAllByRole('button')
    const analyzeButton = buttons.find((btn) => btn.textContent?.includes('Analyze JSON'))
    expect(analyzeButton).toBeDefined()

    if (analyzeButton) {
      await userEvent.click(analyzeButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('JSON analyzed successfully!')
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
          expect(screen.queryByText('Summary')).not.toBeInTheDocument()
        })
      }
    }
  })
})
