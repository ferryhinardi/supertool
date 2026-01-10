import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('analytics', () => {
  const originalEnv = { ...process.env }
  let mockGtag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    mockGtag = vi.fn()

    // Suppress console.warn for clean test output
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('trackToolEvent', () => {
    it('should call gtag when GA is enabled', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('json_beautify', { size: 100 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'json_beautify', {
        size: 100,
        timestamp: expect.any(Number),
      })
    })

    it('should not call gtag when GA_MEASUREMENT_ID is missing', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('json_beautify')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not call gtag when window.gtag is undefined', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', {})

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('json_beautify')

      // Should not throw and gtag should not be called
      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should log to console in development mode when GA is disabled', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'development')

      vi.stubGlobal('window', {})

      const consoleSpy = vi.spyOn(console, 'log')

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('json_copy', { copied: true })

      expect(consoleSpy).toHaveBeenCalledWith('[Analytics Dev]', 'json_copy', { copied: true })
    })

    it('should handle event without params', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('split_bill_reset')

      expect(mockGtag).toHaveBeenCalledWith('event', 'split_bill_reset', {
        timestamp: expect.any(Number),
      })
    })

    it('should handle params with different types', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackToolEvent } = await import('../analytics')

      trackToolEvent('qr_code_download', {
        format: 'png',
        size: 256,
        hasLogo: true,
        colors: ['#000000', '#FFFFFF'],
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'qr_code_download', {
        format: 'png',
        size: 256,
        hasLogo: true,
        colors: ['#000000', '#FFFFFF'],
        timestamp: expect.any(Number),
      })
    })
  })

  describe('trackEvent', () => {
    it('should call gtag with event category and label', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackEvent } = await import('../analytics')

      trackEvent({
        action: 'click',
        category: 'button',
        label: 'submit',
        value: 1,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'button',
        event_label: 'submit',
        value: 1,
      })
    })

    it('should not call gtag when GA is disabled', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackEvent } = await import('../analytics')

      trackEvent({
        action: 'click',
        category: 'button',
      })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should log to console in development when GA is disabled', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'development')

      vi.stubGlobal('window', {})

      const consoleSpy = vi.spyOn(console, 'log')

      const { trackEvent } = await import('../analytics')

      trackEvent({
        action: 'test_action',
        category: 'test_category',
        label: 'test_label',
        value: 42,
      })

      expect(consoleSpy).toHaveBeenCalledWith('[Analytics Dev]', {
        action: 'test_action',
        category: 'test_category',
        label: 'test_label',
        value: 42,
      })
    })

    it('should handle event without optional label and value', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackEvent } = await import('../analytics')

      trackEvent({
        action: 'view',
        category: 'page',
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'view', {
        event_category: 'page',
        event_label: undefined,
        value: undefined,
      })
    })
  })

  describe('trackPageView', () => {
    it('should call gtag config with page path', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackPageView } = await import('../analytics')

      trackPageView('/tools/json-beautifier')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/tools/json-beautifier',
      })
    })

    it('should not call gtag when GA is disabled', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackPageView } = await import('../analytics')

      trackPageView('/tools/split-bill')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not call gtag when window.gtag is undefined', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', {})

      const { trackPageView } = await import('../analytics')

      trackPageView('/home')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle root path', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackPageView } = await import('../analytics')

      trackPageView('/')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/',
      })
    })

    it('should handle path with query params', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { trackPageView } = await import('../analytics')

      trackPageView('/tools/search?q=json')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/tools/search?q=json',
      })
    })
  })

  describe('reportWebVitals', () => {
    it('should report CLS metric with multiplied value', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-1234',
        name: 'CLS',
        label: 'web-vital',
        value: 0.1,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
        value: 100, // 0.1 * 1000
        event_label: 'v1-1234',
        non_interaction: true,
      })
    })

    it('should report LCP metric with rounded value', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-5678',
        name: 'LCP',
        label: 'web-vital',
        value: 2345.67,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'LCP', {
        value: 2346, // Rounded
        event_label: 'v1-5678',
        non_interaction: true,
      })
    })

    it('should report FID metric with rounded value', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-9999',
        name: 'FID',
        label: 'web-vital',
        value: 15.3,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'FID', {
        value: 15,
        event_label: 'v1-9999',
        non_interaction: true,
      })
    })

    it('should report TTFB metric', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-ttfb',
        name: 'TTFB',
        label: 'web-vital',
        value: 800.5,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'TTFB', {
        value: 801,
        event_label: 'v1-ttfb',
        non_interaction: true,
      })
    })

    it('should not report when GA is disabled', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-1234',
        name: 'CLS',
        label: 'web-vital',
        value: 0.1,
      })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not report when window.gtag is undefined', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', {})

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-1234',
        name: 'LCP',
        label: 'web-vital',
        value: 2500,
      })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should report INP metric', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      vi.stubGlobal('window', { gtag: mockGtag })

      const { reportWebVitals } = await import('../analytics')

      reportWebVitals({
        id: 'v1-inp',
        name: 'INP',
        label: 'web-vital',
        value: 200.25,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'INP', {
        value: 200,
        event_label: 'v1-inp',
        non_interaction: true,
      })
    })
  })

  describe('development warning', () => {
    it('should log warning in development when GA_MEASUREMENT_ID is missing', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      vi.stubEnv('NODE_ENV', 'development')

      const consoleSpy = vi.spyOn(console, 'warn')
      vi.stubGlobal('window', {})

      await import('../analytics')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] GA4 Measurement ID not found. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle undefined window gracefully', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      // Don't stub window - let it be undefined in this test context
      vi.stubGlobal('window', undefined)

      const { trackToolEvent } = await import('../analytics')

      // Should not throw
      expect(() => trackToolEvent('json_beautify')).not.toThrow()
    })

    it('should handle gtag being called with optional chaining', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123'
      vi.stubEnv('NODE_ENV', 'production')

      // Window exists but gtag is null
      vi.stubGlobal('window', { gtag: null })

      const { trackToolEvent, trackEvent, trackPageView, reportWebVitals } = await import(
        '../analytics'
      )

      // None of these should throw
      expect(() => trackToolEvent('json_beautify')).not.toThrow()
      expect(() => trackEvent({ action: 'test', category: 'test' })).not.toThrow()
      expect(() => trackPageView('/test')).not.toThrow()
      expect(() =>
        reportWebVitals({ id: 'test', name: 'CLS', label: 'test', value: 0.1 })
      ).not.toThrow()
    })
  })
})
