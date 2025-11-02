import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import PercentageCalculatorPage from '../page'

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
  useQueryState: (_key: string, parser: { defaultValue: unknown }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useState(parser.defaultValue)
  },
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

describe('Percentage Calculator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Percentage Calculator')).toBeInTheDocument()
    })

    it('renders mode selection with all 7 modes', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('What is X% of Y?')).toBeInTheDocument()
      expect(screen.getByText('X is what % of Y?')).toBeInTheDocument()
      expect(screen.getByText('X is Y% of what?')).toBeInTheDocument()
      expect(screen.getByText('Percentage Change')).toBeInTheDocument()
      expect(screen.getByText('Discount Calculator')).toBeInTheDocument()
      expect(screen.getByText('Tip Calculator')).toBeInTheDocument()
      expect(screen.getByText('Tax Calculator')).toBeInTheDocument()
    })

    it('renders default mode (percent-of)', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Calculate percentage of a number')).toBeInTheDocument()
    })

    it('renders input fields', () => {
      render(<PercentageCalculatorPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(2)
    })

    it('renders clear button', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })
  })

  describe('Mode Selection', () => {
    it('changes mode when mode button is clicked', async () => {
      render(<PercentageCalculatorPage />)

      const discountButton = screen.getByText('Discount Calculator')
      await userEvent.click(discountButton)

      await waitFor(() => {
        expect(screen.getByText('Calculate final price after discount')).toBeInTheDocument()
      })
    })

    it('clears inputs when mode changes', async () => {
      render(<PercentageCalculatorPage />)

      // Enter values in default mode
      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '200' } })

      // Change mode
      const tipButton = screen.getByText('Tip Calculator')
      await userEvent.click(tipButton)

      await waitFor(() => {
        const inputsAfter = screen.getAllByRole('textbox')
        expect(inputsAfter[0]).toHaveValue('')
        expect(inputsAfter[1]).toHaveValue('')
      })
    })
  })

  describe('Percent Of Calculation', () => {
    it('calculates X% of Y correctly', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '200' } })

      await waitFor(() => {
        expect(screen.getByText('50.00')).toBeInTheDocument()
      })
    })

    it('displays formula for percent of calculation', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '10' } })
      fireEvent.change(inputs[1], { target: { value: '100' } })

      await waitFor(() => {
        expect(screen.getByText(/\(10% ÷ 100\) × 100 = 10.00/)).toBeInTheDocument()
      })
    })

    it('handles decimal percentages', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '12.5' } })
      fireEvent.change(inputs[1], { target: { value: '80' } })

      await waitFor(() => {
        expect(screen.getByText('10.00')).toBeInTheDocument()
      })
    })
  })

  describe('Is What Percent Calculation', () => {
    it('calculates X is what % of Y correctly', async () => {
      render(<PercentageCalculatorPage />)

      // Switch to is-what-percent mode
      const modeButton = screen.getByText('X is what % of Y?')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '50' } })
        fireEvent.change(inputs[1], { target: { value: '200' } })
      })

      await waitFor(() => {
        expect(screen.getByText('25.00%')).toBeInTheDocument()
      })
    })

    it('handles division by zero gracefully', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('X is what % of Y?')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '50' } })
        fireEvent.change(inputs[1], { target: { value: '0' } })
      })

      await waitFor(() => {
        expect(screen.queryByText(/Result/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Is Percent Of What Calculation', () => {
    it('calculates X is Y% of what correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('X is Y% of what?')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '50' } })
        fireEvent.change(inputs[1], { target: { value: '25' } })
      })

      await waitFor(() => {
        expect(screen.getByText('200.00')).toBeInTheDocument()
      })
    })
  })

  describe('Percentage Change Calculation', () => {
    it('calculates percentage increase correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Percentage Change')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '100' } })
        fireEvent.change(inputs[1], { target: { value: '150' } })
      })

      await waitFor(() => {
        expect(screen.getByText('+50.00%')).toBeInTheDocument()
        expect(screen.getByText(/increase/)).toBeInTheDocument()
      })
    })

    it('calculates percentage decrease correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Percentage Change')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '200' } })
        fireEvent.change(inputs[1], { target: { value: '150' } })
      })

      await waitFor(() => {
        expect(screen.getByText('-25.00%')).toBeInTheDocument()
        expect(screen.getByText(/decrease/)).toBeInTheDocument()
      })
    })
  })

  describe('Discount Calculator', () => {
    it('calculates discount correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Discount Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '100' } })
        fireEvent.change(inputs[1], { target: { value: '20' } })
      })

      await waitFor(() => {
        expect(screen.getByText('$80.00')).toBeInTheDocument()
        expect(screen.getByText(/saved \$20.00/)).toBeInTheDocument()
      })
    })

    it('shows savings amount in formula', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Discount Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '50' } })
        fireEvent.change(inputs[1], { target: { value: '10' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/saved \$5.00/)).toBeInTheDocument()
      })
    })
  })

  describe('Tip Calculator', () => {
    it('calculates tip and total correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Tip Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '100' } })
        fireEvent.change(inputs[1], { target: { value: '15' } })
      })

      await waitFor(() => {
        expect(screen.getByText('$115.00')).toBeInTheDocument()
        expect(screen.getByText(/Tip: \$15.00/)).toBeInTheDocument()
      })
    })

    it('handles 20% tip correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Tip Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '50' } })
        fireEvent.change(inputs[1], { target: { value: '20' } })
      })

      await waitFor(() => {
        expect(screen.getByText('$60.00')).toBeInTheDocument()
      })
    })
  })

  describe('Tax Calculator', () => {
    it('calculates tax and total correctly', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Tax Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        fireEvent.change(inputs[0], { target: { value: '100' } })
        fireEvent.change(inputs[1], { target: { value: '8' } })
      })

      await waitFor(() => {
        expect(screen.getByText('$108.00')).toBeInTheDocument()
        expect(screen.getByText(/Tax: \$8.00/)).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears all inputs and results when clear button is clicked', async () => {
      render(<PercentageCalculatorPage />)

      // Enter values
      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '200' } })

      await waitFor(() => {
        expect(screen.getByText('50.00')).toBeInTheDocument()
      })

      // Click clear
      const clearButton = screen.getByText('Clear All')
      await userEvent.click(clearButton)

      await waitFor(() => {
        const inputsAfter = screen.getAllByRole('textbox')
        expect(inputsAfter[0]).toHaveValue('')
        expect(inputsAfter[1]).toHaveValue('')
        expect(screen.queryByText('50.00')).not.toBeInTheDocument()
      })
    })
  })

  describe('Copy Result', () => {
    it('copies result to clipboard when copy button is clicked', async () => {
      render(<PercentageCalculatorPage />)

      // Enter values to get a result
      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '200' } })

      await waitFor(() => {
        expect(screen.getByText('50.00')).toBeInTheDocument()
      })

      // Click copy button
      const copyButton = screen.getByText('Copy')
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('50.00')
      })
    })
  })

  describe('Input Validation', () => {
    it('handles empty inputs gracefully', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '' } })
      fireEvent.change(inputs[1], { target: { value: '' } })

      await waitFor(() => {
        expect(screen.queryByText(/Result/)).not.toBeInTheDocument()
      })
    })

    it('handles non-numeric input gracefully', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'abc' } })
      fireEvent.change(inputs[1], { target: { value: '100' } })

      await waitFor(() => {
        expect(screen.queryByText(/Result/)).not.toBeInTheDocument()
      })
    })

    it('handles negative numbers', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '-10' } })
      fireEvent.change(inputs[1], { target: { value: '100' } })

      await waitFor(() => {
        expect(screen.getByText('-10.00')).toBeInTheDocument()
      })
    })
  })

  describe('Pro Tips Section', () => {
    it('displays pro tips', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText(/Switch between modes/)).toBeInTheDocument()
    })

    it('displays common uses section', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Common Uses')).toBeInTheDocument()
      expect(screen.getByText(/sales discounts/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<PercentageCalculatorPage />)
      const heading = screen.getByText('Percentage Calculator')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive labels for inputs', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('Percentage')).toBeInTheDocument()
      expect(screen.getByText('Of Number')).toBeInTheDocument()
    })

    it('has proper input types', () => {
      render(<PercentageCalculatorPage />)
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      inputs.forEach((input) => {
        expect(input.getAttribute('inputMode')).toBe('decimal')
      })
    })
  })

  describe('Formula Display', () => {
    it('shows calculation formula when result is available', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '25' } })
      fireEvent.change(inputs[1], { target: { value: '200' } })

      await waitFor(() => {
        expect(screen.getByText('Calculation')).toBeInTheDocument()
      })
    })

    it('hides formula when inputs are empty', async () => {
      render(<PercentageCalculatorPage />)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: '' } })
      fireEvent.change(inputs[1], { target: { value: '' } })

      await waitFor(() => {
        expect(screen.queryByText('Calculation')).not.toBeInTheDocument()
      })
    })
  })

  describe('Visual Elements', () => {
    it('displays percentage suffix for percentage inputs', () => {
      render(<PercentageCalculatorPage />)
      expect(screen.getByText('%')).toBeInTheDocument()
    })

    it('displays dollar signs for discount calculator', async () => {
      render(<PercentageCalculatorPage />)

      const modeButton = screen.getByText('Discount Calculator')
      await userEvent.click(modeButton)

      await waitFor(() => {
        const dollarSigns = screen.getAllByText('$')
        expect(dollarSigns.length).toBeGreaterThan(0)
      })
    })
  })
})
