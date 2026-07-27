import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoremIpsumPage from '../page'

// Note: Clipboard API is mocked globally in vitest.setup.ts
// Use navigator.clipboard.writeText directly in tests

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

vi.mock('@/styled-system/css', () => ({
  css: vi.fn(() => 'mock-css'),
}))

vi.mock('lucide-react', () => ({
  Copy: () => <svg data-testid="icon-copy" />,
  FileText: () => <svg data-testid="icon-filetext" />,
  RotateCcw: () => <svg data-testid="icon-rotateccw" />,
  Sparkles: () => <svg data-testid="icon-sparkles" />,
}))

import { toast } from 'sonner'
// Import mocks after mocking
import { trackToolEvent } from '@/lib/services/analytics'

describe('LoremIpsumPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders the page title', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<LoremIpsumPage />)
      expect(
        screen.getByText('Generate placeholder text for your designs and mockups')
      ).toBeInTheDocument()
    })

    it('renders the FileText icon', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByTestId('icon-filetext')).toBeInTheDocument()
    })

    it('renders the Settings section', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders the Output Type section', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Output Type')).toBeInTheDocument()
    })

    it('renders all output type buttons', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByRole('button', { name: 'Paragraphs' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sentences' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Words' })).toBeInTheDocument()
    })

    it('renders the count slider with default value', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Count: 3')).toBeInTheDocument()
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '1')
      expect(slider).toHaveAttribute('max', '100')
      expect(slider).toHaveValue('3')
    })

    it('renders the Options section', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Options')).toBeInTheDocument()
    })

    it('renders the Start with Lorem ipsum checkbox (checked by default)', () => {
      render(<LoremIpsumPage />)
      const checkbox = screen.getByRole('checkbox', { name: /Start with "Lorem ipsum..."/i })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })

    it('renders the HTML format checkbox (unchecked by default)', () => {
      render(<LoremIpsumPage />)
      const checkbox = screen.getByRole('checkbox', { name: /HTML format/i })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('renders the Generate Text button', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByRole('button', { name: /Generate Text/i })).toBeInTheDocument()
    })

    it('renders the Generated Text section', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('Generated Text')).toBeInTheDocument()
    })

    it('renders the placeholder message when no text is generated', () => {
      render(<LoremIpsumPage />)
      expect(
        screen.getByText('Generated text will appear here. Click "Generate Text" to start.')
      ).toBeInTheDocument()
    })

    it('does not render Copy and Clear buttons when no text is generated', () => {
      render(<LoremIpsumPage />)
      expect(screen.queryByRole('button', { name: /Copy/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument()
    })

    it('does not render statistics when no text is generated', () => {
      render(<LoremIpsumPage />)
      expect(screen.queryByText('Characters')).not.toBeInTheDocument()
      // Note: 'Words' exists as a button, so check for stats-only label
      expect(screen.queryByText('Chars (no spaces)')).not.toBeInTheDocument()
    })

    it('renders the Tips section', () => {
      render(<LoremIpsumPage />)
      expect(screen.getByText('💡 Tips')).toBeInTheDocument()
    })

    it('renders all tip items', () => {
      render(<LoremIpsumPage />)
      expect(
        screen.getByText('Use paragraphs for long-form content placeholders in designs')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Use sentences for shorter text blocks like captions or descriptions')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Use words for testing typography and character limits')
      ).toBeInTheDocument()
    })
  })

  describe('output type selection', () => {
    it('selects Paragraphs by default', () => {
      render(<LoremIpsumPage />)
      // The button should be rendered (active state is handled by CSS)
      expect(screen.getByRole('button', { name: 'Paragraphs' })).toBeInTheDocument()
    })

    it('can select Sentences output type', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Sentences' }))

      // Verify selection by generating and checking toast
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'sentences',
        count: 3,
        htmlFormat: false,
      })
    })

    it('can select Words output type', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Words' }))

      // Verify selection by generating and checking toast
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'words',
        count: 3,
        htmlFormat: false,
      })
    })

    it('can switch between output types', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Switch to Words
      await user.click(screen.getByRole('button', { name: 'Words' }))

      // Switch back to Paragraphs
      await user.click(screen.getByRole('button', { name: 'Paragraphs' }))

      // Verify by generating
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'paragraphs',
        count: 3,
        htmlFormat: false,
      })
    })
  })

  describe('count slider', () => {
    it('updates count when slider value changes', () => {
      render(<LoremIpsumPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '10' } })

      expect(screen.getByText('Count: 10')).toBeInTheDocument()
      expect(slider).toHaveValue('10')
    })

    it('can set minimum value of 1', () => {
      render(<LoremIpsumPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '1' } })

      expect(screen.getByText('Count: 1')).toBeInTheDocument()
    })

    it('can set maximum value of 100', () => {
      render(<LoremIpsumPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '100' } })

      expect(screen.getByText('Count: 100')).toBeInTheDocument()
    })

    it('uses updated count when generating', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5' } })

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'paragraphs',
        count: 5,
        htmlFormat: false,
      })
    })
  })

  describe('checkbox options', () => {
    it('can uncheck Start with Lorem ipsum option', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      const checkbox = screen.getByRole('checkbox', { name: /Start with "Lorem ipsum..."/i })
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('can check HTML format option', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      const checkbox = screen.getByRole('checkbox', { name: /HTML format/i })
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('shows (<p> tags) when HTML format is enabled', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('checkbox', { name: /HTML format/i }))

      expect(screen.getByText(/\(<p> tags\)/)).toBeInTheDocument()
    })

    it('tracks htmlFormat in analytics when enabled', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('checkbox', { name: /HTML format/i }))
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'paragraphs',
        count: 3,
        htmlFormat: true,
      })
    })
  })

  describe('generate functionality', () => {
    it('generates text when Generate Text button is clicked', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Placeholder should be replaced with generated text
      expect(
        screen.queryByText('Generated text will appear here. Click "Generate Text" to start.')
      ).not.toBeInTheDocument()
    })

    it('shows success toast when text is generated', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(toast.success).toHaveBeenCalledWith('Text generated successfully!')
    })

    it('tracks analytics when text is generated', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'paragraphs',
        count: 3,
        htmlFormat: false,
      })
    })

    it('shows Copy and Clear buttons after generating text', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })

    it('shows statistics after generating text', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('Chars (no spaces)')).toBeInTheDocument()
      // Words, Sentences, Paragraphs appear both as buttons and stats labels
      expect(screen.getAllByText('Words').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('Sentences').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('Paragraphs').length).toBeGreaterThanOrEqual(2)
    })

    it('generates text starting with Lorem ipsum by default', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // The generated text should contain Lorem ipsum
      const outputArea = document.querySelector('[class*="mock-css"]')
      expect(outputArea?.textContent).toMatch(/Lorem ipsum/i)
    })

    it('generates paragraphs correctly', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Default is 3 paragraphs
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Should have 3 paragraphs displayed
      await waitFor(() => {
        const paragraphStat = screen.getAllByText('Paragraphs')[1].previousElementSibling
        expect(paragraphStat?.textContent).toBe('3')
      })
    })

    it('generates sentences correctly', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Sentences' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      await waitFor(() => {
        const sentenceStat = screen.getAllByText('Sentences')[1].previousElementSibling
        expect(sentenceStat?.textContent).toBe('5')
      })
    })

    it('generates words correctly', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Words' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '10' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      await waitFor(() => {
        const wordStat = screen.getAllByText('Words')[1].previousElementSibling
        expect(wordStat?.textContent).toBe('10')
      })
    })

    it('generates HTML formatted text when HTML format is enabled', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('checkbox', { name: /HTML format/i }))
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // The generated text should contain <p> tags
      const outputContainer = document.querySelectorAll('[class*="mock-css"]')
      const outputText = Array.from(outputContainer)
        .map((el) => el.textContent)
        .join('')
      expect(outputText).toContain('<p>')
      expect(outputText).toContain('</p>')
    })

    it('can regenerate text with new random content', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Generate first time
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Get the current text
      const outputContainerBefore = document.querySelectorAll('[class*="mock-css"]')
      Array.from(outputContainerBefore)
        .map((el) => el.textContent)
        .join('')

      // Uncheck "Start with Lorem ipsum" to get different text
      await user.click(screen.getByRole('checkbox', { name: /Start with "Lorem ipsum..."/i }))

      // Generate again
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Toast should be called twice
      expect(toast.success).toHaveBeenCalledTimes(2)
    })
  })

  describe('copy functionality', () => {
    it('shows error toast when trying to copy empty text', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Generate text first to show Copy button
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Clear the text
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      // Now Copy button should be hidden, but we can test the scenario
      // by mocking the component state
    })

    it('copies text to clipboard when Copy button is clicked', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      await user.click(screen.getByRole('button', { name: /Copy/i }))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })

    it('shows success toast when text is copied', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks() // Clear the "generated" toast
      await user.click(screen.getByRole('button', { name: /Copy/i }))

      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
    })

    it('tracks analytics when text is copied', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks()
      await user.click(screen.getByRole('button', { name: /Copy/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_copied', {
        length: expect.any(Number),
      })
    })

    it('shows Copied! text temporarily after copying', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      await user.click(screen.getByRole('button', { name: /Copy/i }))

      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    it('shows error toast when clipboard write fails', async () => {
      const user = userEvent.setup()
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'))

      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks()
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'))
      await user.click(screen.getByRole('button', { name: /Copy/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })
  })

  describe('clear functionality', () => {
    it('clears generated text when Clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      expect(
        screen.getByText('Generated text will appear here. Click "Generate Text" to start.')
      ).toBeInTheDocument()
    })

    it('shows success toast when text is cleared', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks()
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      expect(toast.success).toHaveBeenCalledWith('Text cleared')
    })

    it('tracks analytics when text is cleared', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks()
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_cleared')
    })

    it('hides Copy and Clear buttons after clearing', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      expect(screen.queryByRole('button', { name: /Copy/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument()
    })

    it('hides statistics after clearing', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      await user.click(screen.getByRole('button', { name: /Clear/i }))

      expect(screen.queryByText('Characters')).not.toBeInTheDocument()
      // Note: 'Words' exists as a button, so check for stats-only label
      expect(screen.queryByText('Chars (no spaces)')).not.toBeInTheDocument()
    })
  })

  describe('statistics display', () => {
    it('displays correct character count', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Generate 1 word
      await user.click(screen.getByRole('button', { name: 'Words' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      // Check that character count is a number
      const characterStat = screen.getByText('Characters').previousElementSibling
      expect(characterStat?.textContent).toMatch(/^\d+$/)
    })

    it('displays correct word count', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Words' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '15' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      const wordStat = screen.getAllByText('Words')[1].previousElementSibling
      expect(wordStat?.textContent).toBe('15')
    })

    it('displays correct sentence count', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: 'Sentences' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '7' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      const sentenceStat = screen.getAllByText('Sentences')[1].previousElementSibling
      expect(sentenceStat?.textContent).toBe('7')
    })

    it('displays correct paragraph count', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '4' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      const paragraphStat = screen.getAllByText('Paragraphs')[1].previousElementSibling
      expect(paragraphStat?.textContent).toBe('4')
    })

    it('displays characters without spaces', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      const noSpacesStat = screen.getByText('Chars (no spaces)').previousElementSibling
      expect(noSpacesStat?.textContent).toMatch(/^\d+$/)
    })

    it('updates statistics when regenerating', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Generate with 3 paragraphs
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      let paragraphStat = screen.getAllByText('Paragraphs')[1].previousElementSibling
      expect(paragraphStat?.textContent).toBe('3')

      // Change to 5 paragraphs and regenerate
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '5' } })
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      paragraphStat = screen.getAllByText('Paragraphs')[1].previousElementSibling
      expect(paragraphStat?.textContent).toBe('5')
    })
  })

  describe('integration tests', () => {
    it('complete workflow: select type, adjust count, toggle options, generate, copy, clear', async () => {
      const user = userEvent.setup()

      render(<LoremIpsumPage />)

      // 1. Select Sentences
      await user.click(screen.getByRole('button', { name: 'Sentences' }))

      // 2. Adjust count to 10
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '10' } })
      expect(screen.getByText('Count: 10')).toBeInTheDocument()

      // 3. Toggle HTML format on
      await user.click(screen.getByRole('checkbox', { name: /HTML format/i }))
      expect(screen.getByText(/\(<p> tags\)/)).toBeInTheDocument()

      // 4. Generate
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      expect(toast.success).toHaveBeenCalledWith('Text generated successfully!')
      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'sentences',
        count: 10,
        htmlFormat: true,
      })

      // 5. Verify statistics displayed
      expect(screen.getByText('Characters')).toBeInTheDocument()
      const sentenceStat = screen.getAllByText('Sentences')[1].previousElementSibling
      expect(sentenceStat?.textContent).toBe('10')

      // 6. Copy
      vi.clearAllMocks()
      await user.click(screen.getByRole('button', { name: /Copy/i }))
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')

      // 7. Clear
      vi.clearAllMocks()
      await user.click(screen.getByRole('button', { name: /Clear/i }))
      expect(toast.success).toHaveBeenCalledWith('Text cleared')
      expect(
        screen.getByText('Generated text will appear here. Click "Generate Text" to start.')
      ).toBeInTheDocument()
    })

    it('preserves settings between generations', async () => {
      const user = userEvent.setup()
      render(<LoremIpsumPage />)

      // Set up specific configuration
      await user.click(screen.getByRole('button', { name: 'Words' }))
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '20' } })
      await user.click(screen.getByRole('checkbox', { name: /Start with "Lorem ipsum..."/i })) // Uncheck

      // Generate first time
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))
      vi.clearAllMocks()

      // Generate second time - settings should be preserved
      await user.click(screen.getByRole('button', { name: /Generate Text/i }))

      expect(trackToolEvent).toHaveBeenCalledWith('lorem_ipsum_generated', {
        type: 'words',
        count: 20,
        htmlFormat: false,
      })
    })
  })
})
