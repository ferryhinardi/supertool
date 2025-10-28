import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import UnitConverterPage from '../page'

// Mock nuqs
vi.mock('nuqs', () => ({
  parseAsString: {
    withDefault: (defaultValue: string) => ({
      defaultValue,
      parse: (value: string) => value,
    }),
  },
  parseAsStringEnum: (values: string[]) => ({
    withDefault: (defaultValue: string) => ({
      defaultValue,
      parse: (value: string) => (values.includes(value) ? value : defaultValue),
    }),
  }),
  useQueryState: (key: string, parser: { defaultValue: unknown }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useState(parser.defaultValue)
  },
}))

describe('Unit Converter Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('Unit Converter')).toBeInTheDocument()
    })

    it('renders all 11 category buttons', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('Length')).toBeInTheDocument()
      expect(screen.getByText('Weight / Mass')).toBeInTheDocument()
      expect(screen.getByText('Temperature')).toBeInTheDocument()
      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(screen.getByText('Area')).toBeInTheDocument()
      expect(screen.getByText('Speed')).toBeInTheDocument()
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('Pressure')).toBeInTheDocument()
      expect(screen.getByText('Energy')).toBeInTheDocument()
      expect(screen.getByText('Power')).toBeInTheDocument()
      expect(screen.getByText('Digital Storage')).toBeInTheDocument()
    })

    it('renders default conversion inputs', () => {
      render(<UnitConverterPage />)
      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('1')
    })

    it('renders swap button', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('Swap Units')).toBeInTheDocument()
    })
  })

  describe('Category Selection', () => {
    it('changes category when button is clicked', async () => {
      render(<UnitConverterPage />)

      const weightButton = screen.getByText('Weight / Mass')
      fireEvent.click(weightButton)

      await waitFor(() => {
        expect(screen.getByText('Convert Weight / Mass')).toBeInTheDocument()
      })
    })

    it('updates available units when category changes', async () => {
      render(<UnitConverterPage />)

      // Initially on Length category
      const fromSelects = screen.getAllByRole('combobox')
      expect(fromSelects[0]).toHaveValue('meter')

      // Switch to Temperature
      const tempButton = screen.getByText('Temperature')
      fireEvent.click(tempButton)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects[0]).toHaveValue('celsius')
      })
    })

    it('displays correct number of units per category', () => {
      render(<UnitConverterPage />)

      // Length should show "11 units"
      const lengthButton = screen.getByText('Length').closest('button')
      expect(lengthButton).toHaveTextContent('11 units')

      // Temperature should show "3 units"
      const tempButton = screen.getByText('Temperature').closest('button')
      expect(tempButton).toHaveTextContent('3 units')
    })
  })

  describe('Unit Conversion', () => {
    it('performs conversion when input value changes', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '10' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).not.toBe('')
        expect(parseFloat(result.value)).toBeGreaterThan(0)
      })
    })

    it('converts meters to feet correctly', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '1' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        const value = parseFloat(result.value)
        expect(value).toBeCloseTo(3.28084, 1)
      })
    })

    it('handles empty input gracefully', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result).toHaveValue('')
      })
    })

    it('handles zero input correctly', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '0' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result).toHaveValue('0')
      })
    })

    it('updates conversion when from unit changes', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '1000' } })

      const fromSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
      fireEvent.change(fromSelect, { target: { value: 'kilometer' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        const value = parseFloat(result.value)
        expect(value).toBeGreaterThan(3000) // 1000 km is more than 3000 feet
      })
    })

    it('updates conversion when to unit changes', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '1' } })

      const toSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement
      fireEvent.change(toSelect, { target: { value: 'kilometer' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        const value = parseFloat(result.value)
        expect(value).toBeCloseTo(0.001, 5)
      })
    })
  })

  describe('Swap Units', () => {
    it('swaps units when swap button is clicked', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '10' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).not.toBe('')
      })

      const resultBeforeSwap = (screen.getByPlaceholderText('Result') as HTMLInputElement).value

      const swapButton = screen.getByText('Swap Units')
      fireEvent.click(swapButton)

      await waitFor(() => {
        const inputAfterSwap = screen.getByPlaceholderText('Enter value') as HTMLInputElement
        expect(inputAfterSwap.value).toBe(resultBeforeSwap)
      })
    })

    it('swaps unit dropdowns correctly', async () => {
      render(<UnitConverterPage />)

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
      const fromUnitBefore = selects[0].value
      const toUnitBefore = selects[1].value

      const swapButton = screen.getByText('Swap Units')
      fireEvent.click(swapButton)

      await waitFor(() => {
        const selectsAfter = screen.getAllByRole('combobox') as HTMLSelectElement[]
        expect(selectsAfter[0].value).toBe(toUnitBefore)
        expect(selectsAfter[1].value).toBe(fromUnitBefore)
      })
    })
  })

  describe('Favorites', () => {
    it('shows add to favorites button initially', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('Add to Favorites')).toBeInTheDocument()
    })

    it('adds conversion to favorites when button is clicked', async () => {
      render(<UnitConverterPage />)

      const addButton = screen.getByText('Add to Favorites')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Favorite Conversions')).toBeInTheDocument()
      })
    })

    it('displays favorite conversion details', async () => {
      render(<UnitConverterPage />)

      const addButton = screen.getByText('Add to Favorites')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getAllByText('Length').length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Meter/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Foot/).length).toBeGreaterThan(0)
      })
    })

    it('loads favorite when clicked', async () => {
      render(<UnitConverterPage />)

      // Change to different units
      const tempButton = screen.getByText('Temperature')
      fireEvent.click(tempButton)

      await waitFor(() => {
        expect(screen.getByText('Convert Temperature')).toBeInTheDocument()
      })

      // Add as favorite
      const addButton = screen.getByText('Add to Favorites')
      fireEvent.click(addButton)

      // Switch back to Length
      const lengthButton = screen.getByText('Length')
      fireEvent.click(lengthButton)

      await waitFor(() => {
        expect(screen.getByText('Convert Length')).toBeInTheDocument()
      })

      // Click on favorite to load it
      await waitFor(() => {
        const temperatureBadges = screen.getAllByText('Temperature')
        // Find the Temperature badge in the favorites section (not the category button)
        const favoriteBadge = temperatureBadges.find((badge) =>
          badge.closest('article')?.textContent?.includes('Favorite Conversions')
        )
        if (favoriteBadge) {
          fireEvent.click(favoriteBadge)
        }
      })

      await waitFor(
        () => {
          expect(screen.getByText('Convert Temperature')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('removes favorite when delete button is clicked', async () => {
      render(<UnitConverterPage />)

      // Add favorite
      const addButton = screen.getByText('Add to Favorites')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Favorite Conversions')).toBeInTheDocument()
      })

      // Find and click delete button (Trash icon)
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('svg[class*="lucide-trash"]')
      )
      if (deleteButton) {
        fireEvent.click(deleteButton)
      }

      await waitFor(() => {
        expect(screen.queryByText('Favorite Conversions')).not.toBeInTheDocument()
      })
    })

    it('persists favorites in localStorage', async () => {
      render(<UnitConverterPage />)

      const addButton = screen.getByText('Add to Favorites')
      fireEvent.click(addButton)

      await waitFor(() => {
        const stored = localStorage.getItem('unitConverterFavorites')
        expect(stored).toBeTruthy()
        const favorites = JSON.parse(stored ?? '[]')
        expect(favorites).toHaveLength(1)
        expect(favorites[0].category).toBe('length')
      })
    })
  })

  describe('Temperature Conversions', () => {
    it('converts celsius to fahrenheit correctly', async () => {
      render(<UnitConverterPage />)

      // Switch to Temperature
      const tempButton = screen.getByText('Temperature')
      fireEvent.click(tempButton)

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
        fireEvent.change(input, { target: { value: '0' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).toBe('32')
      })
    })

    it('converts fahrenheit to celsius correctly', async () => {
      render(<UnitConverterPage />)

      // Switch to Temperature
      const tempButton = screen.getByText('Temperature')
      fireEvent.click(tempButton)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
        fireEvent.change(selects[0], { target: { value: 'fahrenheit' } })
        fireEvent.change(selects[1], { target: { value: 'celsius' } })
      })

      const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement
      fireEvent.change(input, { target: { value: '32' } })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).toBe('0')
      })
    })
  })

  describe('Pro Tips Section', () => {
    it('displays pro tips', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText(/swap button/)).toBeInTheDocument()
      expect(screen.getByText(/favorites/)).toBeInTheDocument()
    })
  })

  describe('Conversion Formula Display', () => {
    it('shows conversion formula when result is available', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value')
      fireEvent.change(input, { target: { value: '1' } })

      await waitFor(() => {
        expect(screen.getByText('Conversion Formula')).toBeInTheDocument()
        expect(screen.getByText(/1 m =/)).toBeInTheDocument()
      })
    })

    it('hides formula when input is empty', async () => {
      render(<UnitConverterPage />)

      const input = screen.getByPlaceholderText('Enter value')
      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        expect(screen.queryByText('Conversion Formula')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<UnitConverterPage />)
      const heading = screen.getByText('Unit Converter')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive labels for inputs', () => {
      render(<UnitConverterPage />)
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('To')).toBeInTheDocument()
    })

    it('has placeholder text for inputs', () => {
      render(<UnitConverterPage />)
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Result')).toBeInTheDocument()
    })
  })
})
