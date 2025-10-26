// Privacy note: Never track PII. Anonymize file names, URLs, and user inputs.

type GTagEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

type ToolEvent =
  | 'json_beautify'
  | 'json_minify'
  | 'json_copy'
  | 'json_download'
  | 'json_to_csv_convert'
  | 'json_to_csv_copy'
  | 'json_to_csv_download'
  | 'diff_compare'
  | 'diff_view_change'
  | 'markdown_preview_toggle'
  | 'markdown_export'
  | 'url_shorten'
  | 'qr_generate'
  | 'file_upload'
  | 'tool_card_click'
  | 'search_query'
  | 'category_filter'
  | 'view_mode_toggle'

// Type-safe gtag wrapper
declare global {
  interface Window {
    gtag?: (command: 'config' | 'event', targetId: string, config?: Record<string, any>) => void
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Check if GA is enabled (production + ID exists)
const isGAEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag)
}

// Log warning in development when GA ID is missing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !GA_MEASUREMENT_ID) {
  console.warn(
    '[Analytics] GA4 Measurement ID not found. Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local'
  )
}

/**
 * Track custom tool events
 * @param eventName - Tool-specific event name
 * @param params - Additional parameters (no PII)
 */
export const trackToolEvent = (
  eventName: ToolEvent,
  params?: Record<string, string | number | boolean>
): void => {
  if (!isGAEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Dev]', eventName, params)
    }
    return
  }

  window.gtag!('event', eventName, {
    ...params,
    timestamp: Date.now(),
  })
}

/**
 * Track generic events with category/label structure
 */
export const trackEvent = ({ action, category, label, value }: GTagEvent): void => {
  if (!isGAEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Dev]', { action, category, label, value })
    }
    return
  }

  window.gtag!('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

/**
 * Track page views (Next.js handles this automatically, but available if needed)
 */
export const trackPageView = (url: string): void => {
  if (!isGAEnabled()) return

  window.gtag!('config', GA_MEASUREMENT_ID!, {
    page_path: url,
  })
}

/**
 * Report Web Vitals to GA4
 * Usage: import { useReportWebVitals } from 'next/web-vitals'
 */
export const reportWebVitals = (metric: {
  id: string
  name: string
  label: string
  value: number
}): void => {
  if (!isGAEnabled()) return

  window.gtag!('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  })
}
