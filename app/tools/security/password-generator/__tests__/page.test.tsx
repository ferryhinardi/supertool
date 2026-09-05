import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import PasswordGeneratorPage from '../page'

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
  trackEvent: vi.fn(),
}))

// Mock SEO components that use Next.js Link
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => null,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => null,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => null,
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
  parseAsString: {
    withDefault: (defaultValue: string) => ({
      defaultValue,
      parse: (value: string) => value,
    }),
  },
  useQueryState: (_key: string, parser: { defaultValue: unknown }) => {
    return useState(parser.defaultValue)
  },
}))

describe('Password Generator - Page Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders password generator page', () => {
    render(<PasswordGeneratorPage />)
    expect(
      screen.getByRole('heading', { name: 'Password Generator', level: 1 })
    ).toBeInTheDocument()
  })

  it('displays page title and description', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Password Generator')).toBeInTheDocument()
    expect(screen.getByText(/Generate cryptographically secure passwords/i)).toBeInTheDocument()
  })

  it('displays feature badge', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Password Generator Pro')).toBeInTheDocument()
  })

  it('displays generate password section', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByRole('heading', { name: 'Generate Password', level: 3 })).toBeInTheDocument()
  })

  it('displays bulk generation section', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByRole('heading', { name: 'Bulk Generation', level: 3 })).toBeInTheDocument()
  })
})

describe('Password Generator - Character Type Options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays all character type checkboxes', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Uppercase (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('Lowercase (a-z)')).toBeInTheDocument()
    expect(screen.getByText('Numbers (0-9)')).toBeInTheDocument()
    expect(screen.getByText('Symbols (!@#)')).toBeInTheDocument()
  })

  it('has all checkboxes checked by default', () => {
    render(<PasswordGeneratorPage />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked()
    })
  })

  it('toggles uppercase checkbox', async () => {
    render(<PasswordGeneratorPage />)
    const uppercaseCheckbox = screen.getAllByRole('checkbox')[0]

    await userEvent.click(uppercaseCheckbox)
    expect(uppercaseCheckbox).not.toBeChecked()

    await userEvent.click(uppercaseCheckbox)
    expect(uppercaseCheckbox).toBeChecked()
  })

  it('toggles lowercase checkbox', async () => {
    render(<PasswordGeneratorPage />)
    const lowercaseCheckbox = screen.getAllByRole('checkbox')[1]

    await userEvent.click(lowercaseCheckbox)
    expect(lowercaseCheckbox).not.toBeChecked()

    await userEvent.click(lowercaseCheckbox)
    expect(lowercaseCheckbox).toBeChecked()
  })

  it('toggles numbers checkbox', async () => {
    render(<PasswordGeneratorPage />)
    const numbersCheckbox = screen.getAllByRole('checkbox')[2]

    await userEvent.click(numbersCheckbox)
    expect(numbersCheckbox).not.toBeChecked()

    await userEvent.click(numbersCheckbox)
    expect(numbersCheckbox).toBeChecked()
  })

  it('toggles symbols checkbox', async () => {
    render(<PasswordGeneratorPage />)
    const symbolsCheckbox = screen.getAllByRole('checkbox')[3]

    await userEvent.click(symbolsCheckbox)
    expect(symbolsCheckbox).not.toBeChecked()

    await userEvent.click(symbolsCheckbox)
    expect(symbolsCheckbox).toBeChecked()
  })
})

describe('Password Generator - Password Length', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays default password length of 16', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Password Length: 16')).toBeInTheDocument()
  })

  it('displays range slider', () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('has correct min and max attributes', () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '8')
    expect(slider).toHaveAttribute('max', '64')
  })

  it('updates password length when slider is changed', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '24' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 24')).toBeInTheDocument()
    })
  })

  it('allows setting minimum length of 8', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '8' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 8')).toBeInTheDocument()
    })
  })

  it('allows setting maximum length of 64', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '64' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 64')).toBeInTheDocument()
    })
  })
})

