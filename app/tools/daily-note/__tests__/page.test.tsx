import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import DailyNotePage from '../page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock clipboard API
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true,
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
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

describe('Daily Note Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should render daily note page', () => {
    render(<DailyNotePage />)

    expect(
      screen.getByRole('heading', { name: 'Daily Note Generator', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Create timestamped notes with customizable templates')
    ).toBeInTheDocument()
  })

  it('should display current date by default', () => {
    render(<DailyNotePage />)

    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(screen.getByText(formattedDate)).toBeInTheDocument()
  })

  it('should display action buttons', () => {
    render(<DailyNotePage />)

    expect(screen.getByRole('button', { name: /Save Note/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download/ })).toBeInTheDocument()
  })

  it('should display date navigation buttons', () => {
    render(<DailyNotePage />)

    expect(screen.getByRole('button', { name: /Previous/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Today/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument()
  })

  it('should display templates section', () => {
    render(<DailyNotePage />)

    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Choose a template to start')).toBeInTheDocument()
  })

  it('should display note editor', () => {
    render(<DailyNotePage />)

    expect(screen.getByText('Your Note')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Write your daily note using markdown syntax. Auto-saves to browser storage.'
      )
    ).toBeInTheDocument()
  })

  it('should display template variables info', () => {
    render(<DailyNotePage />)

    expect(screen.getByText('Template Variables')).toBeInTheDocument()
    expect(screen.getByText(/{{date}}/)).toBeInTheDocument()
    expect(screen.getByText(/{{time}}/)).toBeInTheDocument()
  })
})

describe('Daily Note Page - Template Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should display all default templates', () => {
    render(<DailyNotePage />)

    expect(screen.getByText('Daily Log')).toBeInTheDocument()
    expect(screen.getByText('Gratitude Journal')).toBeInTheDocument()
    expect(screen.getByText('Learning Notes')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    expect(screen.getByText('Project Planning')).toBeInTheDocument()
    expect(screen.getByText('Daily Reflection')).toBeInTheDocument()
    expect(screen.getByText('Standup Notes')).toBeInTheDocument()
    expect(screen.getByText('Blank Note')).toBeInTheDocument()
  })

  it('should have Daily Log template selected by default', () => {
    render(<DailyNotePage />)

    const dailyLogButton = screen.getByRole('button', { name: 'Daily Log' })
    expect(dailyLogButton).toHaveClass('css-')
  })

  it('should change template when clicking template button', () => {
    render(<DailyNotePage />)

    const gratitudeButton = screen.getByRole('button', { name: 'Gratitude Journal' })
    fireEvent.click(gratitudeButton)

    expect(toast.success).toHaveBeenCalledWith('Template "Gratitude Journal" applied! 📝')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_template_changed',
      category: 'productivity',
      label: 'gratitude',
    })
  })

  it('should apply template content when template is selected', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Should have default Daily Log template content
    expect(textarea).toHaveValue(expect.stringContaining('Daily Log'))
  })

  it('should display template categories', () => {
    render(<DailyNotePage />)

    expect(screen.getByText('Productivity')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
  })

  it('should show create custom template button', () => {
    render(<DailyNotePage />)

    expect(screen.getByRole('button', { name: /Create Custom Template/ })).toBeInTheDocument()
  })
})

describe('Daily Note Page - Date Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should navigate to previous day', () => {
    render(<DailyNotePage />)

    const prevButton = screen.getByRole('button', { name: /Previous/ })
    fireEvent.click(prevButton)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'prev',
    })
  })

  it('should navigate to next day', () => {
    render(<DailyNotePage />)

    const nextButton = screen.getByRole('button', { name: /Next/ })
    fireEvent.click(nextButton)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'next',
    })
  })

  it('should navigate to today', () => {
    render(<DailyNotePage />)

    const todayButton = screen.getByRole('button', { name: /Today/ })
    fireEvent.click(todayButton)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'today',
    })
  })

  it('should update date display when navigating', () => {
    render(<DailyNotePage />)

    const today = new Date()
    const formattedToday = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(screen.getByText(formattedToday)).toBeInTheDocument()

    // Click previous
    const prevButton = screen.getByRole('button', { name: /Previous/ })
    fireEvent.click(prevButton)

    // Date should have changed (not equal to today)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const formattedYesterday = yesterday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(screen.getByText(formattedYesterday)).toBeInTheDocument()
  })
})

describe('Daily Note Page - Save Note Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should save note to localStorage', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Type some content
    fireEvent.change(textarea, { target: { value: '# My Daily Note\n\nThis is a test note.' } })

    // Save the note
    fireEvent.click(saveButton)

    expect(toast.success).toHaveBeenCalledWith('Note saved successfully! 💾')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_saved',
      category: 'productivity',
      label: 'daily-log',
    })
  })

  it('should show error when saving empty note', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Clear the textarea
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to save
    fireEvent.click(saveButton)

    expect(toast.error).toHaveBeenCalledWith('Note content cannot be empty')
  })

  it('should update existing note', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Save first version
    fireEvent.change(textarea, { target: { value: 'First version' } })
    fireEvent.click(saveButton)

    // Update and save again
    fireEvent.change(textarea, { target: { value: 'Second version' } })
    fireEvent.click(saveButton)

    expect(toast.success).toHaveBeenCalledWith('Note updated successfully! 💾')
  })
})

