import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TallyCounterPage from '../page'

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
}))

describe('Tally Counter Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render tally counter page', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('heading', { name: 'Tally Counter', level: 1 })).toBeInTheDocument()
    expect(
      screen.getByText(/Simple and effective tally counter with multiple counters/i)
    ).toBeInTheDocument()
  })

  it('should display default counter with count of 0', () => {
    render(<TallyCounterPage />)

    expect(screen.getByText('Main Counter')).toBeInTheDocument()
    const countDisplays = screen.getAllByText('0')
    expect(countDisplays.length).toBeGreaterThan(0) // Should have at least one 0 displayed
  })

  it('should increment counter when plus button is clicked', async () => {
    render(<TallyCounterPage />)

    const incrementButton = screen.getAllByRole('button').find((btn) => {
      const svg = btn.querySelector('svg')
      return svg?.classList.toString().includes('lucide-plus')
    })

    if (incrementButton) {
      await userEvent.click(incrementButton)
    }

    await waitFor(() => {
      // After increment, count should be 1 (appears in counter display and total)
      const countDisplays = screen.getAllByText('1')
      expect(countDisplays.length).toBeGreaterThan(0)
    })
  })

  it('should display increment and decrement buttons', () => {
    render(<TallyCounterPage />)

    // Check for buttons by looking for the card content
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(2) // Should have at least increment, decrement, and reset buttons
  })

  it('should display reset button', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('should display add counter section', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('heading', { name: /Add Counter/i })).toBeInTheDocument()
    expect(screen.getByText('Create a new tally counter')).toBeInTheDocument()
  })

  it('should add a new counter', async () => {
    render(<TallyCounterPage />)

    const nameInput = screen.getByPlaceholderText('e.g., Visitors, Sales, Items...')
    const addButton = screen.getByRole('button', { name: /Add Counter/i })

    await userEvent.type(nameInput, 'Visitors')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Visitors')).toBeInTheDocument()
    })
  })

  it('should show error when adding counter without name', async () => {
    const { toast } = await import('sonner')

    render(<TallyCounterPage />)

    const addButton = screen.getByRole('button', { name: /Add Counter/i })
    await userEvent.click(addButton)

    expect(toast.error).toHaveBeenCalledWith('Please enter a counter name')
  })

  it('should display step value input', () => {
    render(<TallyCounterPage />)

    // Check for Step Value text instead of label association
    expect(screen.getByText(/Step Value/i) || screen.getByText('Custom Steps')).toBeTruthy()
  })

  it('should display total count', () => {
    render(<TallyCounterPage />)

    expect(screen.getByText('Total Count')).toBeInTheDocument()
  })

  it('should display features section', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('heading', { name: /Features/i })).toBeInTheDocument()
    expect(
      screen.getByText('Create and manage multiple counters simultaneously')
    ).toBeInTheDocument()
    expect(screen.getByText(/Custom Steps/i)).toBeInTheDocument()
  })

  it('should display keyboard shortcuts section', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('heading', { name: /Keyboard Shortcuts/i })).toBeInTheDocument()
    expect(screen.getByText('Available when using a single counter')).toBeInTheDocument()
    expect(screen.getByText('Increment')).toBeInTheDocument()
    expect(screen.getByText('Decrement')).toBeInTheDocument()
  })

  it('should display use cases section', () => {
    render(<TallyCounterPage />)

    expect(screen.getByRole('heading', { name: /Perfect For/i })).toBeInTheDocument()
    expect(screen.getByText('Event Tracking')).toBeInTheDocument()
    expect(screen.getByText('Inventory Management')).toBeInTheDocument()
    expect(screen.getByText('Goal Tracking')).toBeInTheDocument()
  })

  it('should persist counters to localStorage', async () => {
    render(<TallyCounterPage />)

    const nameInput = screen.getByPlaceholderText('e.g., Visitors, Sales, Items...')
    const addButton = screen.getByRole('button', { name: /Add Counter/i })

    await userEvent.type(nameInput, 'Test Counter')
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('tally_counters')
      expect(saved).toBeTruthy()
      if (saved) {
        const counters = JSON.parse(saved)
        expect(counters.length).toBeGreaterThan(1) // Main Counter + Test Counter
        expect(counters.some((c: { name: string }) => c.name === 'Test Counter')).toBe(true)
      }
    })
  })

  it('should load counters from localStorage on mount', () => {
    const mockCounters = [
      {
        id: '1',
        name: 'Loaded Counter',
        count: 5,
        step: 1,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('tally_counters', JSON.stringify(mockCounters))

    render(<TallyCounterPage />)

    expect(screen.getByText('Loaded Counter')).toBeInTheDocument()
    // Count "5" appears in both counter display and total display
    const countDisplays = screen.getAllByText('5')
    expect(countDisplays.length).toBeGreaterThan(0)
  })

  it('should display step value for each counter', () => {
    render(<TallyCounterPage />)

    expect(screen.getByText(/Step: 1/i)).toBeInTheDocument()
  })

  it('should update step value', async () => {
    render(<TallyCounterPage />)

    const stepInputs = screen.getAllByDisplayValue('1')
    const stepInput = stepInputs.find((input) => input.getAttribute('type') === 'number')

    if (stepInput) {
      fireEvent.change(stepInput, { target: { value: '5' } })

      await waitFor(() => {
        expect(stepInput).toHaveValue(5)
      })
    }
  })

  it('should prevent adding counter with invalid step value', async () => {
    const { toast } = await import('sonner')

    render(<TallyCounterPage />)

    const nameInput = screen.getByPlaceholderText('e.g., Visitors, Sales, Items...')
    // Find the step input by role or by finding a number input
    const stepInputs = screen.getAllByRole('spinbutton')
    const stepInput =
      stepInputs.find((input) => {
        const label = input.closest('div')?.querySelector('label')
        return label?.textContent?.includes('Step')
      }) || stepInputs[0]
    const addButton = screen.getByRole('button', { name: /Add Counter/i })

    await userEvent.type(nameInput, 'Invalid Counter')
    if (stepInput) {
      fireEvent.change(stepInput, { target: { value: '-1' } })
    }
    await userEvent.click(addButton)

    // Either toast is called or the step is invalid - test passes if component handles it
    expect(toast.error).toHaveBeenCalled()
  })

  it('should show total count of all counters', async () => {
    const mockCounters = [
      {
        id: '1',
        name: 'Counter 1',
        count: 10,
        step: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Counter 2',
        count: 20,
        step: 1,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('tally_counters', JSON.stringify(mockCounters))

    render(<TallyCounterPage />)

    await waitFor(() => {
      // Total should be 30 (10 + 20)
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })

  it('should remove counter when delete button is clicked', async () => {
    const { toast } = await import('sonner')

    const mockCounters = [
      {
        id: '1',
        name: 'Counter 1',
        count: 0,
        step: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Counter 2',
        count: 0,
        step: 1,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('tally_counters', JSON.stringify(mockCounters))

    render(<TallyCounterPage />)

    // Find trash button
    const trashButtons = screen.getAllByRole('button', { name: /Remove counter/i })
    expect(trashButtons.length).toBeGreaterThan(0)

    await userEvent.click(trashButtons[0])

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Counter removed!')
    })
  })

  it('should prevent removing the last counter', async () => {
    render(<TallyCounterPage />)

    // Try to find and click remove button (should not exist for single counter)
    const removeButtons = screen.queryAllByRole('button', { name: /Remove counter/i })
    expect(removeButtons.length).toBe(0) // No remove button for single counter
  })

  it('should reset counter to zero', async () => {
    const { toast } = await import('sonner')

    const mockCounters = [
      {
        id: '1',
        name: 'Test Counter',
        count: 10,
        step: 1,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('tally_counters', JSON.stringify(mockCounters))

    render(<TallyCounterPage />)

    const resetButton = screen.getByRole('button', { name: /Reset/i })
    await userEvent.click(resetButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Counter reset!')
    })
  })
})
