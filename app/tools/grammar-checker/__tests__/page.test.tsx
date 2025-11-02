import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import GrammarCheckerPage from '../page'

// Mock fetch
global.fetch = vi.fn()

describe('Grammar Checker Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('Grammar & Spell Checker')).toBeInTheDocument()
    })

    it('renders the text input area', () => {
      render(<GrammarCheckerPage />)
      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      expect(textarea).toBeInTheDocument()
    })

    it('renders check grammar button', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('Check Grammar')).toBeInTheDocument()
    })

    it('renders clear button', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('shows character count', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('0 / 10,000 characters')).toBeInTheDocument()
    })

    it('displays pro tips section', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    })
  })

  describe('Text Input', () => {
    it('updates character count when typing', async () => {
      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement

      await userEvent.type(textarea, 'Hello world')

      await waitFor(() => {
        expect(screen.getByText('11 / 10,000 characters')).toBeInTheDocument()
      })
    })

    it('enables check button when text is entered', async () => {
      render(<GrammarCheckerPage />)

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      expect(checkButton).toBeDisabled()

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement

      await userEvent.type(textarea, 'Test text')

      await waitFor(() => {
        expect(checkButton).not.toBeDisabled()
      })
    })

    it('shows warning when text exceeds limit', async () => {
      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement

      const longText = 'a'.repeat(10001)
      fireEvent.change(textarea, { target: { value: longText } })

      await waitFor(() => {
        expect(screen.getByText('Too long')).toBeInTheDocument()
      })
    })

    it('disables check button when text exceeds limit', async () => {
      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement

      const longText = 'a'.repeat(10001)
      fireEvent.change(textarea, { target: { value: longText } })

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement

      await waitFor(() => {
        expect(checkButton).toBeDisabled()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears text when clear button is clicked', async () => {
      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement

      await userEvent.type(textarea, 'Test text')

      const clearButton = screen.getByText('Clear').closest('button') as HTMLButtonElement
      await userEvent.click(clearButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })

    it('disables clear button when no text', () => {
      render(<GrammarCheckerPage />)

      const clearButton = screen.getByText('Clear').closest('button') as HTMLButtonElement
      expect(clearButton).toBeDisabled()
    })
  })

  describe('Grammar Check', () => {
    it('calls API when check button is clicked', async () => {
      const mockResponse = {
        issues: [],
        correctedText: 'Test text',
        summary: {},
        originalLength: 9,
        issueCount: 0,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'Test text')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/grammar-check',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ text: 'Test text' }),
          })
        )
      })
    })

    it('shows loading state during check', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'Test text')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })

    it('displays success message when no issues found', async () => {
      const mockResponse = {
        issues: [],
        correctedText: 'Perfect text',
        summary: {},
        originalLength: 12,
        issueCount: 0,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'Perfect text')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
      })
    })

    it('displays issues when found', async () => {
      const mockResponse = {
        issues: [
          {
            text: 'teh',
            type: 'spelling',
            message: 'Possible spelling mistake',
            suggestion: 'the',
            offset: 0,
            length: 3,
          },
        ],
        correctedText: 'the cat',
        summary: { spelling: 1 },
        originalLength: 7,
        issueCount: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'teh cat')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('Issues Found')).toBeInTheDocument()
        expect(screen.getByText('"teh"')).toBeInTheDocument()
        expect(screen.getByText('spelling')).toBeInTheDocument()
      })
    })

    it('shows corrected text section when issues exist', async () => {
      const mockResponse = {
        issues: [
          {
            text: 'teh',
            type: 'spelling',
            message: 'Possible spelling mistake',
            suggestion: 'the',
            offset: 0,
            length: 3,
          },
        ],
        correctedText: 'the cat',
        summary: { spelling: 1 },
        originalLength: 7,
        issueCount: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'teh cat')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('Corrected Text')).toBeInTheDocument()
        expect(screen.getByText('the cat')).toBeInTheDocument()
      })
    })

    it('handles API errors gracefully', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API error' }),
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'Test text')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('API error')).toBeInTheDocument()
      })
    })
  })

  describe('Issue Interaction', () => {
    it('expands issue details when clicked', async () => {
      const mockResponse = {
        issues: [
          {
            text: 'teh',
            type: 'spelling',
            message: 'Possible spelling mistake',
            suggestion: 'the',
            offset: 0,
            length: 3,
          },
        ],
        correctedText: 'the cat',
        summary: { spelling: 1 },
        originalLength: 7,
        issueCount: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'teh cat')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('"teh"')).toBeInTheDocument()
      })

      const issueCard = screen.getByText('"teh"').closest('div')
      if (issueCard) {
        await userEvent.click(issueCard)
      }

      await waitFor(() => {
        expect(screen.getByText('Possible spelling mistake')).toBeInTheDocument()
        expect(screen.getByText('"the"')).toBeInTheDocument()
        expect(screen.getByText('Apply Fix')).toBeInTheDocument()
      })
    })

    it('applies fix when apply fix button is clicked', async () => {
      const mockResponse = {
        issues: [
          {
            text: 'teh',
            type: 'spelling',
            message: 'Possible spelling mistake',
            suggestion: 'the',
            offset: 0,
            length: 3,
          },
        ],
        correctedText: 'the cat',
        summary: { spelling: 1 },
        originalLength: 7,
        issueCount: 1,
      }

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      render(<GrammarCheckerPage />)

      const textarea = screen.getByPlaceholderText(
        'Start typing or paste your text here...'
      ) as HTMLTextAreaElement
      await userEvent.type(textarea, 'teh cat')

      const checkButton = screen.getByText('Check Grammar').closest('button') as HTMLButtonElement
      await userEvent.click(checkButton)

      await waitFor(() => {
        expect(screen.getByText('"teh"')).toBeInTheDocument()
      })

      // Click to expand
      const issueCard = screen.getByText('"teh"').closest('div')
      if (issueCard) {
        await userEvent.click(issueCard)
      }

      // Click apply fix
      await waitFor(() => {
        const applyButton = screen.getByText('Apply Fix').closest('button')
        if (applyButton) {
          userEvent.click(applyButton)
        }
      })

      await waitFor(() => {
        expect(textarea).toHaveValue('the cat')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<GrammarCheckerPage />)
      const heading = screen.getByText('Grammar & Spell Checker')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive button labels', () => {
      render(<GrammarCheckerPage />)
      expect(screen.getByText('Check Grammar')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('has placeholder text for textarea', () => {
      render(<GrammarCheckerPage />)
      expect(
        screen.getByPlaceholderText('Start typing or paste your text here...')
      ).toBeInTheDocument()
    })
  })
})
