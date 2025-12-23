import { describe, expect, it } from 'vitest'
import {
  buildCronExpression,
  COMMON_PATTERNS,
  type CronField,
  describeCronExpression,
  exportCronExpression,
  formatExecutionDate,
  getNextExecutions,
  getPatternCategories,
  getPatternsByCategory,
  parseCronExpression,
  validateCronExpression,
} from '../utils'

describe('validateCronExpression', () => {
  it('should validate a correct 5-field cron expression', () => {
    const result = validateCronExpression('0 9 * * 1-5')
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should validate common patterns', () => {
    expect(validateCronExpression('* * * * *').isValid).toBe(true)
    expect(validateCronExpression('0 0 * * *').isValid).toBe(true)
    expect(validateCronExpression('*/5 * * * *').isValid).toBe(true)
  })

  it('should reject empty expression', () => {
    const result = validateCronExpression('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Expression cannot be empty')
  })

  it('should reject invalid expression', () => {
    const result = validateCronExpression('invalid')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should reject expression with invalid field values', () => {
    const result = validateCronExpression('60 25 * * *')
    expect(result.isValid).toBe(false)
  })
})

describe('parseCronExpression', () => {
  it('should parse a 5-field cron expression', () => {
    const result = parseCronExpression('0 9 * * 1-5')
    expect(result).toEqual({
      minute: '0',
      hour: '9',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1-5',
    })
  })

  it('should parse a 6-field cron expression (with seconds)', () => {
    const result = parseCronExpression('0 0 9 * * 1-5')
    expect(result).toEqual({
      minute: '0',
      hour: '9',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1-5',
    })
  })

  it('should handle wildcard expressions', () => {
    const result = parseCronExpression('* * * * *')
    expect(result).toEqual({
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    })
  })

  it('should handle interval expressions', () => {
    const result = parseCronExpression('*/15 */2 * * *')
    expect(result).toEqual({
      minute: '*/15',
      hour: '*/2',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    })
  })

  it('should return default wildcards for invalid expression', () => {
    const result = parseCronExpression('invalid')
    expect(result).toEqual({
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    })
  })
})

describe('buildCronExpression', () => {
  it('should build a cron expression from fields', () => {
    const fields: CronField = {
      minute: '0',
      hour: '9',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '1-5',
    }
    expect(buildCronExpression(fields)).toBe('0 9 * * 1-5')
  })

  it('should handle wildcard fields', () => {
    const fields: CronField = {
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    }
    expect(buildCronExpression(fields)).toBe('* * * * *')
  })

  it('should handle interval expressions', () => {
    const fields: CronField = {
      minute: '*/5',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    }
    expect(buildCronExpression(fields)).toBe('*/5 * * * *')
  })
})

describe('describeCronExpression', () => {
  it('should describe common patterns', () => {
    expect(describeCronExpression('* * * * *')).toBe('Runs every minute')
    expect(describeCronExpression('0 * * * *')).toBe('Runs at the start of every hour')
    expect(describeCronExpression('0 0 * * *')).toBe('Runs at 00:00 every day')
    expect(describeCronExpression('0 9 * * 1-5')).toBe('Runs at 09:00 Monday through Friday')
  })

  it('should describe interval expressions', () => {
    expect(describeCronExpression('*/5 * * * *')).toBe('Runs every 5 minutes')
    expect(describeCronExpression('0 */2 * * *')).toBe('Runs every 2 hours')
  })

  it('should describe specific times', () => {
    expect(describeCronExpression('30 14 * * *')).toContain('at 14:30')
  })

  it('should describe day of month', () => {
    expect(describeCronExpression('0 0 1 * *')).toBe('Runs at 00:00 on the 1st of every month')
    expect(describeCronExpression('0 0 L * *')).toBe('Runs at 00:00 on the last day of every month')
  })

  it('should describe day of week', () => {
    expect(describeCronExpression('0 9 * * 1')).toContain('Monday')
    expect(describeCronExpression('0 9 * * 1-5')).toContain('Monday through Friday')
  })

  it('should describe month patterns', () => {
    const description = describeCronExpression('0 0 1 1 *')
    expect(description).toContain('January')
  })

  it('should handle first occurrence patterns', () => {
    const description = describeCronExpression('0 0 * * 1#1')
    expect(description).toContain('first Monday')
  })

  it('should handle edge cases gracefully', () => {
    // describeCronExpression returns default parsing for invalid input
    // Validation should be done through validateCronExpression instead
    const description = describeCronExpression('invalid')
    expect(description).toBeTruthy()
    expect(typeof description).toBe('string')
  })
})

describe('getNextExecutions', () => {
  it('should return next execution times', () => {
    const executions = getNextExecutions('0 9 * * 1-5', 5)
    expect(executions).toHaveLength(5)
    expect(executions[0]).toBeInstanceOf(Date)
  })

  it('should return default count of 10 executions', () => {
    const executions = getNextExecutions('* * * * *')
    expect(executions.length).toBeGreaterThan(0)
    expect(executions.length).toBeLessThanOrEqual(10)
  })

  it('should return empty array for invalid expression', () => {
    const executions = getNextExecutions('invalid')
    expect(executions).toEqual([])
  })

  it('should return dates in chronological order', () => {
    const executions = getNextExecutions('0 9 * * *', 3)
    expect(executions.length).toBeGreaterThan(0)
    for (let i = 1; i < executions.length; i++) {
      expect(executions[i].getTime()).toBeGreaterThan(executions[i - 1].getTime())
    }
  })

  it('should return future dates', () => {
    const executions = getNextExecutions('0 9 * * 1-5', 1)
    const now = new Date()
    expect(executions.length).toBeGreaterThan(0)
    expect(executions[0].getTime()).toBeGreaterThan(now.getTime())
  })
})

