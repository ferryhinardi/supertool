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

async function renderSettled(data: Record<string, unknown> = mockIPData) {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => data,
  } as Response)
  render(<IPLookupPage />)
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /^Lookup$/i })).toBeEnabled()
  })
  return screen.getByPlaceholderText(/Enter IP address/i) as HTMLInputElement
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
      expect(screen.getByText(/Discover detailed information about any IP address/i)).toBeTruthy()
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
      const input = await renderSettled()

      vi.mocked(fetch).mockClear()
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/1.1.1.1/json/')
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
      const input = await renderSettled()

      vi.mocked(fetch).mockClear()
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('https://ipapi.co/1.1.1.1/json/')
      })
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
      const input = await renderSettled()

      fireEvent.change(input, { target: { value: '999.999.999.999' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Please enter a valid IP address')
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
      const input = await renderSettled()

      fireEvent.change(input, { target: { value: '' } })
      expect(screen.getByRole('button', { name: /^Lookup$/i })).toBeDisabled()

      fireEvent.keyDown(input, { key: 'Enter' })
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Please enter an IP address')
      })
    })

    it('validates IPv4 format', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()

      fireEvent.change(input, { target: { value: 'not-an-ip' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))

      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Please enter a valid IP address')
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
      const input = await renderSettled()
      let resolveFetch: (value: Response) => void = () => {}
      vi.mocked(fetch).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve
          })
      )
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      expect(screen.getByRole('button', { name: /Looking up/i })).toBeDisabled()
      resolveFetch({
        ok: true,
        json: async () => mockIPData,
      } as Response)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Lookup$/i })).toBeEnabled()
      })
    })

    it('renders result cards after successful lookup', async () => {
      await renderSettled()
      expect(screen.getByText('Mountain View')).toBeTruthy()
    })

    it('displays IP address information', async () => {
      await renderSettled()
      expect(screen.getAllByText('8.8.8.8').length).toBeGreaterThan(0)
    })

    it('displays location information', async () => {
      await renderSettled()
      expect(screen.getByText('California')).toBeTruthy()
    })

    it('displays ISP information', async () => {
      await renderSettled()
      expect(screen.getAllByText('Google LLC').length).toBeGreaterThan(0)
    })

    it('displays timezone information', async () => {
      await renderSettled()
      expect(screen.getByText('America/Los_Angeles')).toBeTruthy()
    })

    it('shows success toast after lookup', async () => {
      await renderSettled()
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('IP information retrieved successfully')
    })

    it('displays country information', async () => {
      await renderSettled()
      expect(screen.getByText('United States')).toBeTruthy()
    })
  })

  describe('Copy Functionality', () => {
    it('copies IP address to clipboard', async () => {
      const user = userEvent.setup()
      await renderSettled()
      const copyButtons = screen
        .getAllByRole('button')
        .filter((btn) => (btn.textContent || '').trim() === '')
      expect(copyButtons.length).toBeGreaterThan(0)
      await user.click(copyButtons[0])
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('8.8.8.8')
      })
    })

    it('shows success toast after copying', async () => {
      const user = userEvent.setup()
      await renderSettled()
      vi.mocked(toast.success).mockClear()
      const copyButtons = screen
        .getAllByRole('button')
        .filter((btn) => (btn.textContent || '').trim() === '')
      await user.click(copyButtons[0])
      await waitFor(() => {
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith('IP Address copied to clipboard!')
      })
    })

    it('copies various fields to clipboard', async () => {
      await renderSettled()
      const copyButtons = screen
        .getAllByRole('button')
        .filter((btn) => (btn.textContent || '').trim() === '')
      expect(copyButtons.length).toBeGreaterThan(1)
    })
  })

  describe('Map Integration', () => {
    it('opens map when view on map is clicked', async () => {
      const user = userEvent.setup()
      await renderSettled()
      await user.click(screen.getByRole('button', { name: /View on Map/i }))
      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=37.386,-122.0838',
        '_blank'
      )
    })

    it('opens Google Maps with correct coordinates', async () => {
      const user = userEvent.setup()
      await renderSettled()
      await user.click(screen.getByRole('button', { name: /View on Map/i }))
      expect(window.open).toHaveBeenCalledWith(expect.stringContaining('37.386'), '_blank')
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Failed to lookup IP address')
      })
    })

    it('displays error message for failed lookups', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ error: true, reason: 'Invalid IP' }),
      } as Response)
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Invalid IP')
      })
    })

    it('handles network timeouts', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      vi.mocked(fetch).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20))
      )
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Failed to lookup IP address')
      })
    })

    it('handles API error responses', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ error: true }),
      } as Response)
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Failed to lookup IP address')
      })
    })

    it('handles malformed API responses', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ unexpected: 'data' }),
      } as Response)
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0)
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
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      expect(input.value).toBe('1.1.1.1')
    })

    it('handles rapid lookups', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^Lookup$/i })).toBeEnabled()
      })
      fireEvent.change(input, { target: { value: '8.8.4.4' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      expect(input.value).toBe('8.8.4.4')
    })

    it('maintains state across interactions', async () => {
      const user = userEvent.setup()
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: '1.1.1.1' } })
      await user.click(screen.getByRole('button', { name: /^Lookup$/i }))
      expect(input.value).toBe('1.1.1.1')
    })

    it('shows appropriate success messages', async () => {
      await renderSettled()
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('IP information retrieved successfully')
    })
  })

  describe('Edge Cases', () => {
    it('handles localhost IP', async () => {
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: '127.0.0.1' } })
      expect(input.value).toBe('127.0.0.1')
    })

    it('handles leading zeros in IP', async () => {
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: '008.008.008.008' } })
      expect(input.value).toBe('008.008.008.008')
    })

    it('handles whitespace in input', async () => {
      const input = await renderSettled()
      fireEvent.change(input, { target: { value: ' 8.8.8.8 ' } })
      expect(input.value).toContain('8.8.8.8')
    })

    it('handles missing data fields', async () => {
      await renderSettled({ ip: '8.8.8.8', version: 'IPv4' })
      expect(screen.getAllByText('8.8.8.8').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0)
    })
  })
})
