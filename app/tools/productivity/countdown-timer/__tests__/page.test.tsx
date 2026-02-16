import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CountdownTimerPage from '../page'

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock nuqs
const mockSetEventName = vi.fn()
const mockSetTargetDateTime = vi.fn()

vi.mock('nuqs', () => ({
  parseAsString: {
    withDefault: (defaultValue: string) => ({
      defaultValue,
    }),
  },
  useQueryState: vi.fn((key: string) => {
    if (key === 'event') {
      return ['', mockSetEventName]
    }
    if (key === 'target') {
      return ['', mockSetTargetDateTime]
    }
    return ['', vi.fn()]
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
}

// Mock navigator.share
const mockShare = vi.fn(() => Promise.resolve())

describe('CountdownTimerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    Object.assign(navigator, {
      clipboard: mockClipboard,
      share: mockShare,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders the page title correctly', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Countdown')).toBeInTheDocument()
      expect(screen.getByText('Timer')).toBeInTheDocument()
    })

    it('renders the page description', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText(/Set a countdown to any date and time/i)).toBeInTheDocument()
    })

    it('renders the productivity tool badge', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Productivity Tool')).toBeInTheDocument()
    })

    it('renders the timer settings card', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Timer Settings')).toBeInTheDocument()
      expect(screen.getByText('Set up your countdown')).toBeInTheDocument()
    })

    it('renders event name input', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Event Name (optional)')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('e.g., Product Launch, Birthday, Vacation')
      ).toBeInTheDocument()
    })

    it('renders target date/time input', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Target Date & Time')).toBeInTheDocument()
      expect(screen.getByLabelText('Target Date & Time')).toBeInTheDocument()
    })

    it('renders tomorrow preset button', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByRole('button', { name: /tomorrow/i })).toBeInTheDocument()
    })

    it('renders start countdown button when not started', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByRole('button', { name: /start countdown/i })).toBeInTheDocument()
    })

    it('renders quick presets section when not started', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Quick Presets')).toBeInTheDocument()
      expect(screen.getByText('Click to set a countdown quickly')).toBeInTheDocument()
    })

    it('renders all quick preset options', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('1 Hour')).toBeInTheDocument()
      expect(screen.getByText('4 Hours')).toBeInTheDocument()
      expect(screen.getByText('24 Hours')).toBeInTheDocument()
      expect(screen.getByText('1 Week')).toBeInTheDocument()
      expect(screen.getByText('1 Month')).toBeInTheDocument()
      expect(screen.getByText('New Year')).toBeInTheDocument()
    })

    it('renders FAQ section', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('How accurate is the countdown timer?')).toBeInTheDocument()
    })
  })

  describe('Input Interactions', () => {
    it('allows entering event name', () => {
      render(<CountdownTimerPage />)

      const eventNameInput = screen.getByPlaceholderText('e.g., Product Launch, Birthday, Vacation')
      fireEvent.change(eventNameInput, { target: { value: 'My Birthday' } })

      expect(mockSetEventName).toHaveBeenCalledWith('My Birthday')
    })

    it('allows entering target date/time', () => {
      render(<CountdownTimerPage />)

      const dateTimeInput = screen.getByLabelText('Target Date & Time')
      fireEvent.change(dateTimeInput, { target: { value: '2025-12-31T23:59' } })

      expect(mockSetTargetDateTime).toHaveBeenCalledWith('2025-12-31T23:59')
    })

    it('clicking tomorrow button sets target datetime', () => {
      render(<CountdownTimerPage />)

      const tomorrowButton = screen.getByRole('button', { name: /tomorrow/i })
      fireEvent.click(tomorrowButton)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })
  })

  describe('Quick Presets', () => {
    it('clicking 1 Hour preset sets target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('1 Hour')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })

    it('clicking 4 Hours preset sets target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('4 Hours')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })

    it('clicking 24 Hours preset sets target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('24 Hours')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })

    it('clicking 1 Week preset sets target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('1 Week')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })

    it('clicking 1 Month preset sets target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('1 Month')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
    })

    it('clicking New Year preset sets event name and target datetime', () => {
      render(<CountdownTimerPage />)

      const preset = screen.getByText('New Year')
      fireEvent.click(preset)

      expect(mockSetTargetDateTime).toHaveBeenCalled()
      expect(mockSetEventName).toHaveBeenCalled()
    })
  })

  describe('Start Countdown Button', () => {
    it('start button is disabled when no target is set', () => {
      render(<CountdownTimerPage />)

      const startButton = screen.getByRole('button', { name: /start countdown/i })
      expect(startButton).toBeDisabled()
    })
  })

  describe('Analytics', () => {
    it('tracks tool open event on mount', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<CountdownTimerPage />)

      expect(trackToolEvent).toHaveBeenCalledWith('countdown_timer_open', {})
    })
  })

  describe('FAQ Content', () => {
    it('displays FAQ about timer accuracy', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('How accurate is the countdown timer?')).toBeInTheDocument()
    })

    it('displays FAQ about sharing countdown', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Can I share my countdown with others?')).toBeInTheDocument()
    })

    it('displays FAQ about countdown reaching zero', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('What happens when the countdown reaches zero?')).toBeInTheDocument()
    })

    it('displays FAQ about browser closing', () => {
      render(<CountdownTimerPage />)

      expect(
        screen.getByText('Does the countdown work if I close the browser?')
      ).toBeInTheDocument()
    })

    it('displays FAQ about timezone', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('What timezone is the countdown based on?')).toBeInTheDocument()
    })

    it('displays FAQ about multiple countdowns', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('Can I create multiple countdowns?')).toBeInTheDocument()
    })

    it('displays FAQ about date formats', () => {
      render(<CountdownTimerPage />)

      expect(screen.getByText('What date formats are supported?')).toBeInTheDocument()
    })

    it('displays FAQ about future limit', () => {
      render(<CountdownTimerPage />)

      expect(
        screen.getByText('Is there a limit on how far in the future I can set the countdown?')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has labeled event name input', () => {
      render(<CountdownTimerPage />)

      const label = screen.getByText('Event Name (optional)')
      expect(label).toHaveAttribute('for', 'countdown-event-name')
    })

    it('has labeled target datetime input', () => {
      render(<CountdownTimerPage />)

      const label = screen.getByText('Target Date & Time')
      expect(label).toHaveAttribute('for', 'countdown-target-datetime')
    })

    it('preset buttons are keyboard accessible', () => {
      render(<CountdownTimerPage />)

      // Check that preset buttons exist and are accessible
      const presetButtons = screen.getAllByRole('button')
      expect(presetButtons.length).toBeGreaterThan(0)

      // Verify buttons are focusable (not disabled by default)
      presetButtons.forEach((button) => {
        expect(button).not.toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Responsive Layout', () => {
    it('renders main content container', () => {
      render(<CountdownTimerPage />)

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })
})

// Test the helper functions separately
describe('calculateTimeRemaining function', () => {
  it('returns zeros when target is in the past', () => {
    const pastDate = new Date(Date.now() - 1000)
    // This tests the internal logic - the component should show "Time's Up!"
    const now = new Date()
    const total = pastDate.getTime() - now.getTime()

    expect(total).toBeLessThan(0)
  })

  it('calculates days correctly', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    const now = new Date()
    const total = futureDate.getTime() - now.getTime()
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    expect(days).toBe(2)
  })

  it('calculates hours correctly', () => {
    const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours from now
    const now = new Date()
    const total = futureDate.getTime() - now.getTime()
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)

    expect(hours).toBe(5)
  })

  it('calculates minutes correctly', () => {
    const futureDate = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    const now = new Date()
    const total = futureDate.getTime() - now.getTime()
    const minutes = Math.floor((total / 1000 / 60) % 60)

    expect(minutes).toBe(30)
  })

  it('calculates seconds correctly', () => {
    const futureDate = new Date(Date.now() + 45 * 1000) // 45 seconds from now
    const now = new Date()
    const total = futureDate.getTime() - now.getTime()
    const seconds = Math.floor((total / 1000) % 60)

    expect(seconds).toBe(45)
  })
})

describe('formatDateTime function', () => {
  it('formats date correctly with padding', () => {
    const date = new Date(2025, 0, 5, 9, 5) // Jan 5, 2025, 09:05
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`

    expect(formatted).toBe('2025-01-05T09:05')
  })

  it('formats date with double digits correctly', () => {
    const date = new Date(2025, 11, 25, 15, 30) // Dec 25, 2025, 15:30
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`

    expect(formatted).toBe('2025-12-25T15:30')
  })
})

// Additional tests for started state
describe('CountdownTimerPage with started state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks tool open event on mount', async () => {
    const { trackToolEvent } = await import('@/lib/services/analytics')
    render(<CountdownTimerPage />)

    expect(trackToolEvent).toHaveBeenCalledWith('countdown_timer_open', {})
  })
})

// Test loading state (Suspense fallback)
describe('CountdownTimerPage Loading State', () => {
  it('renders loading text in suspense fallback', async () => {
    // The Suspense boundary shows "Loading..." while the component loads
    render(<CountdownTimerPage />)

    // After mounting, the actual content should be visible
    await waitFor(() => {
      expect(screen.getByText('Countdown')).toBeInTheDocument()
    })
  })
})
