import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/tools/useCurrencyConverter', () => ({
  useCurrencyConverter: vi.fn(() => ({
    isLoading: false,
    error: null,
    rates: {
      base: 'USD',
      rates: { EUR: 0.85 },
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString(),
    },
    cacheAge: 2,
    isCacheFresh: true,
    refreshRates: vi.fn().mockResolvedValue(undefined),
    getRate: vi.fn().mockReturnValue(0.85),
    convert: vi.fn(),
    convertMultiple: vi.fn(),
  })),
}))

vi.mock('@/lib/tools/currency/currency-converter', () => ({
  formatCurrencyAmount: vi.fn(
    (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`
  ),
  getCurrencyInfo: vi.fn((code: string) => ({
    code,
    name: code,
    symbol: code,
  })),
  POPULAR_CURRENCIES: [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  ],
}))

vi.mock('@/styled-system/css', () => ({
  css: () => '',
}))

vi.mock('@/components/ui/button', () => {
  const React = require('react')
  return {
    Button: React.forwardRef(
      (props: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.Ref<HTMLButtonElement>) =>
        React.createElement('button', { ...props, ref })
    ),
  }
})

vi.mock('lucide-react', () => ({
  ArrowRightLeft: () => <svg data-testid="swap-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
}))

describe('CurrencyConverter debug', () => {
  it('renders compact mode', async () => {
    console.error('debug: before import')
    const { CurrencyConverter } = await import('../CurrencyConverter')
    console.error('debug: after import')

    render(
      <CurrencyConverter
        baseCurrency="USD"
        targetCurrency="EUR"
        onBaseCurrencyChange={vi.fn()}
        onTargetCurrencyChange={vi.fn()}
        compact
      />
    )
    console.error('debug: after render')

    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    console.error('debug: after assertion')
  })
})
