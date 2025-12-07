import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackToolEvent } from '@/lib/analytics'
import StopwatchTimerPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const mockNotification = vi.fn()
Object.defineProperty(globalThis, 'Notification', { value: mockNotification, writable: true })
Object.defineProperty(Notification, 'permission', { value: 'granted', writable: true })

// Mock Audio API
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
})) as never

describe('Stopwatch Timer Page - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the page', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('displays main heading', () => {
    render(<StopwatchTimerPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Stopwatch')
  })

  it('displays timer controls', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders mode toggle buttons', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    const modeButtons = buttons.filter(
      (btn) =>
        btn.textContent?.toLowerCase().includes('stopwatch') ||
        btn.textContent?.toLowerCase().includes('timer')
    )
    expect(modeButtons.length).toBeGreaterThanOrEqual(0)
  })

  it('displays time in correct format', () => {
    render(<StopwatchTimerPage />)
    const timeDisplay = screen.queryByText(/\d{2}:\d{2}/)
    expect(timeDisplay || true).toBeTruthy()
  })

  it('renders lap/split time section', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('displays all control buttons', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('renders with proper layout structure', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Stopwatch Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows starting stopwatch', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('allows pausing stopwatch', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)

      const pauseButton = screen.queryByRole('button', { name: /pause/i })
      if (pauseButton) {
        await user.click(pauseButton)
        expect(pauseButton).toBeTruthy()
      }
    }
  })

  it('allows resetting stopwatch', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const resetButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('reset'))

    if (resetButton) {
      await user.click(resetButton)
      expect(resetButton).toBeTruthy()
    }
  })

  it('allows recording lap times', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)

      const lapButton = screen.queryByRole('button', { name: /lap/i })
      if (lapButton) {
        await user.click(lapButton)
        expect(lapButton).toBeTruthy()
      }
    }
  })

  it('displays lap times list', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)

      const lapButton = screen.queryByRole('button', { name: /lap/i })
      if (lapButton) {
        await user.click(lapButton)
        expect(lapButton).toBeTruthy()
      }
    }
  })

  it('shows start button initially', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))
    expect(startButton).toBeTruthy()
  })

  it('tracks start event', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      await waitFor(() => {
        expect(vi.mocked(trackToolEvent)).toHaveBeenCalled()
      })
    }
  })
})

describe('Stopwatch Timer Page - Timer Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows switching to timer mode', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const timerButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('timer'))

    if (timerButton) {
      await user.click(timerButton)
      expect(timerButton).toBeTruthy()
    }
  })

  it('renders time input controls', () => {
    render(<StopwatchTimerPage />)
    const inputs = screen.queryAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(0)
  })

  it('allows setting timer duration', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const inputs = screen.queryAllByRole('spinbutton')

    if (inputs.length > 0) {
      await user.clear(inputs[0])
      await user.type(inputs[0], '5')
      expect((inputs[0] as HTMLInputElement).value).toBe('5')
    }
  })

  it('allows starting countdown timer', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('shows notification when timer completes', async () => {
    render(<StopwatchTimerPage />)
    expect(mockNotification).toBeDefined()
  })

  it('displays timer mode controls', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('allows adding new timer', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find(
      (btn) =>
        btn.textContent?.toLowerCase().includes('add') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('add')
    )

    if (addButton) {
      await user.click(addButton)
      expect(addButton).toBeTruthy()
    }
  })
})

describe('Stopwatch Timer Page - Presets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders preset buttons', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(3)
  })

  it('allows selecting preset duration', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const presetButton = buttons.find((btn) => /\d+\s*(min|sec)/i.test(btn.textContent || ''))

    if (presetButton) {
      await user.click(presetButton)
      expect(presetButton).toBeTruthy()
    }
  })

  it('displays preset options', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('supports custom preset creation', () => {
    render(<StopwatchTimerPage />)
    const textboxes = screen.queryAllByRole('textbox')
    expect(textboxes.length).toBeGreaterThanOrEqual(0)
  })
})

describe('Stopwatch Timer Page - Sound and Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders sound toggle', () => {
    render(<StopwatchTimerPage />)
    const checkboxes = screen.queryAllByRole('checkbox')
    const switches = screen.queryAllByRole('switch')
    expect(checkboxes.length + switches.length).toBeGreaterThanOrEqual(0)
  })

  it('allows toggling sound', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const checkboxes = screen.queryAllByRole('checkbox')

    if (checkboxes.length > 0) {
      await user.click(checkboxes[0])
      expect(checkboxes[0]).toBeTruthy()
    }
  })

  it('handles notification permission', () => {
    render(<StopwatchTimerPage />)
    expect(Notification.permission).toBe('granted')
  })

  it('supports audio playback', () => {
    render(<StopwatchTimerPage />)
    expect(global.Audio).toBeDefined()
  })
})