describe('Daily Note Page - Copy Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    mockWriteText.mockClear()
  })

  it('should copy note to clipboard', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const copyButton = screen.getByRole('button', { name: /Copy/ })

    // Type some content
    fireEvent.change(textarea, { target: { value: '# My Note\n\nContent here' } })

    // Copy
    fireEvent.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith('# My Note\n\nContent here')
    expect(toast.success).toHaveBeenCalledWith('Note copied to clipboard! 📋')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_copied',
      category: 'productivity',
    })
  })

  it('should show error when copying empty note', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const copyButton = screen.getByRole('button', { name: /Copy/ })

    // Clear content
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to copy
    fireEvent.click(copyButton)

    expect(toast.error).toHaveBeenCalledWith('No content to copy')
  })
})

describe('Daily Note Page - Download Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should download note as markdown file', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const downloadButton = screen.getByRole('button', { name: /Download/ })

    // Type some content
    fireEvent.change(textarea, { target: { value: '# My Note\n\nContent' } })

    // Mock document methods
    const mockClick = vi.fn()
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
    } as unknown as HTMLAnchorElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)

    // Download
    fireEvent.click(downloadButton)

    expect(mockClick).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Note downloaded as Markdown! 💾')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_downloaded',
      category: 'productivity',
      label: 'markdown',
    })

    mockCreateElement.mockRestore()
  })

  it('should show error when downloading empty note', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const downloadButton = screen.getByRole('button', { name: /Download/ })

    // Clear content
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to download
    fireEvent.click(downloadButton)

    expect(toast.error).toHaveBeenCalledWith('No content to download')
  })
})

describe('Daily Note Page - Custom Template Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should show custom template creator', () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    fireEvent.click(createButton)

    expect(screen.getByPlaceholderText('Template name...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
  })

  it('should create custom template', () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    fireEvent.click(createButton)

    const nameInput = screen.getByPlaceholderText('Template name...')
    const saveButton = screen.getByRole('button', { name: /Save/ })
    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Enter template name and content
    fireEvent.change(nameInput, { target: { value: 'My Custom Template' } })
    fireEvent.change(textarea, { target: { value: '# Custom Template\n\nContent here' } })

    // Save custom template
    fireEvent.click(saveButton)

    expect(toast.success).toHaveBeenCalledWith('Custom template "My Custom Template" created! ✨')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_custom_template_created',
      category: 'productivity',
    })
  })

  it('should show error when creating template with empty name', () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    fireEvent.click(createButton)

    const saveButton = screen.getByRole('button', { name: /Save/ })

    // Try to save without name
    fireEvent.click(saveButton)

    expect(toast.error).toHaveBeenCalledWith('Template name cannot be empty')
  })

  it('should cancel custom template creation', () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    fireEvent.click(createButton)

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    fireEvent.click(cancelButton)

    expect(screen.queryByPlaceholderText('Template name...')).not.toBeInTheDocument()
  })
})

describe('Daily Note Page - Statistics Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should display note statistics', () => {
    render(<DailyNotePage />)

    // Should show 0 notes initially
    expect(screen.getByText(/0 notes/)).toBeInTheDocument()
  })

  it('should display word count', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Type some content
    fireEvent.change(textarea, { target: { value: 'Hello world this is a test' } })

    // Should show word count
    expect(screen.getByText(/5 words/)).toBeInTheDocument()
  })

  it('should display character count', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Type some content
    fireEvent.change(textarea, { target: { value: 'Test' } })

    // Should show character count
    expect(screen.getByText(/4 characters/)).toBeInTheDocument()
  })

  it('should display line count', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Type multi-line content
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } })

    // Should show line count
    expect(screen.getByText(/3 lines/)).toBeInTheDocument()
  })
})

describe('Daily Note Page - Recent Notes Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should not show recent notes section when empty', () => {
    render(<DailyNotePage />)

    expect(screen.queryByText('Recent Notes')).not.toBeInTheDocument()
  })

  it('should show recent notes after saving', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Save a note
    fireEvent.change(textarea, { target: { value: 'My first note' } })
    fireEvent.click(saveButton)

    // Recent notes should appear
    await waitFor(() => {
      expect(screen.getByText('Recent Notes')).toBeInTheDocument()
    })
  })
})

describe('Daily Note Page - LocalStorage Persistence Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should persist notes to localStorage', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Save a note
    fireEvent.change(textarea, { target: { value: 'Persistent note' } })
    fireEvent.click(saveButton)

    // Check localStorage
    const savedNotes = localStorageMock.getItem('dailyNotes')
    expect(savedNotes).toBeTruthy()
  })

  it('should load notes from localStorage on mount', () => {
    // Pre-populate localStorage
    const mockNotes = [
      {
        id: 'test-1',
        date: new Date().toISOString().split('T')[0],
        content: '# Loaded Note\n\nThis was loaded from storage',
        template: 'daily-log',
        timestamp: new Date().toISOString(),
      },
    ]
    localStorageMock.setItem('dailyNotes', JSON.stringify(mockNotes))

    render(<DailyNotePage />)

    // Should load the note
    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    expect(textarea).toHaveValue('# Loaded Note\n\nThis was loaded from storage')
  })

  it('should persist custom templates to localStorage', () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    fireEvent.click(createButton)

    const nameInput = screen.getByPlaceholderText('Template name...')
    const saveButton = screen.getByRole('button', { name: /Save/ })
    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Create custom template
    fireEvent.change(nameInput, { target: { value: 'Custom' } })
    fireEvent.change(textarea, { target: { value: 'Custom content' } })
    fireEvent.click(saveButton)

    // Check localStorage
    const savedTemplates = localStorageMock.getItem('dailyNoteTemplates')
    expect(savedTemplates).toBeTruthy()
  })
})
