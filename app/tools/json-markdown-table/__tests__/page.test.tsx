import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import JSONToMarkdownTablePage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock next/dynamic to return the mocked component synchronously
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_importFn: any, _options?: any) => {
    // Return a component that matches CodeMirror's interface
    const MockComponent = ({
      value,
      onChange,
    }: {
      value: string
      onChange: (value: string) => void
      height?: string
      extensions?: unknown[]
      theme?: string
      basicSetup?: Record<string, boolean>
    }) => (
      <textarea
        data-testid="code-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="JSON Input Editor"
      />
    )
    return MockComponent
  },
}))

// Mock CodeMirror
vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
    height?: string
    extensions?: unknown[]
    theme?: string
    basicSetup?: Record<string, boolean>
  }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="JSON Input Editor"
    />
  ),
}))

vi.mock('@codemirror/lang-json', () => ({
  json: vi.fn(() => ({})),
}))

describe('JSON to Markdown Table Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore any spies that might have been created
    vi.restoreAllMocks()
  })

  it('should render page with heading', async () => {
    render(<JSONToMarkdownTablePage />)

    expect(
      screen.getByRole('heading', { name: 'JSON to Markdown Table', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Convert JSON arrays to beautifully formatted Markdown tables/i)
    ).toBeInTheDocument()

    // Wait for CodeMirror to load
    await waitFor(() => {
      expect(screen.getByTestId('code-editor')).toBeInTheDocument()
    })
  })

  it('should display valid stats for default JSON', () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByText('3 rows')).toBeInTheDocument()
    expect(screen.getByText('3 columns')).toBeInTheDocument()
    expect(screen.getByText(/chars/i)).toBeInTheDocument()
    expect(screen.getByText('Valid')).toBeInTheDocument()
  })

  it('should have configuration options', () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Column Alignment')).toBeInTheDocument()
    expect(screen.getByText('Custom Headers (comma-separated, optional)')).toBeInTheDocument()
  })

  it('should display action buttons', () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByRole('button', { name: /Copy Markdown/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download \.md/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('should display JSON input editor', async () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByText('JSON Input')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('code-editor')).toBeInTheDocument()
    })
  })

  it('should display markdown output preview', () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByText('Markdown Output Preview')).toBeInTheDocument()
  })

  it('should show error for invalid JSON', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = await screen.findByTestId('code-editor')
    await userEvent.clear(editor)
    await userEvent.type(editor, 'invalid json')

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format|Unexpected token/i)).toBeInTheDocument()
    })
  })

  it('should show error for non-array JSON', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('{"name": "test"}')

    await waitFor(() => {
      expect(screen.getByText('Input must be an array of objects')).toBeInTheDocument()
    })
  })

  it('should show error for empty array', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[]')

    await waitFor(() => {
      expect(screen.getByText('Array cannot be empty')).toBeInTheDocument()
    })
  })

  it('should copy markdown to clipboard when copy button is clicked', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    }
    // Properly mock the clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    })

    const { toast } = await import('sonner')
    const { trackToolEvent } = await import('@/lib/analytics')

    render(<JSONToMarkdownTablePage />)

    const copyButton = screen.getByRole('button', { name: /Copy Markdown/i })
    await userEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Markdown table copied to clipboard')
      expect(trackToolEvent).toHaveBeenCalledWith('json_markdown_copy', expect.any(Object))
    })
  })

  it('should download markdown file when download button is clicked', async () => {
    const { toast } = await import('sonner')
    const { trackToolEvent } = await import('@/lib/analytics')

    render(<JSONToMarkdownTablePage />)

    // Wait for the download button to be available first
    const downloadButton = await screen.findByRole('button', {
      name: /Download \.md/i,
    })

    // Mock document.createElement and related DOM APIs AFTER render
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
    } as unknown as HTMLAnchorElement

    const originalCreateElement = document.createElement.bind(document)
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor
        }
        return originalCreateElement(tagName)
      })
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    await userEvent.click(downloadButton)

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Markdown file downloaded')
      expect(trackToolEvent).toHaveBeenCalledWith('json_markdown_download', expect.any(Object))
    })

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should reset to default values when reset button is clicked', async () => {
    const { toast } = await import('sonner')

    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[{"foo": "bar"}]')

    // Wait for the paste to take effect
    await waitFor(() => {
      expect(editor.value).toContain('foo')
    })

    const resetButton = screen.getByRole('button', { name: /Reset/i })
    await userEvent.click(resetButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Reset to default example')
      // Check if the value contains John Doe
      expect(editor.value).toContain('John Doe')
    })
  })

  it('should change alignment when alignment dropdown is changed', async () => {
    render(<JSONToMarkdownTablePage />)

    const alignmentSelect = screen.getByDisplayValue('Left')
    await userEvent.selectOptions(alignmentSelect, 'center')

    await waitFor(() => {
      expect(alignmentSelect).toHaveValue('center')
    })
  })

  it('should update custom headers when input changes', async () => {
    render(<JSONToMarkdownTablePage />)

    const customHeadersInput = screen.getByPlaceholderText('Name, Age, Location')
    await userEvent.type(customHeadersInput, 'Person, Years, City')

    await waitFor(() => {
      expect(customHeadersInput).toHaveValue('Person, Years, City')
    })
  })

  it('should show error when custom headers count does not match columns', async () => {
    render(<JSONToMarkdownTablePage />)

    const customHeadersInput = screen.getByPlaceholderText('Name, Age, Location')
    await userEvent.type(customHeadersInput, 'Only One Header')

    await waitFor(() => {
      expect(
        screen.getByText(/Custom headers count .* must match columns count/i)
      ).toBeInTheDocument()
    })
  })

  it('should display help section', () => {
    render(<JSONToMarkdownTablePage />)

    expect(screen.getByRole('heading', { name: /How to Use/i })).toBeInTheDocument()
    expect(screen.getByText(/Paste your JSON array in the editor above/i)).toBeInTheDocument()
    expect(screen.getByText(/Choose column alignment/i)).toBeInTheDocument()
    expect(screen.getByText(/Perfect for documentation/i)).toBeInTheDocument()
  })

  it('should disable buttons when JSON is invalid', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = await screen.findByTestId('code-editor')
    await userEvent.clear(editor)
    await userEvent.type(editor, 'invalid')

    await waitFor(() => {
      const copyButton = screen.getByRole('button', { name: /Copy Markdown/i })
      const downloadButton = screen.getByRole('button', {
        name: /Download \.md/i,
      })

      expect(copyButton).toBeDisabled()
      expect(downloadButton).toBeDisabled()
    })
  })

  it('should show placeholder when no valid output', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[]')

    await waitFor(() => {
      expect(screen.getByText('Enter valid JSON array to see Markdown table')).toBeInTheDocument()
    })
  })
})

