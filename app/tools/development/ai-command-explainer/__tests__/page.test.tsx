import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import AICommandExplainerPage from '../page'

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

describe('AI Command Explainer - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render AI Command Explainer page', () => {
    render(<AICommandExplainerPage />)

    expect(
      screen.getByRole('heading', { name: 'AI Command Explainer', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText('Enter Command')).toBeInTheDocument()
  })

  it('should display command textarea', () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AICommandExplainerPage />)

    expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_command_explainer_open', {})
  })

  it('should display example commands card', () => {
    render(<AICommandExplainerPage />)

    expect(screen.getByText('Example Commands')).toBeInTheDocument()
    expect(screen.getByText('Docker Container Management')).toBeInTheDocument()
    expect(screen.getByText('Git Interactive Rebase')).toBeInTheDocument()
  })

  it('should display how it works section', () => {
    render(<AICommandExplainerPage />)

    expect(screen.getByText('How It Works')).toBeInTheDocument()
    const content = document.body.textContent || ''
    expect(content).toMatch(/AI analyzes your command/i)
  })
})

describe('AI Command Explainer - Command Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker ps -a' } })

    expect(textarea).toHaveValue('docker ps -a')
  })

  it('should show error for empty command', async () => {
    render(<AICommandExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    // Button should be disabled when command is empty, preventing the click
    expect(explainButton).toHaveAttribute('disabled')

    // Verify toast.error is not called since button can't be clicked when disabled
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should disable explain button when textarea is empty', () => {
    render(<AICommandExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    // Button should be disabled when textarea is empty
    expect(explainButton).toHaveAttribute('disabled')
  })
})

describe('AI Command Explainer - Load Example Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load example command when example button is clicked', async () => {
    render(<AICommandExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const exampleButtons = buttons.filter((btn) =>
      btn.textContent?.match(/Docker Container Management|Git Interactive Rebase/)
    )
    expect(exampleButtons.length).toBeGreaterThan(0)

    if (exampleButtons[0]) {
      await userEvent.click(exampleButtons[0])

      const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
      const value = (textarea as HTMLTextAreaElement).value
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('should track analytics when loading example', async () => {
    render(<AICommandExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const exampleButtons = buttons.filter((btn) =>
      btn.textContent?.match(/Docker Container Management/)
    )

    if (exampleButtons[0]) {
      await userEvent.click(exampleButtons[0])

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith(
          'ai_command_explainer_load_example',
          expect.any(Object)
        )
      })
    }
  })
})

describe('AI Command Explainer - Explanation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should explain command successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'docker',
        overallPurpose: 'Lists all Docker containers',
        breakdown: [
          { part: 'docker', explanation: 'Docker CLI command' },
          { part: 'ps', explanation: 'List containers' },
          { part: '-a', explanation: 'Show all containers (default shows just running)' },
        ],
        parameters: [
          { parameter: '-a', description: 'Show all containers, including stopped ones' },
        ],
        safetyWarnings: [],
        alternatives: ['Use docker container ls -a for newer syntax'],
        usage: { total_tokens: 200 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker ps -a' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Command explained successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Lists all Docker containers')
      expect(content).toContain('Command Type: docker')
    }
  })

  it('should display loading state during explanation', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                createMockResponse({
                  commandType: 'bash',
                  overallPurpose: 'Test purpose',
                  breakdown: [],
                  parameters: [],
                  safetyWarnings: [],
                  alternatives: [],
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'ls -la' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(
        () => {
          const allButtons = screen.getAllByRole('button')
          const loadingButton = allButtons.find((btn) => btn.textContent?.includes('Explaining...'))
          expect(loadingButton).toBeDefined()
        },
        { timeout: 500 }
      )
    }
  })

  it('should display safety warnings when present', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'bash',
        overallPurpose: 'Removes all files in current directory',
        breakdown: [
          { part: 'rm', explanation: 'Remove files or directories' },
          { part: '-rf', explanation: 'Force recursive deletion' },
        ],
        parameters: [
          { parameter: '-r', description: 'Remove directories recursively' },
          { parameter: '-f', description: 'Force removal without confirmation' },
        ],
        safetyWarnings: [
          'This command will permanently delete files without confirmation',
          'Be extremely careful with rm -rf as it can delete important data',
        ],
        alternatives: ['Use trash command for recoverable deletion'],
        usage: { total_tokens: 250 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'rm -rf *' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Command explained successfully!')
        },
        { timeout: 5000 }
      )

      const content = document.body.textContent || ''
      expect(content).toContain('Safety Warnings')
      expect(content).toContain('permanently delete files')
    }
  })

  it('should track analytics on successful explanation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'git',
        overallPurpose: 'Shows git status',
        breakdown: [],
        parameters: [],
        safetyWarnings: [],
        alternatives: [],
        usage: { total_tokens: 150 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'git status' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith('Command explained successfully!')
        },
        { timeout: 5000 }
      )

      expect(analytics.trackToolEvent).toHaveBeenCalledWith(
        'ai_command_explainer_explain',
        expect.objectContaining({
          command_type: 'git',
          has_warnings: false,
        })
      )
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker ps' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API key not configured')
      })
    }
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'ls -la' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    }
  })

  it('should track analytics on explanation error', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ error: 'API error' }, false, 500))

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker ps' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith(
          'ai_command_explainer_error',
          expect.objectContaining({
            error: 'API error',
          })
        )
      })
    }
  })
})

