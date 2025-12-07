import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type AdNetwork,
  type AdsConfig,
  getAdsConfig,
  getPriorityAdNetwork,
  isAdNetworkEnabled,
  isAnyAdEnabled,
} from '../ads-config'

describe('ads-config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getAdsConfig', () => {
    it('should return disabled config when master flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      const config = getAdsConfig()

      expect(config.enabled).toBe(false)
      expect(config.adsense.enabled).toBe(false)
      expect(config.carbon.enabled).toBe(false)
      expect(config.ethical.enabled).toBe(false)
      expect(config.affiliates.enabled).toBe(false)
    })

    it('should return enabled adsense config when flags are set', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123456'

      const config = getAdsConfig()

      expect(config.enabled).toBe(true)
      expect(config.adsense.enabled).toBe(true)
      expect(config.adsense.clientId).toBe('ca-pub-123456')
    })

    it('should return enabled carbon config when flags are set', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'SERVE123'
      process.env.NEXT_PUBLIC_CARBON_PLACEMENT = 'sidebar'

      const config = getAdsConfig()

      expect(config.carbon.enabled).toBe(true)
      expect(config.carbon.serveId).toBe('SERVE123')
      expect(config.carbon.placement).toBe('sidebar')
    })

    it('should return enabled ethical ads config when flags are set', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'PUB123'

      const config = getAdsConfig()

      expect(config.ethical.enabled).toBe(true)
      expect(config.ethical.publisherId).toBe('PUB123')
    })

    it('should return enabled affiliates config with all partners', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'
      process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF = 'ref1'
      process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF = 'ref2'
      process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF = 'ref3'

      const config = getAdsConfig()

      expect(config.affiliates.enabled).toBe(true)
      expect(config.affiliates.partners.passwordManagers.onePassword).toBe('ref1')
      expect(config.affiliates.partners.passwordManagers.bitwarden).toBe('ref2')
      expect(config.affiliates.partners.imageCdn.cloudinary).toBe('ref3')
    })

    it('should return empty strings for missing env vars', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      // No clientId set

      const config = getAdsConfig()

      expect(config.adsense.enabled).toBe(true)
      expect(config.adsense.clientId).toBe('')
    })

    it('should disable individual networks when master flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'

      const config = getAdsConfig()

      expect(config.adsense.enabled).toBe(false)
      expect(config.carbon.enabled).toBe(false)
    })

    it('should return complete config structure', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      const config = getAdsConfig()

      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('adsense')
      expect(config).toHaveProperty('carbon')
      expect(config).toHaveProperty('ethical')
      expect(config).toHaveProperty('affiliates')
      expect(config.affiliates).toHaveProperty('partners')
      expect(config.affiliates.partners).toHaveProperty('passwordManagers')
      expect(config.affiliates.partners).toHaveProperty('imageCdn')
      expect(config.affiliates.partners).toHaveProperty('developerTools')
      expect(config.affiliates.partners).toHaveProperty('vpn')
      expect(config.affiliates.partners).toHaveProperty('hosting')
    })
  })

  describe('isAnyAdEnabled', () => {
    it('should return false when master flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      expect(isAnyAdEnabled()).toBe(false)
    })

    it('should return true when adsense is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when carbon is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when ethical ads is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when affiliates is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return false when master is on but no networks enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      // No individual networks enabled

      expect(isAnyAdEnabled()).toBe(false)
    })
  })

  describe('isAdNetworkEnabled', () => {
    it('should return false for adsense when master flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      expect(isAdNetworkEnabled('adsense')).toBe(false)
    })

    it('should return true for adsense when enabled with clientId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      expect(isAdNetworkEnabled('adsense')).toBe(true)
    })

    it('should return false for adsense when enabled but no clientId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      // No clientId

      expect(isAdNetworkEnabled('adsense')).toBe(false)
    })

    it('should return true for carbon when enabled with serveId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'SERVE123'

      expect(isAdNetworkEnabled('carbon')).toBe(true)
    })

    it('should return false for carbon when enabled but no serveId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      // No serveId

      expect(isAdNetworkEnabled('carbon')).toBe(false)
    })

    it('should return true for ethical when enabled with publisherId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'PUB123'

      expect(isAdNetworkEnabled('ethical')).toBe(true)
    })

    it('should return false for ethical when enabled but no publisherId', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      // No publisherId

      expect(isAdNetworkEnabled('ethical')).toBe(false)
    })

    it('should return true for affiliate when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

      expect(isAdNetworkEnabled('affiliate')).toBe(true)
    })

    it('should return false for affiliate when not enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'false'

      expect(isAdNetworkEnabled('affiliate')).toBe(false)
    })

    it('should return false for unknown network', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      expect(isAdNetworkEnabled('unknown' as AdNetwork)).toBe(false)
    })
  })

  describe('getPriorityAdNetwork', () => {
    it('should return carbon as highest priority', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'SERVE123'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'PUB123'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      expect(getPriorityAdNetwork()).toBe('carbon')
    })

    it('should return ethical when carbon not available', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'PUB123'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      expect(getPriorityAdNetwork()).toBe('ethical')
    })

    it('should return adsense when carbon and ethical not available', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      expect(getPriorityAdNetwork()).toBe('adsense')
    })

    it('should return null when no ad networks are enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      expect(getPriorityAdNetwork()).toBeNull()
    })

    it('should return null when master flag is off', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'SERVE123'

      expect(getPriorityAdNetwork()).toBeNull()
    })

    it('should skip carbon if no serveId provided', () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      // No serveId
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'PUB123'

      expect(getPriorityAdNetwork()).toBe('ethical')
    })
  })

  describe('Type definitions', () => {
    it('should define AdNetwork type', () => {
      const networks: AdNetwork[] = ['adsense', 'carbon', 'ethical', 'affiliate']
      expect(networks).toHaveLength(4)
    })

    it('should define AdsConfig interface structure', () => {
      const config: AdsConfig = {
        enabled: true,
        adsense: { enabled: true, clientId: 'test' },
        carbon: { enabled: true, serveId: 'test', placement: 'test' },
        ethical: { enabled: true, publisherId: 'test' },
        affiliates: {
          enabled: true,
          partners: {
            passwordManagers: { onePassword: '', bitwarden: '', dashlane: '' },
            imageCdn: { cloudinary: '', tinypng: '' },
            developerTools: { postman: '', insomnia: '' },
            vpn: { nordvpn: '', expressvpn: '' },
            hosting: { vercel: '', cloudflare: '', supabase: '' },
          },
        },
      }

      expect(config.enabled).toBe(true)
      expect(config.affiliates.partners).toHaveProperty('passwordManagers')
    })
  })
})
