export type CronPlatform = 'unix' | 'quartz' | 'aws' | 'spring' | 'kubernetes'

export interface CronConfig {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  year?: string // For Quartz
  seconds?: string // For Quartz, Spring
}

export interface CronPreset {
  name: string
  description: string
  expression: string
  config: CronConfig
  category: 'common' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'advanced'
}

export interface CronValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

export interface NextExecution {
  date: Date
  formatted: string
  relative: string
}

export const MINUTE_OPTIONS = [
  { label: 'Every minute', value: '*' },
  { label: 'Every 5 minutes', value: '*/5' },
  { label: 'Every 10 minutes', value: '*/10' },
  { label: 'Every 15 minutes', value: '*/15' },
  { label: 'Every 30 minutes', value: '*/30' },
  { label: 'Custom...', value: 'custom' },
]

export const HOUR_OPTIONS = [
  { label: 'Every hour', value: '*' },
  { label: 'Every 2 hours', value: '*/2' },
  { label: 'Every 4 hours', value: '*/4' },
  { label: 'Every 6 hours', value: '*/6' },
  { label: 'Every 12 hours', value: '*/12' },
  { label: 'Custom...', value: 'custom' },
]

export const DAY_OF_MONTH_OPTIONS = [
  { label: 'Every day', value: '*' },
  { label: 'First day', value: '1' },
  { label: 'Last day', value: 'L' },
  { label: 'Every 2 days', value: '*/2' },
  { label: 'Custom...', value: 'custom' },
]

export const MONTH_OPTIONS = [
  { label: 'Every month', value: '*' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
  { label: 'Custom...', value: 'custom' },
]

export const DAY_OF_WEEK_OPTIONS = [
  { label: 'Every day', value: '*' },
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '0' },
  { label: 'Weekdays (Mon-Fri)', value: '1-5' },
  { label: 'Weekend (Sat-Sun)', value: '0,6' },
  { label: 'Custom...', value: 'custom' },
]

export const PLATFORM_INFO: Record<
  CronPlatform,
  {
    name: string
    description: string
    format: string
    supportsSeconds: boolean
    supportsYear: boolean
  }
> = {
  unix: {
    name: 'Unix/Linux Crontab',
    description: 'Standard cron format used in Unix/Linux systems',
    format: 'minute hour day month weekday',
    supportsSeconds: false,
    supportsYear: false,
  },
  quartz: {
    name: 'Quartz Scheduler',
    description: 'Java Quartz library format with seconds and year',
    format: 'second minute hour day month weekday year',
    supportsSeconds: true,
    supportsYear: true,
  },
  aws: {
    name: 'AWS EventBridge',
    description: 'AWS CloudWatch Events/EventBridge cron format',
    format: 'minute hour day month weekday year',
    supportsSeconds: false,
    supportsYear: true,
  },
  spring: {
    name: 'Spring @Scheduled',
    description: 'Spring Framework cron format with seconds',
    format: 'second minute hour day month weekday',
    supportsSeconds: true,
    supportsYear: false,
  },
  kubernetes: {
    name: 'Kubernetes CronJob',
    description: 'Kubernetes CronJob format (standard cron)',
    format: 'minute hour day month weekday',
    supportsSeconds: false,
    supportsYear: false,
  },
}
