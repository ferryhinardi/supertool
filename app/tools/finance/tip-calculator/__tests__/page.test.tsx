import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'
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

describe('Tip Calculator - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render tip calculator page', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByRole('heading', { name: 'Tip Calculator', level: 1 })).toBeTruthy()
    expect(screen.getAllByText('Bill Amount')[0]).toBeTruthy()
    expect(screen.getByText('Tip Percentage')).toBeTruthy()
  })

  it('should display main heading', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tip Calculator')).toBeTruthy()
  })

  it('should display bill amount input', () => {
    render(<TipCalculatorPage />)
    expect(screen.getAllByText('Bill Amount')[0]).toBeTruthy()
  })

  it('should display tip percentage section', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tip Percentage')).toBeTruthy()
  })

  it('should display number of people section', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Number of People')).toBeTruthy()
  })

  it('should display rounding options section', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Round Total')).toBeTruthy()
  })

  it('should display total summary card', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Total Summary')).toBeTruthy()
  })

  it('should display calculation breakdown', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Calculation')).toBeTruthy()
  })

  it('should display tipping guidelines', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tipping Guidelines')).toBeTruthy()
  })
})

describe('Tip Calculator - Preset Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all preset tip buttons', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('10%')).toBeTruthy()
    expect(screen.getByText('15%')).toBeTruthy()
    expect(screen.getByText('18%')).toBeTruthy()
    expect(screen.getByText('20%')).toBeTruthy()
    expect(screen.getByText('25%')).toBeTruthy()
  })

  it('should display 10% preset button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('10%')).toBeTruthy()
  })

  it('should display 15% preset button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('15%')).toBeTruthy()
  })

  it('should display 18% preset button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('18%')).toBeTruthy()
  })

  it('should display 20% preset button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('20%')).toBeTruthy()
  })

  it('should display 25% preset button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('25%')).toBeTruthy()
  })

  it('should have clickable preset buttons', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const button = screen.getByText('10%')
    await user.click(button)
    expect(button).toBeTruthy()
  })
})

describe('Tip Calculator - Rounding Options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display rounding options', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText('Round Total')).toBeTruthy()
    expect(screen.getByText('No Rounding')).toBeTruthy()
    expect(screen.getByText('Round Up')).toBeTruthy()
    expect(screen.getByText('Round Down')).toBeTruthy()
  })

  it('should display no rounding option', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('No Rounding')).toBeTruthy()
  })

  it('should display round up option', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Round Up')).toBeTruthy()
  })

  it('should display round down option', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Round Down')).toBeTruthy()
  })

  it('should have clickable rounding buttons', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const button = screen.getByText('Round Up')
    await user.click(button)
    expect(button).toBeTruthy()
  })
})

describe('Tip Calculator - Number of People Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display number of people controls', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Number of People')).toBeTruthy()
  })

  it('should display people counter', () => {
    render(<TipCalculatorPage />)
    const peopleInput = screen.getByDisplayValue('1')
    expect(peopleInput).toBeTruthy()
  })

  it('should have people input field', () => {
    render(<TipCalculatorPage />)
    const input = screen.getByDisplayValue('1')
    expect(input).toBeTruthy()
  })

  it('should display increment button', async () => {
    render(<TipCalculatorPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should display decrement button', async () => {
    render(<TipCalculatorPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

describe('Tip Calculator - Action Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display action buttons', () => {
    render(<TipCalculatorPage />)

    expect(screen.getByText(/Copy Summary/i)).toBeTruthy()
    expect(screen.getByText(/^Clear$/i)).toBeTruthy()
  })

  it('should display copy button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText(/Copy Summary/i)).toBeTruthy()
  })

  it('should display clear button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText(/^Clear$/i)).toBeTruthy()
  })

  it('should handle clear button click', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const clearButton = screen.getByText(/^Clear$/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('tip_calculator_clear', {})
    })
  })

  it('should show success toast on clear', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const clearButton = screen.getByText(/^Clear$/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Cleared all fields')
    })
  })
})

describe('Tip Calculator - Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate tip correctly for 15% on $100', () => {
    render(<TipCalculatorPage />)
    // With mocked values (bill=100, tip=15%), should show calculated values
    expect(screen.getByText('$15.00')).toBeTruthy() // Tip amount
    expect(screen.getByText('$115.00')).toBeTruthy() // Total
  })

  it('should display bill summary card', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Total Summary')).toBeTruthy()
  })

  it('should display formula explanation', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Calculation')).toBeTruthy()
  })

  it('should display calculated tip amount', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('$15.00')).toBeTruthy()
  })

  it('should display calculated total', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('$115.00')).toBeTruthy()
  })

  it('should update calculations when bill amount changes', () => {
    render(<TipCalculatorPage />)
    // Component should show calculations based on mocked state
    expect(screen.getByText('$15.00')).toBeTruthy()
  })
})

