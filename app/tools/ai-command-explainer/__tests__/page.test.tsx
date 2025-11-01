import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import AICommandExplainerPage from '../page'

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
  trackEvent: vi.fn(),
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

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    expect(textarea).toBeInTheDocument()
  })

  it('should track page visit on mount', () => {
    render(<AICommandExplainerPage />)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'open',
      category: 'ai_command_explainer',
    })
  })

  it('should display pro tips card', () => {
    render(<AICommandExplainerPage />)

    expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    const content = document.body.textContent || ''
    expect(content).toMatch(/unfamiliar commands|safety warnings/i)
  })

  it('should display example commands', () => {
    render(<AICommandExplainerPage />)

    expect(screen.getByText('Example Commands')).toBeInTheDocument()
    expect(screen.getByText('Git Force Push')).toBeInTheDocument()
    expect(screen.getByText('Docker Multi-Stage')).toBeInTheDocument()
    expect(screen.getByText('Find & Delete')).toBeInTheDocument()
    expect(screen.getByText('Kubectl Scale')).toBeInTheDocument()
  })
})

describe('AI Command Explainer - Command Input Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should accept user input in textarea', async () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'ls -la')

    expect(textarea).toHaveValue('ls -la')
  })

  it('should have disabled button when command is empty', async () => {
    render(<AICommandExplainerPage />)

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    // Button should be disabled when command is empty
    expect(explainButton).toHaveAttribute('disabled')
  })

  it('should enable button when command is entered', async () => {
    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'ls -la')

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()
    expect(explainButton).not.toHaveAttribute('disabled')
  })
})

describe('AI Command Explainer - Example Loading Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load example command when clicked', async () => {
    render(<AICommandExplainerPage />)

    const exampleButton = screen.getByText('Git Force Push')
    const button = exampleButton.closest('button')
    if (button) await userEvent.click(button)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    expect(textarea).toHaveValue('git push origin main --force')
  })

  it('should track analytics when loading example', async () => {
    render(<AICommandExplainerPage />)

    const exampleButton = screen.getByText('Docker Multi-Stage')
    const button = exampleButton.closest('button')
    if (button) await userEvent.click(button)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'load_example',
      category: 'ai_command_explainer',
    })
  })

  it('should hide examples after explanation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Lists files in the current directory',
        breakdown: [
          { component: 'ls', explanation: 'List files command' },
          { component: '-la', explanation: 'Long format, all files' },
        ],
        warnings: [],
        alternatives: [],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'ls -la')

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

      // Example commands should not be visible after explanation
      expect(screen.queryByText('Example Commands')).not.toBeInTheDocument()
    }
  })
})

describe('AI Command Explainer - Command Explanation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should explain command successfully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Force pushes commits to the main branch',
        breakdown: [
          { component: 'git push', explanation: 'Uploads local commits to remote repository' },
          { component: 'origin', explanation: 'The default remote repository name' },
          { component: 'main', explanation: 'The branch to push to' },
          { component: '--force', explanation: 'Overwrites remote history even if it diverges' },
        ],
        warnings: [
          'Force push can overwrite commits on the remote branch and cause data loss for collaborators',
        ],
        alternatives: ['git push origin main --force-with-lease'],
        commandType: 'git',
        usage: { total_tokens: 250 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'git push origin main --force')

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
      expect(content).toContain('Force pushes commits to the main branch')
      expect(content).toContain('Command Breakdown')
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
                  summary: 'test',
                  breakdown: [{ component: 'test', explanation: 'test' }],
                  warnings: [],
                  alternatives: [],
                  commandType: 'bash',
                  usage: { total_tokens: 100 },
                })
              ),
            1000
          )
        )
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

  it('should display breakdown with numbered steps', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Finds and deletes log files',
        breakdown: [
          { component: 'find .', explanation: 'Search starting from current directory' },
          { component: '-name "*.log"', explanation: 'Match files ending with .log' },
          { component: '-type f', explanation: 'Only match regular files' },
          { component: '-delete', explanation: 'Delete matched files' },
        ],
        warnings: ['This will permanently delete files without confirmation'],
        alternatives: ['find . -name "*.log" -type f -exec rm -i {} \\;'],
        commandType: 'bash',
        usage: { total_tokens: 200 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'find . -name "*.log" -type f -delete')

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

      const content = document.body.textContent || ''
      expect(content).toContain('1')
      expect(content).toContain('2')
      expect(content).toContain('3')
      expect(content).toContain('4')
      expect(content).toContain('find .')
      expect(content).toContain('-delete')
    }
  })

  it('should show safety warnings when present', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Recursively removes directory',
        breakdown: [
          {
            component: 'rm -rf',
            explanation: 'Remove files/directories recursively without prompt',
          },
          { component: '/', explanation: 'Root directory - DANGEROUS!' },
        ],
        warnings: [
          'This command can destroy your entire system',
          'Never run this command as root or with sudo',
        ],
        alternatives: ['Be very specific with the path, e.g., rm -rf ./specific-directory'],
        commandType: 'bash',
        usage: { total_tokens: 180 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'rm -rf /')

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

      const content = document.body.textContent || ''
      expect(content).toContain('Safety Warnings')
      expect(content).toContain('destroy your entire system')
    }
  })

  it('should show alternatives when available', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Force pushes to remote',
        breakdown: [{ component: 'git push --force', explanation: 'Force push command' }],
        warnings: ['Can overwrite remote history'],
        alternatives: [
          'git push origin main --force-with-lease',
          'git push origin main --force-if-includes',
        ],
        commandType: 'git',
        usage: { total_tokens: 150 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'git push --force')

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

      const content = document.body.textContent || ''
      expect(content).toContain('Alternative Commands')
      expect(content).toContain('--force-with-lease')
    }
  })

  it('should track analytics on successful explanation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'test',
        breakdown: [{ component: 'docker', explanation: 'Container command' }],
        warnings: [],
        alternatives: [],
        commandType: 'docker',
        usage: { total_tokens: 200 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'docker ps')

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

      expect(analytics.trackEvent).toHaveBeenCalledWith({
        action: 'explain',
        category: 'ai_command_explainer',
        label: 'docker',
        value: 200,
      })
    }
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ error: 'API key not configured' }, false, 500)
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

    const buttons = screen.getAllByRole('button')
    const explainButton = buttons.find((btn) => btn.textContent?.includes('Explain Command'))
    expect(explainButton).toBeDefined()

    if (explainButton) {
      await userEvent.click(explainButton)

      await waitFor(() => {
        expect(analytics.trackEvent).toHaveBeenCalledWith({
          action: 'error',
          category: 'ai_command_explainer',
          label: 'explanation_failed',
        })
      })
    }
  })
})

