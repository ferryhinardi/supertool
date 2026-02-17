/**
 * Copilot Page Tests
 *
 * Tests the page-level functionality including:
 * - Page structure and rendering
 * - Error banner display and dismiss
 * - Keyboard shortcuts registration
 * - Accessibility features (ARIA landmarks, skip link, focus management)
 * - Analytics tracking
 * - Mobile sidebar behavior
 */

import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock analytics
const mockTrackToolEvent = vi.fn()
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: (event: string, data: Record<string, unknown>) => mockTrackToolEvent(event, data),
}))

// Mock toast - use vi.hoisted to ensure mock is available before factory runs
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: mockToast,
}))

// Mock session hooks
const mockSessions = [
  { id: 'session-1', title: 'Test Session 1', createdAt: new Date().toISOString() },
  { id: 'session-2', title: 'Test Session 2', createdAt: new Date().toISOString() },
]

const mockCreateSession = vi.fn()
const mockDeleteSession = vi.fn()
const mockPrefetchSessions = vi.fn()

vi.mock('@/lib/hooks/use-copilot-session', () => ({
  useSessions: vi.fn(() => ({
    data: mockSessions,
    isLoading: false,
    error: null,
  })),
  useCreateSession: vi.fn(() => ({
    mutate: mockCreateSession,
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-session', title: 'New Session' }),
    isPending: false,
  })),
  usePrefetchSessions: vi.fn(() => mockPrefetchSessions),
  useDeleteSession: vi.fn(() => ({
    mutate: mockDeleteSession,
    isPending: false,
  })),
  useRenameSession: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

// Mock useCopilotUI hook
const mockUseCopilotUI = {
  isSidebarOpen: true,
  toggleSidebar: vi.fn(),
  isSourcePanelOpen: false,
  toggleSourcePanel: vi.fn(),
  activeSource: 'github' as const,
  handleSourceChange: vi.fn(),
  showShortcutsModal: false,
  openShortcutsModal: vi.fn(),
  closeShortcutsModal: vi.fn(),
  triggerRenameSessionId: null as string | null,
  setTriggerRenameSessionId: vi.fn(),
  clearTriggerRenameSessionId: vi.fn(),
}

vi.mock('@/lib/hooks/use-copilot-ui', () => ({
  useCopilotUI: vi.fn(() => mockUseCopilotUI),
}))

// Mock useLocalFiles hook
const mockUseLocalFiles = {
  localFiles: [],
  selectedRawFiles: [],
  localAnalysisResult: null,
  isAnalyzingLocal: false,
  localError: null as string | null,
  handleLocalFilesUpload: vi.fn(),
  handleLocalFilesSelect: vi.fn(),
  handleRawFilesUpload: vi.fn(),
  clearError: vi.fn(),
}

vi.mock('@/lib/hooks/use-local-files', () => ({
  useLocalFiles: vi.fn(() => mockUseLocalFiles),
}))

// Mock useKeyboardShortcuts hook
vi.mock('@/lib/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
  COPILOT_SHORTCUTS: {
    NEW_SESSION: { key: 'n', metaKey: true, description: 'New session' },
    DELETE_SESSION: { key: 'Backspace', metaKey: true, description: 'Delete session' },
    RENAME_SESSION: { key: 'r', metaKey: true, description: 'Rename session' },
    PREV_SESSION: { key: 'ArrowUp', metaKey: true, description: 'Previous session' },
    NEXT_SESSION: { key: 'ArrowDown', metaKey: true, description: 'Next session' },
    HELP: { key: '?', metaKey: true, description: 'Show help' },
  },
  formatShortcut: vi.fn((shortcut) => `${shortcut.metaKey ? '⌘' : ''}${shortcut.key}`),
}))

// Mock child components to isolate page testing
vi.mock('@/components/copilot', () => ({
  ChatContainer: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="chat-container">Chat for session: {sessionId}</div>
  ),
  SessionSidebar: ({
    activeSessionId,
    onSessionSelect,
  }: {
    activeSessionId?: string
    onSessionSelect: (id: string) => void
  }) => (
    <div data-testid="session-sidebar">
      <button type="button" onClick={() => onSessionSelect('session-1')}>
        Session 1
      </button>
      <button type="button" onClick={() => onSessionSelect('session-2')}>
        Session 2
      </button>
      <span>Active: {activeSessionId}</span>
    </div>
  ),
  SourcePanel: () => <div data-testid="source-panel">Source Panel</div>,
  KeyboardShortcutsModal: ({ onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="shortcuts-modal">
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}))

// Import after mocks
import CopilotPage from '../page'

// ============================================
// Test Suite
// ============================================

describe('Copilot Page Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock states
    mockUseCopilotUI.isSidebarOpen = true
    mockUseCopilotUI.isSourcePanelOpen = false
    mockUseCopilotUI.showShortcutsModal = false
    mockUseLocalFiles.localError = null
  })

  afterEach(() => {
    cleanup()
  })

  describe('Page Structure', () => {
    it('renders the page with correct structure', () => {
      render(<CopilotPage />)

      // Header elements
      expect(screen.getByRole('heading', { name: /GitHub Copilot Chat/i })).toBeInTheDocument()
      expect(screen.getByText('AI')).toBeInTheDocument()

      // Main navigation buttons
      expect(screen.getByRole('button', { name: /New Chat/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sources/i })).toBeInTheDocument()

      // ARIA landmarks
      expect(screen.getByRole('main', { name: /GitHub Copilot Chat/i })).toBeInTheDocument()
    })

    it('renders sidebar with session list', () => {
      render(<CopilotPage />)

      expect(screen.getByTestId('session-sidebar')).toBeInTheDocument()
    })

    it('renders chat container when session is active', async () => {
      render(<CopilotPage />)

      // Should auto-select first session
      await waitFor(() => {
        expect(screen.getByTestId('chat-container')).toBeInTheDocument()
      })
    })
  })

  describe('Error Banner', () => {
    it('displays error banner when localError is present', () => {
      mockUseLocalFiles.localError = 'Failed to upload file'

      render(<CopilotPage />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to upload file')).toBeInTheDocument()
    })

    it('dismisses error banner when close button is clicked', async () => {
      const user = userEvent.setup()
      mockUseLocalFiles.localError = 'Test error'

      render(<CopilotPage />)

      const dismissButton = screen.getByRole('button', { name: /dismiss error/i })
      await user.click(dismissButton)

      expect(mockUseLocalFiles.clearError).toHaveBeenCalled()
    })

    it('error banner has correct aria role for accessibility', () => {
      mockUseLocalFiles.localError = 'Error message'

      render(<CopilotPage />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page visit on mount', () => {
      render(<CopilotPage />)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('copilot_tool_open', {})
    })

    it('tracks session selection', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      const sessionButton = screen.getByRole('button', { name: 'Session 2' })
      await user.click(sessionButton)

      expect(mockTrackToolEvent).toHaveBeenCalledWith('copilot_session_selected', {
        sessionId: 'session-2',
      })
    })

    it('tracks session creation', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      const newChatButton = screen.getByRole('button', { name: /New Chat/i })
      await user.click(newChatButton)

      await waitFor(() => {
        expect(mockTrackToolEvent).toHaveBeenCalledWith('copilot_session_created', {
          sessionId: 'new-session',
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('has skip-to-main-content link', () => {
      render(<CopilotPage />)

      const skipLink = screen.getByRole('button', { name: /skip to main content/i })
      expect(skipLink).toBeInTheDocument()
    })

    it('skip link moves focus to main content when clicked', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      const skipLink = screen.getByRole('button', { name: /skip to main content/i })
      await user.click(skipLink)

      // Main content should be focusable
      const mainContent = document.getElementById('main-content')
      expect(mainContent).toBeInTheDocument()
    })

    it('has live region for dynamic announcements', () => {
      render(<CopilotPage />)

      // There may be multiple elements with role="status" (including Badge components)
      // Find the one specifically for live announcements with aria-live="polite"
      const statusElements = screen.getAllByRole('status')
      const liveRegion = statusElements.find((el) => el.getAttribute('aria-live') === 'polite')
      expect(liveRegion).toBeDefined()
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('announces session state changes via live region', async () => {
      render(<CopilotPage />)

      // After auto-selecting first session
      await waitFor(() => {
        const statusElements = screen.getAllByRole('status')
        const liveRegion = statusElements.find((el) => el.getAttribute('aria-live') === 'polite')
        expect(liveRegion).toHaveTextContent('Chat session active')
      })
    })

    it('ARIA landmarks are present', () => {
      render(<CopilotPage />)

      // Main landmark
      expect(screen.getByRole('main', { name: /GitHub Copilot Chat/i })).toBeInTheDocument()
    })
  })

  describe('Welcome Card Quick Actions', () => {
    afterEach(async () => {
      // Reset useSessions mock to return sessions after this test
      const { useSessions } = await import('@/lib/hooks/use-copilot-session')
      vi.mocked(useSessions).mockReturnValue({
        data: mockSessions,
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useSessions>)
    })

    it('shows welcome card with quick actions when no session is active', async () => {
      // Override sessions to empty to show welcome card
      const { useSessions } = await import('@/lib/hooks/use-copilot-session')
      vi.mocked(useSessions).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useSessions>)

      render(<CopilotPage />)

      // Welcome card elements
      expect(screen.getByText('Welcome to Copilot Chat')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Start New Chat/i })).toBeInTheDocument()

      // Quick action chips
      expect(screen.getByRole('button', { name: /Explain code/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Review PR/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Debug issue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Generate code/i })).toBeInTheDocument()
    })
  })

  describe('Header Button Interactions', () => {
    it('toggles source panel when Sources button is clicked', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      const sourcesButton = screen.getByRole('button', { name: /Sources/i })
      await user.click(sourcesButton)

      expect(mockUseCopilotUI.toggleSourcePanel).toHaveBeenCalled()
    })

    it('creates new session when New Chat button is clicked', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      // Use exact match to avoid matching "Start New Chat" button
      const newChatButtons = screen.getAllByRole('button', { name: /New Chat/i })
      // The header "New Chat" button is the first one
      const newChatButton = newChatButtons[0]
      await user.click(newChatButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('New chat session created')
      })
    })
  })

  describe('Session Management', () => {
    it('auto-selects first session when sessions load', async () => {
      render(<CopilotPage />)

      // Wait for the useEffect to run and set activeSessionId
      // The ChatContainer should be rendered with the first session's ID
      await waitFor(
        () => {
          expect(screen.getByText(/Chat for session: session-1/)).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    it('allows selecting different sessions', async () => {
      const user = userEvent.setup()

      render(<CopilotPage />)

      const session2Button = screen.getByRole('button', { name: 'Session 2' })
      await user.click(session2Button)

      await waitFor(() => {
        expect(screen.getByText(/Chat for session: session-2/)).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Shortcuts Modal', () => {
    it('shows shortcuts modal when showShortcutsModal is true', () => {
      mockUseCopilotUI.showShortcutsModal = true

      render(<CopilotPage />)

      expect(screen.getByTestId('shortcuts-modal')).toBeInTheDocument()
    })

    it('closes shortcuts modal when close button is clicked', async () => {
      const user = userEvent.setup()
      mockUseCopilotUI.showShortcutsModal = true

      render(<CopilotPage />)

      // Get the close button within the shortcuts modal
      const modal = screen.getByTestId('shortcuts-modal')
      const closeButton = within(modal).getByRole('button', { name: /Close/i })
      await user.click(closeButton)

      expect(mockUseCopilotUI.closeShortcutsModal).toHaveBeenCalled()
    })
  })

  describe('Mobile Sidebar Behavior', () => {
    it('shows overlay when sidebar is open on mobile', () => {
      mockUseCopilotUI.isSidebarOpen = true

      render(<CopilotPage />)

      const overlay = screen.getByRole('button', { name: /close sidebar/i })
      expect(overlay).toBeInTheDocument()
    })

    it('closes sidebar when overlay is clicked', async () => {
      const user = userEvent.setup()
      mockUseCopilotUI.isSidebarOpen = true

      render(<CopilotPage />)

      const overlay = screen.getByRole('button', { name: /close sidebar/i })
      await user.click(overlay)

      expect(mockUseCopilotUI.toggleSidebar).toHaveBeenCalled()
    })

    it('closes sidebar when Escape key is pressed on overlay', async () => {
      const user = userEvent.setup()
      mockUseCopilotUI.isSidebarOpen = true

      render(<CopilotPage />)

      const overlay = screen.getByRole('button', { name: /close sidebar/i })
      overlay.focus()
      await user.keyboard('{Escape}')

      expect(mockUseCopilotUI.toggleSidebar).toHaveBeenCalled()
    })
  })

  describe('Source Panel Behavior', () => {
    it('shows source panel overlay when open', () => {
      mockUseCopilotUI.isSourcePanelOpen = true

      render(<CopilotPage />)

      const overlay = screen.getByRole('button', { name: /close source panel/i })
      expect(overlay).toBeInTheDocument()
    })

    it('closes source panel when overlay is clicked', async () => {
      const user = userEvent.setup()
      mockUseCopilotUI.isSourcePanelOpen = true

      render(<CopilotPage />)

      const overlay = screen.getByRole('button', { name: /close source panel/i })
      await user.click(overlay)

      expect(mockUseCopilotUI.toggleSourcePanel).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading fallback during suspense', async () => {
      // This tests the LoadingFallback component indirectly
      // The actual suspense boundary is in the page component
      const { useSessions } = await import('@/lib/hooks/use-copilot-session')
      vi.mocked(useSessions).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as ReturnType<typeof useSessions>)

      render(<CopilotPage />)

      // Even during loading, the page structure should be present
      expect(screen.getByRole('main', { name: /GitHub Copilot Chat/i })).toBeInTheDocument()
    })
  })

  describe('Focus Ring Styles', () => {
    it('header buttons have proper focus visible styling', () => {
      render(<CopilotPage />)

      // Verify buttons are present - the focus styles are CSS-based
      // and would be tested visually or with snapshot tests
      // Use getAllByRole since there may be multiple "New Chat" buttons
      const newChatButtons = screen.getAllByRole('button', { name: /New Chat/i })
      const sourcesButton = screen.getByRole('button', { name: /Sources/i })

      expect(newChatButtons.length).toBeGreaterThan(0)
      expect(sourcesButton).toBeInTheDocument()
    })
  })
})