describe('JSON to Markdown Conversion Logic', () => {
  it('should generate correct markdown table format', async () => {
    render(<JSONToMarkdownTablePage />)

    // Default JSON should generate a table with left alignment
    await waitFor(() => {
      const output = screen.getByText(/name.*age.*city/i)
      expect(output).toBeInTheDocument()
    })
  })

  it('should escape pipe characters in cell values', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[{"text": "value|with|pipes"}]')

    await waitFor(() => {
      const outputs = screen.getAllByText(/value\\|with\\|pipes/i)
      expect(outputs.length).toBeGreaterThan(0)
      expect(outputs[0]).toBeInTheDocument()
    })
  })

  it('should handle null and undefined values', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[{"name": "John", "age": null}]')

    await waitFor(() => {
      // Should show table with empty cell for null value
      expect(screen.queryByText('null')).not.toBeInTheDocument()
    })
  })

  it('should sort headers alphabetically', async () => {
    render(<JSONToMarkdownTablePage />)

    // Wait for CodeMirror to load
    const editor = (await screen.findByTestId('code-editor')) as HTMLTextAreaElement
    await userEvent.clear(editor)
    await userEvent.click(editor)
    await userEvent.paste('[{"zebra": 1, "apple": 2, "banana": 3}]')

    await waitFor(() => {
      const output = screen.getByText(/\| apple \| banana \| zebra \|/i)
      expect(output).toBeInTheDocument()
    })
  })
})
