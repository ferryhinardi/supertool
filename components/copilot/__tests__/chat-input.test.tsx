import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatInput } from '../chat-input'

describe('ChatInput', () => {
  const mockOnSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea and send button', () => {
    render(<ChatInput onSend={mockOnSend} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<ChatInput onSend={mockOnSend} placeholder="Type your question..." />)

    expect(screen.getByPlaceholderText('Type your question...')).toBeInTheDocument()
  })

  it('renders with default placeholder when not provided', () => {
    render(<ChatInput onSend={mockOnSend} />)

    expect(screen.getByPlaceholderText('Ask Copilot...')).toBeInTheDocument()
  })

  it('send button is disabled when textarea is empty', () => {
    render(<ChatInput onSend={mockOnSend} />)

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).toBeDisabled()
  })

  it('send button is enabled when text is entered', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello')

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).not.toBeDisabled()
  })

  it('calls onSend with trimmed message on button click', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '  Hello World  ')

    const sendButton = screen.getByRole('button', { name: /send message/i })
    await user.click(sendButton)

    expect(mockOnSend).toHaveBeenCalledTimes(1)
    expect(mockOnSend).toHaveBeenCalledWith('Hello World')
  })

  it('calls onSend on Enter key without Shift', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello{Enter}')

    expect(mockOnSend).toHaveBeenCalledTimes(1)
    expect(mockOnSend).toHaveBeenCalledWith('Hello')
  })

  it('does not call onSend on Shift+Enter (allows newline)', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}World')

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('clears input after sending', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(textarea).toHaveValue('')
  })

  it('disabled prop disables textarea and button', () => {
    render(<ChatInput onSend={mockOnSend} disabled />)

    const textarea = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send message/i })

    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('does not call onSend when disabled even with text', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} disabled />)

    const textarea = screen.getByRole('textbox')
    // Even though disabled, we can try to type (browser behavior may vary)
    // But the button should remain disabled
    expect(textarea).toBeDisabled()

    const sendButton = screen.getByRole('button', { name: /send message/i })
    await user.click(sendButton)

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('does not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '   ')

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).toBeDisabled()
  })
})
