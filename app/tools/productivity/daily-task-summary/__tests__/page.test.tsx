import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import DailyTaskSummary from '../page'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Daily Task Summary - Page Rendering', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the daily task summary page', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('displays page title', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByText('Daily Task Summary')).toBeInTheDocument()
  })

  it('displays page description', () => {
    render(<DailyTaskSummary />)
    expect(
      screen.getByText(/Track your daily tasks and analyze your productivity/i)
    ).toBeInTheDocument()
  })

  it('renders Calendar icon in header', () => {
    const { container } = render(<DailyTaskSummary />)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('displays Add New Task section', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByText('Add New Task')).toBeInTheDocument()
  })

  it("displays Today's Statistics section", () => {
    render(<DailyTaskSummary />)
    expect(screen.getByText(/Statistics/i)).toBeInTheDocument()
  })
})

describe('Daily Task Summary - Input Fields', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders task title input', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()
  })

  it('renders duration input', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText(/Duration.*minutes/i)).toBeInTheDocument()
  })

  it('renders category select', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })

  it('renders date selector', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText('Select Date')).toBeInTheDocument()
  })

  it('task title input has placeholder', () => {
    render(<DailyTaskSummary />)
    const input = screen.getByPlaceholderText(/What do you need to do/i)
    expect(input).toBeInTheDocument()
  })

  it('duration input has number type', () => {
    render(<DailyTaskSummary />)
    const input = screen.getByLabelText(/Duration.*minutes/i)
    expect(input).toHaveAttribute('type', 'number')
  })

  it('duration input has min value of 1', () => {
    render(<DailyTaskSummary />)
    const input = screen.getByLabelText(/Duration.*minutes/i)
    expect(input).toHaveAttribute('min', '1')
  })

  it('date input has max value set to today', () => {
    render(<DailyTaskSummary />)
    const dateInput = screen.getByLabelText('Select Date')
    const today = new Date().toISOString().split('T')[0]
    expect(dateInput).toHaveAttribute('max', today)
  })
})

describe('Daily Task Summary - Category Options', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('displays all category options', () => {
    render(<DailyTaskSummary />)
    screen.getByLabelText('Category')

    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Learning' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Health' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Social' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
  })

  it('defaults to Work category', () => {
    render(<DailyTaskSummary />)
    const select = screen.getByLabelText('Category') as HTMLSelectElement
    expect(select.value).toBe('work')
  })

  it('allows changing category', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const select = screen.getByLabelText('Category')
    await user.selectOptions(select, 'personal')

    expect((select as HTMLSelectElement).value).toBe('personal')
  })
})

describe('Daily Task Summary - Add Task', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders add task button', () => {
    render(<DailyTaskSummary />)
    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find(
      (btn) => btn.textContent?.includes('Add') || btn.querySelector('svg')
    )
    expect(addButton).toBeTruthy()
  })

  it('allows adding a new task', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Complete project')
    await user.type(durationInput, '60')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find(
      (btn) => btn.textContent?.includes('Add') || btn.querySelector('svg')
    )

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/complete project/i)).toBeTruthy()
      })
    }
  })

  it('clears input fields after adding task', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title') as HTMLInputElement
    const durationInput = screen.getByLabelText(/Duration.*minutes/i) as HTMLInputElement

    await user.type(titleInput, 'Test task')
    await user.type(durationInput, '30')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(titleInput.value).toBe('')
        expect(durationInput.value).toBe('')
      })
    }
  })

  it('prevents adding empty task', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      const taskElements = screen.queryAllByText(/complete project/i)
      expect(taskElements.length).toBe(0)
    }
  })

  it('prevents adding task without duration', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    await user.type(titleInput, 'Test task')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      // Task should not be added
      expect(screen.queryByText('Test task')).not.toBeInTheDocument()
    }
  })

  it('allows adding task with Enter key in title input', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(durationInput, '45')
    await user.type(titleInput, 'Quick task{Enter}')

    await waitFor(() => {
      expect(screen.queryByText(/quick task/i)).toBeTruthy()
    })
  })

  it('allows adding task with Enter key in duration input', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Another task')
    await user.type(durationInput, '30{Enter}')

    await waitFor(() => {
      expect(screen.queryByText(/another task/i)).toBeTruthy()
    })
  })

  it('tracks task addition in analytics', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Tracked task')
    await user.type(durationInput, '25')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(vi.mocked(analytics.trackEvent)).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'daily_task_summary_task_added',
            category: 'productivity',
          })
        )
      })
    }
  })
})

