import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BrowserFingerprintPage from '../page'

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
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock the fingerprint utilities
vi.mock('../utils', async () => {
  const mockFingerprint = {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    platform: 'MacIntel',
    language: 'en-US',
    languages: ['en-US', 'en'],
    cookieEnabled: true,
    doNotTrack: 'unspecified',
    screenResolution: '1920x1080',
    availableScreenResolution: '1920x1050',
    colorDepth: 24,
    pixelRatio: 2,
    touchSupport: { maxTouchPoints: 0, touchEvent: false, touchStart: false },
    hardwareConcurrency: 8,
    deviceMemory: 8,
    canvas: 'abc123def456',
    audioFingerprint: 'audio123',
    webgl: {
      vendor: 'WebKit',
      renderer: 'WebKit WebGL',
      version: 'WebGL 2.0',
      unmaskedVendor: 'Apple Inc.',
      unmaskedRenderer: 'Apple GPU',
    },
    fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'],
    timezone: 'America/Los_Angeles',
    timezoneOffset: 480,
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    adBlocker: false,
    plugins: ['Chrome PDF Plugin'],
  }

  return {
    collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    generateFingerprintHash: vi.fn().mockReturnValue('abc123def456789'),
    calculateUniquenessScore: vi.fn().mockReturnValue(75),
  }
})

