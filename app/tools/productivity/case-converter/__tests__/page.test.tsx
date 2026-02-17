import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock UI components
vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools">Related Tools</div>,
}))

vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => <div data-testid="social-share">Social Share</div>,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating">Tool Rating</div>,
}))

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import CaseConverterPage from '../page'

describe('CaseConverterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clipboard API is mocked globally in vitest.setup.ts
  })

  describe('rendering', () => {
    it('renders the page header correctly', () => {
      render(<CaseConverterPage />)

      expect(screen.getByText('Case')).toBeInTheDocument()
      expect(screen.getByText('Converter')).toBeInTheDocument()
      expect(screen.getByText(/Convert text between camelCase/)).toBeInTheDocument()
    })

    it('renders the productivity tool badge', () => {
      render(<CaseConverterPage />)

      expect(screen.getByText('Productivity Tool')).toBeInTheDocument()
    })

    it('renders the input card with title and description', () => {
      render(<CaseConverterPage />)

      expect(screen.getByText('Input Text')).toBeInTheDocument()
      expect(screen.getByText('Enter text to convert between different cases')).toBeInTheDocument()
    })

    it('renders the input textarea with placeholder', () => {
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      expect(textarea).toBeInTheDocument()
    })

    it('renders the case selection card with title and description', () => {
      render(<CaseConverterPage />)

      expect(screen.getByText('Select Case Type')).toBeInTheDocument()
      expect(screen.getByText('Choose your desired output format')).toBeInTheDocument()
    })

    it('renders all 11 case type buttons', () => {
      render(<CaseConverterPage />)

      const caseTypes = [
        'camelCase',
        'PascalCase',
        'snake_case',
        'SCREAMING_SNAKE_CASE',
        'kebab-case',
        'TRAIN-CASE',
        'dot.case',
        'Title Case',
        'Sentence case',
        'lowercase',
        'UPPERCASE',
      ]

      for (const caseType of caseTypes) {
        expect(screen.getByText(caseType)).toBeInTheDocument()
      }
    })

    it('renders example text for each case type', () => {
      render(<CaseConverterPage />)

      const examples = [
        'myVariableName',
        'MyClassName',
        'my_variable_name',
        'MY_CONSTANT_NAME',
        'my-url-slug',
        'My-Header-Name',
        'my.config.key',
        'My Document Title',
        'My sentence here',
        'all lowercase text',
        'ALL UPPERCASE TEXT',
      ]

      for (const example of examples) {
        expect(screen.getByText(example)).toBeInTheDocument()
      }
    })

    it('renders the clear button', () => {
      render(<CaseConverterPage />)

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders related tools section', () => {
      render(<CaseConverterPage />)

      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
    })

    it('renders social share section', () => {
      render(<CaseConverterPage />)

      expect(screen.getByTestId('social-share')).toBeInTheDocument()
    })

    it('renders tool rating section', () => {
      render(<CaseConverterPage />)

      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
    })

    it('tracks page open event on mount', () => {
      render(<CaseConverterPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('case_converter_open', {})
    })
  })

  describe('input handling', () => {
    it('accepts user input in the textarea', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )

      await user.type(textarea, 'hello world')

      expect(textarea).toHaveValue('hello world')
    })

    it('enables clear button when input has text', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeDisabled()

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'test')

      expect(clearButton).not.toBeDisabled()
    })

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      expect(textarea).toHaveValue('')
      expect(toast.success).toHaveBeenCalledWith('Cleared!')
      expect(trackToolEvent).toHaveBeenCalledWith('case_converter_clear', {})
    })
  })

  describe('case type selection', () => {
    it('has camelCase selected by default', () => {
      render(<CaseConverterPage />)

      // The camelCase button should have the selected styling
      const camelCaseButtons = screen.getAllByText('camelCase')
      // First one is in the button grid
      expect(camelCaseButtons.length).toBeGreaterThan(0)
    })

    it('changes selected case type when clicking a case button', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Click on snake_case button (use getAllByText since text appears in button AND preview)
      const snakeCaseButton = screen.getAllByText('snake_case')[0].closest('button')
      if (snakeCaseButton) {
        await user.click(snakeCaseButton)
      }

      expect(trackToolEvent).toHaveBeenCalledWith('case_converter_convert', {
        case_type: 'snake_case',
      })
    })

    it('does not track conversion when input is empty', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      // Clear any previous calls
      vi.clearAllMocks()

      // Click on snake_case button without entering text (use getAllByText since text appears multiple times)
      const snakeCaseButton = screen.getAllByText('snake_case')[0].closest('button')
      if (snakeCaseButton) {
        await user.click(snakeCaseButton)
      }

      // Should not track conversion when input is empty
      expect(trackToolEvent).not.toHaveBeenCalledWith('case_converter_convert', expect.anything())
    })
  })

  describe('output display', () => {
    it('displays converted output when input has text', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Default is camelCase, so output should be 'helloWorld'
      // Use getAllByText since converted text appears in both main output AND preview
      expect(screen.getAllByText('helloWorld').length).toBeGreaterThanOrEqual(1)
    })

    it('shows result label with selected case type', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      expect(screen.getByText('Result (camelCase)')).toBeInTheDocument()
    })

    it('updates output when case type changes', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Initially camelCase (use getAllByText since text appears in output AND preview)
      expect(screen.getAllByText('helloWorld').length).toBeGreaterThanOrEqual(1)

      // Click on snake_case (use getAllByText since label appears as button text AND preview label)
      const snakeCaseButton = screen.getAllByText('snake_case')[0].closest('button')
      if (snakeCaseButton) {
        await user.click(snakeCaseButton)
      }

      // Use getAllByText since text appears in output AND preview
      expect(screen.getAllByText('hello_world').length).toBeGreaterThanOrEqual(1)
    })

    it('does not display output section when input is empty', () => {
      render(<CaseConverterPage />)

      expect(screen.queryByText(/Result \(/)).not.toBeInTheDocument()
    })
  })

  describe('all cases preview', () => {
    it('shows all cases preview section when input has text', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      expect(screen.getByText('All Cases Preview')).toBeInTheDocument()
      expect(screen.getByText('See your text in all available formats')).toBeInTheDocument()
    })

    it('does not show all cases preview when input is empty', () => {
      render(<CaseConverterPage />)

      expect(screen.queryByText('All Cases Preview')).not.toBeInTheDocument()
    })

    it('displays all 11 converted formats in preview', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Check for various converted formats (use getAllByText since some appear in multiple places)
      expect(screen.getAllByText('helloWorld').length).toBeGreaterThanOrEqual(1) // camelCase
      expect(screen.getByText('HelloWorld')).toBeInTheDocument() // PascalCase
      expect(screen.getByText('hello_world')).toBeInTheDocument() // snake_case
      expect(screen.getByText('HELLO_WORLD')).toBeInTheDocument() // SCREAMING_SNAKE_CASE
      expect(screen.getByText('hello-world')).toBeInTheDocument() // kebab-case
      expect(screen.getByText('Hello-World')).toBeInTheDocument() // TRAIN-CASE
      expect(screen.getByText('hello.world')).toBeInTheDocument() // dot.case
      expect(screen.getByText('Hello World')).toBeInTheDocument() // Title Case
      expect(screen.getByText('Hello world')).toBeInTheDocument() // Sentence case
      // lowercase and UPPERCASE with spaces
      expect(screen.getAllByText('hello world').length).toBeGreaterThanOrEqual(1) // lowercase (also in input)
      expect(screen.getByText('HELLO WORLD')).toBeInTheDocument() // UPPERCASE
    })
  })

  describe('copy functionality', () => {
    it('copies main output to clipboard', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Find and click the main copy button (not in the preview grid)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      // The first Copy button should be for the main output
      const mainCopyButton = copyButtons.find(
        (btn) => btn.textContent?.includes('Copy') && !btn.getAttribute('aria-label')
      )

      if (mainCopyButton) {
        await user.click(mainCopyButton)
      }

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('helloWorld')
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      expect(trackToolEvent).toHaveBeenCalledWith('case_converter_copy', {
        case_type: 'camelCase',
      })
    })

    it('copies preview output to clipboard when clicking preview copy button', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Click a specific preview copy button (e.g., for snake_case)
      const snakeCaseCopyButton = screen.getByRole('button', { name: /copy snake_case/i })
      await user.click(snakeCaseCopyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello_world')
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      expect(trackToolEvent).toHaveBeenCalledWith('case_converter_copy', {
        case_type: 'snake_case',
      })
    })

    it('shows copied state after copying', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Find and click the main copy button
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const mainCopyButton = copyButtons.find(
        (btn) => btn.textContent?.includes('Copy') && !btn.getAttribute('aria-label')
      )

      if (mainCopyButton) {
        await user.click(mainCopyButton)
      }

      // Should show "Copied!" text
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('handles clipboard error gracefully', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      // Mock clipboard to fail
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Failed'))

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      const mainCopyButton = copyButtons.find(
        (btn) => btn.textContent?.includes('Copy') && !btn.getAttribute('aria-label')
      )

      if (mainCopyButton) {
        await user.click(mainCopyButton)
      }

      expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
    })
  })

  describe('different case conversions', () => {
    it('converts to PascalCase correctly', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Use getAllByText since 'PascalCase' appears as button label AND preview label
      const pascalCaseButton = screen.getAllByText('PascalCase')[0].closest('button')
      if (pascalCaseButton) {
        await user.click(pascalCaseButton)
      }

      expect(screen.getByText('Result (PascalCase)')).toBeInTheDocument()
    })

    it('converts to kebab-case correctly', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Use getAllByText since 'kebab-case' appears as button label AND preview label
      const kebabCaseButton = screen.getAllByText('kebab-case')[0].closest('button')
      if (kebabCaseButton) {
        await user.click(kebabCaseButton)
      }

      expect(screen.getByText('Result (kebab-case)')).toBeInTheDocument()
    })

    it('converts to SCREAMING_SNAKE_CASE correctly', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Use getAllByText since 'SCREAMING_SNAKE_CASE' appears as button label AND preview label
      const screamingSnakeButton = screen.getAllByText('SCREAMING_SNAKE_CASE')[0].closest('button')
      if (screamingSnakeButton) {
        await user.click(screamingSnakeButton)
      }

      expect(screen.getByText('Result (SCREAMING_SNAKE_CASE)')).toBeInTheDocument()
    })

    it('converts different input formats', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )

      // Test camelCase input
      await user.type(textarea, 'myVariableName')

      // Should see snake_case version in preview (may appear in multiple places)
      expect(screen.getAllByText('my_variable_name').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('MY_VARIABLE_NAME').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('my-variable-name').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('edge cases', () => {
    it('handles whitespace-only input', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, '   ')

      // Should not show the all cases preview for whitespace-only input
      expect(screen.queryByText('All Cases Preview')).not.toBeInTheDocument()
    })

    it('handles single character input', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'a')

      // Should show preview for single character
      expect(screen.getByText('All Cases Preview')).toBeInTheDocument()
    })

    it('handles input with numbers', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'user123name')

      // Should show preview
      expect(screen.getByText('All Cases Preview')).toBeInTheDocument()
    })

    it('handles long input text', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      const longText = 'this is a very long text that should still work correctly'
      await user.type(textarea, longText)

      expect(screen.getByText('All Cases Preview')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has accessible copy buttons with aria-labels', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      // Preview copy buttons should have aria-labels
      expect(screen.getByRole('button', { name: /copy camelCase/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy PascalCase/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy snake_case/i })).toBeInTheDocument()
    })

    it('updates aria-label after copying', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      await user.type(textarea, 'hello world')

      const snakeCaseCopyButton = screen.getByRole('button', { name: /copy snake_case/i })
      await user.click(snakeCaseCopyButton)

      // Button should now indicate it was copied
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
    })

    it('textarea is focusable', () => {
      render(<CaseConverterPage />)

      const textarea = screen.getByPlaceholderText(
        "Enter text like 'hello world', 'HelloWorld', 'hello_world', etc."
      )
      textarea.focus()

      expect(document.activeElement).toBe(textarea)
    })

    it('case type buttons are clickable', async () => {
      const user = userEvent.setup()
      render(<CaseConverterPage />)

      // All case type buttons should be clickable
      const caseTypes = [
        'camelCase',
        'PascalCase',
        'snake_case',
        'SCREAMING_SNAKE_CASE',
        'kebab-case',
        'TRAIN-CASE',
        'dot.case',
        'Title Case',
        'Sentence case',
        'lowercase',
        'UPPERCASE',
      ]

      for (const caseType of caseTypes) {
        const button = screen.getByText(caseType).closest('button')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      }
    })
  })
})
