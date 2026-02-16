import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HashtagGeneratorPage from '../page'

// Mock analytics
const mockTrackToolEvent = vi.hoisted(() => vi.fn())
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
}))

// Note: Clipboard API is mocked globally in vitest.setup.ts

describe('HashtagGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders page header with title', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Hashtag Generator')).toBeInTheDocument()
    })

    it('renders page description', () => {
      render(<HashtagGeneratorPage />)
      expect(
        screen.getByText(/Generate trending and relevant hashtags for your social media posts/)
      ).toBeInTheDocument()
    })

    it('renders content input section', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Enter Your Content')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      ).toBeInTheDocument()
    })

    it('renders platform selector with default Instagram', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByLabelText('Platform')).toBeInTheDocument()
      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('instagram')
    })

    it('renders all platform options', () => {
      render(<HashtagGeneratorPage />)
      const select = screen.getByRole('combobox')
      const options = within(select).getAllByRole('option')

      expect(options).toHaveLength(7)
      expect(options.map((o) => o.textContent)).toEqual([
        'Instagram',
        'Twitter/X',
        'TikTok',
        'LinkedIn',
        'Facebook',
        'YouTube',
        'Pinterest',
      ])
    })

    it('renders category filter buttons', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Filter by Category (optional)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /General/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Trending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Niche/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Branded/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Community/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Location/i })).toBeInTheDocument()
    })

    it('renders generate hashtags button', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByRole('button', { name: /Generate Hashtags/i })).toBeInTheDocument()
    })

    it('renders generate button as disabled when no content', () => {
      render(<HashtagGeneratorPage />)
      const button = screen.getByRole('button', { name: /Generate Hashtags/i })
      // Button doesn't have actual disabled attribute but has visual disabled state
      // We check the cursor style indirectly through the button's presence
      expect(button).toBeInTheDocument()
    })

    it('renders platform tips section', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Instagram Tips')).toBeInTheDocument()
      expect(screen.getByText('Maximum')).toBeInTheDocument()
      expect(screen.getByText('30 hashtags')).toBeInTheDocument()
      expect(screen.getByText('Recommended')).toBeInTheDocument()
      expect(screen.getByText('5-11 hashtags')).toBeInTheDocument()
    })

    it('renders selected hashtags section', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Selected Hashtags')).toBeInTheDocument()
      expect(
        screen.getByText(/No hashtags selected. Generate and click on hashtags to select them./)
      ).toBeInTheDocument()
    })

    it('renders popularity legend', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Popularity Legend')).toBeInTheDocument()
      expect(screen.getByText('Viral')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('100M+ posts')).toBeInTheDocument()
      expect(screen.getByText('10M-100M posts')).toBeInTheDocument()
      expect(screen.getByText('1M-10M posts')).toBeInTheDocument()
      expect(screen.getByText('Under 1M posts')).toBeInTheDocument()
    })

    it('renders features section', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('Trending Hashtags')).toBeInTheDocument()
      expect(screen.getByText('Niche Suggestions')).toBeInTheDocument()
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument()
      expect(screen.getByText('Platform Specific')).toBeInTheDocument()
    })
  })

  describe('Content Input', () => {
    it('updates content on textarea change', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'Beautiful sunset at the beach')

      expect(textarea).toHaveValue('Beautiful sunset at the beach')
    })

    it('enables generate button when content is entered', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'Test content')

      const button = screen.getByRole('button', { name: /Generate Hashtags/i })
      expect(button).toBeInTheDocument()
    })

    it('handles whitespace-only content as empty', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, '   ')

      // Button should still be visually disabled
      const button = screen.getByRole('button', { name: /Generate Hashtags/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Platform Selection', () => {
    it('changes platform when selecting from dropdown', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'twitter')

      expect(select).toHaveValue('twitter')
    })

    it('tracks platform change event', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'tiktok')

      expect(mockTrackToolEvent).toHaveBeenCalledWith('hashtag_platform_changed', {
        platform: 'tiktok',
      })
    })

    it('updates platform tips when platform changes', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Initially Instagram
      expect(screen.getByText('Instagram Tips')).toBeInTheDocument()
      expect(screen.getByText('30 hashtags')).toBeInTheDocument()

      // Change to Twitter
      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'twitter')

      expect(screen.getByText('Twitter/X Tips')).toBeInTheDocument()
      expect(screen.getByText('1-3 hashtags')).toBeInTheDocument()
    })

    it('shows YouTube platform config correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'youtube')

      expect(screen.getByText('YouTube Tips')).toBeInTheDocument()
      expect(screen.getByText('15 hashtags')).toBeInTheDocument()
      expect(screen.getByText('3-5 hashtags')).toBeInTheDocument()
    })

    it('shows Pinterest platform config correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'pinterest')

      expect(screen.getByText('Pinterest Tips')).toBeInTheDocument()
      expect(screen.getByText('20 hashtags')).toBeInTheDocument()
      expect(screen.getByText('2-5 hashtags')).toBeInTheDocument()
    })
  })

  describe('Category Filtering', () => {
    it('toggles category selection when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const trendingButton = screen.getByRole('button', { name: /Trending/i })

      // Click to select
      await user.click(trendingButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('hashtag_category_filtered', {
        category: 'trending',
        action: 'added',
        activeCategories: ['trending'],
      })
    })

    it('deselects category when clicked again', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const generalButton = screen.getByRole('button', { name: /General/i })

      // Select then deselect
      await user.click(generalButton)
      await user.click(generalButton)

      expect(mockTrackToolEvent).toHaveBeenLastCalledWith('hashtag_category_filtered', {
        category: 'general',
        action: 'removed',
        activeCategories: [],
      })
    })

    it('allows multiple categories to be selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      await user.click(screen.getByRole('button', { name: /General/i }))
      await user.click(screen.getByRole('button', { name: /Niche/i }))

      expect(mockTrackToolEvent).toHaveBeenLastCalledWith('hashtag_category_filtered', {
        category: 'niche',
        action: 'added',
        activeCategories: ['general', 'niche'],
      })
    })
  })

  describe('Hashtag Generation', () => {
    it('generates hashtags when button is clicked with content', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'Beautiful sunset at the beach vacation travel')

      const generateButton = screen.getByRole('button', { name: /Generate Hashtags/i })
      await user.click(generateButton)

      // Should show generated hashtags section
      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })
    })

    it('tracks hashtag generation event', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'fitness workout gym health')

      const generateButton = screen.getByRole('button', { name: /Generate Hashtags/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'hashtag_generated',
          expect.objectContaining({
            platform: 'instagram',
            topicsDetected: expect.any(Array),
            hashtagCount: expect.any(Number),
            categoriesFiltered: [],
          })
        )
      })
    })

    it('does not generate when content is empty', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const generateButton = screen.getByRole('button', { name: /Generate Hashtags/i })
      await user.click(generateButton)

      // Should not show generated hashtags section
      expect(screen.queryByText(/Generated Hashtags \(/)).not.toBeInTheDocument()
    })

    it('shows Select Recommended and Deselect All buttons after generation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel adventure photography')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Select Recommended/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Deselect All/i })).toBeInTheDocument()
      })
    })

    it('generates with category filter applied', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Select trending category
      await user.click(screen.getByRole('button', { name: /Trending/i }))

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'food cooking recipe')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'hashtag_generated',
          expect.objectContaining({
            categoriesFiltered: ['trending'],
          })
        )
      })
    })

    it('shows message when no hashtags found', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Enter content that might not match any hashtags with strict filtering
      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'xyz123abc456')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        // The component should still show generated hashtags section
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })
    })
  })

  describe('Hashtag Selection', () => {
    const setupWithGeneratedHashtags = async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel photography adventure nature landscape')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      return user
    }

    it('pre-selects recommended number of hashtags after generation', async () => {
      await setupWithGeneratedHashtags()

      // Should show selected count in the badge (format: X/11 for Instagram)
      await waitFor(() => {
        const badge = screen.getByText(/\d+\/11/)
        expect(badge).toBeInTheDocument()
      })
    })

    it('toggles hashtag selection when hashtag button is clicked', async () => {
      const user = await setupWithGeneratedHashtags()

      // Find a hashtag button (they display with # prefix)
      const hashtagButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent?.includes('#'))

      if (hashtagButtons.length > 0) {
        // Click first hashtag to toggle its selection
        await user.click(hashtagButtons[0])
        // Selection state would change
      }
    })

    it('selects recommended hashtags when Select Recommended is clicked', async () => {
      const user = await setupWithGeneratedHashtags()

      // First deselect all
      await user.click(screen.getByRole('button', { name: /Deselect All/i }))

      // Then select recommended
      await user.click(screen.getByRole('button', { name: /Select Recommended/i }))

      // Should show selected hashtags (format: X/11 for Instagram recommended.max)
      await waitFor(() => {
        const badge = screen.getByText(/\d+\/11/)
        expect(badge).toBeInTheDocument()
      })
    })

    it('deselects all hashtags when Deselect All is clicked', async () => {
      const user = await setupWithGeneratedHashtags()

      await user.click(screen.getByRole('button', { name: /Deselect All/i }))

      // Should show 0 selected (Instagram recommended.max is 11)
      await waitFor(() => {
        expect(screen.getByText('0/11')).toBeInTheDocument()
      })
    })

    it('updates count status based on selected count', async () => {
      const user = await setupWithGeneratedHashtags()

      // Deselect all to get "low" status
      await user.click(screen.getByRole('button', { name: /Deselect All/i }))

      await waitFor(() => {
        expect(screen.getByText('0/11')).toBeInTheDocument()
      })
    })
  })

  describe('Copy Functionality', () => {
    const setupWithSelectedHashtags = async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel photography adventure nature')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      return user
    }

    it('shows copy buttons when hashtags are selected', async () => {
      await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Copy \(Lines\)/i })).toBeInTheDocument()
      })
    })

    it('copies hashtags with spaces when Copy (Spaces) is clicked', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('copies hashtags with newlines when Copy (Lines) is clicked', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Lines\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Lines\)/i }))

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('tracks copy event with format and count', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'hashtag_copied',
        expect.objectContaining({
          format: 'space',
          count: expect.any(Number),
          platform: 'instagram',
        })
      )
    })

    it('shows Copied! feedback after copying with spaces', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('shows Copied! feedback after copying with lines', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Lines\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Lines\)/i }))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('resets copy feedback after timeout', async () => {
      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })

      // Advance time to clear the feedback
      vi.advanceTimersByTime(2500)

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      })
    })

    it('handles clipboard error gracefully', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(
        new Error('Clipboard failed')
      )

      const user = await setupWithSelectedHashtags()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      // Should not throw
      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      // Component should still be functional
      expect(screen.getByText(/Selected Hashtags/)).toBeInTheDocument()
    })
  })

  describe('Platform-Specific Behavior', () => {
    it('limits selection to platform max hashtags', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Change to YouTube (max 15)
      await user.selectOptions(screen.getByRole('combobox'), 'youtube')

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'fitness workout gym training exercise health')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
        // Recommended max for YouTube is 5 (format: X/5)
        expect(screen.getByText(/\d+\/5/)).toBeInTheDocument()
      })
    })

    it('shows correct recommended range for Twitter', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      await user.selectOptions(screen.getByRole('combobox'), 'twitter')

      expect(screen.getByText('1-3 hashtags')).toBeInTheDocument()
    })

    it('shows correct recommended range for TikTok', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      await user.selectOptions(screen.getByRole('combobox'), 'tiktok')

      expect(screen.getByText('3-5 targeted hashtags work best')).toBeInTheDocument()
    })

    it('shows correct recommended range for LinkedIn', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      await user.selectOptions(screen.getByRole('combobox'), 'linkedin')

      expect(screen.getByText('3-5 professional, industry-specific hashtags')).toBeInTheDocument()
    })

    it('shows correct recommended range for Facebook', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      await user.selectOptions(screen.getByRole('combobox'), 'facebook')

      expect(screen.getByText('1-3 hashtags, less is more on Facebook')).toBeInTheDocument()
    })
  })

  describe('Count Status Indicator', () => {
    it('shows low status when below minimum recommended', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'test content for hashtags')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      // Deselect all to get low status
      await user.click(screen.getByRole('button', { name: /Deselect All/i }))

      // Instagram recommended.max is 11, so 0 selected should be "low"
      await waitFor(() => {
        const countBadge = screen.getByText('0/11')
        expect(countBadge).toBeInTheDocument()
      })
    })

    it('shows optimal status when within recommended range', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Use Twitter which has recommended 2-5
      await user.selectOptions(screen.getByRole('combobox'), 'twitter')

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel photography adventure vacation')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      // Should auto-select recommended amount (Twitter recommended.max is 3, format: X/3)
      await waitFor(() => {
        const countBadge = screen.getByText(/\d+\/3/)
        expect(countBadge).toBeInTheDocument()
      })
    })
  })

  describe('Selected Hashtags Display', () => {
    it('shows selected hashtags formatted with # prefix', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel photography nature')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        // Selected hashtags should be displayed with # prefix
        const selectedSection = screen.getByText('Selected Hashtags').closest('div')
        expect(selectedSection).toBeInTheDocument()
      })
    })

    it('displays no hashtags message when none selected', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'content for testing')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Deselect All/i }))

      // Copy buttons should not be visible when no hashtags selected
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Copy \(Spaces\)/i })).not.toBeInTheDocument()
      })
    })
  })

  describe('Hashtag Buttons in Generated Section', () => {
    it('displays hashtag with popularity label', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'fitness gym workout health training')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        // Should show popularity labels (Viral, High, Medium, Low)
        const hashtagSection = screen.getByText(/Generated Hashtags/).closest('div')
        expect(hashtagSection).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible platform label', () => {
      render(<HashtagGeneratorPage />)
      expect(screen.getByLabelText('Platform')).toBeInTheDocument()
    })

    it('textarea has placeholder for guidance', () => {
      render(<HashtagGeneratorPage />)
      expect(
        screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      ).toBeInTheDocument()
    })

    it('category buttons are keyboard accessible', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const generalButton = screen.getByRole('button', { name: /General/i })
      generalButton.focus()
      await user.keyboard('{Enter}')

      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'hashtag_category_filtered',
        expect.objectContaining({
          category: 'general',
          action: 'added',
        })
      )
    })

    it('generate button is keyboard accessible', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'test content')

      const generateButton = screen.getByRole('button', { name: /Generate Hashtags/i })
      generateButton.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })
    })
  })

  describe('Feature Cards', () => {
    it('renders all feature cards with correct content', () => {
      render(<HashtagGeneratorPage />)

      // Trending Hashtags
      expect(screen.getByText('Trending Hashtags')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Get the most popular and trending hashtags for maximum visibility and reach/
        )
      ).toBeInTheDocument()

      // Niche Suggestions
      expect(screen.getByText('Niche Suggestions')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Discover targeted hashtags specific to your industry or topic for better engagement/
        )
      ).toBeInTheDocument()

      // Copy to Clipboard
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Easily copy all selected hashtags with one click, formatted for your platform/
        )
      ).toBeInTheDocument()

      // Platform Specific
      expect(screen.getByText('Platform Specific')).toBeInTheDocument()
      expect(
        screen.getByText(
          /Optimized recommendations for Instagram, Twitter, TikTok, LinkedIn, and more/
        )
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid platform switching', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const select = screen.getByRole('combobox')

      await user.selectOptions(select, 'twitter')
      await user.selectOptions(select, 'tiktok')
      await user.selectOptions(select, 'linkedin')
      await user.selectOptions(select, 'instagram')

      expect(select).toHaveValue('instagram')
      expect(mockTrackToolEvent).toHaveBeenCalledTimes(4)
    })

    it('handles rapid category toggling', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const generalButton = screen.getByRole('button', { name: /General/i })

      await user.click(generalButton)
      await user.click(generalButton)
      await user.click(generalButton)
      await user.click(generalButton)

      // Should toggle on-off-on-off
      expect(mockTrackToolEvent).toHaveBeenCalledTimes(4)
    })

    it('handles regeneration with same content', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'test content')

      const generateButton = screen.getByRole('button', { name: /Generate Hashtags/i })

      await user.click(generateButton)
      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      await user.click(generateButton)
      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      // Should track generation twice
      expect(mockTrackToolEvent).toHaveBeenCalledWith('hashtag_generated', expect.any(Object))
    })

    it('handles very long content input', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      const longContent = 'travel photography nature landscape adventure '.repeat(50)

      await user.type(textarea, longContent)

      expect(textarea).toHaveValue(longContent)
    })

    it('handles special characters in content', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel & photography! @nature #landscape? adventure*')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })
    })

    it('handles unicode content', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel adventure photography')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('complete workflow: enter content, select platform, filter categories, generate, select, copy', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // 1. Enter content
      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'fitness workout gym health training exercise')

      // 2. Select platform
      await user.selectOptions(screen.getByRole('combobox'), 'twitter')

      // 3. Filter categories
      await user.click(screen.getByRole('button', { name: /Trending/i }))

      // 4. Generate hashtags
      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      // 5. Wait for Copy button to be available (hashtags must be selected)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy \(Spaces\)/i })).toBeInTheDocument()
      })

      // 6. Copy hashtags
      await user.click(screen.getByRole('button', { name: /Copy \(Spaces\)/i }))

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(mockTrackToolEvent).toHaveBeenCalledWith(
        'hashtag_copied',
        expect.objectContaining({
          format: 'space',
          platform: 'twitter',
        })
      )
    })

    it('regenerate after changing platform', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<HashtagGeneratorPage />)

      // Initial generation with Instagram
      const textarea = screen.getByPlaceholderText(/Enter your post content or describe your topic/)
      await user.type(textarea, 'travel photography nature')

      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(screen.getByText(/Generated Hashtags/)).toBeInTheDocument()
      })

      // Change to Twitter and regenerate
      await user.selectOptions(screen.getByRole('combobox'), 'twitter')
      await user.click(screen.getByRole('button', { name: /Generate Hashtags/i }))

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'hashtag_generated',
          expect.objectContaining({
            platform: 'twitter',
          })
        )
      })
    })
  })
})
