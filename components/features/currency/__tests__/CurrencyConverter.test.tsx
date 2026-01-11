import type * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ============================================================================
// TEST FILE FOR CurrencyConverter
// Uses per-test mock setup to avoid @ark-ui/react hanging issues
// ============================================================================

// Mock functions - defined once, reused across tests
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

// Default mock return value factory
const createMockHookReturn = () => ({
  isLoading: false,
  error: null as string | null,
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
})

// Create the mock for useCurrencyConverter - can be customized per test
const useCurrencyConverterMock = vi.fn(createMockHookReturn)

/**
 * Helper to set up all mocks and return imported modules.
 * This pattern ensures mocks are registered before module loading.
 */
async function setupTest() {
  // Register all mocks
  vi.doMock('@radix-ui/react-slot', () => ({
    Slot: ({ children }: { children: React.ReactNode }) => children,
  }))

  vi.doMock('@/components/ui/button', () => {
    const React = require('react')
    return {
      Button: React.forwardRef(
        (
          props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
            variant?: string
            size?: string
          },
          ref: React.Ref<HTMLButtonElement>
        ) => {
          const { variant: _v, size: _s, ...rest } = props
          return React.createElement('button', { ...rest, ref })
        }
      ),
    }
  })

  vi.doMock('lucide-react', () => {
    const React = require('react')
    return {
      ArrowRightLeft: React.forwardRef(
        (props: React.SVGProps<SVGSVGElement>, ref: React.Ref<SVGSVGElement>) =>
          React.createElement('svg', { ...props, ref, 'data-testid': 'swap-icon' })
      ),
      RefreshCw: React.forwardRef(
        (props: React.SVGProps<SVGSVGElement>, ref: React.Ref<SVGSVGElement>) =>
          React.createElement('svg', { ...props, ref, 'data-testid': 'refresh-icon' })
      ),
    }
  })

  vi.doMock('@/styled-system/css', () => ({
    css: () => '',
    cva: () => () => '',
    cx: (...args: unknown[]) => args.filter(Boolean).join(' '),
  }))

  vi.doMock('@/lib/tools/currency/currency-converter', () => ({
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

  vi.doMock('@/hooks/tools/useCurrencyConverter', () => ({
    useCurrencyConverter: useCurrencyConverterMock,
  }))

  // Now import everything after mocks are set
  const testingLib = await import('@testing-library/react')
  const userEventLib = await import('@testing-library/user-event')
  const reactQuery = await import('@tanstack/react-query')
  const component = await import('../CurrencyConverter')

  const queryClient = new reactQuery.QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return {
    render: testingLib.render,
    screen: testingLib.screen,
    waitFor: testingLib.waitFor,
    userEvent: userEventLib.default,
    QueryClientProvider: reactQuery.QueryClientProvider,
    CurrencyConverter: component.CurrencyConverter,
    queryClient,
  }
}

describe('CurrencyConverter Component', () => {
  const defaultProps = {
    baseCurrency: 'USD',
    targetCurrency: 'EUR',
    onBaseCurrencyChange: vi.fn(),
    onTargetCurrencyChange: vi.fn(),
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockGetRate.mockReturnValue(0.85)
    mockRefreshRates.mockResolvedValue(undefined)
    useCurrencyConverterMock.mockImplementation(createMockHookReturn)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Compact Mode', () => {
    it('should render compact mode with currency selectors', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(2)
    })

    it('should display exchange rate in compact mode', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

      expect(screen.getByText(/1 USD = 0.8500 EUR/)).toBeInTheDocument()
    })

    it('should have swap button in compact mode', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

      const swapButton = screen.getByTestId('swap-icon').closest('button')
      expect(swapButton).toBeInTheDocument()
    })

    it('should call currency change handlers when selecting new currency in compact mode', async () => {
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

      const selects = screen.getAllByRole('combobox')
      const fromSelect = selects[0]

      await user.selectOptions(fromSelect, 'EUR')

      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('EUR')
    })

    it('should swap currencies when swap button is clicked in compact mode', async () => {
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

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
    it('should render full mode with header', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText('Currency Conversion')).toBeInTheDocument()
    })

    it('should render From and To currency labels', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText('From Currency')).toBeInTheDocument()
      expect(screen.getByText('To Currency')).toBeInTheDocument()
    })

    it('should have refresh button in full mode', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('should display exchange rate section', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
      expect(screen.getByText(/1 \$ = 0.8500 €/)).toBeInTheDocument()
    })

    it('should display cache status when fresh', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText(/✓ Fresh/)).toBeInTheDocument()
      expect(screen.getByText(/2h old/)).toBeInTheDocument()
    })

    it('should display cache status when stale', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        cacheAge: 20,
        isCacheFresh: false,
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText(/⚠ Stale/)).toBeInTheDocument()
      expect(screen.getByText(/20h old/)).toBeInTheDocument()
    })
  })

  describe('Currency Selection', () => {
    it('should call onBaseCurrencyChange when from currency is changed', async () => {
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      const fromSelect = screen.getByLabelText('From Currency')
      await user.selectOptions(fromSelect, 'GBP')

      expect(defaultProps.onBaseCurrencyChange).toHaveBeenCalledWith('GBP')
    })

    it('should call onTargetCurrencyChange when to currency is changed', async () => {
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      const toSelect = screen.getByLabelText('To Currency')
      await user.selectOptions(toSelect, 'JPY')

      expect(defaultProps.onTargetCurrencyChange).toHaveBeenCalledWith('JPY')
    })

    it('should swap currencies when swap button is clicked', async () => {
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

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
      const { render, screen, userEvent, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      expect(mockRefreshRates).toHaveBeenCalledWith('USD')
    })

    it('should disable refresh button while refreshing', async () => {
      const {
        render,
        screen,
        userEvent,
        waitFor,
        QueryClientProvider,
        CurrencyConverter,
        queryClient,
      } = await setupTest()
      const React = require('react')
      const user = userEvent.setup()

      let resolveRefresh: (() => void) | undefined
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve
      })

      mockRefreshRates.mockReturnValue(refreshPromise)

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

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
    it('should display converted amounts when amounts prop is provided', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      const amounts = [
        { label: 'Total', value: 100 },
        { label: 'Subtotal', value: 50 },
      ]

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, amounts })
        )
      )

      expect(screen.getByText('Converted Amounts')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('Subtotal')).toBeInTheDocument()
    })

    it('should not display converted amounts section when amounts is empty', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, amounts: [] })
        )
      )

      expect(screen.queryByText('Converted Amounts')).not.toBeInTheDocument()
    })

    it('should show original and converted amounts', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      const amounts = [{ label: 'Total', value: 100 }]

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, amounts })
        )
      )

      expect(screen.getByText('USD 100.00')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display loading message when loading', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        isLoading: true,
        getRate: vi.fn().mockReturnValue(null),
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText('Loading exchange rates...')).toBeInTheDocument()
    })

    it('should not show exchange rate section while loading', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        isLoading: true,
        getRate: vi.fn().mockReturnValue(null),
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when error occurs', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        error: 'Failed to fetch rates',
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText(/⚠ Failed to fetch rates/)).toBeInTheDocument()
    })
  })

  describe('No Rate Available', () => {
    it('should not show exchange rate when rate is null', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        getRate: vi.fn().mockReturnValue(null),
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })

    it('should not show exchange rate in compact mode when rate is null', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        getRate: vi.fn().mockReturnValue(null),
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps, compact: true })
        )
      )

      expect(screen.queryByText(/1 USD =/)).not.toBeInTheDocument()
    })
  })

  describe('Cache Age Colors', () => {
    it('should show green color for fresh cache (< 12h)', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        cacheAge: 5,
        isCacheFresh: true,
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      const cacheStatus = screen.getByText(/✓ Fresh/)
      expect(cacheStatus).toBeInTheDocument()
    })

    it('should show cache age for medium-aged cache (12-20h)', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        cacheAge: 15,
        isCacheFresh: true,
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText(/15h old/)).toBeInTheDocument()
    })

    it('should show stale indicator for old cache (>= 20h)', async () => {
      useCurrencyConverterMock.mockImplementation(() => ({
        ...createMockHookReturn(),
        cacheAge: 25,
        isCacheFresh: false,
      }))

      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByText(/⚠ Stale/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have labeled select elements in full mode', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      expect(screen.getByLabelText('From Currency')).toBeInTheDocument()
      expect(screen.getByLabelText('To Currency')).toBeInTheDocument()
    })

    it('should have accessible refresh button', async () => {
      const { render, screen, QueryClientProvider, CurrencyConverter, queryClient } =
        await setupTest()
      const React = require('react')

      render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(CurrencyConverter, { ...defaultProps })
        )
      )

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
    })
  })
})
