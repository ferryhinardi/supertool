import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Cron Expression Builder - Visual Cron Job Scheduler',
  description:
    'Free visual cron expression builder and validator. Create cron schedules with an intuitive interface. Preview next run times, validate expressions, and export for Linux, AWS, or Kubernetes cron jobs.',
  keywords: [
    'cron expression builder',
    'cron job generator',
    'cron scheduler',
    'crontab generator',
    'cron syntax builder',
    'visual cron editor',
    'cron expression validator',
    'cron job scheduler',
    'schedule generator',
    'crontab syntax',
    'aws cron builder',
    'kubernetes cron',
  ],
  category: 'development',
  path: '/tools/development/cron-builder',
})

export default function CronBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
