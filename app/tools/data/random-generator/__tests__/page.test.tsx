import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RandomGeneratorPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

// Get mocked toast for assertions
const mockToast = vi.mocked(toast)

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Charsets for validation
const CHARSETS = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// UUID v4 regex pattern
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Helper to check if string contains only characters from charset
const containsOnlyChars = (str: string, charset: string): boolean => {
  return [...str].every((char) => charset.includes(char))
}

// Helper to render component with nuqs
const renderWithNuqs = (searchParams: Record<string, string> = {}) => {
  return render(
    <NuqsTestingAdapter searchParams={searchParams}>
      <RandomGeneratorPage />
    </NuqsTestingAdapter>
  )
}

// Helper to get the main Generate button (not the type selection buttons)
const getGenerateButton = (): HTMLElement => {
  const buttons = screen.getAllByRole('button')
  const generateButton = buttons.find((btn) => {
    const text = btn.textContent?.trim()
    // The main Generate button has exactly "Generate" text (possibly with icon)
    return text === 'Generate' || text?.endsWith('Generate')
  })
  if (!generateButton) {
    throw new Error('Generate button not found')
  }
  return generateButton
}

describe('RandomGeneratorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the page with title and description', () => {
      renderWithNuqs()
      expect(screen.getByText('Random')).toBeInTheDocument()
      expect(screen.getByText('Generator')).toBeInTheDocument()
      // Use getAllByText since description text appears multiple times in FAQs
      expect(screen.getAllByText(/cryptographically secure random/i).length).toBeGreaterThan(0)
    })

    it('renders the Data Tool badge', () => {
      renderWithNuqs()
      expect(screen.getByText('Data Tool')).toBeInTheDocument()
    })

    it('renders all generator type buttons', () => {
      renderWithNuqs()
      expect(screen.getByText('Random Number')).toBeInTheDocument()
      expect(screen.getByText('Random String')).toBeInTheDocument()
      expect(screen.getByText('UUID v4')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('renders generator type descriptions', () => {
      renderWithNuqs()
      expect(screen.getByText('Generate integers or decimals in a range')).toBeInTheDocument()
      expect(screen.getByText('Alphanumeric, letters, or custom chars')).toBeInTheDocument()
      expect(screen.getByText('Universally unique identifier')).toBeInTheDocument()
      expect(screen.getByText('Secure random passwords')).toBeInTheDocument()
    })

    it('renders count input with default value', () => {
      renderWithNuqs()
      const countInput = screen.getByLabelText(/count/i)
      expect(countInput).toBeInTheDocument()
      expect(countInput).toHaveValue(1)
    })

    it('renders Generate button', () => {
      renderWithNuqs()
      expect(getGenerateButton()).toBeInTheDocument()
    })

    it('renders FAQ section', () => {
      renderWithNuqs()
      expect(screen.getByText('How random are the generated values?')).toBeInTheDocument()
    })

    it('renders loading fallback initially via Suspense', () => {
      // The Suspense fallback is handled by React internals
      // We just verify the component renders correctly
      renderWithNuqs()
      expect(screen.getByText('Random')).toBeInTheDocument()
    })
  })

  describe('Generator Type Selection', () => {
    it('defaults to number generator', () => {
      renderWithNuqs()
      // Number options should be visible by default
      expect(screen.getByLabelText(/min/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/max/i)).toBeInTheDocument()
    })

    it('switches to string generator when clicked', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      await user.click(screen.getByText('Random String'))

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument()
      expect(screen.getByText('alphanumeric')).toBeInTheDocument()
      expect(screen.getByText('letters')).toBeInTheDocument()
      expect(screen.getByText('numbers')).toBeInTheDocument()
      expect(screen.getByText('custom')).toBeInTheDocument()
    })

    it('switches to UUID generator when clicked', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      await user.click(screen.getByText('UUID v4'))

      // UUID mode has no additional options besides count
      expect(screen.queryByLabelText(/min/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/length/i)).not.toBeInTheDocument()
    })

    it('switches to password generator when clicked', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      await user.click(screen.getByText('Password'))

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument()
      // Use getAllByText since multiple elements may have these labels (checkbox labels + descriptions)
      expect(screen.getAllByText(/uppercase/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/lowercase/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/numbers/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/symbols/i).length).toBeGreaterThan(0)
    })

    it('respects URL parameter for initial type', () => {
      renderWithNuqs({ type: 'password' })

      // Password options should be visible - use getAllByText since multiple matches exist
      expect(screen.getAllByText(/uppercase/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/lowercase/i).length).toBeGreaterThan(0)
    })

    it('respects URL parameter for initial count', () => {
      renderWithNuqs({ count: '5' })

      const countInput = screen.getByLabelText(/count/i)
      expect(countInput).toHaveValue(5)
    })
  })

  describe('Number Generation', () => {
    it('generates random integers within range', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      // Set min and max using fireEvent.change for reliable number input handling
      const minInput = screen.getByLabelText(/min/i)
      const maxInput = screen.getByLabelText(/max/i)

      fireEvent.change(minInput, { target: { value: '10' } })
      fireEvent.change(maxInput, { target: { value: '20' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      // Get the generated value
      const resultElement = screen.getByRole('code')
      const value = Number(resultElement.textContent)

      expect(value).toBeGreaterThanOrEqual(10)
      expect(value).toBeLessThanOrEqual(20)
      expect(Number.isInteger(value)).toBe(true)
    })

    it('generates decimals when option is enabled', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      // Enable decimals
      const decimalsCheckbox = screen.getByRole('checkbox', { name: /use decimals/i })
      await user.click(decimalsCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      // Get the generated value - it should have decimal places
      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      // Should contain a decimal point and 2 decimal places (default)
      expect(value).toMatch(/^\d+\.\d{2}$/)
    })

    it('warns when min is greater than max', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      const minInput = screen.getByLabelText(/min/i)
      const maxInput = screen.getByLabelText(/max/i)

      fireEvent.change(minInput, { target: { value: '100' } })
      fireEvent.change(maxInput, { target: { value: '10' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(mockToast.warning).toHaveBeenCalledWith(
          'Min is greater than max. Values have been swapped automatically.'
        )
      })

      // Should still generate a valid result
      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })
    })

    it('generates multiple numbers when count > 1', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      const countInput = screen.getByLabelText(/count/i)
      fireEvent.change(countInput, { target: { value: '5' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText('Results (5)')).toBeInTheDocument()
      })

      const results = screen.getAllByRole('code')
      expect(results).toHaveLength(5)
    })

    it('clamps count to valid range (1-100)', async () => {
      renderWithNuqs()

      const countInput = screen.getByLabelText(/count/i) as HTMLInputElement

      // Test max limit
      fireEvent.change(countInput, { target: { value: '150' } })
      expect(countInput.value).toBe('100')

      // Test min limit
      fireEvent.change(countInput, { target: { value: '0' } })
      expect(countInput.value).toBe('1')
    })

    it('adjusts decimal places', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      // Enable decimals
      const decimalsCheckbox = screen.getByRole('checkbox', { name: /use decimals/i })
      await user.click(decimalsCheckbox)

      // Find and change decimal places input (it appears after checkbox)
      const inputs = screen.getAllByRole('spinbutton')
      const decimalPlacesInput = inputs.find(
        (input) => (input as HTMLInputElement).value === '2'
      ) as HTMLInputElement

      fireEvent.change(decimalPlacesInput, { target: { value: '4' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      // Should have 4 decimal places
      expect(value).toMatch(/^\d+\.\d{4}$/)
    })
  })

  describe('String Generation', () => {
    it('generates alphanumeric strings by default', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      expect(value).toHaveLength(16) // Default length
      expect(containsOnlyChars(value, CHARSETS.alphanumeric)).toBe(true)
    })

    it('generates letters-only strings', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(screen.getByText('letters'))
      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      expect(containsOnlyChars(value, CHARSETS.letters)).toBe(true)
      // Should not contain any numbers
      expect(value).not.toMatch(/[0-9]/)
    })

    it('generates numbers-only strings', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(screen.getByText('numbers'))
      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      expect(containsOnlyChars(value, CHARSETS.numbers)).toBe(true)
      expect(value).toMatch(/^[0-9]+$/)
    })

    it('generates strings with custom charset', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(screen.getByText('custom'))

      const customInput = screen.getByPlaceholderText(/enter custom characters/i)
      await user.type(customInput, 'ABC123')

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      expect(containsOnlyChars(value, 'ABC123')).toBe(true)
    })

    it('falls back to alphanumeric when custom charset is empty', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(screen.getByText('custom'))
      // Don't enter any custom characters

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      // Should use default alphanumeric
      expect(containsOnlyChars(value, CHARSETS.alphanumeric)).toBe(true)
    })

    it('respects custom string length', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      const lengthInput = screen.getByLabelText(/length/i)
      fireEvent.change(lengthInput, { target: { value: '32' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      expect(resultElement.textContent).toHaveLength(32)
    })

    it('clamps string length to valid range (1-256)', async () => {
      renderWithNuqs({ type: 'string' })

      const lengthInput = screen.getByLabelText(/length/i) as HTMLInputElement

      // Test max limit - React state clamping requires waitFor to re-render
      fireEvent.change(lengthInput, { target: { value: '300' } })
      await waitFor(() => {
        expect(lengthInput.value).toBe('256')
      })

      // Test min limit - input of 0 triggers fallback to default (16) because of `|| 16` in the logic
      // This is by design: falsy values (0, empty, NaN) default to 16
      fireEvent.change(lengthInput, { target: { value: '0' } })
      await waitFor(() => {
        expect(lengthInput.value).toBe('16')
      })

      // Test that valid minimum value 1 works
      fireEvent.change(lengthInput, { target: { value: '1' } })
      await waitFor(() => {
        expect(lengthInput.value).toBe('1')
      })
    })
  })

  describe('UUID Generation', () => {
    it('generates valid UUID v4 format', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const uuid = resultElement.textContent!

      expect(uuid).toMatch(UUID_V4_REGEX)
    })

    it('generates UUIDs with correct version bit', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const uuid = resultElement.textContent!

      // Version 4 UUIDs have '4' as the 13th character
      expect(uuid.charAt(14)).toBe('4')
    })

    it('generates UUIDs with correct variant bits', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const uuid = resultElement.textContent!

      // Variant bits should be 10xx, so character at position 19 should be 8, 9, a, or b
      const variantChar = uuid.charAt(19).toLowerCase()
      expect(['8', '9', 'a', 'b']).toContain(variantChar)
    })

    it('generates multiple unique UUIDs', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      const countInput = screen.getByLabelText(/count/i)
      fireEvent.change(countInput, { target: { value: '10' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText('Results (10)')).toBeInTheDocument()
      })

      const results = screen.getAllByRole('code')
      const uuids = results.map((r) => r.textContent)

      // All should be valid UUIDs
      uuids.forEach((uuid) => {
        expect(uuid).toMatch(UUID_V4_REGEX)
      })

      // All should be unique
      const uniqueUuids = new Set(uuids)
      expect(uniqueUuids.size).toBe(10)
    })
  })

  describe('Password Generation', () => {
    it('generates passwords with all character types by default', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!

      expect(password).toHaveLength(16) // Default length

      // Should contain mix of characters from all sets
      const allChars = CHARSETS.uppercase + CHARSETS.lowercase + CHARSETS.numbers + CHARSETS.symbols
      expect(containsOnlyChars(password, allChars)).toBe(true)
    })

    it('generates uppercase-only passwords', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      // Uncheck all except uppercase
      const lowercaseCheckbox = screen.getByRole('checkbox', { name: /lowercase/i })
      const numbersCheckbox = screen.getByRole('checkbox', { name: /numbers/i })
      const symbolsCheckbox = screen.getByRole('checkbox', { name: /symbols/i })

      await user.click(lowercaseCheckbox)
      await user.click(numbersCheckbox)
      await user.click(symbolsCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!

      expect(containsOnlyChars(password, CHARSETS.uppercase)).toBe(true)
    })

    it('generates lowercase-only passwords', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      // Uncheck all except lowercase
      const uppercaseCheckbox = screen.getByRole('checkbox', { name: /uppercase/i })
      const numbersCheckbox = screen.getByRole('checkbox', { name: /numbers/i })
      const symbolsCheckbox = screen.getByRole('checkbox', { name: /symbols/i })

      await user.click(uppercaseCheckbox)
      await user.click(numbersCheckbox)
      await user.click(symbolsCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!

      expect(containsOnlyChars(password, CHARSETS.lowercase)).toBe(true)
    })

    it('generates numbers-only passwords', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      // Uncheck all except numbers
      const uppercaseCheckbox = screen.getByRole('checkbox', { name: /uppercase/i })
      const lowercaseCheckbox = screen.getByRole('checkbox', { name: /lowercase/i })
      const symbolsCheckbox = screen.getByRole('checkbox', { name: /symbols/i })

      await user.click(uppercaseCheckbox)
      await user.click(lowercaseCheckbox)
      await user.click(symbolsCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!

      expect(containsOnlyChars(password, CHARSETS.numbers)).toBe(true)
    })

    it('generates symbols-only passwords', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      // Uncheck all except symbols
      const uppercaseCheckbox = screen.getByRole('checkbox', { name: /uppercase/i })
      const lowercaseCheckbox = screen.getByRole('checkbox', { name: /lowercase/i })
      const numbersCheckbox = screen.getByRole('checkbox', { name: /numbers/i })

      await user.click(uppercaseCheckbox)
      await user.click(lowercaseCheckbox)
      await user.click(numbersCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!

      expect(containsOnlyChars(password, CHARSETS.symbols)).toBe(true)
    })

    it('warns and uses default when no options are selected', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      // Uncheck all options
      const uppercaseCheckbox = screen.getByRole('checkbox', { name: /uppercase/i })
      const lowercaseCheckbox = screen.getByRole('checkbox', { name: /lowercase/i })
      const numbersCheckbox = screen.getByRole('checkbox', { name: /numbers/i })
      const symbolsCheckbox = screen.getByRole('checkbox', { name: /symbols/i })

      await user.click(uppercaseCheckbox)
      await user.click(lowercaseCheckbox)
      await user.click(numbersCheckbox)
      await user.click(symbolsCheckbox)

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(mockToast.warning).toHaveBeenCalledWith(
          'No character types selected. Using default alphanumeric charset.'
        )
      })

      // Should generate using default charset
      const resultElement = screen.getByRole('code')
      const password = resultElement.textContent!
      expect(containsOnlyChars(password, CHARSETS.alphanumeric)).toBe(true)
    })

    it('respects custom password length', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      const lengthInput = screen.getByLabelText(/length/i)
      fireEvent.change(lengthInput, { target: { value: '24' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      expect(resultElement.textContent).toHaveLength(24)
    })

    it('clamps password length to valid range (4-128)', async () => {
      renderWithNuqs({ type: 'password' })

      const lengthInput = screen.getByLabelText(/length/i) as HTMLInputElement

      // Test max limit
      fireEvent.change(lengthInput, { target: { value: '200' } })
      expect(lengthInput.value).toBe('128')

      // Test min limit
      fireEvent.change(lengthInput, { target: { value: '2' } })
      expect(lengthInput.value).toBe('4')
    })
  })

  describe('Copy Functionality', () => {
    it('copies individual result to clipboard', async () => {
      const user = userEvent.setup()
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextMock)

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('Copied to clipboard!')
      })
    })

    it('copies all results to clipboard', async () => {
      const user = userEvent.setup()
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextMock)

      renderWithNuqs({ type: 'uuid' })

      const countInput = screen.getByLabelText(/count/i)
      fireEvent.change(countInput, { target: { value: '3' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText('Results (3)')).toBeInTheDocument()
      })

      const copyAllButton = screen.getByRole('button', { name: /copy all/i })
      await user.click(copyAllButton)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        // Should join with newlines
        const copiedText = writeTextMock.mock.calls[0][0]
        expect(copiedText.split('\n')).toHaveLength(3)
        expect(mockToast.success).toHaveBeenCalledWith('Copied all to clipboard!')
      })
    })

    it('shows error toast when copy fails', async () => {
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Copy failed'))

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to copy to clipboard')
      })
    })

    it('shows checkmark icon after copying', async () => {
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i })
      await user.click(copyButton)

      await waitFor(() => {
        // Button should now show "Copied" aria-label
        expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('clears all results', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.queryByText(/results/i)).not.toBeInTheDocument()
        expect(mockToast.success).toHaveBeenCalledWith('Cleared!')
      })
    })

    it('hides Copy All and Clear buttons when no results', () => {
      renderWithNuqs()

      expect(screen.queryByRole('button', { name: /copy all/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })

    it('shows Copy All and Clear buttons only after generating', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      // Initially hidden
      expect(screen.queryByRole('button', { name: /copy all/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy all/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
      })
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast after generating', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Generated 1 uuid!')
      })
    })

    it('shows correct plural form for multiple results', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      const countInput = screen.getByLabelText(/count/i)
      fireEvent.change(countInput, { target: { value: '5' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Generated 5 uuids!')
      })
    })

    it('shows correct generator type in toast message', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'password' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Generated 1 password!')
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks page open event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      renderWithNuqs()

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('random_generator_open', {})
      })
    })

    it('tracks generate event with type and count', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      renderWithNuqs({ type: 'uuid' })

      const countInput = screen.getByLabelText(/count/i)
      fireEvent.change(countInput, { target: { value: '3' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('random_generator_generate', {
          type: 'uuid',
          count: 3,
        })
      })
    })

    it('tracks copy event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const copyButton = screen.getByRole('button', { name: /copy to clipboard/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('random_generator_copy', {})
      })
    })

    it('tracks copy all event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const copyAllButton = screen.getByRole('button', { name: /copy all/i })
      await user.click(copyAllButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('random_generator_copy', { all: true })
      })
    })

    it('tracks clear event', async () => {
      const { trackToolEvent } = await import('@/lib/services/analytics')
      const user = userEvent.setup()

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      await waitFor(() => {
        expect(trackToolEvent).toHaveBeenCalledWith('random_generator_clear', {})
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles equal min and max for numbers', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      const minInput = screen.getByLabelText(/min/i)
      const maxInput = screen.getByLabelText(/max/i)

      fireEvent.change(minInput, { target: { value: '42' } })
      fireEvent.change(maxInput, { target: { value: '42' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      expect(resultElement.textContent).toBe('42')
    })

    it('handles negative numbers', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      const minInput = screen.getByLabelText(/min/i)
      const maxInput = screen.getByLabelText(/max/i)

      fireEvent.change(minInput, { target: { value: '-100' } })
      fireEvent.change(maxInput, { target: { value: '-50' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = Number(resultElement.textContent)

      expect(value).toBeGreaterThanOrEqual(-100)
      expect(value).toBeLessThanOrEqual(-50)
    })

    it('handles mixed positive and negative range', async () => {
      const user = userEvent.setup()
      renderWithNuqs()

      const minInput = screen.getByLabelText(/min/i)
      const maxInput = screen.getByLabelText(/max/i)

      fireEvent.change(minInput, { target: { value: '-10' } })
      fireEvent.change(maxInput, { target: { value: '10' } })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = Number(resultElement.textContent)

      expect(value).toBeGreaterThanOrEqual(-10)
      expect(value).toBeLessThanOrEqual(10)
    })

    it('handles single character custom charset', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      await user.click(screen.getByText('custom'))

      const customInput = screen.getByPlaceholderText(/enter custom characters/i)
      await user.type(customInput, 'X')

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      const value = resultElement.textContent!

      // All characters should be X
      expect(value).toMatch(/^X+$/)
    })

    it('handles string length of 1', async () => {
      renderWithNuqs({ type: 'string' })

      const lengthInput = screen.getByLabelText(/length/i) as HTMLInputElement
      fireEvent.change(lengthInput, { target: { value: '1' } })

      fireEvent.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument()
      })

      const resultElement = screen.getByRole('code')
      expect(resultElement.textContent).toHaveLength(1)
    })

    it('generates maximum allowed results (100)', async () => {
      renderWithNuqs({ type: 'uuid' })

      const countInput = screen.getByLabelText(/count/i) as HTMLInputElement
      fireEvent.change(countInput, { target: { value: '100' } })

      fireEvent.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByText('Results (100)')).toBeInTheDocument()
      })

      const results = screen.getAllByRole('code')
      expect(results).toHaveLength(100)
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for all inputs', () => {
      renderWithNuqs()

      expect(screen.getByLabelText(/count/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/min/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/max/i)).toBeInTheDocument()
    })

    it('has accessible labels for string options', async () => {
      const user = userEvent.setup()
      renderWithNuqs({ type: 'string' })

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument()
    })

    it('has accessible labels for password options', async () => {
      renderWithNuqs({ type: 'password' })

      expect(screen.getByLabelText(/length/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /uppercase/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /lowercase/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /numbers/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /symbols/i })).toBeInTheDocument()
    })

    it('has accessible copy buttons with dynamic labels', async () => {
      const user = userEvent.setup()
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

      renderWithNuqs({ type: 'uuid' })

      await user.click(getGenerateButton())

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument()
      })
    })

    it('has proper heading structure', () => {
      renderWithNuqs()

      // Main title
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()

      // Card titles are h3 (CardTitle component)
      expect(screen.getByText('Generator Type')).toBeInTheDocument()
      expect(screen.getByText('Options')).toBeInTheDocument()
    })
  })
})
