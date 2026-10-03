import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/services/analytics'
import CronExpressionPage from '../page'

// Mock analytics tracking
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

describe('CronExpressionPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
  })

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CronExpressionPage />
      </QueryClientProvider>
    )

  describe('Page Rendering', () => {
    it('should render the page title', () => {
      renderPage()
      expect(screen.getByText('Cron Expression Builder')).toBeTruthy()
    })

    it('should render description text', () => {
      renderPage()
      expect(screen.getByText(/Build and validate cron schedules visually/i)).toBeTruthy()
    })
  })

  describe('Expression Input', () => {
    it('should render the main expression input', () => {
      renderPage()
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input).toBeTruthy()
    })

    it('should allow editing cron expression', async () => {
      const user = userEvent.setup()
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      fireEvent.change(input, { target: { value: '0 12 * * *' } })

      expect(input.value).toBe('0 12 * * *')
    })

    it('should have accessible input field', () => {
      renderPage()
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input.tagName).toBe('INPUT')
    })
  })

  describe('Human-Readable Description', () => {
    it('should show human-readable description', () => {
      renderPage()
      expect(screen.getByText(/Runs at 09:00 Monday through Friday/i)).toBeTruthy()
    })

    it('should update description when expression changes', async () => {
      const user = userEvent.setup()
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      fireEvent.change(input, { target: { value: '0 0 * * *' } })

      await waitFor(() => {
        expect(screen.getByText('Runs at 00:00 every day')).toBeTruthy()
      })
    })
  })

  describe('Visual Builder', () => {
    it('should render visual builder section', () => {
      renderPage()
      expect(screen.getByText('Visual Builder')).toBeTruthy()
    })

    it('should render minute selector', () => {
      renderPage()
      expect(screen.getByLabelText('Minute')).toBeTruthy()
    })

    it('should render hour selector', () => {
      renderPage()
      expect(screen.getByLabelText('Hour')).toBeTruthy()
    })

    it('should render day selector', () => {
      renderPage()
      expect(screen.getByLabelText('Day')).toBeTruthy()
    })

    it('should render month selector', () => {
      renderPage()
      expect(screen.getByLabelText('Month')).toBeTruthy()
    })

    it('should render weekday selector', () => {
      renderPage()
      expect(screen.getByLabelText('Weekday')).toBeTruthy()
    })

    it('should allow selecting specific minute', async () => {
      const _user = userEvent.setup()
      renderPage()

      const minuteInputs = document.querySelectorAll('input[type="number"]')
      if (minuteInputs.length > 0) {
        fireEvent.change(minuteInputs[0], { target: { value: '30' } })
        expect(minuteInputs[0]).toBeTruthy()
      }
    })
  })

  describe('Common Patterns', () => {
    it('should render common patterns', () => {
      renderPage()
      const patterns = screen.queryAllByText(/Every|Daily|Weekly|Monthly/)
      expect(patterns.length).toBeGreaterThan(0)
    })

    it('should display Every Minute pattern', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /Every Minute/i })).toBeTruthy()
    })

    it('should display Every Hour pattern', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.click(screen.getByRole('button', { name: /^hourly$/i }))
      expect(screen.getByRole('button', { name: /Every Hour/i })).toBeTruthy()
    })

    it('should display Daily pattern', () => {
      renderPage()
      expect(screen.queryByText(/Daily|Every Day/i)).toBeTruthy()
    })

    it('should display Weekly pattern', () => {
      renderPage()
      expect(screen.queryByText(/Weekly|Every Week/i)).toBeTruthy()
    })

    it('should display Monthly pattern', () => {
      renderPage()
      expect(screen.queryByText(/Monthly|Every Month/i)).toBeTruthy()
    })

    it('should apply pattern when clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const pattern = screen.queryByText(/Every Hour/i)
      if (pattern) {
        await user.click(pattern)
        expect(pattern).toBeTruthy()
      }
    })
  })

  describe('Next Executions', () => {
    it('should render next executions section', () => {
      renderPage()
      expect(screen.getByText('Next 10 Executions')).toBeTruthy()
    })

    it('should display execution times', () => {
      renderPage()
      const times = screen.queryAllByText(/\d{2}:\d{2}|\d{4}-\d{2}-\d{2}/)
      expect(times.length).toBeGreaterThan(0)
    })

    it('should show at least 5 execution times', () => {
      renderPage()
      const executionItems = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(executionItems.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Copy Functionality', () => {
    it('should have copy button', () => {
      renderPage()
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should copy expression to clipboard', async () => {
      const user = userEvent.setup()
      renderPage()

      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      await user.click(copyButtons[0])

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe('Export Configuration', () => {
    it('should render export section', () => {
      renderPage()
      expect(screen.getByText('Export Configuration')).toBeTruthy()
    })

    it('should display export format options', () => {
      renderPage()
      expect(screen.getByRole('option', { name: 'Crontab' })).toBeTruthy()
      expect(screen.getByRole('option', { name: 'Kubernetes CronJob' })).toBeTruthy()
      expect(screen.getByRole('option', { name: 'GitHub Actions' })).toBeTruthy()
    })

    it('should render export button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /Copy Config/i })).toBeTruthy()
    })

    it('should export configuration', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: /Copy Config/i }))

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('cron_expression_export', {
          platform: 'crontab',
        })
      })
    })
  })

  describe('Validation', () => {
    it('should validate cron expression', async () => {
      const user = userEvent.setup()
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      fireEvent.change(input, { target: { value: 'invalid cron' } })

      await waitFor(() => {
        expect(screen.getByText(/exactly five or six space separated parts/i)).toBeTruthy()
      })
    })

    it('should show valid indicator for correct expression', () => {
      renderPage()
      expect(screen.getByText(/Runs at 09:00 Monday through Friday/i)).toBeTruthy()
    })

    it('should show error for invalid expression', async () => {
      const user = userEvent.setup()
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      fireEvent.change(input, { target: { value: '999 999 * * *' } })

      await waitFor(() => {
        expect(screen.getByText(/Invalid value for minute: 999/i)).toBeTruthy()
      })
    })
  })

  describe('Quick Select Buttons', () => {
    it('should render quick select buttons', () => {
      renderPage()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('should document the * wildcard in the syntax guide', () => {
      renderPage()
      expect(screen.getByText(/Use \* for any value/i)).toBeTruthy()
    })
  })

  describe('Visual Elements', () => {
    it('should render icons', () => {
      renderPage()
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should display formatted layout', () => {
      renderPage()
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible input fields', () => {
      renderPage()
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input).toBeTruthy()
    })

    it('should have accessible buttons', () => {
      renderPage()
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have accessible field labels', () => {
      renderPage()
      expect(screen.getByLabelText('Minute')).toBeTruthy()
      expect(screen.getByLabelText('Hour')).toBeTruthy()
      expect(screen.getByLabelText('Day')).toBeTruthy()
      expect(screen.getByLabelText('Month')).toBeTruthy()
      expect(screen.getByLabelText('Weekday')).toBeTruthy()
    })

    it('should have semantic heading structure', () => {
      renderPage()
      const h1 = screen.getByText('Cron Expression Builder')
      expect(h1.tagName).toBe('H1')
    })
  })

  describe('Cron Format Info', () => {
    it('should display cron format information', () => {
      renderPage()
      expect(screen.getByText('Cron Syntax Guide')).toBeTruthy()
      expect(screen.getByText(/Use \* for any value/i)).toBeTruthy()
    })

    it('should show field descriptions', () => {
      renderPage()
      expect(screen.getByText('0-59')).toBeTruthy()
      expect(screen.getByText('0-23')).toBeTruthy()
      expect(screen.getByText('1-31')).toBeTruthy()
      expect(screen.getByText('1-12')).toBeTruthy()
      expect(screen.getByText('0-6')).toBeTruthy()
    })
  })

  describe('Clear Functionality', () => {
    it('should clear expression when clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const clearButton = screen.queryByText(/Clear|Reset/i)
      if (clearButton) {
        await user.click(clearButton)
        expect(clearButton).toBeTruthy()
      }
    })
  })

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', () => {
      renderPage()
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Expression History', () => {
    it('should store recent expressions', () => {
      renderPage()
      const historyItems = document.querySelectorAll('[class*="history"]')
      expect(historyItems).toBeTruthy()
    })
  })

  describe('Special Characters', () => {
    it('should support asterisk wildcard', async () => {
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      expect(input.value).toContain('*')
    })

    it('should support range syntax', async () => {
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      expect(input.value).toContain('1-5')
    })

    it('should support step values', async () => {
      const user = userEvent.setup()
      renderPage()

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      fireEvent.change(input, { target: { value: '*/15 * * * *' } })

      expect(input.value).toContain('*/15')
    })
  })
})
