'use client'

import { getPriorityAdNetwork, isAnyAdEnabled } from '@/lib/ads-config'
import { AdBanner } from './AdBanner'
import { CarbonAd } from './CarbonAd'
import { EthicalAd } from './EthicalAd'

interface AdContainerProps {
  /**
   * Position identifier for analytics
   */
  position?: 'header' | 'sidebar' | 'footer' | 'content'
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Ad slot ID (for Google AdSense)
   */
  slot?: string
  /**
   * Force a specific ad network (optional)
   */
  forceNetwork?: 'adsense' | 'carbon' | 'ethical' | null
}

/**
 * Unified Ad Container Component
 * Automatically selects the best ad network based on configuration
 * Priority: Carbon > Ethical > AdSense
 */
export function AdContainer({
  position = 'content',
  className,
  slot,
  forceNetwork = null,
}: AdContainerProps) {
  // Check if any ads are enabled
  if (!isAnyAdEnabled()) {
    return null
  }

  // Use forced network if specified
  const network = forceNetwork || getPriorityAdNetwork()

  // Render the appropriate ad component
  switch (network) {
    case 'carbon':
      return <CarbonAd position={position} className={className} />

    case 'ethical':
      return <EthicalAd position={position} className={className} type="image" />

    case 'adsense':
      return (
        <AdBanner
          position={position}
          className={className}
          slot={slot || `${position}-ad`}
          format="auto"
          responsive={true}
        />
      )

    default:
      return null
  }
}
