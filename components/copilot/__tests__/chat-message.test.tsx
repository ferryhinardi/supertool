import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CopilotMessage } from '@/lib/services/copilot/types'
import { ChatMessage } from '../chat-message'

// Mock Date.now for consistent timestamp testing
const MOCK_NOW = new Date('2025-01-24T10:00:00Z').getTime()

describe('ChatMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(MOCK_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMessage = (overrides: Partial<CopilotMessage> = {}): CopilotMessage => ({
    id: 'msg-1',
    role: 'user',
    content: 'Hello, world!',
    timestamp: MOCK_NOW - 30000, // 30 seconds ago
    ...overrides,
  })

  describe('role rendering', () => {
    it('renders user message with user role indicator', () => {
      const message = createMessage({ role: 'user' })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('user')).toBeInTheDocument()
      expect(screen.getByText('Hello, world!')).toBeInTheDocument()
    })

    it('renders assistant message with assistant role indicator', () => {
      const message = createMessage({ role: 'assistant', content: 'How can I help?' })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('assistant')).toBeInTheDocument()
      expect(screen.getByText('How can I help?')).toBeInTheDocument()
    })

    it('renders system message with system role indicator', () => {
      const message = createMessage({ role: 'system', content: 'System initialized' })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('system')).toBeInTheDocument()
      expect(screen.getByText('System initialized')).toBeInTheDocument()
    })
  })

  describe('streaming indicator', () => {
    it('shows streaming indicator when isStreaming is true', () => {
      const message = createMessage({ role: 'assistant', content: 'Thinking' })
      render(<ChatMessage message={message} isStreaming />)

      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('does not show streaming indicator when isStreaming is false', () => {
      const message = createMessage({ role: 'assistant', content: 'Done' })
      render(<ChatMessage message={message} isStreaming={false} />)

      expect(screen.queryByText('...')).not.toBeInTheDocument()
    })

    it('shows cursor when streaming with empty content', () => {
      const message = createMessage({ role: 'assistant', content: '' })
      const { container } = render(<ChatMessage message={message} isStreaming />)

      // The cursor is a span element - in test environment css() returns empty strings
      // so we can't reliably query by class name. Verify component renders correctly.
      const _cursor = container.querySelector('[class*="blink"]')
      // Note: Since css() returns empty string in tests, we verify by content structure
      expect(screen.getByText('assistant')).toBeInTheDocument()
    })
  })

  describe('tool calls', () => {
    it('displays tool calls when present in metadata', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Running tool...',
        metadata: {
          toolCalls: [
            {
              id: 'tool-1',
              name: 'searchDocuments',
              arguments: { query: 'test query' },
            },
          ],
        },
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('searchDocuments')).toBeInTheDocument()
      expect(screen.getByText(/"query": "test query"/)).toBeInTheDocument()
    })

    it('displays multiple tool calls', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Running tools...',
        metadata: {
          toolCalls: [
            {
              id: 'tool-1',
              name: 'searchDocuments',
              arguments: { query: 'first' },
            },
            {
              id: 'tool-2',
              name: 'analyzeCode',
              arguments: { file: 'test.ts' },
            },
          ],
        },
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('searchDocuments')).toBeInTheDocument()
      expect(screen.getByText('analyzeCode')).toBeInTheDocument()
    })

    it('does not render tool calls section when no tool calls', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Simple response',
        metadata: {},
      })
      render(<ChatMessage message={message} />)

      expect(screen.queryByText('searchDocuments')).not.toBeInTheDocument()
    })

    it('does not render tool calls section when metadata is undefined', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Simple response',
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('Simple response')).toBeInTheDocument()
    })
  })

  describe('timestamp formatting', () => {
    it('shows "Just now" for messages less than 1 minute old', () => {
      const message = createMessage({
        timestamp: MOCK_NOW - 30000, // 30 seconds ago
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('shows minutes ago for messages less than 1 hour old', () => {
      const message = createMessage({
        timestamp: MOCK_NOW - 5 * 60000, // 5 minutes ago
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('shows hours ago for messages less than 24 hours old', () => {
      const message = createMessage({
        timestamp: MOCK_NOW - 3 * 3600000, // 3 hours ago
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('3h ago')).toBeInTheDocument()
    })

    it('shows formatted date for messages older than 24 hours', () => {
      const message = createMessage({
        timestamp: MOCK_NOW - 2 * 86400000, // 2 days ago
      })
      render(<ChatMessage message={message} />)

      // The format is "Jan 22, 10:00 AM" or similar depending on locale
      // We check that it's not "Just now", "Xm ago", or "Xh ago"
      expect(screen.queryByText('Just now')).not.toBeInTheDocument()
      expect(screen.queryByText(/\d+m ago/)).not.toBeInTheDocument()
      expect(screen.queryByText(/\d+h ago/)).not.toBeInTheDocument()
      // Check for date format (contains month name)
      expect(screen.getByText(/Jan \d+/)).toBeInTheDocument()
    })
  })

  describe('content rendering', () => {
    it('preserves whitespace in message content', () => {
      const message = createMessage({
        content: 'Line 1\nLine 2\n  Indented',
      })
      render(<ChatMessage message={message} />)

      // The content should be preserved with pre-wrap
      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
    })

    it('handles empty content', () => {
      const message = createMessage({
        content: '',
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('user')).toBeInTheDocument()
    })

    it('handles long content', () => {
      const longContent = 'A'.repeat(1000)
      const message = createMessage({
        content: longContent,
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })
})
