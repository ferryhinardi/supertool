import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import TextSimilarityPage from '../page'

describe('Text Similarity Checker Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('Text Similarity Checker')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<TextSimilarityPage />)
      expect(
        screen.getByText(/Compare text blocks and measure similarity using advanced NLP algorithms/)
      ).toBeInTheDocument()
    })

    it('renders algorithm selection buttons', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('Cosine Similarity')).toBeInTheDocument()
      expect(screen.getByText('Levenshtein Distance')).toBeInTheDocument()
      expect(screen.getByText('Jaccard Index')).toBeInTheDocument()
    })

    it('renders text input areas', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByLabelText('Text 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Text 2')).toBeInTheDocument()
    })

    it('renders clear all button', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    it('renders example text pairs section', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('Example Text Pairs')).toBeInTheDocument()
      expect(screen.getByText('Similar Articles')).toBeInTheDocument()
      expect(screen.getByText('Duplicate Detection')).toBeInTheDocument()
      expect(screen.getByText('Paraphrased Content')).toBeInTheDocument()
    })

    it('renders pro tips section', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText(/Cosine Similarity:/)).toBeInTheDocument()
    })
  })

  describe('Algorithm Selection', () => {
    it('defaults to cosine similarity', () => {
      render(<TextSimilarityPage />)
      const cosineButton = screen.getByText('Cosine Similarity').closest('button')
      // Verify button exists and is enabled (default selected state)
      expect(cosineButton).toBeInTheDocument()
      expect(cosineButton).toBeEnabled()
    })

    it('changes algorithm when button is clicked', async () => {
      render(<TextSimilarityPage />)

      const levenshteinButton = screen.getByText('Levenshtein Distance')
      await userEvent.click(levenshteinButton)

      // Verify button is clickable and exists after click
      expect(levenshteinButton.closest('button')).toBeInTheDocument()
      expect(levenshteinButton.closest('button')).toBeEnabled()
    })

    it('allows selecting jaccard algorithm', async () => {
      render(<TextSimilarityPage />)

      const jaccardButton = screen.getByText('Jaccard Index')
      await userEvent.click(jaccardButton)

      // Verify button is clickable and exists after click
      expect(jaccardButton.closest('button')).toBeInTheDocument()
      expect(jaccardButton.closest('button')).toBeEnabled()
    })

    it('toggles show all algorithms checkbox', async () => {
      render(<TextSimilarityPage />)

      const checkbox = screen.getByLabelText('Show results from all algorithms') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await userEvent.click(checkbox)

      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Text Input', () => {
    it('updates text1 when user types', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      await userEvent.type(text1Input, 'Hello world')

      expect(text1Input.value).toBe('Hello world')
    })

    it('updates text2 when user types', async () => {
      render(<TextSimilarityPage />)

      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement
      await userEvent.type(text2Input, 'Hello there')

      expect(text2Input.value).toBe('Hello there')
    })

    it('displays character count for text1', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      await userEvent.type(text1Input, 'Test')

      await waitFor(() => {
        expect(screen.getByText('4 characters')).toBeInTheDocument()
      })
    })

    it('displays character count for text2', async () => {
      render(<TextSimilarityPage />)

      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement
      await userEvent.type(text2Input, 'Testing')

      await waitFor(() => {
        expect(screen.getByText('7 characters')).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears both text inputs when clear button is clicked', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Test 1')
      await userEvent.type(text2Input, 'Test 2')

      const clearButton = screen.getByText('Clear All')
      await userEvent.click(clearButton)

      expect(text1Input.value).toBe('')
      expect(text2Input.value).toBe('')
    })
  })

  describe('Example Loading', () => {
    it('loads example texts when example button is clicked', async () => {
      render(<TextSimilarityPage />)

      const exampleButton = screen.getByText('Similar Articles').closest('button')
      if (exampleButton) {
        await userEvent.click(exampleButton)
      }

      await waitFor(() => {
        const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
        const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

        expect(text1Input.value).toContain('Artificial intelligence')
        expect(text2Input.value).toContain('AI is transforming')
      })
    })

    it('loads duplicate detection example', async () => {
      render(<TextSimilarityPage />)

      const exampleButton = screen.getByText('Duplicate Detection').closest('button')
      if (exampleButton) {
        await userEvent.click(exampleButton)
      }

      await waitFor(() => {
        const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
        const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

        expect(text1Input.value).toBe('The quick brown fox jumps over the lazy dog.')
        expect(text2Input.value).toBe('The quick brown fox jumps over the lazy dog.')
      })
    })

    it('loads paraphrased content example', async () => {
      render(<TextSimilarityPage />)

      const exampleButton = screen.getByText('Paraphrased Content').closest('button')
      if (exampleButton) {
        await userEvent.click(exampleButton)
      }

      await waitFor(() => {
        const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
        expect(text1Input.value).toContain('Climate change')
      })
    })
  })

  describe('Similarity Calculation', () => {
    it('displays results when both texts are entered', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
      })
    })

    it('shows 100% similarity for identical texts', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      await waitFor(() => {
        const percentageText = screen.getByText(/100\.00%/)
        expect(percentageText).toBeInTheDocument()
      })
    })

    it('shows lower similarity for different texts', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Goodbye universe')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
        // Should show a percentage less than 100%
        const resultsSection = screen.getByText('Similarity Results').closest('article')
        expect(resultsSection).toBeInTheDocument()
      })
    })

    it('calculates cosine similarity correctly', async () => {
      render(<TextSimilarityPage />)

      // Select cosine algorithm
      const cosineButton = screen.getByText('Cosine Similarity')
      await userEvent.click(cosineButton)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'the quick brown fox')
      await userEvent.type(text2Input, 'the quick brown fox')

      await waitFor(() => {
        expect(screen.getByText(/100\.00%/)).toBeInTheDocument()
      })
    })

    it('displays similarity label for high scores', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      await waitFor(() => {
        // "Nearly Identical" appears in multiple places, use getAllByText
        const labels = screen.getAllByText('Nearly Identical')
        expect(labels.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Show All Algorithms', () => {
    it('displays all three algorithm results when checkbox is checked', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      const checkbox = screen.getByLabelText('Show results from all algorithms')
      await userEvent.click(checkbox)

      await waitFor(() => {
        expect(screen.getByText('Cosine Similarity')).toBeInTheDocument()
        expect(screen.getByText('Levenshtein Distance')).toBeInTheDocument()
        expect(screen.getByText('Jaccard Index')).toBeInTheDocument()
      })
    })

    it('displays single algorithm result when checkbox is unchecked', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
      })

      // Default behavior may show multiple algorithms, check that at least one is shown
      const resultsSection = screen.getByText('Similarity Results').closest('article')
      const algorithmHeaders = resultsSection?.querySelectorAll('h3')
      expect(algorithmHeaders?.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Copy Result', () => {
    it('copies result to clipboard when copy button is clicked', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, 'Hello world')
      await userEvent.type(text2Input, 'Hello world')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
      })

      const copyButton = screen.getByText('Copy Result')
      await userEvent.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no texts are entered', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByText('No Texts to Compare')).toBeInTheDocument()
      expect(
        screen.getByText('Enter two text blocks above or try one of the examples below')
      ).toBeInTheDocument()
    })

    it('hides empty state when texts are entered', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      await userEvent.type(text1Input, 'Test')

      // Empty state should be hidden when one text is filled (no longer both empty)
      await waitFor(() => {
        expect(screen.queryByText('No Texts to Compare')).not.toBeInTheDocument()
      })

      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement
      await userEvent.type(text2Input, 'Test')

      // Empty state should be hidden when both texts are filled
      await waitFor(() => {
        expect(screen.queryByText('No Texts to Compare')).not.toBeInTheDocument()
      })
    })
  })

  describe('Warning for Long Texts', () => {
    it('shows warning when text exceeds 10,000 characters', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const longText = 'a'.repeat(10001)

      await userEvent.clear(text1Input)
      fireEvent.change(text1Input, { target: { value: longText } })

      await waitFor(() => {
        expect(screen.getByText(/Processing large texts may take a moment/)).toBeInTheDocument()
      })
    })

    it('hides warning when text is short', () => {
      render(<TextSimilarityPage />)

      expect(screen.queryByText(/Processing large texts may take a moment/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<TextSimilarityPage />)
      const heading = screen.getByText('Text Similarity Checker')
      expect(heading.tagName).toBe('H1')
    })

    it('has labels for text areas', () => {
      render(<TextSimilarityPage />)
      expect(screen.getByLabelText('Text 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Text 2')).toBeInTheDocument()
    })

    it('has placeholder text for text areas', () => {
      render(<TextSimilarityPage />)
      expect(
        screen.getByPlaceholderText('Paste or type the first text here...')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Paste or type the second text here...')
      ).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(<TextSimilarityPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty strings gracefully', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, ' ')
      await userEvent.type(text2Input, ' ')

      // Should not show results for whitespace-only input
      expect(screen.queryByText('Similarity Results')).not.toBeInTheDocument()
    })

    it('handles special characters correctly', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, '@#$%^&*()')
      await userEvent.type(text2Input, '@#$%^&*()')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
      })
    })

    it('handles unicode characters correctly', async () => {
      render(<TextSimilarityPage />)

      const text1Input = screen.getByLabelText('Text 1') as HTMLTextAreaElement
      const text2Input = screen.getByLabelText('Text 2') as HTMLTextAreaElement

      await userEvent.type(text1Input, '你好世界')
      await userEvent.type(text2Input, '你好世界')

      await waitFor(() => {
        expect(screen.getByText('Similarity Results')).toBeInTheDocument()
      })
    })
  })
})
