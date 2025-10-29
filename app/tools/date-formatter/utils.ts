import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/**
 * Format options for date display
 */
export interface FormatOptions {
  format?: string
  timezone?: string
  locale?: string
}

/**
 * Common date format presets
 */
export const FORMAT_PRESETS = {
  'ISO 8601': 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  'ISO 8601 (Local)': 'YYYY-MM-DDTHH:mm:ss',
  'RFC 2822': 'ddd, DD MMM YYYY HH:mm:ss ZZ',
  'Unix Timestamp (seconds)': 'X',
  'Unix Timestamp (milliseconds)': 'x',
  'Date Only': 'YYYY-MM-DD',
  'Time Only': 'HH:mm:ss',
  'US Format': 'MM/DD/YYYY',
  'EU Format': 'DD/MM/YYYY',
  'Long Date': 'MMMM D, YYYY',
  'Long Date with Time': 'MMMM D, YYYY h:mm A',
  'Short Date': 'MMM D, YYYY',
  'Full Date Time': 'dddd, MMMM D, YYYY h:mm:ss A',
  '24-Hour Time': 'HH:mm:ss',
  '12-Hour Time': 'h:mm:ss A',
  'Year and Month': 'YYYY-MM',
  'Month and Day': 'MM-DD',
  Custom: 'custom',
} as const

export type FormatPreset = keyof typeof FORMAT_PRESETS

/**
 * Common timezones
 */
export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
] as const

/**
 * Parse input and convert to dayjs object
 */
export function parseDate(input: string | number | Date): dayjs.Dayjs | null {
  if (!input && input !== 0) {
    return null
  }

  try {
    // Handle numeric timestamps
    if (typeof input === 'number') {
      // Check if it's seconds (10 digits) or milliseconds (13 digits)
      const timestamp = String(input).length <= 10 ? input * 1000 : input
      return dayjs(timestamp)
    }

    // Handle Date objects
    if (input instanceof Date) {
      return dayjs(input)
    }

    // Handle string inputs
    const str = String(input).trim()

    // Try parsing as number (unix timestamp)
    if (/^\d+$/.test(str)) {
      const num = Number.parseInt(str, 10)
      const timestamp = str.length <= 10 ? num * 1000 : num
      return dayjs(timestamp)
    }

    // Try parsing with various formats
    const formats = [
      'YYYY-MM-DD',
      'YYYY-MM-DDTHH:mm:ss',
      'YYYY-MM-DDTHH:mm:ss.SSS',
      'YYYY-MM-DDTHH:mm:ss.SSSZ',
      'YYYY-MM-DD HH:mm:ss',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'MMM D, YYYY',
      'MMMM D, YYYY',
      'ddd, DD MMM YYYY HH:mm:ss',
    ]

    for (const format of formats) {
      const parsed = dayjs(str, format, true)
      if (parsed.isValid()) {
        return parsed
      }
    }

    // Try default parsing
    const parsed = dayjs(str)
    if (parsed.isValid()) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

/**
 * Format date according to options
 */
export function formatDate(date: dayjs.Dayjs | null, options: FormatOptions = {}): string {
  if (!date || !date.isValid()) {
    return ''
  }

  const { format = 'YYYY-MM-DD HH:mm:ss', timezone } = options

  try {
    let formatted = date

    // Apply timezone if specified
    if (timezone && timezone !== 'local') {
      formatted = formatted.tz(timezone)
    }

    return formatted.format(format)
  } catch {
    return ''
  }
}

/**
 * Convert date to different timezone
 */
export function convertTimezone(
  date: dayjs.Dayjs | null,
  targetTimezone: string
): dayjs.Dayjs | null {
  if (!date || !date.isValid()) {
    return null
  }

  try {
    return date.tz(targetTimezone)
  } catch {
    return null
  }
}

/**
 * Calculate difference between two dates
 */
export interface DateDifference {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  humanReadable: string
}

export function calculateDifference(
  startDate: dayjs.Dayjs | null,
  endDate: dayjs.Dayjs | null
): DateDifference | null {
  if (!startDate || !endDate || !startDate.isValid() || !endDate.isValid()) {
    return null
  }

  const start = startDate.isBefore(endDate) ? startDate : endDate
  const end = startDate.isBefore(endDate) ? endDate : startDate

  const years = end.diff(start, 'years')
  const months = end.diff(start, 'months') % 12
  const days = end.diff(start.add(end.diff(start, 'months'), 'months'), 'days')
  const hours = end.diff(start, 'hours') % 24
  const minutes = end.diff(start, 'minutes') % 60
  const seconds = end.diff(start, 'seconds') % 60
  const milliseconds = end.diff(start, 'milliseconds') % 1000

  const totalDays = end.diff(start, 'days', true)
  const totalHours = end.diff(start, 'hours', true)
  const totalMinutes = end.diff(start, 'minutes', true)
  const totalSeconds = end.diff(start, 'seconds', true)

  // Generate human readable string
  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`)
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`)
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)

  const humanReadable = parts.length > 0 ? parts.join(', ') : '0 seconds'

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    totalDays: Math.floor(totalDays * 100) / 100,
    totalHours: Math.floor(totalHours * 100) / 100,
    totalMinutes: Math.floor(totalMinutes * 100) / 100,
    totalSeconds: Math.floor(totalSeconds * 100) / 100,
    humanReadable,
  }
}

/**
 * Get relative time from now
 */
export function getRelativeTime(date: dayjs.Dayjs | null): string {
  if (!date || !date.isValid()) {
    return ''
  }

  return date.fromNow()
}

/**
 * Validate date input
 */
export function validateDateInput(input: string): {
  valid: boolean
  error?: string
} {
  if (!input || input.trim() === '') {
    return { valid: false, error: 'Date input is required' }
  }

  const parsed = parseDate(input)
  if (!parsed || !parsed.isValid()) {
    return { valid: false, error: 'Invalid date format' }
  }

  return { valid: true }
}

/**
 * Get current date in specified timezone
 */
export function getCurrentDate(timezone?: string): dayjs.Dayjs {
  return timezone ? dayjs().tz(timezone) : dayjs()
}

/**
 * Format date for display in various formats
 */
export function getFormattedOutputs(date: dayjs.Dayjs | null): Record<string, string> {
  if (!date || !date.isValid()) {
    return {}
  }

  const outputs: Record<string, string> = {}

  for (const [name, format] of Object.entries(FORMAT_PRESETS)) {
    if (format !== 'custom') {
      outputs[name] = formatDate(date, { format })
    }
  }

  return outputs
}

/**
 * Check if date is valid
 */
export function isValidDate(date: dayjs.Dayjs | null): boolean {
  return date?.isValid() ?? false
}

/**
 * Add time to date
 */
export function addTime(
  date: dayjs.Dayjs | null,
  amount: number,
  unit: dayjs.ManipulateType
): dayjs.Dayjs | null {
  if (!date || !date.isValid()) {
    return null
  }

  return date.add(amount, unit)
}

/**
 * Subtract time from date
 */
export function subtractTime(
  date: dayjs.Dayjs | null,
  amount: number,
  unit: dayjs.ManipulateType
): dayjs.Dayjs | null {
  if (!date || !date.isValid()) {
    return null
  }

  return date.subtract(amount, unit)
}
