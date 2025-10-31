import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AffiliateSuggestion } from '../AffiliateSuggestion'

// Mock the ads-config module
vi.mock('@/lib/ads-config', () => ({
  getAdsConfig: vi.fn(() => ({
    enabled: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
    affiliates: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === 'true',
      partners: {
        passwordManagers: {
          onePassword: process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD || '',
          bitwarden: process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN || '',
          dashlane: process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE || '',
        },
        vpn: {
          nordvpn: process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN || '',
          expressvpn: process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN || '',
        },
        imageCdn: {
          cloudinary: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY || '',
          tinypng: process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG || '',
        },
        developerTools: {
          postman: process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN || '',
          insomnia: process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA || '',
        },
        hosting: {
          cloudflare: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE || '',
          supabase: process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE || '',
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
    process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD = ''
    process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN = ''
    process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE = ''
    process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN = ''
    process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN = ''
    process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY = ''
    process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG = ''
    process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN = ''
    process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA = ''
    process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE = ''
    process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE = ''
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test',
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test1',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN: '/ref/test2',
        NEXT_PUBLIC_AFFILIATE_DASHLANE: '/ref/test3',
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
        NEXT_PUBLIC_AFFILIATE_NORDVPN: '/ref/nord',
        NEXT_PUBLIC_AFFILIATE_EXPRESSVPN: '/ref/express',
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
        NEXT_PUBLIC_AFFILIATE_CLOUDINARY: '/ref/cloudinary',
        NEXT_PUBLIC_AFFILIATE_TINYPNG: '/ref/tinypng',
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
        NEXT_PUBLIC_AFFILIATE_POSTMAN: '/ref/postman',
        NEXT_PUBLIC_AFFILIATE_INSOMNIA: '/ref/insomnia',
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
        NEXT_PUBLIC_AFFILIATE_CLOUDFLARE: '/ref/cloudflare',
        NEXT_PUBLIC_AFFILIATE_SUPABASE: '/ref/supabase',
      })
    })

    it('should show hosting suggestions for upload tool', () => {
      render(<AffiliateSuggestion tool="upload" />)
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
      expect(screen.getByText('Supabase')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    beforeEach(() => {
      mockEnv({
        NEXT_PUBLIC_ENABLE_ADS: 'true',
        NEXT_PUBLIC_ENABLE_AFFILIATES: 'true',
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test',
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
      const { container } = render(
        <AffiliateSuggestion tool="password-generator" variant="banner" />
      )
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test1',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN: '/ref/test2',
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test',
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
        NEXT_PUBLIC_AFFILIATE_NORDVPN: '/ref/nord',
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test1',
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '',
        NEXT_PUBLIC_AFFILIATE_BITWARDEN: '',
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
        NEXT_PUBLIC_AFFILIATE_1PASSWORD: '/ref/test',
      })
      render(<AffiliateSuggestion tool="password-generator" />)
      expect(screen.getByText('1Password')).toBeInTheDocument()
    })

    it('should not throw errors with minimal props', () => {
      expect(() => render(<AffiliateSuggestion tool="password-generator" />)).not.toThrow()
    })
  })
})
