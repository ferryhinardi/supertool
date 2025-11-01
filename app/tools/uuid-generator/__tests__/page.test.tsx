import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import UUIDGeneratorPage from '../page'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
}

// Mock crypto.randomUUID - use type assertion for vi.fn
const mockRandomUUID = vi.fn(() => '550e8400-e29b-41d4-a716-446655440000')

describe('UUID Generator Page', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    })

    // Type assertion for crypto mock
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        ...globalThis.crypto,
        randomUUID: mockRandomUUID as typeof crypto.randomUUID,
      },
      writable: true,
      configurable: true,
    })
    mockClipboard.writeText.mockResolvedValue(undefined)
  })

  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByText('UUID Generator & Validator')).toBeInTheDocument()
    })

    it('renders the description', () => {
      render(<UUIDGeneratorPage />)
      expect(
        screen.getByText(/Generate unique identifiers \(v1-v5\) with bulk generation support/)
      ).toBeInTheDocument()
    })

    it('generates an initial UUID on mount', () => {
      render(<UUIDGeneratorPage />)
      const input = screen.getByDisplayValue('550e8400-e29b-41d4-a716-446655440000')
      expect(input).toBeInTheDocument()
    })

    it('renders all three cards: generator, bulk, and validator', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByText('Generate UUID')).toBeInTheDocument()
      expect(screen.getByText('Bulk UUID Generation')).toBeInTheDocument()
      expect(screen.getByText('UUID Validator')).toBeInTheDocument()
    })
  })

  describe('Single UUID Generation', () => {
    it('generates a new UUID when Generate button is clicked', async () => {
      mockRandomUUID
        .mockReturnValueOnce('550e8400-e29b-41d4-a716-446655440000')
        .mockReturnValueOnce('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

      render(<UUIDGeneratorPage />)

      const generateButtons = screen.getAllByRole('button', { name: /Generate/i })
      await userEvent.click(generateButtons[0])

      await waitFor(() => {
        const input = screen.getByDisplayValue('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
        expect(input).toBeInTheDocument()
      })
    })

    it('copies UUID to clipboard when Copy button is clicked', async () => {
      mockRandomUUID.mockReturnValueOnce('550e8400-e29b-41d4-a716-446655440000')

      render(<UUIDGeneratorPage />)

      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      await userEvent.click(copyButtons[0])

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000')
      })
    })

    it('shows "Copied" state after successful copy', async () => {
      render(<UUIDGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText('Copied')).toBeInTheDocument()
      })
    })
  })

  describe('Bulk UUID Generation', () => {
    it('renders bulk generation input with default value of 10', () => {
      render(<UUIDGeneratorPage />)
      const input = screen.getByLabelText('Number of UUIDs') as HTMLInputElement
      expect(input).toHaveValue(10)
    })

    it('allows changing the number of UUIDs to generate', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs') as HTMLInputElement
      fireEvent.change(input, { target: { value: '25' } })

      await waitFor(() => {
        expect(input).toHaveValue(25)
      })
    })

    it('generates multiple UUIDs when Generate button is clicked', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs')
      fireEvent.change(input, { target: { value: '5' } })

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText('5 UUIDs Generated')).toBeInTheDocument()
      })
    })

    it('validates bulk count is between 1 and 100', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs')
      fireEvent.change(input, { target: { value: '150' } })

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      // Should not generate more than 100
      expect(screen.queryByText('150 UUIDs Generated')).not.toBeInTheDocument()
    })

    it('shows error for invalid bulk count (less than 1)', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs')
      fireEvent.change(input, { target: { value: '0' } })

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      // Should not generate
      expect(screen.queryByText('0 UUIDs Generated')).not.toBeInTheDocument()
    })

    it('displays generated UUIDs in textarea', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs')
      fireEvent.change(input, { target: { value: '3' } })

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          // Check that 3 UUIDs were generated by checking for the success message
          expect(screen.getByText('3 UUIDs Generated')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      // Find the bulk textarea (it should have multiple lines)
      const textareas = screen.getAllByRole('textbox')
      const bulkTextarea = textareas.find((textarea) => {
        const value = (textarea as HTMLTextAreaElement).value
        // Bulk textarea should be longer (contains multiple UUIDs)
        return value.length > 50
      })

      expect(bulkTextarea).toBeInTheDocument()
      // Verify there are UUIDs in the textarea (UUID pattern check)
      const value = (bulkTextarea as HTMLTextAreaElement).value
      const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
      const matches = value.match(uuidPattern)
      expect(matches).not.toBeNull()
      expect(matches?.length).toBeGreaterThanOrEqual(3)
    })

    it('shows loading state during bulk generation', async () => {
      render(<UUIDGeneratorPage />)

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })

    it('copies all bulk UUIDs when Copy All button is clicked', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByLabelText('Number of UUIDs')
      fireEvent.change(input, { target: { value: '2' } })

      const generateButton = screen.getAllByRole('button', { name: /Generate/i })[1]
      await userEvent.click(generateButton)

      await waitFor(
        () => {
          expect(screen.getByText('2 UUIDs Generated')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )

      const copyAllButton = screen.getByRole('button', { name: /Copy All/i })
      await userEvent.click(copyAllButton)

      await waitFor(() => {
        // Check that clipboard was called
        expect(mockClipboard.writeText).toHaveBeenCalled()
        // Check that it was called with a string containing newlines (multiple UUIDs)
        const callArg = mockClipboard.writeText.mock.calls[0][0]
        expect(callArg).toContain('\n')
        expect(callArg.split('\n')).toHaveLength(2)
      })
    })
  })

  describe('UUID Validation', () => {
    it('validates a correct UUID v4', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)
      fireEvent.change(input, { target: { value: '550e8400-e29b-41d4-a716-446655440000' } })

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      await userEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('Valid UUID')).toBeInTheDocument()
        expect(screen.getByText('Version: 4')).toBeInTheDocument()
      })
    })

    it('validates a correct UUID v1', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)
      fireEvent.change(input, { target: { value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' } })

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      await userEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('Valid UUID')).toBeInTheDocument()
        expect(screen.getByText('Version: 1')).toBeInTheDocument()
      })
    })

    it('shows error for invalid UUID format', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)
      fireEvent.change(input, { target: { value: 'invalid-uuid' } })

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      await userEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid UUID')).toBeInTheDocument()
        expect(screen.getByText('Invalid UUID format')).toBeInTheDocument()
      })
    })

    it('shows error for empty UUID input', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)

      // First add some text
      fireEvent.change(input, { target: { value: '   ' } })

      const validateButton = screen.getByRole('button', { name: /Validate/i })

      // Button should be disabled for whitespace-only input
      expect(validateButton).toBeDisabled()
    })

    it('trims whitespace from UUID input before validation', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)
      fireEvent.change(input, {
        target: { value: '  550e8400-e29b-41d4-a716-446655440000  ' },
      })

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      await userEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('Valid UUID')).toBeInTheDocument()
      })
    })

    it('clears validation result when input changes', async () => {
      render(<UUIDGeneratorPage />)

      const input = screen.getByPlaceholderText(/Enter UUID to validate/)
      fireEvent.change(input, { target: { value: '550e8400-e29b-41d4-a716-446655440000' } })

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      await userEvent.click(validateButton)

      await waitFor(() => {
        expect(screen.getByText('Valid UUID')).toBeInTheDocument()
      })

      // Change input
      fireEvent.change(input, { target: { value: 'new-input' } })

      await waitFor(() => {
        expect(screen.queryByText('Valid UUID')).not.toBeInTheDocument()
      })
    })

    it('disables validate button when input is empty', () => {
      render(<UUIDGeneratorPage />)

      const validateButton = screen.getByRole('button', { name: /Validate/i })
      expect(validateButton).toBeDisabled()
    })
  })

  describe('UUID Information Card', () => {
    it('displays UUID information section', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByText('UUID Information')).toBeInTheDocument()
    })

    it('displays information about UUID versions', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByText(/UUID v1:/)).toBeInTheDocument()
      expect(screen.getByText(/UUID v4:/)).toBeInTheDocument()
      expect(screen.getByText(/UUID v5:/)).toBeInTheDocument()
    })
  })

  describe('Clipboard Fallback', () => {
    it('uses fallback method when clipboard API is not available', async () => {
      // Mock clipboard as undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // Mock execCommand
      document.execCommand = vi.fn(() => true)

      render(<UUIDGeneratorPage />)

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<UUIDGeneratorPage />)
      const heading = screen.getByText('UUID Generator & Validator')
      expect(heading.tagName).toBe('H1')
    })

    it('has labels for form inputs', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByLabelText('Number of UUIDs')).toBeInTheDocument()
    })

    it('has placeholder text for inputs', () => {
      render(<UUIDGeneratorPage />)
      expect(screen.getByPlaceholderText(/Enter UUID to validate/)).toBeInTheDocument()
    })
  })
})
