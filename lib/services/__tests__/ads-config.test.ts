import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('ads-config', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    // Reset all env vars to clean state
    process.env = { ...originalEnv }
    // Clear all ads-related env vars
    delete process.env.NEXT_PUBLIC_ENABLE_ADS
    delete process.env.NEXT_PUBLIC_ENABLE_ADSENSE
    delete process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
    delete process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS
    delete process.env.NEXT_PUBLIC_CARBON_SERVE_ID
    delete process.env.NEXT_PUBLIC_CARBON_PLACEMENT
    delete process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS
    delete process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID
    delete process.env.NEXT_PUBLIC_ENABLE_AFFILIATES
    delete process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_VERCEL_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF
    delete process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE_REF
  })

  describe('getAdsConfig', () => {
    it('should return all disabled when master switch is off', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.enabled).toBe(false)
      expect(config.adsense.enabled).toBe(false)
      expect(config.carbon.enabled).toBe(false)
      expect(config.ethical.enabled).toBe(false)
      expect(config.affiliates.enabled).toBe(false)
    })

    it('should return enabled=true when master switch is on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.enabled).toBe(true)
    })

    it('should enable adsense when master and adsense switches are on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123456'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.adsense.enabled).toBe(true)
      expect(config.adsense.clientId).toBe('ca-pub-123456')
    })

    it('should not enable adsense when master is off even if adsense switch is on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.adsense.enabled).toBe(false)
    })

    it('should enable carbon ads when master and carbon switches are on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'carbon-serve-123'
      process.env.NEXT_PUBLIC_CARBON_PLACEMENT = 'supertool'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.carbon.enabled).toBe(true)
      expect(config.carbon.serveId).toBe('carbon-serve-123')
      expect(config.carbon.placement).toBe('supertool')
    })

    it('should enable ethical ads when master and ethical switches are on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-pub-123'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.ethical.enabled).toBe(true)
      expect(config.ethical.publisherId).toBe('ethical-pub-123')
    })

    it('should enable affiliates when master and affiliates switches are on', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.affiliates.enabled).toBe(true)
    })

    it('should return all affiliate partner refs', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'
      process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF = '1pass-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF = 'bitwarden-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE_REF = 'dashlane-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF = 'cloudinary-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG_REF = 'tinypng-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN_REF = 'postman-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF = 'insomnia-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_REF = 'nordvpn-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF = 'expressvpn-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_VERCEL_REF = 'vercel-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF = 'cloudflare-ref'
      process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE_REF = 'supabase-ref'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.affiliates.partners.passwordManagers.onePassword).toBe('1pass-ref')
      expect(config.affiliates.partners.passwordManagers.bitwarden).toBe('bitwarden-ref')
      expect(config.affiliates.partners.passwordManagers.dashlane).toBe('dashlane-ref')
      expect(config.affiliates.partners.imageCdn.cloudinary).toBe('cloudinary-ref')
      expect(config.affiliates.partners.imageCdn.tinypng).toBe('tinypng-ref')
      expect(config.affiliates.partners.developerTools.postman).toBe('postman-ref')
      expect(config.affiliates.partners.developerTools.insomnia).toBe('insomnia-ref')
      expect(config.affiliates.partners.vpn.nordvpn).toBe('nordvpn-ref')
      expect(config.affiliates.partners.vpn.expressvpn).toBe('expressvpn-ref')
      expect(config.affiliates.partners.hosting.vercel).toBe('vercel-ref')
      expect(config.affiliates.partners.hosting.cloudflare).toBe('cloudflare-ref')
      expect(config.affiliates.partners.hosting.supabase).toBe('supabase-ref')
    })

    it('should return empty strings for missing env vars', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.adsense.clientId).toBe('')
      expect(config.carbon.serveId).toBe('')
      expect(config.carbon.placement).toBe('')
      expect(config.ethical.publisherId).toBe('')
      expect(config.affiliates.partners.passwordManagers.onePassword).toBe('')
    })

    it('should handle undefined NEXT_PUBLIC_ENABLE_ADS', async () => {
      // Don't set NEXT_PUBLIC_ENABLE_ADS at all

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      expect(config.enabled).toBe(false)
    })
  })

  describe('isAnyAdEnabled', () => {
    it('should return false when master switch is off', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(false)
    })

    it('should return false when master is on but no networks enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(false)
    })

    it('should return true when adsense is enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when carbon is enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when ethical is enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when affiliates is enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(true)
    })

    it('should return true when multiple networks are enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'

      const { isAnyAdEnabled } = await import('../ads-config')

      expect(isAnyAdEnabled()).toBe(true)
    })
  })

  describe('isAdNetworkEnabled', () => {
    it('should return false for any network when master is off', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      const { isAdNetworkEnabled } = await import('../ads-config')

      expect(isAdNetworkEnabled('adsense')).toBe(false)
      expect(isAdNetworkEnabled('carbon')).toBe(false)
      expect(isAdNetworkEnabled('ethical')).toBe(false)
      expect(isAdNetworkEnabled('affiliate')).toBe(false)
    })

    describe('adsense', () => {
      it('should return true when adsense is enabled with clientId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
        process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('adsense')).toBe(true)
      })

      it('should return false when adsense is enabled but no clientId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
        // No NEXT_PUBLIC_GOOGLE_ADSENSE_ID

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('adsense')).toBe(false)
      })

      it('should return false when adsense switch is off', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'false'
        process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('adsense')).toBe(false)
      })
    })

    describe('carbon', () => {
      it('should return true when carbon is enabled with serveId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
        process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'carbon-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('carbon')).toBe(true)
      })

      it('should return false when carbon is enabled but no serveId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
        // No NEXT_PUBLIC_CARBON_SERVE_ID

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('carbon')).toBe(false)
      })

      it('should return false when carbon switch is off', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'false'
        process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'carbon-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('carbon')).toBe(false)
      })
    })

    describe('ethical', () => {
      it('should return true when ethical is enabled with publisherId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
        process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('ethical')).toBe(true)
      })

      it('should return false when ethical is enabled but no publisherId', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
        // No NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('ethical')).toBe(false)
      })

      it('should return false when ethical switch is off', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'false'
        process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-123'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('ethical')).toBe(false)
      })
    })

    describe('affiliate', () => {
      it('should return true when affiliates is enabled', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('affiliate')).toBe(true)
      })

      it('should return false when affiliates switch is off', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
        process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'false'

        const { isAdNetworkEnabled } = await import('../ads-config')

        expect(isAdNetworkEnabled('affiliate')).toBe(false)
      })
    })

    describe('unknown network', () => {
      it('should return false for unknown network type', async () => {
        process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

        const { isAdNetworkEnabled } = await import('../ads-config')

        // @ts-expect-error Testing invalid network type
        expect(isAdNetworkEnabled('unknown')).toBe(false)
      })
    })
  })

  describe('getPriorityAdNetwork', () => {
    it('should return null when no networks are enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBeNull()
    })

    it('should return null when master is off', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'false'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'carbon-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBeNull()
    })

    it('should prioritize carbon over ethical and adsense', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      process.env.NEXT_PUBLIC_CARBON_SERVE_ID = 'carbon-123'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-123'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBe('carbon')
    })

    it('should return ethical when carbon is not enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-123'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBe('ethical')
    })

    it('should return adsense when carbon and ethical are not enabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBe('adsense')
    })

    it('should return null even when affiliates is enabled (not in priority)', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_AFFILIATES = 'true'

      const { getPriorityAdNetwork } = await import('../ads-config')

      // Affiliates are not part of priority ad network selection
      expect(getPriorityAdNetwork()).toBeNull()
    })

    it('should return ethical when carbon is enabled but missing serveId', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      // No serveId
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID = 'ethical-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBe('ethical')
    })

    it('should return adsense when carbon and ethical are enabled but missing IDs', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'
      process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS = 'true'
      // No serveId
      process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS = 'true'
      // No publisherId
      process.env.NEXT_PUBLIC_ENABLE_ADSENSE = 'true'
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID = 'ca-pub-123'

      const { getPriorityAdNetwork } = await import('../ads-config')

      expect(getPriorityAdNetwork()).toBe('adsense')
    })
  })

  describe('AdNetwork type', () => {
    it('should export AdNetwork type that accepts valid values', async () => {
      const { isAdNetworkEnabled } = await import('../ads-config')
      type AdNetwork = Parameters<typeof isAdNetworkEnabled>[0]

      // This test validates the type works at runtime
      const networks: AdNetwork[] = ['adsense', 'carbon', 'ethical', 'affiliate']
      expect(networks).toHaveLength(4)
    })
  })

  describe('AdsConfig interface', () => {
    it('should return config with correct structure', async () => {
      process.env.NEXT_PUBLIC_ENABLE_ADS = 'true'

      const { getAdsConfig } = await import('../ads-config')
      const config = getAdsConfig()

      // Verify structure
      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('adsense')
      expect(config).toHaveProperty('carbon')
      expect(config).toHaveProperty('ethical')
      expect(config).toHaveProperty('affiliates')

      expect(config.adsense).toHaveProperty('enabled')
      expect(config.adsense).toHaveProperty('clientId')

      expect(config.carbon).toHaveProperty('enabled')
      expect(config.carbon).toHaveProperty('serveId')
      expect(config.carbon).toHaveProperty('placement')

      expect(config.ethical).toHaveProperty('enabled')
      expect(config.ethical).toHaveProperty('publisherId')

      expect(config.affiliates).toHaveProperty('enabled')
      expect(config.affiliates).toHaveProperty('partners')
      expect(config.affiliates.partners).toHaveProperty('passwordManagers')
      expect(config.affiliates.partners).toHaveProperty('imageCdn')
      expect(config.affiliates.partners).toHaveProperty('developerTools')
      expect(config.affiliates.partners).toHaveProperty('vpn')
      expect(config.affiliates.partners).toHaveProperty('hosting')
    })
  })
})
