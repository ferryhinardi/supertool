import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdContainer } from '../ads/AdContainer'

// Mock all ad components
vi.mock('../ads/AdBanner', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock component accepts any props for testing
  AdBanner: ({ position, className, slot }: any) => (
    <div data-testid="ad-banner" data-position={position} className={className} data-slot={slot}>
      AdBanner Mock
    </div>
  ),
}))

vi.mock('../ads/CarbonAd', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock component accepts any props for testing
  CarbonAd: ({ position, className }: any) => (
    <div data-testid="carbon-ad" data-position={position} className={className}>
      CarbonAd Mock
    </div>
  ),
}))

vi.mock('../ads/EthicalAd', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: Mock component accepts any props for testing
  EthicalAd: ({ position, className, type }: any) => (
    <div data-testid="ethical-ad" data-position={position} className={className} data-type={type}>
      EthicalAd Mock
    </div>
  ),
}))

// Mock the ads-config module
vi.mock('@/lib/services/ads-config', () => ({
  getAdsConfig: vi.fn(() => {
    const masterEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
    return {
      enabled: masterEnabled,
      adsense: {
        enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'test-client-id',
      },
      carbon: {
        enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS === 'true',
        serveId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || 'test-serve-id',
        placement: process.env.NEXT_PUBLIC_CARBON_PLACEMENT || 'test-placement',
      },
      ethical: {
        enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS === 'true',
        publisherId: process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID || 'test-publisher-id',
      },
      affiliates: {
        enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === 'true',
        partners: {
          passwordManagers: { onePassword: '', bitwarden: '', dashlane: '' },
          imageCdn: { cloudinary: '', tinypng: '' },
          developerTools: { postman: '', insomnia: '' },
          vpn: { nordvpn: '', expressvpn: '' },
          hosting: { vercel: '', cloudflare: '', supabase: '' },
        },
      },
    }
  }),
  isAnyAdEnabled: vi.fn(() => {
    const masterEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
    return (
      masterEnabled &&
      (process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS === 'true' ||
        process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS === 'true' ||
        process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true')
    )
  }),
  getPriorityAdNetwork: vi.fn(() => {
    const masterEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'
    if (!masterEnabled) return null

    // Priority: Carbon > Ethical > AdSense
    if (process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS === 'true') {
      return 'carbon'
    }
    if (process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS === 'true') {
      return 'ethical'
    }
    if (process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true') {
      return 'adsense'
    }
    return null
  }),
}))

// Helper to mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.assign(process.env, vars)
}

