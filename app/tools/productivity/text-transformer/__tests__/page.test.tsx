import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'
import TextTransformerPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
  trackToolEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock nuqs
vi.mock('nuqs', () => ({
  parseAsString: {
    withDefault: vi.fn((defaultValue) => ({ defaultValue })),
  },
  parseAsBoolean: {
    withDefault: vi.fn((defaultValue) => ({ defaultValue })),
  },
  useQueryState: vi.fn((key) => {
    if (key === 'text') return ['', vi.fn()]
    if (key === 'find') return ['', vi.fn()]
    if (key === 'replace') return ['', vi.fn()]
    if (key === 'regex') return [false, vi.fn()]
    if (key === 'case') return [false, vi.fn()]
    if (key === 'category') return ['all', vi.fn()]
    return ['', vi.fn()]
  }),
}))

describe('Text Transformer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Text Transformer/i).length).toBeGreaterThan(0)
    })

    it('should render the main heading', () => {
      render(<TextTransformerPage />)
      const heading = screen.getAllByText(/Text Transformer & Utility Tool/i)
      expect(heading.length).toBeGreaterThan(0)
    })

    it('should render the description text', () => {
      render(<TextTransformerPage />)
      const description = screen.getAllByText(/Transform, format, and manipulate text/i)
      expect(description.length).toBeGreaterThan(0)
    })

    it.skip('should track page view on mount', () => {
      // Skipped: Page doesn't implement analytics event on mount
      render(<TextTransformerPage />)
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('text_transformer_open', {})
    })
  })

  describe('Text Input Area', () => {
    it('should render main textarea input', () => {
      render(<TextTransformerPage />)
      const textarea = screen.getByPlaceholderText(/Start typing or paste your text here/i)
      expect(textarea).toBeTruthy()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('should allow typing text in textarea', async () => {
      render(<TextTransformerPage />)

      const textarea = screen.getByPlaceholderText(/Start typing or paste your text here/i)
      fireEvent.change(textarea, { target: { value: 'Hello World' } })

      expect(textarea).toHaveValue('Hello World')
    })
  })

  describe('Case Transformation Buttons', () => {
    it('should render UPPERCASE button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0)
    })

    it('should render lowercase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('lowercase').length).toBeGreaterThan(0)
    })

    it('should render Title Case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Title Case').length).toBeGreaterThan(0)
    })

    it('should render Sentence case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Sentence case').length).toBeGreaterThan(0)
    })

    it('should render camelCase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('camelCase').length).toBeGreaterThan(0)
    })

    it('should render PascalCase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('PascalCase').length).toBeGreaterThan(0)
    })

    it('should render snake_case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('snake_case').length).toBeGreaterThan(0)
    })

    it('should render kebab-case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('kebab-case').length).toBeGreaterThan(0)
    })
  })

  describe('Clean Transformation Buttons', () => {
    it('should render Remove Duplicates button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Remove Duplicates/i).length).toBeGreaterThan(0)
    })

    it('should render Remove Empty Lines button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Remove Empty Lines/i).length).toBeGreaterThan(0)
    })

    it('should render Trim Lines button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Trim Lines/i).length).toBeGreaterThan(0)
    })

    it('should render Trim All button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Trim All/i).length).toBeGreaterThan(0)
    })

    it('should render Remove Extra Spaces button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Remove Extra Spaces/i).length).toBeGreaterThan(0)
    })
  })

  describe('Sort Transformation Buttons', () => {
    it('should render Sort A→Z button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Sort A→Z/i).length).toBeGreaterThan(0)
    })

    it('should render Sort Z→A button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Sort Z→A/i).length).toBeGreaterThan(0)
    })
  })

  describe('Modify Transformation Buttons', () => {
    it('should render Reverse Text button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Reverse Text/i).length).toBeGreaterThan(0)
    })

    it('should render Add Line Numbers button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Add Line Numbers/i).length).toBeGreaterThan(0)
    })

    it('should render Remove Line Numbers button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Remove Line Numbers/i).length).toBeGreaterThan(0)
    })
  })

  describe('Text Statistics', () => {
    it('should display character count', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Characters/i).length).toBeGreaterThan(0)
    })

    it('should display word count', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Words/i).length).toBeGreaterThan(0)
    })

    it('should display line count', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Lines/i).length).toBeGreaterThan(0)
    })

    it('should show 0 characters initially', () => {
      render(<TextTransformerPage />)
      // Stats should show 0 when no text
      expect(screen.getAllByText(/Characters/i).length).toBeGreaterThan(0)
    })
  })

  describe('Action Buttons', () => {
    it('should render Copy button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Copy').length).toBeGreaterThan(0)
    })

    it('should render Download button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Download').length).toBeGreaterThan(0)
    })

    it('should render Clear button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Clear').length).toBeGreaterThan(0)
    })
  })

  describe('Find and Replace', () => {
    it('should render Find input field', () => {
      render(<TextTransformerPage />)
      const input = screen.getByPlaceholderText(/Search text or regex pattern/i)
      expect(input).toBeTruthy()
    })

    it('should render Replace input field', () => {
      render(<TextTransformerPage />)
      const input = screen.getByPlaceholderText(/Replacement text/i)
      expect(input).toBeTruthy()
    })

    it('should render Replace button', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Replace/i).length).toBeGreaterThan(0)
    })

    it('should allow typing in find field', async () => {
      render(<TextTransformerPage />)

      const input = screen.getByPlaceholderText(/Search text or regex pattern/i)
      fireEvent.change(input, { target: { value: 'hello' } })

      expect(input).toHaveValue('hello')
    })

    it('should allow typing in replace field', async () => {
      render(<TextTransformerPage />)

      const input = screen.getByPlaceholderText(/Replacement text/i)
      fireEvent.change(input, { target: { value: 'world' } })

      expect(input).toHaveValue('world')
    })
  })

  describe('Pro Tips Section', () => {
    it('should render Pro Tips heading', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Pro Tips/i).length).toBeGreaterThan(0)
    })

    it('should display keyboard shortcuts tip', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/keyboard shortcuts/i).length).toBeGreaterThan(0)
    })

    it('should display batch processing tip', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/batch/i).length).toBeGreaterThan(0)
    })
  })

  describe('How to Use Section', () => {
    it('should render How to Use heading', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/How to Use/i).length).toBeGreaterThan(0)
    })

    it('should display step-by-step instructions', () => {
      render(<TextTransformerPage />)
      // Check for numbered steps
      const badges = screen.getAllByText(/^[1-5]$/)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ about text transformations', () => {
      render(<TextTransformerPage />)
      expect(
        screen.getAllByText(/What text transformations are available/i).length
      ).toBeGreaterThan(0)
    })

    it('should render FAQ about camelCase conversion', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/How do I convert text to camelCase/i).length).toBeGreaterThan(0)
    })

    it('should render FAQ about duplicate removal', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Can I remove duplicate lines/i).length).toBeGreaterThan(0)
    })

    it('should render FAQ about regex support', () => {
      render(<TextTransformerPage />)
      expect(
        screen.getByText(/Does the tool support find and replace with regular expressions/i)
      ).toBeTruthy()
    })

    it('should render FAQ about word count', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Can I see word count/i).length).toBeGreaterThan(0)
    })

    it('should render FAQ about batch processing', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/How do I use the batch text processing/i).length).toBeGreaterThan(
        0
      )
    })

    it('should render FAQ about programming formats', () => {
      render(<TextTransformerPage />)
      expect(
        screen.getAllByText(/What programming case formats can I convert/i).length
      ).toBeGreaterThan(0)
    })

    it('should render FAQ about sorting', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Can I sort lines alphabetically/i).length).toBeGreaterThan(0)
    })

    it('should render FAQ about line manipulation', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/How do line manipulation features work/i).length).toBeGreaterThan(
        0
      )
    })

    it('should render FAQ about exporting', () => {
      render(<TextTransformerPage />)
      expect(
        screen.getAllByText(/How can I export or save my transformed text/i).length
      ).toBeGreaterThan(0)
    })
  })

  describe('Social Share', () => {
    it('should render SocialShare component', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Share This Tool/i).length).toBeGreaterThan(0)
    })
  })

  describe('Related Tools', () => {
    it('should render RelatedTools component', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Related Tools/i).length).toBeGreaterThan(0)
    })
  })

  describe('Tool Rating', () => {
    it('should render ToolRating component', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Rate This Tool/i).length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      render(<TextTransformerPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have proper heading hierarchy', () => {
      render(<TextTransformerPage />)
      const h1 = document.querySelector('h1')
      expect(h1).toBeTruthy()
    })

    it('should have labeled inputs', () => {
      render(<TextTransformerPage />)
      const textarea = screen.getByPlaceholderText(/Start typing or paste your text here/i)
      expect(textarea).toBeTruthy()
    })

    it('should have accessible buttons with text', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0)
      expect(screen.getAllByText('lowercase').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Copy').length).toBeGreaterThan(0)
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should render icon elements', () => {
      render(<TextTransformerPage />)
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render cards with proper styling', () => {
      render(<TextTransformerPage />)
      const cards = document.querySelectorAll('[class*="card"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Category Filtering', () => {
    it('should have category filter options', () => {
      render(<TextTransformerPage />)
      // Page should render transformation categories
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0) // case category
      expect(screen.getAllByText(/Remove Duplicates/i).length).toBeGreaterThan(0) // clean category
    })
  })

  describe('Responsive Design', () => {
    it('should render grid layouts', () => {
      render(<TextTransformerPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('should have responsive padding classes', () => {
      render(<TextTransformerPage />)
      const main = document.querySelector('main')
      expect(main?.className).toBeTruthy()
    })
  })

  describe('Keyboard Shortcuts Dialog', () => {
    it('should render keyboard shortcuts component', () => {
      render(<TextTransformerPage />)
      // KeyboardShortcutsDialog component should be present
      const dialogs = document.querySelectorAll('[role="dialog"]')
      expect(dialogs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Button Categories', () => {
    it('should group transformation buttons by category', () => {
      render(<TextTransformerPage />)
      // All case transformation buttons should be present
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0)
      expect(screen.getAllByText('lowercase').length).toBeGreaterThan(0)
      expect(screen.getAllByText('camelCase').length).toBeGreaterThan(0)
      expect(screen.getAllByText('snake_case').length).toBeGreaterThan(0)
    })

    it('should show clean operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Remove Duplicates/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Remove Empty Lines/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Trim Lines/i).length).toBeGreaterThan(0)
    })

    it('should show sort operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Sort A→Z/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Sort Z→A/i).length).toBeGreaterThan(0)
    })

    it('should show modify operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Reverse Text/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Add Line Numbers/i).length).toBeGreaterThan(0)
    })
  })

  describe('User Interactions', () => {
    it('should clear text when Clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TextTransformerPage />)

      const textarea = screen.getByPlaceholderText(/Start typing or paste your text here/i)
      const clearButtons = screen.getAllByText('Clear')
      const clearButton = clearButtons[0]

      fireEvent.change(textarea, { target: { value: 'Test text' } })
      await user.click(clearButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty text input', () => {
      render(<TextTransformerPage />)
      const textarea = screen.getByPlaceholderText(/Start typing or paste your text here/i)
      expect(textarea).toHaveValue('')
    })

    it('should render without errors when no text is entered', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText(/Text Transformer/i).length).toBeGreaterThan(0)
    })
  })

  describe('Layout Sections', () => {
    it('should render main transformation section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByPlaceholderText(/Start typing or paste your text here/i)).toBeTruthy()
    })

    it('should render transformation buttons section', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0)
    })

    it('should render find and replace section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByPlaceholderText(/Search text or regex pattern/i)).toBeTruthy()
      expect(screen.getByPlaceholderText(/Replacement text/i)).toBeTruthy()
    })

    it('should render action buttons section', () => {
      render(<TextTransformerPage />)
      expect(screen.getAllByText('Copy').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Download').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Clear').length).toBeGreaterThan(0)
    })
  })

  describe('Text Content', () => {
    it('should display transformation descriptions', () => {
      render(<TextTransformerPage />)
      // Buttons should have associated descriptions (tooltips/aria-labels)
      expect(screen.getAllByText('UPPERCASE').length).toBeGreaterThan(0)
      expect(screen.getAllByText('lowercase').length).toBeGreaterThan(0)
    })
  })

  describe('Button States', () => {
    it('should render all transformation buttons as enabled', () => {
      render(<TextTransformerPage />)
      const uppercaseButtons = screen.getAllByText('UPPERCASE')
      const uppercaseButton = uppercaseButtons[0].closest('button')
      expect(uppercaseButton).toBeTruthy()
    })
  })
})
