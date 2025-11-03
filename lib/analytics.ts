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
  | 'split_bill_save'
  | 'split_bill_view'
  | 'split_bill_view_error'
  | 'split_bill_payment_update'
  | 'split_bill_copy_link'
  | 'split_bill_export_pdf'
  | 'split_bill_export_csv'
  | 'split_bill_share_summary'
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
  | 'tally_counter_open'
  | 'tally_counter_increment'
  | 'tally_counter_decrement'
  | 'tally_counter_reset'
  | 'tally_counter_add'
  | 'tally_counter_remove'
  | 'tally_counter_set_step'
  | 'api_tester_open'
  | 'api_tester_send_request'
  | 'api_tester_save_preset'
  | 'api_tester_load_preset'
  | 'api_tester_delete_preset'
  | 'api_tester_copy_response'
  | 'api_tester_method_change'
  | 'prompt_formatter_open'
  | 'prompt_formatter_template_apply'
  | 'prompt_formatter_format'
  | 'prompt_formatter_copy'
  | 'prompt_formatter_download'
  | 'prompt_formatter_optimize'
  | 'prompt_formatter_clear'
  | 'prompt_formatter_model_change'
  | 'json_markdown_copy'
  | 'json_markdown_download'
  | 'browser_fingerprint_open'
  | 'browser_fingerprint_section_toggle'
  | 'browser_fingerprint_copy'
  | 'browser_fingerprint_copy_all'
  | 'color_contrast_open'
  | 'color_contrast_swap'
  | 'color_contrast_copy'
  | 'color_contrast_random'
  | 'color_contrast_change_foreground'
  | 'color_contrast_change_background'
  | 'recent_tool_click'
  | 'recent_tools_cleared'
  | 'clipboard_paste'
  | 'clipboard_format'
  | 'clipboard_case_transform'
  | 'clipboard_copy_formatted'
  | 'clipboard_download'
  | 'clipboard_reset'
  | 'clipboard_load_history'
  | 'clipboard_clear_history'
  | 'screenshot_diff_open'
  | 'screenshot_diff_upload_image1'
  | 'screenshot_diff_upload_image2'
  | 'screenshot_diff_compare'
  | 'screenshot_diff_reset'
  | 'screenshot_diff_download'
  | 'json_schema_generate'
  | 'json_schema_copy'
  | 'json_schema_download'
  | 'password_strength_open'
  | 'password_strength_checked'
  | 'password_strength_copy'
  | 'date_formatter_open'
  | 'date_parse'
  | 'date_format'
  | 'date_convert'
  | 'date_copy'
  | 'date_set_current'
  | 'cron_expression_open'
  | 'cron_expression_manual_edit'
  | 'cron_expression_field_change'
  | 'cron_expression_pattern_select'
  | 'cron_expression_copy'
  | 'cron_expression_export'
  | 'favicon_upload_image'
  | 'favicon_select_emoji'
  | 'favicon_generate'
  | 'favicon_download_ico'
  | 'favicon_download_png'
  | 'favicon_copy_html'
  | 'color_picker_open'
  | 'color_picker_change'
  | 'color_picker_random'
  | 'color_picker_copy'
  | 'color_picker_copy_palette'
  | 'color_picker_palette_type'
  | 'csv_excel_convert'
  | 'csv_excel_download'
  | 'csv_excel_error'
  | 'csv_merger_upload'
  | 'csv_merger_merge'
  | 'csv_merger_split'
  | 'csv_merger_download'
  | 'csv_merger_error'
  | 'task_timer_open'
  | 'task_timer_session_start'
  | 'task_timer_session_end'
  | 'task_timer_session_delete'
  | 'task_timer_add'
  | 'task_timer_start'
  | 'task_timer_pause'
  | 'task_timer_reset'
  | 'task_timer_remove'
  | 'task_timer_export_csv'
  | 'task_timer_export_json'
  | 'clipboard_history_open'
  | 'clipboard_history_start_monitoring'
  | 'clipboard_history_stop_monitoring'
  | 'clipboard_history_add_item'
  | 'clipboard_history_copy_item'
  | 'clipboard_history_toggle_pin'
  | 'clipboard_history_delete_item'
  | 'clipboard_history_clear_all'
  | 'speed_test_open'
  | 'speed_test_start'
  | 'speed_test_complete'
  | 'speed_test_error'
  | 'image_metadata_open'
  | 'image_metadata_parse'
  | 'image_metadata_clear'
  | 'image_metadata_copy'
  | 'image_metadata_download'
  | 'ai_caption_open'
  | 'ai_caption_upload'
  | 'ai_caption_generate'
  | 'ai_caption_copy'
  | 'ai_caption_error'
  | 'ai_snippet_open'
  | 'ai_snippet_generate'
  | 'ai_snippet_copy'
  | 'ai_snippet_error'
  | 'ai_json_open'
  | 'ai_json_analyze'
  | 'ai_json_copy'
  | 'ai_json_error'
  | 'uuid_generator_open'
  | 'uuid_generate_single'
  | 'uuid_generate_bulk'
  | 'uuid_validate'
  | 'uuid_copy'
  | 'uuid_copy_bulk'
  | 'batch_rename_open'
  | 'batch_rename_upload'
  | 'batch_rename_remove_file'
  | 'batch_rename_clear'
  | 'batch_rename_reset'
  | 'batch_rename_apply'
  | 'text_summarizer_open'
  | 'text_summarizer_summarize'
  | 'text_summarizer_copy'
  | 'text_summarizer_download'
  | 'text_summarizer_error'
  | 'text_similarity_open'
  | 'text_similarity_compare'
  | 'text_similarity_clear'
  | 'text_similarity_load_example'
  | 'text_similarity_copy_result'
  | 'ai_text_rewriter_open'
  | 'ai_text_rewriter_rewrite'
  | 'ai_text_rewriter_copy'
  | 'ai_text_rewriter_clear'
  | 'ai_text_rewriter_load_example'
  | 'ai_text_rewriter_error'
  | 'ai_command_explainer_open'
  | 'ai_command_explainer_explain'
  | 'ai_command_explainer_copy'
  | 'ai_command_explainer_load_example'
  | 'ai_command_explainer_error'
  | 'grammar_checker_open'
  | 'grammar_checker_check'
  | 'grammar_checker_apply_fix'
  | 'grammar_checker_error'
  | 'keyword_density_open'
  | 'keyword_density_analyze'
  | 'keyword_density_copy'
  | 'keyword_density_clear'
  | 'keyword_density_export'
  | 'percentage_calculator_open'
  | 'percentage_calculator_calculate'
  | 'percentage_calculator_mode_change'
  | 'percentage_calculator_copy'
  | 'percentage_calculator_clear'
  | 'invoice_generator_open'
  | 'invoice_generator_add_item'
  | 'invoice_generator_remove_item'
  | 'invoice_generator_save'
  | 'invoice_generator_load'
  | 'invoice_generator_delete'
  | 'invoice_generator_new'
  | 'invoice_generator_print'
  | 'invoice_generator_download'
  | 'loan_calculator_open'
  | 'loan_calculator_calculate'
  | 'loan_calculator_extra_payment'
  | 'loan_calculator_toggle_schedule'
  | 'loan_calculator_add_comparison'
  | 'loan_calculator_remove_comparison'
  | 'loan_calculator_currency_change'
  | 'steganography_open'
  | 'steganography_encode'
  | 'steganography_decode'
  | 'steganography_copy'
  | 'steganography_error'
  | 'timezone_converter_open'
  | 'timezone_converter_add'
  | 'timezone_converter_remove'
  | 'timezone_converter_time_change'
  | 'timezone_converter_favorite_add'
  | 'timezone_converter_favorite_remove'
  | 'timezone_converter_favorite_load'
  | 'yaml_json_converter_open'
  | 'yaml_json_converter_convert'
  | 'yaml_json_converter_swap'
  | 'yaml_json_converter_copy'
  | 'yaml_json_converter_download'
  | 'yaml_json_converter_clear'
  | 'yaml_json_converter_load_example'

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
  params?: Record<string, string | number | boolean | string[]>
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