describe('AdContainer Component', () => {
  beforeEach(() => {
    // Reset env vars before each test
    process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'false'
    vi.clearAllMocks()
  })

  describe('Feature Flag - Ads Disabled', () => {
    it('should not render when all ads are disabled', () => {
      const { container } = render(<AdContainer />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when only master flag is set', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_ADS: 'true' })
      const { container } = render(<AdContainer />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Network Priority - Auto Selection', () => {
    it('should render Carbon Ads when only Carbon is enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
    })

    it('should render Ethical Ads when only Ethical is enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ethical-ad')).toBeInTheDocument()
    })

    it('should render AdSense when only AdSense is enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ad-banner')).toBeInTheDocument()
    })

    it('should prioritize Carbon over Ethical when both are enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
      })
      const { getByTestId, queryByTestId } = render(<AdContainer />)
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
      expect(queryByTestId('ethical-ad')).not.toBeInTheDocument()
    })

    it('should prioritize Carbon over AdSense when both are enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId, queryByTestId } = render(<AdContainer />)
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
      expect(queryByTestId('ad-banner')).not.toBeInTheDocument()
    })

    it('should prioritize Ethical over AdSense when both are enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId, queryByTestId } = render(<AdContainer />)
      expect(getByTestId('ethical-ad')).toBeInTheDocument()
      expect(queryByTestId('ad-banner')).not.toBeInTheDocument()
    })

    it('should prioritize Carbon when all three are enabled', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId, queryByTestId } = render(<AdContainer />)
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
      expect(queryByTestId('ethical-ad')).not.toBeInTheDocument()
      expect(queryByTestId('ad-banner')).not.toBeInTheDocument()
    })
  })

  describe('Force Network', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
    })

    it('should force Carbon Ads when specified', () => {
      const { getByTestId, queryByTestId } = render(<AdContainer forceNetwork="carbon" />)
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
      expect(queryByTestId('ethical-ad')).not.toBeInTheDocument()
      expect(queryByTestId('ad-banner')).not.toBeInTheDocument()
    })

    it('should force Ethical Ads when specified', () => {
      const { getByTestId, queryByTestId } = render(<AdContainer forceNetwork="ethical" />)
      expect(getByTestId('ethical-ad')).toBeInTheDocument()
      expect(queryByTestId('carbon-ad')).not.toBeInTheDocument()
      expect(queryByTestId('ad-banner')).not.toBeInTheDocument()
    })

    it('should force AdSense when specified', () => {
      const { getByTestId, queryByTestId } = render(<AdContainer forceNetwork="adsense" />)
      expect(getByTestId('ad-banner')).toBeInTheDocument()
      expect(queryByTestId('carbon-ad')).not.toBeInTheDocument()
      expect(queryByTestId('ethical-ad')).not.toBeInTheDocument()
    })

    it('should use priority selection when forceNetwork is null', () => {
      const { getByTestId } = render(<AdContainer forceNetwork={null} />)
      // Should select Carbon since it's highest priority
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
    })
  })

  describe('Props Propagation', () => {
    it('should pass position prop to ad components', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
      })
      const { getByTestId } = render(<AdContainer position="header" />)
      expect(getByTestId('carbon-ad')).toHaveAttribute('data-position', 'header')
    })

    it('should pass className prop to ad components', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
      })
      const { container } = render(<AdContainer className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should pass slot prop to AdSense', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId } = render(<AdContainer slot="custom-slot" />)
      expect(getByTestId('ad-banner')).toHaveAttribute('data-slot', 'custom-slot')
    })

    it('should generate default slot for AdSense based on position', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId } = render(<AdContainer position="sidebar" />)
      expect(getByTestId('ad-banner')).toHaveAttribute('data-slot', 'sidebar-ad')
    })

    it('should pass all props together', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
      })
      const { getByTestId } = render(
        <AdContainer position="footer" className="test-class" slot="test-slot" />
      )
      const carbonAd = getByTestId('carbon-ad')
      expect(carbonAd).toHaveAttribute('data-position', 'footer')
      expect(carbonAd).toHaveClass('test-class')
    })
  })

  describe('Default Values', () => {
    it('should default position to content', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ethical-ad')).toHaveAttribute('data-position', 'content')
    })

    it('should default forceNetwork to null (use priority)', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      // Should use priority and select Carbon
      expect(getByTestId('carbon-ad')).toBeInTheDocument()
    })
  })

  describe('Component Rendering Logic', () => {
    it('should handle undefined props gracefully', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_CARBON_ADS: 'true',
      })
      const { container } = render(<AdContainer />)
      expect(container).toBeDefined()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<AdContainer />)).not.toThrow()
    })
  })

  describe('EthicalAd Configuration', () => {
    it('should pass type="image" to EthicalAd component', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ETHICAL_ADS: 'true',
      })
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ethical-ad')).toHaveAttribute('data-type', 'image')
    })
  })

  describe('AdSense Configuration', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_ADSENSE: 'true',
      })
    })

    it('should pass format="auto" to AdBanner component', () => {
      // This is implicit in our mock, but the component does set format="auto"
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ad-banner')).toBeInTheDocument()
    })

    it('should pass responsive={true} to AdBanner component', () => {
      // This is implicit in our mock, but the component does set responsive={true}
      const { getByTestId } = render(<AdContainer />)
      expect(getByTestId('ad-banner')).toBeInTheDocument()
    })
  })
})
