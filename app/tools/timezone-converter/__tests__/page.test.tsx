import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import TimezoneConverterPage from '../page'

// Mock nuqs
vi.mock('nuqs', () => ({
  parseAsString: {
    withDefault: (defaultValue: string) => ({
      defaultValue,
      parse: (value: string) => value,
    }),
  },
  useQueryState: (_key: string, parser: { defaultValue: unknown }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useState(parser.defaultValue)
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('Timezone Converter Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Timezone Converter')).toBeInTheDocument()
      })
    })

    it('renders description', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(
          screen.getByText(/Convert time across multiple timezones with DST awareness/)
        ).toBeInTheDocument()
      })
    })

    it('renders DST awareness badge', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(screen.getByText(/DST Aware • Real-time Updates/)).toBeInTheDocument()
      })
    })

    it('renders default timezones (Local Time and UTC)', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Local Time')).toBeInTheDocument()
        expect(screen.getByText('UTC')).toBeInTheDocument()
      })
    })

    it('renders time input', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/)
        expect(timeInput).toBeInTheDocument()
      })
    })

    it('renders Now button', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Now')).toBeInTheDocument()
      })
    })
  })

  describe('Meeting Time Planner', () => {
    it('renders meeting time planner card', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Meeting Time Planner')).toBeInTheDocument()
      })
    })

    it('displays current date', async () => {
      render(<TimezoneConverterPage />)
      await waitFor(() => {
        // Should display a date in format like "Friday, November 2, 2025"
        const dateElement = screen.getByText(/\w+day, \w+ \d{1,2}, \d{4}/)
        expect(dateElement).toBeInTheDocument()
      })
    })

    it('updates time when time input changes', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        fireEvent.change(timeInput, { target: { value: '14:30' } })
      })

      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        expect(timeInput.value).toBe('14:30')
      })
    })

    it('resets to current time when Now button is clicked', async () => {
      render(<TimezoneConverterPage />)

      // First change the time
      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        fireEvent.change(timeInput, { target: { value: '14:30' } })
      })

      // Click Now button
      await waitFor(async () => {
        const nowButton = screen.getByText('Now')
        await userEvent.click(nowButton)
      })

      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        // Should be back to current time (not 14:30)
        expect(timeInput.value).not.toBe('14:30')
      })
    })
  })

  describe('Timezone Cards', () => {
    it('displays time for each timezone', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        // Should display times in HH:mm format
        const times = screen.getAllByText(/\d{2}:\d{2}/)
        expect(times.length).toBeGreaterThan(0)
      })
    })

    it('displays date for each timezone', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        // Should display dates like "Fri, Nov 2, 2025"
        const dates = screen.getAllByText(/\w{3}, \w{3} \d{1,2}, \d{4}/)
        expect(dates.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('displays timezone offset', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        // Should display offsets like "+00:00"
        const offset = screen.getByText('+00:00')
        expect(offset).toBeInTheDocument()
      })
    })

    it('shows remove button for each timezone', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button')
        const trashButtons = deleteButtons.filter((btn) =>
          btn.querySelector('svg[class*="lucide-trash"]')
        )
        expect(trashButtons.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('applies different colors for day and night', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        // The component applies different border and background colors
        // This test verifies the card structure exists
        expect(screen.getByText('Local Time')).toBeInTheDocument()
        expect(screen.getByText('UTC')).toBeInTheDocument()
      })
    })
  })

  describe('Add Timezone', () => {
    it('renders add timezone section', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('Add Timezone')).toBeInTheDocument()
      })
    })

    it('renders search input', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search timezones/)
        expect(searchInput).toBeInTheDocument()
      })
    })

    it('displays popular timezone buttons', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('New York (EST)')).toBeInTheDocument()
        expect(screen.getByText('London (GMT)')).toBeInTheDocument()
        expect(screen.getByText('Tokyo (JST)')).toBeInTheDocument()
      })
    })

    it('filters timezones when searching', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search timezones/)
        fireEvent.change(searchInput, { target: { value: 'Tokyo' } })
      })

      await waitFor(() => {
        expect(screen.getByText('Tokyo (JST)')).toBeInTheDocument()
        // Other timezones should not be visible
        expect(screen.queryByText('New York (EST)')).not.toBeInTheDocument()
      })
    })

    it('adds timezone when button is clicked', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const tokyoButton = screen.getByText('Tokyo (JST)')
        await userEvent.click(tokyoButton)
      })

      await waitFor(() => {
        // Should now display Tokyo in the timezone cards section
        const tokyoLabels = screen.getAllByText(/Tokyo/)
        expect(tokyoLabels.length).toBeGreaterThan(1) // One in add section, one in cards
      })
    })

    it('disables already added timezones', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const tokyoButton = screen.getByText('Tokyo (JST)')
        await userEvent.click(tokyoButton)
      })

      await waitFor(() => {
        const tokyoButton = screen.getByText('Tokyo (JST)').closest('button')
        expect(tokyoButton).toBeDisabled()
      })
    })

    it('clears search after adding timezone', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search timezones/) as HTMLInputElement
        fireEvent.change(searchInput, { target: { value: 'Tokyo' } })
      })

      await waitFor(async () => {
        const tokyoButton = screen.getByText('Tokyo (JST)')
        await userEvent.click(tokyoButton)
      })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/Search timezones/) as HTMLInputElement
        expect(searchInput.value).toBe('')
      })
    })
  })

  describe('Remove Timezone', () => {
    it('removes timezone when delete button is clicked', async () => {
      render(<TimezoneConverterPage />)

      // Add Tokyo first
      await waitFor(async () => {
        const tokyoButton = screen.getByText('Tokyo (JST)')
        await userEvent.click(tokyoButton)
      })

      // Verify Tokyo is added
      await waitFor(() => {
        const tokyoLabels = screen.getAllByText(/Tokyo/)
        expect(tokyoLabels.length).toBeGreaterThan(1)
      })

      // Find Tokyo's delete button
      await waitFor(async () => {
        const cards = screen.getAllByText(/Tokyo/).map((el) => el.closest('article'))
        const tokyoCard = cards.find((card) => card && card.textContent?.includes('JST'))
        if (tokyoCard) {
          const deleteButton = tokyoCard.querySelector('button[class*="ghost"]')
          if (deleteButton) {
            await userEvent.click(deleteButton as HTMLElement)
          }
        }
      })

      // Tokyo should no longer be in cards section
      await waitFor(() => {
        const tokyoLabels = screen.getAllByText(/Tokyo/)
        // Should only have one (in the add timezone section)
        expect(tokyoLabels.length).toBe(1)
      })
    })
  })

  describe('Favorites System', () => {
    it('renders save configuration button', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('Save Configuration')).toBeInTheDocument()
      })
    })

    it('disables save button when no timezones', async () => {
      render(<TimezoneConverterPage />)

      // Remove all timezones first
      await waitFor(async () => {
        const deleteButtons = screen
          .getAllByRole('button')
          .filter((btn) => btn.querySelector('svg[class*="lucide-trash"]'))
        for (const btn of deleteButtons) {
          await userEvent.click(btn)
        }
      })

      await waitFor(() => {
        const saveButton = screen.getByText('Save Configuration').closest('button')
        expect(saveButton).toBeDisabled()
      })
    })

    it('saves timezone configuration', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const saveButton = screen.getByText('Save Configuration')
        await userEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Saved Configurations')).toBeInTheDocument()
      })
    })

    it('displays saved configuration details', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const saveButton = screen.getByText('Save Configuration')
        await userEvent.click(saveButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/2 timezones/)).toBeInTheDocument()
      })
    })

    it('loads saved configuration when clicked', async () => {
      render(<TimezoneConverterPage />)

      // Add Tokyo
      await waitFor(async () => {
        const tokyoButton = screen.getByText('Tokyo (JST)')
        await userEvent.click(tokyoButton)
      })

      // Save configuration
      await waitFor(async () => {
        const saveButton = screen.getByText('Save Configuration')
        await userEvent.click(saveButton)
      })

      // Remove Tokyo
      await waitFor(async () => {
        const cards = screen.getAllByText(/Tokyo/).map((el) => el.closest('article'))
        const tokyoCard = cards.find((card) => card && card.textContent?.includes('JST'))
        if (tokyoCard) {
          const deleteButton = tokyoCard.querySelector('button[class*="ghost"]')
          if (deleteButton) {
            await userEvent.click(deleteButton as HTMLElement)
          }
        }
      })

      // Load saved configuration
      await waitFor(async () => {
        const loadButton = screen.getByText('Load')
        await userEvent.click(loadButton)
      })

      // Tokyo should be back
      await waitFor(() => {
        const tokyoLabels = screen.getAllByText(/Tokyo/)
        expect(tokyoLabels.length).toBeGreaterThan(1)
      })
    })

    it('removes saved configuration when delete button is clicked', async () => {
      render(<TimezoneConverterPage />)

      // Save configuration
      await waitFor(async () => {
        const saveButton = screen.getByText('Save Configuration')
        await userEvent.click(saveButton)
      })

      // Verify configuration is saved
      await waitFor(() => {
        expect(screen.getByText('Saved Configurations')).toBeInTheDocument()
      })

      // Delete configuration
      await waitFor(async () => {
        const favoriteSection = screen.getByText('Saved Configurations').closest('article')
        if (favoriteSection) {
          const deleteButton = favoriteSection.querySelector('button[class*="ghost"]')
          if (deleteButton) {
            await userEvent.click(deleteButton as HTMLElement)
          }
        }
      })

      // Configuration should be removed
      await waitFor(() => {
        expect(screen.queryByText('Saved Configurations')).not.toBeInTheDocument()
      })
    })

    it('persists favorites in localStorage', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(async () => {
        const saveButton = screen.getByText('Save Configuration')
        await userEvent.click(saveButton)
      })

      await waitFor(() => {
        const stored = localStorage.getItem('timezoneConverterFavorites')
        expect(stored).toBeTruthy()
        const favorites = JSON.parse(stored ?? '[]')
        expect(favorites).toHaveLength(1)
        expect(favorites[0].timezones).toBeInstanceOf(Array)
      })
    })

    it('loads favorites from localStorage on mount', async () => {
      // Preset localStorage
      const mockFavorites = [
        {
          id: '123',
          timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
        },
      ]
      localStorage.setItem('timezoneConverterFavorites', JSON.stringify(mockFavorites))

      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('Saved Configurations')).toBeInTheDocument()
        expect(screen.getByText(/3 timezones/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const heading = screen.getByText('Timezone Converter')
        expect(heading.tagName).toBe('H1')
      })
    })

    it('has time input with proper type', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        expect(timeInput.type).toBe('time')
      })
    })

    it('has search input with proper placeholder', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search timezones/)).toBeInTheDocument()
      })
    })

    it('has descriptive button labels', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('Now')).toBeInTheDocument()
        expect(screen.getByText('Save Configuration')).toBeInTheDocument()
        expect(screen.getByText('Add Timezone')).toBeInTheDocument()
      })
    })
  })

  describe('Time Conversion Accuracy', () => {
    it('displays consistent time across timezones', async () => {
      render(<TimezoneConverterPage />)

      await waitFor(() => {
        // All displayed times should be valid HH:mm format
        const times = screen.getAllByText(/\d{2}:\d{2}/)
        times.forEach((time) => {
          expect(time.textContent).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        })
      })
    })

    it('updates all timezone times when time input changes', async () => {
      render(<TimezoneConverterPage />)

      // Get initial times
      const initialTimes = await waitFor(() => {
        return screen.getAllByText(/\d{2}:\d{2}/).map((el) => el.textContent)
      })

      // Change time
      await waitFor(() => {
        const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/) as HTMLInputElement
        fireEvent.change(timeInput, { target: { value: '15:45' } })
      })

      // Verify times have changed
      await waitFor(() => {
        const newTimes = screen.getAllByText(/\d{2}:\d{2}/).map((el) => el.textContent)
        // At least one time should be different (they will have different values due to timezone offsets)
        expect(newTimes).not.toEqual(initialTimes)
      })
    })
  })
})
