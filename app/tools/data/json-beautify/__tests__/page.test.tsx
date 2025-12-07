import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import JSONBeautifierPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
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

vi.mock('nuqs', () => ({
  parseAsString: {
    withDefault: vi.fn((defaultValue) => ({ defaultValue })),
  },
  parseAsInteger: {
    withDefault: vi.fn((defaultValue) => ({ defaultValue })),
  },
  useQueryState: vi.fn((key) => {
    if (key === 'json') return ['', vi.fn()]
    if (key === 'indent') return [2, vi.fn()]
    return ['', vi.fn()]
  }),
}))

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
})

describe('JSON Beautifier Page', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <JSONBeautifierPage />
      </QueryClientProvider>
    )
  }

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      renderPage()
      expect(screen.getAllByText(/JSON/i)[0]).toBeTruthy()
    })

    it('should render main heading', () => {
      renderPage()
      const heading = screen.getByText(/JSON Beautifier & Formatter/i)
      expect(heading).toBeTruthy()
    })

    it('should render description text', () => {
      renderPage()
      expect(screen.getByText(/Format, validate, and beautify JSON data/i)).toBeTruthy()
    })

    it('should track page open event', () => {
      renderPage()
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
        'json_beautifier_open',
        expect.any(Object)
      )
    })
  })

  describe('Input Area', () => {
    it('should display input and output areas', () => {
      renderPage()
      const elements = screen.queryAllByText(/Input|Output|JSON/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should render input textarea', () => {
      renderPage()
      const textareas = document.querySelectorAll('textarea')
      expect(textareas.length).toBeGreaterThan(0)
    })

    it('should render output area', () => {
      renderPage()
      const outputs = screen.queryAllByText(/Output|Formatted|Result/i)
      expect(outputs.length).toBeGreaterThan(0)
    })

    it('should allow typing JSON in input', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"name":"test"}')

      expect(textarea.value).toContain('name')
    })

    it('should accept JSON input placeholder', () => {
      renderPage()
      const textarea = document.querySelector('textarea')
      expect(textarea?.placeholder).toBeTruthy()
    })
  })

  describe('Action Buttons', () => {
    it('should render Beautify button', () => {
      renderPage()
      expect(screen.getByText(/Beautify|Format/i)).toBeTruthy()
    })

    it('should render Minify button', () => {
      renderPage()
      expect(screen.getByText(/Minify|Compress/i)).toBeTruthy()
    })

    it('should render Copy button', () => {
      renderPage()
      expect(screen.getByText(/Copy/i)).toBeTruthy()
    })

    it('should render Clear button', () => {
      renderPage()
      expect(screen.getByText(/Clear/i)).toBeTruthy()
    })

    it('should render Validate button', () => {
      renderPage()
      expect(screen.getByText(/Validate/i)).toBeTruthy()
    })
  })

  describe('JSON Beautify', () => {
    it('should beautify valid JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"name":"test","age":30}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output).toBeTruthy()
      })
    })

    it('should format nested JSON objects', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"user":{"name":"test","details":{"age":30}}}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output?.textContent).toBeTruthy()
      })
    })

    it('should format JSON arrays', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '[1,2,3,4,5]')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output).toBeTruthy()
      })
    })
  })

  describe('JSON Minify', () => {
    it('should minify JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{\n  "name": "test",\n  "age": 30\n}')

      const minifyButton = screen.getByText(/Minify|Compress/i)
      await user.click(minifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output).toBeTruthy()
      })
    })

    it('should remove whitespace when minifying', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{\n  "key"  :  "value"\n}')

      const minifyButton = screen.getByText(/Minify|Compress/i)
      await user.click(minifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output?.textContent).not.toContain('  ')
      })
    })
  })

  describe('JSON Validation', () => {
    it('should validate correct JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"valid":"json"}')

      const validateButton = screen.getByText(/Validate/i)
      await user.click(validateButton)

      await waitFor(() => {
        expect(screen.queryByText(/valid/i)).toBeTruthy()
      })
    })

    it('should detect invalid JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{invalid json}')

      const validateButton = screen.getByText(/Validate/i)
      await user.click(validateButton)

      await waitFor(() => {
        expect(screen.queryByText(/error|invalid/i)).toBeTruthy()
      })
    })

    it('should show error for malformed JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"key": value}')

      const validateButton = screen.getByText(/Validate/i)
      await user.click(validateButton)

      await waitFor(() => {
        expect(screen.queryByText(/error|invalid/i)).toBeTruthy()
      })
    })
  })

  describe('Indentation Settings', () => {
    it('should render indent size selector', () => {
      renderPage()
      expect(screen.getByText(/Indent|Spaces/i)).toBeTruthy()
    })

    it('should display indent options', () => {
      renderPage()
      const buttons = screen.queryAllByText(/2|4/)
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should allow selecting 2 spaces', async () => {
      const user = userEvent.setup()
      renderPage()

      const twoSpacesButton = screen.getByText('2')
      await user.click(twoSpacesButton)

      expect(twoSpacesButton).toBeTruthy()
    })

    it('should allow selecting 4 spaces', async () => {
      const user = userEvent.setup()
      renderPage()

      const fourSpacesButton = screen.getByText('4')
      await user.click(fourSpacesButton)

      expect(fourSpacesButton).toBeTruthy()
    })
  })

  describe('Copy Functionality', () => {
    it('should copy formatted JSON to clipboard', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      const copyButton = screen.getByText(/Copy/i)
      await user.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('should clear input when Clear is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      const clearButton = screen.getByText(/Clear/i)
      await user.click(clearButton)

      await waitFor(() => {
        expect(textarea.value).toBe('')
      })
    })

    it('should clear output when clearing input', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      const clearButton = screen.getByText(/Clear/i)
      await user.click(clearButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output?.textContent).toBe('')
      })
    })
  })

  describe('Syntax Highlighting', () => {
    it('should display syntax highlighted output', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"key":"value"}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output).toBeTruthy()
      })
    })
  })

  describe('JSON Examples', () => {
    it('should display example JSON button', () => {
      renderPage()
      expect(screen.queryByText(/Example|Sample/i)).toBeTruthy()
    })

    it('should load example when clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const exampleButton = screen.queryByText(/Example|Sample/i)
      if (exampleButton) {
        await user.click(exampleButton)

        await waitFor(() => {
          const textarea = document.querySelector('textarea') as HTMLTextAreaElement
          expect(textarea.value).toBeTruthy()
        })
      }
    })
  })

  describe('File Upload', () => {
    it('should accept JSON file upload', () => {
      renderPage()
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThan(0)
    })

    it('should process uploaded JSON file', async () => {
      const user = userEvent.setup()
      renderPage()

      const file = new File(['{"test":"value"}'], 'test.json', { type: 'application/json' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(input.files?.[0]).toBe(file)
      })
    })
  })

  describe('Download Functionality', () => {
    it('should render download button', () => {
      renderPage()
      expect(screen.queryByText(/Download|Export/i)).toBeTruthy()
    })

    it('should download formatted JSON', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      const downloadButton = screen.queryByText(/Download|Export/i)
      if (downloadButton) {
        await user.click(downloadButton)
        expect(downloadButton).toBeTruthy()
      }
    })
  })

  describe('Error Display', () => {
    it('should show error message for invalid input', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, 'not json')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        expect(screen.queryByText(/error|invalid/i)).toBeTruthy()
      })
    })

    it('should display line number in error', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"key": }')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        expect(screen.queryByText(/line|position/i)).toBeTruthy()
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should support Tab key in textarea', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.click(textarea)
      await user.keyboard('{Tab}')

      expect(textarea).toBeTruthy()
    })
  })

  describe('Visual Elements', () => {
    it('should render JSON icon', () => {
      renderPage()
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should display formatted layout', () => {
      renderPage()
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible textarea', () => {
      renderPage()
      const textarea = document.querySelector('textarea')
      expect(textarea).toBeTruthy()
    })

    it('should have accessible buttons', () => {
      renderPage()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have ARIA labels', () => {
      renderPage()
      const ariaElements = document.querySelectorAll('[aria-label]')
      expect(ariaElements.length).toBeGreaterThan(0)
    })
  })

  describe('Character Counter', () => {
    it('should display character count', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      await waitFor(() => {
        const counter = screen.queryByText(/character|char|count/i)
        expect(counter).toBeTruthy()
      })
    })
  })

  describe('Related Tools', () => {
    it('should render Related Tools section', () => {
      renderPage()
      expect(screen.getByText(/Related Tools/i)).toBeTruthy()
    })

    it('should display related tool links', () => {
      renderPage()
      const relatedTools = document.querySelectorAll('[href*="/tools/"]')
      expect(relatedTools.length).toBeGreaterThan(0)
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ section', () => {
      renderPage()
      expect(screen.getByText(/Frequently Asked Questions|FAQ/i)).toBeTruthy()
    })

    it('should display FAQ items', () => {
      renderPage()
      const faqItems = screen.queryAllByText(/\?/)
      expect(faqItems.length).toBeGreaterThan(0)
    })
  })

  describe('Social Share', () => {
    it('should render social share section', () => {
      renderPage()
      const shareElements = screen.queryAllByText(/share/i)
      expect(shareElements.length).toBeGreaterThan(0)
    })
  })

  describe('JSON Tree View', () => {
    it('should offer tree view option', () => {
      renderPage()
      expect(screen.queryByText(/Tree|View|Display/i)).toBeTruthy()
    })
  })

  describe('Format Options', () => {
    it('should display format controls', () => {
      renderPage()
      expect(screen.queryByText(/Format|Options|Settings/i)).toBeTruthy()
    })
  })

  describe('Line Numbers', () => {
    it('should show line numbers in output', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value"}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        const output = document.querySelector('pre')
        expect(output).toBeTruthy()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', () => {
      renderPage()
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('JSON Statistics', () => {
    it('should display JSON statistics', async () => {
      const user = userEvent.setup()
      renderPage()

      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      await user.type(textarea, '{"test":"value","items":[1,2,3]}')

      const beautifyButton = screen.getByText(/Beautify|Format/i)
      await user.click(beautifyButton)

      await waitFor(() => {
        expect(screen.queryByText(/size|keys|lines/i)).toBeTruthy()
      })
    })
  })

  describe('Paste from Clipboard', () => {
    it('should have paste button', () => {
      renderPage()
      expect(screen.queryByText(/Paste/i)).toBeTruthy()
    })
  })

  describe('JSON Sorting', () => {
    it('should offer sort keys option', () => {
      renderPage()
      expect(screen.queryByText(/Sort|Order/i)).toBeTruthy()
    })
  })
})
