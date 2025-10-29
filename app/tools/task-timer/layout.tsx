import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Task Timer with Sessions - Track Multiple Tasks Concurrently',
  description:
    'Free online task timer with session management. Track multiple tasks simultaneously, organize work into sessions, export detailed reports (CSV/JSON), and analyze productivity. Perfect for time tracking, project management, and productivity analysis.',
  keywords: [
    'task timer',
    'time tracker',
    'session management',
    'multiple timers',
    'concurrent timers',
    'productivity tracker',
    'time tracking tool',
    'project timer',
    'work session tracker',
    'task management timer',
    'export time reports',
    'csv export',
    'json export',
    'session history',
    'productivity analysis',
    'time management',
    'concurrent task tracking',
    'multi-task timer',
  ],
  category: 'productivity',
  path: '/tools/task-timer',
})

export default function TaskTimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
