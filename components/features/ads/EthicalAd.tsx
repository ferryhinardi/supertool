'use client'

import { useEffect, useRef } from 'react'
import { getAdsConfig } from '@/lib/ads-config'
import { css } from '@/styled-system/css'

interface EthicalAdProps {
  /**
   * Custom className for styling
   */
  className?: string
  /**
   * Position identifier for analytics
   */
  position?: 'header' | 'sidebar' | 'footer' | 'content'
  /**
   * Ad type - 'image' (728x90, 300x250) or 'text'
   */
  type?: 'image' | 'text'
}

/**
 * EthicalAds component - Privacy-focused advertising for developers
 * Learn more: https://www.ethicalads.io
 */
export function EthicalAd({ className, position = 'content', type = 'image' }: EthicalAdProps) {
  const adInitialized = useRef(false)
  const config = getAdsConfig()

  useEffect(() => {
    if (!config.ethical.enabled || !config.ethical.publisherId || adInitialized.current) return

    // Load EthicalAds script
    const script = document.createElement('script')
    script.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js'
    script.async = true
    script.setAttribute('async', '')
    document.body.appendChild(script)

    adInitialized.current = true

    return () => {
      // Cleanup
      const scriptToRemove = document.querySelector(
        'script[src="https://media.ethicalads.io/media/client/ethicalads.min.js"]'
      )
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [config.ethical.enabled, config.ethical.publisherId])

  if (!config.ethical.enabled) {
    return null
  }

  // Show placeholder if no publisher ID is configured
  if (!config.ethical.publisherId) {
    return (
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minH: '150px',
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
            EthicalAds Space ({position})
          </p>
          <p
            className={css({
              fontSize: 'xs',
              color: 'gray.600',
            })}
          >
            Configure NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID to show EthicalAds
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={className}
      data-ad-position={position}
      data-ad-network="ethical"
      data-ea-publisher={config.ethical.publisherId}
      data-ea-type={type}
      style={{
        minHeight: type === 'image' ? '250px' : '150px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  )
}
