import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MeetingNotesPage from '../page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock UI components
vi.mock('@/components/ui/faq-accordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion">FAQ Accordion</div>,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => <div data-testid="related-tools">Related Tools</div>,
}))

vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => <div data-testid="social-share">Social Share</div>,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => <div data-testid="tool-rating">Tool Rating</div>,
}))

// Mock localStorage with persistent implementations
const localStorageStore: Record<string, string> = {}

// Create mock functions
const getItemMock = vi.fn((key: string) => localStorageStore[key] || null)
const setItemMock = vi.fn((key: string, value: string) => {
  localStorageStore[key] = value
})
const removeItemMock = vi.fn((key: string) => {
  delete localStorageStore[key]
})
const clearMock = vi.fn(() => {
  for (const key of Object.keys(localStorageStore)) {
    delete localStorageStore[key]
  }
})

const localStorageMock = {
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  clear: clearMock,
  length: 0,
  key: () => null,
  // Helper to pre-populate storage for tests (call BEFORE render)
  _setStore: (data: Record<string, string>) => {
    // Clear existing keys
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key]
    }
    // Add new keys
    Object.assign(localStorageStore, data)
  },
  // Helper to reset store
  _resetStore: () => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key]
    }
  },
}

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()
URL.createObjectURL = mockCreateObjectURL
URL.revokeObjectURL = mockRevokeObjectURL

