import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'

// Mock modules inline - must NOT reference external variables
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/tools/yaml-json',
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => {
      const { children, ...rest } = props
      return createElement('div', rest, children)
    },
  },
}))

import YamlJsonConverterPage from '../page'

describe('YAML ↔ JSON Converter Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
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
      fireEvent.input(inputArea, { target: { value: 'name: John\nage: 30' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })
    })

    it('should convert nested YAML to JSON', async () => {
      render(<YamlJsonConverterPage />)

      const yamlInput = `person:
  name: Jane
  age: 25`

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: yamlInput } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"person"')
        expect(value).toContain('"name"')
        expect(value).toContain('"Jane"')
      })
    })

    it('should convert YAML arrays to JSON', async () => {
      render(<YamlJsonConverterPage />)

      const yamlInput = `fruits:
  - apple
  - banana`

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: yamlInput } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"fruits"')
        expect(value).toContain('apple')
        expect(value).toContain('banana')
      })
    })

    it('should show error for invalid YAML', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, {
        target: { value: 'invalid:\n  - missing indent\n    wrong: indent' },
      })

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })

    it('should track conversion event', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_convert', {
          direction: 'yaml-to-json',
          input_length: expect.any(Number),
          success: true,
        })
      })
    })

    it('should track error event for invalid YAML', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'invalid: yaml: syntax' } })

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
      fireEvent.input(inputArea, { target: { value: '{"name": "John", "age": 30}' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('name:')
        expect(value).toContain('John')
        expect(value).toContain('age:')
        expect(value).toContain('30')
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
      fireEvent.input(inputArea, { target: { value: jsonInput } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('person:')
        expect(value).toContain('name:')
        expect(value).toContain('Jane')
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
      fireEvent.input(inputArea, { target: { value: '{invalid json}' } })

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })
  })

  describe('Direction Swap Functionality', () => {
    it('should swap conversion direction', async () => {
      render(<YamlJsonConverterPage />)

      // Find the swap button (middle button between the two direction buttons)
      const buttons = screen.getAllByRole('button')
      // The swap button is the one with ArrowLeftRight icon (has path with 'm16 21' in it)
      const swapButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg')
        if (!svg) return false
        const paths = svg.querySelectorAll('path')
        return Array.from(paths).some((path) => path.getAttribute('d')?.includes('m16 21'))
      })

      expect(swapButton).toBeDefined()

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
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })

      // Find the swap button
      const buttons = screen.getAllByRole('button')
      const swapButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg')
        if (!svg) return false
        const paths = svg.querySelectorAll('path')
        return Array.from(paths).some((path) => path.getAttribute('d')?.includes('m16 21'))
      })

      if (swapButton) {
        await userEvent.click(swapButton)
      }

      await waitFor(() => {
        const newInputArea = screen.getByPlaceholderText('Paste your JSON here...')
        const value = (newInputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy output to clipboard', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })

      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_copy', {
          direction: 'yaml-to-json',
        })
      })
    })

    it('should show copied confirmation', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
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
      // Mock clipboard to fail
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
        new Error('Clipboard write failed')
      )

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
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
      // Mock URL.createObjectURL and revokeObjectURL
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
      })

      // Now mock appendChild after rendering is complete
      const clickMock = vi.fn()
      const _appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => {
          if (node instanceof HTMLAnchorElement) {
            node.click = clickMock
            return node
          }
          // For non-anchor elements, do nothing (they're already rendered)
          return node
        })

      const _removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => null as any)

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
      // Mock URL methods
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      fireEvent.input(inputArea, { target: { value: '{"name": "John"}' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('name:')
      })

      // Now mock appendChild after rendering is complete
      const clickMock = vi.fn()
      const _appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => {
          if (node instanceof HTMLAnchorElement) {
            node.click = clickMock
            return node
          }
          return node
        })

      const _removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => null as any)

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

  describe('Download Functionality - Additional Tests', () => {
    it('should download YAML file when converting from JSON', async () => {
      // Mock URL methods
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      render(<YamlJsonConverterPage />)

      // Switch to JSON to YAML
      const jsonToYamlButton = screen.getByText('JSON → YAML')
      await userEvent.click(jsonToYamlButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Paste your JSON here...')).toBeInTheDocument()
      })

      const inputArea = screen.getByPlaceholderText('Paste your JSON here...')
      fireEvent.input(inputArea, { target: { value: '{"name": "John"}' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('name:')
      })

      // Now mock appendChild after rendering is complete
      const clickMock = vi.fn()
      const _appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => {
          if (node instanceof HTMLAnchorElement) {
            node.click = clickMock
            return node
          }
          return node
        })

      const _removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => null as any)

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
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
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
      fireEvent.input(inputArea, { target: { value: 'invalid: yaml: syntax' } })

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
      render(<YamlJsonConverterPage />)

      const loadExampleButton = screen.getByText('Load Example')
      await userEvent.click(loadExampleButton)

      await waitFor(() => {
        const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
        const value = (inputArea as HTMLTextAreaElement).value
        expect(value).toContain('name:')
        expect(value).toContain('SuperTool')
        expect(value).toContain('version:')
        expect(value).toContain('1.0.0')
        expect(trackToolEvent).toHaveBeenCalledWith('yaml_json_converter_load_example', {
          direction: 'yaml-to-json',
        })
      })
    })

    it('should load JSON example when in JSON to YAML mode', async () => {
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
        const value = (inputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"SuperTool"')
        expect(value).toContain('"version"')
        expect(value).toContain('"1.0.0"')
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
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
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
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })
    })

    it('should enable download button when output is present', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

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

      // Type valid YAML
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
      })

      // Update with more complete YAML
      fireEvent.input(inputArea, { target: { value: 'name: John\nage: 30' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
        expect(value).toContain('"John"')
        expect(value).toContain('"age"')
        expect(value).toContain('30')
      })
    })

    it('should clear output when input is cleared', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'name: John' } })

      await waitFor(() => {
        const outputArea = screen.getByPlaceholderText('Converted output will appear here...')
        const value = (outputArea as HTMLTextAreaElement).value
        expect(value).toContain('"name"')
      })

      fireEvent.input(inputArea, { target: { value: '' } })

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
      fireEvent.input(inputArea, { target: { value: 'invalid: yaml: : syntax' } })

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
      fireEvent.input(inputArea, { target: { value: '{invalid}' } })

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
      })
    })

    it('should highlight input textarea with error border', async () => {
      render(<YamlJsonConverterPage />)

      const inputArea = screen.getByPlaceholderText('Paste your YAML here...')
      fireEvent.input(inputArea, { target: { value: 'invalid: yaml: : syntax' } })

      await waitFor(() => {
        expect(screen.getByText('Validation Error')).toBeInTheDocument()
        // The textarea should have error styling
        expect(inputArea).toBeInTheDocument()
      })
    })
  })
})