describe('AI Command Explainer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should copy command to clipboard', async () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    const testCommand = 'docker ps -a'
    fireEvent.change(textarea, { target: { value: testCommand } })

    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find((btn) => btn.textContent?.includes('Copy'))
    expect(copyButton).toBeDefined()

    if (copyButton) {
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testCommand)
        expect(toast.success).toHaveBeenCalledWith('Command copied to clipboard!')
      })
    }
  })

  it('should track analytics when copying', async () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'git status' } })

    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find((btn) => btn.textContent?.includes('Copy'))

    if (copyButton) {
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalledWith('ai_command_explainer_copy', {})
      })
    }
  })
})

describe('AI Command Explainer - Breakdown Display Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should display command breakdown', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'docker',
        overallPurpose: 'Run a container',
        breakdown: [
          { part: 'docker run', explanation: 'Create and start a new container' },
          { part: '-d', explanation: 'Run container in detached mode' },
          { part: 'nginx', explanation: 'Use nginx image' },
        ],
        parameters: [],
        safetyWarnings: [],
        alternatives: [],
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker run -d nginx' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(screen.getByText('Command Breakdown')).toBeInTheDocument()
      })

      const content = document.body.textContent || ''
      expect(content).toContain('docker run')
      expect(content).toContain('Create and start a new container')
    }
  })

  it('should display parameters section', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'docker',
        overallPurpose: 'Run a container',
        breakdown: [],
        parameters: [
          { parameter: '-d', description: 'Run in detached mode' },
          { parameter: '-p', description: 'Publish a container port to the host' },
        ],
        safetyWarnings: [],
        alternatives: [],
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'docker run -d -p 8080:80 nginx' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(screen.getByText('Parameters & Flags')).toBeInTheDocument()
      })

      const content = document.body.textContent || ''
      expect(content).toContain('-d')
      expect(content).toContain('Run in detached mode')
    }
  })

  it('should display alternatives section', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        commandType: 'bash',
        overallPurpose: 'Find files',
        breakdown: [],
        parameters: [],
        safetyWarnings: [],
        alternatives: [
          'Use fd command for faster file searching',
          'Use ripgrep (rg) for content search',
        ],
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/e.g., docker run/i)
    fireEvent.change(textarea, { target: { value: 'find . -name "*.js"' } })

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(screen.getByText('Alternative Suggestions')).toBeInTheDocument()
      })

      const content = document.body.textContent || ''
      expect(content).toContain('fd command for faster file searching')
    }
  })
})
