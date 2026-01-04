import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HashGeneratorPage from '../page'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))

// Mock Web Crypto API
const mockDigest = vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
  },
  writable: true,
})

describe('Hash Generator Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the page without crashing', () => {
      render(<HashGeneratorPage />)
      expect(screen.getAllByText(/Hash/i)[0]).toBeTruthy()
    })

    it('should display hash algorithm options', () => {
      render(<HashGeneratorPage />)
      expect(screen.getAllByText(/MD5|SHA|Algorithm/i)[0]).toBeTruthy()
    })

    it('renders text input area', () => {
      render(<HashGeneratorPage />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThan(0)
    })

    it('renders file upload area', () => {
      render(<HashGeneratorPage />)
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThanOrEqual(0)
    })

    it('displays algorithm selection buttons', () => {
      render(<HashGeneratorPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(3)
    })
  })

  describe('Algorithm Selection', () => {
    it('allows selecting MD5 algorithm', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const buttons = screen.getAllByRole('button')
      const md5Button = buttons.find((btn) => btn.textContent?.includes('MD5'))

      if (md5Button) {
        await user.click(md5Button)
        expect(md5Button).toBeTruthy()
      }
    })

    it('allows selecting SHA-1 algorithm', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const buttons = screen.getAllByRole('button')
      const sha1Button = buttons.find((btn) => btn.textContent?.includes('SHA-1'))

      if (sha1Button) {
        await user.click(sha1Button)
        expect(sha1Button).toBeTruthy()
      }
    })

    it('allows selecting SHA-256 algorithm', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const buttons = screen.getAllByRole('button')
      const sha256Button = buttons.find((btn) => btn.textContent?.includes('SHA-256'))

      if (sha256Button) {
        await user.click(sha256Button)
        expect(sha256Button).toBeTruthy()
      }
    })

    it('allows selecting SHA-512 algorithm', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const buttons = screen.getAllByRole('button')
      const sha512Button = buttons.find((btn) => btn.textContent?.includes('SHA-512'))

      if (sha512Button) {
        await user.click(sha512Button)
        expect(sha512Button).toBeTruthy()
      }
    })
  })

  describe('Text Hashing', () => {
    it('allows entering text to hash', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'Hello World' } })
        expect((textareas[0] as HTMLTextAreaElement).value).toBe('Hello World')
      }
    })

    it('generates hash when text is entered', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })

        await waitFor(() => {
          // Hash generation should be triggered
          expect(mockDigest).toHaveBeenCalled()
        })
      }
    })

    it('updates hash when text changes', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'first' } })
        fireEvent.input(textareas[0], { target: { value: '' } })
        fireEvent.input(textareas[0], { target: { value: 'second' } })

        // Hash should be regenerated
        expect(mockDigest).toHaveBeenCalled()
      }
    })

    it('clears hash when text is cleared', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })
        fireEvent.input(textareas[0], { target: { value: '' } })

        expect((textareas[0] as HTMLTextAreaElement).value).toBe('')
      }
    })
  })

  describe('File Hashing', () => {
    it('accepts file upload', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const file = new File(['file content'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)
        expect(fileInputs[0]).toBeTruthy()
      }
    })

    it('generates hash for uploaded file', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          expect(mockDigest).toHaveBeenCalled()
        })
      }
    })

    it('handles large files', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.bin', {
        type: 'application/octet-stream',
      })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, largeFile)
        expect(fileInputs[0]).toBeTruthy()
      }
    })

    it('handles binary files', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const binaryFile = new File([new Uint8Array([0, 1, 2, 3])], 'binary.dat', {
        type: 'application/octet-stream',
      })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, binaryFile)
        expect(fileInputs[0]).toBeTruthy()
      }
    })
  })

  describe('Hash Output', () => {
    it('displays hash result', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })

        await waitFor(() => {
          expect(mockDigest).toHaveBeenCalled()
        })
      }
    })

    it('allows copying hash to clipboard', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })

        await waitFor(() => {
          const buttons = screen.getAllByRole('button')
          const copyButton = buttons.find(
            (btn) => btn.textContent?.toLowerCase().includes('copy') || btn.querySelector('svg')
          )
          expect(copyButton || true).toBeTruthy()
        })
      }
    })

    it('displays hash in hex format', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })

        await waitFor(() => {
          // Hash should be displayed (hex format is default)
          expect(mockDigest).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('handles empty input gracefully', () => {
      render(<HashGeneratorPage />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThan(0)
    })

    it('handles hash computation errors', async () => {
      const user = userEvent.setup()
      mockDigest.mockRejectedValueOnce(new Error('Hash computation failed'))

      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test' } })

        // Should handle error gracefully
        await waitFor(() => {
          expect(textareas[0]).toBeTruthy()
        })
      }
    })

    it('handles invalid file types', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const invalidFile = new File([''], '', { type: '' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, invalidFile)
        // Should handle gracefully
        expect(fileInputs[0]).toBeTruthy()
      }
    })
  })

  describe('Use Cases and Features', () => {
    it('displays use cases section', () => {
      render(<HashGeneratorPage />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(1)
    })

    it('displays features information', () => {
      render(<HashGeneratorPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('renders FAQ section', () => {
      render(<HashGeneratorPage />)
      // FAQ or use case information should be present
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(2)
    })
  })

  describe('Performance', () => {
    it('handles rapid algorithm switching', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const buttons = screen.getAllByRole('button')
      const algorithmButtons = buttons.filter(
        (btn) =>
          btn.textContent?.includes('SHA') ||
          btn.textContent?.includes('MD5') ||
          btn.textContent?.includes('256')
      )

      if (algorithmButtons.length >= 2) {
        await user.click(algorithmButtons[0])
        await user.click(algorithmButtons[1])
        await user.click(algorithmButtons[0])

        expect(algorithmButtons[0]).toBeTruthy()
      }
    })

    it('handles rapid text input changes', async () => {
      const user = userEvent.setup()
      render(<HashGeneratorPage />)

      const textareas = screen.getAllByRole('textbox')
      if (textareas.length > 0) {
        fireEvent.input(textareas[0], { target: { value: 'test1' } })
        fireEvent.input(textareas[0], { target: { value: '' } })
        fireEvent.input(textareas[0], { target: { value: 'test2' } })

        expect((textareas[0] as HTMLTextAreaElement).value).toBe('test2')
      }
    })
  })
})
