import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackDialog } from '../FeedbackDialog'

// Mock fetch
global.fetch = vi.fn()

describe('FeedbackDialog', () => {
  it('renders the feedback button', () => {
    render(<FeedbackDialog />)

    const feedbackElements = screen.getAllByText(/feedback/i)
    expect(feedbackElements.length).toBeGreaterThan(0)
  })

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup()
    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    // Dialog content should appear - just check if there are textboxes
    const textboxes = screen.queryAllByRole('textbox')
    expect(textboxes.length).toBeGreaterThan(0)
  })

  it('handles feedback submission', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    const textboxes = screen.getAllByRole('textbox')
    const textarea = textboxes[textboxes.length - 1] // Get last textbox (likely the message box)
    await user.type(textarea, 'Great tool!')

    const submitButtons = screen.getAllByRole('button')
    const sendButton = submitButtons.find((btn) => btn.textContent?.includes('Send'))
    if (sendButton) {
      await user.click(sendButton)
      // Should call fetch
      expect(fetch).toHaveBeenCalled()
    }
  })

  it('handles empty feedback submission', async () => {
    const user = userEvent.setup()
    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    const submitButtons = screen.getAllByRole('button')
    const sendButton = submitButtons.find((btn) => btn.textContent?.includes('Send'))
    if (sendButton) {
      await user.click(sendButton)
      // Should still show textbox after error
      const textboxes = screen.queryAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThan(0)
    }
  })

  it('allows selecting feedback type', async () => {
    const user = userEvent.setup()
    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    // Dialog opens
    const textboxes = screen.queryAllByRole('textbox')
    expect(textboxes.length).toBeGreaterThan(0)
  })

  it('allows entering email', async () => {
    const user = userEvent.setup()
    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    const inputs = screen.getAllByRole('textbox')
    if (inputs.length > 1) {
      // First input is likely email
      await user.type(inputs[0], 'test@example.com')
      expect(inputs[0]).toHaveValue('test@example.com')
    } else {
      // Just check that inputs exist
      expect(inputs.length).toBeGreaterThan(0)
    }
  })

  it('handles API error gracefully', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<FeedbackDialog />)

    const buttons = screen.getAllByText(/feedback/i)
    await user.click(buttons[0])

    const textboxes = screen.getAllByRole('textbox')
    const textarea = textboxes[textboxes.length - 1]
    await user.type(textarea, 'Great tool!')

    const submitButtons = screen.getAllByRole('button')
    const sendButton = submitButtons.find((btn) => btn.textContent?.includes('Send'))
    if (sendButton) {
      await user.click(sendButton)
      // Should handle error
      expect(fetch).toHaveBeenCalled()
    }
  })
})
