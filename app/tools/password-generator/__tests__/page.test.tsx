import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import PasswordGeneratorPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock nuqs
vi.mock('nuqs', () => ({
  parseAsBoolean: {
    withDefault: (defaultValue: boolean) => ({
      defaultValue,
      parse: (value: string) => value === 'true',
    }),
  },
  parseAsInteger: {
    withDefault: (defaultValue: number) => ({
      defaultValue,
      parse: (value: string) => Number.parseInt(value, 10),
    }),
  },
  useQueryState: (_key: string, parser: { defaultValue: unknown }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useState(parser.defaultValue)
  },
}))

describe('Password Generator Page - Component Tests', () => {
  it('should render password generator page', () => {
    render(<PasswordGeneratorPage />)

    expect(
      screen.getByRole('heading', { name: 'Password Generator', level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Generate Password', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bulk Generation', level: 2 })).toBeInTheDocument()
  })

  it('should display all character type checkboxes', () => {
    render(<PasswordGeneratorPage />)

    expect(screen.getByText('Uppercase (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('Lowercase (a-z)')).toBeInTheDocument()
    expect(screen.getByText('Numbers (0-9)')).toBeInTheDocument()
    expect(screen.getByText('Symbols (!@#)')).toBeInTheDocument()
  })

  it('should have all checkboxes checked by default', () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should display default password length of 16', () => {
    render(<PasswordGeneratorPage />)

    expect(screen.getByText('Password Length: 16')).toBeInTheDocument()
  })

  it('should generate password when Generate Password button is clicked', async () => {
    render(<PasswordGeneratorPage />)

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    // Wait a bit for password to be generated
    await waitFor(
      () => {
        // Check if password strength meter is visible
        expect(screen.getByText('Password Strength')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should update password length when slider is changed', async () => {
    render(<PasswordGeneratorPage />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '24' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 24')).toBeInTheDocument()
    })
  })

  it('should toggle character type checkboxes', async () => {
    render(<PasswordGeneratorPage />)

    const uppercaseCheckbox = screen.getAllByRole('checkbox')[0]
    await userEvent.click(uppercaseCheckbox)

    expect(uppercaseCheckbox).not.toBeChecked()

    await userEvent.click(uppercaseCheckbox)
    expect(uppercaseCheckbox).toBeChecked()
  })

  it('should show warning when no character types are selected', async () => {
    render(<PasswordGeneratorPage />)

    // Uncheck all checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    await waitFor(() => {
      expect(screen.getByText(/Select at least one character type/i)).toBeInTheDocument()
    })
  })

  it('should disable generate button when no character types selected', async () => {
    render(<PasswordGeneratorPage />)

    // Uncheck all checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await waitFor(() => {
      expect(generateButton).toBeDisabled()
    })
  })

  it('should display password strength meter after generation', async () => {
    render(<PasswordGeneratorPage />)

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('should allow bulk password generation', async () => {
    render(<PasswordGeneratorPage />)

    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    // Type directly without clearing (userEvent.type appends to existing value)
    fireEvent.change(bulkInput, { target: { value: '5' } })

    // Wait for the input to update
    await waitFor(() => {
      expect(bulkInput).toHaveValue(5)
    })

    // Find button - it should now say "Generate 5"
    const bulkGenerateButton = screen.getByRole('button', { name: /Generate\s+5/i })
    await userEvent.click(bulkGenerateButton)

    await waitFor(
      () => {
        expect(screen.getByText('Generated 5 passwords')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should display bulk count input with default value', () => {
    render(<PasswordGeneratorPage />)

    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })
    expect(bulkInput).toBeInTheDocument()
    expect(bulkInput).toHaveValue(10)
  })

  it('should show clear button after bulk generation', async () => {
    render(<PasswordGeneratorPage />)

    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })
    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument()
    })
  })

  it('should display security notice', () => {
    render(<PasswordGeneratorPage />)

    expect(screen.getByText('Security Notice')).toBeInTheDocument()
    expect(screen.getByText(/cryptographically secure random numbers/i)).toBeInTheDocument()
    expect(screen.getByText(/no data is sent to any server/i)).toBeInTheDocument()
  })

  it('should show download button after bulk generation', async () => {
    render(<PasswordGeneratorPage />)

    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })
    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      // Download button should be visible
      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) => btn.querySelector('[class*="lucide"]'))
      expect(downloadButton).toBeInTheDocument()
    })
  })

  it('should have range slider with correct min and max', () => {
    render(<PasswordGeneratorPage />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '8')
    expect(slider).toHaveAttribute('max', '64')
  })

  it('should display copy buttons after password generation', async () => {
    render(<PasswordGeneratorPage />)

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      // Should have copy button for generated password
      const buttons = screen.getAllByRole('button')
      const copyButtons = buttons.filter((btn) => {
        const svg = btn.querySelector('svg')
        return svg?.getAttribute('class')?.includes('lucide')
      })
      expect(copyButtons.length).toBeGreaterThan(0)
    })
  })
})