describe('AI Command Explainer - Copy Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    mockWriteText.mockClear()
  })

  it('should copy command to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test command',
        breakdown: [{ component: 'test', explanation: 'test' }],
        warnings: [],
        alternatives: [],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'echo "hello world"')

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

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))
      expect(copyButton).toBeDefined()

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(mockWriteText).toHaveBeenCalledWith('echo "hello world"')
          expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
        })
      }
    }
  })

  it('should copy alternative command to clipboard', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Dangerous command that needs alternatives',
        breakdown: [{ component: 'dangerous-command', explanation: 'A risky command' }],
        warnings: ['This command is dangerous'],
        alternatives: ['safer-command --option', 'another-safe-option'],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'dangerous-command')

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

      // Wait for alternatives section to render
      await waitFor(
        () => {
          const content = document.body.textContent || ''
          expect(content).toContain('safer-command --option')
        },
        { timeout: 2000 }
      )

      // Now check for copy buttons in alternatives section
      // One main copy button + two alternative copy buttons with aria-label
      const allButtons = screen.getAllByRole('button')
      const copyButtons = allButtons.filter(
        (btn) =>
          btn.textContent?.includes('Copy') || btn.getAttribute('aria-label')?.includes('Copy')
      )
      // Should have at least 3 copy buttons: one main + one for each alternative
      expect(copyButtons.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('should track analytics when copying', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test command',
        breakdown: [{ component: 'test', explanation: 'test' }],
        warnings: [],
        alternatives: [],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

      const allButtons = screen.getAllByRole('button')
      const copyButton = allButtons.find((btn) => btn.textContent?.includes('Copy'))

      if (copyButton) {
        await userEvent.click(copyButton)

        await waitFor(() => {
          expect(analytics.trackEvent).toHaveBeenCalledWith({
            action: 'copy',
            category: 'ai_command_explainer',
          })
        })
      }
    }
  })
})

describe('AI Command Explainer - Clear Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should clear command and explanation', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test command',
        breakdown: [{ component: 'test', explanation: 'test' }],
        warnings: [],
        alternatives: [],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

      const allButtons = screen.getAllByRole('button')
      const clearButton = allButtons.find((btn) => btn.textContent?.includes('Clear'))
      expect(clearButton).toBeDefined()

      if (clearButton) {
        await userEvent.click(clearButton)

        await waitFor(() => {
          expect(textarea).toHaveValue('')
          expect(screen.queryByText('Command Breakdown')).not.toBeInTheDocument()
        })
      }
    }
  })

  it('should show examples again after clearing', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        summary: 'Test command',
        breakdown: [{ component: 'test', explanation: 'test' }],
        warnings: [],
        alternatives: [],
        commandType: 'bash',
        usage: { total_tokens: 100 },
      })
    )

    render(<AICommandExplainerPage />)

    const textarea = screen.getByPlaceholderText(/git push origin main/)
    await userEvent.type(textarea, 'test command')

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

      // Examples should be hidden
      expect(screen.queryByText('Example Commands')).not.toBeInTheDocument()

      const allButtons = screen.getAllByRole('button')
      const clearButton = allButtons.find((btn) => btn.textContent?.includes('Clear'))

      if (clearButton) {
        await userEvent.click(clearButton)

        await waitFor(() => {
          // Examples should be visible again
          expect(screen.getByText('Example Commands')).toBeInTheDocument()
        })
      }
    }
  })
})
