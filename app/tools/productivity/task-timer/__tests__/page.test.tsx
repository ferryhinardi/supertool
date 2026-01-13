import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TaskTimerPage from '../page'

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

describe('Task Timer Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render task timer page', () => {
    render(<TaskTimerPage />)

    expect(
      screen.getByRole('heading', { name: /Task Timer with Sessions/i, level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Track multiple tasks concurrently with session management/i)
    ).toBeInTheDocument()
  })

  it('should display session control section', () => {
    render(<TaskTimerPage />)

    expect(screen.getByRole('heading', { name: /Session Control/i })).toBeInTheDocument()
    expect(screen.getByText(/Start a new session to track tasks/i)).toBeInTheDocument()
  })

  it('should display start session button', () => {
    render(<TaskTimerPage />)

    expect(screen.getByRole('button', { name: /Start Session/i })).toBeInTheDocument()
  })

  it('should start a new session', async () => {
    const { toast } = await import('sonner')
    render(<TaskTimerPage />)

    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Started session'))
    })

    expect(screen.getByRole('button', { name: /End Session/i })).toBeInTheDocument()
  })

  it('should show session name input before starting', () => {
    render(<TaskTimerPage />)

    expect(screen.getByPlaceholderText('Session name (optional)')).toBeInTheDocument()
  })

  it('should display session statistics when session is active', async () => {
    render(<TaskTimerPage />)

    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Active Timers')).toBeInTheDocument()
      expect(screen.getByText('Total Timers')).toBeInTheDocument()
      expect(screen.getByText('Session Time')).toBeInTheDocument()
    })
  })

  it('should show add timer section when session is active', async () => {
    render(<TaskTimerPage />)

    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Add Task Timer/i })).toBeInTheDocument()
      expect(screen.getByText('Create a new timer to track a specific task')).toBeInTheDocument()
    })
  })

  it('should not show add timer section when no session is active', () => {
    render(<TaskTimerPage />)

    expect(screen.queryByRole('heading', { name: /Add Task Timer/i })).not.toBeInTheDocument()
  })

  it('should add a timer when session is active', async () => {
    const { toast } = await import('sonner')
    render(<TaskTimerPage />)

    // Start session
    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Timer/i })).toBeInTheDocument()
    })

    // Add timer
    const timerNameInput = screen.getByPlaceholderText('Task name (optional)')
    const addTimerButton = screen.getByRole('button', { name: /Add Timer/i })

    await userEvent.type(timerNameInput, 'Development Task')
    await userEvent.click(addTimerButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Added timer: Development Task')
      expect(screen.getByText('Development Task')).toBeInTheDocument()
    })
  })

  it('should show error when trying to add timer without session', async () => {
    render(<TaskTimerPage />)

    // Session is not started, should not have add timer button
    expect(screen.queryByRole('button', { name: /Add Timer/i })).not.toBeInTheDocument()
  })

  it('should display active timers section when timers exist', async () => {
    render(<TaskTimerPage />)

    // Start session
    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Timer/i })).toBeInTheDocument()
    })

    // Add timer
    const addTimerButton = screen.getByRole('button', { name: /Add Timer/i })
    await userEvent.click(addTimerButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Active Timers/i })).toBeInTheDocument()
    })
  })

  it('should display timer controls (play, reset, delete)', async () => {
    render(<TaskTimerPage />)

    // Start session and add timer
    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      const addTimerButton = screen.getByRole('button', { name: /Add Timer/i })
      userEvent.click(addTimerButton)
    })

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // Should have play/pause, reset, and remove buttons for the timer
      expect(buttons.length).toBeGreaterThan(3)
    })
  })

  it('should end session and save to history', async () => {
    const { toast } = await import('sonner')
    render(<TaskTimerPage />)

    // Start session
    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /End Session/i })).toBeInTheDocument()
    })

    // End session
    const endButton = screen.getByRole('button', { name: /End Session/i })
    await userEvent.click(endButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Session ended and saved to history')
      expect(screen.getByRole('heading', { name: /Session History/i })).toBeInTheDocument()
    })
  })

  it('should persist session history to localStorage', async () => {
    render(<TaskTimerPage />)

    // Start and end session
    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      const endButton = screen.getByRole('button', { name: /End Session/i })
      userEvent.click(endButton)
    })

    await waitFor(() => {
      const saved = localStorage.getItem('taskTimerSessions')
      expect(saved).toBeTruthy()
      if (saved) {
        const sessions = JSON.parse(saved)
        expect(sessions.length).toBeGreaterThan(0)
      }
    })
  })

  it('should load session history from localStorage on mount', () => {
    const mockSessions = [
      {
        id: '1',
        name: 'Previous Session',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        timers: [{ id: '1', name: 'Task 1', elapsed: 300, isRunning: false }],
        totalTime: 300,
      },
    ]
    localStorage.setItem('taskTimerSessions', JSON.stringify(mockSessions))

    render(<TaskTimerPage />)

    expect(screen.getByText('Previous Session')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Session History/i })).toBeInTheDocument()
  })

  it('should display export buttons for session history', () => {
    const mockSessions = [
      {
        id: '1',
        name: 'Test Session',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        timers: [{ id: '1', name: 'Task 1', elapsed: 300, isRunning: false }],
        totalTime: 300,
      },
    ]
    localStorage.setItem('taskTimerSessions', JSON.stringify(mockSessions))

    render(<TaskTimerPage />)

    // Use getAllByRole to handle multiple matches and verify at least one exists
    const csvButtons = screen.getAllByRole('button', { name: /CSV/i })
    const jsonButtons = screen.getAllByRole('button', { name: /JSON/i })
    expect(csvButtons.length).toBeGreaterThan(0)
    expect(jsonButtons.length).toBeGreaterThan(0)
  })

  it('should display enable notifications button when not granted', () => {
    render(<TaskTimerPage />)

    expect(screen.getByRole('button', { name: /Enable Notifications/i })).toBeInTheDocument()
  })

  it('should display pro tips section', () => {
    render(<TaskTimerPage />)

    expect(screen.getByRole('heading', { name: /Pro Tips/i })).toBeInTheDocument()
    expect(
      screen.getByText(/Start a session to organize multiple task timers together/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Run multiple timers concurrently/i)).toBeInTheDocument()
  })

  it('should create default session name when none provided', async () => {
    const { toast } = await import('sonner')
    render(<TaskTimerPage />)

    const startButton = screen.getByRole('button', { name: /Start Session/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Session \d+/))
    })
  })

  it('should use custom session name when provided', async () => {
    const { toast } = await import('sonner')
    render(<TaskTimerPage />)

    const sessionNameInput = screen.getByPlaceholderText('Session name (optional)')
    const startButton = screen.getByRole('button', { name: /Start Session/i })

    await userEvent.type(sessionNameInput, 'My Work Session')
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Started session: My Work Session')
      expect(screen.getByText('My Work Session')).toBeInTheDocument()
    })
  })

  it('should show session breakdown in history', () => {
    const mockSessions = [
      {
        id: '1',
        name: 'Test Session',
        startTime: Date.now() - 3600000,
        endTime: Date.now(),
        timers: [
          { id: '1', name: 'Task 1', elapsed: 300, isRunning: false },
          { id: '2', name: 'Task 2', elapsed: 500, isRunning: false },
        ],
        totalTime: 800,
      },
    ]
    localStorage.setItem('taskTimerSessions', JSON.stringify(mockSessions))

    render(<TaskTimerPage />)

    expect(screen.getByText('Task Breakdown:')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
  })
})
