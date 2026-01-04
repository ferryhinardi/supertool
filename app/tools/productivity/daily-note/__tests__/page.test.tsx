import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/services/analytics'
import DailyNotePage from '../page'

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
  usePathname: () => '/tools/daily-note',
}))

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
vi.mock('@/lib/services/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock clipboard API

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true,
})
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
})

// Use global localStorage from vitest.setup.ts

describe('Daily Note Page - Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
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
    const { container } = render(<DailyNotePage />)

    // Just verify a date is displayed in h2 element
    const dateElement = container.querySelector('h2')
    expect(dateElement).toBeInTheDocument()
    expect(dateElement?.textContent).toBeTruthy()
    // Should contain month name and year
    expect(dateElement?.textContent).toMatch(/\d{4}/) // Contains year
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
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
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
    // Check that the button has the selected styling classes
    expect(dailyLogButton).toHaveClass('bg_green.500/20')
    expect(dailyLogButton).toHaveClass('c_green.400')
    expect(dailyLogButton).toHaveClass('bd-c_green.500/30')
  })

  it('should change template when clicking template button', async () => {
    render(<DailyNotePage />)

    const gratitudeButton = screen.getByRole('button', { name: 'Gratitude Journal' })
    await userEvent.click(gratitudeButton as HTMLElement)

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

    // Should have default Daily Log template content (check actual content not just substring)
    const value = (textarea as HTMLTextAreaElement).value
    expect(value).toContain('# Daily Log')
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
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should navigate to previous day', async () => {
    render(<DailyNotePage />)

    const prevButton = screen.getByRole('button', { name: /Previous/ })
    await userEvent.click(prevButton as HTMLElement)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'prev',
    })
  })

  it('should navigate to next day', async () => {
    render(<DailyNotePage />)

    const nextButton = screen.getByRole('button', { name: /Next/ })
    await userEvent.click(nextButton as HTMLElement)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'next',
    })
  })

  it('should navigate to today', async () => {
    render(<DailyNotePage />)

    const todayButton = screen.getByRole('button', { name: /Today/ })
    await userEvent.click(todayButton as HTMLElement)

    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_date_changed',
      category: 'productivity',
      label: 'today',
    })
  })

  it('should update date display when navigating', async () => {
    const { container } = render(<DailyNotePage />)

    // Get initial date text to verify it's rendered
    const initialDateElement = container.querySelector('h2')
    expect(initialDateElement).toBeInTheDocument()
    const initialDateText = initialDateElement?.textContent || ''

    // Click previous
    const prevButton = screen.getByRole('button', { name: /Previous/ })
    await userEvent.click(prevButton as HTMLElement)

    // Wait for the date to change
    await waitFor(() => {
      const updatedDateElement = container.querySelector('h2')
      const updatedDateText = updatedDateElement?.textContent || ''
      expect(updatedDateText).not.toBe(initialDateText)
    })
  })
})

describe('Daily Note Page - Save Note Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should save note to localStorage', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Type some content
    fireEvent.change(textarea, { target: { value: '# My Daily Note\n\nThis is a test note.' } })

    // Save the note
    await userEvent.click(saveButton as HTMLElement)

    expect(toast.success).toHaveBeenCalledWith('Note saved successfully! 💾')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_saved',
      category: 'productivity',
      label: 'daily-log',
    })
  })

  it('should show error when saving empty note', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Clear the textarea
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to save
    await userEvent.click(saveButton as HTMLElement)

    expect(toast.error).toHaveBeenCalledWith('Note content cannot be empty')
  })

  it('should update existing note', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Save first version
    fireEvent.change(textarea, { target: { value: 'First version' } })
    await userEvent.click(saveButton as HTMLElement)

    // Update and save again
    fireEvent.change(textarea, { target: { value: 'Second version' } })
    await userEvent.click(saveButton as HTMLElement)

    expect(toast.success).toHaveBeenCalledWith('Note updated successfully! 💾')
  })
})

describe('Daily Note Page - Copy Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should copy note to clipboard', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const copyButton = screen.getByRole('button', { name: /Copy/ })

    // Type some content
    fireEvent.change(textarea, { target: { value: '# My Note\n\nContent here' } })

    // Copy
    await userEvent.click(copyButton as HTMLElement)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# My Note\n\nContent here')
    expect(toast.success).toHaveBeenCalledWith('Note copied to clipboard! 📋')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_copied',
      category: 'productivity',
    })
  })

  it('should show error when copying empty note', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const copyButton = screen.getByRole('button', { name: /Copy/ })

    // Clear content
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to copy
    await userEvent.click(copyButton as HTMLElement)

    expect(toast.error).toHaveBeenCalledWith('No content to copy')
  })
})

describe('Daily Note Page - Download Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should download note as markdown file', async () => {
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
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(mockAppendChild)
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(mockRemoveChild)

    // Download
    await userEvent.click(downloadButton as HTMLElement)

    expect(mockClick).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Note downloaded as Markdown! 💾')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_downloaded',
      category: 'productivity',
      label: 'markdown',
    })

    // Restore all mocks
    mockCreateElement.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('should show error when downloading empty note', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const downloadButton = screen.getByRole('button', { name: /Download/ })

    // Clear content
    fireEvent.change(textarea, { target: { value: '' } })

    // Try to download
    await userEvent.click(downloadButton as HTMLElement)

    expect(toast.error).toHaveBeenCalledWith('No content to download')
  })
})

