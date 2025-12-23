import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PomodoroTimerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

// Mock SEO components that use Next.js Link
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => null,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => null,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => null,
}))

// Mock Notification API
const mockNotification = vi.fn()
Object.defineProperty(globalThis, 'Notification', {
  writable: true,
  configurable: true,
  value: Object.assign(mockNotification, {
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  }),
})

// Mock AudioContext
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  destination: {},
  currentTime: 0,
}
Object.defineProperty(globalThis, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
})

describe('Pomodoro Timer Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render pomodoro timer page', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByRole('heading', { name: 'Pomodoro Timer', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Boost productivity with the Pomodoro Technique/i)).toBeInTheDocument()
  })

  it('should display timer with default work duration (25:00)', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('should display mode buttons', () => {
    render(<PomodoroTimerPage />)

    // Use getAllByRole since "Work" appears in multiple places (mode button + FAQ)
    const workButtons = screen.getAllByRole('button', { name: /^Work$/i })
    expect(workButtons.length).toBeGreaterThan(0)

    const shortBreakButtons = screen.getAllByRole('button', { name: /^Short Break$/i })
    expect(shortBreakButtons.length).toBeGreaterThan(0)

    const longBreakButtons = screen.getAllByRole('button', { name: /^Long Break$/i })
    expect(longBreakButtons.length).toBeGreaterThan(0)
  })

  it('should display play and reset buttons', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('should start timer when Start button is clicked', async () => {
    render(<PomodoroTimerPage />)

    const startButton = screen.getByRole('button', { name: /Start/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()
    })
  })

  it('should switch to Short Break mode', async () => {
    render(<PomodoroTimerPage />)

    const shortBreakButton = screen.getByRole('button', { name: /Short Break/i })
    await userEvent.click(shortBreakButton)

    await waitFor(() => {
      expect(screen.getByText('05:00')).toBeInTheDocument()
    })
  })

  it('should switch to Long Break mode', async () => {
    render(<PomodoroTimerPage />)

    const longBreakButton = screen.getByRole('button', { name: /Long Break/i })
    await userEvent.click(longBreakButton)

    await waitFor(() => {
      expect(screen.getByText('15:00')).toBeInTheDocument()
    })
  })

  it('should display quick stats', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByText('Session')).toBeInTheDocument()
    expect(screen.getAllByText('Today').length).toBeGreaterThan(0)
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('should display keyboard shortcuts hint', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByText('Space')).toBeInTheDocument()
    expect(screen.getByText('Play/Pause')).toBeInTheDocument()
    expect(screen.getByText('Esc')).toBeInTheDocument()
    expect(screen.getAllByText('Reset').length).toBeGreaterThan(0)
  })

  it('should display tasks section', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByRole('heading', { name: /Tasks/i })).toBeInTheDocument()
    expect(screen.getByText('Track your Pomodoros per task')).toBeInTheDocument()
  })

  it('should add a task', async () => {
    render(<PomodoroTimerPage />)

    const taskNameInput = screen.getByPlaceholderText('What are you working on?')
    const targetInput = screen.getByLabelText('Target Pomodoros')
    const addButton = screen.getByRole('button', { name: /Add Task/i })

    await userEvent.type(taskNameInput, 'Write tests')
    fireEvent.change(targetInput, { target: { value: '3' } })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Write tests')).toBeInTheDocument()
      expect(screen.getByText('0/3')).toBeInTheDocument()
    })
  })

  it('should show error when adding task without name', async () => {
    const { toast } = await import('sonner')

    render(<PomodoroTimerPage />)

    const addButton = screen.getByRole('button', { name: /Add Task/i })
    await userEvent.click(addButton)

    expect(toast.error).toHaveBeenCalledWith('Please enter a task name')
  })

  it('should display tips section', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByText('How to Use the Pomodoro Technique')).toBeInTheDocument()
    expect(screen.getByText('Choose a Task')).toBeInTheDocument()
    expect(screen.getByText('Work for 25 Minutes')).toBeInTheDocument()
    expect(screen.getByText('Take a Short Break')).toBeInTheDocument()
    expect(screen.getByText('Repeat & Rest')).toBeInTheDocument()
  })

  it('should persist tasks to localStorage', async () => {
    render(<PomodoroTimerPage />)

    const taskNameInput = screen.getByPlaceholderText('What are you working on?')
    const addButton = screen.getByRole('button', { name: /Add Task/i })

    await userEvent.type(taskNameInput, 'Persistent task')
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('pomodoro_tasks')
      expect(saved).toBeTruthy()
      if (saved) {
        const tasks = JSON.parse(saved)
        expect(tasks).toHaveLength(1)
        expect(tasks[0].name).toBe('Persistent task')
      }
    })
  })

  it('should load tasks from localStorage on mount', () => {
    const mockTasks = [
      {
        id: '1',
        name: 'Loaded task',
        pomodorosCompleted: 1,
        pomodorosTarget: 4,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('pomodoro_tasks', JSON.stringify(mockTasks))

    render(<PomodoroTimerPage />)

    expect(screen.getByText('Loaded task')).toBeInTheDocument()
    expect(screen.getByText('1/4')).toBeInTheDocument()
  })

  it('should load settings from localStorage on mount', () => {
    const mockSettings = {
      workDuration: 30,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notificationsEnabled: true,
      soundEnabled: true,
    }
    localStorage.setItem('pomodoro_settings', JSON.stringify(mockSettings))

    render(<PomodoroTimerPage />)

    // Should display 30:00 instead of default 25:00
    expect(screen.getByText('30:00')).toBeInTheDocument()
  })

  it('should display empty state when no tasks exist', () => {
    render(<PomodoroTimerPage />)

    expect(screen.getByText('No tasks yet. Add one to get started!')).toBeInTheDocument()
  })

  it('should display reset button as disabled when timer is idle', () => {
    render(<PomodoroTimerPage />)

    const resetButton = screen.getByRole('button', { name: /Reset/i })
    expect(resetButton).toBeDisabled()
  })
})
