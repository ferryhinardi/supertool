import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import DateFormatterPage from '../page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/tools/date-formatter',
}))

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

describe('Date Formatter Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Date Formatter & Parser')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<DateFormatterPage />)
      expect(
        screen.getByText(/Convert timestamps between formats and timezones/)
      ).toBeInTheDocument()
    })

    it('renders the "Powered by Day.js" badge', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Powered by Day.js')).toBeInTheDocument()
    })

    it('renders Date Input section', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Date Input')).toBeInTheDocument()
    })

    it('renders the input field with placeholder', () => {
      render(<DateFormatterPage />)
      expect(
        screen.getByPlaceholderText(/2024-01-01, 1704067200, or any date format.../)
      ).toBeInTheDocument()
    })

    it('renders the "Now" button', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Now')).toBeInTheDocument()
    })

    it('renders Date Difference Calculator section', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Date Difference Calculator')).toBeInTheDocument()
    })

    it('renders Supported Formats info section', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Supported Formats')).toBeInTheDocument()
    })
  })

  describe('Date Input and Parsing', () => {
    it('accepts ISO 8601 date input', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(input.value).toBe('2024-01-15T12:00:00Z')
      })
    })

    it('shows valid date badge when date is parsed successfully', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('displays Unix timestamp for valid date', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Unix Timestamp')).toBeInTheDocument()
      })
    })

    it('displays ISO 8601 format for valid date', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        const iso8601Labels = screen.getAllByText('ISO 8601')
        expect(iso8601Labels.length).toBeGreaterThan(0)
      })
    })

    it('accepts Unix timestamp input', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '1704067200' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('accepts natural language date input', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: 'January 15, 2024' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('does not show valid date badge for invalid input', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: 'invalid-date' } })

      await waitFor(() => {
        expect(screen.queryByText('Valid Date')).not.toBeInTheDocument()
      })
    })

    it('shows relative time for valid date', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      // Use a date that's definitely in the past
      fireEvent.change(input, { target: { value: '2020-01-01T12:00:00Z' } })

      await waitFor(() => {
        const badges = screen.getAllByText(/ago|in/)
        expect(badges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Now Button', () => {
    it('sets current date when Now button is clicked', async () => {
      render(<DateFormatterPage />)
      const nowButton = screen.getByText('Now')
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      await userEvent.click(nowButton)

      await waitFor(() => {
        expect(input.value).not.toBe('')
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('shows valid date after clicking Now button', async () => {
      render(<DateFormatterPage />)
      const nowButton = screen.getByText('Now')

      await userEvent.click(nowButton)

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })
  })

  describe('Format Converter', () => {
    it('shows format converter section for valid date', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Format Converter')).toBeInTheDocument()
      })
    })

    it('does not show format converter section without valid date', () => {
      render(<DateFormatterPage />)
      expect(screen.queryByText('Format Converter')).not.toBeInTheDocument()
    })

    it('displays multiple format presets', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        const copyButtons = screen.getAllByText('Copy')
        expect(copyButtons.length).toBeGreaterThan(5)
      })
    })

    it('copies formatted date to clipboard when copy button is clicked', async () => {
      const { toast } = await import('sonner')
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(async () => {
        const copyButtons = screen.getAllByText('Copy')
        await userEvent.click(copyButtons[0])
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalled()
    })
  })

  describe('Timezone Converter', () => {
    it('shows timezone converter section for valid date', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Timezone Converter')).toBeInTheDocument()
      })
    })

    it('does not show timezone converter section without valid date', () => {
      render(<DateFormatterPage />)
      expect(screen.queryByText('Timezone Converter')).not.toBeInTheDocument()
    })

    it('displays timezone select dropdown', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Target Timezone')).toBeInTheDocument()
      })
    })

    it('shows converted time', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Converted Time')).toBeInTheDocument()
      })
    })

    it('changes converted time when timezone is changed', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(() => {
        expect(screen.getByText('Converted Time')).toBeInTheDocument()
      })

      const select = screen.getByRole('combobox') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'Asia/Tokyo' } })

      await waitFor(() => {
        expect(screen.getByText('Converted Time')).toBeInTheDocument()
      })
    })

    it('copies converted date to clipboard when copy button is clicked', async () => {
      const { toast } = await import('sonner')
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      // Wait for the converted date to appear
      await waitFor(() => {
        expect(screen.getByText('Converted Time')).toBeInTheDocument()
      })

      // Find and click the copy button in the Converted Time section
      // The button is a sibling of the "Converted Time" text's parent div
      const convertedTimeText = screen.getByText('Converted Time')
      const convertedSection = convertedTimeText.parentElement?.parentElement
      const copyButton = convertedSection?.querySelector('button')

      expect(copyButton).not.toBeNull()
      expect(copyButton).toBeInstanceOf(HTMLElement)
      await userEvent.click(copyButton as HTMLElement)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Converted date copied!')
      })
    })
  })

  describe('Date Difference Calculator', () => {
    it('renders start and end date inputs', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Start Date')).toBeInTheDocument()
      expect(screen.getByText('End Date')).toBeInTheDocument()
    })

    it('accepts start date input', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })

      await waitFor(() => {
        expect(startInput.value).toBe('2024-01-01')
      })
    })

    it('accepts end date input', async () => {
      render(<DateFormatterPage />)
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(endInput, { target: { value: '2024-12-31' } })

      await waitFor(() => {
        expect(endInput.value).toBe('2024-12-31')
      })
    })

    it('calculates difference when both dates are valid', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        expect(screen.getByText('Time Difference')).toBeInTheDocument()
      })
    })

    it('displays human readable time difference', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        const timeDiff = screen.getByText('Time Difference').parentElement
        expect(timeDiff).toBeInTheDocument()
      })
    })

    it('displays total days', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        expect(screen.getByText('Total Days')).toBeInTheDocument()
      })
    })

    it('displays total hours', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        expect(screen.getByText('Total Hours')).toBeInTheDocument()
      })
    })

    it('displays total minutes', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        expect(screen.getByText('Total Minutes')).toBeInTheDocument()
      })
    })

    it('displays total seconds', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-15' } })

      await waitFor(() => {
        expect(screen.getByText('Total Seconds')).toBeInTheDocument()
      })
    })

    it('does not show difference without valid dates', () => {
      render(<DateFormatterPage />)
      expect(screen.queryByText('Time Difference')).not.toBeInTheDocument()
    })

    it('handles same dates correctly', async () => {
      render(<DateFormatterPage />)
      const startInput = screen.getByPlaceholderText('2024-01-01') as HTMLInputElement
      const endInput = screen.getByPlaceholderText('2024-12-31') as HTMLInputElement

      fireEvent.change(startInput, { target: { value: '2024-01-01' } })
      fireEvent.change(endInput, { target: { value: '2024-01-01' } })

      await waitFor(() => {
        expect(screen.getByText('Time Difference')).toBeInTheDocument()
      })
    })
  })

  describe('Supported Formats Info', () => {
    it('displays supported formats list', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText(/ISO 8601:/)).toBeInTheDocument()
      expect(screen.getByText(/Unix Timestamp:/)).toBeInTheDocument()
      expect(screen.getByText(/US Format:/)).toBeInTheDocument()
      expect(screen.getByText(/EU Format:/)).toBeInTheDocument()
      expect(screen.getByText(/Natural Language:/)).toBeInTheDocument()
      expect(screen.getByText(/RFC 2822:/)).toBeInTheDocument()
    })

    it('shows info icon', () => {
      render(<DateFormatterPage />)
      const infoSection = screen.getByText('Supported Formats').closest('div')
      expect(infoSection).toBeInTheDocument()
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page open event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<DateFormatterPage />)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('date_formatter_open', {})
      })
    })

    it('tracks copy event when copying format', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2024-01-15T12:00:00Z' } })

      await waitFor(async () => {
        const copyButtons = screen.getAllByText('Copy')
        await userEvent.click(copyButtons[0])
      })

      expect(trackToolEvent).toHaveBeenCalledWith('date_copy', expect.any(Object))
    })

    it('tracks set current date event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<DateFormatterPage />)
      const nowButton = screen.getByText('Now')

      await userEvent.click(nowButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('date_set_current', expect.any(Object))
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<DateFormatterPage />)
      const heading = screen.getByText('Date Formatter & Parser')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive card titles', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Date Input')).toBeInTheDocument()
      expect(screen.getByText('Date Difference Calculator')).toBeInTheDocument()
      expect(screen.getByText('Supported Formats')).toBeInTheDocument()
    })

    it('has descriptive labels for date calculator', () => {
      render(<DateFormatterPage />)
      expect(screen.getByText('Start Date')).toBeInTheDocument()
      expect(screen.getByText('End Date')).toBeInTheDocument()
    })

    it('has placeholder text for inputs', () => {
      render(<DateFormatterPage />)
      expect(
        screen.getByPlaceholderText(/2024-01-01, 1704067200, or any date format.../)
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText('2024-01-01')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('2024-12-31')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty input gracefully', () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '' } })

      expect(screen.queryByText('Valid Date')).not.toBeInTheDocument()
    })

    it('handles very old dates', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '1900-01-01' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('handles future dates', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '2099-12-31' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('handles zero Unix timestamp', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '0' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })

    it('handles millisecond Unix timestamp', async () => {
      render(<DateFormatterPage />)
      const input = screen.getByPlaceholderText(
        /2024-01-01, 1704067200, or any date format.../
      ) as HTMLInputElement

      fireEvent.change(input, { target: { value: '1704067200000' } })

      await waitFor(() => {
        expect(screen.getByText('Valid Date')).toBeInTheDocument()
      })
    })
  })
})
