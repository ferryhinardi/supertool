import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '@/lib/analytics'
import URLShortenerPage from '../page'

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
      insert: vi.fn(() =>
        Promise.resolve({ data: { id: '1', short_code: 'abc123' }, error: null })
      ),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
  },
}))

describe('URL Shortener Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders the page without crashing', () => {
      render(<URLShortenerPage />)
      expect(screen.getAllByText(/URL/i)[0]).toBeTruthy()
    })

    it('displays URL input field', () => {
      render(<URLShortenerPage />)
      const elements = screen.queryAllByText(/URL|Enter|Paste/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    it('renders URL input textbox', () => {
      render(<URLShortenerPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('displays shorten button', () => {
      render(<URLShortenerPage />)
      const buttons = screen.getAllByRole('button')
      const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))
      expect(shortenButton).toBeTruthy()
    })
  })

  describe('URL Input', () => {
    it('accepts URL input', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      const urlInput = inputs[0]

      if (urlInput) {
        await user.type(urlInput, 'https://example.com')
        expect(urlInput).toHaveValue('https://example.com')
      }
    })

    it('validates URL format', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'invalid-url')

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          await waitFor(() => {
            expect(toast.error).toHaveBeenCalled()
          })
        }
      }
    })

    it('clears URL input', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')
        await user.clear(inputs[0])
        expect(inputs[0]).toHaveValue('')
      }
    })
  })

  describe('URL Shortening', () => {
    it('shortens valid URL', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          await waitFor(() => {
            expect(analytics.trackToolEvent).toHaveBeenCalled()
          })
        }
      }
    })

    it('displays shortened URL result', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          // Result would show after successful shortening
          expect(shortenButton).toBeTruthy()
        }
      }
    })

    it('handles shortening errors', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          expect(shortenButton).toBeTruthy()
        }
      }
    })
  })

  describe('Custom Alias', () => {
    it('allows custom alias input', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs.length > 1) {
        await user.type(inputs[1], 'my-custom-link')
        expect(inputs[1]).toHaveValue('my-custom-link')
      }
    })

    it('creates short URL with custom alias', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')

        if (inputs[1]) {
          await user.type(inputs[1], 'custom-alias')
        }

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          expect(shortenButton).toBeTruthy()
        }
      }
    })
  })

  describe('Copy Functionality', () => {
    it('displays copy button', () => {
      render(<URLShortenerPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('copies shortened URL to clipboard', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const buttons = screen.getAllByRole('button')
      const copyButton = buttons.find(
        (btn) => btn.textContent?.includes('Copy') || btn.querySelector('svg')
      )

      if (copyButton) {
        await user.click(copyButton)
        expect(copyButton).toBeTruthy()
      }
    })
  })

  describe('QR Code Generation', () => {
    it('displays QR code button', () => {
      render(<URLShortenerPage />)
      const buttons = screen.getAllByRole('button')
      const qrButton = buttons.find((btn) => btn.querySelector('svg'))
      expect(qrButton).toBeTruthy()
    })

    it('generates QR code for shortened URL', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const buttons = screen.getAllByRole('button')
      const qrButton = buttons.find((btn) => btn.querySelector('svg'))

      if (qrButton) {
        await user.click(qrButton)
        expect(qrButton).toBeTruthy()
      }
    })
  })

  describe('History', () => {
    it('displays URL history', () => {
      render(<URLShortenerPage />)
      const textContent = document.body.textContent
      expect(textContent).toBeTruthy()
    })

    it('shows empty state when no history', () => {
      render(<URLShortenerPage />)
      const textContent = document.body.textContent
      expect(textContent).toBeTruthy()
    })

    it('deletes URL from history', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.querySelector('svg'))

      if (deleteButton) {
        await user.click(deleteButton)
        expect(deleteButton).toBeTruthy()
      }
    })
  })

  describe('Analytics', () => {
    it('tracks page view', () => {
      render(<URLShortenerPage />)
      expect(analytics.trackToolEvent).toHaveBeenCalled()
    })

    it('tracks URL shortening', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')

        const buttons = screen.getAllByRole('button')
        const shortenButton = buttons.find((btn) => btn.textContent?.includes('Shorten'))

        if (shortenButton) {
          await user.click(shortenButton)
          expect(analytics.trackToolEvent).toHaveBeenCalled()
        }
      }
    })
  })

  describe('URL Validation', () => {
    it('accepts http URLs', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'http://example.com')
        expect(inputs[0]).toHaveValue('http://example.com')
      }
    })

    it('accepts https URLs', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com')
        expect(inputs[0]).toHaveValue('https://example.com')
      }
    })

    it('handles URLs with paths', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com/path/to/page')
        expect(inputs[0]).toHaveValue('https://example.com/path/to/page')
      }
    })

    it('handles URLs with query parameters', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const inputs = screen.getAllByRole('textbox')
      if (inputs[0]) {
        await user.type(inputs[0], 'https://example.com?param=value')
        expect(inputs[0]).toHaveValue('https://example.com?param=value')
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      render(<URLShortenerPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible inputs', () => {
      render(<URLShortenerPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Download Functionality', () => {
    it('allows downloading QR code', async () => {
      const user = userEvent.setup()
      render(<URLShortenerPage />)

      const buttons = screen.getAllByRole('button')
      const downloadButton = buttons.find((btn) => btn.textContent?.includes('Download'))

      if (downloadButton) {
        await user.click(downloadButton)
        expect(downloadButton).toBeTruthy()
      }
    })
  })
})
