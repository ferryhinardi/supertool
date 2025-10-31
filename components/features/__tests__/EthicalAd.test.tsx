import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EthicalAd } from '../EthicalAd'

// Mock the ads-config module
vi.mock('@/lib/ads-config', () => ({
  getAdsConfig: vi.fn(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
    ethical: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_ETHICAL === 'true',
      publisherId: process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID || '',
    },
  })),
}))

// Helper to mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.assign(process.env, vars)
}

describe('EthicalAd Component', () => {
  beforeEach(() => {
    // Reset env vars before each test
    process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_ETHICAL = 'false'
    process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = ''
    vi.clearAllMocks()

    // Clean up any existing EthicalAds scripts
    const existingScript = document.querySelector(
      'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
    )
    if (existingScript) {
      existingScript.remove()
    }
  })

  afterEach(() => {
    // Clean up after each test
    const existingScript = document.querySelector(
      'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
    )
    if (existingScript) {
      existingScript.remove()
    }
  })

  describe('Feature Flag - EthicalAds Disabled', () => {
    it('should not render when ethical ads are disabled by default', () => {
      const { container } = render(<EthicalAd />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when NEXT_PUBLIC_ENABLE_ETHICAL is false', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_ETHICAL: 'false' })
      const { container } = render(<EthicalAd />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Feature Flag - EthicalAds Enabled', () => {
    it('should render placeholder when enabled but no publisher ID', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
      })
      const { container } = render(<EthicalAd position="content" />)
      expect(container.firstChild).not.toBeNull()
      expect(
        screen.getByText(/Configure NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID/i)
      ).toBeInTheDocument()
    })

    it('should render EthicalAd container when fully configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
      const { container } = render(<EthicalAd />)
      expect(container.firstChild).not.toBeNull()

      const adContainer = container.querySelector('[data-ad-network="ethical"]')
      expect(adContainer).toBeInTheDocument()
      expect(adContainer).toHaveAttribute('data-ad-position', 'content')
      expect(adContainer).toHaveAttribute('data-ea-publisher', 'test-publisher-id')
    })

    it('should inject EthicalAds script when configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
      render(<EthicalAd />)

      // Check if script was created with correct attributes
      const script = document.querySelector(
        'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
      )
      expect(script).toBeInTheDocument()
      expect(script).toHaveAttribute('async')
    })
  })

  describe('Placeholder Rendering', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
      })
    })

    it('should display correct position in placeholder', () => {
      const { rerender } = render(<EthicalAd position="header" />)
      expect(screen.getByText(/EthicalAds Space \(header\)/i)).toBeInTheDocument()

      rerender(<EthicalAd position="footer" />)
      expect(screen.getByText(/EthicalAds Space \(footer\)/i)).toBeInTheDocument()
    })
  })

  describe('Ad Positions', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
    })

    it('should accept different position props', () => {
      const positions = ['header', 'sidebar', 'footer', 'content'] as const
      positions.forEach((position) => {
        const { container } = render(<EthicalAd position={position} />)
        const adContainer = container.querySelector('[data-ad-position]')
        expect(adContainer).toHaveAttribute('data-ad-position', position)
      })
    })

    it('should default to content position when not specified', () => {
      const { container } = render(<EthicalAd />)
      const adContainer = container.querySelector('[data-ad-position]')
      expect(adContainer).toHaveAttribute('data-ad-position', 'content')
    })
  })

  describe('Ad Types', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
    })

    it('should accept image type', () => {
      const { container } = render(<EthicalAd type="image" />)
      const adContainer = container.querySelector('[data-ea-type]')
      expect(adContainer).toHaveAttribute('data-ea-type', 'image')
    })

    it('should accept text type', () => {
      const { container } = render(<EthicalAd type="text" />)
      const adContainer = container.querySelector('[data-ea-type]')
      expect(adContainer).toHaveAttribute('data-ea-type', 'text')
    })

    it('should default to image type when not specified', () => {
      const { container } = render(<EthicalAd />)
      const adContainer = container.querySelector('[data-ea-type]')
      expect(adContainer).toHaveAttribute('data-ea-type', 'image')
    })

    it('should have different minHeight for image vs text types', () => {
      const { container: imageContainer } = render(<EthicalAd type="image" />)
      const imageAd = imageContainer.querySelector('[data-ad-network="ethical"]') as HTMLElement
      expect(imageAd.style.minHeight).toBe('250px')

      const { container: textContainer } = render(<EthicalAd type="text" />)
      const textAd = textContainer.querySelector('[data-ad-network="ethical"]') as HTMLElement
      expect(textAd.style.minHeight).toBe('150px')
    })
  })

  describe('Props', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
    })

    it('should accept className prop', () => {
      const { container } = render(<EthicalAd className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should accept all props together', () => {
      const { container } = render(
        <EthicalAd className="custom-class" position="header" type="text" />
      )

      const adContainer = container.querySelector('.custom-class')
      expect(adContainer).toBeInTheDocument()
      expect(adContainer).toHaveAttribute('data-ad-position', 'header')
      expect(adContainer).toHaveAttribute('data-ad-network', 'ethical')
      expect(adContainer).toHaveAttribute('data-ea-type', 'text')
    })
  })

  describe('Component Rendering Logic', () => {
    it('should handle undefined props gracefully', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })
      const { container } = render(<EthicalAd />)
      expect(container).toBeDefined()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<EthicalAd />)).not.toThrow()
    })
  })

  describe('Script Initialization', () => {
    it('should only load script once even with multiple renders', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })

      const { rerender } = render(<EthicalAd />)
      rerender(<EthicalAd />)
      rerender(<EthicalAd />)

      // Should only have one script
      const scripts = document.querySelectorAll(
        'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
      )
      expect(scripts.length).toBe(1)
    })

    it('should cleanup script on unmount', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL: 'true',
        NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID: 'test-publisher-id',
      })

      const { unmount } = render(<EthicalAd />)

      // Verify script exists
      expect(
        document.querySelector(
          'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
        )
      ).toBeInTheDocument()

      // Unmount component
      unmount()

      // Script should be removed
      expect(
        document.querySelector(
          'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
        )
      ).not.toBeInTheDocument()
    })
  })
})
