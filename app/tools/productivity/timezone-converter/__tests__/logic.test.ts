import { format, toZonedTime } from 'date-fns-tz'
import { describe, expect, it } from 'vitest'

describe('Timezone Conversion Logic', () => {
  it('should convert time to different timezone correctly', () => {
    const baseDate = new Date('2024-01-15T12:00:00Z')

    // Convert to Tokyo time (UTC+9)
    const tokyoTime = toZonedTime(baseDate, 'Asia/Tokyo')
    const tokyoFormatted = format(tokyoTime, 'HH:mm', { timeZone: 'Asia/Tokyo' })

    expect(tokyoFormatted).toBe('21:00')
  })

  it('should handle DST transitions correctly', () => {
    // Summer time in New York (EDT, UTC-4)
    const summerDate = new Date('2024-07-15T12:00:00Z')
    const nyTimeSummer = toZonedTime(summerDate, 'America/New_York')
    const nySummerFormatted = format(nyTimeSummer, 'HH:mm', { timeZone: 'America/New_York' })

    // Winter time in New York (EST, UTC-5)
    const winterDate = new Date('2024-01-15T12:00:00Z')
    const nyTimeWinter = toZonedTime(winterDate, 'America/New_York')
    const nyWinterFormatted = format(nyTimeWinter, 'HH:mm', { timeZone: 'America/New_York' })

    expect(nySummerFormatted).toBe('08:00')
    expect(nyWinterFormatted).toBe('07:00')
  })

  it('should format dates correctly for different timezones', () => {
    const baseDate = new Date('2024-01-15T12:00:00Z')

    const londonTime = toZonedTime(baseDate, 'Europe/London')
    const londonDateFormatted = format(londonTime, 'EEE, MMM d, yyyy', {
      timeZone: 'Europe/London',
    })

    expect(londonDateFormatted).toMatch(/Mon, Jan 15, 2024/)
  })

  it('should get correct offset string', () => {
    const baseDate = new Date('2024-01-15T12:00:00Z')

    // Tokyo is UTC+9
    const tokyoTime = toZonedTime(baseDate, 'Asia/Tokyo')
    const tokyoOffset = format(tokyoTime, 'XXX', { timeZone: 'Asia/Tokyo' })

    expect(tokyoOffset).toBe('+09:00')
  })

  it('should handle UTC timezone correctly', () => {
    const baseDate = new Date('2024-01-15T12:00:00Z')

    const utcTime = toZonedTime(baseDate, 'UTC')
    const utcFormatted = format(utcTime, 'HH:mm', { timeZone: 'UTC' })

    expect(utcFormatted).toBe('12:00')
  })

  it('should determine if time is daytime (6 AM - 6 PM)', () => {
    const isDaytime = (timezone: string, date: Date) => {
      const zonedDate = toZonedTime(date, timezone)
      const hour = zonedDate.getHours()
      return hour >= 6 && hour < 18
    }

    // 12:00 UTC is 21:00 in Tokyo (nighttime)
    const baseDate = new Date('2024-01-15T12:00:00Z')
    expect(isDaytime('Asia/Tokyo', baseDate)).toBe(false)

    // 00:00 UTC is 09:00 in Tokyo (daytime)
    const morningDate = new Date('2024-01-15T00:00:00Z')
    expect(isDaytime('Asia/Tokyo', morningDate)).toBe(true)
  })

  it('should handle multiple timezone conversions from same base time', () => {
    const baseDate = new Date('2024-01-15T12:00:00Z')

    const timezones = [
      { tz: 'America/New_York', expected: '07:00' },
      { tz: 'Europe/London', expected: '12:00' },
      { tz: 'Asia/Tokyo', expected: '21:00' },
      { tz: 'Australia/Sydney', expected: '23:00' },
    ]

    timezones.forEach(({ tz, expected }) => {
      const zonedTime = toZonedTime(baseDate, tz)
      const formatted = format(zonedTime, 'HH:mm', { timeZone: tz })
      expect(formatted).toBe(expected)
    })
  })
})
