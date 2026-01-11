import { describe, expect, it, vi } from 'vitest'

// Test 1: Does the test framework work at all?
describe('Minimal test - framework check', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })
})

// Test 2: Can we import React?
describe('Minimal test - React import', () => {
  it('should import React', async () => {
    const React = await import('react')
    expect(React).toBeDefined()
  })
})

// Test 3: Can we mock and import the hook?
describe('Minimal test - hook mock', () => {
  it('should mock the hook', async () => {
    vi.mock('@/hooks/tools/useCurrencyConverter', () => ({
      useCurrencyConverter: vi.fn(() => ({
        isLoading: false,
        error: null,
        rates: null,
        cacheAge: null,
        isCacheFresh: true,
        refreshRates: vi.fn(),
        getRate: vi.fn(),
      })),
    }))

    const hook = await import('@/hooks/tools/useCurrencyConverter')
    expect(hook.useCurrencyConverter).toBeDefined()
  })
})

// Test 4: Can we import the currency utilities?
describe('Minimal test - currency utils', () => {
  it('should import currency utils', async () => {
    vi.mock('@/lib/tools/currency/currency-converter', () => ({
      formatCurrencyAmount: vi.fn(),
      getCurrencyInfo: vi.fn(),
      POPULAR_CURRENCIES: [],
    }))

    const utils = await import('@/lib/tools/currency/currency-converter')
    expect(utils.POPULAR_CURRENCIES).toBeDefined()
  })
})

// Test 5: Can we import styled-system css?
describe('Minimal test - Panda CSS', () => {
  it('should import css from styled-system', async () => {
    vi.mock('@/styled-system/css', () => ({
      css: () => '',
    }))

    const styled = await import('@/styled-system/css')
    expect(styled.css).toBeDefined()
  })
})

// Test 6: Can we mock and import the Button component?
describe('Minimal test - Button component', () => {
  it('should mock the Button component', async () => {
    vi.mock('@/components/ui/button', () => {
      const React = require('react')
      return {
        Button: React.forwardRef(
          (
            props: React.ButtonHTMLAttributes<HTMLButtonElement>,
            ref: React.Ref<HTMLButtonElement>
          ) => React.createElement('button', { ...props, ref })
        ),
      }
    })

    const { Button } = await import('@/components/ui/button')
    expect(Button).toBeDefined()
  })
})

// Test 7: The actual problematic import - CurrencyConverter
describe('Minimal test - CurrencyConverter import', () => {
  it('should import CurrencyConverter', async () => {
    // Mock everything first
    vi.mock('@/hooks/tools/useCurrencyConverter', () => ({
      useCurrencyConverter: vi.fn(() => ({
        isLoading: false,
        error: null,
        rates: null,
        cacheAge: null,
        isCacheFresh: true,
        refreshRates: vi.fn(),
        getRate: vi.fn(),
      })),
    }))

    vi.mock('@/lib/tools/currency/currency-converter', () => ({
      formatCurrencyAmount: vi.fn(),
      getCurrencyInfo: vi.fn(),
      POPULAR_CURRENCIES: [],
    }))

    vi.mock('@/styled-system/css', () => ({
      css: () => '',
    }))

    vi.mock('@/components/ui/button', () => {
      const React = require('react')
      return {
        Button: React.forwardRef(
          (
            props: React.ButtonHTMLAttributes<HTMLButtonElement>,
            ref: React.Ref<HTMLButtonElement>
          ) => React.createElement('button', { ...props, ref })
        ),
      }
    })

    vi.mock('lucide-react', () => ({
      ArrowRightLeft: () => null,
      RefreshCw: () => null,
    }))

    const { CurrencyConverter } = await import('../CurrencyConverter')
    expect(CurrencyConverter).toBeDefined()
  })
})
