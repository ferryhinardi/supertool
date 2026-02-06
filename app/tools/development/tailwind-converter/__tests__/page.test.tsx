import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TailwindConverter from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock hooks and components
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion" />,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools" />,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating" />,
}))

vi.mock('@/components/ui/tool-search', () => ({
  ToolSearch: () => <div data-testid="tool-search" />,
}))

// Note: localStorage is already mocked in vitest.setup.ts with a LocalStorageMock class
// We spy on the localStorage object directly (not Storage.prototype) for assertions

// Spies for localStorage methods - will be set up in beforeEach
let getItemSpy: ReturnType<typeof vi.spyOn>
let setItemSpy: ReturnType<typeof vi.spyOn>
let removeItemSpy: ReturnType<typeof vi.spyOn>

describe('TailwindConverter', () => {
  beforeEach(() => {
    // Reset mock call history
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    vi.mocked(toast.info).mockClear()

    // Clear localStorage (this is also done in vitest.setup.ts but we do it here for explicitness)
    localStorage.clear()

    // Set up spies on localStorage object directly (not Storage.prototype)
    // because vitest.setup.ts creates a LocalStorageMock class instance
    getItemSpy = vi.spyOn(localStorage, 'getItem')
    setItemSpy = vi.spyOn(localStorage, 'setItem')
    removeItemSpy = vi.spyOn(localStorage, 'removeItem')

    // Reset clipboard spy (already set up by vitest.setup.ts)
    vi.mocked(navigator.clipboard.writeText).mockClear()
  })

  afterEach(() => {
    // Restore spies
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    removeItemSpy.mockRestore()
  })

  // ============================================================================
  // PAGE RENDERING TESTS
  // ============================================================================
  describe('Page Rendering', () => {
    it('renders the page title', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Tailwind CSS Converter')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<TailwindConverter />)
      expect(
        screen.getByText(/Convert your CSS properties to Tailwind utility classes instantly/i)
      ).toBeInTheDocument()
    })

    it('renders the CSS input textarea', () => {
      render(<TailwindConverter />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders the Clear button', () => {
      render(<TailwindConverter />)
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('renders the Copy button', () => {
      render(<TailwindConverter />)
      expect(screen.getByRole('button', { name: /copy tailwind classes/i })).toBeInTheDocument()
    })

    it('renders CSS examples section', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('CSS Examples')).toBeInTheDocument()
    })

    it('renders FAQ accordion', () => {
      render(<TailwindConverter />)
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
    })

    it('renders related tools', () => {
      render(<TailwindConverter />)
      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
    })

    it('renders tool rating', () => {
      render(<TailwindConverter />)
      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
    })

    it('renders tool search', () => {
      render(<TailwindConverter />)
      expect(screen.getByTestId('tool-search')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - DISPLAY PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Display Properties', () => {
    it('converts display: flex to flex', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })
    })

    it('converts display: grid to grid', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: grid;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('grid')
      })
    })

    it('converts display: block to block', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: block;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('block')
      })
    })

    it('converts display: inline to inline', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: inline;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('inline')
      })
    })

    it('converts display: inline-block to inline-block', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: inline-block;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('inline-block')
      })
    })

    it('converts display: inline-flex to inline-flex', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: inline-flex;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('inline-flex')
      })
    })

    it('converts display: none to hidden', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: none;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('hidden')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - FLEXBOX PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Flexbox Properties', () => {
    it('converts flex-direction: column to flex-col', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'flex-direction: column;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex-col')
      })
    })

    it('converts flex-direction: row to flex-row', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'flex-direction: row;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex-row')
      })
    })

    it('converts justify-content: center to justify-center', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'justify-content: center;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('justify-center')
      })
    })

    it('converts justify-content: space-between to justify-between', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'justify-content: space-between;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('justify-between')
      })
    })

    it('converts align-items: center to items-center', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'align-items: center;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('items-center')
      })
    })

    it('converts align-items: flex-start to items-start', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'align-items: flex-start;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('items-start')
      })
    })

    it('converts flex-wrap: wrap to flex-wrap', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'flex-wrap: wrap;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex-wrap')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - GAP PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Gap Properties', () => {
    it('converts gap: 16px to gap-4', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'gap: 16px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('gap-4')
      })
    })

    it('converts gap: 24px to gap-6', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'gap: 24px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('gap-6')
      })
    })

    it('converts gap: 8px to gap-2', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'gap: 8px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('gap-2')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - PADDING PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Padding Properties', () => {
    it('converts padding: 16px to p-4', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'padding: 16px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('p-4')
      })
    })

    it('converts padding: 24px to p-6', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'padding: 24px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('p-6')
      })
    })

    it('converts padding: 8px to p-2', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'padding: 8px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('p-2')
      })
    })

    it('converts padding: 32px to p-8', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'padding: 32px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('p-8')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - MARGIN PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Margin Properties', () => {
    it('converts margin: 0 to m-0', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'margin: 0;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('m-0')
      })
    })

    it('converts margin: 16px to m-4', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'margin: 16px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('m-4')
      })
    })

    it('converts margin: auto to m-auto', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'margin: auto;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('m-auto')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - WIDTH PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Width Properties', () => {
    it('converts width: 100% to w-full', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'width: 100%;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('w-full')
      })
    })

    it('converts max-width: fit-content to max-w-fit', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'max-width: fit-content;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('max-w-fit')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - TYPOGRAPHY PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Typography Properties', () => {
    it('converts font-size: 18px to text-lg', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'font-size: 18px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('text-lg')
      })
    })

    it('converts font-weight: 600 to font-semibold', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'font-weight: 600;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('font-semibold')
      })
    })

    it('converts font-weight: 500 to font-medium', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'font-weight: 500;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('font-medium')
      })
    })

    it('converts text-align: center to text-center', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'text-align: center;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('text-center')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - COLOR PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Color Properties', () => {
    it('converts color: black to text-black', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'color: black;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('text-black')
      })
    })

    it('converts background-color: white to bg-white', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'background-color: white;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('bg-white')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - BORDER PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Border Properties', () => {
    it('converts border-radius: 8px to rounded-lg', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'border-radius: 8px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('rounded-lg')
      })
    })

    it('converts border-radius: 6px to rounded-md', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'border-radius: 6px;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('rounded-md')
      })
    })

    it('converts border: 1px solid to border', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'border: 1px solid;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('border')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - OVERFLOW PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Overflow Properties', () => {
    it('converts overflow: hidden to overflow-hidden', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'overflow: hidden;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('overflow-hidden')
      })
    })

    it('converts overflow: auto to overflow-auto', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'overflow: auto;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('overflow-auto')
      })
    })
  })

  // ============================================================================
  // CSS CONVERSION TESTS - CURSOR PROPERTIES
  // ============================================================================
  describe('CSS to Tailwind Conversion - Cursor Properties', () => {
    it('converts cursor: pointer to cursor-pointer', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'cursor: pointer;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('cursor-pointer')
      })
    })
  })

  // ============================================================================
  // CSS EXAMPLES TESTS
  // ============================================================================
  describe('CSS Examples', () => {
    it('renders Flexbox Center example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Flexbox Center')).toBeInTheDocument()
    })

    it('renders Card Style example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Card Style')).toBeInTheDocument()
    })

    it('renders Typography example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Typography')).toBeInTheDocument()
    })

    it('renders Layout Box example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Layout Box')).toBeInTheDocument()
    })

    it('renders Button Style example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Button Style')).toBeInTheDocument()
    })

    it('renders Grid Layout example', () => {
      render(<TailwindConverter />)
      expect(screen.getByText('Grid Layout')).toBeInTheDocument()
    })

    it('loads example when clicked', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const flexboxExample = screen.getByText('Flexbox Center')
      await user.click(flexboxExample)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Example loaded')
      })
    })
  })

  // ============================================================================
  // CLEAR AND COPY TESTS
  // ============================================================================
  describe('Clear and Copy Functionality', () => {
    it('clears input when Clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })
    })

    it('shows toast when clearing input', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Input cleared')
      })
    })

    it('copies Tailwind classes to clipboard', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })

      const copyButton = screen.getByRole('button', { name: /copy tailwind classes/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Tailwind classes copied!')
      })
    })

    it('copy button is disabled when there is no output', () => {
      render(<TailwindConverter />)

      const copyButton = screen.getByRole('button', { name: /copy tailwind classes/i })
      expect(copyButton).toBeDisabled()
    })
  })

  // ============================================================================
  // HISTORY TESTS
  // ============================================================================
  describe('History Functionality', () => {
    it('renders conversion history section when history exists', () => {
      // Set up history in localStorage BEFORE rendering
      const history = [
        {
          id: '1',
          cssInput: 'display: flex;',
          tailwindOutput: 'flex',
          timestamp: Date.now(),
        },
      ]
      localStorage.setItem('tailwind-converter-history', JSON.stringify(history))

      render(<TailwindConverter />)
      expect(screen.getByText('Conversion History')).toBeInTheDocument()
    })

    it('saves conversion to history when copying', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })

      const copyButton = screen.getByRole('button', { name: /copy tailwind classes/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          'tailwind-converter-history',
          expect.stringContaining('flex')
        )
      })
    })

    it('loads history from localStorage on mount', () => {
      const history = [
        {
          id: '1',
          cssInput: 'display: flex;',
          tailwindOutput: 'flex',
          timestamp: Date.now(),
        },
      ]
      localStorage.setItem('tailwind-converter-history', JSON.stringify(history))

      render(<TailwindConverter />)

      expect(getItemSpy).toHaveBeenCalledWith('tailwind-converter-history')
    })

    it('clears history when Clear History button is clicked', async () => {
      const user = userEvent.setup()
      const history = [
        {
          id: '1',
          cssInput: 'display: flex;',
          tailwindOutput: 'flex',
          timestamp: Date.now(),
        },
      ]
      localStorage.setItem('tailwind-converter-history', JSON.stringify(history))

      render(<TailwindConverter />)

      // The history section has a "Clear" button (not "Clear History")
      // We need to find the one in the history section by looking for the history title first
      const historySection = screen.getByText('Conversion History').closest('article')
      const clearHistoryButton = historySection
        ? within(historySection).getByRole('button', { name: /clear/i })
        : screen.getAllByRole('button', { name: /clear/i })[1] // fallback to second clear button

      await user.click(clearHistoryButton)

      await waitFor(() => {
        // handleClearHistory uses localStorage.removeItem, not setItem
        expect(removeItemSpy).toHaveBeenCalledWith('tailwind-converter-history')
      })
    })
  })

  // ============================================================================
  // STATISTICS TESTS
  // ============================================================================
  describe('Statistics Display', () => {
    it('shows total properties count', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;\njustify-content: center;')

      await waitFor(() => {
        // Look for the badge showing "X properties" with role="status"
        const badges = screen.getAllByText(/properties/i)
        const propertyBadge = badges.find(
          (el) =>
            el.getAttribute('role') === 'status' && /\d+\s*properties/i.test(el.textContent || '')
        )
        expect(propertyBadge).toBeInTheDocument()
      })
    })

    it('shows converted properties count', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex;')

      await waitFor(() => {
        expect(screen.getByText(/converted/i)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // EDGE CASES TESTS
  // ============================================================================
  describe('Edge Cases', () => {
    it('handles empty input gracefully', () => {
      render(<TailwindConverter />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('')
    })

    it('handles CSS comments', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '/* comment */ display: flex;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })
    })

    it('handles CSS with extra whitespace', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '  display:   flex  ;  ')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })
    })

    it('handles CSS without semicolons', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })
    })

    it('handles multiple properties on same line', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: flex; gap: 16px;')

      await waitFor(() => {
        const output = screen.getByTestId('tailwind-output')
        expect(output).toHaveTextContent('flex')
        expect(output).toHaveTextContent('gap-4')
      })
    })

    it('handles unrecognized CSS values', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'display: unknown-value;')

      await waitFor(() => {
        // The component shows "{stats.failed} manual" badge with role="status"
        // There's also a note "Property not recognized or value needs manual conversion"
        // We look for the badge specifically
        const manualElements = screen.getAllByText(/manual/i)
        const manualBadge = manualElements.find(
          (el) => el.getAttribute('role') === 'status' && /\d+\s*manual/i.test(el.textContent || '')
        )
        expect(manualBadge).toBeInTheDocument()
      })
    })

    it('handles rem units', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'padding: 1rem;')

      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('p-4')
      })
    })
  })

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration Tests', () => {
    it('full workflow: load example -> convert -> copy', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      // Load example
      const flexboxExample = screen.getByText('Flexbox Center')
      await user.click(flexboxExample)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Example loaded')
      })

      // Check conversion result
      await waitFor(() => {
        const output = screen.getByTestId('tailwind-output')
        expect(output).toHaveTextContent('flex')
        expect(output).toHaveTextContent('justify-center')
        expect(output).toHaveTextContent('items-center')
        expect(output).toHaveTextContent('gap-4')
      })

      // Copy to clipboard
      const copyButton = screen.getByRole('button', { name: /copy tailwind classes/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Tailwind classes copied!')
      })
    })

    it('full workflow: type -> clear -> type again', async () => {
      const user = userEvent.setup()
      render(<TailwindConverter />)

      const textarea = screen.getByRole('textbox')

      // Type first CSS
      await user.type(textarea, 'display: flex;')
      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('flex')
      })

      // Clear
      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)
      await waitFor(() => {
        expect(textarea).toHaveValue('')
      })

      // Type second CSS
      await user.type(textarea, 'display: grid;')
      await waitFor(() => {
        expect(screen.getByTestId('tailwind-output')).toHaveTextContent('grid')
      })
    })
  })
})
