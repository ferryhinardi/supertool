import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AffiliateSuggestion } from '../ads/AffiliateSuggestion'

// Mock the ads-config module
vi.mock('@/lib/services/ads-config', () => ({
  getAdsConfig: vi.fn(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
    adsense: {
      enabled: false,
      clientId: '',
    },
    carbon: {
      enabled: false,
      serveId: '',
      placement: '',
    },
    ethical: {
      enabled: false,
      publisherId: '',
    },
    affiliates: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === 'true',
      partners: {
        passwordManagers: {
          onePassword: process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF || '',
          bitwarden: process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF || '',
          dashlane: process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE_REF || '',
        },
        vpn: {
          nordvpn: process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_REF || '',
          expressvpn: process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF || '',
        },
        imageCdn: {
          cloudinary: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF || '',
          tinypng: process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG_REF || '',
        },
        developerTools: {
          postman: process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN_REF || '',
          insomnia: process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF || '',
        },
        hosting: {
          vercel: process.env.NEXT_PUBLIC_AFFILIATE_VERCEL_REF || '',
          cloudflare: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF || '',
          supabase: process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE_REF || '',
        },
      },
    },
  })),
}))

// Helper to mock environment variables
const mockEnv = (vars: Record<string, string>) => {
  Object.assign(process.env, vars)
}

describe('AffiliateSuggestion Component', () => {
  beforeEach(() => {
    // Reset env vars before each test
    process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
    process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'false'
    process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_VERCEL_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF = ''
    process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE_REF = ''
    vi.clearAllMocks()
  })

  describe('Feature Flag - Affiliates Disabled', () => {
    it('should not render when affiliates are disabled by default', () => {
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(container.firstChild).toBeNull()
    })

    it('should not render when NEXT_PUBLIC_ENABLE_AFFILIATES is false', () => {
      mockEnv({ NEXT_PUBLIC_ENABLE_AFFILIATES: 'false' })
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Feature Flag - Affiliates Enabled', () => {
    it('should not render when enabled but no affiliate partners configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
      })
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(container.firstChild).toBeNull()
    })

    it('should render affiliate suggestions when partners are configured', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test',
      })
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(container.firstChild).not.toBeNull()
      expect(screen.getByText('1Password')).toBeInTheDocument()
    })
  })

  describe('Password Manager Tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test1',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF: '/ref/test2',
        NEXT_PUBLIC_AFFILIATE_DASHLANE_REF: '/ref/test3',
      })
    })

    it('should show password manager suggestions for password-generator tool', () => {
      render(<AffiliateSuggestion tool="password-generator" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
      expect(screen.getByText('Bitwarden')).toBeInTheDocument()
      expect(screen.getByText('Dashlane')).toBeInTheDocument()
    })

    it('should show password manager suggestions for password-strength tool', () => {
      render(<AffiliateSuggestion tool="password-strength" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
      expect(screen.getByText('Bitwarden')).toBeInTheDocument()
      expect(screen.getByText('Dashlane')).toBeInTheDocument()
    })

    it('should include correct affiliate links', () => {
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      const link = container.querySelector('a[href*="1password.com"]')
      expect(link).toHaveAttribute('href', 'https://1password.com/ref/test1')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('VPN Tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_NORDVPN_REF: '/ref/nord',
        NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF: '/ref/express',
      })
    })

    it('should show VPN suggestions for encryption-tool', () => {
      render(<AffiliateSuggestion tool="encryption-tool" />)
      expect(screen.getByText('NordVPN')).toBeInTheDocument()
      expect(screen.getByText('ExpressVPN')).toBeInTheDocument()
    })
  })

  describe('Image CDN Tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF: '/ref/cloudinary',
        NEXT_PUBLIC_AFFILIATE_TINYPNG_REF: '/ref/tinypng',
      })
    })

    it('should show image CDN suggestions for image-optimizer tool', () => {
      render(<AffiliateSuggestion tool="image-optimizer" />)
      expect(screen.getByText('Cloudinary')).toBeInTheDocument()
      expect(screen.getByText('TinyPNG Pro')).toBeInTheDocument()
    })
  })

  describe('Developer Tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_POSTMAN_REF: '/ref/postman',
        NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF: '/ref/insomnia',
      })
    })

    it('should show developer tool suggestions for api-tester tool', () => {
      render(<AffiliateSuggestion tool="api-tester" />)
      expect(screen.getByText('Postman')).toBeInTheDocument()
      expect(screen.getByText('Insomnia')).toBeInTheDocument()
    })
  })

  describe('Hosting Tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF: '/ref/cloudflare',
        NEXT_PUBLIC_AFFILIATE_SUPABASE_REF: '/ref/supabase',
      })
    })

    it('should show hosting suggestions for upload tool', () => {
      render(<AffiliateSuggestion tool="upload" />)
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
      expect(screen.getByText('Supabase')).toBeInTheDocument()
    })
  })

  describe('Logo maker tools', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF: '/ref/cloudinary',
        NEXT_PUBLIC_AFFILIATE_POSTMAN_REF: '/ref/postman',
        NEXT_PUBLIC_AFFILIATE_TINYPNG_REF: '/ref/tinypng',
      })
    })

    it('shows design affiliate suggestions for logo-maker', () => {
      render(<AffiliateSuggestion tool="logo-maker" />)

      expect(screen.getByText('Canva')).toBeInTheDocument()
      expect(screen.getByText('Figma')).toBeInTheDocument()
      expect(screen.getByText('Adobe Express')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test',
      })
    })

    it('should render banner variant by default', () => {
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(screen.getByText('💡 Recommended Tools')).toBeInTheDocument()
      expect(
        container.querySelector('[data-affiliate-tool="password-generator"]')
      ).toBeInTheDocument()
    })

    it('should render banner variant explicitly', () => {
      render(<AffiliateSuggestion tool="password-generator" variant="banner" />)
      expect(screen.getByText('💡 Recommended Tools')).toBeInTheDocument()
    })

    it('should render card variant', () => {
      render(<AffiliateSuggestion tool="password-generator" variant="card" />)
      expect(screen.getByText('Recommended for you')).toBeInTheDocument()
    })

    it('should render inline variant with first product only', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test1',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF: '/ref/test2',
      })
      render(<AffiliateSuggestion tool="password-generator" variant="inline" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
      // Inline only shows first product
      expect(screen.queryByText('Bitwarden')).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test',
      })
    })

    it('should accept className prop', () => {
      const { container } = render(
        <AffiliateSuggestion tool="password-generator" className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should set data-affiliate-tool attribute', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_NORDVPN_REF: '/ref/nord',
      })
      const { container } = render(<AffiliateSuggestion tool="encryption-tool" />)
      const element = container.querySelector('[data-affiliate-tool]')
      expect(element).toHaveAttribute('data-affiliate-tool', 'encryption-tool')
    })
  })

  describe('Partial Configuration', () => {
    it('should only show configured partners', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test1',
        // Bitwarden and Dashlane not configured
      })
      render(<AffiliateSuggestion tool="password-generator" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
      expect(screen.queryByText('Bitwarden')).not.toBeInTheDocument()
      expect(screen.queryByText('Dashlane')).not.toBeInTheDocument()
    })

    it('should handle empty partner configuration', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF: '',
      })
      const { container } = render(<AffiliateSuggestion tool="password-generator" />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Component Rendering Logic', () => {
    it('should handle undefined props gracefully', () => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF: '/ref/test',
      })
      render(<AffiliateSuggestion tool="password-generator" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<AffiliateSuggestion tool="password-generator" />)).not.toThrow()
    })
  })
})