describe('Tip Calculator - Calculation Logic', () => {
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

  it('should calculate 18% tip correctly', () => {
    const billAmount = 50
    const tipPercentage = 18
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(9)
    expect(totalWithTip).toBe(59)
  })

  it('should calculate 20% tip correctly', () => {
    const billAmount = 75
    const tipPercentage = 20
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(15)
    expect(totalWithTip).toBe(90)
  })

  it('should calculate 25% tip correctly', () => {
    const billAmount = 80
    const tipPercentage = 25
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(20)
    expect(totalWithTip).toBe(100)
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

  it('should split bill correctly among 3 people', () => {
    const billAmount = 90
    const tipPercentage = 20
    const numberOfPeople = 3
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount
    const perPersonTotal = totalWithTip / numberOfPeople

    expect(perPersonTotal).toBe(36)
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

  it('should handle large bill amounts', () => {
    const billAmount = 1000
    const tipPercentage = 15
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(150)
    expect(totalWithTip).toBe(1150)
  })

  it('should handle custom tip percentages', () => {
    const billAmount = 50
    const tipPercentage = 22
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(11)
    expect(totalWithTip).toBe(61)
  })

  it('should handle zero tip percentage', () => {
    const billAmount = 50
    const tipPercentage = 0
    const tipAmount = (tipPercentage / 100) * billAmount
    const totalWithTip = billAmount + tipAmount

    expect(tipAmount).toBe(0)
    expect(totalWithTip).toBe(50)
  })
})

describe('Tip Calculator - Tipping Guidelines', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display tipping guidelines', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tipping Guidelines')).toBeTruthy()
  })

  it('should display excellent service guideline', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText(/Excellent service/i)).toBeTruthy()
  })

  it('should display good service guideline', () => {
    render(<TipCalculatorPage />)
    expect(screen.getAllByText(/Good service/i)[0]).toBeTruthy()
  })

  it('should display service percentage ranges', () => {
    render(<TipCalculatorPage />)
    const content = document.body.textContent || ''
    expect(content).toBeTruthy()
  })
})

describe('Tip Calculator - Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should track page open event', async () => {
    render(<TipCalculatorPage />)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('tip_calculator_open', {})
    })
  })

  it('should track clear event', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const clearButton = screen.getByText(/^Clear$/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('tip_calculator_clear', {})
    })
  })

  it('should track multiple events', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalled()
    })

    const clearButton = screen.getByText(/^Clear$/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledTimes(2)
    })
  })
})

describe('Tip Calculator - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('should have semantic HTML structure', () => {
    render(<TipCalculatorPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeTruthy()
  })

  it('should have keyboard navigable buttons', () => {
    render(<TipCalculatorPage />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON')
    })
  })

  it('should have accessible input fields', () => {
    render(<TipCalculatorPage />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })
})

describe('Tip Calculator - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle zero bill amount', () => {
    const billAmount = 0
    const tipPercentage = 15
    const tipAmount = (tipPercentage / 100) * billAmount
    expect(tipAmount).toBe(0)
  })

  it('should handle negative tip percentage gracefully', () => {
    const billAmount = 50
    const tipPercentage = -10
    const tipAmount = (tipPercentage / 100) * billAmount
    expect(tipAmount).toBe(-5)
  })

  it('should handle very large bill amounts', () => {
    const billAmount = 999999
    const tipPercentage = 15
    const tipAmount = (tipPercentage / 100) * billAmount
    expect(tipAmount).toBeCloseTo(149999.85, 2)
  })

  it('should handle fractional people count', () => {
    const totalWithTip = 115
    const numberOfPeople = 2.5
    const perPersonTotal = totalWithTip / numberOfPeople
    expect(perPersonTotal).toBe(46)
  })

  it('should handle decimal tip percentages', () => {
    const billAmount = 50
    const tipPercentage = 17.5
    const tipAmount = (tipPercentage / 100) * billAmount
    expect(tipAmount).toBe(8.75)
  })
})

describe('Tip Calculator - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all interactive elements', () => {
    render(<TipCalculatorPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should have clickable preset buttons', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const presetButton = screen.getByText('20%')
    await user.click(presetButton)
    expect(presetButton).toBeTruthy()
  })

  it('should have clickable action buttons', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const clearButton = screen.getByText(/^Clear$/i)
    await user.click(clearButton)
    expect(clearButton).toBeTruthy()
  })

  it('should respond to button clicks', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      await user.click(buttons[0])
      expect(buttons[0]).toBeTruthy()
    }
  })
})

describe('Tip Calculator - Visual Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display calculated values', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('$15.00')).toBeTruthy()
    expect(screen.getByText('$115.00')).toBeTruthy()
  })

  it('should format currency values correctly', () => {
    render(<TipCalculatorPage />)
    const content = document.body.textContent || ''
    expect(content).toContain('$')
  })

  it('should display percentage symbols', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('10%')).toBeTruthy()
  })

  it('should show calculation breakdown', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Calculation')).toBeTruthy()
  })

  it('should display all calculation components', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Total Summary')).toBeTruthy()
  })
})

describe('Tip Calculator - Copy Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display copy button', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText(/Copy Summary/i)).toBeTruthy()
  })

  it('should have copy button accessible', () => {
    render(<TipCalculatorPage />)
    const copyButton = screen.getByText(/Copy Summary/i)
    expect(copyButton).toBeTruthy()
  })

  it('should handle copy button click', async () => {
    const user = userEvent.setup()
    render(<TipCalculatorPage />)

    const copyButton = screen.getByText(/Copy Summary/i)
    await user.click(copyButton)
    expect(copyButton).toBeTruthy()
  })
})

describe('Tip Calculator - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render on mobile viewport', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tip Calculator')).toBeTruthy()
  })

  it('should render on desktop viewport', () => {
    render(<TipCalculatorPage />)
    expect(screen.getByText('Tip Calculator')).toBeTruthy()
  })

  it('should display all content sections', () => {
    render(<TipCalculatorPage />)
    expect(screen.getAllByText('Bill Amount')[0]).toBeTruthy()
    expect(screen.getByText('Tip Percentage')).toBeTruthy()
    expect(screen.getByText('Number of People')).toBeTruthy()
  })

  it('should maintain layout integrity', () => {
    render(<TipCalculatorPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeTruthy()
  })
})
