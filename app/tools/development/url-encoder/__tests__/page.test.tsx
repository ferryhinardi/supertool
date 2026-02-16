import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock RelatedTools
vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: ({ currentToolPath }: { currentToolPath: string }) => (
    <div data-testid="related-tools" data-path={currentToolPath}>
      Related Tools
    </div>
  ),
}))

// Mock SocialShare
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: ({
    toolName,
    toolUrl,
    description,
  }: {
    toolName: string
    toolUrl: string
    description: string
  }) => (
    <div data-testid="social-share" data-tool-name={toolName} data-url={toolUrl}>
      {description}
    </div>
  ),
}))

// Mock ToolRating
vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: ({ toolId, toolName }: { toolId: string; toolName: string }) => (
    <div data-testid="tool-rating" data-tool-id={toolId}>
      {toolName}
    </div>
  ),
}))

// Track the current mock state
let mockMethod = 'encodeURIComponent'
const mockSetMethod = vi.fn((newMethod: string | ((prev: string) => string)) => {
  if (typeof newMethod === 'function') {
    mockMethod = newMethod(mockMethod)
  } else {
    mockMethod = newMethod
  }
})

// Mock nuqs
vi.mock('nuqs', () => ({
  useQueryState: vi.fn(() => [mockMethod, mockSetMethod]),
  parseAsStringEnum: vi.fn(() => ({
    withDefault: vi.fn(() => ({})),
  })),
}))

// Clipboard mock - will be set up with vi.spyOn in beforeEach
const mockWriteText = vi.fn()

import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/services/analytics'
import URLEncoderPage from '../page'

