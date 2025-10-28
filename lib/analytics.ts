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
  | 'split_bill_add_person'
  | 'split_bill_remove_person'
  | 'split_bill_share'
  | 'split_bill_copy'
  | 'split_bill_reset'
  | 'split_bill_currency_change'
  | 'split_bill_scan_receipt'
  | 'split_bill_upload_receipt'
  | 'split_bill_ocr_success'
  | 'split_bill_ocr_error'
  | 'qr_code_type_change'
  | 'qr_code_download'
  | 'qr_code_copy'
  | 'diff_compare'
  | 'diff_view_change'
  | 'markdown_preview_toggle'
  | 'markdown_export'
  | 'url_shorten'
  | 'qr_generate'
  | 'file_upload'
  | 'password_generate'
  | 'password_bulk_generate'
  | 'password_copy'
  | 'password_download'
  | 'text_transformer_open'
  | 'unit_converter_open'
  | 'unit_converter_convert'
  | 'unit_converter_swap'
  | 'unit_converter_favorite_add'
  | 'unit_converter_favorite_remove'
  | 'unit_converter_favorite_load'
  | 'pomodoro_timer_view'
  | 'pomodoro_start'
  | 'pomodoro_pause'
  | 'pomodoro_reset'
  | 'pomodoro_complete'
  | 'pomodoro_break_complete'
  | 'pomodoro_mode_change'
  | 'pomodoro_task_add'
  | 'pomodoro_task_delete'
  | 'pomodoro_task_toggle'
  | 'pomodoro_settings_save'
  | 'tool_card_click'
  | 'search_query'
  | 'category_filter'
  | 'view_mode_toggle'
  | 'gradient_generator_view'
  | 'gradient_generator_add_color_stop'
  | 'gradient_generator_remove_color_stop'
  | 'gradient_generator_apply_preset'
  | 'gradient_generator_copy_css'
  | 'gradient_generator_download_png'
  | 'gradient_generator_randomize'
  | 'gradient_generator_reverse'
  | 'currency_converter_open'
  | 'currency_converter_convert'
  | 'currency_converter_swap'
  | 'currency_converter_rates_loaded'
  | 'currency_converter_favorite_add'
  | 'currency_converter_favorite_remove'
  | 'currency_converter_favorite_load'
  | 'stopwatch_timer_open'
  | 'stopwatch_start'
  | 'stopwatch_pause'
  | 'stopwatch_reset'
  | 'stopwatch_lap'
  | 'timer_add'
  | 'timer_remove'
  | 'timer_start'
  | 'timer_pause'
  | 'timer_reset'
  | 'timer_complete'
  | 'timer_preset_save'
  | 'timer_preset_load'
  | 'timer_preset_delete'
  | 'mode_change'
  | 'notification_permission_request'

// Type-safe gtag wrapper
declare global {
  interface Window {
    gtag?: (command: 'config' | 'event', targetId: string, config?: Record<string, unknown>) => void
  }
}

const GA_MEASUREMENT_ID =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined

// Check if GA is enabled (production + ID exists)
const isGAEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag)
}

// Log warning in development when GA ID is missing
if (
  typeof window !== 'undefined' &&
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  !GA_MEASUREMENT_ID
) {
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

  window.gtag?.('event', eventName, {
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

  window.gtag?.('event', action, {
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
  if (!GA_MEASUREMENT_ID) return

  window.gtag?.('config', GA_MEASUREMENT_ID, {
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

  window.gtag?.('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  })
}
