import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../LoginForm'

// Mock auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    closeAuthModal: vi.fn(),
  })),
}))

describe('LoginForm', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    render(<LoginForm />)

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders divider between OAuth and email login', () => {
    render(<LoginForm />)

    expect(screen.getByText(/^or$/i)).toBeInTheDocument()
  })

  it('allows user to type in email field', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('allows user to type in password field', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('password field has type password', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('both email and password fields are required', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })
})
