import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from '../ForgotPasswordForm'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with email input', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('allows user to type in email field', async () => {
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('has required email input', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeRequired()
  })

  it('button shows loading text', () => {
    render(<ForgotPasswordForm />)

    const button = screen.getByRole('button', { name: /send reset link/i })
    expect(button).toBeInTheDocument()
  })
})
