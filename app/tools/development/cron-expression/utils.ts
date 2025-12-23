import { Cron } from 'croner'

export interface CronField {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export interface CronPattern {
  name: string
  expression: string
  description: string
  category: 'common' | 'hourly' | 'daily' | 'weekly' | 'monthly'
}

// Common cron patterns library
export const COMMON_PATTERNS: CronPattern[] = [
  {
    name: 'Every Minute',
    expression: '* * * * *',
    description: 'Runs every minute',
    category: 'common',
  },
  {
    name: 'Every 5 Minutes',
    expression: '*/5 * * * *',
    description: 'Runs every 5 minutes',
    category: 'common',
  },
  {
    name: 'Every 15 Minutes',
    expression: '*/15 * * * *',
    description: 'Runs every 15 minutes',
    category: 'common',
  },
  {
    name: 'Every 30 Minutes',
    expression: '*/30 * * * *',
    description: 'Runs every 30 minutes',
    category: 'common',
  },
  {
    name: 'Every Hour',
    expression: '0 * * * *',
    description: 'Runs at the start of every hour',
    category: 'hourly',
  },
  {
    name: 'Every 2 Hours',
    expression: '0 */2 * * *',
    description: 'Runs every 2 hours',
    category: 'hourly',
  },
  {
    name: 'Every 6 Hours',
    expression: '0 */6 * * *',
    description: 'Runs every 6 hours',
    category: 'hourly',
  },
  {
    name: 'Every Day at Midnight',
    expression: '0 0 * * *',
    description: 'Runs at 00:00 every day',
    category: 'daily',
  },
  {
    name: 'Every Day at Noon',
    expression: '0 12 * * *',
    description: 'Runs at 12:00 every day',
    category: 'daily',
  },
  {
    name: 'Every Day at 9 AM',
    expression: '0 9 * * *',
    description: 'Runs at 09:00 every day',
    category: 'daily',
  },
  {
    name: 'Every Day at 6 PM',
    expression: '0 18 * * *',
    description: 'Runs at 18:00 every day',
    category: 'daily',
  },
  {
    name: 'Every Weekday at 9 AM',
    expression: '0 9 * * 1-5',
    description: 'Runs at 09:00 Monday through Friday',
    category: 'daily',
  },
  {
    name: 'Every Monday at 9 AM',
    expression: '0 9 * * 1',
    description: 'Runs at 09:00 every Monday',
    category: 'weekly',
  },
  {
    name: 'Every Friday at 5 PM',
    expression: '0 17 * * 5',
    description: 'Runs at 17:00 every Friday',
    category: 'weekly',
  },
  {
    name: 'Every Sunday at Midnight',
    expression: '0 0 * * 0',
    description: 'Runs at 00:00 every Sunday',
    category: 'weekly',
  },
  {
    name: 'First Day of Month',
    expression: '0 0 1 * *',
    description: 'Runs at 00:00 on the 1st of every month',
    category: 'monthly',
  },
  {
    name: 'Last Day of Month',
    expression: '0 0 L * *',
    description: 'Runs at 00:00 on the last day of every month',
    category: 'monthly',
  },
  {
    name: 'First Monday of Month',
    expression: '0 0 * * 1#1',
    description: 'Runs at 00:00 on the first Monday of every month',
    category: 'monthly',
  },
]

/**
 * Validates a cron expression
 */
export function validateCronExpression(expression: string): {
  isValid: boolean
  error?: string
} {
  try {
    if (!expression || expression.trim() === '') {
      return { isValid: false, error: 'Expression cannot be empty' }
    }

    // Try to create a Cron instance to validate
    const cron = new Cron(expression)
    cron.stop() // Stop immediately as we only need validation

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid cron expression',
    }
  }
}

/**
 * Parses a cron expression into its component fields
 */
export function parseCronExpression(expression: string): CronField {
  const parts = expression.trim().split(/\s+/)

  // Handle both 5-field (minute hour day month weekday) and 6-field (second minute hour day month weekday) formats
  if (parts.length === 5) {
    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    }
  }

  // If 6 fields, ignore seconds field and use the rest
  if (parts.length === 6) {
    return {
      minute: parts[1],
      hour: parts[2],
      dayOfMonth: parts[3],
      month: parts[4],
      dayOfWeek: parts[5],
    }
  }

  // Default to wildcards if parsing fails
  return {
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  }
}

/**
 * Builds a cron expression from individual fields
 */
export function buildCronExpression(fields: CronField): string {
  return `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`
}

/**
 * Generates human-readable description of a cron expression
 */
