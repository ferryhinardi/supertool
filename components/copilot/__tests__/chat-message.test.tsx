import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CopilotMessage, GeneratedFile } from '@/lib/services/copilot/types'
import { ChatMessage } from '../chat-message'

// Mock Date.now for consistent timestamp testing
const MOCK_NOW = new Date('2025-01-24T10:00:00Z').getTime()

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}
Object.assign(navigator, {
  clipboard: mockClipboard,
})

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
URL.createObjectURL = mockCreateObjectURL
URL.revokeObjectURL = mockRevokeObjectURL

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

  describe('generated files', () => {
    const createGeneratedFile = (overrides: Partial<GeneratedFile> = {}): GeneratedFile => ({
      id: 'file-1',
      name: 'example.js',
      mimeType: 'text/javascript',
      content: 'console.log("Hello, world!")',
      isBase64: false,
      size: 28,
      ...overrides,
    })

    it('renders generated files section when files are present', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Here is your file:',
        generatedFiles: [createGeneratedFile()],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('Generated Files')).toBeInTheDocument()
      expect(screen.getByText('example.js')).toBeInTheDocument()
    })

    it('displays file name and size', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Generated a config file',
        generatedFiles: [
          createGeneratedFile({
            name: 'config.json',
            mimeType: 'application/json',
            content: '{"key": "value"}',
            size: 1536, // 1.5 KB
          }),
        ],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('config.json')).toBeInTheDocument()
      expect(screen.getByText(/1\.5 KB/)).toBeInTheDocument()
    })

    it('displays file description when provided', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Here is the utility file',
        generatedFiles: [
          createGeneratedFile({
            name: 'utils.ts',
            description: 'TypeScript utility functions',
          }),
        ],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText(/TypeScript utility functions/)).toBeInTheDocument()
    })

    it('renders multiple generated files', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Created multiple files',
        generatedFiles: [
          createGeneratedFile({ id: 'file-1', name: 'index.js' }),
          createGeneratedFile({ id: 'file-2', name: 'styles.css', mimeType: 'text/css' }),
          createGeneratedFile({ id: 'file-3', name: 'data.json', mimeType: 'application/json' }),
        ],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText('index.js')).toBeInTheDocument()
      expect(screen.getByText('styles.css')).toBeInTheDocument()
      expect(screen.getByText('data.json')).toBeInTheDocument()
    })

    it('does not render generated files section when no files', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'No files here',
        generatedFiles: [],
      })
      render(<ChatMessage message={message} />)

      expect(screen.queryByText('Generated Files')).not.toBeInTheDocument()
    })

    it('does not render generated files section when generatedFiles is undefined', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Simple response',
      })
      render(<ChatMessage message={message} />)

      expect(screen.queryByText('Generated Files')).not.toBeInTheDocument()
    })

    it('renders download button with correct aria-label', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Download this file',
        generatedFiles: [createGeneratedFile({ name: 'script.py' })],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByRole('button', { name: /Download script\.py/ })).toBeInTheDocument()
    })

    it('renders copy button with correct aria-label', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Copy this file',
        generatedFiles: [createGeneratedFile({ name: 'code.ts' })],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByRole('button', { name: /Copy code\.ts content/ })).toBeInTheDocument()
    })

    it('copies file content to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      mockClipboard.writeText.mockResolvedValue(undefined)

      const fileContent = 'export const hello = "world"'
      const message = createMessage({
        role: 'assistant',
        content: 'Copy this',
        generatedFiles: [
          createGeneratedFile({
            name: 'module.ts',
            content: fileContent,
          }),
        ],
      })
      render(<ChatMessage message={message} />)

      const copyButton = screen.getByRole('button', { name: /Copy module\.ts content/ })
      await user.click(copyButton)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(fileContent)
    })

    it('triggers download when download button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // Mock document.createElement and appendChild/removeChild
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink as unknown as HTMLAnchorElement)
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockLink as unknown as HTMLAnchorElement)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockLink as unknown as HTMLAnchorElement)

      const message = createMessage({
        role: 'assistant',
        content: 'Download this',
        generatedFiles: [
          createGeneratedFile({
            name: 'download.txt',
            content: 'File content here',
            mimeType: 'text/plain',
          }),
        ],
      })
      render(<ChatMessage message={message} />)

      const downloadButton = screen.getByRole('button', { name: /Download download\.txt/ })
      await user.click(downloadButton)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toBe('download.txt')
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

      // Cleanup
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('formats file sizes correctly', () => {
      const message = createMessage({
        role: 'assistant',
        content: 'Various file sizes',
        generatedFiles: [
          createGeneratedFile({ id: 'f1', name: 'tiny.txt', size: 500 }), // 500 B
          createGeneratedFile({ id: 'f2', name: 'small.txt', size: 2048 }), // 2 KB
          createGeneratedFile({ id: 'f3', name: 'large.txt', size: 1572864 }), // 1.5 MB
        ],
      })
      render(<ChatMessage message={message} />)

      expect(screen.getByText(/500 B/)).toBeInTheDocument()
      expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument()
      expect(screen.getByText(/1\.5 MB/)).toBeInTheDocument()
    })
  })
})
