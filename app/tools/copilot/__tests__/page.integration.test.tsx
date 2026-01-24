/**
 * Copilot Integration Tests
 *
 * Tests the full flow: user sends message → SSE streaming → assistant reply displayed
 * Uses real useCopilot hook with mocked fetch to simulate SSE responses
 */

import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Must import store before mocking to reset between tests
import { useCopilotStore } from '@/lib/hooks/use-copilot'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock session hooks - these are used by the page but not the focus of integration tests
vi.mock('@/lib/hooks/use-copilot-session', () => ({
  useSessions: vi.fn(() => ({
    data: [{ id: 'session-123', title: 'Test Session', createdAt: new Date().toISOString() }],
    isLoading: false,
    error: null,
  })),
  useCreateSession: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-session', title: 'New Session' }),
    isPending: false,
  })),
  usePrefetchSessions: vi.fn(() => vi.fn()),
  useDeleteSession: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useRenameSession: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

// Import component after mocks
import { ChatContainer } from '@/components/copilot/chat-container'

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// ============================================
// SSE Stream Mock Utilities
// ============================================

interface SSEEvent {
  type: 'token' | 'done' | 'error' | 'tool_call'
  content?: string
  sessionId?: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
  error?: { type: string; message: string }
  toolCall?: { id: string; name: string; arguments: string }
}

/**
 * Creates a mock ReadableStream that simulates SSE responses
 * Each event is formatted as `data: {...}\n\n`
 */
function createMockSSEStream(events: SSEEvent[], delayMs = 10): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let eventIndex = 0

  return new ReadableStream({
    async pull(controller) {
      if (eventIndex >= events.length) {
        controller.close()
        return
      }

      const event = events[eventIndex]
      const data = `data: ${JSON.stringify(event)}\n\n`

      // Simulate streaming delay
      await new Promise((resolve) => setTimeout(resolve, delayMs))

      controller.enqueue(encoder.encode(data))
      eventIndex++
    },
  })
}

/**
 * Creates a mock fetch that returns an SSE stream
 */
function createMockFetch(events: SSEEvent[], options: { status?: number; delayMs?: number } = {}) {
  const { status = 200, delayMs = 10 } = options

  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      body: createMockSSEStream(events, delayMs),
      json: async () => {
        if (status >= 400) {
          return { error: { type: 'API_ERROR', message: 'Request failed' } }
        }
        return {}
      },
    })
  )
}

// ============================================
// Test Suite
// ============================================

