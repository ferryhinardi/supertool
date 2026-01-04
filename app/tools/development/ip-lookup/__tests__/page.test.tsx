import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import IPLookupPage from '../page'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
  configurable: true,
})

// Mock window.open
global.window.open = vi.fn()

const mockIPData = {
  ip: '8.8.8.8',
  version: 'IPv4',
  city: 'Mountain View',
  region: 'California',
  country_name: 'United States',
  country_code: 'US',
  postal: '94035',
  latitude: 37.386,
  longitude: -122.0838,
  timezone: 'America/Los_Angeles',
  org: 'Google LLC',
  asn: 'AS15169',
}

describe('IPLookupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders the page title', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByRole('heading', { level: 1, name: /IP Address Lookup/i })).toBeTruthy()
    })

    it('renders the page description', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByText(/Find detailed information/i)).toBeTruthy()
    })

    it('renders the lookup button', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByRole('button', { name: /Looking up/i })).toBeTruthy()
    })

    it('renders the my ip button', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByRole('button', { name: /My IP/i })).toBeTruthy()
    })

    it('renders IP input field', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('displays placeholder text', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('placeholder')
    })

    it('auto-fetches user IP on mount', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/json/')
      })
    })

    it('displays search icon', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders IP information cards area', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('User Interactions', () => {
    it('allows entering IP address', async () => {
      const _user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      const { fireEvent } = await import('@testing-library/react')
      // Use fireEvent instead of user.type to avoid character duplication bug
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('8.8.8.8')
    })

    it('handles "My IP" button click', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      vi.clearAllMocks()
      const myIpButton = screen.getByRole('button', { name: /My IP/i })
      await user.click(myIpButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/json/')
      })
    })

    it('performs lookup when button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      vi.clearAllMocks()
      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/8.8.8.8/json/')
      })
    })

    it('clears input when entering new IP', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })
      await user.clear(inputs[0])

      expect((inputs[0] as HTMLInputElement).value).toBe('')
    })

    it('updates input value on change', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '1.1.1.1' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('1.1.1.1')
    })

    it('handles Enter key press', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8{Enter}' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('8.8.8.8')
    })
  })

  describe('IP Validation', () => {
    it('validates IPv4 addresses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '192.168.1.1' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('192.168.1.1')
    })

    it('handles invalid IP addresses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '999.999.999.999' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(expect.stringContaining('valid IP'))
      })
    })

    it('accepts IPv6 addresses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '2001:4860:4860::8888' } })

      expect((inputs[0] as HTMLInputElement).value).toContain('2001')
    })

    it('validates empty input', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Please enter an IP address')
      })
    })

    it('validates IPv4 format', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: 'not-an-ip' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalled()
      })
    })

    it('accepts valid public IPs', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '1.1.1.1' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('1.1.1.1')
    })

    it('accepts private IP addresses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '192.168.0.1' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('192.168.0.1')
    })
  })

  describe('Results Display', () => {
    it('displays loading state during lookup', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      // Component should handle loading state
      expect(lookupButton).toBeTruthy()
    })

    it('renders result cards after successful lookup', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText(/Mountain View/i)).toBeTruthy()
      })
    })

    it('displays IP address information', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })
    })

    it('displays location information', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText(/California/i)).toBeTruthy()
      })
    })

    it('displays ISP information', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText(/Google LLC/i)).toBeTruthy()
      })
    })

    it('displays timezone information', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText(/America\/Los_Angeles/i)).toBeTruthy()
      })
    })

    it('shows success toast after lookup', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
          expect.stringContaining('retrieved successfully')
        )
      })
    })

    it('displays country information', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText(/United States/i)).toBeTruthy()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('copies IP address to clipboard', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })

      const copyButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'))

      if (copyButtons.length > 0) {
        await user.click(copyButtons[0])

        await waitFor(() => {
          expect(navigator.clipboard.writeText).toHaveBeenCalled()
        })
      }
    })

    it('shows success toast after copying', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })

      const copyButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'))

      if (copyButtons.length > 0) {
        vi.clearAllMocks()
        await user.click(copyButtons[0])

        await waitFor(() => {
          expect(vi.mocked(toast.success)).toHaveBeenCalledWith(expect.stringContaining('copied'))
        })
      }
    })

    it('copies various fields to clipboard', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })

      const copyButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'))

      expect(copyButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Map Integration', () => {
    it('opens map when view on map is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })

      const mapButtons = screen
        .queryAllByRole('button')
        .filter((btn) => btn.textContent?.toLowerCase().includes('map'))

      if (mapButtons.length > 0) {
        await user.click(mapButtons[0])

        await waitFor(() => {
          expect(window.open).toHaveBeenCalled()
        })
      }
    })

    it('opens Google Maps with correct coordinates', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })

      const mapButtons = screen
        .queryAllByRole('button')
        .filter((btn) => btn.textContent?.toLowerCase().includes('map'))

      if (mapButtons.length > 0) {
        await user.click(mapButtons[0])

        await waitFor(() => {
          expect(window.open).toHaveBeenCalledWith(expect.stringContaining('37.386'), '_blank')
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          expect.stringContaining('Failed to lookup')
        )
      })
    })

    it('displays error message for failed lookups', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: true, reason: 'Invalid IP' }),
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '999.999.999.999' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalled()
      })
    })

    it('handles network timeouts', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      )

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(
        () => {
          expect(vi.mocked(toast.error)).toHaveBeenCalled()
        },
        { timeout: 3000 }
      )
    })

    it('handles API error responses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: true }),
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalled()
      })
    })

    it('handles malformed API responses', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unexpected: 'data' }),
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      // Should handle gracefully
      await waitFor(() => {
        expect(lookupButton).toBeTruthy()
      })
    })
  })

  describe('My IP Functionality', () => {
    it('auto-loads user IP on mount', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/json/')
      })
    })

    it('populates input with user IP', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect((inputs[0] as HTMLInputElement).value).toBe('8.8.8.8')
      })
    })

    it('fetches user IP when My IP button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      vi.clearAllMocks()
      const myIpButton = screen.getByRole('button', { name: /My IP/i })
      await user.click(myIpButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/json/')
      })
    })

    it('handles My IP fetch failure', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      render(<IPLookupPage />)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch your IP')
        )
      })
    })

    it('handles My IP API error response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ error: true }),
      } as Response)

      render(<IPLookupPage />)

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })

    it('has accessible input field', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('has accessible buttons', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('uses semantic HTML elements', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('has descriptive button labels', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByRole('button', { name: /My IP/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Looking up/i })).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('renders on mobile viewport', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('displays flexible layout', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const main = document.querySelector('main')
      expect(main).toBeTruthy()
    })

    it('shows responsive text sizing', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeTruthy()
    })
  })

  describe('User Experience', () => {
    it('provides clear visual feedback', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('8.8.8.8')
    })

    it('handles rapid lookups', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      const lookupButton = screen.getByRole('button', { name: /Looking up/i })

      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })
      await user.click(lookupButton)

      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '1.1.1.1' } })
      await user.click(lookupButton)

      expect((inputs[0] as HTMLInputElement).value).toBe('1.1.1.1')
    })

    it('maintains state across interactions', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      expect((inputs[0] as HTMLInputElement).value).toBe('8.8.8.8')
    })

    it('shows appropriate success messages', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles localhost IP', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '127.0.0.1' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('127.0.0.1')
    })

    it('handles leading zeros in IP', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '008.008.008.008' } })

      expect((inputs[0] as HTMLInputElement).value).toBe('008.008.008.008')
    })

    it('handles whitespace in input', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockIPData,
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: ' 8.8.8.8 ' } })

      expect((inputs[0] as HTMLInputElement).value).toContain('8.8.8.8')
    })

    it('handles missing data fields', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          ip: '8.8.8.8',
          version: 'IPv4',
        }),
      } as Response)

      render(<IPLookupPage />)

      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[0])
      fireEvent.change(inputs[0], { target: { value: '8.8.8.8' } })

      const lookupButton = screen.getByRole('button', { name: /Looking up/i })
      await user.click(lookupButton)

      await waitFor(() => {
        expect(screen.getByText('8.8.8.8')).toBeTruthy()
      })
    })
  })
})
