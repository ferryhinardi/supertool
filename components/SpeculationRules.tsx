'use client'

import { useEffect } from 'react'

/**
 * Speculation Rules API Integration
 *
 * Implements the Speculation Rules API to improve navigation performance by:
 * - Prefetching: Downloads response body of pages (faster than normal navigation)
 * - Prerendering: Fully loads pages in background (near-instant navigation)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API
 */
export function SpeculationRules() {
  useEffect(() => {
    // Feature detection
    if (
      typeof HTMLScriptElement === 'undefined' ||
      !HTMLScriptElement.supports ||
      !HTMLScriptElement.supports('speculationrules')
    ) {
      console.info('Speculation Rules API not supported in this browser')
      return
    }

    // Remove existing speculation rules script if any
    const existingScript = document.querySelector('script[type="speculationrules"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Create speculation rules
    const specScript = document.createElement('script')
    specScript.type = 'speculationrules'

    /**
     * Speculation Rules Configuration
     *
     * Strategy:
     * 1. Prerender: High-confidence navigations (homepage, common tools)
     * 2. Prefetch: All safe tool pages for fast subsequent loads
     *
     * Excluded patterns:
     * - Authentication pages (/auth, /login)
     * - API routes (/api/*)
     * - File upload pages (resource intensive)
     * - AI tools (may have side effects)
     * - External links (cross-origin)
     */
    const speculationRules = {
      // Prerender high-priority pages for instant navigation
      prerender: [
        {
          // List-based prerendering for critical pages
          source: 'list',
          urls: [
            '/', // Homepage - highest priority
            '/tools/json-beautify', // Most popular tool
            '/tools/password-generator', // High traffic tool
            '/tools/qr-code', // Frequently used
          ],
        },
        {
          // Document rules for intelligent prerendering
          // Prerender tool links when visible and user hovers
          source: 'document',
          where: {
            and: [
              // Match all tool pages
              { href_matches: '/tools/*' },
              // Exclude resource-intensive tools
              { not: { href_matches: '/tools/upload' } },
              { not: { href_matches: '/tools/file-inspector' } },
              { not: { href_matches: '/tools/pdf-tools' } },
              { not: { href_matches: '/tools/image-metadata' } },
              // Exclude AI tools (may have API costs)
              { not: { href_matches: '/tools/ai-*' } },
            ],
          },
          // Prerender when link becomes visible (moderate eagerness)
          eagerness: 'moderate',
        },
      ],

      // Prefetch all safe pages for fast loading
      prefetch: [
        {
          // Prefetch all internal links on hover
          source: 'document',
          where: {
            and: [
              // Match all internal links
              { href_matches: '/*' },
              // Exclude API routes
              { not: { href_matches: '/api/*' } },
              // Exclude auth pages
              { not: { href_matches: '/auth*' } },
              { not: { href_matches: '/login*' } },
              { not: { href_matches: '/logout*' } },
            ],
          },
          // Prefetch on hover (conservative approach)
          eagerness: 'moderate',
        },
      ],
    }

    specScript.textContent = JSON.stringify(speculationRules, null, 2)
    document.head.appendChild(specScript)

    console.info('✅ Speculation Rules API enabled')

    // Cleanup on unmount
    return () => {
      if (specScript.parentNode) {
        specScript.remove()
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}

/**
 * Utility: Check if current page was prefetched or prerendered
 *
 * @returns Object with prefetch and prerender status
 */
export function useSpeculationStatus() {
  if (typeof document === 'undefined') {
    return { wasPrefetched: false, wasPrerendered: false }
  }

  // Check if page was prerendered (currently being prerendered = true, was prerendered in past = false but had the property)
  const wasPrerendered = 'prerendering' in document && document.prerendering === false
  const isPrerendering = 'prerendering' in document && document.prerendering === true

  return { wasPrefetched: wasPrerendered, wasPrerendered, isPrerendering }
}

/**
 * Utility: Dynamically add speculation rules
 *
 * Use this to programmatically add speculation rules based on user behavior
 *
 * @example
 * ```tsx
 * // Prerender next page in a multi-step flow
 * addSpeculationRule({
 *   prerender: [{
 *     source: 'list',
 *     urls: ['/tools/json-beautify/step-2']
 *   }]
 * })
 * ```
 */
export function addSpeculationRule(rules: Record<string, unknown>) {
  if (
    typeof HTMLScriptElement === 'undefined' ||
    !HTMLScriptElement.supports ||
    !HTMLScriptElement.supports('speculationrules')
  ) {
    console.warn('Speculation Rules API not supported')
    return false
  }

  const specScript = document.createElement('script')
  specScript.type = 'speculationrules'
  specScript.textContent = JSON.stringify(rules)
  document.head.appendChild(specScript)

  return true
}