describe('Browser Fingerprint Page - Component Tests', () => {
  let queryClient: QueryClient

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserFingerprintPage />
      </QueryClientProvider>
    )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('should render page with title and description', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Browser Fingerprint Viewer', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Discover how unique and trackable your browser is/i)
    ).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    renderPage()

    expect(screen.getByText('Collecting fingerprint data...')).toBeInTheDocument()
  })

  it('should display uniqueness score after loading', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('Uniqueness Score')).toBeInTheDocument()
    })
  })

  it('should display fingerprint hash after loading', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Your Unique Fingerprint ID')).toBeInTheDocument()
      expect(screen.getByText('abc123def456789')).toBeInTheDocument()
    })
  })

  it('should display correct trackability label for high score', async () => {
    const { calculateUniquenessScore } = await import('../utils')
    vi.mocked(calculateUniquenessScore).mockReturnValue(85)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Highly Trackable')).toBeInTheDocument()
    })
  })

  it('should display correct trackability label for moderate score', async () => {
    const { calculateUniquenessScore } = await import('../utils')
    vi.mocked(calculateUniquenessScore).mockReturnValue(50)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Moderately Trackable')).toBeInTheDocument()
    })
  })

  it('should display correct trackability label for low score', async () => {
    const { calculateUniquenessScore } = await import('../utils')
    vi.mocked(calculateUniquenessScore).mockReturnValue(30)

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Less Trackable')).toBeInTheDocument()
    })
  })

  it('should display basic browser information section', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Basic Browser Information')).toBeInTheDocument()
    })
  })

  it('should display browser data when basic section is expanded', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('User Agent')).toBeInTheDocument()
      expect(screen.getByText('Mozilla/5.0 (Test Browser)')).toBeInTheDocument()
      expect(screen.getByText('Platform')).toBeInTheDocument()
      expect(screen.getByText('MacIntel')).toBeInTheDocument()
    })
  })

  it('should display all fingerprint sections', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Basic Browser Information')).toBeInTheDocument()
      expect(screen.getByText('Screen & Display')).toBeInTheDocument()
      expect(screen.getByText('Hardware Information')).toBeInTheDocument()
      expect(screen.getByText('Graphics & Rendering')).toBeInTheDocument()
      expect(screen.getByText('Installed Fonts')).toBeInTheDocument()
      expect(screen.getByText('Privacy & Storage')).toBeInTheDocument()
    })
  })

  it('should toggle section when clicked', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Screen & Display')).toBeInTheDocument()
    })

    const screenSection = screen.getByText('Screen & Display').closest('button')
    if (screenSection) {
      await userEvent.click(screenSection)
    }

    await waitFor(() => {
      expect(screen.getByText('Screen Resolution')).toBeInTheDocument()
      expect(screen.getByText('1920x1080')).toBeInTheDocument()
    })
  })

  it('should track section toggle event', async () => {
    const { trackToolEvent } = await import('@/lib/services/analytics')

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Hardware Information')).toBeInTheDocument()
    })

    const hardwareSection = screen.getByText('Hardware Information').closest('button')
    if (hardwareSection) {
      await userEvent.click(hardwareSection)
    }

    await waitFor(() => {
      expect(trackToolEvent).toHaveBeenCalledWith('browser_fingerprint_section_toggle', {
        section: 'hardware',
      })
    })
  })

  it('should copy fingerprint hash to clipboard', async () => {
    const { toast } = await import('sonner')
    const { trackToolEvent } = await import('@/lib/services/analytics')

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('abc123def456789')).toBeInTheDocument()
    })

    const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
    const hashCopyButton = copyButtons.find((btn) => btn.textContent?.includes('Copy'))

    if (hashCopyButton) {
      await userEvent.click(hashCopyButton)
    }

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc123def456789')
      expect(toast.success).toHaveBeenCalledWith('Copied Fingerprint ID to clipboard')
      expect(trackToolEvent).toHaveBeenCalledWith('browser_fingerprint_copy', {
        field: 'Fingerprint ID',
      })
    })
  })

  it('should copy all fingerprint data', async () => {
    const { toast } = await import('sonner')
    const { trackToolEvent } = await import('@/lib/services/analytics')

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Copy All Fingerprint Data')).toBeInTheDocument()
    })

    const copyAllButton = screen.getByText('Copy All Fingerprint Data')
    await userEvent.click(copyAllButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Copied all fingerprint data to clipboard')
      expect(trackToolEvent).toHaveBeenCalledWith('browser_fingerprint_copy_all', {})
    })
  })

  it('should display font count badge', async () => {
    renderPage()

    await waitFor(() => {
      const badges = screen.getAllByText('4')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('should display fonts when section is expanded', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Installed Fonts')).toBeInTheDocument()
    })

    const fontsSection = screen.getByText('Installed Fonts').closest('button')
    if (fontsSection) {
      await userEvent.click(fontsSection)
    }

    await waitFor(() => {
      expect(screen.getByText('Arial')).toBeInTheDocument()
      expect(screen.getByText('Helvetica')).toBeInTheDocument()
      expect(screen.getByText('Times New Roman')).toBeInTheDocument()
      expect(screen.getByText('Courier New')).toBeInTheDocument()
    })
  })

  it('should display WebGL information', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Graphics & Rendering')).toBeInTheDocument()
    })

    const graphicsSection = screen.getByText('Graphics & Rendering').closest('button')
    if (graphicsSection) {
      await userEvent.click(graphicsSection)
    }

    await waitFor(() => {
      expect(screen.getByText('WebGL Vendor')).toBeInTheDocument()
      expect(screen.getByText('WebKit')).toBeInTheDocument()
      expect(screen.getByText('WebGL Renderer')).toBeInTheDocument()
      expect(screen.getByText('WebKit WebGL')).toBeInTheDocument()
    })
  })

  it('should display hardware information', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Hardware Information')).toBeInTheDocument()
    })

    const hardwareSection = screen.getByText('Hardware Information').closest('button')
    if (hardwareSection) {
      await userEvent.click(hardwareSection)
    }

    await waitFor(() => {
      expect(screen.getByText('CPU Cores')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('Device Memory')).toBeInTheDocument()
      expect(screen.getByText('8 GB')).toBeInTheDocument()
    })
  })

  it('should display privacy and storage information', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Privacy & Storage')).toBeInTheDocument()
    })

    const privacySection = screen.getByText('Privacy & Storage').closest('button')
    if (privacySection) {
      await userEvent.click(privacySection)
    }

    await waitFor(() => {
      expect(screen.getByText('Timezone')).toBeInTheDocument()
      expect(screen.getByText('America/Los_Angeles')).toBeInTheDocument()
      expect(screen.getByText('Local Storage')).toBeInTheDocument()
      // "Available" appears multiple times (localStorage, sessionStorage, indexedDB)
      const availableTexts = screen.getAllByText('Available')
      expect(availableTexts.length).toBeGreaterThan(0)
    })
  })

  it('should display ad blocker status', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Privacy & Storage')).toBeInTheDocument()
    })

    const privacySection = screen.getByText('Privacy & Storage').closest('button')
    if (privacySection) {
      await userEvent.click(privacySection)
    }

    await waitFor(() => {
      expect(screen.getByText('Ad Blocker Detected')).toBeInTheDocument()
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })

  it('should display privacy insights section', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Privacy Insights')).toBeInTheDocument()
      expect(
        screen.getByText(/Browser fingerprinting allows websites to identify you without cookies/i)
      ).toBeInTheDocument()
    })
  })

  it('should display pro tips section', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Understanding Your Fingerprint')).toBeInTheDocument()
      expect(
        screen.getByText(/All data is collected locally - nothing is sent to any server/i)
      ).toBeInTheDocument()
    })
  })

  it('should track page open event on mount', async () => {
    const { trackToolEvent } = await import('@/lib/services/analytics')

    renderPage()

    await waitFor(() => {
      expect(trackToolEvent).toHaveBeenCalledWith('browser_fingerprint_open', {})
    })
  })

  it('should handle fingerprint collection error', async () => {
    const { toast } = await import('sonner')
    const { collectFingerprint } = await import('../utils')

    vi.mocked(collectFingerprint).mockRejectedValueOnce(new Error('Collection failed'))

    renderPage()

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to collect fingerprint data')
    })
  })

  it('should display copy all button after data loads', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Copy All Fingerprint Data')).toBeInTheDocument()
    })
  })

  it('should have basic section expanded by default', async () => {
    renderPage()

    // Basic section should show its content immediately after loading
    await waitFor(() => {
      expect(screen.getByText('User Agent')).toBeInTheDocument()
      expect(screen.getByText('Platform')).toBeInTheDocument()
    })
  })

  it('should collapse basic section when clicked', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('User Agent')).toBeInTheDocument()
    })

    const basicSection = screen.getByText('Basic Browser Information').closest('button')
    if (basicSection) {
      await userEvent.click(basicSection)
    }

    await waitFor(() => {
      expect(screen.queryByText('User Agent')).not.toBeInTheDocument()
    })
  })
})
