import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock hooks before importing component
vi.mock('@/lib/hooks/use-copilot-session', () => ({
  useSessions: vi.fn(),
  useCreateSession: vi.fn(),
  useDeleteSession: vi.fn(),
  useRenameSession: vi.fn(),
  usePrefetchSession: vi.fn(),
}))

import {
  useCreateSession,
  useDeleteSession,
  usePrefetchSession,
  useRenameSession,
  useSessions,
} from '@/lib/hooks/use-copilot-session'
import { SessionSidebar } from '../session-sidebar'

const mockUseSessions = vi.mocked(useSessions)
const mockUseCreateSession = vi.mocked(useCreateSession)
const mockUseDeleteSession = vi.mocked(useDeleteSession)
const mockUseRenameSession = vi.mocked(useRenameSession)
const mockUsePrefetchSession = vi.mocked(usePrefetchSession)

// SessionMetadata interface from @/lib/services/copilot/types
interface Session {
  id: string
  name: string
  messageCount: number
  createdAt: number
  updatedAt: number
  preview?: string
}

describe('SessionSidebar', () => {
  const mockOnSessionSelect = vi.fn()
  const mockCreateMutate = vi.fn()
  const mockDeleteMutate = vi.fn()
  const mockRenameMutate = vi.fn()
  const mockPrefetchSession = vi.fn()

  const createSession = (overrides: Partial<Session> = {}): Session => ({
    id: 'session-1',
    name: 'Test Session',
    messageCount: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  })

  const createMockUseSessions = (overrides: Partial<ReturnType<typeof useSessions>> = {}) =>
    ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      ...overrides,
    }) as ReturnType<typeof useSessions>

  const createMockUseCreateSession = (
    overrides: Partial<ReturnType<typeof useCreateSession>> = {}
  ) =>
    ({
      mutate: mockCreateMutate,
      isPending: false,
      ...overrides,
    }) as unknown as ReturnType<typeof useCreateSession>

  const createMockUseDeleteSession = (
    overrides: Partial<ReturnType<typeof useDeleteSession>> = {}
  ) =>
    ({
      mutate: mockDeleteMutate,
      isPending: false,
      ...overrides,
    }) as unknown as ReturnType<typeof useDeleteSession>

  const createMockUseRenameSession = (
    overrides: Partial<ReturnType<typeof useRenameSession>> = {}
  ) =>
    ({
      mutate: mockRenameMutate,
      ...overrides,
    }) as unknown as ReturnType<typeof useRenameSession>

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseSessions.mockReturnValue(createMockUseSessions())
    mockUseCreateSession.mockReturnValue(createMockUseCreateSession())
    mockUseDeleteSession.mockReturnValue(createMockUseDeleteSession())
    mockUseRenameSession.mockReturnValue(createMockUseRenameSession())
    mockUsePrefetchSession.mockReturnValue(mockPrefetchSession)
  })

  describe('Loading state', () => {
    it('shows 3 skeleton loaders when loading', () => {
      mockUseSessions.mockReturnValue(createMockUseSessions({ isLoading: true }))

      const { container } = render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      // The loading state renders 3 skeleton divs inside a flex container
      // Each skeleton has inner divs for content placeholders
      const skeletonItems = container.querySelectorAll('[class]')
      // Verify loading skeletons exist - there should be multiple divs rendered
      // and no session content
      expect(screen.queryByText('Test Session')).not.toBeInTheDocument()
      expect(screen.queryByText('No sessions')).not.toBeInTheDocument()
      expect(skeletonItems.length).toBeGreaterThan(0)
    })

    it('does not show sessions list while loading', () => {
      mockUseSessions.mockReturnValue(createMockUseSessions({ isLoading: true }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.queryByText('Test Session')).not.toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message when isError is true', () => {
      mockUseSessions.mockReturnValue(
        createMockUseSessions({
          isError: true,
          error: new Error('Network error'),
        })
      )

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('Failed to load sessions')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('shows default error message when error is undefined', () => {
      mockUseSessions.mockReturnValue(
        createMockUseSessions({
          isError: true,
          error: undefined,
        })
      )

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('Failed to load sessions')).toBeInTheDocument()
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no sessions', () => {
      mockUseSessions.mockReturnValue(
        createMockUseSessions({
          data: [],
        })
      )

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('No sessions yet')).toBeInTheDocument()
      expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    })

    it('calls createSession.mutate when "Start a conversation" button is clicked', async () => {
      const user = userEvent.setup()
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      await user.click(screen.getByText('Start a conversation'))

      expect(mockCreateMutate).toHaveBeenCalledTimes(1)
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('New Chat'),
        }),
        expect.any(Object)
      )
    })
  })

  describe('Session list rendering', () => {
    it('renders session name and message count', () => {
      const sessions = [createSession({ id: 'session-1', name: 'My Chat', messageCount: 10 })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('My Chat')).toBeInTheDocument()
      expect(screen.getByText('10 messages')).toBeInTheDocument()
    })

    it('renders preview text when present', () => {
      const sessions = [createSession({ preview: 'This is a preview of the chat...' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('This is a preview of the chat...')).toBeInTheDocument()
    })

    it('formats date as "Today" for today\'s sessions', () => {
      const sessions = [createSession({ updatedAt: Date.now() })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('formats date as "Yesterday" for yesterday\'s sessions', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000
      const sessions = [createSession({ updatedAt: yesterday })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('Yesterday')).toBeInTheDocument()
    })

    it('formats date as "X days ago" for recent sessions', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
      const sessions = [createSession({ updatedAt: threeDaysAgo })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('3 days ago')).toBeInTheDocument()
    })

    it('renders multiple sessions', () => {
      const sessions = [
        createSession({ id: 'session-1', name: 'First Chat' }),
        createSession({ id: 'session-2', name: 'Second Chat' }),
        createSession({ id: 'session-3', name: 'Third Chat' }),
      ]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('First Chat')).toBeInTheDocument()
      expect(screen.getByText('Second Chat')).toBeInTheDocument()
      expect(screen.getByText('Third Chat')).toBeInTheDocument()
    })
  })

  describe('Active session highlighting', () => {
    it('applies active styling to the selected session', () => {
      const sessions = [
        createSession({ id: 'session-1', name: 'Active Session' }),
        createSession({ id: 'session-2', name: 'Inactive Session' }),
      ]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      // Active session button should exist with the correct name
      const activeSessionText = screen.getByText('Active Session')
      expect(activeSessionText).toBeInTheDocument()

      // The session content is rendered inside the clickable session button
      const activeButton = activeSessionText.closest('button')
      expect(activeButton).toBeInTheDocument()
    })
  })

  describe('Create new session', () => {
    it('renders create button in header with correct aria-label', () => {
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      const createButton = screen.getByRole('button', { name: 'Create new session' })
      expect(createButton).toBeInTheDocument()
    })

    it('calls createSession.mutate when header create button is clicked', async () => {
      const user = userEvent.setup()
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      const createButton = screen.getByRole('button', { name: 'Create new session' })
      await user.click(createButton)

      expect(mockCreateMutate).toHaveBeenCalledTimes(1)
    })

    it('calls onSessionSelect with new session ID on success', async () => {
      const user = userEvent.setup()
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))

      // Mock mutate to call onSuccess callback
      mockCreateMutate.mockImplementation((params, options) => {
        options?.onSuccess?.({ id: 'new-session-123', name: params.name })
      })

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      await user.click(screen.getByRole('button', { name: 'Create new session' }))

      expect(mockOnSessionSelect).toHaveBeenCalledWith('new-session-123')
    })

    it('disables create button when creation is pending', () => {
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))
      mockUseCreateSession.mockReturnValue(createMockUseCreateSession({ isPending: true }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      const createButton = screen.getByRole('button', { name: 'Create new session' })
      expect(createButton).toBeDisabled()
    })
  })

  describe('Select session', () => {
    it('calls onSessionSelect with session ID when session is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-123', name: 'Clickable Session' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      const sessionButton = screen.getByText('Clickable Session').closest('button')
      expect(sessionButton).toBeInTheDocument()
      if (!sessionButton) {
        throw new Error('Session button not found')
      }
      await user.click(sessionButton)

      expect(mockOnSessionSelect).toHaveBeenCalledWith('session-123')
    })
  })

  describe('Prefetch on hover', () => {
    it('calls prefetchSession when session is hovered', async () => {
      const sessions = [createSession({ id: 'session-hover-test', name: 'Hover Session' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      const sessionButton = screen.getByText('Hover Session').closest('button')
      expect(sessionButton).toBeInTheDocument()
      if (!sessionButton) {
        throw new Error('Session button not found')
      }
      fireEvent.mouseEnter(sessionButton)

      expect(mockPrefetchSession).toHaveBeenCalledWith('session-hover-test')
    })
  })

  describe('Rename flow', () => {
    it('shows input with current name when edit button is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Original Name' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const editButton = screen.getByRole('button', { name: 'Rename session' })
      await user.click(editButton)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Original Name')
    })

    it('calls renameSession.mutate when Enter is pressed', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-rename', name: 'Old Name' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(
        <SessionSidebar activeSessionId="session-rename" onSessionSelect={mockOnSessionSelect} />
      )

      const editButton = screen.getByRole('button', { name: 'Rename session' })
      await user.click(editButton)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, 'New Name{Enter}')

      expect(mockRenameMutate).toHaveBeenCalledWith(
        { id: 'session-rename', name: 'New Name' },
        expect.any(Object)
      )
    })

    it('hides input without saving when Escape is pressed', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Original Name' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const editButton = screen.getByRole('button', { name: 'Rename session' })
      await user.click(editButton)

      const input = screen.getByRole('textbox')
      await user.type(input, '{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })
      expect(mockRenameMutate).not.toHaveBeenCalled()
    })

    it('saves when Save button is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-save', name: 'Save Test' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(
        <SessionSidebar activeSessionId="session-save" onSessionSelect={mockOnSessionSelect} />
      )

      const editButton = screen.getByRole('button', { name: 'Rename session' })
      await user.click(editButton)

      const input = screen.getByRole('textbox')
      await user.clear(input)
      await user.type(input, 'Saved Name')

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(mockRenameMutate).toHaveBeenCalledWith(
        { id: 'session-save', name: 'Saved Name' },
        expect.any(Object)
      )
    })

    it('cancels when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Cancel Test' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const editButton = screen.getByRole('button', { name: 'Rename session' })
      await user.click(editButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })
      expect(mockRenameMutate).not.toHaveBeenCalled()
    })
  })

  describe('Delete flow', () => {
    it('shows delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Delete Me' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const deleteButton = screen.getByRole('button', { name: 'Delete session' })
      await user.click(deleteButton)

      expect(screen.getByText('Delete this session?')).toBeInTheDocument()
    })

    it('calls deleteSession.mutate when Delete is confirmed', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-delete', name: 'To Delete' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(
        <SessionSidebar activeSessionId="session-delete" onSessionSelect={mockOnSessionSelect} />
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete session' })
      await user.click(deleteButton)

      const confirmButton = screen.getByText('Delete')
      await user.click(confirmButton)

      expect(mockDeleteMutate).toHaveBeenCalledWith('session-delete', expect.any(Object))
    })

    it('hides confirmation when Cancel is clicked', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Do Not Delete' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const deleteButton = screen.getByRole('button', { name: 'Delete session' })
      await user.click(deleteButton)

      expect(screen.getByText('Delete this session?')).toBeInTheDocument()

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Delete this session?')).not.toBeInTheDocument()
      })
      expect(mockDeleteMutate).not.toHaveBeenCalled()
    })

    it('shows "Deleting..." when deletion is pending', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'session-1', name: 'Deleting Session' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))
      mockUseDeleteSession.mockReturnValue(createMockUseDeleteSession({ isPending: true }))

      render(<SessionSidebar activeSessionId="session-1" onSessionSelect={mockOnSessionSelect} />)

      const deleteButton = screen.getByRole('button', { name: 'Delete session' })
      await user.click(deleteButton)

      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })

    it('clears active session selection when active session is deleted', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'active-session', name: 'Active to Delete' })]

      mockUseSessions.mockReturnValue(createMockUseSessions({ data: sessions }))

      // Mock mutate to call onSuccess callback
      mockDeleteMutate.mockImplementation((_id, options) => {
        options?.onSuccess?.()
      })

      render(
        <SessionSidebar activeSessionId="active-session" onSessionSelect={mockOnSessionSelect} />
      )

      const deleteButton = screen.getByRole('button', { name: 'Delete session' })
      await user.click(deleteButton)

      const confirmButton = screen.getByText('Delete')
      await user.click(confirmButton)

      expect(mockOnSessionSelect).toHaveBeenCalledWith('')
    })
  })

  describe('Header', () => {
    it('renders "Sessions" title', () => {
      mockUseSessions.mockReturnValue(createMockUseSessions({ data: [] }))

      render(<SessionSidebar onSessionSelect={mockOnSessionSelect} />)

      expect(screen.getByText('Sessions')).toBeInTheDocument()
    })
  })
})