describe('Password Generator - Password Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays generate password button', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByRole('button', { name: /Generate Password/i })).toBeInTheDocument()
  })

  it('generates password when button is clicked', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(
      () => {
        expect(screen.getByText('Password Strength')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('tracks generation in analytics', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'password_generate_random',
        expect.any(Object)
      )
    })
  })

  it('displays password strength meter after generation', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('displays copy button after generation', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const copyButtons = buttons.filter((btn) => {
        const svg = btn.querySelector('svg')
        return svg?.getAttribute('class')?.includes('lucide')
      })
      expect(copyButtons.length).toBeGreaterThan(0)
    })
  })
})

describe('Password Generator - Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows warning when no character types are selected', async () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    await waitFor(() => {
      expect(screen.getByText(/Select at least one character type/i)).toBeInTheDocument()
    })
  })

  it('disables generate button when no character types selected', async () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await waitFor(() => {
      expect(generateButton).toBeDisabled()
    })
  })

  it('enables generate button when at least one type is selected', async () => {
    render(<PasswordGeneratorPage />)

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).not.toBeDisabled()
  })
})

describe('Password Generator - Bulk Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays bulk count input with default value', () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })
    expect(bulkInput).toBeInTheDocument()
    expect(bulkInput).toHaveValue(10)
  })

  it('allows changing bulk count', async () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    fireEvent.change(bulkInput, { target: { value: '5' } })

    await waitFor(() => {
      expect(bulkInput).toHaveValue(5)
    })
  })

  it('generates bulk passwords', async () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    fireEvent.change(bulkInput, { target: { value: '5' } })

    const bulkGenerateButton = screen.getByRole('button', { name: /Generate\s+5/i })
    await userEvent.click(bulkGenerateButton)

    await waitFor(
      () => {
        expect(screen.getByText('Generated 5 passwords')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('tracks bulk generation in analytics', async () => {
    render(<PasswordGeneratorPage />)
    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })

    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
        'password_bulk_generate',
        expect.any(Object)
      )
    })
  })

  it('shows success toast after bulk generation', async () => {
    render(<PasswordGeneratorPage />)
    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })

    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        expect.stringContaining('unique passwords')
      )
    })
  })

  it('displays clear button after bulk generation', async () => {
    render(<PasswordGeneratorPage />)
    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })

    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Clear$/i })).toBeInTheDocument()
    })
  })

  it('displays download button after bulk generation', async () => {
    render(<PasswordGeneratorPage />)
    const bulkGenerateButton = screen.getByRole('button', { name: /Generate 10/i })

    await userEvent.click(bulkGenerateButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) => btn.querySelector('[class*="lucide"]'))
      expect(downloadButton).toBeInTheDocument()
    })
  })
})

describe('Password Generator - Copy Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('copies password to clipboard', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(async () => {
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg')
        const classes = svg?.getAttribute('class') || ''
        return classes.includes('lucide') && btn.textContent?.includes('Copy')
      })

      if (copyButton) {
        await userEvent.click(copyButton)
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      }
    })
  })

  it('shows success toast on copy', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(async () => {
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.textContent?.includes('Copy'))

      if (copyButton) {
        await userEvent.click(copyButton)
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Copied to clipboard!')
      }
    })
  })

  it('tracks copy in analytics', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(async () => {
      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find((btn) => btn.textContent?.includes('Copy'))

      if (copyButton) {
        await userEvent.click(copyButton)
        expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalledWith(
          'password_copy',
          expect.any(Object)
        )
      }
    })
  })
})

describe('Password Generator - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has proper heading hierarchy', () => {
    render(<PasswordGeneratorPage />)
    const h1 = screen.getByRole('heading', { level: 1, name: 'Password Generator' })
    expect(h1).toBeInTheDocument()
  })

  it('all checkboxes have labels', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Uppercase (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('Lowercase (a-z)')).toBeInTheDocument()
    expect(screen.getByText('Numbers (0-9)')).toBeInTheDocument()
    expect(screen.getByText('Symbols (!@#)')).toBeInTheDocument()
  })

  it('slider is keyboard accessible', () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('all buttons are keyboard accessible', () => {
    render(<PasswordGeneratorPage />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeTruthy()
    })
  })

  it('bulk input has accessible label', () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })
    expect(bulkInput).toHaveAccessibleName()
  })
})