describe('URLEncoderPage', () => {
  // Setup userEvent once at describe level
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMethod = 'encodeURIComponent'
    // Mock clipboard using vi.spyOn - this is the working pattern from other tests
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(mockWriteText)
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page title and description', () => {
      render(<URLEncoderPage />)

      expect(screen.getByText('URL Encoder')).toBeInTheDocument()
      expect(screen.getByText('& Decoder')).toBeInTheDocument()
      expect(
        screen.getByText(/Encode and decode URLs with encodeURI, encodeURIComponent/)
      ).toBeInTheDocument()
    })

    it('renders the Development Tool badge', () => {
      render(<URLEncoderPage />)

      expect(screen.getByText('Development Tool')).toBeInTheDocument()
    })

    it('renders all encoding method buttons', () => {
      render(<URLEncoderPage />)

      expect(screen.getByText('encodeURIComponent')).toBeInTheDocument()
      expect(screen.getByText('encodeURI')).toBeInTheDocument()
      expect(screen.getByText('decodeURIComponent')).toBeInTheDocument()
      expect(screen.getByText('decodeURI')).toBeInTheDocument()
    })

    it('renders method descriptions', () => {
      render(<URLEncoderPage />)

      expect(
        screen.getByText('Encodes all special characters (recommended for query params)')
      ).toBeInTheDocument()
      expect(screen.getByText('Preserves URL structure (://?#)')).toBeInTheDocument()
      expect(screen.getByText('Decodes all special characters')).toBeInTheDocument()
      expect(screen.getByText('Decodes preserving URL structure')).toBeInTheDocument()
    })

    it('renders input and output textareas', () => {
      render(<URLEncoderPage />)

      expect(screen.getByLabelText(/Input/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Output/)).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      render(<URLEncoderPage />)

      expect(screen.getByRole('button', { name: /Swap/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
    })

    it('renders Quick Examples section', () => {
      render(<URLEncoderPage />)

      expect(screen.getByText('Quick Examples')).toBeInTheDocument()
      expect(screen.getByText('URL with spaces')).toBeInTheDocument()
      expect(screen.getByText('Special chars')).toBeInTheDocument()
      expect(screen.getByText('Full URL')).toBeInTheDocument()
      expect(screen.getByText('Unicode')).toBeInTheDocument()
      expect(screen.getByText('Email in URL')).toBeInTheDocument()
      expect(screen.getByText('Encoded string')).toBeInTheDocument()
    })

    it('renders related tools section', () => {
      render(<URLEncoderPage />)

      const relatedTools = screen.getByTestId('related-tools')
      expect(relatedTools).toBeInTheDocument()
      expect(relatedTools).toHaveAttribute('data-path', '/tools/development/url-encoder')
    })

    it('renders social share component', () => {
      render(<URLEncoderPage />)

      const socialShare = screen.getByTestId('social-share')
      expect(socialShare).toBeInTheDocument()
      expect(socialShare).toHaveAttribute('data-tool-name', 'URL Encoder/Decoder')
    })

    it('renders tool rating component', () => {
      render(<URLEncoderPage />)

      const toolRating = screen.getByTestId('tool-rating')
      expect(toolRating).toBeInTheDocument()
      expect(toolRating).toHaveAttribute('data-tool-id', 'url-encoder')
    })

    it('tracks page open event on mount', () => {
      render(<URLEncoderPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('url_encoder_open', {})
    })
  })

  describe('Encoding Methods', () => {
    it('encodes text using encodeURIComponent by default', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello World!')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('Hello%20World!')
      })
    })

    it('switches to encodeURI method when clicked', async () => {
      render(<URLEncoderPage />)

      // Click encodeURI button
      const encodeURIButton = screen.getByText('encodeURI').closest('button')
      await user.click(encodeURIButton!)

      expect(mockSetMethod).toHaveBeenCalledWith('encodeURI')
    })

    it('switches to decodeURIComponent method when clicked', async () => {
      render(<URLEncoderPage />)

      const decodeButton = screen.getByText('decodeURIComponent').closest('button')
      await user.click(decodeButton!)

      expect(mockSetMethod).toHaveBeenCalledWith('decodeURIComponent')
    })

    it('switches to decodeURI method when clicked', async () => {
      render(<URLEncoderPage />)

      const decodeURIButton = screen.getByText('decodeURI').closest('button')
      await user.click(decodeURIButton!)

      expect(mockSetMethod).toHaveBeenCalledWith('decodeURI')
    })

    it('encodes special characters correctly with encodeURIComponent', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'name=John&age=30')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('name%3DJohn%26age%3D30')
      })
    })

    it('tracks encode event when encoding text', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('url_encoder_encode', {
          method: 'encodeURIComponent',
        })
      })
    })
  })

  describe('Decoding', () => {
    beforeEach(() => {
      mockMethod = 'decodeURIComponent'
    })

    it('decodes encoded text with decodeURIComponent', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello%20World%21')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('Hello World!')
      })
    })

    it('tracks decode event when decoding text', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello%20World')

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('url_encoder_decode', {
          method: 'decodeURIComponent',
        })
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockMethod = 'decodeURIComponent'
    })

    it('shows error for invalid encoded string', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      // %GG is an invalid percent-encoding
      await user.type(input, '%GG')

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })

    it('shows error for malformed URI sequence', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      // Incomplete percent-encoding
      await user.type(input, '%E4%B8')

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })

    it('clears error when input is corrected', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, '%GG')

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })

      // Clear the input
      await user.clear(input)

      await waitFor(() => {
        expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Quick Examples', () => {
    it('populates input with "Hello World" when clicking URL with spaces example', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen.getByText('Hello World').closest('button')
      await user.click(exampleButton!)

      await waitFor(() => {
        const input = screen.getByLabelText(/Input/)
        expect(input).toHaveValue('Hello World')
      })
    })

    it('populates input with special chars example', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen.getByText('name=John&age=30').closest('button')
      await user.click(exampleButton!)

      await waitFor(() => {
        const input = screen.getByLabelText(/Input/)
        expect(input).toHaveValue('name=John&age=30')
      })
    })

    it('populates input with full URL example', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen
        .getByText('https://example.com/path?q=test value')
        .closest('button')
      await user.click(exampleButton!)

      await waitFor(() => {
        const input = screen.getByLabelText(/Input/)
        expect(input).toHaveValue('https://example.com/path?q=test value')
      })
    })

    it('auto-selects decode method for encoded string example', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen.getByText('Hello%20World%21').closest('button')
      await user.click(exampleButton!)

      expect(mockSetMethod).toHaveBeenCalledWith('decodeURIComponent')
    })

    it('selects encode method for non-encoded examples', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen.getByText('Hello World').closest('button')
      await user.click(exampleButton!)

      expect(mockSetMethod).toHaveBeenCalledWith('encodeURIComponent')
    })

    it('populates input with Unicode example', async () => {
      render(<URLEncoderPage />)

      // The Unicode example contains Café with accent (é = \u00E9), coffee emoji, and Chinese characters
      // Find button by the 'Unicode' label text
      const exampleButton = screen.getByText('Unicode').closest('button')
      await user.click(exampleButton!)

      await waitFor(() => {
        const input = screen.getByLabelText(/Input/)
        // Café ☕ 中文 - with é accent (\u00E9)
        expect(input).toHaveValue('Caf\u00E9 \u2615 \u4E2D\u6587')
      })
    })

    it('populates input with email example', async () => {
      render(<URLEncoderPage />)

      const exampleButton = screen.getByText('user@example.com').closest('button')
      await user.click(exampleButton!)

      await waitFor(() => {
        const input = screen.getByLabelText(/Input/)
        expect(input).toHaveValue('user@example.com')
      })
    })
  })

  describe('Copy Functionality', () => {
    it('copies output to clipboard when Copy button is clicked', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello World')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('Hello%20World')
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Hello%20World')
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      })
    })

    it('tracks copy event when copying', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test')
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      expect(trackToolEvent).toHaveBeenCalledWith('url_encoder_copy', {})
    })

    it('shows "Copied!" text after successful copy', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test')
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument()
      })
    })

    it('Copy button is disabled when output is empty', () => {
      render(<URLEncoderPage />)

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      expect(copyButton).toBeDisabled()
    })

    // TODO: Fix clipboard rejection mock - userEvent.setup() overrides clipboard mock
    // making it difficult to test rejection scenarios reliably
    it.skip('shows error toast when clipboard fails', async () => {
      // Override mockWriteText to reject for this test only
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'))

      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test')
      })

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears input and output when Clear button is clicked', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello World')

      await waitFor(() => {
        expect(input).toHaveValue('Hello World')
      })

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(input).toHaveValue('')
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('')
      })
    })

    it('shows success toast after clearing', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      expect(toast.success).toHaveBeenCalledWith('Cleared!')
    })

    it('tracks clear event', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      expect(trackToolEvent).toHaveBeenCalledWith('url_encoder_clear', {})
    })

    it('Clear button is disabled when input is empty', () => {
      render(<URLEncoderPage />)

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      expect(clearButton).toBeDisabled()
    })

    it('clears error state when clearing', async () => {
      mockMethod = 'decodeURIComponent'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, '%GG')

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /Clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Swap Functionality', () => {
    it('Swap button is disabled when output is empty', () => {
      render(<URLEncoderPage />)

      const swapButton = screen.getByRole('button', { name: /Swap/i })
      expect(swapButton).toBeDisabled()
    })

    it('swaps output to input and toggles method from encodeURIComponent to decodeURIComponent', async () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello World')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('Hello%20World')
      })

      const swapButton = screen.getByRole('button', { name: /Swap/i })
      await user.click(swapButton)

      expect(mockSetMethod).toHaveBeenCalledWith('decodeURIComponent')
    })

    it('swaps and toggles method from decodeURIComponent to encodeURIComponent', async () => {
      mockMethod = 'decodeURIComponent'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello%20World')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('Hello World')
      })

      const swapButton = screen.getByRole('button', { name: /Swap/i })
      await user.click(swapButton)

      expect(mockSetMethod).toHaveBeenCalledWith('encodeURIComponent')
    })

    it('swaps and toggles method from encodeURI to decodeURI', async () => {
      mockMethod = 'encodeURI'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test value')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test%20value')
      })

      const swapButton = screen.getByRole('button', { name: /Swap/i })
      await user.click(swapButton)

      expect(mockSetMethod).toHaveBeenCalledWith('decodeURI')
    })

    it('swaps and toggles method from decodeURI to encodeURI', async () => {
      mockMethod = 'decodeURI'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test%20value')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test value')
      })

      const swapButton = screen.getByRole('button', { name: /Swap/i })
      await user.click(swapButton)

      expect(mockSetMethod).toHaveBeenCalledWith('encodeURI')
    })
  })

  describe('Real-time Processing', () => {
    it('updates output in real-time as user types', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)

      await user.type(input, 'a')
      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('a')
      })

      await user.type(input, ' ')
      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('a%20')
      })

      await user.type(input, 'b')
      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('a%20b')
      })
    })

    it('clears output when input is cleared', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'test')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('test')
      })

      await user.clear(input)

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('')
      })
    })

    it('handles whitespace-only input as empty', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, '   ')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('')
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for input and output', () => {
      render(<URLEncoderPage />)

      expect(screen.getByLabelText(/Input \(Plain Text\)/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Output \(Encoded\)/)).toBeInTheDocument()
    })

    it('output textarea is read-only', () => {
      render(<URLEncoderPage />)

      const output = screen.getByLabelText(/Output/)
      expect(output).toHaveAttribute('readonly')
    })

    it('displays correct placeholders based on mode', () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      expect(input).toHaveAttribute(
        'placeholder',
        'Enter text to encode, e.g., Hello World! or https://example.com/path?query=value'
      )
    })

    it('all method buttons are keyboard accessible', () => {
      render(<URLEncoderPage />)

      const buttons = screen.getAllByRole('button')
      // Method buttons + action buttons
      expect(buttons.length).toBeGreaterThan(4)
    })
  })

  describe('Label Updates', () => {
    it('shows "Encode URL" title when encode method is selected', () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText('Encode URL')).toBeInTheDocument()
    })

    it('shows "Decode URL" title when decode method is selected', () => {
      mockMethod = 'decodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText('Decode URL')).toBeInTheDocument()
    })

    it('shows correct description for encode mode', () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText('Enter text to encode for safe URL usage')).toBeInTheDocument()
    })

    it('shows correct description for decode mode', () => {
      mockMethod = 'decodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText('Enter encoded text to decode')).toBeInTheDocument()
    })

    it('shows "(Plain Text)" label for input in encode mode', () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText(/Input \(Plain Text\)/)).toBeInTheDocument()
    })

    it('shows "(Encoded)" label for input in decode mode', () => {
      mockMethod = 'decodeURIComponent'
      render(<URLEncoderPage />)

      expect(screen.getByText(/Input \(Encoded\)/)).toBeInTheDocument()
    })
  })

  describe('encodeURI vs encodeURIComponent behavior', () => {
    it('encodeURIComponent encodes all special characters including URL separators', async () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'https://example.com/path?q=value')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        // encodeURIComponent encodes :, /, ?, =
        expect(output).toHaveValue('https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dvalue')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string input', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'a')
      await user.clear(input)

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('')
      })
    })

    it('handles very long input', async () => {
      render(<URLEncoderPage />)

      const longText = 'a'.repeat(1000)
      const input = screen.getByLabelText(/Input/)
      await user.type(input, longText)

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue(longText)
      })
    })

    it('handles emoji characters', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, '\u2615')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('%E2%98%95')
      })
    })

    it('handles newline characters', async () => {
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/) as HTMLTextAreaElement
      fireEvent.change(input, { target: { value: 'line1\nline2' } })

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        expect(output).toHaveValue('line1%0Aline2')
      })
    })

    it('handles already encoded input with encode method (double encoding)', async () => {
      mockMethod = 'encodeURIComponent'
      render(<URLEncoderPage />)

      const input = screen.getByLabelText(/Input/)
      await user.type(input, 'Hello%20World')

      await waitFor(() => {
        const output = screen.getByLabelText(/Output/)
        // % becomes %25, so %20 becomes %2520
        expect(output).toHaveValue('Hello%2520World')
      })
    })
  })

  describe('Suspense Loading State', () => {
    it('renders content without loading state when component loads', () => {
      render(<URLEncoderPage />)

      // The page should render normally
      expect(screen.getByText('URL Encoder')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })
})
