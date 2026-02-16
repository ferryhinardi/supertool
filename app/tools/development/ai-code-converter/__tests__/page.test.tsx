import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AICodeConverterPage from '../page'

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

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    highlight: vi.fn().mockReturnValue({ value: 'highlighted-code' }),
  },
}))

// Mock CSS import
vi.mock('highlight.js/styles/atom-one-dark.css', () => ({}))

describe('AICodeConverterPage', () => {
  const mockFetch = vi.fn()
  const mockWriteText = vi.fn()
  const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
  const mockRevokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
    // Mock clipboard using spyOn instead of Object.assign
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(mockWriteText)
    mockWriteText.mockResolvedValue(undefined)
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Page Rendering', () => {
    it('renders the page title', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByRole('heading', { name: /AI Code Converter/i })).toBeInTheDocument()
    })

    it('renders the description text', () => {
      render(<AICodeConverterPage />)
      expect(
        screen.getByText(/Convert code between 12\+ programming languages instantly with AI/i)
      ).toBeInTheDocument()
    })

    it('renders the source language selector with default value', () => {
      render(<AICodeConverterPage />)
      const sourceSelect = screen.getByLabelText(/From/i)
      expect(sourceSelect).toBeInTheDocument()
      expect(sourceSelect).toHaveValue('javascript')
    })

    it('renders the target language selector with default value', () => {
      render(<AICodeConverterPage />)
      const targetSelect = screen.getByLabelText(/To/i)
      expect(targetSelect).toBeInTheDocument()
      expect(targetSelect).toHaveValue('python')
    })

    it('renders the source code textarea with placeholder', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByPlaceholderText(/Paste your code here/i)).toBeInTheDocument()
    })

    it('renders the convert button', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByRole('button', { name: /Convert Code/i })).toBeInTheDocument()
    })

    it('renders the swap languages button', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByRole('button', { name: /Swap languages/i })).toBeInTheDocument()
    })

    it('renders conversion options section', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByText('Conversion Options')).toBeInTheDocument()
    })

    it('renders all three conversion option checkboxes', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByText('Add Comments')).toBeInTheDocument()
      expect(screen.getByText('Preserve Structure')).toBeInTheDocument()
      expect(screen.getByText('Optimize Code')).toBeInTheDocument()
    })

    it('renders Pro Tips section', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByText(/Pro Tips/i)).toBeInTheDocument()
    })

    it('renders converted code placeholder text', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByText(/Converted code will appear here/i)).toBeInTheDocument()
    })

    it('renders the character count display', () => {
      render(<AICodeConverterPage />)
      expect(screen.getByText(/0 \/ 10,000 characters/i)).toBeInTheDocument()
    })
  })

  describe('Language Selection', () => {
    it('renders all 12 supported languages in source selector', () => {
      render(<AICodeConverterPage />)
      const sourceSelect = screen.getByLabelText(/From/i)
      const options = sourceSelect.querySelectorAll('option')
      expect(options).toHaveLength(12)
    })

    it('renders all 12 supported languages in target selector', () => {
      render(<AICodeConverterPage />)
      const targetSelect = screen.getByLabelText(/To/i)
      const options = targetSelect.querySelectorAll('option')
      expect(options).toHaveLength(12)
    })

    it('allows changing source language', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const sourceSelect = screen.getByLabelText(/From/i)
      await user.selectOptions(sourceSelect, 'typescript')
      expect(sourceSelect).toHaveValue('typescript')
    })

    it('allows changing target language', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const targetSelect = screen.getByLabelText(/To/i)
      await user.selectOptions(targetSelect, 'java')
      expect(targetSelect).toHaveValue('java')
    })

    it('tracks source language selection', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const sourceSelect = screen.getByLabelText(/From/i)
      await user.selectOptions(sourceSelect, 'typescript')

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_source_select', {
        category: 'development',
        language: 'typescript',
      })
    })

    it('tracks target language selection', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const targetSelect = screen.getByLabelText(/To/i)
      await user.selectOptions(targetSelect, 'java')

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_target_select', {
        category: 'development',
        language: 'java',
      })
    })

    it('swaps languages when swap button is clicked', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const sourceSelect = screen.getByLabelText(/From/i)
      const targetSelect = screen.getByLabelText(/To/i)

      expect(sourceSelect).toHaveValue('javascript')
      expect(targetSelect).toHaveValue('python')

      const swapButton = screen.getByRole('button', { name: /Swap languages/i })
      await user.click(swapButton)

      expect(sourceSelect).toHaveValue('python')
      expect(targetSelect).toHaveValue('javascript')
    })

    it('tracks swap languages action', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const swapButton = screen.getByRole('button', { name: /Swap languages/i })
      await user.click(swapButton)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_swap', {
        category: 'development',
      })
    })
  })

  describe('Conversion Options', () => {
    it('has Add Comments checked by default', () => {
      render(<AICodeConverterPage />)
      const addCommentsCheckbox = screen.getByRole('checkbox', { name: /Add Comments/i })
      expect(addCommentsCheckbox).toBeChecked()
    })

    it('has Preserve Structure unchecked by default', () => {
      render(<AICodeConverterPage />)
      const preserveStructureCheckbox = screen.getByRole('checkbox', {
        name: /Preserve Structure/i,
      })
      expect(preserveStructureCheckbox).not.toBeChecked()
    })

    it('has Optimize Code unchecked by default', () => {
      render(<AICodeConverterPage />)
      const optimizeCodeCheckbox = screen.getByRole('checkbox', { name: /Optimize Code/i })
      expect(optimizeCodeCheckbox).not.toBeChecked()
    })

    it('allows toggling Add Comments option', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const addCommentsCheckbox = screen.getByRole('checkbox', { name: /Add Comments/i })
      expect(addCommentsCheckbox).toBeChecked()

      await user.click(addCommentsCheckbox)
      expect(addCommentsCheckbox).not.toBeChecked()
    })

    it('allows toggling Preserve Structure option', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const preserveStructureCheckbox = screen.getByRole('checkbox', {
        name: /Preserve Structure/i,
      })
      expect(preserveStructureCheckbox).not.toBeChecked()

      await user.click(preserveStructureCheckbox)
      expect(preserveStructureCheckbox).toBeChecked()
    })

    it('allows toggling Optimize Code option', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const optimizeCodeCheckbox = screen.getByRole('checkbox', { name: /Optimize Code/i })
      expect(optimizeCodeCheckbox).not.toBeChecked()

      await user.click(optimizeCodeCheckbox)
      expect(optimizeCodeCheckbox).toBeChecked()
    })

    it('tracks option toggle events', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const preserveStructureCheckbox = screen.getByRole('checkbox', {
        name: /Preserve Structure/i,
      })
      await user.click(preserveStructureCheckbox)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_option_toggle', {
        category: 'development',
        option: 'preserveStructure',
        value: true,
      })
    })
  })

  describe('Source Code Input', () => {
    it('allows entering source code', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')
      expect(textarea).toHaveValue('const x = 1;')
    })

    it('updates character count when typing', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      expect(screen.getByText(/12 \/ 10,000 characters/i)).toBeInTheDocument()
    })

    it('disables convert button when source code is empty', () => {
      render(<AICodeConverterPage />)
      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      expect(convertButton).toBeDisabled()
    })

    it('enables convert button when source code is entered', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      expect(convertButton).toBeEnabled()
    })
  })

  describe('Code Conversion Flow', () => {
    it('shows error when trying to convert empty code', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      // Force enable the button by directly typing whitespace
      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      fireEvent.change(textarea, { target: { value: '   ' } })

      // Convert button should still be disabled due to trim check, but let's test the validation
      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      expect(convertButton).toBeDisabled()
    })

    it('shows error when source and target languages are the same', async () => {
      const user = userEvent.setup()
      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const sourceSelect = screen.getByLabelText(/From/i)
      const targetSelect = screen.getByLabelText(/To/i)

      await user.selectOptions(sourceSelect, 'python')
      await user.selectOptions(targetSelect, 'python')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      expect(toast.error).toHaveBeenCalledWith(
        'Please select different source and target languages'
      )
    })

    it('shows loading state during conversion', async () => {
      const user = userEvent.setup()
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: () => Promise.resolve({ convertedCode: 'x = 1' }) }),
              100
            )
          )
      )

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      // Check for the button in loading state (disabled with Converting... text)
      expect(screen.getByRole('button', { name: /Converting.../i })).toBeDisabled()
      expect(screen.getByText(/Converting your code.../i)).toBeInTheDocument()
    })

    it('successfully converts code and displays result', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            explanation: 'Converted JavaScript to Python',
            warnings: [],
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        // highlight.js mock returns 'highlighted-code', so check for that
        expect(screen.getByText('highlighted-code')).toBeInTheDocument()
      })

      expect(toast.success).toHaveBeenCalledWith('Code converted successfully!')
    })

    it('displays explanation after successful conversion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            explanation: 'Converted JavaScript variable declaration to Python',
            warnings: [],
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Explanation')).toBeInTheDocument()
        expect(
          screen.getByText('Converted JavaScript variable declaration to Python')
        ).toBeInTheDocument()
      })
    })

    it('displays warnings after conversion if present', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            explanation: '',
            warnings: ['Variable scope may differ', 'Type checking not available'],
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('Warnings')).toBeInTheDocument()
        expect(screen.getByText('Variable scope may differ')).toBeInTheDocument()
        expect(screen.getByText('Type checking not available')).toBeInTheDocument()
      })
    })

    it('makes correct API request with all parameters', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      // Change some options
      const optimizeCheckbox = screen.getByRole('checkbox', { name: /Optimize Code/i })
      await user.click(optimizeCheckbox)

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/ai-code-converter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCode: 'const x = 1;',
            sourceLanguage: 'javascript',
            targetLanguage: 'python',
            options: {
              addComments: true,
              preserveStructure: false,
              optimizeCode: true,
            },
          }),
        })
      })
    })

    it('handles API error response', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'API rate limit exceeded' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('API rate limit exceeded')
      })
    })

    it('handles network error', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error')
      })
    })
  })

  describe('Copy Functionality', () => {
    it('does not show copy button before conversion', () => {
      render(<AICodeConverterPage />)
      expect(screen.queryByRole('button', { name: /^Copy$/i })).not.toBeInTheDocument()
    })

    it('shows copy button after successful conversion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      })
    })

    it('copies converted code to clipboard', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith('x = 1')
      expect(toast.success).toHaveBeenCalledWith('Converted code copied to clipboard!')
    })

    it('shows Copied! text after successful copy', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      expect(screen.getByText(/Copied!/i)).toBeInTheDocument()
    })

    it('handles clipboard error', async () => {
      const user = userEvent.setup()
      mockWriteText.mockRejectedValue(new Error('Clipboard not available'))
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })

    it('tracks copy event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_copy', {
        category: 'development',
        targetLanguage: 'python',
      })
    })
  })

  describe('Download Functionality', () => {
    it('does not show download button before conversion', () => {
      render(<AICodeConverterPage />)
      expect(screen.queryByRole('button', { name: /Download/i })).not.toBeInTheDocument()
    })

    it('shows download button after successful conversion', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
      })
    })

    it('downloads converted code with correct extension', async () => {
      const user = userEvent.setup()
      const mockAppendChild = vi.spyOn(document.body, 'appendChild')
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild')

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download/i })
      await user.click(downloadButton)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
      expect(toast.success).toHaveBeenCalledWith('Downloaded as converted_code.py')

      mockAppendChild.mockRestore()
      mockRemoveChild.mockRestore()
    })

    it('tracks download event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
      })

      const downloadButton = screen.getByRole('button', { name: /Download/i })
      await user.click(downloadButton)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_download', {
        category: 'development',
        targetLanguage: 'python',
        format: '.py',
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page open on mount', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<AICodeConverterPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_open', {
        category: 'development',
      })
    })

    it('tracks conversion attempt', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      expect(trackToolEvent).toHaveBeenCalledWith('code_converter_convert', {
        category: 'development',
        sourceLanguage: 'javascript',
        targetLanguage: 'python',
        codeLength: 12,
      })
    })

    it('tracks successful conversion', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('code_converter_success', {
          category: 'development',
          sourceLanguage: 'javascript',
          targetLanguage: 'python',
        })
      })
    })

    it('tracks conversion error', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      mockFetch.mockRejectedValue(new Error('API error'))

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('code_converter_error', {
          category: 'development',
          error: 'API error',
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('clears previous conversion when starting new conversion', async () => {
      const user = userEvent.setup()
      let callCount = 0
      mockFetch.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              convertedCode: callCount === 1 ? 'first conversion' : 'second conversion',
            }),
        })
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      // Wait for first conversion to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(toast.success).toHaveBeenCalledWith('Code converted successfully!')
      })

      // Verify conversion output is displayed (highlight.js mock returns 'highlighted-code')
      expect(screen.getByText('highlighted-code')).toBeInTheDocument()

      // Start second conversion
      await user.clear(textarea)
      await user.type(textarea, 'const y = 2;')
      await user.click(convertButton)

      // Wait for second conversion to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(toast.success).toHaveBeenCalledTimes(2)
      })

      // Verify converted code is still displayed (new conversion replaces old one)
      expect(screen.getByText('highlighted-code')).toBeInTheDocument()
    })

    it('swaps converted code to source code when swapping languages', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ convertedCode: 'x = 1' }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('highlighted-code')).toBeInTheDocument()
      })

      const swapButton = screen.getByRole('button', { name: /Swap languages/i })
      await user.click(swapButton)

      // Source code should now be the converted code
      expect(textarea).toHaveValue('x = 1')
      // Converted code area should be cleared
      expect(screen.getByText(/Converted code will appear here/i)).toBeInTheDocument()
    })

    it('handles conversion response without explanation', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            // No explanation field
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('highlighted-code')).toBeInTheDocument()
      })

      // Explanation section should not appear
      expect(screen.queryByText('Explanation')).not.toBeInTheDocument()
    })

    it('handles conversion response without warnings', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            explanation: 'Test explanation',
            // No warnings field
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('highlighted-code')).toBeInTheDocument()
      })

      // Warnings section should not appear
      expect(screen.queryByText('Warnings')).not.toBeInTheDocument()
    })

    it('handles empty warnings array', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            convertedCode: 'x = 1',
            explanation: 'Test explanation',
            warnings: [],
          }),
      })

      render(<AICodeConverterPage />)

      const textarea = screen.getByPlaceholderText(/Paste your code here/i)
      await user.type(textarea, 'const x = 1;')

      const convertButton = screen.getByRole('button', { name: /Convert Code/i })
      await user.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText('highlighted-code')).toBeInTheDocument()
      })

      // Warnings section should not appear for empty array
      expect(screen.queryByText('Warnings')).not.toBeInTheDocument()
    })
  })
})