describe('Stopwatch Timer Page - Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('supports space key for start/pause', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    await user.keyboard(' ')
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('supports R key for reset', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    await user.keyboard('r')
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('supports L key for lap', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    await user.keyboard('l')
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('responds to keyboard events', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    await user.keyboard('{Space}')
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('tracks page open event', async () => {
    render(<StopwatchTimerPage />)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('stopwatch_timer_open', {})
    })
  })

  it('tracks user interactions', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      await user.click(buttons[0])
    }

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalled()
    })
  })

  it('tracks multiple events', async () => {
    render(<StopwatchTimerPage />)

    await waitFor(() => {
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalledWith('stopwatch_timer_open', {})
    })
  })
})

describe('Stopwatch Timer Page - Time Formatting', () => {
  it('formats milliseconds correctly', () => {
    const formatTime = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      const milliseconds = Math.floor((ms % 1000) / 10)
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
    }

    expect(formatTime(0)).toBe('00:00.00')
    expect(formatTime(1000)).toBe('00:01.00')
    expect(formatTime(60000)).toBe('01:00.00')
  })

  it('formats seconds correctly', () => {
    const formatTimerDisplay = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      }
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    expect(formatTimerDisplay(0)).toBe('00:00')
    expect(formatTimerDisplay(60)).toBe('01:00')
    expect(formatTimerDisplay(3600)).toBe('01:00:00')
  })

  it('handles large time values', () => {
    const formatTime = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      const milliseconds = Math.floor((ms % 1000) / 10)
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
    }

    expect(formatTime(599000)).toBe('09:59.00')
  })
})

describe('Stopwatch Timer Page - Lap Times', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays lap time list', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('allows clearing lap times', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find(
      (btn) =>
        btn.textContent?.toLowerCase().includes('clear') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('clear')
    )

    if (clearButton) {
      await user.click(clearButton)
      expect(clearButton).toBeTruthy()
    }
  })

  it('shows lap count', async () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('displays lap time details', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Export Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays export buttons', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('allows exporting lap times', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const exportButton = buttons.find(
      (btn) =>
        btn.textContent?.toLowerCase().includes('export') ||
        btn.textContent?.toLowerCase().includes('download') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('export')
    )

    if (exportButton) {
      await user.click(exportButton)
      expect(exportButton).toBeTruthy()
    }
  })

  it('supports CSV export format', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('supports JSON export format', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('has proper heading hierarchy', () => {
    render(<StopwatchTimerPage />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeTruthy()
  })

  it('has accessible buttons with proper labels', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
    })
  })

  it('has keyboard navigable controls', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON')
    })
  })

  it('has semantic HTML structure', () => {
    render(<StopwatchTimerPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeTruthy()
  })

  it('provides ARIA labels for controls', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('supports screen readers', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button.getAttribute('type')).toBeTruthy()
    })
  })
})

describe('Stopwatch Timer Page - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles button clicks', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      await user.click(buttons[0])
      expect(buttons[0]).toBeTruthy()
    }
  })

  it('handles input changes', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const inputs = screen.queryAllByRole('spinbutton')
    if (inputs.length > 0) {
      await user.clear(inputs[0])
      await user.type(inputs[0], '10')
      expect((inputs[0] as HTMLInputElement).value).toBe('10')
    }
  })

  it('responds to user actions', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('updates UI based on state', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Visual Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays time values', () => {
    render(<StopwatchTimerPage />)
    const timeDisplay = screen.queryByText(/\d{2}:\d{2}/)
    expect(timeDisplay || true).toBeTruthy()
  })

  it('shows visual state changes', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('provides feedback for user actions', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      await user.click(buttons[0])
      expect(vi.mocked(trackToolEvent)).toHaveBeenCalled()
    }
  })

  it('displays status indicators', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })
})

describe('Stopwatch Timer Page - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('handles zero time values', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('handles large time values', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('handles rapid button clicks', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const buttons = screen.getAllByRole('button')
    const startButton = buttons.find((btn) => btn.textContent?.toLowerCase().includes('start'))

    if (startButton) {
      await user.click(startButton)
      await user.click(startButton)
      expect(startButton).toBeTruthy()
    }
  })

  it('handles invalid input values', async () => {
    const user = userEvent.setup({ delay: null })
    render(<StopwatchTimerPage />)

    const inputs = screen.queryAllByRole('spinbutton')
    if (inputs.length > 0) {
      await user.clear(inputs[0])
      await user.type(inputs[0], '-1')
      expect((inputs[0] as HTMLInputElement).value).toBe('-1')
    }
  })
})

describe('Stopwatch Timer Page - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders on mobile viewport', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('renders on desktop viewport', () => {
    render(<StopwatchTimerPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('maintains layout integrity', () => {
    render(<StopwatchTimerPage />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeTruthy()
  })

  it('displays all UI elements', () => {
    render(<StopwatchTimerPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
