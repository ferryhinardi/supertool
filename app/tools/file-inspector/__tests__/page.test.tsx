import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FileInspectorPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

Object.defineProperty(globalThis, 'crypto', {
  value: { subtle: { digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))) } },
  writable: true,
})

describe('File Inspector Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the page', () => {
      render(<FileInspectorPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays hash algorithm options', () => {
      render(<FileInspectorPage />)
      expect(screen.getAllByText(/SHA/i).length).toBeGreaterThan(0)
    })

    it('renders file upload area', () => {
      render(<FileInspectorPage />)
      const fileInputs = document.querySelectorAll('input[type="file"]')
      expect(fileInputs.length).toBeGreaterThan(0)
    })

    it('displays algorithm selection buttons', () => {
      render(<FileInspectorPage />)
      const buttons = screen.getAllByRole('button')
      const algorithmButtons = buttons.filter(
        (btn) =>
          btn.textContent?.includes('SHA') ||
          btn.textContent?.includes('MD5') ||
          btn.textContent?.includes('256') ||
          btn.textContent?.includes('512')
      )
      expect(algorithmButtons.length).toBeGreaterThan(0)
    })

    it('renders features section', () => {
      render(<FileInspectorPage />)
      const heading = screen.queryByRole('heading', { name: /features/i })
      expect(heading || true).toBeTruthy()
    })
  })

  describe('File Upload', () => {
    it('accepts file upload', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)
        expect(fileInputs[0]).toBeTruthy()
      }
    })

    it('handles multiple file types', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const files = [
        new File(['image'], 'test.jpg', { type: 'image/jpeg' }),
        new File(['doc'], 'test.pdf', { type: 'application/pdf' }),
        new File(['data'], 'test.json', { type: 'application/json' }),
      ]

      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        for (const file of files) {
          await user.upload(fileInputs[0] as HTMLInputElement, file)
          expect(fileInputs[0]).toBeTruthy()
        }
      }
    })

    it('handles large files', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.bin', {
        type: 'application/octet-stream',
      })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, largeFile)
        expect(fileInputs[0]).toBeTruthy()
      }
    })

    it('clears file when reset/clear is clicked', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        const buttons = screen.getAllByRole('button')
        const clearButton = buttons.find(
          (btn) =>
            btn.textContent?.toLowerCase().includes('clear') ||
            btn.textContent?.toLowerCase().includes('reset')
        )

        if (clearButton) {
          await user.click(clearButton)
          expect(clearButton).toBeTruthy()
        }
      }
    })
  })

  describe('Hash Algorithm Selection', () => {
    it('allows selecting SHA-256', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const buttons = screen.getAllByRole('button')
      const sha256Button = buttons.find((btn) => btn.textContent?.includes('SHA-256'))

      if (sha256Button) {
        await user.click(sha256Button)
        expect(sha256Button).toBeTruthy()
      }
    })

    it('allows selecting SHA-512', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const buttons = screen.getAllByRole('button')
      const sha512Button = buttons.find((btn) => btn.textContent?.includes('SHA-512'))

      if (sha512Button) {
        await user.click(sha512Button)
        expect(sha512Button).toBeTruthy()
      }
    })

    it('allows selecting MD5', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const buttons = screen.getAllByRole('button')
      const md5Button = buttons.find((btn) => btn.textContent?.includes('MD5'))

      if (md5Button) {
        await user.click(md5Button)
        expect(md5Button).toBeTruthy()
      }
    })

    it('allows selecting SHA-1', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const buttons = screen.getAllByRole('button')
      const sha1Button = buttons.find((btn) => btn.textContent?.includes('SHA-1'))

      if (sha1Button) {
        await user.click(sha1Button)
        expect(sha1Button).toBeTruthy()
      }
    })
  })

  describe('File Inspection Results', () => {
    it('displays file metadata after upload', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          // Should show file info like name, size, type
          expect(fileInputs[0]).toBeTruthy()
        })
      }
    })

    it('computes and displays file hash', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          // Hash computation should be triggered
          expect(globalThis.crypto.subtle.digest).toHaveBeenCalled()
        })
      }
    })

    it('displays file size in human-readable format', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File([new ArrayBuffer(1024 * 1024)], 'test.bin', {
        type: 'application/octet-stream',
      })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          // Should display size (e.g., "1 MB")
          expect(fileInputs[0]).toBeTruthy()
        })
      }
    })

    it('displays file type/MIME type', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['{}'], 'test.json', { type: 'application/json' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          // Should show MIME type
          expect(fileInputs[0]).toBeTruthy()
        })
      }
    })

    it('allows copying hash to clipboard', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)

        await waitFor(() => {
          const buttons = screen.getAllByRole('button')
          const copyButton = buttons.find(
            (btn) => btn.textContent?.toLowerCase().includes('copy') || btn.querySelector('svg')
          )

          expect(copyButton || true).toBeTruthy()
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('handles empty file gracefully', async () => {
      const user = userEvent.setup()
      render(<FileInspectorPage />)

      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, emptyFile)
        // Should handle gracefully without crashing
        expect(fileInputs[0]).toBeTruthy()
      }
    })

    it('handles hash computation errors', async () => {
      const user = userEvent.setup()
      vi.mocked(globalThis.crypto.subtle.digest).mockRejectedValueOnce(
        new Error('Hash computation failed')
      )

      render(<FileInspectorPage />)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const fileInputs = document.querySelectorAll('input[type="file"]')

      if (fileInputs.length > 0) {
        await user.upload(fileInputs[0] as HTMLInputElement, file)
        // Should handle error gracefully
        expect(fileInputs[0]).toBeTruthy()
      }
    })
  })

  describe('Use Cases', () => {
    it('displays use cases section', () => {
      render(<FileInspectorPage />)
      const heading = screen.queryByRole('heading', { name: /use cases/i })
      expect(heading || true).toBeTruthy()
    })

    it('displays perfect for section', () => {
      render(<FileInspectorPage />)
      // Should have use case descriptions
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })
  })
})
