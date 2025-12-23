import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  addTime,
  COMMON_TIMEZONES,
  calculateDifference,
  convertTimezone,
  FORMAT_PRESETS,
  formatDate,
  getCurrentDate,
  getFormattedOutputs,
  getRelativeTime,
  isValidDate,
  parseDate,
  subtractTime,
  validateDateInput,
} from '../utils'

describe('Date Formatter & Parser Utils', () => {
  describe('parseDate', () => {
    it('should parse ISO 8601 date string', () => {
      const result = parseDate('2024-01-15T12:00:00.000Z')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
      expect(result?.year()).toBe(2024)
      expect(result?.month()).toBe(0) // January is 0
      expect(result?.date()).toBe(15)
    })

    it('should parse Unix timestamp in seconds', () => {
      const result = parseDate(1704067200)
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
      expect(result?.year()).toBe(2024)
    })

    it('should parse Unix timestamp in milliseconds', () => {
      const result = parseDate(1704067200000)
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
      expect(result?.year()).toBe(2024)
    })

    it('should parse Unix timestamp string in seconds', () => {
      const result = parseDate('1704067200')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should parse Unix timestamp string in milliseconds', () => {
      const result = parseDate('1704067200000')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should parse US date format', () => {
      const result = parseDate('01/15/2024')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
      expect(result?.month()).toBe(0) // January
      expect(result?.date()).toBe(15)
    })

    it('should parse EU date format', () => {
      const result = parseDate('15/01/2024')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should parse natural language date', () => {
      const result = parseDate('January 15, 2024')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
      expect(result?.month()).toBe(0)
    })

    it('should parse Date object', () => {
      const date = new Date('2024-01-15')
      const result = parseDate(date)
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should return null for invalid date string', () => {
      const result = parseDate('invalid-date')
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = parseDate('')
      expect(result).toBeNull()
    })

    it('should handle zero as valid timestamp', () => {
      const result = parseDate(0)
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })
  })

  describe('formatDate', () => {
    const testDate = dayjs('2024-01-15T12:30:45.000Z').tz('UTC')

    it('should format date with default format', () => {
      const result = formatDate(testDate, { timezone: 'UTC' })
      expect(result).toBe('2024-01-15 12:30:45')
    })

    it('should format date with ISO 8601 format', () => {
      const result = formatDate(testDate, { format: FORMAT_PRESETS['ISO 8601'] })
      expect(result).toContain('2024-01-15T')
    })

    it('should format date with custom format', () => {
      const result = formatDate(testDate, { format: 'YYYY/MM/DD' })
      expect(result).toBe('2024/01/15')
    })

    it('should format date with timezone', () => {
      const result = formatDate(testDate, {
        format: 'YYYY-MM-DD HH:mm:ss',
        timezone: 'America/New_York',
      })
      expect(result).toMatch(/2024-01-15 \d{2}:\d{2}:\d{2}/)
    })

    it('should return empty string for null date', () => {
      const result = formatDate(null)
      expect(result).toBe('')
    })

    it('should return empty string for invalid date', () => {
      const invalid = dayjs('invalid')
      const result = formatDate(invalid)
      expect(result).toBe('')
    })

    it('should format Unix timestamp', () => {
      const result = formatDate(testDate, { format: FORMAT_PRESETS['Unix Timestamp (seconds)'] })
      expect(result).toMatch(/^\d+$/)
    })

    it('should format with 12-hour time', () => {
      const result = formatDate(testDate, { format: FORMAT_PRESETS['12-Hour Time'] })
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2} (AM|PM)/)
    })

    it('should format with 24-hour time', () => {
      const result = formatDate(testDate, { format: FORMAT_PRESETS['24-Hour Time'] })
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('convertTimezone', () => {
    const testDate = dayjs.utc('2024-01-15T12:00:00Z')

    it('should convert UTC to America/New_York', () => {
      const result = convertTimezone(testDate, 'America/New_York')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should convert UTC to Asia/Tokyo', () => {
      const result = convertTimezone(testDate, 'Asia/Tokyo')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should convert UTC to Europe/London', () => {
      const result = convertTimezone(testDate, 'Europe/London')
      expect(result).not.toBeNull()
      expect(result?.isValid()).toBe(true)
    })

    it('should return null for invalid date', () => {
      const result = convertTimezone(null, 'UTC')
      expect(result).toBeNull()
    })

    it('should handle invalid timezone gracefully', () => {
      const result = convertTimezone(testDate, 'Invalid/Timezone')
      expect(result).toBeNull()
    })
  })

  describe('calculateDifference', () => {
    const start = dayjs('2024-01-01T00:00:00Z')
    const end = dayjs('2024-01-15T12:30:45Z')

    it('should calculate difference between two dates', () => {
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.days).toBeGreaterThan(0)
      expect(result?.hours).toBeGreaterThanOrEqual(0)
      expect(result?.minutes).toBeGreaterThanOrEqual(0)
    })

    it('should calculate total days', () => {
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.totalDays).toBeGreaterThan(14)
    })

    it('should calculate total hours', () => {
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.totalHours).toBeGreaterThan(300)
    })

    it('should provide human readable string', () => {
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.humanReadable).toContain('day')
    })

    it('should handle reverse order dates', () => {
      const result = calculateDifference(end, start)
      expect(result).not.toBeNull()
      expect(result?.days).toBeGreaterThan(0)
    })

    it('should handle same date', () => {
      const result = calculateDifference(start, start)
      expect(result).not.toBeNull()
      expect(result?.humanReadable).toBe('0 seconds')
    })

    it('should return null for invalid start date', () => {
      const result = calculateDifference(null, end)
      expect(result).toBeNull()
    })

    it('should return null for invalid end date', () => {
      const result = calculateDifference(start, null)
      expect(result).toBeNull()
    })

    it('should calculate difference spanning multiple years', () => {
      const start = dayjs('2020-01-01')
      const end = dayjs('2024-06-15')
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.years).toBeGreaterThan(0)
    })

    it('should calculate difference with hours and minutes', () => {
      const start = dayjs('2024-01-01T10:15:30')
      const end = dayjs('2024-01-01T15:45:50')
      const result = calculateDifference(start, end)
      expect(result).not.toBeNull()
      expect(result?.hours).toBeGreaterThan(0)
      expect(result?.minutes).toBeGreaterThan(0)
    })
  })

  describe('getRelativeTime', () => {
    it('should return relative time for past date', () => {
      const past = dayjs().subtract(2, 'hours')
      const result = getRelativeTime(past)
      expect(result).toContain('ago')
    })

    it('should return relative time for future date', () => {
      const future = dayjs().add(2, 'hours')
      const result = getRelativeTime(future)
      expect(result).toContain('in')
    })

    it('should return empty string for null', () => {
      const result = getRelativeTime(null)
      expect(result).toBe('')
    })

    it('should return empty string for invalid date', () => {
      const invalid = dayjs('invalid')
      const result = getRelativeTime(invalid)
      expect(result).toBe('')
    })
  })

  describe('getCurrentDate', () => {
    it('should return current date without timezone', () => {
      const result = getCurrentDate()
      expect(result.isValid()).toBe(true)
    })

    it('should return current date in specified timezone', () => {
      const result = getCurrentDate('America/New_York')
      expect(result.isValid()).toBe(true)
    })

    it('should return current date in UTC', () => {
      const result = getCurrentDate('UTC')
      expect(result.isValid()).toBe(true)
    })
  })

  describe('getFormattedOutputs', () => {
    const testDate = dayjs('2024-01-15T12:00:00Z')

    it('should return all format presets', () => {
      const result = getFormattedOutputs(testDate)
      expect(Object.keys(result).length).toBeGreaterThan(10)
    })

    it('should include ISO 8601 format', () => {
      const result = getFormattedOutputs(testDate)
      expect(result['ISO 8601']).toBeDefined()
      expect(result['ISO 8601']).toContain('2024-01-15')
    })

    it('should include Unix timestamp', () => {
      const result = getFormattedOutputs(testDate)
      expect(result['Unix Timestamp (seconds)']).toBeDefined()
      expect(result['Unix Timestamp (seconds)']).toMatch(/^\d+$/)
    })

    it('should return empty object for null date', () => {
      const result = getFormattedOutputs(null)
      expect(result).toEqual({})
    })

    it('should return empty object for invalid date', () => {
      const invalid = dayjs('invalid')
      const result = getFormattedOutputs(invalid)
      expect(result).toEqual({})
    })

    it('should not include custom format in outputs', () => {
      const result = getFormattedOutputs(testDate)
      expect(result.Custom).toBeUndefined()
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      const date = dayjs('2024-01-15')
      expect(isValidDate(date)).toBe(true)
    })

    it('should return false for invalid date', () => {
      const date = dayjs('invalid')
      expect(isValidDate(date)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidDate(null)).toBe(false)
    })
  })

  describe('addTime', () => {
    const testDate = dayjs('2024-01-15T12:00:00')

    it('should add days', () => {
      const result = addTime(testDate, 5, 'days')
      expect(result).not.toBeNull()
      expect(result?.date()).toBe(20)
    })

    it('should add hours', () => {
      const result = addTime(testDate, 3, 'hours')
      expect(result).not.toBeNull()
      expect(result?.hour()).toBe(15)
    })

    it('should add minutes', () => {
      const result = addTime(testDate, 30, 'minutes')
      expect(result).not.toBeNull()
      expect(result?.minute()).toBe(30)
    })

    it('should add months', () => {
      const result = addTime(testDate, 2, 'months')
      expect(result).not.toBeNull()
      expect(result?.month()).toBe(2) // March
    })

    it('should add years', () => {
      const result = addTime(testDate, 1, 'years')
      expect(result).not.toBeNull()
      expect(result?.year()).toBe(2025)
    })

    it('should return null for invalid date', () => {
      const result = addTime(null, 1, 'days')
      expect(result).toBeNull()
    })
  })

  describe('subtractTime', () => {
    const testDate = dayjs('2024-01-15T12:00:00')

    it('should subtract days', () => {
      const result = subtractTime(testDate, 5, 'days')
      expect(result).not.toBeNull()
      expect(result?.date()).toBe(10)
    })

    it('should subtract hours', () => {
      const result = subtractTime(testDate, 3, 'hours')
      expect(result).not.toBeNull()
      expect(result?.hour()).toBe(9)
    })

    it('should subtract minutes', () => {
      const result = subtractTime(testDate, 30, 'minutes')
      expect(result).not.toBeNull()
      expect(result?.minute()).toBe(30)
    })

    it('should subtract months', () => {
      const result = subtractTime(testDate, 2, 'months')
      expect(result).not.toBeNull()
      expect(result?.month()).toBe(10) // November of previous year
    })

    it('should subtract years', () => {
      const result = subtractTime(testDate, 1, 'years')
      expect(result).not.toBeNull()
      expect(result?.year()).toBe(2023)
    })

    it('should return null for invalid date', () => {
      const result = subtractTime(null, 1, 'days')
      expect(result).toBeNull()
    })
  })

  describe('validateDateInput', () => {
    it('should validate correct date string', () => {
      const result = validateDateInput('2024-01-15')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should invalidate empty string', () => {
      const result = validateDateInput('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Date input is required')
    })

    it('should invalidate invalid date string', () => {
      const result = validateDateInput('invalid-date')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid date format')
    })

    it('should validate Unix timestamp', () => {
      const result = validateDateInput('1704067200')
      expect(result.valid).toBe(true)
    })

    it('should validate natural language date', () => {
      const result = validateDateInput('January 15, 2024')
      expect(result.valid).toBe(true)
    })
  })

  describe('Constants', () => {
    it('should have FORMAT_PRESETS defined', () => {
      expect(FORMAT_PRESETS).toBeDefined()
      expect(Object.keys(FORMAT_PRESETS).length).toBeGreaterThan(10)
    })

    it('should have ISO 8601 format preset', () => {
      expect(FORMAT_PRESETS['ISO 8601']).toBe('YYYY-MM-DDTHH:mm:ss.SSSZ')
    })

    it('should have COMMON_TIMEZONES defined', () => {
      expect(COMMON_TIMEZONES).toBeDefined()
      expect(COMMON_TIMEZONES.length).toBeGreaterThan(10)
    })

    it('should have UTC timezone', () => {
      const utc = COMMON_TIMEZONES.find((tz) => tz.value === 'UTC')
      expect(utc).toBeDefined()
    })

    it('should have timezone labels', () => {
      const timezone = COMMON_TIMEZONES[0]
      expect(timezone.value).toBeDefined()
      expect(timezone.label).toBeDefined()
    })
  })
})
