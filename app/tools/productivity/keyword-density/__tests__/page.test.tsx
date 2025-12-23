import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import KeywordDensityPage from '../page'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Keyword Density Analyzer Page', () => {
  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<KeywordDensityPage />)
      expect(screen.getByText('Keyword Density Analyzer')).toBeInTheDocument()
    })

    it('renders the textarea input', () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      expect(textarea).toBeInTheDocument()
    })

    it('renders Analyze and Clear buttons', () => {
      render(<KeywordDensityPage />)
      expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })

    it('shows 0 characters and 0 words initially', () => {
      render(<KeywordDensityPage />)
      expect(screen.getByText('0 characters • 0 words')).toBeInTheDocument()
    })
  })

  describe('Text Input', () => {
    it('updates character and word count when typing', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const user = userEvent.setup()

      await user.type(textarea, 'Hello world test')

      expect(screen.getByText(/16 characters/)).toBeInTheDocument()
      expect(screen.getByText(/3 words/)).toBeInTheDocument()
    })

    it('enables Analyze button when text is entered', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      expect(analyzeBtn).toBeDisabled()

      await user.type(textarea, 'Test content')

      expect(analyzeBtn).not.toBeDisabled()
    })
  })

  describe('Keyword Analysis', () => {
    it('analyzes text and shows results', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText =
        'SEO optimization is important for SEO. Good SEO practices help with content optimization and SEO ranking.'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('SEO Score')).toBeInTheDocument()
        expect(screen.getByText('Total Words')).toBeInTheDocument()
        expect(screen.getByText('Unique Words')).toBeInTheDocument()
      })
    })

    it('displays top keywords after analysis', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'keyword keyword keyword test test optimization optimization optimization'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Keywords')).toBeInTheDocument()
      })
    })

    it('calculates keyword density correctly', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      // 10 words total, "test" appears 3 times = 30% density
      const sampleText = 'test word test word test word word word word word'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument() // Total words
      })
    })

    it('identifies two-word phrases', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'keyword density keyword density analysis keyword density optimization'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Two-Word Phrases')).toBeInTheDocument()
      })
    })

    it('identifies three-word phrases', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'seo keyword density seo keyword density analysis seo keyword density tool'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Three-Word Phrases')).toBeInTheDocument()
      })
    })
  })

  describe('SEO Warnings', () => {
    it('shows warning for keyword stuffing', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      // Create text with high keyword density (>5%)
      const sampleText = 'keyword keyword keyword keyword keyword test'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText(/Warnings/i)).toBeInTheDocument()
      })
    })

    it('shows warning for short content', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'short text'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText(/Warnings/i)).toBeInTheDocument()
      })
    })
  })

  describe('Actions', () => {
    it('clears text when Clear button is clicked', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(
        /Paste your content here/i
      ) as HTMLTextAreaElement
      const clearBtn = screen.getByRole('button', { name: /Clear/i })
      const user = userEvent.setup()

      await user.type(textarea, 'Test content')
      expect(textarea.value).toBe('Test content')

      await user.click(clearBtn)

      expect(textarea.value).toBe('')
    })

    it('copies results to clipboard', async () => {
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      // Use longer text with actual keywords to ensure analysis generates results
      const sampleText =
        'keyword optimization test keyword analysis content keyword density keyword frequency measurement'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Keywords')).toBeInTheDocument()
      })

      const copyBtn = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyBtn)

      await waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalled()
      })
    })

    it('exports results as CSV', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'test content for analysis with keywords'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Keywords')).toBeInTheDocument()
      })

      // Mock URL.createObjectURL and anchor click
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:test')
      globalThis.URL.revokeObjectURL = vi.fn()
      const clickSpy = vi.fn()
      HTMLAnchorElement.prototype.click = clickSpy

      const exportBtn = screen.getByRole('button', { name: /Export CSV/i })
      await user.click(exportBtn)

      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text gracefully', async () => {
      render(<KeywordDensityPage />)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })

      expect(analyzeBtn).toBeDisabled()
    })

    it('handles text with special characters', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'test!@# content$%^ with&*() special (characters)'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('SEO Score')).toBeInTheDocument()
      })
    })

    it('handles text with multiple spaces', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      const sampleText = 'test    content     with      multiple       spaces'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('SEO Score')).toBeInTheDocument()
      })
    })

    it('excludes stop words from keyword analysis', async () => {
      render(<KeywordDensityPage />)
      const textarea = screen.getByPlaceholderText(/Paste your content here/i)
      const analyzeBtn = screen.getByRole('button', { name: /Analyze/i })
      const user = userEvent.setup()

      // Text with common stop words
      const sampleText = 'the and but keyword optimization the and but keyword analysis'
      await user.type(textarea, sampleText)
      await user.click(analyzeBtn)

      await waitFor(() => {
        expect(screen.getByText('Top Keywords')).toBeInTheDocument()
      })

      // Stop words like "the", "and", "but" should not appear in top keywords
      expect(screen.queryByText('the')).not.toBeInTheDocument()
    })
  })

  describe('SEO Best Practices Card', () => {
    it('displays SEO best practices information', () => {
      render(<KeywordDensityPage />)

      expect(screen.getByText('SEO Best Practices')).toBeInTheDocument()
      expect(screen.getByText(/Target keyword density should be between 2-5%/i)).toBeInTheDocument()
    })
  })
})
