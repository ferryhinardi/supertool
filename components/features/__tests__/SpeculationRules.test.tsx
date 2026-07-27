import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addSpeculationRule,
  SpeculationRules,
  useSpeculationStatus,
} from '@/components/features/SpeculationRules'

function StatusProbe() {
  const status = useSpeculationStatus()
  return (
    <div>
      <span>{status.wasPrefetched ? 'prefetched' : 'not-prefetched'}</span>
      <span>{status.wasPrerendered ? 'prerendered' : 'not-prerendered'}</span>
      <span>{status.isPrerendering ? 'prerendering' : 'not-prerendering'}</span>
    </div>
  )
}

describe('SpeculationRules', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.querySelectorAll('script[type="speculationrules"]').forEach((node) => {
      node.remove()
    })
    Reflect.deleteProperty(document as Document & Record<string, unknown>, 'prerendering')
  })

  const setSupports = (value: boolean) => {
    Object.defineProperty(HTMLScriptElement, 'supports', {
      configurable: true,
      value: vi.fn((type: string) => type === 'speculationrules' && value),
    })
  }

  it('does nothing when the browser does not support speculation rules', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    setSupports(false)

    render(<SpeculationRules />)

    expect(document.head.querySelector('script[type="speculationrules"]')).not.toBeInTheDocument()
    expect(infoSpy).toHaveBeenCalledWith('Speculation Rules API not supported in this browser')
  })

  it('injects and cleans up the speculation rules script when supported', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    setSupports(true)

    const { unmount } = render(<SpeculationRules />)

    const script = document.head.querySelector('script[type="speculationrules"]')
    expect(script).toBeInTheDocument()
    expect(script?.textContent).toContain('prerender')
    expect(script?.textContent).toContain('/tools/json-beautify')
    expect(infoSpy).toHaveBeenCalledWith('✅ Speculation Rules API enabled')

    unmount()

    expect(document.head.querySelector('script[type="speculationrules"]')).not.toBeInTheDocument()
  })

  it('replaces an existing speculation rules script before injecting a new one', () => {
    setSupports(true)

    const existingScript = document.createElement('script')
    existingScript.type = 'speculationrules'
    existingScript.textContent = '{"prefetch":[]}'
    document.head.appendChild(existingScript)

    render(<SpeculationRules />)

    const scripts = document.head.querySelectorAll('script[type="speculationrules"]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0]).not.toBe(existingScript)
    expect(scripts[0]?.textContent).toContain('prerender')
  })

  it('reports prerendering status through the hook', () => {
    Object.defineProperty(document, 'prerendering', {
      configurable: true,
      value: true,
    })

    render(<StatusProbe />)

    expect(screen.getByText('not-prefetched')).toBeInTheDocument()
    expect(screen.getByText('not-prerendered')).toBeInTheDocument()
    expect(screen.getByText('prerendering')).toBeInTheDocument()
  })

  it('adds ad-hoc speculation rules when supported', () => {
    setSupports(true)

    const result = addSpeculationRule({
      prefetch: [{ source: 'list', urls: ['/tools/json-beautify'] }],
    })

    expect(result).toBe(true)
    expect(document.head.querySelector('script[type="speculationrules"]')?.textContent).toContain(
      '/tools/json-beautify'
    )
  })

  it('returns false for ad-hoc rules when unsupported', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    setSupports(false)

    const result = addSpeculationRule({ prefetch: [] })

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledWith('Speculation Rules API not supported')
  })

  it('returns a safe default status when document is unavailable', () => {
    const originalDocument = globalThis.document

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: undefined,
    })

    expect(useSpeculationStatus()).toEqual({
      wasPrefetched: false,
      wasPrerendered: false,
      isPrerendering: false,
    })

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: originalDocument,
    })
  })
})