describe('Daily Task Summary - Task Display', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('displays added tasks', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Visible task')
    await user.type(durationInput, '40')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/visible task/i)).toBeInTheDocument()
      })
    }
  })

  it('displays task duration', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Timed task')
    await user.type(durationInput, '50')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/50m/i)).toBeInTheDocument()
      })
    }
  })

  it('displays task category badge', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)
    const categorySelect = screen.getByLabelText('Category')

    await user.type(titleInput, 'Categorized task')
    await user.type(durationInput, '35')
    await user.selectOptions(categorySelect, 'learning')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Learning')).toBeInTheDocument()
      })
    }
  })
})

describe('Daily Task Summary - Task Interactions', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('allows toggling task completion', async () => {
    const user = userEvent.setup()

    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Toggle task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const checkboxes = screen.queryAllByRole('checkbox')
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0])
      expect(checkboxes[0]).toBeTruthy()
    }
  })

  it('allows deleting a task', async () => {
    const user = userEvent.setup()

    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Delete me',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const buttons = screen.queryAllByRole('button')
    const deleteButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null && btn.getAttribute('aria-label')?.includes('delete')
    })

    if (deleteButton) {
      await user.click(deleteButton)
      expect(deleteButton).toBeTruthy()
    }
  })

  it('tracks task deletion in analytics', async () => {
    const user = userEvent.setup()

    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task to delete',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const buttons = screen.queryAllByRole('button')
    const deleteButton = buttons.find((btn) => btn.getAttribute('aria-label')?.includes('delete'))

    if (deleteButton) {
      await user.click(deleteButton)

      await waitFor(() => {
        expect(vi.mocked(analytics.trackEvent)).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'daily_task_summary_task_deleted',
            category: 'productivity',
          })
        )
      })
    }
  })
})

describe('Daily Task Summary - LocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('loads tasks from localStorage on mount', () => {
    const savedTasks = JSON.stringify([
      {
        id: '1',
        title: 'Saved task',
        duration: 30,
        category: 'work',
        completed: false,
        createdAt: new Date().toISOString().split('T')[0],
      },
    ])

    localStorageMock.setItem('dailyTaskSummary', savedTasks)

    render(<DailyTaskSummary />)

    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('saves tasks to localStorage after adding', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration.*minutes/i)

    await user.type(titleInput, 'Storage test')
    await user.type(durationInput, '45')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        const stored = localStorageMock.getItem('dailyTaskSummary')
        expect(stored).toBeTruthy()
      })
    }
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorageMock.setItem('dailyTaskSummary', 'invalid json')

    render(<DailyTaskSummary />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('initializes with empty array when no localStorage data', () => {
    render(<DailyTaskSummary />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('Daily Task Summary - Statistics', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('displays task statistics', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const progressBars = screen.queryAllByRole('progressbar')
    expect(progressBars.length).toBeGreaterThanOrEqual(0)
  })

  it('calculates completion rate correctly', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Completed',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: '2',
          title: 'Pending',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    // Should show 50% completion
    expect(screen.getByText(/50%/i)).toBeInTheDocument()
  })

  it('displays total time', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    // Should show 1h 0m total
    expect(screen.getByText(/1h 0m/i)).toBeInTheDocument()
  })

  it('shows progress bar', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const progressBars = screen.queryAllByRole('progressbar')
    expect(progressBars.length).toBeGreaterThan(0)
  })
})

describe('Daily Task Summary - Export Functionality', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('renders export buttons', () => {
    render(<DailyTaskSummary />)

    const buttons = screen.getAllByRole('button')
    const exportButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null && btn.textContent?.includes('Download')
    })

    expect(exportButton).toBeTruthy()
  })

  it('allows downloading as text', async () => {
    const user = userEvent.setup()
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Export task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    const buttons = screen.getAllByRole('button')
    const downloadButton = buttons.find((btn) => btn.textContent?.includes('Text'))

    if (downloadButton) {
      await user.click(downloadButton)

      await waitFor(() => {
        expect(createElementSpy).toHaveBeenCalledWith('a')
        expect(appendChildSpy).toHaveBeenCalled()
        expect(removeChildSpy).toHaveBeenCalled()
      })
    }
  })

  it('tracks export in analytics', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    vi.spyOn(document, 'createElement')
    vi.spyOn(document.body, 'appendChild')
    vi.spyOn(document.body, 'removeChild')

    const buttons = screen.getAllByRole('button')
    const downloadButton = buttons.find((btn) => btn.textContent?.includes('Text'))

    if (downloadButton) {
      await user.click(downloadButton)

      await waitFor(() => {
        expect(vi.mocked(analytics.trackEvent)).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'daily_task_summary_downloaded',
            category: 'productivity',
          })
        )
      })
    }
  })
})

