'use client'

import { useEffect, useRef } from 'react'
import { getAdsConfig } from '@/lib/services/ads-config'
import { css } from '@/styled-system/css'

interface CarbonAdProps {
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
 * Carbon Ads component - Developer-focused advertising
 * Learn more: https://www.carbonads.net
 */
export function CarbonAd({ className, position = 'content' }: CarbonAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)
  const config = getAdsConfig()

  useEffect(() => {
    if (!config.carbon.enabled || !config.carbon.serveId) return

    // Clean up existing script if any
    const existingScript = document.getElementById('_carbonads_js')
    if (existingScript) {
      existingScript.remove()
    }

    // Create and inject Carbon Ads script
    const script = document.createElement('script')
    script.src = `//cdn.carbonads.com/carbon.js?serve=${config.carbon.serveId}&placement=${config.carbon.placement}`
    script.id = '_carbonads_js'
    script.async = true
    script.setAttribute('async', '')

    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script)
    }

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.getElementById('_carbonads_js')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
      // Remove the ad container that Carbon creates
      const carbonContainer = document.querySelector('#carbonads')
      if (carbonContainer) {
        carbonContainer.remove()
      }
    }
  }, [config.carbon.enabled, config.carbon.serveId, config.carbon.placement])

  if (!config.carbon.enabled) {
    return null
  }

  // Show placeholder if no serve ID is configured
  if (!config.carbon.serveId) {
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
            Carbon Ad Space ({position})
          </p>
          <p
            className={css({
              fontSize: 'xs',
              color: 'gray.600',
            })}
          >
            Configure NEXT_PUBLIC_CARBON_SERVE_ID to show Carbon Ads
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={adContainerRef}
      className={className}
      data-ad-position={position}
      data-ad-network="carbon"
    />
  )
}