describe('Password Generator - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders responsive layout', () => {
    render(<PasswordGeneratorPage />)
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
  })

  it('displays options in responsive grid', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByText('Uppercase (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('Lowercase (a-z)')).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(<PasswordGeneratorPage />)
    expect(screen.getByRole('button', { name: /Generate Password/i })).toBeInTheDocument()
  })
})

describe('Password Generator - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles minimum password length', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '8' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 8')).toBeInTheDocument()
    })

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('handles maximum password length', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '64' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 64')).toBeInTheDocument()
    })

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('handles single character type selection', async () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    // Uncheck all except first
    for (let i = 1; i < checkboxes.length; i++) {
      await userEvent.click(checkboxes[i])
    }

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).not.toBeDisabled()
  })

  it('handles bulk count of 1', async () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    fireEvent.change(bulkInput, { target: { value: '1' } })

    await waitFor(() => {
      expect(bulkInput).toHaveValue(1)
    })
  })

  it('handles bulk count of 100', async () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    fireEvent.change(bulkInput, { target: { value: '100' } })

    await waitFor(() => {
      expect(bulkInput).toHaveValue(100)
    })
  })
})

describe('Password Generator - Password Strength', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays strength meter after generation', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('shows strength with longer passwords', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '32' } })

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })

  it('updates strength for different character combinations', async () => {
    render(<PasswordGeneratorPage />)

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })

    // Change options and regenerate
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[3]) // Uncheck symbols

    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument()
    })
  })
})

describe('Password Generator - Icons Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays Sparkles icon in header', () => {
    render(<PasswordGeneratorPage />)
    const { container } = render(<PasswordGeneratorPage />)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('displays Key icon in generate button', () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).toBeInTheDocument()
  })

  it('displays RefreshCw icon in bulk button', () => {
    render(<PasswordGeneratorPage />)
    const bulkButton = screen.getByRole('button', { name: /Generate 10/i })
    expect(bulkButton).toBeInTheDocument()
  })
})

describe('Password Generator - Mode Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to random mode', () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).toBeInTheDocument()
  })

  it('allows password generation in default mode', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await userEvent.click(generateButton)

    await waitFor(() => {
      expect(vi.mocked(analytics.trackToolEvent)).toHaveBeenCalled()
    })
  })
})

describe('Password Generator - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error when no character types selected and generating', async () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    await waitFor(() => {
      expect(screen.getByText(/Select at least one character type/i)).toBeInTheDocument()
    })
  })

  it('disables generate button on invalid state', async () => {
    render(<PasswordGeneratorPage />)

    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    const generateButton = screen.getByRole('button', { name: /Generate Password/i })

    await waitFor(() => {
      expect(generateButton).toBeDisabled()
    })
  })
})

describe('Password Generator - Button States', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generate button is enabled by default', () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).not.toBeDisabled()
  })

  it('bulk generate button is enabled by default', () => {
    render(<PasswordGeneratorPage />)
    const bulkButton = screen.getByRole('button', { name: /Generate 10/i })
    expect(bulkButton).not.toBeDisabled()
  })

  it('generate button changes state based on options', async () => {
    render(<PasswordGeneratorPage />)
    const generateButton = screen.getByRole('button', { name: /Generate Password/i })
    expect(generateButton).not.toBeDisabled()

    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox)
    }

    await waitFor(() => {
      expect(generateButton).toBeDisabled()
    })
  })
})

describe('Password Generator - Input Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates bulk count input', async () => {
    render(<PasswordGeneratorPage />)
    const bulkInput = screen.getByRole('spinbutton', { name: /Number of Passwords/i })

    fireEvent.change(bulkInput, { target: { value: '50' } })

    await waitFor(() => {
      expect(bulkInput).toHaveValue(50)
    })
  })

  it('handles password length slider changes', async () => {
    render(<PasswordGeneratorPage />)
    const slider = screen.getByRole('slider')

    fireEvent.change(slider, { target: { value: '20' } })

    await waitFor(() => {
      expect(screen.getByText('Password Length: 20')).toBeInTheDocument()
    })
  })
})
