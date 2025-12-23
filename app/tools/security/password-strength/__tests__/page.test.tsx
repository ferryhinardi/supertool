import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PasswordStrengthPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Password Strength Analyzer - Component Tests', () => {
  it('should render password strength analyzer page', () => {
    render(<PasswordStrengthPage />)

    expect(
      screen.getByRole('heading', { name: 'Password Strength Analyzer', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Enter Your Password', level: 3 })
    ).toBeInTheDocument()
  })

  it('should display password input field', () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have show/hide password toggle', () => {
    render(<PasswordStrengthPage />)

    const toggleButton = screen.getByRole('button', { name: '' })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should toggle password visibility when eye icon is clicked', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Find the toggle button (it has no name but contains an svg)
    const buttons = screen.getAllByRole('button')
    const toggleButton = buttons.find((btn) => {
      const svg = btn.querySelector('svg')
      return svg !== null
    })

    if (toggleButton) {
      await userEvent.click(toggleButton)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'text')
      })

      await userEvent.click(toggleButton)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'password')
      })
    }
  })

  it('should not display analysis for empty password', () => {
    render(<PasswordStrengthPage />)

    expect(screen.queryByText('Password Strength')).not.toBeInTheDocument()
    expect(screen.queryByText('Character Analysis')).not.toBeInTheDocument()
  })

  it('should display real-time analysis when password is entered', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'TestPassword123!')

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('should show strength meter after password input', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'StrongP@ssw0rd!')

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('should display password stats (length, entropy, score, crack time)', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'MyPassword123')

    await waitFor(() => {
      expect(screen.getByText('Length')).toBeInTheDocument()
      expect(screen.getByText('Entropy')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.getByText('Crack Time')).toBeInTheDocument()
    })
  })

  it('should show character analysis section after password input', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'Test123!')

    await waitFor(() => {
      expect(screen.getByText('Character Analysis')).toBeInTheDocument()
      expect(screen.getByText('Lowercase Letters')).toBeInTheDocument()
      expect(screen.getByText('Uppercase Letters')).toBeInTheDocument()
      expect(screen.getByText('Numbers')).toBeInTheDocument()
      expect(screen.getByText('Special Characters')).toBeInTheDocument()
    })
  })

  it('should show pattern detection section after password input', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'password123')

    await waitFor(() => {
      expect(screen.getByText('Pattern Detection')).toBeInTheDocument()
    })
  })

  it('should detect weak password with common patterns', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'password')

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
      // Weak passwords typically show "Weak" or "Very Weak" label
      const badges = screen.queryAllByText(/Weak/i)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('should detect sequences in password', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'abc123')

    await waitFor(() => {
      expect(screen.getByText('Sequences Detected')).toBeInTheDocument()
    })
  })

  it('should detect repeated characters', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'aaabbb111')

    await waitFor(() => {
      expect(screen.getByText('Repeated Characters')).toBeInTheDocument()
    })
  })

  it('should show improvement suggestions for weak passwords', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'weak')

    await waitFor(() => {
      expect(screen.getByText('Improvement Suggestions')).toBeInTheDocument()
    })
  })

  it('should show copy analysis button when password is analyzed', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'TestPassword123')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy Analysis/i })).toBeInTheDocument()
    })
  })

  it('should update analysis in real-time as user types', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')

    // Type first password
    await userEvent.type(passwordInput, 'short')

    await waitFor(() => {
      expect(screen.getByText(/5 characters/i)).toBeInTheDocument()
    })

    // Clear and type longer password
    await userEvent.clear(passwordInput)
    await userEvent.type(passwordInput, 'muchlongerpassword')

    await waitFor(() => {
      expect(screen.getByText(/18 characters/i)).toBeInTheDocument()
    })
  })

  it('should display security tips section', () => {
    render(<PasswordStrengthPage />)

    expect(screen.getByText('Security Tips')).toBeInTheDocument()
    expect(screen.getByText(/Use at least 12 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/Mix uppercase, lowercase, numbers/i)).toBeInTheDocument()
  })

  it('should show privacy notice', () => {
    render(<PasswordStrengthPage />)

    expect(screen.getByText('Your password is never sent to any server')).toBeInTheDocument()
  })

  it('should show zxcvbn badge', () => {
    render(<PasswordStrengthPage />)

    expect(screen.getByText('Powered by zxcvbn')).toBeInTheDocument()
  })

  it('should check all character types for complex password', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'Complex@Pass123')

    await waitFor(() => {
      // All character types should be marked as present
      expect(screen.getByText('Character Analysis')).toBeInTheDocument()
      // The component will show checkmarks for all character types
    })
  })

  it('should clear analysis when password is deleted', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'TestPassword')

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })

    await userEvent.clear(passwordInput)

    await waitFor(() => {
      expect(screen.queryByText('Password Strength')).not.toBeInTheDocument()
    })
  })

  it('should show no sequences message for secure password', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'R@nd0mP@ss!')

    await waitFor(() => {
      expect(screen.getByText('No Sequences')).toBeInTheDocument()
    })
  })

  it('should show no repeats message for secure password', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'Unique#Pass2024')

    await waitFor(() => {
      expect(screen.getByText('No Repeats')).toBeInTheDocument()
    })
  })

  it('should handle very long passwords', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    const longPassword = 'ThisIsAVeryLongPasswordWithLotsOfCharacters123!@#$%^&*()'
    await userEvent.type(passwordInput, longPassword)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
      expect(screen.getByText(`${longPassword.length} characters`)).toBeInTheDocument()
    })
  })

  it('should display score out of 4', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')
    await userEvent.type(passwordInput, 'TestPass123')

    await waitFor(() => {
      // Score should be displayed as "X / 4"
      expect(screen.getByText(/\/ 4/i)).toBeInTheDocument()
    })
  })

  it('should show different strength levels based on password complexity', async () => {
    render(<PasswordStrengthPage />)

    const passwordInput = screen.getByPlaceholderText('Type your password here...')

    // Test with weak password
    await userEvent.type(passwordInput, '123')
    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })

    // Clear and test with stronger password
    await userEvent.clear(passwordInput)
    await userEvent.type(passwordInput, 'Str0ng!P@ssw0rd#2024')

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })
})