describe('Copilot Integration Tests', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset Zustand store to initial state before each test
    act(() => {
      useCopilotStore.getState().reset()
    })
  })

  afterEach(() => {
    // Cleanup rendered components and reset store after each test
    cleanup()
    act(() => {
      useCopilotStore.getState().reset()
    })
    global.fetch = originalFetch
  })

  describe('Message Flow', () => {
    it('user sends message and receives assistant reply with non-empty content', async () => {
      const user = userEvent.setup()

      // Mock SSE stream with token events
      const sseEvents: SSEEvent[] = [
        { type: 'token', sessionId: 'session-123', content: '' },
        { type: 'token', content: 'Hello ' },
        { type: 'token', content: 'there! ' },
        { type: 'token', content: 'How can I help?' },
        { type: 'done', usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 } },
      ]

      global.fetch = createMockFetch(sseEvents)

      render(<ChatContainer sessionId="session-123" />)

      // Verify empty state
      expect(screen.getByText('Start a conversation')).toBeInTheDocument()

      // Type and send message
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello Copilot')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/copilot/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"message":"Hello Copilot"'),
        })
      )

      // Wait for user message to appear
      await waitFor(() => {
        expect(screen.getByText('Hello Copilot')).toBeInTheDocument()
      })

      // Wait for assistant response to complete with full content
      await waitFor(
        () => {
          expect(screen.getByText('Hello there! How can I help?')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Verify empty state is gone
      expect(screen.queryByText('Start a conversation')).not.toBeInTheDocument()
    })

    it('handles multiple token chunks correctly', async () => {
      const user = userEvent.setup()

      // Simulate many small chunks like real streaming
      const sseEvents: SSEEvent[] = [
        { type: 'token', content: 'I' },
        { type: 'token', content: ' am' },
        { type: 'token', content: ' a' },
        { type: 'token', content: ' helpful' },
        { type: 'token', content: ' assistant' },
        { type: 'token', content: '.' },
        { type: 'done', usage: { promptTokens: 5, completionTokens: 6, totalTokens: 11 } },
      ]

      global.fetch = createMockFetch(sseEvents, { delayMs: 5 })

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Who are you?')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for complete message
      await waitFor(
        () => {
          expect(screen.getByText('I am a helpful assistant.')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Streaming State', () => {
    it('shows streaming indicator during response', async () => {
      const user = userEvent.setup()

      // Create a slow stream to observe streaming state
      const sseEvents: SSEEvent[] = [
        { type: 'token', content: 'Thinking' },
        { type: 'token', content: '...' },
        { type: 'done', usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 } },
      ]

      global.fetch = createMockFetch(sseEvents, { delayMs: 100 })

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Check that streaming state is reflected in UI
      // The textarea should be disabled during streaming
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
      })

      // Wait for streaming to complete
      await waitFor(
        () => {
          const input = screen.getByRole('textbox')
          expect(input).not.toBeDisabled()
        },
        { timeout: 3000 }
      )
    })

    it('shows "Copilot is thinking..." placeholder when streaming', async () => {
      const user = userEvent.setup()

      const sseEvents: SSEEvent[] = [
        { type: 'token', content: 'Response' },
        { type: 'done', usage: { promptTokens: 5, completionTokens: 1, totalTokens: 6 } },
      ]

      global.fetch = createMockFetch(sseEvents, { delayMs: 200 })

      render(<ChatContainer sessionId="session-123" />)

      // Initially shows default placeholder
      expect(screen.getByPlaceholderText('Ask Copilot...')).toBeInTheDocument()

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // During streaming, placeholder changes
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Copilot is thinking...')).toBeInTheDocument()
      })

      // After streaming completes, placeholder returns to default
      await waitFor(
        () => {
          expect(screen.getByPlaceholderText('Ask Copilot...')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API returns error status', async () => {
      const user = userEvent.setup()

      // Mock a 400 error - NOT retryable (only 500+ and 429 are retried per hook logic)
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          headers: new Headers(),
          json: async () => ({
            error: { type: 'BAD_REQUEST', message: 'Bad request error' },
          }),
        })
      )

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test error')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for error to be displayed (no retries for 400 errors)
      await waitFor(
        () => {
          expect(screen.getByText(/Bad request error|Request failed/)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Verify fetch was called only once (no retries for 400 errors)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock a network failure - network errors are NOT retried (retryable: false in hook)
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test network error')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for error handling - look for the specific error message text
      await waitFor(
        () => {
          // The error is displayed in the error container with error.message
          const errorContainer = screen.getByText('Network error')
          expect(errorContainer).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('handles SSE error events', async () => {
      const user = userEvent.setup()

      const sseEvents: SSEEvent[] = [
        { type: 'token', content: 'Starting...' },
        { type: 'error', error: { type: 'RATE_LIMIT', message: 'Rate limit exceeded' } },
      ]

      global.fetch = createMockFetch(sseEvents)

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test SSE error')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for error from SSE stream
      await waitFor(
        () => {
          expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Store Reset', () => {
    it('reset() clears all messages and state', async () => {
      const user = userEvent.setup()

      const sseEvents: SSEEvent[] = [
        { type: 'token', content: 'Hello!' },
        { type: 'done', usage: { promptTokens: 5, completionTokens: 1, totalTokens: 6 } },
      ]

      global.fetch = createMockFetch(sseEvents)

      render(<ChatContainer sessionId="session-123" />)

      // Send a message
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hi')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Hello!')).toBeInTheDocument()
      })

      // Reset the store
      act(() => {
        useCopilotStore.getState().reset()
      })

      // Verify state is cleared - re-render to pick up new state
      // Note: In real app, component would re-render automatically
      const state = useCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isLoading).toBe(false)
      expect(state.isStreaming).toBe(false)
      expect(state.error).toBeNull()
      expect(state.currentStreamContent).toBe('')
    })
  })

  describe('Conversation Flow', () => {
    it('maintains conversation history across multiple exchanges', async () => {
      const user = userEvent.setup()

      // First response
      const firstSSEEvents: SSEEvent[] = [
        { type: 'token', content: 'First response' },
        { type: 'done', usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 } },
      ]

      global.fetch = createMockFetch(firstSSEEvents)

      render(<ChatContainer sessionId="session-123" />)

      // First exchange
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'First message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Wait for first exchange to complete (messages visible AND streaming finished)
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument()
        expect(screen.getByText('First response')).toBeInTheDocument()
      })

      // CRITICAL: Wait for streaming to complete before sending second message
      await waitFor(
        () => {
          expect(useCopilotStore.getState().isStreaming).toBe(false)
        },
        { timeout: 3000 }
      )

      // Second response
      const secondSSEEvents: SSEEvent[] = [
        { type: 'token', content: 'Second response' },
        { type: 'done', usage: { promptTokens: 10, completionTokens: 2, totalTokens: 12 } },
      ]

      global.fetch = createMockFetch(secondSSEEvents)

      // Second exchange - textarea should be enabled now
      await user.type(textarea, 'Second message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(
        () => {
          // All messages should be visible
          expect(screen.getByText('First message')).toBeInTheDocument()
          expect(screen.getByText('First response')).toBeInTheDocument()
          expect(screen.getByText('Second message')).toBeInTheDocument()
          expect(screen.getByText('Second response')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // Verify store has all messages
      const state = useCopilotStore.getState()
      expect(state.messages).toHaveLength(4)
    })
  })
})
