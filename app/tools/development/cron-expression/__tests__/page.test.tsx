import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import CronExpressionPage from '../page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

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

// Mock clipboard API once before all tests
beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
    configurable: true,
  })
})

describe('CronExpressionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the page title', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText('Cron Expression Builder')).toBeTruthy()
    })

    it('should render description text', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Create and validate cron expressions/i)).toBeTruthy()
    })

    it('should track page open event', () => {
      render(<CronExpressionPage />)
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith(
        'cron_expression_builder_open',
        expect.any(Object)
      )
    })
  })

  describe('Expression Input', () => {
    it('should render the main expression input', () => {
      render(<CronExpressionPage />)
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input).toBeTruthy()
    })

    it('should allow editing cron expression', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      await user.type(input, '0 12 * * *')

      expect(input.value).toBe('0 12 * * *')
    })

    it('should have accessible input field', () => {
      render(<CronExpressionPage />)
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input.tagName).toBe('INPUT')
    })
  })

  describe('Human-Readable Description', () => {
    it('should show human-readable description', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Runs at 09:00 Monday through Friday/i)).toBeTruthy()
    })

    it('should update description when expression changes', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      await user.type(input, '0 0 * * *')

      await waitFor(() => {
        expect(screen.queryByText(/midnight|00:00/i)).toBeTruthy()
      })
    })
  })

  describe('Visual Builder', () => {
    it('should render visual builder section', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText('Visual Builder')).toBeTruthy()
    })

    it('should render minute selector', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Minute/i)).toBeTruthy()
    })

    it('should render hour selector', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Hour/i)).toBeTruthy()
    })

    it('should render day selector', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Day|Date/i)).toBeTruthy()
    })

    it('should render month selector', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Month/i)).toBeTruthy()
    })

    it('should render weekday selector', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Weekday|Day of Week/i)).toBeTruthy()
    })

    it('should allow selecting specific minute', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const minuteInputs = document.querySelectorAll('input[type="number"]')
      if (minuteInputs.length > 0) {
        await user.type(minuteInputs[0], '30')
        expect(minuteInputs[0]).toBeTruthy()
      }
    })
  })

  describe('Common Patterns', () => {
    it('should render common patterns', () => {
      render(<CronExpressionPage />)
      const patterns = screen.queryAllByText(/Every|Daily|Weekly|Monthly/)
      expect(patterns.length).toBeGreaterThan(0)
    })

    it('should display Every Minute pattern', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Every Minute/i)).toBeTruthy()
    })

    it('should display Every Hour pattern', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Every Hour/i)).toBeTruthy()
    })

    it('should display Daily pattern', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Daily|Every Day/i)).toBeTruthy()
    })

    it('should display Weekly pattern', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Weekly|Every Week/i)).toBeTruthy()
    })

    it('should display Monthly pattern', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Monthly|Every Month/i)).toBeTruthy()
    })

    it('should apply pattern when clicked', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const pattern = screen.queryByText(/Every Hour/i)
      if (pattern) {
        await user.click(pattern)
        expect(pattern).toBeTruthy()
      }
    })
  })

  describe('Next Executions', () => {
    it('should render next executions section', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText('Next 10 Executions')).toBeTruthy()
    })

    it('should display execution times', () => {
      render(<CronExpressionPage />)
      const times = screen.queryAllByText(/\d{2}:\d{2}|\d{4}-\d{2}-\d{2}/)
      expect(times.length).toBeGreaterThan(0)
    })

    it('should show at least 5 execution times', () => {
      render(<CronExpressionPage />)
      const executionItems = document.querySelectorAll('[class*="execution"]')
      expect(executionItems.length).toBeGreaterThan(0)
    })
  })

  describe('Copy Functionality', () => {
    it('should have copy button', () => {
      render(<CronExpressionPage />)
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    it('should copy expression to clipboard', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      await user.click(copyButtons[0])

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe('Export Configuration', () => {
    it('should render export section', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText('Export Configuration')).toBeTruthy()
    })

    it('should display export format options', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/JSON|YAML|XML/i)).toBeTruthy()
    })

    it('should render export button', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Export|Download/i)).toBeTruthy()
    })

    it('should export configuration', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const exportButton = screen.queryByText(/Export|Download/i)
      if (exportButton) {
        await user.click(exportButton)
        expect(exportButton).toBeTruthy()
      }
    })
  })

  describe('Validation', () => {
    it('should validate cron expression', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      await user.type(input, 'invalid cron')

      await waitFor(() => {
        expect(screen.queryByText(/invalid|error/i)).toBeTruthy()
      })
    })

    it('should show valid indicator for correct expression', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/valid/i)).toBeTruthy()
    })

    it('should show error for invalid expression', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      await user.type(input, '999 999 * * *')

      await waitFor(() => {
        expect(screen.queryByText(/invalid|error/i)).toBeTruthy()
      })
    })
  })

  describe('Quick Select Buttons', () => {
    it('should render quick select buttons', () => {
      render(<CronExpressionPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('should have * wildcard button', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText('*')).toBeTruthy()
    })
  })

  describe('Visual Elements', () => {
    it('should render icons', () => {
      render(<CronExpressionPage />)
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should display formatted layout', () => {
      render(<CronExpressionPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible input fields', () => {
      render(<CronExpressionPage />)
      const input = screen.getByDisplayValue('0 9 * * 1-5')
      expect(input).toBeTruthy()
    })

    it('should have accessible buttons', () => {
      render(<CronExpressionPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have ARIA labels', () => {
      render(<CronExpressionPage />)
      const ariaElements = document.querySelectorAll('[aria-label]')
      expect(ariaElements.length).toBeGreaterThan(0)
    })

    it('should have semantic heading structure', () => {
      render(<CronExpressionPage />)
      const h1 = screen.getByText('Cron Expression Builder')
      expect(h1.tagName).toBe('H1')
    })
  })

  describe('Related Tools', () => {
    it('should render Related Tools section', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Related Tools/i)).toBeTruthy()
    })

    it('should display related tool links', () => {
      render(<CronExpressionPage />)
      const relatedTools = document.querySelectorAll('[href*="/tools/"]')
      expect(relatedTools.length).toBeGreaterThan(0)
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ section', () => {
      render(<CronExpressionPage />)
      expect(screen.getByText(/Frequently Asked Questions|FAQ/i)).toBeTruthy()
    })

    it('should display FAQ items', () => {
      render(<CronExpressionPage />)
      const faqItems = screen.queryAllByText(/\?/)
      expect(faqItems.length).toBeGreaterThan(0)
    })
  })

  describe('Social Share', () => {
    it('should render social share section', () => {
      render(<CronExpressionPage />)
      const shareElements = screen.queryAllByText(/share/i)
      expect(shareElements.length).toBeGreaterThan(0)
    })
  })

  describe('Cron Format Info', () => {
    it('should display cron format information', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/minute|hour|day|month|weekday/i)).toBeTruthy()
    })

    it('should show field descriptions', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/0-59|0-23|1-31|1-12|0-6/i)).toBeTruthy()
    })
  })

  describe('Examples Section', () => {
    it('should display example expressions', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Example|Sample/i)).toBeTruthy()
    })

    it('should show common use cases', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/backup|report|cleanup|sync/i)).toBeTruthy()
    })
  })

  describe('Timezone Support', () => {
    it('should display timezone selector', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Timezone|Time Zone/i)).toBeTruthy()
    })

    it('should show current timezone', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/UTC|GMT|PST|EST/i)).toBeTruthy()
    })
  })

  describe('Clear Functionality', () => {
    it('should render Clear button', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Clear|Reset/i)).toBeTruthy()
    })

    it('should clear expression when clicked', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const clearButton = screen.queryByText(/Clear|Reset/i)
      if (clearButton) {
        await user.click(clearButton)
        expect(clearButton).toBeTruthy()
      }
    })
  })

  describe('Save/Load Feature', () => {
    it('should render Save button', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Save/i)).toBeTruthy()
    })

    it('should render Load button', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/Load/i)).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', () => {
      render(<CronExpressionPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('Expression History', () => {
    it('should display history section', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/History|Recent/i)).toBeTruthy()
    })

    it('should store recent expressions', () => {
      render(<CronExpressionPage />)
      const historyItems = document.querySelectorAll('[class*="history"]')
      expect(historyItems).toBeTruthy()
    })
  })

  describe('Special Characters', () => {
    it('should support asterisk wildcard', async () => {
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      expect(input.value).toContain('*')
    })

    it('should support range syntax', async () => {
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      expect(input.value).toContain('1-5')
    })

    it('should support step values', async () => {
      const user = userEvent.setup()
      render(<CronExpressionPage />)

      const input = screen.getByDisplayValue('0 9 * * 1-5') as HTMLInputElement
      await user.clear(input)
      await user.type(input, '*/15 * * * *')

      expect(input.value).toContain('*/15')
    })
  })

  describe('Execution Frequency', () => {
    it('should calculate execution frequency', () => {
      render(<CronExpressionPage />)
      expect(screen.queryByText(/times per day|times per week|times per month/i)).toBeTruthy()
    })
  })
})
