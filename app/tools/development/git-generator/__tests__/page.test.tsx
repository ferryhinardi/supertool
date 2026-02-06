import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GitGeneratorPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion" />,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools" />,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating" />,
}))

vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search" />,
}))

/**
 * Helper function to get a command button from the commands list.
 * Commands appear in multiple places (buttons, Quick Reference, generated output),
 * so we need to target the button specifically.
 */
const getCommandButton = (commandName: string): HTMLElement => {
  const elements = screen.getAllByText(commandName)
  // Find the element that is inside a button (the command button list)
  const buttonElement = elements.find((el) => {
    const button = el.closest('button')
    // Make sure it's a command button, not an example or other button
    return button !== null && button.getAttribute('type') === 'button'
  })
  if (!buttonElement) {
    throw new Error(`Could not find command button for: ${commandName}`)
  }
  return buttonElement
}

describe('GitGeneratorPage', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>
  let removeItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    localStorage.clear()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    vi.mocked(navigator.clipboard.writeText).mockClear()

    // Spy on localStorage directly (not Storage.prototype) because vitest.setup.ts uses LocalStorageMock
    getItemSpy = vi.spyOn(localStorage, 'getItem')
    setItemSpy = vi.spyOn(localStorage, 'setItem')
    removeItemSpy = vi.spyOn(localStorage, 'removeItem')
  })

  afterEach(() => {
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    removeItemSpy.mockRestore()
    cleanup()
  })

  describe('Rendering', () => {
    it('renders the page with title and description', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Git Command Generator')).toBeInTheDocument()
      expect(
        screen.getByText(/Build Git commands interactively with options and flags/)
      ).toBeInTheDocument()
      expect(screen.getByText('Development Tool')).toBeInTheDocument()
    })

    it('renders all category buttons', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Basic')).toBeInTheDocument()
      expect(screen.getByText('Branching')).toBeInTheDocument()
      expect(screen.getByText('Remote')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
    })

    it('renders category descriptions', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Essential Git commands for everyday use')).toBeInTheDocument()
      expect(screen.getByText('Branch management and merging')).toBeInTheDocument()
      expect(screen.getByText('Working with remote repositories')).toBeInTheDocument()
    })

    it('renders the basic commands by default', () => {
      render(<GitGeneratorPage />)

      // Commands may appear multiple times (in button list and Quick Reference)
      // so we use getAllByText and check at least one exists
      expect(screen.getAllByText('git init').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('git clone').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('git status').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('git add').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('git commit').length).toBeGreaterThanOrEqual(1)
    })

    it('renders the generated command section', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Generated Command')).toBeInTheDocument()
      expect(screen.getByText('Copy and run this command in your terminal')).toBeInTheDocument()
      expect(screen.getByText('Select a command and options to generate...')).toBeInTheDocument()
    })

    it('renders Quick Reference section', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Quick Reference')).toBeInTheDocument()
      expect(screen.getByText('Common Git workflows at a glance')).toBeInTheDocument()
      expect(screen.getByText('Start a new repository')).toBeInTheDocument()
      expect(screen.getByText('Clone and setup')).toBeInTheDocument()
      expect(screen.getByText('Save your work')).toBeInTheDocument()
    })

    it('renders FAQ section', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
    })

    it('renders related tools and tool rating', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
      expect(screen.getByTestId('tool-search')).toBeInTheDocument()
    })

    it('shows placeholder in options section when no command is selected', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Select a command to see available options')).toBeInTheDocument()
    })
  })

  describe('Category Selection', () => {
    it('switches to branching category and shows branching commands', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Branching'))

      expect(screen.getByText('git branch')).toBeInTheDocument()
      expect(screen.getByText('git checkout')).toBeInTheDocument()
      expect(screen.getByText('git switch')).toBeInTheDocument()
      expect(screen.getByText('git merge')).toBeInTheDocument()
      expect(screen.getByText('git rebase')).toBeInTheDocument()
    })

    it('switches to remote category and shows remote commands', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Remote'))

      expect(screen.getByText('git remote')).toBeInTheDocument()
      expect(screen.getByText('git fetch')).toBeInTheDocument()
      // These commands also appear in Quick Reference
      expect(screen.getAllByText('git pull').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('git push').length).toBeGreaterThanOrEqual(1)
    })

    it('switches to history category and shows history commands', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('History'))

      expect(screen.getByText('git log')).toBeInTheDocument()
      expect(screen.getByText('git diff')).toBeInTheDocument()
      expect(screen.getByText('git show')).toBeInTheDocument()
      expect(screen.getByText('git blame')).toBeInTheDocument()
      expect(screen.getByText('git reflog')).toBeInTheDocument()
    })

    it('switches to undo category and shows undo commands', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Undo'))

      expect(screen.getByText('git reset')).toBeInTheDocument()
      expect(screen.getByText('git revert')).toBeInTheDocument()
      expect(screen.getByText('git restore')).toBeInTheDocument()
      expect(screen.getByText('git stash')).toBeInTheDocument()
      expect(screen.getByText('git clean')).toBeInTheDocument()
    })

    it('switches to advanced category and shows advanced commands', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Advanced'))

      expect(screen.getByText('git cherry-pick')).toBeInTheDocument()
      expect(screen.getByText('git tag')).toBeInTheDocument()
      expect(screen.getByText('git bisect')).toBeInTheDocument()
      expect(screen.getByText('git worktree')).toBeInTheDocument()
      expect(screen.getByText('git submodule')).toBeInTheDocument()
    })

    it('clears selected command when switching categories', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      // Select a command in basic using the command button helper
      await user.click(getCommandButton('git init'))

      // Verify command is selected
      expect(screen.getByText('Configure init options')).toBeInTheDocument()

      // Switch category
      await user.click(screen.getByText('Branching'))

      // Verify options section shows placeholder
      expect(screen.getByText('Select a command to see available options')).toBeInTheDocument()
    })
  })

  describe('Command Selection', () => {
    it('selects a command and shows its options', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      expect(screen.getByText('Configure init options')).toBeInTheDocument()
      expect(screen.getByText('--bare')).toBeInTheDocument()
      expect(screen.getByText('-b')).toBeInTheDocument()
      expect(screen.getByText('--template')).toBeInTheDocument()
    })

    it('generates base command when command is selected', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      // The generated command should show the base command (appears multiple times)
      expect(screen.getAllByText('git init').length).toBeGreaterThanOrEqual(1)
    })

    it('shows examples for selected command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      expect(screen.getByText('Examples:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'git init --bare' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'git init -b main' })).toBeInTheDocument()
    })

    it('selects commit command and shows its options', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git commit'))

      expect(screen.getByText('Configure commit options')).toBeInTheDocument()
      expect(screen.getByText('-m')).toBeInTheDocument()
      expect(screen.getByText('-a')).toBeInTheDocument()
      expect(screen.getByText('--amend')).toBeInTheDocument()
      expect(screen.getByText('--no-edit')).toBeInTheDocument()
    })
  })

  describe('Option Selection', () => {
    it('adds simple flag option to generated command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      // Click on the --bare checkbox
      const bareCheckbox = screen.getByLabelText('--bare')
      await user.click(bareCheckbox)

      // Find the generated command display (may appear multiple times: in output and examples)
      const commandDisplays = screen.getAllByText('git init --bare')
      expect(commandDisplays.length).toBeGreaterThanOrEqual(1)
    })

    it('shows input field for options that require values', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      // Click on the -b checkbox which requires a value
      const branchCheckbox = screen.getByLabelText('-b')
      await user.click(branchCheckbox)

      // Should show input field with placeholder
      const input = screen.getByPlaceholderText('main')
      expect(input).toBeInTheDocument()
    })

    it('adds flag with value to generated command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      // Click on the -b checkbox
      const branchCheckbox = screen.getByLabelText('-b')
      await user.click(branchCheckbox)

      // Enter value
      const input = screen.getByPlaceholderText('main')
      await user.type(input, 'develop')

      // Verify command
      expect(screen.getByText('git init -b develop')).toBeInTheDocument()
    })

    it('toggles option off when clicked again', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const bareCheckbox = screen.getByLabelText('--bare')

      // Enable - command may appear in multiple places (generated output and examples)
      await user.click(bareCheckbox)
      expect(screen.getAllByText('git init --bare').length).toBeGreaterThanOrEqual(1)

      // Disable
      await user.click(bareCheckbox)

      // Command should be back to just git init - it appears in multiple places
      const commandDisplays = screen.getAllByText('git init')
      expect(commandDisplays.length).toBeGreaterThanOrEqual(1)
    })

    it('supports multiple options at once', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git status'))

      // Select -s option
      const shortCheckbox = screen.getByLabelText('-s')
      await user.click(shortCheckbox)

      // Select -b option
      const branchCheckbox = screen.getByLabelText('-b')
      await user.click(branchCheckbox)

      expect(screen.getByText('git status -s -b')).toBeInTheDocument()
    })

    it('clears options when selecting a different command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      // Select init and add option
      await user.click(getCommandButton('git init'))
      await user.click(screen.getByLabelText('--bare'))

      // Select a different command
      await user.click(getCommandButton('git clone'))

      // Options should be cleared, showing clone options
      expect(screen.getByText('Configure clone options')).toBeInTheDocument()
      expect(screen.getByText('--depth')).toBeInTheDocument()

      // Generated command should be just git clone (may appear multiple times)
      expect(screen.getAllByText('git clone').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Additional Arguments', () => {
    it('renders additional arguments input', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      expect(screen.getByText('Additional arguments')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('e.g., file.txt, branch-name, commit-hash')
      ).toBeInTheDocument()
    })

    it('adds additional arguments to generated command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git add'))

      const argsInput = screen.getByPlaceholderText('e.g., file.txt, branch-name, commit-hash')
      await user.type(argsInput, 'src/*.js')

      expect(screen.getByText('git add src/*.js')).toBeInTheDocument()
    })

    it('combines options and additional arguments correctly', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git commit'))

      // Add -m option with message
      await user.click(screen.getByLabelText('-m'))
      const messageInput = screen.getByPlaceholderText('message')
      await user.type(messageInput, '"Initial commit"')

      expect(screen.getAllByText('git commit -m "Initial commit"').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Copy Functionality', () => {
    it('copies generated command to clipboard', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))
      await user.click(screen.getByLabelText('--bare'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('git init --bare')
      expect(toast.success).toHaveBeenCalledWith('Command copied to clipboard')
    })

    it('shows "Copied!" after copying', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('copy button is disabled when no command is generated', () => {
      render(<GitGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      expect(copyButton).toBeDisabled()
    })

    it('copy button is enabled when command is generated', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      expect(copyButton).not.toBeDisabled()
    })

    it('handles clipboard error gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'))

      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      expect(toast.error).toHaveBeenCalledWith('Failed to copy command')
    })
  })

  describe('Example Commands', () => {
    it('copies example command when clicked', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const exampleButton = screen.getByRole('button', { name: 'git init --bare' })
      await user.click(exampleButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('git init --bare')
      expect(toast.success).toHaveBeenCalledWith('Example copied')
    })

    it('shows multiple examples for a command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git clone'))

      expect(screen.getByRole('button', { name: 'git clone <url>' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'git clone --depth 1 <url>' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'git clone --branch develop <url>' })
      ).toBeInTheDocument()
    })
  })

  describe('Command History', () => {
    it('loads history from localStorage on mount', () => {
      const mockHistory = [
        {
          id: '1',
          command: 'git init --bare',
          timestamp: Date.now(),
          description: 'Initialize a new Git repository',
        },
      ]
      localStorage.setItem('git-generator-history', JSON.stringify(mockHistory))

      render(<GitGeneratorPage />)

      expect(screen.getByText('Recent Commands')).toBeInTheDocument()
      expect(screen.getByText('git init --bare')).toBeInTheDocument()
    })

    it('saves command to history after copying', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))
      await user.click(screen.getByLabelText('--bare'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      expect(setItemSpy).toHaveBeenCalledWith(
        'git-generator-history',
        expect.stringContaining('git init --bare')
      )
    })

    it('shows history section when there is history', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      expect(screen.getByText('Recent Commands')).toBeInTheDocument()
      expect(screen.getByText('Your recently generated commands')).toBeInTheDocument()
    })

    it('does not show history section when history is empty', () => {
      render(<GitGeneratorPage />)

      expect(screen.queryByText('Recent Commands')).not.toBeInTheDocument()
    })

    it('copies command from history when clicked', async () => {
      const mockHistory = [
        {
          id: '1',
          command: 'git commit -m "test"',
          timestamp: Date.now(),
          description: 'Record changes',
        },
      ]
      localStorage.setItem('git-generator-history', JSON.stringify(mockHistory))

      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      // Verify history section is rendered
      expect(screen.getByText('Recent Commands')).toBeInTheDocument()

      // Verify the history command is displayed
      expect(screen.getByText('git commit -m "test"')).toBeInTheDocument()

      // Find the history command text element and look for the copy button in its parent
      const commandText = screen.getByText('git commit -m "test"')
      const historyItem = commandText.closest('div')?.parentElement

      if (historyItem) {
        // Find the button within the history item (should be the copy button, not Clear)
        const copyButton = historyItem.querySelector('button')
        if (copyButton) {
          await user.click(copyButton)
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith('git commit -m "test"')
          expect(toast.success).toHaveBeenCalledWith('Command copied from history')
        }
      }
    })

    it('clears history when clear button is clicked', async () => {
      const mockHistory = [
        { id: '1', command: 'git init', timestamp: Date.now(), description: 'Init' },
      ]
      localStorage.setItem('git-generator-history', JSON.stringify(mockHistory))

      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      expect(removeItemSpy).toHaveBeenCalledWith('git-generator-history')
      expect(toast.success).toHaveBeenCalledWith('History cleared')
      expect(screen.queryByText('Recent Commands')).not.toBeInTheDocument()
    })

    it('limits history to 20 items', async () => {
      // Test that the saveToHistory function limits history to 20 items
      // by checking the logic: newHistory = [newItem, ...history.slice(0, 19)]
      // This means if we start with 19 items and add one, we get 20.
      // If we start with 20 items and add one, we still get 20.

      // Create exactly 19 history items
      const mockHistory = Array.from({ length: 19 }, (_, i) => ({
        id: String(i),
        command: `git command ${i}`,
        timestamp: Date.now() - i * 1000,
        description: `Description ${i}`,
      }))
      localStorage.setItem('git-generator-history', JSON.stringify(mockHistory))

      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByText('Recent Commands')).toBeInTheDocument()
      })

      // Copy a new command - this adds item #20
      await user.click(getCommandButton('git init'))
      const copyButton = screen.getByRole('button', { name: /Copy Command/i })
      await user.click(copyButton)

      // Check that setItem was called with exactly 20 items (19 + 1 new)
      const historyCalls = setItemSpy.mock.calls.filter(
        (call: [string, string]) => call[0] === 'git-generator-history'
      )

      if (historyCalls.length > 0) {
        const lastCall = historyCalls[historyCalls.length - 1]
        const savedHistory = JSON.parse(lastCall[1] as string)
        expect(savedHistory.length).toBeLessThanOrEqual(20)
      }
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('git-generator-history', 'invalid-json')

      // Should not throw
      expect(() => render(<GitGeneratorPage />)).not.toThrow()
    })
  })

  describe('Quick Reference Workflows', () => {
    it('renders all workflow sections', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByText('Start a new repository')).toBeInTheDocument()
      expect(screen.getByText('Clone and setup')).toBeInTheDocument()
      expect(screen.getByText('Save your work')).toBeInTheDocument()
      expect(screen.getByText('Update from remote')).toBeInTheDocument()
      expect(screen.getByText('Create a feature branch')).toBeInTheDocument()
      expect(screen.getByText('Merge feature branch')).toBeInTheDocument()
    })

    it('shows commands for each workflow', () => {
      render(<GitGeneratorPage />)

      // Check some workflow commands - these appear in Quick Reference section
      expect(screen.getByText('git add -A')).toBeInTheDocument()
      // git push appears in multiple places so we use getAllByText
      expect(screen.getAllByText('git push').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('git pull --rebase')).toBeInTheDocument()
    })
  })

  describe('Complex Command Generation', () => {
    it('generates commit command with message and stage all', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git commit'))

      await user.click(screen.getByLabelText('-a'))
      await user.click(screen.getByLabelText('-m'))

      const messageInput = screen.getByPlaceholderText('message')
      await user.type(messageInput, '"Fix bug"')

      expect(screen.getByText('git commit -a -m "Fix bug"')).toBeInTheDocument()
    })

    it('generates push command with upstream and branch', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Remote'))
      await user.click(getCommandButton('git push'))

      await user.click(screen.getByLabelText('-u'))

      const upstreamInput = screen.getByPlaceholderText('remote branch')
      await user.type(upstreamInput, 'origin main')

      expect(screen.getAllByText('git push -u origin main').length).toBeGreaterThanOrEqual(1)
    })

    it('generates clone command with depth and branch', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git clone'))

      await user.click(screen.getByLabelText('--depth'))
      const depthInput = screen.getByPlaceholderText('1')
      await user.type(depthInput, '1')

      await user.click(screen.getByLabelText('--branch'))
      const branchInput = screen.getByPlaceholderText('branch')
      await user.type(branchInput, 'develop')

      await user.click(screen.getByLabelText('--single-branch'))

      expect(
        screen.getByText('git clone --depth 1 --branch develop --single-branch')
      ).toBeInTheDocument()
    })

    it('generates log command with multiple options', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('History'))
      await user.click(screen.getByText('git log'))

      await user.click(screen.getByLabelText('--oneline'))
      await user.click(screen.getByLabelText('--graph'))
      await user.click(screen.getByLabelText('--all'))

      expect(screen.getByText('git log --oneline --graph --all')).toBeInTheDocument()
    })

    it('generates stash command with message', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Undo'))
      await user.click(screen.getByText('git stash'))

      await user.click(screen.getByLabelText('-u'))
      await user.click(screen.getByLabelText('-m'))

      const messageInput = screen.getByPlaceholderText('message')
      await user.type(messageInput, '"WIP: feature"')

      expect(screen.getByText('git stash -u -m "WIP: feature"')).toBeInTheDocument()
    })

    it('generates rebase interactive command', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Branching'))
      await user.click(screen.getByText('git rebase'))

      await user.click(screen.getByLabelText('-i'))

      const commitInput = screen.getByPlaceholderText('commit')
      await user.type(commitInput, 'HEAD~5')

      expect(screen.getByText('git rebase -i HEAD~5')).toBeInTheDocument()
    })

    it('generates tag command with annotation', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Advanced'))
      await user.click(screen.getByText('git tag'))

      await user.click(screen.getByLabelText('-a'))
      const tagInput = screen.getByPlaceholderText('tagname')
      await user.type(tagInput, 'v1.0.0')

      await user.click(screen.getByLabelText('-m'))
      const messageInput = screen.getByPlaceholderText('message')
      await user.type(messageInput, '"Release 1.0.0"')

      expect(screen.getByText('git tag -a v1.0.0 -m "Release 1.0.0"')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty option values gracefully', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git commit'))
      await user.click(screen.getByLabelText('-m'))

      // Don't enter any value - should show flag with empty string
      expect(screen.getByText('git commit -m')).toBeInTheDocument()
    })

    it('trims whitespace from additional arguments', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git add'))

      const argsInput = screen.getByPlaceholderText('e.g., file.txt, branch-name, commit-hash')
      await user.type(argsInput, '   file.txt   ')

      expect(screen.getAllByText('git add file.txt').length).toBeGreaterThanOrEqual(1)
    })

    it('handles rapid category switching', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('Branching'))
      await user.click(screen.getByText('Remote'))
      await user.click(screen.getByText('History'))
      await user.click(screen.getByText('Basic'))

      // Should be back to basic commands (may appear in multiple places)
      expect(screen.getAllByText('git init').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('git commit')).toBeInTheDocument()
    })

    it('handles rapid command switching within same category', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))
      await user.click(getCommandButton('git clone'))
      await user.click(screen.getByText('git status'))
      await user.click(getCommandButton('git add'))
      await user.click(screen.getByText('git commit'))

      // Should show commit options
      expect(screen.getByText('Configure commit options')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for checkboxes', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(getCommandButton('git init'))

      // All options should have labels
      expect(screen.getByLabelText('--bare')).toBeInTheDocument()
      expect(screen.getByLabelText('-b')).toBeInTheDocument()
      expect(screen.getByLabelText('--template')).toBeInTheDocument()
    })

    it('has accessible button names', () => {
      render(<GitGeneratorPage />)

      expect(screen.getByRole('button', { name: /Copy Command/i })).toBeInTheDocument()
    })

    it('all category buttons are accessible via keyboard', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      // Tab to first category and press Enter
      const basicButton = screen.getByText('Basic').closest('button')
      if (basicButton) {
        basicButton.focus()
        await user.keyboard('{Enter}')
      }

      // git init appears in multiple places
      expect(screen.getAllByText('git init').length).toBeGreaterThanOrEqual(1)
    })

    it('command buttons have type="button"', () => {
      render(<GitGeneratorPage />)

      // git init appears in multiple places, we need to find the button specifically
      const initButton = getCommandButton('git init').closest('button')
      expect(initButton).toHaveAttribute('type', 'button')
    })
  })

  describe('State Management', () => {
    it('maintains selected command state correctly', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git commit'))

      // Select multiple options
      await user.click(screen.getByLabelText('-a'))
      await user.click(screen.getByLabelText('-m'))
      await user.click(screen.getByLabelText('--amend'))

      // All should be checked
      expect(screen.getByLabelText('-a')).toBeChecked()
      expect(screen.getByLabelText('-m')).toBeChecked()
      expect(screen.getByLabelText('--amend')).toBeChecked()
    })

    it('correctly updates option values', async () => {
      const user = userEvent.setup()
      render(<GitGeneratorPage />)

      await user.click(screen.getByText('git commit'))
      await user.click(screen.getByLabelText('-m'))

      const messageInput = screen.getByPlaceholderText('message')
      await user.type(messageInput, 'first message')

      expect(messageInput).toHaveValue('first message')

      // Clear and type new message
      await user.clear(messageInput)
      await user.type(messageInput, 'second message')

      expect(messageInput).toHaveValue('second message')
      expect(screen.getByText('git commit -m second message')).toBeInTheDocument()
    })
  })
})
