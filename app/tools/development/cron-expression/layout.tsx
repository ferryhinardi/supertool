import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Cron Expression Builder',
  description:
    'Free online cron expression builder and validator. Create, test, and validate cron schedules visually. Preview next 10 execution times, browse 18+ common patterns, and export for crontab, Kubernetes, AWS, GitHub Actions, and GitLab CI/CD.',
  keywords: [
    'cron expression builder',
    'cron schedule generator',
    'cron validator',
    'cron syntax',
    'cron job scheduler',
    'kubernetes cronjob',
    'aws cloudwatch events',
    'github actions cron',
    'gitlab ci cron',
    'crontab generator',
    'cron pattern library',
    'cron next run',
    'cron expression tester',
  ],
  category: 'development',
  path: '/tools/cron-expression',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Cron Expression Builder')

const faqs = [
  {
    question: 'What is a cron expression?',
    answer:
      'A cron expression is a string consisting of five fields (minute, hour, day of month, month, day of week) that defines a schedule for recurring tasks. For example, "0 9 * * 1-5" means "run at 9:00 AM every weekday". Cron expressions are widely used in Unix/Linux systems, CI/CD pipelines, and cloud platforms.',
  },
  {
    question: 'How do I read cron syntax?',
    answer:
      'Cron expressions have 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0=Sunday). Use * for "every", */N for "every N units", ranges like 1-5, and lists like 1,3,5. For example: "*/15 * * * *" means "every 15 minutes".',
  },
  {
    question: 'What platforms support cron expressions?',
    answer:
      'Cron expressions are supported by Unix/Linux crontab, Kubernetes CronJobs, AWS CloudWatch Events (EventBridge), GitHub Actions, GitLab CI/CD, Jenkins, and many other scheduling systems. Our tool generates platform-specific configuration for easy integration.',
  },
  {
    question: 'How can I validate my cron expression?',
    answer:
      'Simply paste your cron expression into our builder. It will instantly validate the syntax and show a human-readable description. You can also see the next 10 execution times to verify the schedule runs when you expect.',
  },
  {
    question: 'What are some common cron patterns?',
    answer:
      'Common patterns include: "* * * * *" (every minute), "0 * * * *" (every hour), "0 0 * * *" (daily at midnight), "0 9 * * 1-5" (weekdays at 9 AM), "0 0 1 * *" (first day of month). Browse our pattern library for 18+ pre-configured schedules.',
  },
  {
    question: 'Is my cron expression data private?',
    answer:
      'Yes, completely. All cron expression building, validation, and preview calculations happen entirely in your browser. No data is sent to any server, ensuring full privacy.',
  },
]

export default function CronExpressionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  )
}
