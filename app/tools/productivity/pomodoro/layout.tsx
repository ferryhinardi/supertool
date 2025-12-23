import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Pomodoro Timer & Focus Tool',
  description:
    'Free Pomodoro timer with customizable work/break intervals and session tracking. Boost productivity with the proven Pomodoro Technique. Track your focus sessions and improve time management.',
  keywords: [
    'pomodoro timer',
    'focus timer',
    'productivity timer',
    'work timer',
    'study timer',
    'time management',
    'pomodoro technique',
    'focus tool',
    'break timer',
    'productivity app',
    'timer online',
    'work sessions',
  ],
  category: 'productivity',
  path: '/tools/pomodoro',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Pomodoro Timer & Focus Tool')

const faqs = [
  {
    question: 'What is the Pomodoro Technique and how does it work?',
    answer:
      'The Pomodoro Technique is a time management method developed by Francesco Cirillo that uses a timer to break work into focused intervals (traditionally 25 minutes) separated by short breaks (5 minutes). After 4 work sessions, you take a longer break (15-30 minutes). This helps maintain concentration, reduce mental fatigue, and improve productivity by creating structured work cycles.',
  },
  {
    question: 'Can I customize the timer intervals?',
    answer:
      'Yes! While the classic Pomodoro uses 25-minute work sessions and 5-minute breaks, our timer is fully customizable. Adjust work duration from 1-60 minutes, short breaks from 1-15 minutes, and long breaks from 10-60 minutes. Save your custom settings as presets for different types of tasks like deep work, studying, or creative projects.',
  },
  {
    question: 'How do I track tasks with the Pomodoro timer?',
    answer:
      "Add tasks to your task list before starting a session. When you start the timer, select the task you're working on. The tool tracks completed Pomodoros per task, helping you understand time spent on different activities. Review your statistics to see total focus time, completed sessions, and productivity patterns over time.",
  },
  {
    question: 'Does the timer work when I close the browser tab?',
    answer:
      "The timer continues running in the background even when you switch tabs or minimize the browser. You'll receive desktop notifications when each session ends (if you grant notification permissions). However, closing the browser entirely will stop the timer. For best results, keep the browser open or pinned during your work sessions.",
  },
  {
    question: 'What are the benefits of using the Pomodoro Technique?',
    answer:
      'The Pomodoro Technique helps combat procrastination, improves focus by creating urgency, prevents burnout through regular breaks, makes large tasks less overwhelming by breaking them into smaller chunks, and provides clear metrics to measure productivity. Studies show it reduces anxiety about time and helps maintain sustained mental energy throughout the day.',
  },
]

export default function PomodoroLayout({ children }: { children: React.ReactNode }) {
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
