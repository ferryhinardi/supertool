'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { css } from '@/styled-system/css'
import { Button, type ButtonProps } from './button'

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'csv' | 'txt' | 'pdf'

/**
 * Export data configuration
 */
export interface ExportConfig<T = unknown> {
  /** The data to export */
  data: T
  /** Filename without extension */
  filename: string
  /** Export format */
  format: ExportFormat
  /** Custom formatter function for the data */
  formatter?: (data: T, format: ExportFormat) => string | Blob
  /** Custom MIME type (overrides default for format) */
  mimeType?: string
  /** Success message to show in toast */
  successMessage?: string
  /** Error message to show in toast */
  errorMessage?: string
}

/**
 * Props for ExportButton component
 */
export interface ExportButtonProps<T = unknown> extends Omit<ButtonProps, 'onClick'> {
  /** Export configuration */
  config: ExportConfig<T>
  /** Whether to show icon */
  showIcon?: boolean
  /** Custom button text (defaults to "Export {format}") */
  buttonText?: string
  /** Callback before export starts */
  onExportStart?: () => void
  /** Callback after successful export */
  onExportSuccess?: () => void
  /** Callback on export error */
  onExportError?: (error: Error) => void
}

/**
 * Default formatters for common export formats
 */
const defaultFormatters: Record<
  ExportFormat,
  (data: unknown) => { content: string | Blob; mimeType: string }
> = {
  json: (data) => ({
    content: JSON.stringify(data, null, 2),
    mimeType: 'application/json',
  }),
  csv: (data) => {
    // Simple CSV formatter - works for array of objects
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              // Escape quotes and wrap in quotes if contains comma or quote
              const stringValue = String(value ?? '')
              if (stringValue.includes(',') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`
              }
              return stringValue
            })
            .join(',')
        ),
      ]
      return {
        content: csvRows.join('\n'),
        mimeType: 'text/csv',
      }
    }
    // Fallback for non-array data
    return {
      content: String(data),
      mimeType: 'text/csv',
    }
  },
  txt: (data) => ({
    content: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    mimeType: 'text/plain',
  }),
  pdf: () => {
    throw new Error('PDF export requires a custom formatter. Use the formatter prop.')
  },
}

/**
 * Download helper function
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Reusable export button component
 * Supports JSON, CSV, TXT, and custom PDF formats
 *
 * @example
 * ```tsx
 * // Simple JSON export
 * <ExportButton
 *   config={{
 *     data: myData,
 *     filename: 'export',
 *     format: 'json'
 *   }}
 * />
 *
 * // CSV export with custom formatter
 * <ExportButton
 *   config={{
 *     data: myData,
 *     filename: 'export',
 *     format: 'csv',
 *     formatter: (data) => customCSVFormatter(data)
 *   }}
 *   variant="solid"
 * />
 *
 * // Custom styling
 * <ExportButton
 *   config={{ data, filename: 'export', format: 'json' }}
 *   size="sm"
 *   variant="ghost"
 *   showIcon={false}
 * />
 * ```
 */
export function ExportButton<T = unknown>({
  config,
  showIcon = true,
  buttonText,
  onExportStart,
  onExportSuccess,
  onExportError,
  children,
  ...buttonProps
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      onExportStart?.()

      const { data, filename, format, formatter, mimeType } = config

      // Get file content and MIME type
      let content: string | Blob
      let finalMimeType: string

      if (formatter) {
        // Use custom formatter
        const result = formatter(data, format)
        if (result instanceof Blob) {
          content = result
          finalMimeType = mimeType || result.type || defaultFormatters[format](data).mimeType
        } else {
          content = result
          finalMimeType = mimeType || defaultFormatters[format](data).mimeType
        }
      } else {
        // Use default formatter
        const formatted = defaultFormatters[format](data)
        content = formatted.content
        finalMimeType = mimeType || formatted.mimeType
      }

      // Generate filename with extension
      const filenameWithExt = filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`

      // Download the file
      downloadFile(content, filenameWithExt, finalMimeType)

      // Show success message
      const successMsg = config.successMessage || `Exported as ${format.toUpperCase()}`
      toast.success(successMsg)

      onExportSuccess?.()
    } catch (error) {
      console.error('Export error:', error)
      const errorMsg = config.errorMessage || 'Failed to export data'
      toast.error(errorMsg)
      onExportError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  const defaultButtonText = buttonText || `Export ${config.format.toUpperCase()}`

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        cursor: isExporting ? 'wait' : 'pointer',
      })}
      {...buttonProps}
    >
      {showIcon && <Download size={16} />}
      {children || defaultButtonText}
    </Button>
  )
}

/**
 * Hook version for programmatic exports
 * Use when you need to trigger exports from code rather than a button
 *
 * @example
 * ```tsx
 * const { exportData, isExporting } = useExport()
 *
 * const handleExport = () => {
 *   exportData({
 *     data: myData,
 *     filename: 'export',
 *     format: 'json'
 *   })
 * }
 * ```
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportData = async <T,>(config: ExportConfig<T>) => {
    try {
      setIsExporting(true)

      const { data, filename, format, formatter, mimeType } = config

      let content: string | Blob
      let finalMimeType: string

      if (formatter) {
        const result = formatter(data, format)
        if (result instanceof Blob) {
          content = result
          finalMimeType = mimeType || result.type || defaultFormatters[format](data).mimeType
        } else {
          content = result
          finalMimeType = mimeType || defaultFormatters[format](data).mimeType
        }
      } else {
        const formatted = defaultFormatters[format](data)
        content = formatted.content
        finalMimeType = mimeType || formatted.mimeType
      }

      const filenameWithExt = filename.endsWith(`.${format}`) ? filename : `${filename}.${format}`

      downloadFile(content, filenameWithExt, finalMimeType)

      const successMsg = config.successMessage || `Exported as ${format.toUpperCase()}`
      toast.success(successMsg)

      return true
    } catch (error) {
      console.error('Export error:', error)
      const errorMsg = config.errorMessage || 'Failed to export data'
      toast.error(errorMsg)
      return false
    } finally {
      setIsExporting(false)
    }
  }

  return { exportData, isExporting }
}
