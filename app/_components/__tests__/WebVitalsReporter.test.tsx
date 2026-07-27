import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockUsePathname,
  mockReportWebVitals,
  mockTrackToolEvent,
  mockOnCLS,
  mockOnINP,
  mockOnLCP,
  mockOnFCP,
  mockOnTTFB,
} = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/'),
  mockReportWebVitals: vi.fn(),
  mockTrackToolEvent: vi.fn(),
  mockOnCLS: vi.fn(),
  mockOnINP: vi.fn(),
  mockOnLCP: vi.fn(),
  mockOnFCP: vi.fn(),
  mockOnTTFB: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

vi.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onINP: mockOnINP,
  onLCP: mockOnLCP,
  onFCP: mockOnFCP,
  onTTFB: mockOnTTFB,
}))

vi.mock('@/lib/services/analytics', () => ({
  reportWebVitals: mockReportWebVitals,
  trackToolEvent: mockTrackToolEvent,
}))

import WebVitalsReporter from '../WebVitalsReporter'

describe('WebVitalsReporter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
  })

  it('subscribes to the supported web vitals on mount', () => {
    render(<WebVitalsReporter />)

    expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function))
    expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function))
    expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function))
    expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function))
    expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function))
  })

  it('reports metrics and forwards anonymized tool slug context', () => {
    mockUsePathname.mockReturnValue('/tools/development/api-tester')

    render(<WebVitalsReporter />)

    const handleLcp = mockOnLCP.mock.calls[0]?.[0]
    const metric = {
      id: 'metric-lcp-1',
      name: 'LCP',
      label: 'web-vital',
      value: 1234.56,
    }

    handleLcp(metric)

    expect(mockReportWebVitals).toHaveBeenCalledWith(metric)
    expect(mockTrackToolEvent).toHaveBeenCalledWith('web_vitals', {
      metric: 'LCP',
      tool_slug: 'development-api-tester',
      value: 1235,
    })
  })

  it('uses a site fallback label for non-tool routes', () => {
    mockUsePathname.mockReturnValue('/')

    render(<WebVitalsReporter />)

    const handleCls = mockOnCLS.mock.calls[0]?.[0]

    handleCls({
      id: 'metric-cls-1',
      name: 'CLS',
      label: 'web-vital',
      value: 0.123,
    })

    expect(mockTrackToolEvent).toHaveBeenCalledWith('web_vitals', {
      metric: 'CLS',
      tool_slug: 'site',
      value: 123,
    })
  })
})
