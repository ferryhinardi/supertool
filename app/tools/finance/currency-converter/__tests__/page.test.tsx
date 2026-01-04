import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import CurrencyConverterPage from '../page'

// Mock fetch for exchange rates API
globalThis.fetch = vi.fn()

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

const mockExchangeRates = {
  rates: {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.5,
    IDR: 14500,
    SGD: 1.35,
    AUD: 1.32,
    CAD: 1.25,
  },
  base: 'USD',
  timestamp: Date.now() / 1000,
}

describe('Currency Converter Page', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset fetch mock
    vi.clearAllMocks()
    ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockExchangeRates,
    })
  })

  describe('Initial Render', () => {
    it('renders the page title', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Currency Converter')).toBeInTheDocument()
      })
    })

    it('renders description', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText(/Convert between 150\+ world currencies/)).toBeInTheDocument()
      })
    })

    it('renders default conversion inputs', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
        expect(input).toBeInTheDocument()
        expect(input).toHaveValue('100')
      })
    })

    it('renders swap button', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Swap')).toBeInTheDocument()
      })
    })

    it('renders refresh rates button', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Refresh Rates')).toBeInTheDocument()
      })
    })
  })

  describe('Exchange Rates Loading', () => {
    it('fetches exchange rates on mount', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('/api/exchange-rates')
      })
    })

    it('displays loading state initially', () => {
      render(<CurrencyConverterPage />)
      const result = screen.getByPlaceholderText('Result') as HTMLInputElement
      expect(result.value).toBe('Loading...')
    })

    it('displays rates after successful fetch', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).not.toBe('Loading...')
        expect(result.value).not.toBe('')
      })
    })

    it('displays error message when fetch fails', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      render(<CurrencyConverterPage />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to load exchange rates/)).toBeInTheDocument()
      })
    })

    it('shows last updated time', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
      })
    })
  })

  describe('Currency Conversion', () => {
    it('converts USD to IDR correctly', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // 100 USD * 14500 = 1,450,000 IDR
        expect(result.value).toContain('1.450.000')
      })
    })

    it('updates conversion when amount changes', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
        fireEvent.change(input, { target: { value: '200' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // 200 USD * 14500 = 2,900,000 IDR
        expect(result.value).toContain('2.900.000')
      })
    })

    it('handles empty input gracefully', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
        fireEvent.change(input, { target: { value: '' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result).toHaveValue('')
      })
    })

    it('handles zero input correctly', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
        fireEvent.change(input, { target: { value: '0' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result).toHaveValue('0,00')
      })
    })

    it('updates conversion when from currency changes', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const fromSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
        fireEvent.change(fromSelect, { target: { value: 'EUR' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // Conversion should be different from USD to IDR
        expect(result.value).not.toBe('')
      })
    })

    it('updates conversion when to currency changes', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const toSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement
        fireEvent.change(toSelect, { target: { value: 'EUR' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // 100 USD * 0.85 = 85 EUR
        expect(result.value).toContain('85')
      })
    })
  })

  describe('Swap Currencies', () => {
    it('swaps currencies when swap button is clicked', async () => {
      render(<CurrencyConverterPage />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Swap')).toBeInTheDocument()
      })

      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
      const fromCurrencyBefore = selects[0].value
      const toCurrencyBefore = selects[1].value

      const swapButton = screen.getByText('Swap')
      await userEvent.click(swapButton as HTMLElement)

      // Wait for swap to complete
      await waitFor(() => {
        expect(selects[0].value).toBe(toCurrencyBefore)
        expect(selects[1].value).toBe(fromCurrencyBefore)
      })
    })

    it('swaps amount value when swapping', async () => {
      render(<CurrencyConverterPage />)

      // Wait for initial conversion
      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).not.toBe('')
        expect(result.value).not.toBe('Loading...')
      })

      // Get initial values
      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
      const fromCurrencyBefore = selects[0].value
      const toCurrencyBefore = selects[1].value

      // Swap
      const swapButton = screen.getByText('Swap')
      await userEvent.click(swapButton as HTMLElement)

      // Verify currencies swapped
      await waitFor(() => {
        const selectsAfter = screen.getAllByRole('combobox') as HTMLSelectElement[]
        expect(selectsAfter[0].value).toBe(toCurrencyBefore)
        expect(selectsAfter[1].value).toBe(fromCurrencyBefore)
      })
    })
  })

  describe('Refresh Rates', () => {
    it('refetches rates when refresh button is clicked', async () => {
      render(<CurrencyConverterPage />)

      // Wait for initial fetch to complete
      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        expect(result.value).not.toBe('Loading...')
      })

      // Mock a delayed response for the refresh
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockExchangeRates,
                }),
              50
            )
          )
      )

      // Click refresh
      const refreshButton = screen.getByText('Refresh Rates')
      await userEvent.click(refreshButton as HTMLElement)

      // Verify button is disabled during loading
      await waitFor(() => {
        expect(refreshButton).toBeDisabled()
      })

      // Wait for refresh to complete
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })
    })

    it('disables refresh button while loading', async () => {
      render(<CurrencyConverterPage />)

      const refreshButton = screen.getByText('Refresh Rates') as HTMLButtonElement

      // Initially, should be enabled after first load
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })

      // Mock a delayed response for the refresh
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockExchangeRates,
                }),
              50
            )
          )
      )

      // Click to refresh
      await userEvent.click(refreshButton as HTMLElement)

      // Should be disabled during loading (briefly)
      await waitFor(() => {
        expect(refreshButton).toBeDisabled()
      })

      // Should be enabled again after load
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })
    })
  })

  describe('Favorites', () => {
    it('shows add to favorites button initially', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Favorite')).toBeInTheDocument()
      })
    })

    it('adds currency pair to favorites when button is clicked', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(async () => {
        const addButton = screen.getByText('Favorite')
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText('Favorite Conversions')).toBeInTheDocument()
      })
    })

    it('displays favorite conversion details', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(async () => {
        const addButton = screen.getByText('Favorite')
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText('Favorite Conversions')).toBeInTheDocument()
        expect(screen.getAllByText('USD').length).toBeGreaterThan(0)
        expect(screen.getAllByText('IDR').length).toBeGreaterThan(0)
      })
    })

    it('loads favorite when clicked', async () => {
      render(<CurrencyConverterPage />)

      // Change to different currencies
      await waitFor(() => {
        const fromSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
        const toSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement
        fireEvent.change(fromSelect, { target: { value: 'EUR' } })
        fireEvent.change(toSelect, { target: { value: 'GBP' } })
      })

      // Add as favorite
      await waitFor(async () => {
        const addButton = screen.getByText('Favorite')
        await userEvent.click(addButton as HTMLElement)
      })

      // Change back to different currencies
      await waitFor(() => {
        const fromSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
        fireEvent.change(fromSelect, { target: { value: 'USD' } })
      })

      // Click on favorite to load it
      await waitFor(async () => {
        const favoriteButtons = screen.getAllByRole('button')
        const favoriteButton = favoriteButtons.find(
          (btn) => btn.textContent?.includes('EUR') && btn.textContent?.includes('GBP')
        )
        if (favoriteButton) {
          await userEvent.click(favoriteButton as HTMLElement)
        }
      })

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
        expect(selects[0].value).toBe('EUR')
        expect(selects[1].value).toBe('GBP')
      })
    })

    it('removes favorite when delete button is clicked', async () => {
      render(<CurrencyConverterPage />)

      // Add favorite
      await waitFor(async () => {
        const addButton = screen.getByText('Favorite')
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText('Favorite Conversions')).toBeInTheDocument()
      })

      // Find and click delete button (Trash icon)
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find((btn) =>
        btn.querySelector('svg[class*="lucide-trash"]')
      )
      if (deleteButton) {
        await userEvent.click(deleteButton as HTMLElement)
      }

      await waitFor(() => {
        expect(screen.queryByText('Favorite Conversions')).not.toBeInTheDocument()
      })
    })

    it('persists favorites in localStorage', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(async () => {
        const addButton = screen.getByText('Favorite')
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        const stored = localStorage.getItem('currencyConverterFavorites')
        expect(stored).toBeTruthy()
        const favorites = JSON.parse(stored ?? '[]')
        expect(favorites).toHaveLength(1)
        expect(favorites[0].fromCurrency).toBe('USD')
        expect(favorites[0].toCurrency).toBe('IDR')
      })
    })
  })

  describe('Exchange Rate Display', () => {
    it('shows exchange rate formula', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
        expect(screen.getByText(/1 USD =/)).toBeInTheDocument()
      })
    })

    it('updates exchange rate when currencies change', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const toSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement
        fireEvent.change(toSelect, { target: { value: 'EUR' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/1 USD = 0\.85/)).toBeInTheDocument()
      })
    })
  })

  describe('Pro Tips Section', () => {
    it('displays pro tips', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        const heading = screen.getByText('Currency Converter')
        expect(heading.tagName).toBe('H1')
      })
    })

    it('has descriptive labels for inputs', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByText('From')).toBeInTheDocument()
        expect(screen.getByText('To')).toBeInTheDocument()
      })
    })

    it('has placeholder text for inputs', async () => {
      render(<CurrencyConverterPage />)
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Result')).toBeInTheDocument()
      })
    })

    it('disables inputs and buttons when loading', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => mockExchangeRates,
              })
            }, 1000)
          })
      )

      render(<CurrencyConverterPage />)

      const input = screen.getByPlaceholderText('Enter amount') as HTMLInputElement
      const refreshButton = screen.getByText('Refresh Rates') as HTMLButtonElement

      expect(input).toBeDisabled()
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Currency Formatting', () => {
    it('formats IDR with proper locale', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // IDR uses dot for thousands, comma for decimals
        expect(result.value).toMatch(/\d{1,3}(\.\d{3})*,\d{2}/)
      })
    })

    it('formats USD with proper locale', async () => {
      render(<CurrencyConverterPage />)

      await waitFor(() => {
        const toSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement
        fireEvent.change(toSelect, { target: { value: 'USD' } })
      })

      await waitFor(() => {
        const result = screen.getByPlaceholderText('Result') as HTMLInputElement
        // USD uses comma for thousands, dot for decimals
        expect(result.value).toMatch(/\d{1,3}(,\d{3})*\.\d{2}/)
      })
    })
  })
})