export function describeCronExpression(expression: string): string {
  try {
    const fields = parseCronExpression(expression)

    // Check for common patterns first
    const commonPattern = COMMON_PATTERNS.find((p) => p.expression === expression)
    if (commonPattern) {
      return commonPattern.description
    }

    let description = 'Runs '

    // Minute
    if (fields.minute === '*') {
      description += 'every minute'
    } else if (fields.minute.startsWith('*/')) {
      const interval = fields.minute.slice(2)
      description += `every ${interval} minutes`
    } else if (fields.minute.includes(',')) {
      description += `at minutes ${fields.minute}`
    } else {
      description += `at minute ${fields.minute}`
    }

    // Hour
    if (fields.hour !== '*') {
      if (fields.hour.startsWith('*/')) {
        const interval = fields.hour.slice(2)
        description += ` of every ${interval} hours`
      } else if (fields.hour.includes(',')) {
        description += ` of hours ${fields.hour}`
      } else {
        const hour = Number.parseInt(fields.hour, 10)
        description += ` at ${hour.toString().padStart(2, '0')}:${fields.minute === '*' ? '**' : fields.minute.padStart(2, '0')}`
      }
    }

    // Day of month
    if (fields.dayOfMonth !== '*') {
      if (fields.dayOfMonth === 'L') {
        description += ' on the last day of the month'
      } else if (fields.dayOfMonth.includes(',')) {
        description += ` on days ${fields.dayOfMonth} of the month`
      } else {
        description += ` on day ${fields.dayOfMonth} of the month`
      }
    }

    // Month
    if (fields.month !== '*') {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      if (fields.month.includes(',')) {
        const months = fields.month
          .split(',')
          .map((m) => monthNames[Number.parseInt(m, 10) - 1])
          .join(', ')
        description += ` in ${months}`
      } else {
        const monthIndex = Number.parseInt(fields.month, 10) - 1
        description += ` in ${monthNames[monthIndex]}`
      }
    }

    // Day of week
    if (fields.dayOfWeek !== '*') {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]
      if (fields.dayOfWeek.includes('-')) {
        const [start, end] = fields.dayOfWeek.split('-')
        description += ` on ${dayNames[Number.parseInt(start, 10)]} through ${dayNames[Number.parseInt(end, 10)]}`
      } else if (fields.dayOfWeek.includes(',')) {
        const days = fields.dayOfWeek
          .split(',')
          .map((d) => dayNames[Number.parseInt(d, 10)])
          .join(', ')
        description += ` on ${days}`
      } else if (fields.dayOfWeek.includes('#')) {
        const [day, occurrence] = fields.dayOfWeek.split('#')
        const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'][
          Number.parseInt(occurrence, 10) - 1
        ]
        description += ` on the ${ordinal} ${dayNames[Number.parseInt(day, 10)]} of the month`
      } else {
        description += ` on ${dayNames[Number.parseInt(fields.dayOfWeek, 10)]}`
      }
    }

    return description
  } catch (_error) {
    return 'Invalid cron expression'
  }
}

/**
 * Gets the next N execution times for a cron expression
 */
export function getNextExecutions(expression: string, count = 10): Date[] {
  try {
    const cron = new Cron(expression)
    const executions: Date[] = []

    // Get next N executions
    let current = new Date()
    for (let i = 0; i < count; i++) {
      const next = cron.nextRun(current)
      if (next) {
        executions.push(new Date(next))
        current = new Date(next.getTime() + 1000) // Add 1 second to get the next occurrence
      } else {
        break
      }
    }

    cron.stop()
    return executions
  } catch (_error) {
    return []
  }
}

/**
 * Formats a date for display
 */
export function formatExecutionDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }
  return date.toLocaleString('en-US', options)
}

/**
 * Export cron expression for different platforms
 */
export function exportCronExpression(
  expression: string,
  platform: 'crontab' | 'kubernetes' | 'aws' | 'github' | 'gitlab'
): string {
  switch (platform) {
    case 'crontab':
      return `# Add this to your crontab (crontab -e)\n${expression} /path/to/your/command`

    case 'kubernetes':
      return `# Kubernetes CronJob\napiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: my-cronjob\nspec:\n  schedule: "${expression}"\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: my-container\n            image: my-image\n          restartPolicy: OnFailure`

    case 'aws':
      return `# AWS CloudWatch Events (EventBridge)\n# Note: Use rate() or cron() expression\n# Cron format: cron(${expression})\nScheduleExpression: "cron(${expression})"`

    case 'github':
      return `# GitHub Actions Workflow\non:\n  schedule:\n    - cron: '${expression}'\n\njobs:\n  scheduled-job:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run scheduled task\n        run: echo "Running scheduled task"`

    case 'gitlab':
      return `# GitLab CI/CD Pipeline\nscheduled-job:\n  rules:\n    - if: $CI_PIPELINE_SOURCE == "schedule"\n  script:\n    - echo "Running scheduled task"\n\n# Then create a schedule in GitLab UI with:\n# Cron: ${expression}`

    default:
      return expression
  }
}

/**
 * Get all available categories
 */
export function getPatternCategories(): string[] {
  return ['common', 'hourly', 'daily', 'weekly', 'monthly']
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: string): CronPattern[] {
  return COMMON_PATTERNS.filter((p) => p.category === category)
}