describe('formatExecutionDate', () => {
  it('should format date with weekday, date, and time', () => {
    const date = new Date('2025-01-15T09:00:00')
    const formatted = formatExecutionDate(date)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2025')
    expect(formatted).toContain('09:00')
  })

  it('should include weekday abbreviation', () => {
    const date = new Date('2025-01-15T09:00:00') // Wednesday
    const formatted = formatExecutionDate(date)
    expect(formatted).toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/)
  })
})

describe('exportCronExpression', () => {
  const expression = '0 9 * * 1-5'

  it('should export for crontab', () => {
    const exported = exportCronExpression(expression, 'crontab')
    expect(exported).toContain('crontab -e')
    expect(exported).toContain(expression)
    expect(exported).toContain('/path/to/your/command')
  })

  it('should export for Kubernetes', () => {
    const exported = exportCronExpression(expression, 'kubernetes')
    expect(exported).toContain('apiVersion: batch/v1')
    expect(exported).toContain('kind: CronJob')
    expect(exported).toContain(`schedule: "${expression}"`)
  })

  it('should export for AWS', () => {
    const exported = exportCronExpression(expression, 'aws')
    expect(exported).toContain('CloudWatch Events')
    expect(exported).toContain(`cron(${expression})`)
    expect(exported).toContain('ScheduleExpression')
  })

  it('should export for GitHub Actions', () => {
    const exported = exportCronExpression(expression, 'github')
    expect(exported).toContain('on:')
    expect(exported).toContain('schedule:')
    expect(exported).toContain(`cron: '${expression}'`)
    expect(exported).toContain('runs-on: ubuntu-latest')
  })

  it('should export for GitLab CI/CD', () => {
    const exported = exportCronExpression(expression, 'gitlab')
    expect(exported).toContain('scheduled-job:')
    expect(exported).toContain('rules:')
    expect(exported).toContain('CI_PIPELINE_SOURCE')
    expect(exported).toContain(expression)
  })
})

describe('getPatternCategories', () => {
  it('should return all pattern categories', () => {
    const categories = getPatternCategories()
    expect(categories).toEqual(['common', 'hourly', 'daily', 'weekly', 'monthly'])
  })

  it('should return array with correct length', () => {
    const categories = getPatternCategories()
    expect(categories).toHaveLength(5)
  })
})

describe('getPatternsByCategory', () => {
  it('should return patterns for common category', () => {
    const patterns = getPatternsByCategory('common')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((p) => p.category === 'common')).toBe(true)
  })

  it('should return patterns for hourly category', () => {
    const patterns = getPatternsByCategory('hourly')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((p) => p.category === 'hourly')).toBe(true)
  })

  it('should return patterns for daily category', () => {
    const patterns = getPatternsByCategory('daily')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((p) => p.category === 'daily')).toBe(true)
  })

  it('should return patterns for weekly category', () => {
    const patterns = getPatternsByCategory('weekly')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((p) => p.category === 'weekly')).toBe(true)
  })

  it('should return patterns for monthly category', () => {
    const patterns = getPatternsByCategory('monthly')
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.every((p) => p.category === 'monthly')).toBe(true)
  })

  it('should return empty array for non-existent category', () => {
    const patterns = getPatternsByCategory('nonexistent')
    expect(patterns).toEqual([])
  })
})

describe('COMMON_PATTERNS', () => {
  it('should contain 18 patterns', () => {
    expect(COMMON_PATTERNS).toHaveLength(18)
  })

  it('should have valid structure for each pattern', () => {
    COMMON_PATTERNS.forEach((pattern) => {
      expect(pattern).toHaveProperty('name')
      expect(pattern).toHaveProperty('expression')
      expect(pattern).toHaveProperty('description')
      expect(pattern).toHaveProperty('category')
      expect(typeof pattern.name).toBe('string')
      expect(typeof pattern.expression).toBe('string')
      expect(typeof pattern.description).toBe('string')
      expect(['common', 'hourly', 'daily', 'weekly', 'monthly']).toContain(pattern.category)
    })
  })

  it('should have valid cron expressions', () => {
    COMMON_PATTERNS.forEach((pattern) => {
      const result = validateCronExpression(pattern.expression)
      expect(result.isValid).toBe(true)
    })
  })

  it('should include all expected common patterns', () => {
    const names = COMMON_PATTERNS.map((p) => p.name)
    expect(names).toContain('Every Minute')
    expect(names).toContain('Every 5 Minutes')
    expect(names).toContain('Every Hour')
    expect(names).toContain('Every Day at Midnight')
    expect(names).toContain('Every Weekday at 9 AM')
    expect(names).toContain('First Day of Month')
  })
})
