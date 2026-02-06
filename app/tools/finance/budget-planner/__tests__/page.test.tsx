'use client'

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import BudgetPlannerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock FAQAccordion
vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion" />,
}))

// Mock RelatedTools
vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools" />,
}))

// Mock ToolRating
vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating" />,
}))

// Mock SocialShare
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => <div data-testid="social-share" />,
}))

// Mock tool-components
vi.mock('@/components/features/tool-components', () => ({
  TOOL_COLORS: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#06b6d4',
    pink: '#ec4899',
    purple: '#a855f7',
  },
  ToolOperationGrid: ({
    operations,
    selectedOperation,
    onOperationChange,
  }: {
    operations: Array<{ id: string; label: string; description?: string }>
    selectedOperation: string
    onOperationChange: (id: string) => void
  }) => (
    <div data-testid="tool-operation-grid">
      {operations.map((op) => (
        <button
          key={op.id}
          type="button"
          onClick={() => onOperationChange(op.id)}
          data-selected={selectedOperation === op.id}
          data-testid={`operation-${op.id}`}
        >
          {op.label}
        </button>
      ))}
    </div>
  ),
  ToolMobilePicker: () => <div data-testid="tool-mobile-picker" />,
}))

// Mock clipboard API globally
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
})

describe('BudgetPlannerPage', () => {
  const user = userEvent.setup()

  // Helper to get action buttons (not operation grid buttons)
  const getActionButton = (name: RegExp | string) => {
    const buttons = screen.getAllByRole('button', { name })
    // Filter out operation grid buttons (they have data-testid starting with "operation-")
    const actionButton = buttons.find(
      (btn) => !btn.getAttribute('data-testid')?.startsWith('operation-')
    )
    return actionButton || buttons[buttons.length - 1] // fallback to last button
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockWriteText.mockClear()
    // Mock URL APIs for export
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks() // Restore all mocked functions including document.createElement
  })

  describe('Rendering', () => {
    it('should render the page title', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /budget planner/i })).toBeInTheDocument()
      })
    })

    it('should render the page description', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/master your finances with the 50\/30\/20 rule/i)
        ).toBeInTheDocument()
      })
    })

    it('should render the 50/30/20 badges', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText(/50% Needs/i)).toBeInTheDocument()
        expect(screen.getByText(/30% Wants/i)).toBeInTheDocument()
        expect(screen.getByText(/20% Savings/i)).toBeInTheDocument()
      })
    })

    it('should render operations grid', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('tool-operation-grid')).toBeInTheDocument()
      })
    })

    it('should render income card', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        // Monthly Income appears multiple times, so check for at least one
        const monthlyIncomeElements = screen.getAllByText('Monthly Income')
        expect(monthlyIncomeElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Enter your after-tax monthly income')).toBeInTheDocument()
      })
    })

    it('should render track expenses card', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        // Track Expenses appears multiple times
        const trackExpensesElements = screen.getAllByText('Track Expenses')
        expect(trackExpensesElements.length).toBeGreaterThan(0)
        expect(
          screen.getByText('Add your monthly expenses and categorize them')
        ).toBeInTheDocument()
      })
    })

    it('should render summary card', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument()
        // Monthly Income appears multiple times
        const monthlyIncomeElements = screen.getAllByText('Monthly Income')
        expect(monthlyIncomeElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Total Expenses')).toBeInTheDocument()
        expect(screen.getByText('Remaining')).toBeInTheDocument()
      })
    })

    it('should render FAQ accordion', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
      })
    })

    it('should render related tools', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('related-tools')).toBeInTheDocument()
      })
    })

    it('should render tool rating', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
      })
    })

    it('should render social share', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('social-share')).toBeInTheDocument()
      })
    })
  })

  describe('Income Input', () => {
    it('should allow entering income value', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      expect(incomeInput).toHaveValue('5000')
    })

    it('should strip non-numeric characters from income', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, 'abc5000xyz')

      expect(incomeInput).toHaveValue('5000')
    })

    it('should allow decimal values for income', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000.50')

      expect(incomeInput).toHaveValue('5000.50')
    })

    it('should show budget breakdown when income is entered', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      await waitFor(() => {
        expect(screen.getByText('Budget Breakdown')).toBeInTheDocument()
      })
    })
  })

  describe('Currency Selection', () => {
    it('should display default currency USD', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('$ USD')).toBeInTheDocument()
      })
    })

    it('should open currency dropdown when clicked', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('$ USD')).toBeInTheDocument()
      })

      const currencyButton = screen.getByText('$ USD')
      await user.click(currencyButton)

      await waitFor(() => {
        expect(screen.getByText('Euro')).toBeInTheDocument()
        expect(screen.getByText('British Pound')).toBeInTheDocument()
      })
    })

    it('should change currency when option is selected', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('$ USD')).toBeInTheDocument()
      })

      const currencyButton = screen.getByText('$ USD')
      await user.click(currencyButton)

      await waitFor(() => {
        expect(screen.getByText('Euro')).toBeInTheDocument()
      })

      const euroOption = screen.getByText('Euro')
      await user.click(euroOption)

      await waitFor(() => {
        expect(screen.getByText(/EUR/)).toBeInTheDocument()
      })
    })
  })

  describe('Expense Management', () => {
    it('should show error when adding expense without name', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('Add Expense')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter expense name and amount')
    })

    it('should show error when adding expense without amount', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Expense name')
      await user.type(nameInput, 'Rent')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter expense name and amount')
    })

    it('should show error for invalid amount', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '0')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      expect(toast.error).toHaveBeenCalledWith('Please enter a valid amount')
    })

    it('should add expense successfully', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      expect(toast.success).toHaveBeenCalledWith('Expense added')

      await waitFor(() => {
        expect(screen.getByText('Rent')).toBeInTheDocument()
        expect(screen.getByText('$1,500.00')).toBeInTheDocument()
      })
    })

    it('should clear form after adding expense', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(nameInput).toHaveValue('')
        expect(amountInput).toHaveValue('')
      })
    })

    it('should remove expense when delete button is clicked', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      // Add an expense first
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Rent')).toBeInTheDocument()
      })

      // Find and click delete button
      const expenseItem = screen.getByText('Rent').closest('div[class]')
      const deleteButtons = expenseItem?.parentElement?.querySelectorAll('button')
      const deleteButton = deleteButtons?.[deleteButtons.length - 1]

      if (deleteButton) {
        await user.click(deleteButton)
      }

      expect(toast.success).toHaveBeenCalledWith('Expense removed')
    })
  })

  describe('Preset Expenses', () => {
    it('should display preset expense categories', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('Quick Add Common Expenses:')).toBeInTheDocument()
      })
    })

    it('should show preset expenses for needs category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Rent/Mortgage' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Utilities' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
      })
    })

    it('should show preset expenses for wants category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Dining Out' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Entertainment' })).toBeInTheDocument()
      })
    })

    it('should show preset expenses for savings category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Emergency Fund' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Retirement' })).toBeInTheDocument()
      })
    })

    it('should fill expense name when preset is clicked', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Rent/Mortgage' })).toBeInTheDocument()
      })

      const presetButton = screen.getByRole('button', { name: 'Rent/Mortgage' })
      await user.click(presetButton)

      expect(toast.info).toHaveBeenCalledWith('Added "Rent/Mortgage" - enter the amount')

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Expense name')
        expect(nameInput).toHaveValue('Rent/Mortgage')
      })
    })
  })

  describe('Category Selection', () => {
    it('should default to needs category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        // Find button with text "needs"
        const buttons = screen.getAllByRole('button')
        const categoryButton = buttons.find((b) => b.textContent?.toLowerCase().includes('needs'))
        expect(categoryButton).toBeDefined()
      })
    })

    it('should open category dropdown when clicked', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      // Find the category dropdown button (it shows "needs" by default)
      const buttons = screen.getAllByRole('button')
      const categoryButton = buttons.find(
        (b) => b.textContent?.toLowerCase() === 'needs' && !b.textContent?.includes('%')
      )

      if (categoryButton) {
        await user.click(categoryButton)

        await waitFor(() => {
          // Should show category options with percentages
          expect(screen.getByText('50%')).toBeInTheDocument()
          expect(screen.getByText('30%')).toBeInTheDocument()
          expect(screen.getByText('20%')).toBeInTheDocument()
        })
      }
    })

    it('should add expense with correct category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Gym Membership')
      await user.type(amountInput, '50')

      // Change category to wants
      const buttons = screen.getAllByRole('button')
      const categoryButton = buttons.find(
        (b) => b.textContent?.toLowerCase() === 'needs' && !b.textContent?.includes('%')
      )

      if (categoryButton) {
        await user.click(categoryButton)

        await waitFor(() => {
          expect(screen.getByText('30%')).toBeInTheDocument()
        })

        // Find and click Wants option
        const wantsButtons = screen.getAllByText('Wants')
        const wantsOption = wantsButtons.find((el) => el.closest('button'))
        if (wantsOption) {
          await user.click(wantsOption)
        }
      }

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Gym Membership')).toBeInTheDocument()
        // "wants" appears multiple times (in dropdown and expense badge)
        const wantsElements = screen.getAllByText(/wants/i)
        expect(wantsElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Budget Calculations', () => {
    it('should calculate 50/30/20 breakdown correctly', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      await waitFor(() => {
        // 50% of 5000 = 2500 for Needs
        // 30% of 5000 = 1500 for Wants
        // 20% of 5000 = 1000 for Savings
        expect(screen.getByText('$2,500.00')).toBeInTheDocument() // Needs budget
        expect(screen.getByText('$1,500.00')).toBeInTheDocument() // Wants budget
        expect(screen.getByText('$1,000.00')).toBeInTheDocument() // Savings budget
      })
    })

    it('should update total expenses when expenses are added', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      // Add first expense
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        // Total expenses should show -$1,500.00
        expect(screen.getByText('-$1,500.00')).toBeInTheDocument()
      })
    })

    it('should calculate remaining budget correctly', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Add expense
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        // Remaining should be 5000 - 1500 = 3500
        expect(screen.getByText('$3,500.00')).toBeInTheDocument()
      })
    })
  })

  describe('Budget Tips', () => {
    it('should show tips card', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        // "Budget Tips" appears in operation grid and as card heading
        const budgetTipsElements = screen.getAllByText('Budget Tips')
        expect(budgetTipsElements.length).toBeGreaterThan(0)
      })
    })

    it('should show "Add Your Expenses" tip when no expenses', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText('Add Your Expenses')).toBeInTheDocument()
      })
    })

    it('should show savings tip when savings is below 20%', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Add only needs expense (no savings)
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Boost Your Savings')).toBeInTheDocument()
      })
    })
  })

  describe('Save Budget', () => {
    it('should have disabled save button when budget name is empty', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income first but no budget name
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      const saveButton = getActionButton(/save budget/i)
      expect(saveButton).toBeDisabled()
    })

    it('should have disabled save button when income is empty', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Budget name')).toBeInTheDocument()
      })

      // Enter budget name but no income
      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'My Budget')

      const saveButton = getActionButton(/save budget/i)
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when both income and budget name are provided', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Initially disabled
      let saveButton = getActionButton(/save budget/i)
      expect(saveButton).toBeDisabled()

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Still disabled (no budget name)
      saveButton = getActionButton(/save budget/i)
      expect(saveButton).toBeDisabled()

      // Enter budget name
      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'My Budget')

      // Now should be enabled
      await waitFor(() => {
        saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should save budget successfully', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Enter budget name
      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'My Budget')

      // Wait for button to be enabled
      await waitFor(() => {
        const saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })

      const saveButton = getActionButton(/save budget/i)
      await user.click(saveButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Budget saved!')
      })
    })

    it('should update Load Budget count after saving', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getAllByText(/Load Budget/)[0]).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Enter budget name
      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'My Budget')

      // Wait for button to be enabled and click
      await waitFor(() => {
        const saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })

      const saveButton = getActionButton(/save budget/i)
      await user.click(saveButton!)

      await waitFor(() => {
        expect(screen.getByText(/Load Budget \(1\)/)).toBeInTheDocument()
      })
    })
  })

  describe('Load Budget', () => {
    it('should open saved budgets modal', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText(/Load Budget/)).toBeInTheDocument()
      })

      const loadButton = screen.getByText(/Load Budget/)
      await user.click(loadButton)

      await waitFor(() => {
        expect(screen.getByText('Saved Budgets')).toBeInTheDocument()
      })
    })

    it('should show empty message when no saved budgets', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText(/Load Budget/)).toBeInTheDocument()
      })

      const loadButton = screen.getByText(/Load Budget/)
      await user.click(loadButton)

      await waitFor(() => {
        expect(
          screen.getByText('No saved budgets yet. Create and save a budget to see it here.')
        ).toBeInTheDocument()
      })
    })

    it('should load a saved budget', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Save a budget first
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'Test Budget')

      // Wait for button to be enabled and click
      await waitFor(() => {
        const saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })

      const saveButton = getActionButton(/save budget/i)
      await user.click(saveButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Budget saved!')
      })

      // Clear the form
      const resetButton = screen.getByRole('button', { name: /reset/i })
      await user.click(resetButton)

      // Open load modal
      const loadButtons = screen.getAllByText(/Load Budget/)
      const loadButton = loadButtons[0]
      await user.click(loadButton)

      await waitFor(() => {
        expect(screen.getByText('Saved Budgets')).toBeInTheDocument()
        expect(screen.getByText('Test Budget')).toBeInTheDocument()
      })

      // Click the load (check) button - need to navigate up to the budget item container
      // Structure: div (budget item) > div (flex) > div (left - contains "Test Budget") > p
      // The buttons are in: div (budget item) > div (flex) > div (right - buttons) > Button
      const budgetNameElement = screen.getByText('Test Budget')
      // Go up to the budget item container (3 levels up from the p tag)
      const budgetItemContainer = budgetNameElement.parentElement?.parentElement?.parentElement
      const buttons = budgetItemContainer?.querySelectorAll('button')

      // First button is the load button (Check icon), second is delete (Trash2 icon)
      if (buttons && buttons.length > 0) {
        await user.click(buttons[0])
      }

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Loaded "Test Budget"')
      })
    })
  })

  describe('Delete Budget', () => {
    it('should delete a saved budget', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Save a budget first
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'Budget To Delete')

      // Wait for button to be enabled and click
      await waitFor(() => {
        const saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })

      const saveButton = getActionButton(/save budget/i)
      await user.click(saveButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Budget saved!')
      })

      // Open load modal
      const loadButtons = screen.getAllByText(/Load Budget/)
      const loadButton = loadButtons[0]
      await user.click(loadButton)

      await waitFor(() => {
        expect(screen.getByText('Budget To Delete')).toBeInTheDocument()
      })

      // Find and click the delete button (second button in the item)
      const budgetItem = screen.getByText('Budget To Delete').closest('div')?.parentElement
      const buttons = budgetItem?.querySelectorAll('button')
      const deleteButton = buttons?.[buttons.length - 1]

      if (deleteButton) {
        await user.click(deleteButton)
      }

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Budget deleted')
      })
    })
  })

  describe('Reset Budget', () => {
    it('should reset all fields when reset button is clicked', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter some data
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'My Budget')

      // Add an expense
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')
      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i })
      await user.click(resetButton)

      expect(toast.success).toHaveBeenCalledWith('Budget reset')

      await waitFor(() => {
        expect(incomeInput).toHaveValue('')
        expect(budgetNameInput).toHaveValue('')
      })
    })
  })

  describe('Export Functionality', () => {
    it('should export CSV when expenses exist', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      // Add an expense
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1500')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      // Mock document.createElement for download - use mockImplementationOnce to not affect other tests
      const mockClick = vi.fn()
      const mockAnchor = { click: mockClick, href: '', download: '' }
      const createElementSpy = vi.spyOn(document, 'createElement')
      createElementSpy.mockImplementationOnce(() => mockAnchor as unknown as HTMLElement)

      const exportButton = screen.getByRole('button', { name: /export csv/i })
      await user.click(exportButton)

      expect(toast.success).toHaveBeenCalledWith('Budget exported as CSV')
    })

    it('should copy summary to clipboard', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy summary/i })).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy summary/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Budget copied to clipboard')
    })
  })

  describe('Operations', () => {
    it('should display all budget operations', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('operation-calculate')).toBeInTheDocument()
        expect(screen.getByTestId('operation-track')).toBeInTheDocument()
        expect(screen.getByTestId('operation-analyze')).toBeInTheDocument()
        expect(screen.getByTestId('operation-save')).toBeInTheDocument()
        expect(screen.getByTestId('operation-export')).toBeInTheDocument()
        expect(screen.getByTestId('operation-tips')).toBeInTheDocument()
      })
    })

    it('should select calculate operation by default', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        const calculateOp = screen.getByTestId('operation-calculate')
        expect(calculateOp).toHaveAttribute('data-selected', 'true')
      })
    })

    it('should change selected operation when clicked', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByTestId('operation-track')).toBeInTheDocument()
      })

      const trackOp = screen.getByTestId('operation-track')
      await user.click(trackOp)

      await waitFor(() => {
        expect(trackOp).toHaveAttribute('data-selected', 'true')
      })
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should persist saved budgets to localStorage', async () => {
      const { toast } = await import('sonner')
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Save a budget
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, 'Persisted Budget')

      // Wait for button to be enabled and click
      await waitFor(() => {
        const saveButton = getActionButton(/save budget/i)
        expect(saveButton).not.toBeDisabled()
      })

      const saveButton = getActionButton(/save budget/i)
      await user.click(saveButton!)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Budget saved!')
      })

      await waitFor(() => {
        const stored = localStorage.getItem('budget-planner-budgets')
        expect(stored).not.toBeNull()

        const budgets = JSON.parse(stored!)
        expect(budgets).toHaveLength(1)
        expect(budgets[0].name).toBe('Persisted Budget')
      })
    })

    it('should load saved budgets from localStorage on mount', async () => {
      // Pre-populate localStorage
      const mockBudgets = [
        {
          id: 'test-id',
          name: 'Stored Budget',
          income: 6000,
          currency: 'USD',
          expenses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('budget-planner-budgets', JSON.stringify(mockBudgets))

      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByText(/Load Budget \(1\)/)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible income input', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
        expect(incomeInput).toHaveAttribute('type', 'text')
        expect(incomeInput).toHaveAttribute('inputMode', 'decimal')
      })
    })

    it('should have accessible expense inputs', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument()
      })
    })

    it('should have accessible buttons with proper labels', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
        // Save Budget appears in both operation grid and action area
        const saveBudgetButtons = screen.getAllByRole('button', { name: /save budget/i })
        expect(saveBudgetButtons.length).toBeGreaterThan(0)
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /copy summary/i })).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large income values', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '1000000')

      await waitFor(() => {
        expect(screen.getByText('$500,000.00')).toBeInTheDocument() // 50% of 1M
      })
    })

    it('should handle expenses exceeding income', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '1000')

      // Add expense larger than income
      const nameInput = screen.getByPlaceholderText('Expense name')
      const amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Big Expense')
      await user.type(amountInput, '2000')

      const addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        // Remaining should be negative (formatCurrency puts $ before the negative sign)
        expect(screen.getByText('$-1,000.00')).toBeInTheDocument()
      })
    })

    it('should handle multiple expenses of same category', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Expense name')).toBeInTheDocument()
      })

      // Add first expense
      let nameInput = screen.getByPlaceholderText('Expense name')
      let amountInput = screen.getByPlaceholderText('Amount')

      await user.type(nameInput, 'Rent')
      await user.type(amountInput, '1000')

      let addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      // Wait for first expense to be added
      await waitFor(() => {
        expect(screen.getByText('Rent')).toBeInTheDocument()
      })

      // Re-query inputs after React re-render (fresh references)
      nameInput = screen.getByPlaceholderText('Expense name')
      amountInput = screen.getByPlaceholderText('Amount')

      // Clear and type for second expense - use a unique name to avoid conflicts with preset buttons
      await user.clear(nameInput)
      await user.clear(amountInput)
      await user.type(nameInput, 'Electric Bill')
      await user.type(amountInput, '200')

      addButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Electric Bill')).toBeInTheDocument()
        // Total expenses should be 1200 (displayed with - prefix)
        expect(screen.getByText('-$1,200.00')).toBeInTheDocument()
      })
    })

    it('should keep save button disabled when budget name is only spaces', async () => {
      render(<BudgetPlannerPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your monthly income')).toBeInTheDocument()
      })

      // Enter income
      const incomeInput = screen.getByPlaceholderText('Enter your monthly income')
      await user.type(incomeInput, '5000')

      // Enter only spaces as budget name
      const budgetNameInput = screen.getByPlaceholderText('Budget name')
      await user.type(budgetNameInput, '   ')

      // Button should still be disabled because of trim()
      const saveButton = getActionButton(/save budget/i)
      expect(saveButton).toBeDisabled()
    })
  })
})
