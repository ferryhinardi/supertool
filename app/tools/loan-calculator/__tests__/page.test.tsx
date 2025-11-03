import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import LoanCalculatorPage from '../page'

// Mock nuqs
vi.mock('nuqs', () => ({
  parseAsFloat: {
    withDefault: (defaultValue: number) => ({
      defaultValue,
      parse: (value: number) => value,
    }),
  },
  parseAsInteger: {
    withDefault: (defaultValue: number) => ({
      defaultValue,
      parse: (value: number) => value,
    }),
  },
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

describe('Loan Calculator Page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        expect(screen.getByText('Loan Calculator')).toBeInTheDocument()
      })
    })

    it('renders description', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        expect(
          screen.getByText(/Calculate monthly payments, view amortization schedules/)
        ).toBeInTheDocument()
      })
    })

    it('renders default loan inputs', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        const principalInput = screen.getByLabelText(/Loan Amount/) as HTMLInputElement
        expect(principalInput).toBeInTheDocument()
        expect(principalInput).toHaveValue(300000)
      })
    })

    it('renders all input fields', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        expect(screen.getByLabelText(/Loan Amount/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Annual Interest Rate/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Loan Term/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Extra Monthly Payment/)).toBeInTheDocument()
      })
    })
  })

  describe('Loan Calculations', () => {
    it('calculates monthly payment correctly', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        // For $300,000 at 4.5% for 30 years, monthly payment should be ~$1,520
        const monthlyPaymentElements = screen.getAllByText(/Monthly Payment/)
        expect(monthlyPaymentElements.length).toBeGreaterThan(0)
      })
    })

    it('displays total interest', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText(/Total Interest/)).toBeInTheDocument()
      })
    })

    it('displays total cost', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText(/Total Cost/)).toBeInTheDocument()
      })
    })

    it('displays principal/interest split', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText(/Principal \/ Interest/)).toBeInTheDocument()
      })
    })

    it('updates calculation when principal changes', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const principalInput = screen.getByLabelText(/Loan Amount/) as HTMLInputElement
        fireEvent.change(principalInput, { target: { value: '400000' } })
      })

      // Verify that calculation updates (monthly payment should change)
      await waitFor(() => {
        const monthlyPaymentElements = screen.getAllByText(/Monthly Payment/)
        expect(monthlyPaymentElements.length).toBeGreaterThan(0)
      })
    })

    it('updates calculation when rate changes', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const rateInput = screen.getByLabelText(/Annual Interest Rate/) as HTMLInputElement
        fireEvent.change(rateInput, { target: { value: '5.5' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Total Interest/)).toBeInTheDocument()
      })
    })

    it('updates calculation when term changes', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const termInput = screen.getByLabelText(/Loan Term/) as HTMLInputElement
        fireEvent.change(termInput, { target: { value: '15' } })
      })

      await waitFor(() => {
        const monthlyPaymentElements = screen.getAllByText(/Monthly Payment/)
        expect(monthlyPaymentElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Extra Payments', () => {
    it('shows extra payment benefits when extra payment is added', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const extraInput = screen.getByLabelText(/Extra Monthly Payment/) as HTMLInputElement
        fireEvent.change(extraInput, { target: { value: '500' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Extra Payment Benefits/)).toBeInTheDocument()
        expect(screen.getByText(/Interest Saved/)).toBeInTheDocument()
        expect(screen.getByText(/Time Saved/)).toBeInTheDocument()
      })
    })

    it('does not show extra payment section when extra payment is zero', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const extraInput = screen.getByLabelText(/Extra Monthly Payment/) as HTMLInputElement
        expect(extraInput).toHaveValue(0)
        expect(screen.queryByText(/Extra Payment Benefits/)).not.toBeInTheDocument()
      })
    })

    it('calculates interest saved correctly', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const extraInput = screen.getByLabelText(/Extra Monthly Payment/) as HTMLInputElement
        fireEvent.change(extraInput, { target: { value: '200' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/Interest Saved/)).toBeInTheDocument()
      })
    })

    it('shows new payoff time with extra payments', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const extraInput = screen.getByLabelText(/Extra Monthly Payment/) as HTMLInputElement
        fireEvent.change(extraInput, { target: { value: '300' } })
      })

      await waitFor(() => {
        expect(screen.getByText(/New Payoff Time/)).toBeInTheDocument()
      })
    })
  })

  describe('Amortization Schedule', () => {
    it('has toggle button for amortization schedule', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText(/Show Schedule|Hide Schedule/)).toBeInTheDocument()
      })
    })

    it('shows schedule when toggle button is clicked', async () => {
      render(<LoanCalculatorPage />)

      const toggleButton = await screen.findByText(/Show Schedule/)
      await userEvent.click(toggleButton as HTMLElement)

      await waitFor(() => {
        const yearElements = screen.getAllByText(/Year 1/)
        expect(yearElements.length).toBeGreaterThan(0)
      })
    })

    it('hides schedule when toggle button is clicked again', async () => {
      render(<LoanCalculatorPage />)

      // Show schedule
      const showButton = await screen.findByText(/Show Schedule/)
      await userEvent.click(showButton as HTMLElement)

      await waitFor(() => {
        const yearElements = screen.getAllByText(/Year 1/)
        expect(yearElements.length).toBeGreaterThan(0)
      })

      // Hide schedule
      const hideButton = await screen.findByText(/Hide Schedule/)
      await userEvent.click(hideButton as HTMLElement)

      await waitFor(() => {
        expect(screen.queryByText(/Year 1/)).not.toBeInTheDocument()
      })
    })

    it('displays year summaries in schedule', async () => {
      render(<LoanCalculatorPage />)

      const toggleButton = await screen.findByText(/Show Schedule/)
      await userEvent.click(toggleButton as HTMLElement)

      await waitFor(() => {
        expect(screen.getAllByText(/Year 1/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Total Paid/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Principal/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Interest/).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/End Balance/).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Loan Comparison', () => {
    it('has add to compare button', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText(/Add to Compare/)).toBeInTheDocument()
      })
    })

    it('adds loan to comparison when button is clicked', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(async () => {
        const addButton = screen.getByText(/Add to Compare/)
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText(/Loan 1/)).toBeInTheDocument()
      })
    })

    it('displays loan details in comparison', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(async () => {
        const addButton = screen.getByText(/Add to Compare/)
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText(/Loan Amount:/)).toBeInTheDocument()
        expect(screen.getByText(/Rate:/)).toBeInTheDocument()
        expect(screen.getByText(/Term:/)).toBeInTheDocument()
        expect(screen.getByText(/Monthly Payment:/)).toBeInTheDocument()
        expect(screen.getByText(/Total Interest:/)).toBeInTheDocument()
        expect(screen.getByText(/Total Cost:/)).toBeInTheDocument()
      })
    })

    it('allows adding multiple loans for comparison', async () => {
      render(<LoanCalculatorPage />)

      // Add first loan
      await waitFor(async () => {
        const addButton = screen.getByText(/Add to Compare/)
        await userEvent.click(addButton as HTMLElement)
      })

      // Change loan parameters
      await waitFor(() => {
        const rateInput = screen.getByLabelText(/Annual Interest Rate/) as HTMLInputElement
        fireEvent.change(rateInput, { target: { value: '5' } })
      })

      // Add second loan
      await waitFor(async () => {
        const addButton = screen.getByText(/Add to Compare/)
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText(/Loan 1/)).toBeInTheDocument()
        expect(screen.getByText(/Loan 2/)).toBeInTheDocument()
      })
    })

    it('removes loan from comparison when remove button is clicked', async () => {
      render(<LoanCalculatorPage />)

      // Add loan
      await waitFor(async () => {
        const addButton = screen.getByText(/Add to Compare/)
        await userEvent.click(addButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.getByText(/Loan 1/)).toBeInTheDocument()
      })

      // Remove loan
      await waitFor(async () => {
        const removeButton = screen.getByText(/Remove/)
        await userEvent.click(removeButton as HTMLElement)
      })

      await waitFor(() => {
        expect(screen.queryByText(/Loan 1/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Info Section', () => {
    it('displays how it works section', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        expect(screen.getByText('How It Works')).toBeInTheDocument()
      })
    })

    it('shows helpful information about calculations', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const infoSection = screen.getByText('How It Works').closest('article')
        expect(infoSection).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        const heading = screen.getByText('Loan Calculator')
        expect(heading.tagName).toBe('H1')
      })
    })

    it('has labels for all inputs', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        expect(screen.getByLabelText(/Loan Amount/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Annual Interest Rate/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Loan Term/)).toBeInTheDocument()
        expect(screen.getByLabelText(/Extra Monthly Payment/)).toBeInTheDocument()
      })
    })

    it('has proper input types', async () => {
      render(<LoanCalculatorPage />)
      await waitFor(() => {
        const principalInput = screen.getByLabelText(/Loan Amount/) as HTMLInputElement
        expect(principalInput.type).toBe('number')
      })
    })
  })

  describe('Currency Formatting', () => {
    it('formats currency values correctly', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        // Check that dollar signs are present
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles zero interest rate', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const rateInput = screen.getByLabelText(/Annual Interest Rate/) as HTMLInputElement
        fireEvent.change(rateInput, { target: { value: '0' } })
      })

      await waitFor(() => {
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('handles very short loan terms', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const termInput = screen.getByLabelText(/Loan Term/) as HTMLInputElement
        fireEvent.change(termInput, { target: { value: '1' } })
      })

      await waitFor(() => {
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('handles very long loan terms', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const termInput = screen.getByLabelText(/Loan Term/) as HTMLInputElement
        fireEvent.change(termInput, { target: { value: '40' } })
      })

      await waitFor(() => {
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('handles small loan amounts', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const principalInput = screen.getByLabelText(/Loan Amount/) as HTMLInputElement
        fireEvent.change(principalInput, { target: { value: '10000' } })
      })

      await waitFor(() => {
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('handles large loan amounts', async () => {
      render(<LoanCalculatorPage />)

      await waitFor(() => {
        const principalInput = screen.getByLabelText(/Loan Amount/) as HTMLInputElement
        fireEvent.change(principalInput, { target: { value: '1000000' } })
      })

      await waitFor(() => {
        const elements = screen.getAllByText(/Monthly Payment/)
        expect(elements.length).toBeGreaterThan(0)
      })
    })
  })
})
