/**
 * Ads Configuration Module
 * Centralized configuration for all ad networks
 */

export type AdNetwork = 'adsense' | 'carbon' | 'ethical' | 'affiliate'

export interface AdsConfig {
  enabled: boolean
  adsense: {
    enabled: boolean
    clientId: string
  }
  carbon: {
    enabled: boolean
    serveId: string
    placement: string
  }
  ethical: {
    enabled: boolean
    publisherId: string
  }
  affiliates: {
    enabled: boolean
    partners: {
      passwordManagers: {
        onePassword: string
        bitwarden: string
        dashlane: string
      }
      imageCdn: {
        cloudinary: string
        tinypng: string
      }
      developerTools: {
        postman: string
        insomnia: string
      }
      vpn: {
        nordvpn: string
        expressvpn: string
      }
      hosting: {
        vercel: string
        cloudflare: string
        supabase: string
      }
    }
  }
}

/**
 * Get the ads configuration from environment variables
 */
export function getAdsConfig(): AdsConfig {
  const masterEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true'

  return {
    enabled: masterEnabled,
    adsense: {
      enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
    },
    carbon: {
      enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_CARBON_ADS === 'true',
      serveId: process.env.NEXT_PUBLIC_CARBON_SERVE_ID || '',
      placement: process.env.NEXT_PUBLIC_CARBON_PLACEMENT || '',
    },
    ethical: {
      enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_ETHICAL_ADS === 'true',
      publisherId: process.env.NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID || '',
    },
    affiliates: {
      enabled: masterEnabled && process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === 'true',
      partners: {
        passwordManagers: {
          onePassword: process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF || '',
          bitwarden: process.env.NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF || '',
          dashlane: process.env.NEXT_PUBLIC_AFFILIATE_DASHLANE_REF || '',
        },
        imageCdn: {
          cloudinary: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF || '',
          tinypng: process.env.NEXT_PUBLIC_AFFILIATE_TINYPNG_REF || '',
        },
        developerTools: {
          postman: process.env.NEXT_PUBLIC_AFFILIATE_POSTMAN_REF || '',
          insomnia: process.env.NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF || '',
        },
        vpn: {
          nordvpn: process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_REF || '',
          expressvpn: process.env.NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF || '',
        },
        hosting: {
          vercel: process.env.NEXT_PUBLIC_AFFILIATE_VERCEL_REF || '',
          cloudflare: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF || '',
          supabase: process.env.NEXT_PUBLIC_AFFILIATE_SUPABASE_REF || '',
        },
      },
    },
  }
}

/**
 * Check if any ad network is enabled
 */
export function isAnyAdEnabled(): boolean {
  const config = getAdsConfig()
  return (
    config.enabled &&
    (config.adsense.enabled ||
      config.carbon.enabled ||
      config.ethical.enabled ||
      config.affiliates.enabled)
  )
}

/**
 * Check if a specific ad network is enabled
 */
export function isAdNetworkEnabled(network: AdNetwork): boolean {
  const config = getAdsConfig()
  if (!config.enabled) return false

  switch (network) {
    case 'adsense':
      return config.adsense.enabled && !!config.adsense.clientId
    case 'carbon':
      return config.carbon.enabled && !!config.carbon.serveId
    case 'ethical':
      return config.ethical.enabled && !!config.ethical.publisherId
    case 'affiliate':
      return config.affiliates.enabled
    default:
      return false
  }
}

/**
 * Get priority ad network (for single ad placement)
 * Priority: Carbon > Ethical > AdSense
 */
export function getPriorityAdNetwork(): AdNetwork | null {
  if (isAdNetworkEnabled('carbon')) return 'carbon'
  if (isAdNetworkEnabled('ethical')) return 'ethical'
  if (isAdNetworkEnabled('adsense')) return 'adsense'
  return null
}
