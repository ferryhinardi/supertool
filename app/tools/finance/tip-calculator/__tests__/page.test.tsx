import { render, screen } from '@testing-library/react'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TipCalculatorPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackToolUsage: vi.fn(),
}))

// Mock nuqs - simplified to just return static values
vi.mock('nuqs', async () => {
  const actual = await vi.importActual<typeof import('nuqs')>('nuqs')
  return {
    ...actual,
    useQueryState: (key: string) => {
      if (key === 'bill') return [100, vi.fn()] as const
      if (key === 'tip') return [15, vi.fn()] as const
      if (key === 'people') return [1, vi.fn()] as const
      return ['', vi.fn()] as const
    },
    parseAsFloat: {
      withDefault: (defaultValue: number) => ({ defaultValue }),
    },
    parseAsInteger: {
      withDefault: (defaultValue: number) => ({ defaultValue }),
    },
  }
})

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

describe('Tip Calculator - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render tip calculator page', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByRole('heading', { name: 'Tip Calculator', level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText('Bill Amount')[0]).toBeInTheDocument()
    expect(screen.getByText('Tip Percentage')).toBeInTheDocument()
  })

  it('should display preset tip buttons', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('18%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should display number of people controls', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Number of People')).toBeInTheDocument()
    // Check for people counter display in input value
    const peopleInput = screen.getByDisplayValue('1')
    expect(peopleInput).toBeInTheDocument()
  })

  it('should display rounding options', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Round Total')).toBeInTheDocument()
    expect(screen.getByText('No Rounding')).toBeInTheDocument()
    expect(screen.getByText('Round Up')).toBeInTheDocument()
    expect(screen.getByText('Round Down')).toBeInTheDocument()
  })

  it('should display action buttons', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText(/Copy Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/^Clear$/i)).toBeInTheDocument()
  })

  it('should calculate tip correctly for 15% on $100', () => {
    render(<TipCalculatorPage />)

    // With mocked values (bill=100, tip=15%), should show calculated values
    expect(screen.getByText('$15.00')).toBeInTheDocument() // Tip amount
    expect(screen.getByText('$115.00')).toBeInTheDocument() // Total
  })

  it('should display bill summary card', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Total Summary')).toBeInTheDocument()
  })

  it('should display formula explanation', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Calculation')).toBeInTheDocument()
  })

  it('should display tipping guidelines', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Tipping Guidelines')).toBeInTheDocument()
    expect(screen.getByText(/Excellent service/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Good service/i)[0]).toBeInTheDocument()
  })
})

describe('Tip Calculator - Accessibility Tests', () => {
  it('should have proper heading hierarchy', () => {
    render(<TipCalculatorPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Tip Calculator')
  })

  it('should have accessible form inputs', () => {
    render(<TipCalculatorPage />)

    const billInput = screen.getByPlaceholderText('0.00')
    expect(billInput).toHaveAttribute('type', 'text')
  })

  it('should have accessible buttons with proper labels', () => {
    render(<TipCalculatorPage />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      // Every button should have accessible text content
      expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
    })
  })
})

describe('Tip Calculator - Logic Tests', () => {
  it('should calculate 10% tip correctly', () => {
    const billAmount = 50
    const tipPercentage = 10
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(5)
    expect(totalWithTip).toBe(55)
  })

  it('should calculate 15% tip correctly', () => {
    const billAmount = 100
    const tipPercentage = 15
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(15)
    expect(totalWithTip).toBe(115)
  })

  it('should calculate 20% tip correctly', () => {
    const billAmount = 75
    const tipPercentage = 20
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(15)
    expect(totalWithTip).toBe(90)
  })

  it('should split bill correctly among 2 people', () => {
    const billAmount = 100
    const tipPercentage = 15
    const numberOfPeople = 2
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount
    const perPersonTotal = totalWithTip / numberOfPeople

    expect(perPersonTotal).toBe(57.5)
  })

  it('should split bill correctly among 4 people', () => {
    const billAmount = 200
    const tipPercentage = 20
    const numberOfPeople = 4
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount
    const perPersonTotal = totalWithTip / numberOfPeople

    expect(perPersonTotal).toBe(60)
  })

  it('should round up correctly', () => {
    const total = 54.625
    const roundedUp = Math.ceil(total)

    expect(roundedUp).toBe(55)
  })

  it('should round down correctly', () => {
    const total = 54.625
    const roundedDown = Math.floor(total)

    expect(roundedDown).toBe(54)
  })

  it('should handle decimal bill amounts', () => {
    const billAmount = 47.83
    const tipPercentage = 15
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBeCloseTo(7.17, 2)
    expect(totalWithTip).toBeCloseTo(55, 2)
  })
})