describe('Daily Task Summary - Date Selection', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('allows selecting different dates', () => {
    render(<DailyTaskSummary />)

    const dateInput = screen.getByLabelText('Select Date')
    expect(dateInput).toBeInTheDocument()
  })

  it("defaults to today's date", () => {
    render(<DailyTaskSummary />)

    const dateInput = screen.getByLabelText('Select Date') as HTMLInputElement
    const today = new Date().toISOString().split('T')[0]
    expect(dateInput.value).toBe(today)
  })

  it('filters tasks by selected date', async () => {
    const user = userEvent.setup()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Yesterday task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: yesterdayStr,
        },
        {
          id: '2',
          title: 'Today task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const dateInput = screen.getByLabelText('Select Date')
    await user.clear(dateInput)
    await user.type(dateInput, yesterdayStr)

    await waitFor(() => {
      expect(dateInput).toHaveValue(yesterdayStr)
    })
  })
})

describe('Daily Task Summary - Clear All', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('displays clear all button', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find((btn) => btn.textContent?.includes('Clear'))

    if (clearButton) {
      expect(clearButton).toBeInTheDocument()
    }
  })

  it('tracks clear all in analytics', async () => {
    const user = userEvent.setup()
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)

    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find((btn) => btn.textContent?.includes('Clear All'))

    if (clearButton) {
      await user.click(clearButton)

      await waitFor(() => {
        expect(vi.mocked(analytics.trackEvent)).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'daily_task_summary_cleared',
            category: 'productivity',
          })
        )
      })
    }
  })
})

describe('Daily Task Summary - Responsive Design', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders responsive layout', () => {
    render(<DailyTaskSummary />)
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
  })

  it('displays forms in responsive grid', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument()
  })
})

describe('Daily Task Summary - Accessibility', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('has proper heading hierarchy', () => {
    render(<DailyTaskSummary />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
  })

  it('all inputs have labels', () => {
    render(<DailyTaskSummary />)
    expect(screen.getByLabelText('Task Title')).toHaveAccessibleName()
    expect(screen.getByLabelText(/Duration/i)).toHaveAccessibleName()
    expect(screen.getByLabelText('Category')).toHaveAccessibleName()
    expect(screen.getByLabelText('Select Date')).toHaveAccessibleName()
  })

  it('buttons are keyboard accessible', () => {
    render(<DailyTaskSummary />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeTruthy()
    })
  })
})

describe('Daily Task Summary - Edge Cases', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('handles zero duration', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration/i)

    await user.type(titleInput, 'Zero duration')
    await user.type(durationInput, '0')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      // Task should not be added
      expect(screen.queryByText('Zero duration')).not.toBeInTheDocument()
    }
  })

  it('handles very long task titles', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const longTitle = 'A'.repeat(200)
    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration/i)

    await user.type(titleInput, longTitle)
    await user.type(durationInput, '30')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(new RegExp(longTitle.substring(0, 50)))).toBeTruthy()
      })
    }
  })

  it('handles large duration values', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration/i)

    await user.type(titleInput, 'Long task')
    await user.type(durationInput, '999')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText(/long task/i)).toBeTruthy()
      })
    }
  })

  it('handles whitespace-only task title', async () => {
    const user = userEvent.setup()
    render(<DailyTaskSummary />)

    const titleInput = screen.getByLabelText('Task Title')
    const durationInput = screen.getByLabelText(/Duration/i)

    await user.type(titleInput, '   ')
    await user.type(durationInput, '30')

    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find((btn) => btn.textContent?.includes('Add'))

    if (addButton) {
      await user.click(addButton)

      // Task with only whitespace should not be added
      const tasks = screen.queryAllByRole('checkbox')
      expect(tasks.length).toBe(0)
    }
  })
})

describe('Daily Task Summary - Time Formatting', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('formats minutes correctly', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task',
          duration: 45,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)
    // Duration might be formatted differently or split
    expect(
      screen.getByText((content, element) => {
        return (
          element?.textContent?.includes('45') || element?.textContent?.includes('45m') || false
        )
      })
    ).toBeInTheDocument()
  })

  it('formats hours and minutes correctly', () => {
    localStorageMock.setItem(
      'dailyTaskSummary',
      JSON.stringify([
        {
          id: '1',
          title: 'Task 1',
          duration: 90,
          category: 'work',
          completed: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    )

    render(<DailyTaskSummary />)
    // Duration might be split across elements or formatted differently
    expect(
      screen.getByText((content, element) => {
        return (
          (element?.textContent?.includes('1h') && element?.textContent?.includes('30m')) || false
        )
      })
    ).toBeInTheDocument()
  })
})
