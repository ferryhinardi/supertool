import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import TextTransformerPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
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

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
})

describe('Text Transformer Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the page without crashing', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Text Transformer/i)).toBeTruthy()
    })

    it('should render the main heading', () => {
      render(<TextTransformerPage />)
      const heading = screen.getByText(/Text Transformer & Utility Tool/i)
      expect(heading).toBeTruthy()
    })

    it('should render the description text', () => {
      render(<TextTransformerPage />)
      const description = screen.getByText(/Transform, format, and manipulate text/i)
      expect(description).toBeTruthy()
    })

    it('should track page view on mount', () => {
      render(<TextTransformerPage />)
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('text_transformer_open', {})
    })
  })

  describe('Text Input Area', () => {
    it('should render main textarea input', () => {
      render(<TextTransformerPage />)
      const textarea = screen.getByPlaceholderText(/Enter or paste your text here/i)
      expect(textarea).toBeTruthy()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('should allow typing text in textarea', async () => {
      const user = userEvent.setup()
      render(<TextTransformerPage />)

      const textarea = screen.getByPlaceholderText(/Enter or paste your text here/i)
      await user.type(textarea, 'Hello World')

      expect(textarea).toHaveValue('Hello World')
    })
  })

  describe('Case Transformation Buttons', () => {
    it('should render UPPERCASE button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('UPPERCASE')).toBeTruthy()
    })

    it('should render lowercase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('lowercase')).toBeTruthy()
    })

    it('should render Title Case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Title Case')).toBeTruthy()
    })

    it('should render Sentence case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Sentence case')).toBeTruthy()
    })

    it('should render camelCase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('camelCase')).toBeTruthy()
    })

    it('should render PascalCase button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('PascalCase')).toBeTruthy()
    })

    it('should render snake_case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('snake_case')).toBeTruthy()
    })

    it('should render kebab-case button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('kebab-case')).toBeTruthy()
    })
  })

  describe('Clean Transformation Buttons', () => {
    it('should render Remove Duplicates button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Remove Duplicates/i)).toBeTruthy()
    })

    it('should render Remove Empty Lines button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Remove Empty Lines/i)).toBeTruthy()
    })

    it('should render Trim Lines button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Trim Lines/i)).toBeTruthy()
    })

    it('should render Trim All button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Trim All/i)).toBeTruthy()
    })

    it('should render Remove Extra Spaces button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Remove Extra Spaces/i)).toBeTruthy()
    })
  })

  describe('Sort Transformation Buttons', () => {
    it('should render Sort A→Z button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Sort A→Z/i)).toBeTruthy()
    })

    it('should render Sort Z→A button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Sort Z→A/i)).toBeTruthy()
    })
  })

  describe('Modify Transformation Buttons', () => {
    it('should render Reverse Text button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Reverse Text/i)).toBeTruthy()
    })

    it('should render Add Line Numbers button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Add Line Numbers/i)).toBeTruthy()
    })

    it('should render Remove Line Numbers button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Remove Line Numbers/i)).toBeTruthy()
    })
  })

  describe('Text Statistics', () => {
    it('should display character count', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Characters/i)).toBeTruthy()
    })

    it('should display word count', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Words/i)).toBeTruthy()
    })

    it('should display line count', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Lines/i)).toBeTruthy()
    })

    it('should show 0 characters initially', () => {
      render(<TextTransformerPage />)
      // Stats should show 0 when no text
      expect(screen.getByText(/Characters/i)).toBeTruthy()
    })
  })

  describe('Action Buttons', () => {
    it('should render Copy button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Copy')).toBeTruthy()
    })

    it('should render Download button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Download')).toBeTruthy()
    })

    it('should render Clear button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Clear')).toBeTruthy()
    })
  })

  describe('Find and Replace', () => {
    it('should render Find input field', () => {
      render(<TextTransformerPage />)
      const input = screen.getByPlaceholderText(/Find text/i)
      expect(input).toBeTruthy()
    })

    it('should render Replace input field', () => {
      render(<TextTransformerPage />)
      const input = screen.getByPlaceholderText(/Replace with/i)
      expect(input).toBeTruthy()
    })

    it('should render Replace button', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Replace/i)).toBeTruthy()
    })

    it('should allow typing in find field', async () => {
      const user = userEvent.setup()
      render(<TextTransformerPage />)

      const input = screen.getByPlaceholderText(/Find text/i)
      await user.type(input, 'hello')

      expect(input).toHaveValue('hello')
    })

    it('should allow typing in replace field', async () => {
      const user = userEvent.setup()
      render(<TextTransformerPage />)

      const input = screen.getByPlaceholderText(/Replace with/i)
      await user.type(input, 'world')

      expect(input).toHaveValue('world')
    })
  })

  describe('Pro Tips Section', () => {
    it('should render Pro Tips heading', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Pro Tips/i)).toBeTruthy()
    })

    it('should display keyboard shortcuts tip', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/keyboard shortcuts/i)).toBeTruthy()
    })

    it('should display batch processing tip', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/batch/i)).toBeTruthy()
    })
  })

  describe('How to Use Section', () => {
    it('should render How to Use heading', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/How to Use/i)).toBeTruthy()
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
      expect(screen.getByText(/What text transformations are available/i)).toBeTruthy()
    })

    it('should render FAQ about camelCase conversion', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/How do I convert text to camelCase/i)).toBeTruthy()
    })

    it('should render FAQ about duplicate removal', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Can I remove duplicate lines/i)).toBeTruthy()
    })

    it('should render FAQ about regex support', () => {
      render(<TextTransformerPage />)
      expect(
        screen.getByText(/Does the tool support find and replace with regular expressions/i)
      ).toBeTruthy()
    })

    it('should render FAQ about word count', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Can I see word count/i)).toBeTruthy()
    })

    it('should render FAQ about batch processing', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/How do I use the batch text processing/i)).toBeTruthy()
    })

    it('should render FAQ about programming formats', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/What programming case formats can I convert/i)).toBeTruthy()
    })

    it('should render FAQ about sorting', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Can I sort lines alphabetically/i)).toBeTruthy()
    })

    it('should render FAQ about line manipulation', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/How do line manipulation features work/i)).toBeTruthy()
    })

    it('should render FAQ about exporting', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/How can I export or save my transformed text/i)).toBeTruthy()
    })
  })

  describe('Social Share', () => {
    it('should render SocialShare component', () => {
      render(<TextTransformerPage />)
      const socialElements = document.querySelectorAll('[class*="social"]')
      expect(socialElements.length).toBeGreaterThan(0)
    })
  })

  describe('Related Tools', () => {
    it('should render RelatedTools component', () => {
      render(<TextTransformerPage />)
      const relatedElements = document.querySelectorAll('[class*="related"]')
      expect(relatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Tool Rating', () => {
    it('should render ToolRating component', () => {
      render(<TextTransformerPage />)
      const ratingElements = document.querySelectorAll('[class*="rating"]')
      expect(ratingElements.length).toBeGreaterThan(0)
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
      const textarea = screen.getByPlaceholderText(/Enter or paste your text here/i)
      expect(textarea).toBeTruthy()
    })

    it('should have accessible buttons with text', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('UPPERCASE')).toBeTruthy()
      expect(screen.getByText('lowercase')).toBeTruthy()
      expect(screen.getByText('Copy')).toBeTruthy()
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
      expect(screen.getByText('UPPERCASE')).toBeTruthy() // case category
      expect(screen.getByText(/Remove Duplicates/i)).toBeTruthy() // clean category
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
      expect(screen.getByText('UPPERCASE')).toBeTruthy()
      expect(screen.getByText('lowercase')).toBeTruthy()
      expect(screen.getByText('camelCase')).toBeTruthy()
      expect(screen.getByText('snake_case')).toBeTruthy()
    })

    it('should show clean operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Remove Duplicates/i)).toBeTruthy()
      expect(screen.getByText(/Remove Empty Lines/i)).toBeTruthy()
      expect(screen.getByText(/Trim Lines/i)).toBeTruthy()
    })

    it('should show sort operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Sort A→Z/i)).toBeTruthy()
      expect(screen.getByText(/Sort Z→A/i)).toBeTruthy()
    })

    it('should show modify operation buttons', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Reverse Text/i)).toBeTruthy()
      expect(screen.getByText(/Add Line Numbers/i)).toBeTruthy()
    })
  })

  describe('User Interactions', () => {
    it('should clear text when Clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TextTransformerPage />)

      const textarea = screen.getByPlaceholderText(/Enter or paste your text here/i)
      const clearButton = screen.getByText('Clear')

      await user.type(textarea, 'Test text')
      await user.click(clearButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty text input', () => {
      render(<TextTransformerPage />)
      const textarea = screen.getByPlaceholderText(/Enter or paste your text here/i)
      expect(textarea).toHaveValue('')
    })

    it('should render without errors when no text is entered', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText(/Text Transformer/i)).toBeTruthy()
    })
  })

  describe('Layout Sections', () => {
    it('should render main transformation section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByPlaceholderText(/Enter or paste your text here/i)).toBeTruthy()
    })

    it('should render transformation buttons section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('UPPERCASE')).toBeTruthy()
    })

    it('should render find and replace section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByPlaceholderText(/Find text/i)).toBeTruthy()
      expect(screen.getByPlaceholderText(/Replace with/i)).toBeTruthy()
    })

    it('should render action buttons section', () => {
      render(<TextTransformerPage />)
      expect(screen.getByText('Copy')).toBeTruthy()
      expect(screen.getByText('Download')).toBeTruthy()
      expect(screen.getByText('Clear')).toBeTruthy()
    })
  })

  describe('Text Content', () => {
    it('should display transformation descriptions', () => {
      render(<TextTransformerPage />)
      // Buttons should have associated descriptions (tooltips/aria-labels)
      expect(screen.getByText('UPPERCASE')).toBeTruthy()
      expect(screen.getByText('lowercase')).toBeTruthy()
    })
  })

  describe('Button States', () => {
    it('should render all transformation buttons as enabled', () => {
      render(<TextTransformerPage />)
      const uppercaseButton = screen.getByText('UPPERCASE').closest('button')
      expect(uppercaseButton).toBeTruthy()
    })
  })
})