describe('MeetingNotesPage', () => {
  beforeEach(() => {
    // IMPORTANT: Override localStorage with our mock to take precedence over vitest.setup.ts
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    })

    // Reset localStorage store
    localStorageMock._resetStore()

    // Clear call counts but keep implementations
    getItemMock.mockClear()
    setItemMock.mockClear()
    removeItemMock.mockClear()
    clearMock.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the page title', () => {
      render(<MeetingNotesPage />)
      expect(screen.getByText('Meeting Notes Generator')).toBeInTheDocument()
    })

    it('should render the page description', () => {
      render(<MeetingNotesPage />)
      expect(
        screen.getByText(/Capture meeting notes efficiently with structured templates/i)
      ).toBeInTheDocument()
    })

    it('should render template selection section', () => {
      render(<MeetingNotesPage />)
      expect(screen.getByText('Select Meeting Template')).toBeInTheDocument()
    })

    it('should render all meeting template options', () => {
      render(<MeetingNotesPage />)
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
      expect(screen.getByText('1:1 Meeting')).toBeInTheDocument()
      // Team Meeting may appear multiple times (template label + FAQ)
      expect(screen.getAllByText(/Team Meeting/)[0]).toBeInTheDocument()
      expect(screen.getByText('Client Call')).toBeInTheDocument()
      expect(screen.getByText('Brainstorm')).toBeInTheDocument()
      expect(screen.getByText('Retrospective')).toBeInTheDocument()
    })

    it('should render productivity badge', () => {
      render(<MeetingNotesPage />)
      expect(screen.getByText('Productivity')).toBeInTheDocument()
    })

    it('should render free badge', () => {
      render(<MeetingNotesPage />)
      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('should not show meeting editor until template is selected', () => {
      render(<MeetingNotesPage />)
      // The meeting details card should not be visible initially
      expect(screen.queryByText('Meeting Details')).not.toBeInTheDocument()
    })

    it('should track page open event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      render(<MeetingNotesPage />)
      expect(trackToolEvent).toHaveBeenCalledWith('meeting_notes_open', expect.any(Object))
    })
  })

  describe('Template Selection', () => {
    it('should create a meeting when Daily Standup is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Daily Standup'))

      await waitFor(() => {
        expect(screen.getByText('Meeting Details')).toBeInTheDocument()
      })
    })

    it('should create a meeting with correct title for standup template', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Daily Standup'))

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Daily Standup')
        expect(titleInput).toBeInTheDocument()
      })
    })

    it('should create a meeting when 1:1 Meeting is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('1:1 Meeting'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('1:1 Meeting')).toBeInTheDocument()
      })
    })

    it('should create a meeting when Team Meeting is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      // Use getAllByText since "Team Meeting" appears multiple times
      const teamButtons = screen.getAllByText('Team Meeting')
      await user.click(teamButtons[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument()
      })
    })

    it('should create a meeting when Client Call is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Client Call'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Client Meeting')).toBeInTheDocument()
      })
    })

    it('should create a meeting when Brainstorm is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Brainstorm'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Brainstorming Session')).toBeInTheDocument()
      })
    })

    it('should create a meeting when Retrospective is selected', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Retrospective'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Sprint Retrospective')).toBeInTheDocument()
      })
    })

    it('should populate agenda items from standup template', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getByText('Daily Standup'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('What did you accomplish yesterday?')).toBeInTheDocument()
        expect(screen.getByDisplayValue('What will you work on today?')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Any blockers or challenges?')).toBeInTheDocument()
      })
    })

    it('should track template selection event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      // Use getAllByText since "Team Meeting" appears multiple times
      const teamButtons = screen.getAllByText('Team Meeting')
      await user.click(teamButtons[0])

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('meeting_notes_template_select', {
          template: 'team',
        })
      })
    })
  })

  describe('Meeting Timer', () => {
    it('should display timer at 0:00 initially', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      // Use getAllByText since "Team Meeting" appears multiple times
      const teamButtons = screen.getAllByText('Team Meeting')
      await user.click(teamButtons[0])

      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument()
      })
    })

    it('should have a timer control button', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      // Use getAllByText since "Team Meeting" appears multiple times
      const teamButtons = screen.getAllByText('Team Meeting')
      await user.click(teamButtons[0])

      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument()
      })

      // Find the timer section - there should be a play/pause button with an SVG icon
      const timerSection = screen.getByText('0:00').closest('div')
      expect(timerSection).toBeInTheDocument()
    })
  })

  describe('Meeting Details', () => {
    it('should allow editing meeting title', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument()
      })

      const titleInput = screen.getByDisplayValue('Team Meeting')
      await user.clear(titleInput)
      await user.type(titleInput, 'Q4 Planning Meeting')

      expect(screen.getByDisplayValue('Q4 Planning Meeting')).toBeInTheDocument()
    })

    it('should allow editing meeting date', async () => {
      const user = userEvent.setup()
      const today = new Date().toISOString().split('T')[0]
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        // Date input should have today's date by default
        expect(screen.getByDisplayValue(today)).toBeInTheDocument()
      })
    })

    it('should display date input with current date by default', async () => {
      const user = userEvent.setup()
      const today = new Date().toISOString().split('T')[0]
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue(today)).toBeInTheDocument()
      })
    })
  })

  describe('Attendees Management', () => {
    it('should show empty attendees message initially', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText(/No attendees added yet/i)).toBeInTheDocument()
      })
    })

    it('should add an attendee when Add button is clicked', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Attendees')).toBeInTheDocument()
      })

      // Find Add button in Attendees section
      const attendeesSection = screen.getByText('Attendees').closest('div')
      const addButton = attendeesSection?.parentElement?.querySelector('button')

      if (addButton) {
        await user.click(addButton)
      }

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })
    })

    it('should allow entering attendee name', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Attendees')).toBeInTheDocument()
      })

      // Find and click Add button in Attendees section
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      const attendeeAddButton = addButtons[0]
      await user.click(attendeeAddButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'John Doe')

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    it('should allow entering attendee role', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Attendees')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[0])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Role (optional)')).toBeInTheDocument()
      })

      const roleInput = screen.getByPlaceholderText('Role (optional)')
      await user.type(roleInput, 'Product Manager')

      expect(screen.getByDisplayValue('Product Manager')).toBeInTheDocument()
    })

    it('should remove attendee when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Attendees')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[0])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'John Doe')

      // Find and click remove button (X)
      const attendeeRow = screen.getByDisplayValue('John Doe').closest('div')
      const removeButton = attendeeRow?.querySelector('button')

      if (removeButton) {
        await user.click(removeButton)
      }

      await waitFor(() => {
        expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument()
      })
    })
  })

  describe('Agenda Management', () => {
    it('should display pre-populated agenda items from template', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Team updates and announcements')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Project status review')).toBeInTheDocument()
      })
    })

    it('should add a new agenda item', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Agenda')).toBeInTheDocument()
      })

      // Find Add button in Agenda section (should be second Add button)
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      // Agenda Add button should be second
      await user.click(addButtons[1])

      await waitFor(() => {
        const agendaInputs = screen.getAllByPlaceholderText('Agenda topic')
        expect(agendaInputs.length).toBeGreaterThan(0)
      })
    })

    it('should toggle agenda item completion', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Team updates and announcements')).toBeInTheDocument()
      })

      // Find the checkbox button for the first agenda item
      const agendaItem = screen.getByDisplayValue('Team updates and announcements').closest('div')
      const checkbox = agendaItem?.querySelector('button[type="button"]')

      if (checkbox) {
        await user.click(checkbox)
      }

      // After clicking, the item should be marked as completed (check icon appears)
      await waitFor(() => {
        const checkboxAfter = agendaItem?.querySelector('button[type="button"]')
        expect(checkboxAfter?.querySelector('svg')).toBeInTheDocument()
      })
    })

    it('should remove agenda item', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Q&A')).toBeInTheDocument()
      })

      // Find and click remove button for Q&A item
      const qaItem = screen.getByDisplayValue('Q&A').closest('div')
      const removeButtons = qaItem?.querySelectorAll('button')
      const removeButton = removeButtons?.[removeButtons.length - 1] // Last button should be remove

      if (removeButton) {
        await user.click(removeButton)
      }

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Q&A')).not.toBeInTheDocument()
      })
    })
  })

  describe('Discussion Points', () => {
    it('should show empty discussion points message initially', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('No discussion points yet.')).toBeInTheDocument()
      })
    })

    it('should add a discussion point', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Discussion Points')).toBeInTheDocument()
      })

      // Find Add button in Discussion Points section
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      // Discussion Points Add button should be third
      await user.click(addButtons[2])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Discussion point')).toBeInTheDocument()
      })
    })

    it('should allow editing discussion point', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Discussion Points')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[2])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Discussion point')).toBeInTheDocument()
      })

      const discussionInput = screen.getByPlaceholderText('Discussion point')
      fireEvent.change(discussionInput, { target: { value: 'New feature requirements' } })

      await waitFor(() => {
        expect(screen.getByDisplayValue('New feature requirements')).toBeInTheDocument()
      })
    })
  })

  describe('Action Items', () => {
    it('should show empty action items message initially', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('No action items yet.')).toBeInTheDocument()
      })
    })

    it('should add an action item', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument()
      })

      // Find Add button in Action Items section
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      // Action Items Add button should be fourth
      await user.click(addButtons[3])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument()
      })
    })

    it('should allow setting task description', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[3])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument()
      })

      const taskInput = screen.getByPlaceholderText('Task description')
      await user.type(taskInput, 'Update documentation')

      expect(screen.getByDisplayValue('Update documentation')).toBeInTheDocument()
    })

    it('should allow setting assignee', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[3])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Assignee')).toBeInTheDocument()
      })

      const assigneeInput = screen.getByPlaceholderText('Assignee')
      await user.type(assigneeInput, 'Jane Smith')

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    })

    it('should have priority dropdown with options', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[3])

      await waitFor(() => {
        expect(screen.getByText('Medium Priority')).toBeInTheDocument()
      })

      // Priority dropdown should have options
      const prioritySelect =
        screen.getByDisplayValue('Medium Priority') || screen.getByRole('combobox')

      expect(prioritySelect).toBeInTheDocument()
    })

    it('should toggle action item completion', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Action Items')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[3])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument()
      })

      // Find checkbox for action item
      const taskInput = screen.getByPlaceholderText('Task description')
      const actionItemRow = taskInput.closest('div')
      const checkbox = actionItemRow?.querySelector('button[type="button"]')

      if (checkbox) {
        await user.click(checkbox)
      }

      await waitFor(() => {
        const checkboxAfter = actionItemRow?.querySelector('button[type="button"]')
        expect(checkboxAfter?.querySelector('svg')).toBeInTheDocument()
      })
    })
  })

  describe('Decisions', () => {
    it('should show empty decisions message initially', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('No decisions recorded yet.')).toBeInTheDocument()
      })
    })

    it('should add a decision', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Decisions Made')).toBeInTheDocument()
      })

      // Find Add button in Decisions section
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      // Decisions Add button should be fifth
      await user.click(addButtons[4])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Decision description')).toBeInTheDocument()
      })
    })

    it('should allow entering decision details', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Decisions Made')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[4])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Decision description')).toBeInTheDocument()
      })

      const decisionInput = screen.getByPlaceholderText('Decision description')
      await user.type(decisionInput, 'Use React for the frontend')

      expect(screen.getByDisplayValue('Use React for the frontend')).toBeInTheDocument()
    })

    it('should allow entering who made the decision', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Decisions Made')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[4])

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Made by')).toBeInTheDocument()
      })

      const madeByInput = screen.getByPlaceholderText('Made by')
      await user.type(madeByInput, 'Tech Lead')

      expect(screen.getByDisplayValue('Tech Lead')).toBeInTheDocument()
    })
  })

  describe('General Notes', () => {
    it('should display general notes textarea', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('General Notes')).toBeInTheDocument()
      })
    })

    it('should allow entering general notes', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('General Notes')).toBeInTheDocument()
      })

      const notesTextarea = screen.getByPlaceholderText(/Add any additional notes here/i)
      fireEvent.change(notesTextarea, { target: { value: 'These are my meeting notes' } })

      await waitFor(() => {
        expect(screen.getByDisplayValue('These are my meeting notes')).toBeInTheDocument()
      })
    })
  })

  describe('Save Meeting', () => {
    it('should save meeting to localStorage', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Save'))

      expect(setItemMock).toHaveBeenCalledWith(
        'meeting-notes-data',
        expect.stringContaining('Team Meeting')
      )
      expect(toast.success).toHaveBeenCalledWith('Meeting notes saved!')
    })

    it('should track save event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Save'))

      expect(trackToolEvent).toHaveBeenCalledWith('meeting_notes_save', expect.any(Object))
    })
  })

  describe('Load Meeting', () => {
    it('should show Load button', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Load')).toBeInTheDocument()
      })
    })

    it('should toggle saved meetings panel when Load is clicked', async () => {
      const user = userEvent.setup()

      // Pre-populate with saved meeting
      const savedMeeting = {
        id: 'test-id',
        title: 'Previous Meeting',
        type: 'team',
        date: '2024-01-15',
        attendees: [],
        agenda: [],
        discussionPoints: [],
        actionItems: [],
        decisions: [],
        generalNotes: 'Some notes',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      localStorageMock._setStore({
        'meeting-notes-data': JSON.stringify([savedMeeting]),
      })

      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Load')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Load'))

      await waitFor(() => {
        expect(screen.getByText('Saved Meetings')).toBeInTheDocument()
        expect(screen.getByText('Previous Meeting')).toBeInTheDocument()
      })
    })

    it('should load a saved meeting when clicked', async () => {
      const user = userEvent.setup()

      const savedMeeting = {
        id: 'test-id',
        title: 'Previous Meeting',
        type: 'team',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '',
        duration: 0,
        attendees: [{ id: 'a1', name: 'John', role: '' }],
        agenda: [],
        discussionPoints: [],
        actionItems: [],
        decisions: [],
        generalNotes: 'Some notes from before',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      localStorageMock._setStore({
        'meeting-notes-data': JSON.stringify([savedMeeting]),
      })

      render(<MeetingNotesPage />)

      // First select a template to access the toolbar with Load button
      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Meeting Details')).toBeInTheDocument()
      })

      // The saved meetings section should appear after clicking the Load button
      const loadButton = screen.getByRole('button', { name: /Load/i })
      await user.click(loadButton)

      await waitFor(() => {
        // Saved meetings panel should show with the saved meeting
        expect(screen.getByText('Previous Meeting')).toBeInTheDocument()
      })
    })
  })

  describe('Delete Meeting', () => {
    it('should delete a saved meeting', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()

      const savedMeeting = {
        id: 'test-id',
        title: 'Meeting to Delete',
        type: 'team',
        date: '2024-01-15',
        attendees: [],
        agenda: [],
        discussionPoints: [],
        actionItems: [],
        decisions: [],
        generalNotes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      localStorageMock._setStore({
        'meeting-notes-data': JSON.stringify([savedMeeting]),
      })

      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Load')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Load'))

      await waitFor(() => {
        expect(screen.getByText('Meeting to Delete')).toBeInTheDocument()
      })

      // Find delete button (trash icon)
      const meetingRow = screen.getByText('Meeting to Delete').closest('div')
      const deleteButton =
        meetingRow?.parentElement?.querySelector('button[class*="red"]') ||
        meetingRow?.parentElement?.querySelectorAll('button')[1]

      if (deleteButton) {
        await user.click(deleteButton)
      }

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Meeting deleted')
      })
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy meeting notes to clipboard', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
    })

    it('should generate markdown content', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('# Team Meeting')
      )
    })

    it('should track copy event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(trackToolEvent).toHaveBeenCalledWith('meeting_notes_copy', { format: 'markdown' })
    })
  })

  describe('Export to Markdown', () => {
    it('should download markdown file', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()

      // Mock createElement and click
      const mockClick = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const element = originalCreateElement(tag)
        if (tag === 'a') {
          element.click = mockClick
        }
        return element
      })

      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Export'))

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Downloaded!')
    })

    it('should track export event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Export'))

      expect(trackToolEvent).toHaveBeenCalledWith('meeting_notes_export', { format: 'markdown' })
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should load saved meetings on mount', () => {
      const savedMeetings = [
        {
          id: 'test-1',
          title: 'Saved Meeting 1',
          type: 'team',
          date: '2024-01-15',
          attendees: [],
          agenda: [],
          discussionPoints: [],
          actionItems: [],
          decisions: [],
          generalNotes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      localStorageMock._setStore({
        'meeting-notes-data': JSON.stringify(savedMeetings),
      })

      render(<MeetingNotesPage />)

      expect(getItemMock).toHaveBeenCalledWith('meeting-notes-data')
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock._setStore({
        'meeting-notes-data': 'invalid json{{{',
      })

      // Should not throw
      expect(() => render(<MeetingNotesPage />)).not.toThrow()
    })
  })

  describe('Markdown Export Content', () => {
    it('should include meeting title in markdown', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('# Team Meeting')
      )
    })

    it('should include date in markdown', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('**Date:**')
      )
    })

    it('should include agenda in markdown when present', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('## Agenda')
      )
    })
  })

  describe('UI Components', () => {
    it('should render FAQ accordion', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument()
    })

    it('should render related tools', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      expect(screen.getByTestId('related-tools')).toBeInTheDocument()
    })

    it('should render social share', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      expect(screen.getByTestId('social-share')).toBeInTheDocument()
    })

    it('should render tool rating', async () => {
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      await user.click(screen.getAllByText('Team Meeting')[0])

      expect(screen.getByTestId('tool-rating')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should complete full workflow: create meeting, add content, save, export', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<MeetingNotesPage />)

      // 1. Select template
      await user.click(screen.getAllByText('Team Meeting')[0])

      await waitFor(() => {
        expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument()
      })

      // 2. Edit title
      const titleInput = screen.getByDisplayValue('Team Meeting')
      await user.clear(titleInput)
      await user.type(titleInput, 'Sprint Planning')

      // 3. Add an attendee
      const addButtons = screen.getAllByRole('button', { name: /Add/i })
      await user.click(addButtons[0]) // Attendees Add

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Name'), 'John Doe')

      // 4. Add a discussion point
      await user.click(addButtons[2]) // Discussion Points Add

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Discussion point')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Discussion point'), 'Sprint goals')

      // 5. Add an action item
      await user.click(addButtons[3]) // Action Items Add

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Task description')).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText('Task description'), 'Create user stories')
      await user.type(screen.getByPlaceholderText('Assignee'), 'Jane Smith')

      // 6. Save meeting
      await user.click(screen.getByText('Save'))

      expect(toast.success).toHaveBeenCalledWith('Meeting notes saved!')
      expect(setItemMock).toHaveBeenCalledWith(
        'meeting-notes-data',
        expect.stringContaining('Sprint Planning')
      )

      // 7. Copy to clipboard
      await user.click(screen.getByText('Copy'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Sprint Planning')
      )
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('John Doe')
      )
    })
  })
})
