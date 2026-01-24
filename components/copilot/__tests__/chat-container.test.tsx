import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CopilotError, CopilotMessage } from '@/lib/services/copilot/types'
import { ChatContainer } from '../chat-container'

// Mock hooks
vi.mock('@/lib/hooks', () => ({
  useCopilot: vi.fn(),
  useCopilotStore: vi.fn(),
}))

import { useCopilot, useCopilotStore } from '@/lib/hooks'

const mockUseCopilot = vi.mocked(useCopilot)
const mockUseCopilotStore = vi.mocked(useCopilotStore)

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

describe('ChatContainer', () => {
  const mockSendMessage = vi.fn()
  const mockClearMessages = vi.fn()
  const mockClearError = vi.fn()
  const mockAbort = vi.fn()
  const mockReset = vi.fn()

  const createMessage = (overrides: Partial<CopilotMessage> = {}): CopilotMessage => ({
    id: 'msg-1',
    role: 'user',
    content: 'Hello Copilot',
    timestamp: Date.now(),
    ...overrides,
  })

  const createMockUseCopilotReturn = (overrides: Partial<ReturnType<typeof useCopilot>> = {}) => ({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    currentStreamContent: '',
    pendingToolCalls: [],
    pendingGeneratedFiles: [],
    sendMessage: mockSendMessage,
    clearMessages: mockClearMessages,
    clearError: mockClearError,
    abort: mockAbort,
    reset: mockReset,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseCopilot.mockReturnValue(createMockUseCopilotReturn())

    mockUseCopilotStore.mockReturnValue({
      messages: [],
      isStreaming: false,
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no messages', () => {
      render(<ChatContainer sessionId="session-1" />)

      expect(screen.getByText('Start a conversation')).toBeInTheDocument()
      expect(
        screen.getByText(/Ask Copilot to analyze code, fetch PR information/)
      ).toBeInTheDocument()
    })

    it('shows suggestion chips in empty state', () => {
      render(<ChatContainer sessionId="session-1" />)

      expect(screen.getByText('Analyze my recent PR')).toBeInTheDocument()
      expect(screen.getByText('Show file changes')).toBeInTheDocument()
      expect(screen.getByText('Generate a chart')).toBeInTheDocument()
      expect(screen.getByText('Suggest code organization')).toBeInTheDocument()
    })
  })

  describe('Message rendering', () => {
    it('renders messages from store', () => {
      const messages: CopilotMessage[] = [
        createMessage({ id: 'msg-1', role: 'user', content: 'Hello Copilot' }),
        createMessage({ id: 'msg-2', role: 'assistant', content: 'Hi there! How can I help?' }),
      ]

      mockUseCopilotStore.mockReturnValue({
        messages,
        isStreaming: false,
      })

      render(<ChatContainer sessionId="session-1" />)

      expect(screen.getByText('Hello Copilot')).toBeInTheDocument()
      expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument()
    })

    it('does not show empty state when messages exist', () => {
      mockUseCopilotStore.mockReturnValue({
        messages: [createMessage()],
        isStreaming: false,
      })

      render(<ChatContainer sessionId="session-1" />)

      expect(screen.queryByText('Start a conversation')).not.toBeInTheDocument()
    })
  })

  describe('Streaming state', () => {
    it('shows streaming indicator on last message when isStreaming is true', () => {
      const messages: CopilotMessage[] = [
        createMessage({ id: 'msg-1', role: 'user', content: 'Hello' }),
        createMessage({ id: 'msg-2', role: 'assistant', content: 'Let me think...' }),
      ]

      mockUseCopilotStore.mockReturnValue({
        messages,
        isStreaming: true,
      })

      render(<ChatContainer sessionId="session-1" />)

      // The streaming indicator shows '...' animation
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('disables input when streaming', () => {
      mockUseCopilotStore.mockReturnValue({
        messages: [createMessage()],
        isStreaming: true,
      })

      render(<ChatContainer sessionId="session-1" />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('shows thinking placeholder when streaming', () => {
      mockUseCopilotStore.mockReturnValue({
        messages: [createMessage()],
        isStreaming: true,
      })

      render(<ChatContainer sessionId="session-1" />)

      const textarea = screen.getByPlaceholderText('Copilot is thinking...')
      expect(textarea).toBeInTheDocument()
    })

    it('shows default placeholder when not streaming', () => {
      mockUseCopilotStore.mockReturnValue({
        messages: [],
        isStreaming: false,
      })

      render(<ChatContainer sessionId="session-1" />)

      const textarea = screen.getByPlaceholderText('Ask Copilot...')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Sending messages', () => {
    it('calls sendMessage with sessionId and content when ChatInput submits', async () => {
      const user = userEvent.setup()

      render(<ChatContainer sessionId="session-123" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello Copilot')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(mockSendMessage).toHaveBeenCalledTimes(1)
      expect(mockSendMessage).toHaveBeenCalledWith('session-123', 'Hello Copilot')
    })

    it('passes correct sessionId when sending multiple messages', async () => {
      const user = userEvent.setup()

      render(<ChatContainer sessionId="different-session" />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'First message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      // Type another message
      await user.type(textarea, 'Second message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      expect(mockSendMessage).toHaveBeenCalledTimes(2)
      expect(mockSendMessage).toHaveBeenNthCalledWith(1, 'different-session', 'First message')
      expect(mockSendMessage).toHaveBeenNthCalledWith(2, 'different-session', 'Second message')
    })
  })

  describe('Error handling', () => {
    it('shows error message when error exists', () => {
      const mockError: CopilotError = {
        type: 'COPILOT_ERROR',
        message: 'Something went wrong',
        retryable: true,
      }

      mockUseCopilot.mockReturnValue(
        createMockUseCopilotReturn({
          error: mockError,
        })
      )

      render(<ChatContainer sessionId="session-1" />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('does not show error display when no error', () => {
      mockUseCopilot.mockReturnValue(
        createMockUseCopilotReturn({
          error: null,
        })
      )

      render(<ChatContainer sessionId="session-1" />)

      expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })
  })

  describe('Auto-scroll behavior', () => {
    it('scrolls to bottom when new messages arrive', () => {
      const messages: CopilotMessage[] = [createMessage({ id: 'msg-1' })]

      mockUseCopilotStore.mockReturnValue({
        messages,
        isStreaming: false,
      })

      const { rerender } = render(<ChatContainer sessionId="session-1" />)

      // Add a new message
      const updatedMessages = [...messages, createMessage({ id: 'msg-2', content: 'New message' })]

      mockUseCopilotStore.mockReturnValue({
        messages: updatedMessages,
        isStreaming: false,
      })

      rerender(<ChatContainer sessionId="session-1" />)

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })
  })
})
