import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCurrencyConverter } from '@/hooks/tools/useCurrencyConverter'
import { CurrencyConverter } from '../CurrencyConverter'

interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string
  size?: string
}

vi.mock('@/components/ui/button', () => {
  const React = require('react')

  return {
    Button: ({ variant: _variant, size: _size, ...props }: MockButtonProps) =>
      React.createElement('button', props),
  }
})

vi.mock('lucide-react', () => {
  const React = require('react')

  return {
    ArrowRightLeft: (props: React.SVGProps<SVGSVGElement>) =>
      React.createElement('svg', { ...props, 'data-testid': 'swap-icon' }),
    RefreshCw: (props: React.SVGProps<SVGSVGElement>) =>
      React.createElement('svg', { ...props, 'data-testid': 'refresh-icon' }),
  }
})

vi.mock('@/styled-system/css', () => ({
  css: () => '',
  cva: () => () => '',
  cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/lib/tools/currency/currency-converter', () => ({
  formatCurrencyAmount: vi.fn(
    (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`
  ),
  getCurrencyInfo: vi.fn((code: string) => ({
    code,
    name: code === 'USD' ? 'US Dollar' : code === 'EUR' ? 'Euro' : 'Unknown',
    symbol: code === 'USD' ? '$' : code === 'EUR' ? '€' : code,
  })),
  POPULAR_CURRENCIES: [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  ],
  fetchExchangeRates: vi.fn(),
  convertAmount: vi.fn(),
  convertBatch: vi.fn(),
  getCachedRates: vi.fn(),
  getCacheAge: vi.fn(),
  isCacheFresh: vi.fn(),
  clearCache: vi.fn(),
}))

vi.mock('@/hooks/tools/useCurrencyConverter', () => ({
  useCurrencyConverter: vi.fn(),
}))

const mockRefreshRates = vi.fn().mockResolvedValue(undefined)
const mockGetRate = vi.fn().mockReturnValue(0.85)
const mockConvert = vi.fn().mockResolvedValue({
  amount: 100,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  convertedAmount: 85,
  rate: 0.85,
})
const mockConvertMultiple = vi
  .fn()
  .mockResolvedValue([
    { amount: 100, fromCurrency: 'USD', toCurrency: 'EUR', convertedAmount: 85, rate: 0.85 },
  ])

const useCurrencyConverterMock = vi.mocked(useCurrencyConverter)

const defaultProps = {
  baseCurrency: 'USD',
  targetCurrency: 'EUR',
  onBaseCurrencyChange: vi.fn(),
  onTargetCurrencyChange: vi.fn(),
}

function createMockHookReturn() {
  return {
    isLoading: false,
    error: null,
    rates: {
      base: 'USD',
      rates: { EUR: 0.85, GBP: 0.73, JPY: 149.5 },
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString(),
    },
    cacheAge: 2,
    isCacheFresh: true,
    refreshRates: mockRefreshRates,
    getRate: mockGetRate,
    convert: mockConvert,
    convertMultiple: mockConvertMultiple,
  }
}

function renderCurrencyConverter(
  props: Partial<{
    baseCurrency: string
    targetCurrency: string
    onBaseCurrencyChange: (currency: string) => void
    onTargetCurrencyChange: (currency: string) => void
    amounts?: Array<{ label: string; value: number }>
    compact?: boolean
  }> = {}
) {
  return render(<CurrencyConverter {...defaultProps} {...props} />)
}

describe('CurrencyConverter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRate.mockReturnValue(0.85)
    mockRefreshRates.mockResolvedValue(undefined)
    useCurrencyConverterMock.mockReturnValue(createMockHookReturn())
  })

  describe('Compact Mode', () => {
    it('should render compact mode with currency selectors', () => {
      renderCurrencyConverter({ compact: true })

      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(2)
    })

    it('should display exchange rate in compact mode', () => {
      renderCurrencyConverter({ compact: true })

      expect(screen.getByText(/1 USD = 0.8500 EUR/)).toBeInTheDocument()
    })

    it('should have swap button in compact mode', () => {
      renderCurrencyConverter({ compact: true })

      const swapButton = screen.getByTestId('swap-icon').closest('button')
      expect(swapButton).toBeInTheDocument()
    })

    it('should call currency change handlers when selecting new currency in compact mode', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter({ compact: true })

      const selects = screen.getAllByRole('combobox')
      await user.selectOptions(selects[0], 'EUR')

      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('EUR')
    })

    it('should swap currencies when swap button is clicked in compact mode', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter({ compact: true })

      const swapButton = screen.getByTestId('swap-icon').closest('button')
      expect(swapButton).not.toBeNull()
      if (swapButton) {
        await user.click(swapButton)
      }

      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('EUR')
      expect(defaultProps.onTargetCurrencyChange).toHaveBeenCalledWith('USD')
    })
  })

  describe('Full Mode (Default)', () => {
    it('should render full mode with header', () => {
      renderCurrencyConverter()
      expect(screen.getByText('Currency Conversion')).toBeInTheDocument()
    })

    it('should render From and To currency labels', () => {
      renderCurrencyConverter()
      expect(screen.getByText('From Currency')).toBeInTheDocument()
      expect(screen.getByText('To Currency')).toBeInTheDocument()
    })

    it('should have refresh button in full mode', () => {
      renderCurrencyConverter()
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('should display exchange rate section', () => {
      renderCurrencyConverter()
      expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
      expect(screen.getByText(/1 \$ = 0.8500 €/)).toBeInTheDocument()
    })

    it('should display cache status when fresh', () => {
      renderCurrencyConverter()
      expect(screen.getByText(/✓ Fresh/)).toBeInTheDocument()
      expect(screen.getByText(/2h old/)).toBeInTheDocument()
    })

    it('should display cache status when stale', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        cacheAge: 20,
        isCacheFresh: false,
      })

      renderCurrencyConverter()

      expect(screen.getByText(/⚠ Stale/)).toBeInTheDocument()
      expect(screen.getByText(/20h old/)).toBeInTheDocument()
    })
  })

  describe('Currency Selection', () => {
    it('should call onBaseCurrencyChange when from currency is changed', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter()

      await user.selectOptions(screen.getByLabelText('From Currency'), 'GBP')
      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('GBP')
    })

    it('should call onTargetCurrencyChange when to currency is changed', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter()

      await user.selectOptions(screen.getByLabelText('To Currency'), 'JPY')
      expect(defaultProps.onTargetCurrencyChange).toHaveBeenCalledWith('JPY')
    })

    it('should swap currencies when swap button is clicked', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter()

      const swapButton = screen.getByTestId('swap-icon').closest('button')
      expect(swapButton).not.toBeNull()
      if (swapButton) {
        await user.click(swapButton)
      }

      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('EUR')
      expect(defaultProps.onTargetCurrencyChange).toHaveBeenCalledWith('USD')
    })
  })

  describe('Refresh Functionality', () => {
    it('should call refreshRates when refresh button is clicked', async () => {
      const user = userEvent.setup()
      renderCurrencyConverter()

      await user.click(screen.getByRole('button', { name: /refresh/i }))
      expect(mockRefreshRates).toHaveBeenCalledWith('USD')
    })

    it('should disable refresh button while refreshing', async () => {
      const user = userEvent.setup()

      let resolveRefresh: (() => void) | undefined
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve
      })

      mockRefreshRates.mockReturnValue(refreshPromise)

      renderCurrencyConverter()

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      expect(refreshButton).toBeDisabled()

      if (resolveRefresh) {
        resolveRefresh()
      }

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })
    })
  })

  describe('Converted Amounts', () => {
    it('should display converted amounts when amounts prop is provided', () => {
      renderCurrencyConverter({
        amounts: [
          { label: 'Total', value: 100 },
          { label: 'Subtotal', value: 50 },
        ],
      })

      expect(screen.getByText('Converted Amounts')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('Subtotal')).toBeInTheDocument()
    })

    it('should not display converted amounts section when amounts is empty', () => {
      renderCurrencyConverter({ amounts: [] })
      expect(screen.queryByText('Converted Amounts')).not.toBeInTheDocument()
    })

    it('should show original and converted amounts', () => {
      renderCurrencyConverter({ amounts: [{ label: 'Total', value: 100 }] })
      expect(screen.getByText('USD 100.00')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display loading message when loading', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        isLoading: true,
        getRate: vi.fn().mockReturnValue(null),
      })

      renderCurrencyConverter()
      expect(screen.getByText('Loading exchange rates...')).toBeInTheDocument()
    })

    it('should not show exchange rate section while loading', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        isLoading: true,
        getRate: vi.fn().mockReturnValue(null),
      })

      renderCurrencyConverter()
      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        error: 'Failed to fetch rates',
      })

      renderCurrencyConverter()
      expect(screen.getByText(/⚠ Failed to fetch rates/)).toBeInTheDocument()
    })
  })

  describe('No Rate Available', () => {
    it('should not show exchange rate when rate is null', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        getRate: vi.fn().mockReturnValue(null),
      })

      renderCurrencyConverter()
      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })

    it('should not show exchange rate in compact mode when rate is null', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        getRate: vi.fn().mockReturnValue(null),
      })

      renderCurrencyConverter({ compact: true })
      expect(screen.queryByText(/1 USD =/)).not.toBeInTheDocument()
    })
  })

  describe('Cache Age Colors', () => {
    it('should show green color for fresh cache (< 12h)', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        cacheAge: 5,
        isCacheFresh: true,
      })

      renderCurrencyConverter()
      expect(screen.getByText(/✓ Fresh/)).toBeInTheDocument()
    })

    it('should show cache age for medium-aged cache (12-20h)', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        cacheAge: 15,
        isCacheFresh: true,
      })

      renderCurrencyConverter()
      expect(screen.getByText(/15h old/)).toBeInTheDocument()
    })

    it('should show stale indicator for old cache (>= 20h)', () => {
      useCurrencyConverterMock.mockReturnValue({
        ...createMockHookReturn(),
        cacheAge: 25,
        isCacheFresh: false,
      })

      renderCurrencyConverter()
      expect(screen.getByText(/⚠ Stale/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have labeled select elements in full mode', () => {
      renderCurrencyConverter()
      expect(screen.getByLabelText('From Currency')).toBeInTheDocument()
      expect(screen.getByLabelText('To Currency')).toBeInTheDocument()
    })

    it('should have accessible refresh button', () => {
      renderCurrencyConverter()
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })
  })
})