describe('Daily Note Page - Custom Template Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should show custom template creator', async () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    await userEvent.click(createButton as HTMLElement)

    expect(screen.getByPlaceholderText('Template name...')).toBeInTheDocument()
    // Use getAllByRole and find the one that's just "Save" not "Save Note"
    const saveButtons = screen.getAllByRole('button', { name: /Save/ })
    const templateSaveButton = saveButtons.find((btn) => btn.textContent === 'Save')
    expect(templateSaveButton).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
  })

  it('should create custom template', async () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    await userEvent.click(createButton as HTMLElement)

    const nameInput = screen.getByPlaceholderText('Template name...')
    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Enter template name and content
    fireEvent.change(nameInput, { target: { value: 'My Custom Template' } })
    fireEvent.change(textarea, { target: { value: '# Custom Template\n\nContent here' } })

    // Get the template save button (not the "Save Note" button)
    const saveButtons = screen.getAllByRole('button', { name: /Save/ })
    const templateSaveButton = saveButtons.find((btn) => btn.textContent === 'Save')
    if (templateSaveButton) {
      await userEvent.click(templateSaveButton as HTMLElement)
    }

    expect(toast.success).toHaveBeenCalledWith('Custom template "My Custom Template" created! ✨')
    expect(analytics.trackEvent).toHaveBeenCalledWith({
      action: 'daily_note_custom_template_created',
      category: 'productivity',
    })
  })

  it('should show error when creating template with empty name', async () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    await userEvent.click(createButton as HTMLElement)

    // Get the template save button (not the "Save Note" button)
    const saveButtons = screen.getAllByRole('button', { name: /Save/ })
    const templateSaveButton = saveButtons.find((btn) => btn.textContent === 'Save')

    // Try to save without name
    if (templateSaveButton) {
      await userEvent.click(templateSaveButton as HTMLElement)
    }

    expect(toast.error).toHaveBeenCalledWith('Template name cannot be empty')
  })

  it('should cancel custom template creation', async () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    await userEvent.click(createButton as HTMLElement)

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    await userEvent.click(cancelButton as HTMLElement)

    expect(screen.queryByPlaceholderText('Template name...')).not.toBeInTheDocument()
  })
})

describe('Daily Note Page - Statistics Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should display note statistics', () => {
    render(<DailyNotePage />)

    // Should show 0 notes initially
    expect(screen.getByText(/0 notes/)).toBeInTheDocument()
  })

  it('should display word count', () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Type some content (6 words)
    fireEvent.change(textarea, { target: { value: 'Hello world this is a test' } })

    // Should show word count
    expect(screen.getByText(/6 words/)).toBeInTheDocument()
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
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
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
    await userEvent.click(saveButton as HTMLElement)

    // Recent notes should appear
    await waitFor(() => {
      expect(screen.getByText('Recent Notes')).toBeInTheDocument()
    })
  })
})

describe('Daily Note Page - LocalStorage Persistence Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('should persist notes to localStorage', async () => {
    render(<DailyNotePage />)

    const textarea = screen.getByPlaceholderText('Start writing your note here...')
    const saveButton = screen.getByRole('button', { name: /Save Note/ })

    // Save a note
    fireEvent.change(textarea, { target: { value: 'Persistent note' } })
    await userEvent.click(saveButton as HTMLElement)

    // Wait for success toast (indicates save was triggered)
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('saved successfully'))
    })

    // Wait for localStorage to be updated by useEffect
    await waitFor(() => {
      const savedNotes = localStorage.getItem('dailyNotes')
      expect(savedNotes).toBeTruthy()
      const parsed = JSON.parse(savedNotes as string)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].content).toBe('Persistent note')
    })
  })

  it('should load notes from localStorage on mount', async () => {
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
    localStorage.setItem('dailyNotes', JSON.stringify(mockNotes))

    render(<DailyNotePage />)

    // Wait for note to be loaded
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Start writing your note here...')
      expect(textarea).toHaveValue('# Loaded Note\n\nThis was loaded from storage')
    })
  })

  it('should persist custom templates to localStorage', async () => {
    render(<DailyNotePage />)

    const createButton = screen.getByRole('button', { name: /Create Custom Template/ })
    await userEvent.click(createButton as HTMLElement)

    const nameInput = screen.getByPlaceholderText('Template name...')
    const textarea = screen.getByPlaceholderText('Start writing your note here...')

    // Create custom template
    fireEvent.change(nameInput, { target: { value: 'Custom' } })
    fireEvent.change(textarea, { target: { value: 'Custom content' } })

    // Get the template save button (not the "Save Note" button)
    const saveButtons = screen.getAllByRole('button', { name: /Save/ })
    const templateSaveButton = saveButtons.find((btn) => btn.textContent === 'Save')
    if (templateSaveButton) {
      await userEvent.click(templateSaveButton as HTMLElement)
    }

    // Wait for success toast to appear (indicates state was updated)
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Custom template'))
    })

    // Wait for localStorage to be updated by useEffect
    await waitFor(() => {
      const savedTemplates = localStorage.getItem('dailyNoteTemplates')
      expect(savedTemplates).toBeTruthy()
      const parsed = JSON.parse(savedTemplates as string)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('Custom')
    })
  })
})
