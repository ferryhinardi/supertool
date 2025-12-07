import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SignupForm } from '../SignupForm'

// Mock auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    closeAuthModal: vi.fn(),
  })),
}))

describe('SignupForm', () => {
  it('renders signup form with all required fields', () => {
    render(<SignupForm />)

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    render(<SignupForm />)

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders divider between OAuth and email signup', () => {
    render(<SignupForm />)

    expect(screen.getByText(/^or$/i)).toBeInTheDocument()
  })

  it('allows user to type in email field', async () => {
    const user = userEvent.setup()

    render(<SignupForm />)

    const emailInput = screen.getByLabelText(/^email$/i)
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('allows user to type in password fields', async () => {
    const user = userEvent.setup()

    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('password fields have minLength of 6', () => {
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    expect(passwordInput).toHaveAttribute('minLength', '6')
    expect(confirmPasswordInput).toHaveAttribute('minLength', '6')
  })

  it('all fields are required', () => {
    render(<SignupForm />)

    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
    expect(confirmPasswordInput).toBeRequired()
  })

  it('password fields have type password', () => {
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
  })
})
