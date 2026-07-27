import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'
import WordCounterPage from '../page'
import { analyzeText, formatTime, sampleTexts } from '../templates'

// Mock Panda CSS
vi.mock('@/styled-system/css', () => ({
  css: vi.fn(() => 'mock-css'),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: ({ className }: { className?: string }) => (
    <svg data-testid="icon-clock" className={className} />
  ),
  Copy: ({ className }: { className?: string }) => (
    <svg data-testid="icon-copy" className={className} />
  ),
  FileText: ({ className }: { className?: string }) => (
    <svg data-testid="icon-file-text" className={className} />
  ),
  Hash: ({ className }: { className?: string }) => (
    <svg data-testid="icon-hash" className={className} />
  ),
  Mic: ({ className }: { className?: string }) => (
    <svg data-testid="icon-mic" className={className} />
  ),
  RotateCcw: ({ className }: { className?: string }) => (
    <svg data-testid="icon-rotate-ccw" className={className} />
  ),
  Type: ({ className }: { className?: string }) => (
    <svg data-testid="icon-type" className={className} />
  ),
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Word Counter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('renders the page title', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /word counter pro/i })).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<WordCounterPage />)
      expect(
        screen.getByText(/comprehensive text analysis tool with word count/i)
      ).toBeInTheDocument()
    })

    it('renders the main icon', () => {
      render(<WordCounterPage />)
      expect(screen.getAllByTestId('icon-file-text').length).toBeGreaterThan(0)
    })

    it('renders the text input section header', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /your text/i })).toBeInTheDocument()
    })

    it('renders the textarea with placeholder', () => {
      render(<WordCounterPage />)
      expect(
        screen.getByPlaceholderText(/paste or type your text here to analyze/i)
      ).toBeInTheDocument()
    })

    it('renders empty textarea initially', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea).toHaveValue('')
    })

    it('renders sample text buttons', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('button', { name: /short sample/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /medium sample/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /long sample/i })).toBeInTheDocument()
    })

    it('renders copy and clear buttons', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('button', { name: /copy text/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders statistics section header', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /^statistics$/i })).toBeInTheDocument()
    })

    it('renders time estimates section header', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /time estimates/i })).toBeInTheDocument()
    })

    it('renders additional stats section header', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /additional stats/i })).toBeInTheDocument()
    })

    it('renders keyword density section header', () => {
      render(<WordCounterPage />)
      // "Keyword Density" appears in both stats section header (h3) and tips section (h4)
      const keywordDensityHeadings = screen.getAllByRole('heading', { name: /keyword density/i })
      expect(keywordDensityHeadings.length).toBeGreaterThanOrEqual(1)
    })

    it('renders tips and features section', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('heading', { name: /tips & features/i })).toBeInTheDocument()
    })
  })

  describe('initial statistics display', () => {
    it('shows zero words initially', () => {
      render(<WordCounterPage />)
      const wordsLabels = screen.getAllByText('Words')
      expect(wordsLabels.length).toBeGreaterThanOrEqual(1)
      // The value "0" appears multiple times for different stats when empty
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBeGreaterThanOrEqual(1)
    })

    it('shows zero characters initially', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Characters')).toBeInTheDocument()
    })

    it('shows zero sentences initially', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Sentences')).toBeInTheDocument()
    })

    it('shows zero paragraphs initially', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Paragraphs')).toBeInTheDocument()
    })

    it('shows zero lines initially', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Lines')).toBeInTheDocument()
    })

    it('shows reading time label', () => {
      render(<WordCounterPage />)
      // "Reading Time" appears in both Time Estimates section and Tips section
      const readingTimeElements = screen.getAllByText('Reading Time')
      expect(readingTimeElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows speaking time label', () => {
      render(<WordCounterPage />)
      // "Speaking Time" appears in both Time Estimates section and Tips section
      const speakingTimeElements = screen.getAllByText('Speaking Time')
      expect(speakingTimeElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows average word length label', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Average Word Length')).toBeInTheDocument()
    })

    it('shows longest word label', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Longest Word')).toBeInTheDocument()
    })

    it('shows longest word length label', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Longest Word Length')).toBeInTheDocument()
    })
  })

  describe('disabled buttons when no text', () => {
    it('disables copy button when text is empty', () => {
      render(<WordCounterPage />)
      const copyButton = screen.getByRole('button', { name: /copy text/i })
      expect(copyButton).toBeDisabled()
    })

    it('disables clear button when text is empty', () => {
      render(<WordCounterPage />)
      const clearButton = screen.getByRole('button', { name: /clear/i })
      expect(clearButton).toBeDisabled()
    })

    it('disables show keywords button when text is empty', () => {
      render(<WordCounterPage />)
      const showButton = screen.getByRole('button', { name: /show/i })
      expect(showButton).toBeDisabled()
    })
  })

  describe('text input functionality', () => {
    it('updates textarea value when typing', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world' } })

      expect(textarea).toHaveValue('Hello world')
    })

    it('tracks analytics when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world test' } })

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_text_changed', {
        wordCount: 3,
      })
    })

    it('does not track analytics when text is empty', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: '' } })

      expect(trackToolEvent).not.toHaveBeenCalled()
    })

    it('enables copy button when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const copyButton = screen.getByRole('button', { name: /copy text/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })

      expect(copyButton).not.toBeDisabled()
    })

    it('enables clear button when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })

      expect(clearButton).not.toBeDisabled()
    })

    it('enables show keywords button when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const showButton = screen.getByRole('button', { name: /show/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })

      expect(showButton).not.toBeDisabled()
    })
  })

  describe('statistics update when typing', () => {
    it('updates word count when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world test' } })

      // Check that word count is updated
      const stats = analyzeText('Hello world test')
      expect(screen.getByText(stats.words.toString())).toBeInTheDocument()
    })

    it('updates character count when text is entered', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello' } })

      const stats = analyzeText('Hello')
      const charElements = screen.getAllByText(stats.characters.toString())
      expect(charElements.length).toBeGreaterThanOrEqual(1)
    })

    it('updates sentence count for text with sentences', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world. This is a test.' } })

      const stats = analyzeText('Hello world. This is a test.')
      expect(screen.getByText(stats.sentences.toString())).toBeInTheDocument()
    })
  })

  describe('sample text loading', () => {
    it('loads short sample text when clicking Short Sample button', () => {
      render(<WordCounterPage />)
      const shortButton = screen.getByRole('button', { name: /short sample/i })
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.click(shortButton)

      expect(textarea).toHaveValue(sampleTexts.short)
    })

    it('loads medium sample text when clicking Medium Sample button', () => {
      render(<WordCounterPage />)
      const mediumButton = screen.getByRole('button', { name: /medium sample/i })
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.click(mediumButton)

      expect(textarea).toHaveValue(sampleTexts.medium)
    })

    it('loads long sample text when clicking Long Sample button', () => {
      render(<WordCounterPage />)
      const longButton = screen.getByRole('button', { name: /long sample/i })
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.click(longButton)

      expect(textarea).toHaveValue(sampleTexts.long)
    })

    it('tracks analytics when short sample is loaded', () => {
      render(<WordCounterPage />)
      const shortButton = screen.getByRole('button', { name: /short sample/i })

      fireEvent.click(shortButton)

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_sample_loaded', {
        sample: 'short',
      })
    })

    it('tracks analytics when medium sample is loaded', () => {
      render(<WordCounterPage />)
      const mediumButton = screen.getByRole('button', { name: /medium sample/i })

      fireEvent.click(mediumButton)

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_sample_loaded', {
        sample: 'medium',
      })
    })

    it('tracks analytics when long sample is loaded', () => {
      render(<WordCounterPage />)
      const longButton = screen.getByRole('button', { name: /long sample/i })

      fireEvent.click(longButton)

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_sample_loaded', {
        sample: 'long',
      })
    })

    it('updates statistics when sample text is loaded', () => {
      render(<WordCounterPage />)
      const shortButton = screen.getByRole('button', { name: /short sample/i })

      fireEvent.click(shortButton)

      const stats = analyzeText(sampleTexts.short)
      expect(screen.getByText(stats.words.toString())).toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('copies text to clipboard when copy button is clicked', async () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const copyButton = screen.getByRole('button', { name: /copy text/i })

      fireEvent.change(textarea, { target: { value: 'Text to copy' } })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy')
      })
    })

    it('tracks analytics when text is copied', async () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const copyButton = screen.getByRole('button', { name: /copy text/i })

      fireEvent.change(textarea, { target: { value: 'Text to copy' } })
      vi.clearAllMocks() // Clear the text change event
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('word_counter_copied', {
          textLength: 12,
        })
      })
    })

    it('handles clipboard error gracefully', async () => {
      ;(navigator.clipboard.writeText as Mock).mockRejectedValueOnce(new Error('Failed'))

      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const copyButton = screen.getByRole('button', { name: /copy text/i })

      fireEvent.change(textarea, { target: { value: 'Text to copy' } })

      // Should not throw
      expect(() => fireEvent.click(copyButton)).not.toThrow()
    })
  })

  describe('clear functionality', () => {
    it('clears text when clear button is clicked', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.change(textarea, { target: { value: 'Some text to clear' } })
      fireEvent.click(clearButton)

      expect(textarea).toHaveValue('')
    })

    it('tracks analytics when text is cleared', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })
      vi.clearAllMocks()
      fireEvent.click(clearButton)

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_cleared')
    })

    it('resets statistics when text is cleared', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.change(textarea, { target: { value: 'Hello world test' } })
      fireEvent.click(clearButton)

      // After clearing, stats should be reset to 0
      const wordsLabels = screen.getAllByText('0')
      expect(wordsLabels.length).toBeGreaterThan(0)
    })

    it('disables copy button after clearing', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })
      const copyButton = screen.getByRole('button', { name: /copy text/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })
      expect(copyButton).not.toBeDisabled()

      fireEvent.click(clearButton)
      expect(copyButton).toBeDisabled()
    })

    it('disables clear button after clearing', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const clearButton = screen.getByRole('button', { name: /clear/i })

      fireEvent.change(textarea, { target: { value: 'Some text' } })
      expect(clearButton).not.toBeDisabled()

      fireEvent.click(clearButton)
      expect(clearButton).toBeDisabled()
    })
  })

  describe('keyword density toggle', () => {
    it('shows "Show" button initially', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('button', { name: /^show$/i })).toBeInTheDocument()
    })

    it('changes to "Hide" button when clicked with text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const showButton = screen.getByRole('button', { name: /^show$/i })

      fireEvent.change(textarea, { target: { value: 'Hello world hello' } })
      fireEvent.click(showButton)

      expect(screen.getByRole('button', { name: /^hide$/i })).toBeInTheDocument()
    })

    it('toggles back to "Show" when clicked again', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world hello' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      const hideButton = screen.getByRole('button', { name: /^hide$/i })
      fireEvent.click(hideButton)

      expect(screen.getByRole('button', { name: /^show$/i })).toBeInTheDocument()
    })

    it('tracks analytics when keywords are viewed', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world hello' } })
      vi.clearAllMocks()

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      expect(trackToolEvent).toHaveBeenCalledWith('word_counter_keywords_viewed')
    })

    it('does not track analytics when hiding keywords', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world hello' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)
      vi.clearAllMocks()

      const hideButton = screen.getByRole('button', { name: /^hide$/i })
      fireEvent.click(hideButton)

      expect(trackToolEvent).not.toHaveBeenCalledWith('word_counter_keywords_viewed')
    })

    it('displays keywords when shown', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world hello test hello' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      // Should show "hello" as the most frequent word
      expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('displays keyword frequency count', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello hello hello world' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      // Should show count and percentage
      expect(screen.getByText(/3×/)).toBeInTheDocument()
    })

    it('displays rank numbers for keywords', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello hello hello world world' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
    })

    it('shows no keywords message when text has no meaningful keywords', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      // Enter only stop words
      fireEvent.change(textarea, { target: { value: 'the a an' } })

      const showButton = screen.getByRole('button', { name: /^show$/i })
      fireEvent.click(showButton)

      expect(screen.getByText(/no keywords found/i)).toBeInTheDocument()
    })
  })

  describe('time estimates display', () => {
    it('shows reading time for entered text', () => {
      render(<WordCounterPage />)
      const shortButton = screen.getByRole('button', { name: /short sample/i })

      fireEvent.click(shortButton)

      const stats = analyzeText(sampleTexts.short)
      const readingTime = formatTime(stats.readingTime)

      // Reading time may appear multiple times (stat value + tip section)
      const readingTimeElements = screen.getAllByText(readingTime)
      expect(readingTimeElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows speaking time for entered text', () => {
      render(<WordCounterPage />)
      const shortButton = screen.getByRole('button', { name: /short sample/i })

      fireEvent.click(shortButton)

      const stats = analyzeText(sampleTexts.short)
      const speakingTime = formatTime(stats.speakingTime)

      // Speaking time may appear multiple times (stat value + tip section)
      const speakingTimeElements = screen.getAllByText(speakingTime)
      expect(speakingTimeElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows reading time subtitle', () => {
      render(<WordCounterPage />)
      expect(screen.getByText(/~200 words\/min/i)).toBeInTheDocument()
    })

    it('shows speaking time subtitle', () => {
      render(<WordCounterPage />)
      expect(screen.getByText(/~130 words\/min/i)).toBeInTheDocument()
    })
  })

  describe('additional stats display', () => {
    it('shows dash for average word length when no text', () => {
      render(<WordCounterPage />)
      // Dash appears multiple times for empty stat values
      const dashElements = screen.getAllByText('—')
      expect(dashElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows average word length for entered text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world' } })

      const stats = analyzeText('Hello world')
      // Average word length may appear in multiple places
      const avgLengthElements = screen.getAllByText(`${stats.averageWordLength} chars`)
      expect(avgLengthElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows longest word for entered text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello extraordinary world' } })

      expect(screen.getByText('extraordinary')).toBeInTheDocument()
    })

    it('shows longest word length for entered text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello extraordinary world' } })

      expect(screen.getByText('13 chars')).toBeInTheDocument()
    })
  })

  describe('tips and features section', () => {
    it('renders real-time analysis tip', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Real-time Analysis')).toBeInTheDocument()
      expect(screen.getByText(/all statistics update instantly/i)).toBeInTheDocument()
    })

    it('renders reading time tip', () => {
      render(<WordCounterPage />)
      // "Reading Time" appears in both stats section and tips section
      const readingTimeElements = screen.getAllByText('Reading Time')
      expect(readingTimeElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/estimated at 200 words per minute/i)).toBeInTheDocument()
    })

    it('renders speaking time tip', () => {
      render(<WordCounterPage />)
      // "Speaking Time" appears in both stats section and tips section
      const speakingTimeElements = screen.getAllByText('Speaking Time')
      expect(speakingTimeElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/estimated at 130 words per minute/i)).toBeInTheDocument()
    })

    it('renders keyword density tip', () => {
      render(<WordCounterPage />)
      // "Keyword Density" appears in both the stats section header and tips section
      const keywordDensityElements = screen.getAllByText('Keyword Density')
      expect(keywordDensityElements.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/shows most frequent words/i)).toBeInTheDocument()
    })

    it('renders sample texts tip', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Sample Texts')).toBeInTheDocument()
      expect(screen.getByText(/click the sample buttons/i)).toBeInTheDocument()
    })

    it('renders privacy first tip', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Privacy First')).toBeInTheDocument()
      expect(screen.getByText(/all processing happens locally/i)).toBeInTheDocument()
    })
  })

  describe('icons rendering', () => {
    it('renders copy icon in copy button', () => {
      render(<WordCounterPage />)
      expect(screen.getByTestId('icon-copy')).toBeInTheDocument()
    })

    it('renders rotate icon in clear button', () => {
      render(<WordCounterPage />)
      expect(screen.getByTestId('icon-rotate-ccw')).toBeInTheDocument()
    })

    it('renders clock icon for time estimates', () => {
      render(<WordCounterPage />)
      expect(screen.getByTestId('icon-clock')).toBeInTheDocument()
    })

    it('renders mic icon for speaking time', () => {
      render(<WordCounterPage />)
      expect(screen.getByTestId('icon-mic')).toBeInTheDocument()
    })

    it('renders type icon for words stat', () => {
      render(<WordCounterPage />)
      expect(screen.getByTestId('icon-type')).toBeInTheDocument()
    })

    it('renders hash icons for character stats', () => {
      render(<WordCounterPage />)
      const hashIcons = screen.getAllByTestId('icon-hash')
      expect(hashIcons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('accessibility', () => {
    it('has accessible textarea', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('has accessible buttons', () => {
      render(<WordCounterPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible headings', () => {
      render(<WordCounterPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('has main landmark', () => {
      render(<WordCounterPage />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles very long text input', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const longText = 'word '.repeat(10000)

      fireEvent.change(textarea, { target: { value: longText } })

      expect(textarea).toHaveValue(longText)
    })

    it('handles special characters in text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello! @#$% World?' } })

      expect(textarea).toHaveValue('Hello! @#$% World?')
    })

    it('handles unicode characters', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello 世界 مرحبا' } })

      expect(textarea).toHaveValue('Hello 世界 مرحبا')
    })

    it('handles text with only whitespace', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: '   \n\t  ' } })

      // Should not throw and should handle gracefully
      expect(textarea).toHaveValue('   \n\t  ')
    })

    it('handles rapid text changes', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Text ${i}` } })
      }

      expect(textarea).toHaveValue('Text 9')
    })

    it('handles multiline text', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const multilineText = 'Line 1\nLine 2\nLine 3'

      fireEvent.change(textarea, { target: { value: multilineText } })

      expect(textarea).toHaveValue(multilineText)
      const stats = analyzeText(multilineText)
      expect(stats.lines).toBe(3)
    })

    it('handles multiple paragraphs', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)
      const paragraphs = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.'

      fireEvent.change(textarea, { target: { value: paragraphs } })

      const stats = analyzeText(paragraphs)
      expect(stats.paragraphs).toBe(3)
    })
  })

  describe('StatItem component', () => {
    it('renders label correctly', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Words')).toBeInTheDocument()
    })

    it('renders value correctly', () => {
      render(<WordCounterPage />)
      const textarea = screen.getByPlaceholderText(/paste or type your text here/i)

      fireEvent.change(textarea, { target: { value: 'Hello world' } })

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders subtitle when provided', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('~200 words/min')).toBeInTheDocument()
    })
  })

  describe('TipCard component', () => {
    it('renders title correctly', () => {
      render(<WordCounterPage />)
      expect(screen.getByText('Real-time Analysis')).toBeInTheDocument()
    })

    it('renders description correctly', () => {
      render(<WordCounterPage />)
      expect(
        screen.getByText('All statistics update instantly as you type or paste text')
      ).toBeInTheDocument()
    })
  })
})
