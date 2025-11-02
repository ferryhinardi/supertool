import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import YamlJsonConverterPage from '../page'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
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

describe('YAML ↔ JSON Converter Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render page with title and description', () => {
      render(<YamlJsonConverterPage />)

      expect(
        screen.getByRole('heading', { name: /YAML ↔ JSON Converter/i, level: 1 })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Convert between YAML and JSON formats instantly/i)
      ).toBeInTheDocument()
    })

    it('should render conversion direction toggle', () => {
      render(<YamlJsonConverterPage />)

      expect(screen.getByText('Conversion Direction')).toBeInTheDocument()
      expect(screen.getByText('YAML → JSON')).toBeInTheDocument()
      expect(screen.getByText('JSON → YAML')).toBeInTheDocument()
    })

    it('should render input and output sections', () => {
      render(<YamlJsonConverterPage />)

      expect(screen.getByText('YAML Input')).toBeInTheDocument()
      expect(screen.getByText('JSON Output')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<YamlJsonConverterPage />)

      expect(screen.getByText('Load Example')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('should render features info card', () => {
      render(<YamlJsonConverterPage />)

      expect(screen.getByText('Features & Tips')).toBeInTheDocument()
      expect(screen.getByText(/Real-time conversion as you type/i)).toBeInTheDocument()
      expect(screen.getByText(/Automatic syntax validation/i)).toBeInTheDocument()
    })

    it('should track page open event', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_open', {})
      })
    })
  })

  describe('YAML to JSON Conversion', () => {
    it('should convert simple YAML to JSON', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John\nage: 30')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "John"'))
        expect(outputArea).toHaveValue(expect.stringContaining('"age": 30'))
      })
    })

    it('should convert nested YAML to JSON', async () => {
      render(<YamlJsonConverterPage />)

      const yamlInput = `person:
  name: Jane
  age: 25`

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, yamlInput)

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"person"'))
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "Jane"'))
      })
    })

    it('should convert YAML arrays to JSON', async () => {
      render(<YamlJsonConverterPage />)

      const yamlInput = `fruits:
  - apple
  - banana`

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, yamlInput)

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"fruits"'))
        expect(outputArea).toHaveValue(expect.stringContaining('apple'))
      })
    })

    it('should show error for invalid YAML', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'invalid:\n  - missing indent\n    wrong: indent')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })

    it('should track conversion event', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_convert', {
          direction: 'yaml-to-json',
          input_length: expect.any(Number),
          success: true,
        })
      })
    })

    it('should track error event for invalid YAML', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'invalid: yaml: syntax')

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith(
          'yaml_json_converter_convert',
          expect.objectContaining({
            direction: 'yaml-to-json',
            success: false,
            error: expect.any(String),
          })
        )
      })
    })
  })

  describe('JSON to YAML Conversion', () => {
    it('should switch to JSON to YAML mode', async () => {
      render(<YamlJsonConverterPage />)

      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByText('JSON Input')).toBeInTheDocument()
        expect(screen.getByText('YAML Output')).toBeInTheDocument()
      })
    })

    it('should convert simple JSON to YAML', async () => {
      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      await userEvent.type(inputArea, '{"name": "John", "age": 30}')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('name: John'))
        expect(outputArea).toHaveValue(expect.stringContaining('age: 30'))
      })
    })

    it('should convert nested JSON to YAML', async () => {
      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const jsonInput = '{"person": {"name": "Jane", "age": 25}}'
      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      await userEvent.type(inputArea, jsonInput)

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('person:'))
        expect(outputArea).toHaveValue(expect.stringContaining('name: Jane'))
      })
    })

    it('should show error for invalid JSON', async () => {
      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      await userEvent.type(inputArea, '{invalid json}')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })
  })

  describe('Direction Swap Functionality', () => {
    it('should swap conversion direction', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      // Find the swap button (ArrowLeftRight icon button)
      const swapButton = screen.getAllByRole('button').find((btn) => {
        const svg = btn.querySelector('svg')
        return svg !== null && btn.getAttribute('class')?.includes('rounded')
      })

      expect(swapButton).toBeInTheDocument()

      if (swapButton) {
        await userEvent.click(swapButton)
      }

      await waitFor(() => {
        expect(screen.getByText('JSON Input')).toBeInTheDocument()
        expect(screen.getByText('YAML Output')).toBeInTheDocument()
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_swap', {
          new_direction: 'json-to-yaml',
        })
      })
    })

    it('should swap input and output when swapping direction', async () => {
      render(<YamlJsonConverterPage />)

      // Enter YAML input
      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "John"'))
      })

      // Find the swap button
      const swapButton = screen.getAllByRole('button').find((btn) => {
        const svg = btn.querySelector('svg')
        return svg !== null && btn.getAttribute('class')?.includes('rounded')
      })

      if (swapButton) {
        await userEvent.click(swapButton)
      }

      await waitFor(() => {
        const newInputArea = screen.getByPlaceholderText('Paste your JSON here...')
        expect(newInputArea).toHaveValue(expect.stringContaining('"name": "John"'))
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy output to clipboard', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      const { toast } = await import('sonner')

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "John"'))
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_copy', {
          direction: 'yaml-to-json',
        })
      })
    })

    it('should show copied confirmation', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name"'))
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })

      // Wait for the copied state to reset
      await waitFor(
        () => {
          expect(screen.getByText('Copy')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should handle clipboard write error gracefully', async () => {
      const { toast } = await import('sonner')

      // Mock clipboard API to fail
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard write failed'))
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name"'))
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })
  })

  describe('Download Functionality', () => {
    it('should download JSON file when converting from YAML', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      const { toast } = await import('sonner')

      // Mock URL.createObjectURL and document methods
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      const clickMock = vi.fn()
      const appendChildMock = vi.fn()
      const removeChildMock = vi.fn()
      document.body.appendChild = appendChildMock
      document.body.removeChild = removeChildMock

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = document.createElement(tag)
        element.click = clickMock
        return element
      })

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name"'))
      })

      const downloadButton = screen.getByText('Download')
      await userEvent.click(downloadButton)

      await waitFor(() => {
        expect(createObjectURLMock).toHaveBeenCalled()
        expect(clickMock).toHaveBeenCalled()
        expect(revokeObjectURLMock).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Downloaded as JSON!')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_download', {
          direction: 'yaml-to-json',
          format: 'json',
        })
      })
    })

    it('should download YAML file when converting from JSON', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')
      const { toast } = await import('sonner')

      // Mock URL methods
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      const clickMock = vi.fn()
      const appendChildMock = vi.fn()
      const removeChildMock = vi.fn()
      document.body.appendChild = appendChildMock
      document.body.removeChild = removeChildMock

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const element = document.createElement(tag)
        element.click = clickMock
        return element
      })

      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      await userEvent.type(inputArea, '{"name": "John"}')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('name: John'))
      })

      const downloadButton = screen.getByText('Download')
      await userEvent.click(downloadButton)

      await waitFor(() => {
        expect(createObjectURLMock).toHaveBeenCalled()
        expect(clickMock).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Downloaded as YAML!')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_download', {
          direction: 'json-to-yaml',
          format: 'yaml',
        })
      })
    })
  })

  describe('Clear Functionality', () => {
    it('should clear input and output', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name"'))
      })

      const clearButton = screen.getByText('Clear')
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(inputArea).toHaveValue('')
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue('')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_clear', {})
      })
    })

    it('should clear error message when clearing input', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'invalid: yaml: syntax')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })

      const clearButton = screen.getByText('Clear')
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText('Validation Error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Load Example', () => {
    it('should load YAML example when in YAML to JSON mode', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
        expect(inputArea).toHaveValue(expect.stringContaining('name: SuperTool'))
        expect(inputArea).toHaveValue(expect.stringContaining('version: 1.0.0'))
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_load_example', {
          direction: 'yaml-to-json',
        })
      })
    })

    it('should load JSON example when in JSON to YAML mode', async () => {
      const { trackToolEvent } = await import('@/lib/analytics')

      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
        expect(inputArea).toHaveValue(expect.stringContaining('"name": "SuperTool"'))
        expect(inputArea).toHaveValue(expect.stringContaining('"version": "1.0.0"'))
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_load_example', {
          direction: 'json-to-yaml',
        })
      })
    })

    it('should convert example data immediately after loading', async () => {
      render(<YamlJsonConverterPage />)

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "SuperTool"'))
      })
    })
  })

  describe('Button States', () => {
    it('should disable copy button when no output text', () => {
      render(<YamlJsonConverterPage />)

      const copyButton = screen.getByText('Copy')
      expect(copyButton).toBeDisabled()
    })

    it('should disable download button when no output text', () => {
      render(<YamlJsonConverterPage />)

      const downloadButton = screen.getByText('Download')
      expect(downloadButton).toBeDisabled()
    })

    it('should enable copy button when output is present', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const copyButton = screen.getByText('Copy')
        expect(copyButton).not.toBeDisabled()
      })
    })

    it('should enable download button when output is present', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const downloadButton = screen.getByText('Download')
        expect(downloadButton).not.toBeDisabled()
      })
    })
  })

  describe('Real-time Conversion', () => {
    it('should convert text as user types', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')

      // Type first character
      await userEvent.type(inputArea, 'n')
      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        // Should show error for incomplete YAML
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })

      // Complete the YAML
      await userEvent.clear(inputArea)
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name": "John"'))
        expect(screen.queryByText('Validation Error')).not.toBeInTheDocument()
      })
    })

    it('should clear output when input is cleared', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'name: John')

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue(expect.stringContaining('"name"'))
      })

      await userEvent.clear(inputArea)

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        expect(outputArea).toHaveValue('')
      })
    })
  })

  describe('Error Display', () => {
    it('should show error message for invalid YAML', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'invalid: yaml: : syntax')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
        const errorText = screen.getByText(/Validation Error/i).parentElement
        expect(errorText).toBeInTheDocument()
      })
    })

    it('should show error message for invalid JSON', async () => {
      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      await userEvent.type(inputArea, '{invalid}')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })

    it('should highlight input textarea with error border', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      await userEvent.type(inputArea, 'invalid: yaml: : syntax')

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
        // The textarea should have error styling
        expect(inputArea).toBeInTheDocument()
      })
    })
  })
})
