import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FeedbackDialog } from '../FeedbackDialog'

const { mockToastError, mockToastSuccess, mockFetch } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockFetch: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}))

vi.mock('lucide-react', () => {
  const makeIcon = (name: string) => (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { ...props, 'data-testid': name })

  return {
    AlertCircle: makeIcon('alert-circle-icon'),
    Lightbulb: makeIcon('lightbulb-icon'),
    MessageSquare: makeIcon('message-square-icon'),
    Send: makeIcon('send-icon'),
  }
})

vi.mock('@/styled-system/css', () => ({
  css: () => '',
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}))

vi.mock('@/components/ui/dialog', async () => {
  const React = await import('react')

  interface DialogTriggerChildProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  }

  const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (details: { open: boolean }) => void
  } | null>(null)

  function useDialogContext() {
    const context = React.useContext(DialogContext)

    if (!context) {
      throw new Error('Dialog context unavailable in test mock')
    }

    return context
  }

  return {
    Dialog: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean
      onOpenChange: (details: { open: boolean }) => void
      children: React.ReactNode
    }) => (
      <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
    ),
    DialogTrigger: ({ children }: { asChild?: boolean; children: React.ReactElement }) => {
      const { onOpenChange } = useDialogContext()
      const triggerChild = children as React.ReactElement<DialogTriggerChildProps>

      return React.cloneElement(triggerChild, {
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          triggerChild.props.onClick?.(event)
          onOpenChange({ open: true })
        },
      })
    },
    DialogContent: ({ children }: { children: React.ReactNode }) => {
      const { open } = useDialogContext()

      return open ? <div data-testid="dialog-content">{children}</div> : null
    },
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  }
})

describe('FeedbackDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('shows a validation toast when the message is empty', async () => {
    const user = userEvent.setup()

    render(<FeedbackDialog />)

    await user.click(screen.getByRole('button', { name: /feedback/i }))
    await user.type(screen.getByLabelText(/your idea/i), '   ')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(mockToastError).toHaveBeenCalledWith('Please enter your feedback')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('submits feedback successfully and resets the form', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    })

    render(<FeedbackDialog />)

    await user.click(screen.getByRole('button', { name: /feedback/i }))
    await user.click(screen.getByRole('button', { name: 'Issue' }))
    await user.type(screen.getByLabelText(/email/i), 'hello@example.com')
    await user.type(screen.getByLabelText(/describe the issue/i), 'The export button is clipped')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'issue',
          email: 'hello@example.com',
          message: 'The export button is clipped',
        }),
      })
    })

    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Thank you for your feedback! We'll review it soon."
    )
    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()
  })

  it('falls back to anonymous email and shows an error toast when submission fails', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Bad request' }),
    })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<FeedbackDialog />)

    await user.click(screen.getByRole('button', { name: /feedback/i }))
    await user.type(screen.getByLabelText(/your idea/i), 'Add a CSV merge mode')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'idea',
          email: 'anonymous',
          message: 'Add a CSV merge mode',
        }),
      })
    })

    expect(mockToastError).toHaveBeenCalledWith('Failed to send feedback. Please try again.')
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
  })

  it('lets the user cancel the dialog without submitting', async () => {
    const user = userEvent.setup()

    render(<FeedbackDialog />)

    await user.click(screen.getByRole('button', { name: /feedback/i }))
    await user.type(screen.getByLabelText(/your idea/i), 'Keep my draft hidden')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /feedback/i }))

    expect(screen.getByLabelText(/your idea/i)).toHaveValue('Keep my draft hidden')
  })
})
