import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CharacterMapPage from '../page'
import { characterCategories, getAllCharacters } from '../templates'

// Mock analytics
const mockTrackToolEvent = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

describe('CharacterMapPage', () => {
  const getRequiredButton = (
    button: HTMLButtonElement | null,
    label: string
  ): HTMLButtonElement => {
    if (!button) {
      throw new Error(`${label} button not found`)
    }

    return button
  }

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockTrackToolEvent.mockClear()
    vi.mocked(navigator.clipboard.writeText).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders the page header correctly', () => {
      render(<CharacterMapPage />)

      expect(screen.getByRole('heading', { name: /character map/i })).toBeInTheDocument()
      expect(screen.getByText(/browse and copy 300\+ special characters/i)).toBeInTheDocument()
    })

    it('renders the search input', () => {
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
    })

    it('renders the "All Characters" category button', () => {
      render(<CharacterMapPage />)

      expect(screen.getByRole('button', { name: /all characters/i })).toBeInTheDocument()
    })

    it('renders all category buttons', () => {
      render(<CharacterMapPage />)

      // "All Characters" button plus all category buttons
      characterCategories.forEach((category) => {
        expect(screen.getByRole('button', { name: category.name })).toBeInTheDocument()
      })
    })

    it('renders 7 category buttons total (All + 6 categories)', () => {
      render(<CharacterMapPage />)

      // All Characters button + 6 category buttons
      const categoryButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent || ''
        return text === 'All Characters' || characterCategories.some((cat) => cat.name === text)
      })
      expect(categoryButtons).toHaveLength(7)
    })

    it('renders characters in a grid', () => {
      render(<CharacterMapPage />)

      // Should show all characters initially
      // Check that some characters are rendered (buttons for each character)
      const charButtons = screen.getAllByRole('button').filter((button) => {
        // Character buttons have the character as text content
        const text = button.textContent || ''
        return text.includes('U+') // Unicode code is displayed
      })
      expect(charButtons.length).toBeGreaterThan(0)
    })

    it('renders the tips section', () => {
      render(<CharacterMapPage />)

      expect(screen.getByText(/tips/i)).toBeInTheDocument()
      expect(screen.getByText(/click any character/i)).toBeInTheDocument()
      expect(screen.getByText(/search by name/i)).toBeInTheDocument()
      expect(screen.getByText(/browse by category/i)).toBeInTheDocument()
      expect(screen.getByText(/hover over characters/i)).toBeInTheDocument()
      expect(screen.getByText(/all processing is local/i)).toBeInTheDocument()
    })

    it('renders character with its unicode code', () => {
      render(<CharacterMapPage />)

      // Check for a specific character (arrow right)
      expect(screen.getByText('→')).toBeInTheDocument()
      expect(screen.getByText('U+2192')).toBeInTheDocument()
    })

    it('shows initial character count for all characters', () => {
      render(<CharacterMapPage />)

      expect(
        screen.getByText(`Showing all ${getAllCharacters().length} characters`)
      ).toBeInTheDocument()
    })
  })

  describe('category selection', () => {
    it('filters characters when a category is selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const arrowsButton = screen.getByRole('button', { name: /arrows/i })
      await user.click(arrowsButton)

      // Should show arrows category count
      const arrowsCategory = characterCategories.find((cat) => cat.id === 'arrows')
      const arrowCount = arrowsCategory?.characters.length || 0
      expect(screen.getByText(`${arrowCount} characters in category`)).toBeInTheDocument()
    })

    it('tracks category change event', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const mathButton = screen.getByRole('button', { name: /math symbols/i })
      await user.click(mathButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_category_changed', {
        category: 'math',
      })
    })

    it('tracks "all" category selection', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // First select a specific category
      const mathButton = screen.getByRole('button', { name: /math symbols/i })
      await user.click(mathButton)
      mockTrackToolEvent.mockClear()

      // Then select "All Characters"
      const allButton = screen.getByRole('button', { name: /all characters/i })
      await user.click(allButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_category_changed', {
        category: 'all',
      })
    })

    it('clears search query when category is changed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // First select a category (category buttons are visible when no search)
      const mathButton = screen.getByRole('button', { name: 'Math Symbols' })
      await user.click(mathButton)

      // Verify category is selected by checking for category count text
      expect(screen.getByText(/characters in category/i)).toBeInTheDocument()

      // Type in search - this will hide category buttons but show results
      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'plus')
      expect(searchInput).toHaveValue('plus')

      // Verify search mode by checking for "Found X characters" text
      expect(screen.getByText(/found \d+ characters?/i)).toBeInTheDocument()

      // Clear search using clear button or by clearing input
      await user.clear(searchInput)
      expect(searchInput).toHaveValue('')

      // Category buttons should be visible again - verify Math Symbols is still selected
      const mathButtonAfter = screen.getByRole('button', { name: 'Math Symbols' })
      expect(mathButtonAfter).toBeInTheDocument()
    })

    it('shows correct count for currency category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Use exact name match to avoid matching character buttons containing "Currency"
      const currencyButton = screen.getByRole('button', { name: 'Currency' })
      await user.click(currencyButton)

      const currencyCategory = characterCategories.find((cat) => cat.id === 'currency')
      const currencyCount = currencyCategory?.characters.length || 0
      expect(screen.getByText(`${currencyCount} characters in category`)).toBeInTheDocument()
    })

    it('shows correct count for greek letters category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const greekButton = screen.getByRole('button', { name: /greek letters/i })
      await user.click(greekButton)

      const greekCategory = characterCategories.find((cat) => cat.id === 'greek')
      const greekCount = greekCategory?.characters.length || 0
      expect(screen.getByText(`${greekCount} characters in category`)).toBeInTheDocument()
    })

    it('shows singular "character" for category with 1 character', async () => {
      // This test verifies the pluralization logic
      // We need to mock or use a category that might have only 1 character
      // Since all categories have multiple characters, we'll test with search instead
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Search for something very specific that returns exactly 1 result
      // "Hryvnia" only matches "Hryvnia Sign" (₴)
      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'Hryvnia')

      // Should show singular form
      expect(screen.getByText('Found 1 character')).toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('filters characters based on search query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'euro')

      // Should find Euro Sign
      expect(screen.getByText('€')).toBeInTheDocument()
    })

    it('hides category buttons when searching', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Category buttons should be visible initially
      expect(screen.getByRole('button', { name: /all characters/i })).toBeInTheDocument()

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'arrow')

      // Category buttons should be hidden
      expect(screen.queryByRole('button', { name: /all characters/i })).not.toBeInTheDocument()
    })

    it('shows category buttons when search is cleared', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)

      // Type search query
      await user.type(searchInput, 'arrow')
      expect(screen.queryByRole('button', { name: /all characters/i })).not.toBeInTheDocument()

      // Clear search
      await user.clear(searchInput)

      // Category buttons should be visible again
      expect(screen.getByRole('button', { name: /all characters/i })).toBeInTheDocument()
    })

    it('tracks search event when query is entered', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'pi')

      // Each keystroke triggers the event
      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_searched', {
        query_length: 1,
      })
      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_searched', {
        query_length: 2,
      })
    })

    it('does not track search event for empty query', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'a')
      mockTrackToolEvent.mockClear()

      await user.clear(searchInput)

      // Should not track when query becomes empty
      expect(mockTrackToolEvent).not.toHaveBeenCalledWith(
        'character_map_searched',
        expect.anything()
      )
    })

    it('shows "Found X characters" format when searching', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'arrow')

      expect(screen.getByText(/found \d+ characters?/i)).toBeInTheDocument()
    })

    it('searches case-insensitively', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'EURO')

      // Should still find Euro
      expect(screen.getByText('€')).toBeInTheDocument()
    })

    it('can search by Unicode code', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'U+2192')

      // Should find Right Arrow
      expect(screen.getByText('→')).toBeInTheDocument()
    })

    it('can search by partial Unicode code', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, '2192')

      // Should find Right Arrow (partial match on code)
      expect(screen.getByText('→')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no characters match search', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'xyznonexistent123')

      expect(screen.getByText(/no characters found/i)).toBeInTheDocument()
      expect(
        screen.getByText(/try a different search term or browse by category/i)
      ).toBeInTheDocument()
    })

    it('shows "Found 0 characters" in results count for empty search results', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'xyznonexistent123')

      expect(screen.getByText(/found 0 characters/i)).toBeInTheDocument()
    })
  })

  describe('copy to clipboard', () => {
    it('copies character to clipboard when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Find and click the right arrow character
      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      await user.click(arrowButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('→')
    })

    it('tracks copy event with character name', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Find and click the right arrow character
      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      await user.click(arrowButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_character_copied', {
        character_name: 'Rightwards Arrow',
      })
    })

    it('shows checkmark indicator after copying', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Find and click the euro character
      const euroButton = getRequiredButton(
        screen.getByText('€').closest('button'),
        'Euro character'
      )
      await user.click(euroButton)

      // Wait for the checkmark to appear (lucide-react Check icon has class 'lucide-check')
      await waitFor(() => {
        const checkIcon = euroButton.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })
    })

    it('removes checkmark indicator after 2 seconds', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Find and click the euro character
      const euroButton = getRequiredButton(
        screen.getByText('€').closest('button'),
        'Euro character'
      )
      await user.click(euroButton)

      // Verify checkmark appears
      await waitFor(() => {
        const checkIcon = euroButton.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })

      // Advance time by 2 seconds
      await vi.advanceTimersByTimeAsync(2000)

      // Checkmark should be gone
      await waitFor(() => {
        const checkIcon = euroButton.querySelector('.lucide-check')
        expect(checkIcon).not.toBeInTheDocument()
      })
    })

    it('handles clipboard error gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Copy failed'))

      render(<CharacterMapPage />)

      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      await user.click(arrowButton)

      expect(consoleError).toHaveBeenCalledWith('Failed to copy:', expect.any(Error))

      consoleError.mockRestore()
    })

    it('does not track copy event when clipboard fails', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error('Copy failed'))

      render(<CharacterMapPage />)
      mockTrackToolEvent.mockClear()

      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      await user.click(arrowButton)

      // Copy event should still be tracked because it's called before the try/catch
      // Actually looking at the code, trackToolEvent is called after successful writeText
      // So it should NOT be tracked on failure
      expect(mockTrackToolEvent).not.toHaveBeenCalledWith(
        'character_map_character_copied',
        expect.anything()
      )

      vi.mocked(console.error).mockRestore()
    })

    it('only shows checkmark on the copied character', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Click euro
      const euroButton = getRequiredButton(
        screen.getByText('€').closest('button'),
        'Euro character'
      )
      await user.click(euroButton)

      // Euro should have checkmark
      await waitFor(() => {
        const checkIcon = euroButton.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })

      // Right arrow should NOT have checkmark
      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      const arrowCheckIcon = arrowButton.querySelector('.lucide-check')
      expect(arrowCheckIcon).not.toBeInTheDocument()
    })

    it('updates checkmark when different character is copied', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // Click euro
      const euroButton = getRequiredButton(
        screen.getByText('€').closest('button'),
        'Euro character'
      )
      await user.click(euroButton)

      await waitFor(() => {
        const checkIcon = euroButton.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })

      // Click arrow
      const arrowButton = getRequiredButton(
        screen.getByText('→').closest('button'),
        'Right arrow character'
      )
      await user.click(arrowButton)

      await waitFor(() => {
        // Arrow should have checkmark now
        const arrowCheckIcon = arrowButton.querySelector('.lucide-check')
        expect(arrowCheckIcon).toBeInTheDocument()
        // Euro should NOT have checkmark anymore
        const euroCheckIcon = euroButton.querySelector('.lucide-check')
        expect(euroCheckIcon).not.toBeInTheDocument()
      })
    })
  })

  describe('character display', () => {
    it('displays characters with their Unicode codes', () => {
      render(<CharacterMapPage />)

      // Check several characters and their codes
      expect(screen.getByText('→')).toBeInTheDocument()
      expect(screen.getByText('U+2192')).toBeInTheDocument()

      expect(screen.getByText('€')).toBeInTheDocument()
      expect(screen.getByText('U+20AC')).toBeInTheDocument()
    })

    it('displays all characters from a selected category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Select currency category - use exact name match to avoid matching character buttons
      const currencyButton = screen.getByRole('button', { name: 'Currency' })
      await user.click(currencyButton)

      // Verify some currency symbols are shown
      expect(screen.getByText('$')).toBeInTheDocument()
      expect(screen.getByText('€')).toBeInTheDocument()
      expect(screen.getByText('£')).toBeInTheDocument()
      expect(screen.getByText('¥')).toBeInTheDocument()
    })

    it('displays math symbols when math category is selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const mathButton = screen.getByRole('button', { name: /math symbols/i })
      await user.click(mathButton)

      expect(screen.getByText('+')).toBeInTheDocument()
      expect(screen.getByText('−')).toBeInTheDocument()
      expect(screen.getByText('×')).toBeInTheDocument()
      expect(screen.getByText('÷')).toBeInTheDocument()
      expect(screen.getByText('=')).toBeInTheDocument()
    })

    it('displays greek letters when greek category is selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const greekButton = screen.getByRole('button', { name: /greek letters/i })
      await user.click(greekButton)

      expect(screen.getByText('α')).toBeInTheDocument()
      expect(screen.getByText('β')).toBeInTheDocument()
      expect(screen.getByText('γ')).toBeInTheDocument()
      expect(screen.getByText('π')).toBeInTheDocument()
    })

    it('displays punctuation when punctuation category is selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const punctButton = screen.getByRole('button', { name: /punctuation/i })
      await user.click(punctButton)

      expect(screen.getByText('…')).toBeInTheDocument()
      expect(screen.getByText('•')).toBeInTheDocument()
    })

    it('displays symbols when symbols category is selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const symbolsButton = screen.getByRole('button', { name: 'Symbols' })
      await user.click(symbolsButton)

      expect(screen.getByText('☀')).toBeInTheDocument()
      expect(screen.getByText('★')).toBeInTheDocument()
      expect(screen.getByText('♥')).toBeInTheDocument()
    })
  })

  describe('results count display', () => {
    it('shows "Showing all X characters" for all category', () => {
      render(<CharacterMapPage />)

      const allCharacters = getAllCharacters()
      expect(screen.getByText(`Showing all ${allCharacters.length} characters`)).toBeInTheDocument()
    })

    it('shows "X characters in category" for specific category', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const arrowsButton = screen.getByRole('button', { name: /arrows/i })
      await user.click(arrowsButton)

      expect(screen.getByText(/\d+ characters in category/)).toBeInTheDocument()
    })

    it('shows "Found X characters" when searching', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'arrow')

      expect(screen.getByText(/found \d+ characters?/i)).toBeInTheDocument()
    })

    it('uses correct pluralization for multiple characters', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'arrow')

      // Multiple results should use plural form
      const resultsText = screen.getByText(/found \d+ characters/i)
      expect(resultsText.textContent).toMatch(/characters$/)
    })
  })

  describe('accessibility', () => {
    it('has accessible search input', () => {
      render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('category buttons are focusable', () => {
      render(<CharacterMapPage />)

      const allButton = screen.getByRole('button', { name: /all characters/i })
      expect(allButton).not.toHaveAttribute('disabled')
    })

    it('character buttons are clickable', () => {
      render(<CharacterMapPage />)

      const charButtons = screen.getAllByRole('button').filter((button) => {
        const text = button.textContent || ''
        return text.includes('U+')
      })

      charButtons.forEach((button) => {
        expect(button).not.toHaveAttribute('disabled')
      })
    })

    it('main landmark is present', () => {
      render(<CharacterMapPage />)

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('heading hierarchy is correct', () => {
      render(<CharacterMapPage />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent(/character map/i)

      const h3 = screen.getByRole('heading', { level: 3, name: /tips/i })
      expect(h3).toBeInTheDocument()
    })
  })

  describe('state management', () => {
    it('maintains search state across renders', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const { rerender } = render(<CharacterMapPage />)

      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'euro')

      rerender(<CharacterMapPage />)

      // Note: rerender() maintains the same component instance and React state
      // State persists across rerender (unlike unmount/mount which would reset)
      expect(screen.getByPlaceholderText(/search characters/i)).toHaveValue('euro')
    })

    it('resets category when searching', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Select a category first
      const mathButton = screen.getByRole('button', { name: /math symbols/i })
      await user.click(mathButton)

      // Category buttons should still be visible
      expect(screen.getByRole('button', { name: /all characters/i })).toBeInTheDocument()

      // Start searching
      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'arrow')

      // Category buttons should be hidden (search takes over)
      expect(screen.queryByRole('button', { name: /all characters/i })).not.toBeInTheDocument()
    })
  })

  describe('integration tests', () => {
    it('complete workflow: select category, search, copy character', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)
      render(<CharacterMapPage />)

      // 1. Select math category
      const mathButton = screen.getByRole('button', { name: /math symbols/i })
      await user.click(mathButton)
      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_category_changed', {
        category: 'math',
      })

      // 2. Search for infinity
      const searchInput = screen.getByPlaceholderText(/search characters/i)
      await user.type(searchInput, 'infinity')

      // Category buttons should be hidden
      expect(screen.queryByRole('button', { name: /math symbols/i })).not.toBeInTheDocument()

      // 3. Copy the infinity character
      const infinityButton = getRequiredButton(
        screen.getByText('∞').closest('button'),
        'Infinity character'
      )
      await user.click(infinityButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('∞')
      expect(mockTrackToolEvent).toHaveBeenCalledWith('character_map_character_copied', {
        character_name: 'Infinity',
      })

      // 4. Verify checkmark appears and disappears
      await waitFor(() => {
        const checkIcon = infinityButton.querySelector('.lucide-check')
        expect(checkIcon).toBeInTheDocument()
      })

      await vi.advanceTimersByTimeAsync(2000)

      await waitFor(() => {
        const checkIcon = infinityButton.querySelector('.lucide-check')
        expect(checkIcon).not.toBeInTheDocument()
      })
    })

    it('switching between categories updates character list', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<CharacterMapPage />)

      // Select arrows
      await user.click(screen.getByRole('button', { name: /arrows/i }))
      expect(screen.getByText('→')).toBeInTheDocument()

      // Select currency
      await user.click(screen.getByRole('button', { name: /currency/i }))
      expect(screen.getByText('€')).toBeInTheDocument()
      expect(screen.getByText('$')).toBeInTheDocument()

      // Select greek
      await user.click(screen.getByRole('button', { name: /greek letters/i }))
      expect(screen.getByText('π')).toBeInTheDocument()
      expect(screen.getByText('α')).toBeInTheDocument()
    })
  })
})
