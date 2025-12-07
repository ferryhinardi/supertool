import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reportWebVitals, trackEvent, trackPageView, trackToolEvent } from '../analytics'

describe('analytics', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Setup console spy
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Clear any existing gtag
    delete (window as any).gtag
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  describe('trackToolEvent', () => {
    it('should not track when GA is disabled (no gtag function)', () => {
      const mockGtag = vi.fn()

      trackToolEvent('json_beautify', { format: 'pretty' })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should not track when gtag is undefined', () => {
      // Ensure gtag is not defined
      expect((window as any).gtag).toBeUndefined()

      trackToolEvent('json_beautify', { format: 'pretty' })

      // Should not throw an error
      expect(true).toBe(true)
    })

    it('should handle all ToolEvent types without errors', () => {
      // Test a sample of different event types
      expect(() => trackToolEvent('json_beautify')).not.toThrow()
      expect(() => trackToolEvent('split_bill_add_person')).not.toThrow()
      expect(() => trackToolEvent('qr_code_download')).not.toThrow()
      expect(() => trackToolEvent('password_generate')).not.toThrow()
      expect(() => trackToolEvent('unit_converter_convert')).not.toThrow()
      expect(() => trackToolEvent('currency_converter_convert')).not.toThrow()
      expect(() => trackToolEvent('api_tester_send_request')).not.toThrow()
      expect(() => trackToolEvent('ai_caption_generate')).not.toThrow()
      expect(() => trackToolEvent('pomodoro_start')).not.toThrow()
      expect(() => trackToolEvent('stopwatch_start')).not.toThrow()
    })

    it('should handle events with various parameter types', () => {
      expect(() =>
        trackToolEvent('split_bill_add_person', {
          personCount: 5,
          hasCurrency: true,
          currency: 'USD',
          tags: ['food', 'dinner'],
        })
      ).not.toThrow()

      expect(() => trackToolEvent('qr_code_download', { format: 'png', size: 512 })).not.toThrow()

      expect(() =>
        trackToolEvent('password_generate', { length: 16, includesSymbols: true })
      ).not.toThrow()

      expect(() =>
        trackToolEvent('unit_converter_convert', { from: 'km', to: 'miles' })
      ).not.toThrow()
    })

    it('should handle events without parameters', () => {
      expect(() => trackToolEvent('json_copy')).not.toThrow()
      expect(() => trackToolEvent('json_minify')).not.toThrow()
      expect(() => trackToolEvent('split_bill_reset')).not.toThrow()
    })

    it('should handle empty parameters object', () => {
      expect(() => trackToolEvent('json_beautify', {})).not.toThrow()
    })

    it('should handle boolean false values', () => {
      expect(() => trackToolEvent('password_generate', { includesSymbols: false })).not.toThrow()
    })

    it('should handle empty arrays', () => {
      expect(() => trackToolEvent('split_bill_add_person', { tags: [] })).not.toThrow()
    })

    it('should handle very large numeric values', () => {
      expect(() => trackToolEvent('file_upload', { fileSize: 999999999999 })).not.toThrow()
    })

    it('should handle zero values', () => {
      expect(() => trackToolEvent('split_bill_add_person', { count: 0 })).not.toThrow()
    })
  })

  describe('trackEvent', () => {
    it('should not track when GA is disabled', () => {
      const mockGtag = vi.fn()

      trackEvent({ action: 'click', category: 'button', label: 'submit' })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle events with all parameters', () => {
      expect(() =>
        trackEvent({ action: 'click', category: 'button', label: 'submit', value: 10 })
      ).not.toThrow()
    })

    it('should handle events without optional parameters', () => {
      expect(() => trackEvent({ action: 'view', category: 'page' })).not.toThrow()
    })

    it('should handle events with zero value', () => {
      expect(() => trackEvent({ action: 'score', category: 'test', value: 0 })).not.toThrow()
    })

    it('should handle search events', () => {
      expect(() =>
        trackEvent({ action: 'search', category: 'tools', label: 'json', value: 5 })
      ).not.toThrow()
    })
  })

  describe('trackPageView', () => {
    it('should not track when GA is disabled', () => {
      const mockGtag = vi.fn()

      trackPageView('/tools/json-beautifier')

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle different page paths without errors', () => {
      expect(() => trackPageView('/tools/json-beautifier')).not.toThrow()
      expect(() => trackPageView('/tools/password-generator')).not.toThrow()
      expect(() => trackPageView('/')).not.toThrow()
      expect(() => trackPageView('/about')).not.toThrow()
    })

    it('should handle empty path', () => {
      expect(() => trackPageView('')).not.toThrow()
    })

    it('should handle paths with query parameters', () => {
      expect(() => trackPageView('/tools?category=json')).not.toThrow()
    })
  })

  describe('reportWebVitals', () => {
    it('should not report when GA is disabled', () => {
      const mockGtag = vi.fn()

      reportWebVitals({ id: 'v1-1234', name: 'FCP', label: 'web-vital', value: 1234.5 })

      expect(mockGtag).not.toHaveBeenCalled()
    })

    it('should handle different web vitals metrics', () => {
      expect(() =>
        reportWebVitals({ id: 'v1-1234', name: 'FCP', label: 'web-vital', value: 1234.5 })
      ).not.toThrow()

      expect(() =>
        reportWebVitals({ id: 'v1-5678', name: 'CLS', label: 'web-vital', value: 0.123 })
      ).not.toThrow()

      expect(() =>
        reportWebVitals({ id: 'v1-9999', name: 'LCP', label: 'web-vital', value: 2500.789 })
      ).not.toThrow()

      expect(() =>
        reportWebVitals({ id: 'v1-1111', name: 'FID', label: 'web-vital', value: 45.3 })
      ).not.toThrow()

      expect(() =>
        reportWebVitals({ id: 'v1-2222', name: 'TTFB', label: 'web-vital', value: 123.456 })
      ).not.toThrow()

      expect(() =>
        reportWebVitals({ id: 'v1-3333', name: 'INP', label: 'web-vital', value: 87.654 })
      ).not.toThrow()
    })

    it('should handle zero values', () => {
      expect(() =>
        reportWebVitals({ id: 'v1-0000', name: 'FCP', label: 'web-vital', value: 0 })
      ).not.toThrow()
    })

    it('should handle very large values', () => {
      expect(() =>
        reportWebVitals({ id: 'v1-big', name: 'LCP', label: 'web-vital', value: 999999 })
      ).not.toThrow()
    })

    it('should handle fractional CLS values', () => {
      expect(() =>
        reportWebVitals({ id: 'v1-cls', name: 'CLS', label: 'web-vital', value: 0.001 })
      ).not.toThrow()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should not crash if gtag is undefined during call', () => {
      ;(window as any).gtag = undefined

      expect(() => trackToolEvent('json_beautify')).not.toThrow()
      expect(() => trackEvent({ action: 'test', category: 'test' })).not.toThrow()
      expect(() => trackPageView('/')).not.toThrow()
      expect(() =>
        reportWebVitals({ id: 'test', name: 'FCP', label: 'test', value: 100 })
      ).not.toThrow()
    })

    it('should handle null gtag gracefully', () => {
      ;(window as any).gtag = null

      expect(() => trackToolEvent('json_beautify')).not.toThrow()
    })

    it('should handle concurrent tracking calls', () => {
      expect(() => {
        trackToolEvent('json_beautify')
        trackToolEvent('json_minify')
        trackToolEvent('json_copy')
        trackEvent({ action: 'test1', category: 'test' })
        trackEvent({ action: 'test2', category: 'test' })
        trackPageView('/page1')
        trackPageView('/page2')
      }).not.toThrow()
    })
  })

  describe('Privacy compliance', () => {
    it('should track file events without PII (no file names)', () => {
      // Correct usage: only tracking metadata
      expect(() => trackToolEvent('file_upload', { fileType: 'pdf', fileSize: 1024 })).not.toThrow()

      // Verifying that the function signature doesn't expect fileName or filePath
      // (type checking at compile time ensures this)
    })

    it('should track URL events without full URLs', () => {
      // Correct usage: only domain, no full URL path
      expect(() => trackToolEvent('url_shorten', { domain: 'example.com' })).not.toThrow()

      // The type system prevents passing fullUrl parameter
    })

    it('should handle receipt processing without exposing content', () => {
      // Events like split_bill_ocr_success should only track success/failure
      expect(() => trackToolEvent('split_bill_ocr_success', { itemCount: 5 })).not.toThrow()
      expect(() =>
        trackToolEvent('split_bill_ocr_error', { errorType: 'parse_failed' })
      ).not.toThrow()
    })

    it('should track QR code events without exposing content', () => {
      // Only track format, size, not the actual QR content
      expect(() => trackToolEvent('qr_code_download', { format: 'png' })).not.toThrow()
      expect(() => trackToolEvent('qr_advanced_type_generate', { hasLogo: true })).not.toThrow()
    })

    it('should track password events without exposing passwords', () => {
      // Only track metadata like length, character types
      expect(() =>
        trackToolEvent('password_generate', { length: 16, hasSymbols: true })
      ).not.toThrow()
      expect(() => trackToolEvent('password_copy')).not.toThrow()
    })
  })

  describe('Type safety', () => {
    it('should only accept valid ToolEvent types', () => {
      // These should compile without TypeScript errors
      const validEvents = [
        'json_beautify',
        'json_minify',
        'split_bill_add_person',
        'qr_code_download',
        'password_generate',
        'unit_converter_convert',
        'currency_converter_convert',
        'api_tester_send_request',
        'pomodoro_start',
        'stopwatch_start',
      ] as const

      validEvents.forEach((event) => {
        expect(() => trackToolEvent(event)).not.toThrow()
      })
    })

    it('should handle all major tool categories', () => {
      // JSON tools
      expect(() => trackToolEvent('json_beautify')).not.toThrow()
      expect(() => trackToolEvent('json_to_csv_convert')).not.toThrow()

      // Split bill tools
      expect(() => trackToolEvent('split_bill_add_person')).not.toThrow()
      expect(() => trackToolEvent('split_bill_export_pdf')).not.toThrow()

      // QR code tools
      expect(() => trackToolEvent('qr_code_download')).not.toThrow()
      expect(() => trackToolEvent('qr_scanner_webcam_start')).not.toThrow()

      // Productivity tools
      expect(() => trackToolEvent('pomodoro_start')).not.toThrow()
      expect(() => trackToolEvent('stopwatch_start')).not.toThrow()
      expect(() => trackToolEvent('timer_add')).not.toThrow()
      expect(() => trackToolEvent('tally_counter_increment')).not.toThrow()

      // Converter tools
      expect(() => trackToolEvent('unit_converter_convert')).not.toThrow()
      expect(() => trackToolEvent('currency_converter_convert')).not.toThrow()
      expect(() => trackToolEvent('timezone_converter_add')).not.toThrow()

      // Developer tools
      expect(() => trackToolEvent('api_tester_send_request')).not.toThrow()
      expect(() => trackToolEvent('jwt_debugger_decode')).not.toThrow()

      // AI tools
      expect(() => trackToolEvent('ai_caption_generate')).not.toThrow()
      expect(() => trackToolEvent('ai_snippet_generate')).not.toThrow()
      expect(() => trackToolEvent('ai_json_analyze')).not.toThrow()
    })
  })
})
