import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue'
import { DateTime } from 'luxon'
import type { CronConfig, CronPlatform, CronValidationResult, NextExecution } from './types'

/**
 * Generate cron expression from config based on platform
 */
export function generateCronExpression(config: CronConfig, platform: CronPlatform): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek, seconds, year } = config

  switch (platform) {
    case 'quartz':
      // Quartz: second minute hour day month weekday year
      return `${seconds || '0'} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year || '*'}`

    case 'aws':
      // AWS: minute hour day month weekday year
      return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year || '*'}`

    case 'spring':
      // Spring: second minute hour day month weekday
      return `${seconds || '0'} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    default:
      // Unix/Kubernetes: minute hour day month weekday
      return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
  }
}

/**
 * Validate cron expression
 */
export function validateCronExpression(
  expression: string,
  platform: CronPlatform
): CronValidationResult {
  try {
    // Basic format check
    const parts = expression.trim().split(/\s+/)

    switch (platform) {
      case 'quartz':
        if (parts.length !== 7) {
          return {
            isValid: false,
            error: 'Quartz format requires 7 fields: second minute hour day month weekday year',
          }
        }
        break

      case 'aws':
        if (parts.length !== 6) {
          return {
            isValid: false,
            error: 'AWS format requires 6 fields: minute hour day month weekday year',
          }
        }
        break

      case 'spring':
        if (parts.length !== 6) {
          return {
            isValid: false,
            error: 'Spring format requires 6 fields: second minute hour day month weekday',
          }
        }
        break

      case 'unix':
      case 'kubernetes':
        if (parts.length !== 5) {
          return {
            isValid: false,
            error: 'Unix/Kubernetes format requires 5 fields: minute hour day month weekday',
          }
        }
        break
    }

    // Try to parse with cron-parser (use Unix format for parsing)
    const unixExpression =
      platform === 'unix' || platform === 'kubernetes'
        ? expression
        : parts.slice(platform === 'quartz' || platform === 'spring' ? 1 : 0, -1).join(' ')

    CronExpressionParser.parse(unixExpression)

    // Check for common mistakes
    const warnings: string[] = []

    // Check if both day of month and day of week are specified (not *)
    const dayOfMonth = parts[platform === 'quartz' || platform === 'spring' ? 3 : 2]
    const dayOfWeek =
      parts[platform === 'quartz' || platform === 'spring' ? 5 : platform === 'aws' ? 4 : 4]

    if (dayOfMonth !== '*' && dayOfWeek !== '*' && dayOfWeek !== '?') {
      warnings.push(
        'Both day-of-month and day-of-week are specified. This may not work as expected.'
      )
    }

    return {
      isValid: true,
      warning: warnings.length > 0 ? warnings.join(' ') : undefined,
    }
  } catch {
    return {
      isValid: false,
      error: 'Invalid cron expression',
    }
  }
}

/**
 * Get human-readable description of cron expression
 */
export function getHumanReadable(expression: string, platform: CronPlatform): string {
  try {
    // Convert to Unix format for cronstrue
    const parts = expression.trim().split(/\s+/)
    let unixExpression = expression

    if (platform === 'quartz' || platform === 'spring') {
      // Remove seconds field (first field)
      unixExpression = parts.slice(1, 6).join(' ')
    } else if (platform === 'aws') {
      // Remove year field (last field)
      unixExpression = parts.slice(0, 5).join(' ')
    }

    return cronstrue.toString(unixExpression, {
      throwExceptionOnParseError: false,
      use24HourTimeFormat: true,
    })
  } catch {
    return 'Invalid cron expression'
  }
}

/**
 * Get next execution times
 */
export function getNextExecutions(
  expression: string,
  platform: CronPlatform,
  count = 10
): NextExecution[] {
  try {
    // Convert to Unix format for cron-parser
    const parts = expression.trim().split(/\s+/)
    let unixExpression = expression

    if (platform === 'quartz' || platform === 'spring') {
      // Remove seconds field (first field)
      unixExpression = parts.slice(1, 6).join(' ')
    } else if (platform === 'aws') {
      // Remove year field (last field)
      unixExpression = parts.slice(0, 5).join(' ')
    }

    const interval = CronExpressionParser.parse(unixExpression, {
      currentDate: new Date(),
    })

    const executions: NextExecution[] = []

    for (let i = 0; i < count; i++) {
      try {
        const next = interval.next()
        const date = next.toDate()
        const dt = DateTime.fromJSDate(date)

        executions.push({
          date,
          formatted: dt.toFormat('EEE, MMM d, yyyy, h:mm a'),
          relative: dt.toRelative() || '',
        })
      } catch {
        // No more executions
        break
      }
    }

    return executions
  } catch {
    return []
  }
}

/**
 * Parse cron expression to config
 */
export function parseCronExpression(expression: string, platform: CronPlatform): CronConfig | null {
  try {
    const parts = expression.trim().split(/\s+/)

    switch (platform) {
      case 'quartz':
        if (parts.length !== 7) return null
        return {
          seconds: parts[0],
          minute: parts[1],
          hour: parts[2],
          dayOfMonth: parts[3],
          month: parts[4],
          dayOfWeek: parts[5],
          year: parts[6],
        }

      case 'aws':
        if (parts.length !== 6) return null
        return {
          minute: parts[0],
          hour: parts[1],
          dayOfMonth: parts[2],
          month: parts[3],
          dayOfWeek: parts[4],
          year: parts[5],
        }

      case 'spring':
        if (parts.length !== 6) return null
        return {
          seconds: parts[0],
          minute: parts[1],
          hour: parts[2],
          dayOfMonth: parts[3],
          month: parts[4],
          dayOfWeek: parts[5],
        }

      case 'unix':
      case 'kubernetes':
        if (parts.length !== 5) return null
        return {
          minute: parts[0],
          hour: parts[1],
          dayOfMonth: parts[2],
          month: parts[3],
          dayOfWeek: parts[4],
        }

      default:
        return null
    }
  } catch {
    return null
  }
}

/**
 * Format cron expression for display
 */
export function formatCronExpression(expression: string): string {
  return expression.trim().replace(/\s+/g, ' ')
}

/**
 * Get cron expression examples
 */
export function getCronExamples(platform: CronPlatform): string[] {
  switch (platform) {
    case 'quartz':
      return [
        '0 0 12 * * ? *  (Daily at noon)',
        '0 */5 * * * ? *  (Every 5 minutes)',
        '0 0 9 ? * MON-FRI  (Weekdays at 9 AM)',
      ]

    case 'aws':
      return [
        '0 12 * * ? *  (Daily at noon)',
        '*/5 * * * ? *  (Every 5 minutes)',
        '0 9 ? * MON-FRI *  (Weekdays at 9 AM)',
      ]

    case 'spring':
      return [
        '0 0 12 * * *  (Daily at noon)',
        '0 */5 * * * *  (Every 5 minutes)',
        '0 0 9 * * MON-FRI  (Weekdays at 9 AM)',
      ]
    default:
      return [
        '0 12 * * *  (Daily at noon)',
        '*/5 * * * *  (Every 5 minutes)',
        '0 9 * * 1-5  (Weekdays at 9 AM)',
      ]
  }
}
