import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CarbonAd } from '../ads/CarbonAd'

// Mock the ads-config module
vi.mock('@/lib/services/ads-config', () => ({
  getAdsConfig: vi.fn(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
    adsense: {
      enabled: false,
      clientId: '',
    },
    carbon: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_CARBON === 'true',
      serveId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || '',
      placement: process.env.NEXT_PUBLIC_CARBON_PLACEMENT || 'supertoolsite',
    },
    ethical: {
      enabled: false,
      publisherId: '',
    },
    affiliates: {
      enabled: false,
      partners: {
        passwordManagers: { onePassword: '', bitwarden: '', dashlane: '' },
        imageCdn: { cloudinary: '', tinypng: '' },
        developerTools: { postman: '', insomnia: '' },
        vpn: { nordvpn: '', expressvpn: '' },
        hosting: { vercel: '', cloudflare: '', supabase: '' },
      },
    },
  })),
}))

// Helper to mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.assign(process.env, vars)
}

describe('CarbonAd Component', () => {
  beforeEach(() => {
    // Reset env vars before each test
    process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_CARBON = 'false'
    process.env.NEXT_PUBLIC_CARBON_SERVE_ID = ''
    process.env.NEXT_PUBLIC_CARBON_PLACEMENT = ''
    vi.clearAllMocks()

    // Clean up any existing Carbon Ads scripts/elements
    const existingScript = document.getElementById('_carbonads_js')
    if (existingScript) {
      existingScript.remove()
    }
    const carbonContainer = document.querySelector('#carbonads')
    if (carbonContainer) {
      carbonContainer.remove()
    }
  })

  afterEach(() => {
    // Clean up after each test
    const existingScript = document.getElementById('_carbonads_js')
    if (existingScript) {
      existingScript.remove()
    }
    const carbonContainer = document.querySelector('#carbonads')
    if (carbonContainer) {
      carbonContainer.remove()
    }
  })

  describe('Feature Flag - Carbon Ads Disabled', () => {
    it('should not render when carbon ads are disabled by default', () => {
      const { container } = render(<CarbonAd />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when NEXT_PUBLIC_ENABLE_CARBON is false', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_CARBON: 'false' })
      const { container } = render(<CarbonAd />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Feature Flag - Carbon Ads Enabled', () => {
    it('should render placeholder when enabled but no serve ID', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
      })
      const { container } = render(<CarbonAd position="content" />)
      expect(container.firstChild).not.toBeNull()
      expect(screen.getByText(/Configure NEXT_PUBLIC_CARBON_SERVE_ID/i)).toBeInTheDocument()
    })

    it('should render Carbon ad container when fully configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
        NEXT_PUBLIC_CARBON_PLACEMENT: 'testsite',
      })
      const { container } = render(<CarbonAd />)
      expect(container.firstChild).not.toBeNull()

      const adContainer = container.querySelector('[data-ad-network="carbon"]')
      expect(adContainer).toBeInTheDocument()
      expect(adContainer).toHaveAttribute('data-ad-position', 'content')
    })

    it('should inject Carbon Ads script with correct configuration', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
        NEXT_PUBLIC_CARBON_PLACEMENT: 'testsite',
      })
      render(<CarbonAd />)

      // Check if script was created with correct attributes
      const script = document.getElementById('_carbonads_js')
      expect(script).toBeInTheDocument()
      expect(script).toHaveAttribute(
        'src',
        '//cdn.carbonads.com/carbon.js?serve=test-serve-id&placement=testsite'
      )
      expect(script).toHaveAttribute('async')
    })
  })

  describe('Placeholder Rendering', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
      })
    })

    it('should display correct position in placeholder', () => {
      const { rerender } = render(<CarbonAd position="header" />)
      expect(screen.getByText(/Carbon Ad Space \(header\)/i)).toBeInTheDocument()

      rerender(<CarbonAd position="footer" />)
      expect(screen.getByText(/Carbon Ad Space \(footer\)/i)).toBeInTheDocument()
    })
  })

  describe('Ad Positions', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
      })
    })

    it('should accept different position props', () => {
      const positions = ['header', 'sidebar', 'footer', 'content'] as const
      positions.forEach((position) => {
        const { container } = render(<CarbonAd position={position} />)
        const adContainer = container.querySelector('[data-ad-position]')
        expect(adContainer).toHaveAttribute('data-ad-position', position)
      })
    })

    it('should default to content position when not specified', () => {
      const { container } = render(<CarbonAd />)
      const adContainer = container.querySelector('[data-ad-position]')
      expect(adContainer).toHaveAttribute('data-ad-position', 'content')
    })
  })

  describe('Props', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
      })
    })

    it('should accept className prop', () => {
      const { container } = render(<CarbonAd className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should accept all props together', () => {
      const { container } = render(<CarbonAd className="custom-class" position="header" />)

      const adContainer = container.querySelector('.custom-class')
      expect(adContainer).toBeInTheDocument()
      expect(adContainer).toHaveAttribute('data-ad-position', 'header')
      expect(adContainer).toHaveAttribute('data-ad-network', 'carbon')
    })
  })

  describe('Component Rendering Logic', () => {
    it('should handle undefined props gracefully', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
      })
      const { container } = render(<CarbonAd />)
      expect(container).toBeDefined()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<CarbonAd />)).not.toThrow()
    })
  })

  describe('Script Cleanup', () => {
    it('should clean up existing script before injecting new one', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
      })

      // Create an existing script
      const existingScript = document.createElement('script')
      existingScript.id = '_carbonads_js'
      document.body.appendChild(existingScript)

      render(<CarbonAd />)

      // Should only have one script
      const scripts = document.querySelectorAll('#_carbonads_js')
      expect(scripts.length).toBe(1)
    })

    it('should cleanup script on unmount', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON: 'true',
        NEXT_PUBLIC_CARBON_SERVE_ID: 'test-serve-id',
      })

      const { unmount } = render(<CarbonAd />)

      // Verify script exists
      expect(document.getElementById('_carbonads_js')).toBeInTheDocument()

      // Unmount component
      unmount()

      // Script should be removed
      expect(document.getElementById('_carbonads_js')).not.toBeInTheDocument()
    })
  })
})
