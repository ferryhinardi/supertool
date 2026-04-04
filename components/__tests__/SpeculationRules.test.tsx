import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addSpeculationRule,
  SpeculationRules,
  useSpeculationStatus,
} from '../features/SpeculationRules'

describe('SpeculationRules', () => {
  beforeEach(() => {
    // Mock HTMLScriptElement.supports
    if (!HTMLScriptElement.supports) {
      HTMLScriptElement.supports = vi.fn()
    }
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(true)

    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Clean up all speculation rules scripts
    document.querySelectorAll('script[type="speculationrules"]').forEach((script) => {
      script.remove()
    })

    vi.restoreAllMocks()
  })

  it('should add speculation rules script to document head', async () => {
    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      expect(script).toBeInTheDocument()
      expect(script?.parentElement).toBe(document.head)
    })
  })

  it('should include correct speculation rules structure', async () => {
    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      expect(script).toBeInTheDocument()

      const rules = JSON.parse(script?.textContent || '{}')

      // Check prerender rules exist
      expect(rules).toHaveProperty('prerender')
      expect(Array.isArray(rules.prerender)).toBe(true)

      // Check prefetch rules exist
      expect(rules).toHaveProperty('prefetch')
      expect(Array.isArray(rules.prefetch)).toBe(true)
    })
  })

  it('should prerender high-priority pages', async () => {
    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      const rules = JSON.parse(script?.textContent || '{}')

      // Find list-based prerender rule
      // biome-ignore lint/suspicious/noExplicitAny: Testing dynamic JSON structure
      const listPrerender = rules.prerender.find((rule: any) => rule.source === 'list')

      expect(listPrerender).toBeDefined()
      expect(listPrerender.urls).toContain('/')
      expect(listPrerender.urls).toContain('/tools/json-beautify')
      expect(listPrerender.urls).toContain('/tools/password-generator')
      expect(listPrerender.urls).toContain('/tools/qr-code')
    })
  })

  it('should exclude resource-intensive tools from prerendering', async () => {
    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      const rules = JSON.parse(script?.textContent || '{}')

      // Find document-based prerender rule
      // biome-ignore lint/suspicious/noExplicitAny: Testing dynamic JSON structure
      const docPrerender = rules.prerender.find((rule: any) => rule.source === 'document')

      expect(docPrerender).toBeDefined()
      expect(docPrerender.where.and).toContainEqual({
        not: { href_matches: '/tools/upload' },
      })
      expect(docPrerender.where.and).toContainEqual({
        not: { href_matches: '/tools/file-inspector' },
      })
      expect(docPrerender.where.and).toContainEqual({
        not: { href_matches: '/tools/pdf-tools' },
      })
      expect(docPrerender.where.and).toContainEqual({
        not: { href_matches: '/tools/ai-*' },
      })
    })
  })

  it('should prefetch all safe internal pages', async () => {
    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      const rules = JSON.parse(script?.textContent || '{}')

      // Check prefetch rules
      expect(rules.prefetch.length).toBeGreaterThan(0)

      const mainPrefetch = rules.prefetch[0]
      expect(mainPrefetch.where.and).toContainEqual({ href_matches: '/*' })
      expect(mainPrefetch.where.and).toContainEqual({ not: { href_matches: '/api/*' } })
      expect(mainPrefetch.where.and).toContainEqual({ not: { href_matches: '/auth*' } })
    })
  })

  it('should log success message when enabled', async () => {
    const consoleSpy = vi.spyOn(console, 'info')

    render(<SpeculationRules />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('✅ Speculation Rules API enabled')
    })
  })

  it('should not add speculation rules if API is not supported', async () => {
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(false)

    render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      expect(script).not.toBeInTheDocument()
    })
  })

  it('should log info message when API is not supported', async () => {
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(false)
    const consoleSpy = vi.spyOn(console, 'info')

    render(<SpeculationRules />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Speculation Rules API not supported in this browser')
    })
  })

  it('should remove existing speculation rules before adding new ones', async () => {
    // Add an existing script
    const existingScript = document.createElement('script')
    existingScript.type = 'speculationrules'
    existingScript.textContent = JSON.stringify({ test: 'old' })
    document.head.appendChild(existingScript)

    render(<SpeculationRules />)

    await waitFor(() => {
      const scripts = document.querySelectorAll('script[type="speculationrules"]')
      // Should only have one script (the new one)
      expect(scripts.length).toBe(1)

      const rules = JSON.parse(scripts[0].textContent || '{}')
      expect(rules).not.toHaveProperty('test')
      expect(rules).toHaveProperty('prerender')
    })
  })

  it('should clean up script on unmount', async () => {
    const { unmount } = render(<SpeculationRules />)

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      expect(script).toBeInTheDocument()
    })

    unmount()

    await waitFor(() => {
      const script = document.querySelector('script[type="speculationrules"]')
      expect(script).not.toBeInTheDocument()
    })
  })
})

describe('addSpeculationRule', () => {
  beforeEach(() => {
    if (!HTMLScriptElement.supports) {
      HTMLScriptElement.supports = vi.fn()
    }
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(true)
  })

  afterEach(() => {
    document.querySelectorAll('script[type="speculationrules"]').forEach((script) => {
      script.remove()
    })
    vi.restoreAllMocks()
  })

  it('should add custom speculation rule', () => {
    const customRule = {
      prerender: [
        {
          source: 'list',
          urls: ['/custom-page'],
        },
      ],
    }

    const result = addSpeculationRule(customRule)

    expect(result).toBe(true)

    const scripts = document.querySelectorAll('script[type="speculationrules"]')
    const lastScript = scripts[scripts.length - 1]

    const rules = JSON.parse(lastScript.textContent || '{}')
    expect(rules).toEqual(customRule)
  })

  it('should return false if API is not supported', () => {
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(false)

    const result = addSpeculationRule({ test: 'rule' })

    expect(result).toBe(false)
  })

  it('should log warning if API is not supported', () => {
    vi.mocked(HTMLScriptElement.supports).mockReturnValue(false)
    const consoleSpy = vi.spyOn(console, 'warn')

    addSpeculationRule({ test: 'rule' })

    expect(consoleSpy).toHaveBeenCalledWith('Speculation Rules API not supported')
  })
})

describe('useSpeculationStatus', () => {
  it('should return false values in non-browser environment', () => {
    const status = useSpeculationStatus()

    expect(status).toEqual({
      wasPrefetched: false,
      wasPrerendered: false,
      isPrerendering: false,
    })
  })

  it('should detect if page was prerendered (completed)', () => {
    // Mock document.prerendering = false means it was prerendered but activation is complete
    Object.defineProperty(document, 'prerendering', {
      value: false,
      writable: true,
      configurable: true,
    })

    const status = useSpeculationStatus()

    expect(status.wasPrefetched).toBe(false)
    expect(status.wasPrerendered).toBe(true)
    expect(status.isPrerendering).toBe(false)
  })

  it('should detect if page is being prerendered', () => {
    Object.defineProperty(document, 'prerendering', {
      value: true,
      writable: true,
      configurable: true,
    })

    const status = useSpeculationStatus()

    expect(status.wasPrefetched).toBe(false)
    expect(status.wasPrerendered).toBe(false)
    expect(status.isPrerendering).toBe(true)
  })
})
