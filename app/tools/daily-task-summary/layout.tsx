import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Daily Task Summary & Todo List',
  description:
    'Free daily task summary tool with AI-powered organization and priority management. Create, organize, and track daily tasks with smart categorization. Perfect for productivity and daily planning.',
  keywords: [
    'task manager',
    'todo list',
    'daily planner',
    'task organizer',
    'productivity tool',
    'task tracker',
    'daily tasks',
    'task list',
    'work planner',
    'daily summary',
    'task management',
    'to do app',
  ],
  category: 'productivity',
  path: '/tools/daily-task-summary',
})

export default function DailyTaskSummaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
