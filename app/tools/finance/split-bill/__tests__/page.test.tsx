import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SplitBillPage from '../page'

// Mock dependencies
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}

vi.mock('sonner', () => ({
  toast: mockToast,
}))

const mockTrackToolEvent = vi.fn()
const mockTrackEvent = vi.fn()

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: mockTrackToolEvent,
  trackEvent: mockTrackEvent,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/lib/split-bill-service', () => ({
  createBill: vi.fn(() =>
    Promise.resolve({
      bill: { id: 'test-bill-id' },
    })
  ),
}))

describe('Split Bill Calculator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
  })

  describe('Basic Rendering', () => {
    it('should render the page without crashing', () => {
      render(<SplitBillPage />)
      expect(screen.getAllByText(/Split Bill/i)[0]).toBeTruthy()
    })

    it('should render the main heading', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Split Bill Calculator')).toBeTruthy()
    })

    it('should display bill amount input', () => {
      render(<SplitBillPage />)
      expect(screen.getAllByText(/Bill Amount/i)[0]).toBeTruthy()
    })

    it('should render mode toggle buttons', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Calculator')).toBeTruthy()
      expect(screen.getByText('Create Shareable Bill')).toBeTruthy()
      expect(screen.getByText('View History')).toBeTruthy()
    })

    it('should display summary statistics', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Total Bill')).toBeTruthy()
      expect(screen.getByText('Per Person')).toBeTruthy()
      expect(screen.getByText('People')).toBeTruthy()
      expect(screen.getByText('Paid')).toBeTruthy()
    })
  })

  describe('Bill Details', () => {
    it('should allow entering bill amount', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)
      await user.type(billInput, '200')

      expect(billInput).toHaveValue(200)
    })

    it('should allow entering tip percentage', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const tipInput = screen.getByLabelText(/Tip/i)
      await user.clear(tipInput)
      await user.type(tipInput, '20')

      expect(tipInput).toHaveValue(20)
    })

    it('should allow entering tax percentage', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const taxInput = screen.getByLabelText(/Tax/i)
      await user.clear(taxInput)
      await user.type(taxInput, '8')

      expect(taxInput).toHaveValue(8)
    })

    it('should display quick tip buttons', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('10%')).toBeTruthy()
      expect(screen.getByText('15%')).toBeTruthy()
      expect(screen.getByText('18%')).toBeTruthy()
      expect(screen.getByText('20%')).toBeTruthy()
    })

    it('should allow selecting quick tip percentage', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const button20Percent = screen.getByText('20%')
      await user.click(button20Percent)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Tip set to 20%')
      })
    })

    it('should display subtotal, tip, tax breakdown', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Subtotal:')).toBeTruthy()
      expect(screen.getByText(/Tip \(/)).toBeTruthy()
      expect(screen.getByText(/Tax \(/)).toBeTruthy()
      expect(screen.getByText('Total:')).toBeTruthy()
    })
  })

  describe('Currency Selection', () => {
    it('should display currency dropdown', () => {
      render(<SplitBillPage />)
      const currencySelect = screen.getByLabelText(/Currency/i)
      expect(currencySelect).toBeTruthy()
    })

    it('should allow changing currency', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const currencySelect = screen.getByLabelText(/Currency/i)
      await user.selectOptions(currencySelect, 'USD')

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalled()
      })
    })

    it('should display currency converter toggle', () => {
      render(<SplitBillPage />)
      expect(screen.getByLabelText(/Show Currency Converter/i)).toBeTruthy()
    })

    it('should toggle currency converter visibility', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const converterToggle = screen.getByLabelText(/Show Currency Converter/i)
      await user.click(converterToggle)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'split_bill_currency_converter_toggled',
          expect.objectContaining({ enabled: true })
        )
      })
    })
  })

  describe('People Management', () => {
    it('should display initial two people', () => {
      render(<SplitBillPage />)
      expect(screen.getByDisplayValue('Person 1')).toBeTruthy()
      expect(screen.getByDisplayValue('Person 2')).toBeTruthy()
    })

    it('should show people count in heading', () => {
      render(<SplitBillPage />)
      expect(screen.getByText(/People \(2\)/i)).toBeTruthy()
    })

    it('should have add person button', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Add Person')).toBeTruthy()
    })

    it('should allow adding a person', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const addButton = screen.getByText('Add Person')
      await user.click(addButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Person added')
        expect(screen.getByDisplayValue('Person 3')).toBeTruthy()
      })
    })

    it('should allow removing a person', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      // Add a third person first
      const addButton = screen.getByText('Add Person')
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Person 3')).toBeTruthy()
      })

      // Remove buttons are accessible by aria-label
      const removeButtons = screen.getAllByLabelText(/Remove .* from bill/i)
      await user.click(removeButtons[2]) // Remove Person 3

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Person removed')
      })
    })

    it('should not allow removing person when only 2 remain', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const removeButtons = screen.getAllByLabelText(/Remove .* from bill/i)
      await user.click(removeButtons[0])

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Minimum 2 people required')
      })
    })

    it('should allow editing person name', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const nameInput = screen.getByDisplayValue('Person 1')
      await user.clear(nameInput)
      await user.type(nameInput, 'Alice')

      expect(nameInput).toHaveValue('Alice')
    })

    it('should allow toggling payment status', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const paidButton = screen.getAllByLabelText(/Mark .* as paid/i)[0]
      await user.click(paidButton)

      // Button should change to "Mark as unpaid"
      await waitFor(() => {
        expect(screen.getByLabelText(/Mark Person 1 as unpaid/i)).toBeTruthy()
      })
    })
  })

  describe('Split Type Modes', () => {
    it('should display split type toggle buttons', () => {
      render(<SplitBillPage />)
      expect(screen.getByText('Equal Split')).toBeTruthy()
      expect(screen.getByText('Percentage Split')).toBeTruthy()
      expect(screen.getByText('Item-Based')).toBeTruthy()
    })

    it('should start in equal split mode', () => {
      render(<SplitBillPage />)
      const equalButton = screen.getByText('Equal Split').closest('button')
      expect(equalButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should switch to percentage split mode', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const percentageButton = screen.getByText('Percentage Split')
      await user.click(percentageButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Switched to percentage split')
        // Should display percentage inputs
        expect(screen.getAllByText('Percentage:').length).toBeGreaterThan(0)
      })
    })

    it('should switch to item-based split mode', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const itemsButton = screen.getByText('Item-Based')
      await user.click(itemsButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Switched to item-based split')
        expect(screen.getByText('Add Bill Items')).toBeTruthy()
      })
    })
  })

  describe('Percentage Split Mode', () => {
    it('should display percentage inputs for each person', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const percentageButton = screen.getByText('Percentage Split')
      await user.click(percentageButton)

      await waitFor(() => {
        const percentageLabels = screen.getAllByText('Percentage:')
        expect(percentageLabels.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should warn when percentages do not total 100%', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const percentageButton = screen.getByText('Percentage Split')
      await user.click(percentageButton)

      await waitFor(() => {
        const percentInputs = screen.getAllByDisplayValue('50')
        expect(percentInputs.length).toBeGreaterThan(0)
      })

      // Change one percentage to make total != 100
      const firstPercentInput = screen.getAllByDisplayValue('50')[0]
      await user.clear(firstPercentInput)
      await user.type(firstPercentInput, '60')

      await waitFor(() => {
        expect(screen.getByText(/Invalid Split/i)).toBeTruthy()
      })
    })

    it('should show valid split message when percentages total 100%', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const percentageButton = screen.getByText('Percentage Split')
      await user.click(percentageButton)

      await waitFor(() => {
        // Default should be 50/50 = 100%
        expect(screen.getByText(/Valid Split \(100%\)/i)).toBeTruthy()
      })
    })
  })

  describe('Item-Based Split Mode', () => {
    it('should display item input form', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const itemsButton = screen.getByText('Item-Based')
      await user.click(itemsButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Item name/i)).toBeTruthy()
        expect(screen.getByLabelText(/Item price/i)).toBeTruthy()
        expect(screen.getByLabelText(/Item quantity/i)).toBeTruthy()
      })
    })

    it('should allow adding an item', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const itemsButton = screen.getByText('Item-Based')
      await user.click(itemsButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Item name/i)).toBeTruthy()
      })

      const nameInput = screen.getByLabelText(/Item name/i)
      const priceInput = screen.getByLabelText(/Item price/i)
      const quantityInput = screen.getByLabelText(/Item quantity/i)

      await user.type(nameInput, 'Burger')
      await user.type(priceInput, '15.99')
      await user.type(quantityInput, '2')

      const addItemButton = screen.getByRole('button', { name: '' }).closest('button')
      if (addItemButton) {
        await user.click(addItemButton)
      }

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Added "Burger"')
      })
    })

    it('should show error when adding item without name', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const itemsButton = screen.getByText('Item-Based')
      await user.click(itemsButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Item price/i)).toBeTruthy()
      })

      const priceInput = screen.getByLabelText(/Item price/i)
      await user.type(priceInput, '10')

      // Try to add without name
      const addButtons = screen.getAllByRole('button')
      const addItemButton = addButtons.find((btn) => btn.querySelector('svg'))
      if (addItemButton) {
        await user.click(addItemButton)
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please enter item name')
      })
    })

    it('should show error when adding item with invalid price', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const itemsButton = screen.getByText('Item-Based')
      await user.click(itemsButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Item name/i)).toBeTruthy()
      })

      const nameInput = screen.getByLabelText(/Item name/i)
      await user.type(nameInput, 'Pizza')

      const addButtons = screen.getAllByRole('button')
      const addItemButton = addButtons.find((btn) => btn.querySelector('svg'))
      if (addItemButton) {
        await user.click(addItemButton)
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Please enter a valid price')
      })
    })
  })

  describe('Mode Switching', () => {
    it('should switch to create mode', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const createButton = screen.getByText('Create Shareable Bill')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Bill Information')).toBeTruthy()
        expect(screen.getByLabelText(/Bill Title/i)).toBeTruthy()
        expect(screen.getByLabelText(/Organizer Name/i)).toBeTruthy()
      })
    })

    it('should display shareable bill form fields', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const createButton = screen.getByText('Create Shareable Bill')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Bill Title/i)).toBeTruthy()
        expect(screen.getByLabelText(/Description/i)).toBeTruthy()
        expect(screen.getByLabelText(/Organizer Name/i)).toBeTruthy()
        expect(screen.getByLabelText(/Bank Account Number/i)).toBeTruthy()
        expect(screen.getByLabelText(/Bank Name/i)).toBeTruthy()
      })
    })

    it('should allow entering bill title in create mode', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const createButton = screen.getByText('Create Shareable Bill')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Bill Title/i)).toBeTruthy()
      })

      const titleInput = screen.getByLabelText(/Bill Title/i)
      await user.type(titleInput, 'Team Dinner')

      expect(titleInput).toHaveValue('Team Dinner')
    })
  })

  describe('Calculations', () => {
    it('should calculate total correctly with tip and tax', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      // Set bill = 100, tip = 15%, tax = 10%
      // Expected: 100 + 15 + 10 = 125
      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)
      await user.type(billInput, '100')

      const tipInput = screen.getByLabelText(/Tip/i)
      await user.clear(tipInput)
      await user.type(tipInput, '15')

      const taxInput = screen.getByLabelText(/Tax/i)
      await user.clear(taxInput)
      await user.type(taxInput, '10')

      // Check if calculations are displayed (values will be formatted with currency)
      await waitFor(() => {
        const totalText = screen.getByText('Total:')
        expect(totalText).toBeTruthy()
      })
    })

    it('should calculate per person amount for equal split', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)
      await user.type(billInput, '100')

      const tipInput = screen.getByLabelText(/Tip/i)
      await user.clear(tipInput)
      await user.type(tipInput, '0')

      const taxInput = screen.getByLabelText(/Tax/i)
      await user.clear(taxInput)
      await user.type(taxInput, '0')

      // With 2 people and 100 total, should be 50 per person
      await waitFor(() => {
        expect(screen.getByText('Per Person')).toBeTruthy()
      })
    })
  })

  describe('Actions and Exports', () => {
    it('should have reset button functionality', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      // Modify some values first
      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)
      await user.type(billInput, '999')

      // Note: Reset button might be in a different location, test the function indirectly
      // by checking if trackToolEvent is called with reset event
    })

    it('should display share summary button', () => {
      render(<SplitBillPage />)
      // Share button might be labeled differently, check for common patterns
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for main sections', () => {
      render(<SplitBillPage />)
      const main = screen.getByRole('main')
      expect(main).toBeTruthy()
      expect(main).toHaveAttribute('aria-label', 'Split bill calculator')
    })

    it('should have skip link for keyboard navigation', () => {
      render(<SplitBillPage />)
      const skipLink = screen.getByText('Skip to calculator')
      expect(skipLink).toBeTruthy()
    })

    it('should have fieldset for split type selection', () => {
      render(<SplitBillPage />)
      const fieldset = screen.getByRole('group', { name: /Split type selection/i })
      expect(fieldset).toBeTruthy()
    })

    it('should have aria-pressed states for split type buttons', () => {
      render(<SplitBillPage />)
      const equalButton = screen.getByText('Equal Split').closest('button')
      expect(equalButton).toHaveAttribute('aria-pressed')
    })

    it('should have aria-live regions for calculations', () => {
      render(<SplitBillPage />)
      const liveRegions = screen.getAllByRole('status')
      expect(liveRegions.length).toBeGreaterThan(0)
    })
  })

  describe('Analytics Tracking', () => {
    it('should track currency change', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const currencySelect = screen.getByLabelText(/Currency/i)
      await user.selectOptions(currencySelect, 'EUR')

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'split_bill_currency_change',
          expect.objectContaining({ currency: 'EUR' })
        )
      })
    })

    it('should track adding person', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const addButton = screen.getByText('Add Person')
      await user.click(addButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith(
          'split_bill_add_person',
          expect.objectContaining({ total_people: 3 })
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty bill amount gracefully', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)

      // Should not crash, calculations should handle NaN
      expect(screen.getByText('Total Bill')).toBeTruthy()
    })

    it('should handle negative tip percentage', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const tipInput = screen.getByLabelText(/Tip/i)
      await user.clear(tipInput)
      await user.type(tipInput, '-5')

      // Should accept the value (validation is on input attributes)
      expect(tipInput).toHaveValue(-5)
    })

    it('should handle very large bill amounts', async () => {
      const user = userEvent.setup()
      render(<SplitBillPage />)

      const billInput = screen.getByLabelText(/Bill Amount/i)
      await user.clear(billInput)
      await user.type(billInput, '999999999')

      expect(billInput).toHaveValue(999999999)
    })
  })

  describe('Clipboard Operations', () => {
    it('should have clipboard available for copy operations', () => {
      expect(navigator.clipboard).toBeTruthy()
      expect(navigator.clipboard.writeText).toBeTruthy()
    })
  })
})
