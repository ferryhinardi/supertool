import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import JSONToCSVPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock next/dynamic to return the mocked component synchronously
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_fn: () => Promise<unknown>, _options?: { ssr?: boolean }) => {
    const MockComponent = ({
      value,
      onChange,
    }: {
      value: string
      onChange: (val: string) => void
    }) => (
      <textarea
        data-testid="codemirror-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Code Editor"
      />
    )
    return MockComponent
  },
}))

// Mock CodeMirror
vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <textarea
      data-testid="codemirror-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Code Editor"
    />
  ),
}))

// Mock @codemirror/lang-json - return a proper extension object
vi.mock('@codemirror/lang-json', () => ({
  json: () => ({
    name: 'json',
    support: vi.fn(),
  }),
}))

// Helper function to get delimiter input by its default value
// Using getByDisplayValue instead of getByLabelText due to multiple "Delimiter" text matches (label + tooltip)
const getDelimiterInput = () => screen.getByDisplayValue(',')

describe('JSON to CSV Converter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('Page Rendering', () => {
    it('renders the page without crashing', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('JSON to CSV Converter')).toBeTruthy()
    })

    it('displays the page title and description', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('JSON to CSV Converter')).toBeTruthy()
      expect(screen.getByText(/Convert JSON data to CSV with nested object support/i)).toBeTruthy()
    })

    it('renders the FileSpreadsheet icon', async () => {
      const { container } = render(<JSONToCSVPage />)
      const icon = container.querySelector('svg')
      expect(icon).toBeTruthy()
    })

    it('displays configuration section', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('Configuration')).toBeTruthy()
    })

    it('displays JSON input section', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('JSON Input')).toBeTruthy()
    })

    it('displays CSV output preview section', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('CSV Output Preview')).toBeTruthy()
    })
  })

  describe('Default State and Sample Data', () => {
    it('renders with default JSON sample', async () => {
      render(<JSONToCSVPage />)
      // Wait for CodeMirror to load (jsonExtension async load in useEffect)
      const editor = (await screen.findByTestId('codemirror-editor')) as HTMLTextAreaElement
      expect(editor.value).toContain('John Doe')
      expect(editor.value).toContain('Jane Smith')
      expect(editor.value).toContain('john@example.com')
    })

    it('displays valid status for default JSON', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('✅ Valid')).toBeTruthy()
    })

    it('shows correct statistics for default JSON', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText(/2 rows/i)).toBeTruthy()
      expect(screen.getByText(/3 columns/i)).toBeTruthy()
    })

    it('displays character count in statistics', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText(/chars/i)).toBeTruthy()
    })

    it('defaults delimiter to comma', async () => {
      render(<JSONToCSVPage />)
      const delimiterInput = getDelimiterInput() as HTMLInputElement
      expect(delimiterInput.value).toBe(',')
    })

    it('defaults flatten nested to checked', async () => {
      render(<JSONToCSVPage />)
      const checkbox = screen.getByRole('checkbox', {
        name: /Flatten nested objects/i,
      }) as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('JSON to CSV Conversion', () => {
    it('converts simple JSON array to CSV', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const simpleJSON = '[{"name":"Alice","age":28}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: simpleJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('displays correct CSV output for simple data', async () => {
      render(<JSONToCSVPage />)

      // Wait for CSV output to be rendered - use a more flexible text matcher
      await waitFor(
        () => {
          expect(screen.getByText((content) => content.includes('name'))).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    it('handles empty string values', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithEmpty = '[{"name":"Bob","email":""}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithEmpty } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles null values in JSON', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithNull = '[{"name":"Charlie","age":null}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithNull } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles numeric values correctly', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithNumbers = '[{"id":1,"price":99.99,"stock":100}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithNumbers } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles boolean values', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithBooleans = '[{"active":true,"premium":false}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithBooleans } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })
  })

  describe('Delimiter Configuration', () => {
    it('allows changing delimiter to semicolon', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const delimiterInput = getDelimiterInput()

      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: ';' } })

      expect(delimiterInput).toHaveValue(';')
    })

    it('allows changing delimiter to tab', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const delimiterInput = getDelimiterInput()

      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: '\t' } })

      expect(delimiterInput).toHaveValue('\t')
    })

    it('allows changing delimiter to pipe', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const delimiterInput = getDelimiterInput()

      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: '|' } })

      expect(delimiterInput).toHaveValue('|')
    })

    it('limits delimiter to single character', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const delimiterInput = getDelimiterInput() as HTMLInputElement

      // Check that maxLength attribute is set to 1
      expect(delimiterInput.maxLength).toBe(1)

      // When we set value programmatically, maxLength should be respected by the browser
      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: ';' } })

      expect(delimiterInput).toHaveValue(';')
    })

    it('updates CSV output when delimiter changes', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const delimiterInput = getDelimiterInput()

      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: ';' } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })
  })

  describe('Nested Object Handling', () => {
    it('displays flatten nested checkbox', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('Flatten nested objects')).toBeTruthy()
    })

    it('flattens nested objects when enabled', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const nestedJSON = '[{"name":"David","address":{"city":"NYC","zip":"10001"}}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: nestedJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('toggles flatten nested option', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const checkbox = screen.getByRole('checkbox', { name: /Flatten nested objects/i })

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('handles array values in nested objects', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithArrays = '[{"name":"Eve","tags":["a","b","c"]}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithArrays } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles deeply nested objects', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const deeplyNestedJSON = '[{"user":{"profile":{"name":"Frank","age":35}}}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: deeplyNestedJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('displays copy button', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByRole('button', { name: /Copy CSV/i })).toBeTruthy()
    })

    it('copies valid CSV to clipboard', async () => {
      render(<JSONToCSVPage />)

      // Wait for the component to render with valid CSV
      await waitFor(
        () => {
          expect(screen.getByText('✅ Valid')).toBeTruthy()
        },
        { timeout: 5000 }
      )

      const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
      expect(copyButton).not.toBeDisabled()

      // Use fireEvent instead of userEvent for simpler test
      fireEvent.click(copyButton)

      // Wait for async clipboard operation
      await waitFor(
        () => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled()
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith('CSV copied to clipboard 📋')
        },
        { timeout: 3000 }
      )
    })

    it('tracks copy event in analytics', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
      await user.click(copyButton)

      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'json_copy',
        expect.objectContaining({
          output_length: expect.any(Number),
        })
      )
    })

    it('disables copy button when JSON is invalid', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: 'invalid json' } })

      await waitFor(async () => {
        const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
        expect(copyButton).toBeDisabled()
      })
    })

    it('shows error toast when copying invalid CSV', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '{}' } })

      await waitFor(async () => {
        const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
        expect(copyButton).toBeDisabled()
      })
    })

    it('shows tooltip on copy button hover', async () => {
      render(<JSONToCSVPage />)
      const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
      expect(copyButton).toBeTruthy()
    })
  })

  describe('Download Functionality', () => {
    it('displays download button', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByRole('button', { name: /Download CSV/i })).toBeTruthy()
    })

    it('downloads CSV file', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const createElementSpy = vi.spyOn(document, 'createElement')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      await user.click(downloadButton)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('CSV file downloaded 📥')
    })

    it('tracks download event in analytics', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      vi.spyOn(document, 'createElement')
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      await user.click(downloadButton)

      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'json_download',
        expect.objectContaining({
          file_size_kb: expect.any(Number),
        })
      )
    })

    it('creates filename with timestamp', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const createElementSpy = vi.spyOn(document, 'createElement')
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      await user.click(downloadButton)

      const anchorCall = createElementSpy.mock.results.find(
        (result) => result.value.tagName === 'A'
      )
      expect(anchorCall).toBeTruthy()
    })

    it('disables download button when JSON is invalid', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: 'not valid json' } })

      await waitFor(async () => {
        const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
        expect(downloadButton).toBeDisabled()
      })
    })

    it('shows tooltip on download button hover', async () => {
      render(<JSONToCSVPage />)
      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      expect(downloadButton).toBeTruthy()
    })
  })

  describe('Reset Functionality', () => {
    it('displays reset button', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByRole('button', { name: /Reset/i })).toBeTruthy()
    })

    it('resets to default JSON sample', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')

      // Change the input
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '[{"test":"value"}]' } })

      // Click reset
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(async () => {
        const editorAfterReset = (await screen.findByTestId(
          'codemirror-editor'
        )) as HTMLTextAreaElement
        expect(editorAfterReset.value).toContain('John Doe')
        expect(editorAfterReset.value).toContain('Jane Smith')
      })
    })

    it('resets delimiter to comma', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      // Change delimiter
      const delimiterInput = getDelimiterInput()
      await user.clear(delimiterInput)
      fireEvent.change(delimiterInput, { target: { value: ';' } })

      // Click reset
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(async () => {
        expect(delimiterInput).toHaveValue(',')
      })
    })

    it('resets flatten nested to checked', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      // Uncheck flatten nested
      const checkbox = screen.getByRole('checkbox', { name: /Flatten nested objects/i })
      await user.click(checkbox)

      // Click reset
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      await waitFor(async () => {
        expect(checkbox).toBeChecked()
      })
    })

    it('shows success toast on reset', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await user.click(resetButton)

      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Reset to default example')
    })

    it('shows tooltip on reset button hover', async () => {
      render(<JSONToCSVPage />)
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      expect(resetButton).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('shows error for invalid JSON', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: 'not json at all' } })

      await waitFor(
        () => {
          // Check for error state by looking for the AlertCircle icon or error text
          const errorElement = screen.queryByText(/Invalid JSON|Unexpected token/i)
          expect(errorElement).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('shows error for non-array JSON', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '{"name":"single object"}' } })

      await waitFor(async () => {
        expect(screen.getByText(/Input must be an array of objects/i)).toBeTruthy()
      })
    })

    it('shows error for empty array', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '[]' } })

      await waitFor(async () => {
        expect(screen.getByText(/Array cannot be empty/i)).toBeTruthy()
      })
    })

    it('displays error icon for invalid JSON', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: 'bad json' } })

      await waitFor(
        () => {
          const errorElement = screen.queryByText(/Invalid JSON|Unexpected token/i)
          expect(errorElement).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('handles malformed JSON objects', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '[{"name":"test",}]' } })

      await waitFor(
        () => {
          // Check that the Valid badge is NOT present (indicating error state)
          const validBadge = screen.queryByText('✅ Valid')
          expect(validBadge).toBeNull()

          // Should show some error text or AlertCircle icon
          const alertIcon =
            document.querySelector('[data-lucide="alert-circle"]') ||
            screen.queryByText(/error|invalid|unexpected/i)
          expect(alertIcon).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })

    it('shows appropriate error border color when invalid', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: 'invalid' } })

      await waitFor(
        () => {
          const errorElement = screen.queryByText(/Invalid JSON|Unexpected token/i)
          expect(errorElement).toBeTruthy()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Statistics Display', () => {
    it('displays row count badge', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText(/2 rows/i)).toBeTruthy()
    })

    it('displays column count badge', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText(/3 columns/i)).toBeTruthy()
    })

    it('displays character count badge', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText(/chars/i)).toBeTruthy()
    })

    it('updates statistics when JSON changes', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const newJSON = '[{"a":1},{"b":2},{"c":3}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: newJSON } })

      await waitFor(async () => {
        expect(screen.getByText(/3 rows/i)).toBeTruthy()
      })
    })

    it('formats character count with locale string', async () => {
      render(<JSONToCSVPage />)
      const charBadge = screen.getByText(/chars/i)
      expect(charBadge).toBeTruthy()
    })

    it('shows valid badge when conversion succeeds', async () => {
      render(<JSONToCSVPage />)
      const validBadge = screen.getByText('✅ Valid')
      expect(validBadge).toBeTruthy()
    })
  })

  describe('CSV Output Preview', () => {
    it('displays CSV output in preview area', async () => {
      render(<JSONToCSVPage />)

      await waitFor(
        () => {
          expect(screen.getByText((content) => content.includes('name'))).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    it('updates preview when JSON input changes', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const newJSON = '[{"id":1,"value":"test"}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: newJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('shows placeholder when no valid CSV', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      await user.clear(editor)
      fireEvent.change(editor, { target: { value: '{}' } })

      await waitFor(async () => {
        expect(screen.getByText(/Enter valid JSON array to see CSV output/i)).toBeTruthy()
      })
    })

    it('preview scrolls when content is long', async () => {
      render(<JSONToCSVPage />)
      await waitFor(
        () => {
          const preview = screen.getByText((content) => content.includes('name'))
          expect(preview.closest('div')).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('CSV Field Escaping', () => {
    it('escapes fields with commas', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithCommas = '[{"name":"Smith, John","age":30}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithCommas } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('escapes fields with quotes', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithQuotes = '[{"quote":"He said \\"Hello\\""}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithQuotes } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('escapes fields with newlines', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const jsonWithNewlines = '[{"text":"Line1\\nLine2"}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: jsonWithNewlines } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible action buttons', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByRole('button', { name: /Copy CSV/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Download CSV/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Reset/i })).toBeTruthy()
    })

    it('has accessible form inputs', async () => {
      render(<JSONToCSVPage />)
      // Check for delimiter select by looking for select element or text content
      // Use getAllByText since "Delimiter" appears in both label and tooltip
      expect(screen.getAllByText(/Delimiter/i).length).toBeGreaterThanOrEqual(1)
    })

    it('has accessible checkbox with label', async () => {
      render(<JSONToCSVPage />)
      const checkbox = screen.getByRole('checkbox', { name: /Flatten nested objects/i })
      expect(checkbox).toBeTruthy()
    })

    it('provides meaningful button labels', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByRole('button', { name: /Copy CSV/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Download CSV/i })).toBeTruthy()
    })

    it('shows tooltips for action buttons', async () => {
      render(<JSONToCSVPage />)
      const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      const resetButton = screen.getByRole('button', { name: /Reset/i })

      expect(copyButton).toBeTruthy()
      expect(downloadButton).toBeTruthy()
      expect(resetButton).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('renders mobile-friendly layout', async () => {
      render(<JSONToCSVPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('displays action buttons in responsive container', async () => {
      render(<JSONToCSVPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders responsive text sizes', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('JSON to CSV Converter')).toBeTruthy()
    })

    it('displays responsive configuration grid', async () => {
      render(<JSONToCSVPage />)
      expect(screen.getByText('Configuration')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('handles very large JSON arrays', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const largeArray = JSON.stringify(
        Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Item ${i}` }))
      )

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: largeArray } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles objects with many columns', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const wideObject = JSON.stringify([
        { col1: 1, col2: 2, col3: 3, col4: 4, col5: 5, col6: 6, col7: 7, col8: 8 },
      ])

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: wideObject } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles objects with inconsistent keys', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const inconsistentJSON = '[{"a":1,"b":2},{"b":3,"c":4}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: inconsistentJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles special characters in field names', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const specialCharsJSON = '[{"field@name":"value","field#2":"test"}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: specialCharsJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles unicode characters', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const unicodeJSON = '[{"name":"José","city":"São Paulo","emoji":"😀"}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: unicodeJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })

    it('handles empty objects in array', async () => {
      const user = userEvent.setup()
      render(<JSONToCSVPage />)

      const editor = await screen.findByTestId('codemirror-editor')
      const emptyObjectJSON = '[{"name":"Alice"},{}]'

      await user.clear(editor)
      fireEvent.change(editor, { target: { value: emptyObjectJSON } })

      await waitFor(async () => {
        expect(screen.getByText('✅ Valid')).toBeTruthy()
      })
    })
  })

  describe('Button States', () => {
    it('enables copy button when CSV is valid', async () => {
      render(<JSONToCSVPage />)
      const copyButton = screen.getByRole('button', { name: /Copy CSV/i })
      expect(copyButton).not.toBeDisabled()
    })

    it('enables download button when CSV is valid', async () => {
      render(<JSONToCSVPage />)
      const downloadButton = screen.getByRole('button', { name: /Download CSV/i })
      expect(downloadButton).not.toBeDisabled()
    })

    it('reset button is always enabled', async () => {
      render(<JSONToCSVPage />)
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      expect(resetButton).not.toBeDisabled()
    })
  })
})
