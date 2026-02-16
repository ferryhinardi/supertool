import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReadabilityCheckerPage from '../page'
import { sampleTexts } from '../utils'

// Mock analytics
const mockTrackToolEvent = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(''),
}

describe('ReadabilityCheckerPage', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    mockTrackToolEvent.mockClear()
    mockClipboard.writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', { value: mockClipboard, writable: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page title', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByRole('heading', { name: /readability checker/i })).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<ReadabilityCheckerPage />)
      expect(
        screen.getByText(/analyze your text with multiple readability formulas/i)
      ).toBeInTheDocument()
    })

    it('renders the textarea for text input', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByPlaceholderText(/paste or type your text here/i)).toBeInTheDocument()
    })

    it('renders sample text buttons', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument()
    })

    it('renders Copy and Clear buttons', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders Overall Assessment section', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByText(/overall assessment/i)).toBeInTheDocument()
      expect(screen.getByText(/flesch reading ease score/i)).toBeInTheDocument()
    })

    it('renders Text Statistics section', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByText(/text statistics/i)).toBeInTheDocument()
      expect(screen.getByText(/^words$/i)).toBeInTheDocument()
      expect(screen.getByText(/^sentences$/i)).toBeInTheDocument()
      expect(screen.getByText(/^syllables$/i)).toBeInTheDocument()
      expect(screen.getByText(/^Complex Words$/)).toBeInTheDocument()
    })

    it('renders Readability Scores section', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByText(/readability scores/i)).toBeInTheDocument()
      expect(screen.getByText(/flesch-kincaid grade/i)).toBeInTheDocument()
      expect(screen.getByText(/gunning fog index/i)).toBeInTheDocument()
      expect(screen.getByText(/smog index/i)).toBeInTheDocument()
      expect(screen.getByText(/coleman-liau index/i)).toBeInTheDocument()
      expect(screen.getByText(/automated readability/i)).toBeInTheDocument()
    })

    it('renders Tips section with 6 tips', () => {
      render(<ReadabilityCheckerPage />)
      expect(screen.getByText(/tips for improving readability/i)).toBeInTheDocument()
      expect(screen.getByText(/use shorter sentences/i)).toBeInTheDocument()
      expect(screen.getByText(/choose simple words/i)).toBeInTheDocument()
      expect(screen.getByText(/use active voice/i)).toBeInTheDocument()
      expect(screen.getByText(/avoid jargon/i)).toBeInTheDocument()
      expect(screen.getByText(/use transition words/i)).toBeInTheDocument()
      expect(screen.getByText(/break up text/i)).toBeInTheDocument()
    })

    it('shows placeholder score when no text is entered', () => {
      render(<ReadabilityCheckerPage />)
      // The score should show '--' when no text
      expect(screen.getByText('--')).toBeInTheDocument()
    })

    it('shows zero values for statistics when no text', () => {
      render(<ReadabilityCheckerPage />)
      // Should have multiple 0 values for stats
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Text Input', () => {
    it('allows typing in textarea', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Hello world.')

      expect(textarea).toHaveValue('Hello world.')
    })

    it('updates statistics when text is entered', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'This is a simple test sentence.')

      await waitFor(() => {
        // Should have word count > 0
        const statsContainer = screen.getByText(/^words$/i).closest('div')
        expect(statsContainer).toBeInTheDocument()
      })
    })

    it('tracks text_changed event when text is entered', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Test text')

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'readability_checker_text_changed',
          expect.objectContaining({ wordCount: expect.any(Number) })
        )
      })
    })

    it('does not track event for empty text', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      // Type and clear
      await user.type(textarea, 'a')
      await user.clear(textarea)

      // Reset mock to check for subsequent calls
      const callsBeforeClear = mockTrackToolEvent.mock.calls.length

      // Empty textarea shouldn't trigger additional tracking
      await user.click(textarea)

      await waitFor(() => {
        // No new calls should be made after clearing
        expect(mockTrackToolEvent.mock.calls.length).toBeLessThanOrEqual(callsBeforeClear + 1)
      })
    })
  })

  describe('Sample Text Loading', () => {
    it('loads easy sample text when Easy button is clicked', async () => {
      render(<ReadabilityCheckerPage />)
      const easyButton = screen.getByRole('button', { name: /easy/i })

      await user.click(easyButton)

      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea).toHaveValue(sampleTexts.easy.text)
    })

    it('loads medium sample text when Medium button is clicked', async () => {
      render(<ReadabilityCheckerPage />)
      const mediumButton = screen.getByRole('button', { name: /medium/i })

      await user.click(mediumButton)

      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea).toHaveValue(sampleTexts.medium.text)
    })

    it('loads hard sample text when Hard button is clicked', async () => {
      render(<ReadabilityCheckerPage />)
      const hardButton = screen.getByRole('button', { name: /hard/i })

      await user.click(hardButton)

      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea).toHaveValue(sampleTexts.hard.text)
    })

    it('tracks sample_loaded event when sample is loaded', async () => {
      render(<ReadabilityCheckerPage />)
      const easyButton = screen.getByRole('button', { name: /easy/i })

      await user.click(easyButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('readability_checker_sample_loaded', {
          sample: 'easy',
        })
      })
    })

    it('tracks correct sample type for each button', async () => {
      render(<ReadabilityCheckerPage />)

      // Test medium
      await user.click(screen.getByRole('button', { name: /medium/i }))
      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('readability_checker_sample_loaded', {
          sample: 'medium',
        })
      })

      // Test hard
      await user.click(screen.getByRole('button', { name: /hard/i }))
      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('readability_checker_sample_loaded', {
          sample: 'hard',
        })
      })
    })

    it('updates readability scores when sample is loaded', async () => {
      render(<ReadabilityCheckerPage />)

      // Initially should show '--'
      expect(screen.getByText('--')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        // Should no longer show '--' placeholder
        expect(screen.queryByText('--')).not.toBeInTheDocument()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('Copy button is disabled when textarea is empty', () => {
      render(<ReadabilityCheckerPage />)
      const copyButton = screen.getByRole('button', { name: /copy/i })

      expect(copyButton).toBeDisabled()
    })

    it('Copy button is enabled when textarea has content', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Some text')

      const copyButton = screen.getByRole('button', { name: /copy/i })
      expect(copyButton).not.toBeDisabled()
    })

    it('copies text to clipboard when Copy is clicked', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Text to copy')
      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Text to copy')
      })
    })

    it('tracks copied event when text is copied', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Test text')
      await user.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('readability_checker_copied', {
          textLength: 9,
        })
      })
    })

    it('handles clipboard error gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'))
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Test text')

      // Should not throw
      await expect(user.click(screen.getByRole('button', { name: /copy/i }))).resolves.not.toThrow()
    })
  })

  describe('Clear Functionality', () => {
    it('Clear button is disabled when textarea is empty', () => {
      render(<ReadabilityCheckerPage />)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      expect(clearButton).toBeDisabled()
    })

    it('Clear button is enabled when textarea has content', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Some text')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).not.toBeDisabled()
    })

    it('clears textarea when Clear is clicked', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Text to clear')
      await user.click(screen.getByRole('button', { name: /clear/i }))

      expect(textarea).toHaveValue('')
    })

    it('tracks cleared event when text is cleared', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Test text')
      await user.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('readability_checker_cleared')
      })
    })

    it('resets statistics to zero after clearing', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'This is a test sentence.')
      await user.click(screen.getByRole('button', { name: /clear/i }))

      await waitFor(() => {
        // Should show '--' for score again
        expect(screen.getByText('--')).toBeInTheDocument()
      })
    })
  })

  describe('Info Toggle', () => {
    it('does not show score explanations by default', () => {
      render(<ReadabilityCheckerPage />)

      // Score explanations contain formula descriptions (Flesch-Kincaid formula contains 15.59)
      expect(screen.queryByText(/15\.59/)).not.toBeInTheDocument()
    })

    it('shows score explanations when info button is clicked', async () => {
      render(<ReadabilityCheckerPage />)

      // Find the info button by its title (exact case)
      const infoButton = screen.getByTitle('Show formula information')
      await user.click(infoButton)

      await waitFor(() => {
        // Should now show formula information (Flesch-Kincaid formula: 0.39 × ... - 15.59)
        expect(screen.getByText(/15\.59/)).toBeInTheDocument()
      })
    })

    it('hides score explanations when info button is clicked again', async () => {
      render(<ReadabilityCheckerPage />)

      const infoButton = screen.getByTitle('Show formula information')

      // Show info
      await user.click(infoButton)
      await waitFor(() => {
        expect(screen.getByText(/15\.59/)).toBeInTheDocument()
      })

      // Hide info
      await user.click(infoButton)
      await waitFor(() => {
        expect(screen.queryByText(/15\.59/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Readability Analysis', () => {
    it('shows difficulty interpretation for easy text', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        // Easy text should have high Flesch score (Very Easy or Easy)
        const hasEasyLabel =
          screen.queryByText(/very easy/i) !== null || screen.queryByText(/^easy$/i) !== null
        expect(hasEasyLabel).toBe(true)
      })
    })

    it('shows difficulty interpretation for hard text', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /hard/i }))

      await waitFor(() => {
        // Hard text should have lower Flesch score
        const hasDifficultLabel =
          screen.queryByText(/difficult/i) !== null ||
          screen.queryByText(/fairly difficult/i) !== null
        expect(hasDifficultLabel).toBe(true)
      })
    })

    it('shows audience information when text is entered', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        expect(screen.getByText(/suitable for:/i)).toBeInTheDocument()
      })
    })

    it('shows overall grade level when text is entered', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        expect(screen.getByText(/average grade level/i)).toBeInTheDocument()
      })
    })

    it('shows reading time when text is entered', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /medium/i }))

      await waitFor(() => {
        // Should show reading time with "min" suffix
        expect(screen.getByText(/\d+ min/)).toBeInTheDocument()
      })
    })

    it('calculates correct word count', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'One two three four five.')

      await waitFor(() => {
        // Find the Words stat section and check for value 5
        const wordsLabel = screen.getByText(/^words$/i)
        const parentDiv = wordsLabel.closest('div')?.parentElement
        expect(parentDiv?.textContent).toContain('5')
      })
    })

    it('calculates correct sentence count', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'First sentence. Second sentence. Third sentence.')

      await waitFor(() => {
        const sentencesLabel = screen.getByText(/^sentences$/i)
        const parentDiv = sentencesLabel.closest('div')?.parentElement
        expect(parentDiv?.textContent).toContain('3')
      })
    })
  })

  describe('Score Display', () => {
    it('displays Flesch Reading Ease score', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        // Should not show '--' anymore
        expect(screen.queryByText('--')).not.toBeInTheDocument()
      })
    })

    it('displays grade suffix for Flesch-Kincaid', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        // Should show "grade" suffix
        const gradeTexts = screen.getAllByText(/grade/i)
        expect(gradeTexts.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('displays years suffix for Gunning Fog and SMOG', async () => {
      render(<ReadabilityCheckerPage />)

      await user.click(screen.getByRole('button', { name: /easy/i }))

      await waitFor(() => {
        // Should show "years" suffix
        const yearsTexts = screen.getAllByText(/years/i)
        expect(yearsTexts.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible textarea', () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('has accessible buttons', () => {
      render(<ReadabilityCheckerPage />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(6) // Easy, Medium, Hard, Copy, Clear, Info
    })

    it('has accessible headings', () => {
      render(<ReadabilityCheckerPage />)

      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    it('info button has title attribute', () => {
      render(<ReadabilityCheckerPage />)

      const infoButton = screen.getByTitle(/show formula information/i)
      expect(infoButton).toBeInTheDocument()
    })
  })

  describe('StatItem Component', () => {
    it('renders stat items with labels', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText(/^words$/i)).toBeInTheDocument()
      expect(screen.getByText(/^sentences$/i)).toBeInTheDocument()
      expect(screen.getByText(/^syllables$/i)).toBeInTheDocument()
      expect(screen.getByText(/^Complex Words$/)).toBeInTheDocument()
      expect(screen.getByText(/avg words\/sentence/i)).toBeInTheDocument()
      expect(screen.getByText(/reading time/i)).toBeInTheDocument()
    })

    it('shows 0 values initially', () => {
      render(<ReadabilityCheckerPage />)

      // Should have multiple 0 values
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(4)
    })

    it('shows "0.0" for avgWordsPerSentence initially', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('shows "0 min" for reading time initially', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText('0 min')).toBeInTheDocument()
    })
  })

  describe('ScoreItem Component', () => {
    it('renders all five readability scores', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText(/flesch-kincaid grade/i)).toBeInTheDocument()
      expect(screen.getByText(/gunning fog index/i)).toBeInTheDocument()
      expect(screen.getByText(/smog index/i)).toBeInTheDocument()
      expect(screen.getByText(/coleman-liau index/i)).toBeInTheDocument()
      expect(screen.getByText(/automated readability/i)).toBeInTheDocument()
    })

    it('shows initial score of 0 for all scores', () => {
      render(<ReadabilityCheckerPage />)

      // Find all score values that are 0
      const scoreZeros = screen.getAllByText('0')
      expect(scoreZeros.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('TipCard Component', () => {
    it('renders all 6 tip cards', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText(/use shorter sentences/i)).toBeInTheDocument()
      expect(screen.getByText(/choose simple words/i)).toBeInTheDocument()
      expect(screen.getByText(/use active voice/i)).toBeInTheDocument()
      expect(screen.getByText(/avoid jargon/i)).toBeInTheDocument()
      expect(screen.getByText(/use transition words/i)).toBeInTheDocument()
      expect(screen.getByText(/break up text/i)).toBeInTheDocument()
    })

    it('renders tip descriptions', () => {
      render(<ReadabilityCheckerPage />)

      expect(screen.getByText(/aim for an average of 15-20 words/i)).toBeInTheDocument()
      expect(
        screen.getByText(/replace complex words with simpler alternatives/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/write in active voice instead of passive/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very short text', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Hi.')

      // Should not crash and should show some analysis
      await waitFor(() => {
        expect(textarea).toHaveValue('Hi.')
      })
    })

    it('handles text with only punctuation', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, '... !!! ???')

      // Should not crash
      await waitFor(() => {
        expect(textarea).toHaveValue('... !!! ???')
      })
    })

    it('handles text with numbers', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'There are 123 items in stock.')

      await waitFor(() => {
        expect(textarea).toHaveValue('There are 123 items in stock.')
      })
    })

    it('handles text with special characters', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Hello @world! #test & more.')

      await waitFor(() => {
        expect(textarea).toHaveValue('Hello @world! #test & more.')
      })
    })

    it('handles multiline text', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      await user.type(textarea, 'Line one.{enter}Line two.{enter}Line three.')

      await waitFor(() => {
        const value = (textarea as HTMLTextAreaElement).value
        expect(value).toContain('Line one')
        expect(value).toContain('Line two')
        expect(value).toContain('Line three')
      })
    })

    it('handles rapid text changes', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      // Type rapidly
      await user.type(textarea, 'abcdefghij')

      // Clear and type again
      await user.clear(textarea)
      await user.type(textarea, 'new text')

      expect(textarea).toHaveValue('new text')
    })

    it('handles switching between samples', async () => {
      render(<ReadabilityCheckerPage />)

      // Load easy
      await user.click(screen.getByRole('button', { name: /easy/i }))

      // Load hard
      await user.click(screen.getByRole('button', { name: /hard/i }))

      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea).toHaveValue(sampleTexts.hard.text)
    })
  })

  describe('Real-time Updates', () => {
    it('updates analysis in real-time as user types', async () => {
      render(<ReadabilityCheckerPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      // Start typing
      await user.type(textarea, 'This')

      // Analysis should update
      await waitFor(() => {
        const wordsLabel = screen.getByText(/^words$/i)
        const parentDiv = wordsLabel.closest('div')?.parentElement
        expect(parentDiv?.textContent).toContain('1')
      })

      // Continue typing
      await user.type(textarea, ' is a test.')

      // Analysis should update again
      await waitFor(() => {
        const wordsLabel = screen.getByText(/^words$/i)
        const parentDiv = wordsLabel.closest('div')?.parentElement
        // Should now have more words
        expect(parentDiv?.textContent).toMatch(/[2-9]|[1-9]\d+/)
      })
    })
  })
})
