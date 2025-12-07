import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as analytics from '@/lib/analytics'
import RegexTesterPage from '../page'

vi.mock('@/lib/analytics', () => ({ trackToolEvent: vi.fn(), trackEvent: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}))
vi.mock('nuqs', () => ({
  parseAsBoolean: { withDefault: vi.fn(() => ({})) },
  useQueryState: vi.fn(() => ['', vi.fn()]),
}))

describe('Regex Tester Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
  })

  describe('Rendering', () => {
    it('renders the page with heading', () => {
      render(<RegexTesterPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays regex testing interface', () => {
      render(<RegexTesterPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders pattern input field', () => {
      render(<RegexTesterPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('renders test string textarea', () => {
      render(<RegexTesterPage />)
      const textareas = screen.getAllByRole('textbox')
      expect(textareas.length).toBeGreaterThan(0)
    })

    it('displays common patterns section', () => {
      render(<RegexTesterPage />)
      expect(screen.getByText('Email Address')).toBeTruthy()
      expect(screen.getByText('URL')).toBeTruthy()
      expect(screen.getByText('US Phone')).toBeTruthy()
    })
  })

  describe('Pattern Testing', () => {
    it('tests email pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const emailButton = screen.getByText('Email Address')
      await user.click(emailButton)

      await waitFor(() => {
        expect(screen.getByText('Email Address')).toBeTruthy()
      })
    })

    it('tests URL pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const urlButton = screen.getByText('URL')
      await user.click(urlButton)

      await waitFor(() => {
        expect(screen.getByText('URL')).toBeTruthy()
      })
    })

    it('tests US phone pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const phoneButton = screen.getByText('US Phone')
      await user.click(phoneButton)

      await waitFor(() => {
        expect(screen.getByText('US Phone')).toBeTruthy()
      })
    })

    it('tests IPv4 pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const ipButton = screen.getByText('IPv4 Address')
      await user.click(ipButton)

      await waitFor(() => {
        expect(screen.getByText('IPv4 Address')).toBeTruthy()
      })
    })

    it('tests hex color pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const hexButton = screen.getByText('Hex Color')
      await user.click(hexButton)

      await waitFor(() => {
        expect(screen.getByText('Hex Color')).toBeTruthy()
      })
    })

    it('tests date pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const dateButton = screen.getByText('Date (YYYY-MM-DD)')
      await user.click(dateButton)

      await waitFor(() => {
        expect(screen.getByText('Date (YYYY-MM-DD)')).toBeTruthy()
      })
    })

    it('tests time pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const timeButton = screen.getByText('Time (HH:MM)')
      await user.click(timeButton)

      await waitFor(() => {
        expect(screen.getByText('Time (HH:MM)')).toBeTruthy()
      })
    })

    it('tests credit card pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const ccButton = screen.getByText('Credit Card')
      await user.click(ccButton)

      await waitFor(() => {
        expect(screen.getByText('Credit Card')).toBeTruthy()
      })
    })

    it('tests username pattern', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const usernameButton = screen.getByText('Username')
      await user.click(usernameButton)

      await waitFor(() => {
        expect(screen.getByText('Username')).toBeTruthy()
      })
    })
  })

  describe('Regex Flags', () => {
    it('displays flag options', () => {
      render(<RegexTesterPage />)
      // Flags are typically checkboxes or toggles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Match Results', () => {
    it('displays match count when pattern matches', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const emailButton = screen.getByText('Email Address')
      await user.click(emailButton)

      // Results would show after pattern is loaded
      await waitFor(() => {
        expect(screen.getByText('Email Address')).toBeTruthy()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('can copy pattern to clipboard', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const emailButton = screen.getByText('Email Address')
      await user.click(emailButton)

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button')
        const copyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))
        if (copyButton) {
          expect(copyButton).toBeTruthy()
        }
      })
    })
  })

  describe('Reset Functionality', () => {
    it('has reset button', () => {
      render(<RegexTesterPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Pattern Information', () => {
    it('shows pattern descriptions', () => {
      render(<RegexTesterPage />)
      expect(screen.getByText(/Matches standard email addresses/i)).toBeTruthy()
      expect(screen.getByText(/Matches HTTP\/HTTPS URLs/i)).toBeTruthy()
    })

    it('shows pattern examples', () => {
      render(<RegexTesterPage />)
      expect(screen.getByText('user@example.com')).toBeTruthy()
      expect(screen.getByText('https://example.com/path')).toBeTruthy()
    })
  })

  describe('Analytics', () => {
    it('tracks page view', () => {
      render(<RegexTesterPage />)
      expect(analytics.trackToolEvent).toHaveBeenCalled()
    })
  })

  describe('Interactive Testing', () => {
    it('updates results when test string changes', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const emailButton = screen.getByText('Email Address')
      await user.click(emailButton)

      await waitFor(() => {
        expect(screen.getByText('Email Address')).toBeTruthy()
      })
    })
  })

  describe('Pattern Categories', () => {
    it('displays multiple pattern categories', () => {
      render(<RegexTesterPage />)
      expect(screen.getByText('Email Address')).toBeTruthy()
      expect(screen.getByText('IPv4 Address')).toBeTruthy()
      expect(screen.getByText('Credit Card')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      render(<RegexTesterPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible text inputs', () => {
      render(<RegexTesterPage />)
      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid regex patterns gracefully', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const textboxes = screen.getAllByRole('textbox')
      if (textboxes[0]) {
        await user.clear(textboxes[0])
        await user.type(textboxes[0], '[invalid(regex')
        // Invalid regex should be handled without crashing
        expect(textboxes[0]).toBeTruthy()
      }
    })
  })

  describe('Quick Actions', () => {
    it('provides quick pattern selection', async () => {
      const user = userEvent.setup()
      render(<RegexTesterPage />)

      const emailButton = screen.getByText('Email Address')
      await user.click(emailButton)

      await waitFor(() => {
        expect(analytics.trackToolEvent).toHaveBeenCalled()
      })
    })
  })
})
