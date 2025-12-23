'use client'

import { useEffect } from 'react'
import { getAdsConfig } from '@/lib/services/ads-config'
import { css } from '@/styled-system/css'

interface AdBannerProps {
  /**
   * Ad slot ID (for Google AdSense or other ad networks)
   */
  slot?: string
  /**
   * Ad format (e.g., 'auto', 'rectangle', 'vertical', 'horizontal')
   */
  format?: string
  /**
   * Whether the ad should be responsive
   */
  responsive?: boolean
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Position identifier for analytics
   */
  position?: 'header' | 'sidebar' | 'footer' | 'content'
}

/**
 * AdBanner component - Google AdSense integration
 * Only renders ads if NEXT_PUBLIC_ENABLE_ADS and NEXT_PUBLIC_ENABLE_ADSENSE are set to 'true'
 */
export function AdBanner({
  slot = 'default-slot',
  format = 'auto',
  responsive = true,
  className,
  position = 'content',
}: AdBannerProps) {
  const config = getAdsConfig()
  const { enabled: isAdsEnabled, clientId: adsenseId } = config.adsense

  useEffect(() => {
    if (!isAdsEnabled || !adsenseId) return

    try {
      // Push ad to adsbygoogle array if using Google AdSense
      // @ts-expect-error
      if (window.adsbygoogle?.push) {
        // @ts-expect-error
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('Ad loading error:', error)
    }
  }, [isAdsEnabled, adsenseId])

  // Don't render anything if ads are disabled
  if (!isAdsEnabled) {
    return null
  }

  // Show placeholder if no ad network is configured
  if (!adsenseId) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minH: '250px',
          rounded: 'lg',
          border: '2px dashed',
          borderColor: 'gray.700',
          bg: 'rgba(17, 24, 39, 0.5)',
          backdropFilter: 'blur(8px)',
        })}
      >
        <div
          className={css({
            textAlign: 'center',
            px: '6',
            py: '4',
          })}
        >
          <p
            className={css({
              mb: '2',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.400',
            })}
          >
            Ad Space ({position})
          </p>
          <p
            className={css({
              fontSize: 'xs',
              color: 'gray.600',
            })}
          >
            Configure NEXT_PUBLIC_GOOGLE_ADSENSE_ID to show ads
          </p>
        </div>
      </div>
    )
  }

  // Render Google AdSense ad
  return (
    <div
      className={className}
      data-ad-position={position}
      style={{
        minHeight: '250px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          minHeight: '250px',
        }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

/**
 * Helper function to check if AdSense ads are enabled
 * Useful for conditional rendering in parent components
 */
export function isAdsEnabled(): boolean {
  const config = getAdsConfig()
  return config.adsense.enabled
}
