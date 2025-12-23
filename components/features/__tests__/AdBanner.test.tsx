import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdBanner, isAdsEnabled } from '../ads/AdBanner'

// Mock the ads-config module
vi.mock('@/lib/ads-config', () => ({
  getAdsConfig: vi.fn(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
    adsense: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
    },
  })),
}))

// Helper to mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.assign(process.env, vars)
}

describe('AdBanner Component', () => {
  beforeEach(() => {
    // Reset env vars before each test
    process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'false'
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = ''
    vi.clearAllMocks()
  })

  describe('Feature Flag - Ads Disabled', () => {
    it('should not render when ads are disabled by default', () => {
      const { container } = render(<AdBanner />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when NEXT_PUBLIC_ENABLE_ADS is false', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_ADS: 'false' })
      const { container } = render(<AdBanner />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Feature Flag - Ads Enabled', () => {
    it('should render placeholder when ads enabled but no AdSense ID', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { container } = render(<AdBanner position="content" />)
      expect(container.firstChild).not.toBeNull()
      expect(screen.getByText(/Configure NEXT_PUBLIC_GOOGLE_ADSENSE_ID/i)).toBeInTheDocument()
    })

    it('should render AdSense ad when fully configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
        NEXT_PUBLIC_GOOGLE_ADSENSE_ID: 'ca-pub-test',
      })
      const { container } = render(<AdBanner slot="test-slot" />)
      expect(container.firstChild).not.toBeNull()

      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toBeInTheDocument()
      expect(adElement).toHaveAttribute('data-ad-client', 'ca-pub-test')
      expect(adElement).toHaveAttribute('data-ad-slot', 'test-slot')
    })
  })

  describe('Placeholder Rendering', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
    })

    it('should display correct position in placeholder', () => {
      const { rerender } = render(<AdBanner position="header" />)
      expect(screen.getByText(/Ad Space \(header\)/i)).toBeInTheDocument()

      rerender(<AdBanner position="footer" />)
      expect(screen.getByText(/Ad Space \(footer\)/i)).toBeInTheDocument()
    })
  })

  describe('Ad Positions', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
        NEXT_PUBLIC_GOOGLE_ADSENSE_ID: 'ca-pub-test',
      })
    })

    it('should accept different position props', () => {
      const positions = ['header', 'sidebar', 'footer', 'content'] as const
      positions.forEach((position) => {
        const { container } = render(<AdBanner position={position} />)
        const adContainer = container.querySelector('[data-ad-position]')
        expect(adContainer).toHaveAttribute('data-ad-position', position)
      })
    })

    it('should default to content position when not specified', () => {
      const { container } = render(<AdBanner />)
      const adContainer = container.querySelector('[data-ad-position]')
      expect(adContainer).toHaveAttribute('data-ad-position', 'content')
    })
  })

  describe('Props', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
        NEXT_PUBLIC_GOOGLE_ADSENSE_ID: 'ca-pub-test',
      })
    })

    it('should accept slot prop', () => {
      const { container } = render(<AdBanner slot="test-slot" />)
      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toHaveAttribute('data-ad-slot', 'test-slot')
    })

    it('should accept format prop', () => {
      const { container } = render(<AdBanner format="horizontal" />)
      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toHaveAttribute('data-ad-format', 'horizontal')
    })

    it('should accept responsive prop as true', () => {
      const { container } = render(<AdBanner responsive={true} />)
      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toHaveAttribute('data-full-width-responsive', 'true')
    })

    it('should accept responsive prop as false', () => {
      const { container } = render(<AdBanner responsive={false} />)
      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toHaveAttribute('data-full-width-responsive', 'false')
    })

    it('should accept className prop', () => {
      const { container } = render(<AdBanner className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should accept all props together', () => {
      const { container } = render(
        <AdBanner
          slot="test-slot"
          format="auto"
          responsive={true}
          className="custom-class"
          position="header"
        />
      )
      const adElement = container.querySelector('.adsbygoogle')
      expect(adElement).toHaveAttribute('data-ad-slot', 'test-slot')
      expect(adElement).toHaveAttribute('data-ad-format', 'auto')
      expect(adElement).toHaveAttribute('data-full-width-responsive', 'true')

      const adContainer = container.querySelector('.custom-class')
      expect(adContainer).toBeInTheDocument()
      expect(adContainer).toHaveAttribute('data-ad-position', 'header')
    })
  })

  describe('isAdsEnabled Helper', () => {
    it('should be a function', () => {
      expect(typeof isAdsEnabled).toBe('function')
    })

    it('should return a boolean', () => {
      const result = isAdsEnabled()
      expect(typeof result).toBe('boolean')
    })

    it('should return false when NEXT_PUBLIC_ENABLE_ADS is not set', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_ADS: '' })
      const result = isAdsEnabled()
      expect(result).toBe(false)
    })

    it('should return false when NEXT_PUBLIC_ENABLE_ADS is false', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_ADS: 'false' })
      const result = isAdsEnabled()
      expect(result).toBe(false)
    })

    it('should return true when NEXT_PUBLIC_ENABLE_ADS and NEXT_PUBLIC_ENABLE_ADSENSE are true', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const result = isAdsEnabled()
      expect(result).toBe(true)
    })

    it('should return false when NEXT_PUBLIC_ENABLE_ADS is true but NEXT_PUBLIC_ENABLE_ADSENSE is false', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'false',
      })
      const result = isAdsEnabled()
      expect(result).toBe(false)
    })
  })

  describe('Component Rendering Logic', () => {
    it('should handle undefined props gracefully', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
        NEXT_PUBLIC_GOOGLE_ADSENSE_ID: 'ca-pub-test',
      })
      const { container } = render(<AdBanner />)
      expect(container).toBeDefined()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<AdBanner />)).not.toThrow()
    })
  })
})
